import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../api/axios";

import Sidebar from "../../components/Sidebar";
import NotificationPanel, { type Notification } from "../../components/NotificationPanel";
import Modal from "../../components/Modal";
import Button from "../../components/Button";
import Toast from "../../components/Toast";
import CustomHeader from "../../components/CustomHeader";

import Bell from "../../assets/icons/bell_icon.svg?react";
import Camera from "../../assets/icons/camera.svg";
import Pencil from "../../assets/icons/edit.svg";
import Save from "../../assets/icons/save.svg";
import notif_icon from "../../assets/icons/notif_icon.svg";
import { ChevronDown, ChevronUp } from "lucide-react";

interface ProfileData {
    fullName: string;
    email: string;
    facebook: string;
    phone: string;
    altPhone: string;
    accommodations: { name: string; type: string }[];
}

async function checkPhoneDuplicate(phone: string): Promise<boolean> {
    try {
        const res = await api.get(`/check-phone/${phone}`);
        return res.data.exists;
    } catch {
        return false;
    }
}

function isValidPhilippinePhone(phone: string): boolean {
    const cleaned = phone.replace(/\D/g, "");
    return cleaned.length === 11 && cleaned.startsWith("09");
}

export default function LandlordProfile() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [editing, setEditing] = useState(false);
    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [profileLoading, setProfileLoading] = useState(true);
    const [tempImage, setTempImage] = useState<string | null>(null);
    const [showAllDorms, setShowAllDorms] = useState(false);

    // OTP Modal states
    const [otpModalOpen, setOtpModalOpen] = useState(false);
    const [otpCode, setOtpCode] = useState("");
    const [otpSent, setOtpSent] = useState(false);
    const [otpError, setOtpError] = useState<string | null>(null);
    const [pendingPhone, setPendingPhone] = useState("");
    const [isSendingOtp, setIsSendingOtp] = useState(false);
    const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

    // Toast state
    const [toast, setToast] = useState<{ show: boolean; type: "success" | "error" | "info"; title: string; message?: string }>({
        show: false, type: "success", title: ""
    });

    const [notifOpen, setNotifOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const notifWrapperRef = useRef<HTMLDivElement>(null);

    const { data: user, isError } = useQuery({
        queryKey: ["me"],
        queryFn: async () => {
            const res = await api.get("/me");
            return res.data;
        },
    });

    const uploadPfpMutation = useMutation({
        mutationFn: async (file: File) => {
            const formData = new FormData();
            formData.append("profilePicture", file);
            const res = await api.post("/me/profile-picture", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["me"] });
            setTempImage(null);
            setToast({ show: true, type: "success", title: "Photo Updated!", message: "Your profile picture has been updated." });
        },
        onError: () => {
            setToast({ show: true, type: "error", title: "Upload Failed", message: "Failed to upload photo." });
        },
    });

    const getInitials = (fullName: string) => {
        return fullName.split(" ").map((n) => n[0]).join("").toUpperCase().substring(0, 2);
    };

    const update = (k: keyof ProfileData, v: string) =>
        setProfile((prev) => (prev ? { ...prev, [k]: v } : prev));

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (!file.type.startsWith("image/")) {
                setToast({ show: true, type: "error", title: "Invalid File", message: "Please upload an image file (JPG, PNG, or WEBP)." });
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                setToast({ show: true, type: "error", title: "File Too Large", message: "Image must be under 5MB." });
                return;
            }
            const imageUrl = URL.createObjectURL(file);
            setTempImage(imageUrl);
            uploadPfpMutation.mutate(file);
        }
    };

    const handlePhoneChange = (value: string) => {
        const cleaned = value.replace(/\D/g, "").slice(0, 11);
        setPendingPhone(cleaned);
    };

    const handleAltPhoneChange = (value: string) => {
        const cleaned = value.replace(/\D/g, "").slice(0, 11);
        update("altPhone", cleaned);
    };

    const handleSendOtp = async () => {
        const phone = pendingPhone.replace(/\D/g, "");
        
        if (!isValidPhilippinePhone(phone)) {
            setOtpError("Phone number must be 11 digits and start with 09 (e.g., 09123456789).");
            return;
        }

        const isDuplicate = await checkPhoneDuplicate(phone);
        if (isDuplicate) {
            setOtpError("This phone number is already registered to another account.");
            return;
        }

        setIsSendingOtp(true);
        setOtpError(null);
        try {
            await api.post("/auth/send-otp", { phoneNumber: phone });
            setOtpSent(true);
            setToast({ show: true, type: "info", title: "OTP Sent", message: "A verification code has been sent to your phone." });
        } catch (err: any) {
            setOtpError(err?.response?.data?.message || "Failed to send OTP. Please try again.");
        } finally {
            setIsSendingOtp(false);
        }
    };

    const handleVerifyOtp = async () => {
        if (otpCode.length !== 6) {
            setOtpError("Please enter the complete 6-digit code.");
            return;
        }
        setIsVerifyingOtp(true);
        setOtpError(null);
        try {
            const phone = pendingPhone.replace(/\D/g, "");
            await api.post("/auth/verify-sms", { code: otpCode, phoneNumber: phone });

            setOtpModalOpen(false);
            setOtpSent(false);
            setOtpCode("");
            
            // Update profile with new phone
            setProfile((prev) => (prev ? { ...prev, phone: pendingPhone } : null));
            
            // Save to backend
            await api.patch("/landlord/profile", {
                facebook: profile?.facebook,
                phone: pendingPhone,
                altPhone: profile?.altPhone || "",
            });
            
            setEditing(false);
            setPendingPhone("");
            setToast({ show: true, type: "success", title: "Phone Verified!", message: "Your phone number has been updated successfully." });
        } catch {
            setOtpError("Invalid OTP code. Please try again.");
        } finally {
            setIsVerifyingOtp(false);
        }
    };

    const handleSaveClick = async () => {
        if (!editing || !profile) return;

        const primary = pendingPhone;
        const secondary = profile.altPhone || "";

        if (!primary) {
            setToast({ show: true, type: "error", title: "Validation Error", message: "Primary phone number is required." });
            return;
        }

        if (!isValidPhilippinePhone(primary)) {
            setToast({ show: true, type: "error", title: "Invalid Phone Number", message: "Primary phone must be 11 digits and start with 09 (e.g., 09123456789)." });
            return;
        }

        if (secondary && !isValidPhilippinePhone(secondary)) {
            setToast({ show: true, type: "error", title: "Invalid Phone Number", message: "Secondary phone must be 11 digits and start with 09 (e.g., 09123456789)." });
            return;
        }

        if (secondary && primary === secondary) {
            setToast({ show: true, type: "error", title: "Duplicate Phone", message: "Primary and secondary cannot be the same." });
            return;
        }

        // Check if secondary phone is duplicate (only if it's changed and not empty)
        if (secondary && secondary !== profile.altPhone) {
            const isSecondaryDuplicate = await checkPhoneDuplicate(secondary);
            if (isSecondaryDuplicate) {
                setToast({ show: true, type: "error", title: "Duplicate Phone", message: "This secondary phone number is already registered to another account." });
                return;
            }
        }

        // If primary phone changed from original, require OTP verification
        if (pendingPhone !== profile.phone) {
            const isPrimaryDuplicate = await checkPhoneDuplicate(pendingPhone);
            if (isPrimaryDuplicate) {
                setOtpError("This phone number is already registered to another account.");
                setOtpModalOpen(true);
                setOtpSent(false);
                setOtpCode("");
                return;
            }
            setOtpModalOpen(true);
            setOtpSent(false);
            setOtpCode("");
            setOtpError(null);
            return;
        }

        // No phone change, save directly
        saveProfile();
    };

    const saveProfile = async () => {
        if (!profile) return;

        const primary = pendingPhone;
        const secondary = profile.altPhone || "";

        try {
            await api.patch("/landlord/profile", {
                facebook: profile.facebook,
                phone: primary,
                altPhone: secondary,
            });
            setProfile((prev) => (prev ? { ...prev, phone: primary, altPhone: secondary } : null));
            setEditing(false);
            setPendingPhone("");
            setToast({ show: true, type: "success", title: "Profile Updated!", message: "Your profile has been saved." });
        } catch (error) {
            console.error("Failed to update profile:", error);
            setToast({ show: true, type: "error", title: "Error", message: "Failed to save profile." });
        }
    };

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const [profileRes, accRes] = await Promise.all([
                    api.get("/landlord/profile"),
                    api.get("/landlord/accommodations"),
                ]);
                const data = profileRes.data;
                const accData = (accRes.data ?? []).filter((a: any) => a.status !== 'rejected');
                setProfile({
                    fullName: data.fullName ?? "",
                    email: data.email ?? "",
                    facebook: data.facebook ?? "",
                    phone: data.phone && data.phone !== "NONE" ? data.phone : "",
                    altPhone: data.altPhone && data.altPhone !== "NONE" ? data.altPhone : "",
                    accommodations: accData.map((a: any) => ({
                        name: a.accommodationName ?? "Unnamed",
                        type: a.accommodationType ?? "",
                    })),
                });
                setPendingPhone(data.phone && data.phone !== "NONE" ? data.phone : "");
            } catch (error) {
                console.error("Failed to fetch profile:", error);
            } finally {
                setProfileLoading(false);
            }
        };
        fetchProfile();
    }, []);

    useEffect(() => {
        api.get('/notifications').then(({ data }) => {
            setNotifications(data.map((n: any) => ({
                id: n.id, type: n.notificationType,
                message: n.notificationContent,
                time: new Date(n.notificationTimestamp).toLocaleString(),
                read: n.readStatus === 'read',
            })))
        }).catch(console.error)
    }, []);

    const unreadCount = notifications.filter((n) => !n.read).length;
    const markAllRead = () => {
        notifications.filter((n) => !n.read).forEach((n) =>
            api.patch(`/notifications/${n.id}`, { readStatus: 'read' }).catch(console.error))
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    };
    const markOneRead = (id: number) => {
        setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
        api.patch(`/notifications/${id}`, { readStatus: 'read' }).catch(console.error)
    };

    useEffect(() => { if (isError) navigate("/auth/signin"); }, [isError, navigate]);
    useEffect(() => { if (user && user.role !== "landlord") navigate("/auth/signin"); }, [user, navigate]);

    if (profileLoading) return <div className="min-h-screen flex items-center justify-center bg-[#F6F2F4]"><p className="text-gray-600">Loading profile...</p></div>;
    if (!profile) return <div className="min-h-screen flex items-center justify-center bg-[#F6F2F4]"><p className="text-gray-600">Profile not found.</p></div>;

    const displayedDorms = showAllDorms ? profile.accommodations : profile.accommodations.slice(0, 3);
    const hasMore = profile.accommodations.length > 3;

    return (
        <div className="min-h-screen bg-[#F6F2F4] text-[#2A1F1A] lg:flex overflow-y-auto">
            <div className="flex-1">
                <CustomHeader
                    title="Profile"
                    right={
                    <div className="relative" ref={notifWrapperRef}>
                        <button
                        aria-label="Notifications"
                        onClick={() => setNotifOpen((prev) => !prev)}
                        className="w-12 h-11 mb-1 rounded-2xl flex items-center justify-center relative overflow-hidden
                            transition-all duration-150
                            bg-[#8C1535] hover:bg-[#8C1535]/80 active:bg-[#3D0718]
                            hover:-translate-y-1 active:translate-y-0 active:scale-95"
                        >
                        <img
                            src={notif_icon}
                            alt="Notifications"
                            className="w-full h-full object-contain scale-[2.5]"
                        />
                        {unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-white text-[#8C1535] text-[9px] font-bold flex items-center justify-center border-2 border-[#8C1535]">
                            {unreadCount}
                            </span>
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
                    }
                />

                <main className="px-3 py-4 md:px-6 lg:px-8 lg:py-6">
                    <section className="overflow-hidden rounded-[28px] border border-[#EADFD3] bg-white shadow-sm">
                        <div className="p-4 md:p-6 lg:p-8">
                            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-8">
                                {/* LEFT COLUMN */}
                                <div className="w-full lg:w-[280px] lg:shrink-0">
                                    <div className="grid grid-cols-[130px_minmax(0,1fr)] gap-4 md:grid-cols-[170px_minmax(0,1fr)] lg:block">
                                        <div className="relative flex items-center justify-center h-[170px] overflow-hidden rounded-2xl bg-[#F6EDEF] md:h-[220px] lg:h-[280px] w-full">
                                            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                                            <button aria-label="Change photo" onClick={() => fileInputRef.current?.click()}
                                                className="absolute top-2 right-2 sm:top-4 sm:right-4 z-20 p-2 bg-white/50 hover:bg-white/80 rounded-full transition-all">
                                                <img src={Camera} alt="" className="h-6 w-6 sm:h-7 sm:w-7" />
                                            </button>
                                            {tempImage || user?.profilePictureUrl ? (
                                                <img src={tempImage || user?.profilePictureUrl} alt="Profile" className="h-full w-full object-cover" />
                                            ) : (
                                                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[#5A0B21] flex items-center justify-center shadow-md">
                                                    <span className="text-white text-2xl sm:text-3xl font-bold tracking-tighter">{getInitials(profile.fullName)}</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="min-w-0 lg:hidden">
                                            <p className="mb-1 text-[10px] font-semibold tracking-wider text-[#A88993] md:text-xs">FULL NAME</p>
                                            <p className="text-2xl font-bold text-[#2A1F1A] truncate">{profile.fullName}</p>
                                            <div className="mt-3">
                                                <button onClick={editing ? handleSaveClick : () => { setEditing(true); setPendingPhone(profile.phone); }}
                                                    className="inline-flex items-center gap-2 rounded-xl border border-[#D9BBC4] px-4 py-2 text-sm font-semibold text-[#A04E66]">
                                                    <img src={editing ? Save : Pencil} alt="" className="h-4 w-4" />
                                                    {editing ? "SAVE" : "EDIT PROFILE"}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-4">
                                        <button onClick={() => fileInputRef.current?.click()}
                                            className="flex min-h-[76px] w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-[#E6CAD3] px-3 py-3 text-left hover:bg-[#FBF5F7] transition-colors">
                                            <img src={Camera} alt="" className="h-5 w-5 shrink-0" />
                                            <div className="leading-tight">
                                                <p className="text-[11px] font-bold tracking-wider text-[#A04E66]">PHOTO</p>
                                                <p className="text-[10px] text-[#C3AAB3]">JPG/PNG • 5MB</p>
                                            </div>
                                        </button>
                                    </div>
                                </div>

                                {/* RIGHT COLUMN */}
                                <div className="min-w-0 flex-1">
                                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                                        <div className="min-w-0">
                                            <p className="mb-1 text-xs font-semibold tracking-wider text-[#A88993]">FULL NAME</p>
                                            <p className="text-2xl sm:text-3xl font-bold leading-none text-[#2A1F1A] truncate">{profile.fullName}</p>
                                        </div>
                                        <button onClick={editing ? handleSaveClick : () => { setEditing(true); setPendingPhone(profile.phone); }}
                                            className="inline-flex items-center gap-2 rounded-xl border border-[#A04E66] px-5 py-2.5 sm:py-3 text-sm font-semibold text-[#A04E66] hover:bg-[#A04E66] hover:text-white transition-all w-full sm:w-auto justify-center">
                                            <img src={editing ? Save : Pencil} alt="" className="h-4 w-4" />
                                            {editing ? "SAVE" : "EDIT PROFILE"}
                                        </button>
                                    </div>
                                    <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-x-6 sm:gap-x-10 gap-y-4 sm:gap-y-5">
                                        <Field label="EMAIL ADDRESS" value={profile.email} editing={false} onChange={() => { }} />
                                        <Field label="FACEBOOK LINK" value={profile.facebook} editing={editing} onChange={(v) => update("facebook", v)} />
                                        <Field 
                                            label="PHONE NUMBER" 
                                            value={editing ? pendingPhone : profile.phone} 
                                            editing={editing} 
                                            onChange={handlePhoneChange} 
                                            type="tel" 
                                            maxLength={11}
                                            placeholder="09123456789"
                                        />
                                        <Field 
                                            label="2ND PHONE NUMBER" 
                                            value={profile.altPhone} 
                                            editing={editing} 
                                            onChange={handleAltPhoneChange} 
                                            type="tel"
                                            maxLength={11}
                                            placeholder="09123456789"
                                        />
                                    </div>
                                    <div className="mt-6 border-t border-[#EADFD3] pt-6">
                                        <p className="mb-3 text-sm font-semibold tracking-wide text-[#A88993]">ACCOMMODATIONS ({profile.accommodations.length})</p>
                                        <div className="space-y-2">
                                            {displayedDorms.map((acc, i) => (
                                                <div key={i} className="flex items-center gap-3 rounded-2xl border border-[#EADFD3] bg-[#F8EFF2] px-4 py-4">
                                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#8C1535] text-sm font-bold text-white flex-shrink-0">{acc.name?.charAt(0) || "A"}</div>
                                                    <div className="min-w-0">
                                                        <p className="truncate font-semibold text-[#2A1F1A] text-sm">{acc.name}</p>
                                                        <p className="text-xs text-[#A88993] capitalize">{acc.type?.replace(/_/g, ' ') || "N/A"}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        {hasMore && (
                                            <button onClick={() => setShowAllDorms(!showAllDorms)}
                                                className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-[#8C1535] hover:text-[#6B0F2B] transition-colors">
                                                {showAllDorms ? <><ChevronUp size={14} />Show Less</> : <><ChevronDown size={14} />Show All ({profile.accommodations.length})</>}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </main>
            </div>

            {/* OTP Verification Modal */}
            <Modal
                open={otpModalOpen}
                onClose={() => { setOtpModalOpen(false); setOtpSent(false); setOtpCode(""); setOtpError(null); }}
                title="Verify Phone Number"
                eyebrow="OTP VERIFICATION"
                maxWidth={480}
                footer={
                    <div className="flex flex-row justify-end w-full">
                        <Button variant="reddishPink" onClick={otpSent ? handleVerifyOtp : handleSendOtp} disabled={isSendingOtp || isVerifyingOtp}>
                            {isSendingOtp ? "Sending..." : isVerifyingOtp ? "Verifying..." : otpSent ? "Verify OTP" : "Send OTP"}
                        </Button>
                    </div>
                }
            >
                <div className="flex flex-col gap-5 py-2">
                    <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Phone Number</p>
                        <p className="text-base font-bold text-[#2A1F1A]">{pendingPhone}</p>
                    </div>
                    {otpSent && (
                        <div>
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Enter OTP Code</p>
                            <div className="flex gap-2 justify-center">
                                {[0, 1, 2, 3, 4, 5].map((i) => (
                                    <input key={i} type="text" inputMode="numeric" maxLength={1}
                                        value={otpCode[i] || ""}
                                        onChange={(e) => {
                                            const newOtp = otpCode.split("");
                                            newOtp[i] = e.target.value.replace(/\D/g, "");
                                            setOtpCode(newOtp.join(""));
                                            if (e.target.value && i < 5) {
                                                const next = document.querySelector(`input[name=otp-${i + 1}]`) as HTMLInputElement;
                                                next?.focus();
                                            }
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === "Backspace" && !otpCode[i] && i > 0) {
                                                const prev = document.querySelector(`input[name=otp-${i - 1}]`) as HTMLInputElement;
                                                prev?.focus();
                                            }
                                        }}
                                        name={`otp-${i}`}
                                        className="w-12 h-14 border border-[#6B0F2B3E] rounded-xl text-center text-lg font-bold text-[#2A1F1A] outline-none transition focus:border-[#8C1535] focus:ring-2 focus:ring-[#8C1535]/30"
                                    />
                                ))}
                            </div>
                            <p className="text-[10px] text-gray-400 mt-3 text-center">Enter the 6-digit code sent to your phone</p>
                        </div>
                    )}
                    {otpError && <p className="text-xs text-red-500 text-center bg-red-50 py-2 rounded-lg">{otpError}</p>}
                </div>
            </Modal>

            <Toast
                type={toast.type}
                title={toast.title}
                message={toast.message}
                show={toast.show}
                onClose={() => setToast(prev => ({ ...prev, show: false }))}
            />
        </div>
    );
}

interface FieldProps {
    label: string; 
    value: string; 
    editing: boolean; 
    onChange: (v: string) => void; 
    type?: string;
    maxLength?: number;
    placeholder?: string;
}

function Field({ label, value, editing, onChange, type = "text", maxLength, placeholder }: FieldProps) {
    return (
        <div className="min-w-0">
            <p className="mb-1 text-xs sm:text-sm font-semibold uppercase tracking-wide text-[#A88993]">{label}</p>
            {editing ? (
                <input 
                    value={value} 
                    onChange={(e) => onChange(e.target.value)} 
                    type={type}
                    maxLength={maxLength}
                    placeholder={placeholder}
                    inputMode={type === "tel" ? "numeric" : undefined}
                    className="w-full rounded-xl border border-[#E6CAD3] bg-[#FBF5F7] px-3 py-2 text-sm text-[#2A1F1A] outline-none focus:border-[#A04E66]" 
                />
            ) : (
                <div className="text-sm sm:text-[15px] text-[#4A3940]">{value || "—"}</div>
            )}
        </div>
    );
}