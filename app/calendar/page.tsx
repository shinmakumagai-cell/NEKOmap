import { createServerSupabaseClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import CatCalendar from '@/components/CatCalendar'
import { Cat } from '@/types'

export default async function CalendarPage() {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_premium')
    .eq('id', user.id)
    .single()

  if (!profile?.is_premium) {
    return (
      <div className="max-w-sm mx-auto px-4 py-8 text-center">
        <p className="text-4xl mb-4">📅</p>
        <h2 className="text-xl font-bold text-gray-800 mb-2">猫カレンダー</h2>
        <p className="text-gray-500 text-sm mb-6">
          あなたの猫写真で毎月のカレンダーを自動生成します
        </p>
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-4">
          <p className="text-sm text-amber-700">プレミアム限定機能です</p>
        </div>
        <a
          href="/premium"
          className="inline-block bg-amber-500 text-white px-6 py-3 rounded-full font-medium hover:bg-amber-600"
        >
          プレミアムにアップグレード
        </a>
      </div>
    )
  }

  // ユーザーのスポットに紐づく猫と、お気に入りスポットの猫を取得
  const { data: spots } = await supabase
    .from('spots')
    .select('cats(*)')
    .eq('user_id', user.id)

  const cats: Cat[] = []
  if (spots) {
    for (const spot of spots) {
      if (spot.cats) {
        cats.push(...(spot.cats as Cat[]))
      }
    }
  }

  return (
    <div className="max-w-sm mx-auto px-4 py-8">
      <h2 className="text-xl font-bold text-gray-800 mb-6 text-center">猫カレンダー</h2>
      <CatCalendar cats={cats} />
    </div>
  )
}
