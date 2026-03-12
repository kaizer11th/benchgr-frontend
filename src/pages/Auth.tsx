import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../hooks/useAuth'

export default function AuthPage() {
  const [mode, setMode]       = useState<'login' | 'register'>('login')
  const [username, setUsername] = useState('')
  const [email, setEmail]     = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)
  const { login, register }   = useAuthStore()
  const navigate              = useNavigate()

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (mode === 'login') await login(email, password)
      else await register(username, email, password)
      navigate('/dashboard')
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#08090c] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-[#5b8dee] rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold">B</span>
            </div>
            <span className="text-xl font-bold text-white tracking-wide">Bench<span className="text-[#5b8dee]">GR</span></span>
          </div>
          <p className="text-xs text-[#7a8099]">GPU Benchmark Leaderboard</p>
        </div>

        <div className="bg-[#111318] border border-[#1e2130] rounded-lg p-6">
          {/* Tabs */}
          <div className="flex bg-[#0d0f14] border border-[#1e2130] rounded-md overflow-hidden mb-5">
            {(['login', 'register'] as const).map(m => (
              <button
                key={m}
                onClick={() => { setMode(m); setError('') }}
                className={`flex-1 py-2 text-sm font-medium capitalize transition-colors ${
                  mode === m ? 'bg-[rgba(91,141,238,0.12)] text-[#5b8dee]' : 'text-[#7a8099] hover:text-white'
                }`}
              >
                {m}
              </button>
            ))}
          </div>

          <form onSubmit={submit} className="space-y-3">
            {mode === 'register' && (
              <div>
                <label className="block text-xs text-[#7a8099] mb-1">Username</label>
                <input
                  className="w-full bg-[#0d0f14] border border-[#1e2130] rounded-md px-3 py-2 text-sm text-white outline-none focus:border-[#5b8dee] transition-colors"
                  placeholder="your_handle"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  required
                />
              </div>
            )}
            <div>
              <label className="block text-xs text-[#7a8099] mb-1">Email</label>
              <input
                type="email"
                className="w-full bg-[#0d0f14] border border-[#1e2130] rounded-md px-3 py-2 text-sm text-white outline-none focus:border-[#5b8dee] transition-colors"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-xs text-[#7a8099] mb-1">Password</label>
              <input
                type="password"
                className="w-full bg-[#0d0f14] border border-[#1e2130] rounded-md px-3 py-2 text-sm text-white outline-none focus:border-[#5b8dee] transition-colors"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={8}
              />
            </div>

            {error && (
              <div className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded px-3 py-2">{error}</div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#5b8dee] hover:opacity-90 disabled:opacity-50 text-white font-semibold text-sm py-2.5 rounded-md transition-opacity mt-1"
            >
              {loading ? '…' : mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-[#3d4260] mt-4">
          Or <a href="/" className="text-[#5b8dee] hover:underline">view the leaderboard</a> without signing in
        </p>
      </div>
    </div>
  )
}
