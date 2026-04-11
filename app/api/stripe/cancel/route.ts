import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function POST() {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('stripe_customer_id')
    .eq('id', user.id)
    .single()

  if (!profile?.stripe_customer_id) {
    return NextResponse.json({ error: 'No subscription found' }, { status: 400 })
  }

  // アクティブなサブスクリプションを取得
  const subscriptions = await stripe.subscriptions.list({
    customer: profile.stripe_customer_id,
    status: 'active',
    limit: 1,
  })

  if (subscriptions.data.length === 0) {
    // サブスクリプションがない場合はDBだけ更新
    await supabase
      .from('profiles')
      .update({ is_premium: false })
      .eq('id', user.id)

    return NextResponse.redirect(new URL('/premium?canceled=true', process.env.NEXT_PUBLIC_URL!), { status: 303 })
  }

  // 期間末でキャンセル（即時ではなく期間終了時に停止）
  await stripe.subscriptions.update(subscriptions.data[0].id, {
    cancel_at_period_end: true,
  })

  return NextResponse.redirect(new URL('/premium?cancel_scheduled=true', process.env.NEXT_PUBLIC_URL!), { status: 303 })
}
