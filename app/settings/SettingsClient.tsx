'use client'
import React, { useState } from 'react'
import type { Profile, Position, W2Settings } from '@/types'
import { saveProfile, savePosition, saveW2Settings } from '@/lib/db'

const DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']

interface Props {
  userId: string
  email: string
  initialProfile: Profile | null
  initialPosition: Position | null
  initialW2Settings: W2Settings | null
}

export default function SettingsClient({
  userId, email, initialProfile, initialPosition, initialW2Settings
}: Props) {
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  const [displayName, setDisplayName] = useState(initialProfile?.display_name ?? '')
  const [initials, setInitials] = useState(initialProfile?.initials ?? '')
  const [posName, setPosName] = useState(initialPosition?.name ?? '')
  const [rate, setRate] = useState(initialW2Settings?.hourly_rate?.toString() ?? '')
  const [payday, setPayday] = useState(initialW2Settings?.pay_day?.toString() ?? '5')
  const [fedPct, setFedPct] = useState(initialW2Settings?.federal_withholding_pct?.toString() ?? '10')

  async function handleSave() {
    setSaving(true)
    setSaved(false)
    setError('')
    try {
      await saveProfile(userId, {
        display_name: displayName.trim() || 'You',
        initials: initials.trim().toUpperCase().slice(0, 3) || '??',
        state_code: 'TX',
      })

      const position = await savePosition(userId, initialPosition?.id ?? null, {
        name: posName.trim() || 'Position',
        type: 'w2',
        color: '#639922',
        sort_order: 0,
      })

      await saveW2Settings(position.id, initialW2Settings?.id ?? null, {
        hourly_rate: parseFloat(rate) || 0,
        pay_day: parseInt(payday) || 5,
        federal_withholding_pct: parseFloat(fedPct) || 10,
        fica_pct: 7.65,
      })

      setSaved(true)
      // Hard navigate to dashboard — forces a full server-side refetch
      window.location.href = '/dashboard'
    } catch (err: any) {
      setError(err.message ?? 'Something went wrong. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 480 }}>
      <div>
        <h1 style={{ fontSize: 16, fontWeight: 600, letterSpacing: '-0.3px', color: 'var(--s800)' }}>Settings</h1>
        <p style={{ fontSize: 10, color: 'var(--s400)', marginTop: 2 }}>Signed in as {email}</p>
      </div>

      <Section title="Your profile">
        <Field label="Display name">
          <input value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="Your name" />
        </Field>
        <Field label="Initials (shown in avatar, max 3 characters)">
          <input value={initials} onChange={e => setInitials(e.target.value)} maxLength={3} placeholder="88" />
        </Field>
      </Section>

      <Section title="Position">
        <Field label="Position name">
          <input value={posName} onChange={e => setPosName(e.target.value)} placeholder="ShopRite" />
        </Field>
        <Field label="Hourly rate ($)">
          <input type="number" step="0.01" min="0" value={rate} onChange={e => setRate(e.target.value)} placeholder="12.12" />
        </Field>
        <Field label="Payday">
          <select value={payday} onChange={e => setPayday(e.target.value)}>
            {DAYS.map((d, i) => <option key={i} value={i}>{d}</option>)}
          </select>
        </Field>
        <Field label="Federal withholding % (from your W-4)">
          <input type="number" step="1" min="0" max="50" value={fedPct} onChange={e => setFedPct(e.target.value)} placeholder="10" />
        </Field>
        <div style={{ fontSize: 10, color: 'var(--s400)', lineHeight: 1.6 }}>
          Texas has no state income tax. FICA (Social Security + Medicare) is fixed at 7.65% and applied automatically.
        </div>
      </Section>

      {error && (
        <div style={{ fontSize: 11, color: 'var(--danger-tx)', background: 'var(--danger-bg)', border: '0.5px solid var(--danger-bd)', borderRadius: 6, padding: '9px 12px' }}>
          {error}
        </div>
      )}

      <button
        onClick={handleSave}
        disabled={saving}
        style={{
          padding: '10px', borderRadius: 6,
          border: '0.5px solid var(--g400)',
          background: saved ? 'var(--g100)' : 'var(--g50)',
          color: 'var(--g600)', fontSize: 12, fontWeight: 600,
          cursor: saving ? 'wait' : 'pointer',
          fontFamily: 'var(--fm)', transition: 'background 0.2s',
        }}
      >
        {saving ? 'Saving…' : 'Save changes'}
      </button>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: 'var(--s0)', borderRadius: 10, border: '0.5px solid var(--s200)', padding: '13px 15px' }}>
      <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--s500)', textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: 12 }}>{title}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>{children}</div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ fontSize: 9, fontWeight: 600, color: 'var(--s500)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 4 }}>{label}</div>
      {React.Children.map(children, child =>
        React.isValidElement(child)
          ? React.cloneElement(child as React.ReactElement<any>, {
              style: {
                width: '100%', padding: '7px 10px',
                border: '0.5px solid var(--s200)', borderRadius: 5,
                fontSize: 12, background: 'var(--s50)',
                color: 'var(--s800)', outline: 'none', fontFamily: 'var(--fm)',
              }
            })
          : child
      )}
    </div>
  )
}
