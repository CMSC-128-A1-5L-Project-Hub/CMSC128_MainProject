import notif_icon from "../../../assets/icons/notif_icon.svg"
import report_icon from "../../../assets/icons/report.svg"
import edit_icon from "../../../assets/icons/edit.svg"
import default_pfp from "../../../assets/defaults/female-pfp.png"

import { useState, useRef, useEffect } from "react"
import Modal from "../../Modal"
import Button from "../../Button"
import ReportModal from "../../ReportModal"
import NotificationPanel, { type Notification } from "../../NotificationPanel"
import { useNotifications } from "../../../hooks/useNotifications"
import { api } from "../../../api/axios"

type ProfileCardProps = {
    fullName?: string
    role?: string
    email?: string
    phoneNumber?: string
    dormitory?: string
    status?: string
    onNotification?: () => void
    showReplaceButton?: boolean
    accommodationId?: number
    onManagerReplaced?: () => void
    setToast?: (t: { show: boolean; type: "success" | "error" | "info" | "warning" | "loading"; title: string; message?: string }) => void
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
    status = "pending",
    onNotification,
    showReplaceButton = false,
    accommodationId,
    onManagerReplaced,
    setToast
}: ProfileCardProps) {
    const [reportOpen, setReportOpen] = useState(false)
    const [editModalOpen, setEditModalOpen] = useState(false)
    const [replacementEmail, setReplacementEmail] = useState("")
    const [inviteSubmitting, setInviteSubmitting] = useState(false)
    const [inviteError, setInviteError] = useState<string | null>(null)

    const handleSendInvite = async () => {
        if (!accommodationId) {
            setInviteError("Missing accommodation context.")
            return
        }
        if (!replacementEmail.trim()) {
            setInviteError("Please enter an email.")
            return
        }
        setInviteError(null)
        setInviteSubmitting(true)
        try {
            await api.post(`/landlord/accommodations/${accommodationId}/invite-manager`, {
                manager_email: replacementEmail.trim(),
            })
            setEditModalOpen(false)
            setReplacementEmail("")
            onManagerReplaced?.()
            setToast?.({ show: true, type: "success", title: "Invite Sent!", message: "The manager invitation has been sent successfully." })
        } catch (e: any) {
            setInviteError(e?.response?.data?.message ?? "Failed to send invite.")
            setToast?.({ show: true, type: "error", title: "Invite Failed", message: e?.response?.data?.message ?? "Could not send the invitation." })
        } finally {
            setInviteSubmitting(false)
        }
    }

    const [notifOpen, setNotifOpen]         = useState(false)
    const notifWrapperRef                   = useRef<HTMLDivElement>(null)
    const { notifications, unreadCount, markAllRead, markOneRead } = useNotifications({ refetchOn: notifOpen })

    const isActive = status === "assigned" || status === "active" || status === "Active"
    const isNoManager = status === "none"

    const handleCloseEditModal = () => {
        setEditModalOpen(false)
        setReplacementEmail("")
        setInviteError(null)
    }

    return (
        <>
            {/* ReportModal - only when NOT in landlord dashboard */}
            {!showReplaceButton && (
                <ReportModal open={reportOpen} onClose={() => setReportOpen(false)} />
            )}

            {/* Replace/Invite Manager Modal */}
            {showReplaceButton && (
                <Modal
                    open={editModalOpen}
                    onClose={handleCloseEditModal}
                    title={isNoManager ? "Invite a Manager" : "Replace Your Manager"}
                    eyebrow="Manager Profile"
                    footer={
                        <div className="flex flex-row justify-end w-full">
                            <Button
                                variant="primary"
                                size="md"
                                onClick={handleSendInvite}
                                disabled={inviteSubmitting}
                                type="button"
                            >
                                {inviteSubmitting ? "Sending..." : "Send Invite"}
                            </Button>
                        </div>
                    }
                >
                    <div className="flex flex-col gap-4">
                        {isNoManager && (
                            <p className="text-sm text-gray-500">
                                This accommodation doesn't have a manager yet. Enter the email of the person you want to invite.
                            </p>
                        )}
                        <div>
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                                Invite using their Google Account
                            </p>
                            <input
                                className="w-full border border-[#6B0F2B3E] rounded-xl px-4 py-2.5 text-sm outline-none transition focus:border-[#8C1535] focus:ring-2 focus:ring-[#8C1535]/30"
                                placeholder="email@example.com"
                                type="email"
                                value={replacementEmail}
                                onChange={(e) => setReplacementEmail(e.target.value)}
                                disabled={inviteSubmitting}
                            />
                            {inviteError && (
                                <p className="text-xs text-red-600 mt-2">{inviteError}</p>
                            )}
                        </div>
                    </div>
                </Modal>
            )}

            <div
                className="relative rounded-b-[30px] px-7 pt-6 pb-6 shadow-lg"
                style={{ background: `linear-gradient(145deg, ${CLR.dark} 0%, ${CLR.mid} 60%, ${CLR.accent} 100%)` }}
            >
                <div
                    className="absolute top-0 left-0 w-full h-[79px] pointer-events-none"
                    style={{ background: "linear-gradient(90deg, #7A0C23 0%, #A61C3C 100%)" }}
                />

                <div className="relative z-10">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <span className="text-sm font-bold tracking-widest uppercase text-white/75">
                            {showReplaceButton ? "Manager Profile" : "My Profile"}
                        </span>

                        <div className="flex flex-row gap-2">
                            {/* Report button - only when NOT in landlord dashboard */}
                            {!showReplaceButton && (
                                <button
                                    onClick={() => setReportOpen(true)}
                                    className="w-12 h-11 rounded-2xl flex items-center justify-center relative overflow-hidden
                                            transition-all duration-150
                                            bg-white/10 hover:bg-white/20 active:bg-white/30
                                            hover:-translate-y-1 active:translate-y-0 active:scale-95"
                                >
                                    <img src={report_icon} alt="Report" className="w-full h-full object-contain scale-[2.5]" />
                                </button>
                            )}

                            {/* Invite/Replace manager button - only when in landlord dashboard */}
                            {showReplaceButton && (
                                <button
                                    onClick={() => setEditModalOpen(true)}
                                    className="w-12 h-11 rounded-2xl flex items-center justify-center relative overflow-hidden
                                            transition-all duration-150
                                            bg-white/10 hover:bg-white/20 active:bg-white/30
                                            hover:-translate-y-1 active:translate-y-0 active:scale-95"
                                >
                                    <img
                                        src={edit_icon}
                                        alt={isNoManager ? "Invite manager" : "Replace manager"}
                                        className="w-full h-full object-contain scale-[2.5] brightness-0 invert"
                                    />
                                </button>
                            )}

                            {/* Notification button */}
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
                                    notifications={notifications}
                                    unreadCount={unreadCount}
                                    onMarkAllRead={markAllRead}
                                    onMarkOneRead={markOneRead}
                                    onClose={() => setNotifOpen(false)}
                                    wrapperRef={notifWrapperRef}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Avatar + Name - Show invite prompt when no manager */}
                    {isNoManager ? (
                        <div className="flex flex-col items-center gap-3 py-4">
                            <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center">
                                <svg className="w-8 h-8 text-white/40" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                                </svg>
                            </div>
                            <p className="text-white/60 text-sm text-center">No manager assigned yet</p>
                            <button
                                onClick={() => setEditModalOpen(true)}
                                className="mt-2 px-5 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white text-sm font-semibold transition-all border border-white/20"
                            >
                                + Invite Manager
                            </button>
                        </div>
                    ) : (
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
                    )}

                    {/* Footer details - only show when manager exists */}
                    {!isNoManager && (
                        <div className="mt-6 grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-white/50 text-[10px] font-medium leading-tight mb-1.5 uppercase tracking-wider">
                                    Dormitory
                                </p>
                                <p className="text-white text-[14px] font-bold leading-tight">{dormitory}</p>
                            </div>
                            <div className="flex flex-col items-center">
                                <p className="text-white/50 text-[10px] font-medium leading-tight mb-1.5 uppercase tracking-wider">
                                    Status
                                </p>
                                <span
                                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold capitalize
                                        ${isActive
                                            ? "bg-[#2D7A4A]/35 text-[#6FD49A] border border-[#2D7A4A]/50"
                                            : "bg-[#7A2D2D]/35 text-[#D46F6F] border border-[#7A2D2D]/70"
                                        }`}
                                >
                                    {isActive ? "Active" : status ?? "Pending"}
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}