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
      .toLowerCase()
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
    <Card className="shadow-sm space-y-6 p-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-row justify-between w-full">
          <div className="flex flex-col justify-center">
            <h4 className="text-[16px] font-bold text-[#2A0410]">
              Activity Logs
            </h4>
            <p className="text-[13px] italic">
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
      </div>

      {isLoading ? (
        <p className="text-sm text-gray-500">Loading...</p>
      ) : isError ? (
        <p className="text-sm text-red-500">Error loading logs.</p>
      ) : logs.length === 0 ? (
        <p className="text-sm text-gray-500">No logs found.</p>
      ) : (
        <div className="flex flex-col">
          <div className="max-h-[320px] overflow-y-auto">
            <table className="min-w-full border-separate border-spacing-0 text-sm">
          
              {/* HEADER */}
              <thead className="sticky top-0 bg-white z-10">
                <tr>
                  <th className="border-y border-[#F2D9DF] px-2 py-2 text-left text-[12px] font-bold uppercase tracking-widest text-[#A06B7C]">
                    Action
                  </th>
                  <th className="border-y border-[#F2D9DF] px-2 py-2 text-left text-[12px] font-bold uppercase tracking-widest text-[#A06B7C]">
                    Details
                  </th>
                  <th className="border-y border-[#F2D9DF] px-2 py-2 text-left text-[12px] font-bold uppercase tracking-widest text-[#A06B7C]">
                    Date
                  </th>
                  <th className="border-y border-[#F2D9DF] px-2 py-2 text-left text-[12px] font-bold uppercase tracking-widest text-[#A06B7C]">
                    Time
                  </th>
                </tr>
              </thead>
              {/* BODY */}
              <tbody>
                {logs.map((log: any) => (
                  <tr key={log.id}>
                    <td className=" border-[#F2D9DF] px-2 py-2 text-sm text-[#A06B7C]">
                      {formatAction(log.activityType)}
                    </td>
                    <td className=" border-[#F2D9DF] px-2 py-2 text-sm text-gray-600">
                      {log.activityDetails}
                    </td>
                    <td className=" border-[#F2D9DF] px-2 py-2 text-sm text-[#A06B7C]">
                      {formatDate(log.logTimestamp)}
                    </td>
                    <td className="border-[#F2D9DF] px-2 py-2 text-sm text-[#A06B7C]">
                      {formatTime(log.logTimestamp)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <hr className="border-t border-[#F2D9DF]"/>
        </div>
      )}
    </Card>
  )
}