export function calculateLoudness(
  audioContext: AudioContext,
  analyser: AnalyserNode
) {
  const fNyquist = audioContext.sampleRate / 2;
  const numFreqBins = analyser.frequencyBinCount;

  // Each byte in the frequency bin is a value between 0 to 255, scaled to
  // the [minDecibels, maxDecibels] range of the analyser node.
  // https://webaudio.github.io/web-audio-api/#dom-analysernode-getbytefrequencydata
  let freqData = new Uint8Array(numFreqBins);
  analyser.getByteFrequencyData(freqData);

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

  /*
    const rmsUnweighted = Math.sqrt(
      freqData.reduce((a, b) => a + b * b, 0) / analyser.frequencyBinCount
    );

    const peak = freqData.reduce(
      (a, b) => (a < Math.abs(b) ? Math.abs(b) : a),
      0
    );
    */

  return rmsAWeighted;
}
