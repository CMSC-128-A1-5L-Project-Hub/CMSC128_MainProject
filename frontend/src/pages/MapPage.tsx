// src/pages/MapPage.tsx
// Route: /map              -> centered on UPLB (browse all)
// Route: /map?center=:id   -> centered on specific accommodation (from "View Location" button)
// Filters are passed via URL query params so they persist from the browse/cards page
import { useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import AccommodationMap, { type AccommodationPin } from '../components/AccommodationMaps'

const fetchAccommodations = async (): Promise<AccommodationPin[]> => {
  const res = await fetch('/api/accommodations')
  if (!res.ok) throw new Error('Failed to fetch accommodations')
  const body = await res.json()
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
    } satisfies AccommodationPin
  })
}

export default function MapPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const { data: accommodations = [], isLoading, isError } = useQuery({
    queryKey: ['accommodations'],
    queryFn: fetchAccommodations,
  })

  // ─── Read filters from URL query params ──────────────────────────────────
  const search = searchParams.get('search') ?? ''
  const type = searchParams.get('type') ?? 'all'
  const restriction = searchParams.get('restriction') ?? 'all'
  const minRent = Number(searchParams.get('min_rent') ?? 0)
  const maxRent = Number(searchParams.get('max_rent') ?? 10000)
  const maxWalk = Number(searchParams.get('max_walk') ?? 60)
  const minCapacity = Number(searchParams.get('min_capacity') ?? 0)
  const stayType = searchParams.get('stay_type') ?? 'all'

  const centerId = searchParams.get('center')
  const centeredAccommodation = useMemo(
    () => (centerId ? accommodations.find((a) => a.accommodationId === Number(centerId)) ?? null : null),
    [centerId, accommodations]
  )

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
  }

  // ─── Apply filters ────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    return accommodations.filter((acc) => {
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
  }, [accommodations, search, type, restriction, minRent, maxRent, maxWalk, minCapacity, stayType])

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
      {/* ─── Sidebar ─────────────────────────────────────────────────────── */}
      <div style={{
        width: '300px',
        minWidth: '300px',
        backgroundColor: 'white',
        boxShadow: '2px 0 12px rgba(0,0,0,0.08)',
        overflowY: 'auto',
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
      }}>

        {/* Header */}
        <div style={{
          padding: '20px 20px 16px',
          borderBottom: '1px solid #F3F4F6',
          background: 'linear-gradient(135deg, #1e3a5f 0%, #2563EB 100%)',
        }}>
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
          <h2 style={{ fontSize: '18px', fontWeight: '700', color: 'white', margin: '0 0 4px 0' }}>
            🏠 {centeredAccommodation ? centeredAccommodation.accommodationName : 'Find Accommodation'}
          </h2>
          <p style={{ fontSize: '12px', color: '#BFDBFE', margin: 0 }}>
            {isLoading ? 'Loading...' : `${filtered.length} of ${accommodations.length} accommodations shown`}
          </p>
        </div>

        {/* Filters */}
        <div style={{ padding: '16px 20px', flex: 1 }}>

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

          {/* Reset */}
          <button
            onClick={resetFilters}
            style={{
              width: '100%',
              padding: '10px',
              backgroundColor: '#F3F4F6',
              border: '1px solid #E5E7EB',
              borderRadius: '8px',
              fontSize: '13px',
              color: '#6B7280',
              cursor: 'pointer',
              fontWeight: '600',
              marginBottom: '16px',
            }}
          >
            Reset Filters
          </button>

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
            backgroundColor: 'white', padding: '20px 32px',
            borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.15)', textAlign: 'center',
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
