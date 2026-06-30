import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getProfile, getPositions, getW2Settings } from '@/lib/db'
import Shell from '@/components/layout/Shell'
import SettingsClient from './SettingsClient'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const [profile, positions] = await Promise.all([
    getProfile(user.id, supabase),
    getPositions(user.id, supabase),
  ])
  const activePosition = positions[0] ?? null
  const w2Settings = activePosition ? await getW2Settings(activePosition.id, supabase) : null

  return (
    <Shell profile={profile} positions={positions} activePositionId={activePosition?.id}>
      <SettingsClient
        userId={user.id}
        email={user.email ?? ''}
        initialProfile={profile}
        initialPosition={activePosition}
        initialW2Settings={w2Settings}
      />
    </Shell>
  )
}
