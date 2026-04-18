/*
  ProfilePage.tsx - Student profile view and edit

  Colors are taken from Dashboard.tsx so everything stays consistent:
    dark:   #3D0718
    mid:    #6B0F2B
    accent: #8C1535
    gold:   #C9973A
    goldLt: #E8C37A

  Endpoints this page talks to:
    GET  /api/me               - pulls current user + student record
    PUT  /api/me               - saves editable fields (route not added yet, see routes.ts)
    GET  /api/my-stay/history  - all past and current dorm assignments
*/

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api/axios";
import Sidebar from "../../components/Sidebar";

const CLR = {
  dark:   "#3D0718",
  mid:    "#6B0F2B",
  accent: "#8C1535",
  gold:   "#C9973A",
  goldLt: "#E8C37A",
  goldDk: "#a07825",
} as const;

// these mirror what /me returns — update if the response shape changes
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
    emergencyContactName: string | null;
    emergencyContactNumber: string | null;
  } | null;
}

// mirrors what /my-stay/history returns per item
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
  review?: {
    rating: number;
  } | null;
}

// small utility functions kept up here so the component stays readable below

function fullName(p: UserProfile) {
  return [p.fname, p.mname, p.lname].filter(Boolean).join(" ");
}

function initials(p: UserProfile) {
  return `${p.fname?.[0] ?? ""}${p.lname?.[0] ?? ""}`.toUpperCase();
}

function primaryPhone(p: UserProfile) {
  return p.phoneNumbers?.find((n) => n.isPrimary)?.contactNumber ?? "NONE";
}

function secondaryPhone(p: UserProfile) {
  const extras = p.phoneNumbers?.filter((n) => !n.isPrimary);
  return extras?.length ? extras[0].contactNumber : "NONE";
}

// year level is derived from the student number prefix, e.g. "2023-12345" -> "2nd Year"
function yearLevel(student: UserProfile["student"]) {
  if (!student) return "—";
  const year = parseInt(student.studentNumber?.split("-")[0] ?? "0");
  const diff = new Date().getFullYear() - year + 1;
  const labels = ["1st", "2nd", "3rd", "4th", "5th"];
  return `${labels[Math.min(diff - 1, 4)] ?? diff + "th"} Year`;
}

// rough semester label based on move-in month -- good enough for display
function formatSemester(dateStr: string) {
  const d = new Date(dateStr);
  const mo = d.getMonth(); // 0-indexed
  const sem = mo >= 5 && mo <= 10 ? 1 : 2;
  const ayStart = sem === 1 ? d.getFullYear() : d.getFullYear() - 1;
  return `Semester ${sem}, AY ${ayStart}–${String(ayStart + 1).slice(2)}`;
}

