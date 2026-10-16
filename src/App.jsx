import { useCallback, useState } from 'react'
import { clearSession, loadUser } from './api'
import AuthScreen from './components/AuthScreen'
import Game from './components/Game'
import Leaderboard from './components/Leaderboard'
import Skins from './components/Skins'

export default function App() {
  const [user, setUser] = useState(loadUser)
  const [screen, setScreen] = useState('menu') // menu | play | leaderboard | skins

  const logout = useCallback(() => {
    clearSession()
    setUser(null)
    setScreen('menu')
  }, [])
  const toMenu = useCallback(() => setScreen('menu'), [])

  const btn = 'w-full rounded-xl py-3 text-lg font-bold transition'

  return (
    <div className="flex min-h-full flex-col items-center justify-center bg-gradient-to-b from-sky-500 to-sky-800 p-4">
      {!user ? (
        <AuthScreen onAuthed={setUser} />
      ) : screen === 'play' ? (
        <Game onExit={toMenu} onUnauthorized={logout} />
      ) : screen === 'leaderboard' ? (
        <Leaderboard onBack={toMenu} onUnauthorized={logout} />
      ) : screen === 'skins' ? (
        <Skins onBack={toMenu} onUnauthorized={logout} />
      ) : (
        <div className="w-full max-w-sm space-y-3 rounded-2xl bg-black/30 p-6 text-center text-white backdrop-blur">
          <h1 className="text-4xl font-extrabold text-yellow-300">🐤 Flappy Bird</h1>
          <p className="pb-2 text-white/80">Xin chào, <b>{user.username}</b>!</p>
          <button onClick={() => setScreen('play')} className={`${btn} bg-yellow-400 text-slate-900 hover:bg-yellow-300`}>▶ Chơi</button>
          <button onClick={() => setScreen('leaderboard')} className={`${btn} bg-white/15 hover:bg-white/25`}>🏆 Bảng xếp hạng</button>
          <button onClick={() => setScreen('skins')} className={`${btn} bg-white/15 hover:bg-white/25`}>🎨 Skin</button>
          <button onClick={logout} className="pt-2 text-sm text-white/70 underline">Đăng xuất</button>
        </div>
      )}
    </div>
  )
}
