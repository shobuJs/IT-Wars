// Canvas UI helpers shared by all menu screens — dark blood-arcade theme
// carried over from the legacy character-select look.
import { DESIGN_W, DESIGN_H, FONT, COLORS } from '../Shared/constants.js';

// Deterministic ember field (no Math.random at draw time → stable per frame)
const EMBERS = [];
for (let i = 0; i < 40; i++) {
  EMBERS.push({
    x: (i * 137.5) % DESIGN_W,
    speed: 12 + (i * 7) % 26,
    drift: ((i * 53) % 40) - 20,
    size: 1 + (i % 3),
    hue: (i % 2) ? '#ff6b3d' : '#ffd93d',
  });
}

export function drawBackdrop(g, clock) {
  const grad = g.createLinearGradient(0, 0, 0, DESIGN_H);
  grad.addColorStop(0, '#0b0508');
  grad.addColorStop(0.6, COLORS.bg);
  grad.addColorStop(1, '#22090c');
  g.fillStyle = grad;
  g.fillRect(0, 0, DESIGN_W, DESIGN_H);
  // faint scanlines
  g.fillStyle = 'rgba(0,0,0,0.18)';
  for (let y = 0; y < DESIGN_H; y += 4) g.fillRect(0, y, DESIGN_W, 1);
  // rising embers
  const t = clock / 1000;
  for (const e of EMBERS) {
    const y = DESIGN_H + 20 - ((t * e.speed + e.x * 3) % (DESIGN_H + 40));
    const x = e.x + Math.sin(t * 0.7 + e.x) * e.drift * 0.3;
    g.globalAlpha = 0.25 + 0.3 * Math.sin(t * 2 + e.x);
    g.fillStyle = e.hue;
    g.fillRect(x, y, e.size, e.size);
  }
  g.globalAlpha = 1;
}

export function drawTitle(g, text, y, size = 52, color = COLORS.bloodBright) {
  g.save();
  g.textAlign = 'center';
  g.font = `900 ${size}px ${FONT}`;
  g.fillStyle = '#000';
  g.fillText(text, DESIGN_W / 2 + 4, y + 4);
  g.fillStyle = color;
  g.fillText(text, DESIGN_W / 2, y);
  g.restore();
}

export function drawSubtitle(g, text, y, size = 16, color = COLORS.dim) {
  g.save();
  g.textAlign = 'center';
  g.font = `${size}px ${FONT}`;
  g.fillStyle = color;
  g.fillText(text, DESIGN_W / 2, y);
  g.restore();
}

export function drawPanel(g, r, { selected = false, disabled = false, accent = COLORS.bloodBright } = {}) {
  g.save();
  g.fillStyle = disabled ? '#0f0d0d' : COLORS.panel;
  g.fillRect(r.x, r.y, r.w, r.h);
  g.lineWidth = selected ? 3 : 2;
  g.strokeStyle = disabled ? COLORS.locked : (selected ? accent : COLORS.panelEdge);
  g.strokeRect(r.x + 0.5, r.y + 0.5, r.w - 1, r.h - 1);
  if (selected && !disabled) {
    g.globalAlpha = 0.10;
    g.fillStyle = accent;
    g.fillRect(r.x, r.y, r.w, r.h);
  }
  g.restore();
}

export function drawLabel(g, text, x, y, { size = 18, color = COLORS.text, align = 'center', weight = 'bold' } = {}) {
  g.save();
  g.textAlign = align;
  g.font = `${weight} ${size}px ${FONT}`;
  g.fillStyle = color;
  g.fillText(text, x, y);
  g.restore();
}

export function drawBadge(g, text, cx, cy, color = COLORS.gold) {
  g.save();
  g.font = `bold 12px ${FONT}`;
  const w = g.measureText(text).width + 16;
  g.fillStyle = 'rgba(0,0,0,0.7)';
  g.fillRect(cx - w / 2, cy - 11, w, 20);
  g.strokeStyle = color;
  g.lineWidth = 1;
  g.strokeRect(cx - w / 2 + 0.5, cy - 10.5, w - 1, 19);
  g.fillStyle = color;
  g.textAlign = 'center';
  g.fillText(text, cx, cy + 4);
  g.restore();
}

export function drawFooterHint(g, text) {
  drawSubtitle(g, text, DESIGN_H - 16, 13, 'rgba(242,233,228,0.45)');
}
