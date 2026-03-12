import { create } from 'zustand'
import { authApi, User } from '../lib/api'

interface AuthState {
  user: User | null
  token: string | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (username: string, email: string, password: string) => Promise<void>
  logout: () => void
  fetchMe: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('benchgr_token'),
  loading: false,

  login: async (email, password) => {
    const res = await authApi.login(email, password)
    localStorage.setItem('benchgr_token', res.data.access_token)
    set({ token: res.data.access_token })
    const me = await authApi.me()
    set({ user: me.data })
  },

  register: async (username, email, password) => {
    const res = await authApi.register(username, email, password)
    localStorage.setItem('benchgr_token', res.data.access_token)
    set({ token: res.data.access_token })
    const me = await authApi.me()
    set({ user: me.data })
  },

  logout: () => {
    localStorage.removeItem('benchgr_token')
    set({ user: null, token: null })
  },

  fetchMe: async () => {
    const token = localStorage.getItem('benchgr_token')
    if (!token) return
    try {
      const me = await authApi.me()
      set({ user: me.data })
    } catch {
      localStorage.removeItem('benchgr_token')
      set({ user: null, token: null })
    }
  },
}))
