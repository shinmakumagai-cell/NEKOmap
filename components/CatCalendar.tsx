'use client'

import { useState, useRef } from 'react'
import { Cat } from '@/types'

type Props = {
  cats: Cat[]
}

const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土']

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfWeek(year: number, month: number) {
  return new Date(year, month, 1).getDay()
}

export default function CatCalendar({ cats }: Props) {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())
  const [downloading, setDownloading] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const catsWithPhotos = cats.filter((c) => c.photo_url)
  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDayOfWeek(year, month)

  function prevMonth() {
    if (month === 0) {
      setYear(year - 1)
      setMonth(11)
    } else {
      setMonth(month - 1)
    }
  }

  function nextMonth() {
    if (month === 11) {
      setYear(year + 1)
      setMonth(0)
    } else {
      setMonth(month + 1)
    }
  }

  function getCatForDay(day: number): Cat | null {
    if (catsWithPhotos.length === 0) return null
    return catsWithPhotos[(day - 1) % catsWithPhotos.length]
  }

  async function loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => resolve(img)
      img.onerror = reject
      img.src = src
    })
  }

  async function handleDownload() {
    setDownloading(true)
    try {
      const W = 1920
      const H = 1080
      const canvas = document.createElement('canvas')
      canvas.width = W
      canvas.height = H
      const ctx = canvas.getContext('2d')!

      // 背景グラデーション
      const grad = ctx.createLinearGradient(0, 0, 0, H)
      grad.addColorStop(0, '#FFF8E1')
      grad.addColorStop(1, '#FFFFFF')
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, W, H)

      // メイン猫画像（左側に大きく）
      const mainCat = catsWithPhotos.length > 0
        ? catsWithPhotos[month % catsWithPhotos.length]
        : null

      if (mainCat?.photo_url) {
        try {
          const img = await loadImage(mainCat.photo_url)
          // 左半分に猫写真を大きく表示
          const imgW = 900
          const imgH = H
          const scale = Math.max(imgW / img.width, imgH / img.height)
          const sw = imgW / scale
          const sh = imgH / scale
          const sx = (img.width - sw) / 2
          const sy = (img.height - sh) / 2
          ctx.drawImage(img, sx, sy, sw, sh, 0, 0, imgW, imgH)

          // 左側に薄いオーバーレイ
          const overlay = ctx.createLinearGradient(600, 0, 900, 0)
          overlay.addColorStop(0, 'rgba(255,248,225,0)')
          overlay.addColorStop(1, 'rgba(255,248,225,1)')
          ctx.fillStyle = overlay
          ctx.fillRect(0, 0, 900, H)
        } catch {
          // 画像読み込み失敗時はスキップ
        }
      }

      // タイトル（右上）
      ctx.fillStyle = '#78350F'
      ctx.font = 'bold 52px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(`${year}年 ${month + 1}月`, 1380, 80)

      // 猫マップロゴ
      ctx.fillStyle = '#D97706'
      ctx.font = '20px sans-serif'
      ctx.fillText('neko map', 1380, 110)

      // カレンダーグリッド（右側）
      const calX = 940
      const calY = 140
      const cellW = 125
      const cellH = 120
      const cols = 7

      // 曜日ヘッダー
      const dayColors = ['#EF4444', '#6B7280', '#6B7280', '#6B7280', '#6B7280', '#6B7280', '#3B82F6']
      ctx.font = 'bold 18px sans-serif'
      WEEKDAYS.forEach((day, i) => {
        ctx.fillStyle = dayColors[i]
        ctx.textAlign = 'center'
        ctx.fillText(day, calX + i * cellW + cellW / 2, calY)
      })

      // 日付セル
      const gridY = calY + 20
      const totalCells = firstDay + daysInMonth
      const rows = Math.ceil(totalCells / cols)

      for (let day = 1; day <= daysInMonth; day++) {
        const cellIndex = firstDay + day - 1
        const col = cellIndex % cols
        const row = Math.floor(cellIndex / cols)
        const x = calX + col * cellW
        const y = gridY + row * cellH

        // セル背景
        ctx.fillStyle = '#FFFFFF'
        ctx.strokeStyle = '#E5E7EB'
        ctx.lineWidth = 1
        const r = 8
        ctx.beginPath()
        ctx.roundRect(x + 2, y + 2, cellW - 4, cellH - 4, r)
        ctx.fill()
        ctx.stroke()

        // 猫画像
        const cat = getCatForDay(day)
        let hasImage = false
        if (cat?.photo_url) {
          try {
            const img = await loadImage(cat.photo_url)
            ctx.save()
            ctx.beginPath()
            ctx.roundRect(x + 4, y + 4, cellW - 8, cellH - 8, r - 2)
            ctx.clip()
            const s = Math.max((cellW - 8) / img.width, (cellH - 8) / img.height)
            const dw = img.width * s
            const dh = img.height * s
            ctx.drawImage(img, x + 4 + (cellW - 8 - dw) / 2, y + 4 + (cellH - 8 - dh) / 2, dw, dh)
            ctx.restore()

            // 日付背景（写真の上）
            ctx.fillStyle = 'rgba(0,0,0,0.5)'
            ctx.beginPath()
            ctx.roundRect(x + 6, y + 6, 28, 22, 4)
            ctx.fill()
            ctx.fillStyle = '#FFFFFF'
            hasImage = true
          } catch {
            // 画像読み込み失敗
          }
        }
        if (!hasImage) {
          ctx.fillStyle = '#374151'
        }

        // 日付テキスト
        ctx.font = 'bold 16px sans-serif'
        ctx.textAlign = 'left'
        ctx.fillText(`${day}`, x + 10, y + 22)
      }

      // 猫の名前（メイン猫があれば）
      if (mainCat?.name) {
        ctx.fillStyle = 'rgba(0,0,0,0.6)'
        ctx.font = 'bold 28px sans-serif'
        ctx.textAlign = 'left'
        ctx.fillText(mainCat.name, 40, H - 40)
      }

      // ダウンロード
      const link = document.createElement('a')
      link.download = `猫カレンダー_${year}年${month + 1}月_1920x1080.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    } catch {
      alert('ダウンロードに失敗しました')
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div>
      {/* ナビゲーション */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={prevMonth}
          className="text-gray-500 hover:text-gray-700 px-3 py-1 rounded-lg hover:bg-gray-100"
        >
          ←
        </button>
        <h3 className="text-lg font-bold text-gray-800">
          {year}年 {month + 1}月
        </h3>
        <button
          onClick={nextMonth}
          className="text-gray-500 hover:text-gray-700 px-3 py-1 rounded-lg hover:bg-gray-100"
        >
          →
        </button>
      </div>

      {/* カレンダープレビュー */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100">
        {/* 曜日ヘッダー */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {WEEKDAYS.map((day, i) => (
            <div
              key={day}
              className={`text-center text-xs font-medium py-1 ${
                i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : 'text-gray-400'
              }`}
            >
              {day}
            </div>
          ))}
        </div>

        {/* 日付グリッド */}
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square" />
          ))}

          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1
            const cat = getCatForDay(day)
            return (
              <div
                key={day}
                className="aspect-square rounded-lg border border-gray-100 overflow-hidden relative"
              >
                {cat?.photo_url ? (
                  <img
                    src={cat.photo_url}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-50" />
                )}
                <span className="absolute top-0.5 left-1 text-xs font-medium text-gray-600 drop-shadow-sm">
                  {day}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* ダウンロードボタン */}
      <button
        onClick={handleDownload}
        disabled={downloading}
        className="mt-4 w-full bg-amber-500 text-white py-3 rounded-full font-medium hover:bg-amber-600 disabled:opacity-50"
      >
        {downloading ? '生成中...' : '壁紙としてダウンロード (1920×1080)'}
      </button>

      {catsWithPhotos.length === 0 && (
        <p className="text-sm text-gray-400 text-center mt-3">
          猫の写真を登録するとカレンダーに表示されます
        </p>
      )}
    </div>
  )
}
