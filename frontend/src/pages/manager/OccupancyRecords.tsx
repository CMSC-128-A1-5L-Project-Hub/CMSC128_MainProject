import { useState, useMemo, useEffect } from "react"

import Sidebar from "../../components/Sidebar"
import HeroBanner from "../../components/dashboard/HeroBanner"
import Card from "../../components/ui/Card"
import Button from "../../components/Button"
import Modal from "../../components/Modal"
import CustomHeader from '../../components/CustomHeader';
import Dropdown from "../../components/ApplicationStatus/Dropdown";
import SearchBar from '../../components/SearchBar';
import { api } from "../../api/axios"


interface ManagerProfile {
    fullName: string
    shortName: string
    email: string
    phoneNumber: string
    status: string
    dormitory: string
}

interface Room {
    id: number
    roomNumber: string
    stayType: "transient" | "non-transient"
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

// const Rooms: Room[] = [
//     {roomNumber: "6101", stayType: "transient", roomType: "double", roomCapacity:2 , roomCurrentOccupancy:2 , roomBuilding: "6", 
//         tenants:[
//             {fullName: "Kayanne Reyes", email: "kmreyes@up.edu.ph", phoneNumber: "09123456789"},
//             {fullName: "Kayanne Reyes", email: "kmreyes@up.edu.ph", phoneNumber: "09123456789"}
//         ]},
//     {roomNumber: "6102", stayType: "non-transient", roomType: "double", roomCapacity:2 , roomCurrentOccupancy:2 , roomBuilding: "6", 
//         tenants:[
//             {fullName: "Kayanne Reyes", email: "kmreyes@up.edu.ph", phoneNumber: "09123456789"},
//             {fullName: "Kayanne Reyes", email: "kmreyes@up.edu.ph", phoneNumber: "09123456789"}
//         ]},
//     {roomNumber: "6103", stayType: "transient", roomType: "single", roomCapacity:1 , roomCurrentOccupancy:1 , roomBuilding: "6", 
//         tenants:[
//             {fullName: "Kayanne Reyes", email: "kmreyes@up.edu.ph", phoneNumber: "09123456789"},
//         ]},
//     {roomNumber: "6104", stayType: "non-transient", roomType: "single", roomCapacity:1 , roomCurrentOccupancy:0 , roomBuilding: "6", 
//         tenants:[]},
//     {roomNumber: "6105", stayType: "transient", roomType: "shared", roomCapacity:4 , roomCurrentOccupancy:1 , roomBuilding: "6", 
//         tenants:[
//             {fullName: "Kayanne Reyes", email: "kmreyes@up.edu.ph", phoneNumber: "09123456789"},
//         ]},
//     {roomNumber: "6106", stayType: "transient", roomType: "single", roomCapacity:1 , roomCurrentOccupancy:1 , roomBuilding: "6", 
//         tenants:[
//             {fullName: "Kayanne Reyes", email: "kmreyes@up.edu.ph", phoneNumber: "09123456789"},
//         ]},
// ]

// const historyRecords: HistoryRecord[] = [
//     { tenant: { fullName: "Kayanne Reyes", email: "kmreyes@up.edu.ph", phoneNumber: "09123456789" },
//       roomNumber: "6203", roomBuilding: "6", roomType: "double", action: "Move-in",  date: "Mar 14, 2026", time: "10:30 AM" },
//     { tenant: { fullName: "Kayanne Reyes", email: "kmreyes@up.edu.ph", phoneNumber: "09123456789" },
//       roomNumber: "6203", roomBuilding: "6", roomType: "double", action: "Move-in",  date: "Mar 14, 2026", time: "10:30 AM" },
//     { tenant: { fullName: "Kayanne Reyes", email: "kmreyes@up.edu.ph", phoneNumber: "09123456789" },
//       roomNumber: "6203", roomBuilding: "6", roomType: "double", action: "Move-out", date: "Mar 14, 2026", time: "10:30 AM" },
//     { tenant: { fullName: "Kayanne Reyes", email: "kmreyes@up.edu.ph", phoneNumber: "09123456789" },
//       roomNumber: "6203", roomBuilding: "6", roomType: "double", action: "Move-in",  date: "Mar 14, 2026", time: "10:30 AM" },
// ]

const ROOMS_PER_PAGE = 3
const HISTORY_PER_PAGE = 3
const SORT_OPTS = ["Room Type", "Room No.", "Date", "Action"]

const RoomOccupancyDetails = ({ rooms, className }: {rooms:Room[], className?:string}) => {
    const [currentPage, setCurrentPage] = useState(1)
    const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)
    const [modalRoom, setModalRoom] = useState<Room | null>(null)
    const totalPages = Math.ceil(rooms.length / ROOMS_PER_PAGE)
    const startIndex = (currentPage - 1) * ROOMS_PER_PAGE
    const paginatedRooms = rooms.slice(startIndex, startIndex + ROOMS_PER_PAGE)
    
