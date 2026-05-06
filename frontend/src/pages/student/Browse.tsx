import { createContext, useContext, useEffect, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import AccommodationMap, { type AccommodationPin } from '../../components/AccommodationMapsBrowse'
import { Star, SlidersHorizontal, MapPin, X, BookmarkCheck, ChevronRight } from "lucide-react"
import Sidebar from "../../components/Sidebar"
import CustomHeader from '../../components/CustomHeader'
import HeroBanner from "@/components/dashboard/HeroBanner"
import Dropdown from "../../components/ApplicationStatus/Dropdown"
import { useQuery } from "@tanstack/react-query"
import { api } from "../../api/axios"

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
    origMin: number; origMax: number;
    setFilterInEffect: (v: boolean) => void;
}
export const filterContext = createContext<FilterContextType | undefined>(undefined)

/* ─── Dorm tile type ───────────────────────────────────────────────────────── */
type Dorm = {
    name: string; subtitle: string; meta: string
    minPrice: number; maxPrice: number; priceUnit: string
    rating: string; accommodationId: number; tags: string[]
    bookmarked?: boolean
}

/* ══════════════════════════════════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════════════════════════════════ */
export default function BrowsePage() {

    /* ── state — all untouched ── */
    const [searchTerm, setSearchTerm] = useState("")
    const [activeFilter, setActiveFilter] = useState("All")
    const [onlyBookmarked, setOnlyBookmarked] = useState(false)
    const [minPrice, setMinPrice] = useState(500) // converted to 500 for now. In the future min and max should be based on the lowest rent in the DB, same for max
    const [maxPrice, setMaxPrice] = useState(7000)
    const [origMin, setOrigMin] = useState(500)
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
    const [filterInEffect, setFilterInEffect] = useState(true);
    const navigate = useNavigate()

    /* ── queries — untouched ── */
    const { data: accommodations = [], isError: accommodationsError } = useQuery({
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
            console.log(res.data, "hello")
            return Array.isArray(res.data) ? res.data : []
        },
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


    // for finding the minimum and maximum price
    useEffect(() => {

        let min = -1;
        let max = -1;

        for (let i = 0; i < accommodations.length; i++) {
            const { rooms } = accommodations[i]

            rooms.forEach((el: { roomRent: number }) => {
                const rent = Number(el.roomRent)
                if (min === -1 || rent < min)
                {
                    min = rent;
                }

                if (max === -1 || rent > max)
                {
                    max = rent;
                }
            })
        }

        setMinPrice(min);
        setMaxPrice(max);
        setOrigMin(min);
        setOrigMax(max);
    }, [accommodations]);

    useEffect(() => {
        const tempPins: AccommodationPin[] = []
        const tempDorms: Dorm[] = []
        if (!filterInEffect) {
            return
        }

        setFilterInEffect(false);
        for (let i = 0; i < accommodations.length; i++) {
            const {
                id, accommodationName, accommodationLocation, accommodationType,
                accommodationCapacity, tenantRestriction, latitude, longitude,
                walkingDistance, drivingDistance, bikingDistance,
                rooms, reviews, bookmarks, tags,
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
                if (minimum === -1) minimum = rent
                if (maximum === -1) maximum = rent
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
            if (!nameMatch) continue



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
            if (dormType !== "All" && accommodationType !== dormType) {
                continue
            }
            if (roomType !== "All" && !roomTypes.has(roomType)) {
                continue
            }
            if (trueTags.length !== 0) {
                const hasTag = tempTags.some(t => trueTags.includes(t))
                if (!hasTag) {
                    continue
                }
            }


            tempDorms.push({
                name: accommodationName, subtitle: accommodationLocation,
                meta: accommodationType, minPrice: minimum, maxPrice: maximum,
                priceUnit: "/ month", rating: rating == "6" ? "0" : rating, accommodationId: id,
                tags: tempTags, bookmarked,
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
    return (
        <filterContext.Provider value={{
            dormType, setDormType, minPrice, setMinPrice, maxPrice, setMaxPrice,
            roomType, setRoomType, starRating, setStarRating, onlyBookmarked, setOnlyBookmarked,
            searching, setSearching, filters, setFilters, setFilterPanelOpen, origMin, origMax, setFilterInEffect
        }}>
            <div className="flex flex-row w-full min-h-screen bg-[#FDF8FA]">

                {/* Sidebar */}
                <div className="relative z-[9999]">
                    <Sidebar role="student" />
                </div>

                {/* Main */}
                <div className="flex flex-col w-full min-w-0">
                    <CustomHeader title="Browse Rooms" />

                    {/* Hero — position untouched */}
                    <div className="w-full px-6 pt-6 pb-2">
                        <HeroBanner
                            greeting="Good Day" name={name}
                            title="Browse available rooms"
                            subtitle="Browse available accommodations and apply in just a few clicks"
                            type="mini"
                        />
                    </div>

                    {/* Toolbar */}
                    <div className="flex items-center gap-3 px-6 py-3">
                        <SearchBar />
                        <button
                            onClick={() => setFilterPanelOpen(true)}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#E8D4DF] bg-white text-[#6B0F2B] text-sm font-semibold shadow-sm hover:bg-[#F5ECF0] transition-colors shrink-0"
                        >
                            <SlidersHorizontal size={15} />
                            Filters
                            {activeChips.length > 0 && (
                                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#6B0F2B] text-white text-[10px] font-bold">
                                    {activeChips.length}
                                </span>
                            )}
                        </button>
                    </div>

                    {/* Active filter chips */}
                    {activeChips.length > 0 && (
                        <div className="flex flex-wrap gap-2 px-6 pb-2">
                            {activeChips.map(chip => (
                                <span key={chip} className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-semibold bg-[#6B0F2B]/10 text-[#6B0F2B]">
                                    {chip}
                                </span>
                            ))}
                        </div>
                    )}

                    {/* Body */}
                    <div className="flex flex-col md:flex-row gap-4 px-6 pb-8 flex-1">

                        {/* ── LEFT: scrollable tile list ── */}
                        <div className="flex flex-col w-full md:w-1/2 shrink-0">

                            <div className="flex items-center justify-between mb-3">
                                <p className="text-[#1C0A11] font-semibold text-sm">
                                    {flatDorms.length > 0 ? (
                                        <>
                                            <span className="text-[#6B0F2B] font-bold">{flatDorms.length}</span>
                                            {" "}accommodation{flatDorms.length !== 1 ? "s" : ""} found
                                        </>
                                    ) : "No accommodations found"}
                                </p>
                            </div>

                            <div className="flex flex-col gap-3 overflow-y-auto pr-1 max-h-[78vh]">
                                {flatDorms.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-72 gap-3 text-[#9A7080]">
                                        <MapPin size={40} strokeWidth={1.3} />
                                        <p className="text-sm font-medium">No results match your current filters</p>
                                        <p className="text-xs">Try adjusting the filters or search term</p>
                                    </div>
                                ) : (
                                    flatDorms.map(dorm => (
                                        <DormTile
                                            key={dorm.accommodationId}
                                            dorm={dorm}
                                            hovered={hoveredId === dorm.accommodationId}
                                            onHover={setHoveredId}
                                            onClick={() => navigate(`/student/roomview/${dorm.accommodationId}`)}
                                        />
                                    ))
                                )}
                            </div>
                        </div>

                        {/* ── RIGHT: map ── */}
                        <div className="flex flex-col w-full md:w-1/2 shrink-0 rounded-2xl overflow-hidden border border-[#E8D4DF] shadow-md min-h-[560px] relative z-50">
                            <div className="flex items-center gap-2 px-5 py-4 bg-white border-b border-[#E8D4DF] shrink-0">
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
                                <X size={15} />
                            </button>
                        </div>
                        <FilterForm onClose={() => {
                            setFilterInEffect(true)
                            setFilterPanelOpen(false)}} />
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
            className={`group flex gap-0 bg-white rounded-2xl border cursor-pointer transition-all duration-200 overflow-hidden
                ${hovered
                    ? "border-[#6B0F2B] shadow-lg shadow-[#6B0F2B]/10 -translate-y-0.5"
                    : "border-[#E8D4DF] shadow-sm hover:border-[#6B0F2B]/40 hover:shadow-md hover:-translate-y-0.5"
                }`}
        >
            {/* Thumbnail */}
            <div className="relative w-40 shrink-0 bg-gradient-to-br from-[#6B0F2B] to-[#B5344F] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 grid grid-cols-3 gap-px opacity-[0.15] p-1.5">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="bg-white rounded-sm" />
                    ))}
                </div>
                <MapPin size={20} className="text-white/50 relative z-10" strokeWidth={1.4} />
            </div>

            {/* Content */}
            <div className="flex flex-col justify-between flex-1 py-4 px-4 min-w-0">
                <div>
                    {/* Name row */}
                    <div className="flex items-start justify-between gap-2 mb-0.5">
                        <h3 className="text-[#1C0A11] font-bold text-sm leading-snug line-clamp-1">
                            {dorm.name}
                        </h3>
                        {dorm.bookmarked && (
                            <BookmarkCheck size={15} className="text-[#6B0F2B] shrink-0 mt-0.5" />
                        )}
                    </div>

                    {/* Location */}
                    <p className="text-[#9A7080] text-xs mb-2.5 truncate">{dorm.subtitle}</p>

                    {/* Badges */}
                    <div className="flex flex-wrap gap-1.5 mb-3">
                        {dorm.meta && (
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide
                                ${isOnCampus ? "bg-amber-100 text-amber-700" : "bg-rose-50 text-[#6B0F2B]"}`}>
                                {dorm.meta}
                            </span>
                        )}
                        {dorm.tags.slice(0, 2).map(tag => (
                            <span key={tag} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-[#F5ECF0] text-[#6B0F2B] border border-[#E8D4DF]">
                                {tag}
                            </span>
                        ))}
                        {dorm.tags.length > 2 && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium text-[#9A7080]">
                                +{dorm.tags.length - 2}
                            </span>
                        )}
                    </div>
                </div>

                {/* Price + rating + CTA */}
                <div className="flex items-end justify-between gap-2">
                    <div>
                        <p className="text-[#6B0F2B] font-bold text-base leading-none">
                            ₱{dorm.minPrice > 0 ? dorm.minPrice.toLocaleString() : "—"}
                            {dorm.maxPrice > dorm.minPrice && (
                                <span className="text-sm"> – {dorm.maxPrice.toLocaleString()}</span>
                            )}
                        </p>
                        <p className="text-[#9A7080] text-[10px] mt-0.5">{dorm.priceUnit}</p>
                    </div>

                    <div className="flex items-center gap-3">
                        {validRating && (
                            <div className="flex items-center gap-1">
                                <Star size={12} fill="#C0934B" stroke="none" />
                                <span className="text-[#C0934B] font-bold text-xs">{dorm.rating == "0" ? "unrated" : dorm.rating}</span>
                            </div>
                        )}
                        <span className={`flex items-center gap-0.5 text-xs font-semibold transition-colors
                            ${hovered ? "text-[#6B0F2B]" : "text-[#9A7080] group-hover:text-[#6B0F2B]"}`}>
                            View
                            <ChevronRight size={13} />
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
function FilterForm({ onClose }: { onClose: () => void }) {
    const context = useContext(filterContext)
    if (!context) throw new Error("FilterContext must be used within a Provider")
    const {
        dormType, setDormType, minPrice, setMinPrice, maxPrice, setMaxPrice,
        roomType, setRoomType, starRating, setStarRating,
        onlyBookmarked, setOnlyBookmarked, filters, setFilters, setFilterPanelOpen, origMin, origMax,
        setFilterInEffect
    } = context

    const originalFilters: { [key: string]: boolean } = {
        "Near campus": false, "Pet friendly": false, "Near establishments": false,
        "Air-conditioned rooms": false, "Has study area": false,
        "24/7 security": false, "Has curfew": false, "Has canteen": false,
    }

    const resetAll = () => {
        setFilters(originalFilters); setStarRating(3); setOnlyBookmarked(false)
        setDormType("All"); setRoomType("All"); setMinPrice(origMin); setMaxPrice(origMax);
        setFilterPanelOpen(false); setFilterInEffect(true)
    }

    const Divider = () => <div className="h-px bg-[#F0E4E9] my-5" />

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
                    <span className={`absolute top-[3px] w-[18px] h-[18px] rounded-full bg-white shadow transition-transform duration-200 ${onlyBookmarked ? "translate-x-[22px]" : "translate-x-[3px]"}`} />
                </button>
            </div>

            <Divider />

            {/* Dorm type */}
            <p className="text-[10px] font-bold tracking-[0.14em] uppercase text-[#9A7080] mb-2">Dorm type</p>
            <Dropdown
                title="Dorm type"
                items={[
                    { label: "All Types", href: "" },
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
                <div className="flex justify-between mb-3">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#6B0F2B]/10 text-[#6B0F2B]">
                        ₱{minPrice.toLocaleString()}
                    </span>
                    <span className="text-xs text-[#9A7080] self-center">to</span>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#6B0F2B]/10 text-[#6B0F2B]">
                        ₱{maxPrice.toLocaleString()}
                    </span>
                </div>
                <DualRangeSlider
                    minVal={minPrice} maxVal={maxPrice}
                    onMinChange={setMinPrice} onMaxChange={setMaxPrice}
                    dataMin={0} dataMax={10000}
                />
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

            {/* Buttons — inline, scrollable */}
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