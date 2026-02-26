import Icons from './Icons'
import { StatusPill, Avatar } from './UI'

const USER_NAV = [
  { id: 'dashboard',   label: 'Dashboard',   icon: 'dash'     },
  { id: 'book',        label: 'Book a Seat', icon: 'calendar' },
  { id: 'my-bookings', label: 'My Bookings', icon: 'history'  },
  { id: 'waitlist',    label: 'Waitlist',    icon: 'clock'    },
]
const ADMIN_NAV = [
  { id: 'overview',  label: 'Overview',  icon: 'dash'     },
  { id: 'users',     label: 'Users',     icon: 'users'    },
  { id: 'bookings',  label: 'Bookings',  icon: 'history'  },
  { id: 'config',    label: 'Config',    icon: 'settings' },
]

export default function Sidebar({ user, page, setPage, dark, toggleDark, onLogout, open, setOpen }) {
  const nav = user.role === 'ADMIN' ? ADMIN_NAV : USER_NAV

  return (
    <>
      {open && (
        <div className="overlay show-mobile" onClick={() => setOpen(false)} />
      )}
      <aside className={`sidebar${open ? ' open' : ''}`} style={{
        width: 220, flexShrink: 0,
        background: 'var(--surface)',
        borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column',
        height: '100vh', position: 'sticky', top: 0, overflowY: 'auto',
      }}>

        {/* Brand */}
        <div style={{ padding: '20px 16px 16px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 30, height: 30, background: 'var(--accent)', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0 }}>
              {Icons.seat}
            </div>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: '1.05rem', letterSpacing: '-0.03em' }}>
              BookMyDesk
            </span>
          </div>
        </div>

        {/* User chip */}
        <div style={{ margin: '12px 10px', padding: '10px 12px', background: 'var(--accent-bg)', borderRadius: 10, border: '1px solid var(--accent-ring)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <Avatar name={user.name} size={28} />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: '0.83rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name}</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
            <StatusPill status={user.role} />
            {user.batchId && (
              <span className="pill" style={{ color: 'var(--text-sub)', background: 'var(--border)' }}>
                B{user.batchId} · S{user.squadNo}
              </span>
            )}
          </div>
        </div>

        {/* Nav items */}
        <nav style={{ flex: 1, padding: '4px 10px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          <div style={{ fontSize: '0.67rem', color: 'var(--text-mute)', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', padding: '8px 4px 4px' }}>
            MENU
          </div>
          {nav.map(item => (
            <button
              key={item.id}
              className={`nav-item${page === item.id ? ' active' : ''}`}
              onClick={() => { setPage(item.id); setOpen(false) }}
            >
              {Icons[item.icon]} {item.label}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div style={{ padding: '10px 10px 16px', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 2 }}>
          <button className="nav-item" onClick={toggleDark}>
            {dark ? Icons.sun : Icons.moon} {dark ? 'Light Mode' : 'Dark Mode'}
          </button>
          <button className="nav-item" onClick={onLogout} style={{ color: 'var(--red)' }}>
            {Icons.logout} Sign Out
          </button>
        </div>
      </aside>
    </>
  )
}
