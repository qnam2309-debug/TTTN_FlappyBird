// D:\STUDY\TAILIEUHOC_\TTTN\flappy-bird\src\game\useGame.js
// React Hook kết nối game loop Canvas với React, bắt sự kiện phím và lưu điểm kỷ lục

import { useEffect, useRef, useState } from 'react';
import { draw, readColors } from './draw.js';
import { DT, flap, newGame, reset, step } from './game.js';
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

const initialBest = readBest();
const initialGame = newGame(initialBest);
const restored = restoreRun(initialGame);
if (!restored && typeof navigator !== 'undefined' && !navigator.onLine) initialGame.paused = true;

export function useGame(canvasRef, activeSkin = null, onGameOver = null, userBestScore = null) {
  const game = useRef(initialGame);
  const [hud, setHud] = useState({
    phase: initialGame.phase,
    score: initialGame.score,
    best: initialGame.best,
    newBest: initialGame.newBest,
  });

  const [network, setNetwork] = useState(() => ({offline: typeof navigator !== 'undefined' && !navigator.onLine, countdown: null, restored}));
  const onGameOverRef = useRef(onGameOver);
  const activeSkinRef = useRef(activeSkin);

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
      e.preventDefault();
      if (!e.repeat) flap(g);
    };
    window.addEventListener('keydown', onKey);

    let raf;
    let prev = performance.now();
    let acc = 0;
    // Trạng thái trước bước vật lý gần nhất (giữ qua các frame để nội suy)
    let prevY = g.y;
    let prevVy = g.vy;
    let shown = g.phase + g.score;
    let lastPhase = g.phase;

    // Vòng lặp animation frame
    const frame = (now) => {
      acc += Math.min((now - prev) / 1000, 0.1);
      prev = now;

      while (acc >= DT) {
        prevY = g.y;
        prevVy = g.vy;
        step(g, DT, calm);
        acc -= DT;
      }

      // Nội suy vị trí & vận tốc giữa 2 bước vật lý -> chuyển động mượt
      const alpha = Math.min(acc / DT, 1);
      const renderG = {
        ...g,
        y: prevY + (g.y - prevY) * alpha,
        vy: prevVy + (g.vy - prevVy) * alpha,
      };

      if (now - lastSaved >= 1000) {
        lastSaved = now;
        if (g.phase === 'play') saveRun(g);
      }
      // Vẽ Canvas với theme màu và skin đang chọn
      draw(ctx, renderG, colors, activeSkinRef.current);

      // Kích hoạt khi chim chết (chuyển sang 'dead')
      if (lastPhase !== 'dead' && g.phase === 'dead') {
        clearRun();
        onGameOverRef.current?.(g.score);
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
