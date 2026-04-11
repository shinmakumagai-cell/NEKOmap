import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

const ADMIN_EMAIL = 'shinmakumagai@gmail.com'

export async function POST(req: NextRequest) {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const { commentId } = await req.json()

  if (!commentId) {
    return NextResponse.json({ error: 'commentId is required' }, { status: 400 })
  }

  const { error } = await supabase.from('comments').delete().eq('id', commentId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
