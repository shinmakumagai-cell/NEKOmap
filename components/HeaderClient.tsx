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

  const isPremium = user?.isPremium ?? false

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-sm border-b ${
      isPremium
        ? 'bg-gray-900/95 border-amber-800/30'
        : 'bg-white/95 border-gray-200'
    }`}>
      <div className="flex items-center justify-between px-4 h-14">
        <a href="/" className={`text-lg font-bold flex items-center gap-1 ${
          isPremium ? 'text-amber-400' : 'text-gray-800'
        }`}>
          🐱 <span>猫マップ</span>
          {isPremium && <span className="text-[10px] text-amber-500 font-normal ml-1">VIP</span>}
        </a>

        <div className="flex items-center gap-2">
          {user && (
            <a
              href="/spots/new"
              className={`text-sm px-3 py-1.5 rounded-full ${
                isPremium
                  ? 'bg-amber-600 text-white hover:bg-amber-500'
                  : 'bg-gray-800 text-white hover:bg-gray-700'
              }`}
            >
              + 追加
            </a>
          )}

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className={`w-10 h-10 flex items-center justify-center rounded-lg ${
              isPremium ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
            }`}
            aria-label="メニュー"
          >
            <div className="space-y-1.5">
              <span className={`block w-5 h-0.5 transition-transform ${
                isPremium ? 'bg-gray-300' : 'bg-gray-600'
              } ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
              <span className={`block w-5 h-0.5 transition-opacity ${
                isPremium ? 'bg-gray-300' : 'bg-gray-600'
              } ${menuOpen ? 'opacity-0' : ''}`} />
              <span className={`block w-5 h-0.5 transition-transform ${
                isPremium ? 'bg-gray-300' : 'bg-gray-600'
              } ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
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
          <div className={`absolute top-14 right-0 left-0 z-50 border-b shadow-lg ${
            isPremium
              ? 'bg-gray-900 border-gray-800'
              : 'bg-white border-gray-200'
          }`}>
            <nav className="px-4 py-3 space-y-1">
              {user ? (
                <>
                  <div className={`px-3 py-2 mb-2 border-b ${
                    isPremium ? 'border-gray-800' : 'border-gray-100'
                  }`}>
                    <p className={`text-sm font-medium ${isPremium ? 'text-white' : 'text-gray-800'}`}>
                      {user.username ?? user.email}
                    </p>
                    {user.isPremium && (
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[10px] bg-amber-600/20 text-amber-400 px-1.5 py-0.5 rounded font-bold tracking-wider">VIP</span>
                        <span className="text-xs text-amber-500 font-medium">
                          {user.title ? `${user.title}` : 'プレミアム'}
                        </span>
                      </div>
                    )}
                  </div>
                  <a href="/spots/new" onClick={() => setMenuOpen(false)} className={`block px-3 py-2.5 text-sm rounded-lg active:bg-gray-100 ${
                    isPremium ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-700 hover:bg-gray-50'
                  }`}>
                    📍 スポットを追加
                  </a>
                  <a href="/leaderboard" onClick={() => setMenuOpen(false)} className={`block px-3 py-2.5 text-sm rounded-lg ${
                    isPremium ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-700 hover:bg-gray-50'
                  }`}>
                    🏆 ランキング
                  </a>
                  <a href="/calendar" onClick={() => setMenuOpen(false)} className={`block px-3 py-2.5 text-sm rounded-lg ${
                    isPremium ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-700 hover:bg-gray-50'
                  }`}>
                    📅 猫カレンダー
                  </a>
                  <a href="/premium" onClick={() => setMenuOpen(false)} className={`block px-3 py-2.5 text-sm rounded-lg ${
                    isPremium ? 'text-amber-400 font-medium hover:bg-amber-900/30' : 'text-gray-700 hover:bg-gray-50'
                  }`}>
                    {isPremium ? '💎 VIPカード' : '✨ プレミアム'}
                  </a>
                  <a href="/settings" onClick={() => setMenuOpen(false)} className={`block px-3 py-2.5 text-sm rounded-lg ${
                    isPremium ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-700 hover:bg-gray-50'
                  }`}>
                    ⚙️ 設定
                  </a>
                  {user.isAdmin && (
                    <a href="/admin" onClick={() => setMenuOpen(false)} className="block px-3 py-2.5 text-sm text-red-500 font-medium hover:bg-red-900/20 rounded-lg">
                      🔒 管理者
                    </a>
                  )}
                  <button
                    onClick={handleLogout}
                    className={`block w-full text-left px-3 py-2.5 text-sm rounded-lg ${
                      isPremium ? 'text-gray-600 hover:bg-gray-800' : 'text-gray-400 hover:bg-gray-50'
                    }`}
                  >
                    ログアウト
                  </button>
                </>
              ) : (
                <>
                  <a href="/leaderboard" onClick={() => setMenuOpen(false)} className="block px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">
                    🏆 ランキング
                  </a>
                  <a href="/premium" onClick={() => setMenuOpen(false)} className="block px-3 py-2.5 text-sm text-amber-600 font-medium hover:bg-amber-50 rounded-lg">
                    ✨ プレミアム
                  </a>
                  <a href="/login" onClick={() => setMenuOpen(false)} className="block px-3 py-2.5 text-sm font-medium text-gray-800 hover:bg-gray-50 rounded-lg">
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
