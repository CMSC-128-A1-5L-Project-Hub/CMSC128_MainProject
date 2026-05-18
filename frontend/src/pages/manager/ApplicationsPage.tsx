import React from "react";
import { useState, useMemo } from "react";
import { api } from "../../api/axios";
import { useQuery } from "@tanstack/react-query";
import HeroBanner from '../../components/dashboard/HeroBanner'
import Sidebar from "../../components/Sidebar";
import toast from 'react-hot-toast';

import ApplicationModals from "../../components/applications/ApplicationModals";
import CustomHeader from '../../components/CustomHeader';
import StatsBanner from "@/components/ApplicationStatus/StatsBanner";
import Dropdown from "@/components/ApplicationStatus/Dropdown";
import SearchBar from "@/components/SearchBar";
import Pagination from "@/components/ApplicationStatus/Pagination";



import StylizedStatus from "@/components/BillingDashboard/StylizedStatus";
import { DateTime } from 'luxon';
import Button from "@/components/Button";

import type { Application } from "@/interfaces/application";

const rowStyles: Record<string, { bg: string; text: string }> = {
  approved:     { bg: '#1A7A4A', text: '#000000' },
  pending:      { bg: '#FFFFFF', text: '#000000' },
  under_review: { bg: '#6B3AB7', text: '#000000' },
  rejected:     { bg: '#6B0F2B', text: '#9A7080' },
  waitlisted:   { bg: '#EFF4FF', text: '#000000' },
  cancelled:    { bg: '#F0F0F0', text: '#888888' },
  confirmed:    { bg: '#1A7A4A', text: '#000000' },
}

function formatTime(dateString: string) {
  if (!dateString) return "N/A";
  const dt = DateTime.fromISO(dateString).setZone('utc', { keepLocalTime: true });
  if (!dt.isValid) return "Invalid Time";
  return dt.toFormat('h:mm a');
}

const getDaysAgo = (targetDate: string): number => {
  const now = new Date();
  const past = new Date(targetDate);
  now.setHours(0, 0, 0, 0);
  past.setHours(0, 0, 0, 0);
  return Math.floor(Math.abs(now.getTime() - past.getTime()) / (1000 * 60 * 60 * 24));
};

const CLR = {
  dark: "#3D0718",
  mid: "#6B0F2B",
  accent: "#8C1535",
  gold: "#C9973A",
  avatars: [
    "#6B0F2B",
    "#8C1535",
    "#3D0718",
    "#b45309",
    "#15803d",
    "#7c3aed",
    "#1d4ed8",
    "#0f766e",
    "#92400e",
    "#065f46",
  ],
} as const;

type Status = Application['applicationStatus']

const STATUS_CONFIG: Record<Status, { color: string; bg: string; dot: string }> = {
  approved: { color: "#1A7A4A", bg: "#dcfce7", dot: "#1A7A4A" },
  pending: { color: "#C9973A", bg: "#fef3c7", dot: "#C9973A" },
  waitlisted: { color: "#7c3aed", bg: "#ede9fe", dot: "#7c3aed" },
  under_review: { color: "#1A7A4A", bg: "#dcfce7", dot: "#1A7A4A" },
  cancelled: { color: "#AA2661", bg: "#ffe4e6", dot: "#AA2661" },
  rejected: { color: "#9E2040", bg: "#ffe4e6", dot: "#9E2040" },
};

const IconMenu = () => (
  <svg className="w-[22px] h-[22px]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard" },
  { id: "applications", label: "Applications" },
  { id: "rooms", label: "Room Assignment" },
  { id: "waitlist", label: "Waitlisted" },
];

