// ── My Bookings ─────────────────────────────────────────────────────────────
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import useAuthStore from '../store/authStore'
import useUIStore   from '../store/uiStore'
import { StatusPill, SectionHeader, Empty } from '../components/UI'
import Icons from '../components/Icons'
import api  from '../utils/api'
import { displayDate } from '../utils/schedule'

export function MyBookings() {
  const notify = useUIStore(s => s.notify)
  const qc     = useQueryClient()
  const [filter, setFilter] = useState('ALL')

  const { data: bookings = [] } = useQuery({
    queryKey: ['bookings', 'mine'],
    queryFn:  () => api.get('/bookings/my').then(r => r.data),
  })

  const cancelMutation = useMutation({
    mutationFn: (id) => api.patch(`/bookings/${id}/cancel`),
    onSuccess:  () => { qc.invalidateQueries(['bookings']); notify('Booking cancelled.', 'warning') },
    onError:    (err) => notify(err.response?.data?.message || 'Cancel failed.', 'error'),
  })
  const checkinMutation = useMutation({
    mutationFn: (id) => api.patch(`/bookings/${id}/checkin`),
    onSuccess:  () => { qc.invalidateQueries(['bookings']); notify('Checked in!') },
    onError:    (err) => notify(err.response?.data?.message || 'Check-in failed.', 'error'),
  })

  const statuses = ['ALL','BOOKED','CHECKED_IN','CANCELLED','LATE_CANCEL','ABSENT']
  const sorted   = [...bookings]
    .filter(b => filter === 'ALL' || b.status === filter)
    .sort((a, b) => b.date.localeCompare(a.date))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <SectionHeader title="My Bookings" sub={`${bookings.length} total bookings`} />

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {statuses.map(s => (
          <button key={s} onClick={() => setFilter(s)} style={{
            padding: '5px 12px', borderRadius: 99, cursor: 'pointer',
            border: `1px solid ${filter === s ? 'var(--accent)' : 'var(--border)'}`,
            background: filter === s ? 'var(--accent-bg)' : 'transparent',
            color: filter === s ? 'var(--accent)' : 'var(--text-mute)',
            fontSize: '0.73rem', fontFamily: 'var(--font-mono)', fontWeight: filter === s ? 600 : 400,
          }}>{s}</button>
        ))}
      </div>

      <div className="card anim-fade-up" style={{ overflow: 'hidden' }}>
        {sorted.length === 0
          ? <Empty icon={Icons.history} message="No bookings for this filter." />
          : sorted.map(b => (
            <div key={b._id || b.id} className="table-row" style={{ gridTemplateColumns: '1fr auto', alignItems: 'center', padding: '14px 20px', gap: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 38, height: 38, borderRadius: 9, background: 'var(--accent-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)', flexShrink: 0 }}>
                  {Icons.seat}
                </div>
                <div>
                  <div style={{ fontWeight: 500, fontSize: '0.9rem' }}>{displayDate(b.date)}</div>
                  <div style={{ display: 'flex', gap: 5, marginTop: 4 }}>
                    <StatusPill status={b.seatType} />
                    <StatusPill status={b.status}   />
                  </div>
                </div>
              </div>
              {b.status === 'BOOKED' && (
                <div style={{ display: 'flex', gap: 7, flexShrink: 0 }}>
                  <button className="btn-ghost" style={{ padding: '5px 10px', fontSize: '0.75rem', color: 'var(--green)', borderColor: 'rgba(45,125,90,0.4)' }} onClick={() => checkinMutation.mutate(b._id || b.id)}>
                    {Icons.check} Check In
                  </button>
                  <button className="btn-icon" style={{ width: 32, height: 32, borderColor: 'rgba(196,56,45,0.35)', color: 'var(--red)' }} onClick={() => cancelMutation.mutate(b._id || b.id)}>
                    {Icons.x}
                  </button>
                </div>
              )}
            </div>
          ))
        }
      </div>
    </div>
  )
}

