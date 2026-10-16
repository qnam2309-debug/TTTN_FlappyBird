import { useCallback, useEffect, useState } from 'react'
import { api } from '../api'
import { getSkinStyle } from '../skinStyles'

export default function Skins({ onBack, onUnauthorized }) {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  const handleError = useCallback((e) => (e.status === 401 ? onUnauthorized() : setError(e.message)), [onUnauthorized])

  useEffect(() => {
    api('/skins').then(setData).catch(handleError)
  }, [handleError])

  async function equip(skinId) {
    setError('')
    try {
      await api('/skins/equip', { method: 'POST', body: { skinId } })
      setData(await api('/skins'))
    } catch (e) {
      handleError(e)
    }
  }

  return (
    <div className="w-full max-w-md rounded-2xl bg-black/30 p-6 text-white backdrop-blur">
      <h2 className="mb-1 text-center text-2xl font-bold text-yellow-300">🎨 Skin</h2>
      {data && <p className="mb-4 text-center text-sm text-white/70">Điểm cao nhất của bạn: {data.bestScore}</p>}
      {error && <p className="mb-3 rounded-lg bg-red-500/20 px-3 py-2 text-center text-sm text-red-200">{error}</p>}
      {!data && !error && <p className="text-center text-white/70">Đang tải...</p>}
      <ul className="space-y-2">
        {data?.skins.map((s) => {
          const st = getSkinStyle(s.id)
          return (
            <li key={s.id} className={`flex items-center gap-3 rounded-lg px-4 py-3 ${s.equipped ? 'bg-yellow-400/25 ring-1 ring-yellow-300' : 'bg-white/10'} ${s.unlocked ? '' : 'opacity-60'}`}>
              <span className="h-10 w-10 shrink-0 rounded-full border-2 border-white/40" style={{ background: st.body, boxShadow: st.glow ? `0 0 12px ${st.glow}` : undefined }} />
              <div className="flex-1">
                <p className="font-semibold">{s.name}</p>
                <p className="text-xs text-white/70">{s.unlocked ? 'Đã mở khoá' : `🔒 Cần ${s.unlockScore} điểm`}</p>
              </div>
              {s.equipped ? (
                <span className="text-sm font-bold text-yellow-300">Đang dùng</span>
              ) : (
                <button disabled={!s.unlocked} onClick={() => equip(s.id)} className="rounded-lg bg-yellow-400 px-3 py-1.5 text-sm font-bold text-slate-900 hover:bg-yellow-300 disabled:cursor-not-allowed disabled:bg-white/20 disabled:text-white/50">
                  Trang bị
                </button>
              )}
            </li>
          )
        })}
      </ul>
      <button onClick={onBack} className="mt-5 w-full rounded-lg bg-white/15 py-2.5 font-semibold hover:bg-white/25">← Quay lại</button>
    </div>
  )
}
