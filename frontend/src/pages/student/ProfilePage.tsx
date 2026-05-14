import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { create } from "zustand";
import { useRef, useState, useEffect } from "react";
import { api } from "../../api/axios";
import Sidebar from "../../components/Sidebar";
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
  room: {
    roomName: string;
    roomType: string;
    accommodation: {
      accommodationName: string;
    };
  };
  actualMoveOut: string | null;
}

interface ProfileEditFields {
  mname: string;
  primaryPhone: string;
  facebookAccount: string;
  emergencyContactNumber: string;
  emergencyContactName: string;
  classification: string;
}

// ─── Zustand Store ───────────────────────────────────────────────────────────

interface ProfileEditStore {
  isEditing: boolean;
  showHistory: boolean;
  form: ProfileEditFields;
  setIsEditing: (v: boolean) => void;
  setShowHistory: (v: boolean) => void;
  setForm: (f: ProfileEditFields) => void;
}

const useProfileStore = create<ProfileEditStore>((set) => ({
  isEditing: false,
  showHistory: false,
  form: {
    mname: '',
    primaryPhone: '',
    facebookAccount: '',
    emergencyContactNumber: '',
    emergencyContactName: '',
    classification: '',
  },
  setIsEditing: (v: boolean) => set({ isEditing: v }),
  setShowHistory: (v: boolean) => set({ showHistory: v }),
  setForm: (form: ProfileEditFields) => set({ form }),
}));

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ProfilePage() {
  const qc = useQueryClient();
  const { isEditing, showHistory, form, setIsEditing, setShowHistory, setForm } = useProfileStore();
  const { setUser } = useUserStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: profile, isLoading: profileLoading, isError: profileError } = useQuery<UserProfile>({
    queryKey: ["me"],
    queryFn: async () => (await api.get("/me")).data,
  });

  const { data: history = [] } = useQuery<AccommodationHistoryItem[]>({
    queryKey: ["my-stay-history"],
    queryFn: async () => {
      try {
        const [hRes, cRes] = await Promise.all([api.get('/my-stay/history'), api.get('/my-stay/current')]);
        return [...(cRes.data ? [cRes.data] : []), ...(Array.isArray(hRes.data) ? hRes.data : [])];
      } catch { return []; }
    }
  });

  useEffect(() => {
    if (profile) {
      setForm({
        mname: profile.mname || "",
        primaryPhone: profile.phoneNumbers?.find((n: any) => n.isPrimary)?.contactNumber || "",
        facebookAccount: profile.facebookAccount || "",
        emergencyContactName: profile.student?.emergencyContactName || "",
        emergencyContactNumber: profile.student?.emergencyContactNumber || "",
        classification: profile.student?.classification || "Undergraduate",
      });
    }
  }, [profile, setForm]);

  const saveMutation = useMutation({
    mutationFn: async (updatedForm: ProfileEditFields) => (await api.put("/me", updatedForm)).data,
    onSuccess: (data: UserProfile) => {
      qc.invalidateQueries({ queryKey: ["me"] });
      setUser(data);
      setIsEditing(false);
    }
  });

  const handlePfpUpload = async (file: File) => {
    const formData = new FormData();
    formData.append("profilePicture", file);
    try {
      await api.post("/me/profile-picture", formData, { headers: { "Content-Type": "multipart/form-data" } });
      qc.invalidateQueries({ queryKey: ["me"] });
    } catch (err) { console.error("Upload failed", err); }
  };

  if (profileLoading) return <div className="flex h-screen items-center justify-center font-bold text-[#8C1535]">Loading...</div>;
  if (profileError || !profile) return <div className="flex h-screen items-center justify-center text-[#8C1535]">Error loading profile.</div>;

  const currentDorm = history.find((h: AccommodationHistoryItem) => !h.actualMoveOut);
  const defaultPfp = profile.student?.gender?.toLowerCase() === "female" ? femalePfp : malePfp;
  
  // Dynamic Verification Date (Current month/year)
  const verifyDate = new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

  return (
    <div className="min-h-screen bg-[#FAF6F2] lg:flex font-['Plus_Jakarta_Sans'] text-[#2A1F1A]">
      <Sidebar role="student" />

      <div className="flex-1">
        <header className="border-b border-[#EADFD3] px-4 py-4 md:px-6 lg:px-8">
          <div className="flex items-center gap-3 pl-12 lg:pl-0">
            <span className="h-6 w-1 rounded-full bg-[#3D0718]" />
            <h1 className="font-serif text-3xl italic font-bold text-[#3D0718] md:text-4xl">Profile</h1>
          </div>
        </header>

        <main className="px-3 py-4 md:px-6 lg:px-8 lg:py-6">
          <section className="overflow-hidden rounded-[40px] border border-[#EADFD3] bg-white shadow-sm">
            <div className="p-6 md:p-10 lg:p-14">
              <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-16">
                
                {/* LEFT: Dashed Photo/Doc Boxes */}
                <div className="w-full lg:w-[320px] lg:shrink-0">
                  <div className="relative aspect-square overflow-hidden rounded-[35px] bg-[#F9EBEE] border border-[#F2F2F2]">
                    <img src={profile.profilePictureUrl || defaultPfp} className="h-full w-full object-cover" alt="Profile" />
                    <button onClick={() => fileInputRef.current?.click()} className="absolute left-4 top-4 bg-white/90 p-2 rounded-xl shadow-sm border border-[#F2F2F2]">
                      <img src={Camera} className="h-6 w-6" alt="Upload" />
                    </button>
                  </div>

                  <div className="mt-6 grid grid-cols-2 gap-4">
                    <div onClick={() => fileInputRef.current?.click()} className="flex min-h-[85px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#EADFD3] bg-[#FAF9F8] text-center cursor-pointer hover:bg-white transition-colors">
                      <p className="text-[11px] font-extrabold tracking-widest text-[#8C1535] uppercase">PHOTO</p>
                      <p className="text-[9px] text-gray-400">JPG/PNG</p>
                    </div>
                    <div className="flex min-h-[85px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#EADFD3] bg-[#FAF9F8] text-center cursor-not-allowed">
                      <p className="text-[11px] font-extrabold tracking-widest text-[#8C1535] uppercase">DOCUMENTS</p>
                      <p className="text-[9px] text-gray-400">ID / Form 5</p>
                    </div>
                  </div>

                  <div className="mt-6 flex items-center gap-4 rounded-2xl bg-[#E6F4EA] px-6 py-4 border border-[#D0E6D5]">
                    <img src={BadgeCheck} className="h-5 w-5" alt="Verified" />
                    <div className="flex-1">
                      <p className="text-[11px] font-extrabold uppercase text-[#1F7A3A]">Verified UPLB Student</p>
                    </div>
                    <span className="text-[10px] text-[#1F7A3A]/60 font-bold">{verifyDate}</span>
                  </div>
                </div>

                {/* RIGHT: Detailed Grid */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-6 mb-12">
                    <div className="min-w-0">
                      <p className="mb-2 text-[10px] font-bold tracking-[0.15em] text-[#A88993] uppercase">Full Name</p>
                      <h2 className="text-4xl font-bold text-[#2A1F1A] lg:text-5xl">
                        {profile.fname} {isEditing ? "" : (profile.mname || "")} {profile.lname}
                      </h2>
                    </div>
                    <button 
                      onClick={() => isEditing ? saveMutation.mutate(form) : setIsEditing(true)}
                      className="inline-flex items-center gap-3 rounded-2xl border border-[#E6CAD3] px-8 py-3 text-sm font-bold text-[#2A1F1A] shadow-sm hover:bg-[#8C1535] hover:text-white transition-all group"
                    >
                      <img src={isEditing ? Save : Pencil} className="h-4 w-4 group-hover:invert" alt="" />
                      {isEditing ? "SAVE PROFILE" : "EDIT PROFILE"}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-x-12 gap-y-8 md:grid-cols-2">
                    <Field label="UP Mail" value={profile.email} readOnly />
                    <Field label="College" value={profile.student?.college} readOnly />
                    
                    <Field label="Middle Name" value={form.mname} editing={isEditing} onChange={(v: string) => setForm({...form, mname: v})} />
                    <Field label="Degree Program" value={profile.student?.degreeProgram} readOnly />

                    <Field label="Phone Number" value={form.primaryPhone} editing={isEditing} onChange={(v: string) => setForm({...form, primaryPhone: v})} />
                    <Field label="Student Number" value={profile.student?.studentNumber} readOnly />
                    
                    <Field label="Facebook Link" value={form.facebookAccount} editing={isEditing} onChange={(v: string) => setForm({...form, facebookAccount: v})} />
                    <Field label="Gender" value={profile.student?.gender} readOnly />

                    <Field label="Emergency Contact" value={form.emergencyContactName} editing={isEditing} onChange={(v: string) => setForm({...form, emergencyContactName: v})} />
                    <Field label="Classification" value={form.classification} editing={isEditing} onChange={(v: string) => setForm({...form, classification: v})} />

                    <Field label="Emergency Contact #" value={form.emergencyContactNumber} editing={isEditing} onChange={(v: string) => setForm({...form, emergencyContactNumber: v})} />
                    <Field label="Year Level" value={profile.student?.yearLevel} readOnly />
                  </div>

                  {/* Current Dorm - Manager Style */}
                  <div className="mt-14 border-t border-[#F2F2F2] pt-10">
                    <p className="mb-5 text-[10px] font-extrabold tracking-widest text-[#A88993] uppercase">Current Dorm</p>
                    <div className="flex items-center gap-6 rounded-3xl border border-[#EADFD3] bg-[#F8EFF2] p-5">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#8C1535] text-lg font-bold text-white shadow-sm uppercase">
                        {currentDorm?.room.accommodation.accommodationName?.[0] || "D"}
                      </div>
                      <div className="min-w-0">
                        <p className="text-lg font-bold text-[#2A1F1A]">{currentDorm?.room.accommodation.accommodationName || "No Assignment"}</p>
                        <p className="text-sm text-[#A88993]">{currentDorm?.room.roomType || "Shared Residence"}</p>
                      </div>
                    </div>
                    <button onClick={() => setShowHistory(true)} className="mt-8 inline-flex items-center gap-3 rounded-2xl bg-[#4A0819] px-8 py-4 text-[11px] font-bold uppercase tracking-widest text-white shadow-lg">
                      📜 Accommodation History
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>

      {showHistory && <AccomHistoryModal history={history} studentName={profile.fname} onClose={() => setShowHistory(false)} />}
      <input type="file" ref={fileInputRef} className="hidden" onChange={(e) => e.target.files?.[0] && handlePfpUpload(e.target.files[0])} />
    </div>
  );
}

