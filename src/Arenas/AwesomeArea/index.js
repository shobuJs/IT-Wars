// Awesome Area — modeled on the real one: a wall curtained in warm fairy
// lights, lowercase 3D "awesome" letters in red & black, colored acoustic
// baffles on the ceiling, string lights, a wooden floor, the blue TT table
// (endless rally included) and the coffee machine.
const WIDTH = 1200;
const FLOOR_Y = 470;
const FONT = '"Trebuchet MS", "Segoe UI", sans-serif';

// lowercase letters, alternating red/black like the real sign
function drawAwesomeSign(g, cx, cy, size) {
  const word = 'awesome';
  g.save();
  g.font = `900 ${size}px ${FONT}`;
  g.textAlign = 'left';
  const widths = [...word].map(ch => g.measureText(ch).width);
  const total = widths.reduce((a, b) => a + b, 0) + (word.length - 1) * 4;
  let x = cx - total / 2;
  [...word].forEach((ch, i) => {
    const red = i % 2 === 0;
    // 3D extrusion
    for (let d = 8; d >= 2; d -= 2) {
      g.fillStyle = red ? '#4a0808' : '#000';
      g.fillText(ch, x + d, cy + d);
    }
    const face = g.createLinearGradient(0, cy - size, 0, cy);
    if (red) { face.addColorStop(0, '#ff4838'); face.addColorStop(1, '#a80e0e'); }
    else { face.addColorStop(0, '#3c3c44'); face.addColorStop(1, '#101014'); }
    g.fillStyle = face;
    g.fillText(ch, x, cy);
    g.strokeStyle = 'rgba(0,0,0,0.6)';
    g.lineWidth = 1.5;
    g.strokeText(ch, x, cy);
    x += widths[i] + 4;
  });
  g.restore();
}

function drawCoffeeMachine(g, x, clock) {
  const y = FLOOR_Y;
  g.fillStyle = '#23262e'; g.fillRect(x, y - 130, 64, 130);
  g.fillStyle = '#2e323c'; g.fillRect(x + 4, y - 126, 56, 122);
  g.fillStyle = '#c81e1e'; g.fillRect(x, y - 130, 64, 12);
  g.fillStyle = '#ff5040'; g.fillRect(x, y - 130, 64, 3);
  g.fillStyle = '#0c1210'; g.fillRect(x + 10, y - 108, 44, 22);
  g.fillStyle = '#7ee787';
  g.font = `bold 9px ${FONT}`;
  g.textAlign = 'center';
  g.fillText(Math.floor(clock / 1600) % 2 ? 'BREWING…' : 'NO SLEEP', x + 32, y - 94);
  for (let i = 0; i < 3; i++) {
    g.fillStyle = i === Math.floor(clock / 700) % 3 ? '#ffd93d' : '#565c68';
    g.fillRect(x + 12 + i * 14, y - 78, 10, 6);
  }
  g.fillStyle = '#0e1014'; g.fillRect(x + 14, y - 64, 36, 34);
  g.fillStyle = '#f2ede4'; g.fillRect(x + 25, y - 44, 14, 14);
  g.fillStyle = '#6b4226'; g.fillRect(x + 27, y - 42, 10, 3);
  if (Math.floor(clock / 1600) % 2 === 0) {
    g.fillStyle = '#6b4226';
    g.fillRect(x + 30.5, y - 60, 3, 16 + Math.sin(clock / 90) * 2);
  }
  g.fillStyle = 'rgba(255,255,255,0.35)';
  for (let i = 0; i < 2; i++) {
    g.fillRect(x + 28 + i * 6, y - 52 - ((clock / 40 + i * 22) % 26), 2, 7);
  }
  g.fillStyle = '#16181e'; g.fillRect(x - 4, y - 6, 72, 6);
  g.fillStyle = '#f2ede4';
  g.font = `bold 8px ${FONT}`;
  g.fillText('FUEL', x + 32, y - 116);
}

