// Match orchestrator: round intro → fight (60s) → KO slow-mo → round end →
// best-of-3 bookkeeping → result. The combat engine handles everything
// inside a round; this screen owns match structure, camera, HUD and banners.
import { DESIGN_W, DESIGN_H, FONT, COLORS } from '../Shared/constants.js';
import { clamp, lerp } from '../Shared/math.js';
import { arenaById } from '../Arenas/index.js';
import { characterById } from '../Characters/index.js';
import { createParticles } from '../Effects/particles.js';
import { createScreenFx } from '../Effects/screenfx.js';
import { createFight } from '../Combat/engine.js';
import { createAI } from '../Combat/ai.js';
import { drawHud } from '../UI/hud.js';

const ROUND_TIME = 60;

let arena, fight, particles, fx, ai;
let matchState, stateT, round, timer;
let wins = { left: 0, right: 0 };
let camX = 0;
let banner = null;   // {text, sub, color, t, dur}
let prevCheat = false;

const EXIT_RECT = { x: DESIGN_W - 86, y: 118, w: 72, h: 24 };
const KEY_STRIP = 'A/D MOVE · W JUMP · S CROUCH · J PUNCH · K KICK · U/I HEAVY · L BLOCK · O SPECIAL · P RAGE · ESC EXIT';
const KEY_PANEL = [
  ['A / D', 'MOVE'], ['W', 'JUMP'], ['S', 'CROUCH'], ['J / K', 'PUNCH / KICK'],
  ['U / I', 'HEAVY PUNCH / KICK'], ['L', 'BLOCK'], ['O', 'SPECIAL'], ['P', 'RAGE (full meter)'],
  ['A A / D D', 'DASH'], ['ESC', 'EXIT MATCH'],
];

function showBanner(text, sub, color = '#ff3030', dur = 1.4) {
  banner = { text, sub, color, t: 0, dur };
}

function startRound(app, first) {
  timer = ROUND_TIME;
  if (!first) fight.resetRound();
  particles.clearStains();
  fight.setEnabled(false);
  matchState = 'intro';
  stateT = 0;
  showBanner(`ROUND ${round}`, null, '#f2e9e4', 1.2);
}

function endMatch(app) {
  const winnerSide = wins.left >= 2 ? 'left' : 'right';
  const w = winnerSide === 'left' ? fight.left : fight.right;
  const l = winnerSide === 'left' ? fight.right : fight.left;
  app.session.lastResult = {
    winnerId: w.char.id,
    winnerName: w.char.name,
    loserName: l.char.name,
    playerWon: winnerSide === 'left',
    score: `${Math.max(wins.left, wins.right)} – ${Math.min(wins.left, wins.right)}`,
    flawless: winnerSide === 'left' ? wins.right === 0 : wins.left === 0,
  };
  app.screens.goto(app, 'result');
}

