import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../store/authStore'
import useUIStore   from '../store/uiStore'
import { FormField } from '../components/UI'
import Icons from '../components/Icons'
import { signupSchema, loginSchema } from '../utils/validators'

export default function AuthPage() {
  const navigate  = useNavigate()
  const loginFn   = useAuthStore(s => s.login)
  const signupFn  = useAuthStore(s => s.signup)
  const { dark, toggleDark, notify } = useUIStore()

  const [tab,      setTab]     = useState('signin')
  const [loading,  setLoading] = useState(false)
  const [errors,   setErrors]  = useState({})

  const [signIn, setSignIn] = useState({ email: '', password: '' })
  const [form,   setForm]   = useState({ name: '', email: '', password: '', confirmPassword: '', role: 'USER', batchId: 1, squadNo: 1 })

  const validate = (schema, data) => {
    const result = schema.safeParse(data)
    if (result.success) { setErrors({}); return true }
    const errs = {}
    result.error.errors.forEach(e => { errs[e.path[0]] = e.message })
    setErrors(errs)
    return false
  }

  const handleSignIn = async () => {
    if (!validate(loginSchema, signIn)) return
    setLoading(true)
    try {
      const user = await loginFn(signIn.email, signIn.password)
      notify(`Welcome back, ${user.name.split(' ')[0]}!`)
      navigate(user.role === 'ADMIN' ? '/overview' : '/dashboard')
    } catch (err) {
      setErrors({ _global: err.response?.data?.message || 'Invalid email or password.' })
    } finally {
      setLoading(false)
    }
  }

  const handleSignUp = async () => {
    const payload = { ...form, batchId: Number(form.batchId), squadNo: Number(form.squadNo) }
    if (!validate(signupSchema, payload)) return
    setLoading(true)
    try {
      const user = await signupFn(payload)
      notify(`Account created! Welcome, ${user.name.split(' ')[0]}! 🎉`)
      navigate(user.role === 'ADMIN' ? '/overview' : '/dashboard')
    } catch (err) {
      setErrors({ _global: err.response?.data?.message || 'Something went wrong. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  const onKey = (e, fn) => e.key === 'Enter' && !loading && fn()

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>

      {/* Top bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 32px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, background: 'var(--accent)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
            {Icons.seat}
          </div>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: '1.15rem', letterSpacing: '-0.03em' }}>SeatSync</span>
        </div>
        <button className="btn-icon" style={{ width: 36, height: 36 }} onClick={toggleDark} title="Toggle theme">
          {dark ? Icons.sun : Icons.moon}
        </button>
      </div>

      {/* Hero + Form */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
        <div style={{ width: '100%', maxWidth: 460 }}>

          {/* Hero text */}
          <div className="anim-fade-up" style={{ textAlign: 'center', marginBottom: 36 }}>
            <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 400, fontSize: 'clamp(2rem,7vw,2.9rem)', letterSpacing: '-0.04em', lineHeight: 1.1 }}>
              Your office,<br />
              <em style={{ fontStyle: 'italic', color: 'var(--accent)' }}>on your terms.</em>
            </h1>
            <p style={{ color: 'var(--text-sub)', fontSize: '0.92rem', marginTop: 14, lineHeight: 1.65 }}>
              Hybrid workspace booking — fair, transparent, and instant.
            </p>
          </div>

          {/* Auth card */}
          <div className="card anim-fade-up-2" style={{ padding: '28px 32px', boxShadow: 'var(--shadow-lg)' }}>

            {/* Tab switcher */}
            <div className="seg-ctrl" style={{ marginBottom: 24 }}>
              {[['signin', 'Sign In'], ['signup', 'Create Account']].map(([val, label]) => (
                <button
                  key={val}
                  className={`seg-btn${tab === val ? ' active' : ''}`}
                  onClick={() => { setTab(val); setErrors({}) }}
                >{label}</button>
              ))}
            </div>

            {/* Global error */}
            {errors._global && (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, background: 'var(--red-bg)', border: '1px solid rgba(196,56,45,0.3)', borderRadius: 8, padding: '10px 12px', marginBottom: 16, fontSize: '0.82rem', color: 'var(--red)', lineHeight: 1.5 }}>
                {Icons.info} {errors._global}
              </div>
            )}

            {tab === 'signin' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <FormField label="Email address" error={errors.email}>
                  <input className="input" type="email" placeholder="you@corp.io" value={signIn.email}
                    onChange={e => setSignIn(p => ({ ...p, email: e.target.value }))}
                    onKeyDown={e => onKey(e, handleSignIn)} />
                </FormField>
                <FormField label="Password" error={errors.password}>
                  <input className="input" type="password" placeholder="Enter your password" value={signIn.password}
                    onChange={e => setSignIn(p => ({ ...p, password: e.target.value }))}
                    onKeyDown={e => onKey(e, handleSignIn)} />
                </FormField>
                <button className="btn-primary" onClick={handleSignIn} disabled={loading} style={{ width: '100%', padding: '12px', marginTop: 4 }}>
                  {loading ? 'Signing in…' : 'Sign In →'}
                </button>
                <div style={{ textAlign: 'center', paddingTop: 12, borderTop: '1px solid var(--border)', marginTop: 4 }}>
                  <p style={{ fontSize: '0.73rem', color: 'var(--text-mute)', fontFamily: 'var(--font-mono)' }}>
                    member: arjun@corp.io / pass123 &nbsp;·&nbsp; admin: admin@corp.io / admin123
                  </p>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
                <FormField label="Full name" error={errors.name}>
                  <input className="input" type="text" placeholder="Your full name" value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                </FormField>
                <FormField label="Work email" error={errors.email}>
                  <input className="input" type="email" placeholder="you@corp.io" value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                </FormField>

                {/* Role selector — visual cards */}
                <FormField label="Account type" error={errors.role}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {[['USER', 'Member'], ['ADMIN', 'Admin']].map(([val, label]) => (
                      <button key={val} onClick={() => setForm(f => ({ ...f, role: val }))} style={{
                        flex: 1, padding: '10px', borderRadius: 9,
                        border: `1.5px solid ${form.role === val ? 'var(--accent)' : 'var(--border)'}`,
                        background: form.role === val ? 'var(--accent-bg)' : 'transparent',
                        color: form.role === val ? 'var(--accent)' : 'var(--text-sub)',
                        fontWeight: form.role === val ? 600 : 400,
                        fontSize: '0.88rem', transition: 'all 0.15s',
                      }}>{label}</button>
                    ))}
                  </div>
                </FormField>

                {form.role === 'USER' && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <FormField label="Batch" error={errors.batchId}>
                      <select className="input" value={form.batchId} onChange={e => setForm(f => ({ ...f, batchId: e.target.value }))}>
                        <option value={1}>Batch 1</option>
                        <option value={2}>Batch 2</option>
                      </select>
                    </FormField>
                    <FormField label="Squad (1–5)" error={errors.squadNo}>
                      <select className="input" value={form.squadNo} onChange={e => setForm(f => ({ ...f, squadNo: e.target.value }))}>
                        {[1,2,3,4,5].map(n => <option key={n} value={n}>Squad {n}</option>)}
                      </select>
                    </FormField>
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <FormField label="Password" error={errors.password}>
                    <input className="input" type="password" placeholder="Min 4 chars" value={form.password}
                      onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
                  </FormField>
                  <FormField label="Confirm" error={errors.confirmPassword}>
                    <input className="input" type="password" placeholder="Repeat" value={form.confirmPassword}
                      onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))}
                      onKeyDown={e => onKey(e, handleSignUp)} />
                  </FormField>
                </div>

                <button className="btn-primary" onClick={handleSignUp} disabled={loading} style={{ width: '100%', padding: '12px', marginTop: 4 }}>
                  {loading ? 'Creating account…' : 'Create Account →'}
                </button>
              </div>
            )}
          </div>

          <p className="anim-fade-up-3" style={{ textAlign: 'center', fontSize: '0.73rem', color: 'var(--text-mute)', marginTop: 20 }}>
            By signing in you agree to SeatSync's terms of use and privacy policy.
          </p>
        </div>
      </div>
    </div>
  )
}
