import { useState, useMemo } from "react";
import Sidebar from "../../components/Sidebar";
import Modal from "../../components/Modal";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const CLR = {
  dark: "#3D0718",
  mid: "#6B0F2B",
  accent: "#8C1535",
  gold: "#C9973A",
  avatars: [
    "#6B0F2B", "#8C1535", "#3D0718", "#b45309", "#15803d",
    "#7c3aed", "#1d4ed8", "#0f766e", "#92400e", "#065f46",
  ],
} as const;

type UIStatus = "Under Review" | "Accepted" | "Waitlisted" | "Rejected";

// updated Interface to match mapped backend data
interface Application {
  id: number;
  student: string;
  email: string;
  date: string;
  reviewed: string;
  status: UIStatus;
  type?: string;
  remark?: string;
  assignedRoom?: string;
  originalData?: any; // keep the raw backend data just in case
}

const ROOM_DATA = [
  { id: "Room 210", building: "Building 2", type: "Shared", price: "₱3,200 / month", occupants: 2, capacity: 4 },
  { id: "Room 221", building: "Building 2", type: "Shared", price: "₱3,200 / month", occupants: 4, capacity: 4 },
];

// helper to map backend statuses to UI badges
const mapStatus = (apiStatus: string): UIStatus => {
  switch (apiStatus) {
    case "under_review": return "Under Review";
    case "approved": return "Accepted";
    case "confirmed": return "Accepted"; // grouping confirmed as accepted visually
    case "waitlisted": return "Waitlisted";
    case "rejected": return "Rejected";
    default: return "Under Review";
  }
};

