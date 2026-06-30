import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getProfile, getPositions, getBills } from '@/lib/db'
import { buildBillInstances } from '@/lib/calculations'
import Shell from '@/components/layout/Shell'
import BillsClient from './BillsClient'

export default async function BillsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const [profile, positions, bills] = await Promise.all([
    getProfile(user.id, supabase),
    getPositions(user.id, supabase),
    getBills(user.id, supabase),
  ])

  const instances = buildBillInstances(bills, 60)

  return (
    <Shell profile={profile} positions={positions}>
      <BillsClient userId={user.id} initialBills={bills} initialInstances={instances} />
    </Shell>
  )
}
