import React, { useState, useMemo, useRef } from "react"

import Sidebar from "../../components/Sidebar"
import HeroBanner from "../../components/dashboard/HeroBanner"
import Card from "../../components/ui/Card"
import Button from "../../components/Button"
import Modal from "../../components/Modal"
import StatusBadge from "../../components/ui/StatusBadge"


import { 
    IoPersonSharp, 
    IoCalendarSharp, 
    IoBedSharp,
    IoDocumentSharp,
    IoDocumentTextSharp,
    IoIdCardSharp
} from "react-icons/io5"
import { api } from "../../api/axios"
import { useQuery } from "@tanstack/react-query"
import { DateTime } from "luxon"

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

export interface WaitlistedResponse {
  id: number;
  accommodationId: number;
  studentNumber: string;
  applicationDate: string; 
  applicationRoomType: string;
  applicationStayType: string;
  applicationStatus: "waitlisted";
  durationOfStayDays: number;
  
  // --- Relations ---
  accommodation: Accommodation;
  student: Student;

  // --- The Cross-Referenced Assignment ---
  assignment: {
    id: number;
    roomId: number;
    confirmedDate: string;
    moveIn: string;
    expectedMoveOut: string;
    room: Room;
  }; 
}

const HISTORY_PER_PAGE = 5
const SORT_OPTS = [
  { value: "Date", label: "Date" },
  { value: "Room Type", label: "Room Type" },
  { value: "Room No.", label: "Room No." },
  { value: "Action", label: "Action" },
]

