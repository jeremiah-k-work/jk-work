import {
  startOfWeek, endOfWeek, eachDayOfInterval,
  format, addMonths, setDate, isAfter,
  differenceInCalendarDays,
} from 'date-fns'
import type {
  W2Settings, WorkEntry, BillInstance, Bill,
  WeekDay, PaycheckBreakdown,
} from '@/types'

// ── Formatting ────────────────────────────────────────────────────────────────

export function fmt(n: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD',
    minimumFractionDigits: 2, maximumFractionDigits: 2,
  }).format(n)
}

export function fmtShort(n: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD',
    minimumFractionDigits: 0, maximumFractionDigits: 0,
  }).format(n)
}

// ── Pay calculations ──────────────────────────────────────────────────────────

export function grossForHours(hours: number, rate: number): number {
  return Math.round(hours * rate * 100) / 100
}

export function buildPaycheckBreakdown(
  gross: number,
  hours: number,
  settings: W2Settings
): PaycheckBreakdown {
  const rate = settings.hourly_rate
  // Texas: no state income tax
  // Federal: simplified withholding based on user's elected percentage
  const federal_tax = Math.round(gross * (settings.federal_withholding_pct / 100) * 100) / 100
  // FICA: 6.2% SS (on wages up to $168,600 in 2024) + 1.45% Medicare
  const fica_ss = Math.round(gross * 0.062 * 100) / 100
  const fica_medicare = Math.round(gross * 0.0145 * 100) / 100
  const total_deductions = Math.round((federal_tax + fica_ss + fica_medicare) * 100) / 100
  const net = Math.round((gross - total_deductions) * 100) / 100
  const effective_rate = gross > 0 ? Math.round((total_deductions / gross) * 1000) / 10 : 0
  return { gross, hours, rate, federal_tax, fica_ss, fica_medicare, total_deductions, net, effective_rate }
}

export function totalWithholdingPct(settings: W2Settings): number {
  return settings.federal_withholding_pct + 7.65 // fed + FICA
}

// ── Payday ────────────────────────────────────────────────────────────────────

export function nextPayday(payDay: number, from: Date = new Date()): Date {
  const d = new Date(from)
  const dow = d.getDay()
  let diff = payDay - dow
  if (diff <= 0) diff += 7
  d.setDate(d.getDate() + diff)
  return d
}

// ── Bill urgency ──────────────────────────────────────────────────────────────

export function billUrgency(days: number): BillInstance['urgency'] {
  if (days < 0)   return 'overdue'
  if (days <= 2)  return 'critical'
  if (days <= 5)  return 'soon'
  if (days <= 14) return 'upcoming'
  return 'later'
}

export function nextDueDate(bill: Bill, from: Date = new Date()): Date {
  let candidate = setDate(new Date(from.getFullYear(), from.getMonth(), 1), bill.due_day)
  if (!isAfter(candidate, from)) {
    candidate = setDate(addMonths(candidate, 1), bill.due_day)
  }
  return candidate
}

export function buildBillInstances(bills: Bill[], windowDays = 45, from: Date = new Date()): BillInstance[] {
  return bills
    .filter(b => b.is_active)
    .map(bill => {
      const due = nextDueDate(bill, from)
      const due_date = format(due, 'yyyy-MM-dd')
      const days_until = differenceInCalendarDays(due, from)
      return { bill, due_date, days_until, urgency: billUrgency(days_until) }
    })
    .filter(b => b.days_until <= windowDays)
    .sort((a, b) => a.days_until - b.days_until)
}

// ── Week builder ──────────────────────────────────────────────────────────────

export function buildWeekDays(
  weekStart: Date,
  entries: WorkEntry[],
  rate: number,
  paydayStr: string,
  billInstances: BillInstance[],
): WeekDay[] {
  const days = eachDayOfInterval({
    start: weekStart,
    end: endOfWeek(weekStart, { weekStartsOn: 1 }),
  })
  const todayStr = format(new Date(), 'yyyy-MM-dd')
  let running = 0

  return days.map(day => {
    const dateStr = format(day, 'yyyy-MM-dd')
    const entry = entries.find(e => e.date === dateStr)
    const earnings = entry ? grossForHours(entry.hours, rate) : 0
    running = Math.round((running + earnings) * 100) / 100
    return {
      date: dateStr,
      label: format(day, 'EEE'),
      day_num: day.getDate(),
      month_num: day.getMonth(),
      is_today: dateStr === todayStr,
      is_payday: dateStr === paydayStr,
      entry,
      earnings,
      running_total: running,
      bills: billInstances.filter(b => b.due_date === dateStr),
    }
  })
}

export function isoDate(d: Date): string {
  return format(d, 'yyyy-MM-dd')
}

export function getWeekStart(offset: number): Date {
  const now = new Date()
  const base = startOfWeek(now, { weekStartsOn: 1 })
  base.setDate(base.getDate() + offset * 7)
  return base
}
