import { useState } from "react"
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
      <Card className="shadow-sm rounded-2xl border border-[#F2D9DF] bg-white p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-[#2A0410]">
            Pending Accommodation Approvals
          </h2>

          <p className="text-xs text-gray-500 mt-1">
            Approve or reject submitted accommodations.
          </p>
        </div>

        {isLoading ? (
          <p className="text-sm text-gray-500">
            Loading...
          </p>
        ) : accommodations.length === 0 ? (
          <>
            <hr className="border-[#F2D9DF]" />

            <div className="flex items-center justify-center py-10">
              <p className="text-lg text-[#9A7080]">
                No pending accommodations
              </p>
            </div>
          </>
        ) : (
          <div className="max-h-[320px] overflow-y-auto">
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="border-y border-[#F2D9DF]">
                  <th className="w-[44%] py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#A06B7C]">
                    Accommodation
                  </th>

                  <th className="w-[29%] py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#A06B7C]">
                    Landlord
                  </th>

                  <th className="py-3 text-center text-xs font-semibold uppercase tracking-wide text-[#A06B7C]">
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
                    <td className="py-4">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#6B0F2B] to-[#B32042] flex items-center justify-center text-white font-semibold">
                          {item.accommodationName?.[0]?.toUpperCase() ?? "A"}
                        </div>

                        <div className="min-w-0">
                          <p className="text-base font-medium text-[#2A0410] truncate">
                            {item.accommodationName}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 text-sm text-[#A06B7C]">
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