const FilterSelect = ({
  value,
  onChange,
  compact,
  onToggle,
  sortOpen,
  setSortOpen,
}: {
  value: string;
  onChange: (v: string) => void;
  compact?: boolean;
  onToggle?: () => void;
  sortOpen: boolean;
  setSortOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {

  const selected = SORT_OPTS.find((o) => o.value === value)?.label;

  return (
    <div className="relative">
      <button
        onClick={() => {
          if (compact) {
            onToggle?.();
            setSortOpen(false);
          } else {
            setSortOpen((o) => !o);
          }
        }}
        className={`flex items-center gap-2 border border-[#E8D5DC] rounded-xl px-3 h-10 text-sm bg-white hover:bg-[#F5ECF0] transition ${
        compact ? "w-10 justify-center" : "w-[140px]"
        }`}
      >
        {compact ? (
          <svg className="w-4 h-4 text-[#9A7080]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
          </svg>
        ) : (
          <>
            <span className="flex flex-col text-left">
              <span className="text-[9px] uppercase text-[#9A7080] font-bold leading-none">
                Sort By
              </span>
              <span className="text-[#1A0008] font-medium text-xs">
                {selected}
              </span>
            </span>

            <svg className="ml-auto w-4 h-4 text-[#9A7080]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </>
        )}
      </button>

      {sortOpen && (
        <div className="absolute z-10 top-full mt-1 right-0 bg-white border border-[#E8D5DC] rounded-xl shadow-md overflow-hidden w-full">
          {SORT_OPTS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => {
                onChange(opt.value);
                setSortOpen(false);
              }}
              className={`w-full text-left px-4 py-2 text-xs hover:bg-[#F5ECF0] transition ${
                value === opt.value
                  ? "text-[#6B0F2B] font-semibold"
                  : "text-[#1A0008]"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default function Waitlist() {
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
        data: waitlistRecords = [],
        isLoading: isLoadingList,
        isError: isErrorList,
        refetch,
    } = useQuery({
        queryKey: ["list"],
        queryFn: async () => {
        const res = await api.get("/applications/view-all-waitlisted");
        return res.data;
        },
    });

    const WaitlistHistory = ({ records = waitlistRecords, className }: { records?: WaitlistedResponse[], className?: string }) => {
    const [selectedRecord, setSelectedRecord] = useState<WaitlistedResponse | null>(null)
    const [currentPage, setCurrentPage] = useState(1)
    const [sortBy, setSortBy] = useState("Date")
    
    const [search, setSearch] = useState("")

    // FILTER
    const filtered = useMemo(() => {
        const q = search.toLowerCase()
        return records.filter(r =>
            r.student.user.fname.toLowerCase().includes(q) ||
            r.student.user.lname.toLowerCase().includes(q) ||
            r.assignment.room.roomBuilding.toLowerCase().includes(q) ||
            r.assignment.room.roomType.toLowerCase().includes(q)
        )
    }, [records, search])

    //SORT
    const sorted = useMemo(() => {
        return [...filtered].sort((a, b) => {
            if (sortBy === "Room Type") return a.assignment.room.roomType.localeCompare(b.assignment.room.roomType)
            if (sortBy === "accommodation.building") return a.assignment.room.roomBuilding.localeCompare(b.assignment.room.roomBuilding)
            if (sortBy === "Date") return new Date(a.applicationDate).getTime() - new Date(b.applicationDate).getTime()
            return 0
        })
    }, [filtered, sortBy])

    const [mode, setMode] = useState<"both" | "search" | "sort">("both")
    const [sortOpen, setSortOpen] = useState(false)
    const [isMobile, setIsMobile] = useState(false)
    const searchInputRef = useRef<HTMLInputElement>(null)

    React.useEffect(() => {
    const checkScreen = () => setIsMobile(window.innerWidth < 640)

    checkScreen()
    window.addEventListener("resize", checkScreen)

    return () => window.removeEventListener("resize", checkScreen)
    }, [])

    const handleOpenSearch = () => {
    setSortOpen(false)
    setMode("search")
    setTimeout(() => searchInputRef.current?.focus(), 50)
    }

    const handleCloseSearch = () => {
    setMode("both")
    setSearch("")
    }

    const totalPages = Math.ceil(sorted.length / HISTORY_PER_PAGE)
    const startIndex = (currentPage - 1) * HISTORY_PER_PAGE
    const paginated = sorted.slice(startIndex, startIndex + HISTORY_PER_PAGE)

    const handleSort = (option: string) => {
        setSortBy(option)
        setCurrentPage(1)
    }

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value)
        setCurrentPage(1)
    }

    //AVATAR INITIALS 
    const getInitials = (name: string) =>
        name[0]

    return (
      <>
      <Modal 
          open={!!selectedRecord}
          onClose={() => setSelectedRecord(null)}
          title="APPLICATION" 
          maxWidth={900}
          maxHeight={650}
      >
          {selectedRecord && (
              <Card>
                  <div className="flex flex-col gap-6 p-2">

                      {/* HEADER */}
                      <div className="flex justify-between items-start">
                          <div>
                              <h1 className="text-2xl font-bold text-[#1A0008]">
                                  {selectedRecord.student.user.fname} {selectedRecord.student.user.lname}
                              </h1>
                              <p className="text-sm text-[#C8B0B8] mt-1">
                                  Date Applied: {selectedRecord.applicationDate}
                              </p>
                          </div>

                          {/* STATUS BADGE */}
                          <StatusBadge status={selectedRecord.applicationStatus} />
                      </div>

                      {/* TOP SECTION */}
                      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-6 items-start">


                          {/* APPLICANT DETAILS */}
                          <div>
                              <p className="flex items-center gap-2 font-semibold text-[#1A0008] mb-3">
                                  <IoPersonSharp size={18} color="#6B0F2B" />
                                  Applicant Details
                              </p>

                              <div className="grid grid-cols-2 gap-y-4">
                                  <div className="col-span-2">
                                      <p className="text-[10px] uppercase text-[#9A7080] font-semibold">Email</p>
                                      <p className="text-sm text-[#1A0008]">
                                          {selectedRecord.student.user.email}
                                      </p>
                                  </div>

                                  <div>
                                      <p className="text-[10px] uppercase text-[#9A7080] font-semibold">Phone Number</p>
                                      <p className="text-sm text-[#1A0008]">
                                          {selectedRecord.student.phone}
                                      </p>
                                  </div>

                                  <div>
                                      <p className="text-[10px] uppercase text-[#9A7080] font-semibold">Year Level</p>
                                      <p className="text-sm text-[#1A0008]">
                                          {selectedRecord.student.yearLevel}
                                      </p>
                                  </div>

                                  <div className="col-span-2">
                                      <p className="text-[10px] uppercase text-[#9A7080] font-semibold">Course</p>
                                      <p className="text-sm text-[#1A0008]">
                                          {selectedRecord.student.college}
                                      </p>
                                  </div>
                              </div>
                          </div>

                          {/* DIVIDER L | R */}
                          <div className="hidden md:block w-px h-full bg-[#F5ECF0]" />

                          {/* OCCUPANCY DETAILS */}
                          <div>
                              <p className="flex items-center gap-2 font-semibold text-[#1A0008] mb-3">
                                  <IoCalendarSharp size={18} color="#6B0F2B" />
                                  Occupancy Details
                              </p>
                              

                              <div className="flex flex-col gap-4">
                                  <div>
                                      <p className="text-[#9A7080] text-[10px] uppercase font-semibold tracking-wide">Semester</p>
                                      <p className="text-[#1A0008] text-sm">Semester 2, AY 2025-2026</p>
                                  </div>

                                  <div>
                                      <p className="text-[10px] uppercase text-[#9A7080] font-semibold">Duration</p>
                                      <p className="text-sm text-[#1A0008]">
                                          {selectedRecord.durationOfStayDays} day
                                          {selectedRecord.durationOfStayDays !== 1 ? "s" : ""}
                                      </p>
                                  </div>

                          
                              </div>
                          </div>
                      </div>

                      {/* DIVIDER */}
                      <div className="border-t border-[#F5ECF0]" />
                      {/* BOTTOM */}
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">

                          {/* ROOM PREFERENCE */}
                          <div>
                              <p className="flex items-center gap-2 font-semibold text-[#1A0008] mb-3">
                                  <IoBedSharp size={18} color="#6B0F2B" />
                                  Room Preference
                              </p>
                              <div className="grid grid-cols-2 gap-y-3">
                                    <div className="col-span-1">
                                        <p className="text-[#9A7080] text-[10px] uppercase font-semibold tracking-wide">Stay</p>
                                        <p className="text-[#1A0008] text-sm capitalize">
                                            {selectedRecord.applicationStayType === "non-transient" ? "Non-Transient" : "Transient"}
                                        </p>
                                    </div>
                                    <div className="col-span-1">
                                        <p className="text-[#9A7080] text-[10px] uppercase font-semibold tracking-wide">Building</p>
                                        <p className="text-[#1A0008] text-sm">{selectedRecord.assignment?.room?.roomBuilding || 'N/A'}</p>
                                    </div>
                                    <div className="col-span-1">
                                        <p className="text-[#9A7080] text-[10px] uppercase font-semibold tracking-wide">Room Type</p>
                                        <p className="text-[#1A0008] text-sm capitalize">{selectedRecord.assignment?.room?.roomType || 'TBA'}</p>
                                    </div>
                                </div>
                          </div>

                          {/* DOCUMENTS */}
                          <div>
                            <p className="flex items-center gap-2 font-semibold text-[#1A0008] mb-3">
                              <IoDocumentSharp size={18} color="#6B0F2B" />
                              Uploaded Documents
                            </p>

                            <div className="flex flex-col gap-3">
                              {[
                                { label: "FORM 5", icon: <IoDocumentTextSharp size={16} color="white" /> },
                                { label: "VALID ID", icon: <IoIdCardSharp size={16} color="white" /> },
                              ].map((doc) => (
                                <div key={doc.label} className="flex items-center justify-between max-w-[210px]">
                                  {/* icon + label */}
                                  <div className="flex items-center gap-2 min-w-0">
                                    <div
                                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                                      style={{ background: "linear-gradient(135deg, #6B0F2B, #9E2040)" }}
                                    >
                                      {doc.icon}
                                    </div>
                                    <p className="text-xs font-semibold text-[#1A0008] truncate">
                                      {doc.label}
                                    </p>
                                  </div>

                                  <Button variant="reddishPink" size="sm">
                                    View
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </div>
                      </div>
                  </div>
              </Card>
          )}
      </Modal>

        <div className={`bg-white rounded-2xl shadow-sm border overflow-hidden ${className ?? ""}`}>
            {/* Header row */}
            <div className="flex items-center justify-between gap-4 p-4 border-b">
              {/* LEFT: grouped */}
              <div className="flex flex-col gap-1 shrink-0">
                  <h2 className="text-[#1A0008] font-bold text-sm lg:text-lg whitespace-nowrap">
                      Waitlist History
                  </h2>
                  <p className="text-xs text-gray-400">
                      {filtered.length} total applications
                  </p>
              </div>
            
            {/* RIGHT: filters */}
            <div className="flex items-center gap-2 ml-auto">
            {/* SORT BY */}
            <FilterSelect
            value={sortBy}
            onChange={(v) => {
                handleSort(v)
                setMode("both")
            }}
            compact={isMobile && mode === "search"}
            onToggle={() => {
                setSortOpen(false)
                setMode("both")
            }}
            sortOpen={sortOpen}
            setSortOpen={setSortOpen}
            />

            {/* SEARCH ICON - mobile only */}
            <button
            onClick={handleOpenSearch}
            className={`${mode === "search" ? "hidden" : "flex"} sm:hidden items-center gap-2 border border-[#E8D5DC] rounded-xl px-3 h-10 text-sm bg-white hover:bg-[#F5ECF0] transition`}
            aria-label="Open search"
            >
            <svg className="w-4 h-4 text-[#9A7080]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m1.6-5.4a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            </button>

            {/* SEARCH INPUT */}
            <div className={`relative ${mode === "search" ? "flex" : "hidden"} sm:flex w-full sm:w-[120px]`}>
                <svg
                className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A36F82]"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                viewBox="0 0 24 24"
                >
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m1.6-5.4a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>

                <input
                ref={searchInputRef}
                type="text"
                placeholder="Search..."
                value={search}
                onChange={handleSearch}
                className="w-full min-w-0 h-10 border border-[#E8D5DC] rounded-xl pl-8 pr-7 text-sm bg-white text-[#3D0718] placeholder:text-[#C7A7B3] focus:outline-none focus:bg-[#F5ECF0] transition-all duration-200"
                />

                <button
                onClick={handleCloseSearch}
                className="absolute right-2 top-1/2 -translate-y-1/2 sm:hidden text-[#9A7080] hover:text-[#6B0F2B]"
                aria-label="Close search"
                >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
                </button>
            </div>
            </div>
            </div>

    {/* HEADER -- TABLE  */}
    <div className="w-full overflow-x-auto">
    <div className="min-w-[900px]">
    <div className="grid grid-cols-12 bg-gray-50 border-b border-[#F5ECF0] uppercase">
      <p className="col-span-2 px-4 py-3 text-[#9A7080] text-xs font-bold whitespace-nowrap">Students</p>

      <p className="col-span-2 text-center text-[#9A7080] text-xs font-bold p-1 flex items-center justify-center gap-1">
        Date
      </p>

      <p className="col-span-2 text-center text-[#9A7080] text-xs font-bold p-1 flex items-center justify-center gap-1">
        Time Submitted
      </p>

      <p className="col-span-2 text-center text-[#9A7080] text-xs font-bold p-1 flex items-center justify-center gap-1">
        Preferred Facility
      </p>

      <p className="col-span-2 text-center text-[#9A7080] text-xs font-bold p-1 flex items-center justify-center gap-1">
        Room Type
      </p>

      <p className="col-span-2 text-center text-[#9A7080] text-xs font-bold p-1 flex items-center justify-center gap-1">
        Action
      </p>
    </div>

        {/* ROWS */}
        <div className="flex flex-col divide-y divide-[#F5ECF0]">
            {/* LOADING STATE */}
            {isLoadingList ? (
                <div className="py-12 flex flex-col items-center justify-center text-center">
                    <div
                        className="animate-spin rounded-full h-8 w-8 border-b-2"
                        style={{ borderColor: "#9E2040" }}
                        />
                    <p className="text-sm text-[#9A7080] mt-2">
                    Fetching waitlisted applications...
                    </p>
                </div>
            ) : isErrorList ? (
                /* ERROR STATE */
                <div className="py-12 flex flex-col items-center justify-center text-center">
                    <p className="text-sm text-red-500 font-medium">
                        Failed to load data.
                    </p>
                    <button
                        onClick={() => refetch()}
                        className="mt-2 text-xs font-semibold text-[#9E2040] hover:underline"
                    >
                        TRY AGAIN
                    </button>
                    </div>
            ) : paginated.length > 0 ? (
                /* DATA STATE */
                paginated.map((record, i) => (
                    <div key={record.id || i} className="grid grid-cols-12 items-center py-3 hover:bg-[#FFF9FA] transition-colors">
                        
                        {/* STUDENT INFO */}
                        <div className="col-span-2 flex items-center gap-2">
                            <div className="hidden lg:flex w-9 h-9 rounded-xl flex-shrink-0 items-center justify-center text-white text-xs font-bold"
                                style={{ background: "linear-gradient(135deg, #6B0F2B, #9E2040)" }}>
                                {getInitials(record.student.user.fname)}
                            </div>
                            <div>
                                <p className="font-bold text-[12px] lg:text-sm text-[#1A0008]">
                                    {record.student.user.fname} {record.student.user.lname}
                                </p>
                                <p className="text-[10px] text-[#9A7080] lg:hidden">{record.student.studentNumber}</p>
                            </div>
                        </div>

                        {/* DATE SUBMITTED */}
                        <p className="col-span-2 text-center text-[12px] lg:text-sm text-[#1A0008]">
                            {new Date(record.applicationDate).toLocaleDateString()}
                        </p>

                        <p className="col-span-2 text-center text-[12px] lg:text-sm text-[#1A0008] font-medium">
                            {DateTime.fromISO(record.applicationDate).setZone('utc', { keepLocalTime: true }).toFormat('h:mm a')}
                        </p>

                        <p className="col-span-2 text-center text-[12px] lg:text-sm text-[#1A0008]">
                            {record.assignment?.room?.roomBuilding || "N/A"}
                        </p>

                        <p className="col-span-2 text-center text-[12px] lg:text-sm text-[#1A0008] capitalize">
                            {record.assignment?.room?.roomType || record.applicationRoomType}
                        </p>

                        {/* ACTION */}
                        <div className="col-span-2 flex justify-center">
                            <Button variant="reddishPink" size="sm" className="px-6" onClick={() => setSelectedRecord(record)}>
                                View
                            </Button>
                        </div>
                    </div>
                ))
            ) : (
                /* EMPTY STATE */
                <div className="py-12 flex items-center justify-center text-center">
                    <p className="text-base italic text-gray-400">
                        Nothing to see here
                    </p>
                    </div>
            )}
        </div>
        </div>
    </div>

            {/* FOOTER */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-[#F5ECF0]">
                <p className="text-xs text-[#9A7080]">
                {filtered.length === 0
                    ? "No results"
                    : `Showing ${startIndex + 1}–${Math.min(
                        startIndex + HISTORY_PER_PAGE,
                        filtered.length
                    )} of ${filtered.length}`}
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
        </div>
      </>
    )
}

    return (
        <div className="flex h-screen overflow-hidden bg-[#F5EEF0] font-sans">
            <Sidebar role="manager" profile={{fullName: `${user?.fname} ${user?.lname}`,
              shortName: `${user?.fname}`,
              email: `${user?.email}`,
              status: `${user?.manager?.managerStatus}`
        }} />

            <div className="flex-1 flex flex-col p-5 overflow-y-auto">
                <div className="pl-10 lg:pl-0 flex flex-row border-b border-[#6B0F2B]/7 mb-2">
                    <div className="hidden lg:inline w-2 h-8 rounded-xl mt-1 mr-2"
                        style={{ background: "linear-gradient(to bottom right, #6B0F2B 0%, #9E2040 100%)"}}
                    />
                    <h1 className="text-4xl font-serif italic font-bold text-[#6B0F2B] ">
                        Waitlist
                    </h1>
                </div>
                <main className="flex-1 flex flex-col gap-4">
                    <HeroBanner 
                        greeting="Good Day"
                        name={isLoadingUser ? "Loading..." : isErrorUser ? "Error Loading Name" : user?.fname}
                        title="Check your waitlisted applicants"
                        subtitle="We make it easy for you to track the accommodation  applications you manage. "
                        type="full"
                    />

                    <WaitlistHistory 
                        records={waitlistRecords}
                    />
                </main>
            </div>
        </div>
    )
}