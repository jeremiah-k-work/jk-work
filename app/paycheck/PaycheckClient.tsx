'use client'
import { useState } from 'react'
import type { Position, W2Settings } from '@/types'
import { fmt, buildPaycheckBreakdown } from '@/lib/calculations'

interface Props { position: Position | null; w2Settings: W2Settings | null }

export default function PaycheckClient({ position, w2Settings }: Props) {
  const rate = w2Settings?.hourly_rate ?? 0
  const [hours, setHours] = useState('40')
  const [fedPct, setFedPct] = useState(w2Settings?.federal_withholding_pct.toString() ?? '10')

  const parsedHours = parseFloat(hours)
  const parsedFed = parseFloat(fedPct)
  const validHours = !isNaN(parsedHours) && parsedHours >= 0
  const validFed = !isNaN(parsedFed) && parsedFed >= 0 && parsedFed <= 50

  const mockSettings: W2Settings = {
    ...(w2Settings ?? { id: '', position_id: '', pay_day: 5, fica_pct: 7.65, created_at: '', updated_at: '' }),
    hourly_rate: rate,
    federal_withholding_pct: validFed ? parsedFed : 10,
  }

  const breakdown = validHours && rate > 0
    ? buildPaycheckBreakdown(Math.round(parsedHours * rate * 100) / 100, parsedHours, mockSettings)
    : null

  const LineItem = ({ label, amount, sub, bold, green }: { label: string; amount: number; sub?: string; bold?: boolean; green?: boolean }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderBottom: '0.5px solid var(--s100)' }}>
      <div>
        <div style={{ fontSize: 12, fontWeight: bold ? 600 : 400, color: bold ? 'var(--s800)' : 'var(--s600)' }}>{label}</div>
        {sub && <div style={{ fontSize: 9, color: 'var(--s400)', marginTop: 1 }}>{sub}</div>}
      </div>
      <div style={{ fontSize: 12, fontWeight: bold ? 600 : 400, color: green ? 'var(--g500)' : bold ? 'var(--s800)' : 'var(--s500)' }}>{fmt(amount)}</div>
    </div>
  )

  return (
    <div style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 560 }}>
      <div>
        <h1 style={{ fontSize: 16, fontWeight: 600, letterSpacing: '-0.3px', color: 'var(--s800)' }}>Paycheck breakdown</h1>
        <p style={{ fontSize: 10, color: 'var(--s400)', marginTop: 2 }}>Texas · no state income tax</p>
      </div>

      {!position || !w2Settings ? (
        <div style={{ fontSize: 12, color: 'var(--s400)', padding: '20px 0' }}>
          Set up your position in <a href="/settings" style={{ color: 'var(--g500)' }}>Settings</a> first.
        </div>
      ) : (
        <>
          {/* Inputs */}
          <div style={{ background: 'var(--s0)', borderRadius: 10, border: '0.5px solid var(--s200)', padding: '13px 15px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--s500)', textTransform: 'uppercase', letterSpacing: '0.7px' }}>Calculate a paycheck</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <div style={{ fontSize: 9, fontWeight: 600, color: 'var(--s500)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 4 }}>Hours worked</div>
                <input type="number" min="0" max="168" step="0.5" value={hours} onChange={e => setHours(e.target.value)}
                  style={{ width: '100%', padding: '7px 10px', border: '0.5px solid var(--s200)', borderRadius: 5, fontSize: 12, background: 'var(--s50)', color: 'var(--s800)', outline: 'none' }} />
              </div>
              <div>
                <div style={{ fontSize: 9, fontWeight: 600, color: 'var(--s500)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 4 }}>Federal withholding %</div>
                <input type="number" min="0" max="50" step="1" value={fedPct} onChange={e => setFedPct(e.target.value)}
                  style={{ width: '100%', padding: '7px 10px', border: '0.5px solid var(--s200)', borderRadius: 5, fontSize: 12, background: 'var(--s50)', color: 'var(--s800)', outline: 'none' }} />
              </div>
            </div>
            <div style={{ fontSize: 10, color: 'var(--s400)' }}>
              Rate: {fmt(rate)}/hr · FICA: 6.2% SS + 1.45% Medicare = 7.65%
            </div>
          </div>

          {/* Breakdown */}
          {breakdown && (
            <div style={{ background: 'var(--s0)', borderRadius: 10, border: '0.5px solid var(--s200)', padding: '13px 15px' }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--s500)', textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: 4 }}>This paycheck</div>
              <LineItem label="Gross pay" amount={breakdown.gross} sub={`${breakdown.hours} hrs × ${fmt(breakdown.rate)}`} bold />
              <div style={{ paddingTop: 4, paddingBottom: 4 }}>
                <div style={{ fontSize: 9, fontWeight: 600, color: 'var(--s400)', textTransform: 'uppercase', letterSpacing: '0.6px', padding: '6px 0 3px' }}>Deductions</div>
                <LineItem label="Federal income tax" amount={-breakdown.federal_tax} sub={`${fedPct}% elected withholding`} />
                <LineItem label="Social Security" amount={-breakdown.fica_ss} sub="6.2% FICA" />
                <LineItem label="Medicare" amount={-breakdown.fica_medicare} sub="1.45% FICA" />
                <LineItem label="State income tax" amount={0} sub="Texas — none" />
                <LineItem label="Total deductions" amount={-breakdown.total_deductions} bold />
              </div>
              <div style={{ background: 'var(--g50)', border: '0.5px solid var(--g200)', borderRadius: 7, padding: '11px 13px', marginTop: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--g600)' }}>Net pay (take-home)</div>
                  <div style={{ fontSize: 9, color: 'var(--g500)', marginTop: 1 }}>{breakdown.effective_rate}% effective rate</div>
                </div>
                <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--g500)', letterSpacing: '-0.5px' }}>{fmt(breakdown.net)}</div>
              </div>
            </div>
          )}

          {/* What these mean */}
          <div style={{ background: 'var(--s0)', borderRadius: 10, border: '0.5px solid var(--s200)', padding: '13px 15px' }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--s500)', textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: 10 }}>What these deductions are</div>
            {[
              { term: 'Federal income tax', def: 'Money withheld for your federal tax bill. You elect a percentage on your W-4. Too little = tax owed in April. Too much = refund. ~10% is a reasonable starting point at your income level.' },
              { term: 'Social Security (6.2%)', def: 'Goes into the Social Security fund. This is mandatory — you cannot opt out. You will be eligible for benefits after working for 40 quarters (10 years).' },
              { term: 'Medicare (1.45%)', def: 'Funds Medicare coverage for people 65+. Also mandatory. Together with Social Security, these two make up FICA — Federal Insurance Contributions Act.' },
              { term: 'State income tax', def: 'Texas has no state income tax. This is one of Texas\'s biggest financial advantages — most states take 3–7% of income on top of federal taxes.' },
            ].map(({ term, def }) => (
              <div key={term} style={{ marginBottom: 10, paddingBottom: 10, borderBottom: '0.5px solid var(--s100)' }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--s800)', marginBottom: 3 }}>{term}</div>
                <div style={{ fontSize: 11, color: 'var(--s500)', lineHeight: 1.6 }}>{def}</div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
