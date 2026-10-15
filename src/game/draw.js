// D:\STUDY\TAILIEUHOC_\TTTN\flappy-bird\src\game\draw.js
// Phụ trách vẽ Canvas 2D: Hỗ trợ Theme Ngày/Đêm và Skin trang phục chim

import { BIRD_X, GAP, GROUND, H, PIPE_W, R, W } from './game.js';

// Bảng màu mặc định (Theme ban ngày)
export const DEFAULT_COLORS = {
  skyTop: '#8fd3e8',
  skyBottom: '#dff3e4',
  orb: '#fff3b0',
  cloud: '#ffffff',
  hill: '#9fd6b0',
  pipe: '#2f9e6e',
  pipeLight: '#6fd0a0',
  pipeDark: '#1c6b4a',
  ground: '#e6c98a',
  groundDark: '#b8944f',
  grass: '#86c95c',
  bird: '#ffb52e',
  wing: '#ffd77a',
  beak: '#ef5a3c',
  eye: '#ffffff',
  outline: '#1d2b33',
};

const COLOR_KEYS = Object.keys(DEFAULT_COLORS);

// Đọc mã màu từ CSS variables nếu có
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

// Hàm vẽ chính trên Canvas mỗi khung hình
export function draw(ctx, g, themeColors = DEFAULT_COLORS, activeSkin = null) {
  // Tự động scale độ phân giải Canvas cho sắc nét trên màn hình Retina / điện thoại
  const k = ctx.canvas.width / W;
  ctx.setTransform(k, 0, 0, k, 0, 0);

  // Áp dụng màu skin trang phục nếu người chơi đã chọn trong Shop
  const birdColor = activeSkin?.bird || themeColors.bird;
  const wingColor = activeSkin?.wing || themeColors.wing;
  const beakColor = activeSkin?.beak || themeColors.beak;

  const circle = (x, y, r) => {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, 7);
    ctx.fill();
  };

  const pipe = (x, y, len, capAtBottom) => {
    ctx.fillStyle = themeColors.pipe;
    ctx.fillRect(x, y, PIPE_W, len);
    ctx.fillStyle = themeColors.pipeLight;
    ctx.fillRect(x + 6, y, 8, len);
    ctx.fillStyle = themeColors.pipeDark;
    ctx.fillRect(x + PIPE_W - 10, y, 10, len);
    const cy = capAtBottom ? y + len - 22 : y;
    ctx.fillRect(x - 4, cy, PIPE_W + 8, 22);
    ctx.fillStyle = themeColors.pipe;
    ctx.fillRect(x - 1, cy + 3, PIPE_W + 2, 16);
    ctx.fillStyle = themeColors.pipeLight;
    ctx.fillRect(x + 5, cy + 3, 8, 16);
  };

  // 1. Vẽ bầu trời (Gradient) và mặt trời/mặt trăng
  const sky = ctx.createLinearGradient(0, 0, 0, GROUND);
  sky.addColorStop(0, themeColors.skyTop);
  sky.addColorStop(1, themeColors.skyBottom);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, GROUND);
  ctx.fillStyle = themeColors.orb;
  circle(285, 92, 26);

  // 2. Vẽ mây trôi Parallax (chậm hơn tốc độ bay)
  ctx.fillStyle = themeColors.cloud;
  for (const [bx, by] of [[40, 90], [190, 200], [330, 135]]) {
    const x = (((bx - g.scroll * 0.15) % (W + 120)) + W + 120) % (W + 120) - 80;
    circle(x, by, 16);
    circle(x + 20, by - 9, 21);
    circle(x + 44, by, 16);
    ctx.fillRect(x, by, 44, 16);
  }

  // 3. Vẽ đồi núi phía sau
  ctx.fillStyle = themeColors.hill;
  ctx.beginPath();
  ctx.moveTo(0, GROUND);
  for (let x = 0; x <= W; x += 6) {
    const u = x + g.scroll * 0.3;
    ctx.lineTo(x, GROUND - 42 - 18 * Math.sin(u / 45) - 7 * Math.sin(u / 17));
  }
  ctx.lineTo(W, GROUND);
  ctx.fill();

  // 4. Vẽ các cặp cột ống nước
  for (const p of g.pipes) {
    pipe(p.x, 0, p.top, true);
    pipe(p.x, p.top + GAP, GROUND - p.top - GAP, false);
  }

  // 5. Vẽ mặt đất và dải cỏ chuyển động
  ctx.fillStyle = themeColors.ground;
  ctx.fillRect(0, GROUND, W, H - GROUND);
  ctx.fillStyle = themeColors.grass;
  ctx.fillRect(0, GROUND, W, 12);
  ctx.fillStyle = themeColors.groundDark;
  ctx.fillRect(0, GROUND + 12, W, 3);
  ctx.globalAlpha = 0.35;
  for (let x = -(g.scroll % 24) - 8; x < W; x += 24) {
    ctx.beginPath();
    ctx.moveTo(x + 8, GROUND);
    ctx.lineTo(x + 18, GROUND);
    ctx.lineTo(x + 10, GROUND + 12);
    ctx.lineTo(x, GROUND + 12);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // 6. Vẽ chú chim (xoay nghiêng theo vận tốc rơi vy)
  ctx.save();
  ctx.translate(BIRD_X, g.y);
  ctx.rotate(Math.max(-0.5, Math.min(1.4, g.vy / 500)));
  ctx.strokeStyle = themeColors.outline;
  ctx.lineWidth = 2;
  ctx.lineJoin = 'round';

  // Thân chim
  ctx.fillStyle = birdColor;
  ctx.beginPath();
  ctx.ellipse(0, 0, R + 3, R, 0, 0, 7);
  ctx.fill();
  ctx.stroke();

  // Cánh chim (vỗ cánh theo thời gian)
  ctx.fillStyle = wingColor;
  ctx.beginPath();
  ctx.ellipse(-5, 2 + (g.phase === 'dead' ? 0 : Math.sin(g.t * 22) * 3), 8, 5, 0, 0, 7);
  ctx.fill();
  ctx.stroke();

  // Mỏ chim
  ctx.fillStyle = beakColor;
  ctx.beginPath();
  ctx.moveTo(12, -2);
  ctx.lineTo(23, 2);
  ctx.lineTo(12, 6);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Mắt chim
  ctx.fillStyle = themeColors.eye;
  circle(7, -5, 5);
  ctx.stroke();
  ctx.fillStyle = themeColors.outline;
  circle(8.5, -5, 2);

  ctx.restore();
}
