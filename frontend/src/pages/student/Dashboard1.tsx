/**
 * Color palette is unified with LandingPage.tsx:
 *   --clr-dark:   #3D0718  (deepest maroon)
 *   --clr-mid:    #6B0F2B  (primary maroon)
 *   --clr-accent: #8C1535  (lighter maroon / hover states)
 *   --clr-gold:   #C9973A  (primary gold)
 *   --clr-gold-lt:#E8C37A  (light gold / subtext)
 *   --clr-gold-dk:#a07825  (dark gold / button hover)
 */


import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { api } from "../../api/axios"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"




// ── SVG icon imports (project assets) ─────────────────────────────────────
import DashboardIcon   from "../../assets/icons/dashboard.svg?react";
import SearchIcon      from "../../assets/icons/search.svg?react";
import ApplicationIcon from "../../assets/icons/applications.svg?react";
import ProfileIcon     from "../../assets/icons/profile.svg?react";
import DocumentIcon    from "../../assets/icons/documents.svg?react";
import LogoutIcon      from "../../assets/icons/logout.svg?react";
import house_icon      from "../../assets/icons/house_icon.svg";


// ── Design tokens (taken from LandingPage.tsx) ─────────────────────────
const CLR = {
  dark:   "#3D0718",
  mid:    "#6B0F2B",
  accent: "#8C1535",
  gold:   "#C9973A",
  goldLt: "#E8C37A",
  goldDk: "#a07825",
} as const;


// ── Types ──────────────────────────────────────────────────────────────────
type ApplicationStatus = "Approved" | "Pending" | "In Review";


interface Application {
  id:       number;
  dorm:     string;
  type:     string;
  applied:  string;
  location: string;
  status:   ApplicationStatus;
}


interface BillingStatement {
  label:  string;
  status: "Paid" | "Unpaid";
}


interface RecommendedDorm {
  id:       number;
  name:     string;
  tag:      string;
  tagColor: string;  
  size:     string;
  location: string;
  price:    number;
  rating:   number;  
  review:   string;
  img:      string;
}


interface StudentProfile {
  fullName:   string;
  shortName:  string;
  course:     string;
  campus:     string;
  email:      string;
  phone:      string;
  studentNo:  string;
  college:    string;
  yearLevel:  string;
  status:     string;
}


interface HeroContent {
  greeting:              string;
  title:                 string;
  subtitle:              string;
  pendingApplications:   number;
  newNotificationsToday: number;
}


interface BillingOverview {
  residenceHall:    string;
  dueDay:           string;
  dueMonth:         string;
  summaryTitle:     string;
  paidOn:           string;
  amountPaid:       number;
  nextDue:          string;
  monthlyRent:      number;
  remainingAmount:  number;
  totalPaid:        number;
  totalDue:         number;
  progressPercent:  number;
}


// ── Mock Data ──────────────────────────────────────────────────────────────
const heroContent: HeroContent = {
  greeting:              "Good Day",
  title:                 "Check your applications & explore new accommodations.",
  subtitle:              "You have 2 pending applications and 3 new notifications today.",
  pendingApplications:   2,
  newNotificationsToday: 3,
};


const applications: Application[] = [
  { id: 1, dorm: "Kamia Residence",  type: "Non-transient", applied: "Mar 12, 2026", location: "On-campus",  status: "Approved"  },
  { id: 2, dorm: "Molave Residence", type: "Non-transient", applied: "Mar 14, 2026", location: "Off-campus", status: "Pending"   },
  { id: 3, dorm: "Narra Residence",  type: "Non-transient", applied: "Mar 15, 2026", location: "Near Gate 1",status: "In Review" },
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


const billingOverview: BillingOverview = {
  residenceHall:   "Kamia Residence Hall",
  dueDay:          "20",
  dueMonth:        "Mar",
  summaryTitle:    "Rent Paid",
  paidOn:          "March 1, 2026",
  amountPaid:      3200,
  nextDue:         "June 1, 2026",
  monthlyRent:     3200,
  remainingAmount: 0,
  totalPaid:       3200,
  totalDue:        3200,
  progressPercent: 100,
};


const billingStatements: BillingStatement[] = [
  { label: "March Billing Statement",   status: "Paid"   },
  { label: "February Billing Statement",status: "Paid"   },
  { label: "January Billing Statement", status: "Unpaid" },
];


// ── Inline SVG Icons ───────────────────────────────────────────────────────
// NOTE: Kept inline to avoid extra asset files for generic UI icons.


const IconChevronRight = ({ className = "w-3.5 h-3.5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
  </svg>
);


const IconChevronDown = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
  </svg>
);


const IconMoreHorizontal = ({ className = "w-[18px] h-[18px]" }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <circle cx="5"  cy="12" r="1.5" />
    <circle cx="12" cy="12" r="1.5" />
    <circle cx="19" cy="12" r="1.5" />
  </svg>
);


const IconBell = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
  </svg>
);