function FilterTabs({ active, setActive }: any) {
  const tabs = ["Application", "Waitlist"];
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

const ITEMS_PER_PAGE = 6;
const STATUS_CONFIG: Record<UIStatus, { color: string; bg: string; dot: string }> = {
  Accepted: { color: "#1A7A4A", bg: "#dcfce7", dot: "#1A7A4A" },
  "Under Review": { color: "#C9973A", bg: "#fef3c7", dot: "#C9973A" },
  Waitlisted: { color: "#7c3aed", bg: "#ede9fe", dot: "#7c3aed" },
  Rejected: { color: "#9E2040", bg: "#ffe4e6", dot: "#9E2040" },
};

const IconMenu = () => (
  <svg className="w-[22px] h-[22px]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

const StatusBadge = ({ status }: { status: UIStatus }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG["Under Review"];
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2 md:px-3 py-1 rounded-full text-[0.7rem] md:text-xs font-semibold whitespace-nowrap"
      style={{ background: cfg.bg, color: cfg.color }}
    >
      <span className="w-1 md:w-1.5 h-1 md:h-1.5 rounded-full flex-shrink-0" style={{ background: cfg.dot }} />
      {status}
    </span>
  );
};

const DaysAgo = ({ targetDate }: { targetDate: string }) => {
  const daysDifference = useMemo(() => {
    const now = new Date();
    const past = new Date(targetDate);
    if (isNaN(past.getTime())) return 0;
    now.setHours(0, 0, 0, 0);
    past.setHours(0, 0, 0, 0);
    const diffTime = Math.abs(now.getTime() - past.getTime());
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  }, [targetDate]);

  return <span>{daysDifference} days ago</span>;
};

const FilterSelect = ({ label, value, onChange, options }: any) => (
  <div className="flex flex-col gap-0.5 md:gap-1 flex-1 md:flex-none">
    <label className="text-[0.5rem] md:text-[10px] font-bold uppercase tracking-widest text-gray-400">{label}</label>
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none border border-gray-200 rounded-lg md:rounded-xl w-full md:w-auto px-2 py-1 md:px-3 md:py-2 pr-7 md:pr-8 text-[0.7rem] md:text-sm font-semibold focus:outline-none focus:border-[#6B0F2B] cursor-pointer bg-white"
        style={{ color: CLR.mid }}
      >
        {options.map((o: any) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <span className="pointer-events-none absolute right-2 md:right-2.5 top-1/2 -translate-y-1/2 text-gray-400">
        <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </span>
    </div>
  </div>
);

const PageBtn = ({ active, disabled, onClick, children }: any) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-semibold transition-all"
    style={
      active
        ? { background: `linear-gradient(135deg,${CLR.dark}, ${CLR.mid})`, color: "#fff", boxShadow: "0 4px 12px rgba(107,15,43,0.35)" }
        : disabled
        ? { background: "#fff", border: "1.5px solid #ede8ea", color: "#d8cdd1", cursor: "not-allowed" }
        : { background: "#fff", border: "1.5px solid #ede8ea", color: CLR.mid }
    }
  >
    {children}
  </button>
);

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard" },
  { id: "applications", label: "Applications" },
  { id: "rooms", label: "Room Assignment" },
  { id: "waitlist", label: "Waitlisted" }
];

const DrawerNav = ({ open, onClose, activePage, setActivePage }: any) => (
  <>
    {open && <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={onClose} />}
    <div
      className={`fixed top-0 left-0 bottom-0 z-50 w-64 flex flex-col transition-transform duration-300 ease-in-out lg:hidden ${open ? "translate-x-0" : "-translate-x-full"}`}
      style={{ background: `linear-gradient(160deg, ${CLR.dark} 0%, ${CLR.mid} 100%)` }}
    >
      <div className="flex items-center gap-3 px-5 pt-6 pb-5 border-b border-white/10">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: CLR.gold }}>
          <span className="text-white font-bold text-sm">U</span>
        </div>
        <span className="text-white font-bold text-base">UniDorm</span>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => { setActivePage(item.id); onClose(); }}
            className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-2xl text-sm font-semibold transition-all text-left ${
              activePage === item.id ? "bg-white/15 text-white" : "text-white/60 hover:bg-white/10 hover:text-white"
            }`}
          >
            {item.label}
          </button>
        ))}
      </nav>
    </div>
  </>
);

export default function Applications() {
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState("Application");
  const [search, setSearch] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activePage, setActivePage] = useState("applications");
  const [sortBy, setSortBy] = useState<"latest" | "earliest">("latest");
  const [currentPage, setCurrentPage] = useState(1);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [remark, setRemark] = useState("");
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [moveInDate, setMoveInDate] = useState("");
  const [expectedMoveOutDate, setExpectedMoveOutDate] = useState("");

  // fetch data and map it to the UI Interface
  const { data: appsData = [], isLoading } = useQuery<Application[]>({
    queryKey: ["landlord-applications"],
    queryFn: async () => {
      const res = await fetch("/api/applications/incoming"); 
      if (!res.ok) throw new Error("Failed to fetch applications");
      const json = await res.json();
      
      return json.map((app: any) => {
        const user = app.student?.user;
        return {
          id: app.id,
          student: user ? `${user.fname} ${user.lname}` : "Unknown Applicant",
          email: user?.email || "No email provided",
          date: new Date(app.applicationDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
          reviewed: app.reviewedAt ? new Date(app.reviewedAt).toLocaleDateString("en-US") : "---",
          status: mapStatus(app.applicationStatus),
          type: app.applicationStayType,
          remark: app.rejectionReason,
          originalData: app 
        };
      });
    },
  });

  const { data: currentUser } = useQuery({
    queryKey: ["current-user"],
    queryFn: async () => {
      const res = await fetch("/api/me");
      if (!res.ok) throw new Error("Failed to fetch user");
      return res.json();
    },
  });

  // fetch dynamic rooms for the selected application's accommodation
  const { data: dynamicRooms = [], isLoading: isLoadingRooms } = useQuery({
    queryKey: ["accommodation-rooms", selectedApp?.originalData?.accommodationId],
    queryFn: async () => {
      if (!selectedApp?.originalData?.accommodationId) return [];
      
      const res = await fetch(`/api/accommodations/${selectedApp.originalData.accommodationId}/rooms`);
      if (!res.ok) throw new Error("Failed to fetch rooms");
      
      return res.json();
    },
    // only fetch if an app is selected and we actually need to show the room UI
    enabled: !!selectedApp?.originalData?.accommodationId && (selectedApp?.status === "Waitlisted" || selectedApp?.status === "Accepted"),
  });

  // setup Mutations for approving or rejecting
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, action, reason }: { id: number; action: "approve" | "reject"; reason?: string }) => {
      const res = await fetch(`/api/applications/${id}/review`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          action: action, 
          rejection_reason: reason 
        }),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to update application status");
      }
      return res.json();
    },
    onSuccess: () => {
      // refresh the application list after a successful mutation
      queryClient.invalidateQueries({ queryKey: ["landlord-applications"] });
      setViewModalOpen(false);
      setRemark("");
    },
    onError: (error) => {
      alert(`Error: ${error.message}`);
    }
  });

  const total = appsData.length;
  const counts = appsData.reduce((acc, a) => {
    acc[a.status] = (acc[a.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const filtered = useMemo(() => {
    let list = activeTab === "Application" ? appsData : appsData.filter(a => a.status === "Waitlisted");
    const q = search.toLowerCase();
    const res = list.filter((a) => a.student.toLowerCase().includes(q));
    return res.sort((a, b) => {
      const timeA = new Date(a.date).getTime();
      const timeB = new Date(b.date).getTime();
      return sortBy === "latest" ? timeB - timeA : timeA - timeB;
    });
  }, [appsData, activeTab, search, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * ITEMS_PER_PAGE;
  const paginated = filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleView = (app: Application) => {
    setSelectedApp(app);
    setRemark(app.remark || "");
    setSelectedRoom(app.assignedRoom || null);
    
    // auto-calculate default dates based on the application's duration
    const today = new Date();
    setMoveInDate(today.toISOString().split('T')[0]); // YYYY-MM-DD
    
    if (app.originalData?.durationOfStayDays) {
      const outDate = new Date(today);
      outDate.setDate(today.getDate() + app.originalData.durationOfStayDays);
      setExpectedMoveOutDate(outDate.toISOString().split('T')[0]);
    } else {
      setExpectedMoveOutDate("");
    }
    
    setViewModalOpen(true);
  };

  // connect UI actions to the API mutations
  const handleReject = () => {
    if (!selectedApp) return;
    if (!remark) {
      alert("A rejection remark is required.");
      return;
    }
    updateStatusMutation.mutate({ id: selectedApp.id, action: "reject", reason: remark });
  };

  const handleAccept = () => {
    if (!selectedApp) return;
    updateStatusMutation.mutate({ id: selectedApp.id, action: "approve" });
  };

  // setup Mutation for assigning a room (at the moment, landlord can only accept and reject, not assign rooms)
  const assignRoomMutation = useMutation({
    mutationFn: async ({ roomId, applicationId, moveIn, expectedMoveOut }: { roomId: string | number; applicationId: number; moveIn: string; expectedMoveOut: string }) => {
      const res = await fetch("/api/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomId: roomId,
          applicationId: applicationId,
          moveIn: moveIn,
          expectedMoveOut: expectedMoveOut
        }),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to assign room");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["landlord-applications"] });
      queryClient.invalidateQueries({ queryKey: ["accommodation-rooms"] });
      setViewModalOpen(false);
      setSelectedRoom(null);
    },
    onError: (error) => {
      alert(`Error assigning room: ${error.message}`);
    }
  });

  const handleSaveAssignment = () => {
    if (!selectedApp || !selectedRoom) return;
    if (!moveInDate || !expectedMoveOutDate) {
      alert("Please select both a Move In and Expected Move Out date.");
      return;
    }

    // check if the student already has an assigned room that is different from the newly selected one
    if (selectedApp.assignedRoom && selectedApp.assignedRoom !== selectedRoom.toString()) {
      const confirmOverride = window.confirm(
        "This applicant is already assigned to a room. Are you sure you want to release their old room and reassign them to this new one?"
      );
      if (!confirmOverride) return; // stop the function if they click cancel
    }

    assignRoomMutation.mutate({ 
      roomId: selectedRoom, 
      applicationId: selectedApp.id,
      moveIn: moveInDate,
      expectedMoveOut: expectedMoveOutDate
    });
  };

  const stats = [
    { label: "Under Review", color: "linear-gradient(135deg, #C9973A, #E8C37A)", text: "#C9973A", light_bg: "#FEF8EE", value: counts["Under Review"] || 0 },
    { label: "Accepted", color: "linear-gradient(135deg, #1A7A4A, #2D9A5F)", text: "#1A7A4A", light_bg: "#F0F7F3", value: counts.Accepted || 0 },
    { label: "Waitlisted", color: "linear-gradient(135deg, #6B3AB7, #9B6AE7)", text: "#6B3AB7", light_bg: "#F4F0FA", value: counts.Waitlisted || 0 },
    { label: "Rejected", color: "linear-gradient(135deg, #AA2661, #FDCAE0)", text: "#AE2F67", light_bg: "#FAF0F7", value: counts.Rejected || 0 },
  ];

  const getVisiblePages = () => {
    const pages: number[] = [];
    if (totalPages <= 3) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
      return pages;
    }
    if (safePage === 1) return [1, 2, 3];
    if (safePage === totalPages) return [totalPages - 2, totalPages - 1, totalPages];
    return [safePage - 1, safePage, safePage + 1];
  };

  const showRoomAssignment = selectedApp?.status === "Waitlisted" || selectedApp?.status === "Accepted";

  return (
    <div className="flex h-screen bg-[#F5EEF0]">
      <Sidebar role="landlordDashboard" />
      <DrawerNav open={drawerOpen} onClose={() => setDrawerOpen(false)} activePage={activePage} setActivePage={setActivePage} />

      <main className="flex-1 p-4 md:p-6 overflow-y-auto">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => setDrawerOpen(true)} className="lg:hidden p-1" aria-label="Open menu" style={{ color: CLR.mid }}>
            <IconMenu />
          </button>
          <div className="hidden lg:block w-1 h-6 rounded-full" style={{ background: CLR.mid }} />
          <h1 className="font-serif italic text-[24px] lg:text-[34px] font-semibold text-gray-900 tracking-tight">Applications</h1>
        </div>

        <div className="rounded-2xl p-6 mb-6 text-white" style={{ background: `linear-gradient(135deg, ${CLR.dark}, ${CLR.accent})` }}>
          <p className="text-[10px] md:text-xs uppercase tracking-widest opacity-70">Good Day, {currentUser?.fname ?? "Landlord"}</p>
          <h2 className="text-xl md:text-2xl font-bold mt-1">Check your applicants for Narra Residences</h2>
          <p className="text-xs md:text-sm opacity-70 mt-1">We make it easy for you to track the accommodation applications you manage.</p>
        </div>

        <div className="bg-white rounded-2xl p-4 md:p-5 shadow-sm mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((s) => {
              const pct = total ? Math.round((s.value / total) * 100) : 0;
              return (
                <div key={s.label}>
                  <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: s.text }}>{s.label}</p>
                  <div className="flex items-center gap-3">
                    <div className="relative flex items-center h-7 md:h-8 rounded-full overflow-hidden w-full" style={{ background: s.light_bg }}>
                      <div className="absolute left-0 top-0 h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, minWidth: "20px", background: s.color }} />
                      <span className="relative z-10 text-white text-[9px] md:text-[10px] font-bold px-3 whitespace-nowrap">{s.value} / {total}</span>
                    </div>
                    <span className="text-xs font-semibold text-gray-400">{pct}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mb-6 flex justify-between items-center">
          <FilterTabs active={activeTab} setActive={setActiveTab} />
        </div>

        <div className="bg-white rounded-3xl border shadow-sm mt-6 overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-end gap-4 p-4 md:p-6 border-b">
            <div className="shrink-0">
              <h2 className="text-sm md:text-lg font-semibold tracking-tight text-black">{activeTab} History</h2>
              <p className="text-[0.7rem] md:text-xs text-gray-400">{filtered.length} total applications</p>
            </div>
            <div className="flex items-end gap-3 md:ml-auto w-full md:w-auto">
              <FilterSelect 
                label="Sort By" 
                value={sortBy} 
                onChange={(v: any) => setSortBy(v)} 
                options={[{ value: "latest", label: "Latest" }, { value: "earliest", label: "Earliest" }]} 
              />
              <div className="flex flex-col gap-0.5 md:gap-1 flex-1 min-w-0 md:w-56">
                <label className="text-[0.5rem] md:text-[10px] font-bold uppercase tracking-widest text-gray-400">Search</label>
                <input 
                  type="text" 
                  placeholder="Search name..." 
                  value={search} 
                  onChange={(e) => setSearch(e.target.value)} 
                  className="w-full border border-gray-200 rounded-lg md:rounded-xl px-2 py-1 md:px-3 md:py-2 text-[0.7rem] md:text-sm focus:outline-none focus:border-[#6B0F2B]" 
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[600px]">
              <thead>
                <tr className="text-left text-[10px] md:text-xs uppercase tracking-wide bg-gray-50/50" style={{ color: CLR.mid }}>
                  <th className="px-6 py-4 font-bold">Student</th>
                  <th className="px-4 py-4 font-bold">Date Applied</th>
                  <th className="px-4 py-4 font-bold">Reviewed on</th>
                  <th className="px-4 py-4 font-bold">Status</th>
                  <th className="px-4 py-4 font-bold text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isLoading ? (
                  <tr><td colSpan={5} className="text-center py-16 text-gray-400">Loading applications...</td></tr>
                ) : paginated.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-16 text-gray-400">No applications found.</td></tr>
                ) : (
                  paginated.map((app) => (
                    <tr key={app.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 md:w-9 md:h-9 rounded-xl flex items-center justify-center text-white font-bold text-xs md:text-sm flex-shrink-0" style={{ background: CLR.avatars[app.id % CLR.avatars.length] }}>{app.student.charAt(0)}</div>
                          <span className="font-semibold text-gray-900 truncate max-w-[120px] md:max-w-none">{app.student}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-gray-600">
                        <p className="font-medium text-xs md:text-sm">{app.date}</p>
                        <p className="text-[9px] md:text-[10px] text-gray-400 font-medium mt-0.5"><DaysAgo targetDate={app.date} /></p>
                      </td>
                      <td className="px-4 py-4 text-gray-500 text-xs md:text-sm font-medium">{app.reviewed}</td>
                      <td className="px-4 py-4"><StatusBadge status={app.status} /></td>
                      <td className="px-4 py-4 text-center">
                        <button 
                          onClick={() => handleView(app)} 
                          className="text-[11px] md:text-sm px-3 md:px-4 py-1.5 rounded-lg md:rounded-xl font-bold transition-all" 
                          style={{ color: CLR.mid, background: "#F5ECF0", border: `1px solid ${CLR.mid}15` }}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between px-6 py-4 border-t bg-gray-50/30">
            <p className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest">
              {filtered.length === 0 ? "No results" : `Showing ${startIndex + 1}–${Math.min(startIndex + ITEMS_PER_PAGE, filtered.length)} of ${filtered.length}`}
            </p>
            <div className="flex items-center gap-1.5">
              {getVisiblePages().map((page) => (
                <PageBtn key={page} active={safePage === page} onClick={() => setCurrentPage(page)}>{page}</PageBtn>
              ))}
            </div>
          </div>
        </div>

        <Modal
          open={viewModalOpen}
          onClose={() => setViewModalOpen(false)}
          title={
            selectedApp?.status === "Rejected" ? "Rejection Remarks" :
            selectedApp?.status === "Under Review" ? "Application" : "Room Assignment"
          }
          footer={
            <div className="w-full flex justify-end gap-3">
              {selectedApp?.status === "Under Review" ? (
                <>
                  <button onClick={handleReject} disabled={updateStatusMutation.isPending} className="px-4 py-2 rounded-xl bg-red-100 text-red-700 font-bold text-xs md:text-sm disabled:opacity-50">
                    Reject
                  </button>
                  <button onClick={handleAccept} disabled={updateStatusMutation.isPending} className="px-4 py-2 rounded-xl bg-green-100 text-black font-bold text-xs md:text-sm shadow-lg shadow-[#6B0F2B]/20 disabled:opacity-50">
                    {updateStatusMutation.isPending ? "Saving..." : "Accept"}
                  </button>
                </>
              ) : (selectedApp?.status === "Waitlisted" || selectedApp?.status === "Accepted") ? (
                <button 
                  onClick={handleSaveAssignment} 
                  disabled={!selectedRoom || assignRoomMutation.isPending} 
                  className={`px-6 py-2 rounded-xl text-white font-bold text-xs md:text-sm shadow-lg transition-all ${(selectedRoom && !assignRoomMutation.isPending) ? 'bg-[#8C1535] shadow-[#8C1535]/20 hover:bg-[#6B0F2B]' : 'bg-gray-300 cursor-not-allowed'}`}
                >
                  {assignRoomMutation.isPending ? "Saving..." : "Save"}
                </button>
              ) : null}
            </div>
          }
        >
          {selectedApp && (
            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
              <div className="bg-[#F7F3F5] rounded-2xl border border-[#6B0F2B]/10 p-4 md:p-5">
                <div className="mb-4">
                  <p className="text-[16px] font-bold text-gray-900">{selectedApp.student}</p>
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Date Applied: {selectedApp.date}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-[13px]">
                  <div className="space-y-1">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Applicant Details</p>
                    <p className="font-bold text-gray-800">{selectedApp.email}</p>
                    <p className="text-[11px] text-gray-500 font-medium">Data from original object can go here</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Occupancy Details</p>
                    <p className="font-bold text-gray-800">{selectedApp.type ? selectedApp.type.replace('_', ' ') : 'N/A'}</p>
                    <p className="text-[11px] text-gray-500 font-medium">Based on durationOfStayDays</p>
                  </div>
                </div>
              </div>

              {(selectedApp.status === "Under Review" || selectedApp.status === "Rejected") && (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Admin Remarks</label>
                  <textarea
                    value={remark}
                    onChange={(e) => setRemark(e.target.value)}
                    disabled={selectedApp.status === "Rejected"}
                    placeholder="Enter reason for rejection or special notes..."
                    className="w-full h-[80px] border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#6B0F2B] disabled:bg-gray-50 disabled:text-gray-500 resize-none"
                  />
                </div>
              )}

              {showRoomAssignment && (
                <div className="space-y-3 pt-2">
                  <p className="text-[14px] font-bold text-black ml-1 uppercase tracking-tight">Available Room Assignments</p>
                  
                  {isLoadingRooms ? (
                    <p className="text-xs text-gray-400 ml-1">Loading rooms...</p>
                  ) : dynamicRooms.length === 0 ? (
                    <p className="text-xs text-gray-400 ml-1">No rooms found for this accommodation.</p>
                  ) : (
                    <div className="space-y-3">
                      {dynamicRooms.map((room: any) => (
                        <div 
                          key={room.id} 
                          className={`flex flex-col sm:flex-row sm:items-center border rounded-2xl p-4 md:p-5 transition-all ${
                            selectedRoom === room.id ? "border-green-500 bg-green-50/30" : "border-gray-100 bg-white"
                          }`}
                        >
                          <div className="sm:w-[35%] sm:border-r border-gray-100 pr-4 mb-3 sm:mb-0">
                            <div 
                              className="inline-block px-4 py-1 rounded-lg mb-2" 
                              style={{ background: `linear-gradient(to right, ${CLR.dark}, ${CLR.accent})` }}
                            >
                              <span className="text-white font-bold text-[10px] tracking-wider uppercase">
                                Room {room.roomNumber}
                              </span>
                            </div>
                            <p className="text-base font-bold text-gray-900">{room.roomBuilding}</p>
                          </div>

                          <div className="flex-1 sm:px-6 space-y-1 mb-4 sm:mb-0">
                            <div className="flex justify-between text-[12px]">
                              <span className="text-gray-400 font-bold uppercase text-[9px]">Type</span>
                              <span className="font-bold text-gray-800 capitalize">{room.roomType}</span>
                            </div>
                            <div className="flex justify-between text-[12px]">
                              <span className="text-gray-400 font-bold uppercase text-[9px]">Price</span>
                              <span className="font-bold text-gray-800">₱{room.roomRent}</span>
                            </div>
                            <div className="flex justify-between text-[12px]">
                              <span className="text-gray-400 font-bold uppercase text-[9px]">Occupancy</span>
                              <span className="font-bold text-gray-800">{room.roomCurrentOccupancy}/{room.roomCapacity}</span>
                            </div>
                            <div className="flex justify-between text-[12px]">
                              <span className="text-gray-400 font-bold uppercase text-[9px]">Availability</span>
                              <span className={`font-bold capitalize ${room.roomAvailability === 'available' ? 'text-green-600' : 'text-red-500'}`}>
                                {room.roomAvailability}
                              </span>
                            </div>
                          </div>

                          <div className="sm:pl-4">
                            <button
                              onClick={() => setSelectedRoom(room.id)}
                              disabled={room.roomAvailability !== 'available'}
                              className={`w-full sm:w-auto px-5 py-2 rounded-xl text-[11px] font-bold transition-all border ${
                                selectedRoom === room.id 
                                  ? "bg-green-600 text-white border-green-600 shadow-md" 
                                  : room.roomAvailability !== 'available'
                                  ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                                  : "bg-white text-[#6B0F2B] border-[#6B0F2B]/10 hover:bg-[#F5ECF0]"
                              }`}
                            >
                              {selectedRoom === room.id ? "Selected" : room.roomAvailability !== 'available' ? "Full" : "Assign"}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </Modal>
      </main>
    </div>
  );
}