const DrawerNav = ({
  open,
  onClose,
  activePage,
  setActivePage,
}: {
  open: boolean;
  onClose: () => void;
  activePage: string;
  setActivePage: (id: string) => void;
}) => (
  <>
    {open && <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={onClose} />}
    <div
      className={`fixed top-0 left-0 bottom-0 z-50 w-64 flex flex-col transition-transform duration-300 ease-in-out lg:hidden ${
        open ? "translate-x-0" : "-translate-x-full"
      }`}
      style={{ background: `linear-gradient(160deg, ${CLR.dark} 0%, ${CLR.mid} 100%)` }}
    >
      <div className="flex items-center gap-3 px-5 pt-6 pb-5 border-b border-white/10">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: CLR.gold }}
        >
          <span className="text-white font-bold text-sm">U</span>
        </div>
        <span className="text-white font-bold text-base">UniDorm</span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              setActivePage(item.id);
              onClose();
            }}
            className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-2xl text-sm font-semibold transition-all text-left ${
              activePage === item.id
                ? "bg-white/15 text-white"
                : "text-white/60 hover:bg-white/10 hover:text-white"
            }`}
          >
            {item.label}
          </button>
        ))}
      </nav>
    </div>
  </>
);

export default function ApplicationsPage() {
  const [search, setSearch] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activePage, setActivePage] = useState("applications");
  const [sortBy, setSortBy] = useState<"latest" | "earliest">("latest");
  const [currentPage, setCurrentPage] = useState(1);

  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [rejectingApp, setRejectingApp] = useState<Application | null>(null);
  const [appStatuses, setAppStatuses] = useState<Record<number, Status>>({});
  const [rejectionRemarks, setRejectionRemarks] = useState<Record<number, string>>({});

  const {
    data: user,
    isLoading: isLoadingUser,
    isError: isErrorUser,
  } = useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const res = await api.get("/me");
      // console.log(res.data)
      return res.data;
    },
  });

  const {
    data: apiData = [],
    isLoading: isLoadingList,
    isError: isErrorList,
    refetch,
  } = useQuery({
    queryKey: ["applicationList"],
    queryFn: async () => {
      const res = await api.get("/applications/view-applicants");
      return res.data;
    },
  });

  const applications: Application[] = apiData;

  const total = useMemo(() => applications.length, [applications]);

  const counts = useMemo(
    () =>
      applications.reduce((acc: Record<string, number>, a: Application) => {
        const s = a.applicationStatus || "unknown";
        acc[s] = (acc[s] || 0) + 1;
        return acc;
      }, {}),
    [applications]
  );

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    const res = applications.filter((a: Application) => {
      const fullName = `${a.student?.user?.fname} ${a.student?.user?.lname}`.toLowerCase();
      return (
        fullName.includes(q) ||
        a.student?.user?.lname.toLowerCase().includes(q) ||
        a.accommodation?.accommodationType.toLowerCase().includes(q) ||
        a.accommodation?.accommodationName.toLowerCase().includes(q)
      );
    });

    return res.sort((a: Application, b: Application) => {
        const diff = new Date(a.applicationDate).getTime() - new Date(b.applicationDate).getTime();
        if (sortBy === "earliest") return diff;
        if (sortBy === "latest") return -diff;
        return -diff;
    });
  }, [search, sortBy, applications]);
  
  const getAppStatus = (app: Application): Status => {
    return appStatuses[app.id] ?? app.applicationStatus;
  };

  const handleAccept = async (appId: number) => {
      try {
        await api.patch(`/applications/${appId}/review`, {
          action: 'approve',
          rejection_reason: null
        });
        
        // Refresh your list data
        refetch(); 
        // Close your modal
        setSelectedApp(null);
        toast.success("Application approved!");
      } catch (error) {
        console.error("Failed to approve:", error);
        toast.error("An error occurred while approving.");
      }
  };

  const handleStartReject = (app: Application) => {
    setRejectingApp(app);
    setSelectedApp(null);
  };

  const handleConfirmReject = async (remark: string) => {
      if (!rejectingApp) return;
      setAppStatuses((prev) => ({
        ...prev,
        [rejectingApp.id]: "rejected",
      }));

      setRejectionRemarks((prev) => ({
        ...prev,
        [rejectingApp.id]: remark,
      }));

      try {
          await api.patch(`/applications/${rejectingApp.id}/review`, {
            action: 'reject', 
            rejection_reason: remark 
          });
          
          refetch(); 
          setRejectingApp(null);
          toast.success("Application rejected.");
        } catch (error) {
          console.error("Failed to reject:", error);
          toast.error("An error occurred while rejecting.");
        }
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const handleSort = (value: string) => {
      if (value === "latest" || value === "earliest") {
          setSortBy(value);
          setCurrentPage(1);
      }
  };

  

  const stats = [
      { label: 'approved', count: counts.approved || 0, from: '#1A7A4A', to: '#2D9A5F', bg: '#F0F7F3', text: '#1A7A4A' },

      { label: 'pending', count: counts.pending || 0, from: '#C9973A', to: '#E8C37A', bg: '#FEF8EE', text: '#C9973A' },

      { label: 'waitlisted', count: counts.waitlisted || 0, from: '#3A6AB7', to: '#7cd3f2', bg: '#EEF4FF', text: '#3A6AB7' },

      { label: 'under review', count: counts.under_review || 0, from: '#6B3AB7', to: '#9B6AE7', bg: '#F4F0FA', text: '#6B3AB7' },

      { label: 'cancelled', count: counts.cancelled || 0, from: '#AA2661', to: '#FDCAE0', bg: '#FAF0F7', text: '#AE2F67' },

      { label: 'rejected', count: counts.rejected || 0, from: '#9E2040', to: '#C84060', bg: '#FDF0F3', text: '#9E2040' },
  ];

  
  // for pages 
  const ITEMS_PER_PAGE = 5;
  const [rows, setRows] = React.useState(ITEMS_PER_PAGE);
  const [searchQuery, setSearchQuery] = React.useState("");

  const localFiltered = searchQuery.trim()
  ? filtered.filter((app) => {
      const q = searchQuery.toLowerCase();
      return (
        app?.student?.user?.fname?.toLowerCase().includes(q) ||
        app?.student?.user?.lname?.toLowerCase().includes(q) ||
        app?.accommodation?.accommodationName?.toLowerCase().includes(q) ||
        app?.applicationRoomType?.toLowerCase().includes(q)
      );
    })
  : filtered;

  const totalPages = Math.max(1, Math.ceil(localFiltered.length / rows));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * rows;
  const paginated = localFiltered.slice(startIndex, startIndex + rows);
    if (isLoadingUser) {
    return null  // ProtectedRoute already shows loader, just be blank
    }

    if (isErrorUser || !user) {
        return null  // Will redirect via ProtectedRoute
    }

  return (
    <div className="flex h-screen overflow-hidden bg-[#F6F2F4]">
      <DrawerNav
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        activePage={activePage}
        setActivePage={setActivePage}
      />
      <div className="flex flex-col overflow-hidden w-full">
        <CustomHeader title="Applications" />
        <div className="flex-1 flex flex-col overflow-hidden gap-6 p-6">
          <div>
            <HeroBanner
              greeting="Good Day"
              name={isLoadingUser ? "Loading..." : isErrorUser ? "Error Loading Name" : user?.fname}
              title="Check your applicants"
              subtitle="We make it easy for you to track the accommodation applications you manage."
              type="mini"
            />
          </div>

          <StatsBanner stats={stats} total={total} cols={6} />

          {/* TABLE CARD */}
          <div className="bg-white rounded-2xl p-6 flex flex-col min-h-0 flex-1">
            {/* Header */}
            <div className="flex justify-between pb-4">
              <div className="my-auto">
                <h1 className="font-bold -mt-1">Application History</h1>
                <p className="italic text-[11px] lg:text-[12px]">{filtered.length} total applications</p>
              </div>
              <div className="flex flex-row gap-2">
                <div className="hidden lg:block">
                  <Dropdown
                    title="No. of Items"
                    items={[
                      { label: "5", href: "" },
                      { label: "10", href: "" },
                      { label: "15", href: "" },
                      { label: "20", href: "" },
                    ]}
                    direction="down"
                    widthClass="w-29 lg:w-35"
                    titleClass="text-[10px] lg:text-[11px]"
                    selectedClass="text-[12px] lg:text-[13px]"
                    onSelect={(label) => { setRows(parseInt(label, 10)); setCurrentPage(1); }}
                    flexDirection="row"
                  />
                </div>
                <Dropdown
                  title="Sort by"
                  items={[
                    { label: "Date applied (Asc.)", href: "" },
                    { label: "Date applied (Desc.)", href: "" },
                    { label: "Status", href: "" },
                  ]}
                  direction="down"
                  widthClass="w-32 lg:w-44"
                  titleClass="text-[10px] lg:text-[11px]"
                  selectedClass="text-[12px] lg:text-[13px]"
                  onSelect={(label) => { handleSort(label); setCurrentPage(1); }}
                />
                <SearchBar
                  value={searchQuery}
                  onChange={setSearchQuery}
                  onPageReset={() => setCurrentPage(1)}
                />
              </div>
            </div>

            {/* Scrollable table */}
            <div className="overflow-auto flex-1 min-h-0 mt-1 rounded-t-lg">
              {isLoadingList ? (
                <div className="py-12 flex flex-col items-center justify-center text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: CLR.mid }} />
                  <p className="text-sm text-[#9A7080] mt-2">Fetching applications...</p>
                </div>
              ) : isErrorList ? (
                <div className="flex justify-center items-center h-full">
                  <div className="text-center">
                    <p className="text-red-500 font-medium text-sm">Fetching data failed</p>
                    <button onClick={() => refetch()} className="mt-2 text-xs font-semibold text-[#9E2040] hover:underline">
                      TRY AGAIN
                    </button>
                  </div>
                </div>
              ) : localFiltered.length === 0 ? (
                <div className="flex flex-col justify-center items-center h-full text-center">
                  <p className="text-[#9A7080] font-medium text-lg">Nothing to see here</p>
                </div>
              ) : (
                <table className="min-w-[900px] w-full text-sm table-fixed border-separate border-spacing-0">
                  <thead className="sticky z-20 top-0 bg-white border-[#6B0F2B]/10">
                    <tr className="text-[#9A7080] text-[12px] tracking-widest font-bold">
                      {[
                        { label: "Student", className: "w-[25%]" },
                        { label: "Date Applied", className: "w-[15%]" },
                        { label: "Time", className: "w-[10%]" },
                        { label: "Facility", className: "w-[20%]" },
                        { label: "Status", className: "w-[15%]" },
                        { label: "Action", className: "w-[10%] text-center" },
                      ].map(col => (
                        <th key={col.label} className={`uppercase p-1.5 text-left whitespace-nowrap border-y border-[#6B0F2B]/10 ${col.className}`}>
                          {col.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {paginated.map((app) => (
                      <tr
                        key={app.id}
                        style={{
                          backgroundColor: (rowStyles[app.applicationStatus]?.bg ?? '#888') + '0D',
                          color: rowStyles[app.applicationStatus]?.text ?? '#888',
                        }}
                      >
                        <td className="p-2">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                              style={{ background: "linear-gradient(135deg, #6B0F2B, #9E2040)" }}
                            >
                              {app?.student?.user?.fname?.charAt(0)?.toUpperCase() || 'U'}
                            </div>
                            <div className="min-w-0">
                              {/* Fixed to handle cases where user's google account may not have a last name */}
                              <p className="font-bold truncate">
                                {[app?.student?.user?.fname, app?.student?.user?.lname]
                                  .filter(Boolean)
                                  .join(" ") || "Unknown"}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="p-2 text-gray-600 whitespace-nowrap">
                          {app?.applicationDate ? (
                            <>
                              <span className="block text-[12px] lg:text-[14px]">
                                {new Date(app.applicationDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </span>
                              <span className="block text-[10px] lg:text-[12px] text-[#9A7080]">
                                {getDaysAgo(app.applicationDate) === 0 ? 'today' : getDaysAgo(app.applicationDate) === 1 ? 'yesterday' : `${getDaysAgo(app.applicationDate)} days ago`}
                              </span>
                            </>
                          ) : <p>Loading date...</p>}
                        </td>
                        <td className="p-2 text-gray-500 whitespace-nowrap">
                          {app?.applicationDate ? formatTime(app.applicationDate) : 'Loading...'}
                        </td>
                        <td className="p-2 whitespace-nowrap">
                          {app?.accommodation ? (
                            <>
                              <p className="font-medium truncate">{app.accommodation.accommodationName}</p>
                              <p className="text-xs text-gray-400 truncate">{app.applicationRoomType}</p>
                            </>
                          ) : <p className="text-gray-400">Loading...</p>}
                        </td>
                        <td className="p-2">
                          <StylizedStatus status={app.applicationStatus} />
                        </td>
                        <td className="p-2 text-center">
                          <Button
                              variant="reddishPink"
                              size="sm"
                              fullWidth={false}
                              isLoading={false}
                              onClick={() => setSelectedApp(app)}>
                              View
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Footer */}
            {localFiltered.length > 0 && (
              <div>
                <hr className="border-[#6B0F2B]/10 border-t" />
                <div className="flex items-center justify-between mt-3">
                  <p className="text-xs my-auto text-[#9A7080]">
                    {`Showing ${startIndex + 1}–${Math.min(startIndex + rows, localFiltered.length)} of ${localFiltered.length}`}
                  </p>
                  <Pagination
                    totalPages={totalPages}
                    currentPage={safePage}
                    onPageChange={setCurrentPage}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <ApplicationModals
        selectedApp={selectedApp}
        rejectingApp={rejectingApp}
        getAppStatus={getAppStatus}
        rejectionRemarks={rejectionRemarks}
        handleAccept={handleAccept}
        handleStartReject={handleStartReject}
        handleConfirmReject={handleConfirmReject}
        setSelectedApp={setSelectedApp}
        setRejectingApp={setRejectingApp}
        statusConfig={STATUS_CONFIG}
      />
    </div>
  );
}