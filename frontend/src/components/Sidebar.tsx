import { useState, useCallback, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import clsx from "clsx";

import DashboardIcon from "../assets/icons/dashboard.svg?react";
import SearchIcon from "../assets/icons/search.svg?react";
import ApplicationIcon from "../assets/icons/applications.svg?react";
import ProfileIcon from "../assets/icons/profile.svg?react";
import DocumentIcon from "../assets/icons/documents.svg?react";
import LogoutIcon from "../assets/icons/logout.svg?react";
import RoomIcon from "../assets/icons/room.svg?react";
import LandlordApplicationIcon from "../assets/icons/application&waitlisted.svg?react";
import FeesIcon from "../assets/icons/fees.svg?react";
import StudentVerification from "../assets/icons/student_verifications.svg?react";
import AdminVerification from "../assets/icons/admin_verifications.svg?react";

const OccupancyIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="white">
    <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
    <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
    <g id="SVGRepo_iconCarrier">
      <path d="M19 9.77806V16.2C19 17.8801 19 18.7202 18.673 19.3619C18.3854 19.9264 17.9265 20.3854 17.362 20.673C17.2111 20.7499 17.0492 20.8087 16.868 20.8537M5 9.7774V16.2C5 17.8801 5 18.7202 5.32698 19.3619C5.6146 19.9264 6.07354 20.3854 6.63803 20.673C6.78894 20.7499 6.95082 20.8087 7.13202 20.8537M21 12L15.5668 5.96393C14.3311 4.59116 13.7133 3.90478 12.9856 3.65138C12.3466 3.42882 11.651 3.42887 11.0119 3.65153C10.2843 3.90503 9.66661 4.59151 8.43114 5.96446L3 12M7.13202 20.8537C7.65017 18.6447 9.63301 17 12 17C14.367 17 16.3498 18.6447 16.868 20.8537M7.13202 20.8537C7.72133 21 8.51495 21 9.8 21H14.2C15.485 21 16.2787 21 16.868 20.8537M14 12C14 13.1045 13.1046 14 12 14C10.8954 14 10 13.1045 10 12C10 10.8954 10.8954 9.99996 12 9.99996C13.1046 9.99996 14 10.8954 14 12Z"
        stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </g>
  </svg>
);

const WaitlistIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
    <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
    <g id="SVGRepo_iconCarrier">
      <path d="M12 7V12H15M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
    </g>
  </svg>
);

const MoveIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#ffffff">
    <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
    <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
    <g id="SVGRepo_iconCarrier">
      <path d="M20.3873 7.1575L11.9999 12L3.60913 7.14978" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
      <path d="M12 12V21" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
      <path d="M11 2.57735C11.6188 2.22008 12.3812 2.22008 13 2.57735L19.6603 6.42265C20.2791 6.77992 20.6603 7.44017 20.6603 8.1547V15.8453C20.6603 16.5598 20.2791 17.2201 19.6603 17.5774L13 21.4226C12.3812 21.7799 11.6188 21.7799 11 21.4226L4.33975 17.5774C3.72094 17.2201 3.33975 16.5598 3.33975 15.8453V8.1547C3.33975 7.44017 3.72094 6.77992 4.33975 6.42265L11 2.57735Z" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
      <path d="M8.5 4.5L16 9" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
    </g>
  </svg>
);

const RoomAssignmentIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
    <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
    <g id="SVGRepo_iconCarrier">
      <path fillRule="evenodd" clipRule="evenodd" d="M15.6809 5.34814C14.0521 5.34814 12.7265 6.66395 12.7265 8.29353C12.7265 9.92311 14.0521 11.2389 15.6809 11.2389C17.3097 11.2389 18.6353 9.92311 18.6353 8.29353C18.6353 6.66395 17.3097 5.34814 15.6809 5.34814ZM14.2265 8.29353C14.2265 7.49816 14.8748 6.84814 15.6809 6.84814C16.487 6.84814 17.1353 7.49816 17.1353 8.29353C17.1353 9.0889 16.487 9.73891 15.6809 9.73891C14.8748 9.73891 14.2265 9.0889 14.2265 8.29353Z" fill="#ffffff"></path>
      <path fillRule="evenodd" clipRule="evenodd" d="M9.52998 20.8783C9.86298 20.414 9.97017 19.9429 9.96222 19.5233C10.3544 19.6387 10.7424 19.6533 11.1141 19.5828C11.8825 19.437 12.4511 18.9512 12.7527 18.5507L12.758 18.5437L12.7631 18.5366C13.2883 17.8043 13.2872 17.0543 13.1586 16.5164C13.0956 16.2528 13.0021 16.0361 12.9245 15.8846C12.8853 15.8081 12.849 15.746 12.8207 15.7005C12.8132 15.6885 12.8063 15.6775 12.7999 15.6677C12.7112 15.5021 12.6111 15.3719 12.5269 15.2737L12.5359 15.2647L13.0001 14.8024C13.3817 14.9849 13.7957 15.0999 14.1583 15.1749C14.744 15.2962 15.3171 15.3369 15.6807 15.3369C19.582 15.3369 22.75 12.1863 22.75 8.29344C22.75 4.40056 19.582 1.25 15.6807 1.25C11.7794 1.25 8.61144 4.40056 8.61144 8.29344C8.61144 9.2105 8.82018 9.99588 9.02588 10.549C9.07825 10.6898 9.13081 10.8166 9.18035 10.9279L1.92511 18.1535C1.66869 18.4089 1.36789 18.853 1.27697 19.4092C1.17837 20.0124 1.34031 20.6829 1.92511 21.2654L2.80687 22.1435C2.82046 22.1571 2.83457 22.1701 2.84916 22.1825C3.10385 22.3999 3.53164 22.6513 4.04572 22.7273C4.59712 22.8088 5.23527 22.6818 5.77579 22.1435L6.34232 21.5793C6.87523 21.8849 7.43853 21.9545 7.95941 21.8548C8.63497 21.7254 9.19686 21.321 9.51964 20.8924L9.5249 20.8854L9.52998 20.8783ZM10.1114 8.29344C10.1114 5.23477 12.602 2.75 15.6807 2.75C18.7594 2.75 21.25 5.23477 21.25 8.29344C21.25 11.3521 18.7594 13.8369 15.6807 13.8369C15.4075 13.8369 14.9372 13.8044 14.4623 13.7061C13.9654 13.6032 13.5752 13.4504 13.3674 13.2779C13.0699 13.031 12.6332 13.0508 12.3592 13.3237L11.4774 14.2019C11.2757 14.4028 11.0818 14.6305 10.9794 14.8933C10.8499 15.2261 10.8912 15.5463 11.0394 15.8121C11.1273 15.9697 11.2689 16.1202 11.3278 16.183L11.3476 16.2042C11.4173 16.2811 11.4555 16.3314 11.4834 16.387L11.5098 16.4397L11.54 16.4817L11.5468 16.4924C11.5558 16.507 11.5712 16.533 11.5895 16.5685C11.6267 16.6412 11.6709 16.7445 11.6997 16.8652C11.7544 17.0937 11.7538 17.3656 11.5494 17.6551C11.4087 17.8384 11.1424 18.0506 10.8345 18.1091C10.5769 18.1579 10.1571 18.1261 9.59673 17.5681C9.30409 17.2766 8.83089 17.2766 8.53825 17.5681L8.24433 17.8608C7.96748 18.1365 7.94891 18.5782 8.20054 18.8761C8.20194 18.8778 8.2058 18.8826 8.2116 18.8903C8.22363 18.9062 8.24339 18.9336 8.2668 18.9704C8.31483 19.0461 8.37128 19.1508 8.41138 19.2706C8.48694 19.4963 8.49882 19.7374 8.31639 19.9966C8.19643 20.1519 7.95303 20.3287 7.67726 20.3815C7.4429 20.4264 7.14284 20.3931 6.8045 20.0562C6.51186 19.7647 6.03866 19.7647 5.74602 20.0562L4.7173 21.0807C4.55241 21.2449 4.4068 21.2643 4.26505 21.2434C4.09729 21.2186 3.93333 21.1293 3.84077 21.0562L2.9836 20.2025C2.74543 19.9653 2.73591 19.7821 2.75733 19.6511C2.78643 19.4731 2.89711 19.3025 2.9836 19.2163L10.6279 11.6033C10.8747 11.3575 10.9185 10.9735 10.7333 10.6784L10.7311 10.6748C10.7284 10.6703 10.7232 10.6615 10.7158 10.6487C10.7012 10.6231 10.6781 10.5814 10.6494 10.5251C10.5918 10.4123 10.5122 10.2423 10.4318 10.0262C10.2701 9.59135 10.1114 8.98632 10.1114 8.29344ZM8.20054 18.8761C8.20192 18.8777 8.2033 18.8793 8.20469 18.881L8.20354 18.8796L8.20054 18.8761Z" fill="#ffffff"></path>
    </g>
  </svg>
);

