import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import ApplicationStatusModal from "../../components/ApplicationStatusModal";

// ── Design tokens ─────────────────────────
const CLR = {
  dark:   "#3D0718",
  mid:    "#6B0F2B",
  accent: "#8C1535",
  gold:   "#C9973A",
  goldLt: "#E8C37A",
} as const;

// ── Types ──────────────────────────────────────────────────────────────────
type ApplicationStatus = "pending" | "under_review" | "approved" | "rejected" | "waitlisted" | "cancelled";

interface Accommodation {
  id: number;
  accommodationName: string;
  accommodationLocation: string;
  accommodationType: string;
}

interface Application {
  id: number;
  accommodationId: number;
  studentNumber: string;
  applicationRoomType: string;
  applicationStayType: string;
  applicationStatus: ApplicationStatus;
  durationOfStayDays: number;
  applicationDate: string;
  reviewedAt?: string | null;     
  reviewedBy?: number | null;     
  reviewer?: {                    
    fname: string;
    lname: string;
  } | null;
  estimatedMonthlyRent?: number | null;
  rejectionReason?: string | null; 
  accommodation: Accommodation;
}

// ── Helper Components ──────────────────────────────────────────────────────
const StatusBadge = ({ status }: { status: ApplicationStatus }) => {
  // Updated to match the softer colors and dot indicator of the new design
  const config: Record<ApplicationStatus, { bg: string, text: string, dot: string, label: string }> = {
    approved:     { bg: "bg-green-50", text: "text-green-700", dot: "bg-green-600", label: "Approved" },
    pending:      { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500", label: "Pending" },
    under_review: { bg: "bg-purple-50", text: "text-purple-700", dot: "bg-purple-600", label: "Under Review" },
    waitlisted:   { bg: "bg-rose-50", text: "text-rose-700", dot: "bg-rose-600", label: "Waitlisted" },
    rejected:     { bg: "bg-red-50", text: "text-red-700", dot: "bg-red-600", label: "Rejected" },
    cancelled:    { bg: "bg-gray-50", text: "text-gray-600", dot: "bg-gray-500", label: "Cancelled" },
  };

  const { bg, text, dot, label } = config[status] || config.pending;

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${bg} ${text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`}></span>
      {label}
    </span>
  );
};

// Date formatter to match "Mar 12, 2026"
const formatDate = (dateString: string) => {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleDateString("en-US", { 
    month: "short", 
    day: "numeric", 
    year: "numeric" 
  });
};

// ── API Fetcher ────────────────────────────────────────────────────────────
const fetchApplications = async (): Promise<Application[]> => {
  const res = await fetch("/api/applications/my-applications");
  if (!res.ok) throw new Error("Failed to fetch applications");
  const body = await res.json();
  const apps = body.data ?? body;

  console.log("Raw API response:", apps);
  // Map backend's roomRent to estimatedMonthlyRent
  return apps.map((app: any) => ({
    ...app,
    estimatedMonthlyRent: app.estimatedMonthlyRent ?? null,  
  }));
};

// ── Main Component ─────────────────────────────────────────────────────────
export default function ApplicationsPage() {
  const { data: applications = [], isLoading, isError } = useQuery({
    queryKey: ["applications"],
    queryFn: fetchApplications,
  });
  console.log("Browser log:", typeof window !== "undefined");

  

  // --- NEW STATE ---
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    
    <div className="min-h-screen bg-[#F6F2F4] font-sans flex flex-col items-center py-8 px-4 sm:px-6">
      <div className="w-full max-w-6xl"> {/* Expanded width slightly for table layout */}
        {/* Header */}
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-8 rounded-full" style={{ background: CLR.mid }} />
            <h1 className="font-serif italic text-2xl lg:text-3xl font-bold text-gray-900">
              Application History
            </h1>
          </div>
          <p className="text-sm font-medium text-gray-500">
            {applications.length} total applications
          </p>
        </header>

        {/* Content Card */}
        <main className="bg-white rounded-[30px] shadow-[0_10px_24px_rgba(61,7,24,0.06)] overflow-hidden">
          
          {isLoading && (
            <p className="text-gray-400 font-medium text-center py-16 animate-pulse">
              Loading your applications...
            </p>
          )}

          {isError && (
            <p className="text-red-500 font-medium text-center py-16">
              Failed to load applications. Please check your connection to the server.
            </p>
          )}

          {!isLoading && !isError && applications.length === 0 && (
            <div className="text-center py-20">
              <p className="text-gray-500 font-medium text-lg">No applications found.</p>
              <p className="text-gray-400 text-sm mt-1">When you apply for an accommodation, it will appear here.</p>
            </div>
          )}

          {!isLoading && !isError && applications.length > 0 && (
            <div className="w-full overflow-x-auto">
              <div className="min-w-[900px]"> {/* Ensures table doesn't crush on small screens */}
                
                {/* Table Header Row */}
                <div className="grid grid-cols-12 gap-4 px-8 py-4 border-b border-gray-100 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  <div className="col-span-3">Dormitory</div>
                  <div className="col-span-2">Date Applied</div>
                  <div className="col-span-3">Remarks By Admin</div>
                  <div className="col-span-2">Reviewed On</div>
                  <div className="col-span-1">Status</div>
                  <div className="col-span-1 text-center">Action</div>
                </div>

                {/* Table Body (Applications List) */}
                <div className="divide-y divide-gray-50">
                  {applications.map((app) => (
                    <div 
                      key={app.id}
                      className="grid grid-cols-12 gap-4 px-8 py-4 items-center hover:bg-gray-50/50 transition-colors"
                    >
                      {/* 1. Dormitory */}
                      <div className="col-span-3 flex items-center gap-4">
                        <div 
                          className="w-10 h-10 rounded-full text-white flex flex-shrink-0 items-center justify-center font-bold text-lg"
                          style={{ background: CLR.dark }}
                        >
                          {app.accommodation?.accommodationName?.charAt(0).toUpperCase() || "?"}
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 text-sm truncate">
                            {app.accommodation?.accommodationName || "Unknown Dorm"}
                          </h3>
                          <p className="text-[11px] text-gray-500 capitalize">
                            {app.applicationRoomType.toLowerCase()} • {app.applicationStayType.replace("_", "-").toLowerCase()}
                          </p>
                        </div>
                      </div>
 
                      {/* 2. Date Applied */}
                      <div className="col-span-2">
                        <p className="text-sm font-medium text-gray-800">{formatDate(app.applicationDate)}</p>
                      </div>

                      {/* 3. Remarks By Admin */}
                      <div className="col-span-3 pr-4">
                        {app.applicationStatus === 'rejected' && app.rejectionReason ? (
                          <p className="text-sm text-red-600 truncate" title={app.rejectionReason}>
                            {app.rejectionReason}
                          </p>
                        ) : (
                          <p className="text-sm text-gray-400 truncate">—</p>
                        )}
                      </div>

                      {/* 4. Reviewed On */}
                      <div className="col-span-2">
                        {app.applicationStatus === "pending" || app.applicationStatus === "cancelled" ? (
                          <>
                            <p className="text-sm text-gray-400">—</p>
                            <p className="text-[11px] text-gray-400">Not yet reviewed</p>
                          </>
                        ) : (
                          <p className="text-sm font-medium text-gray-800">
                            {app.reviewedAt ? formatDate(app.reviewedAt) : "—"}
                          </p>
                        )}
                      </div>

                      {/* 5. Status */}
                      <div className="col-span-1">
                        <StatusBadge status={app.applicationStatus} />
                      </div>

                      {/* 6. Action (View Button) */}
                      <div className="col-span-1 flex justify-center">
                        <button 
                          className="px-5 py-1.5 bg-[#FDF2F4] text-[#8C1535] text-xs font-bold rounded-full border border-[#FDF2F4] hover:border-[#8C1535] hover:bg-white transition-all"
                          onClick={() => {
                            setSelectedApp(app);     // 1. Tell React which application to show
                            setIsModalOpen(true);    // 2. Open the modal
                          }}
                        >
                          View
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                
              </div>
            </div>
          )}
        </main>
      </div>
      <ApplicationStatusModal 
        open={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        application={selectedApp} 
      />
    </div>
  );
}
