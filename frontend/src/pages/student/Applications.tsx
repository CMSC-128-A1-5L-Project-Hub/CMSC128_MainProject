import { useQuery } from "@tanstack/react-query";

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
  accommodation: Accommodation; // From the .preload('accommodation') in the controller
}

// ── Inline Icons ───────────────────────────────────────────────────────────
const IconApplication = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const IconHouse = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

// ── Helper Component ───────────────────────────────────────────────────────
const StatusBadge = ({ status }: { status: ApplicationStatus }) => {
  const styles: Record<ApplicationStatus, string> = {
    approved:     "bg-green-100 text-green-700 border border-green-200",
    pending:      "bg-amber-100 text-amber-700 border border-amber-200",
    under_review: "bg-sky-100 text-sky-700 border border-sky-200",
    waitlisted:   "bg-purple-100 text-purple-700 border border-purple-200",
    rejected:     "bg-red-100 text-red-700 border border-red-200",
    cancelled:    "bg-gray-100 text-gray-600 border border-gray-200",
  };

  // Format "under_review" to "Under Review"
  const formattedStatus = status.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase());

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold whitespace-nowrap ${styles[status]}`}>
      {formattedStatus}
    </span>
  );
};

// ── API Fetcher ────────────────────────────────────────────────────────────
const fetchApplications = async (): Promise<Application[]> => {
  const res = await fetch("/api/applications/my-applications");
  if (!res.ok) throw new Error("Failed to fetch applications");
  const body = await res.json();
  return body.data ?? body;
};

// ── Main Component ─────────────────────────────────────────────────────────
export default function ApplicationsPage() {
  const { data: applications = [], isLoading, isError } = useQuery({
    queryKey: ["applications"],
    queryFn: fetchApplications,
  });

  return (
    <div className="min-h-screen bg-[#F6F2F4] font-sans flex flex-col items-center py-8 px-4 sm:px-6">
      <div className="w-full max-w-4xl">
        
        {/* Header */}
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-8 rounded-full" style={{ background: CLR.mid }} />
            <h1 className="font-serif italic text-2xl lg:text-3xl font-bold text-gray-900">
              Application History
            </h1>
          </div>
          <div 
            className="w-12 h-12 rounded-full flex items-center justify-center text-white shadow-md"
            style={{ background: `linear-gradient(135deg, ${CLR.mid} 0%, ${CLR.accent} 100%)` }}
          >
            <IconApplication />
          </div>
        </header>

        {/* Content Card */}
        <main className="bg-white rounded-[30px] shadow-[0_10px_24px_rgba(61,7,24,0.06)] p-6 sm:p-8">
          {isLoading && (
            <p className="text-gray-400 font-medium text-center py-10 animate-pulse">
              Loading your applications...
            </p>
          )}

          {isError && (
            <p className="text-red-500 font-medium text-center py-10">
              Failed to load applications. Please check your connection to the server.
            </p>
          )}

          {!isLoading && !isError && applications.length === 0 && (
            <div className="text-center py-16">
              <IconApplication className="w-12 h-12 text-gray-200 mx-auto mb-4" />
              <p className="text-gray-500 font-medium text-lg">No applications found.</p>
              <p className="text-gray-400 text-sm mt-1">When you apply for an accommodation, it will appear here.</p>
            </div>
          )}

          {/* Applications List */}
          <div className="space-y-4">
            {applications.map((app) => (
              <div 
                key={app.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl border border-gray-100 hover:bg-gray-50 transition-colors"
              >
                {/* Left side: Dorm info */}
                <div className="flex items-start gap-4">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 text-white mt-1"
                    style={{ background: CLR.mid }}
                  >
                    <IconHouse />
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-gray-900 text-base">
                        {app.accommodation?.accommodationName || "Unknown Dorm"}
                      </h3>
                      <StatusBadge status={app.applicationStatus} />
                    </div>
                    
                    <p className="text-sm font-medium text-gray-500 mb-1">
                      {app.applicationRoomType.toUpperCase()} Room • {app.applicationStayType.replace("_", " ").toUpperCase()}
                    </p>
                    <p className="text-xs text-gray-400">
                      Applied on: {new Date(app.applicationDate).toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                </div>

                {/* Right side: Duration & Action */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 border-gray-100 pt-3 sm:pt-0">
                  <p className="text-sm font-bold text-gray-700">
                    {app.durationOfStayDays} Days
                  </p>
                  <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-2">
                    Duration
                  </p>
                  
                  {/* Future feature: We can hook up the cancel button here later! */}
                  <button 
                    disabled={app.applicationStatus !== 'pending'}
                    className={`text-xs font-bold px-4 py-2 rounded-lg transition-colors ${
                      app.applicationStatus === 'pending'
                        ? "bg-red-50 text-red-600 hover:bg-red-100"
                        : "bg-gray-50 text-gray-300 cursor-not-allowed"
                    }`}
                  >
                    Cancel Request
                  </button>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}