const BRAND = {
  bgDark: "#2A0410",
  primary: "#6B0F2B",
  primaryLight: "#9E2040",
  gold: "#C9973A",
  goldLight: "#E8C37A",
  whiteAlpha: "rgba(255,255,255,0.1)",
} as const;

const SIDEBAR_GRADIENT =
  "linear-gradient(180deg, #2A0410 0%, #3D0718 40%, #6B0F2B 75%, #9E2040 100%)";

// ─── Storage key constants ────────────────────────────────────────────────────
const ACC_ID_KEY = "landlord-acc-id";

// Call this when entering /landlord/accommodation/:id to persist the ID 
export function setLandlordAccommodationId(id: string) {
  sessionStorage.setItem(ACC_ID_KEY, id);
}

/** @deprecated Use setLandlordAccommodationId instead. Kept for compatibility. */
export function setLandlordSidebarContext(_context: "full" | "minimal") {
  // no-op: context is now derived purely from the URL + stored accId
  // whahwdahwd anagamit ko sa dashboard and manage ah kaya wag niyo na lang i remove tinatamad ako i remove
}

interface SidebarMenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
}

interface SidebarProps {
  role?: "student" | "landlord" | "manager" | "landlord-manage" | "super_admin";
  profile?: {
    fullName: string;
    shortName: string;
    course?: string;
    campus?: string;
    email: string;
    studentNo?: string;
    college?: string;
    yearLevel?: string;
    status?: string;
  };
}

// ─── Derive role purely from the current URL ───────────────────────────────────
function getRoleFromPathname(pathname: string, propRole?: string): string {
  if (pathname.startsWith("/student/")) return "student";
  if (pathname.startsWith("/manager/")) return "manager";
  if (pathname.startsWith("/admin/")) return "super_admin";


  // /landlord/accommodation/:id will punta to the individual accommodation dashboard (full sidebar)
  if (/^\/landlord\/accommodation\/\d+/.test(pathname)) return "landlord";

  // /landlord/profile — check URL param `from` to decide which sidebar
  if (pathname.startsWith("/landlord/profile")) {
    const params = new URLSearchParams(window.location.search);
    const fromAcc = params.get("from");
    // If ?from=<id> is present, show the full landlord sidebar
    return fromAcc ? "landlord" : "landlord-manage";
  }

  // These landlord paths should show the FULL sidebar
  if (
    pathname.startsWith("/landlord/rooms") ||
    pathname.startsWith("/landlord/fees") ||
    pathname.startsWith("/landlord/applications") ||
    pathname.startsWith("/landlord/waitlist")
  ) return "landlord";

  // /landlord/dashboard and any other /landlord/ path then it will have manage page (minimal sidebar)
  if (pathname.startsWith("/landlord/")) return "landlord-manage";

  return propRole || "student";
}

