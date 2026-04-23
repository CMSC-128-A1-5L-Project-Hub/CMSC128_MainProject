import notif_icon from "../../../assets/icons/notif_icon.svg"
import report_icon from "../../../assets/icons/report.svg"
import default_pfp from "../../../assets/defaults/female-pfp.png"

//Currently for manager palang
//Will update soon to accommodate all user types
import { useState } from "react"
import Modal from "../../Modal"
import Button from "../../Button"
import FormSelect from "../../SignUpForm/shared/FormSelect"

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

type ProfileCardProps = {
    fullName: string
    role: string
    email: string
    phoneNumber: string
    dormitory: string
    status: string
    onNotification?: () => void
}

const CLR = {
  dark: "#3D0718",
  mid: "#6B0F2B",
  accent: "#8C1535",
  gold: "#C9973A",
  goldLt: "#E8C37A",
  goldDk: "#a07825",
} as const;

export default function ProfileCard({
    fullName,
    role,
    email,
    phoneNumber,
    dormitory,
    status,
    onNotification,
}: ProfileCardProps) {
    const [reportOpen, setReportOpen] = useState(false)

    const handleClose = () => {
        setReportOpen(false)  // add this
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
    const [form, setForm] = useState<RoomIssueReport>({
        building: "",
        roomNumber: "",
        issueDetails: "",
    })

    const [errors, setErrors] = useState({
        building: false,
        roomNumber: false,
        issueDetails: false,
    })

    const roomOptions = form.building
        ? reportableRooms[form.building].map((r) => ({ label: `Room ${r}`, value: r }))
        : []

    const handleBuildingChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setForm({ ...form, building: e.target.value, roomNumber: "" })
        setErrors({ ...errors, building: false })
    }

    const handleRoomChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setForm({ ...form, roomNumber: e.target.value })
        setErrors({ ...errors, roomNumber: false })
    }

    return (
        <>
        <Modal
            open={reportOpen}
            onClose={handleClose}
            title="Report Room Availability Issue"
            maxWidth={600}
            maxHeight={560}
            footer={
                <div className="flex flex-row justify-end w-full">
                    <Button variant="reddishPink" onClick={handleSubmit}>
                        Submit
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
        <div
            className="relative rounded-b-[30px] px-7 pt-6 pb-6 shadow-lg"
            style={{ background: `linear-gradient(145deg, ${CLR.dark} 0%, ${CLR.mid} 60%, ${CLR.accent} 100%)` }}
        >
            {/* Top bar overlay */}
            <div
                className="absolute top-0 left-0 w-full h-[79px] pointer-events-none"
                style={{ background: "linear-gradient(90deg, #7A0C23 0%, #A61C3C 100%)" }}
            />

            <div className="relative z-10">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <span className="text-sm font-bold tracking-widest uppercase text-white/75 flex justify-center">
                        My Profile
                    </span>
                    <div className="flex flex-row gap-2">
                        <button
                            onClick={() => setReportOpen(true)}
                            className="w-12 h-11 rounded-2xl flex items-center justify-center relative overflow-hidden 
                                    transition-all duration-150
                                    bg-white/10 hover:bg-white/20 active:bg-white/30
                                    hover:-translate-y-1 active:translate-y-0 active:scale-95"
                        >
                            <img
                                src={report_icon}
                                alt="Report"
                                className="w-full h-full object-contain scale-[2.5]"
                            />
                        </button>
                        <button
                            onClick={onNotification}
                            className="w-12 h-11 rounded-2xl flex items-center justify-center relative overflow-hidden 
                                    transition-all duration-150
                                    bg-white/10 hover:bg-white/20 active:bg-white/30
                                    hover:-translate-y-1 active:translate-y-0 active:scale-95"
                        >
                            <img
                                src={notif_icon}
                                alt="Notifications"
                                className="w-full h-full object-contain scale-[2.5]"
                            />

                            <span
                                className="absolute top-0.5 right-1 w-3 h-3 rounded-full border-2 border-white/80"
                                style={{ background: CLR.gold }}
                            />
                        </button>
                    </div>
                </div>

                {/* Avatar + Name */}
                <div className="flex items-center gap-4">
                    <div className="relative flex-shrink-0">
                        <div
                            className="w-[78px] h-[78px] rounded-full bg-white/20 flex items-center justify-center border-[4px] overflow-hidden shadow-md"
                            style={{ borderColor: CLR.gold }}
                        >
                            <img src={default_pfp} alt={fullName} className="w-full h-full object-cover" />
                        </div>
                        <div className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-green-600 border-[3px] border-white flex items-center justify-center">
                            <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                    </div>

                    <div className="min-w-0">
                        <p className="text-white font-bold text-[20px] leading-tight">{fullName}</p>
                        <p className="text-[15px] font-bold leading-tight mt-1" style={{ color: CLR.goldLt }}>
                            {role}
                        </p>
                        <p className="text-white/70 text-sm mt-1 truncate">{email}</p>
                        <p className="text-white/70 text-sm">{phoneNumber}</p>
                    </div>
                </div>

                {/* Footer details */}
                <div className="mt-6 grid grid-cols-2 gap-4">
                    {[
                        { label: "Dormitory", value: dormitory },
                        { label: "Status", value: status },
                    ].map((item) => (
                        <div key={item.label} className={item.label === "Status" ? "flex flex-col items-center" : ""}>
                            <p className="text-white/50 text-[10px] font-medium leading-tight mb-1.5 uppercase tracking-wider">
                                {item.label}
                            </p>
                            {item.label === "Status" ? (
                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold
                                    ${item.value.toLowerCase() === "active"
                                        ? "bg-green-100 text-green-700"
                                        : "bg-red-100 text-red-700"
                                    }`}
                                >
                                    {item.value}
                                </span>
                            ) : (
                                <p className="text-white text-[14px] font-bold leading-tight">{item.value}</p>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
        </>
    )
}