/*
  ProfilePage.tsx - Student profile view and edit
*/

import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { create } from "zustand";
import { useRef, useState, useEffect } from "react";
import { api } from "../../api/axios";
import Sidebar from "../../components/Sidebar";
import Modal from "../../components/Modal";
import Button from "../../components/Button";
import Toast from "../../components/Toast";
import CustomHeader from "../../components/CustomHeader";
import { useUserStore } from '../../stores/useUserStore';
import femalePfp from "../../assets/defaults/female-pfp.png";
import malePfp from "../../assets/defaults/male-pfp.png";

// Icons
import Camera from "../../assets/icons/camera.svg";
import Pencil from "../../assets/icons/edit.svg";
import BadgeCheck from "../../assets/icons/verify.svg";
import Save from "../../assets/icons/save.svg";

// ─── Types ────────────────────────────────────────────────────────────────────

interface UserProfile {
  id: number;
  fname: string;
  mname: string | null;
  lname: string;
  email: string;
  facebookAccount: string | null;
  role: string;
  accountStatus: string;
  profilePictureUrl: string | null;
  phoneNumbers: { contactNumber: string; isPrimary: boolean }[];
  student: {
    studentNumber: string;
    college: string;
    degreeProgram: string;
    gender: string;
    yearLevel: string | null;
    classification: string | null;
    emergencyContactName: string | null;
    emergencyContactNumber: string | null;
  } | null;
  updatedAt: string;
}

interface AccommodationHistoryItem {
  id: number;
  roomId: number;
  moveIn: string;
  expectedMoveOut: string;
  actualMoveOut: string | null;
  room: {
    roomName: string;
    monthlyRate: number;
    roomType: string;
    accommodation: {
      accommodationName: string;
      accommodationType: string;
    };
  };
  review?: { rating: number } | null;
}

