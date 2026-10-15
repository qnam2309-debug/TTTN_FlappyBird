// D:\STUDY\TAILIEUHOC_\TTTN\flappy-bird\src\game\useGame.js
// React Hook kết nối game loop Canvas với React, bắt sự kiện phím và lưu điểm kỷ lục

import { useEffect, useRef, useState } from 'react';
import { draw, readColors } from './draw.js';
import { DT, flap, newGame, reset, step } from './game.js';

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

export function useGame(canvasRef, activeSkin = null, onGameOver = null) {
  const game = useRef(initialGame);
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
    let shown = g.phase + g.score;
    let lastPhase = g.phase;

    // Vòng lặp animation frame
    const frame = (now) => {
      acc += Math.min((now - prev) / 1000, 0.1);
      prev = now;

      while (acc >= DT) {
        step(g, DT, calm);
        acc -= DT;
      }

      // Vẽ Canvas với theme màu và skin đang chọn
      draw(ctx, g, colors, activeSkinRef.current);

      // Kích hoạt khi chim chết (chuyển sang 'dead')
      if (lastPhase !== 'dead' && g.phase === 'dead') {
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
      window.removeEventListener('keydown', onKey);
      dark.removeEventListener('change', onTheme);
    };
  }, [canvasRef]);

  // Tự động lưu điểm cao nhất vào localStorage
  useEffect(() => {
    try {
      localStorage.setItem(BEST_KEY, hud.best);
    } catch (err) {
      console.warn(err);
    }
  }, [hud.best]);

  return [hud, () => flap(game.current), () => reset(game.current)];
}
