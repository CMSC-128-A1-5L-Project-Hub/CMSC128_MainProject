import { useEffect, useRef, useState, useCallback, memo } from "react";
import Map, { Marker, Popup, NavigationControl, Source, Layer } from 'react-map-gl'
import type { MapRef, LngLatBoundsLike } from 'react-map-gl'
import type { LayerProps } from 'react-map-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { UPLB } from '../constants/uplb'
import UPLBMarker from './UPLBMarker'

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN

// ── Perf knobs ───────────────────────────────────────────────────────────────
// Flip these back to revert #1 / #2 and compare visuals.
// #1 — map style. `standard` = pretty 3D buildings + fog (heavy).
//      `streets-v12` / `light-v11` = flat 2D (cheap).
const MAP_STYLE = 'mapbox://styles/mapbox/standard'
// const MAP_STYLE = 'mapbox://styles/mapbox/standard'  // original

// #2 — camera tilt. 0 = top-down (cheap). 45/60 = oblique 3D (heavy).
const DEFAULT_PITCH: number = 60
const CENTERED_PITCH: number = 45
// const DEFAULT_PITCH = 60   // original
// const CENTERED_PITCH = 45  // original

// #3 — keep tiles confined to Los Baños area (~10km box around UPLB)
const LOS_BANOS_BOUNDS: LngLatBoundsLike = [
  [UPLB.longitude - 0.09, UPLB.latitude - 0.09],
  [UPLB.longitude + 0.09, UPLB.latitude + 0.09],
]
const MIN_ZOOM = 6

// Below this zoom level, marker shows rating only (no name)
const NAME_ZOOM_THRESHOLD = 15

// Global pin size multiplier. 1 = default ladder below. Bump up/down to resize ALL pins.
const PIN_SIZE_MULTIPLIER = 1.1

// Pin scale by zoom — shrinks when zoomed out so far-away pins don't clutter
function scaleForZoom(z: number): number {
  let base: number
  if (z >= 15) base = 1
  else if (z >= 14) base = 0.9
  else if (z >= 13) base = 0.7
  else base = 0.5
  return base * PIN_SIZE_MULTIPLIER
}

export interface AccommodationReview {
  id: number;
  accommodation_id: number;
  student_number: string;
  rating: number;
  content: string | null;
  createdAt?: string;
}

export interface AccommodationPin {
  accommodationId: number
  accommodationName: string
  accommodationLocation: string
  accommodationType: 'on-campus' | 'off-campus' | 'partner_housing'
  accommodationCapacity: number
  tenantRestriction: 'male-only' | 'female-only' | 'coed'
  latitude: number
  longitude: number
  minRent: number
  maxRent: number
  walkingDistance: number // in minutes
  drivingDistance: number // in minutes
  bikingDistance: number // in minutes
  stayType?: 'transient' | 'non_transient' | 'both'
  imageUrl?: string
  rating?: number
  amenities?: string[]
  reviews?: AccommodationReview[]
}

type TravelMode = 'walking' | 'driving' | 'cycling'

interface AccommodationMapProps {
  accommodations: AccommodationPin[]
  onCardClick: (accommodation: AccommodationPin) => void
  centeredAccommodation?: AccommodationPin | null
  favorites?: Set<number>
  onToggleFavorite?: (accommodationId: number) => void
}

const routeLayerStyle = (mode: TravelMode): LayerProps => ({
  id: 'route',
  type: 'line',
  layout: { 'line-join': 'round', 'line-cap': 'round' },
  paint: {
    'line-color': mode === 'walking' ? '#10B981' : mode === 'driving' ? '#3B82F6' : '#F59E0B',
    'line-width': 4,
    'line-opacity': 0.85,
  },
})

function getAvgRating(pin: AccommodationPin): number {
  const reviews = pin.reviews
  if (reviews && reviews.length > 0)
    return reviews.reduce((sum, review) => sum + Number(review.rating ?? 0), 0) / reviews.length
  return pin.rating ?? 0
}

