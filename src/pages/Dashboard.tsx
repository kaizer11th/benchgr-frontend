import { useEffect, useState } from 'react'
import { useAuthStore } from '../hooks/useAuth'
import { resultsApi } from '../lib/api'
import { authApi } from '../lib/api'
import { Copy, RefreshCw, Terminal, CheckCircle } from 'lucide-react'

export default function DashboardPage() {
  const { user, fetchMe } = useAuthStore()
  const [submissions, setSubmissions] = useState<any[]>([])
  const [copied, setCopied] = useState<string | null>(null)
  const [rotating, setRotating] = useState(false)

  useEffect(() => {
    resultsApi.mySubmissions().then(r => setSubmissions(r.data)).catch(() => {})
  }, [])

  const copy = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    setCopied(label)
    setTimeout(() => setCopied(null), 2000)
  }

  const rotateKey = async () => {
    setRotating(true)
    try {
      await authApi.rotateKey()
      await fetchMe()
    } finally {
      setRotating(false)
    }
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-xl font-bold text-white">Dashboard</h1>
        <p className="text-sm text-[#7a8099] mt-1">Welcome back, <span className="text-white">{user?.username}</span></p>
      </div>

      {/* API Key */}
      <div className="bg-[#111318] border border-[#1e2130] rounded-lg p-5">
        <h2 className="font-bold text-sm text-white mb-3">Your API Key</h2>
        <p className="text-xs text-[#7a8099] mb-4">Use this key when running the BenchGR agent to submit results to the leaderboard.</p>
        <div className="flex items-center gap-2 bg-[#0d0f14] border border-[#1e2130] rounded-md px-4 py-2.5 font-mono text-sm text-[#5b8dee] mb-3">
          <span className="flex-1 truncate">{user?.api_key ?? '—'}</span>
          <button onClick={() => user?.api_key && copy(user.api_key, 'key')} className="text-[#7a8099] hover:text-white transition-colors">
            {copied === 'key' ? <CheckCircle className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
        <button onClick={rotateKey} className="flex items-center gap-2 text-xs text-[#7a8099] hover:text-white transition-colors">
          <RefreshCw className={`w-3 h-3 ${rotating ? 'animate-spin' : ''}`} />
          Rotate key
        </button>
      </div>

      {/* Install steps */}
      <div className="bg-[#111318] border border-[#1e2130] rounded-lg p-5">
        <h2 className="font-bold text-sm text-white mb-4 flex items-center gap-2">
          <Terminal className="w-4 h-4 text-[#5b8dee]" />
          Get Started in 3 Steps
        </h2>
        <div className="space-y-3">
          {[
            { step: '1', label: 'Install the agent', cmd: 'pip install benchgr-agent' },
            { step: '2', label: 'Save your API key', cmd: `benchgr config set-key ${user?.api_key ?? 'YOUR_KEY'}` },
            { step: '3', label: 'Run benchmarks & submit', cmd: 'benchgr run --submit' },
          ].map(({ step, label, cmd }) => (
            <div key={step} className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-[rgba(91,141,238,0.12)] border border-[rgba(91,141,238,0.2)] text-[#5b8dee] text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{step}</div>
              <div className="flex-1">
                <div className="text-xs text-[#7a8099] mb-1">{label}</div>
                <div className="flex items-center gap-2 bg-[#0d0f14] border border-[#1e2130] rounded px-3 py-2 font-mono text-xs text-[#34d399]">
                  <span className="flex-1">{cmd}</span>
                  <button onClick={() => copy(cmd, cmd)} className="text-[#7a8099] hover:text-white flex-shrink-0">
                    {copied === cmd ? <CheckCircle className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* My submissions */}
      <div className="bg-[#111318] border border-[#1e2130] rounded-lg overflow-hidden">
        <div className="px-5 py-3 border-b border-[#1e2130]">
          <h2 className="font-bold text-sm text-white">My Submissions</h2>
        </div>
        {submissions.length === 0 ? (
          <div className="py-12 text-center text-sm text-[#7a8099]">No submissions yet. Run your first benchmark!</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-[#0d0f14] border-b border-[#1e2130]">
                {['GPU', 'Score', 'tok/s', 'img/s', 'TFLOPS', 'GB/s', 'Date'].map(h => (
                  <th key={h} className="px-4 py-2.5 text-left text-xs font-mono tracking-wider text-[#7a8099]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {submissions.map((s: any) => (
                <tr key={s.id} className="border-b border-[#1e2130] hover:bg-[#161820]">
                  <td className="px-4 py-3 text-sm text-white font-medium">{s.gpu_name}</td>
                  <td className="px-4 py-3 text-sm font-bold text-[#5b8dee] font-mono">{s.neural_score?.toLocaleString()}</td>
                  <td className="px-4 py-3 text-xs font-mono text-[#7a8099]">{s.tokens_per_sec ?? '—'}</td>
                  <td className="px-4 py-3 text-xs font-mono text-[#7a8099]">{s.images_per_sec ?? '—'}</td>
                  <td className="px-4 py-3 text-xs font-mono text-[#7a8099]">{s.tflops_fp16 ?? '—'}</td>
                  <td className="px-4 py-3 text-xs font-mono text-[#7a8099]">{s.memory_bw_gbps ?? '—'}</td>
                  <td className="px-4 py-3 text-xs font-mono text-[#3d4260]">{new Date(s.submitted_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
