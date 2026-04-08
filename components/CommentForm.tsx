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

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>()

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
    <form onSubmit={handleSubmit(onSubmit)} className="flex gap-2">
      <input
        {...register('body', { required: 'コメントを入力してください', maxLength: 200 })}
        placeholder="猫の様子をコメント..."
        className="flex-1 text-sm border border-gray-200 rounded-full px-3 py-2 focus:outline-none focus:border-gray-400"
        disabled={submitting}
      />
      <button
        type="submit"
        disabled={submitting}
        className="text-sm bg-gray-800 text-white px-4 py-2 rounded-full hover:bg-gray-700 disabled:opacity-50"
      >
        {submitting ? '...' : '送信'}
      </button>
      {error && (
        <p className="text-xs text-red-500 mt-1">{error}</p>
      )}
    </form>
  )
}