function Field({ label, value, editing, readOnly, onChange }: any) {
  return (
    <div className="space-y-1.5">
      <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#A88993]">{label}</p>
      {editing && !readOnly ? (
        <input 
          value={value || ""} 
          onChange={(e) => onChange(e.target.value)} 
          className="w-full rounded-xl border border-[#EADFD3] bg-[#FBF9F8] px-4 py-3 text-sm font-semibold text-[#2A1F1A] outline-none focus:border-[#8C1535] transition-colors" 
        />
      ) : (
        <div className={`w-full rounded-xl border px-4 py-3 text-sm font-semibold border-[#F2F2F2] bg-white text-[#A88993]`}>
          {value || "NONE"}
        </div>
      )}
    </div>
  );
}

function AccomHistoryModal({ history, studentName, onClose }: any) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="w-full max-w-2xl rounded-[32px] bg-white p-8" onClick={e => e.stopPropagation()}>
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-2xl font-bold text-[#3D0718]">Stay History - {studentName}</h3>
          <button onClick={onClose} className="text-gray-400 text-3xl">&times;</button>
        </div>
        <div className="max-h-[60vh] overflow-y-auto space-y-4">
          {history.length > 0 ? history.map((item: any, idx: number) => (
            <div key={idx} className="rounded-2xl border border-[#F2F2F2] p-5 flex justify-between items-center">
              <div>
                <p className="font-bold text-[#2A1F1A]">{item.room.accommodation.accommodationName}</p>
                <p className="text-xs text-[#A88993]">{item.room.roomName} • {item.room.roomType}</p>
              </div>
              <span className={`rounded-full px-4 py-1 text-[10px] font-bold uppercase ${item.actualMoveOut ? 'bg-gray-100 text-gray-400' : 'bg-green-100 text-green-700'}`}>
                {item.actualMoveOut ? 'Past' : 'Current'}
              </span>
            </div>
          )) : <p className="text-center py-10 text-gray-400 italic">No history records found.</p>}
        </div>
      </div>
    </div>
  );
}
