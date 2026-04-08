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
    <div className="absolute inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[80vh] flex flex-col shadow-xl">
        {/* ヘッダー */}
        <div className="flex items-start justify-between p-4 border-b">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-gray-800">{spot.name}</h2>
              {spot.is_sponsored && (
                <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                  ✨ PR
                </span>
              )}
            </div>
            {spot.description && (
              <p className="text-sm text-gray-500 mt-1">{spot.description}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none ml-2"
          >
            ×
          </button>
        </div>

        {/* 猫一覧（プレミアム登録ありの場合） */}
        {spot.cats && spot.cats.length > 0 && (
          <div className="px-4 py-3 border-b bg-amber-50">
            <p className="text-xs font-medium text-amber-700 mb-2">この場所の猫</p>
            <div className="flex gap-2 overflow-x-auto">
              {spot.cats.map((cat) => (
                <div key={cat.id} className="flex-shrink-0 text-center">
                  {cat.photo_url ? (
                    <img
                      src={cat.photo_url}
                      alt={cat.name ?? '猫'}
                      className="w-14 h-14 rounded-full object-cover border-2 border-amber-200"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center text-2xl">
                      🐱
                    </div>
                  )}
                  <p className="text-xs text-gray-600 mt-1">{cat.name ?? '名無し'}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* コメント一覧 */}
        <div className="flex-1 overflow-y-auto px-4 py-3">
          <p className="text-xs font-medium text-gray-500 mb-2">
            コメント {comments.length}件
          </p>
          {loading ? (
            <p className="text-sm text-gray-400">読み込み中...</p>
          ) : comments.length === 0 ? (
            <p className="text-sm text-gray-400">まだコメントがありません。最初のコメントを残しましょう！</p>
          ) : (
            <div className="space-y-3">
              {comments.map((comment) => (
                <div key={comment.id} className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-400 mb-1 flex items-center gap-1">
                    <span>{comment.profiles?.username ?? '匿名'}</span>
                    {comment.profiles?.is_premium && <PremiumBadge />}
                    <span className="ml-1">
                      {new Date(comment.created_at).toLocaleDateString('ja-JP')}
                    </span>
                  </p>
                  <p className="text-sm text-gray-700">{comment.body}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* コメント入力 */}
        <div className="p-4 border-t">
          <CommentForm spotId={spot.id} onCommentAdded={fetchComments} />
        </div>
      </div>
    </div>
  )
}
