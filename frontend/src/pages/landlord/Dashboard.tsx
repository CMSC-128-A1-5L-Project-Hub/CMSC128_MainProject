import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { X } from "lucide-react";
import { setLandlordSidebarContext } from "../../components/Sidebar";
import HeroBanner from "../../components/dashboard/HeroBanner";
import StatCard from "../../components/dashboard/landlord/rooms/dashboard/StatCard";
import SectionCard from "../../components/dashboard/landlord/rooms/dashboard/SectionCard";
import CircleProgress from "../../components/dashboard/landlord/rooms/dashboard/CircleProgress";
import Sidebar from "../../components/Sidebar";
import ProfileCard from "../../components/dashboard/manager/ProfileCard";
import PaymentList from "../../components/dashboard/landlord/rooms/dashboard/PaymentList";
import ActivityLogs from "../../components/dashboard/landlord/rooms/dashboard/ActivityLogs";
import ReportsPanel from "../../components/dashboard/landlord/rooms/dashboard/ReportsPanel";
import ApplicationPeriod from "../../components/dashboard/landlord/rooms/dashboard/Calendar";
import Button from "../../components/Button";
import Modal from "../../components/Modal";
import GradientPillSelect from "@/components/DropDownGradient";

import { api } from "../../api/axios";
import { useUserStore } from "../../stores/useUserStore";
import { queryClient } from "../../lib/queryClient";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Accommodation {
  id: number;
  accommodationName: string;
  status: string;
  applicationStartDate: string | null;
  applicationEndDate: string | null;
  manager: {
    userId: number;
    managerStatus: string;
    user: {
      fname: string;
      lname: string;
      email: string;
      phoneNumbers: { contactNumber: string; isPrimary: boolean }[];
    };
  } | null;
}

interface Application {
  id: number;
  accommodationId: number;
  applicationRoomType: string;
  applicationStayType: string;
  applicationStatus: string;
  applicationDate: string;
  student: {
    studentNumber: string;
    enrollmentProofFileId: number | null;
    user: { fname: string; lname: string };
  };
}

interface Room {
  id: number;
  roomNumber: string;
  roomType: string;
  roomCapacity: number;
  roomCurrentOccupancy: number;
  roomAvailability: string;
}

interface RevenueData {
  projectedMonthlyRevenue: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning";
  if (h < 18) return "Good Afternoon";
  return "Good Evening";
}

