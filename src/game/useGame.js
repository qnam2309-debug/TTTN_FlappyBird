// D:\STUDY\TAILIEUHOC_\TTTN\flappy-bird\src\game\useGame.js
// React Hook kết nối game loop Canvas với React, bắt sự kiện phím và lưu điểm kỷ lục

import { useEffect, useRef, useState } from 'react';
import { draw, readColors } from './draw.js';
import { DT, GAP, GROUND, PIPE_W, R, flap, newGame, reset, step } from './game.js';

const BEST_KEY = 'flappy-best';
const RESUME_KEY = 'flappy-resume';
const RESUME_TTL = 24 * 60 * 60 * 1000;

function readBest() {
  try {
    return +localStorage.getItem(BEST_KEY) || 0;
  } catch (err) {
    console.warn(err);
    return 0;
  }
}

function clearResume() {
  try {
    localStorage.removeItem(RESUME_KEY);
  } catch (err) {
    console.warn('Không thể xóa bản lưu ván chơi:', err);
  }
}

function readResume(best) {
  try {
    const raw = localStorage.getItem(RESUME_KEY);
    if (!raw) return null;

    const saved = JSON.parse(raw);
    const state = saved?.state;
    const now = Date.now();
    const valid =
      Number.isFinite(saved?.savedAt) &&
      saved.savedAt <= now &&
      now - saved.savedAt <= RESUME_TTL &&
      Number.isFinite(state?.y) &&
      state.y >= R &&
      state.y <= GROUND - R &&
      Number.isFinite(state?.vy) &&
      state.vy >= -430 &&
      state.vy <= 700 &&
      Number.isFinite(state?.scroll) &&
      state.scroll >= 0 &&
      Number.isFinite(state?.t) &&
      state.t >= 0 &&
      Number.isSafeInteger(state?.score) &&
      state.score >= 0 &&
      Array.isArray(state?.pipes) &&
      state.pipes.length > 0 &&
      state.pipes.every(
        (pipe) =>
          Number.isFinite(pipe?.x) &&
          pipe.x >= -PIPE_W - 8 &&
          Number.isFinite(pipe?.top) &&
          pipe.top >= 50 &&
          pipe.top <= GROUND - GAP - 100 &&
          typeof pipe.passed === 'boolean',
      );

    if (!valid) {
      clearResume();
      return null;
    }

    return {
      ...newGame(best),
      ...state,
      pipes: state.pipes.map((pipe) => ({ ...pipe })),
      phase: 'play',
    };
  } catch (err) {
    console.warn('Bản lưu ván chơi không hợp lệ:', err);
    clearResume();
    return null;
  }
}

const initialBest = readBest();
const initialGame = readResume(initialBest) || newGame(initialBest);

export function useGame(canvasRef, activeSkin = null, onGameOver = null, userBestScore = null) {
  const game = useRef(initialGame);
  const initialNetworkMode =
    initialGame.phase === 'play' && typeof navigator !== 'undefined' && !navigator.onLine
      ? 'offline'
      : initialGame.phase === 'play'
        ? 'countdown'
        : null;
  const networkModeRef = useRef(initialNetworkMode);
  const [network, setNetwork] = useState({
    mode: initialNetworkMode,
    countdown: initialNetworkMode === 'countdown' ? 3 : null,
  });
  const [hud, setHud] = useState({
    phase: initialGame.phase,
    score: initialGame.score,
    best: initialGame.best,
    newBest: initialGame.newBest,
  });

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

    let countdownTimer;
    let countdownEndsAt;
    let countdownValue = 3;

    const setNetworkMode = (mode, countdown = null) => {
      networkModeRef.current = mode;
      setNetwork({ mode, countdown });
    };

    const saveResume = () => {
      try {
        localStorage.setItem(
          RESUME_KEY,
          JSON.stringify({
            savedAt: Date.now(),
            state: {
              y: g.y,
              vy: g.vy,
              scroll: g.scroll,
              t: g.t,
              score: g.score,
              pipes: g.pipes.map((pipe) => ({ ...pipe })),
            },
          }),
        );
      } catch (err) {
        console.warn('Không thể lưu ván chơi để tiếp tục:', err);
      }
    };

    const stopCountdown = () => {
      window.clearTimeout(countdownTimer);
      countdownTimer = undefined;
      countdownEndsAt = undefined;
    };

    const tickCountdown = () => {
      const remaining = Math.ceil((countdownEndsAt - Date.now()) / 1000);
      if (remaining <= 0) {
        stopCountdown();
        clearResume();
        setNetworkMode(null);
        return;
      }
      if (remaining !== countdownValue) {
        countdownValue = remaining;
        setNetwork({ mode: 'countdown', countdown: remaining });
      }
      countdownTimer = window.setTimeout(tickCountdown, 100);
    };

    const startCountdown = () => {
      stopCountdown();
      countdownValue = 3;
      countdownEndsAt = Date.now() + 3000;
      setNetworkMode('countdown', countdownValue);
      tickCountdown();
    };

    const onOffline = () => {
      if (g.phase !== 'play' || networkModeRef.current === 'offline') return;
      stopCountdown();
      saveResume();
      setNetworkMode('offline');
    };

    const onOnline = () => {
      if (g.phase === 'play' && networkModeRef.current === 'offline') {
        startCountdown();
      }
    };

    window.addEventListener('offline', onOffline);
    window.addEventListener('online', onOnline);
    if (networkModeRef.current === 'countdown') startCountdown();

    // Bắt phím Space hoặc Mũi tên lên để đập cánh
    const onKey = (e) => {
      if (e.code !== 'Space' && e.code !== 'ArrowUp') return;
      e.preventDefault();
      if (!e.repeat && networkModeRef.current === null) flap(g);
    };
    window.addEventListener('keydown', onKey);

    let raf;
    let prev = performance.now();
    let acc = 0;
    let shown = g.phase + g.score;
    let lastPhase = g.phase;

    let maxPipes = 0;
let lastPipeSample = 0;

    // Vòng lặp animation frame
    const frame = (now) => {
      if (networkModeRef.current === null) {
        acc += Math.min((now - prev) / 1000, 0.1);
      } else {
        acc = 0;
      }
      prev = now;

      while (acc >= DT) {
        step(g, DT, calm);
        acc -= DT;
      }

      // Vẽ Canvas với theme màu và skin đang chọn
      draw(ctx, g, colors, activeSkinRef.current);

      maxPipes = Math.max(maxPipes, g.pipes.length);

if (now - lastPipeSample >= 10000) {
  lastPipeSample = now;
  console.log(`[Task 2] phase=${g.phase}, pipes=${g.pipes.length}, max=${maxPipes}`);
}

      // Kích hoạt khi chim chết (chuyển sang 'dead')
      if (lastPhase !== 'dead' && g.phase === 'dead') {
        clearResume();
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
      stopCountdown();
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('offline', onOffline);
      window.removeEventListener('online', onOnline);
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

  const gameInput = () => {
    if (networkModeRef.current === null) flap(game.current);
  };
  const restart = () => {
    clearResume();
    networkModeRef.current = null;
    setNetwork({ mode: null, countdown: null });
    reset(game.current);
  };

  return [
    { ...hud, best: effectiveBest, networkMode: network.mode, countdown: network.countdown },
    gameInput,
    restart,
  ];
}
