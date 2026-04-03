import { useState } from "react";
import { IoIosNotificationsOutline } from "react-icons/io";
import {
  FiSearch,
  FiUser,
  FiFileText,
  FiChevronRight,
  FiMoreHorizontal,
  FiChevronDown,
  FiX,
} from "react-icons/fi";
import { MdOutlineDashboard } from "react-icons/md";
import { HiOutlineDocument } from "react-icons/hi";
import { BsHouseDoor } from "react-icons/bs";
import { GrFormNext } from "react-icons/gr";
import { RiMenuLine } from "react-icons/ri";
import house_icon from  "../../assets/icons/house_icon.svg";

// ── Types ──────────────────────────────────────────────────────────────────
type StatusType = "Approved" | "Pending" | "In Review";

interface Application {
  id: number;
  dorm: string;
  type: string;
  applied: string;
  location: string;
  status: StatusType;
}

interface BillingStatement {
  label: string;
  status: "Paid" | "Unpaid";
}

interface RecommendedDorm {
  id: number;
  name: string;
  tag: string;
  tagColor: string;
  size: string;
  location: string;
  price: number;
  rating: number;
  review: string;
  img: string;
}

// ── Mock Data ──────────────────────────────────────────────────────────────
const applications: Application[] = [
  { id: 1, dorm: "Kamia Residence", type: "Non-transient", applied: "Mar 12, 2026", location: "On-campus", status: "Approved" },
  { id: 2, dorm: "Molave Residence", type: "Non-transient", applied: "Mar 12, 2026", location: "Off-campus", status: "Pending" },
  { id: 3, dorm: "Narra Residence", type: "Non-transient", applied: "Mar 12, 2026", location: "Near Gate 1", status: "In Review" },
];

const recommended: RecommendedDorm[] = [
  {
    id: 1,
    name: "Kamia Residence",
    tag: "Transient",
    tagColor: "bg-amber-100 text-amber-700",
    size: "22 m²",
    location: "On-campus",
    price: 3200,
    rating: 4,
    review: "Rooms are clean and the dormitory manager is easy to talk to. I would recommend for anyone finding an affordable and safe dormitory in UPLB.",
    img: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=400&q=80",
  },
  {
    id: 2,
    name: "Narra Residence",
    tag: "Dormitory",
    tagColor: "bg-emerald-100 text-emerald-700",
    size: "30 m²",
    location: "Off-campus",
    price: 8500,
    rating: 4,
    review: "The layout of the room is nice. There are so many amenities which caters to my needs as a student. It is also a close walk to the campus.",
    img: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&q=80",
  },
];

const billingStatements: BillingStatement[] = [
  { label: "March Billing Statement", status: "Paid" },
  { label: "February Billing Statement", status: "Paid" },
  { label: "January Billing Statement", status: "Unpaid" },
];

