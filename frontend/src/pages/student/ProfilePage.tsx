/*
  ProfilePage.tsx - Student profile view and edit
*/

import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { create } from "zustand";
import { useRef, useState, useEffect } from "react";
import { api } from "../../api/axios";
import Sidebar from "../../components/Sidebar";
import { useUserStore } from '../../stores/useUserStore';
import femalePfp from "../../assets/defaults/female-pfp.png";
import malePfp from "../../assets/defaults/male-pfp.png";
import CustomHeader from '../../components/CustomHeader'

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
  const res = await api.put("/me", form);
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
  placeholder = ""
}: { 
  label: string; 
  value: string; 
  isEditing: boolean; 
  onChange?: (val: string) => void; 
  isCaps?: boolean;
  placeholder?: string;
}) {
  return (
    <div className="space-y-1.5">
      <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#A88993]">{label}</p>
      {isEditing ? (
        <input 
          value={value || ""} 
          onChange={(e) => onChange?.(e.target.value)} 
          placeholder={placeholder}
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

function StarRating({ rating }: { rating: number }) {
  return (
    <span style={{ color: CLR.gold, fontSize: 13 }}>
      {"★".repeat(Math.floor(rating))}
      {"☆".repeat(5 - Math.floor(rating))}
      <span style={{ color: "#555", marginLeft: 4, fontSize: 12 }}>{rating.toFixed(1)}</span>
    </span>
  );
}

// ─── Detailed Accommodation History Modal (from ProfilePageFull.tsx) ─────────

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
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 999,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 16,
          width: "min(560px, 92vw)",
          maxHeight: "80vh",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 8px 40px rgba(0,0,0,0.25)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            background: CLR.mid,
            color: "#fff",
            padding: "20px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderRadius: "16px 16px 0 0",
          }}
        >
          <span style={{ fontWeight: 700, fontSize: 16, letterSpacing: 1 }}>
            {studentName.toUpperCase()}'S ACCOMMODATION HISTORY
          </span>
          <button
            onClick={onClose}
            style={{
              background: "rgba(255,255,255,0.2)",
              border: "none",
              borderRadius: "50%",
              width: 28,
              height: 28,
              color: "#fff",
              cursor: "pointer",
              fontWeight: 700,
              fontSize: 16,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ×
          </button>
        </div>

        <div
          style={{
            overflowY: "auto",
            flex: 1,
            padding: "16px 24px",
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          {history.length === 0 ? (
            <p style={{ color: "#888", textAlign: "center", marginTop: 32 }}>
              No accommodation history yet.
            </p>
          ) : (
            history.map((item) => {
              const isActive = !item.actualMoveOut;
              return (
                <div
                  key={item.id}
                  style={{
                    display: "flex",
                    gap: 16,
                    background: "#f9f5f6",
                    borderRadius: 12,
                    padding: 14,
                    border: `1px solid ${isActive ? CLR.gold : "#e0d0d5"}`,
                  }}
                >
                  <div
                    style={{
                      width: 90,
                      height: 70,
                      borderRadius: 8,
                      background: `linear-gradient(135deg, ${CLR.mid}, ${CLR.dark})`,
                      flexShrink: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: CLR.goldLt,
                      fontSize: 10,
                      fontWeight: 600,
                      textAlign: "center",
                      padding: 4,
                    }}
                  >
                    AY {new Date(item.moveIn).getFullYear()}–
                    {String(new Date(item.moveIn).getFullYear() + 1).slice(2)}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 15, color: CLR.dark }}>
                      {item.room.accommodation.accommodationName}
                    </div>
                    <div style={{ fontSize: 12, color: "#666", marginBottom: 6 }}>
                      {item.room.roomType} · {item.room.accommodation.accommodationType} · Room{" "}
                      {item.room.roomName}
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2px 12px" }}>
                      <div>
                        <div style={{ fontSize: 10, color: "#999", textTransform: "uppercase" }}>
                          Semester
                        </div>
                        <div style={{ fontSize: 12, color: "#333" }}>
                          {formatSemester(item.moveIn)}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: 10, color: "#999", textTransform: "uppercase" }}>
                          Monthly Rate
                        </div>
                        <div style={{ fontSize: 12, color: "#333", fontWeight: 600 }}>
                          {formatCurrency(item.room.monthlyRate)} / month
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: 10, color: "#999", textTransform: "uppercase" }}>
                          {isActive ? "Move-in Date" : "Duration"}
                        </div>
                        <div style={{ fontSize: 12, color: "#333" }}>
                          {isActive
                            ? new Date(item.moveIn).toLocaleDateString("en-PH", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })
                            : `${new Date(item.moveIn).toLocaleDateString("en-PH", {
                                month: "short",
                                year: "numeric",
                              })} – ${new Date(item.actualMoveOut!).toLocaleDateString("en-PH", {
                                month: "short",
                                year: "numeric",
                              })}`}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: 10, color: "#999", textTransform: "uppercase" }}>
                          Rating Given
                        </div>
                        <div>
                          {item.review?.rating ? (
                            <StarRating rating={item.review.rating} />
                          ) : (
                            <span style={{ fontSize: 12, color: "#aaa" }}>No rating yet</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "flex-start" }}>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        padding: "3px 10px",
                        borderRadius: 20,
                        background: isActive ? "#e8f5e9" : "#fce4ec",
                        color: isActive ? "#2e7d32" : "#c62828",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {isActive ? "Active / Current" : "Inactive"}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div
          style={{
            borderTop: "1px solid #eee",
            padding: "14px 24px",
            display: "flex",
            justifyContent: "space-around",
            background: "#fafafa",
            borderRadius: "0 0 16px 16px",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 11, color: "#999", textTransform: "uppercase" }}>Total Dorms</div>
            <div style={{ fontWeight: 700, fontSize: 18, color: CLR.dark }}>{history.length}</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 11, color: "#999", textTransform: "uppercase" }}>Total Spent</div>
            <div style={{ fontWeight: 700, fontSize: 18, color: CLR.dark }}>
              {formatCurrency(totalSpent)}
            </div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 11, color: "#999", textTransform: "uppercase" }}>Avg Rating Given</div>
            <div
              style={{
                fontWeight: 700,
                fontSize: 18,
                color: CLR.dark,
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              <span style={{ color: CLR.gold }}>★</span>
              {avgRating > 0 ? avgRating.toFixed(1) : "—"}
            </div>
          </div>
        </div>
      </div>
    </div>
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
  const [pfpUploading, setPfpUploading] = useState(false);

  // ── Queries ────────────────────────────────────────────────────────────────

  const {
    data: profile,
    isLoading: profileLoading,
    isError: profileError,
  } = useQuery<UserProfile>({
    queryKey: ["me"],
    queryFn: fetchMe,
  });

  const { data: history = [] } = useQuery<AccommodationHistoryItem[]>({
    queryKey: ["my-stay-history"],
    queryFn: fetchHistory,
  });

  // ── Mutations ──────────────────────────────────────────────────────────────

  const saveMutation = useMutation({
    mutationFn: updateMe,
    onSuccess: (updatedProfile) => {
      qc.invalidateQueries({ queryKey: ['me'] });
      setUser(updatedProfile);
      setIsEditing(false);
      alert("Profile updated successfully!");
    },
    onError: (err: any) => {
      console.error("Save failed:", err.response?.data || err.message);
      alert(err?.response?.data?.message ?? 'Could not save changes. Please try again.');
    },
  });

  const pfpMutation = useMutation({
    mutationFn: uploadProfilePicture,
    onMutate: () => setPfpUploading(true),
    onSettled: () => setPfpUploading(false),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['me'] }),
    onError: (err: any) => {
      console.error("Upload failed", err);
      alert(err?.response?.data?.message ?? 'Failed to upload photo.');
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
    }
    setIsEditing(false);
  };

  const handleSave = () => {
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
    <div className="min-h-screen bg-[#FAF6F2] lg:flex font-['Plus_Jakarta_Sans'] text-[#2A1F1A] overflow-y-auto">

      <div className="flex-1">
        <CustomHeader title="Profile"/>

        <main className="px-3 py-4 md:px-6 lg:px-8 lg:py-6">
          <section className="overflow-hidden rounded-[40px] border border-[#EADFD3] bg-white shadow-sm">
            <div className="p-6 md:p-10 lg:p-14">
              <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-16">

                {/* ── Left Column ── */}
                <div className="w-full lg:w-[320px] lg:shrink-0">

                  {/* Avatar */}
                  <div className="relative aspect-square overflow-hidden rounded-[35px] bg-[#F9EBEE] border border-[#F2F2F2]">
                    <img
                      src={profile.profilePictureUrl || defaultPfp}
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

                  {/* Upload tiles */}
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

                  {/* Verified badge */}
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
                {/* ── End Left Column ── */}

                {/* ── Right Column ── */}
                <div className="min-w-0 flex-1">

                  {/* Name + Edit/Save buttons */}
                  <div className="flex items-start justify-between gap-6 mb-12 flex-wrap">
                    <div className="min-w-0">
                      <p className="mb-2 text-[10px] font-bold tracking-[0.15em] text-[#A88993] uppercase">Full Name</p>
                      <h2 className="text-4xl font-bold text-[#2A1F1A] lg:text-5xl">
                        {fullName(profile)}
                      </h2>
                    </div>
                    <div className="flex gap-3">
                      {isEditing && (
                        <button
                          onClick={handleCancelEdit}
                          disabled={saveMutation.isPending}
                          className="inline-flex items-center gap-3 rounded-2xl border border-[#E6CAD3] px-8 py-3 text-sm font-bold text-[#2A1F1A] shadow-sm hover:bg-gray-100 transition-all disabled:opacity-50"
                        >
                          CANCEL
                        </button>
                      )}
                      <button
                        onClick={isEditing ? handleSave : () => setIsEditing(true)}
                        disabled={saveMutation.isPending || pfpUploading}
                        className="inline-flex items-center gap-3 rounded-2xl border border-[#E6CAD3] px-8 py-3 text-sm font-bold text-[#2A1F1A] shadow-sm hover:bg-[#8C1535] hover:text-white transition-all group disabled:opacity-50"
                      >
                        <img src={isEditing ? Save : Pencil} className="h-4 w-4 group-hover:invert" alt="" />
                        {saveMutation.isPending ? "SAVING..." : isEditing ? "SAVE PROFILE" : "EDIT PROFILE"}
                      </button>
                    </div>
                  </div>

                  {/* Profile fields grid */}
                  <div className="grid grid-cols-1 gap-x-12 gap-y-8 md:grid-cols-2">
                    <Field label="UP Mail" value={profile.email} />
                    <Field label="College" value={profile.student?.college || ""} />

                    <Field label="Middle Name" value={profile.mname || ""} />
                    <Field label="Degree Program" value={profile.student?.degreeProgram || ""} />

                    <EditableField
                      label="Primary Phone"
                      value={form.primaryPhone}
                      isEditing={isEditing}
                      onChange={(v) => patchForm({ primaryPhone: v })}
                    />
                    <Field label="Student Number" value={profile.student?.studentNumber || ""} />

                    <EditableField
                      label="Secondary Phone"
                      value={form.secondaryPhone}
                      isEditing={isEditing}
                      onChange={(v) => patchForm({ secondaryPhone: v })}
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
                      onChange={(v) => patchForm({ emergencyContactNumber: v })}
                    />
                  </div>

                  {/* Current dorm + history */}
                  <div className="mt-14 border-t border-[#F2F2F2] pt-10">
                    <p className="mb-5 text-[10px] font-extrabold tracking-widest text-[#A88993] uppercase">Current Dorm</p>
                    <div className="flex items-center gap-6 rounded-3xl border border-[#EADFD3] bg-[#F8EFF2] p-5">
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
                    </div>
                    <button
                      onClick={() => setShowHistory(true)}
                      className="mt-8 inline-flex items-center gap-3 rounded-2xl bg-[#4A0819] px-8 py-4 text-[11px] font-bold uppercase tracking-widest text-white shadow-lg hover:bg-[#6B0F2B] transition-colors"
                    >
                      📜 Accommodation History
                    </button>
                  </div>

                </div>
                {/* ── End Right Column ── */}

              </div>
            </div>
          </section>
        </main>
      </div>

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
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) pfpMutation.mutate(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}