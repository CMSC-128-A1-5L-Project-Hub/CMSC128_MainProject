import { useState, useMemo } from "react"
import { api } from "../../api/axios";

import Sidebar from "../../components/Sidebar"
import HeroBanner from "../../components/dashboard/HeroBanner"
import Card from "../../components/ui/Card"
import { useQuery } from "@tanstack/react-query";
import { DateTime } from 'luxon'

type Status = "approved" | "pending" | "waitlisted" | "cancelled" | "rejected";

interface User {
  id: number;
  accountStatus: string | null;
  email: string;
  facebookAccount: string | null;
  fname: string;
  mname: string | null;
  lname: string;
  suffix: string | null;
  role: string;
  otpCode: string | null;
  otpExpiresAt: string | null;
  pfpFileId: number | null;
}

interface Student {
  studentNumber: string;
  userId: number;
  phone: number;
  college: string;
  degreeProgram: string;
  gender: string;
  yearLevel: string | null;
  emergencyContactName: string | null;
  emergencyContactNumber: string | null;
  enrollmentProofFileId: number;
  form5Renewal: boolean | null;
  user: User;
}

interface Accommodation {
  id: number;
  landlordId: number;
  managerId: number | null;
  accommodationName: string;
  accommodationType: string;
  accommodationLocation: string;
  latitude: string | null;
  longitude: string | null;
  accommodationCapacity: number;
  status: string | null;
  tenantRestriction: string;
  businessPermitId: number;
  primaryImageIndex: number | null;
  applicationStartDate: string | null;
  applicationEndDate: string | null;
  walkingDistance: number | null;
  bikingDistance: number | null;
  drivingDistance: number | null;
  invitedManagerEmail: string | null;
}

export interface Room {
  id: number
  accommodationId: number
  roomNumber: string
  roomType: string
  roomStayType: string
  roomCapacity: number
  roomCurrentOccupancy: number
  roomBuilding: string
  roomRent: string
  tenantRestriction: string
  roomAvailability: string
  accommodation: Accommodation
}

export interface AssignmentResponse {
  id: number
  studentNumber: string
  roomId: number
  confirmedDate: string
  moveIn: DateTime | string
  expectedMoveOut: DateTime | string
  actualMoveOut: DateTime | string | null
  gracePeriodDays: number
  student: Student
  room: Room 
}

const diffFromNow = (isoDate: string | DateTime): number => {
  const target = typeof isoDate === 'string' 
    ? DateTime.fromISO(isoDate) 
    : isoDate

  const now = DateTime.now()

  // .diff() calculates: target - now
  const { days } = now.diff(target, 'days').toObject()

  return Math.trunc(days ?? 0)
}

const RECORDS_PER_PAGE = 5
type FilterType = "all" | "move-in" | "move-out"

// initial for avatar 
const getInitial = (name: string) => name[0].toUpperCase()

// Move type 
const avatarStyle = (moveType: "move-in" | "move-out") =>
    moveType === "move-out"
        ? { background: "linear-gradient(135deg, #9E2040, #C0456A)" }
        : { background: "linear-gradient(135deg, #6B0F2B, #9E2040)" }

