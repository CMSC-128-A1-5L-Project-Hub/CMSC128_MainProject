import { useState, useMemo } from "react"

import Sidebar from "../../components/Sidebar"
import HeroBanner from "../../components/dashboard/HeroBanner"
import Card from "../../components/ui/Card"

interface ManagerProfile {
    fullName: string
    shortName: string
    email: string
    phoneNumber: string
    status: string
    dormitory: string
}

type Student = {
    fullName: string
    shortName: string
    course: string
    campus: string
    email: string
    phone: string
    studentNo: string
    college: string
    yearLevel: string
    status: string
}

type Accommodation = {
    building: string
    roomNumber: string
}

type MoveRecord = {
    student: Student
    accommodation: Accommodation
    roomType: "solo" | "double" | "shared"
    stayType: "transient" | "non-transient"
    moveType: "move-in" | "move-out"
    applicationStatus: 'pending' | 'approved' | 'rejected' | 'cancelled' | 'waitlisted' | 'under_review'
    durationOfStayDays: number
    date: string
    dateLabel?: string 
}

const managerProfile: ManagerProfile = {
    fullName: "Ana Reyes",
    shortName: "Ana",
    email: "anareyes@up.edu.ph",
    phoneNumber: "+63 912 345 6789",
    status: "Active",
    dormitory: "Narra Residences"
}

