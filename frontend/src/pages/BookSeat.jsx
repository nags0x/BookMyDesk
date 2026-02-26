import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import useAuthStore from '../store/authStore'
import useUIStore   from '../store/uiStore'
import Icons from '../components/Icons'
import { SectionHeader } from '../components/UI'
import api from '../utils/api'
import { isBatchDay, calendarDays, formatDate, isWeekend, isPast, isToday, isTomorrow, computeFairness, SHORT_MONTHS, DAY_SHORT } from '../utils/schedule'

export default function BookSeat() {
  const user  = useAuthStore(s => s.user)
  const notify = useUIStore(s => s.notify)
  const qc    = useQueryClient()
  const today = new Date()

  const [cal, setCal] = useState({ y: today.getFullYear(), m: today.getMonth() })

  const { data: bookings = [] } = useQuery({
    queryKey: ['bookings', 'mine'],
    queryFn:  () => api.get('/bookings/my').then(r => r.data),
  })
  const { data: waitlist = [] } = useQuery({
    queryKey: ['waitlist', 'mine'],
    queryFn:  () => api.get('/waitlist/my').then(r => r.data),
  })
  const { data: inventory = {} } = useQuery({
    queryKey: ['inventory', formatDate(today)],
    queryFn:  () => api.get(`/inventory?date=${formatDate(today)}`).then(r => r.data),
  })

  const bookMutation = useMutation({
    mutationFn: (data) => api.post('/bookings', data),
    onSuccess:  (_, vars) => {
      qc.invalidateQueries(['bookings'])
      notify(vars.seatType === 'GUARANTEED' ? 'Guaranteed seat booked!' : 'Buffer seat booked!')
    },
    onError: (err) => notify(err.response?.data?.message || 'Booking failed.', 'error'),
  })

  const waitlistMutation = useMutation({
    mutationFn: (date) => api.post('/waitlist', { date }),
    onSuccess:  () => { qc.invalidateQueries(['waitlist']); notify('Added to buffer waitlist!') },
    onError:    (err) => notify(err.response?.data?.message || 'Waitlist join failed.', 'error'),
  })

  const activeBookings  = bookings.filter(b => b.status === 'BOOKED')
  const bookedDates     = useMemo(() => new Set(bookings.filter(b => ['BOOKED','CHECKED_IN'].includes(b.status)).map(b => b.date)), [bookings])
  const waitlistDates   = useMemo(() => new Set(waitlist.filter(w => w.status === 'PENDING').map(w => w.date)), [waitlist])

  const handleDayClick = (d) => {
    if (!d) return
    const dateStr = formatDate(d)
    if (isWeekend(d) || isPast(d))  return
    if (bookedDates.has(dateStr))   { notify('Already booked for this day.', 'warning'); return }
    if (waitlistDates.has(dateStr)) { notify('Already on waitlist for this day.', 'warning'); return }
    if (activeBookings.length >= 5) { notify('Max 5 active bookings allowed.', 'warning'); return }

    const scheduled = isBatchDay(user.batchId, d)
    if (scheduled) {
      bookMutation.mutate({ date: dateStr, seatType: 'GUARANTEED' })
    } else if (isTomorrow(d)) {
      waitlistMutation.mutate(dateStr)
    } else {
      notify('Buffer seats are only available for the next working day (3PM–9AM window).', 'warning')
    }
  }

  const days = calendarDays(cal.y, cal.m)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SectionHeader title="Book a Seat" sub={`${activeBookings.length}/5 active bookings used`} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 16 }}>

        {/* Calendar */}
        <div className="card anim-fade-up" style={{ padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
            <span style={{ fontWeight: 600, fontFamily: 'var(--font-mono)', fontSize: '0.88rem' }}>
              {SHORT_MONTHS[cal.m]} {cal.y}
            </span>
            <div style={{ display: 'flex', gap: 6 }}>
              <button className="btn-icon" style={{ width: 30, height: 30 }} onClick={() => setCal(c => c.m === 0 ? { y: c.y - 1, m: 11 } : { y: c.y, m: c.m - 1 })}>{Icons.chevronL}</button>
              <button className="btn-icon" style={{ width: 30, height: 30 }} onClick={() => setCal(c => c.m === 11 ? { y: c.y + 1, m: 0 } : { y: c.y, m: c.m + 1 })}>{Icons.chevronR}</button>
            </div>
          </div>

          {/* Day headers */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 2, marginBottom: 4 }}>
            {DAY_SHORT.map(d => (
              <div key={d} style={{ textAlign: 'center', fontSize: '0.68rem', color: 'var(--text-mute)', fontFamily: 'var(--font-mono)', padding: '4px 0' }}>{d}</div>
            ))}
          </div>

          {/* Day cells */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 2 }}>
            {days.map((d, i) => {
              if (!d) return <div key={i} />
              const dateStr    = formatDate(d)
              const weekend    = isWeekend(d)
              const past       = isPast(d)
              const todayDay   = isToday(d)
              const booked     = bookedDates.has(dateStr)
              const onWaitlist = waitlistDates.has(dateStr)
              const scheduled  = !weekend && isBatchDay(user.batchId, d)
              const clickable  = !weekend && !past && !booked && !onWaitlist && activeBookings.length < 5

              let bg     = 'transparent'
              let color  = 'var(--text)'
              let border = 'transparent'

              if (booked)         { bg = 'var(--blue-bg)';  color = 'var(--blue)';  border = 'rgba(45,95,196,0.4)' }
              else if (onWaitlist){ bg = 'var(--amber-bg)'; color = 'var(--amber)'; border = 'rgba(176,112,32,0.4)' }
              else if (scheduled && !past) { bg = 'rgba(45,125,90,0.07)' }
              if (todayDay && !booked) { border = 'var(--accent)' }
              if (weekend || past)    { color = 'var(--text-mute)' }

              return (
                <div key={i}
                  onClick={() => handleDayClick(d)}
                  style={{
                    aspectRatio: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    borderRadius: 8, fontSize: '0.83rem', cursor: clickable ? 'pointer' : 'default',
                    transition: 'all 0.12s', position: 'relative', userSelect: 'none',
                    border: `1.5px solid ${border}`, background: bg, color,
                    fontWeight: todayDay ? 700 : 400,
                    opacity: (past || weekend) && !booked ? 0.38 : 1,
                  }}
                  className={clickable ? 'cal-hover' : ''}
                  title={booked ? 'Already booked' : scheduled && !past ? 'Scheduled day — click to book' : isTomorrow(d) && !weekend ? 'Join buffer waitlist' : ''}
                >
                  {d.getDate()}
                  {(booked || onWaitlist) && (
                    <span style={{ position: 'absolute', bottom: 2, left: '50%', transform: 'translateX(-50%)', width: 4, height: 4, borderRadius: 9, background: booked ? 'var(--blue)' : 'var(--amber)' }} />
                  )}
                </div>
              )
            })}
          </div>

          {/* Legend */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border)' }}>
            {[
              { label: 'Your scheduled days', color: 'var(--green)', bg: 'var(--green-bg)' },
              { label: 'Booked',              color: 'var(--blue)',  bg: 'var(--blue-bg)'  },
              { label: 'Waitlisted',          color: 'var(--amber)', bg: 'var(--amber-bg)' },
            ].map((l, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.7rem', color: 'var(--text-sub)' }}>
                <div style={{ width: 9, height: 9, borderRadius: 3, background: l.bg, border: `1.5px solid ${l.color}50` }} />
                {l.label}
              </div>
            ))}
          </div>
        </div>

        {/* Right panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Availability */}
          <div className="card anim-fade-up-2" style={{ padding: '18px 20px' }}>
            <div style={{ fontWeight: 600, fontSize: '0.88rem', marginBottom: 14 }}>Today's Availability</div>
            {[
              { label: 'Guaranteed', total: inventory.guaranteedTotal || 10, booked: inventory.guaranteedBooked || 0, color: 'var(--blue)' },
              { label: 'Buffer',     total: inventory.bufferTotal || 10,     booked: inventory.bufferBooked || 0,     color: 'var(--green)' },
            ].map((s, i) => (
              <div key={i} style={{ marginBottom: i === 0 ? 14 : 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: 6 }}>
                  <span style={{ color: 'var(--text-sub)' }}>{s.label}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 500 }}>
                    <span style={{ color: s.color }}>{s.total - s.booked}</span>/{s.total} free
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 3 }}>
                  {Array.from({ length: s.total }).map((_, j) => (
                    <div key={j} style={{ flex: 1, height: 8, borderRadius: 3, background: j < s.booked ? s.color : 'var(--border)', opacity: j < s.booked ? 0.75 : 0.35 }} />
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Booking rules */}
          <div className="card anim-fade-up-3" style={{ padding: '18px 20px' }}>
            <div style={{ fontWeight: 600, fontSize: '0.88rem', marginBottom: 12 }}>Booking Rules</div>
            {[
              { icon: Icons.check,  text: 'Book up to 14 days in advance on your scheduled batch days', color: 'var(--green)' },
              { icon: Icons.clock,  text: 'Same-day booking closes at 9:00 AM', color: 'var(--amber)' },
              { icon: Icons.shield, text: 'Buffer waitlist opens 3:00 PM — results by 9:00 AM next day', color: 'var(--blue)' },
              { icon: Icons.bell,   text: 'Check-in deadline is 10:00 AM. Missed = marked ABSENT', color: 'var(--red)' },
              { icon: Icons.star,   text: 'Maximum 5 active bookings at any time', color: 'var(--text-sub)' },
            ].map((r, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: i < 4 ? 10 : 0, fontSize: '0.8rem', color: 'var(--text-sub)', lineHeight: 1.5 }}>
                <span style={{ color: r.color, marginTop: 1, flexShrink: 0 }}>{r.icon}</span> {r.text}
              </div>
            ))}
          </div>

          {/* Buffer CTA */}
          {!isBatchDay(user.batchId, today) && (
            <div className="card anim-fade-up-4" style={{ padding: '18px 20px', borderColor: 'var(--accent-ring)', background: 'var(--accent-bg)' }}>
              <div style={{ fontWeight: 600, fontSize: '0.88rem', marginBottom: 6, color: 'var(--accent)' }}>Buffer Waitlist Open</div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-sub)', marginBottom: 12, lineHeight: 1.6 }}>
                Not your scheduled day. Join the buffer waitlist for tomorrow's available seats.
              </p>
              <button className="btn-primary" onClick={() => {
                const tmr = new Date(today); tmr.setDate(tmr.getDate() + 1)
                const tmrStr = formatDate(tmr)
                if (waitlistDates.has(tmrStr)) { notify("Already on tomorrow's waitlist.", 'warning'); return }
                waitlistMutation.mutate(tmrStr)
              }}>
                {Icons.plus} Join Buffer Waitlist
              </button>
            </div>
          )}
        </div>
      </div>

      <style>{`.cal-hover:hover { background: var(--accent-bg) !important; }`}</style>
    </div>
  )
}
