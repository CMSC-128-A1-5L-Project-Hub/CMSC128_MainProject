// src/pages/MapPage.tsx
// Route: /map              -> centered on UPLB (browse all)
// Route: /map?center=:id   -> centered on specific accommodation (from "View Location" button)
// Filters are passed via URL query params so they persist from the browse/cards page
import { useState, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import AccommodationMap, { type AccommodationPin } from '../components/AccommodationMaps'
import { api } from '../api/axios'

const fetchAccommodations = async (): Promise<AccommodationPin[]> => {
  const res = await api.get('/accommodations')
  const body = res.data
  // serialize() wraps in { data: ... }, and index() adds its own { message, data } envelope
  const list: any[] = body?.data?.data ?? body?.data ?? body ?? []
  return list.map((acc: any) => {
    const rents = (acc.rooms ?? []).map((r: any) => Number(r.roomRent))
    const stayTypes = [...new Set<string>((acc.rooms ?? []).map((r: any) => r.roomStayType))]
    const stayType =
      stayTypes.length >= 2 ? 'both' : (stayTypes[0] as 'transient' | 'non_transient') ?? 'both'
    return {
      accommodationId: acc.id,
      accommodationName: acc.accommodationName,
      accommodationLocation: acc.accommodationLocation,
      accommodationType: acc.accommodationType,
      accommodationCapacity: acc.accommodationCapacity,
      tenantRestriction: acc.tenantRestriction,
      latitude: acc.latitude,
      longitude: acc.longitude,
      walkingDistance: acc.walkingDistance ?? 0,
      bikingDistance: acc.bikingDistance ?? 0,
      drivingDistance: acc.drivingDistance ?? 0,
      minRent: rents.length ? Math.min(...rents) : 0,
      maxRent: rents.length ? Math.max(...rents) : 0,
      stayType,
      imageUrl: acc.primaryImageUrl ?? undefined,
    } satisfies AccommodationPin
  })
}

const DEFAULT_MIN_RENT = 500 // convert this to search for the lowest and highest rent from the DB next time.
const DEFAULT_MAX_RENT = 15000

export default function MapPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const { data: accommodations = [], isLoading, isError } = useQuery({
    queryKey: ['accommodations'],
    queryFn: fetchAccommodations,
  })

  // ─── URL-driven draft filter values ──────────────────────────────────────
  const search = searchParams.get('search') ?? ''
  const type = searchParams.get('type') ?? 'all'
  const restriction = searchParams.get('restriction') ?? 'all'
  const minRent = Number(searchParams.get('min_rent') ?? DEFAULT_MIN_RENT)
  const maxRent = Number(searchParams.get('max_rent') ?? DEFAULT_MAX_RENT)
  const maxWalk = Number(searchParams.get('max_walk') ?? 60)
  const minCapacity = Number(searchParams.get('min_capacity') ?? 0)
  const stayType = searchParams.get('stay_type') ?? 'all'

  // ─── Local UI state ────────────────────────────────────────────────────────
  const [minRating, setMinRating] = useState(0)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [availableTags, setAvailableTags] = useState(['WiFi', 'Furnished', 'Air-con', 'Laundry', 'Study-Friendly', 'Transient'])
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  // Staged: filters only apply to map when "Apply Filters" is clicked
  const [appliedFilters, setAppliedFilters] = useState({
    type: 'all',
    restriction: 'all',
    minRent: DEFAULT_MIN_RENT,
    maxRent: DEFAULT_MAX_RENT,
    maxWalk: 60,
    minCapacity: 0,
    stayType: 'all',
    rating: 0,
    tags: [] as string[],
  })

  const centerId = searchParams.get('center')
  const centeredAccommodation = useMemo(
    () => (centerId ? accommodations.find((a) => a.accommodationId === Number(centerId)) ?? null : null),
    [centerId, accommodations]
  )

  // ─── Filter helpers ────────────────────────────────────────────────────────
  const updateFilter = (key: string, value: string | number) => {
    const params = new URLSearchParams(searchParams)
    if (value === '' || value === 0 || value === 'all') {
      params.delete(key)
    } else {
      params.set(key, String(value))
    }
    setSearchParams(params)
  }

  const resetFilters = () => {
    const params = new URLSearchParams()
    if (centerId) params.set('center', centerId)
    setSearchParams(params)
    setMinRating(0)
    setSelectedTags([])
    setAppliedFilters({ type: 'all', restriction: 'all', minRent: DEFAULT_MIN_RENT, maxRent: DEFAULT_MAX_RENT, maxWalk: 60, minCapacity: 0, stayType: 'all', rating: 0, tags: [] })
  }

  const handleApplyFilters = () => {
    setAppliedFilters({ type, restriction, minRent, maxRent, maxWalk, minCapacity, stayType, rating: minRating, tags: selectedTags })
  }

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])
  }

  // ─── Filtering (search is immediate; all others staged via Apply) ──────────
  const filtered = useMemo(() => {
    return accommodations.filter((acc) => {
      const matchSearch =
        acc.accommodationName.toLowerCase().includes(search.toLowerCase()) ||
        acc.accommodationLocation.toLowerCase().includes(search.toLowerCase())
      const matchType = appliedFilters.type === 'all' || acc.accommodationType === appliedFilters.type
      const matchRestriction = appliedFilters.restriction === 'all' || acc.tenantRestriction === appliedFilters.restriction
      const matchRent = acc.minRent >= appliedFilters.minRent && acc.maxRent <= appliedFilters.maxRent
      const matchWalk = acc.walkingDistance <= appliedFilters.maxWalk
      const matchCapacity = acc.accommodationCapacity >= appliedFilters.minCapacity
      const matchStayType = appliedFilters.stayType === 'all' || acc.stayType === appliedFilters.stayType || acc.stayType === 'both'
      const matchRating = !acc.rating || acc.rating >= appliedFilters.rating
      const matchTags = appliedFilters.tags.length === 0 || appliedFilters.tags.every(tag => acc.amenities?.includes(tag))
      return matchSearch && matchType && matchRestriction && matchRent && matchWalk && matchCapacity && matchStayType && matchRating && matchTags
    })
  }, [accommodations, search, appliedFilters])

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', fontFamily: "'Plus Jakarta Sans', sans-serif", overflow: 'hidden' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', height: '100%' }}>
        <div className="relative flex-1 overflow-hidden">

          {/* ─── Collapsible Filter Sidebar ──────────────────────────────── */}
          <div className={`
            absolute z-[500] bg-white transition-all duration-500 ease-in-out flex flex-col overflow-hidden
            max-md:left-0 max-md:right-0 max-md:w-full max-md:border-b
            ${isSidebarOpen
              ? 'max-md:top-0 max-md:h-[50vh] max-md:shadow-2xl'
              : 'max-md:-top-[51vh] max-md:h-[50vh]'}
            md:top-0 md:bottom-0 md:w-[350px] md:border-r
            ${isSidebarOpen ? 'md:left-0 md:shadow-2xl' : 'md:-left-[350px]'}
          `}>
            <div style={{ minWidth: '350px', display: 'flex', flexDirection: 'column', height: '100%' }}>

              {/* Header */}
              <div className="p-6 pb-4 border-b border-gray-100" style={{ background: 'linear-gradient(135deg, #5a0822 0%, #710A2B 100%)' }}>
                {centerId && (
                  <button
                    onClick={() => window.history.back()}
                    className="mb-3 text-sm font-semibold text-white/80 hover:text-white flex items-center gap-1"
                    style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                  >
                    ← Back
                  </button>
                )}
                <div className="flex items-center justify-between mb-1">
                  <h2 className="text-xl font-bold text-white">
                    {centeredAccommodation ? centeredAccommodation.accommodationName : 'Find Accommodation'}
                  </h2>
                  <button onClick={resetFilters} className="text-xs font-semibold text-[#C69C3B] hover:opacity-80" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                    Reset all
                  </button>
                </div>
                <div className='flex flex-row justify-between'>
                  <p className="text-sm -mt-1 text-white/60">
                    {isLoading ? 'Loading...' : `${filtered.length} of ${accommodations.length} shown`}
                  </p>
                  <button 
                  onClick={() => navigate('/')}
                  className='mt-4 p-0 flex items-center text-white text-xs hover:underline hover:scale-105 transition-all'>
                    ← Back
                  </button>
                </div>
                
              </div>

              {/* Scrollable Filters */}
              <div className={`
                p-6 flex-1 overflow-y-auto hide-scrollbar
                max-md:grid max-md:grid-cols-2 max-md:gap-x-4 max-md:gap-y-6 max-md:items-end
                md:flex md:flex-col md:space-y-6
              `}>

                {/* Search — immediate */}
                <div className="max-md:col-span-2 space-y-2">
                  <label className="text-[10px] font-bold text-[#9A7080] uppercase tracking-widest block">Search</label>
                  <input
                    type="text"
                    placeholder="Name or location..."
                    value={search}
                    onChange={(e) => updateFilter('search', e.target.value)}
                    className="w-full h-[46px] px-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 focus:ring-2 focus:ring-[#710A2B]/20 outline-none"
                  />
                </div>

                {/* Favorites toggle (UI only) */}
                <div className="max-md:col-span-2 space-y-2">
                  <label className="text-[10px] font-bold text-[#9A7080] uppercase tracking-widest">Show Favorites Only</label>
                  <div className="h-[46px] flex items-center justify-between p-3 bg-[#FDF7F8] rounded-2xl border border-[#F5EBEB]">
                    <div className="flex items-center gap-3">
                      <div className="text-[#710A2B]">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                        </svg>
                      </div>
                      <p className="text-sm font-bold text-gray-800 truncate">Saved Rooms</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer scale-90">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-9 h-5 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#710A2B]/20 peer-checked:after:bg-[#710A2B]" />
                    </label>
                  </div>
                </div>

                {/* Dorm Type */}
                <div className="max-md:col-span-1 space-y-2">
                  <label className="text-[10px] font-bold text-[#9A7080] uppercase tracking-widest">Dorm Type</label>
                  <select
                    value={type}
                    onChange={(e) => updateFilter('type', e.target.value)}
                    className="w-full h-[46px] p-3 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:ring-2 focus:ring-[#710A2B]/20 outline-none appearance-none cursor-pointer"
                  >
                    <option value="all">All Types</option>
                    <option value="on-campus">On-Campus</option>
                    <option value="off-campus">Off-Campus</option>
                    <option value="partner_housing">Partner Housing</option>
                  </select>
                </div>

                {/* Room Type (Tenant Restriction) */}
                <div className="max-md:col-span-1 space-y-2">
                  <label className="text-[10px] font-bold text-[#9A7080] uppercase tracking-widest">Room Type</label>
                  <select
                    value={restriction}
                    onChange={(e) => updateFilter('restriction', e.target.value)}
                    className="w-full h-[46px] p-3 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:ring-2 focus:ring-[#710A2B]/20 outline-none appearance-none cursor-pointer"
                  >
                    <option value="all">All Types</option>
                    <option value="male-only">Male-only</option>
                    <option value="female-only">Female-only</option>
                    <option value="coed">Coed</option>
                  </select>
                </div>

                {/* Stay Type */}
                <div className="max-md:col-span-1 space-y-2">
                  <label className="text-[10px] font-bold text-[#9A7080] uppercase tracking-widest">Stay Type</label>
                  <select
                    value={stayType}
                    onChange={(e) => updateFilter('stay_type', e.target.value)}
                    className="w-full h-[46px] p-3 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:ring-2 focus:ring-[#710A2B]/20 outline-none appearance-none cursor-pointer"
                  >
                    <option value="all">All</option>
                    <option value="transient">Transient</option>
                    <option value="non_transient">Non-Transient</option>
                  </select>
                </div>

                {/* Min Rating */}
                <div className="max-md:col-span-1 space-y-2">
                  <label className="text-[10px] font-bold text-[#9A7080] uppercase tracking-widest block">Min Rating</label>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setMinRating(star === minRating ? 0 : star)}
                          className="p-0 border-none bg-transparent outline-none transition-transform active:scale-90"
                        >
                          <svg viewBox="0 0 24 24" fill={star <= minRating ? '#C69C3B' : '#F5EBEB'} className="w-6 h-6 transition-colors">
                            <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z" clipRule="evenodd" />
                          </svg>
                        </button>
                      ))}
                    </div>
                    {minRating > 0 && (
                      <span className="px-2 py-0.5 bg-[#FDF7F8] border border-[#F5EBEB] text-[#710A2B] text-[10px] font-bold rounded-md">
                        {minRating}★+
                      </span>
                    )}
                  </div>
                </div>

                {/* Price Range — dual slider */}
                <div className="max-md:col-span-2 space-y-2">
                  <label className="text-[10px] font-bold text-[#9A7080] uppercase tracking-widest block">Price Range</label>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 p-2 bg-[#FDF7F8] border border-[#F5EBEB] rounded-xl text-center">
                      <p className="text-[8px] text-gray-400 uppercase font-bold">From</p>
                      <p className="text-xs font-bold text-[#710A2B]">₱{minRent.toLocaleString()}</p>
                    </div>
                    <div className="w-3 h-[1px] bg-gray-300" />
                    <div className="flex-1 p-2 bg-[#FDF7F8] border border-[#F5EBEB] rounded-xl text-center">
                      <p className="text-[8px] text-gray-400 uppercase font-bold">To</p>
                      <p className="text-xs font-bold text-[#710A2B]">₱{maxRent.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="relative h-6 flex items-center">
                    <div className="absolute w-full h-1.5 bg-gray-100 rounded-full" />
                    <div
                      className="absolute h-1.5 rounded-full"
                      style={{
                        left: `${((minRent - DEFAULT_MIN_RENT) / (DEFAULT_MAX_RENT - DEFAULT_MIN_RENT)) * 100}%`,
                        right: `${100 - ((maxRent - DEFAULT_MIN_RENT) / (DEFAULT_MAX_RENT - DEFAULT_MIN_RENT)) * 100}%`,
                        background: 'linear-gradient(135deg, #C9973A, #a07825)',
                      }}
                    />
                    <input
                      type="range"
                      min={DEFAULT_MIN_RENT}
                      max={DEFAULT_MAX_RENT}
                      step="100"
                      value={minRent}
                      onChange={(e) => updateFilter('min_rent', Math.min(Number(e.target.value), maxRent - 500))}
                      className="range-input"
                    />
                    <input
                      type="range"
                      min={DEFAULT_MIN_RENT}
                      max={DEFAULT_MAX_RENT}
                      step="100"
                      value={maxRent}
                      onChange={(e) => updateFilter('max_rent', Math.max(Number(e.target.value), minRent + 500))}
                      className="range-input"
                    />
                  </div>
                  <div className="flex justify-between text-[10px] font-bold text-[#C8B0B8] uppercase">
                    <span>₱1,000</span>
                    <span>₱15,000</span>
                  </div>
                </div>

                {/* Max Walk to Campus */}
                <div className="max-md:col-span-2 space-y-2">
                  <label className="text-[10px] font-bold text-[#9A7080] uppercase tracking-widest block">
                    Max Walk to Campus — {maxWalk} min
                  </label>
                  <input
                    type="range"
                    min={1}
                    max={60}
                    value={maxWalk}
                    onChange={(e) => updateFilter('max_walk', Number(e.target.value))}
                    style={{ width: '100%', accentColor: '#710A2B' }}
                  />
                  <div className="flex justify-between text-[10px] font-bold text-[#C8B0B8]">
                    <span>1 min</span>
                    <span>60 min</span>
                  </div>
                </div>

                {/* Amenity Tags */}
                <div className="max-md:col-span-2 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold text-[#9A7080] uppercase tracking-widest">Amenities</label>
                    {selectedTags.length > 0 && (
                      <button
                        onClick={() => setSelectedTags([])}
                        className="text-[9px] font-bold uppercase text-gray-400 hover:text-[#710A2B]"
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                      >
                        Clear ({selectedTags.length})
                      </button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {availableTags.map(tag => (
                      <button
                        key={tag}
                        onClick={() => toggleTag(tag)}
                        className={`px-3 py-1.5 text-[10px] font-semibold rounded-full border transition-all ${
                          selectedTags.includes(tag)
                            ? 'bg-[#710A2B] text-white border-[#710A2B]'
                            : 'bg-white text-[#6B0F2B] border-[#6B0F2B]/20'
                        }`}
                        style={{ cursor: 'pointer' }}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Apply Button */}
              <div className="p-6 pt-4 border-t border-gray-50">
                <button
                  onClick={handleApplyFilters}
                  className="w-full py-4 bg-[#710A2B] text-sm text-white font-bold rounded-2xl shadow-lg hover:bg-[#5a0822] transition-all active:scale-95"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>

          {/* ─── Floating Collapse Toggle ─────────────────────────────────── */}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={`
              absolute z-[501] w-8 h-8 rounded-full flex-shrink-0 p-0
              bg-white border border-[#F5EBEB] shadow-[0_2px_8px_rgba(0,0,0,0.1)]
              flex items-center justify-center cursor-pointer outline-none
              transition-all duration-500 ease-in-out
              md:top-1/2 md:-translate-y-1/2
              ${isSidebarOpen ? 'md:left-[334px]' : 'md:left-[-16px]'}
              max-md:left-1/2 max-md:-translate-x-1/2
              ${isSidebarOpen ? 'max-md:top-[48.5vh]' : 'max-md:-top-4'}
            `}
            style={{ border: '1px solid #F5EBEB' }}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="#710A2B"
              strokeWidth={4}
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`
                w-[18px] h-[18px] transition-transform duration-500
                ${!isSidebarOpen ? 'md:rotate-180' : ''}
                ${isSidebarOpen ? 'max-md:rotate-90' : 'max-md:-rotate-90'}
              `}
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>

          {/* ─── Map ─────────────────────────────────────────────────────── */}
          <div style={{ width: '100%', height: '100%', zIndex: 1 }}>
            {isError && (
              <div style={{
                position: 'absolute', top: '50%', left: '50%',
                transform: 'translate(-50%, -50%)', zIndex: 10,
                backgroundColor: 'white', padding: '20px 32px',
                borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.15)', textAlign: 'center',
              }}>
                <p style={{ fontWeight: '600', color: '#EF4444', margin: '0 0 4px 0' }}>Failed to load accommodations</p>
                <p style={{ fontSize: '13px', color: '#9CA3AF', margin: 0 }}>Please check your connection.</p>
              </div>
            )}
            {!isError && !isLoading && filtered.length === 0 && (
              <div style={{
                position: 'absolute', top: '50%', left: '50%',
                transform: 'translate(-50%, -50%)', zIndex: 10,
                backgroundColor: 'white', padding: '24px 40px',
                borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', textAlign: 'center',
              }}>
                <p style={{ fontSize: '32px', marginBottom: '8px' }}>🔍</p>
                <p style={{ fontWeight: 'bold', color: '#1F2937', margin: '0 0 4px 0' }}>No matches found</p>
                <p style={{ fontSize: '14px', color: '#6B7280', margin: 0 }}>Try broadening your filters</p>
              </div>
            )}
            <AccommodationMap
              accommodations={filtered}
              centeredAccommodation={centeredAccommodation}
              onCardClick={(acc) => navigate(`/student/roomview/${acc.accommodationId}`)}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
