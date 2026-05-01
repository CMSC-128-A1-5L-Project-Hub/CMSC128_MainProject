import Card from "@/components/ui/Card"

type HousingAdminVerificationsProps = {
  admins: any[]
  isLoading: boolean
  verifyingUserId: number | null
  onApprove: (userId: number) => void
}

export default function HousingAdminVerifications({
  admins,
  isLoading,
  verifyingUserId,
  onApprove,
}: HousingAdminVerificationsProps) {
  const formatAppliedDate = (timestamp?: string) => {
    if (!timestamp) return "N/A"

    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  return (
    <Card className="shadow-sm rounded-2xl border border-[#F2D9DF] bg-white p-6">
      <div className="mb-6 flex items-center justify-between">
        <h4 className="text-xl font-semibold text-[#2A0410]">
          Housing Administrator Verifications
        </h4>

        <button className="text-sm font-semibold text-[#6B0F2B] hover:text-[#2A0410]">
          View all →
        </button>
      </div>

      {isLoading ? (
        <p className="text-sm text-gray-500">Loading...</p>
      ) : admins.length === 0 ? (
        <p className="text-sm text-gray-500">
          No pending housing administrators.
        </p>
      ) : (
        <div className="max-h-[320px] overflow-y-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="border-y border-[#F2D9DF]">
                <th className="py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#A06B7C]">
                  Housing Admin
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
              {admins.slice(0, 5).map((item: any) => (
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
                    {formatAppliedDate(item.appliedAt)}
                  </td>

                  <td className="py-4 text-center">
                    <button
                      onClick={() => onApprove(item.user.id)}
                      disabled={verifyingUserId === item.user.id}
                      className="rounded-xl border border-[#D9B8C4] bg-[#FFF7F9] px-4 py-2 text-sm font-semibold text-[#6B0F2B] hover:bg-[#F2D9DF] disabled:opacity-60"
                    >
                      {verifyingUserId === item.user.id
                        ? "Approving..."
                        : "Review"}
                    </button>
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