import { useState, useMemo } from "react"

import Sidebar from "../../components/Sidebar"
import HeroBanner from "../../components/dashboard/HeroBanner"
import Card from "../../components/ui/Card"
import Button from "../../components/Button"

interface ManagerProfile {
    fullName: string
    shortName: string
    email: string
    phoneNumber: string
    status: string
    dormitory: string
}

interface Room {
    roomNumber: string
    roomType: "single" | "double" | "shared"
    roomCapacity: number
    roomCurrentOccupancy: number
    roomBuilding: string
    tenants: Tenant[]
}

interface Tenant {
    fullName: string
    email: string
    phoneNumber: string
}

interface HistoryRecord {
    tenant: Tenant
    roomNumber: string
    roomBuilding: string
    roomType: "single" | "double" | "shared"
    action: "Move-in" | "Move-out"
    date: string
    time: string
}

const managerProfile: ManagerProfile = {
    fullName: "Dal Cadsawan",
    shortName: "Dal",
    email: "ddcadsawan@up.edu.ph",
    phoneNumber: "+63 912 345 6789",
    status: "Active",
    dormitory: "Narra Residences"
}

const Rooms: Room[] = [
    {roomNumber: "6101", roomType: "double", roomCapacity:2 , roomCurrentOccupancy:2 , roomBuilding: "6", 
        tenants:[
            {fullName: "Kayanne Reyes", email: "kmreyes@up.edu.ph", phoneNumber: "09123456789"},
            {fullName: "Kayanne Reyes", email: "kmreyes@up.edu.ph", phoneNumber: "09123456789"}
        ]},
    {roomNumber: "6102", roomType: "double", roomCapacity:2 , roomCurrentOccupancy:2 , roomBuilding: "6", 
        tenants:[
            {fullName: "Kayanne Reyes", email: "kmreyes@up.edu.ph", phoneNumber: "09123456789"},
            {fullName: "Kayanne Reyes", email: "kmreyes@up.edu.ph", phoneNumber: "09123456789"}
        ]},
    {roomNumber: "6103", roomType: "single", roomCapacity:1 , roomCurrentOccupancy:1 , roomBuilding: "6", 
        tenants:[
            {fullName: "Kayanne Reyes", email: "kmreyes@up.edu.ph", phoneNumber: "09123456789"},
        ]},
    {roomNumber: "6104", roomType: "single", roomCapacity:1 , roomCurrentOccupancy:0 , roomBuilding: "6", 
        tenants:[]},
    {roomNumber: "6105", roomType: "shared", roomCapacity:4 , roomCurrentOccupancy:1 , roomBuilding: "6", 
        tenants:[
            {fullName: "Kayanne Reyes", email: "kmreyes@up.edu.ph", phoneNumber: "09123456789"},
        ]},
    {roomNumber: "6106", roomType: "single", roomCapacity:1 , roomCurrentOccupancy:1 , roomBuilding: "6", 
        tenants:[
            {fullName: "Kayanne Reyes", email: "kmreyes@up.edu.ph", phoneNumber: "09123456789"},
        ]},
]

const historyRecords: HistoryRecord[] = [
    { tenant: { fullName: "Kayanne Reyes", email: "kmreyes@up.edu.ph", phoneNumber: "09123456789" },
      roomNumber: "6203", roomBuilding: "6", roomType: "double", action: "Move-in",  date: "Mar 14, 2026", time: "10:30 AM" },
    { tenant: { fullName: "Kayanne Reyes", email: "kmreyes@up.edu.ph", phoneNumber: "09123456789" },
      roomNumber: "6203", roomBuilding: "6", roomType: "double", action: "Move-in",  date: "Mar 14, 2026", time: "10:30 AM" },
    { tenant: { fullName: "Kayanne Reyes", email: "kmreyes@up.edu.ph", phoneNumber: "09123456789" },
      roomNumber: "6203", roomBuilding: "6", roomType: "double", action: "Move-out", date: "Mar 14, 2026", time: "10:30 AM" },
    { tenant: { fullName: "Kayanne Reyes", email: "kmreyes@up.edu.ph", phoneNumber: "09123456789" },
      roomNumber: "6203", roomBuilding: "6", roomType: "double", action: "Move-in",  date: "Mar 14, 2026", time: "10:30 AM" },
]

