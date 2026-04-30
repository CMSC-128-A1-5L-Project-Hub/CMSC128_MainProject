import { useState, useCallback, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import clsx from "clsx";

import DashboardIcon from "../assets/icons/dashboard.svg?react";
import SearchIcon from "../assets/icons/search.svg?react";
import ApplicationIcon from "../assets/icons/applications.svg?react";
import ProfileIcon from "../assets/icons/profile.svg?react";
import DocumentIcon from "../assets/icons/documents.svg?react";
import LogoutIcon from "../assets/icons/logout.svg?react";
import { MdOutlineMeetingRoom } from "react-icons/md";
import { BsUiChecks } from "react-icons/bs";
import { PiCashRegister } from "react-icons/pi";

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

interface SidebarMenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
}

interface SidebarProps {
  role: "student" | "landlord" | "manager" | "landlordDashboard";
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

function getActiveId(pathname: string, role: string): string {
  if (role === "student") {
    if (pathname.startsWith("/student/billingdashboard")) return "documents";
    if (pathname.startsWith("/student/dashboard")) return "dashboard";
    if (pathname.startsWith("/browse")) return "search";
    if (pathname.startsWith("/student/applications")) return "applications";
    if (pathname.startsWith("/student/profile")) return "account";
    return "dashboard";
  }
  if (role === "manager") {
    if (pathname.startsWith("/manager/dashboard")) return "dashboard";
    if (pathname.startsWith("/manager/applications")) return "applications";
    if (pathname.startsWith("/manager/occupancy-records")) return "reports";
    if (pathname.startsWith("/manager/room-assignment")) return "users";
    if (pathname.startsWith("/manager/waitlist")) return "waitlist";
    if (pathname.startsWith("/manager/movein-moveout")) return "movein-moveout";
    if (pathname.startsWith("/manager/profile")) return "account";
    return "dashboard";
  }
  if (role === "landlordDashboard") {
    if (pathname.startsWith("/landlord/accommodations")) return "dashboard";
    if (pathname.startsWith("/landlord/rooms")) return "room";
    if (pathname.startsWith("/landlord/applications") || pathname.startsWith("/landlord/waitlist")) return "application";
    if (pathname.startsWith("/landlord/fees")) return "fees";
    if (pathname.startsWith("/landlord/profile")) return "account";
    return "dashboard";
  }
  return "dashboard";
}

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
      text-[11px] font-semibold tracking-wide
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
            {role === "student" ? "S" : role === "landlord" ? "L" : "M"}
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
            ].filter((i) => i.value).map((item) => (
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

        {/* Navigation — top items scroll, bottom items pinned to footer */}
        <nav className="flex-1 flex flex-col overflow-hidden">
          {/* Scrollable top items */}
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

          {/* Pinned bottom items (Account, Logout) */}
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
}: {
  items: SidebarMenuItem[];
  bottomItems: SidebarMenuItem[];
  active: string;
  onNavigate: (path: string) => void;
  role: string;
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
        onClick={() => onNavigate(items[0]?.path || "/")}
      >
        <span className="text-white font-bold text-sm">
          {role === "student" ? "S" : role === "landlord" ? "L" : "M"}
        </span>
      </div>

      {/* Top items — FIX: IconWrapper with react-icons support */}
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
              className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 text-white/75 hover:bg-white/10 hover:text-white"
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

export default function Sidebar({ role, profile }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const active = getActiveId(location.pathname, role);

  // FIX: react-icons sized via className prop directly, not relying on CSS selectors alone
  const items: SidebarMenuItem[] = (() => {
    switch (role) {
      case "student":
        return [
          { id: "dashboard", label: "Dashboard", icon: <DashboardIcon />, path: "/student/dashboard" },
          { id: "search", label: "Browse Rooms", icon: <SearchIcon />, path: "/browse" },
          { id: "applications", label: "Applications", icon: <ApplicationIcon />, path: "/student/applications" },
          { id: "documents", label: "Billing", icon: <DocumentIcon />, path: "/student/billingdashboard" },
        ];
      case "manager":
        return [
          { id: "dashboard", label: "Dashboard", icon: <DashboardIcon />, path: "/manager/dashboard" },
          { id: "applications", label: "Applications", icon: <DocumentIcon />, path: "/manager/applications" },
          { id: "reports", label: "Occupancy", icon: <DocumentIcon />, path: "/manager/occupancy-records" },
          { id: "users", label: "Room Assign", icon: <ApplicationIcon />, path: "/manager/room-assignment" },
          { id: "waitlist", label: "Waitlist", icon: <DocumentIcon />, path: "/manager/waitlist" },
          { id: "movein-moveout", label: "Move In/Out", icon: <DocumentIcon />, path: "/manager/movein-moveout" },
        ];
      case "landlordDashboard":
        return [
          { id: "dashboard", label: "Dashboard", icon: <DashboardIcon />, path: "/landlord/accommodations" },
          // size={20} sets width/height directly as inline style — overrides react-icons default "1em"
          { id: "room", label: "Rooms", icon: <MdOutlineMeetingRoom size={20} />, path: "/landlord/rooms" },
          { id: "application", label: "Applications", icon: <BsUiChecks size={20} />, path: "/landlord/applications" },
          { id: "fees", label: "Fees", icon: <PiCashRegister size={20} />, path: "/landlord/fees" },
        ];
      default:
        return [];
    }
  })();

  const bottomItems: SidebarMenuItem[] = [
    { id: "account", label: "Account", icon: <ProfileIcon />, path: `/${role}/profile` },
    { id: "logout", label: "Logout", icon: <LogoutIcon />, path: "/logout" },
  ];

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
        className="lg:hidden fixed top-4 left-4 z-50 w-10 h-10 bg-[#6B0F2B] rounded-xl flex items-center justify-center text-white shadow-lg hover:bg-[#9E2040] transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <MobileDrawer
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        role={role}
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
        role={role}
      />
    </>
  );
}