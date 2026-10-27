// D:\STUDY\TAILIEUHOC_\TTTN\flappy-bird\src\game\draw.js
// Phụ trách vẽ Canvas 2D PIXEL ART (Phong cách Retro 8-bit nguyên bản)
// Hỗ trợ đổi 4 mùa Xuân - Hạ - Thu - Đông mượt mà (chuyển màu mềm mại)
// Tạm thời hạ mốc đổi mùa xuống 3 điểm/mùa để test

import { BIRD_X, GAP, GROUND, H, PIPE_W, W } from './game.js';

export const POINTS_PER_SEASON = 3; // 3 điểm/mùa (Xuân: 0-2, Hạ: 3-5, Thu: 6-8, Đông: 9-11 -> lặp lại)

// Cấu hình bảng màu RGB & đặc trưng chi tiết 4 MÙA
export const SEASONS = [
  {
    name: 'Xuân',
    sky: [100, 205, 230],       // Xanh ngọc tươi mát mùa xuân
    skyBottom: [200, 240, 230],
    cloud: [255, 255, 255],
    hillBack: [120, 215, 140],
    hillFront: [85, 195, 105],
    pipe: '#68b828',
    pipeLight: '#94e048',
    pipeDark: '#447814',
    ground: [222, 216, 149],
    grass: [117, 190, 47],
    grassDark: [85, 128, 34],
    groundStripe: [184, 148, 79],
    type: 'spring',
  },
  {
    name: 'Hạ',
    sky: [40, 160, 235],        // Bầu trời hè xanh ngắt rực nắng
    skyBottom: [140, 215, 255],
    cloud: [255, 255, 255],
    hillBack: [55, 175, 75],    // Cây cối xanh mướt rậm rạp
    hillFront: [30, 145, 50],
    pipe: '#55a822',
    pipeLight: '#80d840',
    pipeDark: '#336a10',
    ground: [230, 210, 135],
    grass: [45, 160, 50],
    grassDark: [25, 100, 30],
    groundStripe: [175, 140, 65],
    type: 'summer',
  },
  {
    name: 'Thu',
    sky: [235, 130, 65],        // Hoàng hôn chiều thu cam vàng ấm áp
    skyBottom: [250, 200, 120],
    cloud: [255, 230, 205],
    hillBack: [210, 115, 40],   // Rừng phong ngả vàng cam
    hillFront: [175, 80, 20],
    pipe: '#b5651d',            // Ống nước màu lá úa
    pipeLight: '#e08e45',
    pipeDark: '#783e0a',
    ground: [210, 170, 115],
    grass: [195, 110, 30],      // Cỏ vàng lá rụng
    grassDark: [130, 70, 15],
    groundStripe: [155, 110, 60],
    type: 'autumn',
  },
  {
    name: 'Đông',
    sky: [100, 130, 160],       // Bầu trời đông xám lạnh mờ sương
    skyBottom: [190, 210, 225],
    cloud: [225, 235, 245],
    hillBack: [185, 205, 220],  // Núi phủ tuyết trắng xóa
    hillFront: [230, 242, 250],
    pipe: '#4a8296',            // Ống nước đóng băng xanh tuyết
    pipeLight: '#8ec4d8',
    pipeDark: '#2a5463',
    ground: [205, 220, 232],    // Đất đóng băng tuyết
    grass: [255, 255, 255],     // Tuyết trắng phủ kín
    grassDark: [150, 175, 195],
    groundStripe: [140, 160, 180],
    type: 'winter',
  },
];

// Hàm chuyển tiếp màu sắc mượt mà (Lerp RGB Color)
function lerpColor(c1, c2, t) {
  const r = Math.round(c1[0] + (c2[0] - c1[0]) * t);
  const g = Math.round(c1[1] + (c2[1] - c1[1]) * t);
  const b = Math.round(c1[2] + (c2[2] - c1[2]) * t);
  return `rgb(${r},${g},${b})`;
}

