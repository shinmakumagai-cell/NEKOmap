'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { createClient } from '@/lib/supabase'
import { updateUserScore } from '@/lib/scoring'

type Props = {
  spotId: string
  onCommentAdded: () => void
}

type FormData = {
  body: string
}

export default function CommentForm({ spotId, onCommentAdded }: Props) {
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { register, handleSubmit, reset, watch } = useForm<FormData>()
  const body = watch('body', '')

  async function onSubmit(data: FormData) {
    setSubmitting(true)
    setError(null)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      setError('コメントするにはログインが必要です')
      setSubmitting(false)
      return
    }

    const { error: insertError } = await supabase
      .from('comments')
      .insert({
        spot_id: spotId,
        user_id: user.id,
        body: data.body,
      })

    if (insertError) {
      setError('コメントの投稿に失敗しました')
    } else {
      reset()
      onCommentAdded()
      updateUserScore(user.id).catch(() => {})
    }

    setSubmitting(false)
  }

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)} className="flex items-center gap-2">
        <div className="flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm">
            😺
          </div>
        </div>
        <input
          {...register('body', { required: true, maxLength: 200 })}
          placeholder="返信をポスト"
          className="flex-1 text-[15px] bg-transparent py-2 focus:outline-none placeholder-gray-400"
          disabled={submitting}
        />
        <button
          type="submit"
          disabled={submitting || !body?.trim()}
          className="text-sm bg-gray-800 text-white px-4 py-1.5 rounded-full font-bold hover:bg-gray-700 disabled:opacity-40 active:bg-gray-900"
        >
          {submitting ? '...' : '返信'}
        </button>
      </form>
      {error && (
        <p className="text-xs text-red-500 mt-1 ml-10">{error}</p>
      )}
    </div>
  )
}
