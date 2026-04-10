import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'

const ADMIN_EMAIL = 'shinmakumagai@gmail.com'

export default async function AdminPage() {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.email !== ADMIN_EMAIL) {
    redirect('/')
  }

  // 全ユーザー数
  const { count: totalUsers } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })

  // プレミアムユーザー数
  const { count: premiumUsers } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('is_premium', true)

  // スポット数
  const { count: totalSpots } = await supabase
    .from('spots')
    .select('*', { count: 'exact', head: true })

  // 最近の登録ユーザー（最新20件）
  const { data: recentUsers } = await supabase
    .from('profiles')
    .select('id, username, is_premium, title, created_at')
    .order('created_at', { ascending: false })
    .limit(20)

  return (
    <div className="min-h-screen bg-gray-50 pt-16 pb-8">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-xl font-bold text-gray-800 mb-6">🔒 管理者ダッシュボード</h1>

        {/* 統計カード */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
            <p className="text-3xl font-bold text-gray-800">{totalUsers ?? 0}</p>
            <p className="text-xs text-gray-500 mt-1">登録ユーザー</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-amber-200 text-center">
            <p className="text-3xl font-bold text-amber-600">{premiumUsers ?? 0}</p>
            <p className="text-xs text-gray-500 mt-1">プレミアム</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
            <p className="text-3xl font-bold text-gray-800">{totalSpots ?? 0}</p>
            <p className="text-xs text-gray-500 mt-1">スポット数</p>
          </div>
        </div>

        {/* 最近の登録者 */}
        <h2 className="text-sm font-bold text-gray-600 mb-3">最近の登録ユーザー</h2>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 divide-y divide-gray-50">
          {recentUsers?.map((u) => (
            <div key={u.id} className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="text-sm font-medium text-gray-800">
                  {u.username ?? '名前未設定'}
                  {u.is_premium && <span className="ml-1 text-amber-500">⭐</span>}
                </p>
                {u.title && (
                  <p className="text-xs text-gray-400">{u.title}</p>
                )}
              </div>
              <p className="text-xs text-gray-400">
                {new Date(u.created_at).toLocaleDateString('ja-JP')}
              </p>
            </div>
          ))}
          {(!recentUsers || recentUsers.length === 0) && (
            <p className="text-sm text-gray-400 px-4 py-6 text-center">まだユーザーがいません</p>
          )}
        </div>
      </div>
    </div>
  )
}
