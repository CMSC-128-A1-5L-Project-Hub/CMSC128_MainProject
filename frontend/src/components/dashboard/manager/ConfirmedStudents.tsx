import { useState } from "react"
import { useNavigate } from "react-router-dom"
import Button from "../../Button"
import Modal from "../../Modal"
import Card from "../../ui/Card"
import { api } from "../../../api/axios"
import type { AssignmentItem, RawRoom } from "../../../stores/useDashboardStore"

type Props = {
  data: AssignmentItem[]
  allRooms: RawRoom[]
  onAssigned: () => void
  className?: string
  setToast: (t: { show: boolean; type: "success" | "error" | "info" | "warning" | "loading"; title: string; message?: string }) => void
}

export default function ConfirmedStudents({ data, allRooms, onAssigned, className = "", setToast }: Props) {
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

  function timeAgo(dateStr: string): string {
    if (!dateStr) return "—"
    const date = new Date(dateStr)
    const now = new Date()
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)
    if (seconds < 0) return "Scheduled"

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

  const matchedRooms = modalAssignment
    ? allRooms.filter((room) => {
        const app = modalAssignment.student
        if (room.roomType !== app.applicationRoomType) return false
        if (room.roomStayType !== app.applicationStayType) return false
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
                          applicationId: modalAssignment.student.id,  
                          roomId: room.id,
                          moveIn: modalAssignment.moveIn || new Date().toISOString().split('T')[0],
                          expectedMoveOut: modalAssignment.expectedMoveOut ||
                            new Date(new Date().setMonth(new Date().getMonth() + 6)).toISOString().split('T')[0],
                        }
                        try {
                          const res = await api.post('/assignments', payload)
                          if (res.status === 200 || res.status === 201) {
                            closeModal()
                            onAssigned()
                            setToast({ show: true, type: "success", title: "Room Assigned!", message: "The student has been successfully assigned to the room." })
                          } else {
                            setToast({ show: true, type: "error", title: "Assignment Failed", message: res.data?.message || "Could not assign the room." })
                          }
                        } catch (err: any) {
                        console.error(err)
                        const msg =
                            err?.response?.data?.message ??
                            err?.response?.data?.error ??
                            err.message ??
                            'Network error'
                        setToast({ show: true, type: "error", title: "Network Error", message: msg })
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
        <div className="bg-white border border-[#E8D0D8] rounded-xl p-3 lg:p-6 shadow-sm w-full h-full flex flex-col">
          <div className="flex flex-row justify-between w-full pb-2 border-b border-[#F5ECF0]">
            <p className="text-[#1A0008] font-bold">Room Assignment</p>
            <p className="text-[#6B0F2B] font-bold text-sm hover:underline cursor-pointer" onClick={() => navigate("/manager/assignments")}>
              View all →
            </p>
          </div>
          <div className="overflow-y-auto -mx-0">
            <table className="w-full min-w-[680px] table-fixed">
              <thead className="tracking-widest">
                <tr className="border-b border-[#F5ECF0] uppercase">
                  <th className="text-[#9A7080] text-xs font-bold p-1 truncate text-left w-56">Student</th>
                  <th className="text-[#9A7080] text-xs font-bold p-1 truncate text-left w-48">Room</th>
                  <th className="text-[#9A7080] text-xs font-bold p-1 truncate text-left w-28">Move-in</th>
                  <th className="text-[#9A7080] text-xs font-bold p-1 truncate text-left w-48">Status</th>
                  <th className="text-[#9A7080] text-xs font-bold p-1 truncate text-left w-44">Action</th>
                </tr>
              </thead>
              <tbody>
                {data.length > 0 ? (
                  data.map((assignment, i) => (
                    <tr key={i} className="border-b border-[#F5ECF0]/50 last:border-0">
                      <td className="p-1 py-2">
                        <div className="flex flex-row items-center">
                          <div className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center text-white text-xs font-bold"
                              style={{ background: "linear-gradient(135deg, #6B0F2B, #9E2040)" }}>
                            {getInitials(assignment.student.student.fullName)}
                          </div>
                          <p className="text-black text-sm pl-2 truncate">{assignment.student.student.fullName}</p>
                        </div>
                      </td>
                      <td className="p-1 py-2">
                        <p className="text-[#1A0008] text-sm">Room {assignment.roomNumber || '—'}</p>
                        <p className="text-[#9A7080] text-xs truncate capitalize">
                          {assignment.roomBuilding
                            ? `Building ${assignment.roomBuilding} · ${assignment.roomType.charAt(0).toUpperCase() + assignment.roomType.slice(1)}`
                            : 'Not assigned'}
                        </p>
                      </td>
                      <td className="p-1 py-2">
                        <p className="text-[#1A0008] text-sm">
                          {assignment.status === 'pending_confirmation' ? 'TBD' : (assignment.moveIn || '—')}
                        </p>
                        {assignment.status !== 'pending_confirmation' && (
                          <p className="text-[#9A7080] text-xs">
                            {assignment.moveIn ? timeAgo(assignment.moveIn) : ''}
                          </p>
                        )}
                      </td>
                      <td className="p-1 py-2 text-left">
                        <span className={`inline-flex items-center justify-center gap-1 text-xs px-2 py-1.5 rounded-full font-bold capitalize whitespace-nowrap ${
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
                      </td>
                      <td className="p-1 py-2 text-left">
                        {assignment.status === "not assigned" ? (
                          <Button variant="reddishPink" size="sm" onClick={() => openModal(assignment)}>
                            Assign Room
                          </Button>
                        ) : (
                          <span className="text-xs truncate font-semibold text-[#1A7A4A]">
                            {assignment.status === "pending_confirmation" ? "Awaiting Confirmation" : "Assigned"}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="text-center py-4 italic text-gray-500">Nothing to see here</td>
                  </tr>
                )}
              </tbody>
            </table>
            </div>
          </div>
        </div>
    </>
  )
}