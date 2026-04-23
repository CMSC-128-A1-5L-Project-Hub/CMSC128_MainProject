import { useState, useMemo } from "react"

import Sidebar from "../../components/Sidebar"
import HeroBanner from "../../components/dashboard/HeroBanner"
import Card from "../../components/ui/Card"
import StatBar from "../../components/ui/StatBar"
import DonutStatCard from "../../components/dashboard/DonutStatCard"
import Button from "../../components/Button"
import Modal from "../../components/Modal"

import { IoCalendarSharp } from "react-icons/io5"
import { FaHouse } from "react-icons/fa6";

//  Interfaces 

interface ManagerProfile {
    fullName: string
    shortName: string
    email: string
    phoneNumber: string
    status: string
    dormitory: string
}

interface HeroContent {
    greeting: string
    title: string
    subtitle: string
}

interface Student {
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

interface Accommodation {
    building: string
}

interface Application {
    student: Student
    accommodation: Accommodation
    roomType: "single" | "double" | "shared"
    stayType: "transient" | "non-transient"
    rejectionReason?: string | null
    applicationStatus: "pending" | "approved" | "rejected" | "cancelled" | "waitlisted" | "under_review"
    durationOfStayDays: number
    applicationDate: string
}

interface Assignment {
    student: Application
    roomNumber: string
    roomBuilding: string
    roomType: string
    stayType: string
    moveIn: string
    expectedMoveOut: string
    status: "assigned" | "not assigned"
}

type Room = {
    roomNumber: string
    roomType: "single" | "double" | "shared"
    roomBuilding: string
    roomCapacity: number
    roomCurrentOccupancy: number
    roomRent: number
}

//  Mock Data 

const managerProfile: ManagerProfile = {
    fullName: "Dal Cadsawan",
    shortName: "Dal",
    email: "ddcadsawan@up.edu.ph",
    phoneNumber: "+63 912 345 6789",
    status: "Active",
    dormitory: "Narra Residences",
}

const heroContent: HeroContent = {
    greeting: "Good Day",
    title: "Assign a room to your confirmed applicant",
    subtitle: "We make it easy for you to track the accommodation applications you manage.",
}

const students: Student[] = [
    {
        fullName: "Ana Marie Reyes",        shortName: "Ana Reyes",
        course: "BS Computer Science",      campus: "Main Campus",
        email: "anamariel.reyes@student.edu.ph", phone: "09171234567",
        studentNo: "2021-00123",            college: "College of Engineering",
        yearLevel: "3rd Year",              status: "Regular",
    },
    {
        fullName: "Carlos Miguel Santos",   shortName: "Carlos Santos",
        course: "BS Civil Engineering",     campus: "Main Campus",
        email: "carlos.santos@student.edu.ph", phone: "09189876543",
        studentNo: "2020-00456",            college: "College of Engineering",
        yearLevel: "4th Year",              status: "Regular",
    },
    {
        fullName: "Maria Cristina Dela Cruz", shortName: "Maria Dela Cruz",
        course: "BS Nursing",               campus: "North Campus",
        email: "mariacristina.delacruz@student.edu.ph", phone: "09201122334",
        studentNo: "2022-00789",            college: "College of Allied Health",
        yearLevel: "2nd Year",              status: "Regular",
    },
    {
        fullName: "Jose Ramon Villanueva",  shortName: "Jose Villanueva",
        course: "BS Architecture",          campus: "Main Campus",
        email: "jose.villanueva@student.edu.ph", phone: "09334455667",
        studentNo: "2019-01011",            college: "College of Architecture",
        yearLevel: "5th Year",              status: "Irregular",
    },
    {
        fullName: "Liza Mae Fontanilla",    shortName: "Liza Fontanilla",
        course: "BS Education",             campus: "South Campus",
        email: "lizamae.fontanilla@student.edu.ph", phone: "09451234567",
        studentNo: "2023-00321",            college: "College of Education",
        yearLevel: "1st Year",              status: "Regular",
    },
    {
        fullName: "Ramon Kristoffer Aquino", shortName: "Ramon Aquino",
        course: "BS Information Technology", campus: "Main Campus",
        email: "ramon.aquino@student.edu.ph", phone: "09278765432",
        studentNo: "2022-00654",            college: "College of Engineering",
        yearLevel: "2nd Year",              status: "Regular",
    },
]

const accommodations: Accommodation[] = [
    { building: "Building 6" },
    { building: "Building 3" },
    { building: "Building 1" },
    { building: "Building 4" },
    { building: "Building 2" },
    { building: "Building 5" },
]

const applications: Application[] = [
    { student: students[0], accommodation: accommodations[0], roomType: "single", stayType: "non-transient", rejectionReason: null, applicationStatus: "pending",      durationOfStayDays: 180, applicationDate: "Mar 12, 2026" },
    { student: students[1], accommodation: accommodations[1], roomType: "double", stayType: "non-transient", rejectionReason: null, applicationStatus: "approved",     durationOfStayDays: 180, applicationDate: "Mar 14, 2026" },
    { student: students[2], accommodation: accommodations[2], roomType: "shared", stayType: "transient",     rejectionReason: null, applicationStatus: "under_review", durationOfStayDays: 7,   applicationDate: "Mar 15, 2026" },
    { student: students[3], accommodation: accommodations[3], roomType: "single", stayType: "non-transient", rejectionReason: "No available slots for the selected room type.", applicationStatus: "rejected", durationOfStayDays: 180, applicationDate: "Mar 16, 2026" },
    { student: students[4], accommodation: accommodations[4], roomType: "double", stayType: "non-transient", rejectionReason: null, applicationStatus: "waitlisted",   durationOfStayDays: 180, applicationDate: "Mar 17, 2026" },
    { student: students[5], accommodation: accommodations[5], roomType: "shared", stayType: "non-transient", rejectionReason: null, applicationStatus: "waitlisted",   durationOfStayDays: 180, applicationDate: "Mar 18, 2026" },
    { student: students[0], accommodation: accommodations[2], roomType: "double", stayType: "non-transient", rejectionReason: null, applicationStatus: "pending",      durationOfStayDays: 180, applicationDate: "Mar 19, 2026" },
    { student: students[2], accommodation: accommodations[3], roomType: "single", stayType: "transient",     rejectionReason: null, applicationStatus: "pending",      durationOfStayDays: 14,  applicationDate: "Mar 20, 2026" },
    { student: students[4], accommodation: accommodations[0], roomType: "shared", stayType: "non-transient", rejectionReason: null, applicationStatus: "pending",      durationOfStayDays: 180, applicationDate: "Mar 21, 2026" },
    { student: students[5], accommodation: accommodations[1], roomType: "single", stayType: "non-transient", rejectionReason: null, applicationStatus: "pending",      durationOfStayDays: 180, applicationDate: "Mar 22, 2026" },
    { student: students[3], accommodation: accommodations[5], roomType: "double", stayType: "transient",     rejectionReason: null, applicationStatus: "pending",      durationOfStayDays: 7,   applicationDate: "Mar 23, 2026" },
    { student: students[2], accommodation: accommodations[2], roomType: "shared", stayType: "transient",     rejectionReason: null, applicationStatus: "approved",     durationOfStayDays: 7,   applicationDate: "Mar 20, 2026" }, // [11]
    { student: students[3], accommodation: accommodations[3], roomType: "single", stayType: "non-transient", rejectionReason: null, applicationStatus: "approved",     durationOfStayDays: 180, applicationDate: "Mar 21, 2026" }, // [12]
    { student: students[4], accommodation: accommodations[4], roomType: "double", stayType: "non-transient", rejectionReason: null, applicationStatus: "approved",     durationOfStayDays: 180, applicationDate: "Mar 22, 2026" }, // [13]
    { student: students[0], accommodation: accommodations[5], roomType: "shared", stayType: "non-transient", rejectionReason: null, applicationStatus: "approved",     durationOfStayDays: 180, applicationDate: "Mar 23, 2026" }, // [14]
    { student: students[5], accommodation: accommodations[0], roomType: "single", stayType: "non-transient", rejectionReason: null, applicationStatus: "approved",     durationOfStayDays: 180, applicationDate: "Mar 24, 2026" }, // [15]
]

const assignments: Assignment[] = [
    { student: applications[1],  roomNumber: "312", roomBuilding: "Building 4", roomType: "Double", stayType: "Non-Transient", moveIn: "Mar 15, 2026", expectedMoveOut: "Aug 15, 2026", status: "assigned"     },
    { student: applications[11], roomNumber: "204", roomBuilding: "Building 1", roomType: "Shared", stayType: "Transient",     moveIn: "Mar 21, 2026", expectedMoveOut: "Mar 28, 2026", status: "assigned"     },
    { student: applications[12], roomNumber: "105", roomBuilding: "Building 4", roomType: "Single", stayType: "Non-Transient", moveIn: "",             expectedMoveOut: "",             status: "not assigned" },
    { student: applications[13], roomNumber: "308", roomBuilding: "Building 2", roomType: "Double", stayType: "Non-Transient", moveIn: "Mar 23, 2026", expectedMoveOut: "Aug 23, 2026", status: "assigned"     },
    { student: applications[14], roomNumber: "",    roomBuilding: "",            roomType: "Shared", stayType: "Non-Transient", moveIn: "",             expectedMoveOut: "",             status: "not assigned" },
    { student: applications[15], roomNumber: "410", roomBuilding: "Building 5", roomType: "Single", stayType: "Non-Transient", moveIn: "Mar 25, 2026", expectedMoveOut: "Aug 25, 2026", status: "assigned"     },
]

const availableRooms: Room[] = [
    { roomNumber: "204", roomType: "shared", roomBuilding: "Building 6", roomCapacity: 4, roomCurrentOccupancy: 1, roomRent: 3200 },
    { roomNumber: "210", roomType: "shared", roomBuilding: "Building 3", roomCapacity: 4, roomCurrentOccupancy: 2, roomRent: 3200 },
    { roomNumber: "221", roomType: "shared", roomBuilding: "Building 5", roomCapacity: 4, roomCurrentOccupancy: 2, roomRent: 3200 },
    { roomNumber: "105", roomType: "single", roomBuilding: "Building 1", roomCapacity: 1, roomCurrentOccupancy: 0, roomRent: 4500 },
    { roomNumber: "312", roomType: "double", roomBuilding: "Building 4", roomCapacity: 2, roomCurrentOccupancy: 1, roomRent: 3800 },
]

//  Constants 

const ASSIGNMENTS_PER_PAGE = 5
const SORT_OPTS = ["Name", "Status", "Date", "Room Type"]
const GRID_COLS = "2fr 1.5fr 1fr 1.5fr 1.5fr"

//  Helpers 

function getInitials(name: string) {
    return name[0]
}

function timeAgo(dateStr: string): string {
    if (!dateStr) return "—"
    const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
    const intervals = [
        { label: "year",   seconds: 31536000 },
        { label: "month",  seconds: 2592000  },
        { label: "week",   seconds: 604800   },
        { label: "day",    seconds: 86400    },
        { label: "hour",   seconds: 3600     },
        { label: "minute", seconds: 60       },
    ]
    for (const { label, seconds: s } of intervals) {
        const count = Math.floor(seconds / s)
        if (count >= 1) return `${count} ${label}${count !== 1 ? "s" : ""} ago`
    }
    return "Just now"
}

//  Modal Content Components 

const AssignModalContent = ({
    assignment,
    filteredRooms,
    onClose,
}: {
    assignment: Assignment
    filteredRooms: Room[]
    onClose: () => void
}) => (
    <Card>
        <div className="flex flex-col gap-4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                <div className="flex flex-col">
                    <p className="text-[#1A0008] font-bold text-xl">{assignment.student.student.fullName}</p>
                    <p className="text-[#C8B0B8] text-xs mt-1">Select a room to assign</p>
                </div>
                <div className="flex flex-col gap-1">
                    <span className="text-[#9A7080] text-[10px] uppercase font-semibold tracking-wide">Room Type</span>
                    <span className="text-[#1A0008] text-sm font-semibold capitalize">{assignment.roomType}</span>
                </div>
            </div>

            {/* Room List */}
            <div className="flex flex-col gap-3">
                {filteredRooms.length > 0 ? (
                    filteredRooms.map((room, i) => (
                        <div key={i} className="flex flex-col sm:flex-row sm:items-center gap-3 border border-[#F5ECF0] rounded-xl p-3 sm:p-4">
                            <div className="flex flex-col items-start gap-1 min-w-[120px]">
                                <div
                                    className="px-4 py-2 rounded-full text-white text-sm font-extrabold uppercase tracking-wide"
                                    style={{ background: "linear-gradient(135deg, #6B0F2B, #9E2040)" }}
                                >
                                    ROOM {room.roomNumber}
                                </div>
                                <p className="text-[#1A0008] text-sm font-medium pl-1">{room.roomBuilding}</p>
                            </div>
                            <div className="hidden sm:block w-px self-stretch bg-[#F5ECF0]" />
                            <div className="flex flex-col gap-1 flex-1">
                                <p className="text-[#1A0008] text-sm">Type : <span className="font-semibold capitalize">{room.roomType}</span></p>
                                <p className="text-[#1A0008] text-sm">Price : <span className="font-semibold">₱{room.roomRent.toLocaleString()} / month</span></p>
                                <p className="text-[#1A0008] text-sm">Occupants : <span className="font-semibold">{room.roomCurrentOccupancy}/{room.roomCapacity}</span></p>
                            </div>
                            <Button variant="reddishPink" size="sm" onClick={onClose} className="w-full sm:w-auto">
                                Assign Room
                            </Button>
                        </div>
                    ))
                ) : (
                    <div className="flex justify-center items-center py-6 italic text-gray-400 text-sm">
                        No available rooms for this room type
                    </div>
                )}
            </div>
        </div>
    </Card>
)

const ViewModalContent = ({ assignment }: { assignment: Assignment }) => (
    <Card>
        <div className="flex flex-col gap-5">
            {/* Room pill */}
            <div>
                <span
                    className="inline-block px-5 py-2 rounded-full text-white text-sm font-bold uppercase"
                    style={{ background: "linear-gradient(135deg, #3D0718, #6B0F2B)" }}
                >
                    Room {assignment.roomNumber || "—"}
                </span>
            </div>

            {/* Student Name */}
            <div>
                <p className="text-[#C8B0B8] text-xs uppercase font-bold mb-0.5">Student Name</p>
                <p className="text-[#1A0008] text-2xl font-bold">{assignment.student.student.fullName}</p>
            </div>

            <hr className="border-[#F5ECF0]" />

            {/* Occupancy Details */}
            <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                    <IoCalendarSharp className="text-[#6B0F2B] text-lg" />
                    <p className="text-[#1A0008] font-semibold text-base">Occupancy Details</p>
                </div>
                <div className="grid grid-cols-2 gap-4 pl-1">
                    <div>
                        <p className="text-[#C8B0B8] text-[10px] uppercase font-bold mb-0.5">Semester</p>
                        <p className="text-[#1A0008] text-sm font-medium">Semester 2, AY 2025-2026</p>
                    </div>
                    <div>
                        <p className="text-[#C8B0B8] text-[10px] uppercase font-bold mb-0.5">Duration</p>
                        <p className="text-[#1A0008] text-sm font-medium">
                            {assignment.moveIn || "—"} – {assignment.expectedMoveOut || "—"}
                        </p>
                    </div>
                </div>
            </div>

            <hr className="border-[#F5ECF0]" />

            {/* Room Details */}
            <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                    <FaHouse className="text-[#6B0F2B] text-lg" />
                    <p className="text-[#1A0008] font-semibold text-base">Room Details</p>
                </div>
                <div className="grid grid-cols-3 gap-4 pl-1">
                    <div>
                        <p className="text-[#C8B0B8] text-[10px] uppercase font-bold mb-0.5">Room Type</p>
                        <p className="text-[#1A0008] text-sm font-medium capitalize">{assignment.stayType}</p>
                    </div>
                    <div>
                        <p className="text-[#C8B0B8] text-[10px] uppercase font-bold mb-0.5">Building</p>
                        <p className="text-[#1A0008] text-sm font-medium">{assignment.roomBuilding || "—"}</p>
                    </div>
                    <div>
                        <p className="text-[#C9973A] text-[10px] uppercase font-bold mb-0.5">Monthly Rate</p>
                        <p className="text-[#1A0008] text-sm font-bold">₱3,200 / month</p>
                    </div>
                    <div>
                        <p className="text-[#C8B0B8] text-[10px] uppercase font-bold mb-0.5">Room Arrangement</p>
                        <p className="text-[#1A0008] text-sm font-medium capitalize">{assignment.roomType} Room</p>
                    </div>
                    <div>
                        <p className="text-[#C8B0B8] text-[10px] uppercase font-bold mb-0.5">Room Number</p>
                        <p className="text-[#1A0008] text-sm font-medium">
                            {assignment.roomNumber ? `Room ${assignment.roomNumber}` : "—"}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </Card>
)

//  Page 

export default function RoomAssignment() {
    const [currentPage, setCurrentPage]           = useState(1)
    const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null)
    const [sortBy, setSortBy]                     = useState("Status")
    const [sortOpen, setSortOpen]                 = useState(false)
    const [search, setSearch]                     = useState("")

