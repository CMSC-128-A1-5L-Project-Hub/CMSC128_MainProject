import Card from "@/components/ui/Card"

type ActivityLogsProps = {
  logs: any[]
  isLoading: boolean
  isError: boolean
  filterDate: string
  filterAction: string
  onFilterDateChange: (value: string) => void
  onFilterActionChange: (value: string) => void
}

export default function ActivityLogs({
  logs,
  isLoading,
  isError,
  filterDate,
  filterAction,
  onFilterDateChange,
  onFilterActionChange,
}: ActivityLogsProps) {
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
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
        <div>
          <h2 className="text-lg font-bold text-[#2A0410]">
            Activity Logs
          </h2>
          <p className="text-xs text-gray-500">
            Filter logs by date and action type.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="date"
            value={filterDate}
            onChange={(e) => onFilterDateChange(e.target.value)}
            className="border border-[#F2D9DF] rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9973A]"
          />

          <select
            value={filterAction}
            onChange={(e) => onFilterActionChange(e.target.value)}
            className="border border-[#F2D9DF] rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9973A]"
          >
            <option value="">All Actions</option>
            <option value="application">Application</option>
            <option value="assignment">Assignment</option>
            <option value="payment">Payment</option>
            <option value="room">Room</option>
            <option value="account">Account</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <p className="text-sm text-gray-500">Loading...</p>
      ) : isError ? (
        <p className="text-sm text-red-500">Error loading logs.</p>
      ) : logs.length === 0 ? (
        <p className="text-sm text-gray-500">No logs found.</p>
      ) : (
        <div className="overflow-x-auto">
          <div className="max-h-[320px] overflow-y-auto rounded-xl border border-[#F2D9DF]">
            <table className="min-w-full text-sm">
              <thead className="bg-[#FFF7F9] sticky top-0">
                <tr>
                  <th className="text-left px-4 py-3 border-b border-[#F2D9DF]">
                    Action
                  </th>
                  <th className="text-left px-4 py-3 border-b border-[#F2D9DF]">
                    Details
                  </th>
                  <th className="text-left px-4 py-3 border-b border-[#F2D9DF]">
                    Date
                  </th>
                  <th className="text-left px-4 py-3 border-b border-[#F2D9DF]">
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