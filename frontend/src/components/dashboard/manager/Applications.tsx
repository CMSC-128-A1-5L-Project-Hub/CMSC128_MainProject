import { useState } from "react"
import { useNavigate } from "react-router-dom"
import Button from "../../Button"
import Card from "../../ui/Card"
import Modal from "../../Modal"
import StatusBadge from "../../ui/StatusBadge"
import type { Status } from "../../ui/StatusBadge"
import {
  IoPersonSharp, IoCalendarSharp, IoBedSharp,
  IoDocumentSharp, IoDocumentTextSharp, IoIdCardSharp,
} from "react-icons/io5"
import { api } from "../../../api/axios"
import type { TransformedApp } from "../../../stores/useDashboardStore"

type Props = {
  data: TransformedApp[]
  className?: string
  onAction: () => void
}

type RejectionModalProps = {
  open: boolean
  target: TransformedApp | null
  loading: boolean
  onCancel: () => void
  onConfirm: (reason: string) => void
}

//moved rejectionModal outside of Application function to prevent React from rendering both modals (view and this)
function RejectionModal({ open, target, loading, onCancel, onConfirm }: RejectionModalProps) {
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
    <Modal open={open} onClose={handleCancel} title="Reject Application">
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
          <Button variant="secondary" onClick={handleCancel} disabled={loading}>Cancel</Button>
          <Button variant="reddishPink" disabled={!reason.trim() || loading} onClick={handleConfirm}>
            {loading ? 'Processing…' : 'Confirm Reject'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default function Applications({ data, className = "", onAction }: Props) {
  const navigate = useNavigate()
  const [selectedApplication, setSelectedApplication] = useState<TransformedApp | null>(null)
  const [modalApplication, setModalApplication] = useState<TransformedApp | null>(null)
  const [rejectionTarget, setRejectionTarget] = useState<TransformedApp | null>(null)
  const [loading, setLoading] = useState(false)

  const getInitials = (name: string) => name?.trim()?.[0]?.toUpperCase() ?? "?"

  const openModal = (app: TransformedApp) => {
    setModalApplication(app)
    setSelectedApplication(app)
  }

  const closeModal = () => {
    setSelectedApplication(null)
  }

  const firstPendingIndex = data.findIndex(app => app.applicationStatus === 'pending')
  const isModalActionable = firstPendingIndex !== -1 && modalApplication?.id === data[firstPendingIndex]?.id

  const handleAccept = async () => {
    if (!modalApplication || loading) return
    setLoading(true)
    try {
      const res = await api.patch(`/applications/${modalApplication.id}/review`, { action: 'approve' })
      if (res.status === 200) {
        closeModal()
        onAction()
      }
    } catch (e) {
      console.error(e)
      alert('Network error')
    } finally {
      setLoading(false)
    }
  }

  const handleReject = async (reason: string) => {
    if (!rejectionTarget || loading) return
    setLoading(true)
    try {
      await api.patch(`/applications/${rejectionTarget.id}/review`, { action: 'reject', rejection_reason: reason })
      setRejectionTarget(null)
      onAction()
    } catch (e) {
      console.error(e)
      alert('Network error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <RejectionModal
        open={!!rejectionTarget}
        target={rejectionTarget}
        loading={loading}
        onCancel={() => {
          //modified to go back to previous modal when cancelled
          const application = rejectionTarget
          setRejectionTarget(null)
          setTimeout(() => openModal(application!), 150)
        }}
        onConfirm={handleReject}
      />

      <Modal open={!!selectedApplication} onClose={closeModal} title="Application" maxWidth={900} maxHeight={800}>
        {modalApplication && (
          <Card>
            <div className="flex flex-col gap-6">
              <div className="flex flex-row justify-between items-start">
                <div className="flex flex-col">
                  <p className="text-[#1A0008] font-bold text-xl">{modalApplication.student.fullName}</p>
                  <p className="text-[#C8B0B8] text-xs mt-1">Date Applied: {modalApplication.applicationDate}</p>
                </div>
                <StatusBadge status={modalApplication.applicationStatus as Status} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border border-[#F5ECF0] rounded-xl p-4">
                <div className="col-span-1 sm:border-r border-[#F5ECF0] sm:pr-4">
                  <p className="flex flex-row gap-2 items-center font-semibold text-[#1A0008] mb-3">
                    <IoPersonSharp size={18} color="#6B0F2B" /> Applicant Details
                  </p>
                  <div className="grid grid-cols-2 gap-y-3">
                    <div className="col-span-2">
                      <p className="text-[#9A7080] text-[10px] uppercase font-semibold tracking-wide">Email</p>
                      <p className="text-[#1A0008] text-sm break-all">{modalApplication.student.email}</p>
                    </div>
                    <div>
                      <p className="text-[#9A7080] text-[10px] uppercase font-semibold tracking-wide">Year Level</p>
                      <p className="text-[#1A0008] text-sm">{modalApplication.student.yearLevel}</p>
                    </div>
                    <div>
                      <p className="text-[#9A7080] text-[10px] uppercase font-semibold tracking-wide">Phone</p>
                      <p className="text-[#1A0008] text-sm">{modalApplication.student.phone}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-[#9A7080] text-[10px] uppercase font-semibold tracking-wide">Degree Program</p>
                      <p className="text-[#1A0008] text-sm">{modalApplication.student.course}</p>
                    </div>
                  </div>
                </div>

                <div className="col-span-1 sm:pl-2">
                  <p className="flex flex-row gap-2 items-center font-semibold text-[#1A0008] mb-3">
                    <IoCalendarSharp size={18} color="#6B0F2B" /> Occupancy Details
                  </p>
                  <div className="flex flex-col gap-3">
                    <div>
                      <p className="text-[#9A7080] text-[10px] uppercase font-semibold tracking-wide">Semester</p>
                      <p className="text-[#1A0008] text-sm">Semester 2, AY 2025-2026</p>
                    </div>
                    <div>
                      <p className="text-[#9A7080] text-[10px] uppercase font-semibold tracking-wide">Duration</p>
                      <p className="text-[#1A0008] text-sm">{modalApplication.durationOfStayDays} day{modalApplication.durationOfStayDays !== 1 ? "s" : ""}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border border-[#F5ECF0] rounded-xl p-4">
                <div className="col-span-1 sm:border-r border-[#F5ECF0] sm:pr-4">
                  <p className="flex flex-row gap-2 items-center font-semibold text-[#1A0008] mb-3">
                    <IoBedSharp size={18} color="#6B0F2B" /> Room Preference
                  </p>
                  <div className="grid grid-cols-2 gap-y-3">
                    <div>
                      <p className="text-[#9A7080] text-[10px] uppercase font-semibold tracking-wide">Stay</p>
                      <p className="text-[#1A0008] text-sm capitalize">
                        {modalApplication.stayType === "non-transient" ? "Non-Transient" : "Transient"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[#9A7080] text-[10px] uppercase font-semibold tracking-wide">Building</p>
                      <p className="text-[#1A0008] text-sm">{modalApplication.accommodation.building}</p>
                    </div>
                    <div>
                      <p className="text-[#9A7080] text-[10px] uppercase font-semibold tracking-wide">Room Type</p>
                      <p className="text-[#1A0008] text-sm capitalize">{modalApplication.roomType}</p>
                    </div>
                  </div>
                </div>

                <div className="col-span-1 sm:pl-2">
                  <p className="flex flex-row gap-2 items-center font-semibold text-[#1A0008] mb-3">
                    <IoDocumentSharp size={18} color="#6B0F2B" /> Uploaded Documents
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
                        <Button variant="reddishPink" size="sm" onClick={async () => {
                          if (doc.label === "FORM 5") {
                            try {
                              const res = await api.get(`/applications/${modalApplication.id}/enrollment-proof`)
                              if (res.status === 200) {
                                window.open(res.data.url, '_blank')
                              } else {
                                alert('Enrollment proof not available')
                              }
                            } catch (err) {
                              console.error(err)
                              alert('Could not fetch document')
                            }
                          } else {
                            alert('Valid ID not yet uploaded')
                          }
                        }}>View</Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {modalApplication.applicationStatus === 'pending' && (
                isModalActionable ? (
                  <div className="flex flex-row justify-end gap-3 pt-1">
                    <Button variant="primary" onClick={handleAccept} disabled={loading}>
                      {loading ? 'Processing…' : 'Accept'}
                    </Button>
                    <Button variant="secondary" onClick={() => { 
                      //modified to store target application to allow for backtracking to prev modal
                      const target = modalApplication
                      closeModal(); 
                      setTimeout(() => setRejectionTarget(target), 150) 
                    }} disabled={loading}>
                      Reject
                    </Button>
                  </div>
                ) : (
                  <p className="text-sm text-[#9A7080] italic text-center">
                    You must process earlier applications first.
                  </p>
                )
              )}
            </div>
          </Card>
        )}
      </Modal>

      {/* Table View */}
      <Card className={className}>
        <div className="w-full h-full flex flex-col min-w-0">
          <div className="flex flex-row justify-between w-full pb-2 border-b border-[#F5ECF0]">
            <p className="text-[#1A0008] font-bold">Applications</p>
            <p className="text-[#6B0F2B] font-bold text-sm hover:underline cursor-pointer" onClick={() => navigate("/manager/applications")}>
              View all →
            </p>
          </div>
          <div className="overflow-x-auto -mx-0">
            <div className="min-w-[600px] pb-3 xl:pb-0">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#F5ECF0] uppercase">
                    <th className="text-[#9A7080] tracking-widest text-xs font-bold p-1 text-left w-[30%]">Student</th>
                    <th className="text-[#9A7080] tracking-widest text-xs font-bold p-1 text-left w-[30%]">Preferred Facility</th>
                    <th className="text-[#9A7080] tracking-widest text-xs font-bold p-1 text-left w-[25%]">Date Applied</th>
                    <th className="text-[#9A7080] tracking-widest text-xs font-bold p-1 text-center w-[15%]">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {data.length > 0 ? (
                    data.map((application, idx) => (
                      <tr key={idx} className="mt-3">
                        <td className="p-1 py-2">
                          <div className="flex flex-row items-center">
                            <div className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center text-white text-xs font-bold"
                                style={{ background: "linear-gradient(135deg, #6B0F2B, #9E2040)" }}>
                              {getInitials(application.student.fullName)}
                            </div>
                            <p className="text-black text-sm pl-2 truncate">{application.student.fullName}</p>
                          </div>
                        </td>
                        <td className="p-1 py-2">
                          <p className="text-[#1A0008] text-sm">{application.accommodation.building}</p>
                          <p className="text-[#9A7080] text-xs capitalize">{application.stayType}</p>
                        </td>
                        <td className="p-1 py-2">
                          <p className="text-[#9A7080] text-sm">{application.applicationDate}</p>
                        </td>
                        <td className="p-1 py-2 text-center">
                          <Button variant="reddishPink" size="sm" onClick={() => openModal(application)}>
                            Review
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="text-center py-4 italic text-gray-500">Nothing to see here</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </Card>
    </>
  )
}