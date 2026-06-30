'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function ResetPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [ready, setReady] = useState(false)

  useEffect(() => {
    // Supabase sets the session from the URL hash on load
    const supabase = createClient()
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true)
      else setError('Invalid or expired reset link. Request a new one from the login page.')
    })
  }, [])

  async function handleReset(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirm) { setError('Passwords do not match.'); return }
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return }
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })
    if (error) { setError(error.message); setLoading(false); return }
    router.push('/dashboard')
    router.refresh()
  }

  const card: React.CSSProperties = {
    background: 'var(--s0)', border: '0.5px solid var(--s200)',
    borderRadius: 12, padding: '32px 28px', width: '100%', maxWidth: 360,
  }
  const fieldStyle: React.CSSProperties = {
    width: '100%', padding: '9px 12px', fontSize: 13,
    border: '0.5px solid var(--s200)', borderRadius: 6,
    background: 'var(--s50)', color: 'var(--s800)', outline: 'none', marginBottom: 10,
  }

  return (
    <div style={card}>
      <div style={{ marginBottom: 24, textAlign: 'center' }}>
        <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.5px', color: 'var(--s800)' }}>
          diamond<span style={{ color: 'var(--g400)' }}>dimes</span>
        </div>
        <div style={{ fontSize: 11, color: 'var(--s400)', marginTop: 4 }}>Set a new password</div>
      </div>

      {error && (
        <div style={{ fontSize: 11, color: 'var(--danger-tx)', background: 'var(--danger-bg)', border: '0.5px solid var(--danger-bd)', borderRadius: 5, padding: '7px 10px', marginBottom: 12 }}>
          {error}
        </div>
      )}

      {ready && (
        <form onSubmit={handleReset}>
          <label style={{ fontSize: 10, fontWeight: 600, color: 'var(--s500)', textTransform: 'uppercase', letterSpacing: '0.7px', display: 'block', marginBottom: 5 }}>New password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Minimum 8 characters" required minLength={8} style={fieldStyle} autoFocus />
          <label style={{ fontSize: 10, fontWeight: 600, color: 'var(--s500)', textTransform: 'uppercase', letterSpacing: '0.7px', display: 'block', marginBottom: 5 }}>Confirm password</label>
          <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Same password again" required style={fieldStyle} />
          <button type="submit" disabled={loading || !password || !confirm}
            style={{ width: '100%', padding: '9px', borderRadius: 6, border: '0.5px solid var(--g400)', background: 'var(--g50)', color: 'var(--g600)', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--fm)' }}>
            {loading ? 'Saving…' : 'Set new password'}
          </button>
        </form>
      )}
    </div>
  )
}
