'use client'
import React, { useState } from 'react'
import type { Bill, BillInstance } from '@/types'
import { fmt, buildBillInstances } from '@/lib/calculations'
import { saveBill, deleteBill } from '@/lib/db'

const CATEGORIES = ['rent','utilities','internet','phone','insurance','subscriptions','other'] as const
const ICONS: Record<string, string> = { rent:'ti-home', utilities:'ti-bolt', internet:'ti-wifi', phone:'ti-device-mobile', insurance:'ti-shield', subscriptions:'ti-refresh', other:'ti-receipt' }

function dueLabel(days: number) {
  if (days < 0) return `${Math.abs(days)}d overdue`
  if (days === 0) return 'due today'
  if (days === 1) return 'due tomorrow'
  return `due in ${days}d`
}

function ordinal(n: number): string {
  const s = ['th','st','nd','rd']
  const v = n % 100
  return s[(v - 20) % 10] ?? s[v] ?? s[0]
}

const URGENCY_STYLE: Record<string, { bg: string; bd: string; tx: string }> = {
  overdue:  { bg: 'var(--danger-bg)', bd: 'var(--danger-bd)', tx: 'var(--danger-tx)' },
  critical: { bg: 'var(--danger-bg)', bd: 'var(--danger-bd)', tx: 'var(--danger-tx)' },
  soon:     { bg: 'var(--warn-bg)',   bd: 'var(--warn-bd)',   tx: 'var(--warn-tx)'   },
  upcoming: { bg: 'var(--warn-bg)',   bd: 'var(--warn-bd)',   tx: 'var(--warn-tx)'   },
  later:    { bg: 'var(--s50)',       bd: 'transparent',       tx: 'var(--s800)'      },
}

const emptyForm = () => ({ name: '', amount: '', category: 'other' as Bill['category'], due_day: '', note: '' })

interface Props { userId: string; initialBills: Bill[]; initialInstances: BillInstance[] }

