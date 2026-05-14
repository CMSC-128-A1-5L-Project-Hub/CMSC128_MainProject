import Card from "@/components/ui/Card"

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
  return (
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
        <p className="text-sm text-gray-500">Loading...</p>
      ) : accommodations.length === 0 ? (
        <>
          <hr className="border-[#F2D9DF]" />

          <div className="flex items-center justify-center py-10">
            <p className="text-lg text-[#9A7080] text-center">
              No pending accommodations
            </p>
          </div>
        </>
      ) : (
        <div className="max-h-[320px] overflow-y-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="border-y border-[#F2D9DF]">
                <th className="py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#A06B7C]">
                  Accommodation
                </th>

                <th className="py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#A06B7C]">
                  Landlord
                </th>

                <th className="py-3 text-center text-xs font-semibold uppercase tracking-wide text-[#A06B7C]">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {accommodations.slice(0, 5).map((item: any) => (
                <tr
                  key={item.id}
                  className="hover:bg-[#FFF7F9] transition-colors"
                >
                  <td className="py-4">
                    <div className="flex flex-col">
                      <p className="font-medium text-[#2A0410]">
                        {item.accommodationName ?? "—"}
                      </p>

                      <p className="text-sm text-[#A06B7C]">
                        {item.accommodationLocation ?? "—"}
                      </p>
                    </div>
                  </td>

                  <td className="py-4 text-sm text-[#2A0410]">
                    {item.landlord?.user
                      ? `${item.landlord.user.fname} ${item.landlord.user.lname}`
                      : "—"}
                  </td>

                  <td className="py-4">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => onVerify(item.id, "verified")}
                        disabled={verifyingAccommodationId === item.id}
                        className="rounded-xl px-4 py-2 text-sm font-semibold bg-[#EAF7EE] text-[#2D8A4E] hover:bg-[#D8F0E1] disabled:opacity-60"
                      >
                        {verifyingAccommodationId === item.id
                          ? "Approving..."
                          : "Approve"}
                      </button>

                      <button
                        onClick={() => onVerify(item.id, "rejected")}
                        disabled={verifyingAccommodationId === item.id}
                        className="rounded-xl px-4 py-2 text-sm font-semibold bg-[#FFF1F1] text-[#C53B3B] hover:bg-[#FFE2E2] disabled:opacity-60"
                      >
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  )
}