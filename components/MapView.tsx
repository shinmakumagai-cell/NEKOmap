'use client'

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Spot } from '@/types'
import SpotModal from './SpotModal'
import { createMarkerIcon } from '@/lib/markers'

// Leaflet のデフォルトアイコン修正（Next.js環境用）
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

// PRスポット用の金色アイコン
const sponsoredIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-gold.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

function getSpotIcon(spot: Spot): L.Icon | L.DivIcon {
  if (spot.is_sponsored) return sponsoredIcon
  const markerType = spot.profiles?.marker_type
  if (markerType && markerType !== 'default') {
    return createMarkerIcon(markerType, spot.profiles?.marker_photo_url)
  }
  return new L.Icon.Default()
}

// 現在地ボタン＆マーカー
function LocationControl() {
  const map = useMap()
  const [position, setPosition] = useState<[number, number] | null>(null)

  function handleLocate() {
    map.locate({ setView: true, maxZoom: 16 })
  }

  useEffect(() => {
    function onLocationFound(e: L.LocationEvent) {
      setPosition([e.latlng.lat, e.latlng.lng])
    }
    map.on('locationfound', onLocationFound)
    return () => {
      map.off('locationfound', onLocationFound)
    }
  }, [map])

  return (
    <>
      <div className="leaflet-top leaflet-right" style={{ marginTop: 10, marginRight: 10 }}>
        <div className="leaflet-control">
          <button
            onClick={handleLocate}
            className="bg-white rounded-lg shadow-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 border border-gray-200"
          >
            📍 現在地
          </button>
        </div>
      </div>
      {position && (
        <>
          <Circle
            center={position}
            radius={100}
            pathOptions={{ color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.15, weight: 2 }}
          />
          <Marker
            position={position}
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
    </>
  )
}

type Props = {
  spots: Spot[]
}

export default function MapView({ spots }: Props) {
  const [selectedSpot, setSelectedSpot] = useState<Spot | null>(null)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-100">
        <p className="text-gray-500">地図を読み込み中...</p>
      </div>
    )
  }

  return (
    <>
      <MapContainer
        center={[35.6762, 139.6503]}
        zoom={13}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <LocationControl />

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
