import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { MdChevronLeft, MdChevronRight } from "react-icons/md";
import Sidebar from "../../components/Sidebar";
import GradientPillSelect from "../../components/DropDownGradient.tsx";

import { api } from "../../api/axios";


//MapBox Imports
import Map, { Marker, NavigationControl, Source, Layer } from 'react-map-gl'
import type { LayerProps } from 'react-map-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import ApplicationModals from "@/components/applications/ApplicationModals.tsx";
import RoomApplicationModal from "@/components/RoomApplicationModal.tsx";

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN
const UPLB_COORDS = { longitude: 121.2436, latitude: 14.1654 }



const CLR = {
  dark: "#3D0718",
  mid: "#6B0F2B",
  accent: "#8C1535",
  subtext: "#9A7080",
  green: "1A7A4A",
  green_acc: "2D9A5F",
  gold: "#C9973A",
  goldLt: "#E8C37A",
} as const;
//todo: configure file paths images, from db 
//will check pa 
const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3333";
function assetUrl(filePath: string) { return `${BASE_URL}${filePath}`; }

const GRID_COLS = "grid grid-cols-1 lg:grid-cols-[1.75fr_1fr] gap-3";

interface FileMetadata {
  id: number;
  file_name: string;
  file_path: string; 
  file_type: "image" | "document";
}

interface AccomImage {
  accommodation_id: number;
  image_file_id: number;
  file: FileMetadata; 
}

interface AccomID {
  accomodation_id: number;
  tag_detail: string;
}

interface AccomTag {
  accommodation_id: number;
  tag_detail: string;
}



interface Manager {
  userId: number;
  managerStatus: string;
  verifiedAt: string | null;
  user?: {
    fname: string;
    lname: string;
    email: string;
    phone?: string;
    pfp_file?: FileMetadata;
  };
}

//accommodation_id: getAccom("Scholar's Dorm"), room_number: '502', room_type: 'shared', room_stay_type: 'non_transient', room_capacity: 3, room_current_occupancy: 2, room_building: 'Building C', room_rent: 6000.00, tenant_restriction: 'coed', room_availability: 'available'
interface Room{
  id: number;
  accommodation_id: number;
  room_number: string;
  room_type: "single" | "double" | "shared";
  room_stay_type: "transient" | "non_transient";
  room_availability: "available" | "occupied" | "maintenance";
  room_capacity: number;
  room_current_occupancy: number;
  room_building: string;
  room_rent: number;
  tenant_restriction: "male" | "female" | "coed";
  advance_months?: number;
  deposit_months?: number;
}

interface ReviewUser {
  fname: string;
  lname: string;
  pfp_file?: FileMetadata;
}

interface Review{
  id: number;
  accommodation_id: number;
  student_number: string;
  rating: number;
  content: string | null;
  created_at?: string;
  student?: { user?: ReviewUser };
}

interface Accommodation {
  id: number;
  accommodationName: string;
  accommodationLocation: string;
  accommodationType: "on_campus" | "off_campus" | "partner_housing";
  accommodationSize: number;
  accommodationCapacity: number;
  tenant_restriction: "coed" | "male-only" | "female-only";
  application_start_date: string;
  application_end_date: string;
  images: AccomImage[];
  tags: AccomTag[];
  rooms: Room[];
  reviews: Review[];
  manager: Manager;
  avgrating: number;
  latitude: number;
  longitude: number;

  cheapestRoomOverall?: number | string | null;

  pricing?: {
    overallStartingPrice?: number | string | null;
    roomTypes?: Record<string, any>;
    allInclusions?: string[];
  };
}

//Mock data for requirements

const MOCK_REQUIREMENTS = [
  { id: 1, name: "Parent's Consent Form", size: "256 KB", dateModified: "04/05/26 at 1:02PM" },
  { id: 2, name: "Dormitory Agreement Form", size: "189 KB", dateModified: "04/05/26 at 1:02PM" },
  { id: 3, name: "Medical Certificate Template", size: "98 KB", dateModified: "04/03/26 at 9:00AM" },
  { id: 4, name: "Parent's Valid ID", size: "—", dateModified: "—" },
  { id: 5, name: "Enrollment Form / COR", size: "—", dateModified: "—" },
];


//Inline icons
const IconPlus = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
  </svg>
);

const IconBack = () => (
  <svg width="800px" height="800px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 10L3.29289 10.7071L2.58579 10L3.29289 9.29289L4 10ZM21 18C21 18.5523 20.5523 19 20 19C19.4477 19 19 18.5523 19 18L21 18ZM8.29289 15.7071L3.29289 10.7071L4.70711 9.29289L9.70711 14.2929L8.29289 15.7071ZM3.29289 9.29289L8.29289 4.29289L9.70711 5.70711L4.70711 10.7071L3.29289 9.29289ZM4 9L14 9L14 11L4 11L4 9ZM21 16L21 18L19 18L19 16L21 16ZM14 9C17.866 9 21 12.134 21 16L19 16C19 13.2386 16.7614 11 14 11L14 9Z" fill="#33363F"/>
  </svg>
)

