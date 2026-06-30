import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getProfile, getPositions, getW2Settings, getWorkEntries, getBills } from '@/lib/db'
import { buildBillInstances, getWeekStart, nextPayday, isoDate } from '@/lib/calculations'
import Shell from '@/components/layout/Shell'
import DashboardClient from './DashboardClient'
import { addDays } from 'date-fns'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const [profile, positions, bills] = await Promise.all([
    getProfile(user.id, supabase),
    getPositions(user.id, supabase),
    getBills(user.id, supabase),
  ])

  const activePosition = positions[0] ?? null
  const w2Settings = activePosition ? await getW2Settings(activePosition.id, supabase) : null

  const windowStart = isoDate(addDays(getWeekStart(-2), 0))
  const windowEnd = isoDate(addDays(getWeekStart(2), 6))
  const entries = activePosition
    ? await getWorkEntries(activePosition.id, user.id, windowStart, windowEnd, supabase)
    : []

  const billInstances = buildBillInstances(bills)
  const paydayDate = w2Settings
    ? isoDate(nextPayday(w2Settings.pay_day))
    : isoDate(nextPayday(5))

  return (
    <Shell profile={profile} positions={positions} activePositionId={activePosition?.id}>
      <DashboardClient
        userId={user.id}
        profile={profile}
        position={activePosition}
        w2Settings={w2Settings}
        initialEntries={entries}
        initialBillInstances={billInstances}
        paydayDate={paydayDate}
      />
    </Shell>
  )
}
