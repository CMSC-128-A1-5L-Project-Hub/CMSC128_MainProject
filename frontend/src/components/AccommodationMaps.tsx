import { useEffect, useState } from "react";
import Map, { Marker, Popup, NavigationControl, Source, Layer} from 'react-map-gl'
import type { LayerProps } from 'react-map-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { UPLB } from '../constants/uplb'

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN

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
}

type TravelMode = 'walking' | 'driving' | 'cycling'

interface AccommodationMapProps{
    accommodations: AccommodationPin[]
    onCardClick: (accommodation: AccommodationPin) => void 
    // If provided, map centers on this accommodation (when coming from "View Location")
    centeredAccommodation?: AccommodationPin | null
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

export default function AccommodationMap({
  accommodations,
  onCardClick,
  centeredAccommodation,
}: AccommodationMapProps) {
  const [selectedPin, setSelectedPin] = useState<AccommodationPin | null>(null) // Stores currently accommodation selected 
  const [selectedUPLB, setSelectedUPLB] = useState(false) // IS UPLB marker selected?
  const [travelMode, setTravelMode] = useState<TravelMode>('walking') // Stores the transport type to compute the route
  const [routeGeoJSON, setRouteGeoJSON] = useState<GeoJSON.FeatureCollection | null>(null) // Stores the route from MapBox 
  const [loadingRoute, setLoadingRoute] = useState(false) // Checks is we are loading a route

  // Center on specific accommodation if provided, otherwise center on UPLB area
    const initialView = centeredAccommodation
    ? { longitude: centeredAccommodation.longitude, latitude: centeredAccommodation.latitude, zoom: 16, pitch: 45, bearing: 0 }
    : { longitude: UPLB.longitude, latitude: UPLB.latitude, zoom: 15, pitch: 60, bearing: 0 }

  // Fetch route whenever selected pin or travel mode changes
  useEffect(() => {
    if (!selectedPin) { 
      setRouteGeoJSON(null) // Deselecting pin causes the path from that destination to UPLB disappear
      return
    }

    // Request directions to MapBox
    const fetchRoute = async () => {
      setLoadingRoute(true) // Route request has started, for loading UI
      try {
        const origin = `${selectedPin.longitude},${selectedPin.latitude}`
        const destination = `${UPLB.longitude},${UPLB.latitude}`
        //sends a request to mapbox API
        const url = `https://api.mapbox.com/directions/v5/mapbox/${travelMode}/${origin};${destination}?geometries=geojson&access_token=${MAPBOX_TOKEN}`
        const res = await fetch(url)
        const data = await res.json()
        // validates that at least one route has been provided by mapbox
        if (data.routes && data.routes.length > 0) {
            // converts the mapbox route para ma-drawing 'yung route line
          setRouteGeoJSON({
            type: 'FeatureCollection',
            features: [{ type: 'Feature', geometry: data.routes[0].geometry, properties: {} }],
          })
        }
      } catch (error) {
        console.error('Failed to fetch route:', error)
      } finally {
        setLoadingRoute(false)
      }
    }

    fetchRoute()
  }, [selectedPin, travelMode])  // every updates triggers the function to re-run it

  const typeLabel = (type: string) => {
    if (type === 'on-campus') return 'On-Campus'
    if (type === 'off-campus') return 'Off-Campus'
    return 'Partner Housing'
  }

  const pinColor = (restriction: string) => {
    if (restriction === 'male-only') return '#3b82f6'
    if (restriction === 'female-only') return '#ec4899'
    return '#10b981' //for coed
  }

  const modeColor = (mode: TravelMode) => {
    if (mode === 'walking') return '#10b981'
    if (mode === 'driving') return '#3b82f6'
    return '#f59e0b' // For biking
  }

  const currentDistance = () => {
    if (!selectedPin) return null
    if (travelMode === 'walking') return `${selectedPin.walkingDistance} min`
    if (travelMode === 'driving') return `${selectedPin.drivingDistance} min`
    return `${selectedPin.bikingDistance} min`
  }

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Map
        initialViewState={initialView}
        style={{ width: '100%', height: '100%' }}
        mapStyle="mapbox://styles/mapbox/standard"
        mapboxAccessToken={MAPBOX_TOKEN}
      >
        <NavigationControl position="top-right" />

        {/* Route Line */}
        {routeGeoJSON && (
          <Source id="route" type="geojson" data={routeGeoJSON}>
            <Layer {...routeLayerStyle(travelMode)} />
          </Source>
        )}

        {/* UPLB Pin */}
        <Marker
          longitude={UPLB.longitude}
          latitude={UPLB.latitude}
          anchor="bottom"
          onClick={(e) => {
            e.originalEvent.stopPropagation()
            setSelectedUPLB(true)
            setSelectedPin(null)
          }}
        >
          <div style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{
              backgroundColor: '#7C3AED',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
              border: '2px solid white',
              fontSize: '20px',
            }}>🎓</div>
            <div style={{ width: 0, height: 0, borderLeft: '6px solid transparent', borderRight: '6px solid transparent', borderTop: '8px solid #7C3AED' }} />
          </div>
        </Marker>

