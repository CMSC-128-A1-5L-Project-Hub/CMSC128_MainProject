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
    <Card className="shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-[#2A0410]">
            Recent Activity Logs
          </h2>
          <p className="text-xs text-gray-500">
            Latest actions made in the system.
          </p>
        </div>
      </div>

      {isLoading ? (
        <p className="text-sm text-gray-500">Loading...</p>
      ) : isError ? (
        <p className="text-sm text-red-500">Error loading logs.</p>
      ) : logs.length === 0 ? (
        <p className="text-sm text-gray-500">No activity yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <div className="max-h-[300px] overflow-y-auto rounded-xl border border-[#F2D9DF]">
            <table className="min-w-full text-sm">
              <thead className="bg-[#FFF7F9] sticky top-0">
                <tr className="text-[#2A0410]">
                  <th className="text-left px-4 py-3 font-semibold border-b border-[#F2D9DF]">
                    Action
                  </th>
                  <th className="text-left px-4 py-3 font-semibold border-b border-[#F2D9DF]">
                    Details
                  </th>
                  <th className="text-left px-4 py-3 font-semibold border-b border-[#F2D9DF]">
                    Date
                  </th>
                  <th className="text-left px-4 py-3 font-semibold border-b border-[#F2D9DF]">
                    Time
                  </th>
                </tr>
              </thead>

              <tbody>
                {logs.map((log: any) => (
                  <tr key={log.id} className="hover:bg-[#FFF7F9]">
                    <td className="px-4 py-3 border-b border-[#F2D9DF] font-medium text-[#2A0410]">
                      {formatAction(log.activityType)}
                    </td>

                    <td className="px-4 py-3 border-b border-[#F2D9DF] text-gray-600">
                      {log.activityDetails}
                    </td>

                    <td className="px-4 py-3 border-b border-[#F2D9DF] text-gray-600">
                      {formatDate(log.logTimestamp)}
                    </td>

                    <td className="px-4 py-3 border-b border-[#F2D9DF] text-gray-600">
                      {formatTime(log.logTimestamp)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </Card>
  )
}