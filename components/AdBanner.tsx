'use client'

type Props = {
  isPremium: boolean
}

export default function AdBanner({ isPremium }: Props) {
  if (isPremium) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 px-4 py-2 text-center shadow-sm">
      <p className="text-xs text-gray-400 mb-0.5">AD</p>
      <p className="text-sm text-gray-600">
        猫マップ プレミアムで広告を非表示に
      </p>
      <a
        href="/premium"
        className="text-xs text-amber-600 font-medium hover:text-amber-700 underline"
      >
        詳しく見る
      </a>
    </div>
  )
}
