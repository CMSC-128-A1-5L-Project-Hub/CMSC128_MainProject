import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../api/axios";

import Sidebar from "../../components/Sidebar";
import CustomHeader from "../../components/CustomHeader";
import NotificationPanel, { type Notification } from "../../components/NotificationPanel";
import Toast from "@/components/Toast";
import UbleLoader from "../shared/LoadingPage";
import Bell from "../../assets/icons/bell_icon.svg?react";
import Camera from "../../assets/icons/camera.svg";
import Pencil from "../../assets/icons/edit.svg";
import BadgeCheck from "../../assets/icons/verify.svg";
import FileUp from "../../assets/icons/upload.svg";
import Save from "../../assets/icons/save.svg";
import defaultPfp from "../../assets/defaults/male-pfp.png";
import notif_icon from "../../assets/icons/notif_icon.svg";

interface ProfilePicture {
  id: number
  fileName: string
  filePath: string
  fileType: 'document' | 'image'
}

interface ProfileData {
  fullName: string;
  email: string;
  facebook: string;
  phone: string;
  employer: string;
  altPhone: string;
  verifiedSince: string;
  currentDorm: string;
  dormMeta: string;

  pfpFileId: number | null
  profilePicture: ProfilePicture | null
}

const formatAccommodationType = (value: string) => {
  if (!value) return "";
  if (value === "on-campus") return "On-campus";
  if (value === "off-campus") return "Off-campus";
  if (value === "partner_housing") return "UPLB Partner";
  return value;
};

