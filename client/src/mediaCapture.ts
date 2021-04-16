import { calculateLoudness } from "./audio";
import { selfAudio } from "./store";

let audioStream: Promise<MediaStream | undefined> | undefined;

export function getAudioStream() {
  if (audioStream === undefined) {
    audioStream = new Promise((res) => {
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then(res)
        .catch(() => res(undefined));
    });
  }

  return audioStream;
}

function updateSelfAudio(audioContext: AudioContext, analyser: AnalyserNode) {
  const loudness = calculateLoudness(audioContext, analyser);
  selfAudio.setLoudness(loudness);

  requestAnimationFrame(() => updateSelfAudio(audioContext, analyser));
}

export async function registerSelfAudio() {
  const stream = await getAudioStream();
  if (stream !== undefined) {
    const audioContext = new AudioContext();
    const analyser = audioContext.createAnalyser();
    analyser.smoothingTimeConstant = 0.3;

    const audioElement = document.createElement("audio");
    audioElement.id = "self-audio";
    audioElement.srcObject = stream;
    audioElement.autoplay = true;
    audioElement.muted = true;
    document.body.appendChild(audioElement);

    const source = audioContext.createMediaStreamSource(stream);
    source.connect(analyser);

    requestAnimationFrame(() => updateSelfAudio(audioContext, analyser));
  }
}
