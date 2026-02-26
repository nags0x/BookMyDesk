import Icons from './Icons'

// ── Status Pill ──────────────────────────────────
const STATUS_MAP = {
  BOOKED:      { color: 'var(--blue)',      bg: 'var(--blue-bg)'  },
  CHECKED_IN:  { color: 'var(--green)',     bg: 'var(--green-bg)' },
  CANCELLED:   { color: 'var(--text-mute)', bg: 'var(--border)'   },
  LATE_CANCEL: { color: 'var(--amber)',     bg: 'var(--amber-bg)' },
  ABSENT:      { color: 'var(--red)',       bg: 'var(--red-bg)'   },
  PENDING:     { color: 'var(--amber)',     bg: 'var(--amber-bg)' },
  ALLOCATED:   { color: 'var(--green)',     bg: 'var(--green-bg)' },
  REJECTED:    { color: 'var(--red)',       bg: 'var(--red-bg)'   },
  ACTIVE:      { color: 'var(--green)',     bg: 'var(--green-bg)' },
  BLOCKED:     { color: 'var(--red)',       bg: 'var(--red-bg)'   },
  USER:        { color: 'var(--blue)',      bg: 'var(--blue-bg)'  },
  ADMIN:       { color: 'var(--accent)',    bg: 'var(--accent-bg)'},
  GUARANTEED:  { color: 'var(--blue)',      bg: 'var(--blue-bg)'  },
  BUFFER:      { color: 'var(--amber)',     bg: 'var(--amber-bg)' },
}

export function StatusPill({ status }) {
  const { color, bg } = STATUS_MAP[status] || { color: 'var(--text-mute)', bg: 'var(--border)' }
  return (
    <span className="pill" style={{ color, background: bg }}>
      {status.replace('_', ' ')}
    </span>
  )
}

// ── Radial Score ─────────────────────────────────
export function RadialScore({ score }) {
  const r    = 38
  const circ = 2 * Math.PI * r
  const dash = (score / 100) * circ
  const color = score >= 75 ? 'var(--green)' : score >= 45 ? 'var(--amber)' : 'var(--red)'

  return (
    <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width={100} height={100} viewBox="0 0 100 100">
        <circle cx={50} cy={50} r={r} fill="none" stroke="var(--border)" strokeWidth={7} />
        <circle cx={50} cy={50} r={r} fill="none" stroke={color} strokeWidth={7}
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          transform="rotate(-90 50 50)"
          style={{ transition: 'stroke-dasharray 1s cubic-bezier(0.22,1,0.36,1)' }} />
      </svg>
      <div style={{ position: 'absolute', textAlign: 'center' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.25rem', fontWeight: 500, color, lineHeight: 1 }}>{score}</div>
        <div style={{ fontSize: '0.6rem', color: 'var(--text-mute)', letterSpacing: '0.06em', fontFamily: 'var(--font-mono)', marginTop: 2 }}>SCORE</div>
      </div>
    </div>
  )
}

// ── Mini progress bar ─────────────────────────────
export function MiniBar({ value, max, color }) {
  return (
    <div className="stat-bar-bg">
      <div className="stat-bar-fill" style={{ width: `${Math.min(100, (value / max) * 100)}%`, background: color }} />
    </div>
  )
}

// ── Toast Notifications ───────────────────────────
export function Toast({ toasts, dismiss }) {
  if (!toasts.length) return null
  const iconFor = (type) => type === 'error' ? Icons.x : type === 'warning' ? Icons.info : Icons.check
  const bgFor   = (type) => type === 'error' ? '#c4382d' : type === 'warning' ? '#b07020' : '#2d7d5a'

  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 340 }}>
      {toasts.map(t => (
        <div key={t.id} style={{
          display: 'flex', alignItems: 'flex-start', gap: 10,
          background: bgFor(t.type), color: '#fff',
          padding: '12px 16px', borderRadius: 12,
          boxShadow: '0 8px 32px rgba(0,0,0,0.22)',
          animation: 'toastIn 0.25s ease both',
          fontSize: '0.85rem', fontWeight: 500, lineHeight: 1.5,
        }}>
          <span style={{ marginTop: 1, flexShrink: 0 }}>{iconFor(t.type)}</span>
          <span style={{ flex: 1 }}>{t.msg}</span>
          <button onClick={() => dismiss(t.id)}
            style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)', padding: '0 0 0 6px', lineHeight: 1, flexShrink: 0 }}>
            {Icons.close}
          </button>
        </div>
      ))}
    </div>
  )
}

// ── Section Header ────────────────────────────────
export function SectionHeader({ title, sub, action }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 20 }}>
      <div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 400, fontSize: 'clamp(1.3rem,3.5vw,1.75rem)', letterSpacing: '-0.025em', lineHeight: 1.2 }}>
          {title}
        </h1>
        {sub && <p style={{ color: 'var(--text-sub)', fontSize: '0.85rem', marginTop: 5 }}>{sub}</p>}
      </div>
      {action}
    </div>
  )
}

// ── Form Field wrapper ────────────────────────────
export function FormField({ label, children, error }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.06em', marginBottom: 6, fontFamily: 'var(--font-mono)', color: 'var(--text-sub)' }}>
        {label.toUpperCase()}
      </label>
      {children}
      {error && <p style={{ fontSize: '0.75rem', color: 'var(--red)', marginTop: 4 }}>{error}</p>}
    </div>
  )
}

// ── Avatar ────────────────────────────────────────
export function Avatar({ name, size = 36 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: 8, flexShrink: 0,
      background: 'var(--accent-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: size * 0.4, color: 'var(--accent)',
    }}>
      {name?.charAt(0) || '?'}
    </div>
  )
}

// ── Stat Card ─────────────────────────────────────
export function StatCard({ label, value, color }) {
  return (
    <div className="card" style={{ padding: '14px 18px' }}>
      <div style={{ fontSize: '1.75rem', fontFamily: 'var(--font-display)', fontWeight: 300, color, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: '0.76rem', color: 'var(--text-sub)', marginTop: 6 }}>{label}</div>
    </div>
  )
}

// ── Loading spinner ───────────────────────────────
export function Spinner({ size = 24 }) {
  return (
    <div style={{ width: size, height: size, border: `2px solid var(--border)`, borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
  )
}

// ── Empty state ───────────────────────────────────
export function Empty({ icon, message }) {
  return (
    <div style={{ padding: '48px 20px', textAlign: 'center', color: 'var(--text-mute)', fontSize: '0.88rem' }}>
      <div style={{ opacity: 0.3, marginBottom: 12, display: 'flex', justifyContent: 'center' }}>{icon}</div>
      {message}
    </div>
  )
}