const IconHeart = ({ filled }: { filled: boolean }) => (
  <svg width="24px" height="24px" fill={filled ? CLR.mid : "none"} stroke={CLR.mid} strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

const IconShare = () => (
  <svg width="24px" height="24px" fill={CLR.mid} stroke={CLR.mid}  strokeWidth={2} viewBox="0 0 24 24">
    <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
  </svg>
);

const IconReport = () => (
  <svg width="24px" height="24px" fill={CLR.mid} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" d="M16,2 C16.2652165,2 16.5195704,2.10535684 16.7071068,2.29289322 L21.7071068,7.29289322 C21.8946432,7.4804296 22,7.73478351 22,8 L22,15 C22,15.2339365 21.9179838,15.4604694 21.7682213,15.6401844 L16.7682213,21.6401844 C16.5782275,21.868177 16.2967798,22 16,22 L8,22 C7.73478351,22 7.4804296,21.8946432 7.29289322,21.7071068 L2.29289322,16.7071068 C2.10535684,16.5195704 2,16.2652165 2,16 L2,8 C2,7.73478351 2.10535684,7.4804296 2.29289322,7.29289322 L7.29289322,2.29289322 C7.4804296,2.10535684 7.73478351,2 8,2 L16,2 Z M15.5857864,4 L8.41421356,4 L4,8.41421356 L4,15.5857864 L8.41421356,20 L15.5316251,20 L20,14.6379501 L20,8.41421356 L15.5857864,4 Z M12,16 C12.5522847,16 13,16.4477153 13,17 C13,17.5522847 12.5522847,18 12,18 C11.4477153,18 11,17.5522847 11,17 C11,16.4477153 11.4477153,16 12,16 Z M12,6 C12.5522847,6 13,6.44771525 13,7 L13,13 C13,13.5522847 12.5522847,14 12,14 C11.4477153,14 11,13.5522847 11,13 L11,7 C11,6.44771525 11.4477153,6 12,6 Z"/>
  </svg>
)

const IconBolt = () => (
  <svg width="24px" fill={CLR.mid} height="24px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M17.168 8H13l.806-4.835A1 1 0 0 0 12.819 2H7.667a1 1 0 0 0-.986.835l-1.667 10A1 1 0 0 0 6 14h4v8l8.01-12.459A1 1 0 0 0 17.168 8z"/></svg>
)

const IconDroplet = () => (
  <svg width="24.2px" height="24.2px" viewBox="0 0 24.2 24.2" fill={CLR.mid} xmlns="http://www.w3.org/2000/svg"><g data-name="Layer 2"><g data-name="droplet"><rect x=".1" y=".1" width="24" height="24" transform="rotate(.48 11.987 11.887)" opacity="0"/><path d="M12 21.1a7.4 7.4 0 0 1-5.28-2.28 7.73 7.73 0 0 1 .1-10.77l4.64-4.65a.94.94 0 0 1 .71-.3 1 1 0 0 1 .71.31l4.56 4.72a7.73 7.73 0 0 1-.09 10.77A7.33 7.33 0 0 1 12 21.1z"/></g></g></svg>
)

const IconWifi = () => (
<svg fill={CLR.mid}  width="24px" height="24px" viewBox="0 -5 34 34" xmlns="http://www.w3.org/2000/svg"><path d="m16.807 0c-.014 0-.029 0-.045 0-6.19 0-11.82 2.4-16.01 6.319l.013-.012-.765.713 3.862 3.826.72-.66c3.201-2.952 7.494-4.763 12.21-4.763s9.009 1.81 12.222 4.774l-.012-.011.72.66 3.862-3.826-.765-.713c-4.169-3.907-9.791-6.307-15.974-6.307-.014 0-.027 0-.041 0h.002z"/><path d="m27.405 12.03c-2.783-2.531-6.498-4.08-10.575-4.08-.002 0-.005 0-.007 0h-.667l-.007.015c-3.847.159-7.313 1.674-9.958 4.076l.013-.012-.787.713 3.893 3.855.72-.63c1.791-1.606 4.171-2.587 6.78-2.587s4.989.982 6.79 2.596l-.01-.008.72.63 3.893-3.854z"/><path d="m16.815 24 5.475-5.415-.87-.713c-1.188-.938-2.708-1.505-4.359-1.505-.089 0-.178.002-.266.005h.013c-.02 0-.043 0-.066 0-1.712 0-3.293.563-4.567 1.515l.02-.014-.862.713.795.787 3.96 3.915z"/></svg>
)

const IconPhone = () => (
  <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 014.69 12 19.79 19.79 0 011.69 3.37 2 2 0 013.69 1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L7.91 9a16 16 0 006 6l1.06-1.06a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
  </svg>
);

const IconMail = () => (
  <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

const IconChevronDown = () => (
  <svg className="w-4 h-4 text-gray-500 pointer-events-none" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
  </svg>
);

const IconVerified = () => (
  <span
    className="inline-flex items-center justify-center w-4 h-4 rounded-full"
    style={{ background: "linear-gradient(135deg, #1A7A4A, #2D9A5F" }}
  >
    <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  </span>
);

type TabKey = "Features" | "Location" | "Reviews" | "Requirements";


const StarRating = ({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" }) => {
  const dim = size === "md" ? 20 : 14;

  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          width={dim}
          height={dim}
          fill= "currentColor"
          viewBox="0 0 20 20"
          //gold star
          style={{ color: i < Math.round(rating) ? CLR.gold : "#E5E7EB" }}
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
};

type DateVal = { year: number; month: number; day: number } | null;
const MONTHS_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const MONTHS_FULL  = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAYS = ["Su","Mo","Tu","We","Th","Fr","Sa"];
const MIN_YEAR = new Date().getFullYear();
const MAX_YEAR = MIN_YEAR + 5;

const toJS = (v: DateVal) => (v ? new Date(v.year, v.month, v.day) : null);
const same = (a: DateVal, b: DateVal) =>
  !!a && !!b && a.year === b.year && a.month === b.month && a.day === b.day;
function getDaysInMonth(y: number, m: number) { return new Date(y, m + 1, 0).getDate(); }
function getFirstDay(y: number, m: number)    { return new Date(y, m, 1).getDay(); }

function MiniCalendar({ start, end, onStartChange, onEndChange, selecting, setSelecting }: any) {
  const today   = new Date();
  const [viewYear,  setViewYear]  = useState(start?.year  ?? today.getFullYear());
  const [viewMonth, setViewMonth] = useState(start?.month ?? today.getMonth());
  const [hovering,  setHovering]  = useState<DateVal>(null);

  const monthOptions = MONTHS_FULL.map((m, i) => ({
    value: String(i) as string,
    label: m,
    disabled: viewYear === MIN_YEAR && i < today.getMonth(),
  })).filter(o => !o.disabled).map(({ value, label }) => ({ value, label }));

  const yearOptions = Array.from({ length: MAX_YEAR - MIN_YEAR + 1 }, (_, i) => MIN_YEAR + i)
    .map(y => ({ value: String(y), label: String(y) }));

  const handleClick = (day: number) => {
    const clicked     = { year: viewYear, month: viewMonth, day };
    const clickedDate = new Date(viewYear, viewMonth, day);
    if (selecting === "start") {
      onStartChange(clicked); onEndChange(null); setSelecting("end");
    } else {
      const s = toJS(start);
      if (s && clickedDate < s) { onStartChange(clicked); onEndChange(null); }
      else                      { onEndChange(clicked); setSelecting("start"); }
    }
  };

  const effectiveEnd = end ?? (selecting === "end" && hovering ? hovering : null);
  const daysInMonth  = getDaysInMonth(viewYear, viewMonth);
  const firstDay     = getFirstDay(viewYear, viewMonth);
  const cells        = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];

  return (
    <div >
      {/* Header*/}
      <div className="flex items-baseline gap-2 mb-4">
        <GradientPillSelect
          label=""
          options={monthOptions}
          value={String(viewMonth)}
          onChange={(v) => setViewMonth(Number(v))}
          width="w-full sm:w-44"
          labelSize="text-[0px]"
          optionSize="text-[13px]"
        />
        <GradientPillSelect
          label=""
          options={yearOptions}
          value={String(viewYear)}
          onChange={(v) => setViewYear(Number(v))}
          width="w-full sm:w-42"
          labelSize="text-[0px]"
          optionSize="text-[13px]"
        />
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 mb-1">
        {DAYS.map((d) => (
          <div key={d} className="text-center text-[10px] font-bold text-gray-300">{d}</div>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7 gap-y-1">
        {cells.map((day, i) => {
          if (!day) return <div key={i} className="h-8" />;
          const date    = { year: viewYear, month: viewMonth, day };
          const isStart = same(start, date);
          const isEnd   = same(effectiveEnd, date);
          const inRange = start && effectiveEnd && (() => {
            const t = new Date(viewYear, viewMonth, day).getTime();
            const s = toJS(start)!.getTime();
            const e = toJS(effectiveEnd)!.getTime();
            return t > Math.min(s, e) && t < Math.max(s, e);
          })();
          const isPast = new Date(viewYear, viewMonth, day) < new Date(MIN_YEAR, today.getMonth(), today.getDate());
          const disabled = isPast || (selecting === "end" && start && new Date(viewYear, viewMonth, day) < toJS(start)!);

          return (
            <div key={i} className="relative flex items-center justify-center h-8"
              onMouseEnter={() => !disabled && setHovering(date)}
              onMouseLeave={() => setHovering(null)}>
              {inRange && <div className="absolute inset-y-1 left-0 right-0 bg-[#6B0F2B]/10" />}
              {isStart && effectiveEnd && !same(start, effectiveEnd) && <div className="absolute inset-y-1 left-1/2 right-0 bg-[#6B0F2B]/10" />}
              {isEnd   && start       && !same(start, effectiveEnd) && <div className="absolute inset-y-1 left-0 right-1/2 bg-[#6B0F2B]/10" />}
              <button disabled={!!disabled} onClick={() => handleClick(day)}
                className={[
                  "relative z-10 w-7 h-7 flex items-center justify-center text-xs font-semibold rounded-full transition",
                  isStart || isEnd ? "bg-[#6B0F2B] text-white"
                    : inRange     ? "text-[#6B0F2B]"
                    : disabled    ? "text-gray-200 cursor-not-allowed"
                    : "text-gray-600 hover:bg-[#6B0F2B]/10 hover:text-[#6B0F2B]",
                ].join(" ")}>
                {day}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ApplicationPeriod({ onPeriodChange }: { onPeriodChange: (start: any, end: any) => void }) {
  const [savedStart, setSavedStart] = useState<DateVal>(null);
  const [savedEnd,   setSavedEnd]   = useState<DateVal>(null);
  const [draftStart, setDraftStart] = useState<DateVal>(null);
  const [draftEnd,   setDraftEnd]   = useState<DateVal>(null);
  const [editing,    setEditing]    = useState(true);
  const [selecting,  setSelecting]  = useState<"start" | "end">("start");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) {
        if (savedStart && savedEnd) setEditing(false);
      }
    }
    if (editing) document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [editing, savedStart, savedEnd]);

  const openEdit = () => {
    setDraftStart(savedStart); setDraftEnd(savedEnd);
    setSelecting("start"); setEditing(true);
  };

  const handleSave = () => {
    if (!draftStart || !draftEnd) return;
    setSavedStart(draftStart); setSavedEnd(draftEnd); setEditing(false);
    onPeriodChange(draftStart, draftEnd);
  };

  const isSet     = !!savedStart && !!savedEnd;
  const canSave   = !!draftStart && !!draftEnd;
  const totalDays = isSet
    ? Math.round((toJS(savedEnd)!.getTime() - toJS(savedStart)!.getTime()) / 86400000) + 1
    : null;

  return (
    <div ref={ref} className="relative w-full">
      {/* ── Saved State ── */}
      {isSet && !editing && (
        <div className="bg-[#6B0F2B] rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-4 pt-3 pb-2">
            <div className="flex items-center gap-2">
              <svg className="w-3 h-3 text-white/60" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest"></span>
            </div>
            <button onClick={openEdit} className="group flex items-center gap-1 text-[10px] font-bold text-white/70 hover:text-white transition">
              <svg className="w-3 h-3 opacity-70 group-hover:opacity-100" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
              </svg>
              Edit
            </button>
          </div>
          <div className="flex items-stretch gap-0 px-4 pb-3">
            <div className="flex-1 bg-white/10 rounded-xl px-3 py-2">
              <p className="text-[9px] font-bold text-white/50 uppercase tracking-wider mb-0.5">Start</p>
              <p className="text-[13px] font-bold text-white leading-tight">{MONTHS_SHORT[savedStart!.month]} {savedStart!.day}</p>
              <p className="text-[10px] text-white/50">{savedStart!.year}</p>
            </div>
            <div className="flex items-center justify-center px-2">
              <svg className="w-3.5 h-3.5 text-white/40" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </div>
            <div className="flex-1 bg-white/10 rounded-xl px-3 py-2">
              <p className="text-[9px] font-bold text-white/50 uppercase tracking-wider mb-0.5">End</p>
              <p className="text-[13px] font-bold text-white leading-tight">{MONTHS_SHORT[savedEnd!.month]} {savedEnd!.day}</p>
              <p className="text-[10px] text-white/50">{savedEnd!.year}</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Picker ── */}
      {editing && (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-xl p-4 space-y-3">
          {/* Date pills */}
          <div className="grid grid-cols-2 gap-2">
            {([
              { label: "Start Date", val: draftStart, key: "start" as const },
              { label: "End Date",   val: draftEnd,   key: "end"   as const },
            ]).map(({ label, val, key }) => (
              <button key={key} onClick={() => setSelecting(key)}
                className={["p-2 rounded-xl text-left transition border-2",
                  selecting === key ? "border-[#6B0F2B] bg-[#6B0F2B]/5" : "border-transparent bg-gray-50 hover:bg-gray-100",
                ].join(" ")}>
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">{label}</p>
                <p className={["text-[11px] font-bold", val ? "text-[#6B0F2B]" : "text-gray-300"].join(" ")}>
                  {val ? `${MONTHS_SHORT[val.month]} ${val.day}, ${val.year}` : "Select…"}
                </p>
              </button>
            ))}
          </div>
          <MiniCalendar
            start={draftStart} end={draftEnd}
            onStartChange={setDraftStart} onEndChange={setDraftEnd}
            selecting={selecting} setSelecting={setSelecting}
          />
          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <button
              onClick={() => setEditing(false)}
              disabled={!isSet}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 text-[12px] font-semibold text-gray-600 hover:bg-gray-50 transition disabled:opacity-40 disabled:cursor-not-allowed">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
              </svg>
              Cancel
            </button>
            <button onClick={handleSave} disabled={!canSave}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-semibold text-white transition disabled:opacity-40"
              style={{ background: "linear-gradient(135deg, #3D0718, #6B0F2B)" }}>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
              </svg>
              Save Period
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function AllPhotosModal({ photos, onClose }: { photos: string[]; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-auto p-5" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-base font-bold text-gray-900">All Photos</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-xl">✕</button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {photos.map((src, i) => (
            <img key={i} src={src} alt={`Photo ${i + 1}`} className="w-full h-44 object-cover rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

//Features Tab
function FeaturesTab({ accommodation, rooms, accommodationTags, roomInclusions, roomPreferences, commonPreferences, optionalPreferences, selectedPreferences, setSelectedPreferences, selectedTenantRestriction, setselectedTenantRestriction, selectedStayType, setSelectedStayType, selectedArrangement, setSelectedArrangement }: {
  accommodation: Accommodation;
  rooms: any[];
  accommodationTags: string[];
  roomInclusions: string[];
  roomPreferences: string[];
  commonPreferences: string[];
  optionalPreferences: string[];
  selectedPreferences: string[];
  setSelectedPreferences: React.Dispatch<React.SetStateAction<string[]>>;
  selectedTenantRestriction: Room["tenant_restriction"]; setselectedTenantRestriction: (v: Room["tenant_restriction"]) => void;
  selectedStayType: Room["room_stay_type"]; setSelectedStayType: (v: Room["room_stay_type"]) => void;
  selectedArrangement: Room["room_type"]; setSelectedArrangement: (v: Room["room_type"]) => void;
}) {

  const tenantRestriction = [...new Set(rooms.map((r) => r.tenant).filter(Boolean))];
  const stayTypes = [...new Set(rooms.map((r) => r.stay).filter(Boolean))];
  const arrangements = [...new Set(rooms.map((r) => r.type).filter(Boolean))];



  return (
    <div className="space-y-5 mt-14">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 items-start mt-16">
        <GradientPillSelect 
          label="Tenant Preference" 
          value={selectedTenantRestriction} 
          onChange={setselectedTenantRestriction}
          width = "w-full sm:w-44"
          labelSize="text-[18px]"
          optionSize = "text-[15px]"
          options={tenantRestriction.filter(Boolean).map((st) => ({ value: st, label: st.charAt(0).toUpperCase() + st.slice(1) }))} 
        />

        <GradientPillSelect 
          label="Stay Type" 
          value={selectedStayType} 
          onChange={setSelectedStayType}
          width = "w-full sm:w-44"
          labelSize="text-[18px]"
          optionSize = "text-[15px]"
          options={stayTypes.filter(Boolean).map((st) => ({ value: st, label: st === "non_transient" ? "Non-Transient" : "Transient" }))} />

        <GradientPillSelect 
          label="Arrangement" 
          value={selectedArrangement} 
          onChange={setSelectedArrangement}
          width = "w-full sm:w-44"
          labelSize="text-[18px]"
          optionSize = "text-[15px]"
          options={arrangements.filter(Boolean).map((a) => ({ value: a, label: a.charAt(0).toUpperCase() + a.slice(1) }))} />
      </div>
      <div className="w-full h-[2px] bg-gray-200 mt-5"></div>

      <div className="mt-12">
        <p className="text-[18px] font-bold font-sans tracking-widest text-[#9A7080] mb-5">
          Amenities
        </p>

        {/* COMMON FEATURES */}
        {(commonPreferences.length > 0 || accommodationTags.length > 0) && (
          <>
            <p className="text-[14px] text-gray-500 mb-2">All rooms include:</p>

            <div className="flex flex-wrap gap-2 mb-4">
              {/* Accommodation tags: static, no X */}
              {accommodationTags.map((tag: string) => (
                <span
                  key={`accom-${tag}`}
                  className="flex items-center gap-1.5 text-white font-sans text-[15px] font-medium px-4 py-1.5 rounded-full"
                  style={{ background: CLR.mid }}
                >
                  {tag}
                </span>
              ))}
              
             {commonPreferences.map((pref: string) => (
              <span
                key={`common-${pref}`}
                className="flex items-center gap-1.5 text-white font-sans text-[15px] font-medium px-4 py-1.5 rounded-full"
                style={{ background: CLR.mid }}
              >
                {pref}
              </span>
            ))}
            </div>
          </>
        )}

        <div className="flex flex-wrap gap-2 min-h-[36px]">
        {selectedPreferences.map((pref: string) => (
          <button
            key={`pref-${pref}`}
            onClick={() =>
              setSelectedPreferences((prev) => prev.filter((p) => p !== pref))
            }
            className="flex items-center gap-1.5 text-white font-sans text-[15px] font-medium px-4 py-1.5 rounded-full transition-opacity hover:opacity-80"
            style={{ background: CLR.mid }}
            title="Click to remove"
          >
            {pref}
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        ))}

        {commonPreferences.length === 0 &&
          accommodationTags.length === 0 &&
          selectedPreferences.length === 0 && (
            <p className="text-[12px] text-[#8C1535] italic">No amenities selected</p>
          )}
      </div>

      {optionalPreferences.filter((p) => !selectedPreferences.includes(p)).length > 0 && (
        <div className="mt-4">
          <div className="flex-1 h-px bg-gray-200"></div>

          <p className="text-[12px] text-[#8C1535] italic mt-5">
            Click to add
          </p>

          <div className="flex flex-wrap gap-2 mt-5">
            {optionalPreferences
              .filter((p) => !selectedPreferences.includes(p))
              .map((pref: string) => (
                <button
                  key={`removed-${pref}`}
                  onClick={() =>
                    setSelectedPreferences((prev) => [...prev, pref])
                  }
                  className="flex items-center gap-1.5 font-sans text-[15px] font-medium px-4 py-1.5 rounded-full border-2 border-dashed transition-colors hover:border-solid"
                  style={{
                    color: CLR.mid,
                    borderColor: CLR.subtext,
                    background: "transparent",
                  }}
                  title="Click to add amenity of choice."
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={CLR.mid} strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  {pref}
                </button>
              ))}
          </div>
        </div>
      )}

      </div>
      
    </div>
  );
}

type TravelMode = 'driving' | 'walking'

const routeLayerStyle = (mode: TravelMode): LayerProps => ({
  id: 'route',
  type: 'line',
  layout: { 'line-join': 'round', 'line-cap': 'round' },
  paint: {
    'line-color': CLR.mid,
    'line-width': 4,
    'line-opacity': 0.85,
  },
})

function LocationTab({ accommodation }: { accommodation: Accommodation }) {

  // only keep destination selector (optional)
  const [destIndex, setDestIndex] = useState(0)

  //capture travel mode
  const [travelMode, setTravelMode] = useState<TravelMode>('driving')
  //capture direction
  const [routeGeoJSON, setRouteGeoJSON] = useState<GeoJSON.FeatureCollection | null>(null)

  const [loadingRoute, setLoadingRoute] = useState(false)

  const [cardCollapsed, setCardCollapsed] = useState(false)
  const [previewed, setPreviewed] = useState(false)
  //Raw text for user to find a specific location
  const [searchQuery, setSearchQuery] = useState('')
  //Place suggestions
  const [suggestions, setSuggestions] = useState<{ label: string; lat: number; lng: number }[]>([])
  //The actual destination the user sets.
  const [selectedDest, setSelectedDest] = useState<{ label: String; lat: number; lng: number} | null >(null)

  //Show suggestion bar
  const [showSuggestions, setShowSuggestions] = useState(false)

  //Loading
  const [loadingSuggestions, setLoadingSuggestions] = useState(false)
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [durations, setDurations] = useState<{ driving: number | null; walking: number | null}>({
    driving: null,
    walking: null,
  })

  const accomLat = accommodation.latitude
  const accomLng = accommodation.longitude 

  const handleSearch = (val: string) => {
    setSearchQuery(val)

    setSelectedDest(null)
    setPreviewed(false)
    setRouteGeoJSON(null)
    setDurations({ driving: null, walking: null })

    if (searchTimeout.current) clearTimeout(searchTimeout.current)

    //Debounce - 
    searchTimeout.current = setTimeout(async () => {
      setLoadingSuggestions(true)
      try {
        const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(val)}.json?access_token=${MAPBOX_TOKEN}&autocomplete=true&limit=5&proximity=121.2436,14.1654`

        const res = await fetch(url)
        const data = await res.json()

        const results = (data.features ?? []).map((f: any) => ({
          label: f.place_name,
          lng: f.center[0],
          lat: f.center[1],
        }))

        setSuggestions(results)
        setShowSuggestions(true)
      } catch {
        setSuggestions([])
      } finally {
        setLoadingSuggestions(false)
      }
    }, 350)
  }

  const selectSuggestion = (s: {label: string; lat: number; lng: number}) => {
    setSelectedDest(s)  
    setSearchQuery(s.label) 
    setSuggestions([]) 
    setShowSuggestions(false) 
  }

  //Data for modes:
  const fetchModes = async (destLang: number, destLat: number) => {
    setLoadingRoute(true)
    setPreviewed(true) 

    try {
      const origin = `${accomLng},${accomLat}`
      const destination = `${destLang},${destLat}`

      const [driveRes, walkRes] = await Promise.all([
        fetch(`https://api.mapbox.com/directions/v5/mapbox/driving/${origin};${destination}?geometries=geojson&access_token=${MAPBOX_TOKEN}`),
        fetch(`https://api.mapbox.com/directions/v5/mapbox/walking/${origin};${destination}?geometries=geojson&access_token=${MAPBOX_TOKEN}`),        
      ])

      const [driveData, walkData] = await Promise.all([driveRes.json(), walkRes.json()])

      const newDurationData = {
        driving: driveData.routes?.[0] ? Math.round(driveData.routes[0].duration / 60) : null,
        walking: walkData.routes?.[0] ? Math.round(walkData.routes[0].duration / 60) : null,
      }
      setDurations(newDurationData)

      const activeData = travelMode === `driving` ? driveData : walkData

      //actual path corrdinates
      if (activeData.routes?.[0]) {
        setRouteGeoJSON({
          type: 'FeatureCollection',
          features: [{
            type: 'Feature',
            geometry: activeData.routes[0].geometry, // the polyline path
            properties: {},                           // required field, but we don't need any custom properties
          }],
        })
      }
    } catch(err) {
      console.error('Route fetch failed:', err)
    } finally {
      setLoadingRoute(false)
    }
  }

  const switchMode = async (mode: TravelMode) => {
    setTravelMode(mode)
    if (!previewed || !selectedDest) return

    setLoadingRoute(true)

    try{
      const origin = `${accomLng},${accomLat}`
      const destination = `${selectedDest.lng},${selectedDest.lat}`

      const res = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/${mode}/${origin};${destination}?geometries=geojson&access_token=${MAPBOX_TOKEN}`
      )
      const data = await res.json()

      if (data.routes?.[0]) {
        setRouteGeoJSON({
          type: 'FeatureCollection',
          features: [{ type: 'Feature', geometry: data.routes[0].geometry, properties: {} }],
        })
      }
    } catch (err) {console.error(err)}
    finally { setLoadingRoute(false) }
  }

  return (
      <div
        className="mt-4"
        style={{
          height: 460,
          position: 'relative',
          borderRadius: 16,
          overflow: 'hidden'
        }}
      >
        <Map
          initialViewState={{
            longitude: accomLng,
            latitude: accomLat,
            zoom: 15,
            pitch: 40,
            bearing: 0
          }}
          style={{ width: '100%', height: '100%' }}
          mapStyle="mapbox://styles/mapbox/standard"
          mapboxAccessToken={MAPBOX_TOKEN}
        >
          <NavigationControl position="top-right" />

          {/* Route line */}

          {routeGeoJSON && (
            <Source id="route" type="geojson" data={routeGeoJSON}>
              <Layer {...routeLayerStyle(travelMode)}/>
            </Source>
          )}

          {/*Accomdation pin */}
          <Marker longitude={accomLng} latitude={accomLat} anchor="bottom">
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div
                style={{
                  background: CLR.mid,
                  borderRadius: '50%',
                  width: 36,
                  height: 36,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 18,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
                }}
              >
                🏠
              </div>
              <div
                style={{
                  width: 0,
                  height: 0,
                  borderLeft: '6px solid transparent',
                  borderRight: '6px solid transparent',
                  borderTop: `8px solid ${CLR.mid}`,
                }}
              />
            </div>
          </Marker>

          {/* Destination*/}
          {previewed && selectedDest && (
            <Marker longitude={selectedDest.lng} latitude={selectedDest.lat} anchor="bottom">
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{
                  background: CLR.mid, borderRadius: '50%', width: 36, height: 36,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '2px solid white', fontSize: 18, boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
                }}>📍</div>
                <div style={{
                  width: 0, height: 0,
                  borderLeft: '6px solid transparent',
                  borderRight: '6px solid transparent',
                  borderTop: `8px solid ${CLR.mid}`,
                }} />
              </div>
            </Marker>
          )}
        </Map>

      {!cardCollapsed && (
        <div style={{
          position: 'absolute', top: 35, left: 16, 
          background: 'white', borderRadius: 20,
          padding: '16px 18px 18px',
          boxShadow: '0 4px 24px rgba(0,0,0,0.18)',
          width: 280, zIndex: 10,
          display: 'flex', flexDirection: 'column', gap: 10,
        }}>

          <div style={{
            position: 'absolute', top: -18, left: 16, 
            background: CLR.dark, borderRadius: '50%',
            width: 40, height: 40,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" />
            </svg>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 10 }}>
            {/* House icon */}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={CLR.mid} strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12L12 3l9 9M4 10v10a1 1 0 001 1h5v-6h4v6h5a1 1 0 001-1V10" />
            </svg>
            <div style={{
              flex: 1, border: `1.5px solid ${CLR.mid}`, borderRadius: 999,
              padding: '7px 16px', fontSize: 13, fontWeight: 600,
              color: '#1a1a1a', background: '#fafafa',
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', // truncate long names
            }}>
              {accommodation.accommodationName}
            </div>
          </div>

          {/* */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Location pin icon */}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={CLR.mid} strokeWidth="2" style={{ flexShrink: 0 }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 2C8.134 2 5 5.134 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.866-3.134-7-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z" />
            </svg>

            {/* Input wrapper */}
            <div style={{ flex: 1, position: 'relative' }}>
              <input
                type="text"
                placeholder="Search any destination..."
                value={searchQuery}    
                onChange={e => handleSearch(e.target.value)} 
                onFocus={() => suggestions.length > 0 && setShowSuggestions(true)} 
                onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}

                style={{
                  width: '100%', boxSizing: 'border-box',
                  border: `1.5px solid ${CLR.mid}`, borderRadius: 999,
                  padding: '7px 16px', fontSize: 13, fontWeight: 500,
                  color: '#1a1a1a', background: 'white', outline: 'none',
                }}
              />

              {/* Loading*/}
              {loadingSuggestions && (
                <div style={{
                  position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                  width: 14, height: 14,
                  border: `2px solid ${CLR.mid}`,
                  borderTopColor: 'transparent', 
                  borderRadius: '50%',
                  animation: 'spin 0.7s linear infinite', 
                }} />
              )}

              {/*Suggestion dropdown*/}
              {showSuggestions && suggestions.length > 0 && (
                <div style={{
                  position: 'absolute', top: '110%', left: 0, right: 0, 
                  background: 'white', borderRadius: 12,
                  boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                  zIndex: 30, 
                  overflow: 'hidden', 
                }}>
                  {suggestions.map((s, i) => (
                    <div
                      key={i}
                      onMouseDown={() => selectSuggestion(s)}
                      style={{
                        padding: '9px 14px', fontSize: 12, cursor: 'pointer',
                        color: '#1a1a1a', lineHeight: 1.4,
                        borderBottom: i < suggestions.length - 1 ? '1px solid #f3f4f6' : 'none',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#fdf2f5')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'white')}
                    >
                      {s.label}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Mode bars*/}
          {(durations.driving !== null || durations.walking !== null) && (
            <div style={{ padding: '2px 0 0', display: 'flex', flexDirection: 'column', gap: 6 }}>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                  stroke={travelMode === 'driving' ? CLR.mid : '#9CA3AF'} strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 17H3a2 2 0 01-2-2v-4l2-5h14l2 5v4a2 2 0 01-2 2h-2M7 17a2 2 0 100 4 2 2 0 000-4zm10 0a2 2 0 100 4 2 2 0 000-4z" />
                </svg>


                <button onClick={() => switchMode('driving')} style={{
                  background: 'none', border: 'none', padding: 0, cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: travelMode === 'driving' ? 700 : 400, 
                  color: travelMode === 'driving' ? CLR.mid : '#9CA3AF', 
                }}>
                  {durations.driving !== null ? `${durations.driving} min` : '—'}
                </button>

                <span style={{ flex: 1 }} /> 

                <button onClick={() => switchMode('walking')} style={{
                  background: 'none', border: 'none', padding: 0, cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: travelMode === 'walking' ? 700 : 400,
                  color: travelMode === 'walking' ? CLR.mid : '#9CA3AF',
                }}>
                  {durations.walking !== null ? `${durations.walking} min` : '—'}
                </button>

                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                  stroke={travelMode === 'walking' ? CLR.mid : '#9CA3AF'} strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 4a1 1 0 100 2 1 1 0 000-2zM6 20l3-8 2 3 2-1 3 6M5 12l2-3 3 1 2-4" />
                </svg>
              </div>

              <div style={{ display: 'flex', gap: 8, marginTop: 2 }}>
                <div style={{ flex: 1, height: 4, background: '#E5E7EB', borderRadius: 999, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    borderRadius: 999,
                    width: travelMode === 'driving' ? '100%' : '0%',
                    background: `linear-gradient(90deg, ${CLR.dark}, ${CLR.mid})`,
                    transition: 'width 0.3s ease',
                  }} />
                </div>

                <div style={{ flex: 1, height: 4, background: '#E5E7EB', borderRadius: 999, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    borderRadius: 999,
                    width: travelMode === 'walking' ? '100%' : '0%',
                    background: `linear-gradient(90deg, ${CLR.dark}, ${CLR.mid})`,
                    transition: 'width 0.3s ease',
                  }} />
                </div>
              </div>              
            </div>
          )}

          {/* Preview button*/}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 2 }}>
            <button
              onClick={() => selectedDest && fetchModes(selectedDest.lng, selectedDest.lat)}
              disabled={!selectedDest || loadingRoute}
              style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                background: !selectedDest
                  ? '#E5E7EB'
                  : loadingRoute
                    ? CLR.mid + 'aa' 
                    : `linear-gradient(135deg, ${CLR.dark}, ${CLR.mid})`,
                color: !selectedDest ? '#9CA3AF' : 'white',
                border: 'none', borderRadius: 999,
                padding: '9px 0', fontSize: 13, fontWeight: 700,
                cursor: !selectedDest || loadingRoute ? 'default' : 'pointer',
                transition: 'all 0.2s',
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                stroke={!selectedDest ? '#9CA3AF' : 'white'} strokeWidth="2.2">
                <circle cx="12" cy="12" r="3" />
                <path strokeLinecap="round" d="M12 2v4M12 18v4M2 12h4M18 12h4" />
              </svg>
              {loadingRoute ? 'Loading...' : 'Preview'}
            </button>

            {previewed && durations[travelMode] !== null && (
              <div style={{ textAlign: 'center', minWidth: 40 }}>
                <span style={{ fontSize: 28, fontWeight: 800, color: '#1a1a1a', lineHeight: 1 }}>
                  {durations[travelMode]}
                </span>
                <div style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 500 }}>min</div>
              </div>
            )}
          </div>
        </div>
      )}




      </div>
    
  )
}


function ReviewsTab({ reviews, avgRating }: { reviews: Review[]; avgRating: number }) {
  const [sortBy, setSortBy] = useState<"recent" | "star" | "date">("recent");

  const sortedReviews = [...reviews].sort((a, b) => {
    if (sortBy === "star") return b.rating - a.rating;
    if (sortBy === "date") return new Date(a.created_at ?? 0).getTime() - new Date(b.created_at ?? 0).getTime();
    return new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime();
  });

  return (
    <div className="space-y-4 font-sans">
      {/* Filter */}
      <div className="flex items-center gap-2 flex-wrap justify-end">
        <p className="text-[12px] text-[#6B0F2B] italic">Sort by: </p>
        {(["Recent", "Star ★", "Date Posted"] as const).map((label, i) => {
          const key = (["recent", "star", "date"] as const)[i];
          return (
            <button
              key={key}
              onClick={() => setSortBy(key)}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-full border text-[13px] font-normal transition-colors"
              style={{
                borderColor: sortBy === key ? CLR.mid : "#E5E7EB",
                color: sortBy === key ? CLR.mid : "#6B7280",
                background: "white",
              }}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Two columns */}
      <div className="grid grid-cols-1 sm:grid-cols-[1fr_1.8fr] gap-4 items-start">

        {/* Summary */}
        <div className="flex flex-col items-center gap-2">
          {/* Pink card */}
          <div className="rounded-2xl bg-[#F7EFF2] border border-[#EFE3E8] p-5 w-full flex flex-col items-center gap-1">
            <p className="text-[37px] font-bold" style={{ color: CLR.mid }}>
              {avgRating.toFixed(1)}
            </p>
            <StarRating rating={avgRating} size="md" />
            <p className="text-normal text-[15px] text-[#3D0718]">{reviews.length} Ratings</p>
          </div>{/* ← closed here, not earlier */}

          {/* Bar breakdown */}
          <div className="w-full mt-1 space-y-1.5">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = reviews.filter((r) => Math.round(r.rating) === star).length;
              const pct = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
              return (
                <div key={star} className="flex items-center gap-2">
                  <span className="text-[14px] font-medium text-[#3D0718] w-3">{star}</span>
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-2 rounded-full"
                      style={{ width: `${pct}%`, background: "linear-gradient(90deg, #3D0718, #C9748A)" }}
                    />
                  </div>
                  <span className="text-[14px] font-thin text-[#3D0718] w-5 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
        {/* End of summary */}

        {/* Review details */}
        <div className="space-y-3 font-sans">
          {sortedReviews.map((review) => ( // ← sortedReviews, not reviews
            <div key={review.id} className="bg-[#F7EFF2] border border-[#EFE3E8] p-4">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                    style={{ background: "#D1C4C9" }}
                  >
                    {review.student?.user?.fname?.[0] ?? "?"}
                  </div>
                  <div>
                    <p className="text-[15px] font-bold text-gray-800">
                      {review.student?.user
                        ? `${review.student?.user?.fname} ${review.student?.user?.lname}`
                        : "Anonymous"}
                    </p>
                    {review.created_at && (
                      <p className="text-[8px] font-light text-gray-800">
                        {new Date(review.created_at).toLocaleDateString("en-PH", {
                          month: "long",
                          day: "2-digit",
                          year: "numeric",
                        })}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <span className="text-[15px] font-bold" style={{ color: CLR.gold }}>
                    {review.rating}
                  </span>
                  <StarRating rating={review.rating} size="md" />
                </div>
              </div>
              {review.content && (
                <p className="text-[10px] text-gray-600">{review.content}</p>
              )}
            </div>
          ))}
        </div>
        {/* End of review details */}

      </div>
    </div>
  );
}

function RequirementsTab() {
  const [downloaded, setDownloaded] = useState<Set<number>>(new Set());

  return(
    <div className="space y-4 font-sans mt-4">
      <div>
        <p className="text-[15px] font-bold text-[#6B0F2B] mt-3">
          Please download and fill-up the necessary files before filing for an application.
        </p>
        <p className="text-[12px] text-gray-500 mt-1 flex items-start gap-1">
            <span className="mt-0.5">ⓘ</span>
            <span>
              To help manage your accommodation, assigned dormitory personnel may also be able to view your login
              information. Files and credentials are only used for housing and administrative support. See our data privacy
              clause.
              {/*<button className="font-semibold underline text-[#6B0F2B] mt-1">here</button>.*/}
            </span>
        </p>
      </div>
      {/*https://tailwindcss.com/docs/table-layout*/}
      <div className="w-full overflow-x-auto rounded-md border border-[#F0E8EC] mt-5">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#F7EFF2]">
              <th className="text-left px-4 py-3 text-[13px] font-semibold text-[#6B0F2B]">Requirement</th>
              <th className="text-left px-4 py-3 text-[13px] font-semibold text-[#6B0F2B]">Size</th>
              <th className="text-left px-4 py-3 text-[13px] font-semibold text-[#6B0F2B]">Date Modified</th>
              <th className="text-right px-4 py-3 text-[13px] font-semibold text-[#6B0F2B]">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F0E8EC]">
            {MOCK_REQUIREMENTS.map((req) => {
              const isDownloaded = downloaded.has(req.id);
              const hasAttachment = req.size !== "—";

              return(
                <tr key={req.id} className="bg-white hover:bg-[#FDF8FA] transition-colors">
                  <td className="px-4 py-3 text-[11px] font-medium text-[#3D0718]">{req.name}</td>
                  <td className="px-4 py-3 text-[11px] text-gray-500">{req.size}</td>
                  <td className="px-4 py-3 text-[11px] text-gray-500">{req.dateModified}</td>
                  <td className="px-4 py-3 text-right">
                    {hasAttachment ? (
                      <button
                        onClick={() => setDownloaded((prev) => new Set([...prev, req.id]))}
                        className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-[12px] font-semibold text-white transition-colors"
                        style={{ background: isDownloaded ? "linear-gradient(135deg, #1A7A4A, #2D9A5F" : "linear-gradient(130deg, #6B0F2B, #9A7080)" }}
                      >
                        {isDownloaded ? (
                          <>
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                            Downloaded 
                          </>
                        ) : (
                          <>
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M16 12l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            Download
                          </>
                        )}
                      </button>
                    ) : (
                      <span className="text-[10px] text-gray-400 italic">To be submitted</span>
                    )}
                  </td>
                </tr>
              )
            })}

          </tbody>


        </table>


      </div>
    </div>
  )
}




export default function RoomView() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [accommodation, setAccommodation] = useState<Accommodation | null>(null);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStart, setSelectedStart] = useState<any>(null);
  const [selectedEnd, setSelectedEnd] = useState<any>(null);

  const [selectedTab, setselectedTab] = useState<TabKey>("Features");
  // const [isFavorited, setIsFavorited] = useState(false);
  // const [moveIn, setMoveIn] = useState("");
  // const [moveOut, setMoveOut] = useState("");
  const [current, setCurrent] = useState(0);
  const [showAllPhotos, setShowAllPhotosModal] = useState(false);

  const [selectedTenantRestriction, setselectedTenantRestriction] = useState<Room["tenant_restriction"]>("coed");
  const [selectedStayType, setSelectedStayType] = useState<Room["room_stay_type"]>("non_transient");
  const [selectedArrangement, setSelectedArrangement] = useState<Room["room_type"]>("single");
  const [selectedPreferences, setSelectedPreferences] = useState<string[]>([]);
  const [hasSelectedRoomFilters, setHasSelectedRoomFilters] = useState(false);

  useEffect(() => {
    const fetchAccommodation = async () => {
      try {
        const res = await api.get(`/accommodations/${id}`);
        const data = res.data.data ?? res.data;

        console.log("ACCOMMODATION DETAILS:", data);
        setAccommodation(data);

        if (data.rooms?.length) {
          setselectedTenantRestriction(data.rooms[0].tenantRestriction ?? data.rooms[0].tenant_restriction ?? "coed");
          setSelectedStayType(data.rooms[0].roomStayType ?? data.rooms[0].room_stay_type ?? "non_transient");
          setSelectedArrangement(data.rooms[0].roomType ?? data.rooms[0].room_type ?? "single");
        }
      } catch (error) {
        console.error("Failed to fetch accommodation:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchAccommodation();
  }, [id]);

  useEffect(() => {
    setSelectedPreferences((prev) =>
      prev.filter((pref) => optionalPreferences.includes(pref))
    );
  }, [selectedTenantRestriction, selectedStayType, selectedArrangement]);

  if (loading) {
    return <p>Loading accommodation...</p>;
  }

  if (!accommodation) {
    return <p>Accommodation not found.</p>;
  }

  
  // const displayPhotos = [
  //     "https://scontent.fmnl17-2.fna.fbcdn.net/v/t39.30808-6/470222608_983930173757933_998118782445933365_n.jpg?_nc_cat=111&ccb=1-7&_nc_sid=2a1932&_nc_ohc=ZFZK7m7SOa0Q7kNvwGOPvqH&_nc_oc=AdqDd-9KAVigCK_3EWtYSiKPI3LQcUVYJnrsKNS8FkAFYu_F7R1kEigwCaFZR-vRmV0&_nc_zt=23&_nc_ht=scontent.fmnl17-2.fna&_nc_gid=r4rDrZ-9ks0O0mnDt0AqYw&_nc_ss=7a3a8&oh=00_Af2gqklSV4YC1rlAVLymw3a5pkNBSRrBaSnbwKxtYMPVLQ&oe=69E8489C",
  //     "https://scontent.fmnl17-1.fna.fbcdn.net/v/t1.6435-9/66008036_487367045400857_1488351947843960832_n.jpg?_nc_cat=101&ccb=1-7&_nc_sid=f798df&_nc_ohc=ElHr-WrKZYcQ7kNvwFwvO8u&_nc_oc=Adpjp6BtjtcqZipKB0kvZwUKfdfmdA8FthjEjzcTTLJr_QrG8CJ_ziH_ueBWDhIj5m0&_nc_zt=23&_nc_ht=scontent.fmnl17-1.fna&_nc_gid=ohCc0hgO7ItkIo1D4h39dg&_nc_ss=7a3a8&oh=00_Af3SRsAoAaRLisofJivkX9TI-NV5f32-PPjLFNVUdbIgQw&oe=6A09DE9E",
  //     "https://scontent.fmnl17-2.fna.fbcdn.net/v/t1.6435-9/65525855_487366502067578_6498764386226667520_n.jpg?_nc_cat=111&ccb=1-7&_nc_sid=f798df&_nc_ohc=lwgSYY8aRXMQ7kNvwG8DE1O&_nc_oc=Adr3QJE6pJ4Ix9GhvyrIm46YivGbyqqWj91r19RGHeKAk1ek9OjWbNZ3W7X__QQmkwQ&_nc_zt=23&_nc_ht=scontent.fmnl17-2.fna&_nc_gid=Y31MEwZ9ofBlvh9xazaSVg&_nc_ss=7a3a8&oh=00_Af2hAC2OUloa4E3JKdO0biDPLF0cJGI2De9EDWbNGJ4spg&oe=6A09D9E6",
  //     "https://scontent.fmnl17-8.fna.fbcdn.net/v/t1.6435-9/65574464_487366468734248_8178610199741857792_n.jpg?_nc_cat=104&ccb=1-7&_nc_sid=f798df&_nc_ohc=EXZOAFgaSmEQ7kNvwGNMSIY&_nc_oc=Ado7mmT6oORNQgtkYEGMBuw_N8AtiWN5U0vvytCYvNjXU_uRCnqO7vejL1BEgWXksQo&_nc_zt=23&_nc_ht=scontent.fmnl17-8.fna&_nc_gid=G05aAyHCbEbugO1lM86-kA&_nc_ss=7a3a8&oh=00_Af0T8tdQzHrWjB2zeUZjedH8I5CpGvUDfq11soKx1O_Zwg&oe=6A09D02E",
  //   ];

  const displayPhotos =
    accommodation.images?.length > 0
      ? accommodation.images.map((img) => assetUrl(img.file.file_path))
      : ["/default-accommodation.png"];

  
  const today = new Date().toISOString().split("T")[0];
  const manager = accommodation.manager;
  const managerUser = manager?.user;

  const rooms = accommodation.rooms ?? [];
  const reviews = accommodation.reviews ?? [];

  const normalizedRooms = rooms.map((r: any) => ({
    id: r.id,
    tenant: r.tenantRestriction ?? r.tenant_restriction,
    stay: r.roomStayType ?? r.room_stay_type,
    type: r.roomType ?? r.room_type,
    rent: r.roomRent ?? r.room_rent,
    capacity: r.roomCapacity ?? r.room_capacity,
    occupancy: r.roomCurrentOccupancy ?? r.room_current_occupancy,
    roomNumber: r.roomNumber ?? r.room_number,
    availability: r.roomAvailability ?? r.room_availability,
    advanceMonths: r.advanceMonths ?? r.advance_months,
    depositMonths: r.depositMonths ?? r.deposit_months,
    tags: r.tags ?? [],
  }));

  const baseMatchingRooms = normalizedRooms.filter((room) => {
    return (
      room.tenant === selectedTenantRestriction &&
      room.stay === selectedStayType &&
      room.type === selectedArrangement
    );
  });

  const matchingRooms = baseMatchingRooms.filter((room) => {
    const roomPrefs =
      room.tags
        ?.filter((tag: any) => tag.type === "preference")
        .map((tag: any) => tag.tagDetail ?? tag.tag_detail) ?? [];

    return selectedPreferences.every((pref) => roomPrefs.includes(pref));
  });

  const selectedRoom =
    matchingRooms.length > 0
      ? matchingRooms.reduce((cheapest, room) =>
          Number(room.rent) < Number(cheapest.rent) ? room : cheapest
        )
      : baseMatchingRooms.length > 0
      ? baseMatchingRooms.reduce((cheapest, room) =>
          Number(room.rent) < Number(cheapest.rent) ? room : cheapest
        )
      : null;

  const availablePreferences = [
    ...new Set(
      baseMatchingRooms.flatMap((room) =>
        (room.tags ?? [])
          .filter((tag: any) => tag.type === "preference")
          .map((tag: any) => tag.tagDetail ?? tag.tag_detail)
          .filter(Boolean)
      )
    ),
  ];

  const allPreferences = [
    ...new Set(
      baseMatchingRooms.flatMap((room) =>
        (room.tags ?? [])
          .filter((tag: any) => tag.type === "preference")
          .map((tag: any) => tag.tagDetail ?? tag.tag_detail)
          .filter(Boolean)
      )
    ),
  ];

  const commonPreferences = allPreferences.filter((pref) =>
    baseMatchingRooms.every((room) =>
      (room.tags ?? []).some(
        (tag: any) =>
          tag.type === "preference" &&
          (tag.tagDetail ?? tag.tag_detail) === pref
      )
    )
  );

  const optionalPreferences = allPreferences.filter(
    (pref) => !commonPreferences.includes(pref)
  );

  // const cheapestMatchingRoom =
  //   matchingRooms.length > 0
  //     ? matchingRooms.reduce((cheapest, room) =>
  //         Number(room.rent) < Number(cheapest.rent) ? room : cheapest
  //       )
  //     : null;

  const accommodationTags  =
    accommodation.tags
      ?.map((tag: any) => tag.tagDetail ?? tag.tag_detail)
      .filter(Boolean) ?? [];
  
  const selectedRoomTags = selectedRoom?.tags ?? [];

  const roomInclusions = selectedRoomTags
    .filter((t: any) => t.type === "inclusion")
    .map((t: any) => t.tagDetail);

  // const roomPreferences = selectedRoomTags
  //   .filter((t: any) => t.type === "preference")
  //   .map((t: any) => t.tagDetail);

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum, review) => sum + Number(review.rating ?? 0), 0) /
        reviews.length
      : 0;

  const tabs: {key: TabKey; label:string}[] = [
    { key: "Features", label: "Features"},
    { key: "Location", label: "Location" },
    { key: "Reviews", label: "Reviews"},
    { key: "Requirements", label: "Requirements"},
  ];

  const hasFilters =
      hasSelectedRoomFilters || selectedPreferences.length > 0;

  // const displayPrice = hasFilters
  //     ? cheapestMatchingRoom?.rent
  //     : accommodation.pricing?.overallStartingPrice ??
  //       accommodation.cheapestRoomOverall;

    


  return (
    <div className="flex h-screen overflow-hidden bg-[#F6F2F4] font-sans">
      <Sidebar role="student"/>

      <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6">

        <button onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm font-semibold mb-3 hover:underline"
          style={{ color: CLR.mid }}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
          Back
        </button>

        {/* Content grid */}
        <div className={`grid ${GRID_COLS} gap-3`}>

          {/* Main image — col 1 */}
          <div className="relative overflow-hidden rounded-2xl" style={{ height: 300 }}>
            <img src={displayPhotos[current]} alt="Main room" className="w-full h-full object-cover" />
            <button onClick={() => setCurrent((c) => (c - 1 + displayPhotos.length) % displayPhotos.length)}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center shadow-md"
              style={{ background: CLR.mid }}>
              <MdChevronLeft size={22} color="#fff" />
            </button>
            <button onClick={() => setCurrent((c) => (c + 1) % displayPhotos.length)}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center shadow-md"
              style={{ background: CLR.mid }}>
              <MdChevronRight size={22} color="#fff" />
            </button>
          </div>

          {/* Thumbnail stack — col 2 */}
          <div className="hidden lg:grid grid-rows-2 gap-3" style={{ height: 300 }}>
            {/* Top-right */}
            <div className="overflow-hidden rounded-2xl cursor-pointer" onClick={() => setCurrent(1)}>
              <img src={displayPhotos[1]} alt="Thumb 2" className="w-full h-full object-cover" />
            </div>
            {/* Bottom-right: two small */}
            <div className="grid grid-cols-2 gap-3">
              <div className="overflow-hidden rounded-2xl cursor-pointer" onClick={() => setCurrent(2)}>
                <img src={displayPhotos[2]} alt="Thumb 3" className="w-full h-full object-cover" />
              </div>
              <div className="relative overflow-hidden rounded-2xl cursor-pointer" onClick={() => setCurrent(3)}>
                <img src={displayPhotos[3]} alt="Thumb 4" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-[#6B0F2B]/70 flex items-center justify-center">
                  <button onClick={(e) => { e.stopPropagation(); setShowAllPhotosModal(true); }}
                    className="bg-white text-gray-900 text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow">
                    <IconPlus /> All photos
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Conent row */}
          
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-6 mt-3">
            <div className="flex items-center gap-0 flex-wrap mb-2">
              <StarRating rating={avgRating} size="md" />
              <span className="text-[15px] font- text-[#9A7080] font-semibold mr-5">
                {avgRating.toFixed(1)} ({accommodation.reviews.length})
              </span>
              <div className="ml-auto flex items-center gap-1">
                {/* <button onClick={() => setIsFavorited((f) => !f)} className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-gray-600 hover:bg-gray-100 transition">
                  <IconHeart filled={isFavorited} />
                    <span className="hidden md:inline text-sm font-semibold">
                      Favorite
                    </span>
                </button> */}
                <button className="flex items-center gap-1 text-[14px] font-semibold text-[#6B0F2B] px-2">
                  <IconShare /> 
                    <span className="hidden md:inline text-sm font-semibold">
                      Share
                    </span>
                </button>
                <button className="flex items-center gap-1 text-[14px] font-semibold text-[#6B0F2B] px-2" >
                  <IconReport />
                    <span className="hidden md:inline text-sm font-semibold">
                      Report
                    </span>
                </button>
              </div>
            </div>
          <h1 className="text-[30px] font-bold text-gray-900 mb-1">{accommodation.accommodationName}</h1>
          <p className="text-[15px] font-semibold text-[#6B0F2B]" >{accommodation.accommodationLocation}</p>
          <p className="text-[18px] text-[#9A7080]">
            Studio · {accommodation.accommodationSize ? accommodation.accommodationSize.toFixed(1) : "—"} m² · {(accommodation.accommodationType ?? "").replace(/[_]/g, " ")}
          </p>          
          {/* Tabs*/ }
          <div className="flex overflow-x-auto sm:justify-between bg-[#F8F0F3] rounded-lg px-2 mb-5 mt-6 scrollbar-none">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setselectedTab(t.key)}
                className={`flex-shrink-0 sm:flex-1 flex flex-col items-center px-4 py-2.5 text-[15px] sm:text-[18px] font-semibold transition-colors whitespace-nowrap ${
                  selectedTab === t.key ? "text-[#6B0F2B]" : "text-gray-400 hover:text-gray-600"
                }`}
              >
                <span className="relative">
                  {t.label}
                  {selectedTab === t.key && (
                    <span
                      className="absolute -bottom-3 left-0 w-full h-[5px] rounded-full"
                      style={{ background: "linear-gradient(90deg, #9A7080, #6B0F2B)" }}
                    />
                  )}
                </span>
              </button>
            ))}
          </div>

        {selectedTab === "Features" && (
          <FeaturesTab
            accommodation={accommodation}
            rooms={normalizedRooms}
            accommodationTags={accommodationTags}
            roomInclusions={roomInclusions}
            roomPreferences={availablePreferences}
            commonPreferences={commonPreferences}
            optionalPreferences={optionalPreferences}
            selectedPreferences={selectedPreferences}
            setSelectedPreferences={setSelectedPreferences}
            selectedTenantRestriction={selectedTenantRestriction}
            setselectedTenantRestriction={(v) => {
              setselectedTenantRestriction(v);
              setHasSelectedRoomFilters(true);
            }}
            selectedStayType={selectedStayType}
            setSelectedStayType={(v) => {
              setSelectedStayType(v);
              setHasSelectedRoomFilters(true);
            }}
            selectedArrangement={selectedArrangement}
            setSelectedArrangement={(v) => {
              setSelectedArrangement(v);
              setHasSelectedRoomFilters(true);
            }}
          />
        )}
        {selectedTab == "Reviews" && <ReviewsTab reviews={accommodation.reviews} avgRating={avgRating} />}
        {selectedTab === "Requirements" && <RequirementsTab />}
        {selectedTab === 'Location' && <LocationTab accommodation={accommodation} />}
 
        </div>

          <div className="mt-3 font-sans">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              {/* Price */}
              <div className="mx-9">
                <div className="mb-1">
                  <p className="text-[15px] font-bold text-[#3D0718] mt-2">
                    {hasFilters ? "From:" : "Starts at:"}
                  </p>
                  <span className="text-[37px] font-bold font-sans text-[#6B0F2B]">
                    ₱{selectedRoom?.rent != null ? Number(selectedRoom.rent).toLocaleString() : "—"}
                  </span>
                  <span className="text-[21px] font-normal text-[#9A7080]"> / month</span>
                </div>
                <div className="w-full h-[6px] bg-gray-200 mt-2"></div>
                {/* <p className="text-[15px] font-normal text-[#000000] mt-2">2 months advance, 1 month deposit</p> */}
                <p className="text-[15px] font-normal text-[#000000] mt-2">
                  {selectedRoom?.advanceMonths ?? 0}{" "}
                  {selectedRoom?.advanceMonths === 1 ? "month" : "months"} advance,{" "}
                  {selectedRoom?.depositMonths ?? 0}{" "}
                  {selectedRoom?.depositMonths === 1 ? "month" : "months"} deposit
                </p>

                {/* Inclusions */}
                <p className="text-[15px] font-bold text-[#9A7080] mt-2">Inclusions:</p>
                <div className="flex gap-4 mb-4 mt-2">
                  {roomInclusions.length > 0 ? (
                    roomInclusions.map((inc: string) => (
                      <span key={inc} className="flex items-center gap-1.5 text-sm font-medium text-[white] bg-[#6B0F2B] px-3 py-1 rounded-full"> 
                        {inc}
                      </span>
                    ))
                  ) : (
                    <span className="text-[13px] text-gray-500 italic">No listed inclusions</span>
                  )}
                </div>

                {/* Dates */}
                <p className="text-[15px] font-bold text-[#9A7080] mt-2">Duration of Stay:</p>
                <div className="mb-4">
                  <div className="mt-2">
                    <ApplicationPeriod
                      onPeriodChange={(start, end) => {
                        setSelectedStart(start);
                        setSelectedEnd(end);
                      }}
                    />
                  </div>
                </div>

              {manager && (
                <div className="border border-[#F0E8EC] rounded-2xl p-4 flex flex-col items-center gap-1.5 mb-4">
                  <div className="w-14 h-14 rounded-full flex items-center justify-center text-white text-lg font-bold mb-1"
                    style={{ background: managerUser?.pfp_file ? `url(${assetUrl(managerUser.pfp_file.file_path)}) center/cover` : CLR.mid }}>
                    {!managerUser?.pfp_file && `${managerUser?.fname[0]}${managerUser?.lname[0]}`}
                  </div>
                  <div className="w-full h-[2px] bg-[#F0E8EC] mt-2 mx-4"></div>

                  <p className="font-bold text-[#000000] text-[16px] flex items-center gap-1.5">
                    {managerUser?.fname} {managerUser?.lname} <IconVerified />
                  </p>

                  <p className="text-[11px] font-semibold text-[#848484] mb-1">Dorm Manager</p>
                  <p className="flex items-center gap-1.5 text-xs text-[#848484]">
                    <IconPhone /> (+63){managerUser?.phone?.slice(1) ?? "XXX XXX XXXX"}
                  </p>
                  <p className="flex items-center gap-1.5 text-xs text-gray-500">
                    <IconMail /> {managerUser?.email}
                  </p>
                  <div className="flex gap-3 mt-2 border-t border-gray-100 pt-2 w-full justify-center">
                    <button className="flex items-center gap-1 text-xs text-[#9A7080] hover:text-[#8C1535] background-[#9A7080]" ><IconShare /> Share</button>
                    <span className="text-gray-200">|</span>
                    <button className="flex items-center gap-1 text-xs text-[#9A7080] hover:text-[#8C1535]"><IconReport /> Report</button>
                  </div>
                </div>
              )}

               {/* Apply */}
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="w-full text-white text-[15px] font-bold py-3.5 rounded-xl transition-colors"
                  style={{ background: "linear-gradient(135deg, #2D0511, #9A1F3E)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = CLR.mid)}
                  onMouseLeave={(e) => (e.currentTarget.style.background = CLR.dark)}>
                  Apply for Occupancy
                </button>

                <RoomApplicationModal
                  open={isModalOpen}
                  onClose={() => setIsModalOpen(false)}
                  accommodation={accommodation}
                  initialStart={selectedStart}
                  initialEnd={selectedEnd}
                  passedStayType={selectedStayType}
                  passedArrangement={selectedArrangement}
                  amenities={accommodationTags}
                  selectedAmenities={selectedPreferences}
                  // onToggleAmenity={toggleAmenity}
                />

              </div>

            </div>
          </div>
      </div>


      </main>
        {showAllPhotos && (
          <AllPhotosModal photos={displayPhotos} onClose={() => setShowAllPhotosModal(false)} />
        )}
    </div>
  );
}