    //  Filtering & sorting 

    const filtered = useMemo(() => {
        const q = search.toLowerCase()
        return assignments.filter(a =>
            a.student.student.fullName.toLowerCase().includes(q) ||
            a.roomType.toLowerCase().includes(q) ||
            a.stayType.toLowerCase().includes(q) ||
            a.roomNumber.toLowerCase().includes(q) ||
            a.roomBuilding.toLowerCase().includes(q)
        )
    }, [search])

    const sortedAssignments = useMemo(() => {
        return [...filtered].sort((a, b) => {
            switch (sortBy) {
                case "Status":    return a.status === "not assigned" ? -1 : b.status === "not assigned" ? 1 : 0
                case "Name":      return a.student.student.fullName.localeCompare(b.student.student.fullName)
                case "Date":      return new Date(a.student.applicationDate).getTime() - new Date(b.student.applicationDate).getTime()
                case "Room Type": return a.roomType.localeCompare(b.roomType)
                default:          return 0
            }
        })
    }, [filtered, sortBy])

    const totalPages          = Math.ceil(sortedAssignments.length / ASSIGNMENTS_PER_PAGE)
    const startIndex          = (currentPage - 1) * ASSIGNMENTS_PER_PAGE
    const paginatedAssignments = sortedAssignments.slice(startIndex, startIndex + ASSIGNMENTS_PER_PAGE)