const moveRecords: MoveRecord[] = [
    {
        student: {
            fullName: "Kayanne Reyes",
            shortName: "Kayanne",
            course: "BS Information Technology",
            campus: "UPLB",
            email: "kayanne.reyes@student.edu.ph",
            phone: "09178881234",
            studentNo: "2022-10001",
            college: "CCS",
            yearLevel: "2nd Year",
            status: "Active"
        },
        accommodation: { building: "Building 6", roomNumber: "Room 6543" },
        roomType: "shared",
        stayType: "transient",
        moveType: "move-in",
        applicationStatus: "approved",
        durationOfStayDays: 1,
        date: "March 28, 2026",
        dateLabel: "Today"
    },
    {
        student: {
            fullName: "Molave Reyes",
            shortName: "Molave",
            course: "BS Civil Engineering",
            campus: "UPLB",
            email: "molave.reyes@student.edu.ph",
            phone: "09179992345",
            studentNo: "2021-11223",
            college: "CEAT",
            yearLevel: "3rd Year",
            status: "Active"
        },
        accommodation: { building: "Building 6", roomNumber: "Room 6543" },
        roomType: "solo",
        stayType: "non-transient",
        moveType: "move-in",
        applicationStatus: "approved",
        durationOfStayDays: 6,
        date: "April 2, 2026",
        dateLabel: "6 days left"
    },
    {
        student: {
            fullName: "Narra Reyes",
            shortName: "Narra",
            course: "BS Psychology",
            campus: "UPLB",
            email: "narra.reyes@student.edu.ph",
            phone: "09171239876",
            studentNo: "2023-14567",
            college: "CAS",
            yearLevel: "1st Year",
            status: "Active"
        },
        accommodation: { building: "Building 6", roomNumber: "Room 6543" },
        roomType: "double",
        stayType: "non-transient",
        moveType: "move-in",
        applicationStatus: "approved",
        durationOfStayDays: 1,
        date: "Mar 27, 2026",
        dateLabel: "Today"
    },
    {
        student: {
            fullName: "Yakal Reyes",
            shortName: "Yakal",
            course: "BS Agriculture",
            campus: "UPLB",
            email: "yakal.reyes@student.edu.ph",
            phone: "09173334455",
            studentNo: "2020-16789",
            college: "CAFS",
            yearLevel: "4th Year",
            status: "Active"
        },
        accommodation: { building: "Building 6", roomNumber: "Room 6543" },
        roomType: "solo",
        stayType: "transient",
        moveType: "move-out",
        applicationStatus: "approved",
        durationOfStayDays: 1,
        date: "March 28, 2026",
        dateLabel: "Tomorrow"
    },
    {
        student: {
            fullName: "Ilang Reyes",
            shortName: "Ilang",
            course: "BS Development Communication",
            campus: "UPLB",
            email: "ilang.reyes@student.edu.ph",
            phone: "09175556677",
            studentNo: "2022-18890",
            college: "CDC",
            yearLevel: "2nd Year",
            status: "Active"
        },
        accommodation: { building: "Building 6", roomNumber: "Room 6543" },
        roomType: "shared",
        stayType: "transient",
        moveType: "move-out",
        applicationStatus: "approved",
        durationOfStayDays: 5,
        date: "April 1, 2026",
        dateLabel: "5 days left"
    },
    {
        student: {
            fullName: "Malvar Reyes",
            shortName: "Malvar",
            course: "BS Forestry",
            campus: "UPLB",
            email: "malvar.reyes@student.edu.ph",
            phone: "09178889900",
            studentNo: "2019-19901",
            college: "CFNR",
            yearLevel: "5th Year",
            status: "Active"
        },
        accommodation: { building: "Building 6", roomNumber: "Room 6543" },
        roomType: "solo",
        stayType: "non-transient",
        moveType: "move-in",
        applicationStatus: "approved",
        durationOfStayDays: 9,
        date: "April 5, 2026",
        dateLabel: "9 days left"
    },
        {
        student: {
            fullName: "Malvar Reyes",
            shortName: "Malvar",
            course: "BS Forestry",
            campus: "UPLB",
            email: "malvar.reyes@student.edu.ph",
            phone: "09178889900",
            studentNo: "2019-19901",
            college: "CFNR",
            yearLevel: "5th Year",
            status: "Active"
        },
        accommodation: { building: "Building 6", roomNumber: "Room 6543" },
        roomType: "solo",
        stayType: "non-transient",
        moveType: "move-in",
        applicationStatus: "approved",
        durationOfStayDays: 9,
        date: "April 5, 2026",
        dateLabel: "9 days left"
    }
    ,    {
        student: {
            fullName: "Malvar Reyes",
            shortName: "Malvar",
            course: "BS Forestry",
            campus: "UPLB",
            email: "malvar.reyes@student.edu.ph",
            phone: "09178889900",
            studentNo: "2019-19901",
            college: "CFNR",
            yearLevel: "5th Year",
            status: "Active"
        },
        accommodation: { building: "Building 6", roomNumber: "Room 6543" },
        roomType: "solo",
        stayType: "non-transient",
        moveType: "move-in",
        applicationStatus: "approved",
        durationOfStayDays: 9,
        date: "April 5, 2026",
        dateLabel: "9 days left"
    }
    ,    {
        student: {
            fullName: "Malvar Reyes",
            shortName: "Malvar",
            course: "BS Forestry",
            campus: "UPLB",
            email: "malvar.reyes@student.edu.ph",
            phone: "09178889900",
            studentNo: "2019-19901",
            college: "CFNR",
            yearLevel: "5th Year",
            status: "Active"
        },
        accommodation: { building: "Building 6", roomNumber: "Room 6543" },
        roomType: "solo",
        stayType: "non-transient",
        moveType: "move-in",
        applicationStatus: "approved",
        durationOfStayDays: 9,
        date: "April 5, 2026",
        dateLabel: "9 days left"
    },
       
]

const RECORDS_PER_PAGE = 5
type FilterType = "all" | "move-in" | "move-out"

// initial for avatar 
const getInitial = (name: string) => name[0].toUpperCase()

// Move type 
const avatarStyle = (moveType: "move-in" | "move-out") =>
    moveType === "move-out"
        ? { background: "linear-gradient(135deg, #9E2040, #C0456A)" }
        : { background: "linear-gradient(135deg, #6B0F2B, #9E2040)" }

