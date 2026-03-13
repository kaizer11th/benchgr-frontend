import { useEffect, useState, useCallback } from 'react'
import { resultsApi, LeaderboardEntry, PlatformStats } from '../lib/api'
import { Search, RefreshCw, Cpu, Zap, Activity, Database, MemoryStick } from 'lucide-react'

const SORT_OPTIONS = [
  { key: 'neural_score',   label: 'SCORE'     },
  { key: 'tokens_per_sec', label: 'INFERENCE' },
  { key: 'tflops_fp16',    label: 'CUDA'      },
  { key: 'memory_bw_gbps', label: 'MEM BW'   },
]

export default function LeaderboardPage() {
  const [entries, setEntries]       = useState<LeaderboardEntry[]>([])
  const [stats, setStats]           = useState<PlatformStats | null>(null)
  const [sortBy, setSortBy]         = useState('neural_score')
  const [search, setSearch]         = useState('')
  const [loading, setLoading]       = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const load = useCallback(async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true)
    else setLoading(true)
    try {
      const [lb, st] = await Promise.all([
        resultsApi.leaderboard({ sort_by: sortBy, search: search || undefined }),
        resultsApi.stats(),
      ])
      setEntries(lb.data)
      setStats(st.data)
    } catch {}
    finally { setLoading(false); setRefreshing(false) }
  }, [sortBy, search])

  useEffect(() => { load() }, [load])
  useEffect(() => {
    const iv = setInterval(() => load(true), 30000)
    return () => clearInterval(iv)
  }, [load])

  const maxScore = Math.max(...entries.map(e => e.neural_score ?? 0), 1)

  return (
    <div className="space-y-8">

      {/* Hero */}
      <div className="relative text-center py-10 overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[500px] h-[200px] rounded-full opacity-10" style={{ background: 'radial-gradient(ellipse, #4f8ef7 0%, transparent 70%)', filter: 'blur(40px)' }} />
        </div>
        <div className="relative">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold tracking-widest mb-4" style={{ background: 'rgba(79,142,247,0.1)', border: '1px solid rgba(79,142,247,0.2)', color: '#4f8ef7' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-[#4f8ef7] animate-pulse inline-block" />
            LIVE RANKINGS
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-white mb-2" style={{ fontFamily: 'JetBrains Mono, monospace', textShadow: '0 0 60px rgba(79,142,247,0.3)' }}>
            GPU BENCHMARK<br />
            <span style={{ background: 'linear-gradient(90deg, #4f8ef7, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>LEADERBOARD</span>
          </h1>
          <p className="text-sm text-[#444] tracking-wider">Real hardware. Real benchmarks. No BS.</p>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'BEST INFERENCE', val: stats?.best_inference_tps ? `${stats.best_inference_tps}` : '—', unit: 'tok/s', color: '#34d399', glow: 'rgba(52,211,153,0.15)', icon: <Activity className="w-4 h-4" /> },
          { label: 'BEST TFLOPS',    val: stats?.best_tflops        ? `${stats.best_tflops}`        : '—', unit: 'TFLOPS', color: '#a78bfa', glow: 'rgba(167,139,250,0.15)', icon: <Zap className="w-4 h-4" /> },
          { label: 'BEST MEM BW',    val: stats?.best_membw_gbps    ? `${stats.best_membw_gbps}`    : '—', unit: 'GB/s',   color: '#f87171', glow: 'rgba(248,113,113,0.15)', icon: <MemoryStick className="w-4 h-4" /> },
          { label: 'GPUS INDEXED',   val: stats?.total_gpu_models   ? `${stats.total_gpu_models}`  : '—', unit: 'models', color: '#4f8ef7', glow: 'rgba(79,142,247,0.15)',  icon: <Cpu className="w-4 h-4" /> },
        ].map((k) => (
          <div key={k.label} className="relative rounded-xl p-4 overflow-hidden group" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: `radial-gradient(circle at 50% 0%, ${k.glow}, transparent 70%)` }} />
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] tracking-widest font-bold" style={{ color: '#333' }}>{k.label}</span>
                <span style={{ color: k.color, opacity: 0.6 }}>{k.icon}</span>
              </div>
              <div className="flex items-end gap-1.5">
                <span className="text-2xl font-black text-white" style={{ fontFamily: 'JetBrains Mono, monospace', textShadow: `0 0 20px ${k.color}40` }}>{k.val}</span>
                <span className="text-xs mb-1 font-bold tracking-wider" style={{ color: k.color }}>{k.unit}</span>
              </div>
              <div className="mt-2 h-px w-full" style={{ background: `linear-gradient(90deg, ${k.color}40, transparent)` }} />
            </div>
          </div>
        ))}
      </div>

      {/* Table Card */}
      <div className="rounded-xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>

        {/* Toolbar */}
        <div className="flex items-center justify-between gap-3 px-5 py-4 flex-wrap" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.01)' }}>
          <h2 className="font-black text-xs tracking-widest text-white">PERFORMANCE RANKINGS</h2>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg w-44" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <Search className="w-3 h-3 text-[#333]" />
              <input
                className="bg-transparent text-xs text-white placeholder-[#333] outline-none w-full tracking-wider"
                placeholder="Search GPU…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div className="flex rounded-lg overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
              {SORT_OPTIONS.map(opt => (
                <button
                  key={opt.key}
                  onClick={() => setSortBy(opt.key)}
                  className="px-3 py-2 text-[10px] font-black tracking-widest transition-all"
                  style={sortBy === opt.key
                    ? { background: 'rgba(79,142,247,0.15)', color: '#4f8ef7', borderRight: '1px solid rgba(255,255,255,0.06)' }
                    : { background: 'transparent', color: '#444', borderRight: '1px solid rgba(255,255,255,0.06)' }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <button onClick={() => load(true)} className="p-2 rounded-lg transition-all hover:bg-white/5" style={{ border: '1px solid rgba(255,255,255,0.06)', color: '#444' }}>
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.2)' }}>
                {['#', 'GPU MODEL', 'AI INFERENCE', 'CUDA TFLOPS', 'MEM BW', 'VRAM', 'NEURAL SCORE', 'USER'].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-[10px] font-black tracking-widest" style={{ color: '#2a2a35' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                    {Array.from({ length: 8 }).map((_, j) => (
                      <td key={j} className="px-5 py-4">
                        <div className="h-3 rounded animate-pulse" style={{ background: 'rgba(255,255,255,0.04)', width: `${40 + Math.random() * 40}px` }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : entries.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-20 text-center">
                    <div className="w-12 h-12 rounded-xl mx-auto mb-4 flex items-center justify-center" style={{ background: 'rgba(79,142,247,0.08)', border: '1px solid rgba(79,142,247,0.1)' }}>
                      <Cpu className="w-6 h-6" style={{ color: '#4f8ef7' }} />
                    </div>
                    <div className="text-sm font-bold tracking-wider text-[#333]">NO RESULTS YET</div>
                    <div className="text-xs text-[#222] mt-1 tracking-wider">Install the agent and run your first benchmark</div>
                  </td>
                </tr>
              ) : (
                entries.map((e, idx) => (
                  <tr key={e.id} className="group transition-all duration-200" style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', background: idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.005)' }}
                    onMouseEnter={ev => (ev.currentTarget.style.background = 'rgba(79,142,247,0.04)')}
                    onMouseLeave={ev => (ev.currentTarget.style.background = idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.005)')}>
                    <td className="px-5 py-4"><RankBadge rank={e.rank} /></td>
                    <td className="px-5 py-4">
                      <div className="font-black text-sm text-white tracking-wide">{e.gpu_name}</div>
                      <div className="text-[10px] font-bold tracking-widest mt-0.5" style={{ color: '#333' }}>{e.vram_gb ?? '?'}GB VRAM</div>
                    </td>
                    <td className="px-5 py-4"><MetricCell value={e.tokens_per_sec} unit="tok/s" color="#34d399" max={entries.reduce((m,x)=>Math.max(m,x.tokens_per_sec??0),1)} /></td>
                    <td className="px-5 py-4"><MetricCell value={e.tflops_fp16} unit="TFLOPS" color="#a78bfa" max={entries.reduce((m,x)=>Math.max(m,x.tflops_fp16??0),1)} /></td>
                    <td className="px-5 py-4"><MetricCell value={e.memory_bw_gbps} unit="GB/s" color="#f87171" max={entries.reduce((m,x)=>Math.max(m,x.memory_bw_gbps??0),1)} /></td>
                    <td className="px-5 py-4">
                      <span className="text-xs font-black tracking-wider px-2 py-1 rounded-md" style={{ background: 'rgba(255,255,255,0.04)', color: '#444', border: '1px solid rgba(255,255,255,0.06)' }}>{e.vram_gb ?? '?'}GB</span>
                    </td>
                    <td className="px-5 py-4"><ScoreBar score={e.neural_score} max={maxScore} /></td>
                    <td className="px-5 py-4 text-xs font-bold tracking-wider" style={{ color: '#4f8ef7' }}>{e.username}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="px-5 py-3 flex items-center justify-between" style={{ borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.2)' }}>
          <span className="text-[10px] font-black tracking-widest" style={{ color: '#222' }}>{entries.length} MODELS INDEXED</span>
          <span className="text-[10px] font-bold tracking-widest" style={{ color: '#1a1a22' }}>AUTO-REFRESH 30s</span>
        </div>
      </div>
    </div>
  )
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black" style={{ background: 'rgba(251,191,36,0.12)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.25)', boxShadow: '0 0 12px rgba(251,191,36,0.1)' }}>1</div>
  if (rank === 2) return <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black" style={{ background: 'rgba(148,163,184,0.08)', color: '#94a3b8', border: '1px solid rgba(148,163,184,0.15)' }}>2</div>
  if (rank === 3) return <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black" style={{ background: 'rgba(184,115,51,0.08)', color: '#cd7f32', border: '1px solid rgba(184,115,51,0.15)' }}>3</div>
  return <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold" style={{ background: 'rgba(255,255,255,0.02)', color: '#333', border: '1px solid rgba(255,255,255,0.05)' }}>{rank}</div>
}

function MetricCell({ value, unit, color, max }: { value: number | null; unit: string; color: string; max: number }) {
  if (value == null) return <span className="text-xs font-bold" style={{ color: '#222' }}>—</span>
  const pct = Math.min((value / max) * 100, 100)
  return (
    <div className="min-w-[90px]">
      <div className="flex items-baseline gap-1">
        <span className="text-sm font-black text-white" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{value}</span>
        <span className="text-[10px] font-bold tracking-wider" style={{ color }}>{unit}</span>
      </div>
      <div className="h-0.5 rounded-full mt-1.5 overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}, ${color}60)`, boxShadow: `0 0 6px ${color}80` }} />
      </div>
    </div>
  )
}

function ScoreBar({ score, max }: { score: number | null; max: number }) {
  if (score == null) return <span className="text-xs font-bold" style={{ color: '#222' }}>—</span>
  const pct = Math.min((score / max) * 100, 100)
  return (
    <div className="min-w-[100px]">
      <span className="text-base font-black" style={{ fontFamily: 'JetBrains Mono, monospace', background: 'linear-gradient(90deg, #4f8ef7, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
        {score.toLocaleString()}
      </span>
      <div className="h-0.5 rounded-full mt-1.5 overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #4f8ef7, #a78bfa)', boxShadow: '0 0 8px rgba(79,142,247,0.5)' }} />
      </div>
    </div>
  )
}
