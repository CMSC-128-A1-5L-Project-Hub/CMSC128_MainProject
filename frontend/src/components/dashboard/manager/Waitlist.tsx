import { useState } from "react"
import { useNavigate } from "react-router-dom"
import Button from "../../Button"
import Modal from "../../Modal"
import Card from "../../ui/Card"
import StatusBadge from "../../ui/StatusBadge"
import type { Status } from "../../ui/StatusBadge"
import { IoPersonSharp, IoCalendarSharp, IoBedSharp, IoDocumentSharp, IoDocumentTextSharp, IoIdCardSharp } from "react-icons/io5"
import type { TransformedApp } from "../../../stores/useDashboardStore"

type Props = {
  waitlists: TransformedApp[]
  className?: string
}

export default function Waitlist({ waitlists, className = "" }: Props) {
  const navigate = useNavigate()
  const [selectedApplication, setSelectedApplication] = useState<TransformedApp | null>(null)
  const [modalWaitlist, setModalWaitlist] = useState<TransformedApp | null>(null)

  const getInitials = (name: string) => name[0]

  const openModal = (app: TransformedApp) => {
    setModalWaitlist(app)
    setSelectedApplication(app)
  }

  const closeModal = () => {
    setSelectedApplication(null)
  }

  return (
    <>
      <Modal open={!!selectedApplication} onClose={closeModal} title="Application" maxWidth={900} maxHeight={650}>
        {modalWaitlist && (
          <Card>
            <div className="flex flex-col gap-6">
              <div className="flex flex-row justify-between items-start">
                <div className="flex flex-col">
                  <p className="text-[#1A0008] font-bold text-xl">{modalWaitlist.student.fullName}</p>
                  <p className="text-[#C8B0B8] text-xs mt-1">Date Applied: {modalWaitlist.applicationDate}</p>
                </div>
                <StatusBadge status={modalWaitlist.applicationStatus as Status} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border border-[#F5ECF0] rounded-xl p-4">
                <div className="col-span-1 sm:border-r border-[#F5ECF0] sm:pr-4">
                  <p className="flex flex-row gap-2 items-center font-semibold text-[#1A0008] mb-3"><IoPersonSharp size={18} color="#6B0F2B" /> Applicant Details</p>
                  <div className="grid grid-cols-2 gap-y-3">
                    <div className="col-span-2"><p className="text-[#9A7080] text-[10px] uppercase font-semibold tracking-wide">Email</p><p className="text-[#1A0008] text-sm break-all">{modalWaitlist.student.email}</p></div>
                    <div><p className="text-[#9A7080] text-[10px] uppercase font-semibold tracking-wide">Year Level</p><p className="text-[#1A0008] text-sm">{modalWaitlist.student.yearLevel}</p></div>
                    <div><p className="text-[#9A7080] text-[10px] uppercase font-semibold tracking-wide">Phone</p><p className="text-[#1A0008] text-sm">{modalWaitlist.student.phone}</p></div>
                    <div className="col-span-2"><p className="text-[#9A7080] text-[10px] uppercase font-semibold tracking-wide">Degree Program</p><p className="text-[#1A0008] text-sm">{modalWaitlist.student.course}</p></div>
                  </div>
                </div>
                <div className="col-span-1 sm:pl-2">
                  <p className="flex flex-row gap-2 items-center font-semibold text-[#1A0008] mb-3"><IoCalendarSharp size={18} color="#6B0F2B" /> Occupancy Details</p>
                  <div className="flex flex-col gap-3">
                    <div><p className="text-[#9A7080] text-[10px] uppercase font-semibold tracking-wide">Semester</p><p className="text-[#1A0008] text-sm">Semester 2, AY 2025-2026</p></div>
                    <div><p className="text-[#9A7080] text-[10px] uppercase font-semibold tracking-wide">Duration</p><p className="text-[#1A0008] text-sm">{modalWaitlist.durationOfStayDays} day{modalWaitlist.durationOfStayDays !== 1 ? "s" : ""}</p></div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border border-[#F5ECF0] rounded-xl p-4">
                <div className="col-span-1 sm:border-r border-[#F5ECF0] sm:pr-4">
                  <p className="flex flex-row gap-2 items-center font-semibold text-[#1A0008] mb-3"><IoBedSharp size={18} color="#6B0F2B" /> Room Preference</p>
                  <div className="grid grid-cols-2 gap-y-3">
                    <div><p className="text-[#9A7080] text-[10px] uppercase font-semibold tracking-wide">Stay</p><p className="text-[#1A0008] text-sm capitalize">{modalWaitlist.stayType === "non-transient" ? "Non-Transient" : "Transient"}</p></div>
                    <div><p className="text-[#9A7080] text-[10px] uppercase font-semibold tracking-wide">Building</p><p className="text-[#1A0008] text-sm">{modalWaitlist.accommodation.building}</p></div>
                    <div><p className="text-[#9A7080] text-[10px] uppercase font-semibold tracking-wide">Room Type</p><p className="text-[#1A0008] text-sm capitalize">{modalWaitlist.roomType}</p></div>
                  </div>
                </div>
                <div className="col-span-1 sm:pl-2">
                  <p className="flex flex-row gap-2 items-center font-semibold text-[#1A0008] mb-3"><IoDocumentSharp size={18} color="#6B0F2B" /> Uploaded Documents</p>
                  <div className="flex flex-col gap-2">
                    {[{ label: "FORM 5", icon: <IoDocumentTextSharp size={16} color="white" /> }, { label: "VALID ID", icon: <IoIdCardSharp size={16} color="white" /> }].map((doc) => (
                      <div key={doc.label} className="flex flex-row items-center justify-between">
                        <div className="flex flex-row items-center gap-2">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, #6B0F2B, #9E2040)" }}>{doc.icon}</div>
                          <p className="text-[#1A0008] text-xs font-semibold">{doc.label}</p>
                        </div>
                        <Button variant="reddishPink" size="sm">View</Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}
      </Modal>

      <Card className={className}>
        <div className="w-full h-full flex flex-col min-w-0">
          <div className="flex flex-row justify-between w-full pb-2 border-b border-[#F5ECF0]">
            <p className="text-[#1A0008] font-bold">Waitlist</p>
            <p className="text-[#6B0F2B] font-bold text-sm hover:underline cursor-pointer" onClick={() => navigate("/manager/waitlist")}>View all →</p>
          </div>
          <div className="grid grid-cols-3 border-b border-[#F5ECF0] uppercase">
            <p className="col-span-2 text-[#9A7080] text-xs font-bold p-1">Student</p>
            <p className="col-span-1 text-center text-[#9A7080] text-xs font-bold p-1">Action</p>
          </div>
          {waitlists.length > 0 ? (
            <div className="grid grid-cols-3">
              {waitlists.map((waitlist, i) => (
                <div key={i} className="col-span-3 grid grid-cols-3 flex justify-between items-center py-2 px-1">
                  <div className="col-span-2 flex flex-row items-center">
                    <div className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center text-white text-xs font-bold"
                         style={{ background: "linear-gradient(135deg, #6B0F2B, #9E2040)" }}>
                      {getInitials(waitlist.student.fullName)}
                    </div>
                    <p className="text-sm text-[#1A0008] pl-2 truncate min-w-0">{waitlist.student.fullName}</p>
                  </div>
                  <div className="col-span-1 flex items-center justify-center">
                    <Button variant="reddishPink" size="sm" onClick={() => openModal(waitlist)}>Review</Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex-1 flex justify-center items-center py-4 italic text-gray-500">Nothing to see here</div>
          )}
        </div>
      </Card>
    </>
  )
}