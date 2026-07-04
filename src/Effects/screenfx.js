// Screen shake + full-screen flashes + hitstop, ported/generalized from the
// legacy shake/killFlash pattern.
export function createScreenFx() {
  let shake = 0;
  let flashes = [];      // {color, t, dur}
  let hitstop = 0;       // global freeze timer (seconds)

  return {
    shake(n) { shake = Math.max(shake, n); },
    flash(color, dur = 0.25) { flashes.push({ color, t: 0, dur }); },
    freeze(sec) { hitstop = Math.max(hitstop, sec); },
    get hitstop() { return hitstop; },

    update(dt) {
      shake = Math.max(0, shake - dt * 22);
      hitstop = Math.max(0, hitstop - dt);
      for (const f of flashes) f.t += dt;
      flashes = flashes.filter(f => f.t < f.dur);
    },

    // random camera offset to apply while rendering the world
    offset() {
      if (shake <= 0) return { x: 0, y: 0 };
      return {
        x: (Math.random() - 0.5) * shake * 2,
        y: (Math.random() - 0.5) * shake * 2,
      };
    },

    // draw full-screen flashes (call in screen space, after the world)
    renderFlashes(g, w, h) {
      for (const f of flashes) {
        const a = 1 - f.t / f.dur;
        g.save();
        g.globalAlpha = a;
        g.fillStyle = f.color;
        g.fillRect(0, 0, w, h);
        g.restore();
      }
    },

    reset() { shake = 0; flashes = []; hitstop = 0; },
  };
}
