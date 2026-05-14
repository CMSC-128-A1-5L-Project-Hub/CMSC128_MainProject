import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import Modal from "../../components/Modal";
import Button from "../../components/Button";
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

function fmt(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
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

interface Application {
  id: number;
  student: string;
  email: string;
  date: string;
  reviewed: string;
  status: UIStatus;
  type?: string;
  remark?: string;
  originalData?: any;
}

const mapStatus = (apiStatus: string): UIStatus => {
  switch (apiStatus) {
    case "under_review": return "Under Review";
    case "approved": return "Accepted";
    case "confirmed": return "Accepted";
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
        <button key={tab} onClick={() => setActive(tab)}
          className={`px-4 py-1.5 text-sm rounded-lg transition ${active === tab ? "bg-[#6B0F2B] text-white shadow" : "text-gray-500 hover:text-black"}`}>
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

const StatusBadge = ({ status }: { status: UIStatus }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG["Under Review"];
  return (
    <span className="inline-flex items-center gap-1.5 px-2 md:px-3 py-1 rounded-full text-[0.7rem] md:text-xs font-semibold whitespace-nowrap" style={{ background: cfg.bg, color: cfg.color }}>
      <span className="w-1 md:w-1.5 h-1 md:h-1.5 rounded-full flex-shrink-0" style={{ background: cfg.dot }} />{status}
    </span>
  );
};

const DaysAgo = ({ targetDate }: { targetDate: string }) => {
  const daysDifference = useMemo(() => {
    const now = new Date(); const past = new Date(targetDate);
    if (isNaN(past.getTime())) return 0;
    now.setHours(0, 0, 0, 0); past.setHours(0, 0, 0, 0);
    return Math.floor(Math.abs(now.getTime() - past.getTime()) / (1000 * 60 * 60 * 24));
  }, [targetDate]);
  return <span>{daysDifference} days ago</span>;
};

const PageBtn = ({ active, disabled, onClick, children }: any) => (
  <button onClick={onClick} disabled={disabled} className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-semibold transition-all"
    style={active ? { background: `linear-gradient(135deg,${CLR.dark}, ${CLR.mid})`, color: "#fff", boxShadow: "0 4px 12px rgba(107,15,43,0.35)" }
      : disabled ? { background: "#fff", border: "1.5px solid #ede8ea", color: "#d8cdd1", cursor: "not-allowed" }
      : { background: "#fff", border: "1.5px solid #ede8ea", color: CLR.mid }}>
    {children}
  </button>
);

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard" }, { id: "applications", label: "Applications" },
  { id: "rooms", label: "Room Assignment" }, { id: "waitlist", label: "Waitlisted" }
];

const DrawerNav = ({ open, onClose, activePage, setActivePage }: any) => (
  <>
    {open && <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={onClose} />}
    <div className={`fixed top-0 left-0 bottom-0 z-50 w-64 flex flex-col transition-transform duration-300 ease-in-out lg:hidden ${open ? "translate-x-0" : "-translate-x-full"}`}
      style={{ background: `linear-gradient(160deg, ${CLR.dark} 0%, ${CLR.mid} 100%)` }}>
      <div className="flex items-center gap-3 px-5 pt-6 pb-5 border-b border-white/10">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: CLR.gold }}><span className="text-white font-bold text-sm">U</span></div>
        <span className="text-white font-bold text-base">UniDorm</span>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map((item) => (
          <button key={item.id} onClick={() => { setActivePage(item.id); onClose(); }}
            className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-2xl text-sm font-semibold transition-all text-left ${activePage === item.id ? "bg-white/15 text-white" : "text-white/60 hover:bg-white/10 hover:text-white"}`}>
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
  const [rejectionModalOpen, setRejectionModalOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(6);
  const SORT_OPTS = [{ value: "latest", label: "Latest" }, { value: "earliest", label: "Earliest" }];

  const { data: appsData = [], isLoading, refetch } = useQuery<Application[]>({
    queryKey: ["landlord-applications"],
    staleTime: 0,
    queryFn: async () => {
      try {
        const res = await api.get("/applications/incoming");
        return res.data.map((app: any) => {
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

  const scopedAppsData = useMemo(() => {
    if (!targetAccId) return appsData;
    return appsData.filter((app) => String(app.originalData?.accommodationId) === targetAccId);
  }, [appsData, targetAccId]);

  const { data: currentUser } = useQuery({
    queryKey: ["current-user"],
    queryFn: async () => { const res = await api.get("/me"); return res.data; },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ applicationId, action, reason }: { applicationId: number; action: "approve" | "reject"; reason?: string }) => {
      const res = await api.patch(`/applications/${applicationId}/review`, {
        action: action,
        ...(action === "reject" && { rejection_reason: reason })
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["landlord-applications"] });
      refetch();
      setViewModalOpen(false);
      setRejectionModalOpen(false);
      setSelectedApp(null);
      setRejectionReason("");
    },
    onError: (error: any) => {
      alert(`Error: ${error.message}`);
    }
  });

  const total = scopedAppsData.length;
  const counts = scopedAppsData.reduce((acc, a) => { acc[a.status] = (acc[a.status] || 0) + 1; return acc; }, {} as Record<string, number>);

  const filtered = useMemo(() => {
    let list = activeTab === "Application" ? scopedAppsData : scopedAppsData.filter(a => a.status === "Waitlisted");
    const q = search.toLowerCase();
    const res = list.filter((a) => a.student.toLowerCase().includes(q));
    return res.sort((a, b) => { const tA = new Date(a.date).getTime(); const tB = new Date(b.date).getTime(); return sortBy === "latest" ? tB - tA : tA - tB; });
  }, [scopedAppsData, activeTab, search, sortBy]);

  const accommodationNames = useMemo(() => {
    if (!scopedAppsData || scopedAppsData.length === 0) return "your accommodations";
    const names = new Set(appsData.map(app => app.originalData?.accommodation?.accommodationName).filter(Boolean));
    return names.size === 0 ? "your accommodations" : Array.from(names).join(" & ");
  }, [scopedAppsData]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * ITEMS_PER_PAGE;
  const paginated = filtered.slice(startIndex, startIndex + itemsPerPage);

  // ── Modal handlers ─────────────────────────────────────────────
  const handleView = (app: Application) => {
    setSelectedApp(app);
    setViewModalOpen(true);
  };

  const handleCloseReview = () => {
    setViewModalOpen(false);
    setSelectedApp(null);
  };

  const handleRejectClick = () => {
    setRejectionModalOpen(true);
    setViewModalOpen(false);
  };

  const handleBackToReview = () => {
    setRejectionModalOpen(false);
    setViewModalOpen(true);
  };

  const handleConfirmRejection = () => {
    if (selectedApp && rejectionReason.trim()) {
      updateStatusMutation.mutate({ applicationId: selectedApp.id, action: "reject", reason: rejectionReason });
    }
  };

  const handleConfirmApproval = () => {
    if (selectedApp) {
      updateStatusMutation.mutate({ applicationId: selectedApp.id, action: "approve" });
    }
  };

  const stats = [
    { label: "Under Review", count: counts["Under Review"] || 0, from: "#C9973A", to: "#E8C37A", bg: "#FEF8EE", text: "#C9973A" },
    { label: "Accepted", count: counts.Accepted || 0, from: "#1A7A4A", to: "#2D9A5F", bg: "#F0F7F3", text: "#1A7A4A" },
    { label: "Waitlisted", count: counts.Waitlisted || 0, from: "#6B3AB7", to: "#9B6AE7", bg: "#F4F0FA", text: "#6B3AB7" },
    { label: "Rejected", count: counts.Rejected || 0, from: "#AA2661", to: "#FDCAE0", bg: "#FAF0F7", text: "#AE2F67" },
  ];

  const getVisiblePages = () => {
    const pages: number[] = [];
    if (totalPages <= 3) { for (let i = 1; i <= totalPages; i++) pages.push(i); return pages; }
    if (safePage === 1) return [1, 2, 3];
    if (safePage === totalPages) return [totalPages - 2, totalPages - 1, totalPages];
    return [safePage - 1, safePage, safePage + 1];
  };

  const heroContent: HeroContent = {
    name: currentUser?.fname, greeting: greeting(),
    title: `Check your applicants for ${accommodationNames}`,
    subtitle: "We make it easy for you to track the accommodation applications you manage",
  };

  return (
    <div className="flex h-screen bg-[#F5EEF0]">
      <DrawerNav open={drawerOpen} onClose={() => setDrawerOpen(false)} activePage={activePage} setActivePage={setActivePage} />
      <div className="flex flex-col w-full h-full">
        <CustomHeader title="Applications" />
        <main className="flex-1 flex-col p-6 space-y-6 overflow-y-auto">
          <HeroBanner greeting={heroContent.greeting} name={heroContent.name} title={heroContent.title} subtitle={heroContent.subtitle} type="mini" />
          <StatsBanner stats={stats} total={total} cols={4} />
          <div className="flex justify-between items-center"><FilterTabs active={activeTab} setActive={setActiveTab} /></div>

          <div className="bg-white rounded-2xl p-6 space-y-6 overflow-hidden">
            <div className="flex flex-row items-center">
              <div><h2 className="text-[16px] font-bold text-black">{activeTab} History</h2><p className="text-[12px] italic">{filtered.length} total applications</p></div>
              <div className="flex items-end gap-3 md:ml-auto w-full md:w-auto">
                <div className='hidden lg:block'>
                  <Dropdown title="No. of Items" items={[{ label: "5", href: "" }, { label: "10", href: "" }, { label: "15", href: "" }, { label: "20", href: "" }]}
                    direction='down' widthClass="w-29 lg:w-32" titleClass="text-[10px] lg:text-[11px]" selectedClass="text-[12px] lg:text-[13px]"
                    onSelect={(label) => { setItemsPerPage(Number(label)); setCurrentPage(1); }} />
                </div>
                <Dropdown title="Sort By" items={SORT_OPTS.map(opt => ({ label: opt.label, href: "" }))}
                  direction='down' widthClass="w-29 lg:w-32" titleClass="text-[10px] lg:text-[11px]" selectedClass="text-[12px] lg:text-[13px] block"
                  onSelect={(label) => { setSortBy(label === "Latest" ? "latest" : "earliest"); setCurrentPage(1); }} />
                <SearchBar value={search} onChange={(query) => { setSearch(query); }} onPageReset={() => setCurrentPage(1)} />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full lg:table-fixed border-separate border-spacing-0">
                <thead className="sticky z-20 top-0 bg-white border-y border-[#6B0F2B]/5">
                  <tr className="text-[#9A7080] text-[12px] lg:text-xs tracking-widest font-bold">
                    {[{ label: "Student", className: "w-[30%]" }, { label: "Date Applied", className: "w-[20%]" }, { label: "Reviewed on", className: "w-[20%]" }, { label: "Status", className: "w-[15%]" }, { label: "Action", className: "w-[15%] text-center" }]
                      .map(col => <th key={col.label} className={`uppercase p-2 px-4 text-left whitespace-nowrap border-y border-[#6B0F2B]/10 ${col.className}`}>{col.label}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr><td colSpan={5} className="text-center py-16"><UbleLoader /></td></tr>
                  ) : paginated.length === 0 ? (
                    <tr><td colSpan={5} className="text-center py-16 text-gray-400">No applications found.</td></tr>
                  ) : (
                    paginated.map((app) => (
                      <tr key={app.id} className="hover:bg-gray-50 transition-all">
                        <td className="px-4 py-2"><div className="flex items-center gap-3"><div className="hidden lg:flex w-8 h-8 rounded-xl items-center justify-center text-white font-bold text-sm flex-shrink-0" style={{ background: CLR.avatars[app.id % CLR.avatars.length] }}>{app.student.charAt(0)}</div><span className="font-semibold text-[13px] lg:text-[15px] truncate max-w-[180px]">{app.student}</span></div></td>
                        <td className="px-4 py-2"><span className="block text-[12px] lg:text-[14px]">{app.date}</span><span className="block text-[10px] lg:text-[12px] text-[#9A7080]"><DaysAgo targetDate={app.date} /></span></td>
                        <td className="px-4 py-2 text-[12px] lg:text-[14px] text-gray-500">{app.reviewed}</td>
                        <td className="px-4 py-2"><StatusBadge status={app.status} /></td>
                        <td className="px-4 py-2 text-center"><button onClick={() => handleView(app)} className="text-[11px] lg:text-sm px-3 lg:px-4 py-1.5 rounded-lg lg:rounded-xl font-bold transition-all" style={{ color: CLR.mid, background: "#F5ECF0", border: `1px solid ${CLR.mid}15` }}>View</button></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between px-6 py-4 border-t bg-gray-50/30">
              <p className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest">{filtered.length === 0 ? "No results" : `Showing ${startIndex + 1}–${Math.min(startIndex + itemsPerPage, filtered.length)} of ${filtered.length}`}</p>
              <div className="flex items-center gap-1.5">{getVisiblePages().map((page) => <PageBtn key={page} active={safePage === page} onClick={() => setCurrentPage(page)}>{page}</PageBtn>)}</div>
            </div>
          </div>

          {/* APPLICATION REVIEW MODAL */}
          <Modal 
            open={viewModalOpen} 
            onClose={handleCloseReview} 
            title="Review Application" 
            eyebrow="Application Details"
            footer={
              <div className="flex gap-2 ml-auto">
                <Button variant="secondary" size="md" onClick={handleRejectClick}>Reject</Button>
                <Button variant="primary" size="md" onClick={handleConfirmApproval} disabled={updateStatusMutation.isPending}>
                  {updateStatusMutation.isPending ? "Processing…" : "Accept"}
                </Button>
              </div>
            }>
            {selectedApp && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div><p className="text-xs text-gray-400 uppercase tracking-wider">Student Name</p><p className="font-semibold text-gray-800">{selectedApp.student}</p></div>
                  <div><p className="text-xs text-gray-400 uppercase tracking-wider">Email</p><p className="font-semibold text-gray-800">{selectedApp.email}</p></div>
                  <div><p className="text-xs text-gray-400 uppercase tracking-wider">Type</p><p className="font-semibold text-gray-800 capitalize">{selectedApp.type?.replace("_", " ") || "N/A"}</p></div>
                  <div><p className="text-xs text-gray-400 uppercase tracking-wider">Date Applied</p><p className="font-semibold text-gray-800">{selectedApp.date}</p></div>
                  <div><p className="text-xs text-gray-400 uppercase tracking-wider">Reviewed</p><p className="font-semibold text-gray-800">{selectedApp.reviewed}</p></div>
                  <div><p className="text-xs text-gray-400 uppercase tracking-wider">Current Status</p><span className="inline-block bg-yellow-100 text-yellow-800 text-xs font-semibold px-2 py-0.5 rounded-full">{selectedApp.status}</span></div>
                </div>
              </div>
            )}
          </Modal>

          {/* REJECTION REASON MODAL */}
          <Modal 
            open={rejectionModalOpen} 
            onClose={() => { setRejectionModalOpen(false); setRejectionReason(""); }} 
            title="Rejection Reason" 
            eyebrow="Application Rejection"
            footer={
              <div className="flex gap-2 ml-auto">
                <Button variant="secondary" size="md" onClick={handleBackToReview}>← Back</Button>
                <Button variant="primary" size="md" onClick={handleConfirmRejection} disabled={updateStatusMutation.isPending || !rejectionReason.trim()}>
                  {updateStatusMutation.isPending ? "Processing…" : "Reject"}
                </Button>
              </div>
            }>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">Please provide a reason for rejecting this application. This will be communicated to the applicant.</p>
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Rejection Reason</label>
                <textarea 
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#8C1535] min-h-[120px] resize-none" 
                  placeholder="Enter the reason for rejection..." 
                  value={rejectionReason} 
                  onChange={(e) => setRejectionReason(e.target.value)} 
                />
              </div>
            </div>
          </Modal>
        </main>
      </div>
    </div>
  );
}