function drawTTTable(g, x, clock) {
  const topY = FLOOR_Y - 52;
  const w = 190;
  // legs (dark, wheeled like the real one)
  g.fillStyle = '#2a2e36';
  g.fillRect(x + 16, topY + 8, 7, FLOOR_Y - topY - 12);
  g.fillRect(x + w - 23, topY + 8, 7, FLOOR_Y - topY - 12);
  g.fillStyle = '#16181e';
  g.beginPath(); g.arc(x + 19, FLOOR_Y - 4, 4, 0, 7); g.fill();
  g.beginPath(); g.arc(x + w - 19, FLOOR_Y - 4, 4, 0, 7); g.fill();
  // blue top
  g.fillStyle = '#155a9c'; g.fillRect(x, topY, w, 9);
  g.fillStyle = '#1e74c8'; g.fillRect(x, topY, w, 4);
  g.fillStyle = '#f2ede4';
  g.fillRect(x, topY, w, 1.5);
  g.fillRect(x, topY, 2, 9); g.fillRect(x + w - 2, topY, 2, 9);
  // net
  g.fillStyle = '#e8e4da'; g.fillRect(x + w / 2 - 1.5, topY - 13, 3, 13);
  g.fillStyle = 'rgba(232,228,218,0.4)'; g.fillRect(x + w / 2 - 5, topY - 13, 10, 2);
  // resting paddles
  g.fillStyle = '#c81e1e';
  g.beginPath(); g.ellipse(x + 18, topY - 4, 8, 6, -0.4, 0, 7); g.fill();
  g.fillStyle = '#16181e';
  g.beginPath(); g.ellipse(x + w - 18, topY - 4, 8, 6, 0.4, 0, 7); g.fill();
  g.fillStyle = '#7a5c36';
  g.fillRect(x + 12, topY - 2, 4, 8);
  g.fillRect(x + w - 16, topY - 2, 4, 8);
  // the endless rally
  const t = clock / 1000;
  const ph = (Math.sin(t * 1.6) + 1) / 2;
  const bx = x + 22 + ph * (w - 44);
  const by = topY - 14 - Math.abs(Math.sin(t * 5.2)) * 30;
  g.fillStyle = '#fff';
  g.beginPath(); g.arc(bx, by, 3.2, 0, 7); g.fill();
}

