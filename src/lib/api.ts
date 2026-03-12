import axios from 'axios'

// On Vercel, frontend and backend share the same domain.
// In local dev, set VITE_API_URL=http://localhost:8000
const API_URL = (import.meta as any).env?.VITE_API_URL ?? ''

export const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT token to every request if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('benchgr_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// ── Types ────────────────────────────────────────────────

export interface LeaderboardEntry {
  rank: number
  id: number
  gpu_name: string
  gpu_arch: string | null
  vram_gb: number | null
  tokens_per_sec: number | null
  images_per_sec: number | null
  tflops_fp16: number | null
  memory_bw_gbps: number | null
  neural_score: number | null
  submitted_at: string
  username: string
}

export interface PlatformStats {
  total_submissions: number
  total_gpu_models: number
  total_users: number
  best_inference_tps: number | null
  best_image_ips: number | null
  best_tflops: number | null
  best_membw_gbps: number | null
}

export interface User {
  id: number
  username: string
  email: string
  api_key: string
}

// ── API calls ────────────────────────────────────────────

export const authApi = {
  register: (username: string, email: string, password: string) =>
    api.post<{ access_token: string }>('/auth/register', { username, email, password }),

  login: (email: string, password: string) =>
    api.post<{ access_token: string }>('/auth/login', { email, password }),

  me: () => api.get<User>('/auth/me'),

  rotateKey: () => api.post<User>('/auth/rotate-key'),
}

export const resultsApi = {
  leaderboard: (params?: {
    sort_by?: string
    search?: string
    limit?: number
    offset?: number
  }) => api.get<LeaderboardEntry[]>('/results/leaderboard', { params }),

  stats: () => api.get<PlatformStats>('/results/stats'),

  mySubmissions: () => api.get('/results/my-submissions'),
}
