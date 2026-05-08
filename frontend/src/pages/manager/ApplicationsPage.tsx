import { useState, useMemo } from "react";
import { api } from "../../api/axios";
import { useQuery } from "@tanstack/react-query";
import HeroBanner from '../../components/dashboard/HeroBanner'
import Sidebar from "../../components/Sidebar";
import toast from 'react-hot-toast';

import ApplicationsTable from "../../components/applications/ApplicationsTable";
import ApplicationModals from "../../components/applications/ApplicationModals";
import CustomHeader from '../../components/CustomHeader';
import StatsBanner from "@/components/ApplicationStatus/StatsBanner";

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

type Status = "approved" | "pending" | "waitlisted" | "cancelled" | "rejected" | "under_review";

interface User {
  id: number;
  accountStatus: string | null;
  email: string;
  facebookAccount: string | null;
  fname: string;
  mname: string | null;
  lname: string;
  suffix: string | null;
  role: string;
  otpCode: string | null;
  otpExpiresAt: string | null;
  pfpFileId: number | null;
}

interface Student {
  studentNumber: string;
  userId: number;
  phone: number;
  college: string;
  degreeProgram: string;
  gender: string;
  yearLevel: string | null;
  emergencyContactName: string | null;
  emergencyContactNumber: string | null;
  enrollmentProofFileId: number;
  form5Renewal: boolean | null;
  user: User;
}

interface Accommodation {
  id: number;
  landlordId: number;
  managerId: number | null;
  accommodationName: string;
  accommodationType: string;
  accommodationLocation: string;
  latitude: string | null;
  longitude: string | null;
  accommodationCapacity: number;
  status: string | null;
  tenantRestriction: string;
  businessPermitId: number;
  primaryImageIndex: number | null;
  applicationStartDate: string | null;
  applicationEndDate: string | null;
  walkingDistance: number | null;
  bikingDistance: number | null;
  drivingDistance: number | null;
  invitedManagerEmail: string | null;
}

interface ApplicationResponse {
  id: number;
  accommodationId: number;
  studentNumber: string;
  applicationDate: string;
  applicationRoomType: string;
  applicationStayType: string;
  applicationStatus: Status;
  durationOfStayDays: number;
  accommodation: Accommodation;
  student: Student;
}

