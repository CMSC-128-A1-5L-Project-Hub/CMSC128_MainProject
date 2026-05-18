import Card from "@/components/ui/Card"
import { useNavigate } from "react-router-dom"
import { useState } from "react"
import HousingAdminVerificationModal from "./HousingAdminVerificationsModal"


type HousingAdminVerificationsProps = {
  admins: any[]
  isLoading: boolean
  processingUserId: number | null
  processingAction: "approve" | "reject" | null
  onApprove: (userId: number) => Promise<void>
  onReject: (userId: number) => Promise<void>
}

export default function HousingAdminVerifications({
  admins,
  isLoading,
  processingUserId,
  processingAction,
  onApprove,
  onReject,
}: HousingAdminVerificationsProps) {
  const formatAppliedDate = (timestamp?: string) => {
    if (!timestamp) return "N/A"

    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const navigate = useNavigate()

  
  const [selectedItem, setSelectedItem] = useState<any | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  const handleReview = (item: any) => {
    setSelectedItem(item)
    setModalOpen(true)
  }

  const handleClose = () => {
    setModalOpen(false)

    setTimeout(() => {
      setSelectedItem(null)
    }, 350)
  }

  const handleApprove = async (userId: number) => {
    await onApprove(userId)
    handleClose()
  }

  const handleReject = async (userId: number) => {
    await onReject(userId)
    handleClose()
  }

  return (
    <Card className="shadow-sm rounded-2xl border-[#F2D9DF] bg-white p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h4 className="text-[16px] font-bold text-[#2A0410]">
            Housing Administrator Verifications
          </h4>
          <p className="text-[13px] italic">{admins.length} pending verification{admins.length === 1 ? "" : "s"}</p>
        </div>
        

        <button
          onClick={() => navigate("/admin/landlord-verifications")}
          className="text-sm font-semibold text-[#6B0F2B] hover:underline"
        >
          View all →
        </button>
      </div>

      {isLoading ? (
        <p className="text-sm text-gray-500">Loading...</p>
      ) : admins.length === 0 ? (
          <>
            <div className="flex items-center justify-center py-10">
              <p className="text-[15px] text-[#9A7080] text-center">
                No pending housing administrators
              </p>
            </div>
          </>
        ) : (
        <div className="max-h-[320px] overflow-y-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="border-y border-[#F2D9DF]">
                <th className="py-2 text-left text-xs font-semibold uppercase tracking-wide text-[#A06B7C]">
                  Housing Admin
                </th>
                <th className="py-2 text-left text-xs font-semibold uppercase tracking-wide text-[#A06B7C]">
                  Applied
                </th>
                <th className="py-2 text-center text-xs font-semibold uppercase tracking-wide text-[#A06B7C]">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {admins.slice(0, 5).map((item: any) => {
                console.log("im here")
                console.log("housing admin item:", item)
                return (
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
                    {formatAppliedDate(item.user.submittedAt)}
                  </td>

                  <td className="py-4 text-center">
                    <button
                      onClick={() => handleReview(item)}
                      disabled={processingUserId === item.user.id}
                      className="rounded-xl border border-[#D9B8C4] bg-[#FFF7F9] px-4 py-2 text-sm font-semibold text-[#6B0F2B] hover:bg-[#F2D9DF] disabled:opacity-60"
                    >
                      {processingUserId === item.user.id ? "Processing..." : "Review"}
                    </button>
                  </td>
                </tr>
              )
      })}
            </tbody>
          </table>
        </div>
      )}
       <HousingAdminVerificationModal
        open={modalOpen}
        onClose={handleClose}
        selectedItem={selectedItem}
        verifyingUserId={processingUserId}
        processingAction={processingAction}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </Card>
  )
}