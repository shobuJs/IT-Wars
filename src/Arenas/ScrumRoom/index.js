// Scrum Room — white-walled meeting room: a big wall screen running the
// "dhanya" kanban app, a brown-bordered whiteboard scribbled in blue, a long
// white conference table ringed by black chairs, one laptop and a few
// notebooks laid out separately on top.
const WIDTH = 1200;
const FLOOR_Y = 470;
const FONT = '"Trebuchet MS", "Segoe UI", sans-serif';

// the dhanya kanban board on the wall screen
function drawDhanyaScreen(g, x, y, clock) {
  const w = 360, h = 210;
  // bezel + wall mount
  g.fillStyle = '#14161c'; g.fillRect(x - 10, y - 10, w + 20, h + 20);
  g.fillStyle = '#2a2e38'; g.fillRect(x + w / 2 - 30, y + h + 10, 60, 8);
  // app chrome
  g.fillStyle = '#10141c'; g.fillRect(x, y, w, h);
  g.fillStyle = '#1b2130'; g.fillRect(x, y, w, 26);
  g.fillStyle = '#5b8def';
  g.beginPath(); g.arc(x + 15, y + 13, 6, 0, 7); g.fill();
  g.fillStyle = '#eef2f8';
  g.font = `bold 13px ${FONT}`;
  g.textAlign = 'left';
  g.fillText('dhanya', x + 28, y + 18);
  g.fillStyle = '#8a93a6';
  g.font = `10px ${FONT}`;
  g.fillText('▸ SPRINT BOARD', x + 82, y + 17);
  // live sync dot
  g.fillStyle = Math.floor(clock / 700) % 2 ? '#46d17a' : '#1f5a38';
  g.beginPath(); g.arc(x + w - 16, y + 13, 4, 0, 7); g.fill();

  // three kanban columns
  const cols = [
    { title: 'TO DO', tint: '#8a93a6', cards: ['#e2574c', '#e0a428', '#5b8def'] },
    { title: 'IN PROGRESS', tint: '#e0a428', cards: ['#5b8def', '#b06fd8'] },
    { title: 'DONE', tint: '#46d17a', cards: ['#46d17a', '#46d17a', '#8a93a6'] },
  ];
  const colW = 108, pad = 9;
  cols.forEach((col, ci) => {
    const cx = x + pad + ci * (colW + pad);
    g.fillStyle = '#171c28'; g.fillRect(cx, y + 34, colW, h - 44);
    g.fillStyle = col.tint;
    g.font = `bold 9px ${FONT}`;
    g.fillText(col.title, cx + 8, y + 48);
    col.cards.forEach((tint, i) => {
      const cy = y + 56 + i * 36;
      // one ticket blinks as "being dragged" — the standup never ends
      const hot = ci === 1 && i === 0 && Math.floor(clock / 500) % 2 === 0;
      g.fillStyle = hot ? '#2c3550' : '#222938';
      g.fillRect(cx + 6, cy, colW - 12, 28);
      g.fillStyle = tint; g.fillRect(cx + 6, cy, 4, 28);
      g.fillStyle = '#77809a';
      g.fillRect(cx + 15, cy + 8, colW - 34, 3);
      g.fillRect(cx + 15, cy + 16, colW - 52, 3);
    });
  });
}

// whiteboard: brown border, blue marker scrawl
function drawWhiteboard(g, x, y, clock) {
  const w = 270, h = 170;
  g.fillStyle = '#8a5a33'; g.fillRect(x - 9, y - 9, w + 18, h + 18);   // brown frame
  g.fillStyle = '#6e4526'; g.fillRect(x - 9, y + h + 3, w + 18, 6);
  g.fillStyle = '#f6f7f4'; g.fillRect(x, y, w, h);
  g.save();
  g.translate(x + 14, y);
  g.rotate(-0.012);                                                     // marker never writes straight
  g.fillStyle = '#1b4fd8';
  g.textAlign = 'left';
  g.font = `bold 17px ${FONT}`;
  g.fillText('SPRINT 42', 4, 30);
  g.fillRect(2, 36, 92, 2);
  g.font = `bold 12px ${FONT}`;
  g.fillText('• fix login bug', 6, 60);
  g.fillText('• ship IT WARS', 6, 80);
  g.fillText('• no meetings!!', 6, 100);
  // "no meetings" got struck through, obviously
  g.fillRect(4, 95, 104, 2);
  // burndown chart that only goes up
  g.strokeStyle = '#1b4fd8'; g.lineWidth = 2;
  g.strokeRect(140, 48, 100, 70);
  g.beginPath();
  g.moveTo(148, 108);
  g.lineTo(178, 92); g.lineTo(198, 98); g.lineTo(232, 58);
  g.stroke();
  g.font = `bold 10px ${FONT}`;
  g.fillText('burndown?', 148, 132);
  g.restore();
  // marker tray
  g.fillStyle = '#6e4526'; g.fillRect(x + 40, y + h + 9, w - 80, 5);
  g.fillStyle = '#1b4fd8'; g.fillRect(x + 70, y + h + 5, 34, 5);
  g.fillStyle = '#c0392b'; g.fillRect(x + 130, y + h + 5, 34, 5);
}