export default function BillsClient({ userId, initialBills, initialInstances }: Props) {
  const [bills, setBills] = useState<Bill[]>(initialBills)
  const [instances, setInstances] = useState<BillInstance[]>(initialInstances)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm())
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')

  function refresh(updated: Bill[]) {
    setBills(updated)
    setInstances(buildBillInstances(updated, 60))
  }

  function openNew() { setForm(emptyForm()); setEditingId(null); setFormError(''); setShowForm(true) }
  function openEdit(bill: Bill) {
    setForm({ name: bill.name, amount: bill.amount.toString(), category: bill.category, due_day: bill.due_day.toString(), note: bill.note ?? '' })
    setEditingId(bill.id)
    setFormError('')
    setShowForm(true)
  }
  function closeForm() { setShowForm(false); setEditingId(null); setForm(emptyForm()); setFormError('') }

  async function handleSave() {
    const amount = parseFloat(form.amount)
    const due_day = parseInt(form.due_day)
    if (!form.name.trim()) { setFormError('Name is required.'); return }
    if (isNaN(amount) || amount <= 0) { setFormError('Enter a valid amount.'); return }
    if (isNaN(due_day) || due_day < 1 || due_day > 31) { setFormError('Due day must be between 1 and 31.'); return }

    setSaving(true)
    setFormError('')
    try {
      const saved = await saveBill(userId, editingId, {
        name: form.name.trim(),
        amount,
        category: form.category,
        recurrence: 'monthly',
        due_day,
        note: form.note.trim() || undefined,
        sort_order: editingId ? (bills.find(b => b.id === editingId)?.sort_order ?? bills.length) : bills.length,
      })
      const updated = editingId
        ? bills.map(b => b.id === editingId ? saved : b)
        : [...bills, saved]
      refresh(updated)
      closeForm()
    } catch (err: any) {
      setFormError(err.message ?? 'Save failed. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Remove this bill?')) return
    try {
      await deleteBill(id, userId)
      refresh(bills.filter(b => b.id !== id))
    } catch (err: any) {
      alert(err.message)
    }
  }

  const totalMonthly = bills.reduce((s, b) => s + b.amount, 0)

  return (
    <div style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 720 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: 16, fontWeight: 600, letterSpacing: '-0.3px', color: 'var(--s800)' }}>Bills</h1>
          <p style={{ fontSize: 10, color: 'var(--s400)', marginTop: 2 }}>
            {bills.length} active · {fmt(totalMonthly)}/mo total
          </p>
        </div>
        <button onClick={openNew} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 13px', border: '0.5px solid var(--g400)', borderRadius: 6, background: 'var(--g50)', color: 'var(--g600)', fontSize: 11, fontWeight: 500, cursor: 'pointer', fontFamily: 'var(--fm)' }}>
          <i className="ti ti-plus" aria-hidden="true" /> Add bill
        </button>
      </div>

      {instances.length > 0 && (
        <div style={{ background: 'var(--s0)', borderRadius: 10, border: '0.5px solid var(--s200)', padding: '13px 15px' }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--s500)', textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: 10 }}>Coming up (next 60 days)</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            {instances.map(inst => {
              const s = URGENCY_STYLE[inst.urgency]
              const icon = ICONS[inst.bill.category] ?? 'ti-receipt'
              return (
                <div key={inst.bill.id + inst.due_date} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', borderRadius: 7, background: s.bg, border: `0.5px solid ${s.bd}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 24, height: 24, borderRadius: 5, background: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: s.tx }}>
                      <i className={`ti ${icon}`} aria-hidden="true" />
                    </div>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 500, color: s.tx }}>{inst.bill.name}</div>
                      <div style={{ fontSize: 9, color: s.tx }}>{dueLabel(inst.days_until)} · due on the {inst.bill.due_day}{ordinal(inst.bill.due_day)}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: s.tx }}>{fmt(inst.bill.amount)}</div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div style={{ background: 'var(--s0)', borderRadius: 10, border: '0.5px solid var(--s200)', padding: '13px 15px' }}>
        <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--s500)', textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: 10 }}>All bills</div>
        {bills.length === 0 ? (
          <div style={{ fontSize: 12, color: 'var(--s400)', padding: '12px 0' }}>No bills yet. Add one above.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {bills.map(bill => (
              <div key={bill.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 4px', borderBottom: '0.5px solid var(--s100)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 22, height: 22, borderRadius: 5, background: 'var(--s50)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: 'var(--s500)' }}>
                    <i className={`ti ${ICONS[bill.category] ?? 'ti-receipt'}`} aria-hidden="true" />
                  </div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--s800)' }}>{bill.name}</div>
                    <div style={{ fontSize: 9, color: 'var(--s400)' }}>Due on the {bill.due_day}{ordinal(bill.due_day)} · monthly</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--s800)' }}>{fmt(bill.amount)}</div>
                  <button onClick={() => openEdit(bill)} style={{ padding: '4px 8px', border: '0.5px solid var(--s200)', borderRadius: 5, background: 'transparent', color: 'var(--s400)', fontSize: 10, cursor: 'pointer', fontFamily: 'var(--fm)' }}>Edit</button>
                  <button onClick={() => handleDelete(bill.id)} style={{ padding: '4px 8px', border: '0.5px solid var(--danger-bd)', borderRadius: 5, background: 'transparent', color: 'var(--danger-tx)', fontSize: 10, cursor: 'pointer', fontFamily: 'var(--fm)' }}>Remove</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(247,246,242,0.88)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ background: 'var(--s0)', border: '0.5px solid var(--s200)', borderRadius: 12, padding: '24px', width: '100%', maxWidth: 360 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--s800)', marginBottom: 16 }}>{editingId ? 'Edit bill' : 'Add bill'}</div>

            <FormField label="Name">
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Rent" autoFocus />
            </FormField>
            <FormField label="Amount ($)">
              <input type="number" step="0.01" min="0" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} placeholder="850" />
            </FormField>
            <FormField label="Category">
              <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value as Bill['category'] }))}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
              </select>
            </FormField>
            <FormField label="Due day of month (1–31)">
              <input type="number" min="1" max="31" value={form.due_day} onChange={e => setForm(f => ({ ...f, due_day: e.target.value }))} placeholder="1" />
            </FormField>
            <FormField label="Note (optional)">
              <input value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} placeholder="Optional note" />
            </FormField>

            {formError && (
              <div style={{ fontSize: 11, color: 'var(--danger-tx)', background: 'var(--danger-bg)', border: '0.5px solid var(--danger-bd)', borderRadius: 5, padding: '7px 10px', marginBottom: 10 }}>
                {formError}
              </div>
            )}

            <div style={{ display: 'flex', gap: 8, marginTop: 18, justifyContent: 'flex-end' }}>
              <button onClick={closeForm} style={{ padding: '7px 14px', borderRadius: 5, border: '0.5px solid var(--s200)', background: 'transparent', color: 'var(--s500)', fontSize: 11, cursor: 'pointer', fontFamily: 'var(--fm)' }}>Cancel</button>
              <button onClick={handleSave} disabled={saving} style={{ padding: '7px 14px', borderRadius: 5, border: '0.5px solid var(--g400)', background: 'var(--g50)', color: 'var(--g600)', fontSize: 11, fontWeight: 500, cursor: saving ? 'wait' : 'pointer', fontFamily: 'var(--fm)' }}>
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ fontSize: 9, fontWeight: 600, color: 'var(--s500)', textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: 4 }}>{label}</div>
      {React.Children.map(children, child =>
        React.isValidElement(child)
          ? React.cloneElement(child as React.ReactElement<any>, {
              style: { width: '100%', padding: '7px 10px', border: '0.5px solid var(--s200)', borderRadius: 5, fontSize: 12, background: 'var(--s50)', color: 'var(--s800)', outline: 'none', fontFamily: 'var(--fm)' }
            })
          : child
      )}
    </div>
  )
}
