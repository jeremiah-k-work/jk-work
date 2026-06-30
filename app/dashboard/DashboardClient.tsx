'use client'
import { useState, useMemo, useCallback } from 'react'
import { format, addDays } from 'date-fns'
import type { Profile, Position, W2Settings, WorkEntry, BillInstance } from '@/types'
import { buildWeekDays, getWeekStart, nextPayday, isoDate, fmt, fmtShort, buildPaycheckBreakdown, totalWithholdingPct } from '@/lib/calculations'
import { upsertWorkEntry, deleteWorkEntry } from '@/lib/db'

interface Props {
  userId: string
  profile: Profile | null
  position: Position | null
  w2Settings: W2Settings | null
  initialEntries: WorkEntry[]
  initialBillInstances: BillInstance[]
  paydayDate: string
}

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const BILL_ICONS: Record<string, string> = { rent:'ti-home', utilities:'ti-bolt', internet:'ti-wifi', phone:'ti-device-mobile', insurance:'ti-shield', subscriptions:'ti-refresh', other:'ti-receipt' }

function dueLabel(days: number): string {
  if (days < 0) return `${Math.abs(days)}d overdue`
  if (days === 0) return 'due today'
  if (days === 1) return 'due tomorrow'
  return `due in ${days}d`
}

function dotColor(u: string): string {
  return { overdue: '#e24b4a', critical: '#e24b4a', soon: '#ef9f27', upcoming: '#ba7517', later: '#b4b2a9' }[u] ?? '#b4b2a9'
}

