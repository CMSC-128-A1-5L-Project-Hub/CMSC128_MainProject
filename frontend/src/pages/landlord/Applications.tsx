import React from "react";
import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../../api/axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import HeroBanner from '../../components/dashboard/HeroBanner'
import Sidebar from "../../components/Sidebar";
import CustomHeader from '../../components/CustomHeader';
import StatsBanner from "@/components/ApplicationStatus/StatsBanner";
import Dropdown from "@/components/ApplicationStatus/Dropdown";
import SearchBar from "@/components/SearchBar";
import Pagination from "@/components/ApplicationStatus/Pagination";
import StylizedStatus from "@/components/BillingDashboard/StylizedStatus";
import Button from "@/components/Button";
import Modal from "@/components/Modal";
import Card from "@/components/ui/Card";
import Toast from "@/components/Toast";
import { DateTime } from 'luxon';
import { IoPersonSharp, IoCalendarSharp, IoBedSharp, IoDocumentSharp, IoDocumentTextSharp } from "react-icons/io5";
import DocumentPreviewModal from "@/components/applications/DocumentPreviewModal";

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

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
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
} as const;

type Status = "approved" | "pending" | "waitlisted" | "cancelled" | "rejected" | "under_review" | "confirmed";

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
  form5Renewal: boolean;
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
  documents?: { requirementName: string }[];
}

const STATUS_CONFIG: Record<Status, { color: string; bg: string; dot: string }> = {
  approved: { color: "#1A7A4A", bg: "#dcfce7", dot: "#1A7A4A" },
  pending: { color: "#C9973A", bg: "#fef3c7", dot: "#C9973A" },
  waitlisted: { color: "#7c3aed", bg: "#ede9fe", dot: "#7c3aed" },
  under_review: { color: "#C9973A", bg: "#fef3c7", dot: "#C9973A" },
  cancelled: { color: "#AA2661", bg: "#ffe4e6", dot: "#AA2661" },
  rejected: { color: "#9E2040", bg: "#ffe4e6", dot: "#9E2040" },
  confirmed: { color: "#1A7A4A", bg: "#dcfce7", dot: "#1A7A4A" },
};

// ─── Status Badge Component ────────────────────────────────────────────────
const StatusBadge = ({ status }: { status: Status }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[0.7rem] font-semibold whitespace-nowrap"
      style={{ background: cfg.bg, color: cfg.color }}
    >
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: cfg.dot }} />
      {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
    </span>
  );
};

