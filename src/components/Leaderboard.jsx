import { useEffect, useState } from 'react'
import { api } from '../api'

export default function Leaderboard({ onBack, onUnauthorized }) {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api('/leaderboard?limit=20')
      .then(setData)
      .catch((e) => (e.status === 401 ? onUnauthorized() : setError(e.message)))
  }, [onUnauthorized])

  return (
    <div className="w-full max-w-md rounded-2xl bg-black/30 p-6 text-white backdrop-blur">
      <h2 className="mb-4 text-center text-2xl font-bold text-yellow-300">🏆 Bảng xếp hạng</h2>
      {error && <p className="text-center text-red-200">{error}</p>}
      {!data && !error && <p className="text-center text-white/70">Đang tải...</p>}
      {data && data.leaderboard.length === 0 && <p className="text-center text-white/70">Chưa có ai ghi điểm. Hãy là người đầu tiên!</p>}
      {data && (
        <ol className="space-y-2">
          {data.leaderboard.map((r) => (
            <li key={r.rank} className={`flex items-center justify-between rounded-lg px-4 py-2 ${data.me?.rank === r.rank ? 'bg-yellow-400/30 ring-1 ring-yellow-300' : 'bg-white/10'}`}>
              <span className="w-8 font-bold">{r.rank <= 3 ? ['🥇', '🥈', '🥉'][r.rank - 1] : r.rank}</span>
              <span className="flex-1 truncate">{r.username}</span>
              <span className="font-bold text-yellow-300">{r.bestScore}</span>
            </li>
          ))}
        </ol>
      )}
      {data?.me && data.me.rank > data.leaderboard.length && (
        <p className="mt-3 text-center text-sm text-white/80">Hạng của bạn: #{data.me.rank} ({data.me.bestScore} điểm)</p>
      )}
      <button onClick={onBack} className="mt-5 w-full rounded-lg bg-white/15 py-2.5 font-semibold hover:bg-white/25">← Quay lại</button>
    </div>
  )
}
