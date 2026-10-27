// Lưu ván đang chơi trong tối đa 24 giờ (chỉ ở trình duyệt này).
const KEY = 'flappy-resume-v1';
const TTL = 24 * 60 * 60 * 1000;
export function saveRun(g) {
  if (g.phase !== 'play') return;
  try {
    localStorage.setItem(KEY, JSON.stringify({savedAt: Date.now(), phase: g.phase, y:g.y, vy:g.vy, scroll:g.scroll, t:g.t, score:g.score, best:g.best, pipes:g.pipes}));
  } catch (e) { console.warn('Không lưu được ván:', e); }
}
export function clearRun() { try { localStorage.removeItem(KEY); } catch (e) { console.warn(e); } }
export function restoreRun(g) {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return false;
    const data = JSON.parse(raw);
    if (Date.now() - data.savedAt > TTL || data.savedAt > Date.now() || data.phase !== 'play' || !Array.isArray(data.pipes) || !data.pipes.length || ![data.y,data.vy,data.scroll,data.t,data.score].every(Number.isFinite)) { clearRun(); return false; }
    Object.assign(g, {phase:'play', y:data.y, vy:data.vy, scroll:data.scroll, t:data.t, score:data.score, best:Math.max(g.best,Number(data.best)||0), pipes:data.pipes.map(v=>({x:v.x,top:v.top,passed:!!v.passed})), paused:true, newBest:false});
    return true;
  } catch (e) { console.warn('Không khôi phục được ván:',e); clearRun(); return false; }
}
