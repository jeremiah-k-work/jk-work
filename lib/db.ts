import { createClient as createBrowserClient } from '@/lib/supabase/client'
import type { Profile, Position, W2Settings, WorkEntry, Bill, BillPayment } from '@/types'
import type { SupabaseClient } from '@supabase/supabase-js'

// Helper — uses provided client or falls back to browser client
function client(supabase?: SupabaseClient): SupabaseClient {
  return supabase ?? createBrowserClient()
}

// ── Profile ───────────────────────────────────────────────────────────────────

export async function getProfile(userId: string, supabase?: SupabaseClient): Promise<Profile | null> {
  const { data } = await client(supabase)
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  return data
}

export async function saveProfile(
  userId: string,
  fields: { display_name: string; initials: string; state_code: string },
  supabase?: SupabaseClient
): Promise<void> {
  const db = client(supabase)
  const now = new Date().toISOString()
  const { data: existing } = await db
    .from('profiles')
    .select('id')
    .eq('id', userId)
    .single()

  if (existing) {
    const { error } = await db
      .from('profiles')
      .update({ ...fields, updated_at: now })
      .eq('id', userId)
    if (error) throw new Error(`Profile update failed: ${error.message}`)
  } else {
    const { error } = await db
      .from('profiles')
      .insert({ id: userId, ...fields, created_at: now, updated_at: now })
    if (error) throw new Error(`Profile insert failed: ${error.message}`)
  }
}

// ── Positions ─────────────────────────────────────────────────────────────────

export async function getPositions(userId: string, supabase?: SupabaseClient): Promise<Position[]> {
  const { data } = await client(supabase)
    .from('positions')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('sort_order')
  return data ?? []
}

export async function savePosition(
  userId: string,
  existingId: string | null,
  fields: { name: string; type: string; color: string; sort_order: number },
  supabase?: SupabaseClient
): Promise<Position> {
  const db = client(supabase)
  if (existingId) {
    const { data, error } = await db
      .from('positions')
      .update({ name: fields.name, type: fields.type, color: fields.color })
      .eq('id', existingId)
      .eq('user_id', userId)
      .select()
      .single()
    if (error) throw new Error(`Position update failed: ${error.message}`)
    return data
  } else {
    const { data, error } = await db
      .from('positions')
      .insert({
        user_id: userId,
        name: fields.name,
        type: fields.type,
        color: fields.color,
        sort_order: fields.sort_order,
        is_active: true,
      })
      .select()
      .single()
    if (error) throw new Error(`Position insert failed: ${error.message}`)
    return data
  }
}

// ── W2 Settings ───────────────────────────────────────────────────────────────

export async function getW2Settings(positionId: string, supabase?: SupabaseClient): Promise<W2Settings | null> {
  const { data } = await client(supabase)
    .from('w2_settings')
    .select('*')
    .eq('position_id', positionId)
    .single()
  return data
}

export async function saveW2Settings(
  positionId: string,
  existingId: string | null,
  fields: { hourly_rate: number; pay_day: number; federal_withholding_pct: number; fica_pct: number },
  supabase?: SupabaseClient
): Promise<W2Settings> {
  const db = client(supabase)
  const now = new Date().toISOString()
  if (existingId) {
    const { data, error } = await db
      .from('w2_settings')
      .update({ ...fields, updated_at: now })
      .eq('id', existingId)
      .select()
      .single()
    if (error) throw new Error(`W2 settings update failed: ${error.message}`)
    return data
  } else {
    const { data, error } = await db
      .from('w2_settings')
      .insert({ position_id: positionId, ...fields, created_at: now, updated_at: now })
      .select()
      .single()
    if (error) throw new Error(`W2 settings insert failed: ${error.message}`)
    return data
  }
}

// ── Work Entries ──────────────────────────────────────────────────────────────

export async function getWorkEntries(
  positionId: string,
  userId: string,
  fromDate: string,
  toDate: string,
  supabase?: SupabaseClient
): Promise<WorkEntry[]> {
  const { data } = await client(supabase)
    .from('work_entries')
    .select('*')
    .eq('position_id', positionId)
    .eq('user_id', userId)
    .gte('date', fromDate)
    .lte('date', toDate)
    .order('date')
  return data ?? []
}

export async function upsertWorkEntry(entry: {
  position_id: string
  user_id: string
  date: string
  hours: number
  note?: string
}): Promise<WorkEntry | null> {
  const db = createBrowserClient()
  const { data: existing } = await db
    .from('work_entries')
    .select('id')
    .eq('position_id', entry.position_id)
    .eq('user_id', entry.user_id)
    .eq('date', entry.date)
    .single()

  if (existing) {
    const { data } = await db
      .from('work_entries')
      .update({ hours: entry.hours, note: entry.note })
      .eq('id', existing.id)
      .select()
      .single()
    return data
  } else {
    const { data } = await db
      .from('work_entries')
      .insert(entry)
      .select()
      .single()
    return data
  }
}

export async function deleteWorkEntry(id: string) {
  return createBrowserClient().from('work_entries').delete().eq('id', id)
}

// ── Bills ─────────────────────────────────────────────────────────────────────

export async function getBills(userId: string, supabase?: SupabaseClient): Promise<Bill[]> {
  const { data } = await client(supabase)
    .from('bills')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('sort_order')
  return data ?? []
}

export async function saveBill(
  userId: string,
  existingId: string | null,
  fields: {
    name: string
    amount: number
    category: Bill['category']
    recurrence: Bill['recurrence']
    due_day: number
    note?: string
    sort_order: number
  }
): Promise<Bill> {
  const db = createBrowserClient()
  const now = new Date().toISOString()
  if (existingId) {
    const { data, error } = await db
      .from('bills')
      .update({ ...fields, updated_at: now })
      .eq('id', existingId)
      .eq('user_id', userId)
      .select()
      .single()
    if (error) throw new Error(`Bill update failed: ${error.message}`)
    return data
  } else {
    const { data, error } = await db
      .from('bills')
      .insert({ user_id: userId, ...fields, is_active: true, created_at: now, updated_at: now })
      .select()
      .single()
    if (error) throw new Error(`Bill insert failed: ${error.message}`)
    return data
  }
}

export async function deleteBill(id: string, userId: string) {
  const { error } = await createBrowserClient()
    .from('bills')
    .update({ is_active: false })
    .eq('id', id)
    .eq('user_id', userId)
  if (error) throw new Error(`Bill delete failed: ${error.message}`)
}

// ── Bill Payments ─────────────────────────────────────────────────────────────

export async function getBillPayments(userId: string, fromDate: string): Promise<BillPayment[]> {
  const { data } = await createBrowserClient()
    .from('bill_payments')
    .select('*')
    .eq('user_id', userId)
    .gte('paid_date', fromDate)
    .order('paid_date', { ascending: false })
  return data ?? []
}

export async function recordBillPayment(payment: {
  bill_id: string
  user_id: string
  paid_date: string
  amount_paid: number
  note?: string
}) {
  return createBrowserClient().from('bill_payments').insert(payment).select().single()
}
