import { useRef, useState, useCallback } from 'react'
import Map, { Marker, NavigationControl } from 'react-map-gl'
import type { MapRef } from 'react-map-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { useAccommodationFormStore } from '../stores/useAccommodationFormStore'
import { UPLB } from '../constants/uplb'
import { GraduationCap, MapPin, Crosshair } from 'lucide-react'

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN

async function reverseGeocode(lat: number, lng: number): Promise<string> {
  const res = await fetch(
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_TOKEN}&limit=1`
  )
  const data = await res.json()
  return data.features?.[0]?.place_name ?? `${lat.toFixed(5)}, ${lng.toFixed(5)}`
}

async function forwardGeocode(query: string) {
  const proximity = `${UPLB.longitude},${UPLB.latitude}`
  const res = await fetch(
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${MAPBOX_TOKEN}&proximity=${proximity}&limit=1`
  )
  const data = await res.json()
  const feature = data.features?.[0]
  if (!feature) return null
  const [lng, lat] = feature.center
  return { lat, lng, place_name: feature.place_name }
}

export default function LocationPickerMap() {
  const mapRef = useRef<MapRef | null>(null)
  const { accommodationLocation, latitude, longitude, setLocation } = useAccommodationFormStore()

  const [searchInput, setSearchInput] = useState(accommodationLocation)
  const [pinLat, setPinLat] = useState<number>(latitude ?? UPLB.latitude)
  const [pinLng, setPinLng] = useState<number>(longitude ?? UPLB.longitude)
  const [isPinPlaced, setIsPinPlaced] = useState(latitude !== null)
  const [searching, setSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const recenterToUPLB = () => {
    setPinLat(UPLB.latitude)
    setPinLng(UPLB.longitude)
    setIsPinPlaced(false)
    setSearchInput('')
    setLocation('', UPLB.latitude, UPLB.longitude)
    mapRef.current?.flyTo({ center: [UPLB.longitude, UPLB.latitude], zoom: 14, duration: 800 })
  }

  const handleMapClick = useCallback(async (e: any) => {
    const { lat, lng } = e.lngLat
    setPinLat(lat)
    setPinLng(lng)
    setIsPinPlaced(true)
    setError(null)
    try {
      const address = await reverseGeocode(lat, lng)
      setSearchInput(address)
      setLocation(address, lat, lng)
    } catch {
      setError('Could not fetch address for this location.')
    }
  }, [setLocation])

  const handleMarkerDragEnd = useCallback(async (e: any) => {
    const lat = e.lngLat.lat
    const lng = e.lngLat.lng
    setPinLat(lat)
    setPinLng(lng)
    setError(null)
    try {
      const address = await reverseGeocode(lat, lng)
      setSearchInput(address)
      setLocation(address, lat, lng)
    } catch {
      setError('Could not fetch address for this location.')
    }
  }, [setLocation])

  const handleSearch = useCallback(async () => {
    if (!searchInput.trim()) return
    setSearching(true)
    setError(null)
    try {
      const result = await forwardGeocode(searchInput)
      if (!result) {
        setError('Location not found. Try a more specific address.')
        return
      }
      setPinLat(result.lat)
      setPinLng(result.lng)
      setIsPinPlaced(true)
      setSearchInput(result.place_name)
      setLocation(result.place_name, result.lat, result.lng)
      mapRef.current?.flyTo({ center: [result.lng, result.lat], zoom: 16, duration: 800 })
    } catch {
      setError('Search failed. Please try again.')
    } finally {
      setSearching(false)
    }
  }, [searchInput, setLocation])

  return (
    <div className="flex flex-col gap-2 w-full">
      {/* Search Bar */}
      <div className="flex gap-2">
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleSearch())}
          placeholder="Type address and press Enter or Search..."
          className="flex-1 border border-[#e5cfd4] rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#7a001f]/30"
        />
        <button
          type="button"
          onClick={handleSearch}
          disabled={searching}
          className="bg-[#7a001f] hover:bg-[#6B0F2B] text-white text-sm font-medium px-4 py-2 rounded-xl disabled:opacity-50 transition"
        >
          {searching ? 'Searching...' : 'Search'}
        </button>
      </div>

      {error && <p className="text-red-500 text-xs">{error}</p>}

      <div className="flex items-center justify-between">
        <p className="text-[10px] text-gray-400">
          Search an address or click anywhere on the map. Drag the pin to fine-tune.
        </p>
        <button
          type="button"
          onClick={recenterToUPLB}
          className="flex items-center gap-1.5 text-[10px] font-semibold text-[#7a001f] hover:text-[#6B0F2B] px-3 py-1.5 rounded-lg border border-[#e5cfd4] hover:border-[#7a001f] transition-all"
          title="Recenter to UPLB"
        >
          <Crosshair size={12} />
          Recenter
        </button>
      </div>

      {/* Map */}
      <div className="w-full h-[250px] rounded-xl overflow-hidden border border-[#e5cfd4]">
        <Map
          ref={mapRef}
          initialViewState={{ longitude: pinLng, latitude: pinLat, zoom: isPinPlaced ? 16 : 14, pitch: 40 }}
          mapStyle="mapbox://styles/mapbox/standard"
          mapboxAccessToken={MAPBOX_TOKEN}
          style={{ width: '100%', height: '100%' }}
          onClick={handleMapClick}
          cursor="crosshair"
        >
          <NavigationControl position="top-right" />

          {/* UPLB marker */}
          <Marker longitude={UPLB.longitude} latitude={UPLB.latitude} anchor="bottom">
            <div className="bg-[#6B0F2B] w-7 h-7 rounded-full flex items-center justify-center border-2 border-white shadow-md">
              <GraduationCap size={14} className="text-white" />
            </div>
          </Marker>

          {/* Draggable pin */}
          {isPinPlaced && (
            <Marker
              longitude={pinLng}
              latitude={pinLat}
              anchor="bottom"
              draggable
              onDragEnd={handleMarkerDragEnd}
            >
              <div className="flex flex-col items-center cursor-grab active:cursor-grabbing">
                <div className="bg-[#7a001f] w-9 h-9 rounded-full flex items-center justify-center border-[3px] border-white shadow-lg">
                  <MapPin size={16} className="text-white" fill="white" />
                </div>
                <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-t-[8px] border-l-transparent border-r-transparent border-t-[#7a001f] -mt-0.5" />
              </div>
            </Marker>
          )}
        </Map>
      </div>

      {/* Confirmation */}
      {isPinPlaced && (
        <div className="flex items-center gap-2 text-green-600 text-xs font-medium">
          <span className="w-2 h-2 bg-green-500 rounded-full inline-block" />
          Location confirmed — coordinates saved
        </div>
      )}
    </div>
  )
}