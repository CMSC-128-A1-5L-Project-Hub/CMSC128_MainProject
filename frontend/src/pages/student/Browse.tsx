import { useEffect, useMemo, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import DormCard from "../../components/DormCardBrowse";
import AccommodationMap, { type AccommodationPin } from '../../components/AccommodationMapsBrowse'
import { Star } from "lucide-react";
import Sidebar from "../../components/Sidebar";
import CustomHeader from '../../components/CustomHeader';
import HeroBanner from "@/components/dashboard/HeroBanner";

interface HeroContent {
    greeting: string;
    name: string;
    title: string;
    subtitle: string;
}

type Dorm = {
    name: string;
    subtitle: string;
    meta: string;
    price: number;
    priceUnit: string;
    'featured chips': string[];
    rating: number;
}

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
    },
]

function SearchBar() {
    return <div className="w-full max-w-5xl mx-auto">
        <div className="flex items-center bg-white rounded-2xl shadow-md px-4 py-2 border border-gray-200">
            <div className="flex items-center flex-1 space-x-2">

                <svg className="w-5 h-5 text-[#8A2A45]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>

                <input
                    type="text"
                    placeholder="Search dormitory name"
                    className="w-full outline-none text-gray-700 rounded-xl placeholder-[#C8B0B8]"
                />
            </div>

            <button className="flex items-center space-x-2 bg-gradient-to-r from-[#6B0F2B] to-[#8A1C3D] hover:from-[#7A162D] hover:to-[#A3264A] text-white px-5 py-2 rounded-full transition-colors duration-200">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <span>Search</span>
            </button>

        </div>
    </div>
}