// Biến lưu trữ trạng thái chuyển mùa mượt theo thời gian thực
let currentSeasonIdx = 0;
let transitionProgress = 1; // 0 -> 1 (hoàn thành)
let prevSeasonIdx = 0;

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

  // Tính toán mùa mục tiêu theo điểm số
  const targetSeasonIdx = Math.floor(g.score / POINTS_PER_SEASON) % 4;

  // Xử lý hiệu ứng chuyển màu mượt mà (Fade transition trong 1.5 giây)
  if (targetSeasonIdx !== currentSeasonIdx) {
    if (transitionProgress >= 1) {
      prevSeasonIdx = currentSeasonIdx;
      currentSeasonIdx = targetSeasonIdx;
      transitionProgress = 0;
    }
  }

  if (transitionProgress < 1) {
    transitionProgress = Math.min(1, transitionProgress + 0.025);
  }

  const sFrom = SEASONS[prevSeasonIdx];
  const sTo = SEASONS[currentSeasonIdx];
  const t = transitionProgress;

  // Các màu động nội suy mượt mà giữa mùa trước và mùa hiện tại
  const colorSky = lerpColor(sFrom.sky, sTo.sky, t);
  const colorSkyBottom = lerpColor(sFrom.skyBottom, sTo.skyBottom, t);
  const colorCloud = lerpColor(sFrom.cloud, sTo.cloud, t);
  const colorHillBack = lerpColor(sFrom.hillBack, sTo.hillBack, t);
  const colorHillFront = lerpColor(sFrom.hillFront, sTo.hillFront, t);
  const colorGround = lerpColor(sFrom.ground, sTo.ground, t);
  const colorGrass = lerpColor(sFrom.grass, sTo.grass, t);
  const colorGrassDark = lerpColor(sFrom.grassDark, sTo.grassDark, t);
  const colorStripe = lerpColor(sFrom.groundStripe, sTo.groundStripe, t);

  // 1. Nền Bầu trời chuyển đổi mượt
  const skyGrad = ctx.createLinearGradient(0, 0, 0, GROUND);
  skyGrad.addColorStop(0, colorSky);
  skyGrad.addColorStop(1, colorSkyBottom);
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, W, GROUND);

  // 2. MÙA HẠ: Vẽ MẶT TRỜI CHÓI CHANG RỰC RỠ + TIA NẮNG
  if (sTo.type === 'summer' || (sFrom.type === 'summer' && t < 1)) {
    const sunAlpha = sTo.type === 'summer' ? t : 1 - t;
    ctx.save();
    ctx.globalAlpha = sunAlpha;

    const sunX = W - 65;
    const sunY = 55;

    // Vầng hào quang mặt trời pixel nhấp nháy
    const pulse = Math.sin(g.t * 3) * 4;
    ctx.fillStyle = 'rgba(255, 255, 180, 0.35)';
    ctx.fillRect(sunX - 24 - pulse / 2, sunY - 24 - pulse / 2, 48 + pulse, 48 + pulse);
    ctx.fillStyle = 'rgba(255, 230, 100, 0.5)';
    ctx.fillRect(sunX - 16, sunY - 16, 32, 32);

    // Lõi mặt trời vàng cam pixel
    ctx.fillStyle = '#ffcf33';
    ctx.fillRect(sunX - 11, sunY - 11, 22, 22);
    ctx.fillStyle = '#fff480';
    ctx.fillRect(sunX - 7, sunY - 7, 14, 14);

    // 8 tia nắng pixel tỏa ra xung quanh
    ctx.fillStyle = '#ffb300';
    const rayLen = 8 + Math.sin(g.t * 4) * 3;
    ctx.fillRect(sunX - 2, sunY - 18 - rayLen, 4, rayLen); // Trên
    ctx.fillRect(sunX - 2, sunY + 18, 4, rayLen);         // Dưới
    ctx.fillRect(sunX - 18 - rayLen, sunY - 2, rayLen, 4); // Trái
    ctx.fillRect(sunX + 18, sunY - 2, rayLen, 4);         // Phải

    ctx.restore();
  }

  // 3. Mây trắng chân trời Pixel
  ctx.fillStyle = colorCloud;
  for (let cx = -(g.scroll * 0.2 % 120); cx < W + 120; cx += 120) {
    ctx.fillRect(cx, GROUND - 110, 60, 24);
    ctx.fillRect(cx + 8, GROUND - 124, 44, 14);
    ctx.fillRect(cx + 18, GROUND - 134, 24, 10);
  }

  // 4. MÙA ĐÔNG: DÃY NÚI TUYẾT TRẮNG HÙNG VĨ PHÍA XA
  if (sTo.type === 'winter' || (sFrom.type === 'winter' && t < 1)) {
    const snowAlpha = sTo.type === 'winter' ? t : 1 - t;
    ctx.save();
    ctx.globalAlpha = snowAlpha;

    // Núi tuyết đỉnh nhọn phủ băng
    const drawSnowMountain = (mx, my, mw, mh) => {
      ctx.fillStyle = '#a8c6db'; // Thân núi lạnh
      ctx.beginPath();
      ctx.moveTo(mx, my);
      ctx.lineTo(mx + mw / 2, my - mh);
      ctx.lineTo(mx + mw, my);
      ctx.closePath();
      ctx.fill();

      // Mũ tuyết trắng trên đỉnh núi
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(mx + mw / 2, my - mh);
      ctx.lineTo(mx + mw * 0.35, my - mh * 0.55);
      ctx.lineTo(mx + mw * 0.5, my - mh * 0.45);
      ctx.lineTo(mx + mw * 0.65, my - mh * 0.55);
      ctx.closePath();
      ctx.fill();
    };

    drawSnowMountain(15, GROUND - 20, 110, 85);
    drawSnowMountain(105, GROUND - 20, 140, 110);
    drawSnowMountain(220, GROUND - 20, 120, 75);

    ctx.restore();
  }

  // 5. Đồi cây chuyển màu theo mùa
  ctx.fillStyle = colorHillBack;
  ctx.fillRect(0, GROUND - 50, W, 50);
  ctx.fillStyle = colorHillFront;
  for (let bx = -(g.scroll * 0.4 % 40); bx < W + 40; bx += 40) {
    ctx.fillRect(bx, GROUND - 65, 24, 15);
    ctx.fillRect(bx + 4, GROUND - 75, 16, 10);
  }

  // 6. Vẽ Cột Ống nước (Pipes) dạng 2D Pixel
  const drawPixelPipe = (x, y, len, isTop) => {
    if (len <= 0) return;
    const rimH = 26;
    const bodyLen = Math.max(0, len - rimH);

    const bodyY = isTop ? y : y + rimH;
    ctx.fillStyle = sTo.pipe;
    ctx.fillRect(x, bodyY, PIPE_W, bodyLen);

    ctx.fillStyle = sTo.pipeLight;
    ctx.fillRect(x + 3, bodyY, 6, bodyLen);
    ctx.fillRect(x + 11, bodyY, 3, bodyLen);

    ctx.fillStyle = sTo.pipeDark;
    ctx.fillRect(x + PIPE_W - 8, bodyY, 5, bodyLen);

    ctx.fillStyle = '#000000';
    ctx.fillRect(x, bodyY, 2, bodyLen);
    ctx.fillRect(x + PIPE_W - 2, bodyY, 2, bodyLen);

    const rimY = isTop ? y + len - rimH : y;
    const rimX = x - 3;
    const rimW = PIPE_W + 6;

    ctx.fillStyle = sTo.pipe;
    ctx.fillRect(rimX, rimY, rimW, rimH);
    ctx.fillStyle = sTo.pipeLight;
    ctx.fillRect(rimX + 4, rimY, 6, rimH);
    ctx.fillRect(rimX + 12, rimY, 3, rimH);
    ctx.fillStyle = sTo.pipeDark;
    ctx.fillRect(rimX + rimW - 9, rimY, 6, rimH);

    ctx.fillStyle = '#000000';
    ctx.fillRect(rimX, rimY, rimW, 2);
    ctx.fillRect(rimX, rimY + rimH - 2, rimW, 2);
    ctx.fillRect(rimX, rimY, 2, rimH);
    ctx.fillRect(rimX + rimW - 2, rimY, 2, rimH);

    // MÙA ĐÔNG: Băng tuyết đóng trên vành ống nước
    if (sTo.type === 'winter') {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(rimX + 2, rimY, rimW - 4, 4);
      // Giọt băng tuyết thòng xuống
      ctx.fillRect(rimX + 8, rimY + 4, 3, 5);
      ctx.fillRect(rimX + 20, rimY + 4, 4, 7);
      ctx.fillRect(rimX + 38, rimY + 4, 3, 4);
    }
  };

  for (const p of g.pipes) {
    drawPixelPipe(p.x, 0, p.top, true);
    drawPixelPipe(p.x, p.top + GAP, GROUND - p.top - GAP, false);
  }

  // 7. HIỆU ỨNG THIÊN NHIÊN CHI TIẾT THEO TỪNG MÙA:
  // - Xuân: Cánh hoa đào hồng bay lượn
  // - Thu: Lá phong vàng/đỏ xoay rơi
  // - Đông: Bão tuyết rơi phủ trắng xóa
  const curType = sTo.type;

  if (curType === 'spring') {
    // 🌸 MÙA XUÂN: CÁNH HOA ĐÀO RƠI UỐN LƯỢN TRONG GIÓ
    for (let i = 0; i < 22; i++) {
      const seed = i * 41;
      const py = ((g.t * 38 + i * 35) % (GROUND - 10));
      const sway = Math.sin(g.t * 3 + i * 1.5) * 22;
      const px = ((seed - g.scroll * 0.35 + sway) % W + W) % W;

      // Cánh hoa đào pixel màu hồng đào phớt
      ctx.fillStyle = i % 2 === 0 ? '#ffb7c5' : '#ff9ebb';
      ctx.fillRect(px, py, 3, 3);
      ctx.fillRect(px + 1, py - 1, 2, 2);
      ctx.fillStyle = '#ff6b8b';
      ctx.fillRect(px + 1, py + 1, 1, 1);
    }
  } else if (curType === 'autumn') {
    // 🍂 MÙA THU: LÁ PHONG ĐỎ & LÁ VÀNG XOAY RƠI
    for (let i = 0; i < 20; i++) {
      const seed = i * 47;
      const py = ((g.t * 42 + i * 38) % (GROUND - 10));
      const sway = Math.sin(g.t * 2.5 + i * 2) * 25;
      const px = ((seed - g.scroll * 0.4 + sway) % W + W) % W;

      // Lá phong pixel 4x4
      ctx.fillStyle = i % 3 === 0 ? '#d9381e' : (i % 3 === 1 ? '#e67319' : '#f2aa1f');
      ctx.fillRect(px, py, 4, 3);
      ctx.fillRect(px + 1, py - 1, 2, 5);
      ctx.fillStyle = '#8a2512';
      ctx.fillRect(px + 2, py + 1, 1, 2); // Cuống lá
    }
  } else if (curType === 'winter') {
    // ❄️ MÙA ĐÔNG: BÔNG TUYẾT TRẮNG RƠI DÀY ĐẶC
    for (let i = 0; i < 35; i++) {
      const seed = i * 29;
      const speed = 40 + (i % 3) * 25;
      const py = ((g.t * speed + i * 25) % (GROUND - 5));
      const drift = Math.sin(g.t * 1.8 + i) * 12;
      const px = ((seed - g.scroll * 0.2 + drift) % W + W) % W;

      ctx.fillStyle = '#ffffff';
      if (i % 4 === 0) {
        // Bông tuyết to 3x3 hình chữ thập
        ctx.fillRect(px + 1, py, 1, 3);
        ctx.fillRect(px, py + 1, 3, 1);
      } else {
        // Bông tuyết nhỏ 2x2
        ctx.fillRect(px, py, 2, 2);
      }
    }
  }

  // 8. Mặt đất Pixel theo mùa
  ctx.fillStyle = colorGround;
  ctx.fillRect(0, GROUND, W, H - GROUND);

  // Thảm cỏ theo mùa (Đông: tuyết trắng phau, Thu: cỏ cháy, Xuân/Hạ: xanh tươi)
  ctx.fillStyle = colorGrass;
  ctx.fillRect(0, GROUND, W, 14);
  ctx.fillStyle = colorGrassDark;
  ctx.fillRect(0, GROUND + 14, W, 3);

  // Hoa văn vạch đất cuộn ngang
  ctx.fillStyle = colorStripe;
  const groundOffset = (g.scroll * 1.0) % 20;
  for (let gx = -groundOffset; gx < W + 20; gx += 20) {
    ctx.fillRect(gx, GROUND + 20, 10, 4);
    ctx.fillRect(gx + 5, GROUND + 28, 10, 4);
    ctx.fillRect(gx, GROUND + 36, 10, 4);
  }

  // Viền đen mặt đất
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, GROUND, W, 2);

  // 9. Bảng thông báo Mùa Pixel Retro sinh động ở góc trên
  ctx.fillStyle = '#000000';
  ctx.fillRect(6, 6, 76, 18);
  ctx.fillStyle = curType === 'winter' ? '#d4f1f9' : (curType === 'autumn' ? '#ffe2c2' : (curType === 'summer' ? '#fff6b0' : '#ffd1dc'));
  ctx.fillRect(8, 8, 72, 14);
  ctx.fillStyle = '#000000';
  ctx.font = '8px "Press Start 2P", monospace';
  const seasonEmoji = curType === 'spring' ? '🌸' : (curType === 'summer' ? '☀️' : (curType === 'autumn' ? '🍂' : '❄️'));
  ctx.fillText(`${seasonEmoji} ${sTo.name.toUpperCase()}`, 12, 19);

  // 10. Vẽ Chú chim 2D PIXEL ART
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
