// Office Arena — night office: window skyline, desks, monitors, carpet.
// Drawn in world coordinates (arena is wider than the viewport; the match
// camera translates). floorY is the fighters' feet line.
const WIDTH = 1200;
const FLOOR_Y = 470;

export default {
  id: 'office',
  name: 'OFFICE ARENA',
  locked: false,
  width: WIDTH,
  floorY: FLOOR_Y,
  bounds: { left: 30, right: WIDTH - 30 },

  drawBackground(g, clock) {
    // back wall
    const wall = g.createLinearGradient(0, 0, 0, FLOOR_Y);
    wall.addColorStop(0, '#141824');
    wall.addColorStop(1, '#1f2433');
    g.fillStyle = wall;
    g.fillRect(0, 0, WIDTH, FLOOR_Y);

    // windows with night skyline
    for (let wx = 60; wx < WIDTH - 100; wx += 260) {
      g.fillStyle = '#0a1020';
      g.fillRect(wx, 60, 180, 200);
      // skyline blocks
      for (let i = 0; i < 5; i++) {
        const bh = 40 + ((wx + i * 37) % 90);
        g.fillStyle = '#101a30';
        g.fillRect(wx + 8 + i * 34, 260 - bh, 28, bh);
        // lit windows flicker
        g.fillStyle = (Math.floor(clock / 900) + i + wx) % 3 === 0 ? '#ffd97a' : '#3a4a6a';
        g.fillRect(wx + 12 + i * 34, 260 - bh + 8, 5, 5);
        g.fillRect(wx + 24 + i * 34, 260 - bh + 24, 5, 5);
      }
      // moon in the first window
      if (wx === 60) {
        g.fillStyle = '#f4ecd8';
        g.beginPath(); g.arc(wx + 140, 100, 16, 0, 7); g.fill();
        g.fillStyle = '#0a1020';
        g.beginPath(); g.arc(wx + 148, 96, 14, 0, 7); g.fill();
      }
      // frame
      g.strokeStyle = '#3a4152'; g.lineWidth = 6;
      g.strokeRect(wx, 60, 180, 200);
      g.beginPath();
      g.moveTo(wx + 90, 60); g.lineTo(wx + 90, 260);
      g.moveTo(wx, 160); g.lineTo(wx + 180, 160);
      g.stroke();
    }

    // motivational poster, slightly crooked
    g.save();
    g.translate(WIDTH / 2 + 160, 120);
    g.rotate(0.04);
    g.fillStyle = '#e8ddd0'; g.fillRect(-45, -30, 90, 60);
    g.fillStyle = '#2a3a4a'; g.fillRect(-38, -22, 76, 30);
    g.fillStyle = '#7a3040';
    g.font = 'bold 9px "Trebuchet MS", sans-serif';
    g.textAlign = 'center';
    g.fillText('SYNERGY', 0, 20);
    g.restore();

    // background desks with monitors
    for (let dx = 140; dx < WIDTH - 160; dx += 300) {
      g.fillStyle = '#3a3226';                       // desk top
      g.fillRect(dx, FLOOR_Y - 96, 150, 8);
      g.fillStyle = '#2c2620';                       // legs
      g.fillRect(dx + 6, FLOOR_Y - 88, 8, 88);
      g.fillRect(dx + 136, FLOOR_Y - 88, 8, 88);
      // monitor (screen glow cycles — someone left a build running)
      g.fillStyle = '#111';
      g.fillRect(dx + 40, FLOOR_Y - 140, 64, 42);
      const on = Math.floor(clock / 1400 + dx) % 4 !== 0;
      g.fillStyle = on ? '#123a2a' : '#0a0a0a';
      g.fillRect(dx + 44, FLOOR_Y - 136, 56, 34);
      if (on) {
        g.fillStyle = '#7ee787';
        for (let l = 0; l < 3; l++) g.fillRect(dx + 48, FLOOR_Y - 130 + l * 8, 20 + ((dx + l * 13) % 26), 2);
      }
      g.fillStyle = '#222';
      g.fillRect(dx + 66, FLOOR_Y - 98, 12, 6);
      // office chair
      g.fillStyle = '#20242e';
      g.fillRect(dx + 180, FLOOR_Y - 70, 34, 8);
      g.fillRect(dx + 184, FLOOR_Y - 62, 6, 40);
      g.fillRect(dx + 176, FLOOR_Y - 24, 44, 5);
      g.fillRect(dx + 206, FLOOR_Y - 108, 8, 46);
      g.fillRect(dx + 188, FLOOR_Y - 110, 26, 44);
    }

    // water cooler
    g.fillStyle = '#cfe4f4'; g.fillRect(WIDTH - 120, FLOOR_Y - 120, 30, 44);
    g.fillStyle = '#e8f4fc'; g.fillRect(WIDTH - 116, FLOOR_Y - 116, 22, 20);
    g.fillStyle = '#8a949c'; g.fillRect(WIDTH - 124, FLOOR_Y - 76, 38, 76);

    // floor — worn office carpet
    const carpet = g.createLinearGradient(0, FLOOR_Y, 0, 540);
    carpet.addColorStop(0, '#3a3348');
    carpet.addColorStop(1, '#241f2e');
    g.fillStyle = carpet;
    g.fillRect(0, FLOOR_Y, WIDTH, 540 - FLOOR_Y);
    // carpet tile seams
    g.strokeStyle = 'rgba(0,0,0,0.25)';
    g.lineWidth = 1;
    for (let fx = 0; fx < WIDTH; fx += 60) {
      g.beginPath(); g.moveTo(fx, FLOOR_Y); g.lineTo(fx - 30, 540); g.stroke();
    }
    g.fillStyle = 'rgba(255,255,255,0.05)';
    g.fillRect(0, FLOOR_Y, WIDTH, 3);
  },

  drawForeground(g, clock) {},
};
