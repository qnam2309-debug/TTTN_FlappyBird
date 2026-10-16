import { useState } from 'react'
import { api, saveSession } from '../api'

export default function AuthScreen({ onAuthed }) {
  const [mode, setMode] = useState('login')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { token, user } = await api(`/auth/${mode}`, { method: 'POST', body: { username, password } })
      saveSession(token, user)
      onAuthed(user)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const input = 'w-full rounded-lg border border-white/20 bg-white/10 px-4 py-2.5 text-white placeholder-white/50 outline-none focus:border-yellow-300'

  return (
    <form onSubmit={submit} className="w-full max-w-sm space-y-4 rounded-2xl bg-black/30 p-6 backdrop-blur">
      <h1 className="text-center text-3xl font-extrabold text-yellow-300">🐤 Flappy Bird</h1>
      <p className="text-center text-white/80">{mode === 'login' ? 'Đăng nhập để chơi' : 'Tạo tài khoản mới'}</p>
      <input className={input} placeholder="Tên đăng nhập" value={username} onChange={(e) => setUsername(e.target.value)} autoFocus />
      <input className={input} type="password" placeholder="Mật khẩu (tối thiểu 6 ký tự)" value={password} onChange={(e) => setPassword(e.target.value)} />
      {error && <p className="rounded-lg bg-red-500/20 px-3 py-2 text-sm text-red-200">{error}</p>}
      <button disabled={loading} className="w-full rounded-lg bg-yellow-400 py-2.5 font-bold text-slate-900 transition hover:bg-yellow-300 disabled:opacity-60">
        {loading ? 'Đang xử lý...' : mode === 'login' ? 'Đăng nhập' : 'Đăng ký'}
      </button>
      <button type="button" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError('') }} className="w-full text-sm text-white/80 underline">
        {mode === 'login' ? 'Chưa có tài khoản? Đăng ký' : 'Đã có tài khoản? Đăng nhập'}
      </button>
    </form>
  )
}