export default function MoveinMoveout() {
    
    const {
            data: user,
            isLoading: isLoadingUser,
            isError: isErrorUser,
        } = useQuery({
            queryKey: ["me"],
            queryFn: async () => {
            const res = await api.get("/me");
            return res.data.data;
            },
        });

    const {
            data: assignments = [],
            isLoading: isLoadingList,
            isError: isErrorList,
            refetch,
        } = useQuery({
            queryKey: ["list"],
            queryFn: async () => {
            const res = await api.get("/view-assignments");
            return res.data;
            },
        });

    //TABLE 
    const MoveInMoveOutTable = ({ records = assignments }: { records?: AssignmentResponse[] }) => {
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
                    (filter === "move-in" && diffFromNow(r.moveIn) <= 0) ||
                    (filter === "move-out" && diffFromNow(r.moveIn) > 0)
                const matchesSearch =
                    r.student?.user.lname.toLowerCase().includes(q) ||
                    r.student?.user.fname.toLowerCase().includes(q) ||
                    r.room.roomBuilding.toLowerCase().includes(q) ||
                    r.room.roomNumber.toLowerCase().includes(q) ||
                    r.room.roomType.toLowerCase().includes(q)
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
                        {/* 1. LOADING STATE */}
                        {isLoadingList && (
                            <div className="py-10 text-center">
                                <div className="animate-spin inline-block w-6 h-6 border-[3px] border-current border-t-transparent text-[#9E2040] rounded-full" role="status">
                                    <span className="sr-only">Loading...</span>
                                </div>
                                <p className="text-sm text-[#9A7080] mt-2">Fetching assignments...</p>
                            </div>
                        )}

                        {/* 2. ERROR STATE */}
                        {isErrorList && (
                            <div className="py-10 text-center">
                                <p className="text-sm text-red-600 font-medium">Failed to load data.</p>
                                <button 
                                    onClick={() => refetch()} 
                                    className="mt-2 text-xs font-bold text-[#9E2040] hover:underline uppercase tracking-wider"
                                >
                                    Try Again
                                </button>
                            </div>
                        )}

                        {/* 3. SUCCESS STATE */}
                        {!isLoadingList && !isErrorList && (
                            paginated.length > 0 ? paginated.map((record, i) => {
                                // Calculate once per row to keep code clean
                                const diffMoveIn = diffFromNow(record.moveIn);
                                const diffMoveOut = diffFromNow(record.expectedMoveOut);
                                const isMoveIn = diffMoveIn <= 0;

                                return (
                                    <div
                                        key={i}
                                        className={`flex items-center py-3 rounded-lg px-1 transition
                                            ${isMoveIn ? "" : "bg-[#FDF4F7]"}`}
                                    >
                                        {/* STUDENT */}
                                        <div className="basis-[26%] flex items-center gap-3">
                                            <div
                                                className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center text-white text-sm font-bold"
                                                style={avatarStyle(isMoveIn ? 'move-in' : 'move-out')}
                                            >
                                                {getInitial(record.student.user.lname)}
                                            </div>
                                            <p className="font-semibold text-sm text-[#1A0008]">
                                                {record.student.user.fname} {record.student.user.lname}
                                            </p>
                                        </div>

                                        {/* ROOM */}
                                        <div className="basis-[20%] flex flex-col">
                                            <span className="text-sm text-[#1A0008]">{record.room.roomNumber}</span>
                                            <span className="text-xs text-[#9A7080]">{record.room.roomBuilding}</span>
                                        </div>

                                        {/* ROOM TYPE */}
                                        <div className="basis-[22%] flex flex-col">
                                            <span className="text-sm text-[#1A0008] capitalize">
                                                {record.room.roomStayType.replace('_', ' ')}
                                            </span>
                                            <span className="text-xs text-[#9A7080] capitalize">{record.room.roomType}</span>
                                        </div>

                                        {/* DATE */}
                                        <div className="basis-[20%] flex flex-col">
                                            <span className="text-sm text-[#1A0008]">
                                                {isMoveIn ? record.moveIn.toLocaleString() : record.expectedMoveOut.toLocaleString()}
                                            </span>
                                            <span className={`text-xs ${isMoveIn ? "text-[#9A7080]" : "text-[#9E2040]"}`}>
                                                {isMoveIn 
                                                    ? `${Math.abs(diffMoveIn)} days until move-in` 
                                                    : `${diffMoveOut < 0 
                                                        ? Math.abs(diffMoveOut) + ' days until move-out' 
                                                        : Math.abs(diffMoveOut) + ' days since move-out'}`}
                                            </span>
                                        </div>

                                        {/* MOVE TYPE */}
                                        <div className="basis-[10%]">
                                            <span className={`text-sm font-medium capitalize ${isMoveIn ? "text-[#1A0008]" : "text-[#9E2040]"}`}>
                                                {isMoveIn ? "Move-in" : "Move-out"}
                                            </span>
                                        </div>
                                    </div>
                                );
                            }) : (
                                <p className="text-sm text-[#9A7080] py-6 text-center">No records found.</p>
                            )
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

    return (
        <div className="flex h-screen overflow-hidden bg-[#F5EEF0] font-sans">
            {/* SIDEBAR */}
            <Sidebar role="manager" profile={isLoadingUser ? "Loading..." : isErrorUser ? "Error Loading Name" : user?.fname} />
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
                        name={isLoadingUser ? "Loading..." : isErrorUser ? "Error Loading Name" : user?.fname}
                        title="Check your applicants"
                        subtitle="We make it easy for you to track the accommodation applications you manage."
                        type="mini"
                    />
                    {/* TABLE */}
                    <MoveInMoveOutTable records={assignments} />
                </main>
            </div>
        </div>
    )
}