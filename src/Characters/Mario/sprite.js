// Ported from OfficeAdventure/index.html drawMarioBody (ctx→g, animClock→clock)
export function drawBody(g, p, clock) {
  const x = p.x, y = p.y, s = p.big ? p.h / 30 : 1;
  const moving = Math.abs(p.vx) > 10 && p.onGround;
  const step = moving ? Math.sin(p.anim * 1.2) : 0;
  g.fillStyle = '#1a3a8a';
  g.fillRect(x + 2, y + 20 * s, 8, 10 * s + step * 2);
  g.fillRect(x + p.w - 10, y + 20 * s, 8, 10 * s - step * 2);
  g.fillStyle = '#e23b3b'; g.fillRect(x, y + 10 * s, p.w, 12 * s);
  g.fillStyle = '#2a52be'; g.fillRect(x + 4, y + 14 * s, p.w - 8, 10 * s);
  g.fillStyle = '#ffd93d';
  g.fillRect(x + 6, y + 16 * s, 2, 2); g.fillRect(x + p.w - 8, y + 16 * s, 2, 2);
  g.fillStyle = '#ffc89b'; g.fillRect(x + 3, y, p.w - 6, 12);
  g.fillStyle = '#e23b3b';
  g.fillRect(x + 1, y - 2, p.w - 2, 5);
  g.fillRect(p.face > 0 ? x + p.w - 4 : x - 2, y + 1, 6, 4);
  g.fillStyle = '#000';
  g.fillRect(p.face > 0 ? x + p.w - 9 : x + 5, y + 5, 2, 3);
  g.fillStyle = '#3a2410';
  g.fillRect(p.face > 0 ? x + p.w - 11 : x + 3, y + 8, 7, 2);
  // gun held out in facing direction
  const gy = y + 13 * (p.big ? p.h / 30 : 1);
  g.fillStyle = '#444';
  if (p.face > 0) {
    g.fillRect(x + p.w - 2, gy, 10, 4);
    g.fillRect(x + p.w - 2, gy + 3, 4, 5);
  } else {
    g.fillRect(x - 8, gy, 10, 4);
    g.fillRect(x - 2, gy + 3, 4, 5);
  }
  // muzzle flash just after firing
  if (p.fireCd > 0.2) {
    g.fillStyle = '#ffd93d';
    const mx = p.face > 0 ? x + p.w + 8 : x - 8;
    g.beginPath(); g.arc(mx, gy + 2, 4, 0, 7); g.fill();
  }
}
