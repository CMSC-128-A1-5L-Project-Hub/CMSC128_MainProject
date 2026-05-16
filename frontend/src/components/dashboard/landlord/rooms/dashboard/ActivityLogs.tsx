// app/components/dashboard/landlord/rooms/dashboard/ActivityLogs.tsx
import { Clock, User, Bell, CheckCircle, AlertCircle, Calendar, Activity, ExternalLink } from "lucide-react"
import type { RawLog } from "../../../../../stores/useDashboardStore"

type Props = {
  data?: RawLog[]
}

const getActivityIcon = (activityType: string) => {
  const type = activityType?.toLowerCase() || ''
  if (type.includes('application') || type.includes('approved') || type.includes('review')) return CheckCircle
  if (type.includes('reject') || type.includes('cancelled') || type.includes('failed')) return AlertCircle
  if (type.includes('move') || type.includes('transfer')) return Calendar
  if (type.includes('payment') || type.includes('fee')) return Activity
  return Bell
}

const getActivityColor = (activityType: string) => {
  const type = activityType?.toLowerCase() || ''
  if (type.includes('application') || type.includes('approved') || type.includes('review')) return { bg: "#1A7A4A", light: "rgba(26, 122, 74, 0.1)" }
  if (type.includes('reject') || type.includes('cancelled') || type.includes('failed')) return { bg: "#9E2040", light: "rgba(158, 32, 64, 0.1)" }
  if (type.includes('move') || type.includes('transfer')) return { bg: "#C9973A", light: "rgba(201, 151, 58, 0.1)" }
  if (type.includes('payment') || type.includes('fee')) return { bg: "#6B3AB7", light: "rgba(107, 58, 183, 0.1)" }
  return { bg: "#6B0F2B", light: "rgba(107, 15, 43, 0.1)" }
}

function timeAgo(date: Date) {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000)
  
  if (seconds < 60) return `${seconds} seconds ago`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`
  const weeks = Math.floor(days / 7)
  return `${weeks} week${weeks > 1 ? 's' : ''} ago`
}

export default function ActivityLogs({ data = [] }: Props) {
  // Only show the 5 most recent logs
  const recentLogs = data.slice(0, 5)

  return (
    <div className="bg-white rounded-xl shadow-sm border border-[#E8D0D8] overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-[#E8D0D8] bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#6B0F2B] to-[#8C1535] flex items-center justify-center">
              <Activity size={14} className="text-white" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-[#9A7080] uppercase tracking-wider">Latest Updates</p>
              <p className="text-[13px] font-bold text-[#1A0008] leading-tight">Activity Logs</p>
            </div>
          </div>
          {recentLogs.length > 0 && (
            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#6B0F2B]/10 text-[#6B0F2B]">
              {recentLogs.length} new
            </span>
          )}
        </div>
      </div>

      {/* Content - Only 5 items */}
      <div className="divide-y divide-[#F5ECF0] max-h-[400px] overflow-y-auto">
        {recentLogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
              <Bell size={20} className="text-gray-300" />
            </div>
            <p className="text-gray-400 text-sm font-medium">No recent activity</p>
            <p className="text-gray-300 text-xs mt-1">New updates will appear here</p>
          </div>
        ) : (
          recentLogs.map((log) => {
            const Icon = getActivityIcon(log.activityType)
            const colors = getActivityColor(log.activityType)
            const logDate = log.logTimestamp ? new Date(log.logTimestamp) : new Date()
            const isToday = logDate.toDateString() === new Date().toDateString()
            
            return (
              <div key={log.id} className="group hover:bg-gray-50 transition-colors duration-150">
                <div className="p-3">
                  <div className="flex gap-3">
                    {/* Icon Circle */}
                    <div className="flex-shrink-0">
                      <div 
                        className="w-8 h-8 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105"
                        style={{ background: colors.light }}
                      >
                        <Icon size={14} style={{ color: colors.bg }} />
                      </div>
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-semibold text-[#1A0008] leading-relaxed">
                        {log.activityDetails || log.activityType?.replace(/_/g, ' ') || 'Activity recorded'}
                      </p>
                      
                      <div className="flex items-center gap-3 mt-1.5">
                        <div className="flex items-center gap-1">
                          <Clock size={10} className="text-[#9A7080]" />
                          <span className="text-[10px] text-[#9A7080] font-medium">
                            {isToday ? timeAgo(logDate) : logDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                        
                        {log.actor && (
                          <div className="flex items-center gap-1">
                            <User size={10} className="text-[#9A7080]" />
                            <span className="text-[10px] text-[#9A7080] font-medium">
                              {log.actor.fname} {log.actor.lname}
                            </span>
                          </div>
                        )}
                        
                        <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                          <ExternalLink size={10} className="text-[#9A7080]" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

    </div>
  )
}