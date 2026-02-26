import { useEffect } from 'react'
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import useAuthStore from './store/authStore'
import useUIStore   from './store/uiStore'
import Sidebar  from './components/Sidebar'
import { Toast } from './components/UI'
import Icons from './components/Icons'
import AuthPage  from './pages/AuthPage'
import Dashboard from './pages/Dashboard'
import BookSeat  from './pages/BookSeat'
import { MyBookings, Waitlist, AdminOverview, AdminUsers, AdminBookings, AdminConfig } from './pages/Pages'

// ── Auth guard ───────────────────────────────────────────────────────────────
function RequireAuth({ children, adminOnly = false }) {
  const user = useAuthStore(s => s.user)
  if (!user) return <Navigate to="/login" replace />
  if (adminOnly && user.role !== 'ADMIN') return <Navigate to="/dashboard" replace />
  return children
}

// ── App shell layout ─────────────────────────────────────────────────────────
function AppShell() {
  const navigate   = useNavigate()
  const location   = useLocation()
  const user       = useAuthStore(s => s.user)
  const logout     = useAuthStore(s => s.logout)
  const { dark, toggleDark, toasts, dismiss, notify } = useUIStore()

  const [sideOpen, setSideOpen] = window.__sideState || [false, () => {}]

  // derive current page id from path
  const page = location.pathname.replace('/', '') || 'dashboard'
  const setPage = (id) => navigate(`/${id}`)

  const handleLogout = () => {
    logout()
    notify('Signed out successfully.', 'warning')
    navigate('/login')
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      <Sidebar
        user={user} page={page} setPage={setPage}
        dark={dark} toggleDark={toggleDark}
        onLogout={handleLogout}
        open={false} setOpen={() => {}}
      />
      <div className="main-content" style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <main style={{ flex: 1, padding: 'clamp(16px,3vw,32px)', maxWidth: 960, width: '100%', margin: '0 auto' }}>
          <Routes>
            <Route path="/dashboard"    element={<RequireAuth><Dashboard /></RequireAuth>} />
            <Route path="/book"         element={<RequireAuth><BookSeat  /></RequireAuth>} />
            <Route path="/my-bookings"  element={<RequireAuth><MyBookings /></RequireAuth>} />
            <Route path="/waitlist"     element={<RequireAuth><Waitlist  /></RequireAuth>} />
            <Route path="/overview"     element={<RequireAuth adminOnly><AdminOverview /></RequireAuth>} />
            <Route path="/users"        element={<RequireAuth adminOnly><AdminUsers    /></RequireAuth>} />
            <Route path="/bookings"     element={<RequireAuth adminOnly><AdminBookings /></RequireAuth>} />
            <Route path="/config"       element={<RequireAuth adminOnly><AdminConfig   /></RequireAuth>} />
            <Route path="*"             element={<Navigate to={user?.role === 'ADMIN' ? '/overview' : '/dashboard'} replace />} />
          </Routes>
        </main>
      </div>
      <Toast toasts={toasts} dismiss={dismiss} />
    </div>
  )
}

// ── Root App ─────────────────────────────────────────────────────────────────
export default function App() {
  const user    = useAuthStore(s => s.user)
  const hydrate = useAuthStore(s => s.hydrate)
  const { dark, toasts, dismiss } = useUIStore()

  useEffect(() => {
    hydrate()
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light')
  }, [])

  return (
    <>
      <Routes>
        <Route path="/login" element={user ? <Navigate to={user.role === 'ADMIN' ? '/overview' : '/dashboard'} replace /> : <AuthPage />} />
        <Route path="/*"     element={user ? <AppShell /> : <Navigate to="/login" replace />} />
      </Routes>
      <Toast toasts={toasts} dismiss={dismiss} />
    </>
  )
}
