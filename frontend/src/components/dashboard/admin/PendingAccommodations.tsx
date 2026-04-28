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
    <Card className="shadow-sm">
      <div className="mb-4">
        <h2 className="text-lg font-bold text-[#2A0410]">
          Pending Accommodation Approvals
        </h2>
        <p className="text-xs text-gray-500">
          Approve or reject submitted accommodations.
        </p>
      </div>

      {isLoading ? (
        <p className="text-sm text-gray-500">Loading...</p>
      ) : accommodations.length === 0 ? (
        <p className="text-sm text-gray-500">
          No pending accommodations.
        </p>
      ) : (
        <div className="max-h-[300px] overflow-y-auto rounded-xl border border-[#F2D9DF]">
          <table className="min-w-full text-sm">
            <thead className="bg-[#FFF7F9] sticky top-0">
              <tr>
                <th className="text-left px-4 py-3 border-b border-[#F2D9DF]">
                  Accommodation
                </th>
                <th className="text-left px-4 py-3 border-b border-[#F2D9DF]">
                  Landlord
                </th>
                <th className="text-left px-4 py-3 border-b border-[#F2D9DF]">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {accommodations.map((item: any) => (
                <tr key={item.id} className="hover:bg-[#FFF7F9]">
                  <td className="px-4 py-3 border-b border-[#F2D9DF]">
                    <p className="font-medium text-[#2A0410]">
                      {item.accommodationName ?? "—"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {item.accommodationLocation ?? "—"}
                    </p>
                  </td>

                  <td className="px-4 py-3 border-b border-[#F2D9DF] text-gray-600">
                    {item.landlord?.user
                      ? `${item.landlord.user.fname} ${item.landlord.user.lname}`
                      : "—"}
                  </td>

                  <td className="px-4 py-3 border-b border-[#F2D9DF]">
                    <div className="flex gap-2">
                      <button
                        onClick={() => onVerify(item.id, "verified")}
                        disabled={verifyingAccommodationId === item.id}
                        className="text-xs px-3 py-2 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 disabled:opacity-60"
                      >
                        {verifyingAccommodationId === item.id
                          ? "Approving..."
                          : "Approve"}
                      </button>

                      <button
                        onClick={() => onVerify(item.id, "rejected")}
                        disabled={verifyingAccommodationId === item.id}
                        className="text-xs px-3 py-2 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 disabled:opacity-60"
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