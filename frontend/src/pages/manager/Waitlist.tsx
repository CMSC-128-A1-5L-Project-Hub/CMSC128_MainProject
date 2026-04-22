import { useState, useMemo } from "react"

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

type Accomodation = {
    building: string
}

type Application = {
    student: Student
    accommodation: Accomodation
    roomType: "single" | "double" | "shared"
    stayType: "transient" | "non-transient"
    rejectionReason?: string | null
    applicationStatus: 'pending' | 'approved' | 'rejected' | 'cancelled' | 'waitlisted' | 'under_review'
    durationOfStayDays: number
    applicationDate: string 
    timeSubmitted:string
}

const managerProfile: ManagerProfile = {
    fullName: "Dal Cadsawan",
    shortName: "Dal",
    email: "ddcadsawan@up.edu.ph",
    phoneNumber: "+63 912 345 6789",
    status: "Active",
    dormitory: "Narra Residences"
}
const waitlistRecords: Application[] = [
    {
        student: {
            fullName: "Ana Marie Reyes",
            shortName: "Ana",
            course: "BS Computer Science",
            campus: "UPLB",
            email: "ana.reyes@student.edu.ph",
            phone: "09171234567",
            studentNo: "2021-12345",
            college: "CAS",
            yearLevel: "3rd Year",
            status: "Active"
        },
        accommodation: {
            building: "Building 1"
        },
        roomType: "single",
        stayType: "transient",
        applicationStatus: "waitlisted",
        durationOfStayDays: 30,
        applicationDate: "Mar 21, 2026",
        timeSubmitted:"10:00 PM"
    },
    {
        student: {
            fullName: "Carlos Santos",
            shortName: "Carlos",
            course: "BS Biology",
            campus: "UPLB",
            email: "carlos.santos@student.edu.ph",
            phone: "09189876543",
            studentNo: "2020-54321",
            college: "CAS",
            yearLevel: "4th Year",
            status: "Active"
        },
        accommodation: {
            building: "Building 2"
        },
        roomType: "double",
        stayType: "non-transient",
        applicationStatus: "waitlisted",
        durationOfStayDays: 60,
        applicationDate: "Mar 22, 2026",
        timeSubmitted:"10:00 PM"

    }
]


const HISTORY_PER_PAGE = 3
const SORT_OPTS = ["Room Type", "Room No.", "Date", "Action"]

