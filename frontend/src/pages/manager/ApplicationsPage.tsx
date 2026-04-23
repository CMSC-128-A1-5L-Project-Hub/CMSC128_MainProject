import { useState, useMemo } from "react";

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

type Status = "Approved" | "Pending" | "Waitlisted" | "Cancelled" | "Rejected";

interface Application {
  id: number;
  student: string;
  date: string;
  time: string;
  facility: string;
  roomType: string;
  status: Status;
}

// sample data 
const applications: Application[] = [
  { id: 1,  student: "A Reyes",  date: "Mar 12, 2026", time: "1:00 PM",  facility: "Building 5", roomType: "Shared Room", status: "Approved"   },
  { id: 2,  student: "B Reyes",   date: "Mar 14, 2026", time: "11:15 AM", facility: "Building 1", roomType: "Shared Room", status: "Approved"   },
  { id: 3,  student: "C Reyes",    date: "Mar 15, 2026", time: "2:10 PM",  facility: "Building 6", roomType: "Double Room", status: "Approved"   },
  { id: 4,  student: "D Reyes",    date: "Mar 16, 2026", time: "9:00 AM",  facility: "Building 2", roomType: "Shared Room", status: "Pending"    },
  { id: 5,  student: "E Reyes",    date: "Mar 17, 2026", time: "1:46 PM",  facility: "Building 1", roomType: "Single Room", status: "Pending"    },
  { id: 6,  student: "F Reyes",   date: "Mar 18, 2026", time: "10:30 AM", facility: "Building 1", roomType: "Single Room", status: "Pending"    },
  { id: 7,  student: "G Reyes",    date: "Mar 19, 2026", time: "8:00 AM",  facility: "Building 3", roomType: "Double Room", status: "Waitlisted" },
  { id: 8,  student: "H Reyes",   date: "Mar 19, 2026", time: "9:30 AM",  facility: "Building 4", roomType: "Single Room", status: "Cancelled"  },
  { id: 9,  student: "I Reyes", date: "Mar 20, 2026", time: "10:00 AM", facility: "Building 2", roomType: "Shared Room", status: "Rejected"   },
  { id: 10, student: "J Reyes",  date: "Mar 20, 2026", time: "2:00 PM",  facility: "Building 5", roomType: "Double Room", status: "Approved"   },
  { id: 11,  student: "E Reyes",    date: "Mar 17, 2026", time: "1:46 PM",  facility: "Building 1", roomType: "Single Room", status: "Pending"    },
  { id: 12,  student: "F Reyes",   date: "Mar 18, 2026", time: "10:30 AM", facility: "Building 1", roomType: "Single Room", status: "Pending"    },
];

// date and time conversion for sorting 
function toTimestamp(date: string, time: string): number {
  return new Date(`${date} ${time}`).getTime();
}

const ITEMS_PER_PAGE = 6;
//STATUS COLORS 
const STATUS_CONFIG: Record<Status, { color: string; bg: string; dot: string }> = {
  Approved:   { color: "#1A7A4A", bg: "#dcfce7", dot: "#1A7A4A" },
  Pending:    { color: "#C9973A", bg: "#fef3c7", dot: "#C9973A" },
  Waitlisted: { color: "#7c3aed", bg: "#ede9fe", dot: "#7c3aed" },
  Cancelled:  { color: "#AA2661", bg: "#ffe4e6", dot: "#AA2661" },
  Rejected:   { color: "#9E2040", bg: "#ffe4e6", dot: "#9E2040" },
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
      className="inline-flex items-center gap-1.5 px-2 md:px-3 py-1 rounded-full text-[0.7rem] md:text-xs font-semibold"
      style={{ background: cfg.bg, color: cfg.color }}
    >
      <span className="w-1 md:w-1.5 h-1 md:h-1.5 rounded-full flex-shrink-0" style={{ background: cfg.dot }} />
      {status}
    </span>
  );
};

