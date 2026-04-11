import { createServerSupabaseClient } from '@/lib/supabase-server'
import { getTitleForSpots } from '@/lib/scoring'

export default async function PremiumPage() {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  let isPremium = false
  let username = ''
  let title = ''
  let premiumSince = ''
  let spotsCount = 0

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_premium, username, title, premium_since')
      .eq('id', user.id)
      .single()
    isPremium = profile?.is_premium ?? false
    username = profile?.username ?? user.email ?? ''
    title = profile?.title ?? '猫見習い'
    premiumSince = profile?.premium_since ?? ''

    const { count } = await supabase
      .from('spots')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
    spotsCount = count ?? 0
  }

  const currentTitle = getTitleForSpots(spotsCount)

  return (
    <div className="min-h-full px-4 py-8">
      <div className="max-w-sm mx-auto">

        {isPremium ? (
          <>
            {/* VIPカード */}
            <div className="relative overflow-hidden rounded-3xl p-6 mb-6 shadow-2xl"
              style={{
                background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
              }}
            >
              {/* 光沢エフェクト */}
              <div className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-10"
                style={{ background: 'radial-gradient(circle, #e2b04a 0%, transparent 70%)' }}
              />
              <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full opacity-10"
                style={{ background: 'radial-gradient(circle, #e2b04a 0%, transparent 70%)' }}
              />

              {/* カードヘッダー */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🐱</span>
                  <span className="text-amber-400 font-bold text-sm tracking-wider">NEKO MAP</span>
                </div>
                <div className="bg-amber-400/20 border border-amber-400/40 rounded-full px-3 py-0.5">
                  <span className="text-amber-300 text-xs font-bold tracking-widest">VIP</span>
                </div>
              </div>

              {/* ユーザー名 */}
              <p className="text-white text-xl font-bold mb-1 tracking-wide">{username}</p>

              {/* 称号 */}
              <div className="flex items-center gap-2 mb-6">
                <span className="text-lg">{currentTitle.emoji}</span>
                <span className="text-amber-300 text-sm font-medium">{title || currentTitle.title}</span>
              </div>

              {/* カード下部 */}
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-gray-400 text-[10px] uppercase tracking-wider mb-0.5">Member since</p>
                  <p className="text-gray-300 text-xs">
                    {premiumSince
                      ? new Date(premiumSince).toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' })
                      : '-'
                    }
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-gray-400 text-[10px] uppercase tracking-wider mb-0.5">Spots</p>
                  <p className="text-amber-300 text-lg font-bold">{spotsCount}</p>
                </div>
              </div>

              {/* 金色ライン */}
              <div className="absolute bottom-0 left-0 right-0 h-1"
                style={{ background: 'linear-gradient(90deg, #d4a853, #f5d78e, #d4a853)' }}
              />
            </div>

            {/* 機能リンク */}
            <div className="space-y-2">
              <a href="/calendar" className="block bg-white border border-gray-100 rounded-xl p-4 hover:bg-gray-50 active:bg-gray-100">
                <span className="text-sm font-medium text-gray-800">📅 猫カレンダー</span>
              </a>
              <a href="/settings" className="block bg-white border border-gray-100 rounded-xl p-4 hover:bg-gray-50 active:bg-gray-100">
                <span className="text-sm font-medium text-gray-800">📍 カスタムマーカー設定</span>
              </a>
              <a href="/leaderboard" className="block bg-white border border-gray-100 rounded-xl p-4 hover:bg-gray-50 active:bg-gray-100">
                <span className="text-sm font-medium text-gray-800">👑 ランキング</span>
              </a>
            </div>
          </>
        ) : (
          <>
            <div className="text-center mb-8">
              <p className="text-4xl mb-3">✨</p>
              <h2 className="text-2xl font-bold text-gray-800">猫マップ プレミアム</h2>
              <p className="text-gray-500 text-sm mt-2">もっと猫マップを楽しむための特別機能</p>
            </div>

            {/* 機能一覧 */}
            <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-100 mb-6 shadow-sm">
              {[
                { icon: '🚫', title: '広告非表示', sub: '快適なマップ体験を' },
                { icon: '⭐', title: 'プレミアムバッジ', sub: 'コメント・投稿で目立とう' },
                { icon: '📍', title: 'カスタムマーカー', sub: '自分だけのマーカーで地図をカスタマイズ' },
                { icon: '📅', title: '猫カレンダー', sub: '猫の写真で自動カレンダー生成' },
                { icon: '👑', title: '猫マスター称号', sub: 'スポット登録で称号ゲット' },
                { icon: '💎', title: 'VIP会員カード', sub: '特別なVIPカードを表示' },
              ].map((item) => (
                <div key={item.title} className="flex items-center gap-3 p-4">
                  <span className="text-2xl">{item.icon}</span>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{item.title}</p>
                    <p className="text-xs text-gray-400">{item.sub}</p>
                  </div>
                  <span className="ml-auto text-green-500 text-sm font-medium">✓</span>
                </div>
              ))}
            </div>

            {/* 価格 */}
            <div className="text-center mb-6">
              <p className="text-gray-400 text-sm">月額</p>
              <p className="text-4xl font-bold text-gray-800">¥300</p>
              <p className="text-gray-400 text-sm mt-1">いつでもキャンセル可能</p>
            </div>

            {/* 決済ボタン */}
            <form action="/api/stripe/checkout" method="POST">
              <button
                type="submit"
                className="w-full bg-amber-500 text-white py-4 rounded-full font-bold text-base hover:bg-amber-600 shadow-md"
              >
                プレミアムにアップグレード
              </button>
            </form>

            <p className="text-center text-xs text-gray-400 mt-4">
              Stripe による安全な決済
            </p>
          </>
        )}
      </div>
    </div>
  )
}
