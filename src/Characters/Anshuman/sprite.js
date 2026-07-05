// THE ANSHUMAN — big build, full log beard, dark brown hair, black tee,
// jeans, permanent cigarette (sutta). Idle quirk ('gaming'): after standing
// still he pulls out his phone, plays, and laughs.
export function drawBody(g, p, clock) {
  const x = p.x, y = p.y, s = p.big ? p.h / 30 : 1;
  const moving = Math.abs(p.vx) > 10 && p.onGround;
  const step = moving ? Math.sin(p.anim * 1.2) : 0;

  // legs — dark jeans
  g.fillStyle = '#3a4a68';
  g.fillRect(x + 1, y + 21 * s, 9, 9 * s + step * 2);
  g.fillRect(x + p.w - 10, y + 21 * s, 9, 9 * s - step * 2);
  // black shoes
  g.fillStyle = '#161616';
  g.fillRect(x + 1, y + 27 * s + step * 2, 9, 3);
  g.fillRect(x + p.w - 10, y + 27 * s - step * 2, 9, 3);

  // black tee — wide torso + belly overhang for the fat build
  g.fillStyle = '#1c1c1c';
  g.fillRect(x - 3, y + 10 * s, p.w + 6, 8 * s);
  g.fillStyle = '#212121';
  g.fillRect(x - 4, y + 16 * s, p.w + 8, 6 * s);
  g.fillStyle = 'rgba(255,255,255,0.05)';
  g.fillRect(x - 4, y + 16 * s, p.w + 8, 1.5);

  // arms — skin tone
  g.fillStyle = '#c9915f';
  g.fillRect(x - 5, y + 11 * s, 4, 9 * s);
  g.fillRect(x + p.w + 1, y + 11 * s, 4, 9 * s);

  // head — skin tone
  g.fillStyle = '#c9915f';
  g.fillRect(x + 3, y, p.w - 6, 12);

  // dark brown hair — full head
  g.fillStyle = '#3b2a1a';
  g.fillRect(x + 2, y - 2, p.w - 4, 5);
  g.fillRect(x + 2, y - 1, 2.5, 7);
  g.fillRect(x + p.w - 4.5, y - 1, 2.5, 7);

  // full log beard — thick along the jaw, longer at the chin
  g.fillStyle = '#3b2a1a';
  g.fillRect(x + 2, y + 7, p.w - 4, 6);
  g.fillRect(x + 3, y + 11, p.w - 6, 4);
  // mustache
  g.fillStyle = '#2e2015';
  g.fillRect(x + 5, y + 7, p.w - 10, 2);

  // eyes — small, cheerful
  g.fillStyle = '#000';
  g.fillRect(x + 6, y + 5, 2, 2);
  g.fillRect(x + p.w - 8, y + 5, 2, 2);

  // cigarette (sutta) — always there, signature look
  const cx0 = p.face > 0 ? x + p.w - 3 : x + 1;
  g.fillStyle = '#eee';
  g.fillRect(p.face > 0 ? cx0 : cx0 - 6, y + 9, 6, 1.5);
  g.fillStyle = Math.floor(clock / 300) % 2 === 0 ? '#ff7020' : '#ffb020';
  g.fillRect(p.face > 0 ? cx0 + 6 : cx0 - 7.5, y + 9, 1.5, 1.5);
  g.fillStyle = 'rgba(200,200,200,0.35)';
  g.fillRect(p.face > 0 ? cx0 + 7 : cx0 - 9, y + 6 - ((clock / 50) % 6), 1.2, 4);

  // idle quirk: playing a mobile game, laughing
  if (p.gaming) {
    const px2 = x + p.w / 2 - 4, py2 = y + 15 * s;
    g.fillStyle = '#111';
    g.fillRect(px2, py2, 8, 12);
    g.fillStyle = Math.floor(clock / 220) % 2 === 0 ? '#5ec8ff' : '#8ee7ff';
    g.fillRect(px2 + 1, py2 + 1.5, 6, 9);

    const bxc = x + p.w / 2 + 26, byc = y - 22;
    g.fillStyle = 'rgba(255,255,255,0.95)';
    g.beginPath(); g.arc(x + p.w / 2 + 6, y - 6, 2.2, 0, 7); g.fill();
    g.beginPath(); g.arc(x + p.w / 2 + 12, y - 13, 3.0, 0, 7); g.fill();
    g.beginPath(); g.ellipse(bxc, byc, 34, 13, 0, 0, 7); g.fill();
    g.strokeStyle = 'rgba(0,0,0,0.35)'; g.lineWidth = 1.2;
    g.beginPath(); g.ellipse(bxc, byc, 34, 13, 0, 0, 7); g.stroke();
    g.fillStyle = '#3b2a1a';
    g.font = 'bold 12px "Trebuchet MS", sans-serif';
    g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText('HAHAHA 😂', bxc, byc + 0.5);
    g.textBaseline = 'alphabetic';
  }
}
