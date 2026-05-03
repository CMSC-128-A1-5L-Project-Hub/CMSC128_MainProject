import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { X } from "lucide-react";

import HeroBanner from "../../components/dashboard/HeroBanner";
import StatCard from "../../components/dashboard/landlord/rooms/dashboard/StatCard";
import SectionCard from "../../components/dashboard/landlord/rooms/dashboard/SectionCard";
import CircleProgress from "../../components/dashboard/landlord/rooms/dashboard/CircleProgress";
import Sidebar from "../../components/Sidebar";
import ProfileCard from "../../components/dashboard/landlord/rooms/dashboard/ManagerCard";
import PaymentList from "../../components/dashboard/landlord/rooms/dashboard/PaymentList";
import ActivityLogs from "../../components/dashboard/landlord/rooms/dashboard/ActivityLogs";
import ReportsPanel from "../../components/dashboard/landlord/rooms/dashboard/ReportsPanel";
import ApplicationPeriod from "../../components/dashboard/landlord/rooms/dashboard/Calendar";
import Button from "../../components/Button";
import Modal from "../../components/Modal";

import { api } from "../../api/axios";
import { useUserStore } from "../../stores/useUserStore";
import { queryClient } from "../../lib/queryClient";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Accommodation {
  id: number
  accommodationName: string
  status: string
  applicationStartDate: string | null
  applicationEndDate: string | null
  manager: {
    userId: number
    managerStatus: string
    user: {
      fname: string
      lname: string
      email: string
      phoneNumbers: { contactNumber: string; isPrimary: boolean }[]
    }
  } | null
}

interface Application {
  id: number
  applicationRoomType: string
  applicationStayType: string
  applicationStatus: string
  applicationDate: string
  student: {
    studentNumber: string
    user: { fname: string; lname: string }
  }
}

interface Room {
  id: number
  roomNumber: string
  roomType: string
  roomCapacity: number
  roomCurrentOccupancy: number
  roomAvailability: string
}

interface RevenueData {
  projectedMonthlyRevenue: number
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
    month: "short", day: "numeric", year: "numeric",
  });
}