function formatCurrency(n: number) {
  return `₱${n.toLocaleString("en-PH")}`;
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

// the modal that shows when the student clicks "Accommodation History"
function AccomHistoryModal({
  history,
  onClose,
  studentName,
}: {
  history: AccommodationHistoryItem[];
  onClose: () => void;
  studentName: string;
}) {
  // rough total -- multiplies monthly rate by estimated months stayed
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
        {/* modal header */}
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
            x
          </button>
        </div>

        {/* list of dorm cards */}
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
                  {/* thumbnail -- replace with real image once we have one */}
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

                  {/* dorm details */}
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

                  {/* active / inactive badge */}
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

        {/* summary row at the bottom */}
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

export default function ProfilePage() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [history, setHistory] = useState<AccommodationHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [saving, setSaving] = useState(false);

  // only fields the student is allowed to change
  const [editForm, setEditForm] = useState({
    college: "",
    degreeProgram: "",
    facebookAccount: "",
    emergencyContactNumber: "",
    emergencyContactName: "",
    gender: "",
  });

  // ─── DEV PLACEHOLDER ─────────────────────────────────────────────────────────
  // Remove (or comment out) this block and uncomment the line in catch() below
  // once the backend auth is connected and real users exist.
  const PLACEHOLDER: { profile: UserProfile; history: AccommodationHistoryItem[] } = {
    profile: {
      id: 0,
      fname: "Juan",
      mname: "dela",
      lname: "Cruz",
      email: "jdelacruz@up.edu.ph",
      facebookAccount: "facebook.com/jdelacruz",
      role: "student",
      accountStatus: "active",
      profilePictureUrl: null,
      phoneNumbers: [
        { contactNumber: "09171234567", isPrimary: true },
        { contactNumber: "09281234567", isPrimary: false },
      ],
      student: {
        studentNumber: "2021-12345",
        college: "College of Engineering and Agro-Industrial Technology",
        degreeProgram: "BS Computer Science",
        gender: "Male",
        emergencyContactName: "Maria dela Cruz",
        emergencyContactNumber: "09171112222",
      },
    },
    history: [
      {
        id: 1, roomId: 1,
        moveIn: "2023-08-15", expectedMoveOut: "2024-05-30", actualMoveOut: "2024-05-28",
        room: { roomName: "202", monthlyRate: 3500, roomType: "Double",
          accommodation: { accommodationName: "Molave Residence Hall", accommodationType: "Dormitory" } },
        review: { rating: 4 },
      },
      {
        id: 2, roomId: 5,
        moveIn: "2024-08-12", expectedMoveOut: "2025-05-31", actualMoveOut: null,
        room: { roomName: "104", monthlyRate: 4200, roomType: "Single",
          accommodation: { accommodationName: "Narra Residence Hall", accommodationType: "Dormitory" } },
        review: null,
      },
    ],
  };
  // ─────────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const [meRes, historyRes] = await Promise.all([
          api.get("/me"),
          // history might be empty for a new student, so we catch and return []
          api.get("/my-stay/history").catch(() => ({ data: [] })),
        ]);
        const user: UserProfile = meRes.data;
        setProfile(user);
        setEditForm({
          college: user.student?.college ?? "",
          degreeProgram: user.student?.degreeProgram ?? "",
          facebookAccount: user.facebookAccount ?? "",
          emergencyContactNumber: user.student?.emergencyContactNumber ?? "",
          emergencyContactName: user.student?.emergencyContactName ?? "",
          gender: user.student?.gender ?? "",
        });
        setHistory(Array.isArray(historyRes.data) ? historyRes.data : []);
      } catch (err: any) {
        // ─── TO RESTORE ORIGINAL: comment line below, uncomment the next line ───
        usePlaceholder(PLACEHOLDER);
        // setError(err?.response?.data?.message ?? "Failed to load profile.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Called by the catch block above when the backend is unreachable / unauthenticated.
  // Delete this function together with PLACEHOLDER when going live.
  function usePlaceholder(p: typeof PLACEHOLDER) {
    setProfile(p.profile);
    setEditForm({
      college: p.profile.student?.college ?? "",
      degreeProgram: p.profile.student?.degreeProgram ?? "",
      facebookAccount: p.profile.facebookAccount ?? "",
      emergencyContactNumber: p.profile.student?.emergencyContactNumber ?? "",
      emergencyContactName: p.profile.student?.emergencyContactName ?? "",
      gender: p.profile.student?.gender ?? "",
    });
    setHistory(p.history);
  }

  // active assignment = no actualMoveOut date yet
  const currentDorm = history.find((h) => !h.actualMoveOut) ?? null;

  async function handleSave() {
    if (!profile) return;
    setSaving(true);
    try {
      // TODO: PUT /api/me needs to be added to routes.ts before this will work
      await api.put("/me", editForm);
      setProfile((prev) =>
        prev
          ? {
              ...prev,
              facebookAccount: editForm.facebookAccount,
              student: prev.student
                ? {
                    ...prev.student,
                    college: editForm.college,
                    degreeProgram: editForm.degreeProgram,
                    gender: editForm.gender,
                    emergencyContactName: editForm.emergencyContactName,
                    emergencyContactNumber: editForm.emergencyContactNumber,
                  }
                : null,
            }
          : prev
      );
      setIsEditing(false);
    } catch (err: any) {
      alert(err?.response?.data?.message ?? "Failed to save profile.");
    } finally {
      setSaving(false);
    }
  }

  // shape the sidebar expects
  const sidebarProfile = profile
    ? {
        fullName: fullName(profile),
        shortName: initials(profile),
        email: profile.email,
        studentNo: profile.student?.studentNumber,
        college: profile.student?.college,
        course: profile.student?.degreeProgram,
        yearLevel: yearLevel(profile.student),
        status: profile.accountStatus,
      }
    : undefined;

  if (loading) {
    return (
      <div style={{ display: "flex", height: "100vh", background: "#f5f0f1" }}>
        <Sidebar role="student" profile={sidebarProfile} />
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: CLR.mid,
            fontSize: 16,
            fontFamily: "'Plus Jakarta Sans', sans-serif",
          }}
        >
          Loading profile...
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div style={{ display: "flex", height: "100vh", background: "#f5f0f1" }}>
        <Sidebar role="student" profile={sidebarProfile} />
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            gap: 12,
            color: CLR.accent,
          }}
        >
          <span style={{ fontSize: 18 }}>{error ?? "Profile not found."}</span>
          <button
            onClick={() => navigate("/student/dashboard")}
            style={{
              padding: "8px 20px",
              background: CLR.mid,
              color: "#fff",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
            }}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // shared style objects to avoid repeating inline styles
  const fieldStyle: React.CSSProperties = {
    fontSize: 14,
    color: "#222",
    fontWeight: 500,
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  };
  const labelStyle: React.CSSProperties = {
    fontSize: 10,
    color: "#999",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    marginBottom: 2,
  };
  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "6px 10px",
    border: `1px solid ${CLR.goldLt}`,
    borderRadius: 6,
    fontSize: 13,
    color: "#222",
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    background: "#fff",
    boxSizing: "border-box",
  };

  // read-only display field
  function Field({ label, value }: { label: string; value: string }) {
    return (
      <div>
        <div style={labelStyle}>{label}</div>
        <div style={fieldStyle}>{value || "—"}</div>
      </div>
    );
  }

  // switches between a read-only display and an input depending on edit mode
  function EditableField({
    label,
    field,
    readOnly = false,
  }: {
    label: string;
    field: keyof typeof editForm | null;
    readOnly?: boolean;
  }) {
    if (!isEditing || readOnly || !field) {
      return <Field label={label} value={field ? editForm[field] : ""} />;
    }
    return (
      <div>
        <div style={labelStyle}>{label}</div>
        <input
          style={inputStyle}
          value={editForm[field]}
          onChange={(e) =>
            setEditForm((prev) => ({ ...prev, [field!]: e.target.value }))
          }
        />
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        overflow: "hidden",
        background: "#f5f0f1",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}
    >
      <Sidebar role="student" profile={sidebarProfile} />

      <div style={{ flex: 1, overflowY: "auto", padding: "28px 32px" }}>
        {/* page title with the gold accent bar matching the rest of the app */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
          <div style={{ width: 4, height: 22, background: CLR.gold, borderRadius: 2 }} />
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: CLR.dark }}>Profile</h1>
        </div>

        <div
          style={{
            background: "#fff",
            borderRadius: 16,
            padding: "28px 32px",
            display: "flex",
            gap: 32,
            boxShadow: "0 2px 12px rgba(61,7,24,0.07)",
          }}
        >
          {/* left column: avatar, photo/docs buttons, verified badge */}
          <div style={{ width: 200, flexShrink: 0, display: "flex", flexDirection: "column", gap: 12 }}>
            <div
              style={{
                width: "100%",
                aspectRatio: "1",
                borderRadius: 14,
                background: "linear-gradient(135deg, #fce4ec, #f8bbd0)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {profile.profilePictureUrl ? (
                <img
                  src={profile.profilePictureUrl}
                  alt="Profile"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <div
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: "50%",
                    background: CLR.mid,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    fontSize: 28,
                    fontWeight: 700,
                  }}
                >
                  {initials(profile)}
                </div>
              )}
              {/* photo upload button -- wire this to a file input later */}
              <button
                style={{
                  position: "absolute",
                  top: 8,
                  right: 8,
                  background: "rgba(255,255,255,0.85)",
                  border: `1px solid ${CLR.goldLt}`,
                  borderRadius: "50%",
                  width: 28,
                  height: 28,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 11,
                  color: CLR.mid,
                  fontWeight: 700,
                }}
                title="Change photo"
              >
                cam
              </button>
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <button
                style={{
                  flex: 1,
                  padding: "6px 0",
                  fontSize: 11,
                  border: `1px solid ${CLR.goldLt}`,
                  borderRadius: 8,
                  background: "#fff",
                  color: CLR.mid,
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                PHOTO
              </button>
              <button
                style={{
                  flex: 1,
                  padding: "6px 0",
                  fontSize: 11,
                  border: `1px solid ${CLR.goldLt}`,
                  borderRadius: 8,
                  background: "#fff",
                  color: CLR.mid,
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                DOCUMENTS
              </button>
            </div>

            {profile.accountStatus === "active" && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  background: "#e8f5e9",
                  borderRadius: 8,
                  padding: "6px 10px",
                  fontSize: 12,
                  color: "#2e7d32",
                  fontWeight: 600,
                }}
              >
                <div>
                  <div>Verified UPLB Student</div>
                  <div style={{ fontWeight: 400, fontSize: 10, color: "#555" }}>
                    Since{" "}
                    {new Date().toLocaleDateString("en-PH", {
                      month: "short",
                      year: "numeric",
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* right column: all the profile fields */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: 20,
              }}
            >
              <div>
                <div style={labelStyle}>Full Name</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: CLR.dark }}>
                  {fullName(profile)}
                </div>
              </div>

              {isEditing ? (
                <button
                  onClick={handleSave}
                  disabled={saving}
                  style={{
                    padding: "8px 22px",
                    background: "#fff",
                    border: `1.5px solid ${CLR.accent}`,
                    borderRadius: 8,
                    color: CLR.accent,
                    fontWeight: 600,
                    cursor: "pointer",
                    fontSize: 13,
                  }}
                >
                  {saving ? "Saving..." : "SAVE"}
                </button>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  style={{
                    padding: "8px 22px",
                    background: "#fff",
                    border: `1.5px solid ${CLR.accent}`,
                    borderRadius: 8,
                    color: CLR.accent,
                    fontWeight: 600,
                    cursor: "pointer",
                    fontSize: 13,
                  }}
                >
                  EDIT PROFILE
                </button>
              )}
            </div>

            {/* two-column grid of fields, matching the mockup layout */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px 32px" }}>
              <Field label="UP Mail" value={profile.email} />
              <EditableField label="College" field="college" />

              <Field label="Primary Phone Number" value={primaryPhone(profile)} />
              <EditableField label="Degree Program" field="degreeProgram" />

              <Field label="2nd Phone Number" value={secondaryPhone(profile)} />
              <Field label="Student Number" value={profile.student?.studentNumber ?? "—"} />

              <EditableField label="Facebook Link" field="facebookAccount" />
              <Field label="Year Level" value={yearLevel(profile.student)} />

              <EditableField label="Emergency Contact Number" field="emergencyContactNumber" />
              <EditableField label="Gender" field="gender" />

              <EditableField label="Emergency Contact Name" field="emergencyContactName" />
            </div>

            {/* current dorm display and history button */}
            <div style={{ marginTop: 24 }}>
              <div style={labelStyle}>Current Dorm</div>
              {currentDorm ? (
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 10,
                    background: "#f9f5f6",
                    border: `1px solid ${CLR.goldLt}`,
                    borderRadius: 10,
                    padding: "8px 14px",
                    marginBottom: 12,
                  }}
                >
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 6,
                      background: CLR.mid,
                      color: "#fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 700,
                      fontSize: 13,
                    }}
                  >
                    {currentDorm.room.accommodation.accommodationName[0]}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14, color: CLR.dark }}>
                      {currentDorm.room.accommodation.accommodationName}
                    </div>
                    <div style={{ fontSize: 11, color: "#888" }}>
                      {currentDorm.room.roomType} · {currentDorm.room.accommodation.accommodationType}{" "}
                      · {formatSemester(currentDorm.moveIn)}
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ fontSize: 13, color: "#aaa", marginBottom: 12 }}>
                  No active dorm assignment.
                </div>
              )}

              <button
                onClick={() => setShowHistory(true)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "9px 20px",
                  background: CLR.dark,
                  color: "#fff",
                  border: "none",
                  borderRadius: 8,
                  cursor: "pointer",
                  fontWeight: 600,
                  fontSize: 13,
                }}
              >
                ACCOMMODATION HISTORY
              </button>
            </div>
          </div>
        </div>
      </div>

      {showHistory && (
        <AccomHistoryModal
          history={history}
          studentName={profile.fname}
          onClose={() => setShowHistory(false)}
        />
      )}
    </div>
  );
}