export default {
  enter(app) {
    arena = arenaById[app.session.arenaId] || arenaById.office;
    const playerChar = characterById[app.session.playerCharId] || Object.values(characterById)[0];
    const aiChar = characterById[app.session.aiCharId] || Object.values(characterById).find(c => c !== playerChar);

    particles = createParticles(arena.floorY);
    fx = createScreenFx();

    const playerController = {
      isDown: (a) => app.input.isDown(a),
      justPressed: (a) => app.input.justPressed(a),
    };
    // AI controller needs the fighters, which need controllers — two-phase init
    let aiProxy = { isDown: () => false, justPressed: () => false };
    const aiController = {
      isDown: (a) => aiProxy.isDown(a),
      justPressed: (a) => aiProxy.justPressed(a),
    };

    fight = createFight({
      arena,
      leftChar: playerChar,
      rightChar: aiChar,
      leftController: playerController,
      rightController: aiController,
      particles, fx,
    });
    ai = createAI(fight.right, fight.left, 'normal');
    aiProxy = ai;

    wins = { left: 0, right: 0 };
    round = 1;
    camX = clamp((arena.width - DESIGN_W) / 2, 0, arena.width - DESIGN_W);
    startRound(app, true);
    if (app.touch) app.touch.show();
  },

  exit(app) {
    if (app.touch) app.touch.hide();
  },

  update(app, dt) {
    fx.update(dt);
    if (banner) { banner.t += dt; if (banner.t > banner.dur) banner = null; }

    // debug hitbox overlay + sudo cheat
    if (app.input.justPressed('debug')) fight.toggleDebug();
    if (app.input.cheatRage !== prevCheat) {
      prevCheat = app.input.cheatRage;
      showBanner('SUDO', prevCheat ? 'ROOT ACCESS — UNLIMITED RAGE' : 'PRIVILEGES REVOKED', '#7ee787', 1.6);
      app.audio.SFX.power();
    }
    if (app.input.cheatRage) fight.left.rage = 100;

    const timescale = matchState === 'koSlowmo' ? 0.25 : 1;
    const sdt = Math.min(dt, 1 / 30) * timescale;

    ai.update(sdt);
    fight.update(sdt);
    stateT += dt;

    switch (matchState) {
      case 'intro': {
        if (stateT >= 1.2 && stateT - dt < 1.2) { showBanner('FIGHT!', null, '#ff3030', 0.8); app.audio.SFX.roar(); }
        if (stateT >= 2.0) { matchState = 'fight'; fight.setEnabled(true); }
        break;
      }

      case 'fight': {
        if (!fight.cinematic) timer -= sdt;
        const snap = fight.snapshot();
        if (snap.over) {
          matchState = 'koSlowmo';
          stateT = 0;
          showBanner('K.O.!', null, '#ff3030', 1.4);
          app.audio.SFX.koBell();
        } else if (timer <= 0) {
          const lf = snap.left.hp / snap.left.maxHp;
          const rf = snap.right.hp / snap.right.maxHp;
          fight.setEnabled(false);
          if (Math.abs(lf - rf) < 0.001) {
            showBanner("TIME'S UP", 'DRAW — REPLAY ROUND', '#ffd93d', 1.8);
            matchState = 'roundEnd';
            stateT = 0;
            banner.replay = true;
          } else {
            const winner = lf > rf ? fight.left : fight.right;
            winner.state = 'victory'; winner.stateT = 0;
            wins[lf > rf ? 'left' : 'right']++;
            fight.sayVictory(lf > rf ? 'left' : 'right');
            showBanner("TIME'S UP", `${winner.char.name} WINS ROUND ${round}`, '#ffd93d', 1.8);
            matchState = 'roundEnd';
            stateT = 0;
          }
        }
        break;
      }

      case 'koSlowmo': {
        if (stateT >= 1.4) {
          const snap = fight.snapshot();
          const side = snap.winner || 'left';
          const winner = side === 'left' ? fight.left : fight.right;
          winner.state = 'victory'; winner.stateT = 0;
          wins[side]++;
          fight.sayVictory(side);
          matchState = 'roundEnd';
          stateT = 0;
          showBanner(`${winner.char.name}`, `WINS ROUND ${round}`, winner.char.palette.accent, 2.0);
          app.audio.SFX.win();
        }
        break;
      }

      case 'roundEnd': {
        if (stateT >= 2.2) {
          if (wins.left >= 2 || wins.right >= 2) {
            matchState = 'matchEnd';
            stateT = 0;
            const side = wins.left >= 2 ? 'left' : 'right';
            const winner = side === 'left' ? fight.left : fight.right;
            const flawless = side === 'left' ? wins.right === 0 : wins.left === 0;
            showBanner(`${winner.char.name} WINS!`, flawless ? 'PERFORMANCE REVIEW: EXCEEDS EXPECTATIONS' : null,
              winner.char.palette.accent, 3.0);
          } else {
            round++;
            startRound(app, false);
          }
        }
        break;
      }

      case 'matchEnd': {
        if (stateT >= 3.0) endMatch(app);
        break;
      }
    }

    // camera: lerped midpoint tracking
    const mid = (fight.left.x + fight.left.w / 2 + fight.right.x + fight.right.w / 2) / 2;
    const target = clamp(mid - DESIGN_W / 2, 0, arena.width - DESIGN_W);
    camX = lerp(camX, target, Math.min(1, 6 * dt));

    if (app.input.justPressed('back')) app.screens.goto(app, 'mainMenu');
  },

  onPointer(app, x, y, type) {
    if (type === 'down' &&
        x >= EXIT_RECT.x && x <= EXIT_RECT.x + EXIT_RECT.w &&
        y >= EXIT_RECT.y && y <= EXIT_RECT.y + EXIT_RECT.h) {
      app.audio.SFX.menuMove();
      app.screens.goto(app, 'mainMenu');
    }
  },

  render(app, g) {
    g.fillStyle = '#000';
    g.fillRect(0, 0, DESIGN_W, DESIGN_H);

    const off = fx.offset();
    g.save();
    g.translate(-camX + off.x, off.y);
    arena.drawBackground(g, app.clock);
    fight.render(g, app.clock);
    if (arena.drawForeground) arena.drawForeground(g, app.clock);
    g.restore();

    fx.renderFlashes(g, DESIGN_W, DESIGN_H);

    // rage cinematic: vignette + move name
    if (fight.cinematic) {
      const c = fight.cinematic;
      g.fillStyle = 'rgba(0,0,0,0.55)';
      g.fillRect(0, 0, DESIGN_W, DESIGN_H);
      const slam = 1 + Math.max(0, c.t - 0.45) * 4;
      g.save();
      g.translate(DESIGN_W / 2, DESIGN_H / 2);
      g.scale(slam, slam);
      g.font = `900 52px ${FONT}`;
      g.textAlign = 'center';
      g.fillStyle = '#000';
      g.fillText(c.name, 3, 3);
      g.fillStyle = c.color;
      g.fillText(c.name, 0, 0);
      g.restore();
    }

    const snap = fight.snapshot();
    drawHud(g, snap, wins.left, wins.right, timer, round);

    // ✕ EXIT button (clickable / tappable)
    g.fillStyle = 'rgba(0,0,0,0.55)';
    g.fillRect(EXIT_RECT.x, EXIT_RECT.y, EXIT_RECT.w, EXIT_RECT.h);
    g.strokeStyle = 'rgba(255,255,255,0.35)';
    g.lineWidth = 1;
    g.strokeRect(EXIT_RECT.x + 0.5, EXIT_RECT.y + 0.5, EXIT_RECT.w - 1, EXIT_RECT.h - 1);
    g.font = `bold 12px ${FONT}`;
    g.textAlign = 'center';
    g.fillStyle = '#f2e9e4';
    g.fillText('✕ EXIT', EXIT_RECT.x + EXIT_RECT.w / 2, EXIT_RECT.y + 16);

    // persistent key strip along the bottom
    g.fillStyle = 'rgba(0,0,0,0.45)';
    g.fillRect(0, DESIGN_H - 20, DESIGN_W, 20);
    g.font = `11px ${FONT}`;
    g.fillStyle = 'rgba(242,233,228,0.75)';
    g.fillText(KEY_STRIP, DESIGN_W / 2, DESIGN_H - 6);

    // full controls panel while the round intro plays
    if (matchState === 'intro') {
      const pw = 560, ph = 158;
      const px = DESIGN_W / 2 - pw / 2, py = DESIGN_H - ph - 34;
      g.fillStyle = 'rgba(10,6,8,0.82)';
      g.fillRect(px, py, pw, ph);
      g.strokeStyle = 'rgba(255,255,255,0.25)';
      g.strokeRect(px + 0.5, py + 0.5, pw - 1, ph - 1);
      g.font = `900 14px ${FONT}`;
      g.fillStyle = COLORS.gold;
      g.fillText('CONTROLS', DESIGN_W / 2, py + 22);
      g.font = `12px ${FONT}`;
      const colW = pw / 2;
      KEY_PANEL.forEach(([key, what], i) => {
        const col = i % 2, row = Math.floor(i / 2);
        const kx = px + 26 + col * colW, ky = py + 46 + row * 19;
        g.textAlign = 'left';
        g.fillStyle = '#ffd93d';
        g.fillText(key, kx, ky);
        g.fillStyle = 'rgba(242,233,228,0.85)';
        g.fillText(what, kx + 86, ky);
      });
      g.textAlign = 'center';
      g.font = `italic 11px ${FONT}`;
      g.fillStyle = 'rgba(126,231,135,0.8)';
      g.fillText("psst… type  S U D O  during the fight for unlimited rage", DESIGN_W / 2, py + ph - 12);
    }

    // slam-in announcer banner
    if (banner) {
      const k = Math.min(1, banner.t / 0.15);
      const scale = 1.6 - 0.6 * k;
      const alpha = banner.t > banner.dur - 0.3 ? (banner.dur - banner.t) / 0.3 : 1;
      g.save();
      g.globalAlpha = Math.max(0, alpha);
      g.translate(DESIGN_W / 2, DESIGN_H / 2 - 40);
      g.scale(scale, scale);
      g.textAlign = 'center';
      g.font = `900 64px ${FONT}`;
      g.fillStyle = '#000';
      g.fillText(banner.text, 4, 4);
      g.fillStyle = banner.color;
      g.fillText(banner.text, 0, 0);
      if (banner.sub) {
        g.font = `bold 20px ${FONT}`;
        g.fillStyle = '#f2e9e4';
        g.fillText(banner.sub, 0, 40);
      }
      g.restore();
    }
  },
};
