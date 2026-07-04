// Ported from OfficeAdventure/index.html drawSickmanBody
export function drawBody(g, p, clock) {
  const x = p.x, y = p.y, s = p.big ? p.h / 30 : 1;
  const moving = Math.abs(p.vx) > 10 && p.onGround;
  const step = moving ? Math.sin(p.anim * 1.2) : 0;
  const angry = p.raging > 0;

  // baggy jeans
  g.fillStyle = '#6b84a8';
  g.fillRect(x + 1, y + 21 * s, 9, 9 * s + step * 2);
  g.fillRect(x + p.w - 10, y + 21 * s, 9, 9 * s - step * 2);
  // dark sneakers
  g.fillStyle = '#333';
  g.fillRect(x + 1, y + 27 * s + step * 2, 9, 3);
  g.fillRect(x + p.w - 10, y + 27 * s - step * 2, 9, 3);

  // oversized tee — hangs wide and low
  g.fillStyle = '#2e2e2e';
  g.fillRect(x - 1, y + 10 * s, p.w + 2, 12 * s);
  // beer mug graphic on the tee
  g.fillStyle = '#f5a623'; g.fillRect(x + 8, y + 14 * s, 4, 4);
  g.fillStyle = '#fff';    g.fillRect(x + 8, y + 13 * s, 4, 1.5);
  // arms
  g.fillStyle = angry ? '#e88a6a' : '#e8b88a';
  g.fillRect(x - 3, y + 11 * s, 3, 8 * s);
  g.fillRect(x + p.w, y + 11 * s, 3, 8 * s);

  // head — round, going red when furious
  g.fillStyle = angry ? '#e86a50' : '#e8b88a';
  g.fillRect(x + 4, y, p.w - 8, 12);
  // balding — just a tuft at the back under the cap
  g.fillStyle = '#4a4038';
  g.fillRect(p.face > 0 ? x + 4 : x + p.w - 6, y + 6, 2, 4);
  // white cap
  g.fillStyle = '#f2f2f2';
  g.fillRect(x + 3, y - 3, p.w - 6, 5);
  g.fillRect(p.face > 0 ? x + p.w - 6 : x - 3, y, 9, 3);   // brim
  g.fillStyle = '#d5d5d5';
  g.fillRect(x + 3, y - 3, p.w - 6, 2);
  g.strokeStyle = 'rgba(0,0,0,0.25)'; g.lineWidth = 1;
  g.strokeRect(x + 3.5, y - 2.5, p.w - 7, 4);

  // glasses
  const gx = p.face > 0 ? x + p.w - 14 : x + 3;
  g.fillStyle = '#111';
  g.fillRect(gx, y + 4, 5, 4); g.fillRect(gx + 6, y + 4, 5, 4);
  g.fillRect(gx + 4, y + 5, 3, 1.5);
  g.fillStyle = 'rgba(160,220,255,0.8)';
  g.fillRect(gx + 1, y + 5, 3, 2); g.fillRect(gx + 7, y + 5, 3, 2);
  // angry brows + forehead vein
  if (angry) {
    g.fillStyle = '#7a1010';
    g.fillRect(gx, y + 2.5, 5, 1.5); g.fillRect(gx + 6, y + 2.5, 5, 1.5);
    g.fillStyle = '#c02020';
    g.fillRect(p.face > 0 ? x + 6 : x + p.w - 8, y + 1.5, 2, 1.2);
  }
  // stubble
  g.fillStyle = 'rgba(90,70,50,0.6)';
  g.fillRect(x + 4, y + 9.5, p.w - 8, 2.5);
  // mouth: furious → shouting; smoking → cigarette with ember
  if (angry) {
    g.fillStyle = '#300';
    g.fillRect(p.face > 0 ? x + p.w - 11 : x + 7, y + 9, 4, 3);
  } else if (p.smoking) {
    g.fillStyle = '#eee';
    const cx0 = p.face > 0 ? x + p.w - 5 : x - 2;
    g.fillRect(p.face > 0 ? cx0 : x - 4, y + 9, 6, 1.5);
    g.fillStyle = Math.floor(clock / 300) % 2 === 0 ? '#ff7020' : '#ffb020';
    g.fillRect(p.face > 0 ? cx0 + 6 : x - 5.5, y + 9, 1.5, 1.5);
  }

  // beer bottle in hand
  const hx = p.face > 0 ? x + p.w + 0.5 : x - 4.5;
  const hy = y + 15 * s;
  g.fillStyle = '#7a4a12';
  g.fillRect(hx, hy, 4, 8);
  g.fillRect(hx + 1, hy - 3, 2, 3);
  g.fillStyle = '#e8e0d0';
  g.fillRect(hx, hy + 2, 4, 2.5);
}