const WaitlistHistory = ({ records = waitlistRecords, className }: { records?: Application[], className?: string }) => {
    const [selectedRecord, setSelectedRecord] = useState<Application | null>(null)
    const [currentPage, setCurrentPage] = useState(1)
    const [sortBy, setSortBy] = useState("Date")
    const [sortOpen, setSortOpen] = useState(false)
    const [search, setSearch] = useState("")

    // FILTER
    const filtered = useMemo(() => {
        const q = search.toLowerCase()
        return records.filter(r =>
            r.student.fullName.toLowerCase().includes(q) ||
            r.accommodation.building.toLowerCase().includes(q) ||
            r.roomType.toLowerCase().includes(q)
        )
    }, [records, search])

    //SORT
    const sorted = useMemo(() => {
        return [...filtered].sort((a, b) => {
            if (sortBy === "Room Type") return a.roomType.localeCompare(b.roomType)
            if (sortBy === "accommodation.building") return a.accommodation.building.localeCompare(b.accommodation.building)
            if (sortBy === "Date") return new Date(a.applicationDate).getTime() - new Date(b.applicationDate).getTime()
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
      <>
      <Modal 
          open={!!selectedRecord}
          onClose={() => setSelectedRecord(null)}
          title="APPLICATION" // 👈 keeps RED HEADER + X button
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
                                  {selectedRecord.student.fullName}
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


                          {/* Applicant Details */}
                          <div>
                              <p className="flex items-center gap-2 font-semibold text-[#1A0008] mb-3">
                                  <IoPersonSharp size={18} color="#6B0F2B" />
                                  Applicant Details
                              </p>

                              <div className="grid grid-cols-2 gap-y-4">
                                  <div className="col-span-2">
                                      <p className="text-[10px] uppercase text-[#9A7080] font-semibold">Email</p>
                                      <p className="text-sm text-[#1A0008]">
                                          {selectedRecord.student.email}
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
                                          {selectedRecord.student.course}
                                      </p>
                                  </div>
                              </div>
                          </div>

                          {/* DIVIDER L | R */}
                          <div className="hidden md:block w-px h-full bg-[#F5ECF0]" />

                          {/* Occupancy Details */}
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

                          {/* Room Preference */}
                          <div>
                              <p className="flex items-center gap-2 font-semibold text-[#1A0008] mb-3">
                                  <IoBedSharp size={18} color="#6B0F2B" />
                                  Room Preference
                              </p>
                              <div className="grid grid-cols-2 gap-y-3">
                                    <div className="col-span-1">
                                        <p className="text-[#9A7080] text-[10px] uppercase font-semibold tracking-wide">Stay</p>
                                        <p className="text-[#1A0008] text-sm capitalize">
                                            {selectedRecord.stayType === "non-transient" ? "Non-Transient" : "Transient"}
                                        </p>
                                    </div>
                                    <div className="col-span-1">
                                        <p className="text-[#9A7080] text-[10px] uppercase font-semibold tracking-wide">Building</p>
                                        <p className="text-[#1A0008] text-sm">{selectedRecord.accommodation.building}</p>
                                    </div>
                                    <div className="col-span-1">
                                        <p className="text-[#9A7080] text-[10px] uppercase font-semibold tracking-wide">Room Type</p>
                                        <p className="text-[#1A0008] text-sm capitalize">{selectedRecord.roomType}</p>
                                    </div>
                                </div>
                          </div>

                          {/* Documents */}
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
                                      <div key={doc.label} className="flex items-center justify-between">
                                          <div className="flex items-center gap-2">
                                              <div
                                                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                                                  style={{ background: "linear-gradient(135deg, #6B0F2B, #9E2040)" }}
                                              >
                                                  {doc.icon}
                                              </div>
                                              <p className="text-xs font-semibold text-[#1A0008]">
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

        
        <Card className={className}>
            {/* Header row */}
            <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
                <h2 className="text-[#1A0008] font-bold text-base lg:text-lg">
                    Waitlist History 
                </h2>
                <p className="text-xs text-gray-400">{filtered.length} total applications</p>
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

                    {/* Table header */}
                    <div className="grid grid-cols-12 lg:grid-cols-12 border-b border-[#F5ECF0] uppercase pb-1 mb-1">
                        <p className="col-span-2 text-[#9A7080] text-xs font-bold p-1">Students</p>
                        <p className="col-span-2 text-center text-[#9A7080] text-xs font-bold p-1 flex items-center justify-center gap-1">
                            Date
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </p>
                        <p className="col-span-2 text-center text-[#9A7080] text-xs font-bold p-1">Time Submitted</p>
                        <p className="col-span-2 text-center text-[#9A7080] text-xs font-bold p-1">Preferred Facility</p>
                        <p className="col-span-2 text-center text-[#9A7080] text-xs font-bold p-1">Room Type</p>
                        <p className="col-span-2 text-center text-[#9A7080] text-xs font-bold p-1">Action</p>
                        
                    </div>

                    {/* Rows */}
                    <div className="flex flex-col divide-y divide-[#F5ECF0]">
                        {paginated.length > 0 ? paginated.map((record, i) => (
                            <div key={i} className="grid grid-cols-12 lg:grid-cols-12 items-center py-3">
                                {/* Student */}
                                <div className="col-span-2 flex items-center gap-2">
                                    <div className="hidden lg:flex w-9 h-9 rounded-xl flex-shrink-0 items-center justify-center text-white text-xs font-bold"
                                        style={{ background: "linear-gradient(135deg, #6B0F2B, #9E2040)" }}>
                                        {getInitials(record.student.fullName)}
                                    </div>
                                    <p className="font-bold text-[12px] ml-1 lg:ml-0 lg:text-sm text-[#1A0008]">{record.student.fullName}</p>
                                </div>
                                 <p className="col-span-2 text-center text-[12px] lg:text-sm text-[#1A0008]">{record.applicationDate}</p>
                                 <p className="col-span-2 text-center text-[12px] lg:text-sm text-[#1A0008]">{record.timeSubmitted}</p>
                                 <p className="col-span-2 text-center text-[12px] lg:text-sm text-[#1A0008]">{record.accommodation.building}</p>
                                 <p className="col-span-2 text-center text-[12px] lg:text-sm text-[#1A0008] capitalize">{record.roomType}</p>

                                <div className="col-span-2 flex justify-center">
                                    <Button variant="reddishPink" size="sm" className="px-6" onClick={() => setSelectedRecord(record)}>
                                        View
                                    </Button>
                                </div>
                            </div>
                        )) : (
                            <p className="text-sm text-[#9A7080] py-6 text-center">No records found.</p>
                        )}
                    </div>

            {/* Footer */}
            <div className="flex items-center justify-between mt-3 pt-2 border-t border-[#F5ECF0]">
                <p className="text-xs text-[#9A7080]">
                    Showing {sorted.length === 0 ? 0 : startIndex + 1}–{Math.min(startIndex + HISTORY_PER_PAGE, sorted.length)} of {sorted.length} records
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
      </>
    )
}

export default function Waitlist() {
    return (
        <div className="flex h-screen overflow-hidden bg-[#F5EEF0] font-sans">
            <Sidebar role="manager" profile={managerProfile}/>

            <div className="flex-1 flex flex-col p-5 overflow-y-auto">
                <div className="pl-10 lg:pl-0 flex flex-row border-b border-[#6B0F2B]/7 mb-2 pb-1">
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
                        name={managerProfile.fullName}
                        title="Check your waitlisted applicants"
                        subtitle="We make it easy for you to track the accommodation  applications you manage. "
                        type="mini"
                    />

                    <WaitlistHistory 
                        records={waitlistRecords}
                    />
                </main>
            </div>
        </div>
    )
}