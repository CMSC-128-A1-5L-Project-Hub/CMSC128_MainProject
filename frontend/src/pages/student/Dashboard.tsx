import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import { api } from "../../api/axios"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

// Helpers
const capitalize = (str: string) =>
  str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

const formatStayType = (type: string) =>
  capitalize(type.replace("_", "-"));

const formatRestriction = (value: string) => {
  if (!value) return "";
  if (value === "female-only") return "Female Only";
  if (value === "male-only") return "Male Only";
  if (value === "coed") return "Coed";
  return value;
};

const formatAccommodationType = (value: string) => {
  if (!value) return "";
  if (value === "on-campus") return "On-campus";
  if (value === "off-campus") return "Off-campus";
  if (value === "partner_housing") return "UPLB Partner";
  return value;
};

const formatRating = (value: number | string | null | undefined) =>
  Number(value ?? 0).toFixed(1);

const emptyBilling: BillingOverview = {
  residenceHall: "-",
  dueDay: "-",
  dueMonth: "-",
  summaryTitle: "No Billing Yet",
  paidOn: "-",
  amountPaid: 0,
  nextDue: "-",
  monthlyRent: 0,
  remainingAmount: 0,
  totalPaid: 0,
  totalDue: 0,
  progressPercent: 0,
};
import HeroBanner from "../../components/dashboard/HeroBanner";
import AccommodationMap, { type AccommodationPin } from '../../components/AccommodationMapsBrowse'

// ── SVG / asset imports ────────────────────────────────────────────────────
import house_icon from "../../assets/icons/house_icon.svg";
import notif_icon from "../../assets/icons/notif_icon.svg";
import default_profile from "../../assets/icons/default_profile_female.svg";
import download_icon from "../../assets/icons/download.svg";
import bill_icon from "../../assets/icons/bill_icon.svg";

// ── Design tokens ──────────────────────────────────────────────────────────
const CLR = {
  dark: "#3D0718",
  mid: "#6B0F2B",
  accent: "#8C1535",
  gold: "#C9973A",
  goldLt: "#E8C37A",
  goldDk: "#a07825",
} as const;

// ── Types ──────────────────────────────────────────────────────────────────
type ApplicationStatus = "Approved" | "Pending" | "In Review";

interface Application {
  id: number;
  dorm: string;
  type: string;
  applied: string;
  location: string;
  status: ApplicationStatus;
}

