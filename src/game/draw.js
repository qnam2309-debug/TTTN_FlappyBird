// D:\STUDY\TAILIEUHOC_\TTTN\flappy-bird\src\game\draw.js
// Phụ trách vẽ Canvas 2D PIXEL ART (Phong cách Retro 8-bit nguyên bản)

import { BIRD_X, GAP, GROUND, H, PIPE_W, W } from './game.js';

// Bảng màu 2D Pixel Retro kinh điển
export const DEFAULT_COLORS = {
  skyTop: '#4ec0ca',
  skyBottom: '#4ec0ca',
  orb: '#fbfbe3',
  cloud: '#ffffff',
  hill: '#5ee270',
  pipe: '#73bf2e',
  pipeLight: '#9ce659',
  pipeDark: '#558022',
  ground: '#ded895',
  groundDark: '#d0c874',
  grass: '#75be2f',
  bird: '#f8e038',
  wing: '#ffffff',
  beak: '#f85820',
  eye: '#ffffff',
  outline: '#000000',
};

const COLOR_KEYS = Object.keys(DEFAULT_COLORS);

export function readColors(into = { ...DEFAULT_COLORS }) {
  if (typeof document === 'undefined') return into;
  const css = getComputedStyle(document.documentElement);
  for (const k of COLOR_KEYS) {
    const cssVarName = '--' + k.replace(/[A-Z]/g, (m) => '-' + m.toLowerCase());
    const val = css.getPropertyValue(cssVarName).trim();
    if (val) into[k] = val;
  }
  return into;
}

// Ma trận điểm ảnh chú chim Pixel (17 x 12 pixel)
// 0: Trong suốt, 1: Viền đen, 2: Màu thân chính, 3: Bụng/Màu sáng, 4: Mỏ cam, 5: Mắt trắng, 6: Cánh
const BIRD_PIXEL_MAP = [
  [0,0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0],
  [0,0,0,0,1,1,2,2,2,1,5,5,1,0,0,0,0],
  [0,0,0,1,2,2,2,2,1,5,5,1,5,1,0,0,0],
  [0,0,1,2,2,2,2,2,1,5,5,1,5,1,0,0,0],
  [0,1,2,2,2,2,2,2,2,1,5,5,5,1,0,0,0],
  [0,1,6,6,6,6,2,2,2,2,1,1,1,1,1,1,0],
  [1,6,6,6,6,6,6,2,2,1,4,4,4,4,4,1,0],
  [1,6,6,6,6,6,6,2,1,4,4,4,4,4,4,4,1],
  [1,2,6,6,6,6,2,2,1,4,4,1,1,1,1,1,0],
  [0,1,2,2,2,2,2,1,4,4,4,4,4,4,1,0,0],
  [0,0,1,1,3,3,3,1,4,4,4,4,1,1,0,0,0],
  [0,0,0,0,1,1,1,1,1,1,1,1,0,0,0,0,0],
];