// black office chair, side profile; face = ±1
function drawChair(g, x, face) {
  const y = FLOOR_Y;
  g.fillStyle = '#16181c';
  g.fillRect(x - 4 * face, y - 118, 10, 66);                            // backrest
  g.fillRect(x - 4 * face, y - 122, 14 * face, 8);                      // headrest
  g.fillRect(x - 20, y - 56, 44, 9);                                    // seat
  g.fillStyle = '#0e1013';
  g.fillRect(x - 2, y - 47, 6, 33);                                     // stem
  g.fillRect(x - 22, y - 14, 46, 5);                                    // base
  g.beginPath(); g.arc(x - 18, y - 6, 5, 0, 7); g.fill();               // wheels
  g.beginPath(); g.arc(x + 20, y - 6, 5, 0, 7); g.fill();
}

// open laptop sitting on the table
function drawLaptop(g, x, topY, clock) {
  g.fillStyle = '#2a2e38'; g.fillRect(x, topY - 34, 46, 30);            // lid
  g.fillStyle = '#0e1420'; g.fillRect(x + 3, topY - 31, 40, 24);        // screen
  g.fillStyle = '#7ee787';                                              // someone's "working"
  const lines = 1 + Math.floor(clock / 800) % 3;
  for (let l = 0; l < lines; l++) g.fillRect(x + 6, topY - 27 + l * 7, 12 + ((l * 17 + Math.floor(clock / 800) * 7) % 20), 2);
  g.fillStyle = '#3a3f4a'; g.fillRect(x - 3, topY - 4, 52, 4);          // keyboard deck
}

// closed notebook lying flat — cover color + white page edge
function drawNotebook(g, x, topY, w, cover) {
  g.fillStyle = '#e8e6df'; g.fillRect(x, topY - 3, w, 3);               // pages
  g.fillStyle = cover; g.fillRect(x, topY - 7, w, 4);                   // cover
  g.fillStyle = 'rgba(0,0,0,0.25)'; g.fillRect(x, topY - 7, 4, 4);      // spine
}

