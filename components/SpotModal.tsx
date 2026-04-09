'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { Spot, Comment } from '@/types'
import CommentForm from './CommentForm'
import PremiumBadge from './PremiumBadge'

type Props = {
  spot: Spot
  onClose: () => void
}

function timeAgo(dateStr: string): string {
  const now = new Date()
  const date = new Date(dateStr)
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diff < 60) return `${diff}秒前`
  if (diff < 3600) return `${Math.floor(diff / 60)}分前`
  if (diff < 86400) return `${Math.floor(diff / 3600)}時間前`
  if (diff < 604800) return `${Math.floor(diff / 86400)}日前`
  return date.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })
}

export default function SpotModal({ spot, onClose }: Props) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchComments()
  }, [spot.id])

  async function fetchComments() {
    const supabase = createClient()
    const { data } = await supabase
      .from('comments')
      .select('*, profiles(username, is_premium)')
      .eq('spot_id', spot.id)
      .order('created_at', { ascending: false })

    setComments((data as Comment[]) ?? [])
    setLoading(false)
  }

  return (
    <div className="absolute inset-0 z-50 flex items-end justify-center bg-black/40" onClick={onClose}>
      <div
        className="bg-white rounded-t-2xl w-full max-h-[85vh] flex flex-col shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ハンドルバー */}
        <div className="flex justify-center pt-2 pb-1">
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>

        {/* ヘッダー */}
        <div className="flex items-center px-4 py-2 border-b border-gray-100">
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 active:bg-gray-200 mr-3"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
          <h2 className="text-base font-bold text-gray-900">スポット</h2>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* メイン投稿（X風） */}
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="flex gap-3">
              {/* アバター */}
              <div className="flex-shrink-0">
                {spot.photo_url ? (
                  <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-200">
                    <img src={spot.photo_url} alt="" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-lg">
                    🐱
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                {/* ユーザー名 + 時間 */}
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="text-sm font-bold text-gray-900 truncate">
                    {spot.profiles?.username ?? '匿名'}
                  </span>
                  {spot.profiles?.is_premium && <PremiumBadge />}
                  {spot.is_sponsored && (
                    <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-medium">PR</span>
                  )}
                  <span className="text-xs text-gray-400">·</span>
                  <span className="text-xs text-gray-400">{timeAgo(spot.created_at)}</span>
                </div>

                {/* スポット名 + 説明 */}
                <p className="text-[15px] text-gray-900 font-medium leading-snug">{spot.name}</p>
                {spot.description && (
                  <p className="text-[15px] text-gray-700 mt-1 leading-relaxed">{spot.description}</p>
                )}

                {/* スポット写真 */}
                {spot.photo_url && (
                  <div className="mt-3 rounded-2xl overflow-hidden border border-gray-200">
                    <img
                      src={spot.photo_url}
                      alt={spot.name}
                      className="w-full max-h-72 object-cover"
                    />
                  </div>
                )}

                {/* 猫タグ */}
                {spot.cats && spot.cats.length > 0 && (
                  <div className="mt-3 flex gap-2 overflow-x-auto">
                    {spot.cats.map((cat) => (
                      <div key={cat.id} className="flex-shrink-0 flex items-center gap-1.5 bg-amber-50 rounded-full pl-1 pr-3 py-1">
                        {cat.photo_url ? (
                          <img src={cat.photo_url} alt="" className="w-6 h-6 rounded-full object-cover" />
                        ) : (
                          <span className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center text-xs">🐱</span>
                        )}
                        <span className="text-xs text-gray-700">{cat.name ?? '名無し'}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* アクションバー */}
                <div className="flex items-center gap-6 mt-3 pt-2">
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    💬 {comments.length}
                  </span>
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    📍 {spot.lat.toFixed(2)}, {spot.lng.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* コメント一覧（X風リプライ） */}
          {loading ? (
            <div className="px-4 py-6 text-center">
              <p className="text-sm text-gray-400">読み込み中...</p>
            </div>
          ) : comments.length === 0 ? (
            <div className="px-4 py-6 text-center">
              <p className="text-sm text-gray-400">まだコメントがありません</p>
              <p className="text-xs text-gray-300 mt-1">最初のコメントを残しましょう</p>
            </div>
          ) : (
            <div>
              {comments.map((comment) => (
                <div key={comment.id} className="px-4 py-3 border-b border-gray-50 flex gap-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm">
                      😺
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="text-sm font-bold text-gray-900">
                        {comment.profiles?.username ?? '匿名'}
                      </span>
                      {comment.profiles?.is_premium && <PremiumBadge />}
                      <span className="text-xs text-gray-400">·</span>
                      <span className="text-xs text-gray-400">{timeAgo(comment.created_at)}</span>
                    </div>
                    <p className="text-[15px] text-gray-800 leading-relaxed">{comment.body}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* コメント入力（下部固定） */}
        <div className="border-t border-gray-200 px-4 py-3 pb-safe bg-white">
          <CommentForm spotId={spot.id} onCommentAdded={fetchComments} />
        </div>
      </div>
    </div>
  )
}
