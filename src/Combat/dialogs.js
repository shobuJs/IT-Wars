// Dialog engine: comic speech bubbles above fighters' heads.
// Lines live in each character's own dialogs.js (typed pools):
//   onHurt    — when a fighter lands a hit, they taunt with a line from the
//               VICTIM's onHurt pool (mock the role of whoever got smacked)
//   onVictory — the round winner drops a one-liner from their own pool
// Cooldown-gated so a combo doesn't turn into a stand-up special.
const FONT = '"Trebuchet MS", "Segoe UI", sans-serif';

export function createDialogs() {
  let bubbles = [];              // {fighter, text, t, dur}
  const lastSaid = new Map();    // fighter -> {t, lineIdx per pool}

  function say(fighter, text, dur = 1.5) {
    bubbles = bubbles.filter(b => b.fighter !== fighter);   // one bubble per mouth
    bubbles.push({ fighter, text, t: 0, dur });
  }

  function pickLine(pool, key) {
    if (!pool || !pool.length) return null;
    // cycle through the pool so lines don't repeat back-to-back
    const state = lastSaid.get(key) || { idx: -1 };
    state.idx = (state.idx + 1 + Math.floor(Math.random() * (pool.length - 1))) % pool.length;
    lastSaid.set(key, state);
    return pool[state.idx];
  }

  return {
    // attacker just landed a clean hit on victim
    onHit(attacker, victim, heavy) {
      const cd = attacker.sp._dialogCd || 0;
      if (cd > 0) return;
      if (!heavy && Math.random() > 0.45) return;   // don't chatter on every jab
      const line = pickLine(victim.char.dialogs?.onHurt, victim.char.id + ':hurt');
      if (!line) return;
      attacker.sp._dialogCd = 2.2;
      say(attacker, line);
    },

    onVictory(winner) {
      const line = pickLine(winner.char.dialogs?.onVictory, winner.char.id + ':win');
      if (line) say(winner, line, 2.4);
    },

    say,

    update(dt, fighters) {
      for (const b of bubbles) b.t += dt;
      bubbles = bubbles.filter(b => b.t < b.dur);
      for (const f of fighters) {
        if (f.sp._dialogCd > 0) f.sp._dialogCd -= dt;
      }
    },

    clear() { bubbles = []; },

    // world-space rendering (inside the fight camera transform)
    render(g) {
      for (const b of bubbles) {
        const f = b.fighter;
        const pop = Math.min(1, b.t / 0.12);                       // pop-in
        const fade = b.t > b.dur - 0.25 ? (b.dur - b.t) / 0.25 : 1;
        g.save();
        g.globalAlpha = fade;
        g.font = `bold 14px ${FONT}`;
        const tw = g.measureText(b.text).width;
        const bw = tw + 22, bh = 28;
        let bx = f.x + f.w / 2 - bw / 2;
        const by = f.y - bh - 18;
        g.translate(bx + bw / 2, by + bh / 2);
        g.scale(pop, pop);
        g.translate(-(bx + bw / 2), -(by + bh / 2));
        // bubble
        g.fillStyle = 'rgba(255,255,255,0.96)';
        g.strokeStyle = 'rgba(0,0,0,0.5)';
        g.lineWidth = 2;
        g.beginPath();
        g.roundRect ? g.roundRect(bx, by, bw, bh, 8) : g.rect(bx, by, bw, bh);
        g.fill(); g.stroke();
        // tail toward the speaker's head
        g.beginPath();
        g.moveTo(f.x + f.w / 2 - 6, by + bh - 1);
        g.lineTo(f.x + f.w / 2 + 8, by + bh - 1);
        g.lineTo(f.x + f.w / 2, by + bh + 10);
        g.closePath();
        g.fillStyle = 'rgba(255,255,255,0.96)';
        g.fill();
        // text
        g.fillStyle = '#1a1214';
        g.textAlign = 'center';
        g.fillText(b.text, bx + bw / 2, by + 19);
        g.restore();
      }
    },
  };
}
