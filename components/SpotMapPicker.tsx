'use client'

import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

type Props = {
  onSelect: (lat: number, lng: number) => void
}

function LocationPicker({ onSelect }: { onSelect: (lat: number, lng: number) => void }) {
  const [position, setPosition] = useState<[number, number] | null>(null)

  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng])
      onSelect(e.latlng.lat, e.latlng.lng)
    },
  })

  return position ? <Marker position={position} /> : null
}

function MoveToLocation({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap()
  useEffect(() => {
    map.setView([lat, lng], 16)
  }, [lat, lng, map])
  return null
}

export default function SpotMapPicker({ onSelect }: Props) {
  const [currentPos, setCurrentPos] = useState<[number, number] | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc: [number, number] = [pos.coords.latitude, pos.coords.longitude]
          setCurrentPos(loc)
          setLoading(false)
        },
        () => {
          setLoading(false)
        },
        { enableHighAccuracy: true, timeout: 5000 }
      )
    } else {
      setLoading(false)
    }
  }, [])

  function handleUseCurrentLocation() {
    if (currentPos) {
      onSelect(currentPos[0], currentPos[1])
    }
  }

  const center: [number, number] = currentPos ?? [35.6762, 139.6503]
  const zoom = currentPos ? 16 : 13

  return (
    <div className="h-full w-full relative">
      <MapContainer center={center} zoom={zoom} className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationPicker onSelect={onSelect} />
        {currentPos && <MoveToLocation lat={currentPos[0]} lng={currentPos[1]} />}
        {currentPos && (
          <Marker
            position={currentPos}
            icon={L.divIcon({
              className: '',
              html: '<div style="width:14px;height:14px;background:#3B82F6;border:3px solid white;border-radius:50%;box-shadow:0 0 6px rgba(59,130,246,0.5);"></div>',
              iconSize: [14, 14],
              iconAnchor: [7, 7],
            })}
          />
        )}
      </MapContainer>

      {currentPos && (
        <button
          onClick={handleUseCurrentLocation}
          className="absolute bottom-3 left-1/2 -translate-x-1/2 z-[1000] bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg hover:bg-blue-600"
        >
          現在地でスポットを追加
        </button>
      )}

      {loading && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-[1000] bg-white px-3 py-1 rounded-full text-xs text-gray-500 shadow">
          現在地を取得中...
        </div>
      )}
    </div>
  )
}
