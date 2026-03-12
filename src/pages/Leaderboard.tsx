import { useEffect, useState, useCallback } from 'react'
import { resultsApi, LeaderboardEntry, PlatformStats } from '../lib/api'
import { Search, ChevronUp, ChevronDown, RefreshCw, Cpu } from 'lucide-react'

const SORT_OPTIONS = [
  { key: 'neural_score',   label: 'Score'      },
  { key: 'tokens_per_sec', label: 'Inference'  },
  { key: 'images_per_sec', label: 'Image Gen'  },
  { key: 'tflops_fp16',    label: 'CUDA'       },
  { key: 'memory_bw_gbps', label: 'Memory BW'  },
]

export default function LeaderboardPage() {
  const [entries, setEntries]   = useState<LeaderboardEntry[]>([])
  const [stats, setStats]       = useState<PlatformStats | null>(null)
  const [sortBy, setSortBy]     = useState('neural_score')
  const [search, setSearch]     = useState('')
  const [loading, setLoading]   = useState(true)
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
    } catch (e) {
      // API not connected — show empty state gracefully
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [sortBy, search])

  useEffect(() => { load() }, [load])
  useEffect(() => {
    const iv = setInterval(() => load(true), 30000)
    return () => clearInterval(iv)
  }, [load])

  const maxScore = Math.max(...entries.map(e => e.neural_score ?? 0), 1)

  return (
    <div className="space-y-6">

      {/* KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Best Inference',  val: stats?.best_inference_tps  ? `${stats.best_inference_tps} tok/s`  : '—', color: '#34d399' },
          { label: 'Best Image Gen',  val: stats?.best_image_ips      ? `${stats.best_image_ips} img/s`      : '—', color: '#f59e0b' },
          { label: 'Best TFLOPS',     val: stats?.best_tflops         ? `${stats.best_tflops} TFLOPS`        : '—', color: '#a78bfa' },
          { label: 'Best Mem BW',     val: stats?.best_membw_gbps     ? `${stats.best_membw_gbps} GB/s`      : '—', color: '#f87171' },
        ].map((k) => (
          <div key={k.label} className="bg-[#111318] border border-[#1e2130] rounded-lg p-4">
            <div className="text-xs text-[#7a8099] mb-2">{k.label}</div>
            <div className="text-xl font-bold text-white font-mono">{k.val}</div>
          </div>
        ))}
      </div>

      {/* Table Card */}
      <div className="bg-[#111318] border border-[#1e2130] rounded-lg overflow-hidden">

        {/* Toolbar */}
        <div className="flex items-center justify-between gap-3 px-5 py-3 border-b border-[#1e2130] flex-wrap">
          <h2 className="font-bold text-sm text-white tracking-wide">GPU Performance Rankings</h2>
          <div className="flex items-center gap-2 flex-wrap">
            {/* Search */}
            <div className="flex items-center gap-2 bg-[#0d0f14] border border-[#1e2130] rounded-md px-3 py-1.5 w-48">
              <Search className="w-3 h-3 text-[#3d4260]" />
              <input
                className="bg-transparent text-sm text-white placeholder-[#3d4260] outline-none w-full"
                placeholder="Search GPU…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            {/* Sort pills */}
            <div className="flex bg-[#0d0f14] border border-[#1e2130] rounded-md overflow-hidden">
              {SORT_OPTIONS.map(opt => (
                <button
                  key={opt.key}
                  onClick={() => setSortBy(opt.key)}
                  className={`px-3 py-1.5 text-xs font-mono tracking-wide border-r border-[#1e2130] last:border-0 transition-colors ${
                    sortBy === opt.key
                      ? 'bg-[rgba(91,141,238,0.12)] text-[#5b8dee]'
                      : 'text-[#7a8099] hover:text-white hover:bg-[#161820]'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <button
              onClick={() => load(true)}
              className="p-1.5 rounded-md border border-[#1e2130] text-[#7a8099] hover:text-white transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#0d0f14] border-b border-[#1e2130]">
                {['#', 'GPU Model', 'AI Inference', 'Image Gen', 'CUDA TFLOPS', 'Mem BW', 'VRAM', 'Score', 'By'].map(h => (
                  <th key={h} className="px-4 py-2.5 text-left text-xs font-mono tracking-wider text-[#7a8099] whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="border-b border-[#1e2130]">
                    {Array.from({ length: 9 }).map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-[#1e2130] rounded animate-pulse w-16" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : entries.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-16 text-center">
                    <Cpu className="w-8 h-8 text-[#3d4260] mx-auto mb-3" />
                    <div className="text-[#7a8099] text-sm">No results yet.</div>
                    <div className="text-[#3d4260] text-xs mt-1">Be the first — install the agent and run a benchmark.</div>
                  </td>
                </tr>
              ) : (
                entries.map((e) => (
                  <tr key={e.id} className="border-b border-[#1e2130] hover:bg-[rgba(91,141,238,0.03)] transition-colors">
                    <td className="px-4 py-3">
                      <RankBadge rank={e.rank} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-sm text-white">{e.gpu_name}</div>
                      <div className="text-xs font-mono text-[#7a8099]">{e.gpu_arch ?? ''} · {e.vram_gb ?? '?'}GB</div>
                    </td>
                    <td className="px-4 py-3"><MetricCell value={e.tokens_per_sec} unit="tok/s" color="#34d399" max={entries.reduce((m,x)=>Math.max(m,x.tokens_per_sec??0),1)} /></td>
                    <td className="px-4 py-3"><MetricCell value={e.images_per_sec} unit="img/s" color="#f59e0b" max={entries.reduce((m,x)=>Math.max(m,x.images_per_sec??0),1)} /></td>
                    <td className="px-4 py-3"><MetricCell value={e.tflops_fp16} unit="TFLOPS" color="#a78bfa" max={entries.reduce((m,x)=>Math.max(m,x.tflops_fp16??0),1)} /></td>
                    <td className="px-4 py-3"><MetricCell value={e.memory_bw_gbps} unit="GB/s" color="#f87171" max={entries.reduce((m,x)=>Math.max(m,x.memory_bw_gbps??0),1)} /></td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-mono bg-[#161820] border border-[#1e2130] px-2 py-0.5 rounded text-[#7a8099]">{e.vram_gb ?? '?'} GB</span>
                    </td>
                    <td className="px-4 py-3">
                      <ScoreBar score={e.neural_score} max={maxScore} />
                    </td>
                    <td className="px-4 py-3 text-xs text-[#7a8099] font-mono">{e.username}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-5 py-2.5 border-t border-[#1e2130] bg-[#0d0f14] flex items-center justify-between">
          <span className="text-xs font-mono text-[#7a8099]">{entries.length} GPU models indexed</span>
          <span className="text-xs font-mono text-[#3d4260]">Auto-refreshes every 30s</span>
        </div>
      </div>
    </div>
  )
}

function RankBadge({ rank }: { rank: number }) {
  const styles: Record<number, string> = {
    1: 'bg-[rgba(251,191,36,0.1)] text-[#fbbf24] border border-[rgba(251,191,36,0.2)]',
    2: 'bg-[rgba(148,163,184,0.1)] text-[#94a3b8] border border-[rgba(148,163,184,0.2)]',
    3: 'bg-[rgba(184,115,51,0.1)] text-[#b87333] border border-[rgba(184,115,51,0.2)]',
  }
  return (
    <div className={`w-7 h-7 rounded flex items-center justify-center text-xs font-bold ${styles[rank] ?? 'bg-[#161820] text-[#7a8099] border border-[#1e2130]'}`}>
      {rank}
    </div>
  )
}

function MetricCell({ value, unit, color, max }: { value: number | null; unit: string; color: string; max: number }) {
  if (value == null) return <span className="text-xs text-[#3d4260]">—</span>
  const pct = Math.min((value / max) * 100, 100)
  return (
    <div className="min-w-[80px]">
      <div className="text-sm font-mono font-semibold text-white">{value} <span className="text-xs text-[#7a8099]">{unit}</span></div>
      <div className="h-1 bg-[#1e2130] rounded mt-1 overflow-hidden">
        <div className="h-full rounded transition-all duration-700" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}, ${color}80)` }} />
      </div>
    </div>
  )
}

function ScoreBar({ score, max }: { score: number | null; max: number }) {
  if (score == null) return <span className="text-xs text-[#3d4260]">—</span>
  return <span className="text-sm font-bold text-[#5b8dee] font-mono">{score.toLocaleString()}</span>
}
