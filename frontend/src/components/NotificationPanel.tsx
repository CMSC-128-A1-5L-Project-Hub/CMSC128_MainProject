import { useEffect, useState } from "react"

export type NotificationType = "application_status" | "other" | "system" | "fee_due" | "move_out_request" | "move_out_request_response"

export type Notification = {
    id: number
    notificationType?: string  // Changed from 'type' to match API
    notificationContent?: string  // Changed from 'message'
    notificationTimestamp?: string  // Changed from 'time'
    readStatus?: string  // Changed from 'read' (boolean)
    type?: NotificationType  // Keep for compatibility
    message?: string
    time?: string
    read?: boolean
}

export const TYPE_STYLES: Record<string, { label: string; bg: string; text: string }> = {
    application_status: { label: "Application", bg: "bg-[#6B0F2B]/10", text: "text-[#6B0F2B]" },
    fee_due:            { label: "Fee due",     bg: "bg-[#B45309]/10", text: "text-[#B45309]" },
    move_out_request:   { label: "Move Out",    bg: "bg-[#C9973A]/10", text: "text-[#C9973A]" },
    move_out_request_response: { label: "Move Out", bg: "bg-[#C9973A]/10", text: "text-[#C9973A]" },
    other:              { label: "Other",       bg: "bg-[#2563EB]/10", text: "text-[#2563EB]" },
    system:             { label: "System",      bg: "bg-[#5F5E5A]/10", text: "text-[#5F5E5A]" },
}

type Tab = "unread" | "all"

type NotificationPanelProps = {
    open: boolean
    notifications: Notification[]
    unreadCount: number
    onMarkAllRead: () => void
    onMarkOneRead: (id: number) => void
    onClose: () => void
    wrapperRef: React.RefObject<HTMLDivElement | null>
}

// Helper function to safely get notification type
const getNotificationType = (notif: Notification): string => {
    return notif.notificationType || notif.type || "other"
}

// Helper function to safely get notification message
const getNotificationMessage = (notif: Notification): string => {
    return notif.notificationContent || notif.message || "No message"
}

// Helper function to safely get notification time
const getNotificationTime = (notif: Notification): string => {
    const timestamp = notif.notificationTimestamp || notif.time
    if (!timestamp) return "Just now"
    
    try {
        const date = new Date(timestamp)
        const now = new Date()
        const diffMs = now.getTime() - date.getTime()
        const diffMins = Math.floor(diffMs / 60000)
        const diffHours = Math.floor(diffMs / 3600000)
        const diffDays = Math.floor(diffMs / 86400000)
        
        if (diffMins < 1) return "Just now"
        if (diffMins < 60) return `${diffMins} min ago`
        if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
        return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
    } catch {
        return "Just now"
    }
}

// Helper function to safely check if notification is read
const isNotificationRead = (notif: Notification): boolean => {
    if (notif.read !== undefined) return notif.read
    return notif.readStatus === 'read'
}

export default function NotificationPanel({
    open,
    notifications,
    unreadCount,
    onMarkAllRead,
    onMarkOneRead,
    onClose,
    wrapperRef,
}: NotificationPanelProps) {
    const [activeTab, setActiveTab] = useState<Tab>("unread")

    useEffect(() => {
        if (!open) return
        const handler = (e: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
                onClose()
            }
        }
        document.addEventListener("mousedown", handler)
        return () => document.removeEventListener("mousedown", handler)
    }, [open, onClose, wrapperRef])

    // Filter notifications based on selected tab
    const shown = activeTab === "unread"
        ? notifications.filter(n => !isNotificationRead(n))
        : notifications

    const tabClass = (tab: Tab) =>
        `text-[12px] font-medium px-3 py-[5px] rounded-t-md border-none cursor-pointer transition-colors
        ${activeTab === tab
            ? "bg-[#6B0F2B] text-white"
            : "bg-transparent text-[#9A7A82] hover:text-[#6B0F2B]"
        }`

    const panelWidth = "w-[300px] lg:w-[340px]"

    return (
        <div
            className={`
                absolute right-0 top-[calc(100%+10px)] ${panelWidth}
                bg-white rounded-2xl border border-[#6B0F2B]/10 z-50 overflow-hidden
                shadow-xl origin-top-right
                transition-all duration-200 ease-out
                ${open
                    ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
                    : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
                }
            `}
        >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#6B0F2B]/8">
                <span className="text-[13px] font-bold text-[#3D0718]">
                    Notifications
                    {unreadCount > 0 && (
                        <span
                            className="ml-1.5 text-[11px] font-semibold text-white px-1.5 py-0.5 rounded-full"
                            style={{ background: "#6B0F2B" }}
                        >
                            {unreadCount}
                        </span>
                    )}
                </span>
                {unreadCount > 0 && (
                    <button
                        onClick={onMarkAllRead}
                        className="text-[11px] text-[#9E2040] hover:underline"
                    >
                        Mark all as read
                    </button>
                )}
            </div>

            {/* Tabs */}
            <div className="flex gap-1 px-4 py-2 border-b border-[#6B0F2B]/8">
                <button className={tabClass("unread")} onClick={() => setActiveTab("unread")}>
                    Unread
                </button>
                <button className={tabClass("all")} onClick={() => setActiveTab("all")}>
                    All
                </button>
            </div>

            {/* List */}
            <ul className="max-h-[320px] overflow-y-auto divide-y divide-[#6B0F2B]/6">
                {shown.length === 0 ? (
                    <li className="px-4 py-7 text-center text-[12px] text-[#9A7A82]">
                        {activeTab === "unread" ? "No unread notifications" : "No notifications"}
                    </li>
                ) : (
                    shown.map((n) => {
                        const typeKey = getNotificationType(n)
                        const style = TYPE_STYLES[typeKey] || TYPE_STYLES.other
                        const isRead = isNotificationRead(n)
                        
                        return (
                            <li
                                key={n.id}
                                onClick={() => onMarkOneRead(n.id)}
                                className={`flex gap-3 px-4 py-3 cursor-pointer transition-colors
                                    ${isRead
                                        ? "bg-white hover:bg-[#F5EEF0]/50"
                                        : "bg-[#FDF6F8] hover:bg-[#FAF0F3]"
                                    }`}
                            >
                                <div className="mt-1.5 flex-shrink-0 w-2 h-2">
                                    {!isRead && (
                                        <div className="w-2 h-2 rounded-full" style={{ background: "#C9973A" }} />
                                    )}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-md mb-1 ${style.bg} ${style.text}`}>
                                        {style.label}
                                    </span>
                                    <p className="text-[12px] text-[#1A0008] leading-snug break-words">
                                        {getNotificationMessage(n)}
                                    </p>
                                    <p className="text-[11px] text-[#9A7A82] mt-0.5">
                                        {getNotificationTime(n)}
                                    </p>
                                </div>
                            </li>
                        )
                    })
                )}
            </ul>
        </div>
    )
}