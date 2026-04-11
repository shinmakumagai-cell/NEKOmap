import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

const ADMIN_EMAIL = 'shinmakumagai@gmail.com'

export async function POST(req: NextRequest) {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const { spotId } = await req.json()

  if (!spotId) {
    return NextResponse.json({ error: 'spotId is required' }, { status: 400 })
  }

  // コメントを先に削除
  await supabase.from('comments').delete().eq('spot_id', spotId)
  // 猫データを削除
  await supabase.from('cats').delete().eq('spot_id', spotId)
  // スポットを削除
  const { error } = await supabase.from('spots').delete().eq('id', spotId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
