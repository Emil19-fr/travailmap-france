import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Circle,
  MapContainer,
  Marker,
  TileLayer,
  Tooltip,
  ZoomControl,
  useMap,
  useMapEvents,
} from 'react-leaflet'
import L from 'leaflet'
import type { EnrichedCity } from '../types/city'

interface MapViewProps {
  cities: EnrichedCity[]
  selected: EnrichedCity | null
  onSelectCity: (city: EnrichedCity) => void
  /** Cible de recentrage ; un nouveau `nonce` relance le vol même vers la même ville. */
  focus: { lat: number; lng: number; nonce: number } | null
}

const FRANCE_CENTER: [number, number] = [46.6, 2.45]
const FRANCE_BOUNDS: [[number, number], [number, number]] = [
  [40.5, -7],
  [52.5, 11],
]

/** Recentre la carte (flyTo) à chaque changement de `nonce`. */
function FlyController({ focus }: { focus: MapViewProps['focus'] }) {
  const map = useMap()
  const lastNonce = useRef<number>(-1)
  useEffect(() => {
    if (focus && focus.nonce !== lastNonce.current) {
      lastNonce.current = focus.nonce
      map.flyTo([focus.lat, focus.lng], Math.max(map.getZoom(), 9), { duration: 1.1 })
    }
  }, [focus, map])
  return null
}

/**
 * Corrige le rendu Leaflet sur iOS / Safari (WebKit) : recalcule la taille du
 * conteneur après le layout initial, au resize, à la rotation et quand la barre
 * d'outils mobile apparaît/disparaît (visualViewport).
 */
function MapResizer() {
  const map = useMap()
  useEffect(() => {
    const invalidate = () => map.invalidateSize({ animate: false })
    // Plusieurs passes : le conteneur peut avoir une taille nulle au 1er paint sur iOS.
    const timers = [0, 200, 600, 1200].map((d) => window.setTimeout(invalidate, d))
    window.addEventListener('resize', invalidate)
    window.addEventListener('orientationchange', invalidate)
    window.visualViewport?.addEventListener('resize', invalidate)
    return () => {
      timers.forEach((t) => clearTimeout(t))
      window.removeEventListener('resize', invalidate)
      window.removeEventListener('orientationchange', invalidate)
      window.visualViewport?.removeEventListener('resize', invalidate)
    }
  }, [map])
  return null
}

/** Suit le niveau de zoom courant pour rendre l'affichage progressif. */
function ZoomWatcher({ onZoom }: { onZoom: (z: number) => void }) {
  const map = useMapEvents({
    zoomend: () => onZoom(map.getZoom()),
  })
  useEffect(() => {
    onZoom(map.getZoom())
  }, [map, onZoom])
  return null
}

export default function MapView({ cities, selected, onSelectCity, focus }: MapViewProps) {
  const [zoom, setZoom] = useState(6)

  // On affiche toujours la ville sélectionnée, même si les filtres la masquent.
  const rendered = useMemo(() => {
    if (selected && !cities.some((c) => c.id === selected.id)) {
      return [...cities, selected]
    }
    return cities
  }, [cities, selected])

  // Plus on zoome, plus l'info est précise : libellés permanents + zones plus discrètes.
  const detailed = zoom >= 8
  const baseFill = detailed ? 0.26 : 0.36

  const pinIcon = useMemo(() => {
    const color = selected?.band.color ?? '#1F3A5F'
    return L.divIcon({
      className: 'pin',
      html: `<span class="pin__pulse" style="--c:${color}"></span><span class="pin__dot" style="--c:${color}"></span>`,
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    })
  }, [selected])

  return (
    <MapContainer
      className="map"
      center={FRANCE_CENTER}
      zoom={6}
      minZoom={5}
      maxZoom={13}
      maxBounds={FRANCE_BOUNDS}
      maxBoundsViscosity={0.4}
      zoomControl={false}
      scrollWheelZoom
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> France'
        url="https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png"
        subdomains="abc"
        maxZoom={20}
      />

      <ZoomControl position="bottomright" />
      <MapResizer />
      <FlyController focus={focus} />
      <ZoomWatcher onZoom={setZoom} />

      {rendered.map((c) => {
        const isSelected = selected?.id === c.id
        return (
          <Circle
            key={c.id}
            center={[c.lat, c.lng]}
            radius={c.radiusMeters}
            pathOptions={{
              color: c.band.color,
              fillColor: c.band.color,
              fillOpacity: isSelected ? baseFill + 0.12 : baseFill,
              weight: isSelected ? 3 : 1.3,
              opacity: isSelected ? 1 : 0.85,
            }}
            eventHandlers={{ click: () => onSelectCity(c) }}
          >
            <Tooltip
              direction="top"
              offset={[0, -4]}
              opacity={1}
              permanent={detailed}
              className="city-tip"
            >
              <span className="city-tip__name">{c.name}</span>
              <span className="city-tip__score" style={{ color: c.band.color }}>
                {c.score}
              </span>
            </Tooltip>
          </Circle>
        )
      })}

      {selected && <Marker position={[selected.lat, selected.lng]} icon={pinIcon} interactive={false} />}
    </MapContainer>
  )
}
