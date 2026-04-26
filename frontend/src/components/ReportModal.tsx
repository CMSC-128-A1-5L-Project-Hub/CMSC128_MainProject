import { useState } from "react"
import Modal from "./Modal"
import Button from "./Button"
import FormSelect from "./SignUpForm/shared/FormSelect"

//Types
type RoomIssueReport = {
    building: string
    roomNumber: string
    issueDetails: string
}

const reportableRooms: Record<string, string[]> = {
    "Building 1": ["101", "102", "103", "104", "105"],
    "Building 2": ["201", "202", "203", "204"],
    "Building 3": ["301", "302", "303", "310"],
    "Building 4": ["401", "402", "312"],
    "Building 5": ["501", "502", "221"],
    "Building 6": ["601", "602", "204"],
}

const buildingOptions = Object.keys(reportableRooms).map((b) => ({
    label: b,
    value: b,
}))

type ReportModalProps = {
    open: boolean
    onClose: () => void
}

export default function ReportModal({ open, onClose }: ReportModalProps) {
    const [form, setForm]     = useState<RoomIssueReport>({ building: "", roomNumber: "", issueDetails: "" })
    const [errors, setErrors] = useState({ building: false, roomNumber: false, issueDetails: false })

    const roomOptions = form.building
        ? reportableRooms[form.building].map((r) => ({ label: `Room ${r}`, value: r }))
        : []

    const handleClose = () => {
        onClose()
        setForm({ building: "", roomNumber: "", issueDetails: "" })
        setErrors({ building: false, roomNumber: false, issueDetails: false })
    }

    const handleSubmit = () => {
        const newErrors = {
            building:     !form.building,
            roomNumber:   !form.roomNumber,
            issueDetails: !form.issueDetails.trim(),
        }
        setErrors(newErrors)
        if (Object.values(newErrors).some(Boolean)) return
        console.log("Issue reported:", form)
        handleClose()
    }

    const handleBuildingChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setForm({ ...form, building: e.target.value, roomNumber: "" })
        setErrors({ ...errors, building: false })
    }

    const handleRoomChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setForm({ ...form, roomNumber: e.target.value })
        setErrors({ ...errors, roomNumber: false })
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
                    <Button variant="reddishPink" onClick={handleSubmit}>Submit</Button>
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
                        name="roomNumber"
                        value={form.roomNumber}
                        defaultSelect={form.building ? "Select Room" : "Select a building first"}
                        onChange={handleRoomChange}
                        options={roomOptions}
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