// ── Waitlist ─────────────────────────────────────────────────────────────────
export function Waitlist() {
  const user   = useAuthStore(s => s.user)
  const notify = useUIStore(s => s.notify)
  const qc     = useQueryClient()
  // fairness computed from user object directly

  const { data: waitlist = [] } = useQuery({
    queryKey: ['waitlist', 'mine'],
    queryFn:  () => api.get('/waitlist/my').then(r => r.data),
  })

  const removeMutation = useMutation({
    mutationFn: (id) => api.delete(`/waitlist/${id}`),
    onSuccess:  () => { qc.invalidateQueries(['waitlist']); notify('Removed from waitlist.', 'warning') },
    onError:    (err) => notify(err.response?.data?.message || 'Failed.', 'error'),
  })

  const score = Math.max(0, 100 - (user.lateCancels??0)*10 - (user.absences??0)*5 - (user.bufferUsed??0)*2)
  const mine  = [...waitlist].sort((a, b) => b.date.localeCompare(a.date))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <SectionHeader title="Buffer Waitlist" sub="Pending requests for off-batch buffer seats" />

      <div className="card anim-fade-up" style={{ padding: '16px 20px', background: 'var(--accent-bg)', borderColor: 'var(--accent-ring)' }}>
        <div style={{ fontWeight: 600, fontSize: '0.88rem', marginBottom: 8 }}>Allocation Priority</div>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-sub)', lineHeight: 1.7 }}>
          When demand exceeds supply: <strong style={{ color: 'var(--text)' }}>lowest buffer usage (14d)</strong> → <strong style={{ color: 'var(--text)' }}>fewest late cancellations</strong> → <strong style={{ color: 'var(--text)' }}>fewest absences</strong> → <strong style={{ color: 'var(--text)' }}>earliest request time</strong>. Results confirmed by 9 AM.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 12 }}>
        {[
          { label: 'Fairness Score',   value: score,                                          color: 'var(--green)' },
          { label: 'Buffer Used (14d)',value: user.bufferUsed ?? 0,                           color: 'var(--blue)'  },
          { label: 'Pending Requests', value: mine.filter(w => w.status === 'PENDING').length, color: 'var(--amber)' },
        ].map((s, i) => (
          <div key={i} className="card" style={{ padding: '14px 16px' }}>
            <div style={{ fontSize: '1.6rem', fontFamily: 'var(--font-display)', fontWeight: 300, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-sub)', marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div className="card anim-fade-up-2" style={{ overflow: 'hidden' }}>
        {mine.length === 0
          ? <Empty icon={Icons.clock} message={'No waitlist entries. Go to "Book a Seat" to join.'} />
          : mine.map(w => (
            <div key={w._id || w.id} className="table-row" style={{ gridTemplateColumns: '1fr auto', padding: '14px 20px', alignItems: 'center', gap: 12 }}>
              <div>
                <div style={{ fontWeight: 500, fontSize: '0.9rem' }}>{displayDate(w.date)}</div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-mute)', marginTop: 3, fontFamily: 'var(--font-mono)' }}>
                  Priority score: {w.priorityScore ?? '—'}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <StatusPill status={w.status} />
                {w.status === 'PENDING' && (
                  <button className="btn-icon" style={{ width: 30, height: 30, borderColor: 'rgba(196,56,45,0.35)', color: 'var(--red)' }} onClick={() => removeMutation.mutate(w._id || w.id)}>
                    {Icons.x}
                  </button>
                )}
              </div>
            </div>
          ))
        }
      </div>
    </div>
  )
}

// ── Admin Overview ───────────────────────────────────────────────────────────
export function AdminOverview() {
  const { data: stats = {} } = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn:  () => api.get('/admin/stats').then(r => r.data),
  })

  const weekData = [
    { day: 'Mon', val: 8, color: 'var(--blue)'  },
    { day: 'Tue', val: 7, color: 'var(--blue)'  },
    { day: 'Wed', val: 9, color: 'var(--blue)'  },
    { day: 'Thu', val: 6, color: 'var(--green)' },
    { day: 'Fri', val: 8, color: 'var(--green)' },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SectionHeader title="Overview" sub="System-wide booking analytics and health" />

      <div className="anim-fade-up" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(120px,1fr))', gap: 12 }}>
        {[
          { label: 'Members',      val: stats.totalMembers   ?? 0,  color: 'var(--blue)'   },
          { label: 'Bookings',     val: stats.totalBookings  ?? 0,  color: 'var(--text)'   },
          { label: 'Checked In',   val: stats.checkedIn      ?? 0,  color: 'var(--green)'  },
          { label: 'Absences',     val: stats.absences       ?? 0,  color: 'var(--red)'    },
          { label: 'Cancellations',val: stats.cancellations  ?? 0,  color: 'var(--amber)'  },
          { label: 'Utilization',  val: `${stats.utilization ?? 0}%`, color: 'var(--accent)' },
        ].map((s, i) => (
          <div key={i} className="card" style={{ padding: '14px 16px' }}>
            <div style={{ fontSize: '1.7rem', fontFamily: 'var(--font-display)', fontWeight: 300, color: s.color, lineHeight: 1 }}>{s.val}</div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-sub)', marginTop: 5 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 16 }}>
        <div className="card anim-fade-up-2" style={{ padding: 20 }}>
          <div style={{ fontWeight: 600, fontSize: '0.88rem', marginBottom: 18 }}>Weekly Seat Usage</div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 90 }}>
            {weekData.map((d, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
                <div style={{ width: '100%', borderRadius: '4px 4px 0 0', background: d.color, opacity: 0.75, height: `${(d.val / 10) * 70}px`, transition: 'height 0.7s cubic-bezier(0.22,1,0.36,1)' }} />
                <span style={{ fontSize: '0.67rem', color: 'var(--text-mute)', fontFamily: 'var(--font-mono)' }}>{d.day}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card anim-fade-up-3" style={{ padding: 20 }}>
          <div style={{ fontWeight: 600, fontSize: '0.88rem', marginBottom: 14 }}>Batch Utilization</div>
          {[1, 2].map(bid => (
            <div key={bid} style={{ marginBottom: bid === 1 ? 14 : 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: 5 }}>
                <span style={{ color: 'var(--text-sub)' }}>Batch {bid}</span>
                <span style={{ fontFamily: 'var(--font-mono)', color: bid === 1 ? 'var(--blue)' : 'var(--green)' }}>
                  {stats[`batch${bid}Util`] ?? 0}%
                </span>
              </div>
              <div className="stat-bar-bg">
                <div className="stat-bar-fill" style={{ width: `${stats[`batch${bid}Util`] ?? 0}%`, background: bid === 1 ? 'var(--blue)' : 'var(--green)' }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Admin Users ──────────────────────────────────────────────────────────────
export function AdminUsers() {
  const notify = useUIStore(s => s.notify)
  const qc     = useQueryClient()
  const [search, setSearch] = useState('')
  const [roleF,  setRoleF]  = useState('ALL')

  const { data: users = [] } = useQuery({
    queryKey: ['admin', 'users'],
    queryFn:  () => api.get('/admin/users').then(r => r.data),
  })

  const blockMutation = useMutation({
    mutationFn: ({ id, status }) => api.patch(`/admin/users/${id}/status`, { status }),
    onSuccess: () => { qc.invalidateQueries(['admin', 'users']); notify('User status updated.') },
    onError:   (err) => notify(err.response?.data?.message || 'Failed.', 'error'),
  })

  const filtered = users.filter(u =>
    (roleF === 'ALL' || u.role === roleF) &&
    (u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <SectionHeader title="Users"
        sub={`${users.filter(u => u.role === 'USER').length} members · ${users.filter(u => u.status === 'BLOCKED').length} blocked`}
        action={<button className="btn-primary" onClick={() => notify('CSV import — wire to /api/admin/import-csv', 'warning')}>{Icons.upload} Import CSV</button>} />

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <span style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-mute)' }}>{Icons.search}</span>
          <input className="input" style={{ paddingLeft: 34 }} placeholder="Search name or email…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        {['ALL','USER','ADMIN'].map(f => (
          <button key={f} onClick={() => setRoleF(f)} style={{
            padding: '7px 12px', borderRadius: 99, cursor: 'pointer',
            border: `1px solid ${roleF === f ? 'var(--accent)' : 'var(--border)'}`,
            background: roleF === f ? 'var(--accent-bg)' : 'transparent',
            color: roleF === f ? 'var(--accent)' : 'var(--text-mute)',
            fontSize: '0.73rem', fontFamily: 'var(--font-mono)',
          }}>{f}</button>
        ))}
      </div>

      <div className="card anim-fade-up" style={{ overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr auto auto auto', gap: 12, padding: '9px 20px', borderBottom: '1px solid var(--border)', fontSize: '0.68rem', color: 'var(--text-mute)', fontFamily: 'var(--font-mono)', letterSpacing: '0.05em' }}>
          <span>NAME / EMAIL</span><span className="hide-mobile">BATCH</span><span>ROLE</span><span>STATUS</span><span></span>
        </div>
        {filtered.length === 0
          ? <Empty icon={Icons.users} message="No users match this filter." />
          : filtered.map(u => (
            <div key={u._id || u.id} className="table-row" style={{ gridTemplateColumns: '2fr 1.5fr auto auto auto', alignItems: 'center', padding: '12px 20px', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                <div style={{ width: 32, height: 32, borderRadius: 7, background: 'var(--accent-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontWeight: 500, color: 'var(--accent)', flexShrink: 0 }}>
                  {u.name.charAt(0)}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 500, fontSize: '0.87rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.name}</div>
                  <div style={{ fontSize: '0.73rem', color: 'var(--text-mute)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.email}</div>
                </div>
              </div>
              <div className="hide-mobile" style={{ fontSize: '0.77rem', fontFamily: 'var(--font-mono)', color: 'var(--text-sub)' }}>
                {u.batchId ? `B${u.batchId} · S${u.squadNo}` : '—'}
              </div>
              <StatusPill status={u.role} />
              <StatusPill status={u.status} />
              <button className="btn-ghost" style={{
                padding: '4px 10px', fontSize: '0.72rem',
                color: u.status === 'ACTIVE' ? 'var(--red)' : 'var(--green)',
                borderColor: u.status === 'ACTIVE' ? 'rgba(196,56,45,0.35)' : 'rgba(45,125,90,0.35)',
              }} onClick={() => blockMutation.mutate({ id: u._id || u.id, status: u.status === 'ACTIVE' ? 'BLOCKED' : 'ACTIVE' })}>
                {u.status === 'ACTIVE' ? 'Block' : 'Unblock'}
              </button>
            </div>
          ))
        }
      </div>
    </div>
  )
}

// ── Admin Bookings ───────────────────────────────────────────────────────────
export function AdminBookings() {
  const notify = useUIStore(s => s.notify)
  const qc     = useQueryClient()
  const [statusF, setStatusF] = useState('ALL')
  const [search,  setSearch]  = useState('')

  const { data: bookings = [] } = useQuery({
    queryKey: ['admin', 'bookings'],
    queryFn:  () => api.get('/admin/bookings').then(r => r.data),
  })

  const overrideMutation = useMutation({
    mutationFn: ({ id, status }) => api.patch(`/admin/bookings/${id}/override`, { status }),
    onSuccess: () => { qc.invalidateQueries(['admin', 'bookings']); notify('Booking updated.') },
    onError:   (err) => notify(err.response?.data?.message || 'Failed.', 'error'),
  })

  const filtered = bookings
    .filter(b => (statusF === 'ALL' || b.status === statusF) && (b.userName?.toLowerCase().includes(search.toLowerCase()) || b.date.includes(search)))
    .sort((a, b) => b.date.localeCompare(a.date))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <SectionHeader title="All Bookings" sub={`${bookings.length} total`} />

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <span style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-mute)' }}>{Icons.search}</span>
          <input className="input" style={{ paddingLeft: 34 }} placeholder="Search name or date…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        {['ALL','BOOKED','CHECKED_IN','CANCELLED','ABSENT'].map(f => (
          <button key={f} onClick={() => setStatusF(f)} style={{
            padding: '7px 12px', borderRadius: 99, cursor: 'pointer',
            border: `1px solid ${statusF === f ? 'var(--accent)' : 'var(--border)'}`,
            background: statusF === f ? 'var(--accent-bg)' : 'transparent',
            color: statusF === f ? 'var(--accent)' : 'var(--text-mute)',
            fontSize: '0.73rem', fontFamily: 'var(--font-mono)',
          }}>{f}</button>
        ))}
      </div>

      <div className="card anim-fade-up" style={{ overflow: 'hidden' }}>
        {filtered.length === 0
          ? <Empty icon={Icons.history} message="No bookings match this filter." />
          : filtered.map(b => (
            <div key={b._id || b.id} className="table-row" style={{ gridTemplateColumns: '1fr 1fr auto', alignItems: 'center', padding: '12px 20px', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: 7, background: 'var(--accent-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)', flexShrink: 0 }}>{Icons.seat}</div>
                <div>
                  <div style={{ fontWeight: 500, fontSize: '0.87rem' }}>{b.userName || 'Unknown'}</div>
                  <div style={{ fontSize: '0.73rem', color: 'var(--text-mute)', marginTop: 2 }}>
                    {displayDate(b.date)} · <span style={{ fontFamily: 'var(--font-mono)' }}>{b.seatType}</span>
                  </div>
                </div>
              </div>
              <StatusPill status={b.status} />
              <div style={{ display: 'flex', gap: 6 }}>
                {b.status === 'BOOKED' && <>
                  <button className="btn-ghost" style={{ padding: '4px 9px', fontSize: '0.72rem', color: 'var(--green)', borderColor: 'rgba(45,125,90,0.35)' }} onClick={() => overrideMutation.mutate({ id: b._id || b.id, status: 'CHECKED_IN' })}>{Icons.check}</button>
                  <button className="btn-ghost" style={{ padding: '4px 9px', fontSize: '0.72rem', color: 'var(--red)',   borderColor: 'rgba(196,56,45,0.35)'  }} onClick={() => overrideMutation.mutate({ id: b._id || b.id, status: 'ABSENT'     })}>{Icons.x}</button>
                </>}
              </div>
            </div>
          ))
        }
      </div>
    </div>
  )
}

// ── Admin Config ─────────────────────────────────────────────────────────────
export function AdminConfig() {
  const notify = useUIStore(s => s.notify)
  const qc     = useQueryClient()
  const [newHol, setNewHol] = useState({ date: '', desc: '' })

  const { data: cfg = {}, isLoading } = useQuery({
    queryKey: ['admin', 'config'],
    queryFn:  () => api.get('/admin/config').then(r => r.data),
  })
  const [form, setForm] = useState(null)
  const currentForm = form ?? cfg

  const saveMutation = useMutation({
    mutationFn: (data) => api.put('/admin/config', data),
    onSuccess: () => { qc.invalidateQueries(['admin', 'config']); notify('Configuration saved!') },
    onError:   (err) => notify(err.response?.data?.message || 'Save failed.', 'error'),
  })
  const addHolMutation = useMutation({
    mutationFn: (holiday) => api.post('/admin/holidays', holiday),
    onSuccess: () => { qc.invalidateQueries(['admin', 'config']); notify('Holiday added.'); setNewHol({ date: '', desc: '' }) },
    onError:   (err) => notify(err.response?.data?.message || 'Failed.', 'error'),
  })
  const delHolMutation = useMutation({
    mutationFn: (id) => api.delete(`/admin/holidays/${id}`),
    onSuccess: () => qc.invalidateQueries(['admin', 'config']),
  })

  if (isLoading) return <div style={{ padding: 40, color: 'var(--text-mute)' }}>Loading configuration…</div>

  const F = ({ label, field, type = 'text' }) => (
    <div>
      <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.06em', marginBottom: 6, fontFamily: 'var(--font-mono)', color: 'var(--text-sub)' }}>
        {label.toUpperCase()}
      </label>
      <input className="input" type={type} value={currentForm[field] ?? ''} onChange={e => setForm(f => ({ ...(f ?? cfg), [field]: type === 'number' ? Number(e.target.value) : e.target.value }))} />
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <SectionHeader title="Configuration" sub="System-wide settings — changes take effect immediately" />

      <div className="card anim-fade-up" style={{ padding: 20 }}>
        <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: 16 }}>Seat Capacity</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 14 }}>
          <F label="Guaranteed Seats (daily)" field="guaranteedSeats" type="number" />
          <F label="Buffer Seats (daily)"     field="bufferSeats"     type="number" />
        </div>
      </div>

      <div className="card anim-fade-up-2" style={{ padding: 20 }}>
        <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: 16 }}>Schedule & Times</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 14 }}>
          <F label="Cycle Start Date"        field="cycleStart"      type="date" />
          <F label="Timezone"                field="timezone"                    />
          <F label="Check-in Deadline"       field="checkInDeadline" type="time" />
          <F label="Same-day Booking Closes" field="bookingClose"    type="time" />
          <F label="Buffer Window Opens"     field="bufferOpen"      type="time" />
        </div>
      </div>

      <div className="card anim-fade-up-3" style={{ padding: 20 }}>
        <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: 14 }}>Holidays</div>
        <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
          <input className="input" type="date" value={newHol.date} onChange={e => setNewHol(p => ({ ...p, date: e.target.value }))} style={{ flex: '0 0 160px' }} />
          <input className="input" placeholder="Description (e.g. Republic Day)" value={newHol.desc} onChange={e => setNewHol(p => ({ ...p, desc: e.target.value }))} style={{ flex: 1, minWidth: 180 }} />
          <button className="btn-primary" onClick={() => { if (!newHol.date || !newHol.desc) { notify('Date and description required.', 'warning'); return } addHolMutation.mutate(newHol) }}>
            {Icons.plus} Add
          </button>
        </div>
        {(cfg.holidays || []).map(h => (
          <div key={h._id || h.date} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderTop: '1px solid var(--border)', fontSize: '0.85rem' }}>
            <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-sub)', flexShrink: 0 }}>{h.date}</span>
            <span style={{ flex: 1, paddingLeft: 16 }}>{h.description}</span>
            <button className="btn-icon" style={{ width: 28, height: 28, borderRadius: 6, borderColor: 'rgba(196,56,45,0.35)', color: 'var(--red)' }} onClick={() => delHolMutation.mutate(h._id)}>{Icons.x}</button>
          </div>
        ))}
      </div>

      <button className="btn-primary" onClick={() => saveMutation.mutate(currentForm)} style={{ alignSelf: 'flex-start', padding: '11px 24px' }}>
        {Icons.check} Save All Changes
      </button>
    </div>
  )
}
