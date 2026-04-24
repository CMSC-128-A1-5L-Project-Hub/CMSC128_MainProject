import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MdChevronLeft, MdChevronRight } from "react-icons/md";
import Sidebar from "../../components/Sidebar";
import GradientPillSelect from "../../components/DropDownGradient.tsx";

//MapBox Imports
import Map, { Marker, NavigationControl, Source, Layer } from 'react-map-gl'
import type { LayerProps } from 'react-map-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

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

const GRID_COLS = "grid-cols-[1.75fr_1fr]";

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



interface Manager{
  id: number;
  fname: string;
  lname: string;
  email: string;
  pfp_file_id: number | null;
  pfp_file?: FileMetadata;
  phone?: string;
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
  tenant_restriction: string;
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
  accommodation_name: string;
  accommodation_location: string;
  accommodation_type: "on_campus" | "off_campus" | "partner_housing";
  accommodation_capacity: number;
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
    <path fill-rule="evenodd" d="M16,2 C16.2652165,2 16.5195704,2.10535684 16.7071068,2.29289322 L21.7071068,7.29289322 C21.8946432,7.4804296 22,7.73478351 22,8 L22,15 C22,15.2339365 21.9179838,15.4604694 21.7682213,15.6401844 L16.7682213,21.6401844 C16.5782275,21.868177 16.2967798,22 16,22 L8,22 C7.73478351,22 7.4804296,21.8946432 7.29289322,21.7071068 L2.29289322,16.7071068 C2.10535684,16.5195704 2,16.2652165 2,16 L2,8 C2,7.73478351 2.10535684,7.4804296 2.29289322,7.29289322 L7.29289322,2.29289322 C7.4804296,2.10535684 7.73478351,2 8,2 L16,2 Z M15.5857864,4 L8.41421356,4 L4,8.41421356 L4,15.5857864 L8.41421356,20 L15.5316251,20 L20,14.6379501 L20,8.41421356 L15.5857864,4 Z M12,16 C12.5522847,16 13,16.4477153 13,17 C13,17.5522847 12.5522847,18 12,18 C11.4477153,18 11,17.5522847 11,17 C11,16.4477153 11.4477153,16 12,16 Z M12,6 C12.5522847,6 13,6.44771525 13,7 L13,13 C13,13.5522847 12.5522847,14 12,14 C11.4477153,14 11,13.5522847 11,13 L11,7 C11,6.44771525 11.4477153,6 12,6 Z"/>
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

const MOCK_ACCOMMODATION: Accommodation = {
  id: 1,
  accommodation_name: "Narra Residence",
  accommodation_location: "L2 B4 Mint St., Demarses Subdivision, Bgy. Batong Malake, Los Baños",
  accommodation_type: "off_campus",
  accommodation_capacity: 50,
  tenant_restriction: "coed",
  application_start_date: "2026-04-01",
  application_end_date: "2026-05-15",
  avgrating: 4.8,
  latitude: 14.1684,
  longitude: 121.2435,
  images: [
    { accommodation_id: 1, image_file_id: 1, file: { id: 1, file_name: "accom1_img1.jpg", file_path: "/uploads/images/accom1_img1.jpg", file_type: "image" } },
    { accommodation_id: 1, image_file_id: 2, file: { id: 2, file_name: "accom1_img2.jpg", file_path: "/uploads/images/accom1_img2.jpg", file_type: "image" } },
    { accommodation_id: 1, image_file_id: 3, file: { id: 3, file_name: "accom2_img1.jpg", file_path: "/uploads/images/accom2_img1.jpg", file_type: "image" } },
    { accommodation_id: 1, image_file_id: 4, file: { id: 4, file_name: "accom2_img2.jpg", file_path: "/uploads/images/accom2_img2.jpg", file_type: "image" } },
  ],
  tags: [
    { accommodation_id: 1, tag_detail: "Near campus" },
    { accommodation_id: 1, tag_detail: "Air-conditioned rooms" },
  ],
  rooms: [
    {
      id: 1, accommodation_id: 1, room_number: "101", room_type: "single",
      room_stay_type: "non_transient", room_capacity: 1, room_current_occupancy: 0,
      room_building: "Building A", room_rent: 3200, tenant_restriction: "coed", room_availability: "available",
    },
    {
      id: 2, accommodation_id: 1, room_number: "102", room_type: "double",
      room_stay_type: "transient", room_capacity: 2, room_current_occupancy: 1,
      room_building: "Building A", room_rent: 4500, tenant_restriction: "coed", room_availability: "available",
    },
    {
      id: 3, accommodation_id: 1, room_number: "103", room_type: "shared",
      room_stay_type: "non_transient", room_capacity: 3, room_current_occupancy: 1,
      room_building: "Building B", room_rent: 2800, tenant_restriction: "coed", room_availability: "available",
    },
  ],
  reviews: [
    {
      id: 1, accommodation_id: 1, student_number: "2023-123456", rating: 5,
      content: "Rooms are clean and the dormitory manager is easy to talk to. I would recommend for anyone finding an affordable and safe dormitory in UPLB.",
      created_at: "2026-01-15",
      student: { user: { fname: "Jack", lname: "Collins" } },
    },
    {
      id: 2, accommodation_id: 1, student_number: "2023-123457", rating: 4,
      content: "The layout of the room is nice. There are so many amenities which caters to my needs as a student. It is also a close walk to the campus.",
      created_at: "2026-02-03",
      student: { user: { fname: "Beyonce", lname: "Dimagiba" } },
    },
    {
      id: 3, accommodation_id: 1, student_number: "2023-123458", rating: 4,
      content: "The layout of the room is nice. There are so many amenities which caters to my needs as a student. It is also a close walk to the campus.",
      created_at: "2026-02-03",
      student: { user: { fname: "Lebron", lname: "James" } },
    },
  ],
  manager: {
    id: 13,
    fname: "Juan",
    lname: "Dela Cruz",
    email: "juan.delacruz@gmail.com",
    pfp_file_id: null,
    phone: "09165478322",
  },
};

const AMENITIES = [
  "Furnished",
  "CCTV",
  "Dedicated study area",
  "24/7 guards",
  "Wifi",
  "Gym",
  "Own bathroom",
];

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
function FeaturesTab({ accommodation, selectedStayType, setSelectedStayType, selectedArrangement, setSelectedArrangement }: {
  accommodation: Accommodation;
  selectedStayType: Room["room_stay_type"]; setSelectedStayType: (v: Room["room_stay_type"]) => void;
  selectedArrangement: Room["room_type"]; setSelectedArrangement: (v: Room["room_type"]) => void;
}) {
  const stayTypes = [...new Set(accommodation.rooms.map((r) => r.room_stay_type))];
  const arrangements = [...new Set(accommodation.rooms.map((r) => r.room_type))];
  const matchedRoom = accommodation.rooms.find(
    (r) => r.room_stay_type === selectedStayType && r.room_type === selectedArrangement
  );

  return (
    <div className="space-y-5 mt-14">
      <div className="grid grid-cols-3 gap-5 items-start mt-16">
        <div>
          <p className="text-[16px] font-bold font-sans tracking-widest text-[#9A7080] mb-1.5">Type</p>
          <p className="text-[16px] font-semibold font-sans text-gray-800 capitalize mt-3">
            {accommodation.accommodation_type.replace(/_/g, " ")}
          </p>
        </div>
        <GradientPillSelect label="Stay Type" value={selectedStayType} onChange={setSelectedStayType}
          options={stayTypes.map((st) => ({ value: st, label: st === "non_transient" ? "Non-Transient" : "Transient" }))} />
        <GradientPillSelect label="Arrangement" value={selectedArrangement} onChange={setSelectedArrangement}
          options={arrangements.map((a) => ({ value: a, label: a.charAt(0).toUpperCase() + a.slice(1) }))} />
      </div>

      <div className="w-full h-[2px] bg-gray-200 mt-5"></div>

      <div className="mt-12">
        <p className="text-[18px] font-bold font-sans  tracking-widest text-[#9A7080] mb-1.5">Others</p>
        <div className="flex flex-wrap gap-2">
          {AMENITIES.map((a) => (
            <span key={a} className="text-white font-sans text-[16px] font-medium px-4 py-1.5 rounded-full" style={{ background: CLR.mid }}>{a}</span>
          ))}
        </div>
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

// Common UPLB landmarks the user can route to
const DESTINATIONS = [
  { label: "UPLB Main Gate", lat: 14.1675, lng: 121.2433 },
  { label: "Comtech Building (ICS Area)", lat: 14.1662, lng: 121.2489 },
  { label: "UPLB Main Library", lat: 14.1656, lng: 121.2389 },
  { label: "College of Engineering (CEAT)", lat: 14.1641, lng: 121.2471 },
  { label: "UPLB Market (Shopping Center)", lat: 14.1681, lng: 121.2402 },
  { label: "Baker Hall", lat: 14.1621, lng: 121.2416 }
]

function LocationTab({ accommodation }: { accommodation: Accommodation }) {

  // only keep destination selector (optional)
  const [destIndex, setDestIndex] = useState(0)

  const accomLat = accommodation.latitude
  const accomLng = accommodation.longitude 

  const selectedDest = DESTINATIONS[destIndex]

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

        {/*Dorm r */}
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
        <Marker longitude={selectedDest.lng} latitude={selectedDest.lat} anchor="bottom">
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
                border: '2px solid white',
                fontSize: 18,
                boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
              }}
            >
              📍
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
      </Map>
    </div>
  )
}


