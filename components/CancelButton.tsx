'use client'

import { useState } from 'react'

export default function CancelButton() {
  const [showConfirm, setShowConfirm] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  async function handleCancel() {
    setSubmitting(true)
    const form = document.createElement('form')
    form.method = 'POST'
    form.action = '/api/stripe/cancel'
    document.body.appendChild(form)
    form.submit()
  }

  if (!showConfirm) {
    return (
      <button
        onClick={() => setShowConfirm(true)}
        className="w-full text-center text-sm text-gray-400 hover:text-gray-500 py-2"
      >
        プレミアムを解約する
      </button>
    )
  }

  return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-4">
      <p className="text-sm text-red-700 font-medium mb-1">本当に解約しますか？</p>
      <p className="text-xs text-red-500 mb-4">
        現在の請求期間の終了まで引き続きプレミアム機能をご利用いただけます。
      </p>
      <div className="flex gap-2">
        <button
          onClick={handleCancel}
          disabled={submitting}
          className="flex-1 bg-red-500 text-white py-2.5 rounded-full text-sm font-bold hover:bg-red-600 disabled:opacity-50"
        >
          {submitting ? '処理中...' : '解約する'}
        </button>
        <button
          onClick={() => setShowConfirm(false)}
          className="flex-1 bg-gray-100 text-gray-600 py-2.5 rounded-full text-sm font-medium hover:bg-gray-200"
        >
          キャンセル
        </button>
      </div>
    </div>
  )
}