interface AccommodationPinMarkerProps {
  acc: AccommodationPin
  isSelected: boolean
  showName: boolean
  pinScale: number
  onSelect: (acc: AccommodationPin, isSelected: boolean) => void
}

const AccommodationPinMarker = memo(function AccommodationPinMarker({
  acc,
  isSelected,
  showName,
  pinScale,
  onSelect,
}: AccommodationPinMarkerProps) {
  const accAvgRating = getAvgRating(acc)
  return (
    <Marker
      longitude={acc.longitude}
      latitude={acc.latitude}
      anchor="bottom"
      style={{ zIndex: isSelected ? 497 : 1 }}
      onClick={(e) => {
        e.originalEvent.stopPropagation()
        onSelect(acc, isSelected)
      }}
    >
      <div
        className="relative flex flex-col items-center cursor-pointer transition-transform duration-300 ease-in-out origin-bottom"
        style={{
          transform: isSelected
            ? `scale(${pinScale * 1.25}) translateY(-5px)`
            : `scale(${pinScale})`,
        }}
      >
        {/* Capsule */}
        <div className={`h-auto ${showName ? 'min-w-[70px]' : ''} px-3 py-1.5 rounded-full flex flex-row items-center justify-center gap-1.5 shadow-lg border ${isSelected ? 'bg-[#6B0F2B] border-white' : 'bg-[#801831] border-white/20'}`}>
          <div className="flex items-center gap-1">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="white">
              <path d="M12 .587l3.668 7.431 8.2 1.192-5.934 5.787 1.4 8.168L12 18.896l-7.334 3.857 1.4-8.168L.132 9.21l8.2-1.192L12 .587z" />
            </svg>
            <span className="text-white text-[10px] font-medium leading-none">
              {accAvgRating > 0 ? accAvgRating.toFixed(1) : '—'}
            </span>
          </div>
          {showName && (
            <>
              <div className="w-[1px] h-3 bg-white/30" />
              <span className="text-white text-[10px] font-bold whitespace-nowrap leading-none">
                {acc.accommodationName.split(' ')[0]}
              </span>
            </>
          )}
        </div>
        {/* Triangle pointer (downward) */}
        <div className={`w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[10px] transition-colors duration-300 ${isSelected ? 'border-t-[#6B0F2B]' : 'border-t-[#801831]'}`} />
      </div>
    </Marker>
  )
})