const mockApplications: ApplicationResponse[] = [
  {
    id: 1,
    accommodationId: 1,
    studentNumber: "2021-12345",
    applicationDate: "2026-03-12T13:00:00Z",
    applicationRoomType: "Shared Room",
    applicationStayType: "Transient",
    applicationStatus: "approved",
    durationOfStayDays: 120,
    accommodation: {
      id: 1,
      landlordId: 1,
      managerId: null,
      accommodationName: "Building 5",
      accommodationType: "Dorm",
      accommodationLocation: "Campus",
      latitude: null,
      longitude: null,
      accommodationCapacity: 100,
      status: "active",
      tenantRestriction: "none",
      businessPermitId: 1,
      primaryImageIndex: null,
      applicationStartDate: null,
      applicationEndDate: null,
      walkingDistance: null,
      bikingDistance: null,
      drivingDistance: null,
      invitedManagerEmail: null,
    },
    student: {
      studentNumber: "2021-12345",
      userId: 1,
      phone: 9171234567,
      college: "CAS",
      degreeProgram: "BSCS",
      gender: "Female",
      yearLevel: "3rd Year",
      emergencyContactName: null,
      emergencyContactNumber: null,
      enrollmentProofFileId: 1,
      form5Renewal: false,
      user: {
        id: 1,
        accountStatus: "active",
        email: "ana@test.com",
        facebookAccount: null,
        fname: "Ana",
        mname: null,
        lname: "Reyes",
        suffix: null,
        role: "student",
        otpCode: null,
        otpExpiresAt: null,
        pfpFileId: null,
      },
    },
  },
  
];

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
  const [sortBy, setSortBy] = useState("Date applied (Desc.)");
  const [currentPage, setCurrentPage] = useState(1);

  const [selectedApp, setSelectedApp] = useState<ApplicationResponse | null>(null);
  const [rejectingApp, setRejectingApp] = useState<ApplicationResponse | null>(null);
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
      console.log(res.data)
      return res.data;
    },
  });

  //used mock data for buttons -- paki change na lang 
  const USE_MOCK = false;

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
    enabled: !USE_MOCK,
  });

  const applications: ApplicationResponse[] = USE_MOCK ? mockApplications : apiData;

  const total = useMemo(() => applications.length, [applications]);

  const counts = useMemo(
    () =>
      applications.reduce((acc: Record<string, number>, a: ApplicationResponse) => {
        const s = a.applicationStatus || "unknown";
        acc[s] = (acc[s] || 0) + 1;
        return acc;
      }, {}),
    [applications]
  );

  

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    const res = applications.filter((a: ApplicationResponse) => {
      const fullName = `${a.student.user.fname} ${a.student.user.lname}`.toLowerCase();
      return (
        fullName.includes(q) ||
        a.student.user.lname.toLowerCase().includes(q) ||
        a.accommodation.accommodationType.toLowerCase().includes(q) ||
        a.accommodation.accommodationName.toLowerCase().includes(q)
      );
    });

    return res.sort((a: ApplicationResponse, b: ApplicationResponse) => {
      const diff = new Date(a.applicationDate).getTime() - new Date(b.applicationDate).getTime();
      if (sortBy === "Date applied (Asc.)") return diff;
      if (sortBy === "Date applied (Desc.)") return -diff;
      if (sortBy === "Status") return a.applicationStatus.localeCompare(b.applicationStatus);
      return -diff;
    });
  }, [search, sortBy, applications]);
  
  const getAppStatus = (app: ApplicationResponse): Status => {
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

  const handleStartReject = (app: ApplicationResponse) => {
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
    setSortBy(value as "latest" | "earliest");
    setCurrentPage(1);
  };

  const stats = [
    {
      label: "Approved",
      color: "linear-gradient(135deg, #1A7A4A, #2D9A5F)",
      text: "#1A7A4A",
      light_bg: "#F0F7F3",
      value: counts.approved || 0,
    },
    {
      label: "Pending",
      color: "linear-gradient(135deg, #C9973A, #E8C37A)",
      text: "#C9973A",
      light_bg: "#FEF8EE",
      value: counts.pending || 0,
    },
    {
      label: "Waitlisted",
      color: "linear-gradient(135deg, #6B3AB7, #9B6AE7)",
      text: "#6B3AB7",
      light_bg: "#F4F0FA",
      value: counts.waitlisted || 0,
    },
    {
      label: "Under Review",
      color: "linear-gradient(135deg, #1A7A4A, #2D9A5F)",
      text: "#1A7A4A",
      light_bg: "#F0F7F3",
      value: counts.under_review || 0,
    },
    {
      label: "Cancelled",
      color: "linear-gradient(135deg, #AA2661, #FDCAE0)",
      text: "#AE2F67",
      light_bg: "#FAF0F7",
      value: counts.cancelled || 0,
    },
    {
      label: "Rejected",
      color: "linear-gradient(135deg, #9E2040, #C84060)",
      text: "#9E2040",
      light_bg: "#FDF0F3",
      value: counts.rejected || 0,
    },
  ];

    //   const stats2 = [
    //     { label: 'approved', count: counts.approved || 0, from: '#1A7A4A', to: '#2D9A5F', bg: '#F0F7F3', text: '#1A7A4A' },

    //     { label: 'pending', count: counts.pending || 0, from: '#C9973A', to: '#E8C37A', bg: '#FEF8EE', text: '#C9973A' },

    //     { label: 'waitlisted', count: counts.waitlisted || 0, from: '#6B3AB7', to: '#9B6AE7', bg: '#F4F0FA', text: '#6B3AB7' },

    //     { label: 'under review', count: counts.under_review || 0, from: '#1A7A4A', to: '#2D9A5F', bg: '#F0F7F3', text: '#1A7A4A' },

    //     { label: 'cancelled', count: counts.cancelled || 0, from: '#AA2661', to: '#FDCAE0', bg: '#FAF0F7', text: '#AE2F67' },

    //     { label: 'rejected', count: counts.rejected || 0, from: '#9E2040', to: '#C84060', bg: '#FDF0F3', text: '#9E2040' },
    // ];

    const stats2 = [
        { label: 'approved', count: counts.approved || 0, from: '#1A7A4A', to: '#2D9A5F', bg: '#F0F7F3', text: '#1A7A4A' },

        { label: 'pending', count: counts.pending || 0, from: '#C9973A', to: '#E8C37A', bg: '#FEF8EE', text: '#C9973A' },

        { label: 'waitlisted', count: counts.waitlisted || 0, from: '#3A6AB7', to: '#7cd3f2', bg: '#F4F0FA', text: '#3A6AB7' },

        { label: 'under review', count: counts.under_review || 0, from: '#6B3AB7', to: '#9B6AE7', bg: '#F0F7F3', text: '#6B3AB7' },

        { label: 'cancelled', count: counts.cancelled || 0, from: '#AA2661', to: '#FDCAE0', bg: '#FAF0F7', text: '#AE2F67' },

        { label: 'rejected', count: counts.rejected || 0, from: '#9E2040', to: '#C84060', bg: '#FDF0F3', text: '#9E2040' },
    ];

  return (
   <div className="flex h-screen overflow-hidden bg-[#F6F2F4]">
      <Sidebar 
        role="manager" 
        profile={{fullName: `${user?.fname} ${user?.lname}`,
              shortName: `${user?.fname}`,
              email: `${user?.email}`,
              status: `${user?.manager?.managerStatus}`
        }} 
      />
      <DrawerNav
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        activePage={activePage}
        setActivePage={setActivePage}
      />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <CustomHeader title="Applications" />

          <main className="flex flex-col flex-1 min-w-0 overflow-y-auto overflow-x-hidden p-4 gap-6 sm:p-6">
            <div>
              <HeroBanner
                greeting="Good Day"
                name={isLoadingUser ? "Loading..." : isErrorUser ? "Error Loading Name" : user?.fname}
                title="Check your applicants"
                subtitle="We make it easy for you to track the accommodation applications you manage."
                type="mini"
              />
            </div>

        <StatsBanner stats={stats2} total={total} cols={6}/>

        {/* <div className="bg-white rounded-2xl p-5 shadow-sm mb-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {stats.map((s) => {
              const pct = total ? Math.round((s.value / total) * 100) : 0;

              return (
                <div key={s.label}>
                  <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: s.text }}>
                    {s.label}
                  </p>

                  <div className="flex items-center gap-2">
                    <div
                      className="relative flex items-center h-7 rounded-full overflow-hidden flex-1"
                      style={{ background: s.light_bg }}
                    >
                      <div
                        className="absolute left-0 top-0 h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${pct}%`,
                          minWidth: "55px",
                          background: s.color,
                          transition: "width 0.4s ease",
                        }}
                      />
                      <span className="relative z-10 text-white text-xs font-bold px-3 whitespace-nowrap">
                        {s.value} / {total}
                      </span>
                    </div>

                    <span className="text-xs font-semibold text-gray-400 w-6 text-right flex-shrink-0">
                      {pct}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div> */}
      
      

        <ApplicationsTable
          filtered={filtered}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          sortBy={sortBy}
          onSortChange={handleSort}
          search={search}
          onSearchChange={handleSearch}
          isLoading={isLoadingList}
          isError={isErrorList}

          // isLoading={!USE_MOCK && isLoadingList}
          // isError={!USE_MOCK && isErrorList}
          refetch={refetch}
          clr={CLR}
          statusConfig={STATUS_CONFIG}
          getAppStatus={getAppStatus}
          onView={setSelectedApp}
        />
      </main>
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