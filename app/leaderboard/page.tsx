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

  let isPremium = false
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_premium')
      .eq('id', user.id)
      .single()
    isPremium = profile?.is_premium ?? false
  }

  return (
    <div className={`min-h-full px-4 py-8 ${isPremium ? 'bg-gradient-to-b from-gray-900 via-gray-900 to-gray-800' : ''}`}>
      <div className="max-w-sm mx-auto">
        <div className="text-center mb-6">
          {isPremium ? (
            <>
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-3"
                style={{ background: 'linear-gradient(135deg, #d4a853, #f5d78e, #d4a853)' }}
              >
                <span className="text-3xl">👑</span>
              </div>
              <h2 className="text-xl font-bold text-white">猫マスターランキング</h2>
              <p className="text-sm text-gray-400 mt-1">スポット登録で称号を獲得しよう</p>
            </>
          ) : (
            <>
              <p className="text-3xl mb-2">👑</p>
              <h2 className="text-xl font-bold text-gray-800">猫マスターランキング</h2>
              <p className="text-sm text-gray-500 mt-1">スポット登録で称号を獲得しよう</p>
            </>
          )}
        </div>

        <LeaderboardTable
          scores={(scores as RegionalScore[]) ?? []}
          currentUserId={user?.id}
          isPremium={isPremium}
        />

        <div className={`mt-6 rounded-xl p-4 ${isPremium ? 'bg-gray-800/50 border border-gray-700' : 'bg-gray-50'}`}>
          <p className={`text-xs font-medium mb-2 ${isPremium ? 'text-amber-400' : 'text-gray-500'}`}>ポイント計算</p>
          <div className={`text-xs space-y-1 ${isPremium ? 'text-gray-400' : 'text-gray-400'}`}>
            <p>スポット登録: +1pt</p>
          </div>
          <p className={`text-xs mt-2 ${isPremium ? 'text-amber-300' : 'text-amber-600'}`}>
            プレミアム会員は称号を獲得できます
          </p>
        </div>
      </div>
    </div>
  )
}