// ─── Active nav item from pathname ────────────────────────────────────────────
function getActiveId(pathname: string, role: string): string {
  switch (role) {
    case "student":
      if (pathname.startsWith("/student/billingdashboard")) return "documents";
      if (pathname.startsWith("/student/dashboard")) return "dashboard";
      if (pathname.startsWith("/student/browse")) return "search";
      if (pathname.startsWith("/student/applications")) return "applications";
      if (pathname.startsWith("/student/profile")) return "account";
      return "dashboard";

    case "manager":
      if (pathname.startsWith("/manager/dashboard")) return "dashboard";
      if (pathname.startsWith("/manager/applications")) return "applications";
      if (pathname.startsWith("/manager/occupancy-records")) return "reports";
      if (pathname.startsWith("/manager/room-assignment")) return "users";
      if (pathname.startsWith("/manager/waitlist")) return "waitlist";
      if (pathname.startsWith("/manager/movein-moveout")) return "movein-moveout";
      if (pathname.startsWith("/manager/profile")) return "account";
      return "dashboard";

    case "landlord":
      if (/^\/landlord\/accommodation\/\d+/.test(pathname)) return "dashboard";
      if (pathname.startsWith("/landlord/rooms")) return "room";
      if (pathname.startsWith("/landlord/applications") || pathname.startsWith("/landlord/waitlist")) return "application";
      if (pathname.startsWith("/landlord/fees")) return "fees";
      if (pathname.startsWith("/landlord/profile")) return "account";
      return "dashboard";

      case "landlord-manage":
        if (pathname.startsWith("/landlord/dashboard")) return "dashboard";
        if (pathname.startsWith("/landlord/profile")) return "account";
        return "";
    
      case "super_admin":
        if (pathname.startsWith("/admin/dashboard"))
          return "dashboard";

        if (pathname.startsWith("/admin/student-verifications"))
          return "student-verifications";

        if (pathname.startsWith("/admin/landlord-verifications"))
          return "landlord-verifications";

        if (pathname.startsWith("/admin/pending-accommodations"))
          return "pending-accommodations";

        if (pathname.startsWith("/admin/activity-logs"))
          return "activity-logs";

        return "dashboard";
    default:
      return "dashboard";
  }
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const IconWrapper = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <span
    className={clsx(
      "flex items-center justify-center w-5 h-5 flex-shrink-0",
      "[&>svg]:w-full [&>svg]:h-full",
      className
    )}
  >
    {children}
  </span>
);

