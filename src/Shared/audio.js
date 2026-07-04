// Web Audio synth — ported copy of the legacy audio engine
// (OfficeAdventure/index.html lines ~345-396). No audio files.
let audioCtx = null;
let soundOn = true;

export function resumeAudio() {
  if (!soundOn) return;
  if (!audioCtx) {
    try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {}
  }
  if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
}

export function toggleSound() {
  soundOn = !soundOn;
  if (soundOn) resumeAudio();
  return soundOn;
}

export function isSoundOn() { return soundOn; }

export function beep(freq, dur, type, vol, slide) {
  if (!soundOn || !audioCtx) return;
  const t = audioCtx.currentTime;
  const o = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  o.type = type || 'square';
  o.frequency.setValueAtTime(freq, t);
  if (slide) o.frequency.exponentialRampToValueAtTime(slide, t + dur);
  g.gain.setValueAtTime(vol || 0.15, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g); g.connect(audioCtx.destination);
  o.start(t); o.stop(t + dur);
}

export const SFX = {
  jump:  () => beep(420, 0.16, 'square', 0.14, 720),
  coin:  () => { beep(988, 0.07, 'square', 0.16); setTimeout(() => beep(1319, 0.12, 'square', 0.16), 60); },
  stomp: () => beep(200, 0.12, 'sine', 0.2, 90),
  shoot: () => beep(880, 0.09, 'square', 0.12, 220),
  splat: () => { beep(160, 0.18, 'sawtooth', 0.22, 50); setTimeout(() => beep(90, 0.2, 'triangle', 0.18, 40), 20); },
  gore:  () => { beep(140, 0.22, 'sawtooth', 0.26, 40); setTimeout(() => beep(70, 0.28, 'triangle', 0.22, 28), 30);
                 setTimeout(() => beep(200, 0.1, 'sawtooth', 0.14, 60), 80); },
  whoosh: () => beep(520, 0.26, 'sawtooth', 0.14, 130),
  recall: () => beep(140, 0.24, 'sawtooth', 0.14, 620),
  catchAxe: () => { beep(300, 0.07, 'square', 0.2, 180); setTimeout(() => beep(520, 0.06, 'square', 0.12), 50); },
  thunk: () => beep(110, 0.14, 'triangle', 0.26, 55),
  roar:  () => { [90, 130, 80, 110, 60].forEach((f, i) => setTimeout(() => beep(f, 0.32, 'sawtooth', 0.3, f * 0.55), i * 85)); },
  block: () => beep(330, 0.08, 'square', 0.16, 520),
  power: () => { [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => beep(f, 0.12, 'square', 0.16), i * 70)); },
  hurt:  () => beep(300, 0.3, 'sawtooth', 0.18, 80),
  die:   () => { [392, 330, 262, 196].forEach((f, i) => setTimeout(() => beep(f, 0.2, 'triangle', 0.2), i * 130)); },
  win:   () => { [523, 659, 784, 1047, 784, 1047].forEach((f, i) => setTimeout(() => beep(f, 0.15, 'square', 0.18), i * 120)); },
  cup:   () => beep(880, 0.08, 'sine', 0.12, 1400),
  scald: () => { beep(600, 0.12, 'sine', 0.18, 180); setTimeout(() => beep(300, 0.14, 'triangle', 0.14, 90), 50); },
  wave:  () => { for (let i = 0; i < 8; i++) setTimeout(() => beep(120 - i * 6, 0.3, 'sawtooth', 0.2, 60), i * 140); },
  bottle: () => beep(500, 0.15, 'sine', 0.13, 900),
  glass: () => { beep(1400, 0.08, 'square', 0.15, 500); setTimeout(() => beep(900, 0.1, 'square', 0.12, 300), 40); setTimeout(() => beep(1800, 0.06, 'square', 0.09, 700), 80); },
  swear: () => { beep(220, 0.22, 'sawtooth', 0.25, 90); setTimeout(() => beep(160, 0.18, 'sawtooth', 0.2, 70), 60); },
  lighter: () => { beep(1200, 0.03, 'square', 0.12); setTimeout(() => beep(400, 0.15, 'sine', 0.08, 200), 50); },
  lob:   () => beep(340, 0.18, 'sine', 0.14, 620),
  splash: () => { beep(760, 0.1, 'sine', 0.2, 240); setTimeout(() => beep(420, 0.16, 'triangle', 0.16, 120), 40); },
  moo:   () => { beep(160, 0.55, 'triangle', 0.3, 75); setTimeout(() => beep(120, 0.4, 'sawtooth', 0.12, 60), 120); },
  stampede: () => { for (let i = 0; i < 10; i++) setTimeout(() => beep(55 + (i % 3) * 12, 0.14, 'triangle', 0.28, 38), i * 150); },
  menuMove: () => beep(420, 0.06, 'square', 0.12),
  menuGo:   () => { beep(523, 0.1, 'square', 0.15); setTimeout(() => beep(784, 0.16, 'square', 0.15), 90); },
  // New for Office Combat
  hitLight: () => beep(240, 0.08, 'square', 0.18, 120),
  koBell:   () => { [660, 660, 660].forEach((f, i) => setTimeout(() => beep(f, 0.4, 'triangle', 0.25, 640), i * 220)); },
  denied:   () => beep(140, 0.12, 'sawtooth', 0.15, 90),
};
