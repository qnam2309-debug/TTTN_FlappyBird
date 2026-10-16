import { useCallback, useEffect, useRef, useState } from 'react'
import { api } from '../api'
import { getSkinStyle } from '../skinStyles'

const W = 400
const H = 600
const GROUND = 80
const BIRD_X = 90
const R = 14
const GRAVITY = 0.42
const FLAP = -7.4
const SPEED = 2.7
const GAP = 150
const PIPE_W = 64
const PIPE_DIST = 210

const newGame = () => ({ phase: 'ready', y: H / 2 - 40, vy: 0, t: 0, groundX: 0, pipes: [], score: 0 })

// Trả về 'scored' | 'dead' | null
function update(g, dt) {
  g.t += dt
  if (g.phase === 'ready') {
    g.y = H / 2 - 40 + Math.sin(g.t / 10) * 8
    return null
  }
  if (g.phase === 'over') {
    if (g.y < H - GROUND - R) {
      g.vy += GRAVITY * dt
      g.y = Math.min(g.y + g.vy * dt, H - GROUND - R)
    }
    return null
  }

  g.vy += GRAVITY * dt
  g.y += g.vy * dt
  g.groundX = (g.groundX + SPEED * dt) % 24

  const last = g.pipes[g.pipes.length - 1]
  if (!last || last.x < W - PIPE_DIST) {
    g.pipes.push({ x: W, gapTop: 70 + Math.random() * (H - GROUND - GAP - 140), passed: false })
  }
  for (const p of g.pipes) p.x -= SPEED * dt
  g.pipes = g.pipes.filter((p) => p.x > -PIPE_W)

  let event = null
  for (const p of g.pipes) {
    if (!p.passed && p.x + PIPE_W < BIRD_X - R) {
      p.passed = true
      g.score += 1
      event = 'scored'
    }
  }

  if (g.y - R < 0) {
    g.y = R
    g.vy = 0
  }
  if (g.y + R >= H - GROUND) {
    g.y = H - GROUND - R
    return 'dead'
  }
  for (const p of g.pipes) {
    const overlapX = BIRD_X + R - 3 > p.x && BIRD_X - R + 3 < p.x + PIPE_W
    if (overlapX && (g.y - R + 3 < p.gapTop || g.y + R - 3 > p.gapTop + GAP)) return 'dead'
  }
  return event
}

function drawPipe(ctx, x, top, bottom) {
  ctx.fillStyle = '#22c55e'
  ctx.strokeStyle = '#166534'
  ctx.lineWidth = 3
  // thân + mũ ống trên
  ctx.fillRect(x, 0, PIPE_W, top)
  ctx.strokeRect(x, 0, PIPE_W, top)
  ctx.fillRect(x - 4, top - 24, PIPE_W + 8, 24)
  ctx.strokeRect(x - 4, top - 24, PIPE_W + 8, 24)
  // thân + mũ ống dưới
  ctx.fillRect(x, bottom, PIPE_W, H - GROUND - bottom)
  ctx.strokeRect(x, bottom, PIPE_W, H - GROUND - bottom)
  ctx.fillRect(x - 4, bottom, PIPE_W + 8, 24)
  ctx.strokeRect(x - 4, bottom, PIPE_W + 8, 24)
}