export function draw(ctx, g, themeColors = DEFAULT_COLORS, activeSkin = null) {
  const k = ctx.canvas.width / W;
  ctx.setTransform(k, 0, 0, k, 0, 0);

  // Tắt làm mờ (anti-aliasing) để các khối pixel vuông vức sắc nét
  ctx.imageSmoothingEnabled = false;

  // 1. Nền Bầu trời xanh Pixel đặc trưng Flappy Bird
  ctx.fillStyle = '#4ec0ca';
  ctx.fillRect(0, 0, W, GROUND);

  // 2. Mây trắng chân trời Pixel
  ctx.fillStyle = '#ffffff';
  for (let cx = -(g.scroll * 0.2 % 120); cx < W + 120; cx += 120) {
    ctx.fillRect(cx, GROUND - 110, 60, 24);
    ctx.fillRect(cx + 8, GROUND - 124, 44, 14);
    ctx.fillRect(cx + 18, GROUND - 134, 24, 10);
  }

  // 3. Tòa nhà & Cây xanh hậu cảnh chân trời Pixel
  ctx.fillStyle = '#9fe8a4';
  ctx.fillRect(0, GROUND - 50, W, 50);
  ctx.fillStyle = '#7de084';
  for (let bx = -(g.scroll * 0.4 % 40); bx < W + 40; bx += 40) {
    ctx.fillRect(bx, GROUND - 65, 24, 15);
    ctx.fillRect(bx + 4, GROUND - 75, 16, 10);
  }

  // 4. Vẽ Cột Ống nước (Pipes) dạng 2D Pixel
  const drawPixelPipe = (x, y, len, isTop) => {
    if (len <= 0) return;
    const rimH = 26;
    const bodyLen = Math.max(0, len - rimH);

    // Thân ống nước
    const bodyY = isTop ? y : y + rimH;
    ctx.fillStyle = '#73bf2e'; // Xanh lá chính
    ctx.fillRect(x, bodyY, PIPE_W, bodyLen);

    // Vạch sáng pixel bên trái
    ctx.fillStyle = '#9ce659';
    ctx.fillRect(x + 3, bodyY, 6, bodyLen);
    ctx.fillRect(x + 11, bodyY, 3, bodyLen);

    // Vạch tối pixel bên phải
    ctx.fillStyle = '#558022';
    ctx.fillRect(x + PIPE_W - 8, bodyY, 5, bodyLen);

    // Viền đen Pixel quanh thân ống
    ctx.fillStyle = '#000000';
    ctx.fillRect(x, bodyY, 2, bodyLen);
    ctx.fillRect(x + PIPE_W - 2, bodyY, 2, bodyLen);

    // Vành miệng ống nước
    const rimY = isTop ? y + len - rimH : y;
    const rimX = x - 3;
    const rimW = PIPE_W + 6;

    ctx.fillStyle = '#73bf2e';
    ctx.fillRect(rimX, rimY, rimW, rimH);
    ctx.fillStyle = '#9ce659';
    ctx.fillRect(rimX + 4, rimY, 6, rimH);
    ctx.fillRect(rimX + 12, rimY, 3, rimH);
    ctx.fillStyle = '#558022';
    ctx.fillRect(rimX + rimW - 9, rimY, 6, rimH);

    // Viền đen vành miệng
    ctx.fillStyle = '#000000';
    ctx.strokeRect(rimX + 1, rimY + 1, rimW - 2, rimH - 2);
    ctx.fillRect(rimX, rimY, rimW, 2);
    ctx.fillRect(rimX, rimY + rimH - 2, rimW, 2);
    ctx.fillRect(rimX, rimY, 2, rimH);
    ctx.fillRect(rimX + rimW - 2, rimY, 2, rimH);
  };

  for (const p of g.pipes) {
    drawPixelPipe(p.x, 0, p.top, true);
    drawPixelPipe(p.x, p.top + GAP, GROUND - p.top - GAP, false);
  }

  // 5. Vẽ Mặt đất Pixel (Ground & Grass)
  ctx.fillStyle = '#ded895';
  ctx.fillRect(0, GROUND, W, H - GROUND);

  // Thảm cỏ xanh trên mặt đất
  ctx.fillStyle = '#75be2f';
  ctx.fillRect(0, GROUND, W, 14);
  ctx.fillStyle = '#558022';
  ctx.fillRect(0, GROUND + 14, W, 3);

  // Hoa văn sọc chéo pixel cuộn ngang
  ctx.fillStyle = '#b8944f';
  const groundOffset = (g.scroll * 1.0) % 20;
  for (let gx = -groundOffset; gx < W + 20; gx += 20) {
    ctx.fillRect(gx, GROUND + 20, 10, 4);
    ctx.fillRect(gx + 5, GROUND + 28, 10, 4);
    ctx.fillRect(gx, GROUND + 36, 10, 4);
  }

  // Viền đen ngăn cách mặt đất
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, GROUND, W, 2);

  // 6. Vẽ Chú chim 2D PIXEL ART
  ctx.save();
  ctx.translate(BIRD_X, g.y);

  // Xoay góc nghiêng pixel khi bay hoặc rơi
  const angle = Math.max(-0.4, Math.min(1.3, g.vy / 450));
  ctx.rotate(angle);

  const birdColor = activeSkin?.bird || themeColors.bird;
  const wingColor = activeSkin?.wing || '#ffffff';
  const beakColor = activeSkin?.beak || '#f85820';

  // Kích thước mỗi khối pixel phóng to (scale 2.2x)
  const px = 2.2;
  const offsetX = -(17 * px) / 2;
  const offsetY = -(12 * px) / 2;

  // Hiệu ứng cánh vỗ lên xuống dạng pixel
  const wingFrame = g.phase === 'dead' ? 0 : Math.floor((g.t * 12) % 3); // 0, 1, 2

  for (let r = 0; r < BIRD_PIXEL_MAP.length; r++) {
    for (let c = 0; c < BIRD_PIXEL_MAP[r].length; c++) {
      const type = BIRD_PIXEL_MAP[r][c];
      if (!type) continue;

      let cellColor = '#000000';
      if (type === 1) cellColor = '#000000';
      else if (type === 2) cellColor = birdColor;
      else if (type === 3) cellColor = '#fce490';
      else if (type === 4) cellColor = beakColor;
      else if (type === 5) cellColor = '#ffffff';
      else if (type === 6) {
        // Cánh chuyển vị trí theo khung hình vỗ
        cellColor = wingColor;
        let wingShift = wingFrame === 2 ? -1 : wingFrame === 0 ? 1 : 0;
        ctx.fillStyle = cellColor;
        ctx.fillRect(offsetX + c * px, offsetY + (r + wingShift) * px, px, px);
        continue;
      }

      ctx.fillStyle = cellColor;
      ctx.fillRect(offsetX + c * px, offsetY + r * px, px, px);
    }
  }

  ctx.restore();
}
