import { useState } from "react"
import { useNavigate } from "react-router-dom"

import Button from "../../Button"
import Modal from "../../Modal"
import Card from "../../ui/Card"

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

type Assignment = {
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

const availableRooms: Room[] = [
    { roomNumber: "204", roomType: "shared",  roomBuilding: "Building 6", roomCapacity: 4, roomCurrentOccupancy: 1, roomRent: 3200 },
    { roomNumber: "210", roomType: "shared",  roomBuilding: "Building 3", roomCapacity: 4, roomCurrentOccupancy: 2, roomRent: 3200 },
    { roomNumber: "221", roomType: "shared",  roomBuilding: "Building 5", roomCapacity: 4, roomCurrentOccupancy: 2, roomRent: 3200 },
    { roomNumber: "105", roomType: "single",  roomBuilding: "Building 1", roomCapacity: 1, roomCurrentOccupancy: 0, roomRent: 4500 },
    { roomNumber: "312", roomType: "double",  roomBuilding: "Building 4", roomCapacity: 2, roomCurrentOccupancy: 1, roomRent: 3800 },
]

export default function ConfirmedStudents({ data, className = "" }: { data: Assignment[], className: string }) {
    const navigate = useNavigate()
    const getInitials = (name: string) => name[0]

    const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null)

    const timeAgo = (dateStr: string): string => {
        const date = new Date(dateStr)
        const now = new Date()
        const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

        const intervals = [
            { label: "year",   seconds: 31536000 },
            { label: "month",  seconds: 2592000  },
            { label: "week",   seconds: 604800   },
            { label: "day",    seconds: 86400    },
            { label: "hour",   seconds: 3600     },
            { label: "minute", seconds: 60       },
        ]

        for (const interval of intervals) {
            const count = Math.floor(seconds / interval.seconds)
            if (count >= 1) return `${count} ${interval.label}${count !== 1 ? "s" : ""} ago`
        }

        return "Just now"
    }

    const filteredRooms = selectedAssignment
        ? availableRooms.filter((r) => r.roomType.toLowerCase() === selectedAssignment.roomType.toLowerCase())
        : availableRooms

    return (
        <>
            <Modal
                open={!!selectedAssignment}
                onClose={() => setSelectedAssignment(null)}
                title="Room Assignment"
                maxWidth={700}
                maxHeight={600}
                children={
                    selectedAssignment && (
                        <Card
                            children={
                                <div className="flex flex-col gap-4">

                                    {/* Header */}
                                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                                        <div className="flex flex-col">
                                            <p className="text-[#1A0008] font-bold text-xl">
                                                {selectedAssignment.student.student.fullName}
                                            </p>
                                            <p className="text-[#C8B0B8] text-xs mt-1">
                                                Select a room to assign
                                            </p>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[#9A7080] text-[10px] uppercase font-semibold tracking-wide">Room Type</span>
                                            <span className="text-[#1A0008] text-sm font-semibold capitalize">{selectedAssignment.roomType}</span>
                                        </div>
                                    </div>

                                    {/* Room List */}
                                    <div className="flex flex-col gap-3">
                                        {filteredRooms.length > 0 ? filteredRooms.map((room, i) => (
                                            <div key={i} className="flex flex-col sm:flex-row sm:items-center gap-3 border border-[#F5ECF0] rounded-xl p-3 sm:p-4">
                                                <div className="flex flex-col items-start gap-1 min-w-[120px]">
                                                    <div className="px-4 py-2 rounded-full text-white text-sm font-extrabold uppercase tracking-wide"
                                                        style={{ background: "linear-gradient(135deg, #6B0F2B, #9E2040)" }}>
                                                        ROOM {room.roomNumber}
                                                    </div>
                                                    <p className="text-[#1A0008] text-sm font-medium pl-1">{room.roomBuilding}</p>
                                                </div>
                                                <div className="hidden sm:block w-px self-stretch bg-[#F5ECF0]" />
                                                <div className="flex flex-col gap-1 flex-1">
                                                    <p className="text-[#1A0008] text-sm break-words">
                                                        Type : <span className="font-semibold capitalize">{room.roomType}</span>
                                                    </p>
                                                    <p className="text-[#1A0008] text-sm break-words">
                                                        Price : <span className="font-semibold">₱{room.roomRent.toLocaleString()} / month</span>
                                                    </p>
                                                    <p className="text-[#1A0008] text-sm break-words">
                                                        Occupants : <span className="font-semibold">{room.roomCurrentOccupancy}/{room.roomCapacity}</span>
                                                    </p>
                                                </div>
                                                <Button
                                                    variant="reddishPink"
                                                    size="sm"
                                                    onClick={() => {
                                                        console.log("Assigned", selectedAssignment.student.student.fullName, "to Room", room.roomNumber)
                                                        setSelectedAssignment(null)
                                                    }}
                                                    className="w-full sm:w-auto"
                                                >
                                                    Assign Room
                                                </Button>
                                            </div>
                                        )) : (
                                            <div className="flex justify-center items-center py-6 italic text-gray-400 text-sm">
                                                No available rooms for this room type
                                            </div>
                                        )}
                                    </div>

                                </div>
                            }
                        />
                    )
                }
            />
            <div className={className}>
                <div className="bg-white border border-[#E8D0D8] rounded-xl p-3 lg:p-4 shadow-sm w-full h-full flex flex-col">
                    <div className="flex flex-row justify-between w-full pb-2 border-b border-[#F5ECF0]">
                        <p className="text-[#1A0008] font-bold">
                            Confirmed Students
                        </p>
                        <p className="text-[#6B0F2B] font-bold text-sm hover:underline cursor-pointer" onClick={() => navigate("/manager/assignments")}>
                            View all →
                        </p>
                    </div>
                    <div className="overflow-y-auto -mx-0">
                        <div className="min-w-[680px] pb-3 lg:pb-0 px-1">
                            <div className="grid grid-cols-5 border-b border-[#F5ECF0] uppercase"
                                style={{ gridTemplateColumns: "2fr 1.5fr 1fr 1.5fr 1.5fr" }}
                            >
                                <p className="col-span-1 text-[#9A7080] text-xs font-bold p-1">Student</p>
                                <p className="col-span-1 px-2 text-[#9A7080] text-xs font-bold p-1">Room</p>
                                <p className="col-span-1 px-2 text-[#9A7080] text-xs font-bold p-1">Move-in</p>
                                <p className="col-span-1 px-2 text-center text-[#9A7080] text-xs font-bold p-1">Status</p>
                                <p className="col-span-1 px-2 text-center text-[#9A7080] text-xs font-bold p-1">Action</p>
                            </div>
                            {data.length > 0 ? (
                                <div className="flex flex-col">
                                    {data.map((assignment: Assignment, i: number) => (
                                        <div key={i} className="grid grid-cols-5 items-center mt-3"
                                            style={{ gridTemplateColumns: "2fr 1.5fr 1fr 1.5fr 1.5fr" }}
                                        >
                                            <div className="col-span-1 flex flex-row items-center">
                                                <div className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center text-white text-xs font-bold"
                                                    style={{ background: "linear-gradient(135deg, #6B0F2B, #9E2040)" }}>
                                                    {getInitials(assignment.student.student.fullName)}
                                                </div>
                                                <p className="text-black text-sm pl-2">
                                                    {assignment.student.student.fullName}
                                                </p>
                                            </div>
                                            <div className="flex flex-col px-2">
                                                <p className="text-[#1A0008] text-sm">Room {assignment.roomNumber}</p>
                                                <p className="text-[#9A7080] text-xs">{assignment.roomBuilding} · {assignment.roomType}</p>
                                            </div>
                                            <div className="flex flex-col px-2">
                                                <p className="text-[#1A0008] text-sm">{assignment.moveIn}</p>
                                                <p className="text-[#9A7080] text-xs">{timeAgo(assignment.moveIn)}</p>
                                            </div>
                                            <div className="col-span-1 px-2 flex justify-center items-center">
                                                <span className={`inline-flex items-center justify-center gap-1 text-xs px-2 py-1.5 w-full max-w-[110px] rounded-full font-bold capitalize
                                                    ${assignment.status === "not assigned" ? "bg-[#9E2040]/10 text-[#9E2040]" : "bg-[#1A7A4A]/10 text-[#1A7A4A]"}`}>
                                                    <span className={`w-2 h-2 rounded-full ${assignment.status === "not assigned" ? "bg-[#9E2040]" : "bg-[#1A7A4A]"}`} />
                                                    {assignment.status}
                                                </span>
                                            </div>
                                            <div className="col-span-1 px-2 flex justify-center items-center">
                                                <Button
                                                    variant="reddishPink"
                                                    size="sm"
                                                    onClick={() => setSelectedAssignment(assignment)}
                                                >
                                                    Assign Room
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex-1 flex justify-center items-center py-4 italic text-gray-500">
                                    Nothing to see here
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}