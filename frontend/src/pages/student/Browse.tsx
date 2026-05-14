import { createContext, useContext, useEffect, useRef, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import AccommodationMap, { type AccommodationPin } from '../../components/AccommodationMapsBrowse'
import { Star, SlidersHorizontal, MapPin, X, BookmarkCheck, ChevronRight } from "lucide-react"
import Sidebar from "../../components/Sidebar"
import CustomHeader from '../../components/CustomHeader'
import PriceRangeSlider from "../../components/PriceRangeSlider"
import HeroBanner from "@/components/dashboard/HeroBanner"
import Pagination from "@/components/ApplicationStatus/Pagination"
import { useQuery } from "@tanstack/react-query"
import { api } from "../../api/axios"
import UbleLoader from "../shared/LoadingPage"
import defaultAccommodation from "../../assets/defaults/accommodation.png";

/* ─── Context ──────────────────────────────────────────────────────────────── */
type FilterContextType = {
    dormType: string; setDormType: (v: string) => void
    minPrice: number; setMinPrice: (v: number) => void
    maxPrice: number; setMaxPrice: (v: number) => void
    roomType: string; setRoomType: (v: string) => void
    starRating: number; setStarRating: (v: number) => void
    onlyBookmarked: boolean; setOnlyBookmarked: (v: boolean) => void
    searching: string; setSearching: (v: string) => void
    filters: { [key: string]: boolean }; setFilters: (v: { [key: string]: boolean }) => void
    setFilterPanelOpen: (v: boolean) => void
    origMin: number; origMax: number; setOrigMin: (v: number) => void; setOrigMax: (v: number) => void;
    setFilterInEffect: (v: boolean) => void; setSearched: (v: boolean) => void;
    setSliderResetKey: (v: number) => void; sliderResetKey: number;
}
export const filterContext = createContext<FilterContextType | undefined>(undefined)

/* ─── Dorm tile type ───────────────────────────────────────────────────────── */
type Dorm = {
    name: string; subtitle: string; meta: string
    minPrice: number; maxPrice: number; priceUnit: string
    rating: string; accommodationId: number; tags: string[]
    bookmarked?: boolean; primaryImageUrl: string;
}

/* ══════════════════════════════════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════════════════════════════════ */
const ITEMS_PER_PAGE = 4;

export default function BrowsePage() {
    const [searchTerm, setSearchTerm] = useState("")
    const [activeFilter, setActiveFilter] = useState("All")
    const [onlyBookmarked, setOnlyBookmarked] = useState(false)
    const [minPrice, setMinPrice] = useState(500)
    const [maxPrice, setMaxPrice] = useState(7000)
    const [origMin, setOrigMin] = useState(800)
    const [origMax, setOrigMax] = useState(7000)
    const [dormType, setDormType] = useState("All")
    const [roomType, setRoomType] = useState("All")
    const [starRating, setStarRating] = useState(3)
    const [searching, setSearching] = useState("")
    const [filterPanelOpen, setFilterPanelOpen] = useState(false)
    const [hoveredId, setHoveredId] = useState<number | null>(null)
    const [filters, setFilters] = useState<{ [key: string]: boolean }>({
        "Near campus": false, "Pet friendly": false, "Near establishments": false,
        "Air-conditioned rooms": false, "Has study area": false,
        "24/7 security": false, "Has curfew": false, "Has canteen": false,
    })
    const [uniqueTags, setUniqueTags] = useState<string[]>([]);
    const [filterInEffect, setFilterInEffect] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [searched, setSearched] = useState(false);
    const [sliderResetKey, setSliderResetKey] = useState(0);
    const navigate = useNavigate()

    const { data: accommodations = [], isError: accommodationsError, isSuccess, isLoading: accLoading } = useQuery({
        queryKey: ["accommodations", searchTerm, activeFilter],
        queryFn: async () => {
            const params: Record<string, any> = {}
            if (searchTerm.trim()) params.search = searchTerm.trim()
            if (activeFilter !== "All") {
                if (activeFilter === "On-Campus") params.dormType = "On-Campus"
                else if (activeFilter === "Off-Campus") params.dormType = "Off-Campus"
                else if (activeFilter === "UPLB Partner") params.dormType = "UPLB Partner"
            }
            const res = await api.get("/accommodations", { params })
            setFilterInEffect(true)
            return Array.isArray(res.data) ? res.data : []
        },
        staleTime: 60_000,
        gcTime: 5 * 60_000,
        placeholderData: (prev: any) => prev,
    })

    const { data: user, isError } = useQuery({
        queryKey: ["me"],
        queryFn: async () => {
            const res = await api.get("/me")
            return res.data
        },
    })

    const name = user ? `${user.fname}` : ""
    const studentNo = user?.student?.studentNumber ?? ""

    useEffect(() => { if (isError) navigate("/auth/signin") }, [isError, navigate])
    useEffect(() => { if (user && user.role !== "student") navigate("/auth/signin") }, [user, navigate])

    const [flatDorms, setFlatDorms] = useState<Dorm[]>([])
    const [mapAccommodations, setMapAccommodations] = useState<AccommodationPin[]>([])

    // Reset to first page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [dormType, minPrice, maxPrice, roomType, starRating, onlyBookmarked, searching, filters]);

    useEffect(() => {
        if (!isSuccess || accommodations.length === 0) return

        
        let min = Infinity
        let max = -Infinity
        const tagSet = new Set<string>();

        accommodations.forEach(({ rooms, tags }) => {
            rooms.forEach((el: { roomRent: number }) => {
                const rent = Number(el.roomRent)

                if (rent < min) min = rent
                if (rent > max) max = rent
            })

            tags.forEach((el: { tagDetail: string }) => {
                tagSet.add(el.tagDetail);
            });
        })

        const tags = Array.from(tagSet)
        const tagObject = Object.fromEntries(
            tags.map(tag => [tag, false])
        );
        console.log("success", accommodations, min, max)
        setFilters(tagObject)
        setMinPrice(min)
        setMaxPrice(max)
        setOrigMin(min)
        setOrigMax(max)
        setSliderResetKey(prev => prev + 1)

    }, [isSuccess, accommodations])

    useEffect(() => {
        const tempPins: AccommodationPin[] = []
        const tempDorms: Dorm[] = []
        if (!filterInEffect && !searched) {
            return
        }

        setFilterInEffect(false);
        setSearched(false)

        for (let i = 0; i < accommodations.length; i++) {
            const {
                id, accommodationName, accommodationLocation, accommodationType,
                accommodationCapacity, tenantRestriction, latitude, longitude,
                walkingDistance, drivingDistance, bikingDistance,
                rooms, reviews, bookmarks, tags, primaryImageUrl
            } = accommodations[i]


            let minimum = -1, maximum = -1
            const roomTypes = new Set<string>()
            let rating = "6"
            const trueTags: string[] = []
            const tempTags: string[] = []
            let bookmarked = false

            Object.keys(filters).forEach(k => { if (filters[k]) trueTags.push(k) })
            Object.keys(tags).forEach((k: string) => { tempTags.push(tags[k].tagDetail) })

            rooms.forEach((el: { roomRent: number; roomType: string }) => {
                roomTypes.add(el.roomType)
                const rent = Number(el.roomRent)
                if (minimum === -1) {
                    minimum = rent
                }
                if (maximum === -1) {
                    maximum = rent
                }
                if (rent < minimum) minimum = rent
                if (rent > maximum) maximum = rent
            })

            reviews.forEach((el: { rating: number }) => {
                if (Number(el.rating) < Number(rating))
                    rating = Number(el.rating).toFixed(1)
            })
            
            bookmarks.forEach((el: { studentNumber: string }) => {
                if (el.studentNumber === studentNo) bookmarked = true
            })

            /* search match */
            const nameMatch = searching === "" || accommodationName.toLowerCase().includes(searching)
            if (!nameMatch) {
                continue
            }

            /* filters */
            if (!bookmarked && onlyBookmarked) {
                continue
            }
            if (Number(rating) < starRating) {
                continue
            }
            if (minimum < minPrice || maximum > maxPrice) {
                continue
            }
            if (dormType !== "All" && accommodationType !== dormType.toLowerCase()) {
                continue
            }
            if (roomType !== "All" && !roomTypes.has(roomType.toLowerCase())) {
                continue
            }
            if (trueTags.length !== 0) {
                const hasTag = trueTags.every(t => tempTags.includes(t))
                if (!hasTag) {
                    continue
                }
            }

            tempDorms.push({
                name: accommodationName, subtitle: accommodationLocation,
                meta: accommodationType, minPrice: minimum, maxPrice: maximum,
                priceUnit: "/ month", rating: rating == "6" ? "0" : rating, accommodationId: id,
                tags: tempTags, bookmarked, primaryImageUrl
            })

            tempPins.push({
                accommodationId: id, accommodationName, accommodationLocation,
                accommodationType, accommodationCapacity, tenantRestriction,
                latitude, longitude, minRent: minimum, maxRent: maximum,
                walkingDistance, drivingDistance, bikingDistance,
                rating: rating == "6" ? "0" : rating, price: 500, maxPrice: maximum, minPrice: minimum,
            })
        }

        setFlatDorms(tempDorms)
        setMapAccommodations(tempPins)
    }, [accommodations, dormType, minPrice, maxPrice, roomType, starRating, onlyBookmarked, searching, filters, studentNo, filterPanelOpen])

    // Pagination logic
    const totalPages = Math.ceil(flatDorms.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedDorms = flatDorms.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    /* map URL params — untouched */
    const [searchParams] = useSearchParams()
    const centerId = searchParams.get("center")
    const centeredAccommodation = centerId
        ? mapAccommodations.find(a => a.accommodationId === Number(centerId)) ?? null
        : null

    /* active filter chip labels */
    const activeChips: string[] = []
    if (dormType !== "All") activeChips.push(`Type: ${dormType}`)
    if (roomType !== "All") activeChips.push(`Room: ${roomType}`)
    if (onlyBookmarked) activeChips.push("Saved only")
    Object.keys(filters).forEach(k => { if (filters[k]) activeChips.push(k) })

    /* ══════════════════════════════════════════════════════════════════════════
       RENDER
    ══════════════════════════════════════════════════════════════════════════ */
    if (accLoading && accommodations.length === 0) {
        return <UbleLoader />
    }

    return (
        <filterContext.Provider value={{
            dormType, setDormType, minPrice, setMinPrice, maxPrice, setMaxPrice,
            roomType, setRoomType, starRating, setStarRating, onlyBookmarked, setOnlyBookmarked,
            searching, setSearching, filters, setFilters, setFilterPanelOpen, origMin, origMax, setFilterInEffect, setOrigMin, setOrigMax, setSearched,
            setSliderResetKey, sliderResetKey
        }}>
            <div className="flex flex-row w-full min-h-screen bg-[#F6F2F4]">

                {/* Sidebar */}
                <div className="relative z-[9999]">
                    <Sidebar role="student" />
                </div>

                {/* Main */}
                <div className="flex flex-col w-full min-w-0 h-screen overflow-hidden">
                    <CustomHeader title="Browse Rooms" />

                    {/* Scrollable content */}
                    <div className="flex-1 overflow-y-auto">

                        
                        {/* Hero */}
                        <div className="w-full px-4 sm:px-6 pt-6 pb-2">
                            <HeroBanner
                                greeting="Good Day" name={name}
                                title="Browse available rooms"
                                subtitle="Browse available accommodations and apply in just a few clicks"
                                type="mini"
                            />
                        </div>

                        {/* Toolbar */}
                        <div className="flex items-center gap-3 px-4 sm:px-6 py-3">
                            <SearchBar />
                            <button
                                onClick={() => setFilterPanelOpen(true)}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#E8D4DF] bg-white text-[#6B0F2B] text-sm font-semibold shadow-sm hover:bg-[#F5ECF0] transition-colors shrink-0"
                            >
                                <SlidersHorizontal size={15} />
                                <span className="hidden sm:inline">Filters</span>
                                {activeChips.length > 0 && (
                                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#6B0F2B] text-white text-[10px] font-bold">
                                        {activeChips.length}
                                    </span>
                                )}
                            </button>
                        </div>

                        {/* Active filter chips */}
                        {activeChips.length > 0 && (
                            <div className="flex flex-wrap gap-2 px-4 sm:px-6 pb-2">
                                {activeChips.map(chip => (
                                    <span key={chip} className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-semibold bg-[#6B0F2B]/10 text-[#6B0F2B]">
                                        {chip}
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* Body */}
                        <div className="flex flex-col lg:flex-row gap-4 px-4 sm:px-6 pb-8 h-[calc(100vh-280px)] min-h-[600px]">

                            {/* ── LEFT: List ── */}
                            <div className="flex flex-col w-full lg:w-[45%] shrink-0 min-h-0">
                                <div className="flex items-center justify-between mb-3 shrink-0">
                                    <p className="text-[#1C0A11] font-semibold text-sm">
                                        {flatDorms.length > 0 ? (
                                            <>
                                                <span className="text-[#6B0F2B] font-bold">{flatDorms.length}</span>
                                                {" "}accommodation{flatDorms.length !== 1 ? "s" : ""} found
                                            </>
                                        ) : "No accommodations found"}
                                    </p>
                                </div>

                                <div className="flex flex-col min-h-0 flex-1">

                                    {/* Scrollable cards */}
                                    <div className="flex flex-col gap-3 overflow-y-auto pr-2 min-h-0 flex-1">
                                        {paginatedDorms.length === 0 ? (
                                            <div className="flex flex-col items-center justify-center h-72 gap-3 text-[#9A7080]">
                                                <MapPin size={40} strokeWidth={1.3} />
                                                <p className="text-sm font-medium">
                                                    No results match your current filters
                                                </p>
                                                <p className="text-xs">
                                                    Try adjusting the filters or search term
                                                </p>
                                            </div>
                                        ) : (
                                            paginatedDorms.map(dorm => (
                                                <DormTile
                                                    key={dorm.accommodationId}
                                                    dorm={dorm}
                                                    hovered={hoveredId === dorm.accommodationId}
                                                    onHover={setHoveredId}
                                                    onClick={() =>
                                                        navigate(`/student/roomview/${dorm.accommodationId}`)
                                                    }
                                                />
                                            ))
                                        )}
                                    </div>

                                    {/* Fixed pagination */}
                                    {totalPages > 1 && (
                                        <div className="pt-6 pb-2 flex justify-center shrink-0 bg-[#F6F2F4]">
                                            <Pagination
                                                currentPage={currentPage}
                                                totalPages={totalPages}
                                                onPageChange={setCurrentPage}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* ── RIGHT: Map ── */}
                            <div className="flex flex-col w-full lg:flex-1 rounded-2xl overflow-hidden border border-[#E8D4DF] shadow-md min-h-[400px] lg:min-h-0 relative z-50">
                                <div className="flex items-center gap-2 px-5 py-3 bg-white border-b border-[#E8D4DF] shrink-0">
                                    <MapPin size={14} className="text-[#6B0F2B]" />
                                    <span className="text-[#1C0A11] font-semibold text-sm">Map view</span>
                                    <span className="ml-auto text-xs text-[#9A7080] font-medium">
                                        {mapAccommodations.length} pinned
                                    </span>
                                </div>
                                <div className="flex-1 min-h-0">
                                    <AccommodationMap
                                        accommodations={mapAccommodations}
                                        centeredAccommodation={centeredAccommodation}
                                        onCardClick={acc => navigate(`/student/roomview/${acc.accommodationId}`)}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Backdrop */}
                <div
                    onClick={() => setFilterPanelOpen(false)}
                    className={`fixed inset-0 bg-[#1C0A11]/30 backdrop-blur-sm z-[8999] transition-opacity duration-300
                        ${filterPanelOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
                />

                {/* Filter slide-in panel */}
                <div className={`fixed top-0 right-0 bottom-0 w-full max-w-[420px] bg-white z-[9000] shadow-2xl border-l border-[#E8D4DF] overflow-y-auto transition-transform duration-300 ease-in-out
                    ${filterPanelOpen ? "translate-x-0" : "translate-x-full"}`}>
                    <div className="px-7 pt-7">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-[#1C0A11] font-bold text-xl tracking-tight">Filter results</h2>
                            <button
                                onClick={() => setFilterPanelOpen(false)}
                                className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#F5ECF0] text-[#6B0F2B] hover:bg-[#E8D4DF] transition-colors"
                            >
                                X
                            </button>
                        </div>
                        <FilterForm origFilters={filters} onClose={() => {
                            setFilterInEffect(true)
                            setFilterPanelOpen(false)
                        }} />
                    </div>
                </div>

            </div>
        </filterContext.Provider>
    )
}

function DormTile({
    dorm, hovered, onHover, onClick,
}: {
    dorm: Dorm
    hovered: boolean
    onHover: (id: number | null) => void
    onClick: () => void
}) {
    const ratingNum = parseFloat(dorm.rating)
    const validRating = !isNaN(ratingNum) && ratingNum <= 5
    const isOnCampus = dorm.meta?.toLowerCase().includes("campus")
    

    return (
        <div
            onMouseEnter={() => onHover(dorm.accommodationId)}
            onMouseLeave={() => onHover(null)}
            onClick={onClick}
            className={`group flex flex-col sm:flex-row gap-0 bg-white rounded-2xl border cursor-pointer transition-all duration-200 overflow-hidden min-h-[150px]                
                ${hovered
                    ? "border-[#6B0F2B] shadow-lg shadow-[#6B0F2B]/10 -translate-y-0.5"
                    : "border-[#E8D4DF] shadow-sm hover:border-[#6B0F2B]/40 hover:shadow-md hover:-translate-y-0.5"
                }`}
        >
            {/* Thumbnail */}
            <div className="relative w-full h-36 sm:w-40 sm:h-auto shrink-0 overflow-hidden">
                <img
                    src={dorm.primaryImageUrl}
                    alt={dorm.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                        e.currentTarget.src = defaultAccommodation;
                      }}
                />
            </div>

            {/* Content */}
            <div className="flex flex-col gap-3 flex-1 py-3 px-3 sm:py-3.5 sm:px-4 min-w-0">
                <div>
                    {/* Name row */}
                    <div className="flex items-start justify-between gap-2 mb-0.5">
                        <h3 className="text-[#1C0A11] font-bold text-sm leading-snug line-clamp-1">
                            {dorm.name}
                        </h3>
                        {dorm.bookmarked && (
                            <BookmarkCheck size={14} className="text-[#6B0F2B] shrink-0 mt-0.5" />
                        )}
                    </div>

                    {/* Location */}
                    <p className="text-[#9A7080] text-[11px] mb-2 truncate">{dorm.subtitle}</p>

                    {/* Badges */}
                    <div className="flex flex-wrap gap-1 mb-2">
                        {dorm.meta && (
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wide whitespace-nowrap
                                ${isOnCampus ? "bg-amber-100 text-amber-700" : "bg-rose-50 text-[#6B0F2B]"}`}>
                                {dorm.meta}
                            </span>
                        )}
                        {dorm.tags.slice(0, 2).map(tag => (
                            <span key={tag} className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-medium bg-[#F5ECF0] text-[#6B0F2B] border border-[#E8D4DF] whitespace-nowrap">
                                {tag}
                            </span>
                        ))}
                        {dorm.tags.length > 2 && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-medium text-[#9A7080] whitespace-nowrap">
                                +{dorm.tags.length - 2}
                            </span>
                        )}
                    </div>
                </div>

                {/* Price + rating + CTA */}
                <div className="flex items-end justify-between gap-2">
                    <div className="min-w-0">
                        <p className="text-[#6B0F2B] font-bold text-sm leading-none truncate">
                            ₱{dorm.minPrice > 0 ? dorm.minPrice.toLocaleString() : "—"}
                            {dorm.maxPrice > dorm.minPrice && (
                                <span className="text-xs"> – {dorm.maxPrice.toLocaleString()}</span>
                            )}
                        </p>
                        <p className="text-[#9A7080] text-[10px] mt-0.5">{dorm.priceUnit}</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                        {validRating && (
                            <div className="flex items-center gap-1">
                                <Star size={11} fill="#C0934B" stroke="none" />
                                <span className="text-[#C0934B] font-bold text-[11px]">
                                    {dorm.rating == "0" ? "unrated" : dorm.rating}
                                </span>
                            </div>
                        )}
                        <span className={`flex items-center gap-0.5 text-[11px] font-semibold transition-colors whitespace-nowrap
                            ${hovered ? "text-[#6B0F2B]" : "text-[#9A7080] group-hover:text-[#6B0F2B]"}`}>
                            View
                            <ChevronRight size={12} />
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )
}

/* ══════════════════════════════════════════════════════════════════════════════
   SEARCH BAR
══════════════════════════════════════════════════════════════════════════════ */
function SearchBar() {
    const context = useContext(filterContext)
    if (!context) throw new Error("FilterContext must be used within a Provider")
    const { setSearching, setSearched } = context

    return (
        <div className="flex-1 flex items-center gap-2 bg-white rounded-xl border border-[#E8D4DF] px-3.5 py-2 shadow-sm focus-within:border-[#6B0F2B] focus-within:ring-2 focus-within:ring-[#6B0F2B]/10 transition-all">
            <svg className="w-4 h-4 text-[#9A7080] shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
                id="search-bar"
                type="text"
                placeholder="Search dormitory name…"
                className="flex-1 text-sm text-[#1C0A11] placeholder-[#C8B0B8] outline-none bg-transparent"
                autoComplete="off"
                onChange={() => {
                    const input = document.getElementById("search-bar") as HTMLInputElement
                    setSearching(input.value.trim().toLowerCase())
                    setSearched(true)
                }}
            />
       
        </div>
    )
}

/* ══════════════════════════════════════════════════════════════════════════════
   FILTER FORM
══════════════════════════════════════════════════════════════════════════════ */
function FilterForm({ onClose, origFilters }: { onClose: () => void; origFilters: { [key: string]: boolean } }) {
    const context = useContext(filterContext)
    if (!context) throw new Error("FilterContext must be used within a Provider")
    const {
        dormType, setDormType, minPrice, setMinPrice, maxPrice, setMaxPrice,
        roomType, setRoomType, starRating, setStarRating,
        onlyBookmarked, setOnlyBookmarked, filters, setFilters, setFilterPanelOpen, origMin, origMax, setSliderResetKey, sliderResetKey,
        setFilterInEffect, setOrigMin, setOrigMax
    } = context


    const [openDormCabinet, setDormCabinet] = useState(false)
    const [openRoomCabinet, setRoomCabinet] = useState(false)
    const [selectedDorm, setSelectedDorm] = useState("All")
    const [selectedRoom, setSelectedRoom] = useState("All")

    const originalFilters = Object.fromEntries(
        Object.keys(origFilters).map((key) => [key, false])
    ) as Record<string, boolean>;

    const resetAll = () => {
        let temp = sliderResetKey
        setFilters(originalFilters); setStarRating(3); setOnlyBookmarked(false)
        setDormType("All"); setRoomType("All"); setMinPrice(origMin); setMaxPrice(origMax);
        setFilterPanelOpen(false); setFilterInEffect(true); setSliderResetKey(temp + 1);
        setSelectedDorm("All"); setSelectedRoom("All");
    }
    
    const Divider = () => <div className="h-px bg-[#F0E4E9] my-5" />
    const [minimumOrig, setMinimumOrig] = useState(origMin);
    const [maximumOrig, setMaximumOrig] = useState(origMax);
    const [range, setRange] = useState({ min: 0, max: 100 });
    const handleRangeChange = (value: { min: number; max: number }) => {
        setRange(value);
        setMinPrice(value.min)
        setMaxPrice(value.max)
    };

    return (
        <div className="pb-4">

            {/* Saved only */}
            <p className="text-[10px] font-bold tracking-[0.14em] uppercase text-[#9A7080] mb-2">Show saved only</p>
            <div className="flex items-center justify-between px-4 py-3 rounded-xl border border-[#F0E4E9] bg-[#F6F2F4]">
                <div>
                    <p className="text-[#1C0A11] font-semibold text-sm mb-0.5">Saved Rooms</p>
                    <p className="text-[#9A7080] text-xs">Show only bookmarked dorms</p>
                </div>
                <button
                    className={`relative w-11 h-6 rounded-full border-none transition-colors duration-200 ${onlyBookmarked ? "bg-[#6B0F2B]" : "bg-[#E8D4DF]"}`}
                    onClick={() => setOnlyBookmarked(!onlyBookmarked)}
                >
                    <span className={`absolute top-[3px] w-[18px] h-[18px] rounded-full bg-white shadow transition-transform duration-200 ${onlyBookmarked ? "translate-x-[2px]" : "translate-x-[-19px]"}`} />
                </button>
            </div>

            <Divider />

            {/* Dorm type */}
            <p className="text-[10px] font-bold tracking-[0.14em] uppercase text-[#9A7080] mb-2">Dorm type</p>
            <Dropdown
                title="Dorm type"
                items={[
                    { label: "All", href: "" },
                    { label: "On-campus", href: "" },
                    { label: "Off-campus", href: "" },
                    { label: "Partner-housing", href: "" },
                ]}
                onSelect={setDormType}
                showTitle={false} direction="down"
                widthClass="w-full" titleClass="text-[10px] lg:text-[11px]"
                selectedClass="text-[12px] lg:text-[13px] text-left block pl-2"
                setOpen={setDormCabinet}
                setClose={setRoomCabinet}
                open={openDormCabinet}
                setSelected={setSelectedDorm}
                selected={selectedDorm}
            />

            <Divider />

            {/* Room type */}
            <p className="text-[10px] font-bold tracking-[0.14em] uppercase text-[#9A7080] mb-2">Room type</p>
            <Dropdown
                title="Room type"
                items={[
                    { label: "All", href: "" },
                    { label: "Single", href: "" },
                    { label: "Double", href: "" },
                    { label: "Shared", href: "" },
                ]}
                onSelect={setRoomType}
                showTitle={false} direction="down"
                widthClass="w-full" titleClass="text-[10px] lg:text-[11px]"
                selectedClass="text-[12px] lg:text-[13px] text-left block pl-2"
                setOpen={setRoomCabinet}
                setClose={setDormCabinet}
                open={openRoomCabinet}
                setSelected={setSelectedRoom}
                selected={selectedRoom}
            />

            <Divider />

            {/* Star rating */}
            <p className="text-[10px] font-bold tracking-[0.14em] uppercase text-[#9A7080] mb-2">Minimum rating</p>
            <div className="flex items-center gap-3">
                <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                        <button key={i} type="button" onClick={() => setStarRating(i + 1)}
                            className="p-0.5 bg-transparent border-none cursor-pointer">
                            <Star size={22} fill={i < starRating ? "#C0934B" : "#E8D4DF"} stroke="none" />
                        </button>
                    ))}
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-[#C0934B]">
                    {starRating}+
                </span>
            </div>

            <Divider />

            {/* Price range */}
            <p className="text-[10px] font-bold tracking-[0.14em] uppercase text-[#9A7080] mb-2">Price range</p>
            <div className="px-2">
                <PriceRangeSlider key={sliderResetKey} min={origMin} max={origMax} onChange={handleRangeChange}></PriceRangeSlider>
            </div>

            <Divider />

            {/* Amenity tags */}
            <p className="text-[10px] font-bold tracking-[0.14em] uppercase text-[#9A7080] mb-2">Amenities & features</p>
            <div className="flex flex-wrap gap-2">
                {Object.keys(filters).map(value => (
                    <button
                        key={value}
                        onClick={() => setFilters({ ...filters, [value]: !filters[value] })}
                        className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all active:scale-95
                            ${filters[value]
                                ? "bg-[#6B0F2B] text-white border-[#6B0F2B]"
                                : "bg-transparent text-[#6B0F2B] border-[#6B0F2B] hover:bg-[#F5ECF0]"
                            }`}
                    >
                        {value}
                    </button>
                ))}
            </div>

            <Divider />

            {/* Buttons */}
            <div className="flex gap-3 mb-8">
                <button
                    onClick={resetAll}
                    className="flex-1 py-2.5 rounded-xl border border-[#E8D4DF] bg-white text-[#9A7080] text-sm font-semibold hover:bg-[#F5ECF0] transition-colors"
                >
                    Reset
                </button>
                <button
                    onClick={onClose}
                    className="flex-[2] py-2.5 rounded-xl bg-[#6B0F2B] hover:bg-[#8A1C3D] text-white text-sm font-semibold transition-colors"
                >
                    Apply filters
                </button>
            </div>

        </div>
    )
}

interface DropdownProps {
    title: string;
    items: { label: string; href: string }[];
    onSelect?: (label: string) => void;
    direction?: "up" | "down";
    widthClass?: string;
    titleClass?: string;
    selectedClass?: string;
    showTitle?: boolean;
    setOpen: (label: boolean) => void;
    setClose: (label: boolean) => void;
    selected: string;
    setSelected: (label: string) => void;
    open: boolean;
  }
  
  function Dropdown({ showTitle = true, title, items, onSelect, direction = "down", widthClass = "w-32", titleClass = "text-[10px]", selectedClass = "text-[12px]", setOpen, setClose, open, setSelected, selected }: DropdownProps) {
    
    const [isMobile, setIsMobile] = useState(false);
  
    useEffect(() => {
      const check = () => setIsMobile(window.innerWidth < 1024);
      check();
      window.addEventListener('resize', check);
      return () => window.removeEventListener('resize', check);
    }, []);
  
    return (
      <div className="relative h-12">
        <button
          onClick={() => {
            setClose(false)
            setOpen(!open)}}
          type="button"
          className={`h-full px-2 py-1 border-2 lg:border-3 border-[#6B0F2B] border-opacity-10 bg-white rounded-[8.8px] flex items-center justify-between gap-4 ${widthClass}`}
        >
          <div className="flex flex-col items-start overflow-hidden w-full">
            <span className={showTitle ? `${titleClass} text-[#9A7080] uppercase` : 'hidden'}>{title}</span>
            <span className={`${selectedClass} font-medium text-gray-800 truncate w-full`}>{selected}</span>
          </div>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24">
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 9-7 7-7-7"/>
          </svg>
        </button>
  
        {open && (
          <div className={`absolute mt-1 bg-white w-full border-2 border-[#6B0F2B] border-opacity-10 rounded-[8.8px] shadow-lg z-30 ${
            direction === "up" ? "bottom-full mb-1" : "top-full mt-1" }`}>
            <ul className="p-2 text-sm">
              {items.map((item) => (
                <li key={item.label}>
                  <a
                    onClick={() => { 
                      setSelected(item.label); 
                      setOpen(false); 
                      onSelect?.(item.label);
                    }}
                    className="text-[12px] block p-2 justify-start hover:bg-[#6B0F2B] hover:text-white transition-all rounded w-50"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }
