import { useState, useRef, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Modal from "../../components/Modal";
import Button from "../../components/Button";
import LocationPickerMap from "../../components/LocationPickerMap";
import { useAccommodationFormStore } from "../../stores/useAccommodationFormStore";
import { Upload, Paperclip, MapPin, Users, Building2, Clock, ArrowRight, Check, X } from "lucide-react";
import { api } from "../../api/axios";
import { useNavigate } from 'react-router-dom';
import defaultAccommodationImage from '../../assets/defaults/accommodation.png';
import Sidebar from "../../components/Sidebar";
import { setLandlordSidebarContext } from "../../components/Sidebar";
import Toast from "../../components/Toast";
import NotificationPanel, { type Notification } from "../../components/NotificationPanel";
import notif_icon from "../../assets/icons/notif_icon.svg";
import UbleLoader from "../shared/LoadingPage";
import CustomHeader from "../../components/CustomHeader"

const COMMON_AMENITIES = [
  "WiFi", "Air Conditioning", "Kitchen", "Laundry", "Study Area",
  "Parking", "24/7 Security", "CCTV", "Furnished", "Balcony",
  "Pet Friendly", "Water Dispenser", "Cable TV", "Elevator",
  "Backup Generator", "Swimming Pool", "Gym", "Garden / Courtyard",
  "Reception / Lobby", "Room Cleaning Service", "In‑room Bathroom",
];

// ─── Accommodation Card ───────────────────────────────────────────────────────
const AccommodationCard: React.FC<{ accommodation: any }> = ({ accommodation }) => {
  const navigate = useNavigate();
  const status = accommodation.status;
  const isUnderReview = status !== 'verified';
  const [imgError, setImgError] = useState(false);

  const primaryImage = !imgError && accommodation.primaryImageUrl
    ? accommodation.primaryImageUrl
    : defaultAccommodationImage;

  const typeLabel = accommodation.accommodationType === 'on-campus' ? 'On Campus'
    : accommodation.accommodationType === 'off-campus' ? 'Off Campus'
    : 'UPLB Partner';

  const handleClick = () => {
    if (!isUnderReview) {
      navigate(`/landlord/accommodation/${accommodation.id}`)
    }
  }

  return (
    <div
      onClick={handleClick}
      className={`group relative bg-white rounded-2xl overflow-hidden shadow-sm transition-all duration-300 border border-gray-100 ${
        isUnderReview
          ? "cursor-not-allowed opacity-80"
          : "cursor-pointer hover:shadow-xl hover:border-[#8C1535]/20"
      }`}
    >
      <div className="relative h-40 sm:h-48 overflow-hidden">
        <img
          src={primaryImage}
          className={`w-full h-full object-cover transition-transform duration-500 ${!isUnderReview ? "group-hover:scale-110" : ""}`}
          alt={accommodation.accommodationName}
          onError={() => setImgError(true)}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute top-2 sm:top-3 left-2 sm:left-3">
          {isUnderReview ? (
            <span className="px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[9px] sm:text-[10px] font-bold bg-yellow-100 text-yellow-700 border border-yellow-200">Under Review</span>
          ) : (
            <span className="px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[9px] sm:text-[10px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">Verified</span>
          )}
        </div>
        <div className="absolute top-2 sm:top-3 right-2 sm:right-3">
          <span className="px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[9px] sm:text-[10px] font-bold bg-white/90 text-[#6B0F2B] backdrop-blur-sm">{typeLabel}</span>
        </div>
        <div className="absolute bottom-2 sm:bottom-3 left-2 sm:left-3 right-2 sm:right-3">
          <h3 className="text-white font-bold text-base sm:text-lg leading-tight drop-shadow-lg truncate">{accommodation.accommodationName}</h3>
          <div className="flex items-center gap-1 mt-0.5 sm:mt-1">
            <MapPin size={11} className="sm:w-3 sm:h-3 text-white/70 flex-shrink-0" />
            <p className="text-white/80 text-[10px] sm:text-xs truncate">{accommodation.accommodationLocation}</p>
          </div>
        </div>
      </div>
      <div className="p-3 sm:p-4">
        <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4 text-[10px] sm:text-xs text-gray-500">
          <div className="flex items-center gap-1"><Users size={12} className="sm:w-[13px] sm:h-[13px]" /><span>{accommodation.accommodationCapacity} capacity</span></div>
          <div className="flex items-center gap-1"><Building2 size={12} className="sm:w-[13px] sm:h-[13px]" /><span className="capitalize">{accommodation.accommodationType?.replace('_', ' ')}</span></div>
        </div>
        {accommodation.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1 sm:gap-1.5 mb-3 sm:mb-4">
            {accommodation.tags.slice(0, 4).map((tag: any) => (
              <span key={tag.id || tag.tagDetail} className="px-1.5 sm:px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-medium bg-[#8C1535]/5 text-[#8C1535] border border-[#8C1535]/10">{tag.tagDetail}</span>
            ))}
            {accommodation.tags.length > 4 && <span className="px-1.5 sm:px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-medium text-gray-400">+{accommodation.tags.length - 4}</span>}
          </div>
        )}
        <button
          onClick={(e) => { e.stopPropagation(); handleClick() }}
          disabled={isUnderReview}
          className={`w-full flex items-center justify-center gap-1.5 sm:gap-2 py-2 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 ${
            isUnderReview ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-gradient-to-r from-[#6B0F2B] to-[#8C1535] text-white hover:from-[#8C1535] hover:to-[#6B0F2B] shadow-md hover:shadow-lg"
          }`}
        >
          {isUnderReview ? <><Clock size={13} className="sm:w-[15px] sm:h-[15px]" />Pending Review</> : <>Manage <ArrowRight size={13} className="sm:w-[15px] sm:h-[15px]" /></>}
        </button>
      </div>
      {isUnderReview && (
        <div className="absolute inset-0 bg-[#7a001f]/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <div className="text-center px-4">
            <Clock size={28} className="sm:w-8 sm:h-8 text-white mx-auto mb-2" />
            <span className="bg-white text-[#7a001f] text-[10px] sm:text-xs font-semibold px-3 sm:px-4 py-1.5 sm:py-2 rounded-full shadow">Under Review By Admin</span>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Add Card ─────────────────────────────────────────────────────────────────
const AddCard: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <div onClick={onClick}
    className="cursor-pointer min-h-[280px] sm:min-h-[320px] border-2 border-dashed border-[#d9a5ad] rounded-2xl flex flex-col items-center justify-center text-gray-500 hover:border-[#8C1535] hover:text-[#8C1535] hover:bg-[#8C1535]/[0.02] transition-all duration-300 group p-4">
    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-[#8C1535]/10 flex items-center justify-center mb-3 sm:mb-4 group-hover:bg-[#8C1535]/20 group-hover:scale-110 transition-all duration-300">
      <span className="text-2xl sm:text-3xl text-[#8C1535]">+</span>
    </div>
    <p className="text-xs sm:text-sm font-bold text-center">Add New Accommodation</p>
    <p className="text-[10px] sm:text-xs mt-1 opacity-60 text-center">List your property for students</p>
  </div>
);

// ─── STEP 1 ──────────────────────────────────────────────────────────────────
const StepOne = ({ onNext, amenities, setAmenities }: {
  onNext: () => void; amenities: string[]; setAmenities: (a: string[]) => void;
}) => {
  const { accommodationName, accommodationType, tenantRestriction, accommodationCapacity, businessPermit, latitude, longitude, setField, setBusinessPermit } = useAccommodationFormStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [customAmenityInput, setCustomAmenityInput] = useState("");

  const handleFileUpload = (file: File | null) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setErrors((e) => ({ ...e, businessPermit: "File must be under 5MB." })); return; }
    setErrors((e) => ({ ...e, businessPermit: "" })); setBusinessPermit(file);
  };

  const addCustomAmenity = () => {
    const trimmed = customAmenityInput.trim();
    if (trimmed && !amenities.includes(trimmed)) { setAmenities([...amenities, trimmed]); setCustomAmenityInput(""); }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!accommodationName.trim()) newErrors.accommodationName = "Required";
    if (!accommodationType) newErrors.accommodationType = "Required";
    if (!tenantRestriction) newErrors.tenantRestriction = "Required";
    if (!accommodationCapacity || parseInt(accommodationCapacity) < 1) newErrors.accommodationCapacity = "Must be at least 1";
    if (!businessPermit) newErrors.businessPermit = "Business permit is required";
    if (latitude === null || longitude === null) newErrors.location = "Please set a location on the map";
    return newErrors;
  };

  const handleNext = () => {
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setTimeout(() => {
        if (modalRef.current) {
          const firstError = modalRef.current.querySelector('.border-red-500, .text-red-500');
          if (firstError) {
            firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }
      }, 100);
      return;
    }
    onNext();
  };

  return (
    <div ref={modalRef} className="space-y-3 sm:space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-[9px] sm:text-[10px] font-semibold tracking-wide text-[#7a001f]">ACCOMMODATION NAME</label>
          <input value={accommodationName} onChange={(e) => setField("accommodationName", e.target.value)}
            className={`border rounded-xl p-2.5 sm:p-3 text-xs sm:text-sm w-full focus:outline-none focus:ring-2 focus:ring-[#7a001f]/30 ${errors.accommodationName ? "border-red-500" : "border-[#e5cfd4]"}`}
            placeholder="e.g., Kamia Residence" />
          {errors.accommodationName && <p className="text-red-500 text-[10px] sm:text-xs">{errors.accommodationName}</p>}
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[9px] sm:text-[10px] font-semibold tracking-wide text-[#7a001f]">ACCOMMODATION TYPE</label>
          <select value={accommodationType} onChange={(e) => setField("accommodationType", e.target.value as any)}
            className={`border rounded-xl p-2.5 sm:p-3 text-xs sm:text-sm w-full focus:outline-none focus:ring-2 focus:ring-[#7a001f]/30 ${errors.accommodationType ? "border-red-500" : "border-[#e5cfd4]"}`}>
            <option value="">Select type</option>
            <option value="on-campus">On Campus</option>
            <option value="off-campus">Off Campus</option>
            <option value="partner_housing">Partnered Housing (UPLB)</option>
          </select>
          {errors.accommodationType && <p className="text-red-500 text-[10px] sm:text-xs">{errors.accommodationType}</p>}
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-[9px] sm:text-[10px] font-semibold tracking-wide text-[#7a001f]">ACCOMMODATION ADDRESS</label>
        <LocationPickerMap />
        {errors.location && <p className="text-red-500 text-[10px] sm:text-xs">{errors.location}</p>}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-[9px] sm:text-[10px] font-semibold tracking-wide text-[#7a001f]">TENANT RESTRICTION</label>
          <select value={tenantRestriction} onChange={(e) => setField("tenantRestriction", e.target.value as any)}
            className={`border rounded-xl p-2.5 sm:p-3 text-xs sm:text-sm w-full focus:outline-none focus:ring-2 focus:ring-[#7a001f]/30 ${errors.tenantRestriction ? "border-red-500" : "border-[#e5cfd4]"}`}>
            <option value="">Select restriction</option>
            <option value="coed">Co-ed</option>
            <option value="female-only">Female only</option>
            <option value="male-only">Male only</option>
          </select>
          {errors.tenantRestriction && <p className="text-red-500 text-[10px] sm:text-xs">{errors.tenantRestriction}</p>}
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[9px] sm:text-[10px] font-semibold tracking-wide text-[#7a001f]">CAPACITY</label>
          <input
            type="number"
            value={accommodationCapacity}
            onChange={(e) => {
              const val = parseInt(e.target.value)
              if (e.target.value === "" || (!isNaN(val) && val >= 0)) {
                setField("accommodationCapacity", e.target.value)
              }
            }}
            min="0"
            className={`border rounded-xl p-2.5 sm:p-3 text-xs sm:text-sm w-full focus:outline-none focus:ring-2 focus:ring-[#7a001f]/30 ${errors.accommodationCapacity ? "border-red-500" : "border-[#e5cfd4]"}`}
            placeholder="e.g., 20" />
          {errors.accommodationCapacity && <p className="text-red-500 text-[10px] sm:text-xs">{errors.accommodationCapacity}</p>}
        </div>
      </div>
      <div className="border border-[#e5cfd4] rounded-xl p-3 sm:p-4 space-y-2 sm:space-y-3">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <Check size={14} className="sm:w-4 sm:h-4 text-emerald-600 flex-shrink-0" />
          <label className="text-[9px] sm:text-xs font-bold tracking-wide text-emerald-700">ACCOMMODATION AMENITIES</label>
          <span className="text-[8px] sm:text-[10px] text-gray-400 ml-auto hidden sm:inline">Features available</span>
        </div>
        {amenities.length > 0 && (
          <div className="flex flex-wrap gap-1 sm:gap-1.5">
            {amenities.map((name) => (
              <span key={name} className="inline-flex items-center gap-1 sm:gap-1.5 pl-2 sm:pl-2.5 pr-1 sm:pr-1.5 py-1 sm:py-1.5 bg-emerald-600 text-white rounded-full text-[9px] sm:text-xs font-medium">
                <Check size={10} className="sm:w-3 sm:h-3" />{name}
                <button type="button" onClick={() => setAmenities(amenities.filter(a => a !== name))} className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex items-center justify-center hover:bg-emerald-700 rounded-full transition"><X size={10} className="sm:w-3 sm:h-3" /></button>
              </span>
            ))}
          </div>
        )}
        <div>
          <p className="text-[8px] sm:text-[10px] text-gray-500 mb-1.5">Common amenities (click to toggle):</p>
          <div className="flex flex-wrap gap-1 sm:gap-1.5">
            {COMMON_AMENITIES.map((name) => {
              const isSelected = amenities.includes(name);
              return (
                <button key={name} type="button" onClick={() => setAmenities(isSelected ? amenities.filter(a => a !== name) : [...amenities, name])}
                  className={`inline-flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[8px] sm:text-[10px] font-medium transition-all border ${isSelected ? "bg-emerald-600 text-white border-emerald-600" : "bg-white text-gray-600 border-gray-200 hover:border-emerald-300 hover:text-emerald-700"}`}>
                  {isSelected && <Check size={8} className="sm:w-2.5 sm:h-2.5" />}{name}
                </button>
              );
            })}
          </div>
        </div>
        <div className="flex gap-1.5 sm:gap-2">
          <input type="text" value={customAmenityInput} onChange={(e) => setCustomAmenityInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCustomAmenity(); } }} placeholder="Add custom amenity..." className="flex-1 border border-[#e5cfd4] rounded-lg px-2.5 sm:px-3 py-1.5 text-[10px] sm:text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 transition" />
          <Button variant="secondary" size="sm" onClick={addCustomAmenity} type="button" className="text-[10px] sm:text-xs !py-1.5">Add</Button>
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-[9px] sm:text-[10px] font-semibold tracking-wide text-[#7a001f]">BUSINESS PERMIT</label>
        <div className={`flex flex-col items-center justify-center gap-3 border-2 border-dashed rounded-2xl p-4 sm:p-6 cursor-pointer transition ${dragOver ? "border-[#C9973A] bg-[#C9973A]/5" : errors.businessPermit ? "border-red-500 bg-red-50" : "border-[#6B0F2B]/20 bg-white"}`}
          onClick={() => fileInputRef.current?.click()} onDragOver={(e) => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)} onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFileUpload(e.dataTransfer.files[0]); }}>
          <input ref={fileInputRef} type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={(e) => handleFileUpload(e.target.files?.[0] ?? null)} />
          <div className="bg-[#6B0F2B]/10 rounded-2xl p-3 sm:p-4"><Upload className="w-5 h-5 sm:w-6 sm:h-6 text-[#6B0F2B]" strokeWidth={2} /></div>
          <div className="text-center"><p className="font-semibold text-sm sm:text-base text-[#1a1a1a]">Upload Business Permit</p><p className="text-[10px] sm:text-xs text-gray-400 mt-0.5 uppercase">.PDF, .JPG, .PNG. Max 5MB</p></div>
          {businessPermit ? (
            <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-[#6B0F2B] bg-[#6B0F2B]/10 px-3 py-1.5 rounded-full max-w-full min-w-0">
              <Paperclip className="w-3 h-3 flex-shrink-0" /><span className="min-w-0 flex-1 truncate">{businessPermit.name}</span>
              <button onClick={(e) => { e.stopPropagation(); setBusinessPermit(null); }} className="ml-1 hover:text-red-500 transition flex-shrink-0">✕</button>
            </div>
          ) : (
            <span className="text-[10px] sm:text-xs font-bold text-[#6B0F2B] px-3 sm:px-4 py-1.5 rounded-full border border-[#6B0F2B]/10 bg-[#6B0F2B]/10 flex items-center gap-1">📄 Required</span>
          )}
        </div>
        {errors.businessPermit && <p className="text-red-500 text-[10px] sm:text-xs">{errors.businessPermit}</p>}
      </div>
      <div className="flex justify-end"><Button onClick={handleNext} size="sm" className="sm:size-md">Next →</Button></div>
    </div>
  );
};

// ─── STEP 2 ──────────────────────────────────────────────────────────────────
const StepTwo = ({ onBack, onClose, amenities, onSuccess }: {
  onBack: () => void; onClose: () => void; amenities: string[]; onSuccess: () => void;
}) => {
  const { images, imagePreviews, primaryImageIndex, accommodationName, accommodationType, accommodationLocation,
    accommodationCapacity, tenantRestriction, businessPermit, latitude, longitude, addImages, removeImage, setPrimaryImage, reset } = useAccommodationFormStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      if (images.length < 4) throw new Error("At least 4 images are required.");
      const formData = new FormData();
      formData.append("accommodation_name", accommodationName);
      formData.append("accommodation_type", accommodationType);
      formData.append("accommodation_location", accommodationLocation);
      formData.append("accommodation_capacity", String(accommodationCapacity));
      formData.append("tenant_restriction", tenantRestriction);
      formData.append("latitude", String(latitude));
      formData.append("longitude", String(longitude));
      formData.append("primary_image_index", String(primaryImageIndex));
      if (businessPermit) formData.append("business_permit", businessPermit);
      images.forEach((img) => formData.append("images", img));
      amenities.forEach((tag) => formData.append("tags[]", tag));
      const res = await api.post("/landlord/accommodations", formData, { headers: { "Content-Type": "multipart/form-data" } });
      return res.data;
    },
    onSuccess: () => {
      reset();
      onClose();
      queryClient.invalidateQueries({ queryKey: ['landlord-accommodations'] });
      onSuccess();
    },
    onError: (err: any) => { setSubmitError(err?.response?.data?.message ?? "Something went wrong."); },
  });

  const handleImageUpload = (files: FileList | null) => { if (!files) return; addImages(Array.from(files)); };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 sm:gap-4">
        {imagePreviews.map((preview, i) => (
          <div key={i} className={`relative rounded-xl overflow-hidden ${primaryImageIndex === i ? "ring-2 ring-[#7a001f]" : ""}`}>
            <img src={preview} className="w-full h-28 sm:h-32 object-cover" alt={`Upload ${i}`} />
            <div className="absolute top-2 left-2 flex gap-1.5 sm:gap-2">
              <button onClick={() => setPrimaryImage(i)} className="bg-white text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full shadow hover:bg-gray-100">{primaryImageIndex === i ? "Primary ✓" : "Set as Primary"}</button>
              <button onClick={() => removeImage(i)} className="bg-red-500 text-white text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full shadow hover:bg-red-600">Remove</button>
            </div>
          </div>
        ))}
        <div className={`border-2 border-dashed rounded-xl h-28 sm:h-32 flex flex-col items-center justify-center cursor-pointer transition ${dragOver ? "border-[#C9973A] bg-[#C9973A]/5" : "border-[#6B0F2B]/20 bg-white"}`}
          onClick={() => fileInputRef.current?.click()} onDragOver={(e) => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)} onDrop={(e) => { e.preventDefault(); setDragOver(false); handleImageUpload(e.dataTransfer.files); }}>
          <input ref={fileInputRef} type="file" accept=".jpg,.jpeg,.png,.webp" multiple className="hidden" onChange={(e) => handleImageUpload(e.target.files)} />
          <div className="bg-[#6B0F2B]/10 rounded-xl p-1.5 sm:p-2 mb-1"><Upload className="w-4 h-4 sm:w-5 sm:h-5 text-[#6B0F2B]" strokeWidth={2} /></div>
          <p className="text-[10px] sm:text-xs text-gray-500">Click or drag to upload</p>
        </div>
      </div>
      {images.length < 4 && <p className="text-[10px] sm:text-xs text-red-500">At least 4 images are required.</p>}
      {submitError && <p className="text-[10px] sm:text-xs text-red-500 text-center">{submitError}</p>}
      <div className="flex justify-between gap-3 sm:gap-4">
        <Button onClick={onBack} variant="secondary" size="sm" disabled={isPending}>← Back</Button>
        <Button onClick={() => mutate()} variant="primary" size="sm" disabled={isPending || images.length < 4}>
          {isPending ? <><div className="w-3.5 h-3.5 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Submitting...</> : "Submit"}
        </Button>
      </div>
    </div>
  );
};

