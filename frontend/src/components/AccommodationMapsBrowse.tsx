import { useEffect, useState } from "react";
import Map, { Marker, Popup, NavigationControl, Source, Layer } from 'react-map-gl'
import type { LayerProps } from 'react-map-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { UPLB } from '../constants/uplb'
import DormCard from "./DormCardBrowse"
import { Star } from 'lucide-react';
import UPLBMarker from './UPLBMarker'

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
    rating?: string
    price: number
    minPrice: number
    maxPrice: number
}

type TravelMode = 'walking' | 'driving' | 'cycling'

interface AccommodationMapProps {
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
    const [travelMode, setTravelMode] = useState<TravelMode>('walking') // Stores the transport type to compute the route
    const [routeGeoJSON, setRouteGeoJSON] = useState<GeoJSON.FeatureCollection | null>(null) // Stores the route from MapBox 
    const [loadingRoute, setLoadingRoute] = useState(false) // Checks is we are loading a route

    const dormValues = { subtitle: 'Hall', meta: 'Studio · 22 m² · On-campus', price: 3200, priceUnit: '/ month', 'featured chips': ["WiFi", "Furnished", "Air-con"], rating: "4.9" }
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
                <UPLBMarker onSelect={() => setSelectedPin(null)} />

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

                        <div className="relative flex flex-col items-center w-fit">

                            <div className="relative flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-br from-[#6B0F2B] to-[#9E2040] shadow-md overflow-hidden z-10">


                                <div className="absolute inset-0 z-0" style={{ background: "linear-gradient(135deg, transparent 40%, rgba(42,4,16,0.55) 100%)", }} />


                                <div className="relative flex items-center gap-1 z-10">
                                    {acc.rating === "6" ? (
                                        <>
                                            {/* Unrated icon (you can swap this if you want) */}
                                            <span className="text-white text-[11px]">☆</span>

                                            <div className="flex gap-1 items-center text-white">
                                                <span className="text-sm font-medium tracking-tight">
                                                    {acc.accommodationName}
                                                </span>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <Star size={12} fill="white" stroke="white" strokeWidth={1} />

                                            <div className="flex gap-1 items-center text-white">
                                                <span className="text-sm font-bold tracking-tight">
                                                    {acc.rating == "0" ? "" : acc.rating}
                                                </span>
                                                <span className="text-sm font-medium tracking-tight">
                                                    {acc.accommodationName}
                                                </span>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>


                            <div className="w-0 h-0 border-l-[10px] border-r-[10px] border-t-[14px] border-l-transparent border-r-transparent border-t-[#9E2040] -mt-1 z-0" />
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
                        closeButton={true}
                        closeOnClick={false}
                        maxWidth="300px"
                        offset={[85, 5] as [number, number]}
                        style={{ zIndex: 498 }}
                        className="no-bg-popup"
                    >


                        <Content selectedPin={selectedPin} onCardClick={onCardClick} />
                        {/* <div className="w-full flex items-center justify-center">
                            <DormCard {...{ ...{ name: selectedPin.accommodationName, subtitle: selectedPin.accommodationLocation, meta: selectedPin.accommodationType, price: selectedPin.price ?? 3200, minPrice: selectedPin.minPrice, maxPrice: selectedPin.maxPrice, priceUnit: '/ month', 'featured chips': ["WiFi", "Furnished", "Air-con"], rating: selectedPin.rating }, ...{ isSmall: true } }} verified onView={() => { onCardClick(selectedPin) }} />
                        </div> */}

                    </Popup>
                )}
            </Map>

            {/* Travel Mode Toggle — only visible when a pin is selected */}
            {false && (
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
        </div>
    )
}

type ContentProps = {
    selectedPin: AccommodationPin;
    onCardClick: (selectedPin: AccommodationPin) => void;
};

function Content({ selectedPin, onCardClick }: ContentProps) {
    const typeLabel = (type: string) => {
        if (type === 'on-campus') return 'On-Campus'
        if (type === 'off-campus') return 'Off-Campus'
        return 'Partner Housing'
    }

    return (
        <div
            className="flex items-stretch w-[320px] bg-white rounded-lg shadow-md overflow-hidden cursor-pointer"
            onClick={() => onCardClick(selectedPin)}
        >
            {/* Left Image */}
            <div className="w-3 flex-shrink-0 bg-gradient-to-b from-[#710A2B] to-[#922b4a]" />

            {/* Right Content */}
            <div className="flex-1 p-2.5 relative">

                {/* <button className="absolute top-2 right-2 text-gray-400 hover:text-red-500">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                    </svg>
                </button> */}

                {/* Type */}
                <span className="inline-block bg-[#C69C3B] text-white text-[9px] px-2 py-0.5 rounded-full mb-1">
                    {typeLabel(selectedPin.accommodationType)}
                </span>

                {/* Title */}
                <h3 className="text-xs font-semibold text-[#440D1D] leading-tight line-clamp-1">
                    {selectedPin.accommodationName}
                </h3>

                {/* Location */}
                <p className="text-[10px] text-gray-500 truncate mb-1">
                    📍 {selectedPin.accommodationLocation}
                </p>

                {/* Rating */}
                <div className="flex items-center gap-1 mb-1">
                    <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                            <svg
                                key={i}
                                viewBox="0 0 24 24"
                                fill={i < Math.floor(Number(selectedPin.rating) === 6 ? 0 : Number(selectedPin.rating)) ? '#C69C3B' : '#E5E7EB'}
                                className="w-2.5 h-2.5"
                            >
                                <path d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z" />
                            </svg>
                        ))}
                    </div>
                    <span className="text-[10px] text-gray-500">
                        {selectedPin.rating !== "6" ? Number(selectedPin.rating).toFixed(1) : 'No rating'}
                    </span>
                </div>

                {/* Bottom Row */}
                <div className="flex items-center justify-between mt-1">
                    <span className="text-sm font-bold text-[#C69C3B]">
                        ₱{selectedPin.minRent.toLocaleString()}
                    </span>

                    <button className="bg-[#710A2B] text-white text-[10px] px-2.5 py-1 rounded-md hover:bg-[#5a0822]">
                        View
                    </button>
                </div>
            </div>
        </div>
    );
}