    const getStatus = (room:Room) => {
        if (room.roomCurrentOccupancy < room.roomCapacity) return "Available"
        return "Full"
    }

    const openModal = (room: Room) => {
        setModalRoom(room)
        setSelectedRoom(room)
    }

    const closeModal = () => {
        setSelectedRoom(null)
    }

    return (
        <>
        <Modal 
            open={!!selectedRoom}
            onClose={closeModal}
            title="View Room Details"
            maxWidth={652}
            children={
                modalRoom && (
                    <Card 
                        children={
                            <div className="flex flex-col gap-4">
                                {/* Room Header */}
                                <div>
                                    <h1 className="font-bold text-xl text-[#1A0008] uppercase">
                                        Room {modalRoom.roomNumber}
                                    </h1>
                                    <p className="text-[#C8B0B8] text-xs uppercase border-b border-[#F5ECF0] pb-1">
                                        Building {modalRoom.roomBuilding}
                                    </p>
                                </div>

                                {/* Room Info Grid */}
                                <div className="grid grid-cols-4 gap-2 -mt-2">
                                    <div>
                                        <p className="text-[#C8B0B8] text-[9px] lg:text-[10px] uppercase font-bold mb-1">Room Type</p>
                                        <p className="font-semibold text-sm lg:text-lg text-[#1A0008] capitalize">{modalRoom.stayType}</p>
                                    </div>
                                    <div>
                                        <p className="text-[#C8B0B8] text-[9px] lg:text-[10px] uppercase font-bold mb-1">Room Arrangement</p>
                                        <p className="font-semibold text-sm lg:text-lg text-[#1A0008] capitalize">{modalRoom.roomType} Room</p>
                                    </div>
                                    <div className="px-2">
                                        <p className="text-[#C8B0B8] text-[9px] lg:text-[10px] uppercase font-bold mb-1">Room Capacity</p>
                                        <p className="font-semibold text-sm lg:text-lg text-[#1A0008]">{modalRoom.roomCurrentOccupancy}/{modalRoom.roomCapacity}</p>
                                    </div>
                                    <div>
                                        <p className="text-[#C8B0B8] text-[9px] lg:text-[10px] uppercase font-bold mb-1">Status</p>
                                        <p className={`font-semibold text-sm lg:text-lg ${modalRoom.roomCurrentOccupancy === modalRoom.roomCapacity ? "text-[#9E2040]" : "text-[#1A7A4A]"}`}>
                                            {modalRoom.roomCurrentOccupancy === modalRoom.roomCapacity
                                                ? "Fully Occupied"
                                                : "Available"}
                                        </p>
                                    </div>
                                </div>

                                {/* Current Occupants */}
                                <div>
                                    <p className="font-bold text-md lg:text-lg text-[#1A0008] mb-3">Current Occupants</p>
                                    {modalRoom.tenants.length > 0 ? (
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                                            {modalRoom.tenants.map((tenant, i) => (
                                                <div key={i} className="flex flex-col gap-3">
                                                    {/* Avatar + Name */}
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl flex-shrink-0 flex items-center justify-center text-white text-sm font-bold"
                                                            style={{ background: "linear-gradient(135deg, #6B0F2B, #9E2040)" }}>
                                                            {tenant.fullName[0]}
                                                        </div>
                                                        <p className="font-bold text-sm lg:text-md text-[#1A0008]">{tenant.fullName}</p>
                                                    </div>
                                                    {/* Email */}
                                                    <div>
                                                        <p className="text-[#C8B0B8] text-[9px] lg:text-[10px] uppercase font-bold mb-0.5">Email</p>
                                                        <p className="text-[#1A0008] text-xs lg:text-sm">{tenant.email}</p>
                                                    </div>
                                                    {/* Phone */}
                                                    <div>
                                                        <p className="text-[#C8B0B8] text-[9px] lg:text-[10px] uppercase font-bold mb-0.5">Phone Number</p>
                                                        <p className="text-[#1A0008] text-xs lg:text-sm">{tenant.phoneNumber}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-[#9A7080]">No current occupants.</p>
                                    )}
                                </div>
                            </div>
                        }
                    />
                )
            }
        />
        <Card 
            className={className}
            children={
                <div className="">
                    <h2 className="text-[#1A0008] font-bold text-base">
                        Room Occupancy Details
                    </h2>
                    <div className="overflow-x-auto">
                        <table className="w-full mt-3">
                            <thead className="tracking-widest">
                                <tr className="border-y-2 border-[#6B0F2B]/5 uppercase">
                                    <th className="text-[#9A7080] text-[11px] font-bold p-1 pr-8 whitespace-nowrap text-left w-44">Room No.</th>
                                    <th className="text-[#9A7080] text-[11px] font-bold truncate p-1 pr-8 text-left w-[30%]">Room Type</th>
                                    <th className="text-[#9A7080] text-[11px] font-bold p-1 pr-8 text-left w-[30%]">Capacity</th>
                                    <th className="hidden lg:table-cell text-[#9A7080] text-[11px] font-bold p-1 pr-8 text-left w-[15%]">Status</th>
                                    <th className="text-[#9A7080] text-[11px] font-bold p-1 pr-8 text-left w-[30%]">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rooms.length > 0 ? (
                                paginatedRooms.map((room, i) => {
                                    const status = getStatus(room)
                                    return (
                                    <tr key={i}>
                                        <td className="p-1 py-2">
                                            <p className="font-bold text-sm text-[#1A0008]">Room {room.roomNumber}</p>
                                            <p className="text-[10px] lg:text-xs text-[#9A7080]">Building {room.roomBuilding}</p>
                                        </td>
                                        <td className="p-1 py-2 text-left text-sm text-[#1A0008] capitalize">
                                        {room.roomType}
                                        </td>
                                        <td className="p-1 py-2 text-left text-sm text-[#1A0008]">
                                        {room.roomCurrentOccupancy}/{room.roomCapacity}
                                        </td>
                                        <td className="hidden lg:table-cell p-1 py-2 text-left">
                                            <span className={`inline-flex items-center justify-center gap-1 text-xs px-3 py-2 rounded-full font-bold ${
                                                status === "Full" ? "bg-[#9E2040]/10 text-[#9E2040]" : "bg-[#1A7A4A]/10 text-[#1A7A4A]"
                                            }`}>
                                                <span className={`w-2 h-2 rounded-full ${status === "Full" ? "bg-[#9E2040]" : "bg-[#1A7A4A]"}`} />
                                                {status}
                                            </span>
                                        </td>
                                        <td className="p-1 py-2 text-left">
                                            <Button variant="reddishPink" size="sm" className="px-6" onClick={() => openModal(room)}>
                                                View
                                            </Button>
                                        </td>
                                    </tr>
                                    )
                                })
                                ) : (
                                <tr>
                                    <td colSpan={5} className="text-center py-4 italic text-gray-500">Nothing to see here</td>
                                </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {rooms.length > 0 && (
                        <div className="flex items-center justify-between mt-3">
                            <p className="text-xs text-[#9A7080]">
                            Showing {startIndex + 1}–{Math.min(startIndex + ROOMS_PER_PAGE, rooms.length)} of {rooms.length} records
                            </p>
                            <div className="flex items-center justify-center gap-1">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                <button
                                key={page}
                                onClick={() => setCurrentPage(page)}
                                className={`w-7 h-7 text-xs rounded-md font-medium transition flex items-center justify-center ${
                                    currentPage === page
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
                                className="flex items-center justify-center w-7 h-7 text-xs rounded-md border border-[#E8D5DC] text-[#9A7080] hover:bg-[#F5ECF0] transition"
                                >
                                {">"}
                                </button>
                            )}
                            </div>
                        </div>
                    )}
                </div>
            }
        />
        </>
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
        { value: partial,   color: "#9E2040" }, // maroon       - partially occupied
        { value: available, color: "#C47A8A" }, // muted pink   - available
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
            <h2 className="text-[#1A0008] font-bold text-base mb-3">
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
                        { label: "Partially Occupied Rooms", value: partial,  color: "#9E2040" },
                        { label: "Available Rooms",          value: available, color: "#C47A8A" },
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

const OccupancyHistory = ({ records = [], className }: { records?: HistoryRecord[], className?: string }) => {    const [currentPage, setCurrentPage] = useState(1)
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

    const [itemsPerPage, setItemsPerPage] = useState(HISTORY_PER_PAGE)

    const totalPages = Math.ceil(sorted.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const paginated = sorted.slice(startIndex, startIndex + itemsPerPage)

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
        <Card className="overflow-x-auto">
            {/* Header row */}
            <div className="flex items-center justify-between gap-3 flex-wrap">
                <h2 className="text-[#1A0008] font-bold text-base">
                    Occupancy History
                </h2>
                <div className="flex items-center gap-2 ml-auto">
                    {/* Sort dropdown */}
                    <div className='hidden lg:block'>
                        <Dropdown
                            title="No. of Items"
                            items={[
                                { label: "5", href: "" },
                                { label: "10", href: "" },
                                { label: "15", href: "" },
                                { label: "20", href: "" },
                            ]}
                            direction='down'
                            widthClass="w-29 lg:w-32"
                            titleClass="text-[10px] lg:text-[11px]"
                            selectedClass="text-[12px] lg:text-[13px]"
                            onSelect={(label) => {
                                setItemsPerPage(Number(label))
                                setCurrentPage(1)
                            }}
                        />
                    </div>
                    
                    <Dropdown
                        title="Sort By"
                        items={SORT_OPTS.map(opt => ({ label: opt, href: "" }))}
                        direction='down'
                        widthClass="w-29 lg:w-32"
                        titleClass="text-[10px] lg:text-[11px]"
                        selectedClass="text-[12px] lg:text-[13px] block"
                        onSelect={(label) => {
                            setSortBy(label)
                            setCurrentPage(1)
                        }}
                        />
                    {/* <div className="relative">
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
                    </div> */}

                    {/* Search */}
                    {/* <div className="flex items-center gap-2 border border-[#E8D5DC] rounded-xl px-3 py-2 bg-white">
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
                    </div> */}
                    <SearchBar
                        value={search}
                        onChange={(query) => {
                            setSearch(query)
                            }}
                        onPageReset={() => setCurrentPage(1)}
                    />
                </div>
            </div>

            {/* Table header */}
            <div className="overflow-x-auto ">
                <table className="w-full mt-4">
                    <thead className="tracking-widest">
                        <tr className="border-[#6B0F2B]/5 border-y-2 uppercase">
                        <th className="text-[#9A7080] text-[11px] font-bold p-1 pr-16 text-left">Students</th>
                        <th className="text-[#9A7080] truncate text-[11px] font-bold p-1 pr-12 text-left">Room No.</th>
                        <th className="hidden lg:table-cell text-[#9A7080] text-[11px] font-bold pr-20 text-left">Building No.</th>
                        <th className="hidden lg:table-cell text-[#9A7080] text-[11px]  font-bold pr-8 text-left">Room Type</th>
                        <th className="text-[#9A7080] text-[11px] font-bold pr-16 text-left">Action</th>
                        <th className="text-[#9A7080] text-[11px] font-bold pr-12 text-left">
                            <span className="inline-flex items-center justify-center gap-1">
                            Date
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                            </span>
                        </th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginated.length > 0 ? paginated.map((record, i) => (
                        <tr key={i}>
                            <td className="py-3 p-1">
                            <div className="flex items-center gap-2">
                                <div className="hidden lg:flex w-9 h-9 rounded-xl flex-shrink-0 items-center justify-center text-white text-xs font-bold"
                                    style={{ background: "linear-gradient(135deg, #6B0F2B, #9E2040)" }}>
                                {getInitials(record.tenant.fullName)}
                                </div>
                                <p className="font-bold text-[12px] lg:text-sm text-[#1A0008]">{record.tenant.fullName}</p>
                            </div>
                            </td>
                            <td className="py-3 p-1 text-left text-[12px] lg:text-sm text-[#1A0008]">
                            Room {record.roomNumber}
                            </td>
                            <td className="hidden lg:table-cell py-3 p-1 text-left text-sm text-[#1A0008]">
                            Building {record.roomBuilding}
                            </td>
                            <td className="hidden lg:table-cell py-3 p-1 text-left text-sm text-[#1A0008] capitalize">
                            {record.roomType}
                            </td>
                            <td className="py-3 p-1">
                            <span className={`inline-flex items-center justify-center gap-1 text-[10px] lg:text-xs px-3 py-2 rounded-full font-bold ${
                                record.action === "Move-out" ? "bg-[#9E2040]/10 text-[#9E2040]" : "bg-[#1A7A4A]/10 text-[#1A7A4A]"
                            }`}>
                                <span className={`w-2 h-2 rounded-full ${record.action === "Move-out" ? "bg-[#9E2040]" : "bg-[#1A7A4A]"}`} />
                                {record.action}
                            </span>
                            </td>
                            <td className="py-3 p-1">
                            <p className="text-[11px] lg:text-sm text-[#1A0008]">{record.date}</p>
                            <p className="text-[8px] lg:text-[10px] text-[#9A7080]">{record.time}</p>
                            </td>
                        </tr>
                        )) : (
                        <tr>
                            <td colSpan={6} className="text-sm text-[#9A7080] py-6">No records found.</td>
                        </tr>
                        )}
                    </tbody>
                </table>
            </div>
            

            {/* Footer */}
            <div className="flex items-center justify-between mt-3 pt-2 border-t border-[#F5ECF0]">
                <p className="text-xs text-[#9A7080]">
                    Showing {sorted.length === 0 ? 0 : startIndex + 1}–{Math.min(startIndex + itemsPerPage, sorted.length)} of {sorted.length} records
                </p>
                <div className="flex items-center justify-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`w-7 h-7 text-xs rounded-md font-medium transition flex items-center justify-center
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
                            className="flex items-center justify-center w-7 h-7 text-xs rounded-md border border-[#E8D5DC] text-[#9A7080] hover:bg-[#F5ECF0] transition"
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
    const [rooms, setRooms] = useState<Room[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [historyRecords, setHistoryRecords] = useState<HistoryRecord[]>([])

    useEffect(() => {
        const fetchOccupancyData = async () => {
            try {
                const roomsResponse = await api.get("/manager/occupancy-records")
                setRooms(roomsResponse.data)
            } catch (err: any) {
                console.error("Rooms error:", err)
                setError(err.response?.data?.message || "Could not load rooms.")
            }

            try {
                const historyResponse = await api.get("/manager/occupancy-history")
                setHistoryRecords(historyResponse.data)
            } catch (err: any) {
                console.error("History error:", err)
                setHistoryRecords([])
            } finally {
                setLoading(false)
            }
        }

        fetchOccupancyData()
    }, [])

    return (
        <div className="flex h-screen overflow-hidden bg-[#F5EEF0] font-sans">
            <Sidebar role="manager" profile={managerProfile}/>
            <div className = "flex flex-col flex-1 min-w-0">
                <CustomHeader
                    title="Occupancy Records"></CustomHeader>
                <div className="flex-1 flex flex-col p-4 lg:p-6 overflow-y-auto">
                    <main className="flex-1 flex flex-col gap-4 lg:gap-6">
                        <HeroBanner 
                            greeting="Good Day"
                            name={managerProfile.fullName}
                            title="View occupancy records"
                            subtitle="We make it easy for you to keep track of occupancy records"
                            type="mini"
                        />
                        
                        {loading && (
                            <div className="flex flex-col items-center bg-white h-full w-full justify-center rounded-2xl text-center">
                                <div
                                    className="animate-spin rounded-full h-8 w-8 border-b-2"
                                    style={{ borderColor: "#9E2040" }}
                                    />
                                <p className="text-sm text-[#9A7080] mt-2">
                                Loading occupancy records...
                                </p>
                            </div>
                            
                        )}

                        {error && (
                            <div className="w-full h-full bg-white items-center justify-center flex rounded-2xl">
                                <p className="text-sm text-red-600">
                                    {error}
                                </p>
                            </div>
                            
                        )}

                        {!loading && !error && (
                            <>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
                            <RoomOccupancyDetails
                                rooms={rooms}
                                className="col-span-1 lg:col-span-2"
                            />
                            <OccupancyRooms 
                                rooms={rooms}
                                className="col-span-1"
                            />
                        </div>
                        <OccupancyHistory 
                            records={historyRecords}
                        />
                        </>
                    )}
                    </main>
                </div>
            </div>
            
        </div>
    )
}