import Peer from "simple-peer";
// import { autorun } from "mobx";

import { sendRtcOffer } from "./socket";
import { getAudioStream } from "./mediaCapture";
// import { selfPosition, roommatePositions } from "./store";

const peers: {
  [roommateId: string]: {
    instance: Peer.Instance;
    audioStream?: MediaStream;
    audioContext?: AudioContext;
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
    console.log("Initiator received audio stream");
    peers[roommateId].audioStream = stream;
    configureSpatialAudio(roommateId, stream);
  });
}

export async function receivePeerSignal(
  roommateId: string,
  offer: Peer.SignalData
) {
  if (!(roommateId in peers)) {
    console.log("Received RTC offer");
    const instance = new Peer({
      stream: await getAudioStream(),
      config: RTC_CONFIG,
    });
    peers[roommateId] = { instance };

    instance.on("signal", (offer: Peer.SignalData) => {
      sendRtcOffer(roommateId, offer);
    });

    instance.on("stream", (stream: MediaStream) => {
      console.log("Receiver received audio stream");
      peers[roommateId].audioStream = stream;
      configureSpatialAudio(roommateId, stream);
    });
  }

  try {
    const peer = peers[roommateId];
    peer.instance.signal(offer);
  } catch (e) {
    console.error("Error when signaling", e);
  }
}

export function peerLeave(roommateId: string) {
  if (roommateId in peers) {
    peers[roommateId].instance.destroy();
    peers[roommateId].audioContext?.close();
    delete peers[roommateId];

    const audioElement = document.getElementById(getAudioElementId(roommateId));
    if (audioElement !== null) {
      document.body.removeChild(audioElement);
    }
  }
}

function configureSpatialAudio(roommateId: string, audioStream: MediaStream) {
  const context = new AudioContext();
  peers[roommateId].audioContext = context;

  const audioElement = document.createElement("audio");
  audioElement.id = getAudioElementId(roommateId);
  audioElement.srcObject = audioStream;
  audioElement.autoplay = true;
  document.body.appendChild(audioElement);

  /*
  const gain = context.createGain();
  gain.gain.value = 1;

  const panner = context.createPanner();
  panner.panningModel = "HRTF";
  panner.distanceModel = "exponential";
  panner.refDistance = 1;
  panner.rolloffFactor = 10;
  panner.positionZ.value = 0;

  const analyser = context.createAnalyser();
  setInterval(() => {
    console.log(analyser.minDecibels, analyser.maxDecibels);
  }, 50);

  // const stream = new MediaStream();
  // stream.addTrack(audioStream.getAudioTracks()[0]);
  // const source = context.createMediaStreamSource(stream);
  const flos = document.getElementById("flos") as HTMLAudioElement;
  const source = context.createMediaElementSource(flos);
  source
    .connect(analyser)
    .connect(gain)
    .connect(panner)
    .connect(context.destination);

  if (context.state === "suspended") {
    context.resume();
  }

  autorun(() => {
    const roommatePosition = roommatePositions.positions.get(roommateId);
    if (roommatePosition !== undefined) {
      panner.positionX.value = roommatePosition.pos.x - selfPosition.x;
      panner.positionY.value = selfPosition.y - roommatePosition.pos.y;
    }
  });
  */
}

function getAudioElementId(roommateId: string) {
  return `${roommateId}-audio`;
}
