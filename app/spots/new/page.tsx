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
      <div className="h-64 flex-shrink-0">
        <SpotMap onSelect={(lat, lng) => { setLat(lat); setLng(lng) }} />
      </div>

      {/* フォーム */}
      <div className="flex-1 overflow-y-auto p-4">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              スポット名 <span className="text-red-500">*</span>
            </label>
            <input
              {...register('name', { required: 'スポット名を入力してください' })}
              placeholder="例：〇〇公園の三毛猫エリア"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400"
            />
            {errors.name && (
              <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              説明（任意）
            </label>
            <textarea
              {...register('description')}
              placeholder="猫がいる時間帯や特徴など..."
              rows={3}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400 resize-none"
            />
          </div>

          {lat && lng && (
            <p className="text-xs text-green-600">
              場所を選択しました（{lat.toFixed(4)}, {lng.toFixed(4)}）
            </p>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-gray-800 text-white py-3 rounded-full font-medium hover:bg-gray-700 disabled:opacity-50"
          >
            {submitting ? '登録中...' : 'スポットを登録する'}
          </button>
        </form>
      </div>
    </div>
  )
}
