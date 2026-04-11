'use client'

import { useEffect, useRef } from 'react'

type Props = {
  isPremium: boolean
}

declare global {
  interface Window {
    adsbygoogle?: any[]
  }
}

export default function AdBanner({ isPremium }: Props) {
  const adRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // AdSenseが読み込まれていれば広告を表示
    try {
      if (window.adsbygoogle) {
        window.adsbygoogle.push({})
      }
    } catch {}
  }, [])

  if (isPremium) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-sm">
      {/* Google AdSense 広告枠 */}
      {/* AdSense承認後、data-ad-client と data-ad-slot を設定してください */}
      <div ref={adRef} className="max-w-screen-sm mx-auto">
        <ins
          className="adsbygoogle"
          style={{ display: 'block' }}
          data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
          data-ad-slot="XXXXXXXXXX"
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>

      {/* AdSense承認前の仮バナー（承認後に削除） */}
      <div className="px-4 py-3 text-center" id="placeholder-ad">
        <div className="bg-gray-50 rounded-xl py-3 px-4">
          <p className="text-xs text-gray-400 mb-1">AD</p>
          <p className="text-sm text-gray-600 font-medium">
            🐱 猫マップ プレミアムで広告非表示
          </p>
          <a
            href="/premium"
            className="inline-block mt-1 text-xs text-amber-600 font-medium hover:text-amber-700"
          >
            月額¥300 で VIP に →
          </a>
        </div>
      </div>
    </div>
  )
}
