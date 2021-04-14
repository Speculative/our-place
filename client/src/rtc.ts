import Peer from "simple-peer";
import { sendRtcOffer } from "./socket";
import { getAudioStream } from "./mediaCapture";

const peers: {
  [roommateId: string]: {
    instance: Peer.Instance;
    audioStream?: MediaStream;
  };
} = {};

const RTC_CONFIG = {
  iceServers: [
    {
      urls: "stun:stun.l.google.com",
    },
  ],
};

export async function initiatePeerConnection(roommateId: string) {
  if (roommateId in peers) {
    return;
  }

  const instance = new Peer({
    initiator: true,
    stream: await getAudioStream(),
    config: RTC_CONFIG,
  });
  peers[roommateId] = { instance: instance };

  instance.on("signal", (offer: Peer.SignalData) => {
    console.log("Initiator sending RTC offer");
    sendRtcOffer(roommateId, offer);
  });

  instance.on("stream", (stream: MediaStream) => {
    peers[roommateId].audioStream = stream;
  });
}

export async function receivePeerSignal(
  roommateId: string,
  offer: Peer.SignalData
) {
  if (!(roommateId in peers)) {
    const instance = new Peer({
      stream: await getAudioStream(),
      config: RTC_CONFIG,
    });
    peers[roommateId] = { instance };
  }

  const peer = peers[roommateId];
  peer.instance.signal(offer);

  peer.instance.on("signal", (offer: Peer.SignalData) => {
    console.log("Received RTC offer");
    sendRtcOffer(roommateId, offer);
  });

  peer.instance.on("stream", (stream: MediaStream) => {
    peer.audioStream = stream;
    console.log("Got audio on the receiver!");

    const audioElement = document.getElementById("echo") as HTMLAudioElement;
    audioElement.srcObject = stream;
  });
}