//TABLE 
const MoveInMoveOutTable = ({ records = moveRecords }: { records?: MoveRecord[] }) => {
    //STATE 
    const [filter, setFilter] = useState<FilterType>("all")
    const [currentPage, setCurrentPage] = useState(1)
    const [search, setSearch] = useState("")

    //FILTER AND SEARCH
    const filtered = useMemo(() => {
        const q = search.toLowerCase()
        return records.filter(r => {
            const matchesFilter =
                filter === "all" ||
                (filter === "move-in" && r.moveType === "move-in") ||
                (filter === "move-out" && r.moveType === "move-out")
            const matchesSearch =
                r.student.fullName.toLowerCase().includes(q) ||
                r.accommodation.building.toLowerCase().includes(q) ||
                r.accommodation.roomNumber.toLowerCase().includes(q) ||
                r.roomType.toLowerCase().includes(q)
            return matchesFilter && matchesSearch
        })
    }, [records, search, filter])

    //PAGES 
    const totalPages = Math.ceil(filtered.length / RECORDS_PER_PAGE)
    const startIndex = (currentPage - 1) * RECORDS_PER_PAGE
    const paginated = filtered.slice(startIndex, startIndex + RECORDS_PER_PAGE)

    const handleFilterChange = (f: FilterType) => {
        setFilter(f)
        setCurrentPage(1)
    }

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value)
        setCurrentPage(1)
    }

    return (
        <div className="flex flex-col gap-3">
            {/* FILTER BUTTONS */}
            <div className="flex items-center gap-2">
                {(["all", "move-in", "move-out"] as FilterType[]).map(f => (
                    <button
                        key={f}
                        onClick={() => handleFilterChange(f)}
                        className={`px-5 py-2 rounded-full text-sm font-semibold transition capitalize
                            ${filter === f
                                ? "text-white shadow"
                                : "text-[#6B0F2B] bg-white border border-[#E8D5DC] hover:bg-[#F5ECF0]"
                            }`}
                        style={filter === f ? { background: "linear-gradient(135deg, #6B0F2B, #9E2040)" } : {}}
                    >
                        {f === "all" ? "All" : f === "move-in" ? "Move in" : "Move out"}
                    </button>
                ))}
            </div>

            <Card>
                {/*HEADER (TITLE + SERACG */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex flex-col gap-1">
                        <h2 className="text-[#1A0008] font-bold text-base lg:text-lg">
                            Move in &amp; Move out History
                        </h2>
                        <p className="text-xs text-gray-400">
                            {filtered.length} total move {filter === "all" ? "outs" : filter === "move-out" ? "outs" : "ins"}
                        </p>
                    </div>

                    <div className="flex items-center gap-2 border border-[#E8D5DC] rounded-xl px-3 py-2 bg-white">
                        <svg className="w-4 h-4 text-[#9A7080] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Search applications..."
                            value={search}
                            onChange={handleSearch}
                            className="text-sm outline-none bg-transparent text-[#1A0008] placeholder-[#C4A4B0] w-44"
                        />
                    </div>
                </div>

                {/* TABLE HEADER */}
                <div className="flex border-b border-[#F5ECF0] uppercase pb-1 mb-1">
                    <p className="basis-[26%] text-[#9A7080] text-xs font-bold p-1">Students</p>
                    <p className="basis-[20%] text-[#9A7080] text-xs font-bold p-1 flex items-center gap-1">
                        Room
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </p>
                    <p className="basis-[22%] text-[#9A7080] text-xs font-bold p-1 flex items-center gap-1">
                        Room Type
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </p>
                    <p className="basis-[20%] text-[#9A7080] text-xs font-bold p-1 flex items-center gap-1">
                        Date
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </p>
                    <p className="basis-[10%] text-[#9A7080] text-xs font-bold p-1 flex items-center gap-1">
                        Type
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </p>
                </div>

                {/* ROWS */}
                <div className="flex flex-col divide-y divide-[#F5ECF0]">
                    {paginated.length > 0 ? paginated.map((record, i) => (
                        <div
                            key={i}
                            className={`flex items-center py-3 rounded-lg px-1 transition
                                ${record.moveType === "move-out" ? "bg-[#FDF4F7]" : ""}`}
                        >
                            {/* STUDENT */}
                            <div className="basis-[26%] flex items-center gap-3">
                                <div
                                    className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center text-white text-sm font-bold"
                                    style={avatarStyle(record.moveType)}
                                >
                                    {getInitial(record.student.fullName)}
                                </div>
                                <p className="font-semibold text-sm text-[#1A0008]">{record.student.fullName}</p>
                            </div>

                            {/* ROOM */}
                            <div className="basis-[20%] flex flex-col">
                                <span className="text-sm text-[#1A0008]">{record.accommodation.roomNumber}</span>
                                <span className="text-xs text-[#9A7080]">{record.accommodation.building}</span>
                            </div>

                            {/* ROOM TYPE */}
                            <div className="basis-[22%] flex flex-col">
                                <span className="text-sm text-[#1A0008] capitalize">
                                    {record.stayType === "non-transient" ? "Non-Transient" : "Transient"}
                                </span>
                                <span className="text-xs text-[#9A7080] capitalize">{record.roomType}</span>
                            </div>

                            {/* DATE */}
                            <div className="basis-[20%] flex flex-col">
                                <span className="text-sm text-[#1A0008]">{record.date}</span>
                                {record.dateLabel && (
                                    <span className="text-xs text-[#9A7080]">{record.dateLabel}</span>
                                )}
                            </div>

                            {/* MOVE TYPE */}
                            <div className="basis-[10%]">
                                <span
                                    className={`text-sm font-medium capitalize
                                        ${record.moveType === "move-out" ? "text-[#9E2040]" : "text-[#1A0008]"}`}
                                >
                                    {record.moveType === "move-in" ? "Move-in" : "Move-out"}
                                </span>
                            </div>
                        </div>
                    )) : (
                        <p className="text-sm text-[#9A7080] py-6 text-center">No records found.</p>
                    )}
                </div>

                {/* FOOTER */}
                <div className="flex items-center justify-between mt-3 pt-2 border-t border-[#F5ECF0]">
                    <p className="text-xs text-[#9A7080]">
                        Showing {filtered.length === 0 ? 0 : startIndex + 1}–{Math.min(startIndex + RECORDS_PER_PAGE, filtered.length)} of {filtered.length} applications
                    </p>
                    <div className="flex items-center gap-1">
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
        </div>
    )
}

export default function MoveinMoveout() {
    return (
        <div className="flex h-screen overflow-hidden bg-[#F5EEF0] font-sans">
            {/* SIDEBAR */}
            <Sidebar role="manager" profile={managerProfile} />
            {/* CONTENT */}
            <div className="flex-1 flex flex-col p-5 overflow-y-auto">
                <div className="pl-10 lg:pl-0 flex flex-row border-b border-[#6B0F2B]/7 mb-2 pb-1">
                    <div
                        className="hidden lg:inline w-2 h-8 rounded-xl mt-1 mr-2"
                        style={{ background: "linear-gradient(to bottom right, #6B0F2B 0%, #9E2040 100%)" }}
                    />
                    <h1 className="text-4xl font-serif italic font-bold text-[#6B0F2B]">
                        Move in and Move out
                    </h1>
                </div>

                <main className="flex-1 flex flex-col gap-4">
                    <HeroBanner
                        greeting="Good Day"
                        name={managerProfile.fullName}
                        title="Check your applicants"
                        subtitle="We make it easy for you to track the accommodation applications you manage."
                        type="mini"
                    />
                    {/* TABLE */}
                    <MoveInMoveOutTable records={moveRecords} />
                </main>
            </div>
        </div>
    )
}