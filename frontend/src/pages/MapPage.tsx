// Pa take note nito guys hehe
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
  const room = searchParams.get('room') ?? 'all'
  const minRent = Number(searchParams.get('min_rent') ?? 1000)
  const maxRent = Number(searchParams.get('max_rent') ?? 10000)

  const [minRating, setMinRating] = useState(0);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState(['WiFi', 'Furnished', 'Air-con', 'Transient', 'Laundry', 'Study-Friendly']);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

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
    setSearchParams(params)
  }

  const resetFilters = () => {
    const params = new URLSearchParams()
    if (centerId) params.set('center', centerId)
    setSearchParams(params)

    setMinRating(0)
    setSelectedTags([])
  }

  // ─── Apply filters ────────────────────────────────────────────────────────
  const [appliedFilters, setAppliedFilters] = useState({
    rating: 0,
    tags: [] as string[],
    minRent: 1000,
    maxRent: 15000,
    type: searchParams.get('type') ?? 'all',
    room: searchParams.get('room') ?? 'all',
  });

  const handleApplyFilters = () => {
    setAppliedFilters({
      rating: minRating,
      tags: selectedTags,
      minRent: minRent,
      maxRent: maxRent,
      type: type,
      room: room,
    });
  };

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
      const matchType = appliedFilters.type === 'all' || acc.accommodationType === appliedFilters.type;
      const matchRoom = appliedFilters.room === 'all' || acc.tenantRestriction === appliedFilters.room;
      const matchRent = acc.minRent >= appliedFilters.minRent && acc.minRent <= appliedFilters.maxRent;   
      const matchRating = acc.rating >= appliedFilters.rating;
      const matchTags = appliedFilters.tags.length === 0 || appliedFilters.tags.every(tag => acc.amenities?.includes(tag));

      return matchSearch && matchType && matchRoom && matchRent && matchRating && matchTags;
    });
  }, [search, type, room, minRent, maxRent, appliedFilters]);

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
      
      {/* 1. FIXED NAVIGATION SIDEBAR */}
      <div style={{ zIndex: 200, backgroundColor: 'white' }}>
        <Sidebar role={'student'} />
      </div>

      {/* 2. MAIN CONTENT AREA */}
      <div style={{ flex: 1, position: 'relative', height: '100%' }}>
        
        {/* FULL-HEIGHT COLLAPSIBLE FILTER PANEL */}
        <div 
          className={`
            absolute z-[500] bg-white transition-all duration-500 ease-in-out flex flex-col overflow-hidden
            max-md:left-0 max-md:right-0 max-md:w-full max-md:border-b
            ${isSidebarOpen 
              ? 'max-md:top-0 max-md:h-[50vh] max-md:shadow-2xl' 
              : 'max-md:-top-[70vh] max-md:h-[70vh]'}
            
            md:top-0 md:bottom-0 md:w-[350px] md:border-r
            ${isSidebarOpen 
              ? 'md:left-0 md:shadow-2xl' 
              : 'md:-left-[350px]'}
          `}
        >
          <div style={{ minWidth: '350px', display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Header */}
            <div className="p-6 pb-4 border-b border-gray-100">
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-2xl font-bold text-gray-800">Filters</h2>
                <button onClick={resetFilters} className="text-sm font-semibold text-[#C69C3B] hover:opacity-80">
                  Reset all
                </button>
              </div>
            </div>

            {/* Scrollable Filters */}
            <div className={`
              p-6 flex-1 overflow-y-auto hide-scrollbar
              max-md:grid max-md:grid-cols-2 max-md:gap-x-4 max-md:gap-y-6 max-md:items-end
              md:flex md:flex-col md:space-y-8
            `}>
              
              {/* 1. FAVORITES */}
              <div className="max-md:col-span-1 space-y-2 max-md:order-1">
                <label className="text-[10px] font-bold text-[#9A7080] uppercase tracking-widest">Show Favorites Only</label>
                <div className="h-[46px] flex items-center justify-between p-3 bg-[#FDF7F8] rounded-2xl border border-[#F5EBEB]">
                  <div className="flex items-center gap-3">
                    <div className="text-[#710A2B]">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <p className="max-md:text-[11px] text-sm font-bold text-gray-800 leading-none truncate"> Saved Rooms </p>
                      <p className="max-md:text-[9px] max-md:leading-tight text-[11px] text-gray-400 mt-1"> Show only your saved dorms </p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer scale-90">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#710A2B]/20 peer-checked:after:bg-[#710A2B]"></div>
                  </label>
                </div>
              </div>

              {/* 2. DORM TYPE */}
              <div className="max-md:col-span-1 space-y-2 max-md:order-2">
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

              {/* 4. ROOM TYPE */}
              <div className={`
                max-md:col-span-1 space-y-3
                max-md:order-4 md:order-none
              `}>
                <label className="text-[10px] font-bold text-[#9A7080] uppercase tracking-widest"> Room Type </label>
                <select
                  value={room} 
                  onChange={(e) => updateFilter('room', e.target.value)}
                  className="w-full p-3 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:ring-2 focus:ring-[#710A2B]/20 outline-none appearance-none"
                >
                  <option value='all'>All Types</option>
                  <option value='male-only'>Male-only</option>
                  <option value='female-only'>Female-only</option>
                  <option value='coed'>Coed</option>
                </select>
              </div>

              {/* 3. MIN RATING */}
              <div className={`
                max-md:col-span-1 space-y-2
                max-md:order-3 md:order-none
              `}>
                <label className="text-[10px] font-bold text-[#9A7080] uppercase tracking-widest block"> Min Rating </label>
                <div className="flex items-center gap-2">
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button 
                        key={star} 
                        onClick={() => {
                          setMinRating(star)
                          updateFilter('rating', star)
                        }}
                        className="p-0 border-none bg-transparent outline-none transition-transform active:scale-90"
                      >
                        <svg 
                          viewBox="0 0 24 24" 
                          fill={star <= minRating ? "#C69C3B" : "#F5EBEB"} 
                          className="w-6 h-6 transition-colors"
                        >
                          <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z" clipRule="evenodd" />
                        </svg>
                      </button>
                    ))}
                  </div>
                  <span className="px-2 py-0.5 bg-[#FDF7F8] border border-[#F5EBEB] text-[#710A2B] text-[10px] font-bold rounded-md">
                    {minRating}{minRating === 5 ? '★' : '★+'}
                  </span>
                </div>
                <p className="text-[10px] text-[#C8B0B8]">Tap stars to change minimum</p>
              </div>

              {/* 5. PRICE RANGE */}
              <div className="max-md:col-span-2 space-y-2 max-md:order-5">
                <label className="text-[10px] font-bold text-[#9A7080] uppercase tracking-widest block">Price Range</label>
                <div className="flex items-center gap-3">
                  <div className="flex-1 p-2 bg-[#FDF7F8] border border-[#F5EBEB] rounded-xl text-center">
                    <p className="text-[8px] text-gray-400 uppercase font-bold">From</p>
                    <p className="text-xs font-bold text-[#710A2B]">₱{minRent.toLocaleString()}</p>
                  </div>
                  <div className="w-3 h-[1px] bg-gray-300"></div>
                  <div className="flex-1 p-2 bg-[#FDF7F8] border border-[#F5EBEB] rounded-xl text-center">
                    <p className="text-[8px] text-gray-400 uppercase font-bold">To</p>
                    <p className="text-xs font-bold text-[#710A2B]">₱{maxRent.toLocaleString()}</p>
                  </div>
                </div>

                {/* Double Slider Logic */}
                <div className="relative h-6 flex items-center group">
                  <div className="absolute w-full h-1.5 bg-gray-100 rounded-full"></div>

                  <div 
                    className="absolute h-1.5 rounded-full"
                    style={{ 
                      left: `${((minRent - 1000) / 14000) * 100}%`, 
                      right: `${100 - ((maxRent - 1000) / 14000) * 100}%`,
                      background: 'linear-gradient(135deg, #C9973A, #a07825)' 
                    }}>
                  </div>

                  <input
                    type="range"
                    min="1000"
                    max="15000"
                    step="100"
                    value={minRent}
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
                    onChange={(e) => {
                      const val = Math.max(Number(e.target.value), minRent + 500);
                      updateFilter('max_rent', val);
                    }}
                    className="range-input"/>
                </div>

                <div className="flex justify-between text-[10px] font-bold text-[#C8B0B8] uppercase">
                  <span>₱1,000</span>
                  <span>₱15,000</span>
                </div>
              </div>

              {/* 6. OTHERS */}
              <div className="max-md:col-span-2 space-y-2 max-md:order-6">
                <div className="flex items-center justify-between text-[10px] font-bold text-[#9A7080] uppercase tracking-widest">
                  <label>Others</label>
                  <button 
                    onClick={() => setSelectedTags([])}
                    className={`text-[9px] font-bold uppercase ${selectedTags.length > 0 ? 'text-gray-400 hover:text-[#710A2B]' : 'opacity-0'}`}
                  >
                    Clear all ({selectedTags.length})
                  </button>
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
                    >
                      {tag}
                    </button>
                  ))}
                  <button 
                    onClick={() => {
                      const newTag = prompt("Enter a feature:");
                      if (newTag?.trim()) {
                        if (!availableTags.includes(newTag.trim())) setAvailableTags(prev => [...prev, newTag.trim()]);
                        toggleTag(newTag.trim());
                      }
                    }}
                    className="px-3 py-1.5 border border-dashed border-gray-300 text-gray-400 text-[10px] font-bold rounded-full hover:border-[#710A2B]"
                  >
                    + Add more
                  </button>
                </div>
              </div>
            </div>

            {/* APPLY BUTTON */}
            <div className="p-6 pt-4 border-t border-gray-50">
              <button 
                onClick={handleApplyFilters}
                className="w-full py-4 bg-[#710A2B] text-white font-bold rounded-2xl shadow-lg hover:bg-[#5a0822] transition-all transform active:scale-95">
                Apply Filters
              </button>
            </div>
          </div>
        </div>

        {/* FLOATING COLLAPSE BUTTON */}
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
              md:rotate-0 
              ${!isSidebarOpen ? 'md:rotate-180' : ''}
              ${isSidebarOpen ? 'max-md:rotate-90' : 'max-md:-rotate-90'}
            `}
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        
        {/* THE MAP */}
        <div style={{ width: '100%', height: '100%', zIndex: 1 }}>
          <AccommodationMap
            accommodations={filtered}
            centeredAccommodation={centeredAccommodation}
            onCardClick={(acc) => navigate(`/accommodations/${acc.accommodationId}`)}
          />
        </div>

        {/* No Results Overlay */}
        {filtered.length === 0 && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 10,
            backgroundColor: 'white',
            padding: '24px 40px',
            borderRadius: '16px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
            textAlign: 'center',
          }}>
            <p style={{ fontSize: '32px', marginBottom: '8px' }}>🔍</p>
            <p style={{ fontWeight: 'bold', color: '#1F2937' }}>No matches found</p>
            <p style={{ fontSize: '14px', color: '#6B7280' }}>Try broadening your filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