function drawBird(ctx, g, skin) {
  const st = getSkinStyle(skin)
  ctx.save()
  ctx.translate(BIRD_X, g.y)
  ctx.rotate(Math.max(-0.5, Math.min(1.2, g.vy * 0.06)))
  if (st.glow) {
    ctx.shadowColor = st.glow
    ctx.shadowBlur = 18
  }
  ctx.fillStyle = st.body
  ctx.strokeStyle = '#1e293b'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.ellipse(0, 0, R + 3, R, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.stroke()
  ctx.shadowBlur = 0
  // cánh (vỗ theo thời gian)
  ctx.fillStyle = st.wing
  ctx.beginPath()
  ctx.ellipse(-5, 3 + Math.sin(g.t * 0.6) * 2, 8, 5, -0.3, 0, Math.PI * 2)
  ctx.fill()
  // băng đầu ninja
  if (st.headband) {
    ctx.fillStyle = st.headband
    ctx.fillRect(-4, -R + 1, 20, 5)
    ctx.fillRect(-14, -R + 2, 10, 3)
  }
  // mắt
  ctx.fillStyle = '#fff'
  ctx.beginPath()
  ctx.arc(8, -5, 5, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#111'
  ctx.beginPath()
  ctx.arc(10, -5, 2.4, 0, Math.PI * 2)
  ctx.fill()
  // mỏ
  ctx.fillStyle = '#f97316'
  ctx.beginPath()
  ctx.moveTo(14, 0)
  ctx.lineTo(24, 3)
  ctx.lineTo(14, 7)
  ctx.closePath()
  ctx.fill()
  ctx.restore()
}

function draw(ctx, g, skin) {
  const sky = ctx.createLinearGradient(0, 0, 0, H)
  sky.addColorStop(0, '#38bdf8')
  sky.addColorStop(1, '#bae6fd')
  ctx.fillStyle = sky
  ctx.fillRect(0, 0, W, H)

  // mây
  ctx.fillStyle = 'rgba(255,255,255,0.7)'
  for (const [cx, cy] of [[70, 110], [260, 70], [340, 190]]) {
    const ox = ((cx - g.t * 0.3) % (W + 120) + W + 120) % (W + 120) - 60
    ctx.beginPath()
    ctx.arc(ox, cy, 18, 0, Math.PI * 2)
    ctx.arc(ox + 20, cy + 4, 22, 0, Math.PI * 2)
    ctx.arc(ox + 42, cy, 16, 0, Math.PI * 2)
    ctx.fill()
  }

  for (const p of g.pipes) drawPipe(ctx, p.x, p.gapTop, p.gapTop + GAP)

  // mặt đất
  ctx.fillStyle = '#d6a15c'
  ctx.fillRect(0, H - GROUND, W, GROUND)
  ctx.fillStyle = '#65a30d'
  ctx.fillRect(0, H - GROUND, W, 14)
  ctx.fillStyle = '#4d7c0f'
  for (let x = -24 + (-g.groundX % 24); x < W; x += 24) ctx.fillRect(x, H - GROUND + 14, 12, 6)

  drawBird(ctx, g, skin)

  if (g.phase === 'playing') {
    ctx.font = 'bold 56px system-ui, sans-serif'
    ctx.textAlign = 'center'
    ctx.lineWidth = 6
    ctx.strokeStyle = '#1e293b'
    ctx.strokeText(String(g.score), W / 2, 90)
    ctx.fillStyle = '#fff'
    ctx.fillText(String(g.score), W / 2, 90)
  }
}

export default function Game({ onExit, onUnauthorized }) {
  const canvasRef = useRef(null)
  const gameRef = useRef(null)
  const skinRef = useRef('default')
  const [phase, setPhase] = useState('ready')
  const [score, setScore] = useState(0)
  const [result, setResult] = useState(null)
  const [saveError, setSaveError] = useState('')

  // Lấy skin đang trang bị
  useEffect(() => {
    api('/skins')
      .then((d) => { skinRef.current = d.equippedSkin })
      .catch((e) => { if (e.status === 401) onUnauthorized() })
  }, [onUnauthorized])

  // Vòng lặp game
  useEffect(() => {
    gameRef.current = newGame()
    const ctx = canvasRef.current.getContext('2d')
    let raf
    let last = performance.now()
    const loop = (now) => {
      const dt = Math.min((now - last) / 16.667, 2.5)
      last = now
      const g = gameRef.current
      const ev = update(g, dt)
      if (ev === 'scored') setScore(g.score)
      if (ev === 'dead') {
        g.phase = 'over'
        setScore(g.score)
        setPhase('over')
      }
      draw(ctx, g, skinRef.current)
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [])

  // Gửi điểm lên server khi kết thúc lượt
  useEffect(() => {
    if (phase !== 'over') return
    api('/scores', { method: 'POST', body: { score } })
      .then(setResult)
      .catch((e) => (e.status === 401 ? onUnauthorized() : setSaveError(e.message)))
  }, [phase, score, onUnauthorized])

  const flap = useCallback(() => {
    const g = gameRef.current
    if (!g || g.phase === 'over') return
    if (g.phase === 'ready') {
      g.phase = 'playing'
      setPhase('playing')
    }
    g.vy = FLAP
  }, [])

  useEffect(() => {
    const onKey = (e) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault()
        flap()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [flap])

  function restart() {
    gameRef.current = newGame()
    setPhase('ready')
    setScore(0)
    setResult(null)
    setSaveError('')
  }

  return (
    <div className="relative select-none" style={{ height: 'min(88vh, 600px)', aspectRatio: '2 / 3' }}>
      <canvas ref={canvasRef} width={W} height={H} onPointerDown={flap} className="h-full w-full touch-none rounded-2xl shadow-2xl" />

      {phase === 'ready' && (
        <div className="pointer-events-none absolute inset-x-0 top-1/2 text-center text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.7)]">
          <p className="text-2xl font-extrabold">Sẵn sàng?</p>
          <p className="mt-1 text-sm">Nhấn Space / chạm màn hình để bay</p>
        </div>
      )}

      {phase === 'over' && (
        <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/50 p-4">
          <div className="w-full max-w-xs space-y-3 rounded-2xl bg-slate-900/95 p-5 text-center text-white">
            <h2 className="text-2xl font-extrabold text-red-400">Game Over</h2>
            <p>Điểm: <b className="text-3xl text-yellow-300">{score}</b></p>
            {!result && !saveError && <p className="text-sm text-white/60">Đang lưu điểm...</p>}
            {saveError && <p className="text-sm text-red-300">Không lưu được điểm: {saveError}</p>}
            {result && (
              <>
                <p className="text-sm text-white/80">Cao nhất: {result.bestScore}</p>
                {result.newRecord && <p className="font-bold text-yellow-300">🎉 Kỷ lục mới!</p>}
                {result.newlyUnlockedSkins.filter((s) => s.id !== 'default').map((s) => (
                  <p key={s.id} className="text-sm text-emerald-300">🔓 Mở khoá skin: {s.name}</p>
                ))}
              </>
            )}
            <div className="flex gap-2 pt-1">
              <button onClick={restart} className="flex-1 rounded-lg bg-yellow-400 py-2 font-bold text-slate-900 hover:bg-yellow-300">Chơi lại</button>
              <button onClick={onExit} className="flex-1 rounded-lg bg-white/15 py-2 font-semibold hover:bg-white/25">Menu</button>
            </div>
          </div>
        </div>
      )}

      {phase !== 'over' && (
        <button onClick={onExit} className="absolute left-3 top-3 rounded-lg bg-black/40 px-3 py-1 text-sm text-white hover:bg-black/60">← Menu</button>
      )}
    </div>
  )
}
