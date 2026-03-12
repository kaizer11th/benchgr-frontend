import { useEffect } from 'react'
import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom'
import { LayoutDashboard, Trophy, LogOut, LogIn } from 'lucide-react'
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

  // Full-screen auth page, no shell
  if (location.pathname === '/auth') return (
    <Routes>
      <Route path="/auth" element={<AuthPage />} />
    </Routes>
  )

  return (
    <div className="min-h-screen bg-[#08090c] flex flex-col">
      {/* Top bar */}
      <header className="sticky top-0 z-50 h-14 bg-[#0d0f14] border-b border-[#1e2130] flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 bg-[#5b8dee] rounded-md flex items-center justify-center">
            <span className="text-white text-xs font-bold">B</span>
          </div>
          <span className="font-bold text-white tracking-wide">Bench<span className="text-[#5b8dee]">GR</span></span>
        </div>

        <nav className="flex items-center gap-1 bg-[#08090c] border border-[#1e2130] rounded-md overflow-hidden">
          <NavLink to="/" icon={<Trophy className="w-3 h-3" />} label="Leaderboard" active={location.pathname === '/'} />
          {token && <NavLink to="/dashboard" icon={<LayoutDashboard className="w-3 h-3" />} label="Dashboard" active={location.pathname === '/dashboard'} />}
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <span className="text-xs text-[#7a8099] font-mono">{user.username}</span>
              <button onClick={logout} className="flex items-center gap-1.5 text-xs text-[#7a8099] hover:text-white transition-colors border border-[#1e2130] rounded px-2.5 py-1.5">
                <LogOut className="w-3 h-3" /> Sign out
              </button>
            </>
          ) : (
            <Link to="/auth" className="flex items-center gap-1.5 text-xs text-white bg-[#5b8dee] hover:opacity-90 rounded px-3 py-1.5 transition-opacity">
              <LogIn className="w-3 h-3" /> Sign in
            </Link>
          )}
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 px-6 py-6 max-w-[1400px] mx-auto w-full">
        <Routes>
          <Route path="/" element={<LeaderboardPage />} />
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/auth" element={<AuthPage />} />
        </Routes>
      </main>
    </div>
  )
}

function NavLink({ to, icon, label, active }: { to: string; icon: React.ReactNode; label: string; active: boolean }) {
  return (
    <Link
      to={to}
      className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium border-r border-[#1e2130] last:border-0 transition-colors ${
        active ? 'bg-[rgba(91,141,238,0.12)] text-[#5b8dee]' : 'text-[#7a8099] hover:text-white'
      }`}
    >
      {icon} {label}
    </Link>
  )
}
