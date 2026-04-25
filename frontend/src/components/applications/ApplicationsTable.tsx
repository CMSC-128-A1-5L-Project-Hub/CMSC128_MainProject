import React from "react";

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
  const date = new Date(dateString);

  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  }).format(date);
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

//======================== DROPDOWN FULTER ========================
const FilterSelect = ({
  label,
  value,
  onChange,
  options,
  clr,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  clr: any;
}) => (
  <div className="flex flex-col gap-1">
    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
      {label}
    </label>
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="
          appearance-none border border-gray-200 rounded-lg md:rounded-xl 
          w-28 md:w-auto 
          px-2 py-1 md:px-3 md:py-2 
          pr-7 md:pr-8 
          text-[0.7rem] md:text-sm 
          font-semibold focus:outline-none focus:border-[#6B0F2B] cursor-pointer bg-white
        "
        style={{ color: clr.mid }}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>

      <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400">
        <svg
          width="12"
          height="12"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </span>
    </div>
  </div>
);

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
      <div className="flex items-end gap-3 p-4 border-b">
        <div className="shrink-0">
          <h2 className="text-sm md:text-lg font-semibold tracking-tight text-black">
            Application History
          </h2>
          <p className="text-xs text-gray-400">{filtered.length} total applications</p>
        </div>

        <div className="flex items-end gap-3 ml-auto min-w-0 flex-wrap">
          <div className="shrink-0">
            <FilterSelect
              label="Sort By"
              value={sortBy}
              onChange={onSortChange}
              options={[
                { value: "latest", label: "Latest First" },
                { value: "earliest", label: "Earliest First" },
              ]}
              clr={clr}
            />
          </div>

          <div className="flex flex-col gap-1 min-w-0 w-40 sm:w-56">
            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
              Search
            </label>
            <input
              type="text"
              placeholder="Search applicant..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
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
            <tr
              className="text-left text-xs uppercase tracking-wide bg-gray-50"
              style={{ color: clr.mid }}
            >
              <th className="px-4 py-3">Student</th>
              <th className="px-4 py-3 hidden sm:table-cell">Date Applied</th>
              <th className="px-4 py-3 hidden lg:table-cell">Time</th>
              <th className="px-4 py-3 hidden sm:table-cell">Facility</th>
              <th className="px-4 py-3">Status</th>
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
                          <p className="text-xs text-gray-400 sm:hidden">
                            {formatDate(app.applicationDate)}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap hidden sm:table-cell">
                      <p>{formatDate(app.applicationDate)}</p>
                      <p className="text-xs text-gray-400">
                        {getDaysAgo(app.applicationDate)} days ago
                      </p>
                    </td>

                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap hidden lg:table-cell">
                      {formatTime(app.applicationDate)}
                    </td>

                    <td className="px-4 py-3 hidden sm:table-cell">
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