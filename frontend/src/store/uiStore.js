import { create } from 'zustand'

let nextId = 0

const useUIStore = create((set) => ({
  dark: false,
  toasts: [],

  setDark: (dark) => {
    set({ dark })
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light')
  },

  toggleDark: () => {
    set((state) => {
      const dark = !state.dark
      document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light')
      return { dark }
    })
  },

  notify: (msg, type = 'success') => {
    const id = ++nextId
    set((state) => ({ toasts: [...state.toasts, { id, msg, type }] }))
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }))
    }, 4000)
  },

  dismiss: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}))

export default useUIStore