interface ProfileEditFields {
  primaryPhone: string;
  secondaryPhone: string;
  facebookAccount: string;
  emergencyContactNumber: string;
  emergencyContactName: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const CLR = {
  dark: "#3D0718",
  mid: "#6B0F2B",
  accent: "#8C1535",
  gold: "#C9973A",
  goldLt: "#E8C37A",
  goldDk: "#a07825",
} as const;

// ─── Zustand store for edit-form state ───────────────────────────────────────

interface ProfileEditStore {
  isEditing: boolean;
  showHistory: boolean;
  form: ProfileEditFields;
  setIsEditing: (v: boolean) => void;
  setShowHistory: (v: boolean) => void;
  setForm: (f: ProfileEditFields) => void;
  patchForm: (patch: Partial<ProfileEditFields>) => void;
}

const useProfileStore = create<ProfileEditStore>((set) => ({
  isEditing: false,
  showHistory: false,
  form: {
    primaryPhone: '',
    secondaryPhone: '',
    facebookAccount: '',
    emergencyContactNumber: '',
    emergencyContactName: '',
  },
  setIsEditing: (v) => set({ isEditing: v }),
  setShowHistory: (v) => set({ showHistory: v }),
  setForm: (form) => set({ form }),
  patchForm: (patch) => set((s) => ({ form: { ...s.form, ...patch } })),
}));

// ─── API helpers ─────────────────────────────────────────────────────────────

async function fetchMe(): Promise<UserProfile> {
  const res = await api.get("/me");
  return res.data;
}

async function fetchHistory(): Promise<AccommodationHistoryItem[]> {
  try {
    const [historyRes, currentRes] = await Promise.all([
      api.get('/my-stay/history'),
      api.get('/my-stay/current'),
    ]);
    const past = Array.isArray(historyRes.data) ? historyRes.data : [];
    const current = currentRes.data ? [currentRes.data] : [];
    return [...current, ...past];
  } catch {
    return [];
  }
}

async function updateMe(form: ProfileEditFields): Promise<UserProfile> {
  const res = await api.put("/me", {
    primaryPhone: form.primaryPhone,
    secondaryPhone: form.secondaryPhone,
    facebookAccount: form.facebookAccount,
    emergencyContactName: form.emergencyContactName,
    emergencyContactNumber: form.emergencyContactNumber,
  });
  return res.data;
}

async function uploadProfilePicture(file: File): Promise<{ profilePictureUrl: string }> {
  const form = new FormData();
  form.append("profilePicture", file);
  const res = await api.post("/me/profile-picture", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
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

// ─── Utility functions ────────────────────────────────────────────────────────

function fullName(p: UserProfile) {
  return `${p.fname} ${p.mname || ''} ${p.lname}`.replace(/\s+/g, ' ').trim();
}

function initials(p: UserProfile) {
  return `${p.fname?.[0] ?? ""}${p.lname?.[0] ?? ""}`.toUpperCase();
}

function primaryPhone(p: UserProfile) {
  return p.phoneNumbers?.find((n) => n.isPrimary)?.contactNumber ?? "";
}

function secondaryPhone(p: UserProfile) {
  const extras = p.phoneNumbers?.filter((n) => !n.isPrimary);
  return extras?.length ? extras[0].contactNumber : "";
}

function formatSemester(dateStr: string) {
  const d = new Date(dateStr);
  const mo = d.getMonth();
  const sem = mo >= 5 && mo <= 10 ? 1 : 2;
  const ayStart = sem === 1 ? d.getFullYear() : d.getFullYear() - 1;
  return `Semester ${sem}, AY ${ayStart}–${String(ayStart + 1).slice(2)}`;
}

function formatCurrency(n: number) {
  return `₱${n.toLocaleString("en-PH")}`;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Field({ label, value, isCaps = false }: { label: string; value: string; isCaps?: boolean }) {
  return (
    <div className="space-y-1.5">
      <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#A88993]">{label}</p>
      <div className={`w-full rounded-xl border px-4 py-3 text-sm font-semibold border-[#F2F2F2] bg-white text-[#A88993] ${isCaps ? 'uppercase' : ''}`}>
        {value || "—"}
      </div>
    </div>
  );
}

function EditableField({ 
  label, 
  value, 
  isEditing, 
  onChange, 
  isCaps = false,
  placeholder = "",
  type = "text",
  maxLength
}: { 
  label: string; 
  value: string; 
  isEditing: boolean; 
  onChange?: (val: string) => void; 
  isCaps?: boolean;
  placeholder?: string;
  type?: string;
  maxLength?: number;
}) {
  return (
    <div className="space-y-1.5">
      <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#A88993]">{label}</p>
      {isEditing ? (
        <input 
          value={value || ""} 
          onChange={(e) => onChange?.(e.target.value)} 
          placeholder={placeholder}
          type={type}
          maxLength={maxLength}
          inputMode={type === "tel" ? "numeric" : undefined}
          className={`w-full rounded-xl border border-[#EADFD3] bg-[#FBF9F8] px-4 py-3 text-sm font-semibold text-[#2A1F1A] outline-none focus:border-[#8C1535] transition-colors ${isCaps ? 'uppercase' : ''}`} 
        />
      ) : (
        <div className={`w-full rounded-xl border px-4 py-3 text-sm font-semibold border-[#F2F2F2] bg-white text-[#A88993] ${isCaps ? 'uppercase' : ''}`}>
          {value || "—"}
        </div>
      )}
    </div>
  );
}

// ─── Accommodation History Modal Component ───────────────────────────────────

function AccomHistoryModal({
  history,
  onClose,
  studentName,
}: {
  history: AccommodationHistoryItem[];
  onClose: () => void;
  studentName: string;
}) {
  const totalSpent = history.reduce((sum, h) => {
    const months = Math.max(
      1,
      Math.round(
        (new Date(h.actualMoveOut ?? h.expectedMoveOut).getTime() -
          new Date(h.moveIn).getTime()) /
          (1000 * 60 * 60 * 24 * 30)
      )
    );
    return sum + h.room.monthlyRate * months;
  }, 0);

  const ratedItems = history.filter((h) => h.review?.rating);
  const avgRating =
    ratedItems.length > 0
      ? ratedItems.reduce((s, h) => s + (h.review?.rating ?? 0), 0) / ratedItems.length
      : 0;

  return (
    <Modal
      open={true}
      onClose={onClose}
      title="ACCOMMODATION HISTORY"
      eyebrow={`${studentName.toUpperCase()}'S HISTORY`}
      maxWidth={560}
      maxHeight={"80vh"}
    >
      <div className="flex flex-col gap-3">
        {history.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No accommodation history yet.</p>
        ) : (
          history.map((item) => {
            const isActive = !item.actualMoveOut;
            return (
              <div
                key={item.id}
                className={`flex gap-4 rounded-xl p-3 border ${
                  isActive ? "border-[#C9973A] bg-[#FDF8F0]" : "border-[#E8D0D8] bg-[#F9F5F6]"
                }`}
              >
                <div className="w-20 h-16 rounded-lg bg-gradient-to-br from-[#6B0F2B] to-[#3D0718] flex items-center justify-center text-[#E8C37A] text-xs font-bold text-center shrink-0">
                  AY {new Date(item.moveIn).getFullYear()}–
                  {String(new Date(item.moveIn).getFullYear() + 1).slice(2)}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-bold text-[#2A1F1A] text-sm">{item.room.accommodation.accommodationName}</p>
                  <p className="text-xs text-gray-500 mb-2">
                    {item.room.roomType} · {item.room.accommodation.accommodationType} · Room {item.room.roomName}
                  </p>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                    <div>
                      <span className="text-gray-400">Semester:</span>
                      <span className="ml-2 text-gray-700">{formatSemester(item.moveIn)}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Monthly Rate:</span>
                      <span className="ml-2 text-gray-700 font-semibold">{formatCurrency(item.room.monthlyRate)}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">{isActive ? "Move-in:" : "Duration:"}</span>
                      <span className="ml-2 text-gray-700">
                        {isActive
                          ? new Date(item.moveIn).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" })
                          : `${new Date(item.moveIn).toLocaleDateString("en-PH", { month: "short", year: "numeric" })} – ${new Date(item.actualMoveOut!).toLocaleDateString("en-PH", { month: "short", year: "numeric" })}`}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">Rating Given:</span>
                      <span className="ml-2 text-[#C9973A]">
                        {item.review?.rating ? "★".repeat(Math.floor(item.review.rating)) + "☆".repeat(5 - Math.floor(item.review.rating)) : "—"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-start">
                  <span
                    className={`text-xs font-semibold px-2 py-1 rounded-full whitespace-nowrap ${
                      isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </Modal>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ProfilePage() {
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { isEditing, showHistory, form, setIsEditing, setShowHistory, setForm, patchForm } =
    useProfileStore();
  const { setUser } = useUserStore();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [tempImage, setTempImage] = useState<string | null>(null);
  const [pfpUploading, setPfpUploading] = useState(false);

  // OTP Modal states
  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [pendingPhone, setPendingPhone] = useState("");
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

  // Toast state
  const [toast, setToast] = useState<{
    show: boolean;
    type: "success" | "error" | "info" | "warning" | "loading";
    title: string;
    message?: string;
  }>({ show: false, type: "success", title: "" });

  // ── Queries ────────────────────────────────────────────────────────────────

  const {
    data: profile,
    isLoading: profileLoading,
    isError: profileError,
    refetch: refetchProfile,
  } = useQuery<UserProfile>({
    queryKey: ["me"],
    queryFn: fetchMe,
  });

  const { data: history = [], refetch: refetchHistory } = useQuery<AccommodationHistoryItem[]>({
    queryKey: ["my-stay-history"],
    queryFn: fetchHistory,
  });

  // ── Mutations ──────────────────────────────────────────────────────────────

  const saveMutation = useMutation({
    mutationFn: updateMe,
    onSuccess: (updatedProfile) => {
      qc.invalidateQueries({ queryKey: ['me'] });
      refetchProfile();
      setUser(updatedProfile);
      setIsEditing(false);
      setToast({
        show: true,
        type: "success",
        title: "Profile Updated!",
        message: "Your profile has been saved successfully."
      });
    },
    onError: (err: any) => {
      console.error("Save failed:", err.response?.data || err.message);
      setToast({
        show: true,
        type: "error",
        title: "Save Failed",
        message: err?.response?.data?.message ?? 'Could not save changes. Please try again.'
      });
    },
  });

  const pfpMutation = useMutation({
    mutationFn: uploadProfilePicture,
    onMutate: () => setPfpUploading(true),
    onSettled: () => setPfpUploading(false),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['me'] });
      refetchProfile();
      setTempImage(null);
      setToast({
        show: true,
        type: "success",
        title: "Photo Updated!",
        message: "Your profile picture has been updated."
      });
    },
    onError: (err: any) => {
      console.error("Upload failed", err);
      setToast({
        show: true,
        type: "error",
        title: "Upload Failed",
        message: err?.response?.data?.message ?? 'Failed to upload photo.'
      });
    },
  });

  // ── Initialize form when profile loads ─────────────────────────────────────

  useEffect(() => {
    if (profile) {
      setForm({
        primaryPhone: primaryPhone(profile),
        secondaryPhone: secondaryPhone(profile),
        facebookAccount: profile.facebookAccount || "",
        emergencyContactName: profile.student?.emergencyContactName || "",
        emergencyContactNumber: profile.student?.emergencyContactNumber || "",
      });
      setPendingPhone(primaryPhone(profile));
    }
  }, [profile, setForm]);

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleCancelEdit = () => {
    if (profile) {
      setForm({
        primaryPhone: primaryPhone(profile),
        secondaryPhone: secondaryPhone(profile),
        facebookAccount: profile.facebookAccount || "",
        emergencyContactName: profile.student?.emergencyContactName || "",
        emergencyContactNumber: profile.student?.emergencyContactNumber || "",
      });
      setPendingPhone(primaryPhone(profile));
    }
    setIsEditing(false);
    setToast({
      show: true,
      type: "info",
      title: "Edit Cancelled",
      message: "No changes were saved."
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setToast({
          show: true,
          type: "error",
          title: "Invalid File",
          message: "Please upload an image file (JPG, PNG, or WEBP)."
        });
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setToast({
          show: true,
          type: "error",
          title: "File Too Large",
          message: "Image must be under 5MB."
        });
        return;
      }
      const imageUrl = URL.createObjectURL(file);
      setTempImage(imageUrl);
      pfpMutation.mutate(file);
    }
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
      setToast({
        show: true,
        type: "info",
        title: "OTP Sent",
        message: "A verification code has been sent to your phone."
      });
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
      setPendingPhone(phone);
      patchForm({ primaryPhone: phone });

      // Save the profile with the new phone number
      await saveMutation.mutateAsync({
        ...form,
        primaryPhone: phone,
      });
    } catch {
      setOtpError("Invalid OTP code. Please try again.");
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleSaveClick = async () => {
    if (!isEditing || !profile) return;

    const primary = pendingPhone;
    const secondary = form.secondaryPhone || "";

    if (!primary) {
      setToast({
        show: true,
        type: "error",
        title: "Validation Error",
        message: "Primary phone number is required."
      });
      return;
    }

    if (!isValidPhilippinePhone(primary)) {
      setToast({
        show: true,
        type: "error",
        title: "Invalid Phone Number",
        message: "Primary phone must be 11 digits and start with 09 (e.g., 09123456789)."
      });
      return;
    }

    if (secondary && !isValidPhilippinePhone(secondary)) {
      setToast({
        show: true,
        type: "error",
        title: "Invalid Phone Number",
        message: "Secondary phone must be 11 digits and start with 09 (e.g., 09123456789)."
      });
      return;
    }

    if (secondary && primary === secondary) {
      setToast({
        show: true,
        type: "error",
        title: "Duplicate Phone",
        message: "Primary and secondary phone numbers cannot be the same."
      });
      return;
    }

    // Check if secondary phone is duplicate (only if it's changed and not empty)
    const originalSecondary = secondaryPhone(profile);
    if (secondary && secondary !== originalSecondary) {
      const isSecondaryDuplicate = await checkPhoneDuplicate(secondary);
      if (isSecondaryDuplicate) {
        setToast({
          show: true,
          type: "error",
          title: "Duplicate Phone",
          message: "This secondary phone number is already registered to another account."
        });
        return;
      }
    }

    // Check if primary phone changed from original
    const originalPrimary = primaryPhone(profile);
    if (primary !== originalPrimary) {
      const isPrimaryDuplicate = await checkPhoneDuplicate(primary);
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

    // No phone change, just save
    saveMutation.mutate(form);
  };

  // ── Derived values ─────────────────────────────────────────────────────────

  const currentDorm = history.find((h) => !h.actualMoveOut) ?? null;
  const defaultPfp = profile?.student?.gender?.toLowerCase() === "female" ? femalePfp : malePfp;
  const verifyDate = new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

  const sidebarProfile = profile
    ? {
        fullName: fullName(profile),
        shortName: initials(profile),
        email: profile.email,
        studentNo: profile.student?.studentNumber,
        college: profile.student?.college,
        course: profile.student?.degreeProgram,
        yearLevel: profile.student?.yearLevel || "—",
        status: profile.accountStatus,
      }
    : undefined;

  // ── Loading / error states ─────────────────────────────────────────────────

  if (profileLoading) {
    return (
      <div className="flex h-screen items-center justify-center font-bold text-[#8C1535] font-['Plus_Jakarta_Sans']">
        Loading...
      </div>
    );
  }

  if (profileError || !profile) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 text-[#8C1535] font-['Plus_Jakarta_Sans']">
        <div className="text-lg">Error loading profile.</div>
        <button
          onClick={() => navigate("/student/dashboard")}
          className="rounded-lg bg-[#6B0F2B] px-6 py-2 text-white hover:bg-[#8C1535] transition-colors"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="flex h-screen overflow-hidden bg-[#FAF6F2] font-['Plus_Jakarta_Sans'] text-[#2A1F1A]">

      <div className="flex-1 flex flex-col overflow-hidden">
        <CustomHeader title="Profile"/>

        <main className="flex-1 overflow-y-auto px-3 py-4 md:px-6 lg:px-8 lg:py-6">
          <section className="overflow-hidden rounded-[40px] border border-[#EADFD3] bg-white shadow-sm">
            <div className="p-6 md:p-10 lg:p-14">
              <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-16">
                
                {/* Left Column - Avatar & Photo Controls */}
                <div className="w-full lg:w-[320px] lg:shrink-0">
                  <div className="relative aspect-square overflow-hidden rounded-[35px] bg-[#F9EBEE] border border-[#F2F2F2]">
                    <img 
                      src={tempImage || profile.profilePictureUrl || defaultPfp} 
                      className="h-full w-full object-cover" 
                      alt="Profile" 
                      onError={(e) => { (e.target as HTMLImageElement).src = defaultPfp; }}
                    />
                    <button 
                      onClick={() => !pfpUploading && fileInputRef.current?.click()} 
                      disabled={pfpUploading}
                      className="absolute left-4 top-4 bg-white/90 p-2 rounded-xl shadow-sm border border-[#F2F2F2] hover:bg-white transition-colors disabled:opacity-50"
                    >
                      <img src={Camera} className="h-6 w-6" alt="Upload" />
                    </button>
                    {pfpUploading && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-[35px]">
                        <span className="text-white text-sm font-bold">Uploading...</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-6 grid grid-cols-2 gap-4">
                    <div 
                      onClick={() => !pfpUploading && fileInputRef.current?.click()} 
                      className={`flex min-h-[85px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#EADFD3] bg-[#FAF9F8] text-center transition-colors ${pfpUploading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:bg-white'}`}
                    >
                      <p className="text-[11px] font-extrabold tracking-widest text-[#8C1535] uppercase">PHOTO</p>
                      <p className="text-[9px] text-gray-400">JPG/PNG</p>
                    </div>
                    <div className="flex min-h-[85px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#EADFD3] bg-[#FAF9F8] text-center cursor-not-allowed">
                      <p className="text-[11px] font-extrabold tracking-widest text-[#8C1535] uppercase">DOCUMENTS</p>
                      <p className="text-[9px] text-gray-400">ID / Form 5</p>
                    </div>
                  </div>

                  {profile.accountStatus === "active" && (
                    <div className="mt-6 flex items-center gap-4 rounded-2xl bg-[#E6F4EA] px-6 py-4 border border-[#D0E6D5]">
                      <img src={BadgeCheck} className="h-5 w-5" alt="Verified" />
                      <div className="flex-1">
                        <p className="text-[11px] font-extrabold uppercase text-[#1F7A3A]">Verified UPLB Student</p>
                      </div>
                      <span className="text-[10px] text-[#1F7A3A]/60 font-bold">{verifyDate}</span>
                    </div>
                  )}
                </div>

                {/* Right Column - Profile Fields */}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-col sm:flex-row items-start justify-between gap-6 mb-12">
                    <div className="min-w-0">
                      <p className="mb-2 text-[10px] font-bold tracking-[0.15em] text-[#A88993] uppercase">Full Name</p>
                      <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#2A1F1A] break-words">
                        {fullName(profile)}
                      </h2>
                    </div>
                    <div className="flex gap-3">
                      {isEditing && (
                        <button 
                          onClick={handleCancelEdit}
                          disabled={saveMutation.isPending}
                          className="inline-flex items-center gap-3 rounded-2xl border border-[#E6CAD3] px-6 py-3 text-sm font-bold text-[#2A1F1A] shadow-sm hover:bg-gray-100 transition-all disabled:opacity-50"
                        >
                          CANCEL
                        </button>
                      )}
                      <button 
                        onClick={isEditing ? handleSaveClick : () => {
                          setIsEditing(true);
                          setPendingPhone(primaryPhone(profile));
                        }}
                        disabled={saveMutation.isPending || pfpUploading}
                        className="inline-flex items-center gap-3 rounded-2xl border border-[#E6CAD3] px-6 py-3 text-sm font-bold text-[#2A1F1A] shadow-sm hover:bg-[#8C1535] hover:text-white transition-all group disabled:opacity-50"
                      >
                        <img src={isEditing ? Save : Pencil} className="h-4 w-4 group-hover:invert" alt="" />
                        {saveMutation.isPending ? "SAVING..." : isEditing ? "SAVE PROFILE" : "EDIT PROFILE"}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-x-12 gap-y-8 md:grid-cols-2">
                    <Field label="UP Mail" value={profile.email} />
                    <Field label="College" value={profile.student?.college || ""} />
                    
                    <Field label="Middle Name" value={profile.mname || ""} />
                    <Field label="Degree Program" value={profile.student?.degreeProgram || ""} />

                    <EditableField 
                      label="Primary Phone" 
                      value={isEditing ? pendingPhone : form.primaryPhone} 
                      isEditing={isEditing}
                      onChange={(v) => {
                        const cleaned = v.replace(/\D/g, "").slice(0, 11);
                        setPendingPhone(cleaned);
                      }} 
                      type="tel"
                      maxLength={11}
                      placeholder="09123456789"
                    />
                    <Field label="Student Number" value={profile.student?.studentNumber || ""} />
                    
                    <EditableField 
                      label="Secondary Phone" 
                      value={form.secondaryPhone} 
                      isEditing={isEditing}
                      onChange={(v) => {
                        const cleaned = v.replace(/\D/g, "").slice(0, 11);
                        patchForm({ secondaryPhone: cleaned });
                      }} 
                      type="tel"
                      maxLength={11}
                      placeholder="09123456789"
                    />
                    <Field label="Gender" value={profile.student?.gender || ""} isCaps />

                    <EditableField 
                      label="Facebook Link" 
                      value={form.facebookAccount} 
                      isEditing={isEditing} 
                      onChange={(v) => patchForm({ facebookAccount: v })} 
                    />
                    
                    <Field label="Classification" value={profile.student?.classification || ""} isCaps />

                    <EditableField 
                      label="Emergency Contact" 
                      value={form.emergencyContactName} 
                      isEditing={isEditing} 
                      onChange={(v) => patchForm({ emergencyContactName: v })} 
                    />
                    
                    <Field label="Year Level" value={profile.student?.yearLevel || ""} isCaps />

                    <EditableField 
                      label="Emergency Contact #" 
                      value={form.emergencyContactNumber} 
                      isEditing={isEditing} 
                      onChange={(v) => patchForm({ emergencyContactNumber: v.replace(/\D/g, "").slice(0, 11) })} 
                      type="tel"
                      maxLength={11}
                      placeholder="09123456789"
                    />
                  </div>

                  <div className="mt-14 border-t border-[#F2F2F2] pt-10">
                    <p className="mb-5 text-[10px] font-extrabold tracking-widest text-[#A88993] uppercase">Current Dorm</p>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-6 rounded-3xl border border-[#EADFD3] bg-[#F8EFF2] p-5">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#8C1535] text-lg font-bold text-white shadow-sm uppercase">
                        {currentDorm?.room.accommodation.accommodationName?.[0] || "D"}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-lg font-bold text-[#2A1F1A]">
                          {currentDorm?.room.accommodation.accommodationName || "No Assignment"}
                        </p>
                        <p className="text-sm text-[#A88993]">
                          {currentDorm?.room.roomType || "Shared Residence"}
                          {currentDorm && ` • ${formatSemester(currentDorm.moveIn)}`}
                        </p>
                      </div>
                      <button 
                        onClick={() => setShowHistory(true)} 
                        className="inline-flex items-center gap-3 rounded-2xl bg-[#4A0819] px-6 py-3 text-[11px] font-bold uppercase tracking-widest text-white shadow-lg hover:bg-[#6B0F2B] transition-colors"
                      >
                        📜 Accommodation History
                      </button>
                    </div>
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
        onClose={() => { 
          setOtpModalOpen(false); 
          setOtpSent(false); 
          setOtpCode(""); 
          setOtpError(null); 
        }}
        title="Verify Phone Number"
        eyebrow="OTP VERIFICATION"
        maxWidth={480}
        footer={
          <div className="flex flex-row justify-end w-full">
            <Button 
              variant="reddishPink" 
              onClick={otpSent ? handleVerifyOtp : handleSendOtp} 
              disabled={isSendingOtp || isVerifyingOtp}
            >
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

      {/* Accommodation History Modal - Now using the Modal component */}
      {showHistory && (
        <AccomHistoryModal
          history={history}
          studentName={profile.fname}
          onClose={() => setShowHistory(false)}
        />
      )}
      
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept="image/jpeg,image/png,image/webp"
        onChange={handleImageUpload}
      />

      {/* Toast Notifications */}
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