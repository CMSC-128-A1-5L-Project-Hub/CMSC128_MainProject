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
    rating: number
    amenities?: string[]
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
        {/* <Marker
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
        )} */}

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
            offset={[85, 5]}
            style={{ zIndex: 498 }} 
          >
            {/* Main Container */}
            <div 
              className="font-sans overflow-hidden rounded-2xl bg-white shadow-2xl cursor-pointer" 
              onClick={() => onCardClick(selectedPin)}
            >
              {/* 1. Image/Header Section */}
              <div className="relative h-32 w-full overflow-hidden">
                {selectedPin.imageUrl ? (
                  <img 
                    src={selectedPin.imageUrl} 
                    alt={selectedPin.accommodationName} 
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  /* Placeholder gradient like in the image if no image exists */
                  <div className="w-full h-full bg-gradient-to-br from-[#710A2B] to-[#922b4a] p-4 flex items-end">
                    <span className="text-white/70 text-xs">UPLB Housing</span>
                  </div>
                )}
              </div>

              {/* 2. Content Section */}
              <div className="p-4 pt-3 relative">
                
                {/* Heart Icon - Top Right */}
                <button className="absolute top-3 right-4 text-gray-400 hover:text-red-500 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                  </svg>
                </button>

                {/* 'On Campus' Tag - using type from data */}
                <div className="mb-2">
                  <span className="inline-block bg-[#C69C3B] text-white text-[11px] px-3 py-1 rounded-full font-medium capitalize">
                    {selectedPin.accommodationType.replace('-', ' ')}
                  </span>
                </div>

                {/* Title & Subtitle */}
                <h3 className="text-lg font-bold text-[#440D1D] leading-tight mb-0.5">
                  {selectedPin.accommodationName}
                </h3>
                {/* Hardcoded subtitle part to match image, combined with data */}
                <p className="text-xs text-gray-500 mb-2">
                  Studio · 22 m² · {selectedPin.accommodationLocation}
                </p>

                {/* Rating Row - Dynamic based on selectedPin.rating */}
                <div className="flex items-center gap-1 mb-3">
                  <div className="flex items-center gap-0.5 text-[#C69C3B]">
                    {[...Array(5)].map((_, i) => (
                      <svg 
                        key={i} 
                        xmlns="http://www.w3.org/2000/svg" 
                        viewBox="0 0 24 24" 
                        fill={i < Math.floor(selectedPin.rating || 0) ? "currentColor" : "#E5E7EB"} 
                        className="w-3.5 h-3.5"
                      >
                        <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z" clipRule="evenodd" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-xs text-gray-500 font-medium">
                    {selectedPin.rating ? selectedPin.rating.toFixed(1) : '0.0'}
                  </span>
                </div>

                {/* Price */}
                <div className="flex items-baseline gap-1 mb-3">
                  <span className="text-xl font-extrabold text-[#C69C3B]">
                    ₱{selectedPin.minRent.toLocaleString()}
                  </span>
                  <span className="text-xs text-gray-500">/ month</span>
                </div>

                {/* Amenities Tags */}
                <div className="flex flex-wrap gap-1.5 mb-5">
                  {selectedPin.amenities?.map(tag => (
                    <span 
                      key={tag} 
                      className="bg-[#F5EBEB] text-[#710A2B] text-[11px] px-3 py-1 rounded-full font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                  
                  {/* Fallback if no amenities are listed */}
                  {(!selectedPin.amenities || selectedPin.amenities.length === 0) && (
                    <span className="text-[11px] text-gray-400">No amenities listed</span>
                  )}
                </div>

                {/* Button */}
                <button className="w-full bg-[#710A2B] text-white text-sm font-semibold py-3 rounded-xl hover:bg-[#5a0822] transition duration-150 flex items-center justify-center gap-2">
                  View Room →
                </button>
              </div>
              
              {/* Bottom decorative line */}
              <div className="border-t border-gray-100 mt-2 h-1"></div>
            </div>
          </Popup>
        )}

        {/* Accommodation Pins */}
        {accommodations.map((acc) => {
          const isSelected = selectedPin?.accommodationId === acc.accommodationId;

          return (
            <Marker
              key={acc.accommodationId}
              longitude={acc.longitude}
              latitude={acc.latitude}
              style={{ zIndex: isSelected ? 499 : 1 }} 
              onClick={(e) => {
                e.originalEvent.stopPropagation();

                if (isSelected) {
                  setSelectedPin(null);
                } else {
                  setSelectedPin(acc);
                  setSelectedUPLB(false);
                }
              }}
            >
              <div 
                className="relative flex flex-col items-center cursor-pointer transition-all duration-300 ease-in-out"
                style={{
                  transform: isSelected ? 'scale(1.25) translateY(-5px)' : 'scale(1)',
                }}
              >
                {/* Top Capsule */}
                <div className={`
                  h-auto min-w-[70px] px-3 py-1.5 rounded-full flex flex-row items-center justify-center gap-1.5 shadow-lg border 
                  ${isSelected ? 'bg-[#6B0F2B] border-white' : 'bg-[#801831] border-white/20'}
                `}>
                  
                  {/* White Star and Rating */}
                  <div className="flex items-center gap-1">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 .587l3.668 7.431 8.2 1.192-5.934 5.787 1.4 8.168L12 18.896l-7.334 3.857 1.4-8.168L.132 9.21l8.2-1.192L12 .587z"/>
                    </svg>
                    <span className="text-white text-[10px] font-medium leading-none">
                      {acc.rating || '4.5'}
                    </span>
                  </div>

                  <div className="w-[1px] h-3 bg-white/30" />

                  {/* Dorm Name */}
                  <span className="text-white text-[10px] font-bold whitespace-nowrap leading-none">
                    {acc.accommodationName.split(' ')[0]}
                  </span>
                </div>

                {/* Triangle Pointer */}
                <div 
                  className={`w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent transition-all duration-300
                    ${isSelected 
                      ? 'border-t-[10px] border-t-[#6B0F2B] -mt-[1px]'
                      : 'border-b-[10px] border-b-[#801831] -mb-[1px]'
                    }
                  `}
                />
              </div>
            </Marker>
          );
        })}
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
          zIndex: 9999,
        }}>
          <div style={{ marginRight: '8px', textAlign: 'center' }}>
            <p style={{ fontSize: '11px', color: '#9CA3AF', margin: '0 0 2px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>To UPLB</p>
            <p style={{ fontSize: '14px', fontWeight: '700', color: "#6B0F2B", margin: 0 }}>
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
                background: travelMode === mode 
                ? 'linear-gradient(135deg, #6B0F2B, #3D0718)' 
                : '#F3F4F6',
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