// ── Helpers ────────────────────────────────────────────────────────────────
const StatusBadge = ({ status }: { status: StatusType }) => {
  const styles: Record<StatusType, string> = {
    Approved: "bg-green-100 text-green-700 border border-green-200",
    Pending: "bg-amber-100 text-amber-700 border border-amber-200",
    "In Review": "bg-sky-100 text-sky-700 border border-sky-200",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${styles[status]}`}>
      {status}
    </span>
  );
};

const StarRating = ({ rating }: { rating: number }) => (
  <div className="flex gap-0.5">
    {Array.from({ length: 5 }).map((_, i) => (
      <svg key={i} className={`w-3 h-3 ${i < rating ? "text-amber-400" : "text-gray-200"}`} fill="currentColor" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ))}
  </div>
);

// ── Drawer Nav (Mobile) ────────────────────────────────────────────────────
const DrawerNav = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const [activeItem, setActiveItem] = useState("dashboard");

  const navItems = [
    { id: "dashboard", icon: <MdOutlineDashboard size={20} />, label: "Dashboard" },
    { id: "browse", icon: <FiSearch size={18} />, label: "Browse Rooms" },
    { id: "applications", icon: <FiUser size={18} />, label: "Application Status" },
    { id: "billing", icon: <FiFileText size={18} />, label: "Billing Statements" },
  ];

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Drawer panel */}
      <div
        className={`fixed top-0 left-0 bottom-0 z-50 w-72 bg-[#3D0A1A] flex flex-col transition-transform duration-300 ease-in-out lg:hidden ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Top: logo + close */}
        <div className="flex items-center justify-between px-5 pt-6 pb-4">
          <div className="w-10 h-10 bg-[#C9973A] rounded-xl flex items-center justify-center">
            <img
              src="/src/assets/logos/uble-placeholder.svg"
              alt="UBLE"
              className="w-6 h-6"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
                (e.target as HTMLImageElement).parentElement!.innerHTML =
                  '<span class="text-white font-bold text-base">U</span>';
              }}
            />
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-white/60 hover:text-white transition-colors"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Profile info */}
        <div className="px-5 pb-6 border-b border-white/10">
          <div className="flex items-center gap-3 mb-4">
            <div className="relative flex-shrink-0">
              <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center">
                <FiUser size={24} className="text-white/60" />
              </div>
              <div className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-green-400 border-2 border-[#3D0A1A]" />
            </div>
            <div>
              <p className="text-white font-bold text-base leading-tight">Ana Marie Reyes</p>
              <p className="text-[#E8C37A] text-xs font-semibold mt-0.5">BS BIOLOGY · UPLB</p>
              <p className="text-white/50 text-xs">areyes@up.edu.ph</p>
              <p className="text-white/50 text-xs">+63 912 345 6789</p>
            </div>
          </div>

          {/* Student details */}
          <div className="grid grid-cols-3 gap-x-3 gap-y-1">
            {[
              { label: "Student No.", value: "2023-12345" },
              { label: "College", value: "CAS" },
              { label: "Year Level", value: "2nd Year" },
            ].map((item) => (
              <div key={item.label}>
                <p className="text-white/40 text-[9px] font-bold uppercase tracking-wide">{item.label}</p>
                <p className="text-white text-xs font-bold">{item.value}</p>
              </div>
            ))}
            <div>
              <p className="text-white/40 text-[9px] font-bold uppercase tracking-wide">Status</p>
              <p className="text-green-400 text-xs font-bold">Active</p>
            </div>
          </div>
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => { setActiveItem(item.id); onClose(); }}
              className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-2xl text-sm font-semibold transition-all text-left ${
                activeItem === item.id
                  ? "bg-white/15 text-white"
                  : "text-white/60 hover:bg-white/10 hover:text-white"
              }`}
            >
              <span className={`flex-shrink-0 ${activeItem === item.id ? "text-white" : "text-white/50"}`}>
                {item.icon}
              </span>
              {item.label}
            </button>
          ))}
        </nav>
      </div>
    </>
  );
};

// ── Desktop Sidebar ────────────────────────────────────────────────────────
const DesktopSidebar = () => {
  const [active, setActive] = useState("dashboard");
  const navItems = [
    { id: "dashboard", icon: <MdOutlineDashboard size={20} /> },
    { id: "search", icon: <FiSearch size={18} /> },
    { id: "profile", icon: <FiUser size={18} /> },
    { id: "documents", icon: <HiOutlineDocument size={18} /> },
  ];
  const bottomItems = [
    { id: "account", icon: <FiUser size={18} /> },
    { id: "files", icon: <FiFileText size={18} /> },
  ];
  return (
    <aside className="hidden lg:flex w-16 bg-[#7D1128] flex-col items-center py-4 gap-2 flex-shrink-0">
      <div className="w-9 h-9 bg-[#C9973A] rounded-lg flex items-center justify-center mb-4 flex-shrink-0">
        <img
          src="/src/assets/logos/uble-placeholder.svg"
          alt="UBLE"
          className="w-5 h-5"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
            (e.target as HTMLImageElement).parentElement!.innerHTML =
              '<span class="text-white font-bold text-sm">U</span>';
          }}
        />
      </div>
      <nav className="flex flex-col items-center gap-1 flex-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActive(item.id)}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
              active === item.id ? "bg-white/20 text-white" : "text-white/50 hover:text-white hover:bg-white/10"
            }`}
          >
            {item.icon}
          </button>
        ))}
      </nav>
      <div className="flex flex-col items-center gap-1 mt-auto">
        {bottomItems.map((item) => (
          <button key={item.id} className="w-10 h-10 rounded-xl flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all">
            {item.icon}
          </button>
        ))}
      </div>
    </aside>
  );
};

