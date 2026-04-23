import { useState, useMemo } from "react";
import Sidebar from "../../components/Sidebar";
import Modal from "../../components/Modal";

/*
UNFINISHED NO MODAL, MARGIN ISSUESS
*/
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

type Status = "Under Review" | "Accepted" |"Waitlisted"| "Rejected";

interface Application {
  id: number;
  student: string;
  date: string;
  reviewed: string;
  status: Status;
  type?: string; 
}

function FilterTabs({ active, setActive }: any) {
  const tabs = ["Application","Waitlist"];
  return (
    <div className="bg-white p-1 rounded-xl inline-flex gap-1">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => setActive(tab)}
          className={`px-4 py-1.5 text-sm rounded-lg transition ${
            active === tab
              ? "bg-[#6B0F2B] text-white shadow"
              : "text-gray-500 hover:text-black"
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}

// sample data 
const applications: Application[] = [
  { id: 1,  student: "Molave Reyes",  date: "Mar 12, 2026",reviewed: "Mar 18, 2026" , status: "Accepted"},
  { id: 2,  student: "Malvar Reyes",   date: "Mar 14, 2026",reviewed: "Mar 18, 2026" , status: "Accepted"},
  { id: 3,  student: "Thirdy Sembrano",    date: "Mar 15, 2026",reviewed: "Mar 18, 2026" , status: "Accepted"},
  { id: 4,  student: "Dory Mano",    date: "Mar 16, 2026",reviewed: "Mar 18, 2026", status: "Under Review"},
  { id: 5,  student: "E Reyes",    date: "Mar 17, 2026",reviewed: "Mar 18, 2026",  status: "Under Review"},
  { id: 6,  student: "F Reyes",   date: "Mar 18, 2026",reviewed: "Mar 18, 2026", status: "Under Review"},
  { id: 7,  student: "G Reyes",    date: "Mar 19, 2026",reviewed: "Mar 19, 2026", status: "Under Review"},
  { id: 8,  student: "H Reyes",   date: "Mar 19, 2026",reviewed: "Mar 19, 2026", status: "Waitlisted"},
  { id: 9,  student: "I Reyes", date: "Mar 20, 2026",reviewed: "Mar 20, 2026",  status: "Rejected"},
  { id: 10, student: "J Reyes",  date: "Mar 20, 2026",reviewed: "Mar 20, 2026",  status: "Accepted"},
  { id: 11,  student: "E Reyes",    date: "Mar 17, 2026",reviewed: "Mar 18, 2026", status: "Under Review"},
  { id: 12,  student: "F Reyes",   date: "Mar 18, 2026",reviewed: "Mar 18, 2026" , status: "Under Review"},
];

function toTimestamp(date: string): number {
  return new Date(date).getTime();
}

const ITEMS_PER_PAGE = 6;
const STATUS_CONFIG: Record<Status, { color: string; bg: string; dot: string }> = {
  Accepted:   { color: "#1A7A4A", bg: "#dcfce7", dot: "#1A7A4A" },
  "Under Review":    { color: "#C9973A", bg: "#fef3c7", dot: "#C9973A" },
  Waitlisted: { color: "#7c3aed", bg: "#ede9fe", dot: "#7c3aed" },
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
        const past = new Date(targetDate);
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
          w-28 md:w-auto 
          px-2 py-1 md:px-3 md:py-2 
          pr-7 md:pr-8 
          text-[0.7rem] md:text-sm 
          font-semibold focus:outline-none focus:border-[#6B0F2B] cursor-pointer bg-white"
        style={{ color: CLR.mid }}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <span className="pointer-events-none absolute right-2 md:right-2.5 top-1/2 -translate-y-1/2 text-gray-400">
        <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </span>
    </div>
  </div>
);

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

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard" },
  { id: "applications", label: "Applications" },
  { id: "rooms", label: "Room Assignment" },
  { id: "waitlist", label: "Waitlisted"}
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

export default function Applications() {
  const [activeTab, setActiveTab] = useState("Application");
  const [search, setSearch] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activePage, setActivePage] = useState("applications");
  const [sortBy, setSortBy] = useState<"latest" | "earliest">("latest");
  const [currentPage, setCurrentPage] = useState(1); 
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);

  const total = applications.length;
  const counts = applications.reduce((acc, a) => {
    acc[a.status] = (acc[a.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    const res = applications.filter((a) =>
      a.student.toLowerCase().includes(q)
    );
    return res.sort((a, b) => {
      const diff = toTimestamp(a.date) - toTimestamp(b.date);
      return sortBy === "latest" ? -diff : diff;
    });
  }, [search, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * ITEMS_PER_PAGE;
  const paginated = filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const waitlistedApps = applications.filter(a => a.status === "Waitlisted");

  const handleSearch = (v: string) => { setSearch(v); setCurrentPage(1); };
  const handleSort = (v: string) => { setSortBy(v as "latest" | "earliest"); setCurrentPage(1); };

  const stats = [
    { label: "Under Review", color: "linear-gradient(135deg, #C9973A, #E8C37A)", text: "#C9973A", light_bg: "#FEF8EE", value: counts["Under Review"] || 0 },
    { label: "Accepted", color: "linear-gradient(135deg, #1A7A4A, #2D9A5F)", text: "#1A7A4A", light_bg: "#F0F7F3", value: counts.Accepted || 0 },
    { label: "Waitlisted", color: "linear-gradient(135deg, #6B3AB7, #9B6AE7)", text: "#6B3AB7", light_bg: "#F4F0FA", value: counts.Waitlisted || 0 },
    { label: "Rejected", color: "linear-gradient(135deg, #AA2661, #FDCAE0)", text: "#AE2F67", light_bg: "#FAF0F7", value: counts.Rejected || 0 },
  ];

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
    <div className="flex h-screen bg-[#F5EEF0]">
      <Sidebar role="landlordDashboard" />
      <DrawerNav open={drawerOpen} onClose={() => setDrawerOpen(false)} activePage={activePage} setActivePage={setActivePage} />

      <main className="flex-1 p-6 overflow-y-auto">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => setDrawerOpen(true)} className="lg:hidden p-1" aria-label="Open menu" style={{ color: CLR.mid }}>
            <IconMenu />
          </button>
          <div className="hidden lg:block w-1 h-6 rounded-full" style={{ background: CLR.mid }} />
          <h1 className="font-serif italic text-[28px] lg:text-[34px] font-semibold text-gray-900 tracking-tight">
            Applications
          </h1>
        </div>

        <div className="rounded-2xl p-6 mb-6 text-white" style={{ background: `linear-gradient(135deg, ${CLR.dark}, ${CLR.accent})` }}>
          <p className="text-xs uppercase tracking-widest opacity-70">Good Day, Dal Cadsawan</p>
          <h2 className="text-2xl font-bold mt-1">Check your applicants for Narra Residences</h2>
          <p className="text-sm opacity-70 mt-1">We make it easy for you to track the accommodation applications you manage.</p>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm mb-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((s) => {
              const pct = total ? Math.round((s.value / total) * 100) : 0;
              return (
                <div key={s.label}>
                  <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: s.text }}>{s.label}</p>
                  <div className="flex items-center gap-3">
                    <div className="relative flex items-center h-8 rounded-full overflow-hidden w-full max-w-[160px]" style={{ background: s.light_bg }}>
                      <div className="absolute left-0 top-0 h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, minWidth: "20px", background: s.color }} />
                      <span className="relative z-10 text-white text-[10px] font-bold px-3 whitespace-nowrap">{s.value} / {total}</span>
                    </div>
                    <span className="text-xs font-semibold text-gray-400">{pct}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mb-6">
          <FilterTabs active={activeTab} setActive={setActiveTab} />
        </div>

        {activeTab === "Application" ? (
          <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
            <div className="flex flex-wrap items-end gap-3 p-4 border-b">
              <div className="shrink-0">
                <h2 className="text-sm md:text-lg font-semibold tracking-tight text-black">Application History</h2>
                <p className="text-[0.7rem] md:text-xs text-gray-400">{filtered.length} total applications</p>
              </div>
              <div className="flex items-end gap-3 ml-auto min-w-0">
                <FilterSelect label="Sort By" value={sortBy} onChange={handleSort} options={[{ value: "latest", label: "Latest First" }, { value: "earliest", label: "Earliest First" }]} />
                <div className="flex flex-col gap-0.5 md:gap-1 min-w-0 w-full md:w-56">
                  <label className="text-[0.5rem] md:text-[10px] font-bold uppercase tracking-widest text-gray-400">Search</label>
                  <input type="text" placeholder="Search applicant..." value={search} onChange={(e) => handleSearch(e.target.value)} className="w-full border border-gray-200 rounded-lg md:rounded-xl px-2 py-1 md:px-3 md:py-2 text-[0.7rem] md:text-sm focus:outline-none focus:border-[#6B0F2B]" />
                </div>
              </div>
            </div>

            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm table-fixed">
                <colgroup>
                  <col style={{ width: "30%" }} /><col style={{ width: "22%" }} /><col style={{ width: "22%" }} /><col style={{ width: "16%" }} /><col style={{ width: "10%" }} />
                </colgroup>
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wide bg-gray-50" style={{ color: CLR.mid }}>
                    <th className="px-6 py-3">Student</th><th className="px-4 py-3">Date Applied</th><th className="px-4 py-3">Reviewed on</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.length === 0 ? (
                    <tr><td colSpan={5} className="text-center py-16 text-gray-400">No applications found.</td></tr>
                  ) : (
                    paginated.map((app) => (
                      <tr key={app.id} className="border-t hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm" style={{ background: CLR.avatars[app.id % CLR.avatars.length] }}>{app.student.charAt(0)}</div>
                            <span className="font-medium truncate">{app.student}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-600"><p>{app.date}</p><p className="text-[10px] text-gray-400"><DaysAgo targetDate={app.date} /></p></td>
                        <td className="px-4 py-3 text-gray-500">{app.reviewed}</td>
                        <td className="px-4 py-3"><StatusBadge status={app.status} /></td>
                        <td className="px-4 py-3 text-center"><button className="text-sm px-4 py-1.5 rounded-xl font-medium" style={{ color: CLR.mid, background: "#F5ECF0", border: `1px solid ${CLR.mid}20` }}>View</button></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="md:hidden">
                {paginated.map((app) => (
                    <div key={app.id} className="p-4 border-t flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold" style={{ background: CLR.avatars[app.id % CLR.avatars.length] }}>{app.student.charAt(0)}</div>
                            <div>
                                <p className="font-bold text-sm">{app.student}</p>
                                <p className="text-[10px] text-gray-400">{app.date}</p>
                            </div>
                        </div>
                        <StatusBadge status={app.status} />
                    </div>
                ))}
            </div>

            <div className="flex items-center justify-between px-4 py-3 border-t">
              <p className="text-xs text-gray-400">{filtered.length === 0 ? "No results" : `Showing ${startIndex + 1}–${Math.min(startIndex + ITEMS_PER_PAGE, filtered.length)} of ${filtered.length}`}</p>
              <div className="flex items-center gap-1.5">
                {getVisiblePages().map((page) => (
                  <PageBtn key={page} active={safePage === page} onClick={() => setCurrentPage(page)}>{page}</PageBtn>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold">Waitlist History</h2>
              <p className="text-xs text-gray-400">{waitlistedApps.length} total applicants</p>
               <FilterSelect label="Sort By" value={sortBy} onChange={handleSort} options={[{ value: "latest", label: "Latest First" }, { value: "earliest", label: "Earliest First" }]} />
                <div className="flex flex-col gap-0.5 md:gap-1 min-w-0 w-full md:w-56">
                  <label className="text-[0.5rem] md:text-[10px] font-bold uppercase tracking-widest text-gray-400">Search</label>
                  <input type="text" placeholder="Search applicant..." value={search} onChange={(e) => handleSearch(e.target.value)} className="w-full border border-gray-200 rounded-lg md:rounded-xl px-2 py-1 md:px-3 md:py-2 text-[0.7rem] md:text-sm focus:outline-none focus:border-[#6B0F2B]" />
                </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-xs uppercase">
                  <tr><th className="px-4 py-3 text-left">Student</th><th className="px-4 py-3 text-left">Applied</th><th className="px-4 py-3 text-left">Status</th><th className="px-4 py-3 text-center">Action</th></tr>
                </thead>
                <tbody>
                  {waitlistedApps.map((app) => (
                    <tr key={app.id} className="border-t">
                      <td className="px-4 py-3 font-medium">{app.student}</td>
                      <td className="px-4 py-3">{app.date}</td>
                      <td className="px-4 py-3"><StatusBadge status={app.status} /></td>
                      <td className="px-4 py-3 text-center"><button className="text-sm px-4 py-1.5 rounded-xl font-medium" style={{ color: CLR.mid, background: "#F5ECF0", border: `1px solid ${CLR.mid}20` }}>View</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}