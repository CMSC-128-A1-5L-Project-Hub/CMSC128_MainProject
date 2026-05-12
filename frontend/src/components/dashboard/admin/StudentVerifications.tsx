import { useState } from "react"
import Card from "@/components/ui/Card"
import Modal from "@/components/Modal"
import { useNavigate } from "react-router-dom"

type StudentVerificationsProps = {
  students: any[]
  isLoading: boolean
  verifyingUserId: number | null
  onApprove: (userId: number) => void
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
  verifyingUserId,
  onApprove,
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

  const handleApprove = (userId: number) => {
    onApprove(userId)
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
  const isVerifying = user ? verifyingUserId === user.id : false

  const modalFooter = (
    <div className="flex items-center gap-3 w-full">
      <button
        onClick={() => user && handleApprove(user.id)}
        disabled={isVerifying}
        className="flex-[2] py-2.5 rounded-xl text-[12px] font-bold tracking-[0.10em] uppercase transition-all duration-200 hover:brightness-110 active:scale-[0.98] disabled:opacity-60"
        style={{
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          background: "linear-gradient(135deg, #8C1535 0%, #3D0718 100%)",
          color: "#fff",
          boxShadow: "0 4px 14px rgba(140,21,53,0.35)",
        }}
      >
        {isVerifying ? (
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
      <Card className="shadow-sm rounded-2xl border border-[#F2D9DF] bg-white p-6">
        <div className="mb-6 flex items-center justify-between">
          <h4 className="text-xl font-semibold text-[#2A0410]">
            Student Verifications
          </h4>
          <button
            onClick={() => navigate("/admin/student-verifications")}
            className="text-sm font-semibold text-[#6B0F2B] hover:text-[#2A0410]"
          >
            View all →
          </button>
        </div>

        {isLoading ? (
          <p className="text-sm text-gray-500">Loading...</p>
        ) : students.length === 0 ? (
          <p className="text-sm text-gray-500">No pending students.</p>
        ) : (
          <div className="max-h-[320px] overflow-y-auto">
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="border-y border-[#F2D9DF]">
                  <th className="py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#A06B7C]">
                    Student
                  </th>
                  <th className="py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#A06B7C]">
                    Applied
                  </th>
                  <th className="py-3 text-center text-xs font-semibold uppercase tracking-wide text-[#A06B7C]">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {students.slice(0, 5).map((item: any) => (
                  <tr key={item.user.id}>
                    <td className="py-4">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#6B0F2B] to-[#B32042] flex items-center justify-center text-white font-semibold">
                          {item.user.fname?.[0]?.toUpperCase() ?? "S"}
                        </div>
                        <p className="text-base font-medium text-[#2A0410]">
                          {`${item.user.fname} ${item.user.lname}`}
                        </p>
                      </div>
                    </td>
                    <td className="py-4 text-sm text-[#A06B7C]">
                      {formatDate(item.user.createdAt)}
                    </td>
                    <td className="py-4 text-center">
                      {/* ← only change: onClick opens modal instead of approving directly */}
                      <button
                        onClick={() => handleReview(item)}
                        disabled={verifyingUserId === item.user.id}
                        className="rounded-xl border border-[#D9B8C4] bg-[#FFF7F9] px-4 py-2 text-sm font-semibold text-[#6B0F2B] hover:bg-[#F2D9DF] disabled:opacity-60"
                      >
                        {verifyingUserId === item.user.id ? "Approving..." : "Review"}
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
      <Modal
        open={modalOpen}
        onClose={handleClose}
        title="Review Application"
        eyebrow="Pending Verification"
        maxWidth={520}
        footer={modalFooter}
      >
        {user && (
          <div className="space-y-4">
            {/* Profile strip */}
            <div
              className="flex items-center gap-4 p-4 rounded-2xl"
              style={{
                background:
                  "linear-gradient(135deg, rgba(140,21,53,0.06) 0%, rgba(61,7,24,0.04) 100%)",
                border: "1px solid rgba(140,21,53,0.10)",
              }}
            >
              <div
                className="flex-shrink-0 w-14 h-14 rounded-full flex items-center justify-center text-[20px] font-extrabold text-white"
                style={{
                  background: "linear-gradient(135deg, #8C1535 0%, #3D0718 100%)",
                  boxShadow: "0 4px 16px rgba(140,21,53,0.35)",
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}
              >
                {initials}
              </div>
              <div className="min-w-0">
                <p
                  className="text-[17px] font-extrabold text-[#1A0A10] leading-tight truncate"
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                >
                  {fullName}
                </p>
                <p
                  className="text-[12px] text-[#9E2040] font-medium truncate mt-0.5"
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                >
                  {user.email}
                </p>
                <span
                  className="inline-flex items-center gap-1.5 mt-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-[0.12em] uppercase"
                  style={{
                    background: "rgba(140,21,53,0.10)",
                    color: "#8C1535",
                    border: "1px solid rgba(140,21,53,0.20)",
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                  }}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#8C1535]" />
                  Student
                </span>
              </div>
            </div>

            {/* Details grid */}
            <div
              className="grid grid-cols-2 gap-x-6 gap-y-4 p-4 rounded-2xl"
              style={{
                background: "#FAFAFA",
                border: "1px solid rgba(26,10,15,0.07)",
              }}
            >
              <InfoRow label="Student ID"       value={user.studentId} />
              <InfoRow label="Course / Program" value={user.course} />
              <InfoRow label="Year Level"       value={user.year} />
              <InfoRow label="Contact Number"   value={user.phone} />
              <div className="col-span-2">
                <InfoRow label="Address" value={user.address} />
              </div>
              <div className="col-span-2">
                <InfoRow label="Application Date" value={formatDate(user.createdAt)} />
              </div>
            </div>

            {/* Submitted ID image — only when available */}
            {user.idImageUrl && (
              <div
                className="rounded-2xl overflow-hidden"
                style={{ border: "1px solid rgba(140,21,53,0.12)" }}
              >
                <p
                  className="px-4 py-2 text-[9px] font-bold tracking-[0.18em] uppercase text-[#9E2040]"
                  style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    background: "rgba(140,21,53,0.05)",
                    borderBottom: "1px solid rgba(140,21,53,0.08)",
                  }}
                >
                  Submitted ID
                </p>
                <img
                  src={user.idImageUrl}
                  alt="Student ID"
                  className="w-full object-cover max-h-48"
                />
              </div>
            )}
          </div>
        )}
      </Modal>
    </>
  )
}