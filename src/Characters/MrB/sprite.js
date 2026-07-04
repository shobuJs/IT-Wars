// Ported from OfficeAdventure/index.html drawMrBBody
export function drawBody(g, p, clock) {
  const x = p.x, y = p.y, s = p.big ? p.h / 30 : 1;
  const moving = Math.abs(p.vx) > 10 && p.onGround;
  const step = moving ? Math.sin(p.anim * 1.2) : 0;

  // dark trousers
  g.fillStyle = '#3a3f4a';
  g.fillRect(x + 2, y + 20 * s, 8, 10 * s + step * 2);
  g.fillRect(x + p.w - 10, y + 20 * s, 8, 10 * s - step * 2);
  // brown shoes
  g.fillStyle = '#5a4632';
  g.fillRect(x + 2, y + 27 * s + step * 2, 8, 3);
  g.fillRect(x + p.w - 10, y + 27 * s - step * 2, 8, 3);

  // pink shirt with collar and buttons
  g.fillStyle = '#ff8fb3';
  g.fillRect(x + 2, y + 10 * s, p.w - 4, 11 * s);
  g.fillStyle = '#e06a92';
  g.fillRect(x + 6, y + 10 * s, p.w - 12, 2);
  g.fillStyle = 'rgba(0,0,0,0.15)';
  g.fillRect(x + p.w / 2 - 0.75, y + 12 * s, 1.5, 8 * s);
  // arms — fair skin
  g.fillStyle = '#f2d4b0';
  g.fillRect(x - 1, y + 11 * s, 3, 7 * s);
  g.fillRect(x + p.w - 2, y + 11 * s, 3, 7 * s);

  // head — fair tone
  g.fillStyle = '#f2d4b0';
  g.fillRect(x + 4, y, p.w - 8, 12);
  // full fade — buzzed shadow on the sides
  g.fillStyle = 'rgba(90,75,55,0.35)';
  g.fillRect(x + 4, y + 1, 2, 6);
  g.fillRect(x + p.w - 6, y + 1, 2, 6);
  // receding top patch, set well back off the forehead
  g.fillStyle = '#4a3a28';
  g.fillRect(p.face > 0 ? x + 5 : x + 9, y - 1.5, p.w - 14, 3);
  // glasses
  const gx = p.face > 0 ? x + p.w - 14 : x + 3;
  g.fillStyle = '#111';
  g.fillRect(gx, y + 4, 5, 4); g.fillRect(gx + 6, y + 4, 5, 4);
  g.fillRect(gx + 4, y + 5, 3, 1.5);
  g.fillStyle = 'rgba(180,230,255,0.85)';
  g.fillRect(gx + 1, y + 5, 3, 2); g.fillRect(gx + 7, y + 5, 3, 2);
  // proper mustache
  g.fillStyle = '#4a3520';
  g.fillRect(p.face > 0 ? x + p.w - 13 : x + 5, y + 8.5, 8, 2);

  // coffee mug in hand — white mug, dark roast, drifting steam
  const hx = p.face > 0 ? x + p.w + 1 : x - 7;
  const hy = y + 14 * s;
  g.fillStyle = '#fff'; g.fillRect(hx, hy, 6, 6);
  g.strokeStyle = '#fff'; g.lineWidth = 1.5;
  g.beginPath(); g.arc(p.face > 0 ? hx + 6 : hx, hy + 3, 2, -1.4, 1.4); g.stroke();
  g.fillStyle = '#6b4226'; g.fillRect(hx + 1, hy + 1, 4, 1.5);
  g.fillStyle = 'rgba(255,255,255,0.5)';
  g.fillRect(hx + 2, hy - 4 + Math.sin(clock / 300) * 1.5, 1.2, 3);

  // "Coffe piyega?" thought bubble when idle
  if (p.thinking) {
    const bxc = x + p.w / 2 + 30, byc = y - 28;
    g.fillStyle = 'rgba(255,255,255,0.95)';
    g.beginPath(); g.arc(x + p.w / 2 + 6, y - 6, 2.2, 0, 7); g.fill();
    g.beginPath(); g.arc(x + p.w / 2 + 12, y - 14, 3.2, 0, 7); g.fill();
    g.beginPath(); g.ellipse(bxc, byc, 46, 14, 0, 0, 7); g.fill();
    g.strokeStyle = 'rgba(0,0,0,0.35)'; g.lineWidth = 1.5;
    g.beginPath(); g.ellipse(bxc, byc, 46, 14, 0, 0, 7); g.stroke();
    g.fillStyle = '#4a3520';
    g.font = 'bold 12px "Trebuchet MS", sans-serif';
    g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText('Coffe piyega?', bxc, byc + 0.5);
    g.textBaseline = 'alphabetic';
  }
}
