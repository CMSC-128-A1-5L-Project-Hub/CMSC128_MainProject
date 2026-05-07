import { useState, useMemo } from "react"
import { api } from "../../api/axios";

import Sidebar from "../../components/Sidebar"
import HeroBanner from "../../components/dashboard/HeroBanner"
import Card from "../../components/ui/Card"
import { useQuery } from "@tanstack/react-query";
import { DateTime } from 'luxon'
import CustomHeader from '../../components/CustomHeader';

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

const diffFromNow = (isoDate: string | DateTime | undefined | null): number => {
  if (!isoDate) return 0

  const target = typeof isoDate === 'string' 
    ? DateTime.fromISO(isoDate) 
    : isoDate

  const now = DateTime.now()

  const { days } = now.diff(target, 'days').toObject()

  return Math.trunc(days ?? 0)
}

const RECORDS_PER_PAGE = 15
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
            return res.data;
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
            const res = await api.get("/view-all-assignments");
            return res.data;
            },
        });
    
    //TABLE 
    const MoveInMoveOutTable = ({ records = assignments }: { records?: AssignmentResponse[] }) => {
        //STATE 
        const [filter, setFilter] = useState<FilterType>("all")
        const [currentPage, setCurrentPage] = useState(1)
        const [search, setSearch] = useState("")

        const tableTitle =
        filter === "move-in"
            ? "Move in History"
            : filter === "move-out"
            ? "Move out History"
            : "Move in and Move out History"

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
                <div className="bg-white p-1 rounded-xl inline-flex gap-1 w-fit">
                {(["all", "move-in", "move-out"] as FilterType[]).map(f => (
                    <button
                    key={f}
                    onClick={() => handleFilterChange(f)}
                    className={`px-4 py-1.5 text-sm rounded-lg transition ${
                        filter === f
                        ? "bg-[#6B0F2B] text-white shadow"
                        : "text-gray-500 hover:text-black"
                    }`}
                    >
                    {f === "all" ? "All" : f === "move-in" ? "Move in" : "Move out"}
                    </button>
                ))}
                </div>
            

               <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
                    {/*HEADER (TITLE + SERACG */}
                    <div className="flex items-start justify-between p-4 border-b">
                        <div className="flex flex-col gap-1">
                            <h2 className="text-[#1A0008] font-bold text-sm lg:text-lg leading-tight">
                                <span className="hidden sm:inline whitespace-nowrap">
                                    {tableTitle}
                                </span>

                                <span className="sm:hidden">
                                    {filter === "all" ? (
                                    <>
                                        Move in and Move out
                                        <br />
                                        History
                                    </>
                                    ) : (
                                    tableTitle
                                    )}
                                </span>
                                </h2>
                            <p className="text-xs text-gray-400">
                                {filter === "all"
                                ? `${filtered.length} total move-in and move-out history`
                                : filter === "move-out"
                                ? `${filtered.length} total move-outs`
                                : `${filtered.length} total move-ins`}                            
                                </p>
                        </div>

                        <div className="relative w-[130px] sm:w-[180px]">
                            <svg
                                className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A36F82]"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth={2.5}
                                viewBox="0 0 24 24"
                                >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M21 21l-4.35-4.35m1.6-5.4a7 7 0 11-14 0 7 7 0 0114 0z"
                                />
                                </svg>
                            <input
                                type="text"
                                placeholder="Search..."
                                value={search}
                                onChange={handleSearch}
                                className="w-full min-w-0 h-10 bg-white border border-[#E8D5DC] rounded-xl pl-8 pr-7 text-sm text-[#3D0718] placeholder:text-[#C7A7B3] focus:outline-none focus:bg-[#F5ECF0] transition-all duration-200"
                            />
                        </div>
                    </div>

                    {/* TABLE HEADER */}
                    <div className="w-full overflow-x-auto pb-2">
                    <table className="min-w-[900px] w-full text-sm table-fixed">
                        <thead>
                        <tr className="border-b border-[#6B0F2B]/10">
                            <th className="px-4 py-3 text-left text-[#9A7080] text-[11px] font-bold uppercase tracking-[0.2em] whitespace-nowrap">
                            Students
                            </th>

                            <th className="px-3 py-3 text-left text-[#9A7080] text-[11px] font-bold uppercase tracking-[0.2em] whitespace-nowrap">
                            Room
                            </th>

                            <th className="px-5 py-3 text-left text-[#9A7080] text-[11px] font-bold uppercase tracking-[0.2em] whitespace-nowrap">
                            Room Type
                            </th>

                            <th className="px-[60px] py-3 text-left text-[#9A7080] text-[11px] font-bold uppercase tracking-[0.2em] whitespace-nowrap">
                            Date
                            </th>

                            <th className="px-8 py-3 text-left text-[#9A7080] text-[11px] font-bold uppercase tracking-[0.2em] whitespace-nowrap">
                            Type
                            </th>
                        </tr>
                        </thead>
                        {/* ROWS */}
                        <tbody className="divide-y divide-[#F5ECF0]">
                        {/* LOADING STATE */}
                        {isLoadingList && (
                            <tr>
                            <td colSpan={5} className="py-10">
                                <div className="flex flex-col items-center justify-center text-center">
                                <div
                                    className="animate-spin rounded-full h-8 w-8 border-b-2"
                                    style={{ borderColor: "#9E2040" }}
                                    role="status"
                                >
                                    <span className="sr-only">Loading...</span>
                                </div>

                                <p className="text-sm text-[#9A7080] mt-2">
                                    Fetching move-in and move-out history...
                                </p>
                                </div>
                            </td>
                            </tr>
                        )}

                        {/* ERROR STATE */}
                        {isErrorList && (
                            <tr>
                            <td colSpan={5} className="py-10 text-center">
                                <p className="text-sm text-red-600 font-medium">
                                Failed to load data.
                                </p>

                                <button
                                onClick={() => refetch()}
                                className="mt-2 text-xs font-bold text-[#9E2040] hover:underline uppercase tracking-wider"
                                >
                                Try Again
                                </button>
                            </td>
                            </tr>
                        )}

                        {/* SUCCESS STATE */}
                        {!isLoadingList && !isErrorList && (
                            paginated.length > 0 ? (
                            paginated.map((record, i) => {
                                const diffMoveIn = diffFromNow(record.moveIn);
                                const diffMoveOut = diffFromNow(record.expectedMoveOut);
                                const isMoveIn = diffMoveIn <= 0;

                                return (
                                <tr
                                    key={i}
                                    className={`transition hover:bg-[#FFF9FA] ${
                                    isMoveIn ? "" : "bg-[#FDF4F7]"
                                    }`}
                                >
                                    {/* STUDENT */}
                                    <td className="px-4 py-3">
                                    <div className="flex items-center gap-3">
                                        <div
                                        className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center text-white text-sm font-bold"
                                        style={{
                                            background:
                                            "linear-gradient(135deg, #6B0F2B, #9E2040)",
                                        }}
                                        >
                                        {getInitial(record.student.user.lname)}
                                        </div>

                                        <p className="font-semibold text-sm text-[#1A0008]">
                                        {record.student.user.fname}{" "}
                                        {record.student.user.lname}
                                        </p>
                                    </div>
                                    </td>

                                    {/* ROOM */}
                                    <td className="px-4 py-3">
                                    <div className="flex flex-col">
                                        <span className="text-sm text-[#1A0008]">
                                        {record?.room.roomNumber}
                                        </span>

                                        <span className="text-xs text-[#9A7080]">
                                        {record?.room.roomBuilding}
                                        </span>
                                    </div>
                                    </td>

                                    {/* ROOM TYPE */}
                                    <td className="px-4 py-3">
                                    <div className="flex flex-col">
                                        <span className="text-sm text-[#1A0008] capitalize">
                                        {record.room.roomStayType.replace("_", " ")}
                                        </span>

                                        <span className="text-xs text-[#9A7080] capitalize">
                                        {record.room.roomType}
                                        </span>
                                    </div>
                                    </td>

                                    {/* DATE */}
                                    <td className="px-4 py-3">
                                    <div className="flex flex-col">
                                        <span className="text-sm text-[#1A0008]">
                                        {isMoveIn
                                            ? record.moveIn.toLocaleString()
                                            : record.expectedMoveOut.toLocaleString()}
                                        </span>

                                        <span
                                        className={`text-xs ${
                                            isMoveIn
                                            ? "text-[#9A7080]"
                                            : "text-[#9E2040]"
                                        }`}
                                        >
                                        {isMoveIn
                                            ? `${Math.abs(diffMoveIn)} days until move-in`
                                            : `${
                                                diffMoveOut < 0
                                                ? Math.abs(diffMoveOut) +
                                                    " days until move-out"
                                                : Math.abs(diffMoveOut) +
                                                    " days since move-out"
                                            }`}
                                        </span>
                                    </div>
                                    </td>

                                    {/* MOVE TYPE */}
                                    <td className="px-4 py-3">
                                    <span
                                        className={`text-sm font-medium capitalize ${
                                        isMoveIn
                                            ? "text-[#1A0008]"
                                            : "text-[#9E2040]"
                                        }`}
                                    >
                                        {isMoveIn ? "Move-in" : "Move-out"}
                                    </span>
                                    </td>
                                </tr>
                                );
                            })
                            ) : (
                            <tr>
                                <td colSpan={5} className="py-12 text-center">
                                <p className="text-base italic text-gray-400">
                                    Nothing to see here
                                </p>
                                </td>
                            </tr>
                            )
                        )}
                        </tbody>
                        </table>
                    

                    {/* FOOTER */}
                    <div className="flex items-center justify-between px-4 py-3 border-t border-[#F5ECF0]">
                        <p className="text-xs text-[#9A7080]">
                        {filtered.length === 0
                            ? "No results"
                            : `Showing ${startIndex + 1}–${Math.min(
                                startIndex + RECORDS_PER_PAGE,
                                filtered.length
                            )} of ${filtered.length}`}
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
                 </div>
            </div>
            
         </div>
        )
    }

    return (
        <div className="flex h-screen overflow-hidden bg-[#F5EEF0] font-sans">
            {/* SIDEBAR */}
            <Sidebar role="manager" profile={isLoadingUser ? "Loading..." : isErrorUser ? "Error Loading Name" : user?.fname} />
            {/* CONTENT */}
                <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
                    <CustomHeader title="Move in and Move out" />
                
                    <div className="flex-1 flex flex-col p-5 overflow-y-auto">
                        <main className="flex-1 flex flex-col gap-4">
                            <HeroBanner
                                greeting="Good Day"
                                name={isLoadingUser ? "Loading..." : isErrorUser ? "Error Loading Name" : user?.fname}
                                title="Check your move-in and move-out history"
                                subtitle="We make it easy for you to track the accommodation applications you manage."
                                type="full"
                            />
                    {/* TABLE */}
                    <MoveInMoveOutTable records={assignments} />
                </main>
            </div>
        </div>
     </div>
    )
}