const DesktopTooltip = ({ label }: { label: string }) => (
  <div
    className="
      pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-3
      opacity-0 translate-x-1 group-hover:opacity-100 group-hover:translate-x-0
      transition-all duration-200 ease-out
      text-[13px] font-semibold tracking-wide
      px-3 py-1.5 rounded-lg whitespace-nowrap z-50
      shadow-[0_6px_18px_rgba(201,151,58,0.35)]
      bg-gradient-to-br from-[#C9973A] to-[#E8C37A] text-[#3D0718]
    "
  >
    {label}
    <span
      className="absolute right-full top-1/2 -translate-y-1/2 border-[6px] border-transparent"
      style={{ borderRightColor: "#C9973A" }}
    />
  </div>
);

const MobileDrawer = ({
  open,
  onClose,
  role,
  profile,
  items,
  bottomItems,
  active,
  onNavigate,
}: {
  open: boolean;
  onClose: () => void;
  role: string;
  profile?: SidebarProps["profile"];
  items: SidebarMenuItem[];
  bottomItems: SidebarMenuItem[];
  active: string;
  onNavigate: (path: string) => void;
}) => {
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  const defaultProfile = {
    fullName: "User Name",
    shortName: "User",
    email: "user@up.edu.ph",
    ...profile,
  };

  return (
    <>
      <div
        className={clsx(
          "fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300 lg:hidden",
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation"
        className={clsx(
          "fixed top-0 left-0 bottom-0 z-50 w-72 flex flex-col bg-no-repeat bg-cover transition-transform duration-300 ease-in-out lg:hidden",
          open ? "translate-x-0" : "-translate-x-full"
        )}
        style={{ backgroundImage: SIDEBAR_GRADIENT }}
      >
        <div className="flex items-center justify-between px-5 pt-6 pb-4">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-[#C9973A] text-white font-bold text-sm">
            {
            role === "student"
            ? "S"
            : role === "landlord" || role === "landlord-manage"
            ? "L"
            : role === "super_admin"
            ? "SA"
            : "M"
            }
          </div>
          <button
            onClick={onClose}
            aria-label="Close menu"
            className="text-white/60 hover:text-white text-2xl leading-none p-1 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Profile */}
        <div className="px-5 pb-6 border-b border-white/10">
          <div className="flex items-center gap-3 mb-4">
            <div className="relative flex-shrink-0 w-14 h-14 rounded-full bg-white/20 flex items-center justify-center">
              <svg className="w-6 h-6 text-white/60" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <div className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-green-400 border-2 border-[#2A0410]" />
            </div>
            <div className="min-w-0">
              <p className="text-white font-bold text-base leading-tight truncate">{defaultProfile.fullName}</p>
              <p className="text-xs font-semibold mt-0.5 text-[#E8C37A]">
                {[defaultProfile.course, defaultProfile.campus].filter(Boolean).join(" · ")}
              </p>
              <p className="text-white/50 text-xs truncate">{defaultProfile.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-x-3 gap-y-1">
            {[
              { label: "Student No.", value: defaultProfile.studentNo },
              { label: "College", value: defaultProfile.college },
              { label: "Year Level", value: defaultProfile.yearLevel },
            ]
              .filter((i) => i.value)
              .map((item) => (
                <div key={item.label}>
                  <p className="text-white/40 text-[9px] font-bold uppercase tracking-wide">{item.label}</p>
                  <p className="text-white text-xs font-bold">{item.value}</p>
                </div>
              ))}
            {defaultProfile.status && (
              <div>
                <p className="text-white/40 text-[9px] font-bold uppercase tracking-wide">Status</p>
                <p className="text-green-400 text-xs font-bold">{defaultProfile.status}</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {items.map((item) => (
              <button
                key={item.id}
                onClick={() => { onNavigate(item.path); onClose(); }}
                className={clsx(
                  "w-full flex items-center gap-3.5 px-4 py-3.5 rounded-2xl text-sm font-semibold transition-all duration-200 text-left",
                  active === item.id
                    ? "bg-white/15 text-white shadow-[0_2px_8px_rgba(0,0,0,0.3)]"
                    : "text-white/60 hover:bg-white/10 hover:text-white"
                )}
              >
                <IconWrapper className={active === item.id ? "text-white" : "text-white/50"}>
                  {item.icon}
                </IconWrapper>
                {item.label}
              </button>
            ))}
          </div>

          <div className="px-3 pb-6 pt-2 space-y-1 border-t border-white/10">
            {bottomItems.map((item) => (
              <button
                key={item.id}
                onClick={() => { onNavigate(item.path); onClose(); }}
                className={clsx(
                  "w-full flex items-center gap-3.5 px-4 py-3.5 rounded-2xl text-sm font-semibold transition-all duration-200 text-left",
                  active === item.id
                    ? "bg-white/15 text-white shadow-[0_2px_8px_rgba(0,0,0,0.3)]"
                    : "text-white/60 hover:bg-white/10 hover:text-white"
                )}
              >
                <IconWrapper className={active === item.id ? "text-white" : "text-white/50"}>
                  {item.icon}
                </IconWrapper>
                {item.label}
              </button>
            ))}
          </div>
        </nav>
      </div>
    </>
  );
};

const DesktopSidebar = ({
  items,
  bottomItems,
  active,
  onNavigate,
  role,
  brandPath,
}: {
  items: SidebarMenuItem[];
  bottomItems: SidebarMenuItem[];
  active: string;
  onNavigate: (path: string) => void;
  role: string;
  brandPath: string;
}) => {
  return (
    <aside
      className="hidden lg:flex w-16 flex-col items-center py-4 gap-2 flex-shrink-0 h-screen sticky top-0 z-20"
      style={{ background: SIDEBAR_GRADIENT }}
    >
      {/* Brand */}
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center mb-4 flex-shrink-0 cursor-pointer hover:ring-2 ring-[#C9973A]/50 transition-all"
        style={{ background: BRAND.gold }}
        onClick={() => onNavigate(brandPath)}
      >
        <span className="text-white font-bold text-sm">
          {
          role === "student"
          ? "S"
          : role === "landlord" || role === "landlord-manage"
          ? "L"
          : role === "super_admin"
          ? "SA"
          : "M"
          }
        </span>
      </div>

      {/* Top items */}
      <nav className="flex flex-col items-center gap-1 flex-1">
        {items.map((item) => (
          <div key={item.id} className="relative group">
            <button
              onClick={() => onNavigate(item.path)}
              aria-label={item.label}
              className={clsx(
                "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200",
                active === item.id
                  ? "bg-white/20 text-white shadow-[0_2px_6px_rgba(0,0,0,0.4)]"
                  : "text-white/75 hover:bg-white/10 hover:text-white"
              )}
            >
              <IconWrapper>{item.icon}</IconWrapper>
            </button>
            <DesktopTooltip label={item.label} />
          </div>
        ))}
      </nav>

      {/* Bottom items */}
      <div className="flex flex-col items-center gap-1 mt-auto">
        {bottomItems.map((item) => (
          <div key={item.id} className="relative group">
            <button
              onClick={() => onNavigate(item.path)}
              aria-label={item.label}
              className={clsx(
              "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200",
              active === item.id
                ? "bg-white/20 text-white shadow-[0_2px_6px_rgba(0,0,0,0.4)]"
                : "text-white/75 hover:bg-white/10 hover:text-white"
            )}
            >
              <IconWrapper>{item.icon}</IconWrapper>
            </button>
            <DesktopTooltip label={item.label} />
          </div>
        ))}
      </div>
    </aside>
  );
};

// ─── Main export ──────────────────────────────────────────────────────────────

export default function Sidebar({ role, profile }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Role is derived entirely from the URL
  const effectiveRole = getRoleFromPathname(location.pathname, role);

  // ── Persist accId when on the accommodation dashboard ──────────────────────
  const accMatch = location.pathname.match(/^\/landlord\/accommodation\/(\d+)/);
  const accIdFromPath = accMatch?.[1] ?? "";

  useEffect(() => {
    if (accIdFromPath) {
      sessionStorage.setItem(ACC_ID_KEY, accIdFromPath);
    }
  }, [accIdFromPath]);

  // The accId to use for navigation — prefer URL, fall back to stored value
  const storedAccId = sessionStorage.getItem(ACC_ID_KEY) ?? "";
  const accId = accIdFromPath || storedAccId;

  const active = getActiveId(location.pathname, effectiveRole);

  // ── Build nav items ─────────────────────────────────────────────────────────
  const items: SidebarMenuItem[] = (() => {
    switch (effectiveRole) {
      case "student":
        return [
          { id: "dashboard",    icon: <DashboardIcon   className="w-5 h-5" />,           path: "/student/dashboard",         label: "Dashboard" },
          { id: "search",       icon: <SearchIcon      className="w-[21px] h-[21px]" />, path: "/student/browse",            label: "Browse Rooms" },
          { id: "applications", icon: <ApplicationIcon className="w-[26px] h-[26px]" />, path: "/student/applications",      label: "Applications" },
          { id: "documents",    icon: <DocumentIcon    className="w-[20px] h-[20px]" />, path: "/student/billingdashboard",  label: "Billing Statements" },
        ];

      case "manager":
        return [
          { id: "dashboard",      label: "Dashboard",        icon: <DashboardIcon />,       path: "/manager/dashboard" },
          { id: "applications",   label: "Applications",     icon: <ApplicationIcon />,     path: "/manager/applications" },
          { id: "reports",        label: "Occupancy",        icon: <OccupancyIcon />,       path: "/manager/occupancy-records" },
          { id: "users",          label: "Room Assignments", icon: <RoomAssignmentIcon />,  path: "/manager/room-assignment" },
          { id: "waitlist",       label: "Waitlist",         icon: <WaitlistIcon />,        path: "/manager/waitlist" },
          { id: "movein-moveout", label: "Move In/Out",      icon: <MoveIcon />,            path: "/manager/movein-moveout" },
        ];

      case "landlord":
        return [
          { id: "dashboard",   label: "Dashboard",                 icon: <DashboardIcon />,           path: accId ? `/landlord/accommodation/${accId}` : "/landlord/dashboard" },
          { id: "room",        label: "Rooms",                     icon: <RoomIcon />,                path: "/landlord/rooms" },
          { id: "application", label: "Applications & Waitlisted", icon: <LandlordApplicationIcon />, path: accId ? `/landlord/applications?accId=${accId}` : "/landlord/applications" },
          { id: "fees",        label: "Fees",                      icon: <FeesIcon />,                path: "/landlord/fees" },
        ];

      case "landlord-manage":
        return [
          { id: "dashboard", label: "Dashboard", icon: <DashboardIcon />, path: "/landlord/dashboard" },
        ];
      
      case "super_admin":
        return [
          {
            id: "dashboard",
            label: "Dashboard",
            icon: <DashboardIcon />,
            path: "/admin/dashboard",
          },
          {
            id: "student-verifications",
            label: "Student Verifications",
            icon: <StudentVerification />,
            path: "/admin/student-verifications",
          },
          {
            id: "landlord-verifications",
            label: "Housing Administrator Verifications",
            icon: <AdminVerification />,
            path: "/admin/landlord-verifications",
          },
          {
            id: "pending-accommodations",
            label: "Pending Accommodations",
            icon: <RoomIcon />,
            path: "/admin/pending-accommodations",
          },
          {
            id: "activity-logs",
            label: "Activity Logs",
            icon: <DocumentIcon />,
            path: "/admin/activity-logs",
          },
        ];

      default:
        return [];
    }
  })();

  // ── Profile path: carry ?from=<accId> when in the full landlord context ─────
  const profilePath = (() => {
    if (effectiveRole === "landlord") {
      // Coming from the accommodation dashboard — embed the accId so profile
      // page can render the correct sidebar on the way back
      return `/landlord/profile${accId ? `?from=${accId}` : ""}`;
    }
    if (effectiveRole === "landlord-manage") {
      return "/landlord/profile";
    }
    return `/${effectiveRole}/profile`;
  })();

  const bottomItems: SidebarMenuItem[] =
    effectiveRole === "super_admin"
      ? [
          {
            id: "logout",
            label: "Logout",
            icon: <LogoutIcon />,
            path: "/logout",
          },
        ]
      : [
          {
            id: "account",
            label: "Account",
            icon: <ProfileIcon />,
            path: profilePath,
          },
          {
            id: "logout",
            label: "Logout",
            icon: <LogoutIcon />,
            path: "/logout",
          },
        ];

  // ── Brand (logo) click destination ─────────────────────────────────────────
  const brandPath = (() => {
    if (effectiveRole === "landlord") {
      return accId ? `/landlord/accommodation/${accId}` : "/landlord/dashboard";
    }
    if (effectiveRole === "landlord-manage") return "/landlord/dashboard";
    if (effectiveRole === "manager") return "/manager/dashboard";
    if (effectiveRole === "super_admin") return "/admin/dashboard";
    return "/student/dashboard";
  })();

  const handleNavigate = useCallback(
    (path: string) => {
      if (path === "/logout") {
        navigate("/");
      } else {
        navigate(path);
      }
    },
    [navigate]
  );

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        aria-label="Open menu"
        className="lg:hidden fixed top-4 p-0 left-4 z-50 w-10 h-10 bg-[#6B0F2B] rounded-xl flex items-center justify-center text-white shadow-lg hover:bg-[#9E2040] transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <MobileDrawer
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        role={effectiveRole}
        profile={profile}
        items={items}
        bottomItems={bottomItems}
        active={active}
        onNavigate={handleNavigate}
      />

      <DesktopSidebar
        items={items}
        bottomItems={bottomItems}
        active={active}
        onNavigate={handleNavigate}
        role={effectiveRole}
        brandPath={brandPath}
      />
    </>
  );
}