// Match HUD: mirrored health/rage bars, round pips, center timer.
import { DESIGN_W, FONT, COLORS } from '../Shared/constants.js';

const BAR_W = 330, BAR_H = 22;

function drawSide(g, s, wins, mirrored) {
  const x = mirrored ? DESIGN_W - 24 - BAR_W : 24;
  const y = 22;

  // name
  g.font = `900 16px ${FONT}`;
  g.textAlign = mirrored ? 'right' : 'left';
  g.fillStyle = '#000';
  g.fillText(s.name, (mirrored ? x + BAR_W : x) + 1, y - 4);
  g.fillStyle = s.accent;
  g.fillText(s.name, mirrored ? x + BAR_W : x, y - 5);

  // health bar frame
  g.fillStyle = 'rgba(0,0,0,0.65)';
  g.fillRect(x - 3, y - 3, BAR_W + 6, BAR_H + 6);
  g.fillStyle = '#3a0d0d';
  g.fillRect(x, y, BAR_W, BAR_H);
  // health fill (drains toward center)
  const frac = Math.max(0, s.hp / s.maxHp);
  const fw = BAR_W * frac;
  const grad = g.createLinearGradient(x, y, x, y + BAR_H);
  grad.addColorStop(0, frac > 0.35 ? '#ff5040' : '#ffd040');
  grad.addColorStop(1, frac > 0.35 ? '#a40000' : '#c07800');
  g.fillStyle = grad;
  g.fillRect(mirrored ? x + BAR_W - fw : x, y, fw, BAR_H);
  g.fillStyle = 'rgba(255,255,255,0.25)';
  g.fillRect(mirrored ? x + BAR_W - fw : x, y, fw, 4);

  // rage bar
  const ry = y + BAR_H + 6;
  g.fillStyle = 'rgba(0,0,0,0.65)';
  g.fillRect(x - 3, ry - 2, BAR_W * 0.72 + 6, 12);
  g.fillStyle = '#3a3010';
  g.fillRect(mirrored ? x + BAR_W - BAR_W * 0.72 : x, ry, BAR_W * 0.72, 8);
  const rfrac = s.rage / 100;
  const rw = BAR_W * 0.72 * rfrac;
  const full = s.rage >= 100;
  g.fillStyle = full ? (Math.floor(Date.now() / 150) % 2 ? '#ffe680' : '#ffd93d') : '#c9a227';
  g.fillRect(mirrored ? x + BAR_W - rw : x, ry, rw, 8);
  if (full) {
    g.font = `900 11px ${FONT}`;
    g.fillStyle = '#ffe680';
    g.fillText('RAGE READY — P', mirrored ? x + BAR_W - BAR_W * 0.72 - 8 : x + BAR_W * 0.72 + 8, ry + 8);
    g.textAlign = mirrored ? 'right' : 'left';
  }

  // special cooldown chip
  const cy = ry + 20;
  const cdFrac = s.specialCd > 0 ? 1 - s.specialCd / s.specialMax : 1;
  g.font = `14px ${FONT}`;
  g.globalAlpha = 0.35 + 0.65 * cdFrac;
  g.fillText(`${s.specialIcon} ${s.specialCd > 0 ? s.specialCd.toFixed(1) : 'READY'}`, mirrored ? x + BAR_W : x, cy + 8);
  g.globalAlpha = 1;

  // round-win pips
  for (let i = 0; i < 2; i++) {
    const px = mirrored ? x + BAR_W - 10 - i * 22 : x + 10 + i * 22;
    g.beginPath();
    g.arc(px, cy + 26, 7, 0, 7);
    g.fillStyle = i < wins ? s.accent : 'rgba(255,255,255,0.15)';
    g.fill();
    g.strokeStyle = 'rgba(0,0,0,0.6)';
    g.lineWidth = 2;
    g.stroke();
  }

  // combo counter
  if (s.combo >= 2) {
    g.font = `900 22px ${FONT}`;
    g.fillStyle = '#000';
    g.fillText(`${s.combo} HITS! ${Math.round(s.comboDmg)} DMG`, (mirrored ? x + BAR_W : x) + 2, y + 92 + 2);
    g.fillStyle = COLORS.gold;
    g.fillText(`${s.combo} HITS! ${Math.round(s.comboDmg)} DMG`, mirrored ? x + BAR_W : x, y + 92);
  }
}

export function drawHud(g, snap, winsLeft, winsRight, timer, round) {
  drawSide(g, snap.left, winsLeft, false);
  drawSide(g, snap.right, winsRight, true);

  // center timer
  const t = Math.max(0, Math.ceil(timer));
  g.textAlign = 'center';
  g.font = `900 40px ${FONT}`;
  g.fillStyle = '#000';
  g.fillText(String(t), DESIGN_W / 2 + 2, 56 + 2);
  g.fillStyle = t <= 10 && Math.floor(Date.now() / 300) % 2 ? '#ff3030' : '#f2e9e4';
  g.fillText(String(t), DESIGN_W / 2, 56);
  g.font = `bold 12px ${FONT}`;
  g.fillStyle = COLORS.dim;
  g.fillText(`ROUND ${round}`, DESIGN_W / 2, 74);
}
