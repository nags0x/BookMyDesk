import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../store/authStore'
import { RadialScore, StatCard, MiniBar, StatusPill, SectionHeader, Empty } from '../components/UI'
import Icons from '../components/Icons'
import api from '../utils/api'
import { isBatchDay, computeFairness, displayDate } from '../utils/schedule'

export default function Dashboard() {
  const user    = useAuthStore(s => s.user)
  const navigate = useNavigate()
  const today   = new Date()
  const score   = computeFairness(user)

  const { data: bookings = [] } = useQuery({
    queryKey: ['bookings', 'mine'],
    queryFn:  () => api.get('/bookings/my').then(r => r.data),
  })

  const active   = bookings.filter(b => b.status === 'BOOKED')
  const checked  = bookings.filter(b => b.status === 'CHECKED_IN')
  const upcoming = [...bookings]
    .filter(b => b.status === 'BOOKED' || b.status === 'CHECKED_IN')
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 4)
  const recent = [...bookings].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5)
  const isOfficeDayToday = isBatchDay(user.batchId, today)

  const hour = today.getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Header */}
      <div className="anim-fade-up" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-mute)', fontFamily: 'var(--font-mono)', letterSpacing: '0.06em', marginBottom: 6 }}>
            {today.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 400, fontSize: 'clamp(1.4rem,4vw,2rem)', letterSpacing: '-0.03em' }}>
            {greeting}, {user.name.split(' ')[0]}.
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
            <span className="pill" style={{ color: isOfficeDayToday ? 'var(--green)' : 'var(--text-sub)', background: isOfficeDayToday ? 'var(--green-bg)' : 'var(--border)' }}>
              {Icons.dot} {isOfficeDayToday ? 'In-office today' : 'Remote today'}
            </span>
            <span className="pill" style={{ color: 'var(--text-sub)', background: 'var(--border)' }}>
              Batch {user.batchId} · Squad {user.squadNo}
            </span>
          </div>
        </div>
        <RadialScore score={score} />
      </div>

      {/* Stat cards */}
      <div className="anim-fade-up-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(130px,1fr))', gap: 12 }}>
        <StatCard label="Active Bookings" value={active.length}  color="var(--blue)"  />
        <StatCard label="Check-ins"       value={checked.length} color="var(--green)" />
        <StatCard label="Late Cancels"    value={user.lateCancels} color="var(--amber)" />
        <StatCard label="Absences"        value={user.absences}  color="var(--red)"   />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 16 }}>

        {/* Upcoming bookings */}
        <div className="card anim-fade-up-3" style={{ padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Upcoming Bookings</span>
            <button className="btn-ghost" style={{ padding: '5px 10px', fontSize: '0.75rem' }} onClick={() => navigate('/book')}>
              {Icons.plus} Book
            </button>
          </div>
          {upcoming.length === 0
            ? <Empty icon={Icons.calendar} message="No upcoming bookings." />
            : upcoming.map(b => (
              <div key={b.id || b._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                <div>
                  <div style={{ fontWeight: 500, fontSize: '0.88rem' }}>{displayDate(b.date)}</div>
                  <div style={{ fontSize: '0.73rem', color: 'var(--text-mute)', marginTop: 2, fontFamily: 'var(--font-mono)' }}>{b.seatType}</div>
                </div>
                <StatusPill status={b.status} />
              </div>
            ))
          }
        </div>

        {/* Fairness breakdown */}
        <div className="card anim-fade-up-4" style={{ padding: 20 }}>
          <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: 16 }}>Fairness Breakdown</div>
          {[
            { label: 'Buffer usage (14d)', val: user.bufferUsed,   max: 10, color: 'var(--blue)'  },
            { label: 'Late cancellations', val: user.lateCancels,  max: 5,  color: 'var(--amber)' },
            { label: 'Absences',           val: user.absences,     max: 5,  color: 'var(--red)'   },
          ].map((r, i) => (
            <div key={i} style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: 5 }}>
                <span style={{ color: 'var(--text-sub)' }}>{r.label}</span>
                <span style={{ fontFamily: 'var(--font-mono)', color: r.color, fontWeight: 500 }}>{r.val}</span>
              </div>
              <MiniBar value={r.val} max={r.max} color={r.color} />
            </div>
          ))}
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12, marginTop: 4 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
              <span style={{ color: 'var(--text-sub)' }}>Fairness score</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: score >= 75 ? 'var(--green)' : score >= 45 ? 'var(--amber)' : 'var(--red)' }}>
                {score}/100
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent history */}
      <div className="card anim-fade-up-4" style={{ padding: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Recent History</span>
          <button className="btn-ghost" style={{ padding: '5px 10px', fontSize: '0.75rem' }} onClick={() => navigate('/my-bookings')}>View all</button>
        </div>
        {recent.length === 0
          ? <Empty icon={Icons.history} message="No booking history yet." />
          : recent.map(b => (
            <div key={b.id || b._id} className="table-row" style={{ gridTemplateColumns: '1fr auto auto', alignItems: 'center', padding: '10px 0', gap: 12 }}>
              <div>
                <div style={{ fontWeight: 500, fontSize: '0.88rem' }}>{displayDate(b.date)}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-mute)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>{b.seatType}</div>
              </div>
              <StatusPill status={b.status} />
            </div>
          ))
        }
      </div>
    </div>
  )
}
