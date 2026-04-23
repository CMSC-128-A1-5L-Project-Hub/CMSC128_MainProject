import { useState, useMemo } from "react";
import { api } from "../../api/axios";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "../../components/Sidebar"
import Modal from "../../components/Modal";
import Button from "../../components/Button";
import Card from "../../components/ui/Card";

import { 
    IoPersonSharp, 
    IoCalendarSharp, 
    IoBedSharp,
    IoDocumentSharp,
    IoDocumentTextSharp,
    IoIdCardSharp
} from "react-icons/io5"

interface ManagerProfile {
    fullName: string
    shortName: string
    email: string
    phoneNumber: string
    status: string
    dormitory: string
}

const managerProfile: ManagerProfile = {
    fullName: "Dal Cadsawan",
    shortName: "Dal",
    email: "ddcadsawan@up.edu.ph",
    phoneNumber: "+63 912 345 6789",
    status: "Active",
    dormitory: "Narra Residences"
}

const CLR = {
  dark: "#3D0718",
  mid: "#6B0F2B", 
  accent: "#8C1535",
  gold: "#C9973A",
  avatars: [
    "#6B0F2B","#8C1535","#3D0718","#b45309","#15803d",
    "#7c3aed","#1d4ed8","#0f766e","#92400e","#065f46",
  ],
} as const;

type Status = "approved" | "pending" | "waitlisted" | "cancelled" | "rejected";

interface User {
  id: number
  accountStatus: string | null
  email: string
  facebookAccount: string | null
  fname: string
  mname: string | null
  lname: string
  suffix: string | null
  role: string
  otpCode: string | null
  otpExpiresAt: string | null
  pfpFileId: number | null
}

interface Student {
  studentNumber: string
  userId: number
  phone: string
  college: string
  degreeProgram: string
  gender: string
  yearLevel: string | null
  emergencyContactName: string | null
  emergencyContactNumber: string | null
  enrollmentProofFileId: number
  form5Renewal: boolean | null
  user: User
}

interface Accommodation {
  id: number
  landlordId:  number
  managerId: number | null
  accommodationName: string
  accommodationType: string
  accommodationLocation: string
  latitude: string | null
  longitude: string | null
  accommodationCapacity: number
  status: string | null
  tenantRestriction: string
  businessPermitId: number
  primaryImageIndex: number | null
  applicationStartDate: string | null
  applicationEndDate: string | null
  walkingDistance: number | null
  bikingDistance: number | null
  drivingDistance: number | null
  invitedManagerEmail: string | null
}

interface ApplicationResponse {
  id: number
  accommodationId: number
  studentNumber: string
  applicationDate: string // ISO Timestamp
  applicationRoomType: string
  applicationStayType: string
  applicationStatus: Status
  durationOfStayDays: number
  accommodation: Accommodation // Nested Accommodation object
  student: Student // Nested Student object
}

