'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { updateUserScore } from '@/lib/scoring'
import dynamic from 'next/dynamic'

const SpotMap = dynamic(() => import('@/components/SpotMapPicker'), { ssr: false })

type FormData = {
  name: string
  description: string
}

export default function NewSpotPage() {
  const router = useRouter()
  const [lat, setLat] = useState<number | null>(null)
  const [lng, setLng] = useState<number | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>()

  async function onSubmit(data: FormData) {
    if (!lat || !lng) {
      setError('地図をタップしてスポットの場所を選んでください')
      return
    }

    setSubmitting(true)
    setError(null)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      setError('スポットを登録するにはログインが必要です')
      setSubmitting(false)
      return
    }

    const { error: insertError } = await supabase
      .from('spots')
      .insert({
        user_id: user.id,
        name: data.name,
        description: data.description,
        lat,
        lng,
      })

    if (insertError) {
      setError('登録に失敗しました')
    } else {
      updateUserScore(user.id).catch(() => {})
      router.push('/')
    }

    setSubmitting(false)
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 bg-white border-b">
        <h2 className="text-base font-bold text-gray-800 mb-1">新しいスポットを追加</h2>
        <p className="text-sm text-gray-500">地図をタップして場所を選んでください</p>
      </div>

      {/* 地図（場所選択用） */}
      <div className="flex-1 min-h-[200px]">
        <SpotMap onSelect={(lat, lng) => { setLat(lat); setLng(lng) }} />
      </div>

      {/* フォーム（下部固定） */}
      <div className="flex-shrink-0 bg-white border-t border-gray-200 px-4 py-3 pb-safe">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div>
            <input
              {...register('name', { required: 'スポット名を入力してください' })}
              placeholder="スポット名（例：〇〇公園の三毛猫エリア）"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:border-gray-400"
            />
            {errors.name && (
              <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>
            )}
          </div>

          <textarea
            {...register('description')}
            placeholder="説明（猫がいる時間帯や特徴など...）"
            rows={2}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:border-gray-400 resize-none"
          />

          {lat && lng && (
            <p className="text-xs text-green-600">
              📍 場所を選択済み（{lat.toFixed(4)}, {lng.toFixed(4)}）
            </p>
          )}

          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-gray-800 text-white py-3.5 rounded-full font-medium text-base hover:bg-gray-700 disabled:opacity-50 active:bg-gray-900"
          >
            {submitting ? '登録中...' : 'スポットを登録する'}
          </button>
        </form>
      </div>
    </div>
  )
}