function fmt(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function FilterTabs({
  active,
  setActive,
}: {
  active: string;
  setActive: (t: string) => void;
}) {
  const tabs = ["Overview", "Fees", "Rooms"];
  return (
    <div className="bg-white p-1 rounded-xl inline-flex gap-1">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => setActive(tab)}
          className={`px-4 py-1.5 text-sm rounded-lg transition ${
            active === tab
              ? "bg-[#6B0F2B] text-white shadow"
              : "text-gray-500 hover:text-black"
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

const ROOMS_PER_PAGE = 5;

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("Overview");
  const [roomsPage, setRoomsPage] = useState(1);
  const [docModalOpen, setDocModalOpen] = useState(false);
  const [newDocName, setNewDocName] = useState("");
  const [newDocFormat, setNewDocFormat] = useState("any");
  const [editingDocs, setEditingDocs] = useState(false);
  const [docToDelete, setDocToDelete] = useState<{ id: number; name: string } | null>(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [rejectionModalOpen, setRejectionModalOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const user = useUserStore((s) => s.user);

  useEffect(() => {
    setLandlordSidebarContext("full");
  }, []);

  // ── Queries ─────────────────────────────────────────────────────────────────

  const { data: accommodations = [], isSuccess: accLoaded } = useQuery<Accommodation[]>({
    queryKey: ["landlord-accommodations"],
    queryFn: () => api.get("/landlord/accommodations").then((r) => r.data ?? []),
  });

  const accommodationId = id ? Number(id) : undefined;
  const accommodation = accommodations.find((a) => a.id === accommodationId) ?? null;

  useEffect(() => {
    if (accLoaded && !accommodation) {
      navigate("/landlord/dashboard", { replace: true });
    }
  }, [accLoaded, accommodation, navigate]);

  const { data: revenue } = useQuery<RevenueData>({
    queryKey: ["landlord-revenue"],
    queryFn: () => api.get("/reports/revenue").then((r) => r.data),
  });

  const { data: applications = [], isLoading: appsLoading } = useQuery<Application[]>({
    queryKey: ["landlord-applications"],
    queryFn: () => api.get("/applications/incoming").then((r) => r.data),
  });

  const { data: rooms = [], isLoading: roomsLoading } = useQuery<Room[]>({
    queryKey: ["landlord-rooms", accommodationId],
    queryFn: () => api.get(`/accommodations/${accommodationId}/rooms`).then((r) => r.data),
    enabled: !!accommodationId,
  });

  const { data: delinquent = [], isLoading: feesLoading } = useQuery({
    queryKey: ["landlord-delinquency"],
    queryFn: () => api.get("/reports/delinquency").then((r) => r.data),
  });

  const { data: facilityDocs = [] } = useQuery<{ id: number; requirementName: string; acceptedFormat: string }[]>({
    queryKey: ["doc-requirements", accommodationId],
    queryFn: () => api.get(`/accommodations/${accommodationId}/document-requirements`).then((r) => r.data),
    enabled: !!accommodationId,
  });

  // ── Mutations ────────────────────────────────────────────────────────────────

  const saveAppPeriod = useMutation({
    mutationFn: ({ start, end }: { start: string; end: string }) =>
      api.put(`/landlord/accommodations/${accommodationId}`, {
        application_start_date: start,
        application_end_date: end,
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["landlord-accommodations"] }),
  });

  const addDocMutation = useMutation({
    mutationFn: ({ requirement_name, accepted_format }: { requirement_name: string; accepted_format: string }) =>
      api.post(`/landlord/accommodations/${accommodationId}/document-requirements`, {
        requirement_name,
        accepted_format,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doc-requirements", accommodationId] });
      setNewDocName("");
      setNewDocFormat("any");
      setDocModalOpen(false);
    },
  });

  const removeDocMutation = useMutation({
    mutationFn: (reqId: number) =>
      api.delete(`/landlord/accommodations/${accommodationId}/document-requirements/${reqId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doc-requirements", accommodationId] });
      setDocToDelete(null);
    },
  });

  // Use applicationId and correct action/rejection_reason
  const reviewAppMutation = useMutation({
    mutationFn: ({
      applicationId,
      action,
      rejectionReason,
    }: {
      applicationId: number;
      action: "approve" | "reject";
      rejectionReason?: string;
    }) =>
      api.patch(`/applications/${applicationId}/review`, {
        action: action,
        ...(action === "reject" && { rejection_reason: rejectionReason }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["landlord-applications"] });
      setReviewModalOpen(false);
      setRejectionModalOpen(false);
      setSelectedApp(null);
      setRejectionReason("");
    },
  });

  // ── Derived values ──────────────────────────────────────────────────────────

  useEffect(() => { setRoomsPage(1); }, [rooms.length, activeTab]);
  const totalRoomPages = Math.max(1, Math.ceil(rooms.length / ROOMS_PER_PAGE));
  const paginatedRooms = rooms.slice((roomsPage - 1) * ROOMS_PER_PAGE, roomsPage * ROOMS_PER_PAGE);

  const totalCapacity = rooms.reduce((s, r) => s + r.roomCapacity, 0);
  const totalOccupied = rooms.reduce((s, r) => s + r.roomCurrentOccupancy, 0);
  const occupancyPct = totalCapacity > 0 ? Math.round((totalOccupied / totalCapacity) * 100) : 0;
  const projectedRevenue = revenue?.projectedMonthlyRevenue ?? 0;
  const underReviewApps = applications.filter((a) => a.applicationStatus === "under_review");

  // Form 5 / enrollment proof stats — scoped to this accommodation
  const accommodationApps = applications.filter(
    (a) => a.accommodationId === accommodationId
  );
  const form5Submitted = accommodationApps.filter(
    (a) => a.student?.enrollmentProofFileId != null
  ).length;
  const form5Pending = accommodationApps.length - form5Submitted;
  const form5Pct =
    accommodationApps.length > 0
      ? Math.round((form5Submitted / accommodationApps.length) * 100)
      : 0;

  // Manager card props
  const manager = accommodation?.manager;
  const managerStatus = !manager ? "none" : manager.managerStatus === "active" ? "assigned" : "pending";
  const primaryPhone = manager?.user?.phoneNumbers?.find((p) => p.isPrimary)?.contactNumber ?? "";

  const documentFormatOptions = [
    { value: "any", label: "Any" },
    { value: "pdf", label: "PDF" },
    { value: "image", label: "JPEG / PNG" },
  ];

  // ── Helpers for review modal ─────────────────────────────────────────────

  const handleOpenReview = (app: Application) => {
    setSelectedApp(app);
    setReviewModalOpen(true);
  };

  const handleCloseReview = () => {
    setReviewModalOpen(false);
    setSelectedApp(null);
  };

  const handleRejectClick = () => {
    setRejectionModalOpen(true);
    setReviewModalOpen(false);
  };

  const handleBackToReview = () => {
    setRejectionModalOpen(false);
    setReviewModalOpen(true);
  };

  const handleConfirmRejection = () => {
    if (selectedApp) {
      reviewAppMutation.mutate({
        applicationId: selectedApp.id,
        action: "reject",
        rejectionReason,
      });
    }
  };

  const handleConfirmApproval = () => {
    if (selectedApp) {
      reviewAppMutation.mutate({
        applicationId: selectedApp.id,
        action: "approve",
      });
    }
  };

  // ── Right panel ─────────────────────────────────────────────────────────

  const RightPanel = () => (
    <div className="flex flex-col gap-4">
      <ProfileCard
        status={managerStatus}
        fullName={manager ? `${manager.user.fname} ${manager.user.lname}` : undefined}
        role="Dorm Manager"
        phoneNumber={primaryPhone}
        email={manager?.user?.email}
        dormitory={accommodation?.accommodationName ?? 'Loading...'}
        showReplaceButton
        accommodationId={accommodationId}
        onManagerReplaced={() => queryClient.invalidateQueries({ queryKey: ["landlord-accommodations"] })}
      />
      <ApplicationPeriod
        initialStart={accommodation?.applicationStartDate}
        initialEnd={accommodation?.applicationEndDate}
        onSave={(start, end) => saveAppPeriod.mutate({ start, end })}
        isSaving={saveAppPeriod.isPending}
      />
      <ActivityLogs />
      <ReportsPanel />
    </div>
  );

  return (
    <div className="flex h-screen bg-[#FAF8F9] overflow-hidden">
      <Sidebar role="landlord" />
      <div className="flex flex-1 overflow-hidden min-w-0">
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 min-w-0">
          <div className="space-y-4">
            {/* NAVBAR */}
            <div className="flex items-center gap-3 pl-16 lg:pl-0">
              <Button variant="secondary" size="sm" onClick={() => navigate("/landlord/dashboard")}>
                ← Back
              </Button>
              <span className="text-gray-300">|</span>
              <h2 className="font-semibold text-lg">Dashboard</h2>
            </div>

            {/* HERO */}
            <HeroBanner
              greeting={greeting()}
              title="Efficiently manage applicants & housing accommodation"
              subtitle={
                underReviewApps.length > 0
                  ? `You have ${underReviewApps.length} application${underReviewApps.length !== 1 ? "s" : ""} awaiting your review`
                  : "Everything is up to date"
              }
              name={user ? user.fname : ""}
              type="full"
            />

            <div className="lg:hidden">
              <RightPanel />
            </div>

            <FilterTabs active={activeTab} setActive={setActiveTab} />

            {/* OVERVIEW */}
            {activeTab === "Overview" && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <StatCard title="PROJECTED REVENUE" value={`₱${projectedRevenue.toLocaleString("en-PH")}`} subtitle="Monthly (active tenants)" />
                  <StatCard title="OCCUPIED" value={`${totalOccupied}`} subtitle={`${occupancyPct}% of capacity`} />
                  <StatCard title="VACANT" value={`${Math.max(totalCapacity - totalOccupied, 0)}`} subtitle={`${100 - occupancyPct}% available`} negative={totalCapacity - totalOccupied === 0} />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <SectionCard title="Occupancy Rate">
                    <div className="flex items-center gap-4">
                      <CircleProgress value={occupancyPct} />
                      <div className="flex flex-col gap-2 flex-1">
                        <div className="flex justify-between items-center p-2 rounded-xl" style={{ background: "rgba(140,21,53,0.06)" }}>
                          <div><p className="text-[10px] text-[#8C1535]/60 uppercase tracking-wider">Occupied</p><p className="text-lg font-bold text-[#8C1535]">{totalOccupied}</p></div>
                          <div className="w-2 h-2 rounded-full bg-[#8C1535]" />
                        </div>
                        <div className="flex justify-between items-center p-2 rounded-xl" style={{ background: "rgba(0,0,0,0.03)" }}>
                          <div><p className="text-[10px] text-gray-400 uppercase tracking-wider">Vacant</p><p className="text-lg font-bold text-gray-400">{Math.max(totalCapacity - totalOccupied, 0)}</p></div>
                          <div className="w-2 h-2 rounded-full bg-gray-300" />
                        </div>
                        <div className="flex justify-between items-center p-2 rounded-xl" style={{ background: "rgba(140,21,53,0.03)" }}>
                          <div><p className="text-[10px] text-gray-400 uppercase tracking-wider">Total Rooms</p><p className="text-lg font-bold text-gray-600">{totalCapacity}</p></div>
                          <div className="w-2 h-2 rounded-full bg-gray-200" />
                        </div>
                      </div>
                    </div>
                  </SectionCard>

                  <SectionCard title="Form 5 Renewal">
                    <div className="flex items-center gap-4">
                      <div className="shrink-0">
                        <CircleProgress value={form5Pct} />
                      </div>
                      <div className="flex flex-col gap-2 flex-1">
                        <div
                          className="flex justify-between items-center p-2 rounded-xl"
                          style={{ background: "rgba(140,21,53,0.06)" }}
                        >
                          <div>
                            <p className="text-[10px] text-[#8C1535]/60 uppercase tracking-wider">
                              Submitted
                            </p>
                            <p className="text-lg font-bold text-[#8C1535]">
                              {form5Submitted}
                            </p>
                          </div>
                          <div className="w-2 h-2 rounded-full bg-[#8C1535]" />
                        </div>
                        <div
                          className="flex justify-between items-center p-2 rounded-xl"
                          style={{ background: "rgba(202,138,4,0.06)" }}
                        >
                          <div>
                            <p className="text-[10px] text-yellow-600/70 uppercase tracking-wider">
                              Pending
                            </p>
                            <p className="text-lg font-bold text-yellow-600">
                              {form5Pending}
                            </p>
                          </div>
                          <div className="w-2 h-2 rounded-full bg-yellow-500" />
                        </div>
                        <div
                          className="flex justify-between items-center p-2 rounded-xl"
                          style={{ background: "rgba(0,0,0,0.03)" }}
                        >
                          <div>
                            <p className="text-[10px] text-gray-400 uppercase tracking-wider">
                              Total Applicants
                            </p>
                            <p className="text-lg font-bold text-gray-500">
                              {accommodationApps.length}
                            </p>
                          </div>
                          <div className="w-2 h-2 rounded-full bg-gray-300" />
                        </div>
                      </div>
                    </div>
                  </SectionCard>

                  <SectionCard title="Document Requirements" action={editingDocs ? "Done" : "Edit →"} onAction={() => setEditingDocs(!editingDocs)}>
                    <div className="flex flex-col gap-3 text-sm -mt-2">
                      <div>
                        <p className="text-xs text-gray-400 mb-1">SYSTEM STANDARD</p>
                        <div className="flex gap-2 flex-wrap items-center">
                          <span
                            className="w-fit inline-flex items-center gap-1.5 px-3 py-2 bg-[#6B0F2B] text-white rounded-full text-xs font-bold"
                            title="Collected automatically when the student signs up."
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                            Form 5 / Enrollment Proof
                          </span>
                        </div>
                        <p className="text-[10px] text-gray-400 italic mt-1">
                          Auto-collected at student signup. Submission tracked in the Form 5 panel above.
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 mb-1">FACILITY-SPECIFIC</p>
                        <div className="flex gap-2 flex-wrap items-center">
                          {facilityDocs.map((doc) => (
                            <span key={doc.id} className="w-fit inline-flex items-center gap-2 pl-3 pr-1.5 py-2 bg-[#6B0F2B] text-white rounded-full text-xs font-bold">
                              {doc.requirementName}
                              {editingDocs && (
                                <button onClick={() => setDocToDelete({ id: doc.id, name: doc.requirementName })} className="w-4 h-4 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center transition shrink-0">
                                  <span className="text-white text-[10px] font-bold leading-none">✕</span>
                                </button>
                              )}
                            </span>
                          ))}
                          <Button variant="dashed" size="sm" onClick={() => setDocModalOpen(true)}>+ Add More</Button>
                        </div>
                      </div>
                    </div>
                  </SectionCard>
                </div>
              </>
            )}

            {activeTab === "Fees" && <PaymentList delinquent={delinquent} isLoading={feesLoading} />}

            {activeTab === "Rooms" && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <SectionCard title="Applications Under Review" action="View all →" onAction={() => navigate(accommodationId ? `/landlord/applications?accId=${accommodationId}` : "/landlord/applications")}>
                    <div className="overflow-x-auto">
                      <div className="min-w-[500px] xl:min-w-0">
                        <div className="grid grid-cols-[5fr_4fr_4fr_2fr] items-center gap-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wider pb-2 border-b border-gray-100">
                          <span className="text-[#9A7080] font-bold">Student</span>
                          <span className="text-[#9A7080] font-bold">Type</span>
                          <span className="text-[#9A7080] font-bold">Applied</span>
                          <span className="text-center text-[#9A7080] font-bold">Action</span>
                        </div>
                        {appsLoading ? (
                          <p className="text-xs text-gray-400 py-4 text-center">Loading…</p>
                        ) : underReviewApps.length === 0 ? (
                          <p className="text-xs text-gray-400 py-4 text-center italic">No applications under review</p>
                        ) : (
                          underReviewApps.map((app) => (
                            <div key={app.id} className="grid grid-cols-[5fr_4fr_4fr_2fr] items-center gap-2 py-3 px-1 border-b border-gray-50 last:border-0">
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="w-9 h-9 bg-[#8C1535] rounded-xl shrink-0" />
                                <p className="font-medium text-[clamp(11px,0.9vw,15px)] truncate">{app.student.user.fname} {app.student.user.lname}</p>
                              </div>
                              <p className="text-sm text-gray-500 capitalize">{app.applicationStayType.replace("_", "-")}</p>
                              <p className="text-sm text-gray-500">{fmt(app.applicationDate)}</p>
                              <div className="flex justify-center">
                                <Button variant="reddishPink" size="sm" className="!rounded-xl" onClick={() => handleOpenReview(app)}>Review</Button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </SectionCard>

                  <SectionCard title="Waitlisted" action="View all →" onAction={() => navigate(accommodationId ? `/landlord/applications?accId=${accommodationId}` : "/landlord/applications")}>
                    <div className="overflow-x-auto">
                      <div className="min-w-[500px] xl:min-w-0">
                        <div className="flex items-center text-[10px] font-semibold text-gray-400 uppercase tracking-wider pb-2 border-b border-gray-100">
                          <span className="flex-[5] text-[#9A7080] font-bold">Student</span>
                          <span className="flex-[3] text-[#9A7080] font-bold">Preferred Type</span>
                          <span className="flex-[3] text-center text-[#9A7080] font-bold">Since</span>
                        </div>
                        <p className="text-xs text-gray-400 py-4 text-center italic">Waitlist is managed by your assigned manager</p>
                      </div>
                    </div>
                  </SectionCard>
                </div>

                <SectionCard title="Rooms" action="Manage →" onAction={() => navigate("/landlord/rooms")}>
                  <div className="overflow-x-auto">
                    <div className="min-w-[500px] xl:min-w-0">
                      <div className="flex items-center text-[10px] font-semibold uppercase tracking-wider pb-2 border-b border-gray-100">
                        <span className="flex-1 text-[#9A7080] font-bold">Room Number</span>
                        <span className="flex-1 text-center text-[#9A7080] font-bold">Type</span>
                        <span className="flex-1 text-center text-[#9A7080] font-bold">Occupancy</span>
                        <span className="flex-1 text-center text-[#9A7080] font-bold">Status</span>
                      </div>
                      {roomsLoading ? (
                        <p className="text-xs text-gray-400 py-4 text-center">Loading…</p>
                      ) : rooms.length === 0 ? (
                        <p className="text-xs text-gray-400 py-4 text-center italic">No rooms added yet</p>
                      ) : (
                        paginatedRooms.map((r) => {
                          let statusText = r.roomAvailability === "available" ? "Available" : r.roomAvailability === "occupied" ? "Fully Occupied" : r.roomAvailability;
                          const statusColor = r.roomAvailability === "available" ? "bg-green-100 text-green-700" : r.roomAvailability === "occupied" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700";
                          return (
                            <div key={r.id} className="flex items-center py-3 border-b border-gray-50 last:border-0">
                              <div className="flex-1 flex items-center gap-3"><div className="w-9 h-9 bg-[#8C1535] rounded-xl shrink-0" /><p className="font-medium text-sm">Room {r.roomNumber}</p></div>
                              <div className="flex-1 flex justify-center"><p className="text-sm text-gray-500 capitalize">{r.roomType}</p></div>
                              <div className="flex-1 flex justify-center"><p className="text-sm text-gray-500">{r.roomCurrentOccupancy}/{r.roomCapacity}</p></div>
                              <div className="flex-1 flex justify-center"><span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusColor}`}>{statusText}</span></div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                  {rooms.length > ROOMS_PER_PAGE && (
                    <div className="flex flex-col">
                      <hr className="border-[#6B0F2B]/10 border-t" />
                      <div className="flex items-center justify-between mt-3">
                        <p className="text-xs text-[#9A7080]">
                          Showing {(roomsPage - 1) * ROOMS_PER_PAGE + 1}–{Math.min(roomsPage * ROOMS_PER_PAGE, rooms.length)} of {rooms.length} rooms
                        </p>
                        <div className="flex items-center justify-center gap-1">
                          {roomsPage > 1 && (
                            <button
                              onClick={() => setRoomsPage((p) => p - 1)}
                              className="flex items-center justify-center w-7 h-7 text-xs rounded-md border border-[#E8D5DC] text-[#9A7080] hover:bg-[#F5ECF0] transition"
                            >
                              {"<"}
                            </button>
                          )}
                          {Array.from({ length: totalRoomPages }, (_, i) => i + 1).map((page) => (
                            <button
                              key={page}
                              onClick={() => setRoomsPage(page)}
                              className={`w-7 h-7 text-xs rounded-md font-medium transition flex items-center justify-center ${
                                roomsPage === page
                                  ? "text-white"
                                  : "text-[#9A7080] border border-[#E8D5DC] hover:bg-[#F5ECF0]"
                              }`}
                              style={roomsPage === page ? { background: "linear-gradient(135deg, #6B0F2B, #9E2040)" } : {}}
                            >
                              {page}
                            </button>
                          ))}
                          {roomsPage < totalRoomPages && (
                            <button
                              onClick={() => setRoomsPage((p) => p + 1)}
                              className="flex items-center justify-center w-7 h-7 text-xs rounded-md border border-[#E8D5DC] text-[#9A7080] hover:bg-[#F5ECF0] transition"
                            >
                              {">"}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </SectionCard>
              </div>
            )}
          </div>
        </main>

        <aside className="relative z-10 hidden lg:flex w-[400px] flex-shrink-0 flex-col gap-4 pr-4 pl-1 pb-4 bg-[#FAF8F9] overflow-y-auto">
          <RightPanel />
        </aside>
      </div>

      {/* ADD DOCUMENT MODAL */}
      <Modal 
        open={docModalOpen} 
        onClose={() => setDocModalOpen(false)} 
        title="Add Document Requirements" 
        eyebrow="Facility-Specific"
        footer={
        <Button variant="primary" size="md" className="ml-auto !rounded-2xl" disabled={addDocMutation.isPending}
          onClick={() => { if (newDocName.trim()) addDocMutation.mutate({ requirement_name: newDocName.trim(), accepted_format: newDocFormat }); }}>
          {addDocMutation.isPending ? "Adding…" : "Add"}
        </Button>}>
        <div className="flex flex-col gap-4">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Facility-Specific</p>
            <div className="flex gap-2 flex-wrap items-center">{facilityDocs.map((doc) => 
              <span key={doc.id} className="w-fit inline-flex items-center px-3 py-2 bg-[#6B0F2B] text-white rounded-full text-xs font-bold">{doc.requirementName}
              </span>)}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Document Name</p>
            <input className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#8C1535]" placeholder="Medical Certificate" value={newDocName} onChange={(e) => setNewDocName(e.target.value)} 
            />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Accepted Document Format</p>
            <div className="relative w-full">
              <select
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 pr-10 text-sm outline-none focus:border-[#8C1535] appearance-none bg-white"
                value={newDocFormat}
                onChange={(e) => setNewDocFormat(e.target.value)}
              >
                <option value="any">Any</option>
                <option value="pdf">PDF</option>
                <option value="image">JPEG / PNG</option>
              </select>

              <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#3D0718]">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </Modal>

      {/* DELETE DOCUMENT MODAL */}
      <Modal open={docToDelete !== null} onClose={() => setDocToDelete(null)} title="Remove Document" eyebrow="Document Requirements"
        footer={<div className="flex gap-2 ml-auto"><Button variant="secondary" size="md" onClick={() => setDocToDelete(null)}>Cancel</Button>
          <Button variant="primary" size="md" disabled={removeDocMutation.isPending} onClick={() => { if (docToDelete) removeDocMutation.mutate(docToDelete.id); }}>{removeDocMutation.isPending ? "Removing…" : "Remove"}</Button></div>}>
        <p className="text-sm text-gray-600">Are you sure you want to remove <span className="font-semibold text-[#6B0F2B]">{docToDelete?.name ?? ""}</span> from the document requirements? This may affect existing tenants.</p>
      </Modal>

      {/* APPLICATION REVIEW MODAL */}
      <Modal open={reviewModalOpen} onClose={handleCloseReview} title="Review Application" eyebrow="Application Details"
        footer={<div className="flex gap-2 ml-auto">
          <Button variant="secondary" size="md" onClick={handleRejectClick}>Reject</Button>
          <Button variant="primary" size="md" onClick={handleConfirmApproval} disabled={reviewAppMutation.isPending}>{reviewAppMutation.isPending ? "Processing…" : "Accept"}</Button></div>}>
        {selectedApp && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><p className="text-xs text-gray-400 uppercase tracking-wider">Student Name</p><p className="font-semibold text-gray-800">{selectedApp.student.user.fname} {selectedApp.student.user.lname}</p></div>
              <div><p className="text-xs text-gray-400 uppercase tracking-wider">Student Number</p><p className="font-semibold text-gray-800">{selectedApp.student.studentNumber}</p></div>
              <div><p className="text-xs text-gray-400 uppercase tracking-wider">Room Type</p><p className="font-semibold text-gray-800 capitalize">{selectedApp.applicationRoomType}</p></div>
              <div><p className="text-xs text-gray-400 uppercase tracking-wider">Stay Type</p><p className="font-semibold text-gray-800 capitalize">{selectedApp.applicationStayType.replace("_", "-")}</p></div>
              <div><p className="text-xs text-gray-400 uppercase tracking-wider">Application Date</p><p className="font-semibold text-gray-800">{fmt(selectedApp.applicationDate)}</p></div>
              <div><p className="text-xs text-gray-400 uppercase tracking-wider">Current Status</p><span className="inline-block bg-yellow-100 text-yellow-800 text-xs font-semibold px-2 py-0.5 rounded-full">Under Review</span></div>
            </div>
          </div>
        )}
      </Modal>

      {/* REJECTION REASON MODAL */}
      <Modal open={rejectionModalOpen} onClose={() => { setRejectionModalOpen(false); setRejectionReason(""); }} title="Rejection Reason" eyebrow="Application Rejection"
        footer={<div className="flex gap-2 ml-auto">
          <Button variant="secondary" size="md" onClick={handleBackToReview}>← Back</Button>
          <Button variant="primary" size="md" onClick={handleConfirmRejection} disabled={reviewAppMutation.isPending || !rejectionReason.trim()}>{reviewAppMutation.isPending ? "Processing…" : "Reject"}</Button></div>}>
        <div className="space-y-4">
          <p className="text-sm text-gray-600">Please provide a reason for rejecting this application. This will be communicated to the applicant.</p>
          <div><label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Rejection Reason</label>
            <textarea className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#8C1535] min-h-[120px] resize-none" placeholder="Enter the reason for rejection..." value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} /></div>
        </div>
      </Modal>
    </div>
  );
}