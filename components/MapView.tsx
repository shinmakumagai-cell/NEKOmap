'use client'

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet'
import MarkerClusterGroup from 'react-leaflet-cluster'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Spot } from '@/types'
import SpotModal from './SpotModal'

// Leaflet のデフォルトアイコン修正（Next.js環境用）
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

// URLをサニタイズ（XSS対策）
function sanitizeUrl(url: string): string {
  try {
    const parsed = new URL(url)
    if (parsed.protocol === 'https:' || parsed.protocol === 'http:') {
      return parsed.href
    }
  } catch {}
  return ''
}

function createPhotoIcon(photoUrl: string): L.DivIcon {
  const safeUrl = sanitizeUrl(photoUrl)
  return new L.DivIcon({
    className: '',
    html: safeUrl
      ? `<div style="
          width: 44px;
          height: 44px;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          overflow: hidden;
          background: #f3f4f6;
        ">
          <img src="${safeUrl}" style="width:100%;height:100%;object-fit:cover;" />
        </div>`
      : `<div style="
          width: 40px;height: 40px;border-radius: 50%;border: 3px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);background: #FEF3C7;
          display:flex;align-items:center;justify-content:center;font-size:20px;
        ">🐱</div>`,
    iconSize: [44, 44],
    iconAnchor: [22, 22],
    popupAnchor: [0, -24],
  })
}

const defaultCatIcon = new L.DivIcon({
  className: '',
  html: `<div style="
    width: 40px;
    height: 40px;
    border-radius: 50%;
    border: 3px solid white;
    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    background: #FEF3C7;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
  ">🐱</div>`,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
  popupAnchor: [0, -22],
})

const sponsoredIcon = new L.DivIcon({
  className: '',
  html: `<div style="
    width: 48px;
    height: 48px;
    border-radius: 50%;
    border: 3px solid #F59E0B;
    box-shadow: 0 2px 12px rgba(245,158,11,0.5);
    background: #FEF3C7;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
  ">⭐</div>`,
  iconSize: [48, 48],
  iconAnchor: [24, 24],
  popupAnchor: [0, -26],
})

function getSpotIcon(spot: Spot): L.DivIcon {
  if (spot.is_sponsored) return sponsoredIcon
  if (spot.photo_url) return createPhotoIcon(spot.photo_url)
  return defaultCatIcon
}

// クラスターアイコンを作成
function createClusterIcon(cluster: any): L.DivIcon {
  const count = cluster.getChildCount()
  return new L.DivIcon({
    className: '',
    html: `<div style="
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: linear-gradient(135deg, #f59e0b, #d97706);
      border: 3px solid white;
      box-shadow: 0 2px 12px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
      font-size: 14px;
    ">🐱${count}</div>`,
    iconSize: [48, 48],
    iconAnchor: [24, 24],
  })
}

// 現在地に自動移動するコンポーネント
function AutoLocate({ onLocated }: { onLocated: (pos: [number, number]) => void }) {
  const map = useMap()

  useEffect(() => {
    map.locate({ setView: true, maxZoom: 16, enableHighAccuracy: true })

    function onLocationFound(e: L.LocationEvent) {
      onLocated([e.latlng.lat, e.latlng.lng])
    }
    map.on('locationfound', onLocationFound)
    return () => {
      map.off('locationfound', onLocationFound)
    }
  }, [map, onLocated])

  return null
}

type Props = {
  spots: Spot[]
}

export default function MapView({ spots }: Props) {
  const [selectedSpot, setSelectedSpot] = useState<Spot | null>(null)
  const [locationStatus, setLocationStatus] = useState<'loading' | 'granted' | 'denied'>('loading')
  const [currentPos, setCurrentPos] = useState<[number, number] | null>(null)

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationStatus('denied')
      return
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCurrentPos([pos.coords.latitude, pos.coords.longitude])
        setLocationStatus('granted')
      },
      () => {
        setLocationStatus('denied')
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }, [])

  // 位置情報の許可待ち
  if (locationStatus === 'loading') {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-amber-50 px-6">
        <p className="text-4xl mb-4">🐱</p>
        <p className="text-lg font-bold text-gray-800 mb-2">現在地を取得中...</p>
        <p className="text-sm text-gray-500 text-center">
          位置情報の許可をお願いします
        </p>
        <div className="mt-4 w-8 h-8 border-4 border-amber-300 border-t-amber-600 rounded-full animate-spin" />
      </div>
    )
  }

  // 位置情報を拒否した場合
  if (locationStatus === 'denied') {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-gray-50 px-6">
        <p className="text-4xl mb-4">📍</p>
        <p className="text-lg font-bold text-gray-800 mb-2">位置情報が必要です</p>
        <p className="text-sm text-gray-500 text-center mb-6">
          猫マップは現在地をもとに近くの猫スポットを表示します。<br />
          ブラウザの設定から位置情報を許可してください。
        </p>
        <button
          onClick={() => window.location.reload()}
          className="bg-gray-800 text-white px-6 py-3 rounded-full font-medium text-sm active:bg-gray-900"
        >
          再読み込みして許可する
        </button>
      </div>
    )
  }

  return (
    <>
      <MapContainer
        center={currentPos ?? [35.6762, 139.6503]}
        zoom={16}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <AutoLocate onLocated={setCurrentPos} />

        {/* 現在地マーカー */}
        {currentPos && (
          <>
            <Circle
              center={currentPos}
              radius={100}
              pathOptions={{ color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.1, weight: 2 }}
            />
            <Marker
              position={currentPos}
              icon={new L.DivIcon({
                className: '',
                html: '<div style="width:16px;height:16px;background:#3b82f6;border:3px solid white;border-radius:50%;box-shadow:0 1px 4px rgba(0,0,0,0.3);"></div>',
                iconSize: [16, 16],
                iconAnchor: [8, 8],
              })}
            >
              <Popup>現在地</Popup>
            </Marker>
          </>
        )}

        {/* 現在地に戻るボタン */}
        {currentPos && (
          <RecenterButton position={currentPos} />
        )}

        {/* 猫スポット（クラスタリング） */}
        <MarkerClusterGroup
          chunkedLoading
          iconCreateFunction={createClusterIcon}
          maxClusterRadius={60}
          spiderfyOnMaxZoom
          showCoverageOnHover={false}
          zoomToBoundsOnClick
        >
          {spots.map((spot) => (
            <Marker
              key={spot.id}
              position={[spot.lat, spot.lng]}
              icon={getSpotIcon(spot)}
              eventHandlers={{
                click: () => setSelectedSpot(spot),
              }}
            >
              <Popup>
                <div className="text-sm">
                  <p className="font-bold">{spot.name}</p>
                  {spot.is_sponsored && (
                    <span className="text-amber-600 text-xs">PRスポット</span>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}
        </MarkerClusterGroup>
      </MapContainer>

      {selectedSpot && (
        <SpotModal
          spot={selectedSpot}
          onClose={() => setSelectedSpot(null)}
        />
      )}
    </>
  )
}

function RecenterButton({ position }: { position: [number, number] }) {
  const map = useMap()

  return (
    <div className="leaflet-bottom leaflet-right" style={{ marginBottom: 80, marginRight: 10 }}>
      <div className="leaflet-control">
        <button
          onClick={() => map.setView(position, 16)}
          className="bg-white rounded-full shadow-lg w-11 h-11 flex items-center justify-center text-lg border border-gray-200 active:bg-gray-100"
        >
          📍
        </button>
      </div>
    </div>
  )
}
