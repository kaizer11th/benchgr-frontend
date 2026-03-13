import { useEffect } from 'react'
import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom'
import { LayoutDashboard, Trophy, LogOut, LogIn, Zap } from 'lucide-react'
import { useAuthStore } from './hooks/useAuth'
import LeaderboardPage from './pages/Leaderboard'
import DashboardPage from './pages/Dashboard'
import AuthPage from './pages/Auth'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { token } = useAuthStore()
  if (!token) return <Navigate to="/auth" replace />
  return <>{children}</>
}

export default function App() {
  const { user, token, fetchMe, logout } = useAuthStore()
  const location = useLocation()

  useEffect(() => { if (token) fetchMe() }, [])

  if (location.pathname === '/auth') return (
    <Routes>
      <Route path="/auth" element={<AuthPage />} />
    </Routes>
  )

  return (
    <div className="min-h-screen bg-[#060709] flex flex-col" style={{ fontFamily: "'JetBrains Mono', 'Courier New', monospace" }}>
      {/* Ambient bg */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-100px] left-1/3 w-[700px] h-[700px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(79,142,247,0.06) 0%, transparent 65%)', filter: 'blur(1px)' }} />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.04) 0%, transparent 65%)' }} />
        <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(rgba(79,142,247,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(79,142,247,0.025) 1px, transparent 1px)', backgroundSize: '80px 80px' }} />
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(79,142,247,0.04) 0%, transparent 50%)' }} />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 h-14 flex items-center justify-between px-6" style={{ background: 'rgba(6,7,9,0.8)', backdropFilter: 'blur(24px)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="flex items-center gap-3">
          <div className="relative w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #4f8ef7 0%, #7c3aed 100%)', boxShadow: '0 0 20px rgba(79,142,247,0.4)' }}>
            <Zap className="w-4 h-4 text-white fill-white" />
          </div>
          <span className="text-sm font-black tracking-[0.2em] text-white">BENCH<span style={{ color: '#4f8ef7' }}>GR</span></span>
        </div>

        <nav className="flex items-center p-1 rounded-lg gap-0.5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
          <NavLink to="/" icon={<Trophy className="w-3 h-3" />} label="LEADERBOARD" active={location.pathname === '/'} />
          {token && <NavLink to="/dashboard" icon={<LayoutDashboard className="w-3 h-3" />} label="DASHBOARD" active={location.pathname === '/dashboard'} />}
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <span className="text-xs font-black tracking-widest" style={{ color: '#4f8ef7' }}>{user.username}</span>
              <button onClick={logout} className="flex items-center gap-1.5 text-[10px] font-black tracking-widest transition-all px-3 py-1.5 rounded-md hover:text-white" style={{ color: '#444', border: '1px solid rgba(255,255,255,0.06)' }}>
                <LogOut className="w-3 h-3" /> SIGN OUT
              </button>
            </>
          ) : (
            <Link to="/auth" className="flex items-center gap-1.5 text-[10px] font-black tracking-widest text-white px-4 py-1.5 rounded-md transition-all hover:opacity-80" style={{ background: 'linear-gradient(135deg, #4f8ef7, #7c3aed)', boxShadow: '0 0 24px rgba(79,142,247,0.35)' }}>
              <LogIn className="w-3 h-3" /> SIGN IN
            </Link>
          )}
        </div>
      </header>

      {/* Page */}
      <main className="flex-1 px-6 py-8 max-w-[1400px] mx-auto w-full relative">
        <Routes>
          <Route path="/" element={<LeaderboardPage />} />
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/auth" element={<AuthPage />} />
        </Routes>
      </main>

      {/* Footer */}
      <footer className="relative" style={{ borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(4,5,7,0.95)' }}>
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(0deg, rgba(79,142,247,0.02) 0%, transparent 100%)' }} />
        <div className="max-w-[1400px] mx-auto px-6 py-5 flex items-center justify-between gap-4 flex-wrap relative">
          <div className="flex items-center gap-4">
            <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #4f8ef7, #7c3aed)' }}>
              <Zap className="w-3 h-3 text-white fill-white" />
            </div>
            <span className="text-[10px] font-black tracking-[0.2em]" style={{ color: '#1e1e28' }}>BENCHGR — GPU BENCHMARK LEADERBOARD</span>
          </div>
          <div className="flex items-center gap-6">
            <span className="text-[10px] font-black tracking-widest" style={{ color: '#252530' }}>
              BUILT BY <span style={{ color: '#4f8ef7' }}>SAN</span>
            </span>
            <div className="w-px h-3" style={{ background: 'rgba(255,255,255,0.06)' }} />
            <span className="text-[10px] font-black tracking-widest" style={{ color: '#1a1a22' }}>© 2026</span>
          </div>
        </div>
      </footer>
    </div>
  )
}

function NavLink({ to, icon, label, active }: { to: string; icon: React.ReactNode; label: string; active: boolean }) {
  return (
    <Link
      to={to}
      className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-black tracking-widest rounded-md transition-all"
      style={active
        ? { background: 'rgba(79,142,247,0.12)', color: '#4f8ef7', boxShadow: 'inset 0 0 12px rgba(79,142,247,0.08)' }
        : { color: '#333' }}
    >
      {icon} {label}
    </Link>
  )
}
