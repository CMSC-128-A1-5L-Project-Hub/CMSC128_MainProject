import { useState, useMemo } from "react"
import { api } from "../../api/axios";
import CustomHeader from '../../components/CustomHeader';
import Dropdown from "../../components/ApplicationStatus/Dropdown";
import SearchBar from '../../components/SearchBar';

import Sidebar from "../../components/Sidebar"
import HeroBanner from "../../components/dashboard/HeroBanner"
import Card from "../../components/ui/Card"
import { useQuery } from "@tanstack/react-query";
import { DateTime } from 'luxon'

type Status = "approved" | "pending" | "waitlisted" | "cancelled" | "rejected";

const CLR = {
  dark: "#3D0718",
  mid: "#6B0F2B",
  accent: "#8C1535",
  gold: "#C9973A",
  avatars: [
    "#6B0F2B",
    "#8C1535",
    "#3D0718",
    "#b45309",
    "#15803d",
    "#7c3aed",
    "#1d4ed8",
    "#0f766e",
    "#92400e",
    "#065f46",
  ],
} as const;

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

  // .diff() calculates: target - now
  const { days } = now.diff(target, 'days').toObject()

  return Math.trunc(days ?? 0)
}

// const RECORDS_PER_PAGE = 5
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
            queryKey: ["moveInMoveOutlist"],
            queryFn: async () => {
            const res = await api.get("/view-all-assignments");
            return res.data;
            },
            placeholderData: (prev) => prev,
        });

    //TABLE 
    const MoveInMoveOutTable = ({ records = assignments }: { records?: AssignmentResponse[] }) => {
        //STATE 
        const [filter, setFilter] = useState<FilterType>("all")
        const [currentPage, setCurrentPage] = useState(1)
        const [search, setSearch] = useState("")

        const [itemsPerPage, setItemsPerPage] = useState(5)
        const [sortBy, setSortBy] = useState("Date")

        const SORT_OPTS = [
        { value: "Date", label: "Date" },
        { value: "Room Type", label: "Room Type" },
        { value: "Building", label: "Building" },
        ]

        const handleSort = (option: string) => {
        setSortBy(option)
        setCurrentPage(1)
        }

        //FILTER AND SEARCH

        const safeRecords = records ?? []

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
        }, [safeRecords, search, filter])

        const sorted = useMemo(() => {
            return [...filtered].sort((a, b) => {
                if (sortBy === "Room Type") return a.room.roomType.localeCompare(b.room.roomType)
                if (sortBy === "Building") return a.room.roomBuilding.localeCompare(b.room.roomBuilding)
                if (sortBy === "Date") return new Date(a.moveIn as string).getTime() - new Date(b.moveIn as string).getTime()
                return 0
            })
            }, [filtered, sortBy])

        //PAGES 
        const totalPages = Math.ceil(sorted.length / itemsPerPage)
        const startIndex = (currentPage - 1) * itemsPerPage
        const paginated = sorted.slice(startIndex, startIndex + itemsPerPage)

        const handleFilterChange = (f: FilterType) => {
            setFilter(f)
            setCurrentPage(1)
        }

        // const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        //     setSearch(e.target.value)
        //     setCurrentPage(1)
        // }

        return (
            <div className="flex flex-col gap-4 h-full">
                {/* FILTER BUTTONS */}
                <div className="bg-white p-1 rounded-xl inline-flex gap-1 w-fit">
                    {(["all", "move-in", "move-out"] as FilterType[]).map(f => (
                        <button
                            key={f}
                            onClick={() => handleFilterChange(f)}
                            className={`px-4 py-1.5 text-sm rounded-lg transition capitalize
                                ${filter === f
                                    ? "bg-[#6B0F2B] text-white shadow"
                                    : "text-gray-500 hover:text-black"
                                }`}
                        >
                            {f === "all" ? "All" : f === "move-in" ? "Move in" : "Move out"}
                        </button>
                    ))}
                </div>
                

               <div className="bg-white rounded-2xl shadow-sm p-6 border overflow-hidden h-full">
                    {/*HEADER (TITLE + SERACG */}
                    <div className="flex items-start justify-between">
                        <div className="flex flex-col gap-1">
                            <h2 className="text-[#1A0008] font-bold text-sm lg:text-lg leading-tight whitespace-nowrap">
                            Move in &amp; Move out History
                            </h2>
                            <p className="text-xs text-gray-400">
                            {filtered.length} total move {filter === "all" ? "outs" : filter === "move-out" ? "outs" : "ins"}
                            </p>
                        </div>

                        <div className="flex items-center gap-2">
                            <div className="hidden lg:block">
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
                            items={SORT_OPTS.map(opt => ({ label: opt.label, href: "" }))}
                            direction='down'
                            widthClass="w-29 lg:w-32"
                            titleClass="text-[10px] lg:text-[11px]"
                            selectedClass="text-[12px] lg:text-[13px] block"
                            onSelect={(label) => {
                                handleSort(label)
                            }}
                            />
                            <SearchBar
                            value={search}
                            onChange={(query) => setSearch(query)}
                            onPageReset={() => setCurrentPage(1)}
                            />
                        </div>
                        
                    </div>
                    <div className={`${records.length === 0 && !isLoadingList ?  "items-center justify-center" : ""} w-full overflow-x-auto h-full flex flex-col`}>
                        <div className={`${records.length === 0 && !isLoadingList ? "flex flex-col" : "hidden" }  justify-center items-center text-center`}>
                            <p className="text-[#9A7080] font-medium text-lg">No tenants found</p>
                            <p className="text-[#9A7080]/60 text-sm mt-1">When tenants are assigned rooms, they will appear here</p>
                        </div>
                        <table className={`${records.length === 0 && !isLoadingList ? "hidden" : "table"} min-w-[900px] w-full border-b-2 mt-4 border-[#F5ECF0]`}>
                            <thead>
                            <tr className="border-y-2 border-[#6B0F2B]/5">
                                {["Students", "Room", "Room Type", "Date", "Type"].map((h, i) => (
                                <th
                                    key={h}
                                    className="text-[#9A7080] text-xs font-bold tracking-widest uppercase pl-3 py-2 text-left"
                                >
                                    {h}
                                </th>
                                ))}
                            </tr>
                            </thead>
                            <tbody>
                            {isLoadingList ? (
                                <div className="py-12 flex flex-col items-center justify-center text-center w-full h-full">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: CLR.mid }} />
                                    <p className="text-sm text-[#9A7080] mt-2">Fetching applications...</p>
                                </div>
                            ) : isErrorList ? (
                                <tr>
                                <td colSpan={5} className="py-10 text-center">
                                    <p className="text-sm text-red-600 font-medium">Failed to load data.</p>
                                    <button
                                    onClick={() => refetch()}
                                    className="text-xs font-bold text-[#9E2040] hover:underline uppercase tracking-wider"
                                    >
                                    Try Again
                                    </button>
                                </td>
                                </tr>
                            ) : paginated.length > 0 ? (
                                paginated.map((record, i) => {
                                const diffMoveIn = diffFromNow(record.moveIn)
                                const diffMoveOut = diffFromNow(record.expectedMoveOut)
                                const isMoveIn = diffMoveIn <= 0

                                return (
                                    <tr
                                    key={i}
                                    className={`transition ${isMoveIn ? "" : "bg-[#FDF4F7]"}`}
                                    >
                                    {/* Student */}
                                    <td className="py-3 pl-3">
                                        <div className="flex items-center gap-3">
                                        <div
                                        className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center text-white text-sm font-bold"
                                        style={{
                                            background:
                                            "linear-gradient(135deg, #6B0F2B, #9E2040)",
                                        }}
                                        >
                                        {record?.student?.user?.lname ?
                                            getInitial(record.student.user.lname) || "U" :
                                            "U"
                                        }
                                        </div>
                                        <p className="font-semibold text-sm text-[#1A0008]">
                                        {record?.student?.user?.fname && record?.student?.user?.lname ?
                                            `${record.student.user.fname} ${record.student.user.lname}` :
                                            "Loading name..."
                                        }
                                        </p>
                                        </div>
                                    </td>

                                    {/* ROOM */}
                                    <td className="px-4 py-3">
                                    <div className="flex flex-col">
                                        <span className="text-sm text-[#1A0008]">
                                        {record?.room?.roomNumber ?? "Failed to Fetch"}
                                        </span>

                                        <span className="text-xs text-[#9A7080]">
                                        {record?.room?.roomBuilding ?? "Failed to Fetch"}
                                        </span>
                                    </div>
                                    </td>

                                    {/* ROOM TYPE */}
                                    <td className="px-4 py-3">
                                    <div className="flex flex-col">
                                        <span className="text-sm text-[#1A0008] capitalize">
                                        {record?.room?.roomStayType ?
                                            record.room.roomStayType.replace("_", " ") :
                                            "Failed to Fetch"
                                        }
                                        </span>

                                        <span className="text-xs text-[#9A7080] capitalize">
                                        {record?.room?.roomType ?? "Failed to Fetch"}
                                        </span>
                                    </div>
                                    </td>

                                    {/* DATE */}
                                    <td className="px-4 py-3">
                                    <div className="flex flex-col">
                                        <span className="text-sm text-[#1A0008]">
                                        {isMoveIn ?
                                            (record?.moveIn ?
                                            record.moveIn.toLocaleString() :
                                            "Failed to Fetch")
                                                : 
                                            (record?.expectedMoveOut ?
                                            record.expectedMoveOut.toLocaleString() :
                                            "Failed to Fetch")
                                        }
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

                                    {/* Type */}
                                    <td>
                                        <span className={`text-sm font-medium capitalize ${isMoveIn ? "text-[#1A0008]" : "text-[#9E2040]"}`}>
                                        {isMoveIn ? "Move-in" : "Move-out"}
                                        </span>
                                    </td>
                                    </tr>
                                )
                                })
                            ) : (
                                // <tr>
                                // <td colSpan={5} className="py-6 text-center text-sm text-[#9A7080]">
                                //     No records found.
                                // </td>
                                // </tr>
                                <div></div>
                            )}
                            </tbody>
                        </table>
                        </div>
                    

                    {/* FOOTER */}
                    <div className="flex items-center justify-between mt-4 ">
                        <p className="text-xs text-[#9A7080]">
                        {sorted.length === 0
                            ? ""
                            : `Showing ${startIndex + 1}–${Math.min(startIndex + itemsPerPage, sorted.length)} of ${sorted.length}`}
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

                        {/* <div className="relative w-[130px] sm:w-[180px]">
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
                        </div> */}
                    </div>
                 </div>
       )
    }

    return (
        <div className="flex h-screen overflow-hidden bg-[#F5EEF0] font-sans">
            {/* SIDEBAR */}
            <Sidebar role="manager" profile={isLoadingUser ? "Loading..." : isErrorUser ? "Error Loading Name" : user?.fname} />
            {/* CONTENT */}
            <div className="flex flex-col flex-1 min-w-0 w-full">
                <CustomHeader
                    title="Move In & Move Out"></CustomHeader>    
                <div className="flex-1 flex flex-col p-4 lg:p-6 overflow-y-auto">
                    <main className="flex-1 flex flex-col gap-4">
                        <HeroBanner
                            greeting="Good Day"
                            name={isLoadingUser ? "Loading..." : isErrorUser ? "Error Loading Name" : user?.fname}
                            title="Check your applicants"
                            subtitle="We make it easy for you to track the accommodation applications you manage."
                            type="mini"
                        />
                        {/* TABLE */}
                        <MoveInMoveOutTable records={[]} />
                    </main>
                </div>
            </div>
            
            
        </div>
    )
}