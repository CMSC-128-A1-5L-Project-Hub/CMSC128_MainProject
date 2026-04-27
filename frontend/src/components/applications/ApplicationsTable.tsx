import React from "react";
import { DateTime } from 'luxon';

const ITEMS_PER_PAGE = 6;

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
  const cfg = statusConfig[status];

  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[0.7rem] font-semibold whitespace-nowrap"
      style={{ background: cfg.bg, color: cfg.color }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
        style={{ background: cfg.dot }}
      />
      {status.charAt(0).toUpperCase() + status.slice(1)}
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
}: {
  value: "latest" | "earliest";
  onChange: (v: string) => void;
  compact?: boolean;
  onToggle?: () => void;
}) => {
  const [sortOpen, setSortOpen] = React.useState(false);
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
        className="flex items-center gap-2 border border-[#E8D5DC] rounded-xl px-3 py-2 text-sm bg-white hover:bg-[#F5ECF0] transition w-fit"
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

// ======================== PAGE BUTTON ========================
const PageBtn = ({
  active,
  disabled,
  onClick,
  children,
  clr,
}: {
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
  clr: any;
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-semibold transition-all"
    style={
      active
        ? {
            background: `linear-gradient(135deg,${clr.dark}, ${clr.mid})`,
            color: "#fff",
            boxShadow: "0 4px 12px rgba(107,15,43,0.35)",
          }
        : disabled
        ? {
            background: "#fff",
            border: "1.5px solid #ede8ea",
            color: "#d8cdd1",
            cursor: "not-allowed",
          }
        : {
            background: "#fff",
            border: "1.5px solid #ede8ea",
            color: clr.mid,
          }
    }
  >
    {children}
  </button>
);


// ======================== MAIN COMPONENT ========================
export default function ApplicationsTable({

  filtered,
  currentPage,
  setCurrentPage,
  sortBy,
  onSortChange,
  search,
  onSearchChange,
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
  sortBy: "latest" | "earliest";
  onSortChange: (value: string) => void;
  search: string;
  onSearchChange: (value: string) => void;
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
  clr: any;
  statusConfig: Record<string, { color: string; bg: string; dot: string }>;
  getAppStatus: (app: any) => any;
  onView: (app: any) => void;
}) {

const [mode, setMode] = React.useState<"both" | "search" | "sort">("both");
const searchInputRef = React.useRef<HTMLInputElement>(null);

const handleOpenSearch = () => {
  setMode("search");
  setTimeout(() => searchInputRef.current?.focus(), 50);
};

const handleCloseSearch = () => {
  setMode("both");
  onSearchChange("");
};

  // for pages 
  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * ITEMS_PER_PAGE;
  const paginated = filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  //pages to show 
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
    <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
    {/* HEADER */}
      <div className="flex items-center justify-between gap-4 p-4 border-b">
        <div className="shrink-0">
          <h2 className="text-sm md:text-lg font-semibold tracking-tight text-black">
            Application History
          </h2>
          <p className="text-xs text-gray-400">{filtered.length} total applications</p>
        </div>

       <div className="flex items-center gap-2 ml-auto">
        {/* SORT BY */}
        <FilterSelect
          value={sortBy}
          onChange={(v) => {
            onSortChange(v);
            setMode("both"); //minimizes search after choosing sort
          }}
          compact={mode === "search"}
          onToggle={() => {
            setMode("both"); //minimizes search when sort is clicked
          }}
        />
      {/* SEARCH ICON */}
      {mode !== "search" && (
        <button
          onClick={handleOpenSearch}
          className="flex items-center gap-2 border border-[#E8D5DC] rounded-xl px-3 py-2 text-sm bg-white hover:bg-[#F5ECF0] transition sm:hidden"
          aria-label="Open search"
        >
          <svg className="w-4 h-4 text-[#9A7080]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m1.6-5.4a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
      )}

      {/* SEARCH INPUT */}
      <div className={`relative ${mode === "search" ? "flex" : "hidden"} sm:flex w-full sm:w-[120px]`}>
        <svg
          className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A36F82]"
          fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m1.6-5.4a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          ref={searchInputRef}
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full min-w-0 h-10 border border-[#E8D5DC] rounded-xl pl-8 pr-7 text-sm bg-white text-[#3D0718] placeholder:text-[#C7A7B3] focus:outline-none focus:bg-[#F5ECF0] transition-all duration-200"
        />
        {/* Close - mobile view  */}
        <button
          onClick={handleCloseSearch}
          className="absolute right-2 top-1/2 -translate-y-1/2 sm:hidden text-[#9A7080] hover:text-[#6B0F2B]"
          aria-label="Close search"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

        </div>
      </div>

      <div className="w-full overflow-x-auto pb-2">
      
        <table className="min-w-[760px] w-full text-sm">
          <thead>
            <tr
              className="text-left text-xs uppercase tracking-wide bg-gray-50"
              style={{ color: clr.mid }}
            >
              <th className="px-4 py-3 whitespace-nowrap">Student</th>             
              <th className="px-4 py-3">Date Applied</th>
              <th className="px-6 py-3">Time</th>
              <th className="px-4 py-3 ">Facility</th>
              <th className="px-8 py-3 whitespace-nowrap">Status</th>
              <th className="px-4 py-3 text-center">Action</th>
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
                <td colSpan={6} className="text-center py-16 text-red-500 text-sm">
                  <p>Failed to load applications.</p>
                  <button onClick={() => refetch()} className="mt-2 underline text-xs">
                    Try again
                  </button>
                </td>
              </tr>
            ) : (
              paginated.map((app) => {
                const initial = app.student.user.fname.charAt(0).toUpperCase();
                const avatarColor = clr.avatars[app.id % clr.avatars.length];

                return (
                  <tr
                    key={`${app.id}-${startIndex}`}
                    className="border-t hover:bg-gray-50 transition-colors"
                  >
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
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                      <p>{formatDate(app.applicationDate)}</p>
                      <p className="text-xs text-gray-400">
                        {getDaysAgo(app.applicationDate)} days ago
                      </p>
                    </td>

                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                      {formatTime(app.applicationDate)}
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      <p className="font-medium">{app.accommodation.accommodationName}</p>
                      <p className="text-xs text-gray-400">{app.applicationRoomType}</p>
                    </td>

                    <td className="px-4 py-3">
                      <StatusBadge
                        status={getAppStatus(app)}
                        statusConfig={statusConfig}
                      />
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

      <div className="flex items-center justify-between px-4 py-3 border-t">
        <p className="text-xs text-gray-400">
          {filtered.length === 0
            ? "No results"
            : `Showing ${startIndex + 1}–${Math.min(
                startIndex + ITEMS_PER_PAGE,
                filtered.length
              )} of ${filtered.length}`}
        </p>
        <div className="flex items-center gap-1.5">
          {getVisiblePages().map((page) => (
            <PageBtn
              key={page}
              active={safePage === page}
              onClick={() => setCurrentPage(page)}
              clr={clr}
            >
              {page}
            </PageBtn>
          ))}
        </div>
      </div>
    </div>
  );
}