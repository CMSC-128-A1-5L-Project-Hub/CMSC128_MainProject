import { useState } from "react"
import { useNavigate } from "react-router-dom"

import Button from "../../Button"
import Modal from "../../Modal"
import Card from "../../ui/Card"

import {
    IoPersonSharp,
    IoCalendarSharp,
    IoBedSharp,
} from "react-icons/io5"

type Move = {
    studentName: string
    room: string
    building: string
    roomType: string
    stayType: string
    type: string
    date: string
}

export default function Moves({ data, className = "" }: { data: Move[], className?: string }) {  // ← Make className optional with ?
    const navigate = useNavigate()
    const getInitials = (name: string) => name[0]

    const [selectedMove, setSelectedMove] = useState<Move | null>(null)
    const [modalMove, setModalMove] = useState<Move | null>(null)

    const openModal = (move: Move) => {
        setModalMove(move)
        setSelectedMove(move)
    }

    const closeModal = () => {
        setSelectedMove(null)
    }

    return (
        <>
            <Modal
                open={!!selectedMove}
                onClose={closeModal}
                title="Move Details"
                eyebrow={selectedMove?.type === "move-out" ? "Move-Out" : "Move-In"}
                maxWidth={700}
                maxHeight={600}
                children={
                    modalMove && (
                        <Card
                            children={
                                <div className="flex flex-col gap-6">

                                    {/* Header */}
                                    <div className="flex flex-row justify-between items-start">
                                        <div className="flex flex-col">
                                            <p className="text-[#1A0008] font-bold text-xl">
                                                {modalMove.studentName}
                                            </p>
                                            <p className="text-[#C8B0B8] text-xs mt-1">
                                                Date: {modalMove.date}
                                            </p>
                                        </div>
                                        <span className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-bold capitalize
                                            ${modalMove.type === "move-out" ? "bg-[#9E2040]/10 text-[#9E2040]" : "bg-[#1A7A4A]/10 text-[#1A7A4A]"}`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${modalMove.type === "move-out" ? "bg-[#9E2040]" : "bg-[#1A7A4A]"}`} />
                                            {modalMove.type}
                                        </span>
                                    </div>

                                    {/* Student + Date Details */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border border-[#F5ECF0] rounded-xl p-4">
                                        {/* Student Details */}
                                        <div className="col-span-1 sm:border-r border-[#F5ECF0] sm:pr-4">
                                            <p className="flex flex-row gap-2 items-center font-semibold text-[#1A0008] mb-3">
                                                <IoPersonSharp size={18} color="#6B0F2B" />
                                                Student Details
                                            </p>
                                            <div className="flex flex-col gap-3">
                                                <div>
                                                    <p className="text-[#9A7080] text-[10px] uppercase font-semibold tracking-wide">Full Name</p>
                                                    <p className="text-[#1A0008] text-sm">{modalMove.studentName}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Date Details */}
                                        <div className="col-span-1 sm:pl-2">
                                            <p className="flex flex-row gap-2 items-center font-semibold text-[#1A0008] mb-3">
                                                <IoCalendarSharp size={18} color="#6B0F2B" />
                                                Schedule
                                            </p>
                                            <div className="flex flex-col gap-3">
                                                <div>
                                                    <p className="text-[#9A7080] text-[10px] uppercase font-semibold tracking-wide">Date</p>
                                                    <p className="text-[#1A0008] text-sm">{modalMove.date}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[#9A7080] text-[10px] uppercase font-semibold tracking-wide">Type</p>
                                                    <p className="text-[#1A0008] text-sm capitalize">{modalMove.type}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Room Details */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border border-[#F5ECF0] rounded-xl p-4">
                                        <div className="col-span-2 sm:pr-4">
                                            <p className="flex flex-row gap-2 items-center font-semibold text-[#1A0008] mb-3">
                                                <IoBedSharp size={18} color="#6B0F2B" />
                                                Room Details
                                            </p>
                                            <div className="grid grid-cols-2 gap-y-3">
                                                <div className="col-span-1">
                                                    <p className="text-[#9A7080] text-[10px] uppercase font-semibold tracking-wide">Room</p>
                                                    <p className="text-[#1A0008] text-sm">{modalMove.room}</p>
                                                </div>
                                                <div className="col-span-1">
                                                    <p className="text-[#9A7080] text-[10px] uppercase font-semibold tracking-wide">Building</p>
                                                    <p className="text-[#1A0008] text-sm">{modalMove.building}</p>
                                                </div>
                                                <div className="col-span-1">
                                                    <p className="text-[#9A7080] text-[10px] uppercase font-semibold tracking-wide">Room Type</p>
                                                    <p className="text-[#1A0008] text-sm capitalize">{modalMove.roomType}</p>
                                                </div>
                                                <div className="col-span-1">
                                                    <p className="text-[#9A7080] text-[10px] uppercase font-semibold tracking-wide">Stay Type</p>
                                                    <p className="text-[#1A0008] text-sm capitalize">{modalMove.stayType}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            }
                        />
                    )
                }
            />
            <div className={className}>
                <div className="bg-white border border-[#E8D0D8] rounded-xl p-3 lg:p-6 shadow-sm w-full h-full flex flex-col">
                    <div className="flex flex-row justify-between w-full pb-2 border-b border-[#F5ECF0]">
                        <p className="text-[#1A0008] font-bold">
                            Upcoming Move-ins & Move-outs
                        </p>
                        <p className="text-[#6B0F2B] font-bold text-sm hover:underline cursor-pointer" onClick={() => navigate("/manager/moves")}>
                            View all →
                        </p>
                    </div>
                    <div className="overflow-y-auto -mx-0">
                        <table className="w-full min-w-[780px] table-fixed">
                            <thead>
                                <tr className="border-b border-[#F5ECF0] uppercase">
                                    <th className="text-[#9A7080] text-xs font-bold py-1 text-left w-[22%]">Student</th>
                                    <th className="text-[#9A7080] text-xs font-bold py-1 text-left w-[15%]">Room</th>
                                    <th className="text-[#9A7080] text-xs font-bold py-1 text-left w-[16%]">Room Type</th>
                                    <th className="text-[#9A7080] text-xs font-bold py-1 text-left w-[16%]">Date</th>
                                    <th className="text-[#9A7080] text-xs font-bold py-1 text-center w-[16%]">Type</th>
                                    <th className="text-[#9A7080] text-xs font-bold py-1 text-center w-[15%]">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.length > 0 ? (
                                    data.map((move: Move, i: number) => (
                                        <tr key={i} className="border-b border-[#F5ECF0]/50 last:border-0">
                                            <td className="py-2 px-1">
                                                <div className="flex flex-row items-center">
                                                    <div className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center text-white text-xs font-bold"
                                                        style={{ background: "linear-gradient(135deg, #6B0F2B, #9E2040)" }}>
                                                        {getInitials(move.studentName)}
                                                    </div>
                                                    <p className="text-black text-sm pl-2 truncate">{move.studentName}</p>
                                                </div>
                                            </td>
                                            <td className="py-2">
                                                <p className="text-[#1A0008] text-sm">{move.room}</p>
                                                <p className="text-[#9A7080] text-xs">{move.building}</p>
                                            </td>
                                            <td className="py-2">
                                                <p className="text-[#1A0008] text-sm">{move.stayType}</p>
                                                <p className="text-[#9A7080] text-xs">{move.roomType}</p>
                                            </td>
                                            <td className="py-2">
                                                <p className="text-[#1A0008] text-sm">{move.date}</p>
                                            </td>
                                            <td className="py-2 text-center">
                                                <span className={`inline-flex items-center justify-center gap-1 text-xs px-2 py-1.5 rounded-full font-bold capitalize ${
                                                    move.type === "move-out" ? "bg-[#9E2040]/10 text-[#9E2040]" : "bg-[#1A7A4A]/10 text-[#1A7A4A]"
                                                }`}>
                                                    <span className={`w-2 h-2 rounded-full ${move.type === "move-out" ? "bg-[#9E2040]" : "bg-[#1A7A4A]"}`} />
                                                    {move.type}
                                                </span>
                                            </td>
                                            <td className="py-2 text-center">
                                                <Button variant="reddishPink" size="sm" className="px-6" onClick={() => openModal(move)}>
                                                    View
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="text-center py-4 italic text-gray-500">Nothing to see here</td>
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