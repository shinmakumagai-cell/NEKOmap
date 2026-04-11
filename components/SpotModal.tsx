'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { Spot, Comment } from '@/types'
import CommentForm from './CommentForm'
import PremiumBadge from './PremiumBadge'

type Props = {
  spot: Spot
  onClose: () => void
  isPremium?: boolean
  isAdmin?: boolean
  onSpotDeleted?: () => void
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

export default function SpotModal({ spot, onClose, isPremium, isAdmin, onSpotDeleted }: Props) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    fetchComments()
  }, [spot.id])

  async function fetchComments() {
    const supabase = createClient()

    // 最新20件を取得
    const { data } = await supabase
      .from('comments')
      .select('*, profiles(username, is_premium)')
      .eq('spot_id', spot.id)
      .order('created_at', { ascending: false })
      .limit(20)

    setComments((data as Comment[]) ?? [])
    setLoading(false)

    // 20件を超える古いコメントを削除
    const { data: allComments } = await supabase
      .from('comments')
      .select('id')
      .eq('spot_id', spot.id)
      .order('created_at', { ascending: false })
      .range(20, 1000)

    if (allComments && allComments.length > 0) {
      const oldIds = allComments.map((c) => c.id)
      await supabase.from('comments').delete().in('id', oldIds)
    }
  }

  async function handleDeleteSpot() {
    if (!confirm('このスポットを削除しますか？（コメント・猫データも削除されます）')) return
    setDeleting('spot')
    const res = await fetch('/api/admin/delete-spot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ spotId: spot.id }),
    })
    if (res.ok) {
      onSpotDeleted?.()
      window.location.reload()
    } else {
      alert('削除に失敗しました')
    }
    setDeleting(null)
  }

  async function handleDeleteComment(commentId: string) {
    if (!confirm('このコメントを削除しますか？')) return
    setDeleting(commentId)
    const res = await fetch('/api/admin/delete-comment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ commentId }),
    })
    if (res.ok) {
      setComments((prev) => prev.filter((c) => c.id !== commentId))
    } else {
      alert('削除に失敗しました')
    }
    setDeleting(null)
  }

  const bg = isPremium ? 'bg-gray-900' : 'bg-white'
  const textPrimary = isPremium ? 'text-white' : 'text-gray-900'
  const textSecondary = isPremium ? 'text-gray-400' : 'text-gray-400'
  const textBody = isPremium ? 'text-gray-200' : 'text-gray-800'
  const border = isPremium ? 'border-gray-800' : 'border-gray-100'
  const borderLight = isPremium ? 'border-gray-800/50' : 'border-gray-50'

  return (
    <div className="absolute inset-0 z-50 flex items-end justify-center bg-black/40" onClick={onClose}>
      <div
        className={`${bg} rounded-t-2xl w-full max-h-[85vh] flex flex-col shadow-xl`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ハンドルバー */}
        <div className="flex justify-center pt-2 pb-1">
          <div className={`w-10 h-1 rounded-full ${isPremium ? 'bg-gray-700' : 'bg-gray-300'}`} />
        </div>

        {/* ヘッダー */}
        <div className={`flex items-center px-4 py-2 border-b ${border}`}>
          <button
            onClick={onClose}
            className={`w-8 h-8 flex items-center justify-center rounded-full mr-3 ${
              isPremium ? 'hover:bg-gray-800 text-gray-300' : 'hover:bg-gray-100 active:bg-gray-200'
            }`}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
          <h2 className={`text-base font-bold flex-1 ${textPrimary}`}>スポット</h2>
          {isAdmin && (
            <button
              onClick={handleDeleteSpot}
              disabled={deleting === 'spot'}
              className="text-xs text-red-500 hover:text-red-400 px-2 py-1 rounded"
            >
              {deleting === 'spot' ? '削除中...' : 'スポット削除'}
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* メイン投稿（X風） */}
          <div className={`px-4 py-3 border-b ${border}`}>
            <div className="flex gap-3">
              {/* アバター */}
              <div className="flex-shrink-0">
                {spot.photo_url ? (
                  <div className={`w-10 h-10 rounded-full overflow-hidden border ${isPremium ? 'border-amber-600/50' : 'border-gray-200'}`}>
                    <img src={spot.photo_url} alt="" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                    isPremium ? 'bg-amber-900/30' : 'bg-amber-100'
                  }`}>
                    🐱
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                {/* ユーザー名 + 時間 */}
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className={`text-sm font-bold truncate ${textPrimary}`}>
                    {spot.profiles?.username ?? '匿名'}
                  </span>
                  {spot.profiles?.is_premium && <PremiumBadge />}
                  {spot.is_sponsored && (
                    <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-medium">PR</span>
                  )}
                  <span className={`text-xs ${textSecondary}`}>·</span>
                  <span className={`text-xs ${textSecondary}`}>{timeAgo(spot.created_at)}</span>
                </div>

                {/* スポット名 + 説明 */}
                <p className={`text-[15px] font-medium leading-snug ${textPrimary}`}>{spot.name}</p>
                {spot.description && (
                  <p className={`text-[15px] mt-1 leading-relaxed ${isPremium ? 'text-gray-300' : 'text-gray-700'}`}>{spot.description}</p>
                )}

                {/* スポット写真 */}
                {spot.photo_url && (
                  <div className={`mt-3 rounded-2xl overflow-hidden border ${isPremium ? 'border-gray-700' : 'border-gray-200'}`}>
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
                      <div key={cat.id} className={`flex-shrink-0 flex items-center gap-1.5 rounded-full pl-1 pr-3 py-1 ${
                        isPremium ? 'bg-amber-900/20' : 'bg-amber-50'
                      }`}>
                        {cat.photo_url ? (
                          <img src={cat.photo_url} alt="" className="w-6 h-6 rounded-full object-cover" />
                        ) : (
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                            isPremium ? 'bg-amber-900/30' : 'bg-amber-100'
                          }`}>🐱</span>
                        )}
                        <span className={`text-xs ${isPremium ? 'text-amber-300' : 'text-gray-700'}`}>{cat.name ?? '名無し'}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* アクションバー */}
                <div className="flex items-center gap-6 mt-3 pt-2">
                  <span className={`text-xs flex items-center gap-1 ${textSecondary}`}>
                    💬 {comments.length}
                  </span>
                  <span className={`text-xs flex items-center gap-1 ${textSecondary}`}>
                    📍 {spot.lat.toFixed(2)}, {spot.lng.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* コメント一覧（X風リプライ） */}
          {loading ? (
            <div className="px-4 py-6 text-center">
              <p className={`text-sm ${textSecondary}`}>読み込み中...</p>
            </div>
          ) : comments.length === 0 ? (
            <div className="px-4 py-6 text-center">
              <p className={`text-sm ${textSecondary}`}>まだコメントがありません</p>
              <p className={`text-xs mt-1 ${isPremium ? 'text-gray-600' : 'text-gray-300'}`}>最初のコメントを残しましょう</p>
            </div>
          ) : (
            <div>
              {comments.map((comment) => (
                <div key={comment.id} className={`px-4 py-3 border-b ${borderLight} flex gap-3`}>
                  <div className="flex-shrink-0">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                      isPremium ? 'bg-gray-800' : 'bg-gray-100'
                    }`}>
                      😺
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className={`text-sm font-bold ${textPrimary}`}>
                        {comment.profiles?.username ?? '匿名'}
                      </span>
                      {comment.profiles?.is_premium && <PremiumBadge />}
                      <span className={`text-xs ${textSecondary}`}>·</span>
                      <span className={`text-xs ${textSecondary}`}>{timeAgo(comment.created_at)}</span>
                    </div>
                    <p className={`text-[15px] leading-relaxed ${textBody}`}>{comment.body}</p>
                    {comment.photo_url && (
                      <div className={`mt-2 rounded-xl overflow-hidden border inline-block ${isPremium ? 'border-gray-700' : 'border-gray-200'}`}>
                        <img
                          src={comment.photo_url}
                          alt=""
                          className="max-h-48 object-cover"
                        />
                      </div>
                    )}
                    {isAdmin && (
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        disabled={deleting === comment.id}
                        className="text-xs text-red-500 hover:text-red-400 mt-1 block"
                      >
                        {deleting === comment.id ? '削除中...' : '削除'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* コメント入力（下部固定） */}
        <div className={`border-t px-4 py-3 pb-safe ${isPremium ? 'border-gray-800 bg-gray-900' : 'border-gray-200 bg-white'}`}>
          <CommentForm spotId={spot.id} onCommentAdded={fetchComments} isPremium={isPremium} />
        </div>
      </div>
    </div>
  )
}