function Form() {
    const [minPrice, setMinPrice] = useState(2500);
    const [maxPrice, setMaxPrice] = useState(7000);
    const labelStyle: React.CSSProperties = { fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#9A7080", marginBottom: 6, fontFamily: "'Plus Jakarta Sans',sans-serif" };
    const [filters, setFilters] = useState<{ [key: string]: boolean }>(
        {
            "WiFi": false,
            "Furnished": false,
            "Air-Con": false,
            "Transient": false,
            "Near Library": false,
            "Laundry": false,
            "Near UPLB Gate": false,
            "Study-Friendly": false
        },
    )

    const [newFilter, setNewFilter] = useState("")
    const [modal, setModal] = useState(false);
    const [starRating, setStarRating] = useState(3);
    const [toggled, setToggled] = useState(false);

    const originalFilters = {
        "WiFi": false,
        "Furnished": false,
        "Air-Con": false,
        "Transient": false,
        "Near Library": false,
        "Laundry": false,
        "Near UPLB Gate": false,
        "Study-Friendly": false
    }

    return (
        <>
            <div className="flex flex-col w-full">
                <div className="flex flex-col items-end">
                    <button
                        className="group flex flex-col items-center justify-start w-fit"
                        onClick={() => {
                            setFilters(originalFilters)
                            setStarRating(3)
                            setToggled(false)
                            const dorm_type = document.getElementById("dorm-type") as HTMLSelectElement | null;
                            const room_type = document.getElementById("room-type") as HTMLSelectElement | null;

                            if (dorm_type) {
                                dorm_type.selectedIndex = 0;
                            }

                            if (room_type) {
                                room_type.selectedIndex = 0;
                            }
                        }}
                    >

                        <span className="text-xs font-bold text-[#8a7686] group-hover:text-[#7A162D] transition-colors">
                            Reset Filters
                        </span>


                        <div className="w-full h-[1.5px] bg-[#d2c2ce] mt-[-2px] group-hover:bg-[#7A162D] transition-colors" />
                    </button>
                </div>
                <div className="flex w-full">
                    <div className="flex flex-col justify-center w-[50%] md:gap-3 p-2">
                        <div className='flex flex-col'>
                            <p className="text-[11px] sm:text-sm font-semibold text-gray-500 tracking-wide mb-1 sm:mb-2">
                                SHOW FAVORITES ONLY
                            </p>

                            <div className="flex items-center justify-center rounded-2xl border bg-pink-50 p-2">
                                <div className="flex items-center gap-3">
                                    <svg viewBox="0 0 24 24" className="w-6 h-6" fill="white" stroke="#6B0F2B" strokeWidth="2">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M12 21s-7-4.5-9.5-9A5.5 5.5 0 0112 6.5 5.5 5.5 0 0121.5 12C19 16.5 12 21 12 21z"
                                        />
                                    </svg>
                                    <div className="flex items-center gap-3 w-[80%]">
                                        <div className="flex flex-col h-full">
                                            {/* <p className="font-semibold text-gray-800">Saved Rooms</p>
                                    <p className="text-xs text-gray-500">Show only your saved dorms</p> */}
                                            <p className="font-semibold text-gray-800 text-sm sm:text-base">
                                                Saved Rooms
                                            </p>

                                            <p className="text-[11px] sm:text-xs text-gray-500 leading-tight">
                                                Show only your saved dorms
                                            </p>
                                        </div>
                                    </div>
                                </div>




                                <button className={`toggle-btn ${toggled ? 'toggled' : ''}`} onClick={() => setToggled(!toggled)}>
                                    <div className="thumb"></div>
                                </button>

                            </div>
                        </div>

                        {/* <hr className="border-gray-200" /> */}

                        <div className="flex flex-col">

                            <p className="text-[11px] sm:text-sm font-semibold text-gray-500 tracking-wide mb-1 sm:mb-2">
                                DORM TYPE
                            </p>

                            <div className="relative w-full">
                                <select
                                    id="dorm-type"
                                    className="w-full px-3 py-2 sm:px-4 sm:py-4 rounded-xl sm:rounded-2xl border border-[#EDE1E5] sm:border-2 text-sm sm:text-base text-gray-800 appearance-none outline-none"
                                >
                                    <option>All Types</option>
                                    <option>Apartment</option>
                                    <option>Dormitory</option>
                                    <option>Boarding House</option>
                                </select>

                                <div className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-[#6B0F2B] text-xs sm:text-base">
                                    ▼
                                </div>
                            </div>
                        </div>

                        {/* <hr className="border-gray-200" /> */}

                        <div className='flex flex-col'>

                            <p className="text-[11px] sm:text-sm font-semibold text-gray-500 tracking-wide mb-1 sm:mb-2">
                                ROOM TYPE
                            </p>

                            <div className="relative w-full">
                                <select
                                    id="room-type"
                                    className="w-full px-3 py-2 sm:px-4 sm:py-4 pr-8 sm:pr-10 rounded-xl sm:rounded-2xl border border-[#EDE1E5] sm:border-2 text-sm sm:text-base text-gray-800 appearance-none outline-none"
                                >
                                    <option>All</option>
                                    <option>Single</option>
                                    <option>Shared</option>
                                    <option>Studio</option>
                                </select>

                                <div className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-[#6B0F2B] text-xs sm:text-base">
                                    ▼
                                </div>
                            </div>
                        </div>


                        <div className="flex flex-col justify-center items-start">

                            <p className="text-[11px] sm:text-sm font-semibold text-gray-500 tracking-wide mb-1 sm:mb-2">
                                MIN RATING
                            </p>

                            <div className="flex flex-wrap items-center gap-1 sm:gap-2">

                                <div className="flex items-center">
                                    {[...Array(5)].map((_, index) => {
                                        const filled = index < starRating;

                                        return (
                                            <button
                                                key={index}
                                                type="button"
                                                onClick={() => setStarRating(index + 1)}
                                                className="transition-transform active:scale-90 p-0 leading-none"
                                            >
                                                <Star
                                                    size={20}
                                                    className="sm:w-6 sm:h-6 transition-colors duration-200"
                                                    fill={filled ? '#C0934B' : '#E5D5DB'}
                                                    stroke="none"
                                                />
                                            </button>
                                        );
                                    })}
                                </div>

                                <button
                                    disabled
                                    type="button"
                                    className="flex items-center gap-1 rounded-full border border-pink-200 bg-pink-50 px-3 py-1 sm:px-4 sm:py-2 text-xs sm:text-sm font-semibold text-pink-900"
                                >
                                    <span>{starRating}</span>
                                    <Star size={12} className="sm:w-4 sm:h-4 text-pink-900" fill="currentColor" stroke="none" />
                                    <span>+</span>
                                </button>

                            </div>
                        </div>


                    </div>
                    <div className="flex flex-col justify-center w-[50%] md:gap-3 p-2">
                        <div className="flex flex-col">
                            <p className="text-[11px] sm:text-sm font-semibold text-gray-500 tracking-wide mb-1 sm:mb-2">
                                PRICE RANGE
                            </p>
                            <div style={{ padding: "14px 16px" }}>
                                <div style={{
                                    display: "flex", alignItems: "center", justifyContent: "space-between",
                                    marginBottom: 10,
                                }}>
                                    <span style={{
                                        background: "#f5f0f2", borderRadius: 99, padding: "3px 10px",
                                        fontSize: 12, fontWeight: 700, color: "#6B0F2B",
                                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                                    }}>
                                        ₱{minPrice.toLocaleString()}
                                    </span>
                                    <span style={{ fontSize: 11, color: "#bbb", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                                        to
                                    </span>
                                    <span style={{
                                        background: "#f5f0f2", borderRadius: 99, padding: "3px 10px",
                                        fontSize: 12, fontWeight: 700, color: "#6B0F2B",
                                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                                    }}>
                                        ₱{maxPrice.toLocaleString()}
                                    </span>
                                </div>

                                <DualRangeSlider
                                    minVal={minPrice}
                                    maxVal={maxPrice}
                                    onMinChange={setMinPrice}
                                    onMaxChange={setMaxPrice}
                                    dataMin={2500}
                                    dataMax={10000}
                                />
                            </div>
                        </div>

                        <div className="flex flex-col">
                            <p className="text-[11px] sm:text-sm font-semibold text-gray-500 tracking-wide mb-1 sm:mb-2">
                                OTHERS
                            </p>
                            <div className="flex flex-wrap w-full gap-1">
                                {
                                    Object.keys(filters).map((value) => (
                                        <button onClick={() => {
                                            let tempFilters = { ...filters }
                                            tempFilters[value] = !tempFilters[value]
                                            setFilters(tempFilters)
                                        }} className={`px-2 py-0.5 text-xs sm:px-3 sm:py-1 sm:text-sm md:text-base
                                rounded-full font-medium transition border
                                ${filters[value]
                                                ? "bg-[#7A0F23] text-white border-[#7A0F23]"
                                                : "bg-transparent text-[#7A0F23] border-[#7A0F23]"
                                            }`}>
                                            {value}
                                        </button>
                                    ))
                                }
                                <button onClick={() => { setModal(true) }} className={`px-3 py-1 rounded-full font-medium transition border-2 border-dashed bg-transparent text-[#7A0F23]/60 border-[#7A0F23]/60`}>
                                    + Add more
                                </button>
                                {modal && (
                                    <div className="fixed inset-0 z-50 flex items-center justify-center">

                                        {/* Backdrop Blur */}
                                        <div
                                            className="absolute inset-0 bg-[#4A0E1C]/40 backdrop-blur-sm"
                                            onClick={() => {
                                                setModal(modal => !modal)
                                            }}
                                        />

                                        {/* Modal Card */}
                                        <div className="relative z-10 w-full max-w-md bg-white rounded-[2.5rem] p-8 shadow-2xl mx-4">
                                            <div className="flex justify-between items-center mb-6">
                                                <h2 className="text-2xl font-serif italic text-[#7A162D]">Add filter</h2>
                                                <button
                                                    onClick={() => {
                                                        setModal(modal => !modal)
                                                    }}
                                                    className="text-gray-400 hover:text-maroon-800"
                                                >
                                                    ✕
                                                </button>
                                            </div>

                                            <div className="space-y-4">
                                                <input
                                                    onChange={(e) => {
                                                        setNewFilter(e.target.value)
                                                    }}
                                                    type="text"
                                                    placeholder="New Filter"
                                                    className="w-full px-5 py-3 rounded-2xl border border-gray-100 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#7A162D]/20"
                                                />

                                                <button onClick={() => {
                                                    let tempFilters = { ...filters }
                                                    tempFilters[newFilter] = true
                                                    setFilters(tempFilters)
                                                    setModal(modal => !modal)
                                                }}
                                                    className="w-full py-4 mt-4 bg-[#7A162D] text-white rounded-2xl font-semibold shadow-lg shadow-maroon-200 hover:bg-[#5a1021] transition-colors">
                                                    Add
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

function DualRangeSlider({
    minVal, maxVal,
    onMinChange, onMaxChange,
    dataMin, dataMax,
}: {
    minVal: number; maxVal: number;
    onMinChange: (v: number) => void; onMaxChange: (v: number) => void;
    dataMin: number; dataMax: number;
}) {
    const STEP = 100;
    const range = dataMax - dataMin;
    const minPct = ((minVal - dataMin) / range) * 100;
    const maxPct = ((maxVal - dataMin) / range) * 100;

    return (
        <div style={{ position: "relative", width: "100%", height: 28 }}>
            {/* Track */}
            <div style={{
                position: "absolute",
                top: "50%", left: 0, right: 0,
                height: 6,
                borderRadius: 99,
                background: "#ede8ea",
                transform: "translateY(-50%)",
            }} />

            {/* Fill */}
            <div style={{
                position: "absolute",
                top: "50%",
                left: `${minPct}%`,
                width: `${maxPct - minPct}%`,
                height: 6,
                borderRadius: 99,
                background: "linear-gradient(90deg, #6B0F2B, #B5344F)",
                transform: "translateY(-50%)",
            }} />

            {/* Min Thumb */}
            <input
                type="range"
                min={dataMin}
                max={dataMax}
                step={STEP}
                value={minVal}
                onChange={(e) => onMinChange(Number(e.target.value))}
                style={{
                    position: "absolute",
                    top: "50%",
                    left: 0,
                    width: "100%",
                    height: 28,
                    transform: "translateY(-50%)",
                    opacity: 0,
                    cursor: "pointer",
                    zIndex: 10,
                    WebkitAppearance: "none",
                }}
            />

            {/* Max Thumb */}
            <input
                type="range"
                min={dataMin}
                max={dataMax}
                step={STEP}
                value={maxVal}
                onChange={(e) => onMaxChange(Number(e.target.value))}
                style={{
                    position: "absolute",
                    top: "50%",
                    left: 0,
                    width: "100%",
                    height: 28,
                    transform: "translateY(-50%)",
                    opacity: 0,
                    cursor: "pointer",
                    zIndex: 10,
                    WebkitAppearance: "none",
                }}
            />

            {/* Visual Circles */}
            <div style={{
                position: "absolute",
                top: "50%",
                left: `${minPct}%`,
                transform: "translate(-50%, -50%)",
                width: 22,
                height: 22,
                borderRadius: "50%",
                background: "white",
                border: "3px solid #6B0F2B",
                pointerEvents: "none",
                zIndex: 5,
            }} />

            <div style={{
                position: "absolute",
                top: "50%",
                left: `${maxPct}%`,
                transform: "translate(-50%, -50%)",
                width: 22,
                height: 22,
                borderRadius: "50%",
                background: "white",
                border: "3px solid #6B0F2B",
                pointerEvents: "none",
                zIndex: 5,
            }} />
        </div>
    );
}


export default function BrowsePage() {
    const heroContent: HeroContent = {
        name: "Ana Reyes",
        greeting: "Good Day",
        title: "Browse available rooms",
        subtitle: "Browse available accommodations and apply in just a few clicks",
    }; 
    
    const [dorms, setDorms] = useState<{ [key: number]: Dorm[] }>(
        {
            0: [
                { name: 'Kamia Residence', subtitle: 'Hall', meta: 'Studio · 22 m² · On-campus', price: 3200, priceUnit: '/ month', 'featured chips': ["WiFi", "Furnished", "Air-con"], rating: 4.9 },
                { name: 'Kamia Residence', subtitle: 'Hall', meta: 'Studio · 22 m² · On-campus', price: 3200, priceUnit: '/ month', 'featured chips': ["WiFi", "Furnished", "Air-con"], rating: 4.9 },
                { name: 'Kamia Residence', subtitle: 'Hall', meta: 'Studio · 22 m² · On-campus', price: 3200, priceUnit: '/ month', 'featured chips': ["WiFi", "Furnished", "Air-con"], rating: 4.9 },
                { name: 'Kamia Residence', subtitle: 'Hall', meta: 'Studio · 22 m² · On-campus', price: 3200, priceUnit: '/ month', 'featured chips': ["WiFi", "Furnished", "Air-con"], rating: 4.9 },
            ], 1: [
                { name: 'Markov Residence', subtitle: 'Hall', meta: 'Studio · 22 m² · On-campus', price: 3200, priceUnit: '/ month', 'featured chips': ["WiFi", "Furnished", "Air-con"], rating: 4.9 },
                { name: 'Markov Residence', subtitle: 'Hall', meta: 'Studio · 22 m² · On-campus', price: 3200, priceUnit: '/ month', 'featured chips': ["WiFi", "Furnished", "Air-con"], rating: 4.9 },
                { name: 'Markov Residence', subtitle: 'Hall', meta: 'Studio · 22 m² · On-campus', price: 3200, priceUnit: '/ month', 'featured chips': ["WiFi", "Furnished", "Air-con"], rating: 4.9 },
                { name: 'Markov Residence', subtitle: 'Hall', meta: 'Studio · 22 m² · On-campus', price: 3200, priceUnit: '/ month', 'featured chips': ["WiFi", "Furnished", "Air-con"], rating: 4.9 },
            ], 2: [
                { name: 'Elene Residence', subtitle: 'Hall', meta: 'Studio · 22 m² · On-campus', price: 3200, priceUnit: '/ month', 'featured chips': ["WiFi", "Furnished", "Air-con"], rating: 4.9 },
                { name: 'Elene Residence', subtitle: 'Hall', meta: 'Studio · 22 m² · On-campus', price: 3200, priceUnit: '/ month', 'featured chips': ["WiFi", "Furnished", "Air-con"], rating: 4.9 },
                { name: 'Elene Residence', subtitle: 'Hall', meta: 'Studio · 22 m² · On-campus', price: 3200, priceUnit: '/ month', 'featured chips': ["WiFi", "Furnished", "Air-con"], rating: 4.9 },
                { name: 'Elene Residence', subtitle: 'Hall', meta: 'Studio · 22 m² · On-campus', price: 3200, priceUnit: '/ month', 'featured chips': ["WiFi", "Furnished", "Air-con"], rating: 4.9 },
            ]
        });

    const [pageNumber, setPageNumber] = useState(0);
    const [pageLimits, setPageLimits] = useState([0, 2])

    // everything under here is for map
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

    const centerId = searchParams.get('center')
    const centeredAccommodation = centerId
        ? MOCK_ACCOMMODATIONS.find((a) => a.accommodationId === Number(centerId)) ?? null
        : null

    const [isBelowSm, setIsBelowSm] = useState(false);

    useEffect(() => {
        const media = window.matchMedia("(max-width: 639px)");

        const handleChange = (e: MediaQueryListEvent) => setIsBelowSm(e.matches);

        setIsBelowSm(media.matches);
        media.addEventListener("change", handleChange);

        return () => media.removeEventListener("change", handleChange);
    }, []);

    return <>
        <div className="flex w-full min-h-screen bg-[#F5EEF0]">
            <div className="relative z-[9999]">
                <Sidebar role="student" />
            </div>
            <div className="flex flex-col items-start w-full min-w-0 min-h-screen">

                <CustomHeader
                    title="Browse Rooms"></CustomHeader>

                <div className="w-full p-6 px-4">
                    <HeroBanner
                        greeting={heroContent.greeting}
                        name={heroContent.name}
                        title={heroContent.title}
                        subtitle={heroContent.subtitle}
                        type="mini"
                    />
                </div>
                

                <div className="flex flex-wrap justify-center items-start w-full gap-2 md:gap-0">

                    {/* first half */}
                    <div className="flex flex-col justify-center items-center w-full gap-2 md:w-1/2 shrink-0">
                        {/* search bar */}
                        <div className="flex w-full justify-center items-center px-4 sm:px-6 lg:px-12">
                            <SearchBar></SearchBar>
                        </div>

                        {/* dorm cards and buttons */}
                        <div className="flex w-full justify-center items-center p-4 gap-2">
                            <div className="flex justify-center items-center relative z-50">
                                <button onClick={() => {
                                    let counter = pageNumber
                                    if (counter == 0) {
                                        counter = Object.keys(dorms).length - 1
                                    } else {
                                        counter--
                                    }

                                    if (counter % 2 == 0 && counter != Object.keys(dorms).length - 1) {
                                        let temp = [...pageLimits]
                                        if (temp[0] - 2 >= 0) {
                                            temp[0] -= 2
                                            temp[1] -= 2
                                            setPageLimits(temp)
                                        }
                                    } else if (counter % 2 == 0 && counter == Object.keys(dorms).length - 1) {
                                        let max = Object.keys(dorms).length
                                        max = max % 2 == 0 ? max : max + 1
                                        let temp = [max - 2, max]
                                        setPageLimits(temp)
                                    }

                                    setPageNumber(counter)
                                }} className="rounded-full bg-gradient-to-b from-[#9b3b55] to-[#5a1e2f] flex items-center justify-center shadow-lg">
                                    <span className="text-white text-3xl">{'<'}</span>
                                </button>
                            </div>

                            <div className="flex">
                                <div
                                    className="flex"
                                    style={{
                                        transform: `translateX(-${100 * pageNumber}%)`,
                                        transition: 'transform 500ms ease-in-out',
                                    }}
                                >

                                    {Object.keys(dorms).map((key, index) => {
                                        console.log(isBelowSm)
                                        if (pageNumber == index) {
                                            return <div className={`w-full shrink-0 flex items-center transition-opacity duration-500 ${"opacity-500"
                                                }`}>
                                                <div className="grid grid-cols-2 gap-6 w-full mx-auto justify-items-center">
                                                    {dorms[Number(key)].map((value) => (
                                                        <div className="w-full flex items-center justify-center">
                                                            <DormCard {...{ ...value, isSmall: isBelowSm }} verified onView={() => { }} />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        } else {
                                            return <div className={`w-full h-full shrink-0 transition-opacity duration-500 ${"opacity-0"
                                                }`}>
                                                <div className="grid grid-cols-2 gap-4 w-full h-full mx-auto justify-items-center">
                                                    {dorms[Number(key)].map((value) => (
                                                        <div className="w-full flex items-center justify-center">
                                                            <DormCard {...{ ...value, isSmall: isBelowSm }} verified onView={() => { }} />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        }

                                    })}
                                </div>

                            </div>

                            <div className="flex justify-center items-center relative z-50">
                                <button onClick={() => {

                                    let counter = pageNumber
                                    if (counter == Object.keys(dorms).length - 1) {
                                        counter = 0
                                    } else {
                                        counter++
                                    }

                                    console.log(counter)
                                    if (counter % 2 == 0 && counter != 0) {
                                        let temp = [...pageLimits]
                                        let max = Object.keys(dorms).length
                                        max = max % 2 == 0 ? max : max + 1


                                        if (temp[1] + 2 <= max) {
                                            temp[0] += 2
                                            temp[1] += 2
                                            setPageLimits(temp)
                                        }
                                    } else if (counter % 2 == 0 && counter == 0) {
                                        let temp = [0, 2]
                                        setPageLimits(temp)
                                    }

                                    setPageNumber(counter)
                                }} className="rounded-full bg-gradient-to-b from-[#9b3b55] to-[#5a1e2f] flex items-center justify-center shadow-lg">
                                    <span className="text-white text-3xl">{'>'}</span>
                                </button>
                            </div>
                        </div>

                        <div className="flex justify-end items-center w-[70%] gap-2">
                            {pageLimits[0] != 0 &&
                                <button onClick={() => {
                                    let temp = [...pageLimits]
                                    if (temp[0] - 2 >= 0) {
                                        temp[0] -= 2
                                        temp[1] -= 2
                                        setPageLimits(temp)
                                        setPageNumber(temp[1] - 1)
                                    }
                                }} className="flex w-[10%] items-center justify-center rounded-xl bg-white text-lg font-semibold text-[#654050] shadow-md hover:bg-[#5a1021] hover:text-white border border-[#E8D4E2]">
                                    {'<'}
                                </button>
                            }
                            {
                                Object.keys(dorms).map((value, index) => {
                                    let start = pageLimits[0]
                                    let end = pageLimits[1]
                                    let current = parseInt(value) + 1
                                    if (current >= start && current <= end) {
                                        return <button onClick={() => {
                                            setPageNumber(current - 1)
                                        }} className={`flex w-[10%] items-center justify-center rounded-xl ${pageNumber == index ? '' : 'border border-[#E8D4E2]'} ${pageNumber == index ? 'bg-[#7A162D]' : 'bg-white'} text-lg font-semibold ${pageNumber == index ? 'text-white' : 'text-[#654050]'} shadow-md hover:bg-[#7A162D] hover:text-white`}>
                                            {current}
                                        </button>
                                    }
                                })
                            }
                            {
                                pageLimits[1] < Object.keys(dorms).length &&
                                <button onClick={() => {
                                    let temp = [...pageLimits]
                                    let max = Object.keys(dorms).length
                                    max = max % 2 == 0 ? max : max + 1

                                    if (temp[1] + 2 <= max) {
                                        temp[0] += 2
                                        temp[1] += 2
                                        setPageLimits(temp)
                                        setPageNumber(temp[0] - 1)
                                    }
                                }} className="flex w-[10%] items-center justify-center rounded-xl bg-white text-lg font-semibold text-[#654050] shadow-md hover:bg-[#5a1021] hover:text-white border border-[#E8D4E2]">
                                    {'>'}
                                </button>
                            }

                        </div>

                    </div>

                    {/* second half */}
                    <div className="flex justify-center rounded-xl items-start w-full h-[70%] md:w-1/2 md:h-full shrink-0 relative z-50 bg-[radial-gradient(circle_at_center,#F5EEF0)]">
                        <div className="flex flex-col justify-center items-center bg-white rounded-2xl p-4 shadow-md w-[90%] h-full gap-2">

                            <AccommodationMap
                                accommodations={filtered}
                                centeredAccommodation={centeredAccommodation}
                                onCardClick={(acc) => navigate(`/accommodations/${acc.accommodationId}`)}
                            />


                            <div className="flex justify-center items-center w-[90%] gap-3">
                                <Form></Form>
                            </div>
                        </div>
                    </div>
                </div>

            </div >
        </div>
    </>
}