import { useState } from "react"
import { useNavigate } from "react-router-dom"

import Button from "../../Button"
import Card from "../../ui/Card"
import Modal from "../../Modal"
import StatusBadge from "../../ui/StatusBadge"

//documentation to follow, ang mahalaga nagana siya

import { 
    IoPersonSharp, 
    IoCalendarSharp, 
    IoBedSharp,
    IoDocumentSharp,
    IoDocumentTextSharp,
    IoIdCardSharp
} from "react-icons/io5"

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
    type: string
    roomType: "single" | "double" | "shared"
    stayType: "transient" | "non-transient"
    rejectionReason?: string | null
    applicationStatus: 'pending' | 'approved' | 'rejected' | 'cancelled' | 'waitlisted' | 'under_review'
    durationOfStayDays: number
    applicationDate: string 
}

// Move OUTSIDE the Applications component, above it
const RejectionModal = ({ 
    open, 
    target, 
    onCancel, 
    onConfirm 
}: { 
    open: boolean
    target: Application | null
    onCancel: () => void
    onConfirm: (reason: string) => void
}) => {
    const [reason, setReason] = useState("")

    const handleConfirm = () => {
        if (!reason.trim()) return
        onConfirm(reason)
        setReason("")
    }

    const handleCancel = () => {
        setReason("")
        onCancel()
    }

    return (
        <Modal
        open={open}
        onClose={handleCancel}
        title="Reject Application"
        children={
            <div className="flex flex-col gap-4">
            <p className="text-[#1A0008] text-sm">
                Please provide a reason for rejecting{" "}
                <span className="font-semibold">{target?.student.fullName}</span>'s application.
            </p>

            <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Enter rejection reason..."
                rows={4}
                className="w-full border border-[#F5ECF0] rounded-xl p-3 text-sm text-[#1A0008] placeholder:text-[#C8B0B8] resize-none focus:outline-none focus:border-[#6B0F2B]"
            />

            <div className="flex flex-row justify-end gap-3">
                <Button variant="secondary" onClick={handleCancel}>
                Cancel
                </Button>
                <Button
                variant="reddishPink"
                disabled={!reason.trim()}
                onClick={handleConfirm}
                >
                Confirm Reject
                </Button>
            </div>
            </div>
        }
        />
    )
}

