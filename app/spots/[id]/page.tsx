import { createServerSupabaseClient } from '@/lib/supabase-server'
import { notFound } from 'next/navigation'
import { Spot } from '@/types'
import PremiumBadge from '@/components/PremiumBadge'

type Props = {
  params: { id: string }
}

export default async function SpotDetailPage({ params }: Props) {
  const supabase = createServerSupabaseClient()

  const { data: spot } = await supabase
    .from('spots')
    .select('*, profiles(username, is_premium), cats(*), comments(*, profiles(username, is_premium))')
    .eq('id', params.id)
    .single()

  if (!spot) notFound()

  const s = spot as Spot

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      {/* スポット情報 */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-1">
          <h2 className="text-xl font-bold text-gray-800">{s.name}</h2>
          {s.is_sponsored && (
            <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">✨ PR</span>
          )}
        </div>
        {s.description && (
          <p className="text-gray-500 text-sm">{s.description}</p>
        )}
        <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
          <span>登録者: {s.profiles?.username ?? '匿名'}</span>
          {s.profiles?.is_premium && <PremiumBadge />}
          <span>·</span>
          {new Date(s.created_at).toLocaleDateString('ja-JP')}
        </p>
      </div>

      {/* 猫一覧 */}
      {s.cats && s.cats.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-2">この場所の猫</h3>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {s.cats.map((cat) => (
              <div key={cat.id} className="flex-shrink-0 text-center w-20">
                {cat.photo_url ? (
                  <img
                    src={cat.photo_url}
                    alt={cat.name ?? '猫'}
                    className="w-16 h-16 rounded-full object-cover border-2 border-amber-200 mx-auto"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center text-2xl mx-auto border border-amber-100">
                    🐱
                  </div>
                )}
                <p className="text-xs text-gray-600 mt-1 truncate">{cat.name ?? '名無し'}</p>
                {cat.personality && (
                  <p className="text-xs text-gray-400 truncate">{cat.personality}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* コメント一覧 */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-3">
          コメント {s.comments?.length ?? 0}件
        </h3>
        {s.comments && s.comments.length > 0 ? (
          <div className="space-y-3">
            {s.comments.map((comment) => (
              <div key={comment.id} className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-400 mb-1 flex items-center gap-1">
                  <span>{comment.profiles?.username ?? '匿名'}</span>
                  {comment.profiles?.is_premium && <PremiumBadge />}
                  <span>·</span>
                  {new Date(comment.created_at).toLocaleDateString('ja-JP')}
                </p>
                <p className="text-sm text-gray-700">{comment.body}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400">まだコメントがありません</p>
        )}
      </div>
    </div>
  )
}
