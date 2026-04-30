import Card from "@/components/ui/Card"


type RecentActivityLogsProps = {
  logs: any[]
  isLoading: boolean
  isError: boolean
}

export default function RecentActivityLogs({
  logs,
  isLoading,
  isError,
}: RecentActivityLogsProps) {
  const formatAction = (action: string) => {
    if (!action) return "Activity"

    return action
      .replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase())
  }

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString()
  }

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString()
  }

  return (
    <Card className="shadow-sm rounded-2xl border border-[#F2D9DF] bg-white p-8">
      <div className="mb-8">
        <h4 className="text-xl font-semibold text-[#2A0410]">
          Recent Activity Logs
        </h4>
        <p className="mt-1 text-sm text-gray-500">
          Latest actions made in the system.
        </p>
      </div>

      {isLoading ? (
        <p className="text-sm text-gray-500">Loading...</p>
      ) : isError ? (
        <p className="text-sm text-red-500">Error loading logs.</p>
      ) : logs.length === 0 ? (
        <p className="text-sm text-gray-500">No activity yet.</p>
      ) : (
        <div className="max-h-[340px] overflow-y-auto">
          <table className="min-w-full border-separate border-spacing-0">
            <thead className="sticky top-0 z-10 bg-white">
              <tr>
                <th className="border-y border-[#F2D9DF] py-4 text-left text-sm font-semibold uppercase tracking-wide text-[#A06B7C]">
                  Action
                </th>
                <th className="border-y border-[#F2D9DF] py-4 text-left text-sm font-semibold uppercase tracking-wide text-[#A06B7C]">
                  Details
                </th>
                <th className="border-y border-[#F2D9DF] py-4 text-left text-sm font-semibold uppercase tracking-wide text-[#A06B7C]">
                  Date
                </th>
                <th className="border-y border-[#F2D9DF] py-4 text-left text-sm font-semibold uppercase tracking-wide text-[#A06B7C]">
                  Time
                </th>
              </tr>
            </thead>

            <tbody>
              {logs.map((log: any) => (
                <tr key={log.id}>
                  <td className="border-b border-[#F2D9DF] py-4 text-sm font-bold text-[#A06B7C]">
                    {formatAction(log.activityType)}
                  </td>

                  <td className="border-b border-[#F2D9DF] py-4 text-sm text-gray-600">
                    {log.activityDetails}
                  </td>

                  <td className="border-b border-[#F2D9DF] py-4 text-sm text-[#A06B7C]">
                    {formatDate(log.logTimestamp)}
                  </td>

                  <td className="border-b border-[#F2D9DF] py-4 text-sm text-[#A06B7C]">
                    {formatTime(log.logTimestamp)}
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