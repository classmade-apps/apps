export function createTimerChime() {
  let audio;

  async function prepare() {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) throw new Error('Audio is unavailable on this device.');
    audio ??= new AudioContext();
    if (audio.state !== 'running') await audio.resume();
  }

  async function play(tone) {
    await prepare();
    const notes = tone === 'bright' ? [659.25, 880] : [523.25, 659.25];
    const start = audio.currentTime;
    notes.forEach((frequency, index) => {
      const oscillator = audio.createOscillator();
      const gain = audio.createGain();
      oscillator.connect(gain).connect(audio.destination);
      const at = start + index * .6;
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(0, at);
      gain.gain.linearRampToValueAtTime(.12, at + .02);
      gain.gain.exponentialRampToValueAtTime(.001, at + .55);
      oscillator.start(at);
      oscillator.stop(at + .6);
    });
  }

  return { prepare, play };
}