interface BillingStatement {
  label: string;
  status: "Paid" | "Unpaid";
  onClick?: () => void;
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

interface StudentProfile {
  fullName: string;
  shortName: string;
  course: string;
  campus: string;
  email: string;
  phone: string;
  studentNo: string;
  college: string;
  yearLevel: string;
  status: string;
}

interface HeroContent {
  greeting: string;
  title: string;
  subtitle: string;
  pendingApplications: number;
  newNotificationsToday: number;
}

interface BillingOverview {
  residenceHall: string;
  dueDay: string;
  dueMonth: string;
  summaryTitle: string;
  paidOn: string;
  amountPaid: number;
  nextDue: string;
  monthlyRent: number;
  remainingAmount: number;
  totalPaid: number;
  totalDue: number;
  progressPercent: number;
}

// ── Mock Data ──────────────────────────────────────────────────────────────
const studentProfile: StudentProfile = {
  fullName: "Ana Marie Reyes",
  shortName: "Ana Reyes",
  course: "BS BIOLOGY",
  campus: "UPLB",
  email: "areyes@up.edu.ph",
  phone: "+63 912 345 6789",
  studentNo: "2023-12345",
  college: "CAS",
  yearLevel: "2nd Year",
  status: "Active",
};

const heroContent: HeroContent = {
  greeting: "Good Day",
  title: "Check your applications & explore new accommodations.",
  subtitle: "You have 2 pending applications and 3 new notifications today.",
  pendingApplications: 2,
  newNotificationsToday: 3,
};

const applications: Application[] = [
  {
    id: 1,
    dorm: "Kamia Residence",
    type: "Non-transient",
    applied: "Mar 12, 2026",
    location: "On-campus",
    status: "Approved",
  },
  {
    id: 2,
    dorm: "Molave Residence",
    type: "Non-transient",
    applied: "Mar 14, 2026",
    location: "Off-campus",
    status: "Pending",
  },
  {
    id: 3,
    dorm: "Narra Residence",
    type: "Non-transient",
    applied: "Mar 15, 2026",
    location: "Near Gate 1",
    status: "In Review",
  },
];

const recommended = [
  {
    id: 1,
    name: "Kamia Residence",
    tag: "Transient",
    size: "22 m²",
    location: "On-campus",
    price: 3200,
    rating: 4,
    review:
      "Rooms are clean and the dormitory manager is easy to talk to. I would recommend for anyone finding an affordable and safe dormitory in UPLB.",
    img: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&q=80",
  },
  {
    id: 2,
    name: "Narra Residence",
    tag: "Dormitory",
    size: "30 m²",
    location: "Off-campus",
    price: 8500,
    rating: 5,
    review:
      "The layout of the room is nice. There are so many amenities which caters to my needs as a student. It is also a close walk to the campus.",
    img: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&q=80",
  },
  {
    id: 3,
    name: "Molave Dorm",
    tag: "Dormitory",
    size: "28 m²",
    location: "On-campus",
    price: 5000,
    rating: 4,
    review:
      "Great location near the main gate. The rooms are spacious and well-ventilated. Staff are also very accommodating.",
    img: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&q=80",
  },
  {
    id: 4,
    name: "Acacia Suites",
    tag: "Transient",
    size: "20 m²",
    location: "Near Gate 1",
    price: 4200,
    rating: 3,
    review:
      "Affordable and decent stay. Best for short-term use. The place is clean but can get a bit noisy during peak hours.",
    img: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&q=80",
  },
];

const dashboardMapAccommodations: AccommodationPin[] = [
  {
    accommodationId: 1,
    accommodationName: "Kamia Residence",
    accommodationLocation: "UPLB Campus, Los Baños, Laguna",
    accommodationType: "on-campus",
    accommodationCapacity: 50,
    tenantRestriction: "female-only",
    latitude: 14.1672,
    longitude: 121.2430,
    minRent: 3200,
    maxRent: 3200,
    walkingDistance: 3,
    drivingDistance: 2,
    bikingDistance: 2,
    stayType: "transient",
    imageUrl: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&q=80",
  },
  {
    accommodationId: 2,
    accommodationName: "Narra Residence",
    accommodationLocation: "Off-campus, Los Baños, Laguna",
    accommodationType: "off-campus",
    accommodationCapacity: 30,
    tenantRestriction: "coed",
    latitude: 14.1690,
    longitude: 121.2455,
    minRent: 8500,
    maxRent: 8500,
    walkingDistance: 8,
    drivingDistance: 4,
    bikingDistance: 5,
    stayType: "non_transient",
    imageUrl: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&q=80",
  },
  {
    accommodationId: 3,
    accommodationName: "Molave Dorm",
    accommodationLocation: "On-campus, Los Baños, Laguna",
    accommodationType: "on-campus",
    accommodationCapacity: 40,
    tenantRestriction: "male-only",
    latitude: 14.1658,
    longitude: 121.2418,
    minRent: 5000,
    maxRent: 5000,
    walkingDistance: 5,
    drivingDistance: 3,
    bikingDistance: 3,
    stayType: "non_transient",
    imageUrl: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&q=80",
  },
  {
    accommodationId: 4,
    accommodationName: "Acacia Suites",
    accommodationLocation: "Near Gate 1, Los Baños, Laguna",
    accommodationType: "off-campus",
    accommodationCapacity: 20,
    tenantRestriction: "coed",
    latitude: 14.1645,
    longitude: 121.2400,
    minRent: 4200,
    maxRent: 4200,
    walkingDistance: 10,
    drivingDistance: 6,
    bikingDistance: 7,
    stayType: "transient",
    imageUrl: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&q=80",
  },
];

const billingOverview: BillingOverview = {
  residenceHall: "Kamia Residence Hall",
  dueDay: "20",
  dueMonth: "Mar",
  summaryTitle: "Rent Paid",
  paidOn: "March 1, 2026",
  amountPaid: 3200,
  nextDue: "June 1, 2026",
  monthlyRent: 3200,
  remainingAmount: 0,
  totalPaid: 3200,
  totalDue: 3200,
  progressPercent: 100,
};

const billingStatements: BillingStatement[] = [
  { label: "March Billing Statement", status: "Paid" },
  { label: "February Billing Statement", status: "Paid" },
  { label: "January Billing Statement", status: "Unpaid" },
];

// ── Inline Icons ───────────────────────────────────────────────────────────
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
    <circle cx="5" cy="12" r="1.5" />
    <circle cx="12" cy="12" r="1.5" />
    <circle cx="19" cy="12" r="1.5" />
  </svg>
);

