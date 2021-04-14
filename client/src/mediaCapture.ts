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
