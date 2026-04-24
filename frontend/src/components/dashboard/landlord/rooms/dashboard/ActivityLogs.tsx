import Card from "../../../../ui/Card"

type LogEntry = {
  id: number
  activityDetails?: string
  logTimestamp?: string
  actor?: {
    fname: string
    lname: string
  }
}

type Props = {
  data?: LogEntry[]
}

export default function ActivityLogs({ data = [] }: Props) {
  return (
    <Card>
      <p className="text-[#1A0008] font-bold mb-3">Recent Activity</p>
      {data.length === 0 ? (
        <p className="text-gray-400 text-sm italic">No recent activity</p>
      ) : (
        <div className="flex flex-col gap-2">
          {data.slice(0, 5).map((log) => (
            <div key={log.id} className="flex flex-col text-sm border-b border-[#F5ECF0] pb-2 last:border-b-0">
              <p className="text-[#1A0008]">{log.activityDetails || 'No details'}</p>
              <p className="text-[#9A7080] text-xs">
                {log.logTimestamp && new Date(log.logTimestamp).toLocaleString()}
                {log.actor ? ` by ${log.actor.fname} ${log.actor.lname}` : ''}
              </p>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}