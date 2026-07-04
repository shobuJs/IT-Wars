// IT Wars — boot: shared app context, one rAF loop, letterbox scaling,
// pointer mapping into 960×540 design space.
import { DESIGN_W, DESIGN_H } from './Shared/constants.js';
import * as audio from './Shared/audio.js';
import { createInput } from './GameEngine/Input.js';
import { createScreenManager } from './GameEngine/ScreenManager.js';
import { createTouchControls } from './UI/TouchControls.js';
import StartScreen from './Screens/StartScreen.js';
import MainMenuScreen from './Screens/MainMenuScreen.js';
import ModeSelectScreen from './Screens/ModeSelectScreen.js';
import ArenaSelectScreen from './Screens/ArenaSelectScreen.js';
import CharacterSelectScreen from './Screens/CharacterSelectScreen.js';
import MatchScreen from './Screens/MatchScreen.js';
import ResultScreen from './Screens/ResultScreen.js';

const canvas = document.getElementById('game');
const g = canvas.getContext('2d');

const app = {
  canvas, g,
  input: createInput(),
  audio,
  screens: createScreenManager(),
  clock: 0,
  session: {
    mode: 'single',
    arenaId: null,
    playerCharId: null,
    aiCharId: null,
    lastResult: null,
  },
};
app.touch = createTouchControls(app.input);

app.screens.register('start', StartScreen);
app.screens.register('mainMenu', MainMenuScreen);
app.screens.register('modeSelect', ModeSelectScreen);
app.screens.register('arenaSelect', ArenaSelectScreen);
app.screens.register('characterSelect', CharacterSelectScreen);
app.screens.register('match', MatchScreen);
app.screens.register('result', ResultScreen);

// ---- Letterbox scaling
function resize() {
  const s = Math.min(innerWidth * 0.98 / DESIGN_W, innerHeight * 0.94 / DESIGN_H);
  canvas.style.width = `${Math.floor(DESIGN_W * s)}px`;
  canvas.style.height = `${Math.floor(DESIGN_H * s)}px`;
}
addEventListener('resize', resize);
resize();

// ---- Pointer mapping (same rect-ratio technique as the legacy game)
function toDesign(e) {
  const r = canvas.getBoundingClientRect();
  return {
    x: (e.clientX - r.left) * (DESIGN_W / r.width),
    y: (e.clientY - r.top) * (DESIGN_H / r.height),
  };
}
canvas.addEventListener('pointerdown', (e) => {
  audio.resumeAudio();
  const p = toDesign(e);
  app.screens.onPointer(app, p.x, p.y, 'down');
});
canvas.addEventListener('pointermove', (e) => {
  const p = toDesign(e);
  app.screens.onPointer(app, p.x, p.y, 'move');
});

// ---- Sound toggle
const soundBtn = document.getElementById('soundToggle');
soundBtn.addEventListener('click', () => {
  soundBtn.textContent = audio.toggleSound() ? '🔊 Sound' : '🔇 Muted';
});

// ---- Main loop (dt-capped, same pattern as legacy)
let last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  app.clock += dt * 1000;
  app.screens.update(app, dt);
  app.screens.render(app, g);
  app.input.endFrame();
  requestAnimationFrame(frame);
}

// dev deep-link: ?screen=match&p1=kratos&ai=mrb&arena=office
const params = new URLSearchParams(location.search);
if (params.get('screen')) {
  app.session.arenaId = params.get('arena') || 'office';
  app.session.playerCharId = params.get('p1') || 'mario';
  app.session.aiCharId = params.get('ai') || 'kratos';
  app.screens.goto(app, params.get('screen'));
} else {
  app.screens.goto(app, 'start');
}
requestAnimationFrame(frame);

// debug handle (also used by the automated smoke test)
window.ITWARS = app;