// ── Billing Section (shared between desktop panel + mobile inline) ─────────
const BillingSection = () => (
  <div className="space-y-4">
    {/* Header */}
    <div className="flex items-start justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
          <HiOutlineDocument size={18} className="text-[#7D1128]" />
        </div>
        <div>
          <p className="font-bold text-gray-900 text-sm leading-tight">Billing &amp; Payments</p>
          <p className="text-gray-400 text-xs">Kamia Residence Hall</p>
        </div>
      </div>
      <div className="text-center bg-[#7D1128] text-white rounded-lg px-2.5 py-1.5 flex-shrink-0">
        <p className="text-lg font-bold leading-none">20</p>
        <p className="text-[10px] leading-none mt-0.5 opacity-80">Mar</p>
      </div>
    </div>

    {/* Rent paid */}
    <div className="bg-gray-50 rounded-2xl p-4">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <p className="font-bold text-gray-900 text-sm">Rent Paid</p>
            <p className="text-gray-400 text-xs">Paid on March 1, 2026 · ₱3,200.00</p>
            <span className="inline-block mt-1 text-xs bg-[#7D1128]/10 text-[#7D1128] font-semibold px-2.5 py-0.5 rounded-full">
              Next due: June 1, 2026
            </span>
          </div>
        </div>
        <p className="font-bold text-gray-900 text-sm whitespace-nowrap">
          ₱3,200 <span className="text-gray-400 font-normal text-xs">/ month</span>
        </p>
      </div>
    </div>

    {/* Payment progress */}
    <div>
      <p className="text-[10px] font-bold tracking-widest uppercase text-gray-400 mb-2">Payment Progress</p>
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-[#7D1128] to-[#C9973A] rounded-full w-full" />
      </div>
      <div className="flex justify-between mt-1.5">
        <span className="text-xs text-gray-500">₱0 remaining</span>
        <span className="text-xs text-gray-500">₱3,200 / ₱3,200 paid</span>
      </div>
    </div>

    {/* Billing history */}
    <div>
      <p className="text-[10px] font-bold tracking-widest uppercase text-gray-400 mb-3">Billing History</p>
      <div className="space-y-2.5">
        {billingStatements.map((b) => (
          <div key={b.label} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100 hover:border-gray-200 transition-colors cursor-pointer">
            <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
              <BsHouseDoor size={14} className="text-[#7D1128]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800 truncate">{b.label}</p>
              <p className={`text-xs font-medium ${b.status === "Paid" ? "text-green-500" : "text-red-500"}`}>{b.status}</p>
            </div>
          </div>
        ))}
      </div>
      <button className="w-full mt-4 text-[#7D1128] text-sm font-semibold hover:underline flex items-center justify-center gap-1">
        View all billing statements <FiChevronRight size={14} />
      </button>
    </div>
  </div>
);

// ── Desktop Right Panel ────────────────────────────────────────────────────
const DesktopProfilePanel = () => (
  <aside className="hidden lg:flex w-80 xl:w-[320px] bg-[#7D1128] flex-shrink-0 flex-col overflow-y-auto">
    {/* Profile header */}
    <div className="px-6 pt-6 pb-5 flex-shrink-0">
      <div className="flex items-center justify-between mb-5">
        <span className="text-[10px] font-bold tracking-widest uppercase text-white/60">My Profile</span>
        <button className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors relative">
          <IoIosNotificationsOutline size={18} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-[#C9973A] rounded-full" />
        </button>
      </div>
      <div className="flex items-center gap-4">
        <div className="relative flex-shrink-0">
          <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center">
            <FiUser size={26} className="text-white/60" />
          </div>
          <div className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-green-400 border-2 border-[#7D1128]" />
        </div>
        <div>
          <p className="text-white font-bold text-base leading-tight">Ana Marie Reyes</p>
          <p className="text-[#E8C37A] text-xs font-semibold mt-0.5">BS BIOLOGY · UPLB</p>
          <p className="text-white/50 text-xs">areyes@up.edu.ph</p>
          <p className="text-white/50 text-xs">+63 912 345 6789</p>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-2 mt-5 bg-white/10 rounded-xl p-3">
        {[
          { label: "Student No.", value: "2023-12345" },
          { label: "College", value: "CAS" },
          { label: "Year Level", value: "2nd Year" },
          { label: "Status", value: "Active", highlight: true },
        ].map((item) => (
          <div key={item.label} className="text-center">
            <p className="text-white/40 text-[9px] font-bold uppercase tracking-wide leading-tight mb-1">{item.label}</p>
            <p className={`text-xs font-bold leading-tight ${item.highlight ? "text-green-400" : "text-white"}`}>{item.value}</p>
          </div>
        ))}
      </div>
    </div>

    {/* Billing */}
    <div className="flex-1 bg-white rounded-t-3xl px-6 pt-6 pb-8 overflow-y-auto">
      <BillingSection />
    </div>
  </aside>
);

// ── Main Dashboard ─────────────────────────────────────────────────────────
export default function Dashboard() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState("All");
  const filters = ["All", "On-Campus", "Off-Campus", "UPLB Partner"];

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      {/* Desktop Sidebar */}
      <DesktopSidebar />

      {/* Mobile Drawer Nav */}
      <DrawerNav open={drawerOpen} onClose={() => setDrawerOpen(false)} />

      {/* ── Main content ── */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* ── Top Bar ── */}
        <header className="flex items-center justify-between px-4 sm:px-6 lg:px-8 pt-5 pb-3 lg:pt-7 lg:pb-2 sticky top-0 z-30 bg-gray-50">
          {/* Mobile: hamburger | Desktop: decorative bar + title */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setDrawerOpen(true)}
              className="lg:hidden flex flex-col gap-1.5 p-1"
              aria-label="Open menu"
            >
              <RiMenuLine size={22} className="text-[#7D1128]" />
            </button>
            <div className="hidden lg:flex items-center gap-2">
              <div className="w-1 h-6 bg-[#7D1128] rounded-full" />
            </div>
            <h1 className="font-serif italic text-2xl lg:text-3xl font-bold text-gray-900">Dashboard</h1>
          </div>

          {/* Notification bell: visible on both */}
          <button className="w-9 h-9 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors relative shadow-sm">
            <IoIosNotificationsOutline size={20} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#C9973A] rounded-full" />
          </button>
        </header>

        {/* ── Scrollable page content ── */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-5 space-y-4 lg:space-y-5">

          {/* Hero Banner */}
          <div className="relative rounded-2xl overflow-hidden bg-[#7D1128] flex items-center min-h-[140px] sm:min-h-[176px]">
            <div className="relative z-10 px-5 sm:px-8 py-6">
              <p className="text-[#E8C37A] text-[10px] sm:text-xs font-bold tracking-widest uppercase mb-1">
                Good Day, Ana Reyes
              </p>
              <h2 className="text-white font-bold text-lg sm:text-2xl leading-snug mb-1.5 max-w-xs sm:max-w-sm">
                Check your applications &amp; explore new accommodations.
              </h2>
              <p className="text-white/60 text-xs sm:text-sm">
                You have 2 pending applications and 3 new notifications today.
              </p>
            </div>
            <div className="absolute right-0 bottom-0 h-full flex items-end pointer-events-none">
                <img src={house_icon} alt="decor" className="w-[130px] h-[130px]" />
            </div>
          </div>

          {/* My Applications */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between px-4 sm:px-6 pt-5 pb-3">
              <h3 className="font-semibold text-gray-900 text-base">My Applications</h3>
              <button className="text-[#7D1128] text-sm font-semibold hover:underline flex items-center gap-1">
                View all <FiChevronRight size={14} />
              </button>
            </div>

            {/* Table — scrolls horizontally on mobile */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[540px]">
                <thead>
                  <tr className="border-t border-gray-100">
                    {["DORM", "TYPE", "APPLIED", "LOCATION", "STATUS", "ACTION"].map((h) => (
                      <th key={h} className="px-4 sm:px-6 py-2.5 text-left text-[10px] font-bold tracking-widest text-gray-400 uppercase whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {applications.map((app) => (
                    <tr key={app.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 sm:px-6 py-3 sm:py-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#7D1128] flex-shrink-0" />
                          <span className="font-medium text-gray-800 whitespace-nowrap">{app.dorm}</span>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 text-gray-500 whitespace-nowrap">{app.type}</td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 text-gray-500 whitespace-nowrap">{app.applied}</td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 text-gray-500 whitespace-nowrap">{app.location}</td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4"><StatusBadge status={app.status} /></td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4">
                        <button className="text-gray-400 hover:text-gray-600 transition-colors">
                          <FiMoreHorizontal size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recommended + Map — side by side on mobile too (matches screenshot) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">

            {/* Recommended */}
            <div className="sm:col-span-1 lg:col-span-3 bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 text-base">Recommended</h3>
                <button className="text-[#7D1128] text-sm font-semibold hover:underline flex items-center gap-1">
                  View all <FiChevronRight size={14} />
                </button>
              </div>
              <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory -mx-1 px-1">
                {recommended.map((dorm) => (
                  <div
                    key={dorm.id}
                    className="min-w-[180px] sm:min-w-[200px] max-w-[220px] flex-shrink-0 rounded-2xl border border-gray-100 overflow-hidden shadow-sm snap-start"
                  >
                    <div className="relative h-28 sm:h-32 overflow-hidden">
                      <img src={dorm.img} alt={dorm.name} className="w-full h-full object-cover" />
                      <span className={`absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full ${dorm.tagColor}`}>
                        {dorm.tag}
                      </span>
                    </div>
                    <div className="p-3">
                      <p className="font-bold text-gray-900 text-sm mb-0.5">{dorm.name}</p>
                      <p className="text-gray-400 text-xs mb-1.5">Studio · {dorm.size} · {dorm.location}</p>
                      <p className="font-bold text-[#C9973A] text-sm mb-1.5">
                        ₱{dorm.price.toLocaleString()}
                        <span className="text-gray-400 font-normal text-xs"> / month</span>
                      </p>
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <StarRating rating={dorm.rating} />
                        <span className="text-gray-400 text-[10px]">1 month ago</span>
                      </div>
                      <p className="text-gray-400 text-[11px] leading-relaxed line-clamp-3">{dorm.review}</p>
                    </div>
                  </div>
                ))}
                <div className="flex items-center flex-shrink-0">
                  <button className="w-9 h-9 rounded-full bg-[#7D1128] text-white flex items-center justify-center shadow-md hover:bg-[#6a0e22] transition-colors">
                    <GrFormNext size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* Map */}
            <div className="sm:col-span-1 lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-5 flex flex-col gap-3">
              <div className="rounded-xl overflow-hidden flex-1 min-h-[130px] sm:min-h-[150px] relative">
                <iframe
                  title="UPLB Map"
                  src="https://www.openstreetmap.org/export/embed.html?bbox=121.2530%2C14.1580%2C121.2700%2C14.1700&layer=mapnik"
                  className="w-full h-full border-0 absolute inset-0"
                />
              </div>
              <div>
                <p className="text-[10px] font-bold tracking-widest uppercase text-gray-400 mb-2">Dorm Type</p>
                <div className="relative mb-3">
                  <select className="w-full appearance-none border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#C9973A]/30 focus:border-[#C9973A] transition">
                    <option>All Types</option>
                    <option>Transient</option>
                    <option>Non-transient</option>
                  </select>
                  <FiChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                </div>
                {/* Filter chips — hidden on smallest screens to save space */}
                <div className="hidden sm:flex flex-wrap gap-1.5 mb-3 lg:hidden xl:flex">
                  {filters.map((f) => (
                    <button
                      key={f}
                      onClick={() => setActiveFilter(f)}
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all ${
                        activeFilter === f ? "bg-[#7D1128] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
                <button className="w-full py-2.5 sm:py-3 rounded-xl bg-[#7D1128] text-white text-sm font-semibold hover:bg-[#6a0e22] transition-colors flex items-center justify-center gap-2">
                  View Interactive Map <FiChevronRight size={14} />
                </button>
              </div>
            </div>
          </div>

          {/* Billing — inline on mobile, hidden on desktop (shown in right panel) */}
          <div className="lg:hidden bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-5">
            <BillingSection />
          </div>

        </div>
      </main>

      {/* Desktop Right Panel */}
      <DesktopProfilePanel />
    </div>
  );
}