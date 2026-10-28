// src/game/sound.js
// Quản lý âm thanh trò chơi bằng Web Audio API thuần (không dùng file MP3 ngoài).
// Có master gain để chỉnh âm lượng tổng.

let audioCtx = null;
let masterGain = null;
let masterVolume = 0.6;

function getAudioContext() {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// Nút gain tổng (mọi âm thanh đi qua đây trước khi ra loa)
function getMasterGain(ctx) {
  if (!masterGain) {
    masterGain = ctx.createGain();
    masterGain.gain.value = masterVolume;
    masterGain.connect(ctx.destination);
  }
  return masterGain;
}

// Đặt âm lượng tổng (0..1)
export function setVolume(v) {
  masterVolume = Math.max(0, Math.min(1, Number(v) || 0));
  if (masterGain) {
    masterGain.gain.value = masterVolume;
  }
}

export function getVolume() {
  return masterVolume;
}

// 1. Tiếng chim đập cánh bay (Flap)
export function playFlap() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    const now = ctx.currentTime;

    osc.frequency.setValueAtTime(350, now);
    osc.frequency.exponentialRampToValueAtTime(700, now + 0.08);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

    osc.connect(gain);
    gain.connect(getMasterGain(ctx));

    osc.start(now);
    osc.stop(now + 0.08);
  } catch (e) {
    console.debug('Audio error:', e);
  }
}

// 2. Tiếng ghi điểm khi vượt qua cột (Score)
export function playScore() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const out = getMasterGain(ctx);

    // Nốt 1
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(987.77, now); // Note B5
    gain1.gain.setValueAtTime(0.25, now);
    gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.09);
    osc1.connect(gain1);
    gain1.connect(out);
    osc1.start(now);
    osc1.stop(now + 0.09);

    // Nốt 2
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1318.51, now + 0.09); // Note E6
    gain2.gain.setValueAtTime(0.25, now + 0.09);
    gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.22);
    osc2.connect(gain2);
    gain2.connect(out);
    osc2.start(now + 0.09);
    osc2.stop(now + 0.22);
  } catch (e) {
    console.debug('Audio error:', e);
  }
}

// 3. Tiếng va chạm (Hit)
export function playHit() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'square';
    const now = ctx.currentTime;

    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.12);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

    osc.connect(gain);
    gain.connect(getMasterGain(ctx));

    osc.start(now);
    osc.stop(now + 0.12);
  } catch (e) {
    console.debug('Audio error:', e);
  }
}

// 4. Tiếng rơi kết thúc ván (Die)
export function playDie() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    const now = ctx.currentTime;

    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(60, now + 0.25);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

    osc.connect(gain);
    gain.connect(getMasterGain(ctx));

    osc.start(now);
    osc.stop(now + 0.25);
  } catch (e) {
    console.debug('Audio error:', e);
  }
}
