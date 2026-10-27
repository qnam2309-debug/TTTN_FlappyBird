// D:\STUDY\TAILIEUHOC_\TTTN\flappy-bird\src\game\draw.js
// Phụ trách vẽ Canvas 2D PIXEL ART (Phong cách Retro 8-bit nguyên bản)
// Hỗ trợ đổi 4 mùa Xuân - Hạ - Thu - Đông tự động theo điểm số (mỗi 10 điểm)

import { BIRD_X, GAP, GROUND, H, PIPE_W, W } from './game.js';

// Cấu hình bảng màu và đặc trưng 4 MÙA:
// 0 - 9đ: Mùa Xuân (Xanh tươi mát, hoa đào hồng bay nhẹ)
// 10 - 19đ: Mùa Hạ (Nắng vàng rực rỡ, trời xanh thẳm, cây xanh đậm)
// 20 - 29đ: Mùa Thu (Trời hoàng hôn cam ấm, lá vàng rơi, đồi cỏ úa vàng)
// 30 - 39đ: Mùa Đông (Tuyết phủ trắng trời, đồi tuyết lạnh, tuyết rơi)
// 40 - 49đ: Giao mùa cuối đông sang xuân
// Từ 50đ: Quay vòng tuần hoàn lại Mùa Xuân (điểm / 10 % 4)

export const SEASONS = [
  {
    name: 'Xuân',
    sky: '#4ec0ca',
    cloud: '#ffffff',
    hillBack: '#9fe8a4',
    hillFront: '#7de084',
    pipe: '#73bf2e',
    pipeLight: '#9ce659',
    pipeDark: '#558022',
    ground: '#ded895',
    grass: '#75be2f',
    grassDark: '#558022',
    groundStripe: '#b8944f',
    particleColor: '#ffb7c5', // Cánh hoa đào bay
    particleType: 'petal',
  },
  {
    name: 'Hạ',
    sky: '#2ba8e0', // Trời hè xanh đậm
    cloud: '#f5fbff',
    hillBack: '#48c774',
    hillFront: '#23a55a',
    pipe: '#2e9e44',
    pipeLight: '#5edb78',
    pipeDark: '#1c6e2d',
    ground: '#e2cf86',
    grass: '#3bb54a',
    grassDark: '#1e7e2c',
    groundStripe: '#b59a43',
    particleColor: '#fff9a6', // Đốm nắng lấp lánh
    particleType: 'sunshine',
  },
  {
    name: 'Thu',
    sky: '#e8894e', // Hoàng hôn mùa thu cam ấm
    cloud: '#fce3cf',
    hillBack: '#d9822b',
    hillFront: '#bf6319',
    pipe: '#c97726',
    pipeLight: '#f5a65b',
    pipeDark: '#8a480f',
    ground: '#d4aa70',
    grass: '#c27d27',
    grassDark: '#8a4e0f',
    groundStripe: '#9e7039',
    particleColor: '#e05318', // Lá phong đỏ rơi
    particleType: 'leaf',
  },
  {
    name: 'Đông',
    sky: '#6d8ba6', // Bầu trời đông lạnh giá
    cloud: '#e6f0fa',
    hillBack: '#c4d8e2',
    hillFront: '#e5f2f7', // Đồi phủ tuyết
    pipe: '#5396ad',
    pipeLight: '#9fd6e6',
    pipeDark: '#2e5f73',
    ground: '#cfdce6', // Mặt đất đóng tuyết
    grass: '#ffffff', // Cỏ phủ đầy tuyết trắng
    grassDark: '#9bb8cc',
    groundStripe: '#8da6b8',
    particleColor: '#ffffff', // Bông tuyết trắng rơi
    particleType: 'snow',
  },
];

export const DEFAULT_COLORS = {
  bird: '#f8e038',
  wing: '#ffffff',
  beak: '#f85820',
  outline: '#000000',
};

// Ma trận điểm ảnh chú chim Pixel (17 x 12 pixel)
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

export function readColors(into = { ...DEFAULT_COLORS }) {
  return into;
}

