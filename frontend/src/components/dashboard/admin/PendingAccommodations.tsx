import { useState } from "react"
import { useNavigate } from "react-router-dom"
import Card from "@/components/ui/Card"
import AccommodationVerificationModal from "./PendingAccommodationsModal"

type PendingAccommodationsProps = {
  accommodations: any[]
  isLoading: boolean
  verifyingAccommodationId: number | null
  onVerify: (id: number, status: "verified" | "rejected") => void
}

export default function PendingAccommodations({
  accommodations,
  isLoading,
  verifyingAccommodationId,
  onVerify,
}: PendingAccommodationsProps) {
  const [selectedItem, setSelectedItem] = useState<any | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const navigate = useNavigate()

  const handleReview = (item: any) => {
    setSelectedItem(item)
    setModalOpen(true)
  }

  const handleClose = () => {
    setModalOpen(false)

    setTimeout(() => {
      setSelectedItem(null)
    }, 300)
  }

  return (
    <>
      <Card className="shadow-sm rounded-2xl border-[#F2D9DF] bg-white p-6">
        <div className="flex flex-row justify-between items-center mb-4">
        <div>
          <h2 className="text-[16px] font-bold text-[#2A0410]">
            Pending Accommodation Approvals
          </h2>
          <p className="text-[13px] italic">
            {accommodations.length} pending approval{accommodations.length === 1 ? "" : "s"}
          </p>
        </div>
        <button
          onClick={() => navigate("/admin/pending-accommodations")}
          className="text-sm font-semibold text-[#6B0F2B] hover:underline"
        >
          View all →
        </button>
      </div>
        

        {isLoading ? (
          <p className="text-sm text-gray-500">
            Loading...
          </p>
        ) : accommodations.length === 0 ? (
          <>
            <div className="flex items-center py-10 justify-center">
              <p className="text-[15px] text-[#9A7080] text-center">
                No pending approvals
              </p>
            </div>
          </>
        ) : (
          <div className="max-h-[320px] overflow-y-auto">
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="border-y border-[#F2D9DF]">
                  <th className="w-[44%] px-2 py-2 text-left text-[12px] font-bold uppercase tracking-widest text-[#A06B7C]">
                    Accommodation
                  </th>

                  <th className="w-[29%] px-2 py-2 text-left text-[12px] font-bold uppercase tracking-widest text-[#A06B7C]">
                    Landlord
                  </th>

                  <th className="px-2 py-2 text-center text-[12px] font-bold uppercase tracking-widest text-[#A06B7C]">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {accommodations.slice(0, 5).map((item:any) => (
                  <tr
                    key={item.id}
                    className="hover:bg-[#FFF7F9]"
                  >
                    <td className="py-2 px-2">
                      <div className="flex items-center gap-2">
                        <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-[#6B0F2B] to-[#B32042] flex items-center justify-center text-white font-semibold">
                          {item.accommodationName?.[0]?.toUpperCase() ?? "A"}
                        </div>

                        <div className="min-w-0">
                          <p className="text-[14px] font-medium text-[#2A0410] truncate">
                            {item.accommodationName}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-2 text-[14px] text-[#A06B7C]">
                      {item.landlord?.user
                        ? `${item.landlord.user.fname} ${item.landlord.user.lname}`
                        : "—"}
                    </td>

                    <td className="py-4 text-center">
                      <button
                        onClick={() => handleReview(item)}
                        disabled={
                          verifyingAccommodationId === item.id
                        }
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

      <AccommodationVerificationModal
        open={modalOpen}
        onClose={handleClose}
        selectedItem={selectedItem}
        verifyingAccommodationId={
          verifyingAccommodationId
        }
        onApprove={(id)=>
          onVerify(id,"verified")
        }
        onReject={(id)=>
          onVerify(id,"rejected")
        }
      />
    </>
  )
}