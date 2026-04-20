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
    rating: 5
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
    rating: 4
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
    rating: 4.7
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
    rating: 3.3
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
    rating: 2
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
  const minRent = Number(searchParams.get('min_rent') ?? 0)
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
  const filtered = useMemo(() => {
    return MOCK_ACCOMMODATIONS.filter((acc) => {
      const matchSearch =
        acc.accommodationName.toLowerCase().includes(search.toLowerCase()) ||
        acc.accommodationLocation.toLowerCase().includes(search.toLowerCase())
      const matchType = type === 'all' || acc.accommodationType === type
      const matchRestriction = restriction === 'all' || acc.tenantRestriction === restriction
      const matchRent = acc.minRent >= minRent && acc.maxRent <= maxRent
      const matchWalk = acc.walkingDistance <= maxWalk
      const matchCapacity = acc.accommodationCapacity >= minCapacity
      const matchStayType = stayType === 'all' || acc.stayType === stayType || acc.stayType === 'both'
      return matchSearch && matchType && matchRestriction && matchRent && matchWalk && matchCapacity && matchStayType
    })
  }, [search, type, restriction, minRent, maxRent, maxWalk, minCapacity, stayType])

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
        width: '300px',
        minWidth: '300px',
        backgroundColor: 'white',
        boxShadow: '2px 0 12px rgba(0,0,0,0.08)',
        overflowY: 'auto',
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '25px'
      }}>

        {/* Header */}
        <div style={{
          padding: '20px 20px 16px',
          borderBottom: '1px solid #F3F4F6',
          // background: 'linear-gradient(135deg, #1e3a5f 0%, #2563EB 100%)',
        }}>
          {/* Back button if coming from "View Location" */}
          {centerId && (
            <button
              onClick={() => window.history.back()}
              style={{
                background: 'rgba(255,255,255,0.15)',
                border: 'none',
                borderRadius: '8px',
                color: 'white',
                fontSize: '12px',
                fontWeight: '600',
                padding: '6px 12px',
                cursor: 'pointer',
                marginBottom: '10px',
                display: 'block',
              }}
            >
              ← Back
            </button>
          )}
          <div className="flex items-baseline justify-between mb-1">
            <h2 style={{ fontSize: '18px', fontWeight: '700', color: 'black', margin: '0 0 4px 0' }}>
              {centeredAccommodation ? centeredAccommodation.accommodationName : 'Filters'}
            </h2>
            <p onClick={resetFilters}
            className='cursor-pointer text-[#C9973A]'>
              {centeredAccommodation ? centeredAccommodation.accommodationName : 'Reset all'}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div style={{ padding: '16px 20px', flex: 1 }}>

          {/* Favorites */}


          {/* Search */}
          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>Search</label>
            <input
              type="text"
              placeholder="Search by name or location..."
              value={search}
              onChange={(e) => updateFilter('search', e.target.value)}
              style={inputStyle}
            />
          </div>

          {/* Type */}
          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>Accommodation Type</label>
            <select value={type} onChange={(e) => updateFilter('type', e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
              <option value="all">All Types</option>
              <option value="on-campus">On-Campus</option>
              <option value="off-campus">Off-Campus</option>
              <option value="partner_housing">Partner Housing</option>
            </select>
          </div>

          {/* Restriction */}
          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>Tenant Restriction</label>
            <select value={restriction} onChange={(e) => updateFilter('restriction', e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
              <option value="all">All</option>
              <option value="male-only">Male Only</option>
              <option value="female-only">Female Only</option>
              <option value="coed">Coed</option>
            </select>
          </div>

          {/* Price Range */}
          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>Price Range</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="number"
                placeholder="Min ₱"
                value={minRent || ''}
                onChange={(e) => updateFilter('min_rent', Number(e.target.value))}
                style={{ ...inputStyle, width: '50%' }}
              />
              <input
                type="number"
                placeholder="Max ₱"
                value={maxRent === 10000 ? '' : maxRent}
                onChange={(e) => updateFilter('max_rent', Number(e.target.value))}
                style={{ ...inputStyle, width: '50%' }}
              />
            </div>
          </div>

          {/* Max Walk */}
          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>Max Walk to Campus — {maxWalk} min</label>
            <input
              type="range"
              min={1}
              max={60}
              value={maxWalk}
              onChange={(e) => updateFilter('max_walk', Number(e.target.value))}
              style={{ width: '100%', accentColor: '#2563EB' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#9CA3AF' }}>
              <span>1 min</span>
              <span>60 min</span>
            </div>
          </div>

          {/* Min Capacity */}
          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>Minimum Capacity</label>
            <input
              type="number"
              placeholder="e.g. 20"
              value={minCapacity || ''}
              onChange={(e) => updateFilter('min_capacity', Number(e.target.value))}
              style={inputStyle}
            />
          </div>

          {/* Stay Type */}
          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>Stay Type</label>
            <select value={stayType} onChange={(e) => updateFilter('stay_type', e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
              <option value="all">All</option>
              <option value="transient">Transient</option>
              <option value="non_transient">Non-Transient</option>
            </select>
          </div>

          {/* Legend */}
          <div style={{ borderTop: '1px solid #F3F4F6', paddingTop: '16px' }}>
            <p style={{ ...labelStyle, marginBottom: '10px' }}>Pin Legend</p>
            {[
              { color: '#7C3AED', label: 'UPLB' },
              { color: '#3B82F6', label: 'Male Only' },
              { color: '#EC4899', label: 'Female Only' },
              { color: '#10B981', label: 'Coed' },
            ].map(({ color, label }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: color, flexShrink: 0 }} />
                <span style={{ fontSize: '12px', color: '#6B7280' }}>{label}</span>
              </div>
            ))}
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
