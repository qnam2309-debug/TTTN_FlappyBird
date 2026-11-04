// D:\STUDY\TAILIEUHOC_\TTTN\flappy-bird\src\game\game.js
// Luật chơi và tính toán vật lý: Pure JS, không DOM, không React

import { playDie, playFlap, playHit, playScore } from './sound.js';

export const W = 360, H = 540, GROUND = 470; // Kích thước màn chơi logic (px)
export const BIRD_X = 100, R = 13;           // Vị trí X cố định và bán kính vẽ chú chim
export const PIPE_W = 58, GAP = 140;         // Độ rộng cột và khoảng hở giữa 2 cột trên/dưới
export const DT = 1 / 120;                   // Bước nhảy thời gian vật lý cố định (s)

const HIT_R = 11;                            // Bán kính va chạm (nhỏ hơn hình vẽ 1 chút để chơi công bằng hơn)
const GRAVITY = 1500, FLAP = -430, MAX_FALL = 700, SPEED = 150; // Vận tốc & gia tốc (px/s)
const SPACING = 200;                         // Khoảng cách giữa các đợt cột
export const RESTART_LOCK = 500;             // Thời gian khóa (ms) sau khi chết trước khi cho chơi lại

export const SCORE_SPIKES_THRESHOLD = 40;    // Mốc xuất hiện gai nhọn (>= 40 điểm)
export const SCORE_MOVING_THRESHOLD = 60;    // Mốc xuất hiện cột di chuyển lên xuống (>= 60 điểm)
export const SPIKE_H = 18;                   // Chiều cao gai nhọn (px)

// Tạo ngẫu nhiên độ cao và thuộc tính đặc biệt của cột (gai nhọn, di chuyển lên xuống)
export const newPipe = (x, score = 0) => {
  // Gai nhọn xuất hiện ngẫu nhiên khi đạt từ 40 điểm trở lên (~45% xác suất)
  const hasSpike = score >= SCORE_SPIKES_THRESHOLD && Math.random() < 0.45;
  const spike = hasSpike ? (Math.random() < 0.5 ? 'top' : 'bottom') : 'none';

  // Cột di chuyển lên xuống ngẫu nhiên khi đạt từ 60 điểm trở lên (~40% xác suất)
  const isMoving = score >= SCORE_MOVING_THRESHOLD && Math.random() < 0.40;

  // Giới hạn baseTop an toàn: nếu cột di chuyển thì cần chừa biên độ dao động
  const minTop = isMoving ? 75 : 50;
  const maxTop = isMoving ? GROUND - GAP - 75 : GROUND - GAP - 50;
  const baseTop = minTop + Math.random() * Math.max(10, maxTop - minTop);

  return {
    x,
    top: baseTop,
    baseTop,
    passed: false,
    spike,      // 'none' | 'top' | 'bottom'
    isMoving,   // boolean
    moveAmp: isMoving ? 22 + Math.random() * 12 : 0,     // Biên độ dao động: 22px - 34px
    moveSpeed: isMoving ? 2.2 + Math.random() * 0.8 : 0, // Tốc độ góc: 2.2 - 3.0 rad/s
    movePhase: isMoving ? Math.random() * Math.PI * 2 : 0,
  };
};

// Reset trạng thái ván chơi
export const reset = (g) =>
  Object.assign(g, {
    paused: false,
    phase: 'ready',   // 'ready' | 'play' | 'dead'
    y: H * 0.42,
    vy: 0,
    pipes: [],
    score: 0,
    newBest: false,
  });

// Khởi tạo một game mới
export const newGame = (best = 0) => reset({ best, t: 0, scroll: 0 });

// Thuật toán kiểm tra va chạm giữa hình tròn (chim) và hình chữ nhật (cột)
export function hits(cx, cy, r, x, y, w, h) {
  const dx = cx - Math.max(x, Math.min(cx, x + w));
  const dy = cy - Math.max(y, Math.min(cy, y + h));
  return dx * dx + dy * dy < r * r;
}

