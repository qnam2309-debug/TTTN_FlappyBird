// D:\STUDY\TAILIEUHOC_\TTTN\flappy-bird\src\game\useGame.js
// React Hook kết nối game loop Canvas với React, bắt sự kiện phím và lưu điểm kỷ lục

import { useEffect, useRef, useState } from 'react';
import { draw, readColors } from './draw.js';
import { flap, newGame, reset, step } from './game.js';
import { saveRun, restoreRun, clearRun } from './resume.js';

const BEST_KEY = 'flappy-best';

function readBest() {
  try {
    return +localStorage.getItem(BEST_KEY) || 0;
  } catch (err) {
    console.warn(err);
    return 0;
  }
}

function createInitialGame() {
  const best = readBest();
  const g = newGame(best);
  const restored = restoreRun(g);
  if (!restored && typeof navigator !== 'undefined' && !navigator.onLine) {
    g.paused = true;
  }
  return { game: g, restored };
}

export function useGame(canvasRef, activeSkin = null, onGameOver = null, userBestScore = null, isPaused = false) {
  const [initialData] = useState(() => createInitialGame());
  const game = useRef(initialData.game);

  const [hud, setHud] = useState({
    phase: initialData.game.phase,
    score: initialData.game.score,
    best: initialData.game.best,
    newBest: initialData.game.newBest,
  });

  const [network, setNetwork] = useState(() => ({
    offline: typeof navigator !== 'undefined' && !navigator.onLine,
    countdown: null,
    restored: initialData.restored,
  }));

  const onGameOverRef = useRef(onGameOver);
  const activeSkinRef = useRef(activeSkin);
  const isPausedRef = useRef(isPaused);

  useEffect(() => {
    onGameOverRef.current = onGameOver;
    activeSkinRef.current = activeSkin;
    isPausedRef.current = isPaused;
  }, [onGameOver, activeSkin, isPaused]);

  // Tự động tạm dừng game khi mở Modal và khôi phục khi đóng Modal
  useEffect(() => {
    const g = game.current;
    if (!g) return;
    if (isPaused) {
      g.paused = true;
      saveRun(g);
    } else {
      if (typeof navigator === 'undefined' || navigator.onLine) {
        g.paused = false;
      }
    }
  }, [isPaused]);

  useEffect(() => {
    onGameOverRef.current = onGameOver;
    activeSkinRef.current = activeSkin;
  }, [onGameOver, activeSkin]);

  // Đồng bộ kỷ lục vào game ref khi tài khoản đăng nhập/đăng xuất thay đổi
  useEffect(() => {
    const targetBest =
      userBestScore !== null && userBestScore !== undefined
        ? Number(userBestScore) || 0
        : readBest();
    game.current.best = targetBest;
  }, [userBestScore]);

  useEffect(() => {
    const g = game.current;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const dark = matchMedia('(prefers-color-scheme: dark)');
    const colors = readColors();
    const onTheme = () => readColors(colors);
    dark.addEventListener('change', onTheme);

    let countdownTimer = null;
    let remaining = 3;
    const pauseOffline = () => {
      clearInterval(countdownTimer);
      countdownTimer = null;
      g.paused = true;
      saveRun(g);
      setNetwork({offline:true, countdown:null, restored:false});
    };
    const resumeOnline = () => {
      if (!g.paused || !navigator.onLine) return;
      clearInterval(countdownTimer);
      remaining = 3;
      setNetwork({offline:false, countdown:remaining, restored:false});
      countdownTimer = setInterval(() => {
        if (!navigator.onLine) { pauseOffline(); return; }
        remaining--;
        if (remaining === 0) {
          clearInterval(countdownTimer);
          countdownTimer = null;
          g.paused = false;
          setNetwork({offline:false, countdown:null, restored:false});
        } else setNetwork({offline:false, countdown:remaining, restored:false});
      }, 1000);
    };
    window.addEventListener('offline', pauseOffline);
    window.addEventListener('online', resumeOnline);
    if (!navigator.onLine) pauseOffline();
    else if (g.paused) resumeOnline();
    let lastSaved = performance.now();

    // Bắt phím Space hoặc Mũi tên lên để đập cánh
    const onKey = (e) => {
      if (e.code !== 'Space' && e.code !== 'ArrowUp') return;

      // Không can thiệp nếu người dùng đang nhập văn bản trong ô input, textarea
      const target = e.target;
      if (
        target &&
        (target.tagName === 'INPUT' ||
         target.tagName === 'TEXTAREA' ||
         target.isContentEditable)
      ) {
        return;
      }

      // Không cho bay nếu modal đang mở
      if (isPausedRef.current) return;

      e.preventDefault();
      if (!e.repeat) flap(g);
    };
    window.addEventListener('keydown', onKey);

    let raf;
    let prev = performance.now();
    let shown = g.phase + g.score;
    let lastPhase = g.phase;

    // Vòng lặp animation frame
    const frame = (now) => {
      const dt = Math.min((now - prev) / 1000, 0.05);
      prev = now;

      // Cập nhật bước vật lý mượt mà đồng bộ theo thời gian thực (không lệch nhịp 60Hz/120Hz)
      step(g, dt, calm);

      if (now - lastSaved >= 1000) {
        lastSaved = now;
        if (g.phase === 'play') saveRun(g);
      }
      // Vẽ Canvas với theme màu và skin đang chọn (truyền trực tiếp g, loại bỏ rác bộ nhớ GC)
      draw(ctx, g, colors, activeSkinRef.current);

      // Kích hoạt khi chim chết (chuyển sang 'dead')
      if (lastPhase !== 'dead' && g.phase === 'dead') {
        clearRun();
        onGameOverRef.current?.(g.score, g.playDuration || 0);
      }
      lastPhase = g.phase;

      // Chỉ cập nhật React HUD khi phase hoặc score thay đổi
      const key = g.phase + g.score;
      if (key !== shown) {
        shown = key;
        setHud({
          phase: g.phase,
          score: g.score,
          best: g.best,
          newBest: g.newBest,
        });
      }

      raf = requestAnimationFrame(frame);
    };

    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      clearInterval(countdownTimer);
      saveRun(g);
      window.removeEventListener('offline', pauseOffline);
      window.removeEventListener('online', resumeOnline);
      window.removeEventListener('keydown', onKey);
      dark.removeEventListener('change', onTheme);
    };
  }, [canvasRef]);

  // Tự động lưu điểm cao nhất vào localStorage (chỉ khi là khách)
  useEffect(() => {
    if (userBestScore === null || userBestScore === undefined) {
      try {
        localStorage.setItem(BEST_KEY, hud.best);
      } catch (err) {
        console.warn(err);
      }
    }
  }, [hud.best, userBestScore]);

  const effectiveBest =
    userBestScore !== null && userBestScore !== undefined
      ? Math.max(Number(userBestScore) || 0, hud.score)
      : hud.best;

  return [{ ...hud, ...network, best: effectiveBest }, () => flap(game.current), () => { clearRun(); reset(game.current); }];
}