export default {
  id: 'scrum-room',
  name: 'SCRUM ROOM',
  locked: false,
  width: WIDTH,
  floorY: FLOOR_Y,
  bounds: { left: 30, right: WIDTH - 30 },

  drawBackground(g, clock) {
    // white walls
    const wall = g.createLinearGradient(0, 0, 0, FLOOR_Y);
    wall.addColorStop(0, '#f2f3f5');
    wall.addColorStop(1, '#dcdfe4');
    g.fillStyle = wall;
    g.fillRect(0, 0, WIDTH, FLOOR_Y);
    // ceiling strip + recessed lights
    g.fillStyle = '#e6e8eb'; g.fillRect(0, 0, WIDTH, 26);
    g.fillStyle = '#c9ccd2'; g.fillRect(0, 24, WIDTH, 3);
    for (let lx = 90; lx < WIDTH; lx += 220) {
      g.fillStyle = '#fffbe8'; g.fillRect(lx, 8, 70, 10);
      g.fillStyle = 'rgba(255,250,220,0.10)';
      g.beginPath(); g.moveTo(lx, 18); g.lineTo(lx - 30, 130); g.lineTo(lx + 100, 130); g.lineTo(lx + 70, 18); g.fill();
    }
    // wall panel seams — keeps the white from reading flat
    g.strokeStyle = 'rgba(0,0,0,0.05)'; g.lineWidth = 2;
    for (let px = 150; px < WIDTH; px += 300) {
      g.beginPath(); g.moveTo(px, 30); g.lineTo(px, FLOOR_Y - 8); g.stroke();
    }
    // baseboard
    g.fillStyle = '#b9bdc4'; g.fillRect(0, FLOOR_Y - 10, WIDTH, 10);

    // glass door, far left
    g.fillStyle = '#9aa2ac'; g.fillRect(38, 120, 92, FLOOR_Y - 130);
    g.fillStyle = 'rgba(200,224,238,0.55)'; g.fillRect(44, 126, 80, FLOOR_Y - 142);
    g.fillStyle = '#5a6068'; g.fillRect(112, 270, 8, 26);               // handle
    g.fillStyle = '#7d858f';
    g.font = `bold 10px ${FONT}`; g.textAlign = 'center';
    g.fillText('SCRUM ROOM', 84, 148);

    // the dhanya screen and the whiteboard, both in the camera's sweet spot
    drawDhanyaScreen(g, 250, 62, clock);
    drawWhiteboard(g, 690, 82, clock);

    // wall clock — the standup is always running long
    const cx = 1050, cy = 120;
    g.fillStyle = '#fff'; g.beginPath(); g.arc(cx, cy, 24, 0, 7); g.fill();
    g.strokeStyle = '#3a3f4a'; g.lineWidth = 4; g.stroke();
    g.strokeStyle = '#16181c'; g.lineWidth = 2.5;
    const mins = clock / 20000;
    g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + Math.sin(mins) * 11, cy - Math.cos(mins) * 11); g.stroke();
    g.lineWidth = 1.5;
    const sec = clock / 1000;
    g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + Math.sin(sec) * 17, cy - Math.cos(sec) * 17); g.stroke();

    // potted plant, far right
    g.fillStyle = '#2e6e34';
    g.beginPath(); g.arc(1140, FLOOR_Y - 96, 26, 0, 7); g.fill();
    g.beginPath(); g.arc(1120, FLOOR_Y - 76, 18, 0, 7); g.fill();
    g.beginPath(); g.arc(1158, FLOOR_Y - 74, 16, 0, 7); g.fill();
    g.fillStyle = '#a8552e'; g.fillRect(1122, FLOOR_Y - 58, 36, 34);
    g.fillStyle = '#8a4425'; g.fillRect(1118, FLOOR_Y - 58, 44, 7);

    // chairs behind the table (backrests peek over the top)
    const tableX = 330, tableW = 540, tableTop = FLOOR_Y - 108;
    for (const bx of [430, 600, 770]) {
      g.fillStyle = '#16181c';
      g.fillRect(bx, tableTop - 52, 44, 52);
      g.fillRect(bx + 6, tableTop - 60, 32, 10);
    }
    // end chairs in full profile
    drawChair(g, tableX - 42, 1);
    drawChair(g, tableX + tableW + 42, -1);

    // the long white table
    g.fillStyle = 'rgba(0,0,0,0.12)';
    g.fillRect(tableX + 14, FLOOR_Y - 4, tableW - 28, 8);               // floor shadow
    g.fillStyle = '#16181c';                                            // black legs
    g.fillRect(tableX + 26, tableTop + 12, 13, FLOOR_Y - tableTop - 12);
    g.fillRect(tableX + tableW - 39, tableTop + 12, 13, FLOOR_Y - tableTop - 12);
    g.fillRect(tableX + tableW / 2 - 7, tableTop + 12, 13, FLOOR_Y - tableTop - 12);
    const top = g.createLinearGradient(0, tableTop, 0, tableTop + 14);
    top.addColorStop(0, '#fbfcfd');
    top.addColorStop(1, '#d8dce1');
    g.fillStyle = top;
    g.fillRect(tableX, tableTop, tableW, 14);
    g.fillStyle = '#fff'; g.fillRect(tableX, tableTop, tableW, 2.5);

    // on the table: one laptop, notebooks kept apart — nothing stacked
    drawLaptop(g, 400, tableTop, clock);
    drawNotebook(g, 520, tableTop, 40, '#1b4fd8');
    drawNotebook(g, 610, tableTop, 34, '#c0392b');
    drawNotebook(g, 700, tableTop, 38, '#2e6e34');
    g.fillStyle = '#1b4fd8'; g.fillRect(770, tableTop - 3, 26, 3);      // stray marker

    // light office carpet
    const carpet = g.createLinearGradient(0, FLOOR_Y, 0, 540);
    carpet.addColorStop(0, '#c3c7cd');
    carpet.addColorStop(1, '#9ba0a8');
    g.fillStyle = carpet;
    g.fillRect(0, FLOOR_Y, WIDTH, 540 - FLOOR_Y);
    g.strokeStyle = 'rgba(0,0,0,0.10)';
    g.lineWidth = 1;
    for (let fx = 0; fx < WIDTH + 40; fx += 60) {
      g.beginPath(); g.moveTo(fx, FLOOR_Y); g.lineTo(fx - 30, 540); g.stroke();
    }
    g.fillStyle = 'rgba(255,255,255,0.25)';
    g.fillRect(0, FLOOR_Y, WIDTH, 3);
  },

  drawForeground(g, clock) {},
};
