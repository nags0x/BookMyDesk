import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '../utils/api'

const useAuthStore = create(
  persist(
    (set, get) => ({
      user:  null,
      token: null,

      login: async (email, password) => {
        const res = await api.post('/auth/login', { email, password })
        const { user, token } = res.data
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`
        set({ user, token })
        return user
      },

      signup: async (formData) => {
        const res = await api.post('/auth/signup', formData)
        const { user, token } = res.data
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`
        set({ user, token })
        return user
      },

      logout: () => {
        delete api.defaults.headers.common['Authorization']
        set({ user: null, token: null })
      },

      updateUser: (updates) => set(state => ({ user: { ...state.user, ...updates } })),

      hydrate: () => {
        const { token } = get()
        if (token) {
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`
        }
      },
    }),
    {
      name: 'seatsync-auth',
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
)

export default useAuthStore
