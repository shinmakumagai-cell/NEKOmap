import { createServerSupabaseClient } from '@/lib/supabase-server'

export default async function PremiumPage() {
  const supabase = createServerSupabaseClient()
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
    <div className="min-h-full bg-gradient-to-b from-amber-50 to-white px-4 py-8">
      <div className="max-w-sm mx-auto">

        <div className="text-center mb-8">
          <p className="text-4xl mb-3">✨</p>
          <h2 className="text-2xl font-bold text-gray-800">猫マップ プレミアム</h2>
          <p className="text-gray-500 text-sm mt-2">もっと猫マップを楽しむための特別機能</p>
        </div>

        {isPremium ? (
          <>
            <div className="bg-amber-100 border border-amber-200 rounded-2xl p-6 text-center mb-6">
              <p className="text-amber-700 font-bold text-lg">プレミアム会員です 🎉</p>
              <p className="text-amber-600 text-sm mt-1">すべての機能をご利用いただけます</p>
            </div>
            <div className="space-y-2">
              <a href="/calendar" className="block bg-white border border-gray-100 rounded-xl p-4 hover:bg-gray-50">
                <span className="text-sm font-medium text-gray-800">📅 猫カレンダー</span>
              </a>
              <a href="/settings" className="block bg-white border border-gray-100 rounded-xl p-4 hover:bg-gray-50">
                <span className="text-sm font-medium text-gray-800">📍 カスタムマーカー設定</span>
              </a>
              <a href="/leaderboard" className="block bg-white border border-gray-100 rounded-xl p-4 hover:bg-gray-50">
                <span className="text-sm font-medium text-gray-800">👑 ランキング</span>
              </a>
            </div>
          </>
        ) : (
          <>
            {/* 機能一覧 */}
            <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-100 mb-6 shadow-sm">
              {[
                { icon: '🚫', title: '広告非表示', sub: '快適なマップ体験を' },
                { icon: '⭐', title: 'プレミアムバッジ', sub: 'コメント・投稿で目立とう' },
                { icon: '📍', title: 'カスタムマーカー', sub: '自分だけのマーカーで地図をカスタマイズ' },
                { icon: '📅', title: '猫カレンダー', sub: '猫の写真で自動カレンダー生成' },
                { icon: '👑', title: '猫マスター称号', sub: '活動に応じた称号・ランキング' },
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
