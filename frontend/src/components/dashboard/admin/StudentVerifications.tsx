import { useState } from "react"
import Card from "@/components/ui/Card"
import { useNavigate } from "react-router-dom"
import StudentVerificationModal from "./StudentVerificationsModal"

type StudentVerificationsProps = {
  students: any[]
  isLoading: boolean
  processingUserId: number | null
  processingAction: "approve" | "reject" | null
  onApprove: (userId: number) => Promise<void>
  onReject: (userId: number) => Promise<void>
}

function InfoRow({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span
        className="text-[9px] font-bold tracking-[0.18em] uppercase text-[#9E2040]"
        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
      >
        {label}
      </span>
      <span
        className="text-[13px] font-semibold text-[#1A0A10]"
        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
      >
        {value ?? <span className="text-gray-400 font-normal italic">—</span>}
      </span>
    </div>
  )
}

export default function StudentVerifications({
  students,
  isLoading,
  processingUserId,
  processingAction,
  onApprove,
  onReject,
}: StudentVerificationsProps) {
  const navigate = useNavigate()
  const [selectedItem, setSelectedItem] = useState<any | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  const formatDate = (timestamp?: string) => {
    if (!timestamp) return "N/A"
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const handleReview = (item: any) => {
    setSelectedItem(item)
    setModalOpen(true)
  }

  const handleClose = () => {
    setModalOpen(false)
    // keep data alive until modal exit animation finishes
    setTimeout(() => setSelectedItem(null), 350)
  }

  const handleApprove = async (userId: number) => {
    await onApprove(userId)
    handleClose()
  }

  const handleReject = async (userId: number) => {
    await onReject(userId)
    handleClose()
  }

  const user = selectedItem?.user
  const fullName = user ? `${user.fname ?? ""} ${user.lname ?? ""}`.trim() : ""
  const initials = fullName
    .split(" ")
    .map((n: string) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()
  const isProcessing = user ? processingUserId === user.id : false

  // console.log("pending students:", students)

  const modalFooter = (
    <div className="flex items-center gap-3 w-full">
      <button
        onClick={() => user && handleApprove(user.id)}
        disabled={isProcessing}
        className="flex-[2] py-2.5 rounded-xl text-[12px] font-bold tracking-[0.10em] uppercase transition-all duration-200 hover:brightness-110 active:scale-[0.98] disabled:opacity-60"
        style={{
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          background: "linear-gradient(135deg, #8C1535 0%, #3D0718 100%)",
          color: "#fff",
          boxShadow: "0 4px 14px rgba(140,21,53,0.35)",
        }}
      >
        {isProcessing ? (
          <span className="flex items-center justify-center gap-2">
            <span className="inline-block w-3.5 h-3.5 rounded-full border-2 border-white/40 border-t-white animate-spin" />
            Approving…
          </span>
        ) : (
          "Approve"
        )}
      </button>
    </div>
  )

  return (
    <>
      {/* ── Table card (unchanged layout) ─────────────────────────────────── */}
      <Card className="shadow-sm rounded-2xl border-[#F2D9DF] bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex flex-col">
            <h4 className="text-[16px] font-bold text-[#2A0410]">
              Student Verifications
            </h4>
            <p className="italic text-[13px]">{students.length} pending verification {students.length === 1 ? "" : "s"}</p>
          </div>
          
          <button
            onClick={() => navigate("/admin/student-verifications")}
            className="text-sm font-semibold text-[#6B0F2B] hover:underline"
          >
            View all →
          </button>
        </div>

        {isLoading ? (
          <p className="text-sm text-gray-500">Loading...</p>
        ) : students.length === 0 ? (
          <>
            <div className="flex items-center justify-center py-10">
              <p className="text-[15px] text-[#9A7080] text-center">
                No pending student applications
              </p>
            </div>
          </>
          ) : (
          <div className="max-h-[320px] overflow-y-auto">
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="border-y border-[#F2D9DF]">
                  <th className="w-[44%] py-2 text-left text-xs font-bold uppercase tracking-widest text-[#A06B7C]">
                    Student
                  </th>
                  <th className="w-[29%] py-2 text-left text-xs font-bold uppercase tracking-widest text-[#A06B7C]">
                    Applied
                  </th>
                  <th className="py-2 text-center text-xs font-bold uppercase tracking-widest text-[#A06B7C]">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {students.slice(0, 5).map((item: any) => (
                  <tr key={item.user.id} className="hover:bg-[#FFF7F9]">
                    <td className="py-4">
                      <div className="flex items-center gap-2">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#6B0F2B] to-[#B32042] flex items-center justify-center text-white font-semibold">
                          {item.user.fname?.[0]?.toUpperCase() ?? "S"}
                        </div>
                        <p className="text-[14px] font-medium text-[#2A0410]">
                          {`${item.user.fname} ${item.user.lname}`}
                        </p>
                      </div>
                    </td>
                    <td className="py-4 text-[14px] text-[#A06B7C]">
                      {formatDate(item.user.submittedAt)}
                    </td>
                    <td className="py-4 text-center">
                      <button
                        onClick={() => handleReview(item)}
                        disabled={processingUserId === item.user.id}
                        className="rounded-xl border border-[#D9B8C4] bg-[#FFF7F9] px-4 py-2 text-[12px] font-semibold text-[#6B0F2B] hover:bg-[#F2D9DF] disabled:opacity-60"
                      >
                        {processingUserId === item.user.id ? "Processing..." : "Review"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* ── Review modal ──────────────────────────────────────────────────── */}
      <StudentVerificationModal
        open={modalOpen}
        onClose={handleClose}
        selectedItem={selectedItem}
        verifyingUserId={processingUserId}
        processingAction={processingAction}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </>
  )
}