const IconBell = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
    />
  </svg>
);

const IconUser = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
    />
  </svg>
);

const IconArrowNext = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
  </svg>
);

const IconHouse = ({ className = "w-3.5 h-3.5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
    />
  </svg>
);

const IconDocument = ({ className = "w-[18px] h-[18px]" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
    />
  </svg>
);

// ── Helper Components ──────────────────────────────────────────────────────
const StatusBadge = ({ status }: { status: ApplicationStatus }) => {
  const styles: Record<ApplicationStatus, string> = {
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
      <svg
        key={i}
        className={`w-3 h-3 ${i < rating ? "text-amber-400" : "text-gray-200"}`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ))}
  </div>
);

// ── Billing Section ────────────────────────────────────────────────────────
interface BillingSectionProps {
  overview: BillingOverview;
  statements: BillingStatement[];
}


const BillingSection = ({ overview, statements }: BillingSectionProps) => (
  <div className="space-y-5">
    <div className="flex items-start justify-between gap-3">
      {/* LEFT SIDE */}
      <div className="flex items-center gap-3 min-w-0">
        
        {/* ICON */}
        <div
          className="w-14 h-14 rounded-[18px] flex items-center justify-center flex-shrink-0 shadow-[0_6px_14px_rgba(61,7,24,0.10)]"
          style={{
            background: `linear-gradient(135deg, ${CLR.mid} 0%, ${CLR.accent} 100%)`
          }}
        >
          <img
            src={bill_icon}
            alt="Billing"
            className="w-7 h-7 object-contain"
          />
        </div>

        {/* TEXT */}
        <div className="min-w-0">
          <p className="font-bold text-gray-900 text-[14px] leading-tight">
            Billing &amp; Payments
          </p>
          <p className="text-gray-400 text-[12px] leading-tight mt-0.5">
            {overview.residenceHall}
          </p>
        </div>
      </div>

      {/* RIGHT SIDE DATE BADGE */}
      <div className="bg-[#F3E9ED] rounded-[20px] px-2 pt-2.5 pb-1.5 flex flex-col items-center flex-shrink-0 min-w-[35px]">
        
        <div
          className="bg-white rounded-[14px] px-3 py-1 shadow-[0_6px_14px_rgba(61,7,24,0.12)]"
          style={{ color: CLR.mid }}
        >
          <p className="text-[20px] font-bold leading-none">
            {overview.dueDay}
          </p>
        </div>

        <p className="text-[12px] font-semibold mt-1 leading-none" style={{ color: CLR.mid }}>
          {overview.dueMonth}
        </p>
      </div>
    </div>
    <div className="bg-[#F7F1F3] rounded-3xl px-5 py-4 border border-[#EFE3E8]">
      <div className="flex items-center justify-between gap-4">
        {/* LEFT SIDE */}
        <div className="flex items-center gap-4 flex-1 min-w-0">
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0"
          style={{
            background: "linear-gradient(135deg, #166534 0%, #22C55E 100%)"
          }}
        >            
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <div className="flex-1 min-w-0">
            <p className="font-bold text-gray-900 text-[14px] leading-tight whitespace-nowrap">
              {overview.summaryTitle}
            </p>

            <p className="text-gray-400 text-[12px] leading-tight mt-1 whitespace-nowrap">
              Paid on {overview.paidOn} · ₱{overview.amountPaid.toLocaleString()}.00
            </p>

            <div className="mt-2">
              <span className="inline-block whitespace-nowrap px-4 py-1.5 -ml-1 rounded-full text-[12px] font-bold bg-[#DCEADF] text-green-700">
                Next due: {overview.nextDue}
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="flex-shrink-0 whitespace-nowrap text-right self-start -mt-1">
          <span className="font-bold text-[14px]" style={{ color: CLR.dark }}>
            ₱{overview.monthlyRent.toLocaleString()}
          </span>
          <span className="text-gray-400 font-normal text-[14px] ml-1">
            / month
          </span>
        </div>
    </div>
    </div>

    <div className="h-px bg-[#EADDE2]" />

    <div>
      <p className="text-[11px] font-bold tracking-widest uppercase text-[#A07B86] mb-3">
        Payment Progress
      </p>

      <div className="w-full h-2.5 bg-[#E9E1E4] rounded-full overflow-hidden">
        <div
          className="h-2.5 rounded-full relative"
          style={{
            width: `${overview.progressPercent}%`,
            background: `linear-gradient(90deg, ${CLR.mid}, ${CLR.gold})`,
          }}
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

    <div>
      <p className="text-[11px] font-bold tracking-widest uppercase text-[#A07B86] mb-4">
        Billing History
      </p>

      <div className="max-h-[280px] overflow-y-auto pr-1 space-y-3">
        {statements.map((b, index) => (
          <button
            key={b.label}
            type="button"
            onClick={b.onClick}
            className={`w-full text-left flex items-center gap-3 p-4 rounded-2xl bg-[#F8F1F4] border border-[#EFE5E8] transition hover:bg-[#F4EAEE] hover:shadow-[0_6px_14px_rgba(61,7,24,0.10)] focus:outline-none focus:ring-2 focus:ring-[#C9973A]/30 ${
              index === 0 ? "shadow-[0_6px_14px_rgba(61,7,24,0.12)]" : ""
            }`}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: CLR.mid, color: "#fff" }}
            >
              <img
                src={download_icon}
                alt=""
                className="w-4 h-4 object-contain"
              />
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-[15px] font-semibold text-gray-800 truncate">{b.label}</p>
              <p
                className={`text-sm font-semibold ${
                  b.status === "Paid" ? "text-green-600" : "text-red-500"
                }`}
              >
                {b.status}
              </p>
            </div>

            <IconChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
          </button>
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
  profile: StudentProfile;
  billing: BillingOverview;
  statements: BillingStatement[];
}

const DesktopProfilePanel = ({ profile, billing, statements }: DesktopProfilePanelProps) => (
  <aside className="hidden lg:flex w-[390px] xl:w-[420px] flex-shrink-0 flex-col gap-4 px-4 pb-4 bg-[#F6F2F4]">
    {/* Top Gradient  */}
    <div
      className="relative rounded-b-[30px] px-7 pt-6 pb-6 shadow-[...]"
      style={{ background: `linear-gradient(145deg, ${CLR.dark} 0%, ${CLR.mid} 60%, ${CLR.accent} 100%)` }}
    > 
      <div
        className="absolute top-0 left-0 w-full h-[79px] px] pointer-events-none"
        style={{
          background: "linear-gradient(90deg, #7A0C23 0%, #A61C3C 100%)"
        }}
      />
    <div className="relative z-10">
    {/* Profile Title and Notif Button */}
      <div className="flex items-center justify-between mb-6">
        <span className="text-[11px] font-bold tracking-widest uppercase text-white/75">My Profile</span>

       <button
          className="w-12 h-11 rounded-2xl flex items-center justify-center relative overflow-hidden"
          style={{ background: "rgba(255,255,255,0.08)" }}
        >
          <img
            src={notif_icon}
            alt="Notifications"
            className="w-full h-full object-contain scale-[2.5]"
          />

          <span
            className="absolute top-0.5 right-1 w-3 h-3 rounded-full border-2 border-white/80"
            style={{ background: CLR.gold }}
          />
        </button>
      </div>
      {/* Profile Content */}
      <div className="flex items-center gap-4">
        <div className="relative flex-shrink-0">
          <div
            className="w-[78px] h-[78px] rounded-full bg-white flex items-center justify-center border-[4px] overflow-hidden shadow-md"
            style={{ borderColor: CLR.gold }}
          >
            <img
              src={default_profile}
              alt="Default profile"
              className="w-full h-full object-cover"
            />
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
            {profile.course.toLocaleUpperCase()} · {profile.campus}
          </p>
          <p className="text-white/70 text-sm mt-1 truncate">{profile.email}</p>
          <p className="text-white/70 text-sm">{profile.phone}</p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-[1.4fr_1fr_1fr_1fr] gap-4">        {[
          { label: "Student No.", value: profile.studentNo },
          { label: "College", value: profile.college.toUpperCase() },
          { label: "Year Level", value: profile.yearLevel },
          { label: "Status", value: profile.status.charAt(0).toUpperCase() + profile.status.slice(1).toLowerCase(), green: true },
        ].map((item) => (
          <div key={item.label}>
            <p className="text-white/50 text-[10px] font-medium leading-tight mb-1.5">{item.label}</p>
            {"green" in item && item.green ? (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-green-100 text-green-700">
                {item.value}
              </span>
            ) : (
              <p className="text-white text-[14px] font-bold leading-tight whitespace-nowrap"> {item.value} </p>
            )}
          </div>
        ))}
      </div>
    </div>
    </div>
    <div className="bg-white rounded-[30px] px-7 pt-6 pb-8 shadow-[0_10px_24px_rgba(61,7,24,0.12)]">
      <BillingSection overview={billing} statements={statements} />
    </div>
  </aside>
);