const mockApplications: ApplicationResponse[] = [
  {
    id: 1,
    accommodationId: 1,
    studentNumber: "2021-12345",
    applicationDate: "2026-03-12T13:00:00Z",
    applicationRoomType: "Shared Room",
    applicationStayType: "Long Stay",
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
      college: "CAS",
      phone: "09929",
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

  {
    id: 2,
    accommodationId: 2,
    studentNumber: "2021-54321",
    applicationDate: "2026-03-14T11:15:00Z",
    applicationRoomType: "Single Room",
    applicationStayType: "Short Stay",
    applicationStatus: "pending",
    durationOfStayDays: 60,
    accommodation: {
      id: 2,
      landlordId: 1,
      managerId: null,
      accommodationName: "Building 1",
      accommodationType: "Apartment",
      accommodationLocation: "Campus",
      latitude: null,
      longitude: null,
      accommodationCapacity: 50,
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
      studentNumber: "2021-54321",
      userId: 2,
      college: "CAS",
      degreeProgram: "BSIT",
      phone: "--",
      gender: "Male",
      yearLevel: "2nd Year",
      emergencyContactName: null,
      emergencyContactNumber: null,
      enrollmentProofFileId: 1,
      form5Renewal: false,
      user: {
        id: 2,
        accountStatus: "active",
        email: "b@test.com",
        facebookAccount: null,
        fname: "Brian",
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

const ITEMS_PER_PAGE = 6;
//STATUS COLORS 
const STATUS_CONFIG: Record<Status, { color: string; bg: string; dot: string }> = {
  approved:   { color: "#1A7A4A", bg: "#dcfce7", dot: "#1A7A4A" },
  pending:    { color: "#C9973A", bg: "#fef3c7", dot: "#C9973A" },
  waitlisted: { color: "#7c3aed", bg: "#ede9fe", dot: "#7c3aed" },
  cancelled:  { color: "#AA2661", bg: "#ffe4e6", dot: "#AA2661" },
  rejected:   { color: "#9E2040", bg: "#ffe4e6", dot: "#9E2040" },
};

const IconMenu = () => (
  <svg className="w-[22px] h-[22px]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

const StatusBadge = ({ status }: { status: Status }) => {
  const cfg = STATUS_CONFIG[status];
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[0.7rem] font-semibold whitespace-nowrap"
      style={{ background: cfg.bg, color: cfg.color }}
    >
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: cfg.dot }} />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

const getDaysAgo = (targetDate: string): number => {
    const now = new Date();
    const past = new Date(targetDate);
    
    now.setHours(0, 0, 0, 0);
    past.setHours(0, 0, 0, 0);

    const diffTime = Math.abs(now.getTime() - past.getTime());
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
};

function formatDate(dateString: string) {
  const date = new Date(dateString);

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

function formatTime(dateString: string) {
  const date = new Date(dateString);

  return new Intl.DateTimeFormat('en-GB', { // 'en-GB' uses 24-hour clock by default
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).format(date);
}

const FilterSelect = ({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) => (
  <div className="flex flex-col gap-1">
    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{label}</label>
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="
          appearance-none border border-gray-200 rounded-lg md:rounded-xl 
          /* Width & Height Logic */
          w-28 md:w-auto 
          px-2 py-1 md:px-3 md:py-2 
          pr-7 md:pr-8 
          /* Font Logic */
          text-[0.7rem] md:text-sm 
          font-semibold focus:outline-none focus:border-[#6B0F2B] cursor-pointer bg-white"
        style={{ color: CLR.mid }}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      
      {/* Centered Icon Adjustment */}
      <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400">
        <svg 
          width="12"  
          height="12" 
          fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </span>
    </div>
  </div>
);

// ===== BUTTONS =======================================================
const PageBtn = ({
  active,
  disabled,
  onClick,
  children,
}: {
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) => (
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
// ===== NAVIGATION =======================================================
const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard"          },
  { id: "applications", label: "Applications"  },
  { id: "rooms", label: "Room Assignment"  },
  { id: "waitlist", label: "Waitlisted",}
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
// ===== MODAL =======================================================
const ApplicationModalContent = ({
  app,
  status,
  rejectionRemark,
  onAccept,
  onReject,
}: {
  app: ApplicationResponse;
  status: Status;
  rejectionRemark: string | null;
  onAccept: () => void;
  onReject: () => void;
}) => {
  const fullName = `${app.student.user.fname} ${app.student.user.lname}`;

  return (
    <Card
      children={
        <div className="flex flex-col gap-6">
          {/* Header */}
          <div className="flex flex-row justify-between items-start">
            <div className="flex flex-col">
              <p className="text-[#1A0008] font-bold text-xl">
                {fullName}
              </p>
              <p className="text-[#C8B0B8] text-xs mt-1">
                Date Applied: {formatDate(app.applicationDate)}
              </p>
            </div>
            <StatusBadge status={status} />
          </div>

          {/* Applicant Details + Occupancy Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border border-[#F5ECF0] rounded-xl p-4">
            {/* Applicant Details */}
            <div className="col-span-1 sm:border-r border-[#F5ECF0] sm:pr-4">
              <p className="flex flex-row gap-2 items-center font-semibold text-[#1A0008] mb-3">
                <IoPersonSharp size={18} color="#6B0F2B" />
                Applicant Details
              </p>

              <div className="grid grid-cols-2 gap-y-3">
                <div className="col-span-2">
                  <p className="text-[#9A7080] text-[10px] uppercase font-semibold tracking-wide">Email</p>
                  <p className="text-[#1A0008] text-sm break-all">{app.student.user.email}</p>
                </div>

                <div className="col-span-1">
                  <p className="text-[#9A7080] text-[10px] uppercase font-semibold tracking-wide">Year Level</p>
                  <p className="text-[#1A0008] text-sm">{app.student.yearLevel || "N/A"}</p>
                </div>

                <div className="col-span-1">
                  <p className="text-[#9A7080] text-[10px] uppercase font-semibold tracking-wide">Phone Number</p>
                  <p className="text-[#1A0008] text-sm">{app.student.phone || "N/A"}</p>
                </div>

                <div className="col-span-2">
                  <p className="text-[#9A7080] text-[10px] uppercase font-semibold tracking-wide">Degree Program</p>
                  <p className="text-[#1A0008] text-sm">{app.student.degreeProgram}</p>
                </div>

                <div className="col-span-1">
                  <p className="text-[#9A7080] text-[10px] uppercase font-semibold tracking-wide">College</p>
                  <p className="text-[#1A0008] text-sm">{app.student.college}</p>
                </div>

                <div className="col-span-1">
                  <p className="text-[#9A7080] text-[10px] uppercase font-semibold tracking-wide">Student Number</p>
                  <p className="text-[#1A0008] text-sm">{app.student.studentNumber}</p>
                </div>
              </div>
            </div>

            {/* Occupancy Details */}
            <div className="col-span-1 sm:pl-2">
              <p className="flex flex-row gap-2 items-center font-semibold text-[#1A0008] mb-3">
                <IoCalendarSharp size={18} color="#6B0F2B" />
                Occupancy Details
              </p>

              <div className="flex flex-col gap-3">
                <div>
                  <p className="text-[#9A7080] text-[10px] uppercase font-semibold tracking-wide">Application Date</p>
                  <p className="text-[#1A0008] text-sm">{formatDate(app.applicationDate)}</p>
                </div>

                <div>
                  <p className="text-[#9A7080] text-[10px] uppercase font-semibold tracking-wide">Time Submitted</p>
                  <p className="text-[#1A0008] text-sm">{formatTime(app.applicationDate)}</p>
                </div>

                <div>
                  <p className="text-[#9A7080] text-[10px] uppercase font-semibold tracking-wide">Duration</p>
                  <p className="text-[#1A0008] text-sm">
                    {app.durationOfStayDays} day{app.durationOfStayDays !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Room Preference + Uploaded Documents */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border border-[#F5ECF0] rounded-xl p-4">
            {/* Room Preference */}
            <div className="col-span-1 sm:border-r border-[#F5ECF0] sm:pr-4">
              <p className="flex flex-row gap-2 items-center font-semibold text-[#1A0008] mb-3">
                <IoBedSharp size={18} color="#6B0F2B" />
                Room Preference
              </p>

              <div className="grid grid-cols-2 gap-y-3">
                <div className="col-span-1">
                  <p className="text-[#9A7080] text-[10px] uppercase font-semibold tracking-wide">Stay</p>
                  <p className="text-[#1A0008] text-sm">{app.applicationStayType}</p>
                </div>

                <div className="col-span-1">
                  <p className="text-[#9A7080] text-[10px] uppercase font-semibold tracking-wide">Facility</p>
                  <p className="text-[#1A0008] text-sm">{app.accommodation.accommodationName}</p>
                </div>

                <div className="col-span-1">
                  <p className="text-[#9A7080] text-[10px] uppercase font-semibold tracking-wide">Room Type</p>
                  <p className="text-[#1A0008] text-sm">{app.applicationRoomType}</p>
                </div>

                <div className="col-span-1">
                  <p className="text-[#9A7080] text-[10px] uppercase font-semibold tracking-wide">Location</p>
                  <p className="text-[#1A0008] text-sm">{app.accommodation.accommodationLocation}</p>
                </div>
              </div>
            </div>

            {/* Uploaded Documents */}
            <div className="col-span-1 sm:pl-2">
              <p className="flex flex-row gap-2 items-center font-semibold text-[#1A0008] mb-3">
                <IoDocumentSharp size={18} color="#6B0F2B" />
                Uploaded Documents
              </p>

              <div className="flex flex-col gap-3">
                {[
                  { label: "FORM 5", icon: <IoDocumentTextSharp size={16} color="white" /> },
                  { label: "VALID ID", icon: <IoIdCardSharp size={16} color="white" /> },
                ].map((doc) => (
                  <div
                    key={doc.label}
                    className="grid grid-cols-[auto_1fr_60px] items-center gap-3"
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: "linear-gradient(135deg, #6B0F2B, #9E2040)" }}
                    >
                      {doc.icon}
                    </div>

                    <p className="text-[#1A0008] text-xs font-semibold">{doc.label}</p>

                    <Button variant="reddishPink" size="sm">
                      View
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Rejection remark if already rejected */}
          {status === "rejected" && rejectionRemark && (
            <div className="border border-[#F5D5DC] bg-[#FFF5F7] rounded-xl p-4">
              <p className="text-[#9E2040] text-[10px] uppercase font-bold tracking-wide mb-1">
                Rejection Remark
              </p>
              <p className="text-[#1A0008] text-sm">{rejectionRemark}</p>
            </div>
          )}

          {/* Action buttons */}
          {status === "pending" && (
            <div className="flex flex-row justify-end gap-3 pt-1">
              <Button variant="primary" onClick={onAccept}>
                Accept
              </Button>
              <Button variant="secondary" onClick={onReject}>
                Reject
              </Button>
            </div>
          )}
        </div>
      }
    />
  );
};
const RejectionModal = ({ 
    open, 
    target, 
    onCancel, 
    onConfirm 
}: { 
    open: boolean
    target: ApplicationResponse | null
    onCancel: () => void
    onConfirm: (reason: string) => void
}) => {
    const [reason, setReason] = useState("")

    const handleConfirm = () => {
        if (!reason.trim()) return
        onConfirm(reason)
        setReason("")
    }

    const handleCancel = () => {
        setReason("")
        onCancel()
    }

    return (
        <Modal
            open={open}
            onClose={handleCancel}
            title="Reject Application"
            children={
                <div className="flex flex-col gap-4">
                    <p className="text-[#1A0008] text-sm">
                        Please provide a reason for rejecting{" "}
                        <span className="font-semibold">
                            {target 
                                ? `${target.student.user.fname} ${target.student.user.lname}` 
                                : ""}
                        </span>'s application.
                    </p>

                    <textarea
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="Enter rejection reason..."
                        rows={4}
                        className="w-full border border-[#F5ECF0] rounded-xl p-3 text-sm text-[#1A0008] placeholder:text-[#C8B0B8] resize-none focus:outline-none focus:border-[#6B0F2B]"
                    />

                    <div className="flex flex-row justify-end gap-3">
                        <Button variant="secondary" onClick={handleCancel}>
                            Cancel
                        </Button>
                        <Button
                            variant="reddishPink"
                            disabled={!reason.trim()}
                            onClick={handleConfirm}
                        >
                            Confirm Reject
                        </Button>
                    </div>
                </div>
            }
        />
    )
}

// ===== MAIN PAGE =======================================================

export default function ApplicationsPage() {
  const [search, setSearch] = useState("");                               // search input val
  const [drawerOpen, setDrawerOpen] = useState(false);                    //side bar mobile 
  const [activePage, setActivePage] = useState("applications");           //active page on sidebar 
  const [sortBy, setSortBy] = useState<"latest" | "earliest">("latest");  //sorting option
  const [currentPage, setCurrentPage] = useState(1);                      //current page num 
  const [selectedApp, setSelectedApp] = useState<ApplicationResponse | null>(null);
  const [rejectingApp, setRejectingApp] = useState<ApplicationResponse | null>(null);
  const [appStatuses, setAppStatuses] = useState<Record<number, Status>>({});
  const [rejectionRemarks, setRejectionRemarks] = useState<Record<number, string>>({});

  const { 
    data: user, 
    isLoading: isLoadingUser, // Renaming 'isLoading' to 'isLoadingUser'
    isError: isErrorUser 
  } = useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      const res = await api.get('/me')
      return res.data.data
    }
  })

  // const { 
  //   data: applications = [], 
  //   isLoading: isLoadingList, 
  //   isError: isErrorList, 
  //   refetch
  // } = useQuery({
  //     queryKey: ['list'],
  //     queryFn: async () => {
  //       const res = await api.get('/applications/applicants')
  //       // console.log('Full Axios application Response: ', res.data)
  //       return res.data
  //     }
  // })

const USE_MOCK = true;

const {
  data: apiData = [],
  isLoading: isLoadingList,
  isError: isErrorList,
  refetch
} = useQuery({
  queryKey: ['list'],
  queryFn: async () => {
    const res = await api.get('/applications/applicants');
    return res.data;
  },
  enabled: !USE_MOCK 
});

const applications = USE_MOCK ? mockApplications : apiData;
const total = useMemo(() => applications.length, [applications]);

const counts = useMemo(() =>
  applications.reduce((acc: Record<string, number>, a: ApplicationResponse) => {
    const s = a.applicationStatus || "unknown";
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {}),
  [applications]
);

  //FILTER AND SORT
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    //filter by name 
    const res = applications.filter((a: ApplicationResponse) =>
      a.student.user.lname.toLowerCase().includes(q) ||
      a.accommodation.accommodationType.toLowerCase().includes(q)
    );
    //sort by date 
    return res.sort((a: ApplicationResponse, b: ApplicationResponse) => {
      const diff = new Date(a.applicationDate).getTime() - new Date(b.applicationDate).getTime();
      return sortBy === "latest" ? -diff : diff;
    });
  }, [search, sortBy, applications]);

  // console.log("Filter: ")
  // console.log(filtered)
const getAppStatus = (app: ApplicationResponse): Status => {
  return appStatuses[app.id] ?? app.applicationStatus;
};

const handleAccept = (appId: number) => {
  setAppStatuses((prev) => ({
    ...prev,
    [appId]: "approved",
  }));
};

const handleStartReject = (app: ApplicationResponse) => {
  setRejectingApp(app);   // store app for rejection modal
  setSelectedApp(null);   // close current application modal
};

const handleConfirmReject = (remark: string) => {
  if (!rejectingApp) return;

  setAppStatuses((prev) => ({
    ...prev,
    [rejectingApp.id]: "rejected",
  }));

  setRejectionRemarks((prev) => ({
    ...prev,
    [rejectingApp.id]: remark,
  }));

  setRejectingApp(null); // close rejection modal
};

  const totalPages  = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const safePage    = Math.min(currentPage, totalPages);
  const startIndex  = (safePage - 1) * ITEMS_PER_PAGE;
  const paginated   = filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleSearch = (v: string) => { setSearch(v);  setCurrentPage(1); };
  const handleSort   = (v: string) => { setSortBy(v as "latest" | "earliest"); setCurrentPage(1); };

  //stats data TOP CARDS 
  const stats = [
    { label: "Approved",   color: "linear-gradient(135deg, #1A7A4A, #2D9A5F)", text: "#1A7A4A", light_bg: "#F0F7F3" ,value: counts.approved   || 0 },
    { label: "Pending",    color: "linear-gradient(135deg, #C9973A, #E8C37A)", text: "#C9973A", light_bg: "#FEF8EE" ,value: counts.pending    || 0 },
    { label: "Waitlisted", color: "linear-gradient(135deg, #6B3AB7, #9B6AE7)", text: "#6B3AB7", light_bg: "#F4F0FA" ,value: counts.waitlisted || 0 },
    { label: "Cancelled",  color: "linear-gradient(135deg, #AA2661, #FDCAE0)", text: "#AE2F67", light_bg: "#FAF0F7" ,value: counts.cancelled  || 1 },
    { label: "Rejected",   color: "linear-gradient(135deg, #9E2040, #C84060)", text: "#9E2040", light_bg: "#FDF0F3" ,value: counts.rejected   || 0 },
  ];

// for tracking page number 
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


  return (
    <div className="flex min-h-screen bg-[#F6F2F4]">
      {/* SIDEBAR */}
      <Sidebar role="manager" profile={managerProfile} />
      <DrawerNav open={drawerOpen} onClose={() => setDrawerOpen(false)} activePage={activePage} setActivePage={setActivePage} />

       <main className="flex-1 p-4 sm:p-6">
        {/* Title row */}
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => setDrawerOpen(true)} className="lg:hidden p-1" aria-label="Open menu" style={{ color: CLR.mid }}>
            <IconMenu />
          </button>
          <div className="hidden lg:block w-1 h-6 rounded-full" style={{ background: CLR.mid }} />
          <h1 className="font-serif italic text-[28px] lg:text-[34px] font-semibold text-gray-900 tracking-tight">
            Applications
          </h1>
        </div>

        {/* Header banner */}
        <div
          className="rounded-2xl p-6 mb-6 text-white"
          style={{ background: `linear-gradient(135deg, ${CLR.dark}, ${CLR.accent})` }}
        >
          <p className="text-xs uppercase tracking-widest opacity-70">
            Good Day, {isLoadingUser ? 'Loading...' : isErrorUser ? 'Error Loading Name' : user?.fname}
          </p>
          <h2 className="text-2xl font-bold mt-1">Check your applicants</h2>
          <p className="text-sm opacity-70 mt-1">We make it easy for you to track the accommodation applications you manage.</p>
        </div>

        {/* Stats */}
        <div className="bg-white rounded-2xl p-5 shadow-sm mb-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {stats.map((s) => {
              const pct = total ? Math.round((s.value / total) * 100) : 0;
              return (
                <div key={s.label}>
                  <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: s.text }}>
                    {s.label}
                  </p>
                  {/* progress bar and %  */}
                  <div className="flex items-center gap-2">
                        <div className="relative flex items-center h-7 rounded-full overflow-hidden flex-1" style={{ background: s.light_bg }}>                      <div
                        className="absolute left-0 top-0 h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%`, minWidth: "55px", background: s.color, transition: "width 0.4s ease" }}
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
        </div>

        {/* Table card */}
        <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
          <div className="flex items-end gap-3 p-4 border-b">
          {/* Title — fixed, never shrinks */}
          <div className="shrink-0">
            <h2 className="text-sm md:text-lg font-semibold tracking-tight text-black">
              Application History
            </h2>
            <p className="text-xs text-gray-400">{filtered.length} total applications</p>
          </div>

          {/* Right controls  */}
          <div className="flex items-end gap-3 ml-auto min-w-0 flex-wrap">
            
            {/* Sort  */}
            <div className="shrink-0">
              <FilterSelect
                label="Sort By"
                value={sortBy}
                onChange={handleSort}
                options={[
                  { value: "latest",   label: "Latest First"   },
                  { value: "earliest", label: "Earliest First" },
                ]}
              />
            </div>

            {/* Search — absorbs all shrinking */}
            <div className="flex flex-col gap-1 min-w-0 w-40 sm:w-56">
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Search</label>
              <input
                type="text"
                placeholder="Search applicant..."
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                className="
                  w-full min-w-0
                  border border-gray-200 rounded-lg md:rounded-xl
                  px-2 py-1 md:px-3 md:py-2
                  text-[0.7rem] md:text-sm
                  focus:outline-none focus:border-[#6B0F2B]
                  transition-all duration-200
                "
              />
            </div>
          </div>
        </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide bg-gray-50" style={{ color: CLR.mid }}>
                  <th className="px-4 py-3">Student</th>
                  {/* Hide on very small screens */}
                  <th className="px-4 py-3 hidden sm:table-cell">Date Applied</th>
                  <th className="px-4 py-3 hidden lg:table-cell">Time</th>
                  <th className="px-4 py-3 hidden sm:table-cell">Facility</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {isLoadingList ? (
                  <tr>
                    <td colSpan={6} className="text-center py-16">
                      <div className="flex flex-col items-center gap-2">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: CLR.mid }} />
                        <p className="text-gray-400 text-sm">Fetching applications...</p>
                      </div>
                    </td>
                  </tr>
                ) : isErrorList ? (
                  <tr>
                    <td colSpan={6} className="text-center py-16 text-red-500 text-sm">
                      <p>Failed to load applications.</p>
                      <button onClick={() => refetch()} className="mt-2 underline text-xs">Try again</button>
                    </td>
                  </tr>
                ) : (
                  paginated.map((app: ApplicationResponse) => {
                    const initial = app.student.user.fname.charAt(0).toUpperCase();
                    const avatarColor = CLR.avatars[app.id % CLR.avatars.length];
                    return (
                      <tr key={`${app.id}-${startIndex}`} className="border-t hover:bg-gray-50 transition-colors">
                        {/* Student */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div
                              aria-hidden="true"
                              className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                              style={{ background: avatarColor }}
                            >
                              {initial}
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium truncate">
                                {app.student.user.fname} {app.student.user.lname}
                              </p>
                              {/* Show date inline on xs when date column is hidden */}
                              <p className="text-xs text-gray-400 sm:hidden">{formatDate(app.applicationDate)}</p>
                            </div>
                          </div>
                        </td>
 
                        {/* Date — hidden on xs */}
                        <td className="px-4 py-3 text-gray-600 whitespace-nowrap hidden sm:table-cell">
                          <p>{formatDate(app.applicationDate)}</p>
                          <p className="text-xs text-gray-400">{getDaysAgo(app.applicationDate)} days ago</p>
                        </td>
 
                        {/* Time — hidden below lg */}
                        <td className="px-4 py-3 text-gray-500 whitespace-nowrap hidden lg:table-cell">
                          {formatTime(app.applicationDate)}
                        </td>
 
                        {/* Facility — hidden on xs */}
                        <td className="px-4 py-3 hidden sm:table-cell">
                          <p className="font-medium">{app.accommodation.accommodationName}</p>
                          <p className="text-xs text-gray-400">{app.applicationRoomType}</p>
                        </td>
 
                        {/* Status */}
                        <td className="px-4 py-3">
                          <StatusBadge status={getAppStatus(app)} />
                        </td>
 
                        {/* Action */}
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => setSelectedApp(app)}
                            className="text-sm px-4 py-1.5 rounded-xl font-medium transition-colors hover:opacity-80"
                            style={{ color: CLR.mid, background: "#F5ECF0", border: `1px solid ${CLR.mid}20` }}
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
 
          {/* Pagination footer */}
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <p className="text-xs text-gray-400">
              {filtered.length === 0
                ? "No results"
                : `Showing ${startIndex + 1}–${Math.min(startIndex + ITEMS_PER_PAGE, filtered.length)} of ${filtered.length}`}
            </p>
            <div className="flex items-center gap-1.5">
              {getVisiblePages().map((page) => (
                <PageBtn key={page} active={safePage === page} onClick={() => setCurrentPage(page)}>
                  {page}
                </PageBtn>
              ))}
            </div>
          </div>
        </div>
      </main>
 
      {/* ── Application detail modal ── */}
      <Modal
        open={!!selectedApp}
        onClose={() => setSelectedApp(null)}
        title="APPLICATION"
        maxWidth={900}
        maxHeight={650}
      >
        {selectedApp && (
          <ApplicationModalContent
            app={selectedApp}
            status={getAppStatus(selectedApp)}
            rejectionRemark={rejectionRemarks[selectedApp.id] ?? null}
            onAccept={() => handleAccept(selectedApp.id)}
            onReject={() => handleStartReject(selectedApp)}
          />
        )}
      </Modal>
      <RejectionModal
        open={!!rejectingApp}
        target={rejectingApp}
        onCancel={() => setRejectingApp(null)}
        onConfirm={handleConfirmReject}
      />
    </div>
  );
}