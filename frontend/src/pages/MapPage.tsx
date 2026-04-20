// Pa take not nito guys hehe
// src/pages/MapPage.tsx
// Route: /map              -> centered on UPLB (browse all)
// Route: /map?center=:id   -> centered on specific accommodation (from "View Location" button)
// Filters are passed via URL query params so they persist from the browse/cards page
import { useState, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import AccommodationMap, { type AccommodationPin } from '../components/AccommodationMaps'
import Sidebar from '../components/Sidebar'


const MOCK_ACCOMMODATIONS: AccommodationPin[] = [
  {
    accommodationId: 1,
    accommodationName: 'Sampaguita Dormitory',
    accommodationLocation: 'Raymundo Ave, Los Baños, Laguna',
    accommodationType: 'off-campus',
    accommodationCapacity: 50,
    tenantRestriction: 'female-only',
    latitude: 14.1672,
    longitude: 121.2430,
    minRent: 2500,
    maxRent: 4000,
    walkingDistance: 3,
    drivingDistance: 2,
    bikingDistance: 2,
    stayType: 'non_transient',
    imageUrl: 'https://placehold.co/400x200?text=Sampaguita+Dorm',
    rating: 5,
    amenities: ['WiFi', 'Furnished']
  },
  {
    accommodationId: 2,
    accommodationName: 'Molave Residence Hall',
    accommodationLocation: 'UPLB Campus, Los Baños, Laguna',
    accommodationType: 'on-campus',
    accommodationCapacity: 80,
    tenantRestriction: 'male-only',
    latitude: 14.1658,
    longitude: 121.2418,
    minRent: 2000,
    maxRent: 3500,
    walkingDistance: 5,
    drivingDistance: 3,
    bikingDistance: 3,
    stayType: 'non_transient',
    imageUrl: 'https://placehold.co/400x200?text=Molave+Hall',
    rating: 4,
    amenities: ['WiFi', 'Furnished', 'Air-con']
  },
  {
    accommodationId: 3,
    accommodationName: 'Sunrise Boarding House',
    accommodationLocation: 'Lopez Ave, Los Baños, Laguna',
    accommodationType: 'off-campus',
    accommodationCapacity: 20,
    tenantRestriction: 'coed',
    latitude: 14.1690,
    longitude: 121.2455,
    minRent: 3000,
    maxRent: 5000,
    walkingDistance: 10,
    drivingDistance: 5,
    bikingDistance: 6,
    stayType: 'transient',
    imageUrl: 'https://placehold.co/400x200?text=Sunrise+BH',
    rating: 4.7,
    amenities: ['Study-Friendly']
  },
  {
    accommodationId: 4,
    accommodationName: 'UPLB Partner Housing A',
    accommodationLocation: 'Batong Malake, Los Baños, Laguna',
    accommodationType: 'partner_housing',
    accommodationCapacity: 30,
    tenantRestriction: 'coed',
    latitude: 14.1645,
    longitude: 121.2400,
    minRent: 1500,
    maxRent: 2500,
    walkingDistance: 15,
    drivingDistance: 7,
    bikingDistance: 8,
    stayType: 'both',
    imageUrl: 'https://placehold.co/400x200?text=Partner+Housing+A',
    rating: 3.3,
    amenities: ['Near Library']
  },
  {
    accommodationId: 5,
    accommodationName: 'Kalikasan Suites',
    accommodationLocation: 'Umali Subdivision, Los Baños, Laguna',
    accommodationType: 'off-campus',
    accommodationCapacity: 40,
    tenantRestriction: 'female-only',
    latitude: 14.1700,
    longitude: 121.2390,
    minRent: 4000,
    maxRent: 7000,
    walkingDistance: 20,
    drivingDistance: 10,
    bikingDistance: 12,
    stayType: 'transient',
    imageUrl: 'https://placehold.co/400x200?text=Kalikasan+Suites',
    rating: 2,
    amenities: ['WiFi', 'Air-con']
  },
]

export default function MapPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  // ─── Read filters from URL query params ──────────────────────────────────
  // This way filters set on the cards/browse page carry over to the map
  const search = searchParams.get('search') ?? ''
  const type = searchParams.get('type') ?? 'all'
  const restriction = searchParams.get('restriction') ?? 'all'
  const minRent = Number(searchParams.get('min_rent') ?? 1000)
  const maxRent = Number(searchParams.get('max_rent') ?? 10000)
  const maxWalk = Number(searchParams.get('max_walk') ?? 60)
  const minCapacity = Number(searchParams.get('min_capacity') ?? 0)
  const stayType = searchParams.get('stay_type') ?? 'all'

  // center=:id — which accommodation to center on (from "View Location" button)
  const centerId = searchParams.get('center')
  const centeredAccommodation = centerId
    ? MOCK_ACCOMMODATIONS.find((a) => a.accommodationId === Number(centerId)) ?? null
    : null

  // ─── Update a single filter in URL ───────────────────────────────────────
  const updateFilter = (key: string, value: string | number) => {
    const params = new URLSearchParams(searchParams)
    if (value === '' || value === 0 || value === 'all') {
      params.delete(key)
    } else {
      params.set(key, String(value))
    }
    // Keep center param if it exists
    setSearchParams(params)
  }

  const resetFilters = () => {
    const params = new URLSearchParams()
    // Preserve center if it exists
    if (centerId) params.set('center', centerId)
    setSearchParams(params)
  }

  // ─── Apply filters ────────────────────────────────────────────────────────
  const [minRating, setMinRating] = useState(0);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const [appliedFilters, setAppliedFilters] = useState({
    rating: 0,
    tags: [] as string[]
  });

  const handleApplyFilters = () => {
    setAppliedFilters({
      rating: minRating,
      tags: selectedTags
    });
  };

  // Toggle tag selection
  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const filtered = useMemo(() => {
    return MOCK_ACCOMMODATIONS.filter((acc) => {
      const matchSearch = acc.accommodationName.toLowerCase().includes(search.toLowerCase());
      const matchType = type === 'all' || acc.accommodationType === type;
      const matchRestriction = restriction === 'all' || acc.tenantRestriction === restriction;
      const matchRent = acc.minRent >= minRent && acc.minRent <= maxRent;
      
      // Use appliedFilters instead of the raw states
      const matchRating = acc.rating >= appliedFilters.rating;
      
      const matchTags = appliedFilters.tags.length === 0 || 
        appliedFilters.tags.every(tag => acc.amenities?.includes(tag));

      return matchSearch && matchType && matchRent && matchRating && matchTags;
    });
    // Update dependencies to watch appliedFilters
  }, [search, type, minRent, maxRent, appliedFilters]);

  // ─── Styles ───────────────────────────────────────────────────────────────
  const labelStyle: React.CSSProperties = {
    fontSize: '12px',
    fontWeight: '600',
    color: '#374151',
    display: 'block',
    marginBottom: '5px',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '8px 10px',
    borderRadius: '8px',
    border: '1px solid #E5E7EB',
    fontSize: '13px',
    color: '#374151',
    backgroundColor: '#F9FAFB',
    boxSizing: 'border-box',
  }

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', fontFamily: "'Segoe UI', sans-serif", overflow: 'hidden' }}>
      <Sidebar role={'student'}></Sidebar> {/* TODO: check how to change between roles */}
      {/* ─── Sidebar ─────────────────────────────────────────────────────── */}
      <div className="hide-scrollbar"
        style={{
          width: '350px', // Slightly wider to match the reference image
          minWidth: '350px',
          backgroundColor: 'white',
          boxShadow: '2px 0 12px rgba(0,0,0,0.08)',
          overflowY: 'auto',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          borderRadius: '0 25px 25px 0'
        }}>

        {/* Header Section */}
        <div className="p-6 pb-4 border-b border-gray-100">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-2xl font-bold text-gray-800">Filters</h2>
            <button 
              onClick={resetFilters}
              className="text-sm font-semibold text-[#C69C3B] hover:opacity-80 transition-opacity"
            >
              Reset all
            </button>
          </div>
        </div>

        <div className="p-6 space-y-8 flex-1">
          
          {/* SHOW FAVORITES ONLY */}
          <div className="space-y-3">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Show Favorites Only</label>
            <div className="flex items-center justify-between p-4 bg-[#FDF7F8] rounded-2xl border border-[#F5EBEB]">
              <div className="flex items-center gap-3">
                <div className="text-[#710A2B]">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-800 leading-none">Saved Rooms</p>
                  <p className="text-[11px] text-gray-400 mt-1">Show only your saved dorms</p>
                </div>
              </div>
              {/* Toggle Switch */}
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#710A2B]/20 peer-checked:after:bg-[#710A2B]"></div>
              </label>
            </div>
          </div>

          {/* DORM TYPE */}
          <div className="space-y-3">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Dorm Type</label>
            <select 
              value={type} 
              onChange={(e) => updateFilter('type', e.target.value)}
              className="w-full p-4 bg-white border border-gray-200 rounded-2xl text-sm font-medium text-gray-700 focus:ring-2 focus:ring-[#710A2B]/20 outline-none appearance-none cursor-pointer"
            >
              <option value="all">All Types</option>
              <option value="on-campus">On-Campus</option>
              <option value="off-campus">Off-Campus</option>
              <option value="partner_housing">Partner Housing</option>
            </select>
          </div>

          {/* ROOM TYPE */}
          <div className="space-y-3">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Room Type</label>
            <select className="w-full p-4 bg-white border border-gray-200 rounded-2xl text-sm font-medium text-gray-700 focus:ring-2 focus:ring-[#710A2B]/20 outline-none appearance-none">
              <option>All</option>
              <option>Studio</option>
              <option>Shared</option>
            </select>
          </div>

          {/* PRICE RANGE SECTION */}
          <div className="space-y-4">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">
              Price Range
            </label>
            
            {/* The Visual Price Labels */}
            <div className="flex items-center gap-3">
              <div className="flex-1 p-3 bg-[#FDF7F8] border border-[#F5EBEB] rounded-xl text-center">
                <p className="text-[9px] text-gray-400 uppercase font-bold">From</p>
                <p className="text-sm font-bold text-[#710A2B]">₱{minRent.toLocaleString()}</p>
              </div>
              <div className="w-3 h-[1px] bg-gray-300"></div>
              <div className="flex-1 p-3 bg-[#FDF7F8] border border-[#F5EBEB] rounded-xl text-center">
                <p className="text-[9px] text-gray-400 uppercase font-bold">To</p>
                <p className="text-sm font-bold text-[#710A2B]">₱{maxRent.toLocaleString()}</p>
              </div>
            </div>

            {/* THE DOUBLE SLIDER */}
            <div className="relative h-6 flex items-center group">
              {/* 1. The Background Track (Gray) */}
              <div className="absolute w-full h-1.5 bg-gray-100 rounded-full"></div>
              
              {/* 2. The Active Track (Gradient) -Calculates position based on values */}
              <div 
                className="absolute h-1.5 rounded-full"
                style={{ 
                  left: `${((minRent - 1000) / 14000) * 100}%`, 
                  right: `${100 - ((maxRent - 1000) / 14000) * 100}%`,
                  // Changed from solid color to gradient:
                  background: 'linear-gradient(135deg, #C9973A, #a07825)' 
                }}>
              </div>

              {/* 3. The Two Invisible Range Inputs */}
              <input
                type="range"
                min="1000"
                max="15000"
                step="100"
                value={minRent}
                // Logic: Don't let min cross max
                onChange={(e) => {
                  const val = Math.min(Number(e.target.value), maxRent - 500);
                  updateFilter('min_rent', val);
                }}
                className="range-input"/>
              <input
                type="range"
                min="1000"
                max="15000"
                step="100"
                value={maxRent}
                // Logic: Don't let max cross min
                onChange={(e) => {
                  const val = Math.max(Number(e.target.value), minRent + 500);
                  updateFilter('max_rent', val);
                }}
                className="range-input"/>
            </div>

            <div className="flex justify-between text-[10px] font-bold text-gray-300 uppercase">
              <span>₱1,000</span>
              <span>₱15,000</span>
            </div>
          </div>

          {/* MIN RATING */}
          <div className="space-y-3">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">
              Min Rating
            </label>
            
            <div className="flex items-center gap-4"> {/* Container for stars + badge */}
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button 
                    key={star} 
                    onClick={() => setMinRating(star)}
                    className="flex items-center justify-center p-0 border-none bg-transparent outline-none transition-transform active:scale-90">
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      viewBox="0 0 24 24" 
                      fill={star <= minRating ? "#C69C3B" : "#F5EBEB"} 
                      className="w-7 h-7 transition-colors">
                      <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z" clipRule="evenodd" />
                    </svg>
                  </button>
                ))}
              </div>
              
              <span className="px-3 py-1 bg-[#FDF7F8] border border-[#F5EBEB] text-[#710A2B] text-xs font-bold rounded-full">
                {minRating}{minRating === 5 ? '★' : '★+'}
              </span>
            </div>
            
            <p className="text-[10px] text-gray-400">Tap stars to change minimum</p>
          </div>

          {/* OTHERS (TAGS) SECTION */}
          <div className="space-y-4">
            {/* Row for Label and Clear Button */}
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">
                Others
              </label>
              
              {selectedTags.length > 0 && (
                <button 
                  onClick={() => setSelectedTags([])}
                  className="text-[10px] font-bold text-gray-400 uppercase tracking-widest hover:text-[#710A2B] transition-colors"
                >
                  Clear all ({selectedTags.length})
                </button>
              )}
            </div>
            
            <div className="flex flex-wrap gap-2">
              {['WiFi', 'Furnished', 'Air-con', 'Transient', 'Laundry', 'Study-Friendly'].map(tag => {
                const isActive = selectedTags.includes(tag);
                
                return (
                  <button 
                    key={tag} 
                    onClick={() => toggleTag(tag)}
                    className={`px-4 py-2 text-xs font-semibold rounded-full transition-all border ${
                      isActive 
                        ? 'bg-[#710A2B] text-white border-[#710A2B] shadow-md shadow-[#710A2B]/20' 
                        : 'bg-white text-gray-500 border-gray-200 hover:border-[#710A2B]/40'
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}

              {/* THE "ADD MORE" BUTTON */}
              <button 
                onClick={() => {
                  const newTag = prompt("Enter a feature (e.g., Gym, Pet Friendly):");
                  if (newTag) toggleTag(newTag);
                }}
                className="px-4 py-2 border-2 border-dashed border-gray-200 text-gray-400 text-xs font-bold rounded-full hover:border-[#710A2B] hover:text-[#710A2B] transition-colors flex items-center gap-1"
              >
                <span>+</span> Add more
              </button>
            </div>
          </div>

          {/* APPLY BUTTON */}
          <div className="pt-4">
            <button 
              onClick={handleApplyFilters}
              className="w-full py-4 bg-[#710A2B] text-white font-bold rounded-2xl shadow-lg shadow-[#710A2B]/20 hover:bg-[#5a0822] transition-all transform active:scale-95">
              Apply Filters
            </button>
          </div>
        </div>
      </div>

      {/* ─── Map ─────────────────────────────────────────────────────────── */}
      <div style={{ flex: 1, position: 'relative', height: '100vh' }}>
        {filtered.length === 0 && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 10,
            backgroundColor: 'white',
            padding: '20px 32px',
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            textAlign: 'center',
          }}>
            <p style={{ fontSize: '32px', margin: '0 0 8px 0' }}>🔍</p>
            <p style={{ fontWeight: '600', color: '#374151', margin: '0 0 4px 0' }}>No accommodations found</p>
            <p style={{ fontSize: '13px', color: '#9CA3AF', margin: 0 }}>Try adjusting your filters</p>
          </div>
        )}
        <AccommodationMap
          accommodations={filtered}
          centeredAccommodation={centeredAccommodation}
          onCardClick={(acc) => navigate(`/accommodations/${acc.accommodationId}`)}
        />
      </div>
    </div>
  )
}