// ── Main Dashboard ─────────────────────────────────────────────────────────
export default function Dashboard() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState("All");

  
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [pendingApplicationsCount, setPendingApplicationsCount] = useState(0);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);
  const [notificationsTodayCount, setNotificationsTodayCount] = useState(0);
  const [applications, setApplications] = useState<any[]>([]);
  const [applicationsLoading, setApplicationsLoading] = useState(true);
  const [recommendedDorms, setRecommendedDorms] = useState<any[]>([]);
  const [recommendedLoading, setRecommendedLoading] = useState(true);
  const [billingOverviewData, setBillingOverviewData] = useState<BillingOverview | null>(null);
  const [billingStatementsData, setBillingStatementsData] = useState<BillingStatement[]>([]);
  const [billingLoading, setBillingLoading] = useState(true);

    
  const {data: user,
    isLoading: isUserLoading,
    isError,
    } = useQuery({
    queryKey: ["me"],
    queryFn: async () => {
        const res = await api.get("/me");
        return res.data.data;
    },
    });

  const recommendedScrollRef = useRef<HTMLDivElement | null>(null);
  const scrollRecommendedRight = () => {
    recommendedScrollRef.current?.scrollBy({
      left: 320,
      behavior: "smooth",
    });
  };
  // Profile and authentication -------------------
  useEffect(() => {
  const fetchProfile = async () => {
    try {
      const res = await api.get("/student/profile");
      const data = res.data.data ?? res.data;

      setProfile({
        fullName: data.fullName ?? "",
        shortName: data.shortName ?? "",
        course: data.course ?? "",
        campus: data.campus ?? "",
        email: data.email ?? "",
        phone: data.phone ?? "",
        studentNo: data.studentNo ?? "",
        college: data.college ?? "",
        yearLevel: data.yearLevel ?? "",
        status: data.status ?? "",
      });
    } catch (error) {
      console.error("Failed to fetch profile:", error);
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

// -------------------------------------------------------

// Notification details fetch---------------------------------
  useEffect(() => {
    const fetchNotifications = async () => {
        try {
        const res = await api.get("/notifications");
        console.log("notifications:", res.data);


        const data = res.data.data ?? res.data;


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
// -------------------------------------------------------

// Applications fetch---------------------------------
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const res = await api.get("/applications/my-applications");
        const data = res.data.data ?? res.data;

        setApplications(data);

        const pendingCount = data.filter((app: any) =>
          String(app.applicationStatus ?? "").toLowerCase() === "pending"
        ).length;

        setPendingApplicationsCount(pendingCount);

        console.log("APPLICATIONS:", data);
        console.log("PENDING COUNT:", pendingCount);
      } catch (error) {
        console.error("Failed to fetch applications:", error);
      } finally {
        setApplicationsLoading(false);
      }
    };

    fetchApplications();
  }, []);

// -----------------------------------

// Recommended dorms fetch---------------------------------
useEffect(() => {
  const fetchRecommendedDorms = async () => {
    try {
      const res = await api.get('/recommended-accommodations')
      const data = res.data.data ?? res.data ?? []
      console.log("RECOMMENDED DORMS:", data);
      setRecommendedDorms(data)
    } catch (error) {
      console.error('Failed to fetch recommended dorms:', error)
    } finally {
      setRecommendedLoading(false); 
    }
  }

  fetchRecommendedDorms()
}, [])
// ---------------------------------

// Billing info fetch---------------------------------
useEffect(() => {
  const fetchBilling = async () => {
    try {
      const res = await api.get("/my-fees");
      const fees = res.data.data ?? res.data ?? [];

      console.log("BILLING:", fees);

      if (!Array.isArray(fees) || fees.length === 0) {
        setBillingOverviewData(null);
        setBillingStatementsData([]);
        return;
      }

      const sortedFees = [...fees].sort(
        (a, b) =>
          new Date(b.due_date).getTime() - new Date(a.due_date).getTime()
      );

      const latestFee = sortedFees[0];

      const totalDue = sortedFees.reduce(
        (sum, fee) => sum + Number(fee.fee_amount ?? 0),
        0
      );

      const remainingAmount = sortedFees.reduce(
        (sum, fee) => sum + Number(fee.fee_balance ?? 0),
        0
      );

      const totalPaid = totalDue - remainingAmount;

      const progressPercent =
        totalDue > 0 ? Math.round((totalPaid / totalDue) * 100) : 0;

      const dueDate = new Date(latestFee.due_date);

      const overview: BillingOverview = {
        residenceHall:
          latestFee.accommodation_name ?? "Unknown Residence Hall",
        dueDay: dueDate.getDate().toString(),
        dueMonth: dueDate.toLocaleString("en-US", { month: "short" }),
        summaryTitle:
          remainingAmount === 0
            ? "All Fees Paid"
            : totalPaid > 0
            ? "Partially Paid"
            : "Payment Due",
        paidOn: totalPaid > 0 ? "Recorded" : "-",
        amountPaid: totalPaid,
        nextDue: dueDate.toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        }),
        monthlyRent: Number(latestFee.fee_amount ?? 0),
        remainingAmount,
        totalPaid,
        totalDue,
        progressPercent,
      };

      const capitalize = (str?: string) =>
        str ? str.charAt(0).toUpperCase() + str.slice(1) : "Fee";

      const statements: BillingStatement[] = fees.map((f: any) => ({
        label: `${capitalize(f.fee_category)} - ${new Date(
          f.due_date
        ).toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        })}`,
        status: f.fee_status === "paid" ? "Paid" : "Unpaid",
      }));

      setBillingOverviewData(overview);
      setBillingStatementsData(statements);
    } catch (error) {
      console.error("Failed to fetch billing:", error);
      setBillingOverviewData(null);
      setBillingStatementsData([]);
    } finally {
      setBillingLoading(false);
    }
  };

  fetchBilling();
}, []);
// ---------------------------------

if (profileLoading) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F6F2F4]">
      <p className="text-gray-600">Loading profile...</p>
    </div>
  );
}