export default function Profile() {
  const navigate = useNavigate();

  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [tempImage, setTempImage] = useState<string | null>(null);

  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const notifWrapperRef = useRef<HTMLDivElement>(null);

  const {
    data: user,
    isLoading: isUserLoading,
    isError,
  } = useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const res = await api.get("/me");
      return res.data;
    },
  });

  const update = (k: keyof ProfileData, v: string) =>
    setProfile((prev) => (prev ? { ...prev, [k]: v } : prev));

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

  const saveProfile = async () => {
    if (!profile) return;

    try {
      await api.patch("/manager/profile", {
        fullName: profile.fullName,
        email: profile.email,
        facebook: profile.facebook,
        phone: profile.phone,
        altPhone: profile.altPhone,
      });

      setEditing(false);
      setToast({ show: true, type: "success", title: "Profile Updated!", message: "Your changes have been saved." });
    } catch (error) {
      console.error("Failed to update profile:", error);
      setToast({ show: true, type: "error", title: "Save Failed", message: "Could not save your profile. Please try again." });
    }
  };

  const [toast, setToast] = useState<{
    show: boolean;
    type: "success" | "error" | "info" | "warning" | "loading";
    title: string;
    message?: string;
  }>({ show: false, type: "success", title: "" });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/manager/profile");
        console.log("MANAGER PROFILE:", res.data);
        const data = res.data;

        setProfile({
          fullName: data.fullName ?? "NONE",
          email: data.email ?? "NONE",
          facebook: data.facebook ?? "NONE",
          phone: data.phone ?? "NONE",
          employer: data.employer ?? "NONE",
          altPhone: data.altPhone ?? "NONE",
          verifiedSince: data.verifiedSince ?? "NONE",
          currentDorm: data.currentDorm ?? "No assigned dorm yet",
          dormMeta: formatAccommodationType(data.dormMeta ?? ""),

          // profile picture
          pfpFileId: data.pfpFileId ?? null,
          profilePicture: data.profilePicture ?? null,
        });
      } catch (error) {
        console.error("Failed to fetch profile:", error);
        setToast({ show: true, type: "error", title: "Failed to load profile", message: "Could not retrieve your profile data." });
      } finally {
        setProfileLoading(false);
      }
    };

    fetchProfile();
  }, []);

  useEffect(() => {
    api.get('/notifications').then(({ data }) => {
      setNotifications(data.map((n: any) => ({
        id: n.id,
        type: n.notificationType,
        message: n.notificationContent,
        time: new Date(n.notificationTimestamp).toLocaleString(),
        read: n.readStatus === 'read',
      })));
    }).catch(console.error);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const markAllRead = () => {
    notifications.filter((n) => !n.read).forEach((n) =>
      api.patch(`/notifications/${n.id}`, { readStatus: 'read' }).catch(console.error));
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };
  const markOneRead = (id: number) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    api.patch(`/notifications/${id}`, { readStatus: 'read' }).catch(console.error);
  };

  useEffect(() => {
    if (isError) {
      navigate("/auth/signin");
    }
  }, [isError, navigate]);

  useEffect(() => {
    if (user && user.role !== "manager") {
      navigate("/auth/signin");
    }
  }, [user, navigate]);


if (profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F6F2F4]">
        <UbleLoader />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F6F2F4]">
        <p className="text-gray-600">Profile not found.</p>
      </div>
    );
  }

  if (isUserLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  if (!user || user.role !== "manager") {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#F6F2F4] text-[#2A1F1A] lg:flex">
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
                <img src={notif_icon} alt="Notifications" className="w-full h-full object-contain scale-[2.5]" />
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
                  {/* Mobile top arrangement */}
                  <div className="grid grid-cols-[130px_minmax(0,1fr)] gap-4 md:grid-cols-[170px_minmax(0,1fr)] lg:block">
                    <div className="relative flex items-center justify-center h-[170px] overflow-hidden rounded-2xl bg-[#F6EDEF] md:h-[220px] lg:h-[280px] w-full">
                      <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageUpload}
                      />
                      <button
                        aria-label="Change photo"
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute top-2 right-2 sm:top-4 sm:right-4 z-20 p-2 bg-white/50 hover:bg-white/80 rounded-xl transition-all"
                      >
                        <img src={Camera} alt="" className="h-6 w-6 sm:h-7 sm:w-7" />
                      </button>
                      {tempImage || user?.profilePictureUrl ? (
                        <img
                          src={tempImage || user?.profilePictureUrl}
                          alt="Profile Picture"
                          className="h-full w-full object-cover"
                          onError={(e) => { e.currentTarget.src = defaultPfp; }}
                        />
                      ) : (
                        <img
                          src={profile.profilePicture?.filePath ?? defaultPfp}
                          alt="Profile Picture"
                          className="h-full w-full object-cover"
                          onError={(e) => { e.currentTarget.src = defaultPfp; }}
                        />
                      )}
                    </div>

                    {/* Mobile-only right of photo */}
                    <div className="min-w-0 lg:hidden">
                      <p className="mb-1 text-[10px] font-semibold tracking-wider text-[#A88993] md:text-xs">
                        FULL NAME
                      </p>

                      <input
                        value={profile.fullName}
                        onChange={(e) => update("fullName", e.target.value)}
                        readOnly={!editing}
                        className="w-full bg-transparent text-3xl font-bold leading-none text-[#2A1F1A] outline-none read-only:cursor-default md:text-[2rem]"
                      />

                      <div className="mt-3 flex flex-col items-start gap-3">
                        <div className="inline-flex items-center gap-2 rounded-full bg-[#E6F4EA] px-3 py-2 text-[#1F7A3A]">
                          <img
                            src={BadgeCheck}
                            alt=""
                            className="h-4 w-4 shrink-0"
                          />
                          <div className="leading-tight">
                            <p className="text-xs font-semibold">
                              Verified Dormitory Manager
                            </p>
                            <p className="text-xs opacity-80">
                              Since {profile.verifiedSince}
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={editing ? saveProfile : () => setEditing(true)}
                          className="inline-flex items-center gap-2 rounded-xl border border-[#D9BBC4] px-4 py-2 text-sm font-semibold text-[#A04E66]"
                        >
                          <img
                            src={editing ? Save : Pencil}
                            alt=""
                            className="h-4 w-4"
                          />
                          {editing ? "SAVE PROFILE" : "EDIT PROFILE"}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <button className="flex min-h-[76px] items-center justify-center gap-2 rounded-2xl border border-dashed border-[#E6CAD3] px-3 py-3 text-left">
                      <img src={Camera} alt="" className="h-5 w-5 shrink-0" />
                      <div className="leading-tight">
                        <p className="text-[11px] font-bold tracking-wider text-[#A04E66]">
                          PHOTO
                        </p>
                        <p className="text-[10px] text-[#C3AAB3]">JPG/PNG • 5MB</p>
                      </div>
                    </button>

                    <button className="flex min-h-[76px] items-center justify-center gap-2 rounded-2xl border border-dashed border-[#E6CAD3] px-3 py-3 text-left">
                      <img src={FileUp} alt="" className="h-5 w-5 shrink-0" />
                      <div className="leading-tight">
                        <p className="text-[11px] font-bold tracking-wider text-[#A04E66]">
                          DOCUMENTS
                        </p>
                        <p className="text-[10px] text-[#C3AAB3]">
                          Valid ID • PDF/JPG
                        </p>
                      </div>
                    </button>
                  </div>

                  <div className="mt-4 hidden rounded-full bg-[#E6F4EA] px-6 py-3 text-[#1F7A3A] lg:inline-flex">
                    <div className="flex items-center gap-3">
                      <img src={BadgeCheck} alt="" className="h-4 w-4 shrink-0" />
                     
                      <div className="flex flex-col leading-tight text-center">
                        <p className="text-base lg:text-sm font-semibold">
                            Verified Dormitory Manager
                        </p>
                        <span className="text-xs opacity-80">
                          Since {profile.verifiedSince}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* RIGHT COLUMN */}
                <div className="min-w-0 flex-1">
                  <div className="hidden lg:flex lg:items-start lg:justify-between lg:gap-6">
                    <div className="min-w-0">
                      <p className="mb-1 text-xs font-semibold tracking-wider text-[#A88993]">
                        FULL NAME
                      </p>

                      <input
                        value={profile.fullName}
                        onChange={(e) => update("fullName", e.target.value)}
                        readOnly={!editing}
                        className="w-full bg-transparent text-[3rem] font-bold leading-none text-[#2A1F1A] outline-none read-only:cursor-default"
                      />
                    </div>

                    <button
                      onClick={() => setEditing((prev) => !prev)}
                      className="inline-flex items-center gap-2 rounded-xl border border-[#A04E66] px-5 py-3 text-sm font-semibold text-[#A04E66]"
                    >
                      <img
                        src={editing ? Save : Pencil}
                        alt=""
                        className="h-4 w-4"
                      />
                      {editing ? "SAVE PROFILE" : "EDIT PROFILE"}
                    </button>
                  </div>

                  <div className="mt-5 hidden grid-cols-1 gap-x-10 gap-y-5 md:grid-cols-2 lg:mt-6 lg:grid">
                    <Field
                      label="Email Address"
                      value={profile.email}
                      editing={false}
                      onChange={(v) => {}}
                    />
                    <Field
                      label="FACEBOOK LINK"
                      value={profile.facebook}
                      editing={editing}
                      onChange={(v) => update("facebook", v)}
                    />
                    <Field
                      label="PHONE NUMBER"
                      value={profile.phone}
                      editing={editing}
                      onChange={(v) => update("phone", v)}
                    />
                    <Field
                      label="2ND PHONE NUMBER"
                      value={profile.altPhone}
                      editing={editing}
                      onChange={(v) => update("altPhone", v)}
                    />
                  </div>

                  <div className="mt-6 hidden border-t border-[#EADFD3] pt-6 lg:grid">
                    <p className="mb-3 text-sm font-semibold tracking-wide text-[#A88993]">
                      CURRENT DORM HANDLED
                    </p>

                    <div className="flex items-center gap-3 rounded-2xl border border-[#EADFD3] bg-[#F8EFF2] px-4 py-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#8C1535] text-sm font-bold text-white">
                        {profile.currentDorm?.charAt(0) || "D"}
                      </div>

                      <div className="min-w-0">
                        <p className="truncate font-semibold text-[#2A1F1A]">
                          {profile.currentDorm}
                        </p>
                        <p className="text-xs text-[#A88993]">{profile.dormMeta}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mobile-only lower info + dorm */}
              <div className="mt-6 lg:hidden">
                <div className="grid grid-cols-1 gap-x-8 gap-y-5 border-t border-[#F0E3E8] pt-5 md:grid-cols-2">
                  <Field
                    label="EMAIL"
                    value={profile.email}
                    editing={editing}
                    onChange={(v) => update("email", v)}
                  />
                  <Field
                    label="FACEBOOK LINK"
                    value={profile.facebook}
                    editing={editing}
                    onChange={(v) => update("facebook", v)}
                  />
                  <Field
                    label="PHONE NUMBER"
                    value={profile.phone}
                    editing={editing}
                    onChange={(v) => update("phone", v)}
                  />
                  <Field
                    label="2ND PHONE NUMBER"
                    value={profile.altPhone}
                    editing={editing}
                    onChange={(v) => update("altPhone", v)}
                  />
                </div>

                <div className="mt-6 border-t border-[#EADFD3] pt-6">
                  <p className="mb-3 text-sm font-semibold tracking-wide text-[#A88993]">
                    CURRENT DORM HANDLED
                  </p>

                  <div className="flex items-center gap-3 rounded-2xl border border-[#EADFD3] bg-[#F8EFF2] px-4 py-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#8C1535] text-sm font-bold text-white">
                      {profile.currentDorm?.charAt(0) || "D"}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate font-semibold text-[#2A1F1A]">
                        {profile.currentDorm}
                      </p>
                      <p className="text-xs text-[#A88993]">{profile.dormMeta}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
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
}

function Field({ label, value, editing, onChange }: FieldProps) {
  return (
    <div className="min-w-0">
      <p className="mb-1 text-sm font-semibold uppercase tracking-wide text-[#A88993]">
        {label}
      </p>

      {editing ? (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-xl border border-[#E6CAD3] bg-[#FBF5F7] px-3 py-2 text-sm text-[#2A1F1A] outline-none"
        />
      ) : (
        <div className="text-[15px] text-[#4A3940]">{value}</div>
      )}
    </div>
  );
}