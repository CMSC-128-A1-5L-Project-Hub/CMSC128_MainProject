import React from "react";
import { DateTime } from 'luxon';
import Dropdown from "../ApplicationStatus/Dropdown";
import SearchBar from "../SearchBar";
import StylizedStatus from "../BillingDashboard/StylizedStatus";
import Pagination from "../ApplicationStatus/Pagination";

const ITEMS_PER_PAGE = 6;

const rowStyles: Record<string, { bg: string; text: string }> = {
  approved:     { bg: '#1A7A4A', text: '#000000' },
  pending:      { bg: '#FFFFFF', text: '#000000' },
  under_review: { bg: '#6B3AB7', text: '#000000' },
  rejected:     { bg: '#6B0F2B', text: '#9A7080' },
  waitlisted:   { bg: '#EFF4FF', text: '#000000' },
  cancelled:    { bg: '#F0F0F0', text: '#888888' },
  confirmed:    { bg: '#1A7A4A', text: '#000000' },
}

// ======================== DATE AND TIME ========================
function formatDate(dateString: string) {
  const date = new Date(dateString);

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function formatTime(dateString: string) {
  if (!dateString) return "N/A";

  const dt = DateTime.fromISO(dateString).setZone('utc', { keepLocalTime: true });

  if (!dt.isValid) return "Invalid Time";

  return dt.toFormat('h:mm a');
}

//GET HOW MANY DAYS AGO
const getDaysAgo = (targetDate: string): number => {
  const now = new Date();
  const past = new Date(targetDate);

  now.setHours(0, 0, 0, 0);
  past.setHours(0, 0, 0, 0);

  const diffTime = Math.abs(now.getTime() - past.getTime());
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
};

// ======================== STATUS ========================
const StatusBadge = ({
  status,
  statusConfig,
}: {
  status: any;
  statusConfig: Record<string, { color: string; bg: string; dot: string }>;
}) => {
  const fallbackConfig = {
    color: "#6B7280",
    bg: "#F3F4F6",
    dot: "#9CA3AF",
  };

  const cfg = statusConfig?.[status] ?? fallbackConfig;

  const displayStatus =
    typeof status === "string" && status.length > 0
      ? status.charAt(0).toUpperCase() + status.slice(1)
      : "Loading...";

  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[0.7rem] font-semibold whitespace-nowrap"
      style={{ background: cfg.bg, color: cfg.color }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
        style={{ background: cfg.dot }}
      />
      {displayStatus.charAt(0).toUpperCase() + displayStatus.slice(1)}
    </span>
  );
};

const SORT_OPTS = [
  { value: "latest", label: "Latest First" },
  { value: "earliest", label: "Earliest First" },
];
//======================== DROPDOWN FULTER ========================
const FilterSelect = ({
  value,
  onChange,
  compact,
  onToggle, 
  sortOpen,
  setSortOpen,
}: {
  value: "latest" | "earliest";
  onChange: (v: string) => void;
  compact?: boolean;
  onToggle?: () => void;
  sortOpen: boolean;
  setSortOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const selected = SORT_OPTS.find((o) => o.value === value)?.label;

  return (
    <div className="relative">
      <button
        onClick={() => {
          if (compact) {
            onToggle?.();
            setSortOpen(false);
          } else {
            setSortOpen((o) => !o);
          }
        }}
          className={`flex items-center gap-2 border border-[#E8D5DC] rounded-xl px-3 h-10 text-sm bg-white hover:bg-[#F5ECF0] transition ${
            compact ? "w-10 justify-center" : "w-[140px]"
          }`}
      >
        {compact ? (
          <svg className="w-4 h-4 text-[#9A7080]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
          </svg>
        ) : (
          <>
            <span className="flex flex-col text-left">
              <span className="text-[9px] uppercase text-[#9A7080] font-bold leading-none">Sort By</span>
              <span className="text-[#1A0008] font-medium text-xs">{selected}</span>
            </span>
            <svg className="ml-auto w-4 h-4 text-[#9A7080]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </>
        )}
      </button>

      {sortOpen && (
        <div className="absolute z-10 top-full mt-1 right-0 bg-white border border-[#E8D5DC] rounded-xl shadow-md overflow-hidden w-full">
          {SORT_OPTS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => {
                onChange(opt.value);
                setSortOpen(false);
              }}
              className={`w-full text-left px-4 py-2 text-xs hover:bg-[#F5ECF0] transition ${
                value === opt.value
                  ? "text-[#6B0F2B] font-semibold"
                  : "text-[#1A0008]"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ======================== MAIN COMPONENT ========================
export default function ApplicationsTable({

  filtered,
  currentPage,
  setCurrentPage,
  onSortChange,
  isLoading,
  isError,
  refetch,
  clr,
  statusConfig,
  getAppStatus,
  onView,
}: {
  filtered: any[];
  currentPage: number;
  setCurrentPage: (page: number) => void;
  onSortChange: (value: string) => void;
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
  clr: any;
  statusConfig: Record<string, { color: string; bg: string; dot: string }>;
  getAppStatus: (app: any) => any;
  onView: (app: any) => void;
}) {

  // for pages 
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

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 overflow-hidden">

      <div className="w-full h-full overflow-x-auto overflow-y-auto mt-5">
      
       <table className="min-w-[900px] w-full text-sm table-fixed">
          <thead>
          <tr className="border-y border-[#6B0F2B]/10">
            <th className="px-4 py-1 text-left text-[#9A7080] text-[12px] font-bold uppercase tracking-widest whitespace-nowrap">
              Student
            </th>

            <th className="px-2 py-1 p-1 text-left text-[#9A7080] text-[12px] font-bold uppercase tracking-widest whitespace-nowrap">
              Date Applied
            </th>

            <th className="px-5 py-1 p-1 text-left text-[#9A7080] text-[12px] font-bold uppercase tracking-widest whitespace-nowrap">
              Time
            </th>

            <th className="px-4 py-1 p-1 text-left text-[#9A7080] text-[12px] font-bold uppercase tracking-widest whitespace-nowrap">
              Facility
            </th>

            <th className="px-7 py-1 p-1 text-left text-[#9A7080] text-[12px] font-bold uppercase tracking-widest whitespace-nowrap">
              Status
            </th>

            <th className="px-2 py-1 p-1 text-center text-[#9A7080] text-[12px] font-bold uppercase tracking-widest whitespace-nowrap">
              Action
            </th>
          </tr>
          </thead>

          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6} className="text-center py-16">
                  <div className="flex flex-col items-center gap-2">
                    <div
                      className="animate-spin rounded-full h-8 w-8 border-b-2"
                      style={{ borderColor: clr.mid }}
                    />
                    <p className="text-gray-400 text-sm">Fetching applications...</p>
                  </div>
                </td>
              </tr>
            ) : isError ? (
              <tr>
                <td colSpan={6} className="py-16">
                  <div className="flex flex-col items-center justify-center text-center">
                    <p className="text-sm text-red-500 font-medium">
                      Fetching data failed
                    </p>
                    <button
                      onClick={() => refetch()}
                      className="mt-2 text-xs font-semibold text-[#9E2040] hover:underline"
                    >
                      TRY AGAIN
                    </button>
                  </div>
                </td>
              </tr>
            ) : localFiltered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <p className="text-base italic text-gray-400">Nothing to see here</p>
                  </td>
                </tr>
              ) : (
              paginated.map((app) => {
                return (
                  <tr
                    key={`${app.id}-${startIndex}`}
                    style={{
                      backgroundColor: (rowStyles[app.applicationStatus]?.bg ?? '#888') + '0D',
                      color: rowStyles[app.applicationStatus]?.text ?? '#888',
                    }}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div
                          aria-hidden="true"
                          className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                          style={{ background: "linear-gradient(135deg, #6B0F2B, #9E2040)" }}
                        >
                          {app?.student?.user?.fname?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium truncate">
                            {app?.student?.user?.fname && app?.student?.user?.lname ?
                            `${app.student.user.fname} ${app.student.user.lname}` :
                              "Loading name..."}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                      {app?.applicationDate ? (
                        <>
                          <p>{formatDate(app.applicationDate)}</p>
                          <p className="text-xs text-gray-400">
                            {getDaysAgo(app.applicationDate)} days ago
                          </p>
                        </>
                      ) : (
                        <p>Loading date...</p>
                      )}
                    </td>

                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                      {app?.applicationDate ?
                        formatTime(app.applicationDate) :
                        'Loading Time...'
                      }
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      {app?.accommodation ? (
                        <>
                          <p className="font-medium">
                            {app.accommodation.accommodationName}
                          </p>
                          <p className="text-xs text-gray-400">
                            {app.applicationRoomType}
                          </p>
                        </>
                      ) : (
                        <p className="font-medium text-gray-400">
                          Loading facility...
                        </p>
                      )}
                    </td>

                    <td className="px-4 py-3">
                      <StylizedStatus status={app.applicationStatus} />
                    </td>

                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => onView(app)}
                        className="text-sm px-4 py-1.5 rounded-xl font-medium transition-colors hover:opacity-80"
                        style={{
                          color: clr.mid,
                          background: "#F5ECF0",
                          border: `1px solid ${clr.mid}20`,
                        }}
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

      {localFiltered.length > 0 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-[#6B0F2B]/10">
          <p className="text-xs text-[#9A7080]">
            {`Showing ${startIndex + 1}–${Math.min(startIndex + rows, localFiltered.length)} of ${localFiltered.length}`}
          </p>
          <Pagination
            totalPages={totalPages}
            currentPage={safePage}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  );
}