    //  Derived from selected assignment 

    const filteredRooms = selectedAssignment
        ? availableRooms.filter(r => r.roomType.toLowerCase() === selectedAssignment.roomType.toLowerCase())
        : []

    //  Handlers 

    const handleSort = (option: string) => {
        setSortBy(option)
        setSortOpen(false)
        setCurrentPage(1)
    }

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value)
        setCurrentPage(1)
    }

    //  Render 

    return (
        <>
            {/*  Modal  */}
            <Modal
                open={!!selectedAssignment}
                onClose={() => setSelectedAssignment(null)}
                title={selectedAssignment?.status === "not assigned" ? "Room Assignment" : "View Room Assignment"}
                maxWidth={700}
                maxHeight={600}
            >
                {selectedAssignment?.status === "not assigned" ? (
                    <AssignModalContent
                        assignment={selectedAssignment}
                        filteredRooms={filteredRooms}
                        onClose={() => setSelectedAssignment(null)}
                    />
                ) : selectedAssignment ? (
                    <ViewModalContent assignment={selectedAssignment} />
                ) : null}
            </Modal>

            {/*  Layout  */}
            <div className="flex h-screen bg-[#F5EEF0] font-sans">
                <Sidebar role="manager" profile={managerProfile} />

                <div className="flex-1 flex flex-col px-8 py-5 overflow-y-auto">
                    {/* Page title */}
                    <div className="pl-10 lg:pl-0 flex flex-row border-b border-[#6B0F2B]/10 mb-2 pb-1">
                        <div
                            className="hidden lg:inline w-2 h-8 rounded-xl mt-1 mr-2"
                            style={{ background: "linear-gradient(to bottom right, #6B0F2B, #9E2040)" }}
                        />
                        <h1 className="text-4xl font-serif italic font-bold text-[#6B0F2B]">Room Assignment</h1>
                    </div>

                    <main className="flex-1 flex flex-col gap-3.5">
                        <HeroBanner
                            greeting={heroContent.greeting}
                            name={managerProfile.fullName}
                            title={heroContent.title}
                            subtitle={heroContent.subtitle}
                            type="mini"
                        />

                        {/*  Stat cards  */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                            <Card
                                children={
                                    <div className="flex flex-col gap-4">
                                        <StatBar
                                            label="Assigned"
                                            value={4}
                                            total={6}
                                            from="#1A7A4A"
                                            to="#2D9A5F"
                                            bg="#F0F7F3"
                                            textColor="#1A7A4A"
                                        />
                                        <hr className="border-[#F5EEF0] my-1" />
                                        <StatBar
                                            label="Pending"
                                            value={2}
                                            total={6}
                                            from="#C9973A"
                                            to="#E0B040"
                                            bg="#FDF6E8"
                                            textColor="#C9973A"
                                        />
                                    </div>
                                }
                            />

                            {/* Donuts container */}
                            <div className="grid grid-cols-2 gap-4 lg:col-span-2">
                                <DonutStatCard
                                    id="available-rooms"
                                    title="Available Rooms"
                                    titleClassName="text-[#1A7A4A] text-sm lg:text-lg font-semibold uppercase"
                                    value={100}
                                    total={120}
                                    subtitle="of 120 total"
                                    subtitleClassName="text-lg"
                                    color={["#1B7C4B", "#2C995E"]}
                                    trackColor="#DCEBE3"
                                    donutSize={120}
                                    strokeWidth={13}
                                    valueSize="3xl"
                                    valueWeight="extrabold"
                                    pctSize="xl"
                                />

                                <DonutStatCard
                                    id="occupied-rooms"
                                    title="Occupied Rooms"
                                    titleClassName="text-[#6B0F2B] text-sm lg:text-lg font-semibold uppercase"
                                    value={20}
                                    total={120}
                                    subtitle="of 120 total"
                                    subtitleClassName="text-lg"
                                    color={["#72112D", "#921C3A"]}
                                    trackColor="#F1E0E6"
                                    donutSize={120}
                                    strokeWidth={13}
                                    valueSize="3xl"
                                    valueWeight="extrabold"
                                    pctSize="xl"
                                />
                            </div>
                        </div>

                        {/*  Table card  */}
                        <Card>
                            <div>
                                {/* Table toolbar */}
                                <div className="flex items-center justify-between mb-2 gap-3 flex-wrap border-b border-[#F5ECF0] pb-2">
                                    <h2 className="text-[#1A0008] font-bold text-base lg:text-lg">Room Assignment</h2>
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
                                                placeholder="Search assignments..."
                                                value={search}
                                                onChange={handleSearch}
                                                className="text-sm outline-none bg-transparent text-[#1A0008] placeholder-[#C4A4B0] w-36"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Scrollable table */}
                                <div className="overflow-x-auto">
                                    <div className="min-w-[900px]">
                                        {/* Header row */}
                                        <div className="grid border-b border-[#F5ECF0]" style={{ gridTemplateColumns: GRID_COLS }}>
                                            {["Student", "Confirmed Room Type", "Date Confirmed", "Status", "Action"].map((h, i) => (
                                                <p key={h} className={`text-[#9A7080] text-xs font-bold p-1 uppercase
                                                    ${i === 3 || i === 4 ? "text-center" : ""}
                                                `}>
                                                    {h}
                                                </p>
                                            ))}
                                        </div>

                                        {/* Rows */}
                                        {sortedAssignments.length > 0 ? (
                                            <>
                                                <div className="flex flex-col">
                                                    {paginatedAssignments.map((assignment, i) => (
                                                        <div
                                                            key={i}
                                                            className={`grid items-center py-2.5 pl-1
                                                                ${assignment.status === "assigned" ? "bg-[#1A7A4A]/5" : ""}`}
                                                            style={{ gridTemplateColumns: GRID_COLS }}
                                                        >
                                                            {/* Student */}
                                                            <div className="flex items-center gap-2">
                                                                <div
                                                                    className="hidden lg:flex w-9 h-9 rounded-xl flex-shrink-0 items-center justify-center text-white text-xs font-bold"
                                                                    style={{ background: "linear-gradient(135deg, #6B0F2B, #9E2040)" }}
                                                                >
                                                                    {getInitials(assignment.student.student.fullName)}
                                                                </div>
                                                                <p className="font-bold text-[12px] lg:text-sm text-[#1A0008]">
                                                                    {assignment.student.student.fullName}
                                                                </p>
                                                            </div>

                                                            {/* Room type */}
                                                            <div className="flex flex-col">
                                                                <p className="text-sm text-[#1A0008] capitalize">{assignment.stayType}</p>
                                                                <p className="text-xs text-[#C8B0B8]">{assignment.roomType}</p>
                                                            </div>

                                                            {/* Date confirmed */}
                                                            <div className="flex flex-col">
                                                                <p className={`text-sm ${assignment.status === "assigned" ? "text-[#1A0008]" : "text-[#C8B0B8]"}`}>
                                                                    {assignment.status === "assigned" ? assignment.student.applicationDate : "—"}
                                                                </p>
                                                                <p className="text-xs text-[#C8B0B8]">
                                                                    {assignment.status === "assigned"
                                                                        ? timeAgo(assignment.student.applicationDate)
                                                                        : "Not yet assigned"}
                                                                </p>
                                                            </div>

                                                            {/* Status badge */}
                                                            <div className="px-2 flex justify-center items-center">
                                                                <span className={`inline-flex items-center justify-center gap-1 text-xs px-2 py-1.5 w-32 rounded-full font-bold capitalize
                                                                    ${assignment.status === "not assigned"
                                                                        ? "bg-[#9E2040]/10 text-[#9E2040]"
                                                                        : "bg-[#1A7A4A]/10 text-[#1A7A4A]"}`}
                                                                >
                                                                    <span className={`w-2 h-2 flex-shrink-0 rounded-full
                                                                        ${assignment.status === "not assigned" ? "bg-[#9E2040]" : "bg-[#1A7A4A]"}`}
                                                                    />
                                                                    {assignment.status === "not assigned" ? "Not Assigned" : "Assigned"}
                                                                </span>
                                                            </div>

                                                            {/* Action */}
                                                            <div className="flex justify-center">
                                                                <Button
                                                                    variant="reddishPink"
                                                                    size="sm"
                                                                    className="w-28 justify-center"
                                                                    onClick={() => setSelectedAssignment(assignment)}
                                                                >
                                                                    {assignment.status === "assigned" ? "View" : "Assign Room"}
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>

                                                {/* Pagination */}
                                                <div className="flex items-center justify-between mt-3">
                                                    <p className="text-xs text-[#9A7080]">
                                                        Showing {startIndex + 1}–{Math.min(startIndex + ASSIGNMENTS_PER_PAGE, sortedAssignments.length)} of {sortedAssignments.length} records
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
                                                                onClick={() => setCurrentPage(p => p + 1)}
                                                                className="flex items-center justify-center w-7 h-7 text-xs rounded-md border border-[#E8D5DC] text-[#9A7080] hover:bg-[#F5ECF0] transition"
                                                            >
                                                                {">"}
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </>
                                        ) : (
                                            <p className="text-sm text-[#9A7080] py-6 text-center">
                                                {search ? "No assignments match your search." : "No assignments found."}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </main>
                </div>
            </div>
        </>
    )
}