// ─── Main Dashboard ──────────────────────────────────────────────────────────
// ─── Main Dashboard ──────────────────────────────────────────────────────────
const ManageAccommodationDashboard: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [amenities, setAmenities] = useState<string[]>([]);
  const reset = useAccommodationFormStore((s) => s.reset);
  const navigate = useNavigate();

  const [toast, setToast] = useState<{ show: boolean; type: "success" | "error"; title: string; message?: string }>({
    show: false, type: "success", title: ""
  });

  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const notifWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setLandlordSidebarContext("minimal"); }, []);

  const { data: user, isLoading, isError } = useQuery({
    queryKey: ['me'], queryFn: async () => { const res = await api.get('/me'); return res.data; }
  });

  const { data: accommodations, refetch } = useQuery({
      queryKey: ['landlord-accommodations'],
      queryFn: async () => { const res = await api.get('/landlord/accommodations'); return res.data ?? []; },
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
  });

  const verifiedAccommodations = (accommodations ?? []).filter((a: any) => a.status !== 'rejected');

  useEffect(() => { if (isError) navigate('/auth/signin'); }, [isError, navigate]);

  useEffect(() => {
    api.get('/notifications').then(({ data }) => {
      setNotifications(
        data.map((n: any) => ({
          id: n.id,
          type: n.notificationType,
          message: n.notificationContent,
          time: new Date(n.notificationTimestamp).toLocaleString(),
          read: n.readStatus === 'read',
        }))
      )
    }).catch(console.error)
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => {
    notifications.filter((n) => !n.read).forEach((n) =>
      api.patch(`/notifications/${n.id}`, { readStatus: 'read' }).catch(console.error)
    )
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  };

  const markOneRead = (id: number) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
    api.patch(`/notifications/${id}`, { readStatus: 'read' }).catch(console.error)
  };

  const handleClose = () => { setOpen(false); setStep(1); setAmenities([]); };

  const handleSuccessClose = () => {
    setOpen(false); setStep(1); reset(); setAmenities([]); refetch();
    setToast({ show: true, type: "success", title: "Accommodation Submitted!", message: "Your property is now under review by admin." });
  };

  if (isLoading) return <UbleLoader />;
  if (isError) return null;

  return (
    <div className="flex flex-col h-screen bg-[#F5EEF0] overflow-y-auto">
      {/* Header */}
      <CustomHeader
        title="Properties"
        right={
          <div className="relative" ref={notifWrapperRef}>
            <button
              aria-label="Notifications"
              onClick={() => setNotifOpen((prev) => !prev)}
              className="w-12 h-11 mb-1 rounded-2xl flex items-center justify-center relative overflow-hidden
                transition-all duration-150
                bg-[#8C1535] hover:bg-[#8C1535]/80 active:bg-[#3D0718]
                hover:-translate-y-1 active:translate-y-0 active:scale-95"
            >
              <img
                src={notif_icon}
                alt="Notifications"
                className="w-full h-full object-contain scale-[2.5]"
              />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-white text-[#8C1535] text-[9px] font-bold flex items-center justify-center border-2 border-[#8C1535]">
                  {unreadCount}
                </span>
              )}
            </button>
            <NotificationPanel
              open={notifOpen}
              notifications={notifications}
              unreadCount={unreadCount}
              onMarkAllRead={markAllRead}
              onMarkOneRead={markOneRead}
              onClose={() => setNotifOpen(false)}
              wrapperRef={notifWrapperRef}
            />
          </div>
        }
      />

      {/* Main content - scrolls naturally */}
      <main className="flex-1 p-4 sm:p-6 lg:p-10">
        <div className="text-center mb-6 sm:mb-10">
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-[#C9973A]/10 text-[#C9973A] text-[9px] sm:text-[10px] font-bold tracking-widest uppercase mb-3 sm:mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C9973A]" />Landlord Portal
          </div>
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-['Cormorant_Garamond'] font-semibold text-[#1a0a0f] tracking-tight leading-[0.85]">
            Manage Your <span className="italic text-[#8C1535]">Properties</span>
          </h2>
          <p className="text-gray-500 mt-3 sm:mt-4 max-w-lg mx-auto leading-relaxed text-xs sm:text-sm px-4">
            List, review, and update your accommodations to keep your listings accurate and attractive for students.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8 max-w-md mx-auto">
          {[
            { value: verifiedAccommodations.length, label: "Properties", color: "text-[#8C1535]" },
            { value: verifiedAccommodations.filter((a: any) => a.status === 'verified').length, label: "Verified", color: "text-emerald-600" },
            { value: verifiedAccommodations.filter((a: any) => a.status === 'pending').length, label: "Pending", color: "text-amber-600" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-2xl p-3 sm:p-4 text-center shadow-sm border border-gray-100">
              <p className={`text-xl sm:text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-[9px] sm:text-[10px] font-semibold text-gray-400 uppercase tracking-wider mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {verifiedAccommodations.map((accommodation: any) => (
            <AccommodationCard key={accommodation.id} accommodation={accommodation} />
          ))}
          <AddCard onClick={() => setOpen(true)} />
        </div>
      </main>

      <Modal open={open} onClose={handleClose}
        title={step === 1 ? "ADD A NEW ACCOMMODATION" : "UPLOAD IMAGES"}
        eyebrow={step === 1 ? "FILL IN THE DETAILS" : "ADD PHOTOS"} maxWidth={560}>
        {step === 1 ? (
          <StepOne onNext={() => setStep(2)} amenities={amenities} setAmenities={setAmenities} />
        ) : (
          <StepTwo onBack={() => setStep(1)} onClose={handleClose} amenities={amenities} onSuccess={handleSuccessClose} />
        )}
      </Modal>

      <Toast
        type={toast.type}
        title={toast.title}
        message={toast.message}
        show={toast.show}
        onClose={() => setToast(prev => ({ ...prev, show: false }))}
      />
    </div>
  );
};

export default ManageAccommodationDashboard;