export default function AccommodationMap({
  accommodations,
  onCardClick,
  centeredAccommodation,
  favorites = new Set(),
  onToggleFavorite,
}: AccommodationMapProps) {
  const [selectedPin, setSelectedPin] = useState<AccommodationPin | null>(null)
  const [uplbSelected, setUplbSelected] = useState(false)
  const [travelMode, setTravelMode] = useState<TravelMode>('walking')
  const [routeGeoJSON, setRouteGeoJSON] = useState<GeoJSON.FeatureCollection | null>(null)
  const [loadingRoute, setLoadingRoute] = useState(false)
  const [liveDurationMin, setLiveDurationMin] = useState<number | null>(null)
  const mapRef = useRef<MapRef>(null)

  const initialZoom = centeredAccommodation ? 16 : 15
  const [currentZoom, setCurrentZoom] = useState(initialZoom)
  const showNames = currentZoom >= NAME_ZOOM_THRESHOLD
  const pinScale = scaleForZoom(currentZoom)

  const initialView = centeredAccommodation
    ? { longitude: centeredAccommodation.longitude, latitude: centeredAccommodation.latitude, zoom: 16, pitch: CENTERED_PITCH, bearing: 0 }
    : { longitude: UPLB.longitude, latitude: UPLB.latitude, zoom: 15, pitch: DEFAULT_PITCH, bearing: 0 }

  const handleZoom = useCallback(() => {
    const z = mapRef.current?.getZoom()
    if (typeof z !== 'number') return
    // Bucket to integer zoom so re-renders only fire when bucket changes
    const bucket = Math.round(z)
    setCurrentZoom((prev) => (prev === bucket ? prev : bucket))
  }, [])

  const handleMarkerSelect = useCallback((acc: AccommodationPin, isSelected: boolean) => {
    setUplbSelected(false)
    setSelectedPin(isSelected ? null : acc)
  }, [])

  const handleMapClick = useCallback(() => {
    setSelectedPin(null)
    setUplbSelected(false)
  }, [])

  const handleUplbOpen = useCallback(() => {
    setSelectedPin(null)
    setUplbSelected(true)
  }, [])

  const handleUplbClose = useCallback(() => {
    setUplbSelected(false)
  }, [])

  useEffect(() => {
    if (!selectedPin) return
    const stillVisible = accommodations.some(
      (a) => a.accommodationId === selectedPin.accommodationId
    )
    if (!stillVisible) setSelectedPin(null)
  }, [accommodations])

  useEffect(() => {
    if (!selectedPin) {
      setRouteGeoJSON(null)
      setLiveDurationMin(null)
      return
    }
    const fetchRoute = async () => {
      setLoadingRoute(true)
      setLiveDurationMin(null)
      try {
        const origin = `${selectedPin.longitude},${selectedPin.latitude}`
        const destination = `${UPLB.longitude},${UPLB.latitude}`
        const url = `https://api.mapbox.com/directions/v5/mapbox/${travelMode}/${origin};${destination}?geometries=geojson&access_token=${MAPBOX_TOKEN}`
        const res = await fetch(url)
        const data = await res.json()
        if (data.routes && data.routes.length > 0) {
          setRouteGeoJSON({
            type: 'FeatureCollection',
            features: [{ type: 'Feature', geometry: data.routes[0].geometry, properties: {} }],
          })
          const dur = data.routes[0].duration
          if (typeof dur === 'number') setLiveDurationMin(Math.round(dur / 60))
        }
      } catch (error) {
        console.error('Failed to fetch route:', error)
      } finally {
        setLoadingRoute(false)
      }
    }
    fetchRoute()
  }, [selectedPin, travelMode])

  const typeLabel = (type: string) => {
    if (type === 'on-campus') return 'On-Campus'
    if (type === 'off-campus') return 'Off-Campus'
    return 'Partner Housing'
  }

  const currentDistance = () => {
    if (!selectedPin) return null
    const stored =
      travelMode === 'walking' ? selectedPin.walkingDistance
      : travelMode === 'driving' ? selectedPin.drivingDistance
      : selectedPin.bikingDistance
    if (stored && stored > 0) return `${stored} min`
    if (liveDurationMin != null) return `${liveDurationMin} min`
    return loadingRoute ? '…' : null
  }

  const recenterToUPLB = () => {
    mapRef.current?.flyTo({
      center: [UPLB.longitude, UPLB.latitude],
      zoom: 15,
      pitch: 60,
      bearing: 0,
      duration: 1200,
    })
  }

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Map
        ref={mapRef}
        initialViewState={initialView}
        style={{ width: '100%', height: '100%' }}
        mapStyle={MAP_STYLE}
        mapboxAccessToken={MAPBOX_TOKEN}
        maxBounds={LOS_BANOS_BOUNDS}
        minZoom={MIN_ZOOM}
        maxPitch={DEFAULT_PITCH === 0 ? 0 : 85}
        reuseMaps
        onZoom={handleZoom}
        onClick={handleMapClick}
      >
        <NavigationControl position="top-right" />

        {/* Dev-only zoom badge */}
        {import.meta.env.DEV && (
          <div
            style={{
              position: 'absolute',
              top: 12,
              left: 12,
              zIndex: 500,
              background: 'rgba(0,0,0,0.7)',
              color: 'white',
              padding: '4px 10px',
              borderRadius: 6,
              fontSize: 11,
              fontFamily: 'monospace',
              pointerEvents: 'none',
            }}
          >
            zoom: {currentZoom} · scale: {pinScale.toFixed(2)}
          </div>
        )}

        {/* UPLB Pin */}
        <UPLBMarker
          selected={uplbSelected}
          onOpen={handleUplbOpen}
          onClose={handleUplbClose}
          compact={!showNames}
        />

        {/* Route Line */}
        {routeGeoJSON && (
          <Source id="route" type="geojson" data={routeGeoJSON}>
            <Layer {...routeLayerStyle(travelMode)} />
          </Source>
        )}


        {/* Accommodation Popup */}
        {selectedPin && (
          <Popup
            longitude={selectedPin.longitude}
            latitude={selectedPin.latitude}
            anchor="top"
            onClose={() => setSelectedPin(null)}
            closeButton={false}
            closeOnClick={false}
            maxWidth="300px"
            offset={[85, 5] as [number, number]}
            style={{ zIndex: 499 }}
          >
            <div
              className="font-sans overflow-hidden rounded-2xl bg-white shadow-2xl cursor-pointer"
              onClick={() => onCardClick(selectedPin)}
            >
              {/* Image / gradient header */}
              <div className="relative h-32 w-full overflow-hidden">
                {selectedPin.imageUrl ? (
                  <img
                    src={selectedPin.imageUrl}
                    alt={selectedPin.accommodationName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#710A2B] to-[#922b4a] p-4 flex items-end">
                    <span className="text-white/70 text-xs">UPLB Housing</span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-4 pt-3 relative">
                {onToggleFavorite && (
                  <button
                    className="absolute top-3 right-4 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation()
                      onToggleFavorite(selectedPin.accommodationId)
                    }}
                    title={favorites.has(selectedPin.accommodationId) ? 'Remove from favorites' : 'Add to favorites'}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke={favorites.has(selectedPin.accommodationId) ? '#710A2B' : 'currentColor'}
                      fill={favorites.has(selectedPin.accommodationId) ? '#710A2B' : 'none'}
                      className={`w-5 h-5 transition-all duration-200 ${favorites.has(selectedPin.accommodationId) ? 'scale-110' : 'text-gray-400 hover:text-red-500'}`}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                    </svg>
                  </button>
                )}

                <div className="mb-2">
                  <span className="inline-block bg-[#C69C3B] text-white text-[11px] px-3 py-1 rounded-full font-medium">
                    {typeLabel(selectedPin.accommodationType)}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-[#440D1D] leading-tight mb-0.5">
                  {selectedPin.accommodationName}
                </h3>
                <p className="text-xs text-gray-500 mb-2">📍 {selectedPin.accommodationLocation}</p>

                {/* Rating */}
                <div className="flex items-center gap-1 mb-3">
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        viewBox="0 0 24 24"
                        fill={i < Math.floor(getAvgRating(selectedPin)) ? '#C69C3B' : '#E5E7EB'}
                        className="w-3.5 h-3.5"
                      >
                        <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z" clipRule="evenodd" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-xs text-gray-500 font-medium">
                    {getAvgRating(selectedPin) > 0 ? getAvgRating(selectedPin).toFixed(1) : 'No rating'}
                  </span>
                </div>

                {/* Price */}
                <div className="flex items-baseline gap-1 mb-3">
                  <span className="text-xl font-extrabold text-[#C69C3B]">₱{selectedPin.minRent.toLocaleString()}</span>
                  <span className="text-xs text-gray-500">/ month</span>
                </div>

                {/* Amenities or walk distance fallback */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {selectedPin.amenities && selectedPin.amenities.length > 0
                    ? selectedPin.amenities.map(tag => (
                      <span key={tag} className="bg-[#F5EBEB] text-[#710A2B] text-[11px] px-3 py-1 rounded-full font-medium">{tag}</span>
                    ))
                    : <span className="text-[11px] text-gray-400">🚶 {selectedPin.walkingDistance > 0 ? selectedPin.walkingDistance : (travelMode === 'walking' && liveDurationMin != null ? liveDurationMin : '…')} min walk to campus</span>
                  }
                </div>

                <button className="w-full bg-[#710A2B] text-white text-sm font-semibold py-3 rounded-xl hover:bg-[#5a0822] transition duration-150 flex items-center justify-center gap-2">
                  View Room →
                </button>
              </div>
              <div className="border-t border-gray-100 h-1" />
            </div>
          </Popup>
        )}

        {/* Accommodation Pins */}
        {accommodations.map((acc) => (
          <AccommodationPinMarker
            key={acc.accommodationId}
            acc={acc}
            isSelected={selectedPin?.accommodationId === acc.accommodationId}
            showName={showNames}
            pinScale={pinScale}
            onSelect={handleMarkerSelect}
          />
        ))}
      </Map>

      {/* Travel Mode Toggle */}
      {selectedPin && (
        <div style={{
          position: 'absolute',
          bottom: '32px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '12px 20px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          zIndex: 9999,
        }}>
          <div style={{ marginRight: '8px', textAlign: 'center' }}>
            <p style={{ fontSize: '11px', color: '#9CA3AF', margin: '0 0 2px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>To UPLB</p>
            <p style={{ fontSize: '14px', fontWeight: '700', color: '#6B0F2B', margin: 0 }}>
              {currentDistance()}
            </p>
          </div>
          <div style={{ width: '1px', height: '36px', backgroundColor: '#E5E7EB' }} />
          {([
            { mode: 'walking' as TravelMode, icon: '🚶', label: 'Walk' },
            { mode: 'driving' as TravelMode, icon: '🚗', label: 'Drive' },
            { mode: 'cycling' as TravelMode, icon: '🚲', label: 'Bike' },
          ]).map(({ mode, icon, label }) => (
            <button
              key={mode}
              onClick={() => setTravelMode(mode)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '2px',
                padding: '8px 16px',
                borderRadius: '10px',
                border: 'none',
                cursor: 'pointer',
                background: travelMode === mode ? 'linear-gradient(135deg, #6B0F2B, #3D0718)' : '#F3F4F6',
                color: travelMode === mode ? 'white' : '#6B7280',
                fontSize: '18px',
                transition: 'all 0.2s ease',
              }}
            >
              <span>{icon}</span>
              <span style={{ fontSize: '11px', fontWeight: '600' }}>{label}</span>
            </button>
          ))}
        </div>
      )}

      {/* ─── Recenter to UPLB Button ─────────────────────────────────── */}
      <button
        onClick={recenterToUPLB}
        title="Recenter to UPLB"
        style={{
          position: 'absolute',
          bottom: '32px',
          right: '16px',
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          border: 'none',
          cursor: 'pointer',
          background: 'linear-gradient(135deg, #710A2B, #3D0718)',
          boxShadow: '0 4px 16px rgba(113,10,43,0.35)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          transition: 'transform 0.15s ease, box-shadow 0.15s ease',
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.08)'
            ; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 6px 20px rgba(113,10,43,0.5)'
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'
            ; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 16px rgba(113,10,43,0.35)'
        }}
        onMouseDown={e => (e.currentTarget as HTMLButtonElement).style.transform = 'scale(0.95)'}
        onMouseUp={e => (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.08)'}
      >
        <svg width="38" height="38" viewBox="-2 -2 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="9" stroke="white" strokeWidth="1.8" />
          <circle cx="12" cy="12" r="3" stroke="white" strokeWidth="1.8" />
          <line x1="12" y1="0" x2="12" y2="3" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
          <line x1="12" y1="21" x2="12" y2="24" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
          <line x1="0" y1="12" x2="3" y2="12" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
          <line x1="21" y1="12" x2="24" y2="12" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  )
}
