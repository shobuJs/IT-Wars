// Headless smoke test: stubs the browser environment, imports the real game,
// and plays full best-of-3 matches (every playable character) through the
// actual screen flow — no browser, no server needed.
// Usage: node .claude/skills/run-it-wars/smoke.mjs   (from repo root)
import { pathToFileURL } from 'url';
import { resolve } from 'path';

// ---- universal no-op "magic" object (callable, chainable, property-safe)
const magic = new Proxy(function () {}, {
  get(t, prop) {
    if (prop === Symbol.toPrimitive) return () => 10;
    return magic;
  },
  set() { return true; },
  apply() { return magic; },
});

function makeElement(id) {
  return {
    id,
    style: {},
    dataset: {},
    textContent: '',
    classList: { add() {}, remove() {} },
    handlers: {},
    addEventListener(ev, fn) { (this.handlers[ev] ||= []).push(fn); },
    removeEventListener() {},
    querySelectorAll() { return []; },
    getBoundingClientRect() { return { left: 0, top: 0, width: 960, height: 540 }; },
    setPointerCapture() {},
    getContext() { return magic; },
    width: 960, height: 540,
  };
}

const elements = {};
globalThis.document = {
  getElementById(id) { return elements[id] ||= makeElement(id); },
};
globalThis.window = globalThis;
// window-level event plumbing (Node 20 has no global addEventListener)
const winHandlers = {};
globalThis.addEventListener = (ev, fn) => { (winHandlers[ev] ||= []).push(fn); };
globalThis.removeEventListener = () => {};
globalThis.dispatchEvent = (e) => { for (const fn of winHandlers[e.type] || []) fn(e); return true; };
globalThis.innerWidth = 1280;
globalThis.innerHeight = 720;
globalThis.location = { href: 'http://localhost/index.html' };
globalThis.matchMedia = () => ({ matches: false });
globalThis.AudioContext = undefined;
globalThis.webkitAudioContext = undefined;

let rafCb = null;
globalThis.requestAnimationFrame = (cb) => { rafCb = cb; return 1; };

// keyboard event plumbing (Node's global EventTarget handles add/dispatch)
function key(type, k) {
  const e = new Event(type);
  e.key = k;
  dispatchEvent(e);
}
const press = (k) => key('keydown', k);
const release = (k) => key('keyup', k);
const tap = (k) => { press(k); release(k); };

// ---- boot the real game
const mainUrl = pathToFileURL(resolve(process.argv[2] || 'src/main.js')).href;
await import(mainUrl);
const app = globalThis.ITWARS;
if (!app) { console.error('FAIL: window.ITWARS not set'); process.exit(1); }

let now = 0;
function frames(n, dtMs = 16.7) {
  for (let i = 0; i < n; i++) {
    now += dtMs;
    const cb = rafCb; rafCb = null;
    if (!cb) throw new Error('rAF chain broke');
    cb(now);
  }
}
const secs = (s) => frames(Math.ceil(s * 60));

function expectScreen(name, context) {
  if (app.screens.name !== name) {
    console.error(`FAIL (${context}): expected screen '${name}', got '${app.screens.name}'`);
    process.exit(1);
  }
  console.log(`ok: ${context} -> ${name}`);
}

frames(5);
expectScreen('start', 'boot');

// start screen → main menu
tap('Enter'); frames(2);
expectScreen('mainMenu', 'press enter to start');

// main menu: default selection is OFFICE COMBAT
tap('Enter'); frames(2);
expectScreen('modeSelect', 'choose Office Combat');

tap('Enter'); frames(2);
expectScreen('arenaSelect', 'choose Single Player');

// try a locked arena first (move right twice past Awesome Area), expect rejection
tap('ArrowRight'); frames(2); tap('ArrowRight'); frames(2); tap('Enter'); frames(2);
expectScreen('arenaSelect', 'locked arena rejected');
// pick SCRUM ROOM (index 4) so the new arena gets exercised in the matches
tap('ArrowRight'); frames(2); tap('ArrowRight'); frames(2);

tap('Enter'); frames(2);
expectScreen('characterSelect', 'choose Scrum Room');

const roster = ['mario', 'kratos', 'yadav', 'sickman', 'mrb', 'anshuman'];
let matchesPlayed = 0;

