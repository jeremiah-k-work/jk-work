'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

type Mode = 'login' | 'signup'

export default function LoginPage() {
  const router = useRouter()
  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim() || !password) return
    setLoading(true)
    setError('')
    const supabase = createClient()

    if (mode === 'signup') {
      const { error } = await supabase.auth.signUp({ email: email.trim(), password })
      if (error) { setError(error.message); setLoading(false); return }
      // Auto sign in after signup
      const { error: signInError } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
      if (signInError) { setError(signInError.message); setLoading(false); return }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
      if (error) { setError(error.message); setLoading(false); return }
    }

    router.push('/dashboard')
    router.refresh()
  }

  const card: React.CSSProperties = {
    background: 'var(--s0)',
    border: '0.5px solid var(--s200)',
    borderRadius: 12,
    padding: '32px 28px',
    width: '100%',
    maxWidth: 360,
  }

  const fieldStyle: React.CSSProperties = {
    width: '100%',
    padding: '9px 12px',
    fontSize: 13,
    border: '0.5px solid var(--s200)',
    borderRadius: 6,
    background: 'var(--s50)',
    color: 'var(--s800)',
    outline: 'none',
    marginBottom: 10,
  }

  return (
    <div style={card}>
      <div style={{ marginBottom: 24, textAlign: 'center' }}>
        <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.5px', color: 'var(--s800)' }}>
          diamond<span style={{ color: 'var(--g400)' }}>dimes</span>
        </div>
        <div style={{ fontSize: 11, color: 'var(--s400)', marginTop: 4 }}>
          your financial foundation
        </div>
      </div>

      {/* Mode toggle */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, background: 'var(--s100)', borderRadius: 7, padding: 3, marginBottom: 20 }}>
        {(['login', 'signup'] as Mode[]).map(m => (
          <button
            key={m}
            onClick={() => { setMode(m); setError('') }}
            style={{
              padding: '6px',
              borderRadius: 5,
              border: 'none',
              background: mode === m ? 'var(--s0)' : 'transparent',
              color: mode === m ? 'var(--s800)' : 'var(--s400)',
              fontSize: 11,
              fontWeight: mode === m ? 600 : 400,
              cursor: 'pointer',
              fontFamily: 'var(--fm)',
              boxShadow: mode === m ? '0 0.5px 2px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.15s',
            }}
          >
            {m === 'login' ? 'Sign in' : 'Create account'}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        <label style={{ fontSize: 10, fontWeight: 600, color: 'var(--s500)', textTransform: 'uppercase', letterSpacing: '0.7px', display: 'block', marginBottom: 5 }}>
          Email address
        </label>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
          autoFocus
          style={fieldStyle}
        />

        <label style={{ fontSize: 10, fontWeight: 600, color: 'var(--s500)', textTransform: 'uppercase', letterSpacing: '0.7px', display: 'block', marginBottom: 5 }}>
          Password
        </label>
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder={mode === 'signup' ? 'Choose a strong password' : 'Your password'}
          required
          minLength={mode === 'signup' ? 8 : undefined}
          style={fieldStyle}
        />

        {mode === 'signup' && (
          <div style={{ fontSize: 10, color: 'var(--s400)', marginBottom: 10, marginTop: -4 }}>
            Minimum 8 characters.
          </div>
        )}

        {error && (
          <div style={{ fontSize: 11, color: 'var(--danger-tx)', background: 'var(--danger-bg)', border: '0.5px solid var(--danger-bd)', borderRadius: 5, padding: '7px 10px', marginBottom: 10 }}>
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !email.trim() || !password}
          style={{
            width: '100%',
            padding: '9px',
            borderRadius: 6,
            border: '0.5px solid var(--g400)',
            background: 'var(--g50)',
            color: 'var(--g600)',
            fontSize: 12,
            fontWeight: 600,
            cursor: loading ? 'wait' : 'pointer',
            fontFamily: 'var(--fm)',
            opacity: (!email.trim() || !password) ? 0.5 : 1,
          }}
        >
          {loading ? (mode === 'login' ? 'Signing in…' : 'Creating account…') : (mode === 'login' ? 'Sign in' : 'Create account')}
        </button>
      </form>

      {mode === 'login' && (
        <div style={{ textAlign: 'center', marginTop: 14 }}>
          <button
            onClick={async () => {
              if (!email.trim()) { setError('Enter your email first.'); return }
              setError('')
              const supabase = createClient()
              await supabase.auth.resetPasswordForEmail(email.trim(), {
                redirectTo: `${window.location.origin}/auth/reset`,
              })
              setError('If that email exists, a reset link has been sent.')
            }}
            style={{ fontSize: 10, color: 'var(--s400)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--fm)' }}
          >
            Forgot password?
          </button>
        </div>
      )}
    </div>
  )
}
