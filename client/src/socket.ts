import { autorun } from "mobx";
import type Peer from "simple-peer";

import { selfPosition, viewportMouse, roommatePositions, self } from "./store";
import { initiatePeerConnection, receivePeerSignal } from "./rtc";

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
      self.becomeSelf(report.selfId);

      // Send an initial position to everyone in the room
      safeSend({
        type: "join",
        x: selfPosition.x,
        y: selfPosition.y,
        mouseX: viewportMouse.viewportX,
        mouseY: viewportMouse.viewportY,
      });
    } else if (report.type === "join") {
      console.log(report.fromRoommateId, "joined");
      initiatePeerConnection(report.fromRoommateId);

      roommatePositions.roommateMove(
        report.fromRoommateId,
        report.x,
        report.y,
        report.mouseX,
        report.mouseY
      );
    } else if (report.type === "position") {
      roommatePositions.roommateMove(
        report.fromRoommateId,
        report.x,
        report.y,
        report.mouseX,
        report.mouseY
      );
    } else if (report.type === "leave") {
      console.log(report.fromRoommateId, "left");
      roommatePositions.roommateLeave(report.fromRoommateId);
    } else if (report.type === "rtcOffer") {
      receivePeerSignal(report.fromRoommateId, report.offer);
    }
  });

  autorun(() => {
    safeSend({
      type: "position",
      x: selfPosition.x,
      y: selfPosition.y,
      mouseX: viewportMouse.viewportX,
      mouseY: viewportMouse.viewportY,
    });
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
  if (socket !== undefined && self.selfId !== undefined) {
    socket.send(JSON.stringify({ ...message, fromRoommateId: self.selfId }));
  }
}
