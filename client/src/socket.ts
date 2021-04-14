import { usePosition, useRoommatePositions, useSelf } from "./store";
import { initiatePeerConnection, receivePeerSignal } from "./rtc";
import type Peer from "simple-peer";

interface PositionReport {
  type: "position";
  x: number;
  y: number;
  mouseX: number;
  mouseY: number;
}

interface HandshakeReport {
  type: "handshake";
  selfId: string;
}

interface JoinReport {
  type: "join";
  x: number;
  y: number;
  mouseX: number;
  mouseY: number;
}

interface LeaveReport {
  type: "leave";
}

interface RTCOfferReport {
  type: "rtcOffer";
  toRoommateId: string;
  offer: Peer.SignalData;
}

type ReportContract =
  | HandshakeReport
  | JoinReport
  | PositionReport
  | LeaveReport
  | RTCOfferReport;

type RoomReport = { fromRoommateId: string } & ReportContract;

let socket: WebSocket | undefined;

export function setupSocket() {
  // eslint-disable-next-line
  const pendingSocket = new WebSocket(`wss://${location.host}/socket`);

  pendingSocket.addEventListener("open", () => {
    socket = pendingSocket;
  });

  pendingSocket.addEventListener("message", (message) => {
    const report: RoomReport = JSON.parse(message.data);
    if (report.type === "handshake") {
      useSelf.getState().becomeSelf(report.selfId);

      // Send an initial position to everyone in the room
      const currentPosition = usePosition.getState();
      safeSend({
        type: "join",
        x: currentPosition.x,
        y: currentPosition.y,
        mouseX: currentPosition.mouseX,
        mouseY: currentPosition.mouseY,
      });
    } else if (report.type === "join") {
      console.log(report.fromRoommateId, "joined");
      initiatePeerConnection(report.fromRoommateId);

      useRoommatePositions
        .getState()
        .roommateMove(
          report.fromRoommateId,
          report.x,
          report.y,
          report.mouseX,
          report.mouseY
        );
    } else if (report.type === "position") {
      useRoommatePositions
        .getState()
        .roommateMove(
          report.fromRoommateId,
          report.x,
          report.y,
          report.mouseX,
          report.mouseY
        );
    } else if (report.type === "leave") {
      console.log(report.fromRoommateId, "left");
      useRoommatePositions.getState().roommateLeave(report.fromRoommateId);
    } else if (report.type === "rtcOffer") {
      receivePeerSignal(report.fromRoommateId, report.offer);
    }
  });

  usePosition.subscribe(({ x, y, mouseX, mouseY }) => {
    const selfId = useSelf.getState().selfId;
    if (selfId !== undefined) {
      safeSend({
        type: "position",
        x,
        y,
        mouseX,
        mouseY,
      });
    }
  });
}

export function sendRtcOffer(toRoommateId: string, offer: Peer.SignalData) {
  safeSend({
    type: "rtcOffer",
    toRoommateId,
    offer,
  });
}

function safeSend(message: ReportContract) {
  const selfId = useSelf.getState().selfId;
  if (socket !== undefined && selfId !== undefined) {
    socket.send(JSON.stringify({ ...message, fromRoommateId: selfId }));
  }
}