async function playMatch(charIndex, label) {
  // select fighter #charIndex
  for (let i = 0; i < charIndex; i++) { tap('ArrowRight'); frames(1); }
  tap('Enter'); frames(2);
  expectScreen('match', `${label}: start match`);
  console.log(`   fighting: ${app.session.playerCharId} vs ${app.session.aiCharId}`);

  // sit through the intro
  secs(2.2);

  // unlock the rage cheat so rage paths get exercised
  tap('s'); tap('u'); tap('d'); tap('o');

  // brawl: scripted input loop until the match resolves. Every key is
  // guarded so nothing leaks onto the result screen mid-iteration.
  const inMatch = () => app.screens.name === 'match';
  const gtap = (k) => { if (inMatch()) tap(k); };
  const ghold = (k, n) => { if (inMatch()) press(k); frames(n); release(k); };
  let simT = 0;
  let usedRage = false;
  while (inMatch() && simT < 400) {
    ghold('d', 12);
    gtap('j'); frames(6);
    gtap('j'); frames(6);
    gtap('u'); frames(10);
    gtap('o'); frames(8);                 // special
    if (!usedRage && simT > 4) { gtap('p'); usedRage = true; frames(50); }
    gtap('k'); frames(6);
    gtap('i'); frames(10);
    ghold('a', 6);
    gtap('w'); frames(20);                // jump
    ghold('l', 10);                       // block
    simT += (12 + 6 + 6 + 10 + 8 + 6 + 10 + 6 + 20 + 10) * 16.7 / 1000 + (usedRage ? 0 : 0.8);
  }
  if (app.screens.name !== 'result') {
    console.error(`FAIL (${label}): match never resolved after ${Math.round(simT)}s sim time (screen=${app.screens.name})`);
    process.exit(1);
  }
  const res = app.session.lastResult;
  console.log(`ok: ${label} resolved -> ${res.winnerName} wins ${res.score} (playerWon=${res.playerWon}, flawless=${res.flawless})`);
  matchesPlayed++;
}

// first match as mario (default selection 0)
await playMatch(0, 'match 1 (mario)');

// rematch once to verify that path
tap('Enter'); frames(2);
expectScreen('match', 'rematch');
secs(2.2);
tap('s'); tap('u'); tap('d'); tap('o');
let simT = 0;
{
  const inMatch = () => app.screens.name === 'match';
  const gtap = (k) => { if (inMatch()) tap(k); };
  while (inMatch() && simT < 400) {
    if (inMatch()) press('d'); frames(10); release('d');
    gtap('j'); frames(5); gtap('k'); frames(5); gtap('u'); frames(8); gtap('p'); frames(30);
    simT += 58 * 16.7 / 1000;
  }
}
if (app.screens.name !== 'result') { console.error('FAIL: rematch never resolved'); process.exit(1); }
console.log(`ok: rematch resolved -> ${app.session.lastResult.winnerName} wins ${app.session.lastResult.score}`);

// cycle through the remaining fighters via CHANGE FIGHTER
for (let ci = 1; ci < roster.length; ci++) {
  tap('ArrowDown'); frames(1);           // select CHANGE FIGHTER
  tap('Enter'); frames(2);
  expectScreen('characterSelect', `back to character select (${roster[ci]})`);
  await playMatch(ci, `match ${matchesPlayed + 1} (${roster[ci]})`);
}

// main menu path from result
tap('ArrowDown'); frames(1); tap('ArrowDown'); frames(1);
tap('Enter'); frames(2);
expectScreen('mainMenu', 'return to main menu');

// ESC from match works
tap('Enter'); frames(2);              // combat
tap('Enter'); frames(2);              // single player
tap('Enter'); frames(2);              // office arena
tap('Enter'); frames(2);              // mario
expectScreen('match', 'restart flow');
secs(1);
tap('Escape'); frames(2);
expectScreen('mainMenu', 'ESC exits match');

// quit game path: Down selects QUIT GAME, Enter → shutdown screen
tap('ArrowDown'); frames(1);
tap('Enter'); frames(3);
expectScreen('shutdown', 'quit game');

console.log(`\nPASS: ${matchesPlayed + 1} full matches played through the real flow with zero uncaught errors.`);
