import { autorun } from "mobx";
import type Peer from "simple-peer";

import {
  UpstreamMessage,
  UpstreamMessageDetails,
  DownstreamMessage,
} from "./common";

import { selfPosition, viewportMouse, roommateStatuses, self } from "./store";
import { initiatePeerConnection, receivePeerSignal, peerLeave } from "./rtc";

let socket: WebSocket | undefined;

function handleMessage(event: MessageEvent<any>) {
  const report: DownstreamMessage = JSON.parse(event.data);
  if (report.type === "handshake") {
    self.becomeSelf(report.selfId);
    setInterval(() => safeSend({ type: "heartbeat" }), 1000);

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

    roommateStatuses.roommateMove(
      report.fromRoommateId,
      report.x,
      report.y,
      report.mouseX,
      report.mouseY
    );
  } else if (report.type === "position") {
    roommateStatuses.roommateMove(
      report.fromRoommateId,
      report.x,
      report.y,
      report.mouseX,
      report.mouseY
    );
  } else if (report.type === "leave") {
    console.log(report.fromRoommateId, "left");
    roommateStatuses.roommateLeave(report.fromRoommateId);
    peerLeave(report.fromRoommateId);
  } else if (report.type === "rtcOffer") {
    receivePeerSignal(report.fromRoommateId, report.offer);
  }
}

export function setupSocket() {
  // eslint-disable-next-line
  const pendingSocket = new WebSocket(`ws://${location.host}/socket`);

  pendingSocket.addEventListener("open", () => {
    socket = pendingSocket;
  });

  pendingSocket.addEventListener("message", handleMessage);

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

function safeSend(message: UpstreamMessageDetails) {
  if (socket !== undefined && self.selfId !== undefined) {
    const report: UpstreamMessage = { ...message, fromRoommateId: self.selfId };
    socket.send(JSON.stringify(report));
  }
}
