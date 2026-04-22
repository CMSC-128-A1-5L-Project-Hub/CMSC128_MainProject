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
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";

interface LandlordProfile {
    fullName: string
    shortName: string
    email: string
    phoneNumber: string
    status: string
    dormitory: string
}

interface HeroContent {
    greeting: string
    title: string
    subtitle: string
}

const heroContent: HeroContent = {
    greeting: "Good Day",
    title: "Efficiently manage applicants & housing accommodation",
    subtitle: "You have 2 pending applications and 3 new notifications"
}

const landlordProfile: LandlordProfile = {
    fullName: "Dal Cadsawan",
    shortName: "Dal",
    email: "ddcadsawan@up.edu.ph",
    phoneNumber: "+63 912 345 6789",
    status: "Active",
    dormitory: "Narra Residences"
}

function FilterTabs({ active, setActive }: any) {
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

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("Overview");
  const [docModalOpen, setDocModalOpen] = useState(false);
  const [facilityDocs, setFacilityDocs] = useState(["Birth Certificate"]);
  const [newDocName, setNewDocName] = useState("");
  const [editingDocs, setEditingDocs] = useState(false);
  const [docToDelete, setDocToDelete] = useState<number | null>(null);
  const navigate = useNavigate();

  const RightPanel = () => (
    <div className="flex flex-col gap-4">
      <ProfileCard />
      <ApplicationPeriod />
      <ActivityLogs />
      <ReportsPanel />
    </div>
  );

  return (
    <div className="flex h-screen bg-[#F5EEF0] overflow-hidden">
      <Sidebar role="landlordDashboard" />

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
                onClick={() => navigate("/manage/landlord/accommodation")}
              >
                ← Back
              </Button>
              <span className="text-gray-300">|</span>
              <h2 className="font-semibold text-lg">Dashboard</h2>
            </div>

            {/* HERO */}
            <HeroBanner 
              greeting={heroContent.greeting}
              title={heroContent.title}
              subtitle={heroContent.subtitle}
              name={landlordProfile.fullName}
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
                  <StatCard title="REVENUE" value="₱120,000" subtitle="↑ on track" />
                  <StatCard title="COLLECTED" value="₱80,000" subtitle="67%" />
                  <StatCard title="PENDING" value="₱40,000" subtitle="33%" negative />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  <SectionCard title="Occupancy Rate">
                    <div className="flex items-center gap-4">
                      <div className="shrink-0">
                        <CircleProgress value={83} />
                      </div>
                      <div className="flex flex-col gap-2 flex-1">
                        <div className="flex justify-between items-center p-2 rounded-xl" style={{ background: "rgba(140,21,53,0.06)" }}>
                          <div>
                            <p className="text-[10px] text-[#8C1535]/60 uppercase tracking-wider">Occupied</p>
                            <p className="text-lg font-bold text-[#8C1535]">100</p>
                          </div>
                          <div className="w-2 h-2 rounded-full bg-[#8C1535]" />
                        </div>
                        <div className="flex justify-between items-center p-2 rounded-xl" style={{ background: "rgba(0,0,0,0.03)" }}>
                          <div>
                            <p className="text-[10px] text-gray-400 uppercase tracking-wider">Vacant</p>
                            <p className="text-lg font-bold text-gray-400">30</p>
                          </div>
                          <div className="w-2 h-2 rounded-full bg-gray-300" />
                        </div>
                        <div className="flex justify-between items-center p-2 rounded-xl" style={{ background: "rgba(140,21,53,0.03)" }}>
                          <div>
                            <p className="text-[10px] text-gray-400 uppercase tracking-wider">Total Rooms</p>
                            <p className="text-lg font-bold text-gray-600">130</p>
                          </div>
                          <div className="w-2 h-2 rounded-full bg-gray-200" />
                        </div>
                      </div>
                    </div>
                  </SectionCard>

                  <SectionCard title="Form 5 Renewal">
                    <div className="flex items-center gap-4">
                      <div className="shrink-0">
                        <CircleProgress value={83} />
                      </div>
                      <div className="flex flex-col gap-2 flex-1">
                        <div className="flex justify-between items-center p-2 rounded-xl" style={{ background: "rgba(140,21,53,0.06)" }}>
                          <div>
                            <p className="text-[10px] text-[#8C1535]/60 uppercase tracking-wider">Renewed</p>
                            <p className="text-lg font-bold text-[#8C1535]">18</p>
                          </div>
                          <div className="w-2 h-2 rounded-full bg-[#8C1535]" />
                        </div>
                        <div className="flex justify-between items-center p-2 rounded-xl" style={{ background: "rgba(202,138,4,0.06)" }}>
                          <div>
                            <p className="text-[10px] text-yellow-600/70 uppercase tracking-wider">Pending</p>
                            <p className="text-lg font-bold text-yellow-600">18</p>
                          </div>
                          <div className="w-2 h-2 rounded-full bg-yellow-500" />
                        </div>
                        <div className="flex justify-between items-center p-2 rounded-xl" style={{ background: "rgba(0,0,0,0.03)" }}>
                          <div>
                            <p className="text-[10px] text-gray-400 uppercase tracking-wider">Not Enrolled</p>
                            <p className="text-lg font-bold text-gray-400">2</p>
                          </div>
                          <div className="w-2 h-2 rounded-full bg-gray-300" />
                        </div>
                      </div>
                    </div>
                  </SectionCard>

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
                                  style={{ lineHeight: 0, border: "none", padding: 0 }}
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
              <>
                <PaymentList />
              </>
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
                        {[
                          { name: "Ana Marie Reyes", type: "Non-transient", date: "Mar 12, 2026" },
                          { name: "Ana Marie Reyes", type: "Non-transient", date: "Mar 14, 2026" },
                          { name: "Ana Marie Reyes", type: "Non-transient", date: "Mar 15, 2026" },
                        ].map((item, i) => (
                          <div key={i} className="flex items-center gap-2 py-3 px-1 border-b border-gray-50 last:border-0">
                            <div className="flex-[5] flex items-center gap-3 min-w-0">
                              <div className="w-9 h-9 bg-[#8C1535] rounded-xl shrink-0" />
                              <p className="font-medium whitespace-nowrap text-[clamp(11px,0.9vw,15px)]">{item.name}</p>
                            </div>
                            <div className="flex-[3] flex"><p className="text-sm text-gray-500">{item.type}</p></div>
                            <div className="flex-[3] flex"><p className="text-sm text-gray-500">{item.date}</p></div>
                            <div className="flex-[2] flex justify-center"><Button variant="reddishPink" size="sm" className="!rounded-xl">Review</Button></div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </SectionCard>

                  {/* WAITLISTED */}
                  <SectionCard title="Waitlisted" action="View all →">
                    <div className="overflow-x-auto">
                      <div className="min-w-[500px] xl:min-w-0">
                        <div className="flex items-center text-[10px] font-semibold text-gray-400 uppercase tracking-wider pb-2 border-b border-gray-100">
                          <span className="flex-[5] text-[#9A7080] font-bold">Student</span>
                          <span className="flex-[3] text-[#9A7080] font-bold">Preferred Type</span>
                          <span className="flex-[3] text-center text-[#9A7080] font-bold">Since</span>
                        </div>
                        {[
                          { name: "Ana Marie Reyes", type: "Solo", date: "Mar 12, 2026" },
                          { name: "Ana Marie Reyes", type: "Solo", date: "Mar 14, 2026" },
                          { name: "Ana Marie Reyes", type: "Double", date: "Mar 15, 2026" },
                        ].map((item, i) => (
                          <div key={i} className="flex items-center gap-2 py-3 px-1 border-b border-gray-50 last:border-0">
                            <div className="flex-[5] flex items-center gap-3 min-w-0">
                              <div className="w-9 h-9 bg-[#8C1535] rounded-xl shrink-0" />
                              <p className="font-medium whitespace-nowrap text-[clamp(11px,0.9vw,15px)]">{item.name}</p>
                            </div>
                            <div className="flex-[3] flex"><p className="text-sm text-gray-500">{item.type}</p></div>
                            <div className="flex-[3] flex justify-center"><p className="text-sm text-gray-500">{item.date}</p></div>
                          </div>
                        ))}
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
                    </div>
                    {[
                      { room: "Room 101", type: "Single", occ: "1/1" },
                      { room: "Room 102", type: "Double", occ: "1/2" },
                      { room: "Room 103", type: "Shared", occ: "4/4" },
                    ].map((r, i) => (
                      <div key={i} className="flex items-center py-3 border-b border-gray-50 last:border-0">
                        <div className="flex-1 flex items-center gap-3">
                          <div className="w-9 h-9 bg-[#8C1535] rounded-xl shrink-0" />
                          <p className="font-medium text-sm">{r.room}</p>
                        </div>
                        <div className="flex-1 flex justify-center"><p className="text-sm text-gray-500">{r.type}</p></div>
                        <div className="flex-1 flex justify-center"><p className="text-sm text-gray-500">{r.occ}</p></div>
                      </div>
                    ))}
                  </div>
                </SectionCard>
              </div>
            )}
          </div>
        </main>

        {/* RIGHT PANEL*/}
        <aside className="hidden lg:flex w-[400px] flex-shrink-0 flex-col gap-4 pr-4 pl-1 pb-4 bg-[#F5EEF0] overflow-y-auto">
          <ProfileCard
            status="assigned"
            name={landlordProfile.fullName}
            role="Property Owner / Landlord"
            phone={landlordProfile.phoneNumber}
            email={landlordProfile.email}
            dormitory={landlordProfile.dormitory}
            onNotification={() => console.log("Notification clicked")}
          />
          <ApplicationPeriod />
          <ActivityLogs />
          <ReportsPanel />
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

      {/* DELETE CONFIRMATION MODAL */}
      <Modal
        open={docToDelete !== null}
        onClose={() => setDocToDelete(null)}
        title="Remove Document"
        eyebrow="Document Requirements"
        footer={
          <div className="flex gap-2 ml-auto">
            <Button variant="secondary" size="md" onClick={() => setDocToDelete(null)}>Cancel</Button>
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