const DaysAgo = ({ targetDate }: { targetDate: string }) => {
    const daysDifference = useMemo(() => {
        const now = new Date();
        const past = new Date(targetDate); // Date() constructor accepts strings!
        
        now.setHours(0, 0, 0, 0);
        past.setHours(0, 0, 0, 0);

        const diffTime = Math.abs(now.getTime() - past.getTime());
        return Math.floor(diffTime / (1000 * 60 * 60 * 24));
    }, [targetDate]);

    return <span>{daysDifference} days ago</span>;
};

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
  <div className="flex flex-col gap-0.5 md:gap-1">
    <label className="text-[0.5rem] md:text-[10px] font-bold uppercase tracking-widest text-gray-400">
      {label}
    </label>
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
      <span className="pointer-events-none absolute right-2 md:right-2.5 top-1/2 -translate-y-1/2 text-gray-400">
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

//BUTTONS
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

// NAVIGATION
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

// SIDEBAR
const Sidebar = ({
  activePage,
  setActivePage,
}: {
  activePage: string;
  setActivePage: (id: string) => void;
}) => {
  const icons = [
    { id: "dashboard", label: "D" },
    { id: "applications", label: "A" },
    { id: "rooms", label: "R" },
    { id: "waitlist", label: "W" },
  ];
  return (
    <aside
      className="hidden lg:flex w-16 flex-col items-center py-4 gap-2"
      style={{ background: `linear-gradient(180deg, ${CLR.dark}, ${CLR.mid})` }}
    >
      <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold" style={{ background: CLR.gold }}>U</div>
      <div className="flex flex-col gap-2 mt-6">
        {icons.map((item) => (
          <button
            key={item.id}
            onClick={() => setActivePage(item.id)}
            className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold transition-colors ${
              activePage === item.id ? "bg-white/20 text-white" : "text-white/50 hover:text-white/80"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </aside>
  );
};


export default function ApplicationsPage() {
  const [search, setSearch] = useState("");                               // search input val
  const [drawerOpen, setDrawerOpen] = useState(false);                    //side bar mobile 
  const [activePage, setActivePage] = useState("applications");           //active page on sidebar 
  const [sortBy, setSortBy] = useState<"latest" | "earliest">("latest");  //sorting option
  const [currentPage, setCurrentPage] = useState(1);                      //current page num 
  //total application
  const total  = applications.length;
  //count per status 
  const counts = applications.reduce((acc, a) => {
    acc[a.status] = (acc[a.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  //FILTER AND SORT
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    //filter by name 
    const res = applications.filter((a) =>
      a.student.toLowerCase().includes(q) ||
      a.facility.toLowerCase().includes(q)
    );
    //sort by date 
    return res.sort((a, b) => {
      const diff = toTimestamp(a.date, a.time) - toTimestamp(b.date, b.time);
      return sortBy === "latest" ? -diff : diff;
    });
  }, [search, sortBy]);

  const totalPages  = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const safePage    = Math.min(currentPage, totalPages);
  const startIndex  = (safePage - 1) * ITEMS_PER_PAGE;
  const paginated   = filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleSearch = (v: string) => { setSearch(v);  setCurrentPage(1); };
  const handleSort   = (v: string) => { setSortBy(v as "latest" | "earliest"); setCurrentPage(1); };

  //stats data TOP CARDS 
  const stats = [
    { label: "Approved",   color: "linear-gradient(135deg, #1A7A4A, #2D9A5F)", text: "#1A7A4A", light_bg: "#F0F7F3" ,value: counts.Approved   || 0 },
    { label: "Pending",    color: "linear-gradient(135deg, #C9973A, #E8C37A)", text: "#C9973A", light_bg: "#FEF8EE" ,value: counts.Pending    || 0 },
    { label: "Waitlisted", color: "linear-gradient(135deg, #6B3AB7, #9B6AE7)", text: "#6B3AB7", light_bg: "#F4F0FA" ,value: counts.Waitlisted || 0 },
    { label: "Cancelled",  color: "linear-gradient(135deg, #AA2661, #FDCAE0)", text: "#AE2F67", light_bg: "#FAF0F7" ,value: counts.Cancelled  || 1 },
    { label: "Rejected",   color: "linear-gradient(135deg, #9E2040, #C84060)", text: "#9E2040", light_bg: "#FDF0F3" ,value: counts.Rejected   || 0 },
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
      <Sidebar activePage={activePage} setActivePage={setActivePage} />
      <DrawerNav open={drawerOpen} onClose={() => setDrawerOpen(false)} activePage={activePage} setActivePage={setActivePage} />

      <main className="flex-1 p-6">
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
          <p className="text-xs uppercase tracking-widest opacity-70">Good Day, Ana Reyes</p>
          <h2 className="text-2xl font-bold mt-1">Check your applicants</h2>
          <p className="text-sm opacity-70 mt-1">We make it easy for you to track the accommodation applications you manage.</p>
        </div>

        {/* Stats */}
        <div className="bg-white rounded-2xl p-5 shadow-sm mb-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {stats.map((s) => {
              const pct = total ? Math.round((s.value / total) * 100) : 0;
              return (
                <div key={s.label}>
                  <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: s.text }}>
                    {s.label}
                  </p>
                  {/* progress bar and %  */}
                  <div className="flex items-center gap-3">
                        <div className="relative flex items-center h-8 rounded-full overflow-hidden w-80" style={{ background: s.light_bg }}>                      <div
                        className="absolute left-0 top-0 h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%`, minWidth: "55px", background: s.color, transition: "width 0.4s ease" }}
                      />
                      <span className="relative z-10 text-white text-xs font-bold px-3 whitespace-nowrap">
                        {s.value} / {total}
                      </span>
                    </div>
                    {/* n% text */}
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
            <p className="text-[0.7rem] md:text-xs text-gray-400">{filtered.length} total applications</p>
          </div>

          {/* Right controls — takes remaining space, search absorbs all shrinking */}
          <div className="flex items-end gap-3 ml-auto min-w-0">
            
            {/* Sort — fixed, never shrinks */}
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
            <div className="flex flex-col gap-0.5 md:gap-1 min-w-0 w-full md:w-56">
              <label className="text-[0.5rem] md:text-[10px] font-bold uppercase tracking-widest text-gray-400 shrink-0">
                Search
              </label>
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

          {/* Table: Desktop View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm table-fixed">
              <colgroup>
                <col style={{ width: "22%" }} />
                <col style={{ width: "18%" }} />
                <col style={{ width: "18%" }} />
                <col style={{ width: "20%" }} />
                <col style={{ width: "15%" }} />
                <col style={{ width: "15%" }} />
              </colgroup>
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide bg-gray-50" style={{ color: CLR.mid }}>
                  <th className="px-6 py-3">Student</th>
                  <th className="px-4 py-3">Date Applied</th>
                  <th className="px-1 py-3">Time Submitted</th>
                  <th className="px-1 py-3">Preferred Facility</th>
                  <th className="px-8 py-3">Status</th>
                  <th className="px-4 py-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody style={{ minHeight: `${ITEMS_PER_PAGE * 65}px` }}>
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-16 text-gray-400 text-sm">
                      No applications found.
                    </td>
                  </tr>
                ) : (
                  paginated.map((app) => {
                    const initial     = app.student.charAt(0).toUpperCase();
                    const avatarColor = CLR.avatars[app.id % CLR.avatars.length];
                    return (
                      <tr key={`${app.id}-${startIndex}`} className="border-t hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div
                              aria-hidden="true"
                              className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                              style={{ background: avatarColor }}
                            >
                              {initial}
                            </div>
                            <span className="font-medium truncate">{app.student}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                          <p>{app.date}</p>
                          <p>{DaysAgo({ targetDate: app.date })}</p>
                        </td>
                        <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{app.time}</td>
                        <td className="px-4 py-3">
                          <p className="font-medium">{app.facility}</p>
                          <p className="text-xs text-gray-400">{app.roomType}</p>
                        </td>
                        <td className="px-4 py-3"><StatusBadge status={app.status} /></td>
                        <td className="px-4 py-3 text-center">
                          <button
                            className="text-sm px-4 py-1.5 rounded-xl font-medium transition-colors"
                            style={{
                              color: CLR.mid,
                              background: "#F5ECF0",
                              border: `1px solid ${CLR.mid}20`
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

          {/* Table: Phone */}
          <div className="md:hidden overflow-x-auto">
            <table className="w-full text-sm table-fixed">
              <colgroup>
                <col style={{ width: "15%" }} />
                <col style={{ width: "20%" }} />
                <col style={{ width: "20%" }} />
                <col style={{ width: "20%" }} />
                <col style={{ width: "15%" }} />
              </colgroup>
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide bg-gray-50" style={{ color: CLR.mid }}>
                  <th className="px-2 py-3 text-center justify-center">Student</th>
                  <th className="px-4 py-3 text-center justify-center">Date Applied</th>
                  <th className="px-1 py-3 text-center justify-center">Preferred Facility</th>
                  <th className="px-0 py-3 text-center justify-center">Status</th>
                  <th className="px-2 py-3 text-center justify-center">Action</th>
                </tr>
              </thead>
              <tbody style={{ minHeight: `${ITEMS_PER_PAGE * 65}px` }}>
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-16 text-gray-400 text-sm">
                      No applications found.
                    </td>
                  </tr>
                ) : (
                  paginated.map((app) => {
                    const initial     = app.student.charAt(0).toUpperCase();
                    const avatarColor = CLR.avatars[app.id % CLR.avatars.length];
                    return (
                      <tr key={`${app.id}-${startIndex}`} className="border-t hover:bg-gray-50 transition-colors">
                        {/* Student */}
                        <td className="px-4 py-3">
                          <div className="flex flex-col items-center justify-center gap-3 leading-tight">
                            <div
                              aria-hidden="true"
                              className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                              style={{ background: avatarColor }}
                            >
                              {initial}
                            </div>
                            <span className="font-medium truncate">{app.student}</span>
                          </div>
                        </td>

                        {/* Date Applied */}
                        <td className="px-0 py-3 text-gray-600 text-[0.7rem] whitespace-nowrap leading-tight">
                          <p className="flex justify-center">{app.date}</p>
                          <p className="flex justify-center">{DaysAgo({ targetDate: app.date })}</p>
                        </td>

                        {/* Preferred Facility */}
                        <td className="px-4 py-3">
                          <p className="font-medium text-[0.7rem]">{app.facility}</p>
                          <p className="text-[0.65rem] text-gray-400 leading-tight">{app.roomType}</p>
                        </td>

                        {/* Status */}
                        <td className="px-0 py-3 text-center"><StatusBadge status={app.status} /></td>

                        {/* Action */}
                        <td className="px-2 py-3 text-center">
                          <button
                            className="text-xs px-2 py-1.5 rounded-xl font-medium transition-colors"
                            style={{
                              color: CLR.mid,
                              background: "#F5ECF0",
                              border: `1px solid ${CLR.mid}20`
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

          {/* page footer */}
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <p className="text-xs text-gray-400">
              {filtered.length === 0
                ? "No results"
                : `Showing ${startIndex + 1}–${Math.min(startIndex + ITEMS_PER_PAGE, filtered.length)} of ${filtered.length}`}
            </p>

            <div className="flex items-center gap-1.5">
                {getVisiblePages().map((page) => (
                  <PageBtn
                    key={page}
                    active={safePage === page}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </PageBtn>
                ))}     
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}