// ─── Application Modal Content ─────────────────────────────────────────────
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
  const [preview, setPreview] = useState<{ url: string; name: string } | null>(null);

  return (
    <>
    <Card className="!p-0">
      <div className="flex flex-col gap-6 p-6">
        <div className="flex flex-row justify-between items-start">
          <div className="flex flex-col">
            <p className="text-[#1A0008] font-bold text-xl">{fullName}</p>
            <p className="text-[#C8B0B8] text-xs mt-1">
              Date Applied: {formatDate(app.applicationDate)}
            </p>
          </div>
          <StatusBadge status={status} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border border-[#F5ECF0] rounded-xl p-4">
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border border-[#F5ECF0] rounded-xl p-4">
          <div className="col-span-1 sm:border-r border-[#F5ECF0] sm:pr-4">
            <p className="flex flex-row gap-2 items-center font-semibold text-[#1A0008] mb-3">
              <IoBedSharp size={18} color="#6B0F2B" />
              Room Preference
            </p>
            <div className="grid grid-cols-2 gap-y-3">
              <div className="col-span-1">
                <p className="text-[#9A7080] text-[10px] uppercase font-semibold tracking-wide">Stay</p>
                <p className="text-[#1A0008] text-sm capitalize">{app.applicationStayType?.replace('_', ' ')}</p>
              </div>
              <div className="col-span-1">
                <p className="text-[#9A7080] text-[10px] uppercase font-semibold tracking-wide">Facility</p>
                <p className="text-[#1A0008] text-sm">{app.accommodation.accommodationName}</p>
              </div>
              <div className="col-span-1">
                <p className="text-[#9A7080] text-[10px] uppercase font-semibold tracking-wide">Room Type</p>
                <p className="text-[#1A0008] text-sm capitalize">{app.applicationRoomType}</p>
              </div>
              <div className="col-span-1">
                <p className="text-[#9A7080] text-[10px] uppercase font-semibold tracking-wide">Location</p>
                <p className="text-[#1A0008] text-sm">{app.accommodation.accommodationLocation}</p>
              </div>
            </div>
          </div>

          <div className="col-span-1 sm:pl-2">
            <p className="flex flex-row gap-2 items-center font-semibold text-[#1A0008] mb-3">
              <IoDocumentSharp size={18} color="#6B0F2B" />
              Uploaded Documents
            </p>
            <div className="flex flex-col gap-3">
              {Array.from(
                new Set(["Enrollment Proof", ...((app.documents || []).map((d) => d.requirementName))])
              ).map((requirementName) => (
                <div key={requirementName} className="grid grid-cols-[auto_1fr_60px] items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: "linear-gradient(135deg, #6B0F2B, #9E2040)" }}
                  >
                    <IoDocumentTextSharp size={16} color="white" />
                  </div>
                  <p className="text-[#1A0008] text-xs font-semibold">{requirementName}</p>
                  <Button
                    variant="reddishPink"
                    size="sm"
                    onClick={async () => {
                      try {
                        if (requirementName.toUpperCase() === "ENROLLMENT PROOF") {
                          const res = await api.get(`/applications/${app.id}/enrollment-proof`)
                          if (res.status === 200 && res.data?.url) {
                            setPreview({ url: res.data.url, name: requirementName })
                          } else {
                            alert("Enrollment proof not available.")
                          }
                        } else {
                          const secureParam = encodeURIComponent(requirementName)
                          const res = await api.get(`/applications/${app.id}/documents/${secureParam}`)
                          if (res.status === 200 && res.data?.url) {
                            setPreview({ url: res.data.url, name: requirementName })
                          } else {
                            alert(`${requirementName} not available.`)
                          }
                        }
                      } catch (err) {
                        console.error(err)
                        alert("Could not fetch document.")
                      }
                    }}
                  >
                    View
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {status === "rejected" && rejectionRemark && (
          <div className="border border-[#F5D5DC] bg-[#FFF5F7] rounded-xl p-4">
            <p className="text-[#9E2040] text-[10px] uppercase font-bold tracking-wide mb-1">
              Rejection Remark
            </p>
            <p className="text-[#1A0008] text-sm">{rejectionRemark}</p>
          </div>
        )}

        {status === "under_review" && (
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
    </Card>
    <DocumentPreviewModal
      open={!!preview}
      onClose={() => setPreview(null)}
      url={preview?.url ?? null}
      name={preview?.name ?? ""}
    />
    </>
  );
};

// ─── Rejection Modal ───────────────────────────────────────────────────────
const RejectionModal = ({
  open,
  target,
  onBack,
  onConfirm,
}: {
  open: boolean;
  target: ApplicationResponse | null;
  onBack: () => void;
  onConfirm: (reason: string) => void;
}) => {
  const [reason, setReason] = useState("");

  const handleConfirm = () => {
    if (!reason.trim()) return;
    onConfirm(reason.trim());
    setReason("");
  };

  const handleBack = () => {
    setReason("");
    onBack();
  };

  return (
    <Modal
      open={open}
      onClose={handleBack}
      title="Reject Application"
      eyebrow="Provide a reason"
      footer={
        <div className="flex flex-row justify-end w-full gap-3">
          <Button variant="secondary" onClick={handleBack}>
            ← Back
          </Button>
          <Button variant="primary" disabled={!reason.trim()} onClick={handleConfirm}>
            Confirm Reject
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        <p className="text-[#1A0008] text-sm">
          Please provide a reason for rejecting{" "}
          <span className="font-semibold">
            {target ? `${target.student.user.fname} ${target.student.user.lname}` : ""}
          </span>
          's application.
        </p>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Enter rejection reason..."
          rows={4}
          className="w-full border border-[#F5ECF0] rounded-xl p-3 text-sm text-[#1A0008] placeholder:text-[#C8B0B8] resize-none focus:outline-none focus:border-[#6B0F2B]"
        />
      </div>
    </Modal>
  );
};

// ─── Main Component ────────────────────────────────────────────────────────
export default function LandlordApplicationsPage() {
  const [searchParams] = useSearchParams();
  const targetAccId = searchParams.get("accId");
  const queryClient = useQueryClient();
  
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"latest" | "earliest">("latest");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedApp, setSelectedApp] = useState<ApplicationResponse | null>(null);
  const [rejectingApp, setRejectingApp] = useState<ApplicationResponse | null>(null);
  const [rejectionRemarks, setRejectionRemarks] = useState<Record<number, string>>({});
  
  const [toast, setToast] = useState<{
    show: boolean;
    type: "success" | "error" | "info" | "warning" | "loading";
    title: string;
    message?: string;
  }>({ show: false, type: "success", title: "" });

  const { data: user, isLoading: isLoadingUser } = useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const res = await api.get("/me");
      return res.data;
    },
  });

  const { data: applications = [], isLoading: isLoadingList, refetch } = useQuery<ApplicationResponse[]>({
    queryKey: ["landlord-applications", targetAccId],
    queryFn: async () => {
      const res = await api.get("/applications/incoming");
      let data = res.data;
      if (targetAccId) {
        data = data.filter((app: ApplicationResponse) => String(app.accommodationId) === targetAccId);
      }
      data = data.filter((app: ApplicationResponse) => 
        app.applicationStatus === "under_review" || app.applicationStatus === "waitlisted"
      );
      return data;
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ applicationId, action, reason }: { applicationId: number; action: "approve" | "reject"; reason?: string }) => {
      const res = await api.patch(`/applications/${applicationId}/review`, {
        action: action,
        ...(action === "reject" && { rejection_reason: reason })
      });
      return res.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["landlord-applications"] });
      refetch();
      setSelectedApp(null);
      setRejectingApp(null);
      
      if (variables.action === "approve") {
        setToast({
          show: true,
          type: "success",
          title: "Application Approved!",
          message: "The application has been successfully approved."
        });
      } else {
        setToast({
          show: true,
          type: "success",
          title: "Application Rejected",
          message: "The application has been rejected and the student has been notified."
        });
      }
    },
    onError: (error: any) => {
      setToast({
        show: true,
        type: "error",
        title: "Action Failed",
        message: error.response?.data?.message || "An error occurred. Please try again."
      });
    }
  });

  const total = applications.length;
  const counts = applications.reduce((acc: Record<string, number>, a: ApplicationResponse) => {
    const s = a.applicationStatus || "unknown";
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {});

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    const res = applications.filter((a: ApplicationResponse) => {
      const fullName = `${a.student.user.fname} ${a.student.user.lname}`.toLowerCase();
      return (
        fullName.includes(q) ||
        a.student.user.lname.toLowerCase().includes(q) ||
        a.accommodation.accommodationName.toLowerCase().includes(q) ||
        a.applicationRoomType.toLowerCase().includes(q)
      );
    });
    return res.sort((a: ApplicationResponse, b: ApplicationResponse) => {
      const diff = new Date(a.applicationDate).getTime() - new Date(b.applicationDate).getTime();
      return sortBy === "earliest" ? diff : -diff;
    });
  }, [search, sortBy, applications]);

  const handleAccept = (appId: number) => {
    updateStatusMutation.mutate({ applicationId: appId, action: "approve" });
  };

  const handleStartReject = (app: ApplicationResponse) => {
    setRejectingApp(app);
    setSelectedApp(null);
  };

  const handleConfirmReject = (remark: string) => {
    if (!rejectingApp) return;
    setRejectionRemarks((prev) => ({ ...prev, [rejectingApp.id]: remark }));
    updateStatusMutation.mutate({ applicationId: rejectingApp.id, action: "reject", reason: remark });
    setRejectingApp(null);
  };

  const ITEMS_PER_PAGE = 6;
  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * ITEMS_PER_PAGE;
  const paginated = filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const stats = [
    { label: 'Under Review', count: counts.under_review || 0, from: '#C9973A', to: '#E8C37A', bg: '#FEF8EE', text: '#C9973A' },
    { label: 'Waitlisted', count: counts.waitlisted || 0, from: '#6B3AB7', to: '#9B6AE7', bg: '#F4F0FA', text: '#6B3AB7' },
    { label: 'Accepted', count: counts.approved || 0, from: '#1A7A4A', to: '#2D9A5F', bg: '#F0F7F3', text: '#1A7A4A' },
    { label: 'Rejected', count: counts.rejected || 0, from: '#AA2661', to: '#FDCAE0', bg: '#FAF0F7', text: '#AE2F67' },
  ];

  if (isLoadingUser) return null;

  return (
    <div className="flex h-screen bg-[#F6F2F4]">
      <div className="flex flex-col w-full h-full">
        <CustomHeader title="Applications" />
        <div className="flex-1 flex flex-col overflow-hidden gap-4 lg:gap-6 p-4 lg:p-6">
          <HeroBanner
            greeting="Good Day"
            name={user?.fname || "Landlord"}
            title="Review applicant requirements"
            subtitle="Review and manage accommodation applications submitted by students."
            type="mini"
          />

          <StatsBanner stats={stats} total={total} cols={4} />

          <div className="bg-white rounded-2xl p-6 flex flex-col min-h-0 flex-1">
            <div className="flex justify-between pb-4">
              <div className="my-auto">
                <h1 className="font-bold -mt-1">Application History</h1>
                <p className="italic text-[11px] lg:text-[12px]">{filtered.length} total applications</p>
              </div>
              <div className="flex flex-row gap-2">
                <Dropdown
                  title="Sort by"
                  items={[
                    { label: "Date applied (Latest)", href: "" },
                    { label: "Date applied (Earliest)", href: "" },
                  ]}
                  direction="down"
                  widthClass="w-32 lg:w-44"
                  titleClass="text-[10px] lg:text-[11px]"
                  selectedClass="text-[12px] lg:text-[13px]"
                  onSelect={(label) => {
                    setSortBy(label.includes("Latest") ? "latest" : "earliest");
                    setCurrentPage(1);
                  }}
                />
                <SearchBar
                  value={search}
                  onChange={setSearch}
                  onPageReset={() => setCurrentPage(1)}
                />
              </div>
            </div>

            <div className="overflow-auto flex-1 min-h-0 mt-1 rounded-t-lg">
              {isLoadingList ? (
                <div className="py-12 flex flex-col items-center justify-center text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: CLR.mid }} />
                  <p className="text-sm text-[#9A7080] mt-2">Fetching applications...</p>
                </div>
              ) : (
                <table className="min-w-[950px] w-full text-sm border-separate border-spacing-y-2">
                  <tbody>
                    {filtered.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-14">
                          <div className="flex flex-col items-center justify-center text-center">
                            <p className="text-[#9A7080] font-medium text-lg">
                              No applications found
                            </p>

                            <p className="text-[#9A7080] text-sm mt-1">
                              No applications match your current filters
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      paginated.map((app) => (
                        <tr
                          key={app.id}
                          className="bg-white shadow-sm hover:shadow-md transition-all duration-200"
                          style={{
                            borderRadius: "18px",
                          }}
                        >
                          {/* STUDENT */}
                          <td className="px-4 py-4 rounded-l-2xl">
                            <div className="flex items-center gap-3">
                              <div
                                className="w-11 h-11 rounded-2xl flex items-center justify-center text-white font-bold text-sm shrink-0"
                                style={{
                                  background:
                                    "linear-gradient(135deg, #8C1535, #5A0D22)",
                                  boxShadow: "0 4px 10px rgba(140,21,53,0.25)",
                                }}
                              >
                                {app?.student?.user?.fname?.charAt(0)?.toUpperCase() || "U"}
                              </div>

                              <div className="min-w-0">
                                <p className="font-semibold text-[#1A0008] truncate">
                                  {[app?.student?.user?.fname, app?.student?.user?.lname]
                                    .filter(Boolean)
                                    .join(" ") || "Unknown"}
                                </p>

                                <p className="text-xs text-[#9A7080] truncate mt-0.5">
                                  {app.student.studentNumber}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* DATE */}
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="flex flex-col">
                              <span className="text-sm font-medium text-[#1A0008]">
                                {formatDate(app.applicationDate)}
                              </span>

                              <span className="text-[11px] text-[#9A7080] mt-0.5">
                                {getDaysAgo(app.applicationDate) === 0
                                  ? "today"
                                  : getDaysAgo(app.applicationDate) === 1
                                  ? "yesterday"
                                  : `${getDaysAgo(app.applicationDate)} days ago`}
                              </span>
                            </div>
                          </td>

                          {/* ROOM TYPE */}
                          <td className="px-4 py-4">
                            <span
                              className="px-3 py-1.5 rounded-full text-xs font-semibold capitalize"
                              style={{
                                background: "rgba(140,21,53,0.08)",
                                color: "#6B0F2B",
                              }}
                            >
                              {app.applicationRoomType}
                            </span>
                          </td>

                          {/* STAY TYPE */}
                          <td className="px-4 py-4">
                            <span
                              className="px-3 py-1.5 rounded-full text-xs font-semibold capitalize"
                              style={{
                                background: "rgba(201,151,58,0.10)",
                                color: "#A56B00",
                              }}
                            >
                              {app.applicationStayType?.replace("_", " ")}
                            </span>
                          </td>

                          {/* STATUS */}
                          <td className="px-4 py-4">
                            <StylizedStatus status={app.applicationStatus} />
                          </td>

                          {/* ACTION */}
                          <td className="px-4 py-4 text-center rounded-r-2xl">
                            <Button
                              variant="reddishPink"
                              size="sm"
                              fullWidth={false}
                              onClick={() => setSelectedApp(app)}
                              className="!rounded-xl !px-4 hover:scale-105 transition-transform"
                            >
                              Review
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}
            </div>

            {filtered.length > 0 && (
              <div>
                <hr className="border-[#6B0F2B]/10 border-t" />
                <div className="flex items-center justify-between mt-3">
                  <p className="text-xs my-auto text-[#9A7080]">
                    {`Showing ${startIndex + 1}–${Math.min(startIndex + ITEMS_PER_PAGE, filtered.length)} of ${filtered.length}`}
                  </p>
                  <Pagination totalPages={totalPages} currentPage={safePage} onPageChange={setCurrentPage} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Modal open={!!selectedApp} onClose={() => setSelectedApp(null)} title="REVIEW APPLICATION" eyebrow="Application Details" maxWidth={900} maxHeight={650}>
        {selectedApp && (
          <ApplicationModalContent
            app={selectedApp}
            status={selectedApp.applicationStatus}
            rejectionRemark={rejectionRemarks[selectedApp.id] ?? null}
            onAccept={() => handleAccept(selectedApp.id)}
            onReject={() => handleStartReject(selectedApp)}
          />
        )}
      </Modal>

      <RejectionModal
        open={!!rejectingApp}
        target={rejectingApp}
        onBack={() => {
          setRejectingApp(null);
          setSelectedApp(rejectingApp);
        }}
        onConfirm={handleConfirmReject}
      />

      <Toast type={toast.type} title={toast.title} message={toast.message} show={toast.show} onClose={() => setToast(prev => ({ ...prev, show: false }))} />
    </div>
  );
}