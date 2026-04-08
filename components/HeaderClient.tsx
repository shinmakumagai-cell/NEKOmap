'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

type Props = {
  user: {
    email: string
    username: string | null
    isPremium: boolean
    title: string | null
  } | null
}

export default function HeaderClient({ user }: Props) {
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
      <a href="/" className="text-lg font-bold text-gray-800 flex items-center gap-1">
        🐱 <span>猫マップ</span>
      </a>

      <nav className="flex items-center gap-2">
        {user ? (
          <>
            {user.isPremium && (
              <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                {user.title ? `👑 ${user.title}` : '✨ プレミアム'}
              </span>
            )}
            <a
              href="/spots/new"
              className="text-sm bg-gray-800 text-white px-3 py-1.5 rounded-full hover:bg-gray-700"
            >
              スポット追加
            </a>
            <a
              href="/leaderboard"
              className="text-sm text-gray-400 hover:text-gray-600"
            >
              ランキング
            </a>
            <a
              href="/settings"
              className="text-sm text-gray-400 hover:text-gray-600"
            >
              設定
            </a>
            {!user.isPremium && (
              <a
                href="/premium"
                className="text-sm text-amber-600 font-medium hover:text-amber-700"
              >
                ✨ Pro
              </a>
            )}
            <button
              onClick={handleLogout}
              className="text-sm text-gray-400 hover:text-gray-600"
            >
              ログアウト
            </button>
          </>
        ) : (
          <>
            <a
              href="/leaderboard"
              className="text-sm text-gray-400 hover:text-gray-600"
            >
              ランキング
            </a>
            <a
              href="/premium"
              className="text-sm text-amber-600 font-medium hover:text-amber-700"
            >
              ✨ プレミアム
            </a>
            <a
              href="/login"
              className="text-sm bg-gray-800 text-white px-3 py-1.5 rounded-full hover:bg-gray-700"
            >
              ログイン
            </a>
          </>
        )}
      </nav>
    </header>
  )
}
