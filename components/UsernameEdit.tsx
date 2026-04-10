'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

type Props = {
  currentUsername: string
}

export default function UsernameEdit({ currentUsername }: Props) {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [username, setUsername] = useState(currentUsername)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function handleSave() {
    const trimmed = username.trim()
    if (!trimmed) {
      setError('ユーザー名を入力してください')
      return
    }
    if (trimmed.length > 20) {
      setError('ユーザー名は20文字以内にしてください')
      return
    }

    setSaving(true)
    setError(null)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      setError('ログインが必要です')
      setSaving(false)
      return
    }

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ username: trimmed })
      .eq('id', user.id)

    if (updateError) {
      setError('更新に失敗しました')
    } else {
      setSuccess(true)
      setEditing(false)
      setTimeout(() => setSuccess(false), 2000)
      router.refresh()
    }

    setSaving(false)
  }

  if (!editing) {
    return (
      <div>
        <p className="text-sm text-gray-500 mb-1">ユーザー名</p>
        <div className="flex items-center justify-between">
          <p className="text-gray-800 font-medium">{currentUsername}</p>
          <div className="flex items-center gap-2">
            {success && <span className="text-xs text-green-500">保存しました</span>}
            <button
              onClick={() => setEditing(true)}
              className="text-sm text-gray-400 hover:text-gray-600 active:text-gray-800"
            >
              変更
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <p className="text-sm text-gray-500 mb-2">ユーザー名</p>
      <div className="flex gap-2">
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          maxLength={20}
          className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-base focus:outline-none focus:border-gray-400"
          autoFocus
        />
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-gray-800 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-700 disabled:opacity-50 active:bg-gray-900"
        >
          {saving ? '...' : '保存'}
        </button>
        <button
          onClick={() => { setEditing(false); setUsername(currentUsername); setError(null) }}
          className="text-sm text-gray-400 px-2"
        >
          取消
        </button>
      </div>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  )
}
