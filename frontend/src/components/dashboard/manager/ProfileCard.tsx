import notif_icon from "../../../assets/icons/notif_icon.svg"
import report_icon from "../../../assets/icons/report.svg"
import default_pfp from "../../../assets/defaults/female-pfp.png"

import { useState, useRef, useEffect } from "react"
import ReportModal from "../../ReportModal"
import NotificationPanel from "../../NotificationPanel"


type ProfileCardProps = {
    fullName: string
    role: string
    email: string
    phoneNumber: string
    dormitory: string
    status: string
    onNotification?: () => void
}

const CLR = {
    dark:   "#3D0718",
    mid:    "#6B0F2B",
    accent: "#8C1535",
    gold:   "#C9973A",
    goldLt: "#E8C37A",
    goldDk: "#a07825",
} as const

export default function ProfileCard({
    fullName,
    role,
    email,
    phoneNumber,
    dormitory,
    status,
    onNotification,
}: ProfileCardProps) {
    //Report state
    const [reportOpen, setReportOpen] = useState(false)

    // Notification panel state
    const [notifOpen, setNotifOpen] = useState(false)
    const notifWrapperRef = useRef<HTMLDivElement>(null)
    const [unreadCount, setUnreadCount] = useState(0)   // from panel callback

    return (
        <>
            <ReportModal open={reportOpen} onClose={() => setReportOpen(false)} />

            <div
                className="relative rounded-b-[30px] px-7 pt-6 pb-6 shadow-lg"
                style={{ background: `linear-gradient(145deg, ${CLR.dark} 0%, ${CLR.mid} 60%, ${CLR.accent} 100%)` }}
            >
                {/* Top bar overlay */}
                <div
                    className="absolute top-0 left-0 w-full h-[79px] pointer-events-none"
                    style={{ background: "linear-gradient(90deg, #7A0C23 0%, #A61C3C 100%)" }}
                />

                <div className="relative z-10">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <span className="text-sm font-bold tracking-widest uppercase text-white/75">
                            My Profile
                        </span>

                        <div className="flex flex-row gap-2">
                            {/* Report button */}
                            <button
                                onClick={() => setReportOpen(true)}
                                className="w-12 h-11 rounded-2xl flex items-center justify-center relative overflow-hidden 
                                        transition-all duration-150
                                        bg-white/10 hover:bg-white/20 active:bg-white/30
                                        hover:-translate-y-1 active:translate-y-0 active:scale-95"
                            >
                                <img src={report_icon} alt="Report" className="w-full h-full object-contain scale-[2.5]" />
                            </button>

                            {/* Notification button + panel */}
                            <div ref={notifWrapperRef} className="relative">
                                <button
                                    onClick={() => {
                                        setNotifOpen((prev) => !prev)
                                        onNotification?.()
                                    }}
                                    className="w-12 h-11 rounded-2xl flex items-center justify-center relative overflow-hidden 
                                            transition-all duration-150
                                            bg-white/10 hover:bg-white/20 active:bg-white/30
                                            hover:-translate-y-1 active:translate-y-0 active:scale-95"
                                >
                                    <img src={notif_icon} alt="Notifications" className="w-full h-full object-contain scale-[2.5]" />
                                    {unreadCount > 0 && (
                                        <span
                                            className="absolute top-0.5 right-1 w-3 h-3 rounded-full border-2 border-white/80"
                                            style={{ background: CLR.gold }}
                                        />
                                    )}
                                </button>

                                <NotificationPanel
                                    open={notifOpen}
                                    onClose={() => setNotifOpen(false)}
                                    wrapperRef={notifWrapperRef}
                                    onUnreadCountChange={setUnreadCount}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Avatar + Name */}
                    <div className="flex items-center gap-4">
                        <div className="relative flex-shrink-0">
                            <div
                                className="w-[78px] h-[78px] rounded-full bg-white/20 flex items-center justify-center border-[4px] overflow-hidden shadow-md"
                                style={{ borderColor: CLR.gold }}
                            >
                                <img src={default_pfp} alt={fullName} className="w-full h-full object-cover" />
                            </div>
                            <div className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-green-600 border-[3px] border-white flex items-center justify-center">
                                <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                        </div>

                        <div className="min-w-0">
                            <p className="text-white font-bold text-[20px] leading-tight">{fullName}</p>
                            <p className="text-[15px] font-bold leading-tight mt-1" style={{ color: CLR.goldLt }}>{role}</p>
                            <p className="text-white/70 text-sm mt-1 truncate">{email}</p>
                            <p className="text-white/70 text-sm">{phoneNumber}</p>
                        </div>
                    </div>

                    {/* Footer details */}
                    <div className="mt-6 grid grid-cols-2 gap-4">
                        {[
                            { label: "Dormitory", value: dormitory },
                            { label: "Status",    value: status    },
                        ].map((item) => (
                            <div key={item.label} className={item.label === "Status" ? "flex flex-col items-center" : ""}>
                                <p className="text-white/50 text-[10px] font-medium leading-tight mb-1.5 uppercase tracking-wider">
                                    {item.label}
                                </p>
                                {item.label === "Status" ? (
                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold capitalize
                                        ${item.value.toLowerCase() === "active"
                                            ? "bg-[#2D7A4A]/35 text-[#6FD49A] border border-[#2D7A4A]/50"
                                            : "bg-[#7A2D2D]/35 text-[#D46F6F] border border-[#7A2D2D]/70"
                                        }`}
                                    >
                                        {item.value}
                                    </span>
                                ) : (
                                    <p className="text-white text-[14px] font-bold leading-tight">{item.value}</p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    )
}