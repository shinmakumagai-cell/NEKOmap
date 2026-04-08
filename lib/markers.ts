import L from 'leaflet'

const MARKER_COLORS: Record<string, string> = {
  default: 'blue',
  red: 'red',
  green: 'green',
  purple: 'violet',
  orange: 'orange',
}

export function createMarkerIcon(type: string, photoUrl?: string | null): L.Icon | L.DivIcon {
  if (type === 'cat_photo' && photoUrl) {
    return new L.DivIcon({
      className: 'custom-cat-marker',
      html: `<img src="${photoUrl}" style="width:32px;height:32px;border-radius:50%;border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.3);object-fit:cover;" />`,
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32],
    })
  }

  const color = MARKER_COLORS[type] ?? 'blue'
  return new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-${color}.png`,
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  })
}
