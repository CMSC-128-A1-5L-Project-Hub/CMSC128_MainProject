// Sidebar.tsx
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

// SVG icon imports
import DashboardIcon   from "../assets/icons/dashboard.svg?react";
import SearchIcon      from "../assets/icons/search.svg?react";
import ApplicationIcon from "../assets/icons/applications.svg?react";
import ProfileIcon     from "../assets/icons/profile.svg?react";
import DocumentIcon    from "../assets/icons/documents.svg?react";
import LogoutIcon      from "../assets/icons/logout.svg?react";

// Design tokens (matching Dashboard)
const CLR = {
  dark:   "#3D0718",
  mid:    "#6B0F2B",
  accent: "#8C1535",
  gold:   "#C9973A",
  goldLt: "#E8C37A",
  goldDk: "#a07825",
} as const;

const GRADIENT_MOBILE = "linear-gradient(160deg, #2A0410 0%, #3D0718 40%, #6B0F2B 75%, #9E2040 100%)";
const GRADIENT_DESKTOP = "linear-gradient(180deg, #2A0410 0%, #3D0718 40%, #6B0F2B 75%, #9E2040 100%)";

interface SidebarProps {
  role: "student" | "landlord" | "manager";
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

// Mobile Drawer Navigation
const MobileDrawer = ({ 
  open, 
  onClose, 
  role, 
  profile,
  topItems,
  bottomItems,
  active,
  onNavigate
}: { 
  open: boolean; 
  onClose: () => void; 
  role: string; 
  profile?: any;
  topItems: any[];
  bottomItems: any[];
  active: string;
  onNavigate: (id: string, path: string) => void;
}) => {
  const [activeItem, setActiveItem] = useState(active);

  const handleNavigation = (id: string, path: string) => {
    setActiveItem(id);
    onNavigate(id, path);
    onClose();
  };

  const defaultProfile = {
    fullName: "User Name",
    shortName: "User",
    email: "user@up.edu.ph",
    ...profile
  };

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={onClose} />
      )}

      <div
        className={`fixed top-0 left-0 bottom-0 z-50 w-72 flex flex-col transition-transform duration-300 ease-in-out lg:hidden ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ background: GRADIENT_MOBILE }}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 pt-6 pb-4">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: CLR.gold }}
          >
            <span className="text-white font-bold text-sm">
              {role === "student" ? "S" : role === "landlord" ? "L" : "M"}
            </span>
          </div>
          <button onClick={onClose} className="text-white/60 hover:text-white text-2xl">
            ✕
          </button>
        </div>

        {/* Profile info summary */}
        <div className="px-5 pb-6 border-b border-white/10">
          <div className="flex items-center gap-3 mb-4">
            <div className="relative flex-shrink-0">
              <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: "rgba(255,255,255,0.2)" }}>
                <svg className="w-6 h-6 text-white/60" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-green-400 border-2" style={{ borderColor: CLR.dark }} />
            </div>
            <div>
              <p className="text-white font-bold text-base leading-tight">{defaultProfile.fullName}</p>
              {(defaultProfile.course || defaultProfile.campus) && (
                <p className="text-xs font-semibold mt-0.5" style={{ color: CLR.goldLt }}>
                  {[defaultProfile.course, defaultProfile.campus].filter(Boolean).join(" · ")}
                </p>
              )}
              <p className="text-white/50 text-xs">{defaultProfile.email}</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-x-3 gap-y-1">
            {[
              { label: "Student No.", value: defaultProfile.studentNo },
              { label: "College", value: defaultProfile.college },
              { label: "Year Level", value: defaultProfile.yearLevel },
            ]
              .filter((item) => !!item.value)
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

        {/* Navigation links */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {topItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavigation(item.id, item.path)}
              className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-2xl text-sm font-semibold transition-all text-left ${
                activeItem === item.id
                  ? "bg-white/15 text-white"
                  : "text-white/60 hover:bg-white/10 hover:text-white"
              }`}
            >
              <span className={`flex-shrink-0 ${activeItem === item.id ? "text-white" : "text-white/50"}`}>
                {item.icon}
              </span>
              {item.id === "dashboard" && "Dashboard"}
              {item.id === "search" && "Browse Rooms"}
              {item.id === "properties" && "Properties"}
              {item.id === "applications" && "Applications"}
              {item.id === "tenants" && "Tenants"}
              {item.id === "documents" && "Documents"}
              {item.id === "reports" && "Reports"}
              {item.id === "users" && "Users"}
            </button>
          ))}

          <div className="pt-4 mt-4 border-t border-white/10">
            {bottomItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.id, item.path)}
                className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-2xl text-sm font-semibold transition-all text-left ${
                  activeItem === item.id
                    ? "bg-white/15 text-white"
                    : "text-white/60 hover:bg-white/10 hover:text-white"
                }`}
              >
                <span className={`flex-shrink-0 ${activeItem === item.id ? "text-white" : "text-white/50"}`}>
                  {item.icon}
                </span>
                {item.id === "account" && "Account"}
                {item.id === "logout" && "Logout"}
              </button>
            ))}
          </div>
        </nav>
      </div>
    </>
  );
};

// Desktop Sidebar
const DesktopSidebar = ({ 
  topItems, 
  bottomItems, 
  active, 
  onNavigate,
  role 
}: { 
  topItems: any[]; 
  bottomItems: any[]; 
  active: string; 
  onNavigate: (id: string, path: string) => void;
  role: string;
}) => {
  return (
    <aside
      className="hidden lg:flex w-16 flex-col items-center py-4 gap-2 flex-shrink-0 h-screen sticky top-0"
      style={{ background: GRADIENT_DESKTOP }}
    >
      {/* Brand mark */}
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center mb-4 flex-shrink-0 cursor-pointer"
        style={{ background: CLR.gold }}
        onClick={() => onNavigate("dashboard", topItems[0]?.path || "/")}
      >
        <span className="text-white font-bold text-sm">
          {role === "student" ? "S" : role === "landlord" ? "L" : "M"}
        </span>
      </div>

      {/* Primary nav icons */}
      <nav className="flex flex-col items-center gap-1 flex-1">
        {topItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id, item.path)}
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
            onClick={() => onNavigate(item.id, item.path)}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all"
          >
            <span className="flex items-center justify-center">{item.icon}</span>
          </button>
        ))}
      </div>
    </aside>
  );
};

// Main Sidebar Component
export default function Sidebar({ role, profile }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const [active, setActive] = useState(() => {
    const path = location.pathname;
    if (path.includes("dashboard")) return "dashboard";
    if (path.includes("search") || path.includes("properties")) return "search";
    if (path.includes("applications") || path.includes("tenants")) return "applications";
    if (path.includes("documents") || path.includes("reports") || path.includes("users")) return "documents";
    return "dashboard";
  });

  const getTopItems = () => {
    switch (role) {
      case "student":
        return [
          { id: "dashboard",    icon: <DashboardIcon   className="w-5 h-5" />, path: "/dashboard", label: "Dashboard" },
          { id: "search",       icon: <SearchIcon      className="w-[21px] h-[21px]" />, path: "/search", label: "Browse Rooms" },
          { id: "applications", icon: <ApplicationIcon className="w-[26px] h-[26px]" />, path: "/applications", label: "Applications" },
          { id: "documents",    icon: <DocumentIcon    className="w-[20px] h-[20px]" />, path: "/documents", label: "Documents" },
        ];
      case "landlord":
        return [
          { id: "dashboard", icon: <DashboardIcon className="w-5 h-5" />, path: "/landlord/manage/accommodation", label: "Dashboard" },
        ];
      case "manager":
        return [
          { id: "dashboard",  icon: <DashboardIcon   className="w-5 h-5" />, path: "/manager/dashboard", label: "Dashboard" },
          { id: "reports",    icon: <SearchIcon      className="w-[21px] h-[21px]" />, path: "/manager/reports", label: "Reports" },
          { id: "users",      icon: <ApplicationIcon className="w-[26px] h-[26px]" />, path: "/manager/users", label: "Users" },
          { id: "properties", icon: <DocumentIcon    className="w-[20px] h-[20px]" />, path: "/manager/properties", label: "Properties" },
        ];
      default:
        return [];
    }
  };

  const getBottomItems = () => {
    return [
      { id: "account", icon: <ProfileIcon className="w-[22px] h-[22px]" />, path: `/${role}/profile`, label: "Account" },
      { id: "logout",  icon: <LogoutIcon  className="w-[23px] h-[23px]" />, path: "/logout", label: "Logout" },
    ];
  };

  const topItems = getTopItems();
  const bottomItems = getBottomItems();

  const handleNavigation = (id: string, path: string) => {
    setActive(id);
    if (id === "logout") {
      console.log("Logging out...");
      navigate("/login");
    } else {
      navigate(path);
    }
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setMobileDrawerOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 w-10 h-10 bg-[#7a001f] rounded-lg flex items-center justify-center text-white shadow-lg"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <MobileDrawer
        open={mobileDrawerOpen}
        onClose={() => setMobileDrawerOpen(false)}
        role={role}
        profile={profile}
        topItems={topItems}
        bottomItems={bottomItems}
        active={active}
        onNavigate={handleNavigation}
      />

      <DesktopSidebar
        topItems={topItems}
        bottomItems={bottomItems}
        active={active}
        onNavigate={handleNavigation}
        role={role}
      />
    </>
  );
}