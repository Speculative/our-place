import Peer from "simple-peer";
import { autorun } from "mobx";

import { sendRtcOffer } from "./socket";
import { getAudioStream } from "./mediaCapture";
import { selfPosition, roommateStatuses } from "./store";
import { calculateLoudness } from "./audio";

const peers: {
  [roommateId: string]: {
    instance: Peer.Instance;
    audioStream?: MediaStream;
    audioContext?: AudioContext;
    analyser?: AnalyserNode;
  };
} = {};

const RTC_CONFIG = {
  iceServers: [
    {
      urls: "stun:stun.l.google.com",
    },
  ],
};

function updateLoudness(roommateId: string) {
  const peer = peers[roommateId];
  if (peer === undefined) {
    return;
  }

  const { audioContext, analyser } = peer;
  if (audioContext !== undefined && analyser !== undefined) {
    const loudness = calculateLoudness(audioContext, analyser);
    roommateStatuses.roommateSpeak(roommateId, loudness);
  }

  requestAnimationFrame(() => updateLoudness(roommateId));
}

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
  const context = new (AudioContext || (window as any).webkitAudioContext)();
  peers[roommateId].audioContext = context;
  console.log("Sample rate before setting media stream", context.sampleRate);

  const gain = context.createGain();
  gain.gain.value = 20;

  const panner = context.createPanner();
  panner.panningModel = "HRTF";
  panner.distanceModel = "exponential";
  panner.refDistance = 20;
  panner.rolloffFactor = 1;

  const analyser = context.createAnalyser();
  analyser.smoothingTimeConstant = 0.3;
  peers[roommateId].analyser = analyser;

  requestAnimationFrame(() => updateLoudness(roommateId));

  // Thanks Chrome
  // https://bugs.chromium.org/p/chromium/issues/detail?id=933677
  const audioElement = document.createElement("audio");
  audioElement.id = getAudioElementId(roommateId);
  audioElement.srcObject = audioStream;
  audioElement.autoplay = true;
  audioElement.muted = true;
  document.body.appendChild(audioElement);

  const source = context.createMediaStreamSource(audioStream);
  source
    .connect(analyser)
    .connect(gain)
    .connect(panner)
    .connect(context.destination);

  // Keep the panner in sync with positions on the screen
  autorun(() => {
    const roommatePosition = roommateStatuses.statuses.get(roommateId);
    if (roommatePosition !== undefined) {
      panner.positionX.value = roommatePosition.pos.x - selfPosition.x;
      panner.positionY.value = selfPosition.y - roommatePosition.pos.y;
    }
  });
}

function getAudioElementId(roommateId: string) {
  return `${roommateId}-audio`;
}