// Xử lý khi nhấn nút bay (Flap)
export function flap(g) {
  if (g.paused) return;
  if (g.phase === 'dead') {
    if (performance.now() - g.deadAt > RESTART_LOCK) reset(g);
    return;
  }
  if (g.phase === 'ready') {
    g.phase = 'play';
    g.pipes = [newPipe(W + 100, g.score)];
  }
  g.vy = FLAP;
  playFlap();
}

// Xử lý khi chim chết
function die(g, reason = 'hit') {
  g.phase = 'dead';
  g.deadAt = performance.now();
  if (g.score > g.best) {
    g.best = g.score;
    g.newBest = true;
  }
  if (reason === 'pipe') {
    playHit();
    // Tiếng rơi chậm hơn một chút sau khi đâm cột
    setTimeout(() => playDie(), 120);
  } else {
    playHit();
  }
}

// Cập nhật vị trí, tốc độ và kiểm tra va chạm sau mỗi bước thời gian dt
export function step(g, dt, calm = false) {
  if (g.paused) return;
  g.t += dt;
  if (g.phase === 'ready') {
    if (!calm) {
      g.y = H * 0.42 + Math.sin(g.t * 5) * 6; // Chuyển động bập bênh nhẹ khi đang chờ
      g.scroll += SPEED * dt;
    }
    return;
  }

  // Cập nhật rơi tự do
  g.vy = Math.min(g.vy + GRAVITY * dt, MAX_FALL);
  g.y += g.vy * dt;
  if (g.y < R) {
    g.y = R;
    g.vy = 0;
  }

  if (g.phase === 'play') {
    g.scroll += SPEED * dt;
    // Di chuyển cột và tính điểm khi vượt qua
    for (const p of g.pipes) {
      p.x -= SPEED * dt;

      // Cột dao động lên xuống (khi score >= 60)
      if (p.isMoving) {
        const offset = Math.sin(g.t * p.moveSpeed + p.movePhase) * p.moveAmp;
        const targetTop = p.baseTop + offset;
        // Giữ vị trí trong khoảng an toàn của màn chơi
        p.top = Math.max(35, Math.min(GROUND - GAP - 35, targetTop));
      }

      if (!p.passed && p.x + PIPE_W < BIRD_X) {
        p.passed = true;
        g.score++;
        playScore();
      }
    }
    // Xóa cột đã đi khuất màn hình bên trái
    if (g.pipes[0].x < -PIPE_W - 8) g.pipes.shift();
    // Sinh thêm cột mới ở bên phải
    const last = g.pipes[g.pipes.length - 1];
    if (last.x <= W - SPACING) g.pipes.push(newPipe(last.x + SPACING, g.score));

    // Kiểm tra va chạm với cột trên, cột dưới và gai nhọn
    const hitsPipe = (p) => {
      // Va chạm thân và vành ống nước
      if (
        hits(BIRD_X, g.y, HIT_R, p.x, -H, PIPE_W, H + p.top) ||
        hits(BIRD_X, g.y, HIT_R, p.x, p.top + GAP, PIPE_W, H)
      ) {
        return true;
      }

      // Va chạm gai nhọn (giảm không gian khe hở)
      if (p.spike === 'top') {
        // Gai trên thòng xuống từ mép dưới của vành ống trên: y từ p.top đến p.top + SPIKE_H
        if (hits(BIRD_X, g.y, HIT_R, p.x + 2, p.top, PIPE_W - 4, SPIKE_H)) {
          return true;
        }
      } else if (p.spike === 'bottom') {
        // Gai dưới nhô lên từ mép trên của vành ống dưới: y từ p.top + GAP - SPIKE_H đến p.top + GAP
        if (hits(BIRD_X, g.y, HIT_R, p.x + 2, p.top + GAP - SPIKE_H, PIPE_W - 4, SPIKE_H)) {
          return true;
        }
      }

      return false;
    };

    // Chết nếu va chạm cột/gai hoặc chạm đất
    if (g.pipes.some(hitsPipe)) {
      die(g, 'pipe');
    } else if (g.y + R >= GROUND) {
      die(g, 'ground');
    }
  }

  // Chặn không cho chim lún sâu xuống lòng đất
  if (g.y + R >= GROUND) {
    g.y = GROUND - R;
    g.vy = 0;
  }
}
