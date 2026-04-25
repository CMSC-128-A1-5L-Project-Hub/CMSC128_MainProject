// app/components/dashboard/manager/ConfirmedStudents.tsx
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import Button from "../../Button"
import Modal from "../../Modal"
import Card from "../../ui/Card"
import type { AssignmentItem, RawRoom } from "../../../stores/useDashboardStore"

type Props = {
  data: AssignmentItem[]
  allRooms: RawRoom[]
  onAssigned: () => void
  className?: string
  baseUrl: string
}

export default function ConfirmedStudents({ data, allRooms, onAssigned, className = "", baseUrl }: Props) {
  const navigate = useNavigate()
  const getInitials = (name: string) => name[0]

  const [selectedAssignment, setSelectedAssignment] = useState<AssignmentItem | null>(null)
  const [modalAssignment, setModalAssignment] = useState<AssignmentItem | null>(null)

  const openModal = (assignment: AssignmentItem) => {
    if (assignment.status === "assigned" || assignment.status === "pending_confirmation") return
    setModalAssignment(assignment)
    setSelectedAssignment(assignment)
  }

  const closeModal = () => {
    setSelectedAssignment(null)
  }

  const timeAgo = (dateStr: string): string => {
    if (!dateStr) return "—"
    const date = new Date(dateStr)
    const now = new Date()
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)
    const intervals = [
      { label: "year", seconds: 31536000 },
      { label: "month", seconds: 2592000 },
      { label: "week", seconds: 604800 },
      { label: "day", seconds: 86400 },
      { label: "hour", seconds: 3600 },
      { label: "minute", seconds: 60 },
    ]
    for (const interval of intervals) {
      const count = Math.floor(seconds / interval.seconds)
      if (count >= 1) return `${count} ${interval.label}${count !== 1 ? "s" : ""} ago`
    }
    return "Just now"
  }

  // Filter rooms for assignment
  const matchedRooms = modalAssignment
    ? allRooms.filter((room) => {
        const app = modalAssignment.student
        if (room.roomType !== app.applicationRoomType) return false
        if (room.roomStayType !== app.applicationStayType) return false
        const accRestriction = app.accommodation.tenantRestriction || 'coed'
        const studentGender = app.student.gender
        if (accRestriction === 'male-only' && studentGender !== 'Male') return false
        if (accRestriction === 'female-only' && studentGender !== 'Female') return false
        if (room.roomAvailability === 'maintenance') return false
        if (room.roomCurrentOccupancy >= room.roomCapacity) return false
        return true
      })
    : []

  const roomsWithMatchStatus = matchedRooms.map(room => {
    const preferredTags = modalAssignment?.student.preferredTags ?? []
    const roomTags = room.tags?.map(t => t.tagDetail) ?? []
    const perfectMatch = preferredTags.length === 0 || preferredTags.every(tag => roomTags.includes(tag))
    return { room, perfectMatch }
  })

  return (
    <>
      <Modal open={!!selectedAssignment} onClose={closeModal} title="Room Assignment" maxWidth={700} maxHeight={600}>
        {modalAssignment && (
          <Card>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                <div className="flex flex-col">
                  <p className="text-[#1A0008] font-bold text-xl">{modalAssignment.student.student.fullName}</p>
                  <p className="text-[#C8B0B8] text-xs mt-1">Select a room to assign</p>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[#9A7080] text-[10px] uppercase font-semibold tracking-wide">Room Type</span>
                  <span className="text-[#1A0008] text-sm font-semibold capitalize">{modalAssignment.student.applicationRoomType}</span>
                  {modalAssignment.student.preferredTags?.length ? (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {modalAssignment.student.preferredTags.map(tag => (
                        <span key={tag} className="px-2 py-0.5 text-[10px] rounded-full bg-[#F5ECF0] text-[#6B0F2B]">{tag}</span>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="flex flex-col gap-3">
                {roomsWithMatchStatus.length > 0 ? (
                  roomsWithMatchStatus.map(({ room, perfectMatch }, i) => (
                    <div key={i} className={`flex flex-col sm:flex-row sm:items-center gap-3 border rounded-xl p-3 sm:p-4 ${
                      perfectMatch && modalAssignment.student.preferredTags?.length ? 'border-green-200 bg-green-50/50' : 'border-[#F5ECF0]'
                    }`}>
                      <div className="flex flex-col items-start gap-1 min-w-[120px]">
                        <div className="px-4 py-2 rounded-full text-white text-sm font-extrabold uppercase tracking-wide"
                             style={{ background: "linear-gradient(135deg, #6B0F2B, #9E2040)" }}>
                          ROOM {room.roomNumber}
                        </div>
                        <p className="text-[#1A0008] text-sm font-medium pl-1">{room.roomBuilding}</p>
                      </div>
                      <div className="hidden sm:block w-px self-stretch bg-[#F5ECF0]" />
                      <div className="flex flex-col gap-1 flex-1">
                        <p className="text-[#1A0008] text-sm">Type : <span className="font-semibold capitalize">{room.roomType}</span></p>
                        <p className="text-[#1A0008] text-sm">Price : <span className="font-semibold">₱{room.roomRent.toLocaleString()} / month</span></p>
                        <p className="text-[#1A0008] text-sm">Occupants : <span className="font-semibold">{room.roomCurrentOccupancy}/{room.roomCapacity}</span></p>
                        {modalAssignment.student.preferredTags?.length ? (
                          <div className="mt-1 flex flex-wrap gap-1">
                            {modalAssignment.student.preferredTags.map(tag => {
                              const roomTags = room.tags?.map(t => t.tagDetail) ?? []
                              const hasTag = roomTags.includes(tag)
                              return (
                                <span key={tag} className={`px-2 py-0.5 text-[10px] rounded-full ${
                                  hasTag ? 'bg-green-100 text-green-800 border border-green-300' : 'bg-gray-100 text-gray-400 border border-gray-200 line-through'
                                }`}>{tag}</span>
                              )
                            })}
                          </div>
                        ) : null}
                      </div>
                      <Button variant="reddishPink" size="sm" disabled={room.roomCurrentOccupancy >= room.roomCapacity} onClick={async () => {
                        const payload = {
                          studentNumber: modalAssignment.student.student.studentNo,
                          roomId: room.id,
                          moveIn: modalAssignment.moveIn || new Date().toISOString().split('T')[0],
                          expectedMoveOut: modalAssignment.expectedMoveOut ||
                            new Date(new Date().setMonth(new Date().getMonth() + 6)).toISOString().split('T')[0],
                        }
                        try {
                          const res = await fetch(`${baseUrl}/assignments`, {
                            method: 'POST',
                            credentials: 'include',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(payload),
                          })
                          if (res.ok) {
                            closeModal()
                            onAssigned()
                          } else {
                            const err = await res.json()
                            alert(err.message || 'Assignment failed')
                          }
                        } catch (e) {
                          console.error(e)
                          alert('Network error')
                        }
                      }} className="w-full sm:w-auto">Assign Room</Button>
                    </div>
                  ))
                ) : (
                  <div className="flex justify-center items-center py-6 italic text-gray-400 text-sm">No suitable rooms available</div>
                )}
              </div>
            </div>
          </Card>
        )}
      </Modal>

      {/* Table */}
      <div className={className}>
        <div className="bg-white border border-[#E8D0D8] rounded-xl p-3 lg:p-4 shadow-sm w-full h-full flex flex-col">
          <div className="flex flex-row justify-between w-full pb-2 border-b border-[#F5ECF0]">
            <p className="text-[#1A0008] font-bold">Room Assignment</p>
            <p className="text-[#6B0F2B] font-bold text-sm hover:underline cursor-pointer" onClick={() => navigate("/manager/assignments")}>View all →</p>
          </div>
          <div className="overflow-y-auto -mx-0">
            <div className="min-w-[680px] pb-3 lg:pb-0 px-1">
              <div className="grid grid-cols-5 border-b border-[#F5ECF0] uppercase" style={{ gridTemplateColumns: "2fr 1.5fr 1fr 1.5fr 1.5fr" }}>
                <p className="col-span-1 text-[#9A7080] text-xs font-bold p-1">Student</p>
                <p className="col-span-1 px-2 text-[#9A7080] text-xs font-bold p-1">Room</p>
                <p className="col-span-1 px-2 text-[#9A7080] text-xs font-bold p-1">Move-in</p>
                <p className="col-span-1 px-2 text-center text-[#9A7080] text-xs font-bold p-1">Status</p>
                <p className="col-span-1 px-2 text-center text-[#9A7080] text-xs font-bold p-1">Action</p>
              </div>
              {data.length > 0 ? (
                <div className="flex flex-col">
                  {data.map((assignment, i) => (
                    <div key={i} className="grid grid-cols-5 items-center mt-3" style={{ gridTemplateColumns: "2fr 1.5fr 1fr 1.5fr 1.5fr" }}>
                      <div className="col-span-1 flex flex-row items-center">
                        <div className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center text-white text-xs font-bold"
                             style={{ background: "linear-gradient(135deg, #6B0F2B, #9E2040)" }}>
                          {getInitials(assignment.student.student.fullName)}
                        </div>
                        <p className="text-black text-sm pl-2">{assignment.student.student.fullName}</p>
                      </div>
                      <div className="flex flex-col px-2">
                        <p className="text-[#1A0008] text-sm">Room {assignment.roomNumber || '—'}</p>
                        <p className="text-[#9A7080] text-xs">{assignment.roomBuilding ? `${assignment.roomBuilding} · ${assignment.roomType}` : 'Not assigned'}</p>
                      </div>
                      <div className="flex flex-col px-2">
                        <p className="text-[#1A0008] text-sm">{assignment.moveIn || '—'}</p>
                        <p className="text-[#9A7080] text-xs">{assignment.moveIn ? timeAgo(assignment.moveIn) : ''}</p>
                      </div>
                      <div className="col-span-1 px-2 flex justify-center items-center">
                        <span className={`inline-flex items-center justify-center gap-1 text-xs px-2 py-1.5 w-full max-w-[110px] rounded-full font-bold capitalize ${
                          assignment.status === "not assigned" ? "bg-[#9E2040]/10 text-[#9E2040]" :
                          assignment.status === "pending_confirmation" ? "bg-amber-100 text-amber-800" :
                          "bg-[#1A7A4A]/10 text-[#1A7A4A]"
                        }`}>
                          <span className={`w-2 h-2 rounded-full ${
                            assignment.status === "not assigned" ? "bg-[#9E2040]" :
                            assignment.status === "pending_confirmation" ? "bg-amber-500" : "bg-[#1A7A4A]"
                          }`} />
                          {assignment.status === "not assigned" ? "Not Assigned" :
                           assignment.status === "pending_confirmation" ? "Pending Confirmation" : "Assigned"}
                        </span>
                      </div>
                      <div className="col-span-1 px-2 flex justify-center items-center">
                        {assignment.status === "not assigned" ? (
                          <Button variant="reddishPink" size="sm" onClick={() => openModal(assignment)}>Assign Room</Button>
                        ) : (
                          <span className="text-sm font-semibold text-[#1A7A4A]">
                            {assignment.status === "pending_confirmation" ? "Awaiting Confirmation" : "Assigned"}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex-1 flex justify-center items-center py-4 italic text-gray-500">Nothing to see here</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}