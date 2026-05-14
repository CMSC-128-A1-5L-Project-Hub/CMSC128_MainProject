import { useEffect, useState } from "react"

export type NotificationType = "application_status" | "other" | "system" | "fee_due"

export type Notification = {
    id: number
    type: NotificationType
    message: string
    time: string
    read: boolean
}

export const TYPE_STYLES: Record<NotificationType, { label: string; bg: string; text: string }> = {
    application_status: { label: "Application", bg: "bg-[#6B0F2B]/10", text: "text-[#6B0F2B]" },
    fee_due:            { label: "Fee due",     bg: "bg-[#B45309]/10", text: "text-[#B45309]" },
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

export default function NotificationPanel({
    open,
    notifications,
    unreadCount,
    onMarkAllRead,
    onMarkOneRead,
    onClose,
    wrapperRef,
}: NotificationPanelProps) {
    //active tab state
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

    //notif filtering based on selected tab
    const shown = activeTab === "unread"
        ? notifications.filter(n => !n.read)
        : notifications

    const tabClass = (tab: Tab) =>
        `text-[12px] font-medium px-3 py-[5px] rounded-t-md border-none cursor-pointer transition-colors
        ${activeTab === tab
            ? "bg-[#6B0F2B] text-white"
            : "bg-transparent text-[#9A7A82] hover:text-[#6B0F2B]"
        }`

    //di pwede inline so dito na lang
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
                        No unread notifications
                    </li>
                ) : (
                    shown.map((n) => {
                        const style = TYPE_STYLES[n.type]
                        return (
                            <li
                                key={n.id}
                                onClick={() => onMarkOneRead(n.id)}
                                className={`flex gap-3 px-4 py-3 cursor-pointer transition-colors
                                    ${n.read
                                        ? "bg-white hover:bg-[#F5EEF0]/50"
                                        : "bg-[#FDF6F8] hover:bg-[#FAF0F3]"
                                    }`}
                            >
                                <div className="mt-1.5 flex-shrink-0 w-2 h-2">
                                    {!n.read && (
                                        <div className="w-2 h-2 rounded-full" style={{ background: "#C9973A" }} />
                                    )}
                                </div>
                                <div className="min-w-0">
                                    <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-md mb-1 ${style.bg} ${style.text}`}>
                                        {style.label}
                                    </span>
                                    <p className="text-[12px] text-[#1A0008] leading-snug">{n.message}</p>
                                    <p className="text-[11px] text-[#9A7A82] mt-0.5">{n.time}</p>
                                </div>
                            </li>
                        )
                    })
                )}
            </ul>
        </div>
    )
}