export default {
  id: 'awesome',
  name: 'AWESOME AREA',
  locked: false,
  width: WIDTH,
  floorY: FLOOR_Y,
  bounds: { left: 30, right: WIDTH - 30 },

  drawBackground(g, clock) {
    const t = clock / 1000;

    // warm wall, lit by the light curtain
    const wall = g.createLinearGradient(0, 0, 0, FLOOR_Y);
    wall.addColorStop(0, '#241d1a');
    wall.addColorStop(0.5, '#3a2f26');
    wall.addColorStop(1, '#4a3c2e');
    g.fillStyle = wall;
    g.fillRect(0, 0, WIDTH, FLOOR_Y);

    // daylight window wall on the right (like the real room)
    const winX = WIDTH - 240;
    g.fillStyle = '#8fb4cc';
    g.fillRect(winX, 60, 220, FLOOR_Y - 60);
    const day = g.createLinearGradient(winX, 0, WIDTH, 0);
    day.addColorStop(0, 'rgba(210,232,244,0.9)');
    day.addColorStop(1, 'rgba(240,250,255,0.95)');
    g.fillStyle = day;
    g.fillRect(winX, 60, 220, FLOOR_Y - 60);
    g.fillStyle = '#3a3f48';
    for (let i = 0; i <= 4; i++) g.fillRect(winX + i * 55, 60, 5, FLOOR_Y - 60);   // mullions
    for (let i = 0; i <= 3; i++) g.fillRect(winX, 60 + i * ((FLOOR_Y - 60) / 3), 220, 4);
    // daylight spill onto the wall
    g.fillStyle = 'rgba(220,240,250,0.06)';
    g.fillRect(winX - 90, 60, 90, FLOOR_Y - 60);

    // fairy-light curtain over the main wall (twinkling warm dots)
    for (let lx = 30; lx < winX - 60; lx += 26) {
      for (let ly = 78; ly < FLOOR_Y - 20; ly += 30) {
        const h = (lx * 13 + ly * 7) % 100;
        const tw = 0.35 + 0.65 * Math.abs(Math.sin(t * 1.4 + h));
        g.globalAlpha = tw * 0.9;
        g.fillStyle = '#ffd9a0';
        g.fillRect(lx + (h % 9) - 4, ly + (h % 13) - 6, 2.5, 2.5);
        g.globalAlpha = tw * 0.25;
        g.beginPath(); g.arc(lx + (h % 9) - 3, ly + (h % 13) - 5, 5, 0, 7); g.fill();
      }
    }
    g.globalAlpha = 1;

    // ceiling: colored acoustic baffles (yellow/orange left, red/navy middle, green right)
    const groups = [
      { from: 0, to: 260, cols: ['#c8901e', '#e0a428', '#a8701a'] },
      { from: 260, to: 760, cols: ['#8e1616', '#1e2a5e', '#28104a', '#701020'] },
      { from: 760, to: WIDTH, cols: ['#2e6e34', '#3f8f46', '#1e4a24'] },
    ];
    for (const grp of groups) {
      let i = 0;
      for (let bx = grp.from; bx < grp.to; bx += 34) {
        g.fillStyle = grp.cols[i++ % grp.cols.length];
        g.fillRect(bx, 0, 22, 42 + (i % 3) * 7);
      }
    }
    // string lights swagging under the ceiling
    g.fillStyle = '#ffe6b0';
    for (let sx = 0; sx < WIDTH; sx += 18) {
      const sag = Math.sin((sx / WIDTH) * Math.PI * 3) * 14;
      const tw = 0.5 + 0.5 * Math.sin(t * 2 + sx);
      g.globalAlpha = 0.5 + tw * 0.5;
      g.fillRect(sx, 58 + sag, 2, 2);
    }
    g.globalAlpha = 1;

    // the sign — lowercase awesome, red & black, 3D
    drawAwesomeSign(g, (winX - 30) / 2 + 30, 250, 96);

    // furniture
    drawCoffeeMachine(g, 60, clock);
    drawTTTable(g, WIDTH / 2 + 60, clock);

    // glossy wooden plank floor
    const floor = g.createLinearGradient(0, FLOOR_Y, 0, 540);
    floor.addColorStop(0, '#4a3220');
    floor.addColorStop(1, '#241708');
    g.fillStyle = floor;
    g.fillRect(0, FLOOR_Y, WIDTH, 540 - FLOOR_Y);
    // planks
    g.strokeStyle = 'rgba(0,0,0,0.35)';
    g.lineWidth = 1;
    for (let py = FLOOR_Y + 8; py < 540; py += 16) {
      g.beginPath(); g.moveTo(0, py); g.lineTo(WIDTH, py); g.stroke();
    }
    for (let px = 0; px < WIDTH + 100; px += 130) {
      for (let row = 0; row < 5; row++) {
        const off = (row % 2) * 65;
        g.beginPath();
        g.moveTo(px - off, FLOOR_Y + 8 + row * 16);
        g.lineTo(px - off, FLOOR_Y + 8 + row * 16 + 16);
        g.stroke();
      }
    }
    // fairy-light reflection on the gloss
    g.fillStyle = 'rgba(255,217,160,0.08)';
    g.fillRect(0, FLOOR_Y, winX - 60, 14);
    g.fillStyle = 'rgba(220,240,250,0.10)';
    g.fillRect(winX - 40, FLOOR_Y, 260, 18);
  },

  drawForeground(g, clock) {},
};
