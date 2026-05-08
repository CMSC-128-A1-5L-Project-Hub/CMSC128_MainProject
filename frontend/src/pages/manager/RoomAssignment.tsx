// app/pages/dashboard/RoomAssignment.tsx
import { useState, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import CustomHeader from '../../components/CustomHeader';
import Dropdown from "../../components/ApplicationStatus/Dropdown";
import SearchBar from '../../components/SearchBar';


import Sidebar from "../../components/Sidebar"
import HeroBanner from "../../components/dashboard/HeroBanner"
import Card from "../../components/ui/Card"
import StatBar from "../../components/ui/StatBar"
import DonutStatCard from "../../components/dashboard/DonutStatCard"
import Button from "../../components/Button"
import Modal from "../../components/Modal"

import { IoCalendarSharp } from "react-icons/io5"
import { FaHouse } from "react-icons/fa6"

import {
  useProfile,
  useApprovedApps,
  useAssignments,
  useRooms,
  transformApp,
  mergeAppWithAssignment,
  useRefreshDashboard,
} from '../../../hooks/useDashboardQueries'
import { api } from "../../api/axios"
import type { AssignmentItem, RawRoom } from '../../stores/useDashboardStore'

// ── Constants & Helpers ────────────────────────────────────────
//const ASSIGNMENTS_PER_PAGE = 5
const SORT_OPTS = ["Name", "Status", "Date", "Room Type"]
const GRID_COLS = "2fr 1.5fr 1fr 1.5fr 1.5fr"

function getInitials(name: string) {
  return name?.[0] ?? '?'
}

function timeAgo(dateStr: string): string {
  if (!dateStr) return "—"
  const date = new Date(dateStr)
  const now = new Date()
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  if (seconds < 0) return "Scheduled"   // future date

  const intervals = [
    { label: "year", seconds: 31536000 },
    { label: "month", seconds: 2592000 },
    { label: "week", seconds: 604800 },
    { label: "day", seconds: 86400 },
    { label: "hour", seconds: 3600 },
    { label: "minute", seconds: 60 },
  ]
  for (const { label, seconds: s } of intervals) {
    const count = Math.floor(seconds / s)
    if (count >= 1) return `${count} ${label}${count !== 1 ? "s" : ""} ago`
  }
  return "Just now"
}

// ── Modal Components ────────────────────────────────────────────

const AssignModalContent = ({
  assignment,
  rooms,
  onClose,
  onAssigned,
}: {
  assignment: AssignmentItem
  rooms: RawRoom[]
  onClose: () => void
  onAssigned: () => void
}) => {
  const studentPrefs = assignment.student.preferredTags ?? []
  const appStayType = assignment.stayType.replace('-', '_')

  // Hard filter: room type, stay type, availability, capacity
  const matchedRooms = rooms.filter(room => {
    if (room.roomType !== assignment.roomType) return false
    if (room.roomStayType !== appStayType) return false
    if (room.roomAvailability === 'maintenance') return false
    if (room.roomCurrentOccupancy >= room.roomCapacity) return false
    return true
  })

  // Soft tag matching indicator
  const roomsWithMatchStatus = matchedRooms.map(room => {
    const roomTags = room.tags?.map(t => t.tagDetail) ?? []
    const perfectMatch = studentPrefs.length === 0 ||
      studentPrefs.every(tag => roomTags.includes(tag))
    return { room, perfectMatch }
  })

  return (
    <Card>
      <div className="flex flex-col gap-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
          <div className="flex flex-col">
            <p className="text-[#1A0008] font-bold text-xl">{assignment.student.student.fullName}</p>
            <p className="text-[#C8B0B8] text-xs mt-1">Select a room to assign</p>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[#9A7080] text-[10px] uppercase font-semibold tracking-wide">
              Room Type
            </span>
            <span className="text-[#1A0008] text-sm font-semibold capitalize">{assignment.roomType}</span>
            {studentPrefs.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {studentPrefs.map(tag => (
                  <span key={tag} className="px-2 py-0.5 text-[10px] rounded-full bg-[#F5ECF0] text-[#6B0F2B]">{tag}</span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Room list */}
        <div className="flex flex-col gap-3">
          {roomsWithMatchStatus.length > 0 ? (
            roomsWithMatchStatus.map(({ room, perfectMatch }, i) => (
              <div
                key={i}
                className={`flex flex-col sm:flex-row sm:items-center gap-3 border rounded-xl p-3 sm:p-4 ${
                  perfectMatch && studentPrefs.length > 0
                    ? 'border-green-200 bg-green-50/50'
                    : 'border-[#F5ECF0]'
                }`}
              >
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
                  <p className="text-[#1A0008] text-sm">
                    Type : <span className="font-semibold capitalize">{room.roomType}</span>
                  </p>
                  <p className="text-[#1A0008] text-sm">
                    Price : <span className="font-semibold">₱{room.roomRent.toLocaleString()} / month</span>
                  </p>
                  <p className="text-[#1A0008] text-sm">
                    Occupants : <span className="font-semibold">{room.roomCurrentOccupancy}/{room.roomCapacity}</span>
                  </p>

                  {/* Tag match indicators */}
                  {studentPrefs.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {studentPrefs.map(tag => {
                        const roomTags = room.tags?.map(t => t.tagDetail) ?? []
                        const hasTag = roomTags.includes(tag)
                        return (
                          <span
                            key={tag}
                            className={`px-2 py-0.5 text-[10px] rounded-full ${
                              hasTag
                                ? 'bg-green-100 text-green-800 border border-green-300'
                                : 'bg-gray-100 text-gray-400 border border-gray-200 line-through'
                            }`}
                          >
                            {tag}
                          </span>
                        )
                      })}
                    </div>
                  )}
                </div>

                {/* Assign button – uses api */}
                <Button
                  variant="reddishPink"
                  size="sm"
                  onClick={async () => {
                    const payload = {
                      applicationId: assignment.student.id,
                      roomId: room.id,
                      moveIn: assignment.moveIn || new Date().toISOString().split('T')[0],
                      expectedMoveOut:
                        assignment.expectedMoveOut ||
                        new Date(new Date().setMonth(new Date().getMonth() + 6))
                          .toISOString()
                          .split('T')[0],
                    }
                    try {
                      const res = await api.post('/assignments', payload)
                      if (res.status === 200 || res.status === 201) {
                        onClose()
                        onAssigned()
                      } else {
                        alert(res.data?.message || 'Assignment failed')
                      }
                    } catch (e: any) {
                      console.error(e)
                      alert('Network error')
                    }
                  }}
                  className="w-full sm:w-auto"
                >
                  Assign Room
                </Button>
              </div>
            ))
          ) : (
            <div className="flex justify-center items-center py-6 italic text-gray-400 text-sm">
              No suitable rooms available
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}

const ViewModalContent = ({ assignment }: { assignment: AssignmentItem }) => {
  const rentDisplay = assignment.roomRent
    ? `₱${assignment.roomRent.toLocaleString()} / month`
    : "—"

  return (
    <Card>
      <div className="flex flex-col gap-5">
        <div>
          <span
            className="inline-block px-5 py-2 rounded-full text-white text-sm font-bold uppercase"
            style={{ background: "linear-gradient(135deg, #3D0718, #6B0F2B)" }}
          >
            Room {assignment.roomNumber || "—"}
          </span>
        </div>
        <div>
          <p className="text-[#C8B0B8] text-xs uppercase font-bold mb-0.5">Student Name</p>
          <p className="text-[#1A0008] text-2xl font-bold">{assignment.student.student.fullName}</p>
        </div>
        <hr className="border-[#F5ECF0]" />
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
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <FaHouse className="text-[#6B0F2B] text-lg" />
            <p className="text-[#1A0008] font-semibold text-base">Room Details</p>
          </div>
          <div className="grid grid-cols-3 gap-4 pl-1">
            <div>
              <p className="text-[#C8B0B8] text-[10px] uppercase font-bold mb-0.5">Room Type</p>
              <p className="text-[#1A0008] text-sm font-medium capitalize">{assignment.roomType}</p>
            </div>
            <div>
              <p className="text-[#C8B0B8] text-[10px] uppercase font-bold mb-0.5">Building</p>
              <p className="text-[#1A0008] text-sm font-medium">{assignment.roomBuilding || "—"}</p>
            </div>
            <div>
              <p className="text-[#C9973A] text-[10px] uppercase font-bold mb-0.5">Monthly Rate</p>
              <p className="text-[#1A0008] text-sm font-bold">{rentDisplay}</p>
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
}

// ── Page Component ───────────────────────────────────────────────
export default function RoomAssignment() {
  const navigate = useNavigate()

  // Data from TanStack Query hooks
  const { data: profile, isLoading } = useProfile()
  const { data: approvedApps = [] } = useApprovedApps()
  const { data: assignments = [] } = useAssignments()
  const { data: rooms = [] } = useRooms()
  const refreshDashboard = useRefreshDashboard()

  // UI state
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedAssignment, setSelectedAssignment] = useState<AssignmentItem | null>(null)
  const [sortBy, setSortBy] = useState("Status")
  const [itemsPerPage, setItemsPerPage] = useState(5)

  // const [sortOpen, setSortOpen] = useState(false)
  const [search, setSearch] = useState("")

  // Transform approved apps and merge with assignments
  const transformedApproved = approvedApps.map(transformApp)
  const allAssignments: AssignmentItem[] = transformedApproved.map((app) =>
    mergeAppWithAssignment(app, assignments)
  )

  // Derived stats
  const totalAssigned = allAssignments.filter(a => a.status === 'assigned').length
  const totalUnassigned = allAssignments.filter(a => a.status === 'not assigned').length
  const totalRooms = rooms.length
  const occupiedRooms = rooms.filter(r => r.roomAvailability === 'occupied').length

  // Filtering
  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return allAssignments.filter(a =>
      (a.student?.student?.fullName ?? '').toLowerCase().includes(q) ||
      (a.roomType ?? '').toLowerCase().includes(q) ||
      (a.stayType ?? '').toLowerCase().includes(q) ||
      (a.roomNumber ?? '').toLowerCase().includes(q) ||
      (a.roomBuilding ?? '').toLowerCase().includes(q)
    )
  }, [search, allAssignments])

  // Sorting
  const sortedAssignments = useMemo(() => {
    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "Status":
          // Not assigned first, then pending confirmation, then assigned
          if (a.status === 'not assigned' && b.status !== 'not assigned') return -1
          if (a.status !== 'not assigned' && b.status === 'not assigned') return 1
          return 0
        case "Name":
          return a.student.student.fullName.localeCompare(b.student.student.fullName)
        case "Date":
          return new Date(a.student.applicationDate).getTime() - new Date(b.student.applicationDate).getTime()
        case "Room Type":
          return a.roomType.localeCompare(b.roomType)
        default:
          return 0
      }
    })
  }, [filtered, sortBy])

  // const totalPages = Math.ceil(sortedAssignments.length / ASSIGNMENTS_PER_PAGE)
  // const startIndex = (currentPage - 1) * ASSIGNMENTS_PER_PAGE
  // const paginatedAssignments = sortedAssignments.slice(startIndex, startIndex + ASSIGNMENTS_PER_PAGE)

  // Loading
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Loading…</p>
      </div>
    )
  }

  // pagination calc
  const totalPages = Math.ceil(sortedAssignments.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedAssignments = sortedAssignments.slice(startIndex, startIndex + itemsPerPage)

  // const handleSort = (option: string) => {
  //   setSortBy(option)
  //   setSortOpen(false)
  //   setCurrentPage(1)
  // }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value)
    setCurrentPage(1)
  }

  const fullName = profile ? `${profile.fname} ${profile.lname}` : ''

  return (
    <>
      {/* Modal for assign / view */}
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
            rooms={rooms}
            onClose={() => setSelectedAssignment(null)}
            onAssigned={refreshDashboard}
          />
        ) : selectedAssignment ? (
          <ViewModalContent assignment={selectedAssignment} />
        ) : null}
      </Modal>

      {/* Layout */}
      <div className="flex h-screen bg-[#F5EEF0] font-sans">
        <Sidebar role="manager" profile={profile as any} />
        <div className="flex flex-col w-full flex-1 min-w-0">
          <CustomHeader
            title="Room Assignment"></CustomHeader>
          <div className="flex-1 flex flex-col p-4 lg:p-6 overflow-y-auto">
            <main className="flex-1 flex flex-col gap-4 lg:gap-6">
              <HeroBanner
                greeting="Good Day"
                name={fullName}
                title="Assign a room to your confirmed applicant"
                subtitle="We make it easy for you to track the accommodation applications you manage."
                type="mini"
              />

              {/* Stats */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
                <Card>
                  <div className="flex flex-col gap-4">
                    <StatBar
                      label="Assigned"
                      value={totalAssigned}
                      total={allAssignments.length}
                      from="#1A7A4A" to="#2D9A5F" bg="#F0F7F3" textColor="#1A7A4A"
                    />
                    <hr className="border-[#F5EEF0] my-1" />
                    <StatBar
                      label="Pending"
                      value={totalUnassigned}
                      total={allAssignments.length}
                      from="#C9973A" to="#E0B040" bg="#FDF6E8" textColor="#C9973A"
                    />
                  </div>
                </Card>

                <div className="grid grid-cols-2 gap-4 lg:gap-6 lg:col-span-2">
                  <DonutStatCard
                    id="available-rooms"
                    title="Available Rooms"
                    titleClassName="text-[#1A7A4A] text-sm lg:text-lg font-semibold uppercase"
                    value={totalRooms - occupiedRooms}
                    total={totalRooms}
                    subtitle={`of ${totalRooms} total`}
                    subtitleClassName="text-lg"
                    color={["#1B7C4B", "#2C995E"]}
                    trackColor="#DCEBE3"
                    donutSize={120} strokeWidth={13} valueSize="3xl" valueWeight="extrabold" pctSize="xl"
                  />

                  <DonutStatCard
                    id="occupied-rooms"
                    title="Occupied Rooms"
                    titleClassName="text-[#6B0F2B] text-sm lg:text-lg font-semibold uppercase"
                    value={occupiedRooms}
                    total={totalRooms}
                    subtitle={`of ${totalRooms} total`}
                    subtitleClassName="text-lg"
                    color={["#72112D", "#921C3A"]}
                    trackColor="#F1E0E6"
                    donutSize={120} strokeWidth={13} valueSize="3xl" valueWeight="extrabold" pctSize="xl"
                  />
                </div>
              </div>

              {/* Table */}
              <Card>
                <div>
                  <div className="flex items-center justify-between mb-2 gap-3 flex-wrap pb-2">
                    <h2 className="text-[#1A0008] font-bold text-base lg:text-lg">Room Assignment</h2>
                    <div className="flex items-center gap-2 ml-auto">
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
                      
                      {/* Sort */}
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
                                className={`w-full text-left px-4 py-2 text-sm hover:bg-[#F5ECF0] transition ${sortBy === opt ? "text-[#6B0F2B] font-semibold" : "text-[#1A0008]"}`}
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
                          placeholder="Search assignments..."
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

                  <div className="overflow-x-auto">
                    <table className="min-w-[900px] w-full border-collapse">
                      <thead>
                        <tr className="border-[#6B0F2B]/5 border-y-2">
                          {["Student", "Confirmed Room Type", "Date Confirmed", "Status", "Action"].map((h, i) => (
                            <th
                              key={h}
                              className={`text-[#9A7080] p-1 text-xs font-bold tracking-widest uppercase text-left ${i === 3 || i === 4 ? "text-left" : ""}`}
                            >
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {sortedAssignments.length > 0 ? (
                          paginatedAssignments.map((assignment, i) => (
                            <tr
                              key={i}
                              className={` ${assignment.status === "assigned" ? "bg-[#1A7A4A]/5" : ""}`}
                            >
                              {/* Student */}
                              <td className="py-2.5 pl-1">
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
                              </td>

                              {/* Room type & building */}
                              <td className="py-2.5">
                                <p className="text-sm text-[#1A0008] capitalize">{assignment.stayType}</p>
                                <p className="text-xs text-[#C8B0B8]">
                                  {assignment.roomBuilding
                                    ? `Building ${assignment.roomBuilding} · ${assignment.roomType.charAt(0).toUpperCase() + assignment.roomType.slice(1)}`
                                    : assignment.roomType}
                                </p>
                              </td>

                              {/* Date / Move-in */}
                              <td className="py-2.5">
                                <p className={`text-sm ${assignment.status === "assigned" ? "text-[#1A0008]" : "text-[#C8B0B8]"}`}>
                                  {assignment.status === 'pending_confirmation' ? 'TBD' : (assignment.moveIn || '—')}
                                </p>
                                {assignment.status !== 'pending_confirmation' && (
                                  <p className="text-xs text-[#C8B0B8]">
                                    {assignment.moveIn ? timeAgo(assignment.moveIn) : ''}
                                  </p>
                                )}
                              </td>

                              {/* Status badge */}
                              <td className="py-2.5 text-left">
                                <span className={`inline-flex items-center justify-center gap-1 text-xs px-2 py-1.5 rounded-full font-bold capitalize whitespace-nowrap
                                  ${assignment.status === "not assigned" ? "bg-[#9E2040]/10 text-[#9E2040]" :
                                    assignment.status === "pending_confirmation" ? "bg-amber-100 text-amber-800" :
                                    "bg-[#1A7A4A]/10 text-[#1A7A4A]"}`}>
                                  <span className={`w-2 h-2 flex-shrink-0 rounded-full
                                    ${assignment.status === "not assigned" ? "bg-[#9E2040]" :
                                      assignment.status === "pending_confirmation" ? "bg-amber-500" : "bg-[#1A7A4A]"}`} />
                                  {assignment.status === "not assigned" ? "Not Assigned" :
                                    assignment.status === "pending_confirmation" ? "Pending Confirmation" : "Assigned"}
                                </span>
                              </td>

                              {/* Action */}
                              <td className="py-2.5 text-left">
                                <Button
                                  variant="reddishPink"
                                  size="sm"
                                  className="w-28 justify-center"
                                  onClick={() => setSelectedAssignment(assignment)}
                                >
                                  {assignment.status === "assigned" ? "View" : "Assign Room"}
                                </Button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={5} className="text-sm text-[#9A7080] py-6 text-left">
                              {search ? "No assignments match your search." : "No assignments found."}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {sortedAssignments.length > 0 && (
                    <div className="flex items-center justify-between mt-3">
                      <p className="text-xs text-[#9A7080]">
                        Showing {startIndex + 1}–{Math.min(startIndex + itemsPerPage, sortedAssignments.length)} of {sortedAssignments.length} records
                      </p>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`w-7 h-7 text-xs rounded-md font-medium transition flex items-center justify-center
                              ${currentPage === page ? "text-white" : "text-[#9A7080] border border-[#E8D5DC] hover:bg-[#F5ECF0]"}`}
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
              </Card>
            </main>
          </div>
        </div>
        
        
      </div>
    </>
  )
}