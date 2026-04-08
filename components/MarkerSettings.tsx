'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { MarkerType } from '@/types'

type Props = {
  isPremium: boolean
  currentMarkerType: MarkerType
}

const MARKER_OPTIONS: { type: MarkerType; label: string; color: string }[] = [
  { type: 'default', label: 'デフォルト', color: 'bg-blue-500' },
  { type: 'red', label: '赤', color: 'bg-red-500' },
  { type: 'green', label: '緑', color: 'bg-green-500' },
  { type: 'purple', label: '紫', color: 'bg-purple-500' },
  { type: 'orange', label: 'オレンジ', color: 'bg-orange-500' },
  { type: 'cat_photo', label: '猫の写真', color: 'bg-amber-500' },
]

export default function MarkerSettings({ isPremium, currentMarkerType }: Props) {
  const [selected, setSelected] = useState<MarkerType>(currentMarkerType)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function handleSelect(type: MarkerType) {
    if (!isPremium) return
    setSelected(type)
    setSaving(true)
    setSaved(false)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase
        .from('profiles')
        .update({ marker_type: type })
        .eq('id', user.id)
      setSaved(true)
    }
    setSaving(false)
  }

  return (
    <div>
      <h3 className="text-sm font-medium text-gray-700 mb-3">マーカーの色</h3>
      {!isPremium && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-3">
          <p className="text-sm text-amber-700">
            カスタムマーカーはプレミアム機能です
          </p>
          <a href="/premium" className="text-xs text-amber-600 underline">
            アップグレードする
          </a>
        </div>
      )}
      <div className="grid grid-cols-3 gap-2">
        {MARKER_OPTIONS.map((option) => (
          <button
            key={option.type}
            onClick={() => handleSelect(option.type)}
            disabled={!isPremium || saving}
            className={`flex items-center gap-2 p-3 rounded-lg border text-sm transition-colors ${
              selected === option.type
                ? 'border-amber-400 bg-amber-50'
                : 'border-gray-200 hover:border-gray-300'
            } ${!isPremium ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <span className={`w-4 h-4 rounded-full ${option.color}`} />
            <span className="text-gray-700">{option.label}</span>
          </button>
        ))}
      </div>
      {saved && (
        <p className="text-xs text-green-600 mt-2">保存しました</p>
      )}
    </div>
  )
}
