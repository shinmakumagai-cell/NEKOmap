'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

type Props = {
  user: {
    email: string
    username: string | null
    isPremium: boolean
    title: string | null
    isAdmin?: boolean
  } | null
}

export default function HeaderClient({ user }: Props) {
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    setMenuOpen(false)
    router.push('/')
    router.refresh()
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
      <div className="flex items-center justify-between px-4 h-14">
        <a href="/" className="text-lg font-bold text-gray-800 flex items-center gap-1">
          🐱 <span>猫マップ</span>
        </a>

        <div className="flex items-center gap-2">
          {user && (
            <a
              href="/spots/new"
              className="text-sm bg-gray-800 text-white px-3 py-1.5 rounded-full hover:bg-gray-700"
            >
              + 追加
            </a>
          )}

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100"
            aria-label="メニュー"
          >
            <div className="space-y-1.5">
              <span className={`block w-5 h-0.5 bg-gray-600 transition-transform ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
              <span className={`block w-5 h-0.5 bg-gray-600 transition-opacity ${menuOpen ? 'opacity-0' : ''}`} />
              <span className={`block w-5 h-0.5 bg-gray-600 transition-transform ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
            </div>
          </button>
        </div>
      </div>

      {menuOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setMenuOpen(false)}
          />
          <div className="absolute top-14 right-0 left-0 z-50 bg-white border-b border-gray-200 shadow-lg">
            <nav className="px-4 py-3 space-y-1">
              {user ? (
                <>
                  <div className="px-3 py-2 mb-2 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-800">{user.username ?? user.email}</p>
                    {user.isPremium && (
                      <span className="text-xs text-amber-600 font-medium">
                        {user.title ? `👑 ${user.title}` : '✨ プレミアム'}
                      </span>
                    )}
                  </div>
                  <a href="/spots/new" onClick={() => setMenuOpen(false)} className="block px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg active:bg-gray-100">
                    📍 スポットを追加
                  </a>
                  <a href="/leaderboard" onClick={() => setMenuOpen(false)} className="block px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg active:bg-gray-100">
                    🏆 ランキング
                  </a>
                  <a href="/calendar" onClick={() => setMenuOpen(false)} className="block px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg active:bg-gray-100">
                    📅 猫カレンダー
                  </a>
                  <a href="/settings" onClick={() => setMenuOpen(false)} className="block px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg active:bg-gray-100">
                    ⚙️ 設定
                  </a>
                  {!user.isPremium && (
                    <a href="/premium" onClick={() => setMenuOpen(false)} className="block px-3 py-2.5 text-sm text-amber-600 font-medium hover:bg-amber-50 rounded-lg active:bg-amber-100">
                      ✨ プレミアム
                    </a>
                  )}
                  {user.isAdmin && (
                    <a href="/admin" onClick={() => setMenuOpen(false)} className="block px-3 py-2.5 text-sm text-red-600 font-medium hover:bg-red-50 rounded-lg active:bg-red-100">
                      🔒 管理者
                    </a>
                  )}
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-3 py-2.5 text-sm text-gray-400 hover:bg-gray-50 rounded-lg active:bg-gray-100"
                  >
                    ログアウト
                  </button>
                </>
              ) : (
                <>
                  <a href="/leaderboard" onClick={() => setMenuOpen(false)} className="block px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg active:bg-gray-100">
                    🏆 ランキング
                  </a>
                  <a href="/premium" onClick={() => setMenuOpen(false)} className="block px-3 py-2.5 text-sm text-amber-600 font-medium hover:bg-amber-50 rounded-lg active:bg-amber-100">
                    ✨ プレミアム
                  </a>
                  <a href="/login" onClick={() => setMenuOpen(false)} className="block px-3 py-2.5 text-sm font-medium text-gray-800 hover:bg-gray-50 rounded-lg active:bg-gray-100">
                    🔑 ログイン
                  </a>
                </>
              )}
            </nav>
          </div>
        </>
      )}
    </header>
  )
}
