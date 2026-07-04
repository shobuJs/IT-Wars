// Ported from OfficeAdventure/index.html drawKratosBody + drawAxeSprite
export function drawAxeSprite(g, flip) {
  g.save();
  if (flip) g.scale(-1, 1);
  // handle
  g.fillStyle = '#5d4024'; g.fillRect(-2, -13, 4, 27);
  g.fillStyle = '#7d5c36'; g.fillRect(-2, -13, 2, 27);
  // wrap
  g.fillStyle = '#3d2b1a'; g.fillRect(-2, 4, 4, 4);
  // pommel
  g.fillStyle = '#c9a227'; g.fillRect(-3, 12, 6, 3);
  // blade
  g.fillStyle = '#cfd8dc';
  g.beginPath();
  g.moveTo(1, -13); g.lineTo(15, -17); g.lineTo(13, -3); g.lineTo(1, -7);
  g.closePath(); g.fill();
  // frost edge glow
  g.fillStyle = '#9fe8ff';
  g.beginPath();
  g.moveTo(15, -17); g.lineTo(17, -10); g.lineTo(13, -3); g.lineTo(14.2, -10.5);
  g.closePath(); g.fill();
  // back spike
  g.fillStyle = '#90a4ae'; g.fillRect(-9, -15, 8, 5);
  // runes
  g.fillStyle = '#6fc8e8';
  g.fillRect(5, -11, 1.6, 1.6); g.fillRect(8, -9, 1.6, 1.6);
  g.restore();
}

export function drawBody(g, p, clock) {
  const x = p.x, y = p.y, s = p.big ? p.h / 30 : 1;
  const moving = Math.abs(p.vx) > 10 && p.onGround;
  const step = moving ? Math.sin(p.anim * 1.2) : 0;
  const raging = p.raging > 0;

  // legs — dark leather wraps
  g.fillStyle = '#4a3826';
  g.fillRect(x + 2, y + 20 * s, 8, 10 * s + step * 2);
  g.fillRect(x + p.w - 10, y + 20 * s, 8, 10 * s - step * 2);
  g.fillStyle = '#2e2318';
  g.fillRect(x + 2, y + 27 * s + step * 2, 8, 3);
  g.fillRect(x + p.w - 10, y + 27 * s - step * 2, 8, 3);

  // bare pale torso
  g.fillStyle = raging ? '#f0c8a8' : '#dfc7a6';
  g.fillRect(x + 2, y + 11 * s, p.w - 4, 10 * s);
  // pecs/abs shading
  g.fillStyle = 'rgba(0,0,0,0.12)';
  g.fillRect(x + p.w / 2 - 1, y + 12 * s, 2, 8 * s);
  // red tattoo — down the torso
  g.fillStyle = raging ? '#ff2010' : '#c01818';
  g.fillRect(p.face > 0 ? x + 4 : x + p.w - 7, y + 11 * s, 3, 10 * s);
  // belt
  g.fillStyle = '#5a4632'; g.fillRect(x + 2, y + 20 * s, p.w - 4, 3);
  g.fillStyle = '#c9a227'; g.fillRect(x + p.w / 2 - 2, y + 20 * s, 4, 3);
  // bronze shoulder guard (back side)
  g.fillStyle = '#b07a2a';
  g.fillRect(p.face > 0 ? x : x + p.w - 7, y + 10 * s, 7, 5);

  // head — bald, pale
  g.fillStyle = raging ? '#f0c8a8' : '#dfc7a6';
  g.fillRect(x + 4, y, p.w - 8, 11);
  // red tattoo over eye, up over the scalp
  g.fillStyle = raging ? '#ff2010' : '#c01818';
  g.fillRect(p.face > 0 ? x + p.w - 10 : x + 7, y - 1, 3, 8);
  // angry brow + eye
  g.fillStyle = '#000';
  g.fillRect(p.face > 0 ? x + p.w - 11 : x + 5, y + 4, 5, 1.5);
  g.fillStyle = raging ? '#ff3020' : '#000';
  g.fillRect(p.face > 0 ? x + p.w - 9 : x + 6, y + 6, 2, 2.5);
  // beard
  g.fillStyle = '#4c3524';
  g.fillRect(x + 4, y + 8, p.w - 8, 4);
  g.fillRect(x + 6, y + 11, p.w - 12, 2);

  // Leviathan axe in hand when not thrown
  if (!p.axeOut) {
    g.save();
    const hx = p.face > 0 ? x + p.w + 2 : x - 2;
    g.translate(hx, y + 14 * s);
    g.scale(0.9, 0.9);
    drawAxeSprite(g, p.face < 0);
    g.restore();
  } else {
    // empty raised hand, calling the axe home
    g.fillStyle = raging ? '#f0c8a8' : '#dfc7a6';
    g.fillRect(p.face > 0 ? x + p.w : x - 4, y + 12 * s, 4, 4);
  }
}