if (!profile) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F6F2F4]">
      <p className="text-gray-600">Profile not found.</p>
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

// ------------------------------------------------------



  const mapFilters = ["All", "On-Campus", "Off-Campus", "UPLB Partner"];

  return (
    <div className="flex h-screen overflow-hidden bg-[#F6F2F4] font-sans">
      {/* Reusable Sidebar */}
      <Sidebar role="student" profile={profile} />

      {/* Main content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="flex items-center justify-between px-4 sm:px-6 lg:px-8 pt-5 pb-3 lg:pt-7 lg:pb-2 sticky top-0 z-30 bg-[#F6F2F4]">
          <div className="flex items-center gap-3">
            <div className="hidden lg:flex items-center gap-2">
              <div className="w-1 h-6 rounded-full" style={{ background: CLR.mid }} />
            </div>
            <h1 className="font-serif italic text-2xl lg:text-4xl font-bold text-gray-900">Dashboard</h1>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-5 space-y-4 lg:space-y-5">
          <div
            className="relative rounded-2xl overflow-hidden flex items-center min-h-[140px] sm:min-h-[176px]"
            style={{ background: `linear-gradient(135deg, ${CLR.dark} 0%, ${CLR.accent} 60%, ${CLR.mid} 100%)` }}
          >
            <div className="relative z-10 px-5 sm:px-8 py-6">
              <p className="text-[10px] sm:text-xs font-bold tracking-widest uppercase mb-1" style={{ color: CLR.goldLt }}>
                {heroContent.greeting}, {profile.shortName}
              </p>
              <h2 className="text-white font-bold text-lg sm:text-2xl leading-snug mb-1.5 max-w-xs sm:max-w-sm">
                {heroContent.title}
              </h2>
              <p className="text-white/60 text-xs sm:text-sm">
                You have {pendingApplicationsCount} pending application{pendingApplicationsCount !== 1 && "s"} and {notificationsTodayCount} new notification{notificationsTodayCount !== 1 && "s"} today.              
              </p>
            </div>

            <div className="absolute right-0 bottom-0 h-full flex items-end pointer-events-none">
              <img src={house_icon} alt="" className="w-[130px] h-[130px]" />
            </div>
          </div>

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
                      <th
                        key={h}
                        className="px-4 sm:px-6 py-2.5 text-left text-[10px] font-bold tracking-widest text-gray-400 uppercase whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {applications.map((app:any) => (
                    <tr key={app.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 sm:px-6 py-3 sm:py-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex-shrink-0" style={{ background: CLR.mid }} />
                          <span className="font-medium text-gray-800 whitespace-nowrap">{app.accommodation?.accommodationName}</span>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 text-gray-500 whitespace-nowrap">{formatStayType(app.applicationStayType)}</td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 text-gray-500 whitespace-nowrap">{formatDate(app.applicationDate)}</td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 text-gray-500 whitespace-nowrap">{capitalize(app.accommodation?.accommodationType)}</td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4">
                         <StatusBadge status={
                          app.applicationStatus === "approved"
                            ? "Approved"
                            : app.applicationStatus === "pending"
                            ? "Pending"
                            : "In Review"
                        } />
                      </td>
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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="sm:col-span-1 lg:col-span-3 bg-white rounded-[28px] shadow-[0_10px_24px_rgba(61,7,24,0.12)] border border-[#EFE5E8] px-5 pt-5 pb-4">
              <div className="flex items-center justify-between pb-4 border-b border-[#F1E5EA]">
                <h3 className="font-bold text-[#1B2233] text-[15px]">Recommended</h3>
                <button
                  className="text-[14px] font-semibold flex items-center gap-1"
                  style={{ color: CLR.mid }}
                >
                  View all <IconChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-4 pt-5">
                <div
                  ref={recommendedScrollRef}
                  className="flex gap-4 flex-1 min-w-0 overflow-x-auto pb-2 snap-x snap-mandatory scroll-smooth"
                >
                  {recommendedLoading ? (
                    <div className="px-2 text-sm text-gray-500">Loading recommended dorms...</div>
                  ) : recommendedDorms.length === 0 ? (
                    <div className="px-2 text-sm text-gray-500">No recommended dorms found.</div>
                  ) : (
                    recommendedDorms.map((dorm: any) => (
                      <button
                        key={dorm.id}
                        type="button"
                        className="min-w-[280px] max-w-[280px] text-left flex-shrink-0 rounded-[24px] border border-[#EFE5E8] bg-white shadow-[0_8px_18px_rgba(61,7,24,0.06)] overflow-hidden transition hover:-translate-y-0.5 snap-start"
                      >
                      <div className="px-4 pt-4 pb-4">
                        <div className="relative h-[132px] rounded-[18px] overflow-hidden">
                          <img
                            src={dorm.primaryImageUrl ?? dorm.imageUrl ?? dorm.img}
                            alt={dorm.accommodation_name ?? dorm.accommodationName}
                            className="absolute inset-0 w-full h-full object-cover"
                          />

                          <div className="absolute top-3 left-3 bg-white rounded-full px-3 py-1.5 shadow-sm">
                            <span className="text-[9px] font-bold" style={{ color: CLR.gold }}>
                              {formatRating(dorm.average_rating ?? dorm.averageRating)} ★★★★★
                            </span>
                          </div>
                        </div>

                        <div className="mt-3">
                          <span
                            className="inline-flex items-center rounded-full px-4 py-1.5 text-[11px] font-bold leading-none"
                            style={{
                              background: "#D4A137",
                              color: "#3D0718",
                            }}
                          >
                             {formatRestriction(dorm.tenant_restriction ?? dorm.tenantRestriction)}
                          </span>
                        </div>

                        <h4 className="mt-3 text-[15px] font-bold leading-tight" style={{ color: CLR.dark }}>
                          {dorm.accommodation_name ?? dorm.accommodationName}
                        </h4>

                        <p className="mt-1.5 text-[1  2px] leading-tight text-[#8C6A75]">
                          {formatAccommodationType(dorm.accommodation_type ?? dorm.accommodationType)} ·{" "}
                          {dorm.accommodation_location ?? dorm.accommodationLocation}
                        </p>

                        {dorm.lowestRent != null && (
                          <p className="mt-2 text-[15px] font-bold leading-none" style={{ color: CLR.gold }}>
                            ₱{Number(dorm.lowestRent).toLocaleString()}
                            <span className="ml-1 font-normal text-[13px] text-[#8C6A75]">/ month</span>
                          </p>
                        )}

                        <div className="mt-4 h-px bg-[#F1E5EA]" />

                        <div className="mt-3 flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            {Array.from({ length: 5 }).map((_, i) => {
                              const rating = Math.round(Number(dorm.average_rating ?? dorm.averageRating ?? 0));
                              return (
                                <svg
                                  key={i}
                                  className={`w-4 h-4 ${i < rating ? "text-amber-400" : "text-gray-300"}`}
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              );
                            })}
                          </div>

                          <span className="text-[11px] text-[#9E7A86]">
                            Top rated
                          </span>
                        </div>

                        {dorm.sampleReview && (
                          <p
                            className="mt-3 text-[12px] italic leading-[1.35] text-[#4B2431]"
                            style={{
                              display: "-webkit-box",
                              WebkitLineClamp: 4,
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden",
                            }}
                          >
                            {dorm.sampleReview}
                          </p>
                        )}

                        <div className="mt-4 flex justify-center gap-1.5">
                          {[0, 1, 2, 3, 4].map((dot) => (
                            <span
                              key={dot}
                              className="w-2.5 h-2.5 rounded-full"
                              style={{ background: dot === 0 ? CLR.gold : "#D7D7D7" }}
                            />
                          ))}
                        </div>

                        <div className="mt-3 h-px bg-[#F1E5EA]" />
                      </div>
                    </button>
                  ))
                )}
              </div>
              </div>

              <button
                type="button"
                onClick={scrollRecommendedRight}
                className="hidden md:flex w-14 h-14 rounded-full text-white items-center justify-center shadow-[0_10px_24px_rgba(61,7,24,0.18)] flex-shrink-0"
                style={{ background: `linear-gradient(135deg, ${CLR.accent} 0%, ${CLR.mid} 100%)` }}
              >
                <IconArrowNext className="w-5 h-5" />
              </button>
            </div>

            <div className="sm:col-span-1 lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-5 flex flex-col gap-3">
              <div className="rounded-xl overflow-hidden flex-1 min-h-[220px] sm:min-h-[260px] relative">
                <div className="absolute inset-0">
                  <AccommodationMap
                    accommodations={dashboardMapAccommodations}
                    centeredAccommodation={dashboardMapAccommodations[0]}
                    onCardClick={(acc) => navigate(`/accommodations/${acc.accommodationId}`)}
                  />
                </div>
              </div>

              <div>
                <p className="text-[10px] font-bold tracking-widest uppercase text-gray-400 mb-2">
                  Dorm Type
                </p>

                <div className="relative mb-3">
                  <select className="w-full appearance-none border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#C9973A]/30 focus:border-[#C9973A] transition">
                    <option>All Types</option>
                    <option>Transient</option>
                    <option>Non-transient</option>
                  </select>
                  <IconChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                </div>

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

                <button
                  onClick={() => navigate("/browse")}
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
          <div className="lg:hidden bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-5">
            {billingLoading ? (
              <div className="bg-white rounded-2xl p-4">
                <p className="text-sm text-gray-500">Loading billing...</p>
              </div>
            ) : billingOverviewData ? (
              <BillingSection
                overview={billingOverviewData ?? emptyBilling}
                statements={billingStatementsData}
              />
            ) : (
              <div className="bg-white rounded-2xl p-4">
                <p className="text-sm text-gray-500">No billing data found.</p>
              </div>
            )}
          </div>
        </div>
      </main> 

      <DesktopProfilePanel
        profile={profile}
        billing={billingOverviewData ?? emptyBilling}
        statements={billingStatementsData}
      />
    </div>
  );
}