const IconUser = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);


const IconMenu = ({ className = "w-[22px] h-[22px]" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);


const IconArrowNext = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
  </svg>
);


const IconHouse = ({ className = "w-3.5 h-3.5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);


const IconDocument = ({ className = "w-[18px] h-[18px]" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);


// ── Helper Components ──────────────────────────────────────────────────────


/** Colored pill badge for application status. */
const StatusBadge = ({ status }: { status: ApplicationStatus }) => {
  const styles: Record<ApplicationStatus, string> = {
    Approved:  "bg-green-100 text-green-700 border border-green-200",
    Pending:   "bg-amber-100 text-amber-700 border border-amber-200",
    "In Review":"bg-sky-100 text-sky-700 border border-sky-200",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${styles[status]}`}>
      {status}
    </span>
  );
};


/** Renders up to 5 gold/grey stars for a given numeric rating. */
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


interface DrawerNavProps {
  open:    boolean;
  onClose: () => void;
  profile: StudentProfile;
}


const DrawerNav = ({ open, onClose, profile }: DrawerNavProps) => {
  const [activeItem, setActiveItem] = useState("dashboard");


  const navItems = [
    { id: "dashboard",    label: "Dashboard",         icon: <DashboardIcon   className="w-5 h-5" /> },
    { id: "search",       label: "Browse Rooms",       icon: <SearchIcon      className="w-[18px] h-[18px]" /> },
    { id: "applications", label: "Application Status", icon: <ApplicationIcon className="w-[18px] h-[18px]" /> },
    { id: "documents",    label: "Billing Statements", icon: <DocumentIcon    className="w-[18px] h-[18px]" /> },
  ];


  return (
    <>
      {/* Backdrop */}
      {open && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={onClose} />
      )}


      {/* Drawer panel*/}
      <div
        className={`fixed top-0 left-0 bottom-0 z-50 w-72 flex flex-col transition-transform duration-300 ease-in-out lg:hidden ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ background: `linear-gradient(160deg, ${CLR.dark} 0%, ${CLR.mid} 100%)` }}
      >
        {/* Logo + close button */}
        <div className="flex items-center justify-between px-5 pt-6 pb-4">
            <div
          className="w-9 h-9 rounded-lg flex items-center justify-center mb-4 flex-shrink-0"
          style={{ background: CLR.gold }}
          >
            <span className="text-white font-bold text-sm">U</span>
          </div>
        </div>


        {/* Student info summary */}
        <div className="px-5 pb-6 border-b border-white/10">
          <div className="flex items-center gap-3 mb-4">
            <div className="relative flex-shrink-0">
              <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: "rgba(255,255,255,0.2)" }}>
                <IconUser className="w-6 h-6 text-white/60" />
              </div>
              <div className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-green-400 border-2" style={{ borderColor: CLR.dark }} />
            </div>
            <div>
              <p className="text-white font-bold text-base leading-tight">{profile.fullName}</p>
              <p className="text-xs font-semibold mt-0.5" style={{ color: CLR.goldLt }}>{profile.course} · {profile.campus}</p>
              <p className="text-white/50 text-xs">{profile.email}</p>
            </div>
          </div>


          <div className="grid grid-cols-3 gap-x-3 gap-y-1">
            {[
              { label: "Student No.", value: profile.studentNo },
              { label: "College",     value: profile.college   },
              { label: "Year Level",  value: profile.yearLevel },
            ].map((item) => (
              <div key={item.label}>
                <p className="text-white/40 text-[9px] font-bold uppercase tracking-wide">{item.label}</p>
                <p className="text-white text-xs font-bold">{item.value}</p>
              </div>
            ))}
            <div>
              <p className="text-white/40 text-[9px] font-bold uppercase tracking-wide">Status</p>
              <p className="text-green-400 text-xs font-bold">{profile.status}</p>
            </div>
          </div>
        </div>


        {/* Navigation links */}
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


  const topItems = [
    { id: "dashboard",    icon: <DashboardIcon   className="w-5 h-5" /> },
    { id: "search",       icon: <SearchIcon      className="w-[21px] h-[21px]" /> },
    { id: "applications", icon: <ApplicationIcon className="w-[26px] h-[26px]" /> },
    { id: "documents",    icon: <DocumentIcon    className="w-[20px] h-[20px]" /> },
  ];


  const bottomItems = [
    { id: "account", icon: <ProfileIcon className="w-[22px] h-[22px]" /> },
    { id: "logout",  icon: <LogoutIcon  className="w-[23px] h-[23px]" /> },
  ];


  return (
    <aside
      className="hidden lg:flex w-16 flex-col items-center py-4 gap-2 flex-shrink-0"
      style={{ background: `linear-gradient(180deg, ${CLR.dark} 0%, ${CLR.mid} 100%)` }}
    >
      {/* Brand mark */}
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center mb-4 flex-shrink-0"
        style={{ background: CLR.gold }}
      >
        <span className="text-white font-bold text-sm">U</span>
      </div>


      {/* Primary nav icons */}
      <nav className="flex flex-col items-center gap-1 flex-1">
        {topItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActive(item.id)}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
              active === item.id
                ? "bg-white/20 text-white"
                : "text-white/50 hover:text-white hover:bg-white/10"
            }`}
          >
            <span className="flex items-center justify-center">{item.icon}</span>
          </button>
        ))}
      </nav>


      {/* Bottom utility icons */}
      <div className="flex flex-col items-center gap-1 mt-auto">
        {bottomItems.map((item) => (
          <button
            key={item.id}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all"
          >
            <span className="flex items-center justify-center">{item.icon}</span>
          </button>
        ))}
      </div>
    </aside>
  );
};


// ── Billing Section ────────────────────────────────────────────────────────


interface BillingSectionProps {
  overview:   BillingOverview;
  statements: BillingStatement[];
}


const BillingSection = ({ overview, statements }: BillingSectionProps) => (
  <div className="space-y-5">


    {/* Section header with due-date badge */}
    <div className="flex items-start justify-between">
      <div className="flex items-center gap-3">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
          style={{ background: `${CLR.mid}12`, color: CLR.mid }}
        >
          <IconDocument className="w-5 h-5" />
        </div>
        <div>
          <p className="font-bold text-gray-900 text-[15px] leading-tight">Billing &amp; Payments</p>
          <p className="text-gray-400 text-sm">{overview.residenceHall}</p>
        </div>
      </div>


      {/* Next-due date stamp */}
      <div className="bg-[#F7EFF2] text-center rounded-2xl px-3 py-2 flex-shrink-0">
        <p className="text-[28px] font-bold leading-none" style={{ color: CLR.mid }}>{overview.dueDay}</p>
        <p className="text-[12px] leading-none mt-1 font-semibold" style={{ color: CLR.mid }}>{overview.dueMonth}</p>
      </div>
    </div>


    {/* Current rent summary */}
    <div className="bg-[#F7F1F3] rounded-3xl p-5 border border-[#EFE3E8]">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-12 h-12 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>


          <div className="min-w-0">
            <p className="font-bold text-gray-900 text-[15px]">{overview.summaryTitle}</p>
            <p className="text-gray-400 text-xs">Paid on {overview.paidOn} · ₱{overview.amountPaid.toLocaleString()}.00</p>


            <span className="inline-block mt-2 text-xs font-bold px-3 py-1 rounded-full bg-[#DCEADF] text-green-700">
              Next due: {overview.nextDue}
            </span>
          </div>
        </div>


        <p className="font-bold text-gray-900 text-[17px] whitespace-nowrap">
          ₱{overview.monthlyRent.toLocaleString()} <span className="text-gray-400 font-normal text-sm">/ month</span>
        </p>
      </div>
    </div>


    <div className="h-px bg-[#EADDE2]" />


    {/* Payment progress bar */}
    <div>
      <p className="text-[11px] font-bold tracking-widest uppercase text-[#A07B86] mb-3">Payment Progress</p>


      <div className="w-full h-2.5 bg-[#E9E1E4] rounded-full overflow-hidden">
        <div
          className="h-2.5 rounded-full relative"
          style={{ width: `${overview.progressPercent}%`, background: `linear-gradient(90deg, ${CLR.mid}, ${CLR.gold})` }}
        >
          <div
            className="absolute right-0 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full border-2 border-white shadow-sm"
            style={{ background: CLR.gold }}
          />
        </div>
      </div>


      <div className="flex justify-between mt-2">
        <span className="text-sm font-semibold" style={{ color: CLR.mid }}>
          ₱{overview.remainingAmount.toLocaleString()} remaining
        </span>
        <span className="text-sm text-gray-400">
          ₱{overview.totalPaid.toLocaleString()} / ₱{overview.totalDue.toLocaleString()} paid
        </span>
      </div>
    </div>


    <div className="h-px bg-[#EADDE2]" />


    {/* Billing history list */}
    <div>
      <p className="text-[11px] font-bold tracking-widest uppercase text-[#A07B86] mb-4">Billing History</p>


      <div className="space-y-3">
        {statements.map((b, index) => (
          <div
            key={b.label}
            className={`flex items-center gap-3 p-4 rounded-2xl bg-[#F8F1F4] border border-[#EFE5E8] ${
              index === 0 ? "shadow-[0_6px_14px_rgba(61,7,24,0.12)]" : ""
            }`}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: CLR.mid, color: "#fff" }}
            >
              <IconHouse className="w-4 h-4" />
            </div>


            <div className="flex-1 min-w-0">
              <p className="text-[15px] font-semibold text-gray-800 truncate">{b.label}</p>
              <p className={`text-sm font-semibold ${b.status === "Paid" ? "text-green-600" : "text-red-500"}`}>
                {b.status}
              </p>
            </div>
          </div>
        ))}
      </div>


      <button
        className="w-full mt-5 text-[15px] font-semibold hover:underline flex items-center justify-center gap-1"
        style={{ color: CLR.mid }}
      >
        View all billing statements <IconChevronRight />
      </button>
    </div>
  </div>
);


// ── Desktop Right Panel ────────────────────────────────────────────────────


interface DesktopProfilePanelProps {
  profile:    StudentProfile;
  billing:    BillingOverview;
  statements: BillingStatement[];
}


const DesktopProfilePanel = ({ profile, billing, statements }: DesktopProfilePanelProps) => (
  <aside className="hidden lg:flex w-[390px] xl:w-[420px] flex-shrink-0 flex-col gap-4 px-4 pb-4 bg-[#F6F2F4]">


    {/* Profile section */}
    <div
      className="rounded-b-[30px] px-7 pt-6 pb-6 shadow-[0_10px_24px_rgba(61,7,24,0.18)]"
      style={{ background: `linear-gradient(160deg, ${CLR.dark} 0%, ${CLR.mid} 100%)` }}
    >
      {/* Profile header */}
      <div className="flex items-center justify-between mb-6">
        <span className="text-[11px] font-bold tracking-widest uppercase text-white/75">My Profile</span>


        {/* Notification bell with gold dot indicator */}
        <button
          className="w-11 h-11 rounded-2xl flex items-center justify-center text-white transition-colors relative border border-white/10"
          style={{ background: "rgba(255,255,255,0.10)" }}
        >
          <IconBell className="w-500 h-500" />
          <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full" style={{ background: CLR.gold }} />
        </button>
      </div>


      {/* Avatar + name */}
      <div className="flex items-center gap-4">
        <div className="relative flex-shrink-0">
          <div
            className="w-20 h-20 rounded-full bg-white flex items-center justify-center border-4 shadow-md"
            style={{ borderColor: CLR.gold }}
          >
            <IconUser className="w-10 h-10 text-gray-300" />
          </div>


          <div className="absolute bottom-1 right-1 w-6 h-6 rounded-full bg-green-600 border-4 border-white flex items-center justify-center">
            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>


        <div className="min-w-0">
          <p className="text-white font-bold text-[20px] leading-tight">{profile.fullName}</p>
          <p className="text-[15px] font-bold leading-tight mt-1" style={{ color: CLR.goldLt }}>
            {profile.course.toUpperCase()} · {profile.campus}
          </p>
          <p className="text-white/70 text-sm mt-1 truncate">{profile.email}</p>
          <p className="text-white/70 text-sm">{profile.phone}</p>
        </div>
      </div>


      {/* Student details row */}
      <div className="mt-6 grid grid-cols-4 gap-4">
        {[
          { label: "Student No.", value: profile.studentNo },
          { label: "College",     value: profile.college.toUpperCase() },
          { label: "Year Level",  value: profile.yearLevel },
          { label: "Status",    value: profile.status ? profile.status.charAt(0).toUpperCase() + profile.status.slice(1): "", green: true ,}
        ].map((item) => (
          <div key={item.label}>
            <p className="text-white/50 text-[10px] font-medium leading-tight mb-1.5">{item.label}</p>


            {item.green ? (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-green-100 text-green-700">
                {item.value}
              </span>
            ) : (
              <p className="text-white text-[15px] font-bold leading-tight">{item.value}</p>
            )}
          </div>
        ))}
      </div>
    </div>


    {/* Billing section */}
    <div className="bg-white rounded-[30px] px-7 pt-6 pb-8 shadow-[0_10px_24px_rgba(61,7,24,0.12)]">
      <BillingSection overview={billing} statements={statements} />
    </div>
  </aside>
);


// ── Main Dashboard ─────────────────────────────────────────────────────────


/**
 * Layout: DesktopSidebar | main content scroll area | DesktopProfilePanel
 * On mobile the sidebar collapses into a DrawerNav triggered by a hamburger.
 */
export default function Dashboard() {
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState("All");


  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [pendingApplicationsCount, setPendingApplicationsCount] = useState(0);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);
  const [notificationsTodayCount, setNotificationsTodayCount] = useState(0);


  const mapFilters = ["All", "On-Campus", "Off-Campus", "UPLB Partner"];


  const {
    data: user,
    isLoading: isUserLoading,
    isError, // removed the redundant isError: isError
  } = useQuery({
    queryKey: ["me"], // if this has a different queryKey, keep yours
    queryFn: async () => {
      try {
        const res = await api.get("/me");
        return res.data;
    },
    // prevents React Query from retrying a failed auth check multiple times
    retry: false, 
  });


    useEffect(() => {
    const fetchProfile = async () => {
        try {
        const res = await api.get("/profile");
        console.log("GET /profile:", res.data);


        setProfile(res.data);
        } catch (error) {
        console.error("Failed to fetch student profile:", error);
        } finally {
        setProfileLoading(false);
        }
    };


    fetchProfile();
    }, []);


    useEffect(() => {
    if (isError) {
        navigate("/auth/signin");
    }
    }, [isError, navigate]);


    useEffect(() => {
    if (user && user.role !== "student") {
        navigate("/auth/signin");
    }
    }, [user, navigate]);


    useEffect(() => {
    const fetchApplications = async () => {
        try {
        const res = await api.get("/applications/my-applications");
        console.log("applications:", res.data);


        const data = res.data;


        // count pending
        const pendingCount = data.filter(
        (app: any) => app.status?.toLowerCase() === "pending"
        ).length;


        setPendingApplicationsCount(pendingCount);
        } catch (error) {
        console.error("Failed to fetch applications:", error);
        }
    };


    fetchApplications();
    }, []);


    useEffect(() => {
    const fetchNotifications = async () => {
        try {
        const res = await api.get("/notifications");
        console.log("notifications:", res.data);


        const data = res.data;


        // unread count (optional)
        const unreadCount = data.filter(
            (n: any) => n.readStatus?.toLowerCase() === "unread"
        ).length;


        setUnreadNotificationsCount(unreadCount);


        // today's notifications
        const today = new Date().toISOString().split("T")[0];


        const todayCount = data.filter((n: any) => {
            const notifDate = new Date(n.notificationTimestamp)
            .toISOString()
            .split("T")[0];


            return notifDate === today;
        }).length;


        setNotificationsTodayCount(todayCount);


        } catch (error) {
        console.error("Failed to fetch notifications:", error);
        }
    };


    fetchNotifications();
    }, []);


    if (profileLoading) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-[#F6F2F4]">
        <p className="text-gray-600">Loading profile...</p>
        </div>
    );
    }


    if (isUserLoading) {
    return (
        <div className="flex items-center justify-center h-screen">
        <p>Loading...</p>
        </div>
    );
    }


    if (!user || user.role !== "student") {
    return null;
    }


  return (
    <div className="flex min-h-screen bg-[#F6F2F4] font-sans">


      {/* ── Sidebar (desktop only) ── */}
      <DesktopSidebar />


      {/* ── Drawer nav (mobile only) ── */}
      {profile && (
        <DrawerNav
            open={drawerOpen}
            onClose={() => setDrawerOpen(false)}
            profile={profile}
        />
        )}


      {/* ── Main scrollable area ── */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">


        {/* Top bar */}
        <header className="flex items-center justify-between px-4 sm:px-6 lg:px-8 pt-5 pb-3 lg:pt-7 lg:pb-2 sticky top-0 z-30 bg-[#F6F2F4]">
          <div className="flex items-center gap-3">
            {/* Hamburger — mobile only */}
            <button
              onClick={() => setDrawerOpen(true)}
              className="lg:hidden p-1"
              aria-label="Open menu"
              style={{ color: CLR.mid }}
            >
              <IconMenu />
            </button>
            {/* Vertical accent rule — desktop only */}
            <div className="hidden lg:flex items-center gap-2">
              <div className="w-1 h-6 rounded-full" style={{ background: CLR.mid }} />
            </div>
            <h1 className="font-serif italic text-2xl lg:text-3xl font-bold text-gray-900">Dashboard</h1>
          </div>


          {/* Global notification bell */}
          <button className="w-9 h-9 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors relative shadow-sm">
            <IconBell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full" style={{ background: CLR.gold }} />
          </button>
        </header>


        {/* Page content */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-5 space-y-4 lg:space-y-5">


          {/* ── Hero banner ── */}
          <div
            className="relative rounded-2xl overflow-hidden flex items-center min-h-[140px] sm:min-h-[176px]"
            style={{ background: `linear-gradient(135deg, ${CLR.dark} 0%, ${CLR.accent} 60%, ${CLR.mid} 100%)` }}
          >
            <div className="relative z-10 px-5 sm:px-8 py-6">
              <p className="text-[10px] sm:text-xs font-bold tracking-widest uppercase mb-1" style={{ color: CLR.goldLt }}>
                {heroContent.greeting}, {profile?.shortName}
              </p>
              <h2 className="text-white font-bold text-lg sm:text-2xl leading-snug mb-1.5 max-w-xs sm:max-w-sm">
                {heroContent.title}
              </h2>
              <p className="text-white/60 text-xs sm:text-sm">
                You have {pendingApplicationsCount} pending application{pendingApplicationsCount !== 1 && "s"} and {notificationsTodayCount} new notification{notificationsTodayCount !== 1 && "s"} today.              
              </p>


            </div>
            {/* Decorative house icon — positioned bottom-right */}
            <div className="absolute right-0 bottom-0 h-full flex items-end pointer-events-none">
              <img src={house_icon} alt="" className="w-[130px] h-[130px]" />
            </div>
          </div>


          {/* ── My Applications table ── */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between px-4 sm:px-6 pt-5 pb-3">
              <h3 className="font-semibold text-gray-900 text-base">My Applications</h3>
              <button className="text-sm font-semibold hover:underline flex items-center gap-1" style={{ color: CLR.mid }}>
                View all <IconChevronRight />
              </button>
            </div>


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
                          {/* Dorm colour swatch placeholder */}
                          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex-shrink-0" style={{ background: CLR.mid }} />
                          <span className="font-medium text-gray-800 whitespace-nowrap">{app.dorm}</span>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 text-gray-500 whitespace-nowrap">{app.type}</td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 text-gray-500 whitespace-nowrap">{app.applied}</td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 text-gray-500 whitespace-nowrap">{app.location}</td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4"><StatusBadge status={app.status} /></td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4">
                        <button className="text-gray-400 hover:text-gray-600 transition-colors">
                          <IconMoreHorizontal />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>


          {/* ── Recommended dorms + Map preview ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">


            {/* Recommended cards */}
            <div className="sm:col-span-1 lg:col-span-3 bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 text-base">Recommended</h3>
                <button className="text-sm font-semibold hover:underline flex items-center gap-1" style={{ color: CLR.mid }}>
                  View all <IconChevronRight />
                </button>
              </div>


              {/* Horizontally scrollable card row */}
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
                      <p className="font-bold text-sm mb-1.5" style={{ color: CLR.gold }}>
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


                {/* "Next" arrow button */}
                <div className="flex items-center flex-shrink-0">
                  <button
                    className="w-9 h-9 rounded-full text-white flex items-center justify-center shadow-md transition-colors"
                    style={{ background: CLR.mid }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = CLR.dark)}
                    onMouseLeave={(e) => (e.currentTarget.style.background = CLR.mid)}
                  >
                    <IconArrowNext className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>


            {/* Map preview + filter controls */}
            <div className="sm:col-span-1 lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-5 flex flex-col gap-3">
              {/* Embedded OpenStreetMap — pointer-events disabled so click opens full map */}
              <div
                className="rounded-xl overflow-hidden flex-1 min-h-[130px] sm:min-h-[150px] relative cursor-pointer group"
                onClick={() => navigate("/map")}
              >
                <iframe
                  title="UPLB Map Preview"
                  src="https://www.openstreetmap.org/export/embed.html?bbox=121.2380%2C14.1630%2C121.2490%2C14.1720&layer=mapnik&marker=14.1672%2C121.2430"
                  className="w-full h-full border-0 absolute inset-0 pointer-events-none"
                />
                <div className="absolute inset-0 bg-[#3D0718]/0 group-hover:bg-[#3D0718]/20 transition-colors flex items-center justify-center">
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg" style={{ color: CLR.mid }}>
                    Open Full Map
                  </span>
                </div>
              </div>


              <div>
                <p className="text-[10px] font-bold tracking-widest uppercase text-gray-400 mb-2">Dorm Type</p>


                {/* Dorm type dropdown */}
                <div className="relative mb-3">
                  <select className="w-full appearance-none border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#C9973A]/30 focus:border-[#C9973A] transition">
                    <option>All Types</option>
                    <option>Transient</option>
                    <option>Non-transient</option>
                  </select>
                  <IconChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                </div>


                {/* Filter pill buttons — visible on sm and xl+ */}
                <div className="hidden sm:flex flex-wrap gap-1.5 mb-3 lg:hidden xl:flex">
                  {mapFilters.map((f) => (
                    <button
                      key={f}
                      onClick={() => setActiveFilter(f)}
                      className="px-2.5 py-1 rounded-full text-xs font-semibold transition-all"
                      style={
                        activeFilter === f
                          ? { background: CLR.mid, color: "#fff" }
                          : { background: "#f3f4f6", color: "#4b5563" }
                      }
                    >
                      {f}
                    </button>
                  ))}
                </div>


                {/* CTA — navigate to full map page */}
                <button
                  onClick={() => navigate("/map")}
                  className="w-full text-white text-sm font-semibold px-4 py-2.5 rounded-xl flex items-center justify-center gap-1 transition-colors shadow-sm"
                  style={{ background: CLR.mid }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = CLR.dark)}
                  onMouseLeave={(e) => (e.currentTarget.style.background = CLR.mid)}
                >
                  View Interactive Map <IconChevronRight />
                </button>
              </div>
            </div>
          </div>


          {/* ── Billing card (mobile only — hidden on lg+) ── */}
          <div className="lg:hidden bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-5">
            <BillingSection overview={billingOverview} statements={billingStatements} />
          </div>


        </div>
      </main>


      {/* ── Right profile + billing panel (desktop only) ── */}
      {profile && (
        <DesktopProfilePanel
            profile={profile}
            billing={billingOverview}
            statements={billingStatements}
        />
      )}
    </div>
  );
}



