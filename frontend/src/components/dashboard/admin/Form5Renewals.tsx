import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "../../../api/axios"
import Card from "@/components/ui/Card"
import Modal from "@/components/Modal"
import Button from "@/components/Button"

interface PendingRenewal {
  studentNumber: string
  userId: number
  college: string
  degreeProgram: string
  yearLevel: string | null
  form5Renewal: boolean
  form5RenewalSubmittedAt: string | null
  user: { id: number; fname: string; lname: string; email: string } | null
  accommodation: { id: number; name: string; roomNumber: string } | null
  enrollmentProof: {
    id: number
    fileName: string
    fileType: "document" | "image"
    url: string | null
  } | null
}

type Props = {
  onToast?: (t: {
    type: "success" | "error" | "info" | "warning" | "loading"
    title: string
    message?: string
  }) => void
}

export default function Form5Renewals({ onToast }: Props) {
  const queryClient = useQueryClient()
  const [selectedItem, setSelectedItem] = useState<PendingRenewal | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [showRejectInput, setShowRejectInput] = useState(false)
  const [rejectRemarks, setRejectRemarks] = useState("")

  const { data: renewalsRaw, isLoading } = useQuery({
    queryKey: ["admin-form5-renewals"],
    queryFn: async () => (await api.get("/admin/form5-renewals")).data,
  })

  const verifyMutation = useMutation({
    mutationFn: async (studentNumber: string) =>
      (await api.patch(`/admin/form5-renewals/${studentNumber}/verify`)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-form5-renewals"] })
      onToast?.({ type: "success", title: "Form 5 Verified", message: "The student's Form 5 has been approved." })
    },
    onError: (err: any) => {
      onToast?.({
        type: "error",
        title: "Verification Failed",
        message: err?.response?.data?.message || "Could not verify Form 5.",
      })
    },
  })

  const rejectMutation = useMutation({
    mutationFn: async (payload: { studentNumber: string; remarks: string }) =>
      (await api.patch(`/admin/form5-renewals/${payload.studentNumber}/reject`, { remarks: payload.remarks })).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-form5-renewals"] })
      onToast?.({ type: "warning", title: "Form 5 Rejected", message: "The student must re-upload their Form 5." })
    },
    onError: (err: any) => {
      onToast?.({
        type: "error",
        title: "Rejection Failed",
        message: err?.response?.data?.message || "Could not reject Form 5.",
      })
    },
  })

  const renewals: PendingRenewal[] = Array.isArray(renewalsRaw) ? renewalsRaw : []

  const handleOpenModal = (item: PendingRenewal) => {
    setSelectedItem(item)
    setRejectRemarks("")
    setShowRejectInput(false)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setTimeout(() => {
      setSelectedItem(null)
      setRejectRemarks("")
      setShowRejectInput(false)
    }, 300)
  }

  const formatDate = (s?: string | null) => {
    if (!s) return "—"
    return new Date(s).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })
  }

  const proofIsPdf =
    selectedItem?.enrollmentProof?.fileType === "document" ||
    (selectedItem?.enrollmentProof?.fileName ?? "").toLowerCase().endsWith(".pdf")

  return (
    <>
      <Card className="shadow-sm rounded-2xl border-[#F2D9DF] bg-white p-6">
        <div className="flex flex-row justify-between items-center mb-4">
          <div>
            <h2 className="text-[16px] font-bold text-[#2A0410]">Form 5 Renewal Verifications</h2>
            <p className="text-[13px] italic">
              {renewals.length} pending renewal{renewals.length === 1 ? "" : "s"}
            </p>
          </div>
        </div>

        {isLoading ? (
          <p className="text-sm text-gray-500">Loading...</p>
        ) : renewals.length === 0 ? (
          <div className="flex items-center py-10 justify-center">
            <p className="text-[15px] text-[#9A7080] text-center">No pending Form 5 renewals</p>
          </div>
        ) : (
          <div className="max-h-[320px] overflow-y-auto">
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="border-y border-[#F2D9DF]">
                  <th className="w-[44%] px-2 py-2 text-left text-[12px] font-bold uppercase tracking-widest text-[#A06B7C]">
                    Student
                  </th>
                  <th className="w-[29%] px-2 py-2 text-left text-[12px] font-bold uppercase tracking-widest text-[#A06B7C]">
                    Accommodation
                  </th>
                  <th className="px-2 py-2 text-center text-[12px] font-bold uppercase tracking-widest text-[#A06B7C]">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {renewals.slice(0, 5).map((item) => (
                  <tr key={item.studentNumber} className="hover:bg-[#FFF7F9]">
                    <td className="py-2 px-2">
                      <div className="flex items-center gap-2">
                        <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-[#6B0F2B] to-[#B32042] flex items-center justify-center text-white font-semibold">
                          {item.user?.fname?.[0]?.toUpperCase() ?? "S"}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[14px] font-medium text-[#2A0410] truncate">
                            {item.user?.fname} {item.user?.lname}
                          </p>
                          <p className="text-[11px] text-[#A06B7C] truncate">{item.studentNumber}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-2 text-[13px] text-[#A06B7C]">
                      {item.accommodation
                        ? `${item.accommodation.name} · Rm ${item.accommodation.roomNumber}`
                        : "—"}
                    </td>
                    <td className="py-4 text-center">
                      <button
                        onClick={() => handleOpenModal(item)}
                        className="rounded-xl border border-[#D9B8C4] bg-[#FFF7F9] px-4 py-2 text-sm font-semibold text-[#6B0F2B] hover:bg-[#F2D9DF]"
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Review Modal */}
      <Modal
        open={isModalOpen}
        onClose={handleCloseModal}
        title="Review Form 5 Renewal"
        eyebrow="FORM 5 VERIFICATION"
        maxWidth={560}
      >
        {selectedItem && (
          <div className="flex flex-col gap-4 py-2">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#9E2040]">Student</p>
                <p className="font-semibold">
                  {selectedItem.user?.fname} {selectedItem.user?.lname}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#9E2040]">Student #</p>
                <p className="font-semibold">{selectedItem.studentNumber}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#9E2040]">College</p>
                <p className="font-semibold">{selectedItem.college}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#9E2040]">Degree Program</p>
                <p className="font-semibold">{selectedItem.degreeProgram}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#9E2040]">Accommodation</p>
                <p className="font-semibold">
                  {selectedItem.accommodation
                    ? `${selectedItem.accommodation.name} · Rm ${selectedItem.accommodation.roomNumber}`
                    : "—"}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#9E2040]">Submitted</p>
                <p className="font-semibold">{formatDate(selectedItem.form5RenewalSubmittedAt)}</p>
              </div>
            </div>

            {selectedItem.enrollmentProof?.url && (
              <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(140,21,53,0.12)" }}>
                <p
                  className="px-4 py-2 text-[9px] font-bold tracking-[0.18em] uppercase text-[#9E2040]"
                  style={{ background: "rgba(140,21,53,0.05)", borderBottom: "1px solid rgba(140,21,53,0.08)" }}
                >
                  Submitted Document
                </p>
                <div className="flex items-center gap-3 p-3 bg-white">
                  <div
                    className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-[10px] font-extrabold text-white"
                    style={{ background: "linear-gradient(135deg, #8C1535 0%, #3D0718 100%)" }}
                  >
                    {proofIsPdf ? "PDF" : "IMG"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[12px] font-semibold text-[#1A0A10] truncate" title={selectedItem.enrollmentProof.fileName}>
                      {selectedItem.enrollmentProof.fileName}
                    </p>
                  </div>
                  <button
                    onClick={() => setPreviewOpen(true)}
                    className="px-4 py-2 rounded-xl text-[11px] font-bold tracking-[0.10em] uppercase transition-all hover:brightness-110 active:scale-[0.98]"
                    style={{ background: "linear-gradient(135deg, #8C1535 0%, #3D0718 100%)", color: "#fff" }}
                  >
                    View
                  </button>
                </div>
              </div>
            )}

            {showRejectInput && (
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-[#9E2040]">
                  Rejection Remarks (required)
                </label>
                <textarea
                  value={rejectRemarks}
                  onChange={(e) => setRejectRemarks(e.target.value)}
                  rows={3}
                  className="w-full mt-1 px-3 py-2 border border-[#E6CAD3] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#6B0F2B]/30"
                  placeholder="Explain why this Form 5 is being rejected..."
                />
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              {!showRejectInput ? (
                <>
                  <Button variant="secondary" onClick={() => setShowRejectInput(true)}>
                    Reject
                  </Button>
                  <Button
                    variant="reddishPink"
                    disabled={verifyMutation.isPending}
                    onClick={async () => {
                      await verifyMutation.mutateAsync(selectedItem.studentNumber)
                      handleCloseModal()
                    }}
                  >
                    {verifyMutation.isPending ? "Approving..." : "Approve"}
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="secondary" onClick={() => setShowRejectInput(false)}>
                    Cancel
                  </Button>
                  <Button
                    variant="reddishPink"
                    disabled={rejectMutation.isPending || !rejectRemarks.trim()}
                    onClick={async () => {
                      await rejectMutation.mutateAsync({
                        studentNumber: selectedItem.studentNumber,
                        remarks: rejectRemarks.trim(),
                      })
                      handleCloseModal()
                    }}
                  >
                    {rejectMutation.isPending ? "Rejecting..." : "Confirm Reject"}
                  </Button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Preview Modal */}
        <Modal
          open={previewOpen}
          onClose={() => setPreviewOpen(false)}
          title={selectedItem?.enrollmentProof?.fileName ?? "Document"}
          eyebrow="Enrollment Proof"
          maxWidth={900}
          maxHeight={800}
        >
          {selectedItem?.enrollmentProof?.url ? (
            proofIsPdf ? (
              <iframe
                src={selectedItem.enrollmentProof.url}
                title={selectedItem.enrollmentProof.fileName}
                className="w-full rounded-xl bg-white"
                style={{ height: "70vh", border: "1px solid rgba(140,21,53,0.12)" }}
              />
            ) : (
              <img
                src={selectedItem.enrollmentProof.url}
                alt={selectedItem.enrollmentProof.fileName}
                className="w-full max-h-[70vh] object-contain rounded-xl bg-[#FAFAFA]"
                style={{ border: "1px solid rgba(140,21,53,0.12)" }}
              />
            )
          ) : (
            <p className="text-center text-gray-400 italic py-10">No document available.</p>
          )}
          <div className="mt-3 flex justify-end">
            <a
              href={selectedItem?.enrollmentProof?.url ?? "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] font-bold tracking-[0.10em] uppercase text-[#8C1535] hover:underline"
            >
              Open in new tab ↗
            </a>
          </div>
        </Modal>
      </Modal>
    </>
  )
}
