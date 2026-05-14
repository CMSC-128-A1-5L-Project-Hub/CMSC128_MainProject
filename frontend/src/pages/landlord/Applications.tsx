import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import Modal from "../../components/Modal";
import CustomHeader from '../../components/CustomHeader';
import UbleLoader from "../shared/LoadingPage";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import HeroBanner from "@/components/dashboard/HeroBanner";

interface HeroContent {
    greeting: string;
    name: string;
    title: string;
    subtitle: string;
}
import { api } from "../../api/axios";
import StatsBanner from "@/components/ApplicationStatus/StatsBanner";
import Dropdown from "@/components/ApplicationStatus/Dropdown";
import SearchBar from "@/components/SearchBar";

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning";
  if (h < 18) return "Good Afternoon";
  return "Good Evening";
}

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
  const [searchParams] = useSearchParams();
  const targetAccId = searchParams.get("accId");
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
  const { data: appsData = [], isLoading, refetch } = useQuery<Application[]>({
    queryKey: ["landlord-applications"],
    staleTime: 0,
    queryFn: async () => {
      try {
        const res = await api.get("/applications/incoming");
        const json = res.data;
        
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
      } catch (error: any) {
         if (error.response?.status === 404) return [];
         throw new Error("Failed to fetch applications");
      }
    },
  });

  // filter the raw API data by the accommodation ID in the URL if it exists
  const scopedAppsData = useMemo(() => {
    if (!targetAccId) return appsData; // if no ID in URL, show everything
    
    return appsData.filter(
      (app) => String(app.originalData?.accommodationId) === targetAccId
    );
  }, [appsData, targetAccId]);

  const { data: currentUser } = useQuery({
    queryKey: ["current-user"],
    queryFn: async () => {
      const res = await api.get("/me");
      return res.data;
    },
  });

  // // fetch dynamic rooms for the selected application's accommodation
  // const { data: dynamicRooms = [], isLoading: isLoadingRooms } = useQuery({
  //   queryKey: ["accommodation-rooms", selectedApp?.originalData?.accommodationId],
  //   queryFn: async () => {
  //     if (!selectedApp?.originalData?.accommodationId) return [];
      
  //     const res = await api.get(`/accommodations/${selectedApp.originalData.accommodationId}/rooms`);
  //     return res.data;
  //   },
  //   enabled: !!selectedApp?.originalData?.accommodationId && (selectedApp?.status === "Waitlisted" || selectedApp?.status === "Accepted"),
  // });

  // setup Mutations for approving or rejecting
  const updateStatusMutation = useMutation({
      mutationFn: async ({ id, action, reason }: { id: number; action: "approve" | "reject"; reason?: string }) => {
          const targetStatus = action === "approve" ? "approved" : "rejected";

          const res = await api.put(`/applications/${id}/status`, { 
              status: targetStatus, 
              ...(targetStatus === "rejected" && { rejectionReason: reason })
          });
          return res.data;
      },
      onSuccess: (data) => {
          console.log("updateStatusMutation succeeded:", data);
          console.log("Invalidating landlord-applications...");
          queryClient.invalidateQueries({ queryKey: ["landlord-applications"] });
          console.log("Invalidation called.");
          setViewModalOpen(false);
          setRemark("");
      },
      onError: (error) => {
          console.error("updateStatusMutation failed:", error);
          alert(`Error: ${error.message}`);
      }
  });

  const total = scopedAppsData.length;
  const counts = scopedAppsData.reduce((acc, a) => {
    acc[a.status] = (acc[a.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const filtered = useMemo(() => {
    let list = activeTab === "Application" ? scopedAppsData : scopedAppsData.filter(a => a.status === "Waitlisted");
    const q = search.toLowerCase();
    const res = list.filter((a) => a.student.toLowerCase().includes(q));
    return res.sort((a, b) => {
      const timeA = new Date(a.date).getTime();
      const timeB = new Date(b.date).getTime();
      return sortBy === "latest" ? timeB - timeA : timeA - timeB;
    });
  }, [scopedAppsData, activeTab, search, sortBy]);

  const accommodationNames = useMemo(() => {
    if (!scopedAppsData || scopedAppsData.length === 0) return "your accommodations";
    
    // create a Set to get unique names, just in case the landlord manages multiple buildings
    const names = new Set(
      appsData
        .map(app => app.originalData?.accommodation?.accommodationName)
        .filter(Boolean)
    );
    
    if (names.size === 0) return "your accommodations";
    return Array.from(names).join(" & ");
  }, [scopedAppsData]);

  const [itemsPerPage, setItemsPerPage] = useState(6)

  const SORT_OPTS = [
    { value: "latest", label: "Latest" },
    { value: "earliest", label: "Earliest" },
  ]

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage))
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * ITEMS_PER_PAGE;
  const paginated = filtered.slice(startIndex, startIndex + itemsPerPage)

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

  // // setup Mutation for assigning a room (at the moment, landlord can only accept and reject, not assign rooms)
  // const assignRoomMutation = useMutation({
  //     mutationFn: async ({ roomId, applicationId, moveIn, expectedMoveOut }: { roomId: string | number; applicationId: number; moveIn: string; expectedMoveOut: string }) => {
  //       try {
  //         const res = await api.post("/assignments", {
  //           roomId: roomId,
  //           applicationId: applicationId,
  //           moveIn: moveIn,
  //           expectedMoveOut: expectedMoveOut
  //         });
  //         return res.data;
  //       } catch (error: any) {
  //         throw new Error(error.response?.data?.message || "Failed to assign room");
  //       }
  //     },
  //     onSuccess: (data) => {
  //       console.log("assignRoomMutation succeeded:", data);
  //       console.log("Invalidating landlord-applications and accommodation-rooms...");
  //       queryClient.invalidateQueries({ queryKey: ["landlord-applications"] });
  //       queryClient.invalidateQueries({ queryKey: ["accommodation-rooms"] });
  //       console.log("Invalidation called.");
  //       setViewModalOpen(false);
  //       setSelectedRoom(null);
  //     },
  //     onError: (error) => {
  //       console.error("assignRoomMutation failed:", error);
  //       alert(`Error assigning room: ${error.message}`);
  //     }
  // });

  // const handleSaveAssignment = () => {
  //   if (!selectedApp || !selectedRoom) return;
  //   if (!moveInDate || !expectedMoveOutDate) {
  //     alert("Please select both a Move In and Expected Move Out date.");
  //     return;
  //   }

  //   // check if the student already has an assigned room that is different from the newly selected one
  //   if (selectedApp.assignedRoom && selectedApp.assignedRoom !== selectedRoom.toString()) {
  //     const confirmOverride = window.confirm(
  //       "This applicant is already assigned to a room. Are you sure you want to release their old room and reassign them to this new one?"
  //     );
  //     if (!confirmOverride) return; // stop the function if they click cancel
  //   }

  //   assignRoomMutation.mutate({ 
  //     roomId: selectedRoom, 
  //     applicationId: selectedApp.id,
  //     moveIn: moveInDate,
  //     expectedMoveOut: expectedMoveOutDate
  //   });
  // };

  const stats = [
    { 
      label: "Under Review", 
      count: counts["Under Review"] || 0,
      from: "#C9973A",
      to: "#E8C37A",
      bg: "#FEF8EE",
      text: "#C9973A",
    },
    { 
      label: "Accepted", 
      count: counts.Accepted || 0,
      from: "#1A7A4A",
      to: "#2D9A5F",
      bg: "#F0F7F3",
      text: "#1A7A4A",
    },
    { 
      label: "Waitlisted", 
      count: counts.Waitlisted || 0,
      from: "#6B3AB7",
      to: "#9B6AE7",
      bg: "#F4F0FA",
      text: "#6B3AB7",
    },
    { 
      label: "Rejected", 
      count: counts.Rejected || 0,
      from: "#AA2661",
      to: "#FDCAE0",
      bg: "#FAF0F7",
      text: "#AE2F67",
    },
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

  const heroContent: HeroContent = {
        name: currentUser?.fname,
        greeting: greeting(),
        title: `Check your applicants for ${accommodationNames}`,
        subtitle: "We make it easy for you to track the accommodation applications you manage",
    };



  return (
    <div className="flex h-screen bg-[#F5EEF0]">
      <Sidebar role="landlord" />
      <DrawerNav open={drawerOpen} onClose={() => setDrawerOpen(false)} activePage={activePage} setActivePage={setActivePage} />
      <div className="flex flex-col w-full h-full">
        <CustomHeader
            title="Applications"></CustomHeader>
        <main className="flex-1 flex-col p-6 space-y-6 overflow-y-auto">  
            <HeroBanner
                greeting={heroContent.greeting}
                name={heroContent.name}
                title={heroContent.title}
                subtitle={heroContent.subtitle}
                type="mini"
            />

          <StatsBanner
            stats={stats}
            total={total}
            cols={4}>

          </StatsBanner>

          <div className="flex justify-between items-center">
            <FilterTabs active={activeTab} setActive={setActiveTab} />
          </div>

          <div className="bg-white rounded-2xl p-6 space-y-6 overflow-hidden">
            <div className="flex flex-row items-center">
              <div>
                <h2 className="text-[16px] font-bold text-black">{activeTab} History</h2>
                <p className="text-[12px] italic">{filtered.length} total applications</p>
              </div>
              <div className="flex items-end gap-3 md:ml-auto w-full md:w-auto">
                <div className='hidden lg:block'>
                  <Dropdown
                      title="No. of Items"
                      items={[
                          { label: "5", href: "" },
                          { label: "10", href: "" },
                          { label: "15", href: "" },
                          { label: "20", href: "" },
                      ]}
                      direction='down'
                      widthClass="w-29 lg:w-32"
                      titleClass="text-[10px] lg:text-[11px]"
                      selectedClass="text-[12px] lg:text-[13px]"
                      onSelect={(label) => {
                          setItemsPerPage(Number(label))
                          setCurrentPage(1)
                      }}
                  />
              </div>
              
              <Dropdown
                title="Sort By"
                items={SORT_OPTS.map(opt => ({ label: opt.label, href: "" }))}
                direction='down'
                widthClass="w-29 lg:w-32"
                titleClass="text-[10px] lg:text-[11px]"
                selectedClass="text-[12px] lg:text-[13px] block"
                onSelect={(label) => {
                  setSortBy(label === "Latest" ? "latest" : "earliest")
                  setCurrentPage(1)
                }}
              />
              <SearchBar
                  value={search}
                  onChange={(query) => {
                      setSearch(query)
                      }}
                  onPageReset={() => setCurrentPage(1)}
              />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full lg:table-fixed border-separate border-spacing-0">
                <thead className="sticky z-20 top-0 bg-white border-y border-[#6B0F2B]/5">
                  <tr className="text-[#9A7080] text-[12px] lg:text-xs tracking-widest font-bold">
                    {[
                      { label: "Student",     className: "w-[30%]" },
                      { label: "Date Applied",className: "w-[20%]" },
                      { label: "Reviewed on", className: "w-[20%]" },
                      { label: "Status",      className: "w-[15%]" },
                      { label: "Action",      className: "w-[15%] text-center" },
                    ].map(col => (
                      <th
                        key={col.label}
                        className={`uppercase p-2 px-4 text-left whitespace-nowrap border-y border-[#6B0F2B]/10 ${col.className}`}
                      >
                        {col.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={5} className="text-center py-16">
                        <UbleLoader />
                      </td>
                    </tr>
                  ) : paginated.length === 0 ? (
                    <tr><td colSpan={5} className="text-center py-16 text-gray-400">No applications found.</td></tr>
                  ) : (
                    paginated.map((app) => (
                      <tr key={app.id} className="hover:bg-gray-50 transition-all">
                        <td className="px-4 py-2">
                          <div className="flex items-center gap-3">
                            <div
                              className="hidden lg:flex w-8 h-8 rounded-xl items-center justify-center text-white font-bold text-sm flex-shrink-0"
                              style={{ background: CLR.avatars[app.id % CLR.avatars.length] }}
                            >
                              {app.student.charAt(0)}
                            </div>
                            <span className="font-semibold text-[13px] lg:text-[15px] truncate max-w-[180px]">
                              {app.student}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-2">
                          <span className="block text-[12px] lg:text-[14px]">{app.date}</span>
                          <span className="block text-[10px] lg:text-[12px] text-[#9A7080]">
                            <DaysAgo targetDate={app.date} />
                          </span>
                        </td>
                        <td className="px-4 py-2 text-[12px] lg:text-[14px] text-gray-500">
                          {app.reviewed}
                        </td>
                        <td className="px-4 py-2">
                          <StatusBadge status={app.status} />
                        </td>
                        <td className="px-4 py-2 text-center">
                          <button
                            onClick={() => handleView(app)}
                            className="text-[11px] lg:text-sm px-3 lg:px-4 py-1.5 rounded-lg lg:rounded-xl font-bold transition-all"
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
                {filtered.length === 0 ? "No results" : `Showing ${startIndex + 1}–${Math.min(startIndex + itemsPerPage, filtered.length)} of ${filtered.length}`}
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
            title={selectedApp?.status === "Rejected" ? "Rejection Remarks" : "Application Details"}
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
                ) : null} 
                {/* : (selectedApp?.status === "Waitlisted" || selectedApp?.status === "Accepted") ? (
                  <button 
                    onClick={handleSaveAssignment} 
                    disabled={!selectedRoom || assignRoomMutation.isPending} 
                    className={`px-6 py-2 rounded-xl text-white font-bold text-xs md:text-sm shadow-lg transition-all ${(selectedRoom && !assignRoomMutation.isPending) ? 'bg-[#8C1535] shadow-[#8C1535]/20 hover:bg-[#6B0F2B]' : 'bg-gray-300 cursor-not-allowed'}`}
                  >
                    {assignRoomMutation.isPending ? "Saving..." : "Save"}
                  </button> */}
              </div>
            }
          >
            {selectedApp && (
              <div className="space-y-4 pr-1">

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

                {/* {showRoomAssignment && (
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
                )} */}
              </div>
            )}
          </Modal>
        </main>
      </div>
      
      
    </div>
  );
}