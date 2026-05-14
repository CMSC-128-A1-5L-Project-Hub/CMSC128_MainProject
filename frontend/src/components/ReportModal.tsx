import { useEffect, useMemo, useState } from "react"
import Modal from "./Modal"
import Button from "./Button"
import FormSelect from "./SignUpForm/shared/FormSelect"
import { api } from "../api/axios"

//Types
type RoomIssueReport = {
    building: string
    roomId: string
    issueDetails: string
}

type ManagerRoom = {
    id: number
    roomNumber: string
    roomBuilding: string
}

type ReportModalProps = {
    open: boolean
    onClose: () => void
}

export default function ReportModal({ open, onClose }: ReportModalProps) {
    const [form, setForm]     = useState<RoomIssueReport>({ building: "", roomId: "", issueDetails: "" })
    const [errors, setErrors] = useState({ building: false, roomId: false, issueDetails: false })
    const [rooms, setRooms]   = useState<ManagerRoom[]>([])
    const [submitting, setSubmitting] = useState(false)

    useEffect(() => {
        if (!open) return
        api.get("/manager/rooms").then((res) => {
            setRooms(res.data ?? [])
        })
    }, [open])

    const buildingOptions = useMemo(() => {
        const seen = new Set<string>()
        const list: { label: string; value: string }[] = []
        for (const r of rooms) {
            if (!seen.has(r.roomBuilding)) {
                seen.add(r.roomBuilding)
                list.push({ label: r.roomBuilding, value: r.roomBuilding })
            }
        }
        return list
    }, [rooms])

    const roomOptions = useMemo(() => {
        if (!form.building) return []
        return rooms
            .filter((r) => r.roomBuilding === form.building)
            .map((r) => ({ label: `Room ${r.roomNumber}`, value: String(r.id) }))
    }, [rooms, form.building])

    const handleClose = () => {
        onClose()
        setForm({ building: "", roomId: "", issueDetails: "" })
        setErrors({ building: false, roomId: false, issueDetails: false })
    }

    const handleSubmit = async () => {
        const newErrors = {
            building:     !form.building,
            roomId:       !form.roomId,
            issueDetails: !form.issueDetails.trim(),
        }
        setErrors(newErrors)
        if (Object.values(newErrors).some(Boolean)) return
        setSubmitting(true)
        try {
            await api.post(`/rooms/${form.roomId}/report-issue`, { issueDetails: form.issueDetails })
            handleClose()
        } finally {
            setSubmitting(false)
        }
    }

    const handleBuildingChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setForm({ ...form, building: e.target.value, roomId: "" })
        setErrors({ ...errors, building: false })
    }

    const handleRoomChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setForm({ ...form, roomId: e.target.value })
        setErrors({ ...errors, roomId: false })
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
                        {submitting ? "Submitting..." : "Submit"}
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
                        onChange={handleBuildingChange}
                        options={buildingOptions}
                        error={errors.building ? "required" : undefined}
                    />
                    <FormSelect
                        label="Room Number"
                        name="roomId"
                        value={form.roomId}
                        defaultSelect={form.building ? "Select Room" : "Select a building first"}
                        onChange={handleRoomChange}
                        options={roomOptions}
                        error={errors.roomId ? "required" : undefined}
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