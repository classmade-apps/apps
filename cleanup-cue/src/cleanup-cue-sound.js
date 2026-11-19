// Two rounds give an audible cue time to register in a busy classroom.
const patterns = {
  bell: {
    pitches: [523.25, 659.25, 783.99],
    spacing: 0.56,
    length: 0.5,
    peak: 0.3,
  },
  bright: {
    pitches: [659.25, 880, 659.25],
    spacing: 0.48,
    length: 0.44,
    peak: 0.34,
  },
};

export function createCleanupSound() {
  let audio;
  let request = 0;
  const oscillators = new Set();

  async function prepare() {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) throw new Error('Audio is unavailable on this device.');
    audio ??= new AudioContext();
    if (audio.state !== 'running') await audio.resume();
  }

  function stop() {
    request++;
    for (const oscillator of oscillators) oscillator.stop();
    oscillators.clear();
  }

  async function play(tone) {
    stop();
    const pattern = patterns[tone];
    if (!pattern) return;

    const current = request;
    await prepare();
    if (current !== request) return;

    const start = audio.currentTime;
    for (const offset of [0, 2.1]) {
      pattern.pitches.forEach((frequency, index) => {
        const at = start + offset + index * pattern.spacing;
        const oscillator = audio.createOscillator();
        const gain = audio.createGain();
        oscillator.type = 'triangle';
        oscillator.frequency.value = frequency;
        oscillator.connect(gain).connect(audio.destination);
        gain.gain.setValueAtTime(0, at);
        gain.gain.linearRampToValueAtTime(pattern.peak, at + 0.03);
        gain.gain.setValueAtTime(pattern.peak, at + 0.14);
        gain.gain.exponentialRampToValueAtTime(0.001, at + pattern.length);
        oscillator.onended = () => oscillators.delete(oscillator);
        oscillators.add(oscillator);
        oscillator.start(at);
        oscillator.stop(at + pattern.length);
      });
    }
  }

  return { prepare, play, stop };
}