        {selectedUPLB && (
          <Popup longitude={UPLB.longitude} latitude={UPLB.latitude} anchor="top" onClose={() => setSelectedUPLB(false)} closeButton closeOnClick={false} maxWidth="220px">
            <div style={{ fontFamily: 'sans-serif', padding: '4px' }}>
              <p style={{ fontWeight: 'bold', fontSize: '14px', margin: '0 0 4px 0' }}>🎓 {UPLB.name}</p>
              <p style={{ fontSize: '12px', color: '#6B7280', margin: 0 }}>University of the Philippines Los Baños</p>
            </div>
          </Popup>
        )}

        {/* Accommodation Pins */}
        {accommodations.map((acc) => (
          <Marker
            key={acc.accommodationId}
            longitude={acc.longitude}
            latitude={acc.latitude}
            anchor="bottom"
            onClick={(e) => {
              e.originalEvent.stopPropagation()
              setSelectedPin(acc)
              setSelectedUPLB(false)
            }}
          >
            <div style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{
                backgroundColor: pinColor(acc.tenantRestriction),
                borderRadius: '50%',
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid white',
                fontSize: '18px',
                boxShadow: selectedPin?.accommodationId === acc.accommodationId
                  ? `0 0 0 3px white, 0 0 0 5px ${pinColor(acc.tenantRestriction)}`
                  : '0 2px 8px rgba(0,0,0,0.3)',
                transform: selectedPin?.accommodationId === acc.accommodationId ? 'scale(1.2)' : 'scale(1)',
                transition: 'all 0.2s ease',
              }}>🏠</div>
              <div style={{ width: 0, height: 0, borderLeft: '6px solid transparent', borderRight: '6px solid transparent', borderTop: `8px solid ${pinColor(acc.tenantRestriction)}` }} />
            </div>
          </Marker>
        ))}

        {/* Accommodation Popup */}
        {selectedPin && (
          <Popup
            longitude={selectedPin.longitude}
            latitude={selectedPin.latitude}
            anchor="top"
            onClose={() => setSelectedPin(null)}
            closeButton
            closeOnClick={false}
            maxWidth="290px"
          >
            <div style={{ fontFamily: 'sans-serif', padding: '4px', cursor: 'pointer' }} onClick={() => onCardClick(selectedPin)}>
              {selectedPin.imageUrl && (
                <img src={selectedPin.imageUrl} alt={selectedPin.accommodationName} style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '8px', marginBottom: '8px' }} />
              )}
              <p style={{ fontWeight: 'bold', fontSize: '14px', margin: '0 0 4px 0' }}>{selectedPin.accommodationName}</p>
              <p style={{ fontSize: '12px', color: '#6B7280', margin: '0 0 6px 0' }}>📍 {selectedPin.accommodationLocation}</p>
              <p style={{ fontSize: '12px', color: '#6B7280', margin: '0 0 2px 0' }}>🚶 {selectedPin.walkingDistance} min walk</p>
              <p style={{ fontSize: '12px', color: '#6B7280', margin: '0 0 2px 0' }}>🚗 {selectedPin.drivingDistance} min by vehicle</p>
              <p style={{ fontSize: '12px', color: '#6B7280', margin: '0 0 6px 0' }}>🚲 {selectedPin.bikingDistance} min by bike</p>
              <p style={{ fontSize: '12px', color: '#374151', margin: '0 0 6px 0' }}>💰 ₱{selectedPin.minRent.toLocaleString()} – ₱{selectedPin.maxRent.toLocaleString()} / month</p>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                <span style={{ backgroundColor: '#EFF6FF', color: '#1D4ED8', fontSize: '11px', padding: '2px 8px', borderRadius: '999px' }}>{typeLabel(selectedPin.accommodationType)}</span>
                <span style={{ backgroundColor: '#F0FDF4', color: '#15803D', fontSize: '11px', padding: '2px 8px', borderRadius: '999px' }}>{selectedPin.tenantRestriction}</span>
              </div>
              <p style={{ fontSize: '12px', color: '#374151', marginTop: '6px' }}>👥 Capacity: {selectedPin.accommodationCapacity}</p>
              <p style={{ fontSize: '12px', color: '#6366F1', marginTop: '6px', fontWeight: '600' }}>Click to view details →</p>
            </div>
          </Popup>
        )}
      </Map>

      {/* Travel Mode Toggle — only visible when a pin is selected */}
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
          zIndex: 10,
        }}>
          <div style={{ marginRight: '8px', textAlign: 'center' }}>
            <p style={{ fontSize: '11px', color: '#9CA3AF', margin: '0 0 2px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>To UPLB</p>
            <p style={{ fontSize: '14px', fontWeight: '700', color: modeColor(travelMode), margin: 0 }}>
              {loadingRoute ? 'Loading...' : currentDistance()}
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
                backgroundColor: travelMode === mode ? modeColor(mode) : '#F3F4F6',
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
    </div>
  )
}

