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
        <div className="mb-8">
          <h4 className="text-xl font-semibold text-[#2A0410]">
            Activity Logs
          </h4>
          <p className="mt-1 text-sm text-gray-500">
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
        <div className="max-h-[320px] overflow-y-auto">
          <table className="min-w-full border-separate border-spacing-0 text-sm">
            
            {/* HEADER */}
            <thead className="sticky top-0 bg-white z-10">
              <tr>
                <th className="border-y border-[#F2D9DF] px-4 py-4 text-left text-sm font-semibold uppercase tracking-wide text-[#A06B7C]">
                  Action
                </th>
                <th className="border-y border-[#F2D9DF] px-4 py-4 text-left text-sm font-semibold uppercase tracking-wide text-[#A06B7C]">
                  Details
                </th>
                <th className="border-y border-[#F2D9DF] px-4 py-4 text-left text-sm font-semibold uppercase tracking-wide text-[#A06B7C]">
                  Date
                </th>
                <th className="border-y border-[#F2D9DF] px-4 py-4 text-left text-sm font-semibold uppercase tracking-wide text-[#A06B7C]">
                  Time
                </th>
              </tr>
            </thead>

            {/* BODY */}
            <tbody>
              {logs.map((log: any) => (
                <tr key={log.id}>
                  <td className="border-b border-[#F2D9DF] px-4 py-4 text-sm font-semibold text-[#A06B7C]">
                    {formatAction(log.activityType)}
                  </td>

                  <td className="border-b border-[#F2D9DF] px-4 py-4 text-sm text-gray-600">
                    {log.activityDetails}
                  </td>

                  <td className="border-b border-[#F2D9DF] px-4 py-4 text-sm text-[#A06B7C]">
                    {formatDate(log.logTimestamp)}
                  </td>

                  <td className="border-b border-[#F2D9DF] px-4 py-4 text-sm text-[#A06B7C]">
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