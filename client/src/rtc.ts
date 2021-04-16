import Peer from "simple-peer";
import { autorun } from "mobx";

import { sendRtcOffer } from "./socket";
import { getAudioStream } from "./mediaCapture";
import { selfPosition, roommatePositions } from "./store";

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
  const fNyquist = context.sampleRate / 2;
  const numFreqBins = analyser.frequencyBinCount;

  console.log("db spread", analyser.minDecibels, analyser.maxDecibels);

  setInterval(() => {
    // Each byte in the frequency bin is a value between 0 to 255, scaled to
    // the [minDecibels, maxDecibels] range of the analyser node.
    // https://webaudio.github.io/web-audio-api/#dom-analysernode-getbytefrequencydata
    let freqData = new Uint8Array(numFreqBins);
    freqData.fill(255);
    // analyser.getByteFrequencyData(freqData);

    const aWeighted = freqData.map((amp, bin) => {
      const freq = (fNyquist / numFreqBins) * bin;
      const freq2 = freq * freq;
      // https://en.wikipedia.org/wiki/A-weighting#A
      return (
        amp *
        (20 *
          Math.log10(
            (12194 ** 2 * freq2 ** 2) /
              ((freq2 + 20.6 ** 2) *
                Math.sqrt((freq2 + 107.7 ** 2) * (freq2 + 737.9 ** 2)) *
                (freq2 + 12194 ** 2))
          ) +
          2)
      );
    });
    const rmsAWeighted = Math.sqrt(
      aWeighted.reduce((a, b) => a + b * b, 0) / analyser.frequencyBinCount
    );

    const rmsUnweighted = Math.sqrt(
      freqData.reduce((a, b) => a + b * b, 0) / analyser.frequencyBinCount
    );

    const peak = freqData.reduce(
      (a, b) => (a < Math.abs(b) ? Math.abs(b) : a),
      0
    );

    /*
    console.table([
      Math.floor(rmsAWeighted),
      Math.floor(rmsUnweighted),
      Math.floor(peak),
    ]);
    */
  }, 50);

  // Thanks Chrome
  // https://bugs.chromium.org/p/chromium/issues/detail?id=933677
  const audioElement = document.createElement("audio");
  audioElement.id = getAudioElementId(roommateId);
  audioElement.srcObject = audioStream;
  audioElement.autoplay = true;
  audioElement.muted = true;

  const source = context.createMediaStreamSource(audioStream);
  source
    .connect(analyser)
    .connect(gain)
    .connect(panner)
    .connect(context.destination);

  // Keep the panner in sync with positions on the screen
  autorun(() => {
    const roommatePosition = roommatePositions.positions.get(roommateId);
    if (roommatePosition !== undefined) {
      panner.positionX.value = roommatePosition.pos.x - selfPosition.x;
      panner.positionY.value = selfPosition.y - roommatePosition.pos.y;
    }
  });
}

function getAudioElementId(roommateId: string) {
  return `${roommateId}-audio`;
}