function ReviewsTab({ reviews, avgRating }: { reviews: Review[]; avgRating: number }) {
  const [sortBy, setSortBy] = useState<"recent" | "star" | "date">("recent");

  return (
    <div className="space-y-4 font-sans">
      {/*Filter */}
      <div className="flex items-center gap-2 flex-wrap justify-end">

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
              {i > 0 && (
                <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              )}

            </button>
          );
        })}
      </div>
      {/*Two columns for the summary and review details*/}
      <div  className="grid grid-cols-[1fr_1.8fr] gap-4 items-start">
        
        {/*Summary*/}
        <div className="flex flex-col items-center gap-2">
          {/* Pink card with just number + stars */}
          <div className="rounded-2xl bg-[#F7EFF2] border border-[#EFE3E8] p-5 w-full flex flex-col items-center gap-1">
            <p className="text-[37px] font-bold" style={{ color: CLR.mid }}>
              {avgRating.toFixed(1)}
            </p>
            <StarRating rating={avgRating} size="md" />
            <p className="text-normal text-[15px] text-[#3D0718]">{reviews.length} Ratings</p>

        </div>

        {/*Summary*/}
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
                      style={{
                        width: `${pct}%`,
                        background: "linear-gradient(90deg, #3D0718, #C9748A)",
                      }}
                    />
                  </div>
                  <span className="text-[14px] font-thin text-[#3D0718] w-5 text-right">{count}</span>
                </div>
              );
          })}



        </div>
          




        </div>
        {/*End of summary*/}
        

        {/*Review details*/}
        <div className="space-y-3 font-sans">
          {reviews.map((review) => (
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
                        ? `${review.student.user.fname} ${review.student.user.lname}`
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
        {/*End of Review details*/}

      </div>
    </div>
  )
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
      <div className="w-full overflow-x-auto rounded-mdborder border-[#F0E8EC] mt-5">
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

  const accommodation = MOCK_ACCOMMODATION;

  const [current, setCurrent] = useState(0);
  const [showAllPhotos, setShowAllPhotosModal] = useState(false);
  const displayPhotos = [
      "https://scontent.fmnl17-2.fna.fbcdn.net/v/t39.30808-6/470222608_983930173757933_998118782445933365_n.jpg?_nc_cat=111&ccb=1-7&_nc_sid=2a1932&_nc_ohc=ZFZK7m7SOa0Q7kNvwGOPvqH&_nc_oc=AdqDd-9KAVigCK_3EWtYSiKPI3LQcUVYJnrsKNS8FkAFYu_F7R1kEigwCaFZR-vRmV0&_nc_zt=23&_nc_ht=scontent.fmnl17-2.fna&_nc_gid=r4rDrZ-9ks0O0mnDt0AqYw&_nc_ss=7a3a8&oh=00_Af2gqklSV4YC1rlAVLymw3a5pkNBSRrBaSnbwKxtYMPVLQ&oe=69E8489C",
      "https://scontent.fmnl17-1.fna.fbcdn.net/v/t1.6435-9/66008036_487367045400857_1488351947843960832_n.jpg?_nc_cat=101&ccb=1-7&_nc_sid=f798df&_nc_ohc=ElHr-WrKZYcQ7kNvwFwvO8u&_nc_oc=Adpjp6BtjtcqZipKB0kvZwUKfdfmdA8FthjEjzcTTLJr_QrG8CJ_ziH_ueBWDhIj5m0&_nc_zt=23&_nc_ht=scontent.fmnl17-1.fna&_nc_gid=ohCc0hgO7ItkIo1D4h39dg&_nc_ss=7a3a8&oh=00_Af3SRsAoAaRLisofJivkX9TI-NV5f32-PPjLFNVUdbIgQw&oe=6A09DE9E",
      "https://scontent.fmnl17-2.fna.fbcdn.net/v/t1.6435-9/65525855_487366502067578_6498764386226667520_n.jpg?_nc_cat=111&ccb=1-7&_nc_sid=f798df&_nc_ohc=lwgSYY8aRXMQ7kNvwG8DE1O&_nc_oc=Adr3QJE6pJ4Ix9GhvyrIm46YivGbyqqWj91r19RGHeKAk1ek9OjWbNZ3W7X__QQmkwQ&_nc_zt=23&_nc_ht=scontent.fmnl17-2.fna&_nc_gid=Y31MEwZ9ofBlvh9xazaSVg&_nc_ss=7a3a8&oh=00_Af2hAC2OUloa4E3JKdO0biDPLF0cJGI2De9EDWbNGJ4spg&oe=6A09D9E6",
      "https://scontent.fmnl17-8.fna.fbcdn.net/v/t1.6435-9/65574464_487366468734248_8178610199741857792_n.jpg?_nc_cat=104&ccb=1-7&_nc_sid=f798df&_nc_ohc=EXZOAFgaSmEQ7kNvwGNMSIY&_nc_oc=Ado7mmT6oORNQgtkYEGMBuw_N8AtiWN5U0vvytCYvNjXU_uRCnqO7vejL1BEgWXksQo&_nc_zt=23&_nc_ht=scontent.fmnl17-8.fna&_nc_gid=G05aAyHCbEbugO1lM86-kA&_nc_ss=7a3a8&oh=00_Af0T8tdQzHrWjB2zeUZjedH8I5CpGvUDfq11soKx1O_Zwg&oe=6A09D02E",
    ];


  const [selectedTab, setselectedTab] = useState<TabKey>("Features");
  const [isFavorited, setIsFavorited] = useState(false);
  const [selectedStayType, setSelectedStayType] = useState<Room["room_stay_type"]>(accommodation.rooms[0]?.room_stay_type ?? "non_transient");
  const [selectedArrangement, setSelectedArrangement] = useState<Room["room_type"]>(accommodation.rooms[0]?.room_type ?? "single");

  const today = new Date().toISOString().split("T")[0];

  
  const [moveIn, setMoveIn] = useState(today);
  const [moveOut, setMoveOut] = useState(today);

  const manager = accommodation.manager;

  const selectedRoom = accommodation.rooms.find(
    (r) => r.room_stay_type === selectedStayType && r.room_type === selectedArrangement
  ) ?? accommodation.rooms[0];


  const tabs: {key: TabKey; label:string}[] = [
    { key: "Features", label: "Features"},
    { key: "Location", label: "Location" },
    { key: "Reviews", label: "Reviews"},
    { key: "Requirements", label: "Requirements"},
  ];


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
          <div className="grid grid-rows-2 gap-3" style={{ height: 300 }}>
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
              <StarRating rating={accommodation.avgrating} size="md" />
              <span className="text-[15px] font- text-[#9A7080] font-semibold mr-5">
                {accommodation.avgrating.toFixed(1)} ({accommodation.reviews.length})
              </span>
              <div className="ml-auto flex items-center gap-1">
                <button onClick={() => setIsFavorited((f) => !f)} className="flex items-center gap-1 text-[14px] font-semibold text-[#6B0F2B] px-2">
                  <IconHeart filled={isFavorited} /> Favorite
                </button>
                <button className="flex items-center gap-1 text-[14px] font-semibold text-[#6B0F2B] px-2">
                  <IconShare /> Share
                </button>
                <button className="flex items-center gap-1 text-[14px] font-semibold text-[#6B0F2B] px-2" >
                  <IconReport /> Report
                </button>
              </div>
            </div>
          <h1 className="text-[30px] font-bold text-gray-900 mb-1">{accommodation.accommodation_name}</h1>
          <p className="text-[15px] font-semibold text-[#6B0F2B]" >{accommodation.accommodation_location}</p>
          <p className="text-[18px] text-[#9A7080]">Studio · 22 m² · {accommodation.accommodation_type.replace(/_/g, " ")}</p>
          
          {/* Tabs*/ }
        <div className="flex justify-start bg-gray-100 rounded-lg px-2 mb-5 mt-6">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setselectedTab(t.key)}
              className={`flex-1 flex flex-col items-start px-4 py-2.5 text-[18px] font-semibold transition-colors whitespace-nowrap ${
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
          <FeaturesTab accommodation={accommodation}
            selectedStayType={selectedStayType} setSelectedStayType={setSelectedStayType}
            selectedArrangement={selectedArrangement} setSelectedArrangement={setSelectedArrangement} />
        )}
        {selectedTab == "Reviews" && <ReviewsTab reviews={accommodation.reviews} avgRating={accommodation.avgrating} />}
        {selectedTab === "Requirements" && <RequirementsTab />}
        {selectedTab === 'Location' && <LocationTab accommodation={accommodation} />}




        

          
        </div>

          <div className="mt-3 font-sans">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              {/* Price */}
              <div className="mx-9">
                <div className="mb-1">
                  <p className="text-[15px] font-bold text-[#3D0718] mt-2">Starts at: </p>
                  <span className="text-[37px] font-bold font-sans text-[#6B0F2B]">
                    ₱{selectedRoom?.room_rent.toLocaleString() ?? "—"}
                  </span>
                  <span className="text-[21px] font-normal text-[#9A7080]"> / month</span>
                </div>
                <div className="w-full h-[6px] bg-gray-200 mt-2"></div>
                <p className="text-[15px] font-normal text-[#000000] mt-2">2 months advance, 1 month deposit</p>

                {/* Inclusions */}
                <p className="text-[15px] font-bold text-[#9A7080] mt-2">Inclusions:</p>
                <div className="flex gap-4 mb-4 mt-2">
                  <span className="flex items-center gap-1.5 text-[12px] text-[#6B0F2B] font-medium"><IconBolt /> Electricity</span>
                  <span className="flex items-center gap-1.5 text-sm text-gray-600 font-medium"><IconDroplet /> Water</span>
                  <span className="flex items-center gap-1.5 text-sm text-gray-600 font-medium"><IconWifi /> Wifi</span>
                </div>

                {/* Dates */}
                <p className="text-[15px] font-bold text-[#9A7080] mt-2">Duration of Stay:</p>
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div className="mt-2">
                    <p className="text-[13px] text-[#6B0F2B] mb-1">Target Move-In</p>
                    <input type="date" value={moveIn} onChange={(e) => setMoveIn(e.target.value)}
                      className="w-full border border-[#6B0F2B] rounded-xl px-3 py-2 text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#C9973A]/30 focus:border-[#C9973A] transition" />
                  </div>
                  <div className="mt-2">
                    <p className="text-[13px] text-[#6B0F2B] mb-1">Target Move-Out</p>
                    <input type="date" value={moveOut} onChange={(e) => setMoveOut(e.target.value)}
                      className="w-full border  border-[#6B0F2B] rounded-xl px-3 py-2 text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#C9973A]/30 focus:border-[#C9973A] transition" />
                  </div>
                </div>

              {manager && (
                <div className="border border-[#F0E8EC] rounded-2xl p-4 flex flex-col items-center gap-1.5 mb-4">
                  <div className="w-14 h-14 rounded-full flex items-center justify-center text-white text-lg font-bold mb-1"
                    style={{ background: manager.pfp_file ? `url(${assetUrl(manager.pfp_file.file_path)}) center/cover` : CLR.mid }}>
                    {!manager.pfp_file && `${manager.fname[0]}${manager.lname[0]}`}
                  </div>
                  <div className="w-full h-[2px] bg-[#F0E8EC] mt-2 mx-4"></div>

                  <p className="font-bold text-[#000000] text-[16px] flex items-center gap-1.5">
                    {manager.fname} {manager.lname} <IconVerified />
                  </p>

                  <p className="text-[11px] font-semibold text-[#848484] mb-1">Dorm Manager</p>
                  <p className="flex items-center gap-1.5 text-xs text-[#848484]">
                    <IconPhone /> (+63){manager.phone?.slice(1) ?? "XXX XXX XXXX"}
                  </p>
                  <p className="flex items-center gap-1.5 text-xs text-gray-500">
                    <IconMail /> {manager.email}
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
                  className="w-full text-white text-[15px] font-bold py-3.5 rounded-xl transition-colors"
                  style={{ background: "linear-gradient(135deg, #2D0511, #9A1F3E)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = CLR.mid)}
                  onMouseLeave={(e) => (e.currentTarget.style.background = CLR.dark)}>
                  Apply for Occupancy
                </button>
                
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