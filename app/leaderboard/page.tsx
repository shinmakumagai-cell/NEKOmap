import { createServerSupabaseClient } from '@/lib/supabase-server'
import LeaderboardTable from '@/components/LeaderboardTable'
import { RegionalScore } from '@/types'

export default async function LeaderboardPage() {
  const supabase = createServerSupabaseClient()

  const { data: scores } = await supabase
    .from('regional_scores')
    .select('*, profiles(username, is_premium, title)')
    .order('total_score', { ascending: false })
    .limit(50)

  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="max-w-sm mx-auto px-4 py-8">
      <div className="text-center mb-6">
        <p className="text-3xl mb-2">👑</p>
        <h2 className="text-xl font-bold text-gray-800">猫マスターランキング</h2>
        <p className="text-sm text-gray-500 mt-1">スポット・猫・コメントで貢献しよう</p>
      </div>

      <LeaderboardTable
        scores={(scores as RegionalScore[]) ?? []}
        currentUserId={user?.id}
      />

      <div className="mt-6 bg-gray-50 rounded-xl p-4">
        <p className="text-xs font-medium text-gray-500 mb-2">ポイント計算</p>
        <div className="text-xs text-gray-400 space-y-1">
          <p>スポット登録: +5pt</p>
          <p>猫プロフィール登録: +3pt</p>
          <p>コメント投稿: +1pt</p>
        </div>
        <p className="text-xs text-amber-600 mt-2">
          プレミアム会員は称号を獲得できます
        </p>
      </div>
    </div>
  )
}