function FilterTabs({ active, setActive }: { active: string; setActive: (t: string) => void }) {
  const tabs = ["Overview", "Fees", "Rooms"];
  return (
    <div className="bg-white p-1 rounded-xl inline-flex gap-1">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => setActive(tab)}
          className={`px-4 py-1.5 text-sm rounded-lg transition ${
            active === tab ? "bg-[#6B0F2B] text-white shadow" : "text-gray-500 hover:text-black"
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("Overview");
  const [docModalOpen, setDocModalOpen] = useState(false);
  const [facilityDocs, setFacilityDocs] = useState(["Birth Certificate"]);
  const [newDocName, setNewDocName] = useState("");
  const [editingDocs, setEditingDocs] = useState(false);
  const [docToDelete, setDocToDelete] = useState<number | null>(null);
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const user = useUserStore((s) => s.user);

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

  // ── Mutations ────────────────────────────────────────────────────────────────

  const saveAppPeriod = useMutation({
    mutationFn: ({ start, end }: { start: string; end: string }) =>
      api.put(`/landlord/accommodations/${accommodationId}`, {
        application_start_date: start,
        application_end_date: end,
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["landlord-accommodations"] }),
  });

  // ── Derived values ──────────────────────────────────────────────────────────

  const totalCapacity = rooms.reduce((s, r) => s + r.roomCapacity, 0);
  const totalOccupied = rooms.reduce((s, r) => s + r.roomCurrentOccupancy, 0);
  const occupancyPct = totalCapacity > 0 ? Math.round((totalOccupied / totalCapacity) * 100) : 0;

  const projectedRevenue = revenue?.projectedMonthlyRevenue ?? 0;

  const underReviewApps = applications.filter((a) => a.applicationStatus === "under_review");

  // Manager card props
  const manager = accommodation?.manager;
  const managerStatus = !manager ? "none"
    : manager.managerStatus === "active" ? "assigned" : "pending";
  const primaryPhone = manager?.user?.phoneNumbers?.find((p) => p.isPrimary)?.contactNumber ?? "";

  // ── Right panel (shared between mobile and desktop) ─────────────────────────

  const RightPanel = () => (
    <div className="flex flex-col gap-4">
      <ProfileCard
        status={managerStatus}
        fullName={manager ? `${manager.user.fname} ${manager.user.lname}` : undefined}
        role="Dorm Manager"
        phoneNumber={primaryPhone}
        email={manager?.user?.email}
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
    <div className="flex h-screen bg-[#F5EEF0] overflow-hidden">
      <Sidebar role="landlord" />

      {/* Everything right of sidebar: main + right panel, side by side */}
      <div className="flex flex-1 overflow-hidden min-w-0">

        {/* MAIN — grows to fill all space between sidebar and right panel */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 min-w-0">
          <div className="space-y-4">

            {/* NAVBAR */}
            <div className="flex items-center gap-3 pl-16 lg:pl-0">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => navigate("/landlord/dashboard")}
              >
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
              name={user ? `${user.fname} ${user.lname}` : ""}
              type="full"
            />

            {/* RIGHT PANEL — mobile only, below hero */}
            <div className="lg:hidden">
              <RightPanel />
            </div>

            {/* FILTER */}
            <FilterTabs active={activeTab} setActive={setActiveTab} />

            {/* OVERVIEW */}
            {activeTab === "Overview" && (
              <>
                <div className="grid grid-cols-3 gap-4">
                  <StatCard
                    title="PROJECTED REVENUE"
                    value={`₱${projectedRevenue.toLocaleString("en-PH")}`}
                    subtitle="Monthly (active tenants)"
                  />
                  <StatCard
                    title="OCCUPIED"
                    value={`${totalOccupied}`}
                    subtitle={`${occupancyPct}% of capacity`}
                  />
                  <StatCard
                    title="VACANT"
                    value={`${Math.max(totalCapacity - totalOccupied, 0)}`}
                    subtitle={`${100 - occupancyPct}% available`}
                    negative={totalCapacity - totalOccupied === 0}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">

                  {/* OCCUPANCY */}
                  <SectionCard title="Occupancy Rate">
                    <div className="flex items-center gap-4">
                      <div className="shrink-0">
                        <CircleProgress value={occupancyPct} />
                      </div>
                      <div className="flex flex-col gap-2 flex-1">
                        <div className="flex justify-between items-center p-2 rounded-xl" style={{ background: "rgba(140,21,53,0.06)" }}>
                          <div>
                            <p className="text-[10px] text-[#8C1535]/60 uppercase tracking-wider">Occupied</p>
                            <p className="text-lg font-bold text-[#8C1535]">{totalOccupied}</p>
                          </div>
                          <div className="w-2 h-2 rounded-full bg-[#8C1535]" />
                        </div>
                        <div className="flex justify-between items-center p-2 rounded-xl" style={{ background: "rgba(0,0,0,0.03)" }}>
                          <div>
                            <p className="text-[10px] text-gray-400 uppercase tracking-wider">Vacant</p>
                            <p className="text-lg font-bold text-gray-400">{Math.max(totalCapacity - totalOccupied, 0)}</p>
                          </div>
                          <div className="w-2 h-2 rounded-full bg-gray-300" />
                        </div>
                        <div className="flex justify-between items-center p-2 rounded-xl" style={{ background: "rgba(140,21,53,0.03)" }}>
                          <div>
                            <p className="text-[10px] text-gray-400 uppercase tracking-wider">Total Rooms</p>
                            <p className="text-lg font-bold text-gray-600">{totalCapacity}</p>
                          </div>
                          <div className="w-2 h-2 rounded-full bg-gray-200" />
                        </div>
                      </div>
                    </div>
                  </SectionCard>

                  {/* FORM 5 RENEWAL — static, no backend endpoint yet */}
                  <SectionCard title="Form 5 Renewal">
                    <div className="flex items-center gap-4">
                      <div className="shrink-0">
                        <CircleProgress value={83} />
                      </div>
                      <div className="flex flex-col gap-2 flex-1">
                        <div className="flex justify-between items-center p-2 rounded-xl" style={{ background: "rgba(140,21,53,0.06)" }}>
                          <div>
                            <p className="text-[10px] text-[#8C1535]/60 uppercase tracking-wider">Renewed</p>
                            <p className="text-lg font-bold text-[#8C1535]">—</p>
                          </div>
                          <div className="w-2 h-2 rounded-full bg-[#8C1535]" />
                        </div>
                        <div className="flex justify-between items-center p-2 rounded-xl" style={{ background: "rgba(202,138,4,0.06)" }}>
                          <div>
                            <p className="text-[10px] text-yellow-600/70 uppercase tracking-wider">Pending</p>
                            <p className="text-lg font-bold text-yellow-600">—</p>
                          </div>
                          <div className="w-2 h-2 rounded-full bg-yellow-500" />
                        </div>
                        <div className="flex justify-between items-center p-2 rounded-xl" style={{ background: "rgba(0,0,0,0.03)" }}>
                          <div>
                            <p className="text-[10px] text-gray-400 uppercase tracking-wider">Not Enrolled</p>
                            <p className="text-lg font-bold text-gray-400">—</p>
                          </div>
                          <div className="w-2 h-2 rounded-full bg-gray-300" />
                        </div>
                      </div>
                    </div>
                  </SectionCard>

                  {/* DOCUMENT REQUIREMENTS */}
                  <SectionCard
                    title="Document Requirements"
                    action={editingDocs ? "Done" : "Edit →"}
                    onAction={() => setEditingDocs(!editingDocs)}
                  >
                    <div className="flex flex-col gap-3 text-sm -mt-2">
                      <div>
                        <p className="text-xs text-gray-400 mb-1">SYSTEM STANDARD</p>
                        <div className="flex gap-2 flex-wrap items-center">
                          <span className="w-fit inline-flex items-center px-3 py-2 bg-[#6B0F2B] text-white rounded-full text-xs font-bold">Form 5</span>
                          <span className="w-fit inline-flex items-center px-3 py-2 bg-[#6B0F2B] text-white rounded-full text-xs font-bold">Valid ID</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 mb-1">FACILITY-SPECIFIC</p>
                        <div className="flex gap-2 flex-wrap items-center">
                          {facilityDocs.map((doc, i) => (
                            <span key={i} className="w-fit inline-flex items-center gap-2 pl-3 pr-1.5 py-2 bg-[#6B0F2B] text-white rounded-full text-xs font-bold">
                              {doc}
                              {editingDocs && (
                                <button
                                  onClick={() => setDocToDelete(i)}
                                  className="w-4 h-4 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center transition shrink-0"
                                >
                                  <X size={8} strokeWidth={3} color="white" />
                                </button>
                              )}
                            </span>
                          ))}
                          <Button variant="dashed" size="sm" onClick={() => setDocModalOpen(true)}>
                            + Add More
                          </Button>
                        </div>
                      </div>
                    </div>
                  </SectionCard>

                </div>
              </>
            )}

            {/* FEES */}
            {activeTab === "Fees" && (
              <PaymentList
                delinquent={delinquent}
                isLoading={feesLoading}
              />
            )}

            {/* ROOMS */}
            {activeTab === "Rooms" && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                  {/* APPLICATIONS UNDER REVIEW */}
                  <SectionCard title="Applications Under Review" action="View all →">
                    <div className="overflow-x-auto">
                      <div className="min-w-[500px] xl:min-w-0">
                        <div className="flex items-center text-[10px] font-semibold text-gray-400 uppercase tracking-wider pb-2 border-b border-gray-100">
                          <span className="flex-[5] text-[#9A7080] font-bold">Student</span>
                          <span className="flex-[3] text-[#9A7080] font-bold">Type</span>
                          <span className="flex-[3] text-[#9A7080] font-bold">Applied</span>
                          <span className="flex-[2] text-center text-[#9A7080] font-bold">Action</span>
                        </div>

                        {appsLoading ? (
                          <p className="text-xs text-gray-400 py-4 text-center">Loading…</p>
                        ) : underReviewApps.length === 0 ? (
                          <p className="text-xs text-gray-400 py-4 text-center italic">No applications under review</p>
                        ) : (
                          underReviewApps.map((app) => (
                            <div key={app.id} className="flex items-center gap-2 py-3 px-1 border-b border-gray-50 last:border-0">
                              <div className="flex-[5] flex items-center gap-3 min-w-0">
                                <div className="w-9 h-9 bg-[#8C1535] rounded-xl shrink-0" />
                                <p className="font-medium whitespace-nowrap text-[clamp(11px,0.9vw,15px)]">
                                  {app.student.user.fname} {app.student.user.lname}
                                </p>
                              </div>
                              <div className="flex-[3]">
                                <p className="text-sm text-gray-500 capitalize">{app.applicationStayType.replace("_", "-")}</p>
                              </div>
                              <div className="flex-[3]">
                                <p className="text-sm text-gray-500">{fmt(app.applicationDate)}</p>
                              </div>
                              <div className="flex-[2] flex justify-center">
                                <Button variant="reddishPink" size="sm" className="!rounded-xl">
                                  Review
                                </Button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </SectionCard>

                  {/* WAITLISTED — manager domain, shown as empty for landlord */}
                  <SectionCard title="Waitlisted" action="View all →">
                    <div className="overflow-x-auto">
                      <div className="min-w-[500px] xl:min-w-0">
                        <div className="flex items-center text-[10px] font-semibold text-gray-400 uppercase tracking-wider pb-2 border-b border-gray-100">
                          <span className="flex-[5] text-[#9A7080] font-bold">Student</span>
                          <span className="flex-[3] text-[#9A7080] font-bold">Preferred Type</span>
                          <span className="flex-[3] text-center text-[#9A7080] font-bold">Since</span>
                        </div>
                        <p className="text-xs text-gray-400 py-4 text-center italic">
                          Waitlist is managed by your assigned manager
                        </p>
                      </div>
                    </div>
                  </SectionCard>

                </div>

                {/* ROOMS */}
                <SectionCard title="Rooms" action="Manage →">
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
                      rooms.map((r) => (
                        <div key={r.id} className="flex items-center py-3 border-b border-gray-50 last:border-0">
                          <div className="flex-1 flex items-center gap-3">
                            <div className="w-9 h-9 bg-[#8C1535] rounded-xl shrink-0" />
                            <p className="font-medium text-sm">Room {r.roomNumber}</p>
                          </div>
                          <div className="flex-1 flex justify-center">
                            <p className="text-sm text-gray-500 capitalize">{r.roomType}</p>
                          </div>
                          <div className="flex-1 flex justify-center">
                            <p className="text-sm text-gray-500">{r.roomCurrentOccupancy}/{r.roomCapacity}</p>
                          </div>
                          <div className="flex-1 flex justify-center">
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                              r.roomAvailability === "available" ? "bg-green-100 text-green-700"
                              : r.roomAvailability === "occupied" ? "bg-red-100 text-red-700"
                              : "bg-yellow-100 text-yellow-700"
                            }`}>
                              {r.roomAvailability}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </SectionCard>

              </div>
            )}

          </div>
        </main>

        {/* RIGHT PANEL — desktop */}
        <aside className="hidden lg:flex w-[340px] shrink-0 border-l bg-white/60 backdrop-blur p-4 flex-col gap-4 overflow-y-auto">
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
          <Button
            variant="primary"
            size="md"
            className="ml-auto !rounded-2xl"
            onClick={() => {
              if (newDocName.trim()) {
                setFacilityDocs([...facilityDocs, newDocName.trim()]);
                setNewDocName("");
                setDocModalOpen(false);
              }
            }}
          >
            Add
          </Button>
        }
      >
        <div className="flex flex-col gap-4">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Facility-Specific</p>
            <div className="flex gap-2 flex-wrap items-center">
              {facilityDocs.map((doc, i) => (
                <span key={i} className="w-fit inline-flex items-center px-3 py-2 bg-[#6B0F2B] text-white rounded-full text-xs font-bold">
                  {doc}
                </span>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Document Name</p>
            <input
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#8C1535]"
              placeholder="Medical Certificate"
              value={newDocName}
              onChange={(e) => setNewDocName(e.target.value)}
            />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Accepted Document Format</p>
            <select className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#8C1535] appearance-none bg-white">
              <option value="">Selected Format</option>
              <option>PDF</option>
              <option>JPEG / PNG</option>
              <option>Any</option>
            </select>
          </div>
        </div>
      </Modal>

      {/* DELETE DOCUMENT MODAL */}
      <Modal
        open={docToDelete !== null}
        onClose={() => setDocToDelete(null)}
        title="Remove Document"
        eyebrow="Document Requirements"
        footer={
          <div className="flex gap-2 ml-auto">
            <Button variant="secondary" size="md" onClick={() => setDocToDelete(null)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={() => {
                setFacilityDocs(facilityDocs.filter((_, j) => j !== docToDelete));
                setDocToDelete(null);
              }}
            >
              Remove
            </Button>
          </div>
        }
      >
        <p className="text-sm text-gray-600">
          Are you sure you want to remove{" "}
          <span className="font-semibold text-[#6B0F2B]">
            {docToDelete !== null ? facilityDocs[docToDelete] : ""}
          </span>{" "}
          from the document requirements? This may affect existing tenants.
        </p>
      </Modal>
 </div>
  );
}
