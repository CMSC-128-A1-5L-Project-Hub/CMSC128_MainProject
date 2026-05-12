import { createContext, useContext, useEffect, useRef, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import AccommodationMap, { type AccommodationPin } from '../../components/AccommodationMapsBrowse'
import { Star, SlidersHorizontal, MapPin, X, BookmarkCheck, ChevronRight } from "lucide-react"
import Sidebar from "../../components/Sidebar"
import CustomHeader from '../../components/CustomHeader'
import PriceRangeSlider from "../../components/PriceRangeSlider"
import HeroBanner from "@/components/dashboard/HeroBanner"
import Dropdown from "../../components/ApplicationStatus/Dropdown"
import Pagination from "@/components/ApplicationStatus/Pagination"
import { useQuery } from "@tanstack/react-query"
import { api } from "../../api/axios"
import UbleLoader from "../shared/LoadingPage"

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
    setFilterInEffect: (v: boolean) => void;
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
            console.log("done loading")
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

    const name = user ? `${user.fname} ${user.lname}` : ""
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
        setFilters(tagObject)
        setMinPrice(min)
        setMaxPrice(max)
        setOrigMin(min)
        setOrigMax(max)

    }, [isSuccess, accommodations])

    useEffect(() => {
        const tempPins: AccommodationPin[] = []
        const tempDorms: Dorm[] = []
        if (!filterInEffect) {
            console.log("broken", filterInEffect)
            return
        }

        console.log("yahooo")
        console.log(accommodations)
        setFilterInEffect(false);

        for (let i = 0; i < accommodations.length; i++) {
            console.log(i)
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
                console.log(accommodationName, "not matched book")
                continue
            }
            if (Number(rating) < starRating) {
                console.log(accommodationName, "not matched rate")
                continue
            }
            if (minimum < minPrice || maximum > maxPrice) {
                console.log(accommodationName, "not matched price", minimum, minPrice, maximum, maxPrice)
                continue
            }
            if (dormType !== "All" && accommodationType !== dormType) {
                console.log(accommodationName, "not dormtype")
                continue
            }
            if (roomType !== "All" && !roomTypes.has(roomType)) {
                console.log(accommodationName, "not matched room")
                continue
            }
            if (trueTags.length !== 0) {
                const hasTag = trueTags.every(t => tempTags.includes(t))
                if (!hasTag) {
                    console.log(accommodationName, "not matched tags")
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
            searching, setSearching, filters, setFilters, setFilterPanelOpen, origMin, origMax, setFilterInEffect, setOrigMin, setOrigMax
        }}>
            <div className="flex flex-row w-full min-h-screen bg-[#FDF8FA]">

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
                                        <div className="pt-6 pb-2 flex justify-center shrink-0 bg-[#FDF8FA]">
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
            <div className="relative w-40 shrink-0 overflow-hidden">
                <img
                    src={dorm.primaryImageUrl}
                    alt={dorm.name}
                    className="w-full h-full object-cover"
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
    const { setSearching } = context

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
            />
            <button
                onClick={() => {
                    const input = document.getElementById("search-bar") as HTMLInputElement
                    setSearching(input.value.trim().toLowerCase())
                }}
                className="bg-[#6B0F2B] hover:bg-[#8A1C3D] text-white text-xs font-semibold px-4 py-1.5 rounded-lg transition-colors shrink-0"
            >
                Search
            </button>
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
        onlyBookmarked, setOnlyBookmarked, filters, setFilters, setFilterPanelOpen, origMin, origMax,
        setFilterInEffect, setOrigMin, setOrigMax
    } = context

    const originalFilters = Object.fromEntries(
        Object.keys(origFilters).map((key) => [key, false])
    ) as Record<string, boolean>;

    const resetAll = () => {
        setFilters(originalFilters); setStarRating(3); setOnlyBookmarked(false)
        setDormType("All"); setRoomType("All"); setMinPrice(origMin); setMaxPrice(origMax);
        setFilterPanelOpen(false); setFilterInEffect(true);
        setSliderResetKey(prev => prev + 1);
    }

    const Divider = () => <div className="h-px bg-[#F0E4E9] my-5" />
    const [sliderResetKey, setSliderResetKey] = useState(0);
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
            <div className="flex items-center justify-between px-4 py-3 rounded-xl border border-[#F0E4E9] bg-[#FDF8FA]">
                <div>
                    <p className="text-[#1C0A11] font-semibold text-sm mb-0.5">Saved Rooms</p>
                    <p className="text-[#9A7080] text-xs">Show only bookmarked dorms</p>
                </div>
                <button
                    className={`relative w-11 h-6 rounded-full border-none transition-colors duration-200 ${onlyBookmarked ? "bg-[#6B0F2B]" : "bg-[#E8D4DF]"}`}
                    onClick={() => setOnlyBookmarked(!onlyBookmarked)}
                >
                    <span className={`absolute top-[3px] w-[18px] h-[18px] rounded-full bg-white shadow transition-transform duration-200 ${onlyBookmarked ? "translate-x-[22px]" : "translate-x-[2px]"}`} />
                </button>
            </div>

            <Divider />

            {/* Dorm type */}
            <p className="text-[10px] font-bold tracking-[0.14em] uppercase text-[#9A7080] mb-2">Dorm type</p>
            <Dropdown
                title="Dorm type"
                items={[
                    { label: "All", href: "" },
                    { label: "on-campus", href: "" },
                    { label: "off-campus", href: "" },
                    { label: "partner-housing", href: "" },
                ]}
                onSelect={setDormType}
                showTitle={false} direction="down"
                widthClass="w-full" titleClass="text-[10px] lg:text-[11px]"
                selectedClass="text-[12px] lg:text-[13px] text-left block pl-2"
            />

            <Divider />

            {/* Room type */}
            <p className="text-[10px] font-bold tracking-[0.14em] uppercase text-[#9A7080] mb-2">Room type</p>
            <Dropdown
                title="Room type"
                items={[
                    { label: "All", href: "" },
                    { label: "single", href: "" },
                    { label: "double", href: "" },
                    { label: "shared", href: "" },
                ]}
                onSelect={setRoomType}
                showTitle={false} direction="down"
                widthClass="w-full" titleClass="text-[10px] lg:text-[11px]"
                selectedClass="text-[12px] lg:text-[13px] text-left block pl-2"
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

                {/* <DualRangeSlider
                    minVal={minPrice} maxVal={maxPrice}
                    onMinChange={setMinPrice} onMaxChange={setMaxPrice}
                    dataMin={origMin} dataMax={origMax}
                /> */}
                <PriceRangeSlider key={sliderResetKey} min={minimumOrig} max={maximumOrig} onChange={handleRangeChange}></PriceRangeSlider>

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

function DualRangeSlider({
    minVal, maxVal, onMinChange, onMaxChange, dataMin, dataMax,
}: {
    minVal: number; maxVal: number
    onMinChange: (v: number) => void; onMaxChange: (v: number) => void
    dataMin: number; dataMax: number
}) {
    const STEP = 100
    const range = dataMax - dataMin
    const minPct = ((minVal - dataMin) / range) * 100
    const maxPct = ((maxVal - dataMin) / range) * 100

    return (
        <div className="relative w-full h-8">
            {/* Track */}
            <div className="absolute top-1/2 left-0 right-0 h-1.5 rounded-full bg-[#EDE4E9] -translate-y-1/2" />
            {/* Fill */}
            <div
                className="absolute top-1/2 h-1.5 rounded-full -translate-y-1/2"
                style={{
                    left: `${minPct}%`,
                    width: `${maxPct - minPct}%`,
                    background: "linear-gradient(90deg,#6B0F2B,#B5344F)",
                }}
            />
            {/* Min thumb */}
            <input type="range" min={dataMin} max={dataMax} step={STEP} value={minVal}
                onChange={e => onMinChange(Number(e.target.value))}
                className="absolute top-1/2 left-0 w-full h-8 -translate-y-1/2 opacity-0 cursor-pointer z-10" />
            {/* Max thumb */}
            <input type="range" min={dataMin} max={dataMax} step={STEP} value={maxVal}
                onChange={e => onMaxChange(Number(e.target.value))}
                className="absolute top-1/2 left-0 w-full h-8 -translate-y-1/2 opacity-0 cursor-pointer z-10" />
            {/* Visual knobs */}
            {[minPct, maxPct].map((pct, i) => (
                <div key={i}
                    className="absolute top-1/2 w-5 h-5 rounded-full bg-white border-[2.5px] border-[#6B0F2B] shadow-md pointer-events-none z-[5]"
                    style={{ left: `${pct}%`, transform: "translate(-50%, -50%)" }}
                />
            ))}
        </div>
    )
}