export function draw(ctx, g, themeColors = DEFAULT_COLORS, activeSkin = null) {
  const k = ctx.canvas.width / W;
  ctx.setTransform(k, 0, 0, k, 0, 0);
  ctx.imageSmoothingEnabled = false;

  // Tính toán mùa dựa trên điểm: Mỗi 10 điểm đổi 1 mùa, chu kỳ 4 mùa (Xuân - Hạ - Thu - Đông)
  // 0-9đ: Xuân (0), 10-19đ: Hạ (1), 20-29đ: Thu (2), 30-39đ: Đông (3), 40-49đ: Xuân (0)...
  const seasonIndex = Math.floor(g.score / 10) % 4;
  const curSeason = SEASONS[seasonIndex];

  // 1. Nền Bầu trời theo Mùa
  ctx.fillStyle = curSeason.sky;
  ctx.fillRect(0, 0, W, GROUND);

  // 2. Mây trắng chân trời Pixel
  ctx.fillStyle = curSeason.cloud;
  for (let cx = -(g.scroll * 0.2 % 120); cx < W + 120; cx += 120) {
    ctx.fillRect(cx, GROUND - 110, 60, 24);
    ctx.fillRect(cx + 8, GROUND - 124, 44, 14);
    ctx.fillRect(cx + 18, GROUND - 134, 24, 10);
  }

  // 3. Tòa nhà / Đồi cây theo Mùa
  ctx.fillStyle = curSeason.hillBack;
  ctx.fillRect(0, GROUND - 50, W, 50);
  ctx.fillStyle = curSeason.hillFront;
  for (let bx = -(g.scroll * 0.4 % 40); bx < W + 40; bx += 40) {
    ctx.fillRect(bx, GROUND - 65, 24, 15);
    ctx.fillRect(bx + 4, GROUND - 75, 16, 10);
  }

  // 4. Vẽ Cột Ống nước (Pipes) dạng 2D Pixel theo tông màu của Mùa
  const drawPixelPipe = (x, y, len, isTop) => {
    if (len <= 0) return;
    const rimH = 26;
    const bodyLen = Math.max(0, len - rimH);

    // Thân ống nước
    const bodyY = isTop ? y : y + rimH;
    ctx.fillStyle = curSeason.pipe;
    ctx.fillRect(x, bodyY, PIPE_W, bodyLen);

    // Vạch sáng pixel bên trái
    ctx.fillStyle = curSeason.pipeLight;
    ctx.fillRect(x + 3, bodyY, 6, bodyLen);
    ctx.fillRect(x + 11, bodyY, 3, bodyLen);

    // Vạch tối pixel bên phải
    ctx.fillStyle = curSeason.pipeDark;
    ctx.fillRect(x + PIPE_W - 8, bodyY, 5, bodyLen);

    // Viền đen Pixel quanh thân ống
    ctx.fillStyle = '#000000';
    ctx.fillRect(x, bodyY, 2, bodyLen);
    ctx.fillRect(x + PIPE_W - 2, bodyY, 2, bodyLen);

    // Vành miệng ống nước
    const rimY = isTop ? y + len - rimH : y;
    const rimX = x - 3;
    const rimW = PIPE_W + 6;

    ctx.fillStyle = curSeason.pipe;
    ctx.fillRect(rimX, rimY, rimW, rimH);
    ctx.fillStyle = curSeason.pipeLight;
    ctx.fillRect(rimX + 4, rimY, 6, rimH);
    ctx.fillRect(rimX + 12, rimY, 3, rimH);
    ctx.fillStyle = curSeason.pipeDark;
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

  // 5. Hiệu ứng hạt rơi đặc trưng theo từng Mùa (Hoa đào rơi / Nắng / Lá rụng / Bông tuyết)
  ctx.fillStyle = curSeason.particleColor;
  for (let i = 0; i < 12; i++) {
    // Tọa độ hạt rơi trôi theo scroll và thời gian
    const pxSeed = i * 37;
    const fallSpeed = curSeason.particleType === 'snow' ? 45 : 30;
    const py = ((g.t * fallSpeed + i * 45) % (GROUND - 20));
    const px = ((pxSeed - g.scroll * 0.4 + Math.sin(g.t * 2 + i) * 15) % W + W) % W;

    if (curSeason.particleType === 'snow') {
      // Bông tuyết tròn vuông 2x2 hoặc 3x3
      const sz = i % 2 === 0 ? 3 : 2;
      ctx.fillRect(px, py, sz, sz);
    } else if (curSeason.particleType === 'leaf') {
      // Lá phong đỏ mùa thu hình thoi 3x3
      ctx.fillRect(px, py, 3, 2);
      ctx.fillRect(px + 1, py - 1, 2, 4);
    } else if (curSeason.particleType === 'petal') {
      // Cánh hoa đào mùa xuân 2x2
      ctx.fillRect(px, py, 2, 2);
    } else {
      // Ánh nắng mùa hè nhấp nháy
      if (Math.sin(g.t * 5 + i) > 0) {
        ctx.fillRect(px, py, 2, 2);
      }
    }
  }

  // 6. Mặt đất Pixel theo mùa
  ctx.fillStyle = curSeason.ground;
  ctx.fillRect(0, GROUND, W, H - GROUND);

  // Thảm cỏ theo mùa (Xuân: xanh non, Hạ: xanh đậm, Thu: cỏ úa vàng, Đông: tuyết trắng)
  ctx.fillStyle = curSeason.grass;
  ctx.fillRect(0, GROUND, W, 14);
  ctx.fillStyle = curSeason.grassDark;
  ctx.fillRect(0, GROUND + 14, W, 3);

  // Hoa văn sọc cuộn ngang
  ctx.fillStyle = curSeason.groundStripe;
  const groundOffset = (g.scroll * 1.0) % 20;
  for (let gx = -groundOffset; gx < W + 20; gx += 20) {
    ctx.fillRect(gx, GROUND + 20, 10, 4);
    ctx.fillRect(gx + 5, GROUND + 28, 10, 4);
    ctx.fillRect(gx, GROUND + 36, 10, 4);
  }

  // Viền đen phân cách mặt đất
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, GROUND, W, 2);

  // 7. Nhãn hiển thị tên MÙA góc trên bên trái nhẹ nhàng (Xuân / Hạ / Thu / Đông)
  ctx.fillStyle = '#000000';
  ctx.fillRect(6, 6, 62, 16);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(7, 7, 60, 14);
  ctx.fillStyle = '#000000';
  ctx.font = '8px "Press Start 2P", monospace';
  ctx.fillText(`MÙA ${curSeason.name.toUpperCase()}`, 11, 18);

  // 8. Vẽ Chú chim 2D PIXEL ART
  ctx.save();
  ctx.translate(BIRD_X, g.y);

  const angle = Math.max(-0.4, Math.min(1.3, g.vy / 450));
  ctx.rotate(angle);

  const birdColor = activeSkin?.bird || themeColors.bird;
  const wingColor = activeSkin?.wing || '#ffffff';
  const beakColor = activeSkin?.beak || '#f85820';

  const px = 2.2;
  const offsetX = -(17 * px) / 2;
  const offsetY = -(12 * px) / 2;

  const wingFrame = g.phase === 'dead' ? 0 : Math.floor((g.t * 12) % 3);

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
