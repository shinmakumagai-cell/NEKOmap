'use client'

import { useState, useRef } from 'react'
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

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic']

export default function CommentForm({ spotId, onCommentAdded }: Props) {
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [photo, setPhoto] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { register, handleSubmit, reset, watch } = useForm<FormData>()
  const body = watch('body', '')

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('画像はJPEG、PNG、WebP形式のみ対応しています')
      return
    }
    if (file.size > MAX_FILE_SIZE) {
      setError('画像は5MB以下にしてください')
      return
    }

    setError(null)
    setPhoto(file)
    const reader = new FileReader()
    reader.onload = () => setPhotoPreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  function removePhoto() {
    setPhoto(null)
    setPhotoPreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

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

    let photoUrl: string | null = null

    if (photo) {
      const ext = photo.name.split('.').pop()
      const fileName = `comments/${user.id}/${Date.now()}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('spot-photos')
        .upload(fileName, photo)

      if (!uploadError) {
        const { data: urlData } = supabase.storage
          .from('spot-photos')
          .getPublicUrl(fileName)
        photoUrl = urlData.publicUrl
      }
    }

    const { error: insertError } = await supabase
      .from('comments')
      .insert({
        spot_id: spotId,
        user_id: user.id,
        body: data.body,
        photo_url: photoUrl,
      })

    if (insertError) {
      setError('コメントの投稿に失敗しました')
    } else {
      reset()
      removePhoto()
      onCommentAdded()
      updateUserScore(user.id).catch(() => {})
    }

    setSubmitting(false)
  }

  return (
    <div>
      {/* 写真プレビュー */}
      {photoPreview && (
        <div className="mb-2 ml-10 relative inline-block">
          <img src={photoPreview} alt="" className="h-20 rounded-xl border border-gray-200 object-cover" />
          <button
            type="button"
            onClick={removePhoto}
            className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-gray-800 text-white rounded-full text-xs flex items-center justify-center"
          >
            ×
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="flex items-center gap-2">
        <div className="flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm">
            😺
          </div>
        </div>

        {/* 写真ボタン */}
        <input
          type="file"
          accept="image/*"
          capture="environment"
          ref={fileInputRef}
          onChange={handlePhotoChange}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 active:bg-gray-200 text-gray-400"
        >
          📷
        </button>

        <input
          {...register('body', { required: true, maxLength: 200 })}
          placeholder="返信をポスト"
          className="flex-1 text-[15px] bg-transparent py-2 focus:outline-none placeholder-gray-400"
          disabled={submitting}
        />
        <button
          type="submit"
          disabled={submitting || (!body?.trim() && !photo)}
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
