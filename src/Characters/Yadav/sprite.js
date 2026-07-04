// Ported from OfficeAdventure/index.html drawYadavBody
export function drawBody(g, p, clock) {
  const x = p.x, y = p.y, s = p.big ? p.h / 30 : 1;
  const moving = Math.abs(p.vx) > 10 && p.onGround;
  const step = moving ? Math.sin(p.anim * 1.2) : 0;

  // legs — blue jeans
  g.fillStyle = '#3b5a8a';
  g.fillRect(x + 2, y + 20 * s, 8, 10 * s + step * 2);
  g.fillRect(x + p.w - 10, y + 20 * s, 8, 10 * s - step * 2);
  // white sneakers
  g.fillStyle = '#e8e8e8';
  g.fillRect(x + 2, y + 27 * s + step * 2, 8, 3);
  g.fillRect(x + p.w - 10, y + 27 * s - step * 2, 8, 3);

  // dark devops tee
  g.fillStyle = '#22303c';
  g.fillRect(x + 2, y + 11 * s, p.w - 4, 10 * s);
  // terminal ">_" logo on the tee
  g.fillStyle = '#7ee787';
  g.fillRect(x + 7, y + 14 * s, 2, 2);
  g.fillRect(x + 10, y + 16 * s, 4, 1.5);
  // arms
  g.fillStyle = '#c98f5f';
  g.fillRect(x, y + 12 * s, 3, 7 * s);
  g.fillRect(x + p.w - 3, y + 12 * s, 3, 7 * s);

  // head
  g.fillStyle = '#c98f5f';
  g.fillRect(x + 4, y, p.w - 8, 12);
  // hair — semi-receding: thinning crown patch, bare temples, fuller at the back
  g.fillStyle = '#1f1712';
  g.fillRect(x + 7, y - 1, p.w - 14, 3);
  g.fillRect(p.face > 0 ? x + 4 : x + p.w - 7, y, 3, 7);
  // brow + eye
  g.fillStyle = '#000';
  g.fillRect(p.face > 0 ? x + p.w - 9 : x + 6, y + 5, 2, 2.5);
  // light mustache
  g.fillStyle = '#3a2b1d';
  g.fillRect(x + 6, y + 8.5, p.w - 12, 1.5);
  // light beard along the jaw
  g.fillStyle = 'rgba(58,43,29,0.75)';
  g.fillRect(x + 4, y + 10.5, p.w - 8, 1.5);

  // steel milk churn in hand
  const hx = p.face > 0 ? x + p.w + 1 : x - 8;
  const hy = y + 13 * s;
  g.fillStyle = '#b8c0c8'; g.fillRect(hx, hy, 7, 9);
  g.fillStyle = '#8a949c'; g.fillRect(hx, hy, 7, 2.5);
  g.fillStyle = '#d8dee4'; g.fillRect(hx + 1.5, hy - 2, 4, 2);

  // idle for a bit → lo-fi beats while the pipeline runs
  if (p.listening) {
    const beat = Math.sin(clock / 180);
    // headphone band over the hair
    g.strokeStyle = '#20262e'; g.lineWidth = 2;
    g.beginPath();
    g.arc(x + p.w / 2, y + 4, p.w / 2 - 3.5, Math.PI * 1.05, Math.PI * 1.95);
    g.stroke();
    // ear cups with a glowing indicator
    g.fillStyle = '#20262e';
    g.fillRect(x + 2.5, y + 3.5, 3.5, 6);
    g.fillRect(x + p.w - 6, y + 3.5, 3.5, 6);
    g.fillStyle = beat > 0 ? '#7ee787' : '#3fae56';
    g.fillRect(x + 3.5, y + 6, 1.5, 1.5);
    g.fillRect(x + p.w - 5, y + 6, 1.5, 1.5);
    // floating music notes
    g.font = 'bold 7px "Trebuchet MS", sans-serif';
    g.textAlign = 'center';
    for (let i = 0; i < 3; i++) {
      const ph = (clock / 700 + i * 0.33) % 1;
      const nx = x + p.w / 2 + (p.face > 0 ? 14 : -14) + Math.sin(ph * 9 + i * 2) * 3;
      const ny = y - 2 - ph * 16;
      g.globalAlpha = Math.max(0, 1 - ph) * 0.9;
      g.fillStyle = i % 2 ? '#9fe8ff' : '#7ee787';
      g.fillText(i % 2 ? '♫' : '♪', nx, ny);
    }
    g.globalAlpha = 1;
  }
}
