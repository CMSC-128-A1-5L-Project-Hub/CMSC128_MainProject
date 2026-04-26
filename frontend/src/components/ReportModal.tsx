// src/components/ReportModal.tsx
import { useState } from "react"
import Modal from "./Modal"
import Button from "./Button"
import FormSelect from "./SignUpForm/shared/FormSelect"
import { useRooms } from "../../hooks/useDashboardQueries"   // adjust path to your hooks
import { api } from "../api/axios"

// ── Types ──
type RoomIssueReport = {
  building: string
  roomNumber: string
  issueDetails: string
}

type ReportModalProps = {
  open: boolean
  onClose: () => void
}

// ── Component ──
export default function ReportModal({ open, onClose }: ReportModalProps) {
  const { data: rooms = [] } = useRooms()  

  const [form, setForm] = useState<RoomIssueReport>({
    building: "",
    roomNumber: "",
    issueDetails: "",
  })
  const [errors, setErrors] = useState({ building: false, roomNumber: false, issueDetails: false })
  const [submitting, setSubmitting] = useState(false)

  // Derive building & room options from real data
  const buildings = [...new Set(rooms.map(r => r.roomBuilding))]
    .filter(Boolean)
    .sort()
    .map(b => ({ label: `Building ${b}`, value: b }))

  const roomOpts = form.building
    ? rooms
        .filter(r => r.roomBuilding === form.building)
        .map(r => ({ label: `Room ${r.roomNumber}`, value: r.roomNumber }))
    : []

  const handleClose = () => {
    onClose()
    setForm({ building: "", roomNumber: "", issueDetails: "" })
    setErrors({ building: false, roomNumber: false, issueDetails: false })
    setSubmitting(false)
  }

  const handleSubmit = async () => {
    const newErrors = {
      building: !form.building,
      roomNumber: !form.roomNumber,
      issueDetails: !form.issueDetails.trim(),
    }
    setErrors(newErrors)
    if (Object.values(newErrors).some(Boolean)) return

    // Find the room ID from the loaded rooms
    const room = rooms.find(
      r => r.roomBuilding === form.building && r.roomNumber === form.roomNumber
    )
    if (!room) {
      alert('Room not found – please select a valid room.')
      return
    }

    setSubmitting(true)
    try {
      await api.post(`/rooms/${room.id}/report-issue`, {
        issueDetails: form.issueDetails,
      })
      handleClose()
    } catch (err: any) {
      console.error('Failed to submit report', err)
      const message =
        err?.response?.data?.message ?? 'Could not submit report. Please try again.'
      alert(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Report Room Availability Issue"
      maxWidth={600}
      maxHeight={560}
      footer={
        <div className="flex flex-row justify-end w-full">
          <Button variant="reddishPink" onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Submitting…' : 'Submit'}
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-5 py-1">
        {/* Building + Room Number */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormSelect
            label="Building"
            name="building"
            value={form.building}
            defaultSelect="Select Building"
            onChange={(e) => {
              setForm({ ...form, building: e.target.value, roomNumber: "" })
              setErrors({ ...errors, building: false })
            }}
            options={buildings}
            error={errors.building ? "required" : undefined}
          />
          <FormSelect
            label="Room Number"
            name="roomNumber"
            value={form.roomNumber}
            defaultSelect={form.building ? "Select Room" : "Select a building first"}
            onChange={(e) => {
              setForm({ ...form, roomNumber: e.target.value })
              setErrors({ ...errors, roomNumber: false })
            }}
            options={roomOpts}
            error={errors.roomNumber ? "required" : undefined}
          />
        </div>

        {/* Issue Details */}
        <div>
          <label className={`block text-[11px] font-semibold tracking-widest uppercase mb-1.5
            ${errors.issueDetails ? "text-red-500" : "text-[#6B4050]"}`}>
            Issue Details
          </label>
          <textarea
            value={form.issueDetails}
            onChange={(e) => {
              setForm({ ...form, issueDetails: e.target.value })
              setErrors({ ...errors, issueDetails: false })
            }}
            placeholder="Enter room issue.."
            rows={5}
            className={`w-full border rounded-xl px-4 py-3 text-sm text-[#1A0008] placeholder:text-[#C8B0B8] resize-none focus:outline-none transition
              ${errors.issueDetails
                ? "border-red-400 focus:ring-2 focus:ring-red-200 focus:border-red-400"
                : "border-[#6B0F2B3E] focus:ring-2 focus:ring-[#C9973A]/40 focus:border-[#C9973A]"
              }`}
          />
          {errors.issueDetails && (
            <p className="text-red-500 text-[10px] mt-1">This field is required</p>
          )}
        </div>
      </div>
    </Modal>
  )
}