export default function DashboardClient({ userId, position, w2Settings, initialEntries, initialBillInstances, paydayDate }: Props) {
  const [entries, setEntries] = useState<WorkEntry[]>(initialEntries)
  const [weekOffset, setWeekOffset] = useState(0)
  const [saving, setSaving] = useState<string | null>(null)

  const rate = w2Settings?.hourly_rate ?? 0
  const withholdPct = w2Settings ? totalWithholdingPct(w2Settings) : 22.65

  const weekStart = useMemo(() => getWeekStart(weekOffset), [weekOffset])
  const days = useMemo(() =>
    buildWeekDays(weekStart, entries, rate, paydayDate, initialBillInstances),
    [weekStart, entries, rate, paydayDate, initialBillInstances]
  )

  const weekGross = days.reduce((s, d) => s + d.earnings, 0)
  const weekHours = days.reduce((s, d) => s + (d.entry?.hours ?? 0), 0)
  const weekNet = Math.round(weekGross * (1 - withholdPct / 100) * 100) / 100
  const bills7 = initialBillInstances.filter(b => b.days_until >= 0 && b.days_until <= 7)
  const bills7total = bills7.reduce((s, b) => s + b.bill.amount, 0)
  const afterBills = Math.round((weekNet - bills7total) * 100) / 100
  const maxExpected = rate * 40
  const progress = maxExpected > 0 ? Math.min(weekGross / maxExpected, 1) * 100 : 0

  const weekEnd = addDays(weekStart, 6)
  const wsM = MONTH_NAMES[weekStart.getMonth()]
  const weM = MONTH_NAMES[weekEnd.getMonth()]
  const rangeLabel = wsM === weM
    ? `${wsM} ${weekStart.getDate()} – ${weekEnd.getDate()}`
    : `${wsM} ${weekStart.getDate()} – ${weM} ${weekEnd.getDate()}`

  const todayStr = isoDate(new Date())
  const todayEntry = entries.find(e => e.date === todayStr)

  const [logHours, setLogHours] = useState(todayEntry?.hours.toString() ?? '')
  const logParsed = parseFloat(logHours)
  const logValid = !isNaN(logParsed) && logParsed >= 0 && logParsed <= 24 && logHours !== ''
  const logCalc = logValid ? fmt(Math.round(logParsed * rate * 100) / 100) : '—'

  const handleHoursChange = useCallback(async (date: string, hours: number) => {
    if (!position) return
    setSaving(date)
    try {
      if (hours === 0) {
        const existing = entries.find(e => e.date === date)
        if (existing) {
          await deleteWorkEntry(existing.id)
          setEntries(prev => prev.filter(e => e.date !== date))
        }
      } else {
        const saved = await upsertWorkEntry({ position_id: position.id, user_id: userId, date, hours })
        if (saved) {
          setEntries(prev => {
            const idx = prev.findIndex(e => e.date === date)
            if (idx >= 0) return prev.map((e, i) => i === idx ? saved : e)
            return [...prev, saved]
          })
        }
      }
    } finally {
      setSaving(null)
    }
  }, [position, userId, entries])

  async function saveToday() {
    if (!logValid) return
    await handleHoursChange(todayStr, logParsed)
  }

  if (!position || !w2Settings) {
    return (
      <div style={{ padding: '40px 24px', textAlign: 'center' }}>
        <div style={{ fontSize: 14, color: 'var(--s500)', marginBottom: 12 }}>No position set up yet.</div>
        <a href="/settings" style={{ fontSize: 12, color: 'var(--g500)', border: '0.5px solid var(--g400)', borderRadius: 6, padding: '7px 14px', background: 'var(--g50)' }}>
          Set up your position →
        </a>
      </div>
    )
  }

  return (
    <div style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: 16, fontWeight: 600, letterSpacing: '-0.3px', color: 'var(--s800)' }}>Week of {rangeLabel}</h1>
          <p style={{ fontSize: 10, color: 'var(--s400)', marginTop: 2 }}>
            {position.name} · {fmt(rate)}/hr · ~{Math.round(withholdPct)}% withheld · Texas (no state income tax)
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <NavBtn onClick={() => setWeekOffset(o => o - 1)} icon="ti-chevron-left" label="Previous week" />
          <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--s800)', minWidth: 64, textAlign: 'center' }}>
            {weekOffset === 0 ? 'This week' : weekOffset > 0 ? `+${weekOffset}w` : `${weekOffset}w`}
          </span>
          <NavBtn onClick={() => setWeekOffset(o => o + 1)} icon="ti-chevron-right" label="Next week" />
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 8 }}>
        <StatCard label="Earned this week" value={fmt(weekGross)} sub={`${weekHours} hrs · ${fmt(rate)}/hr`} tone="pos" />
        <StatCard label="Est. net pay" value={fmt(weekNet)} sub={`after ~${Math.round(withholdPct)}% withheld`} />
        <StatCard label="Bills due next 7 days" value={bills7total > 0 ? fmt(bills7total) : 'None'} sub={bills7.map(b => b.bill.name).join(', ') || 'Clear week'} tone={bills7total > 0 ? 'neg' : undefined} />
        <StatCard label="After bills" value={fmt(afterBills)} sub="est. remaining" tone={afterBills < 0 ? 'neg' : undefined} />
      </div>

      {/* Two-column layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 248px', gap: 12 }}>
        {/* Week grid */}
        <div style={{ background: 'var(--s0)', borderRadius: 10, border: '0.5px solid var(--s200)', padding: '13px 15px' }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--s500)', textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: 11 }}>This week</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: 5 }}>
            {days.map(day => (
              <DayCell key={day.date} day={day} rate={rate} saving={saving === day.date} onSave={handleHoursChange} />
            ))}
          </div>
          {/* Progress */}
          <div style={{ marginTop: 9, paddingTop: 9, borderTop: '0.5px solid var(--s100)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 12 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 9, color: 'var(--s400)', marginBottom: 4 }}>Running total toward payday</div>
              <div style={{ height: 3, background: 'var(--s100)', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${Math.round(progress)}%`, background: 'var(--g400)', borderRadius: 2, transition: 'width 0.3s ease' }} />
              </div>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--g500)' }}>{fmt(weekGross)} gross</div>
              <div style={{ fontSize: 9, color: 'var(--s400)', marginTop: 1 }}>~{fmt(weekNet)} est. net</div>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {/* Bills */}
          <div style={{ background: 'var(--s0)', borderRadius: 10, border: '0.5px solid var(--s200)', padding: '13px 15px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 11 }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--s500)', textTransform: 'uppercase', letterSpacing: '0.7px' }}>Bills coming up</div>
              <a href="/bills" style={{ fontSize: 9, color: 'var(--g500)' }}>Manage →</a>
            </div>
            {initialBillInstances.length === 0 ? (
              <div style={{ fontSize: 11, color: 'var(--s400)' }}>No bills in the next 45 days.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                {initialBillInstances.slice(0, 5).map(inst => {
                  const icon = BILL_ICONS[inst.bill.category] ?? 'ti-receipt'
                  const cls = inst.urgency
                  const tx = cls === 'overdue' || cls === 'critical' ? 'var(--danger-tx)' : cls === 'soon' || cls === 'upcoming' ? 'var(--warn-tx)' : 'var(--s800)'
                  const bg = cls === 'overdue' || cls === 'critical' ? 'var(--danger-bg)' : cls === 'soon' || cls === 'upcoming' ? 'var(--warn-bg)' : 'var(--s50)'
                  const bd = cls === 'overdue' || cls === 'critical' ? 'var(--danger-bd)' : cls === 'soon' || cls === 'upcoming' ? 'var(--warn-bd)' : 'transparent'
                  return (
                    <div key={inst.bill.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 9px', borderRadius: 7, background: bg, border: `0.5px solid ${bd}` }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                        <div style={{ width: 22, height: 22, borderRadius: 5, background: 'rgba(255,255,255,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: tx }}>
                          <i className={`ti ${icon}`} aria-hidden="true" />
                        </div>
                        <div>
                          <div style={{ fontSize: 11, fontWeight: 500, color: tx }}>{inst.bill.name}</div>
                          <div style={{ fontSize: 9, color: tx }}>{dueLabel(inst.days_until)}</div>
                        </div>
                      </div>
                      <div style={{ fontSize: 11, fontWeight: 600, color: tx }}>{fmtShort(inst.bill.amount)}</div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Hour logger */}
          <div style={{ background: 'var(--s0)', borderRadius: 10, border: '0.5px solid var(--s200)', padding: '13px 15px' }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--s500)', textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: 10 }}>Log today's hours</div>
            <div style={{ fontSize: 11, color: 'var(--s400)', marginBottom: 8 }}>
              {format(new Date(), 'EEEE, MMM d')}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: 7, alignItems: 'center' }}>
              <input
                type="number" min="0" max="24" step="0.5"
                placeholder="0" value={logHours}
                onChange={e => setLogHours(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && saveToday()}
                aria-label="Hours worked today"
                style={{ padding: '6px 9px', fontSize: 12, fontWeight: 500, textAlign: 'right', border: '0.5px solid var(--s200)', borderRadius: 5, outline: 'none', background: 'var(--s50)', color: 'var(--s800)', width: '100%' }}
              />
              <div style={{ fontSize: 11, fontWeight: 600, color: logValid ? 'var(--g500)' : 'var(--s300)', minWidth: 58, textAlign: 'right' }}>{logCalc}</div>
              <button
                onClick={saveToday} disabled={!logValid || saving === todayStr}
                style={{ padding: '6px 11px', borderRadius: 5, border: '0.5px solid var(--g400)', background: 'var(--g50)', color: 'var(--g600)', fontSize: 11, fontWeight: 500, cursor: logValid ? 'pointer' : 'default', fontFamily: 'var(--fm)', opacity: logValid ? 1 : 0.4 }}
              >
                {saving === todayStr ? '…' : 'Save'}
              </button>
            </div>
            <div style={{ fontSize: 9, color: 'var(--s400)', marginTop: 6 }}>{fmt(rate)}/hr · enter hours, press save or return</div>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, sub, tone }: { label: string; value: string; sub?: string; tone?: 'pos' | 'neg' }) {
  return (
    <div style={{ background: 'var(--s0)', borderRadius: 10, border: '0.5px solid var(--s200)', padding: '11px 13px' }}>
      <div style={{ fontSize: 9, color: 'var(--s400)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.6px' }}>{label}</div>
      <div style={{ fontSize: 20, fontWeight: 600, marginTop: 3, letterSpacing: '-0.5px', color: tone === 'pos' ? 'var(--g500)' : tone === 'neg' ? '#a32d2d' : 'var(--s800)' }}>{value}</div>
      {sub && <div style={{ fontSize: 9, color: 'var(--s400)', marginTop: 1 }}>{sub}</div>}
    </div>
  )
}

function NavBtn({ onClick, icon, label }: { onClick: () => void; icon: string; label: string }) {
  return (
    <button onClick={onClick} aria-label={label} style={{ border: '0.5px solid var(--s200)', background: 'var(--s0)', borderRadius: 6, width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--s500)', fontSize: 12 }}>
      <i className={`ti ${icon}`} aria-hidden="true" />
    </button>
  )
}

function DayCell({ day, rate, saving, onSave }: { day: any; rate: number; saving: boolean; onSave: (date: string, hours: number) => void }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')

  function commit() {
    const v = parseFloat(draft)
    if (!isNaN(v) && v >= 0 && v <= 24) onSave(day.date, v)
    setEditing(false)
    setDraft('')
  }

  const bg = day.is_today ? 'var(--g50)' : day.is_payday ? '#eaf3de' : 'var(--s50)'
  const bd = day.is_today ? '0.5px solid var(--g200)' : '0.5px solid transparent'

  return (
    <div onClick={() => { if (!editing) { setEditing(true); setDraft(day.entry?.hours.toString() ?? '') } }}
      style={{ background: bg, border: bd, borderRadius: 8, padding: '7px 5px', textAlign: 'center', position: 'relative', minHeight: 82, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, cursor: 'pointer' }}>
      {day.bills.length > 0 && <div style={{ position: 'absolute', top: 4, right: 4, width: 5, height: 5, borderRadius: '50%', background: dotColor(day.bills[0].urgency) }} />}
      <div style={{ fontSize: 8, color: 'var(--s400)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.4px' }}>{day.label}</div>
      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--s800)' }}>{day.day_num}</div>
      {editing ? (
        <input autoFocus type="number" min="0" max="24" step="0.5" value={draft}
          onChange={e => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') { setEditing(false); setDraft('') } }}
          onClick={e => e.stopPropagation()}
          style={{ width: 44, padding: '2px 4px', fontSize: 11, fontWeight: 500, textAlign: 'center', border: '0.5px solid var(--g400)', background: '#fff', borderRadius: 4, outline: 'none' }} />
      ) : (
        <div style={{ fontSize: 9, color: 'var(--s500)' }}>{saving ? '…' : day.entry ? `${day.entry.hours} hrs` : 'off'}</div>
      )}
      <div style={{ fontSize: 10, fontWeight: day.earnings > 0 ? 600 : 400, color: day.earnings > 0 ? 'var(--g500)' : 'var(--s300)', marginTop: 1 }}>
        {day.earnings > 0 ? fmt(day.earnings) : '—'}
      </div>
      {day.is_payday && <div style={{ position: 'absolute', bottom: 3, left: '50%', transform: 'translateX(-50%)', background: 'var(--g50)', border: '0.5px solid var(--g200)', borderRadius: 3, fontSize: 7, color: 'var(--g600)', fontWeight: 600, padding: '1px 4px', whiteSpace: 'nowrap' }}>payday</div>}
    </div>
  )
}