const ROOMS_PER_PAGE = 3
const HISTORY_PER_PAGE = 4
const SORT_OPTS = ["Room Type", "Room No.", "Date", "Action"]

const RoomOccupancyDetails = ({ rooms, className }: {rooms:Room[], className?:string}) => {
    const [currentPage, setCurrentPage] = useState(1)
    const totalPages = Math.ceil(rooms.length / ROOMS_PER_PAGE)
    const startIndex = (currentPage - 1) * ROOMS_PER_PAGE
    const paginatedRooms = rooms.slice(startIndex, startIndex + ROOMS_PER_PAGE)
    
    const getStatus = (room:Room) => {
        if (room.roomCurrentOccupancy < room.roomCapacity) return "Available"
        return "Full"
    }

    return (
        <Card 
            className={className}
            children={
                <div className="">
                    <h2 className="text-[#1A0008] font-bold text-base lg:text-lg">
                        Room Occupancy Details
                    </h2>
                    <div className="grid grid-cols-5 border-b border-[#F5ECF0] uppercase">
                        <p className="col-span-1 text-[#9A7080] text-xs lg:text-md font-bold p-1">
                            Room No.
                        </p>
                        <p className="col-span-1 text-[#9A7080] text-xs lg:text-md font-bold p-1">
                            Room Type
                        </p>
                        <p className="col-span-1 text-[#9A7080] text-xs lg:text-md font-bold p-1">
                            Capacity
                        </p>
                        <p className="col-span-1 text-[#9A7080] text-xs lg:text-md font-bold p-1">
                            Status
                        </p>
                        <p className="col-span-1 text-[#9A7080] text-xs lg:text-md font-bold p-1">
                            Action
                        </p>
                    </div>
                    {rooms.length > 0 
                        ? (
                            <>
                            <div className="flex flex-col">
                                {paginatedRooms.map((room, i) => {
                                    const status = getStatus(room)
                                    return(
                                        <div key={i} className="grid grid-cols-5 flex justify-between items-center py-1 pl-1">
                                            <div className="col-span-1 flex flex-col">
                                                <p className="font-bold text-sm lg:text-md text-[#1A0008]">
                                                    Room {room.roomNumber}
                                                </p>
                                                <p className="text-[10px] lg:text-sm text-[#9A7080]">
                                                    Building {room.roomBuilding}
                                                </p>
                                            </div>
                                            <p className="col-span-1 text-sm text-[#1A0008] capitalize">
                                                {room.roomType}
                                            </p>
                                            <p className="col-span-1 text-sm text-[#1A0008]">
                                                {room.roomCurrentOccupancy}/{room.roomCapacity}
                                            </p>
                                            <div className="col-span-1">
                                                <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium
                                                    ${status === "Full" ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"}
                                                    `}>
                                                    <span className={`w-1.5 h-1.5 rounded-full
                                                        ${status === "Full" ? "bg-red-500" : "bg-green-500"}
                                                        `}/>
                                                    {status}
                                                </span>
                                            </div>
                                            <div className="col-span-1">
                                                <Button variant="tertiary" size="sm">
                                                        View
                                                </Button>
                                            </div>
                                        </div>
                                    )    
                                })}
                            </div>
                            <div className="flex items-center justify-between mt-3">
                                <p className="text-xs text-[#9A7080]">
                                    Showing {startIndex + 1}–{Math.min(startIndex + ROOMS_PER_PAGE, rooms.length)} of {rooms.length} records
                                </p>
                                <div className="flex items-center gap-1">
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                        <button
                                            key={page}
                                            onClick={() => setCurrentPage(page)}
                                            className={`w-7 h-7 text-xs rounded-md font-medium transition
                                                ${currentPage === page
                                                    ? "text-white"
                                                    : "text-[#9A7080] border border-[#E8D5DC] hover:bg-[#F5ECF0]"
                                                }`}
                                            style={currentPage === page ? { background: "linear-gradient(135deg, #6B0F2B, #9E2040)" } : {}}
                                        >
                                            {page}
                                        </button>
                                    ))}
                                    {currentPage < totalPages && (
                                        <button
                                            onClick={() => setCurrentPage(p => p + 1)}
                                            className="w-7 h-7 text-xs rounded-md border border-[#E8D5DC] text-[#9A7080] hover:bg-[#F5ECF0] transition"
                                        >
                                            {">"}
                                        </button>
                                    )}
                                </div>
                            </div>
                            </>
                        )
                        : (
                            <div>

                            </div>
                        )
                    }
                </div>
            }
        />
    )
}

const OccupancyRooms = ({ rooms, className }: { rooms: Room[], className?: string }) => {
    //compute stats from rooms data
    const full = rooms.filter(r => r.roomCurrentOccupancy === r.roomCapacity && r.roomCapacity > 0).length
    const partial = rooms.filter(r => r.roomCurrentOccupancy > 0 && r.roomCurrentOccupancy < r.roomCapacity).length
    const available = rooms.filter(r => r.roomCurrentOccupancy === 0).length
    const totalOccupied = rooms.reduce((sum, r) => sum + r.roomCurrentOccupancy, 0)
    const totalCapacity = rooms.reduce((sum, r) => sum + r.roomCapacity, 0)
    const total = full + partial + available

    //SVG donut config
    const cx = 60, cy = 60, r = 48, strokeWidth = 13
    const circumference = 2 * Math.PI * r

    const segments = [
        { value: full,      color: "#3D0A1A" }, // dark maroon  - fully occupied
        { value: partial,   color: "#C47A8A" }, // muted pink   - partially occupied
        { value: available, color: "#9E2040" }, // maroon       - available
    ]

    //build stroke-dasharray offsets for each segment
    let cumulativeOffset = 0
    //start from top (-25% = -90deg)
    const GAP = 4 // gap in px between segments

    const arcs = segments.map(seg => {
        const segLength = total > 0 ? (seg.value / total) * circumference : 0
        const dashArray = `${Math.max(segLength - GAP, 0)} ${circumference - Math.max(segLength - GAP, 0)}`
        const dashOffset = -(cumulativeOffset) + circumference * 0.25
        cumulativeOffset += segLength
        return { ...seg, dashArray, dashOffset }
    })

    return (
        <Card className={className}>
            <h2 className="text-[#1A0008] font-bold text-base lg:text-lg mb-3">
                Occupancy Rooms
            </h2>
            <div className="flex items-center gap-6">
                {/* Donut SVG */}
                <div className="relative flex-shrink-0">
                    <svg width="180" height="180" viewBox="0 0 120 120">
                        {/* Background track */}
                        <circle
                            cx={cx} cy={cy} r={r}
                            fill="none"
                            stroke="#F5ECF0"
                            strokeWidth={strokeWidth}
                        />
                        {arcs.map((arc, i) => (
                            <circle
                                key={i}
                                cx={cx} cy={cy} r={r}
                                fill="none"
                                stroke={arc.color}
                                strokeWidth={strokeWidth}
                                strokeDasharray={arc.dashArray}
                                strokeDashoffset={arc.dashOffset}
                                strokeLinecap="round"
                                style={{ transition: "stroke-dasharray 0.5s ease" }}
                            />
                        ))}
                    </svg>
                    {/* Center label */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <p className="text-sm font-bold text-[#1A0008] leading-tight">
                            {totalOccupied}/{totalCapacity}
                        </p>
                        <p className="text-[9px] text-[#9A7080] text-center leading-tight">
                            Occupied Slots
                        </p>
                    </div>
                </div>

                {/* Legend */}
                <div className="flex flex-col gap-3">
                    {[
                        { label: "Fully Occupied Rooms",    value: full,      color: "#3D0A1A" },
                        { label: "Partially Occupied Rooms", value: partial,  color: "#C47A8A" },
                        { label: "Available Rooms",          value: available, color: "#9E2040" },
                    ].map((item, i) => (
                        <div key={i} className="flex items-start gap-2">
                            <span
                                className="w-3 h-3 rounded-full mt-0.5 flex-shrink-0"
                                style={{ backgroundColor: item.color }}
                            />
                            <div>
                                <p className="text-xl font-bold text-[#1A0008] leading-none">{item.value}</p>
                                <p className="text-[10px] text-[#9A7080] mt-0.5">{item.label}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </Card>
    )
}

{/* Currently horizontally scrollable sa mobile */}
const OccupancyHistory = ({ records = historyRecords, className }: { records?: HistoryRecord[], className?: string }) => {
    const [currentPage, setCurrentPage] = useState(1)
    const [sortBy, setSortBy] = useState("Room Type")
    const [sortOpen, setSortOpen] = useState(false)
    const [search, setSearch] = useState("")

    const filtered = useMemo(() => {
        const q = search.toLowerCase()
        return records.filter(r =>
            r.tenant.fullName.toLowerCase().includes(q) ||
            r.roomNumber.includes(q) ||
            r.roomBuilding.includes(q) ||
            r.roomType.includes(q)
        )
    }, [records, search])

    const sorted = useMemo(() => {
        return [...filtered].sort((a, b) => {
            if (sortBy === "Room Type")  return a.roomType.localeCompare(b.roomType)
            if (sortBy === "Room No.")   return a.roomNumber.localeCompare(b.roomNumber)
            if (sortBy === "Action")     return a.action.localeCompare(b.action)
            if (sortBy === "Date")       return new Date(a.date).getTime() - new Date(b.date).getTime()
            return 0
        })
    }, [filtered, sortBy])

    const totalPages = Math.ceil(sorted.length / HISTORY_PER_PAGE)
    const startIndex = (currentPage - 1) * HISTORY_PER_PAGE
    const paginated = sorted.slice(startIndex, startIndex + HISTORY_PER_PAGE)

    const handleSort = (option: string) => {
        setSortBy(option)
        setSortOpen(false)
        setCurrentPage(1)
    }

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value)
        setCurrentPage(1)
    }

    //avatar initials from name
    const getInitials = (name: string) =>
        name[0]

    return (
        <Card className={className}>
            {/* Header row */}
            <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
                <h2 className="text-[#1A0008] font-bold text-base lg:text-lg">
                    Occupancy History
                </h2>
                <div className="flex items-center gap-2 ml-auto">
                    {/* Sort dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setSortOpen(o => !o)}
                            className="flex items-center gap-2 border border-[#E8D5DC] rounded-xl px-3 py-2 text-sm bg-white hover:bg-[#F5ECF0] transition min-w-[140px]"
                        >
                            <span className="flex flex-col text-left">
                                <span className="text-[9px] uppercase text-[#9A7080] font-bold leading-none">Sort By</span>
                                <span className="text-[#1A0008] font-medium text-sm">{sortBy}</span>
                            </span>
                            <svg className="ml-auto w-4 h-4 text-[#9A7080]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                        {sortOpen && (
                            <div className="absolute z-10 top-full mt-1 right-0 bg-white border border-[#E8D5DC] rounded-xl shadow-md overflow-hidden w-full">
                                {SORT_OPTS.map(opt => (
                                    <button
                                        key={opt}
                                        onClick={() => handleSort(opt)}
                                        className={`w-full text-left px-4 py-2 text-sm hover:bg-[#F5ECF0] transition
                                            ${sortBy === opt ? "text-[#6B0F2B] font-semibold" : "text-[#1A0008]"}`}
                                    >
                                        {opt}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Search */}
                    <div className="flex items-center gap-2 border border-[#E8D5DC] rounded-xl px-3 py-2 bg-white">
                        <svg className="w-4 h-4 text-[#9A7080] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Search records..."
                            value={search}
                            onChange={handleSearch}
                            className="text-sm outline-none bg-transparent text-[#1A0008] placeholder-[#C4A4B0] w-36"
                        />
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto -mx-4 px-4">
                <div className="min-w-[700px]">
                    {/* Table header */}
                    <div className="grid grid-cols-12 border-b border-[#F5ECF0] uppercase pb-1 mb-1">
                        <p className="col-span-2 text-[#9A7080] text-xs font-bold p-1">Students</p>
                        <p className="col-span-2 text-[#9A7080] text-xs font-bold p-1">Room No.</p>
                        <p className="col-span-2 text-[#9A7080] text-xs font-bold p-1">Building No.</p>
                        <p className="col-span-2 text-[#9A7080] text-xs font-bold p-1">Room Type</p>
                        <p className="col-span-2 text-[#9A7080] text-xs font-bold p-1">Action</p>
                        <p className="col-span-2 text-[#9A7080] text-xs font-bold p-1 flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                            Date
                        </p>
                    </div>

                    {/* Rows */}
                    <div className="flex flex-col divide-y divide-[#F5ECF0]">
                        {paginated.length > 0 ? paginated.map((record, i) => (
                            <div key={i} className="grid grid-cols-12 items-center py-3">
                                {/* Student */}
                                <div className="col-span-2 flex items-center gap-2">
                                    <div className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center text-white text-xs font-bold"
                                        style={{ background: "linear-gradient(135deg, #6B0F2B, #9E2040)" }}>
                                        {getInitials(record.tenant.fullName)}
                                    </div>
                                    <p className="font-bold text-sm text-[#1A0008]">{record.tenant.fullName}</p>
                                </div>
                                <p className="col-span-2 text-sm text-[#1A0008]">Room {record.roomNumber}</p>
                                <p className="col-span-2 text-sm text-[#1A0008]">Building {record.roomBuilding}</p>
                                <p className="col-span-2 text-sm text-[#1A0008] capitalize">{record.roomType}</p>
                                <div className="col-span-2">
                                    <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium
                                        ${record.action === "Move-in"
                                            ? "bg-green-50 text-green-700"
                                            : "bg-pink-50 text-[#9E2040]"}`}>
                                        <span className={`w-1.5 h-1.5 rounded-full
                                            ${record.action === "Move-in" ? "bg-green-500" : "bg-[#9E2040]"}`} />
                                        {record.action}
                                    </span>
                                </div>
                                <div className="col-span-2">
                                    <p className="text-sm text-[#1A0008]">{record.date}</p>
                                    <p className="text-[10px] text-[#9A7080]">{record.time}</p>
                                </div>
                            </div>
                        )) : (
                            <p className="text-sm text-[#9A7080] py-6 text-center">No records found.</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between mt-3 pt-2 border-t border-[#F5ECF0]">
                <p className="text-xs text-[#9A7080]">
                    Showing {sorted.length === 0 ? 0 : startIndex + 1}–{Math.min(startIndex + HISTORY_PER_PAGE, sorted.length)} of {sorted.length} records
                </p>
                <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`w-7 h-7 text-xs rounded-md font-medium transition
                                ${currentPage === page
                                    ? "text-white"
                                    : "text-[#9A7080] border border-[#E8D5DC] hover:bg-[#F5ECF0]"}`}
                            style={currentPage === page ? { background: "linear-gradient(135deg, #6B0F2B, #9E2040)" } : {}}
                        >
                            {page}
                        </button>
                    ))}
                    {currentPage < totalPages && (
                        <button
                            onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                            className="w-7 h-7 text-xs rounded-md border border-[#E8D5DC] text-[#9A7080] hover:bg-[#F5ECF0] transition"
                        >
                            {">"}
                        </button>
                    )}
                </div>
            </div>
        </Card>
    )
}

export default function OccupancyRecords() {
    return (
        <div className="flex h-screen overflow-hidden bg-[#F5EEF0] font-sans">
            <Sidebar role="manager" profile={managerProfile}/>

            <div className="flex-1 flex flex-col p-5 overflow-y-auto">
                <div className="pl-10 lg:pl-0 flex flex-row border-b border-[#6B0F2B]/7 mb-2 pb-1">
                    <div className="hidden lg:inline w-2 h-8 rounded-xl mt-1 mr-2"
                        style={{ background: "linear-gradient(to bottom right, #6B0F2B 0%, #9E2040 100%)"}}
                    />
                    <h1 className="text-4xl font-serif italic font-bold text-[#6B0F2B]">
                        Occupancy Records
                    </h1>
                </div>
                <main className="flex-1 flex flex-col gap-4">
                    <HeroBanner 
                        greeting="Good Day"
                        name={managerProfile.fullName}
                        title="View occupancy records"
                        subtitle="We make it easy for you to keep track of occupancy records"
                        type="mini"
                    />

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        <RoomOccupancyDetails
                            rooms={Rooms}
                            className="col-span-1 lg:col-span-2"
                        />
                        <OccupancyRooms 
                            rooms={Rooms}
                            className="col-span-1"
                        />
                    </div>
                    <OccupancyHistory 
                        records={historyRecords}
                    />
                </main>
            </div>
        </div>
    )
}