export default function Applications({ data, className="" }: any) {
    const navigate = useNavigate()
    const [selectedApplication, setSelectedApplication] = useState<Application | null>(null)

    //avatar initials from name
    const getInitials = (name: string) => name[0]

    const [rejectionTarget, setRejectionTarget] = useState<Application | null>(null)

    return(
        <>
        <RejectionModal
            open={!!rejectionTarget}
            target={rejectionTarget}
            onCancel={() => setRejectionTarget(null)}
            onConfirm={(reason) => {
                console.log("Rejected:", rejectionTarget, "Reason:", reason)
                setRejectionTarget(null)
            }}
        />
        <Modal 
            open={!!selectedApplication}
            onClose={() => setSelectedApplication(null)}
            title="Application"
            maxWidth={900}
            maxHeight={700}
            children={
                selectedApplication && (
                <Card 
                    children={
                    <div className="flex flex-col gap-6">

                        {/* Header */}
                        <div className="flex flex-row justify-between items-start">
                            <div className="flex flex-col">
                                <p className="text-[#1A0008] font-bold text-xl">
                                    {selectedApplication.student.fullName}
                                </p>
                                <p className="text-[#C8B0B8] text-xs mt-1">
                                    Date Applied: {selectedApplication.applicationDate}
                                </p>
                            </div>
                            <StatusBadge status={selectedApplication.applicationStatus} />
                        </div>

                        {/* Applicant Details + Occupancy Details */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border border-[#F5ECF0] rounded-xl p-4">
                            {/* Applicant Details */}
                            <div className="col-span-1 sm:border-r border-[#F5ECF0] sm:pr-4">
                                <p className="flex flex-row gap-2 items-center font-semibold text-[#1A0008] mb-3">
                                    <IoPersonSharp size={18} color="#6B0F2B" />
                                    Applicant Details
                                </p>
                                <div className="grid grid-cols-2 gap-y-3">
                                    <div className="col-span-2">
                                        <p className="text-[#9A7080] text-[10px] uppercase font-semibold tracking-wide">Email</p>
                                        <p className="text-[#1A0008] text-sm break-all">{selectedApplication.student.email}</p>
                                    </div>
                                    <div className="col-span-1">
                                        <p className="text-[#9A7080] text-[10px] uppercase font-semibold tracking-wide">Year Level</p>
                                        <p className="text-[#1A0008] text-sm">{selectedApplication.student.yearLevel}</p>
                                    </div>
                                    <div className="col-span-1">
                                        <p className="text-[#9A7080] text-[10px] uppercase font-semibold tracking-wide">Phone Number</p>
                                        <p className="text-[#1A0008] text-sm">{selectedApplication.student.phone}</p>
                                    </div>
                                    <div className="col-span-2">
                                        <p className="text-[#9A7080] text-[10px] uppercase font-semibold tracking-wide">Degree Program</p>
                                        <p className="text-[#1A0008] text-sm">{selectedApplication.student.course}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Occupancy Details */}
                            <div className="col-span-1 sm:pl-2">
                                <p className="flex flex-row gap-2 items-center font-semibold text-[#1A0008] mb-3">
                                    <IoCalendarSharp size={18} color="#6B0F2B" />
                                    Occupancy Details
                                </p>
                                <div className="flex flex-col gap-3">
                                    <div>
                                        <p className="text-[#9A7080] text-[10px] uppercase font-semibold tracking-wide">Semester</p>
                                        <p className="text-[#1A0008] text-sm">Semester 2, AY 2025-2026</p>
                                    </div>
                                    <div>
                                        <p className="text-[#9A7080] text-[10px] uppercase font-semibold tracking-wide">Duration</p>
                                        <p className="text-[#1A0008] text-sm">
                                            {selectedApplication.durationOfStayDays} day{selectedApplication.durationOfStayDays !== 1 ? "s" : ""}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Room Preference + Uploaded Documents */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border border-[#F5ECF0] rounded-xl p-4">
                            {/* Room Preference */}
                            <div className="col-span-1 sm:border-r border-[#F5ECF0] sm:pr-4">
                                <p className="flex flex-row gap-2 items-center font-semibold text-[#1A0008] mb-3">
                                    <IoBedSharp size={18} color="#6B0F2B" />
                                    Room Preference
                                </p>
                                <div className="grid grid-cols-2 gap-y-3">
                                    <div className="col-span-1">
                                        <p className="text-[#9A7080] text-[10px] uppercase font-semibold tracking-wide">Stay</p>
                                        <p className="text-[#1A0008] text-sm capitalize">
                                            {selectedApplication.stayType === "non-transient" ? "Non-Transient" : "Transient"}
                                        </p>
                                    </div>
                                    <div className="col-span-1">
                                        <p className="text-[#9A7080] text-[10px] uppercase font-semibold tracking-wide">Building</p>
                                        <p className="text-[#1A0008] text-sm">{selectedApplication.accommodation.building}</p>
                                    </div>
                                    <div className="col-span-1">
                                        <p className="text-[#9A7080] text-[10px] uppercase font-semibold tracking-wide">Room Type</p>
                                        <p className="text-[#1A0008] text-sm capitalize">{selectedApplication.roomType}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Uploaded Documents */}
                            <div className="col-span-1 sm:pl-2">
                                <p className="flex flex-row gap-2 items-center font-semibold text-[#1A0008] mb-3">
                                    <IoDocumentSharp size={18} color="#6B0F2B" />
                                    Uploaded Documents
                                </p>
                                <div className="flex flex-col gap-2">
                                {[
                                    { label: "FORM 5", icon: <IoDocumentTextSharp size={16} color="white" /> },
                                    { label: "VALID ID", icon: <IoIdCardSharp size={16} color="white" /> },
                                ].map((doc) => (
                                    <div key={doc.label} className="flex flex-row items-center justify-between">
                                        <div className="flex flex-row items-center gap-2">
                                            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                                                style={{ background: "linear-gradient(135deg, #6B0F2B, #9E2040)" }}>
                                                {doc.icon}
                                            </div>
                                            <p className="text-[#1A0008] text-xs font-semibold">{doc.label}</p>
                                        </div>
                                        <Button variant="reddishPink" size="sm">View</Button>
                                    </div>
                                ))}
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-row justify-end gap-3 pt-1">
                            <Button variant="primary" onClick={() => {
                                setSelectedApplication(null); 
                                //update this from backend
                                console.log("Accepted", selectedApplication
                            )}}>
                                Accept
                            </Button>
                            <Button variant="secondary" onClick={() => {
                                setSelectedApplication(null)
                                setTimeout(() => setRejectionTarget(selectedApplication), 500)
                            }}>
                                Reject
                            </Button>
                        </div>

                    </div>
                    }
                />
                )
            }
            />
        <Card 
            className={className}
            children= {
                <div className="w-full h-full flex flex-col min-w-0">
                    <div className="flex flex-row justify-between w-full pb-2 border-b border-[#F5ECF0]">
                        <p className="text-[#1A0008] font-bold">
                            Applications
                        </p>
                        <p className="text-[#6B0F2B] font-bold text-sm hover:underline cursor-pointer" onClick={() => navigate("/manager/applications")}>
                            View all →
                        </p>
                    </div>
                    <div className="overflow-x-auto -mx-0">
                        <div className="min-w-[650px] pb-3 lg:pb-0">
                            <div className="grid grid-cols-5 border-b border-[#F5ECF0] uppercase"
                                style={{ gridTemplateColumns: "2fr 1.0fr 2fr 1.5fr 2fr" }}
                            >
                                <p className="col-span-2 text-[#9A7080] text-xs font-bold p-1">
                                    Student
                                </p>
                                <p className="col-span-1 text-[#9A7080] text-xs font-bold p-1">
                                    Preferred Facility
                                </p>
                                <p className="col-span-1 text-[#9A7080] text-xs font-bold p-1">
                                    Date Applied
                                </p>
                                <p className="col-span-1 text-center text-[#9A7080] text-xs font-bold p-1">
                                    Action
                                </p>
                            </div>
                            <div className="grid grid-cols-5">
                            {data.map((application: Application, i:number) => (
                                    <div key={i} className="col-span-5 grid grid-cols-5 mt-3"
                                        style={{ gridTemplateColumns: "2fr 1.0fr 2fr 1.5fr 2fr" }}
                                    >
                                        <div className="col-span-2 flex flex-row items-center">
                                            <div className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center text-white text-xs font-bold"
                                                style={{ background: "linear-gradient(135deg, #6B0F2B, #9E2040)" }}>
                                                {getInitials(application.student.fullName)}
                                            </div>
                                            <p className="text-black text-sm pl-2">
                                                {application.student.fullName}
                                            </p>
                                        </div>
                                        <div className="flex flex-col px-1">
                                            <p className="col-span-1 text-[#1A0008] text-sm">
                                                {application.accommodation.building}
                                            </p>
                                            <p className="col-span-1 text-[#9A7080] text-xs">
                                                {application.type}
                                            </p>
                                        </div>
                                        <p className="col-span-1 text-[#9A7080] text-sm p-1 flex items-center">
                                            {application.applicationDate}
                                        </p>
                                        <div className="col-span-1 flex items-center justify-center">
                                            <Button variant="reddishPink" size="sm" onClick={() => setSelectedApplication(application)}>
                                                Review
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            }
        />
        </>
    )
}
