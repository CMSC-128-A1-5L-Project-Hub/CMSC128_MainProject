import { useState, useRef, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import Modal from "../../components/Modal";
import Button from "../../components/Button";
import LocationPickerMap from "../../components/LocationPickerMap";
import { useAccommodationFormStore } from "../../stores/useAccommodationFormStore";
import { Upload, Paperclip } from "lucide-react";
import { api } from "../../api/axios";
import { useNavigate } from 'react-router-dom';
import defaultAccommodationImage from '../../assets/defaults/accommodation.png';
import Sidebar from "../../components/Sidebar";
import { setLandlordSidebarContext } from "../../components/Sidebar";


// ─── Accommodation Card ───────────────────────────────────────────────────────
const AccommodationCard: React.FC<{ accommodation: any }> = ({ accommodation }) => {
  const navigate = useNavigate();
  const status = accommodation.status;
  const isUnderReview = status !== 'verified';

  const primaryImage = accommodation.primaryImageUrl ?? defaultAccommodationImage;

  return (
    <div className="relative rounded-2xl shadow-md bg-white overflow-hidden group">
      <img
        src={primaryImage}
        className={`w-full h-32 object-cover ${isUnderReview ? "group-hover:blur-[2px] transition-all duration-300" : ""}`}
        alt="Accommodation"
      />
      <div className="p-4">
        <h3 className="text-sm font-semibold">{accommodation.accommodationName}</h3>
        <p className="text-xs text-gray-500">{accommodation.accommodationLocation}</p>
        <Button
          className={`mt-4 w-full ${isUnderReview ? "opacity-50 cursor-not-allowed" : ""}`}
          disabled={isUnderReview}
          onClick={() => navigate(`/landlord/accommodation/${accommodation.id}`)}
        >
          Manage →
        </Button>
      </div>
      {isUnderReview && (
        <div className="absolute inset-0 bg-[#7a001f]/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer">
          <span className="bg-white text-[#7a001f] text-xs font-semibold px-4 py-2 rounded-full shadow hover:scale-105 transition-transform duration-200">
            Under Review By Admin
          </span>
        </div>
      )}
    </div>
  );
};

// ─── Add Card ─────────────────────────────────────────────────────────────────
const AddCard: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <div
    onClick={onClick}
    className="cursor-pointer h-48 border-2 border-dashed border-[#d9a5ad] rounded-2xl flex flex-col items-center justify-center text-sm text-gray-600 hover:bg-[#faf3f5] transition"
  >
    <div className="w-10 h-10 rounded-full bg-[#f1d7db] flex items-center justify-center mb-2">+</div>
    Add New Accommodation
  </div>
);

// ─── STEP 1: Details + Location ───────────────────────────────────────────────
const StepOne = ({ onNext }: { onNext: () => void }) => {
  const {
    accommodationName,
    accommodationType,
    tenantRestriction,
    accommodationCapacity,
    businessPermit,
    latitude,
    longitude,
    setField,
    setBusinessPermit,
  } = useAccommodationFormStore();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleFileUpload = (file: File | null) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setErrors((e) => ({ ...e, businessPermit: "File must be under 5MB." }));
      return;
    }
    setErrors((e) => ({ ...e, businessPermit: "" }));
    setBusinessPermit(file);
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!accommodationName.trim()) newErrors.accommodationName = "Required";
    if (!accommodationType) newErrors.accommodationType = "Required";
    if (!tenantRestriction) newErrors.tenantRestriction = "Required";
    if (!accommodationCapacity) newErrors.accommodationCapacity = "Required";
    if (!businessPermit) newErrors.businessPermit = "Business permit is required";
    if (latitude === null || longitude === null) newErrors.location = "Please set a location on the map";
    return newErrors;
  };

  const handleNext = () => {
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    onNext();
  };

  return (
    <div className="space-y-4 sm:space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-semibold tracking-wide text-[#7a001f]">ACCOMMODATION NAME</label>
          <input
            value={accommodationName}
            onChange={(e) => setField("accommodationName", e.target.value)}
            className="border border-[#e5cfd4] rounded-xl p-3 text-sm w-full focus:outline-none focus:ring-2 focus:ring-[#7a001f]/30"
            placeholder="e.g., Kamia Residence"
          />
          {errors.accommodationName && <p className="text-red-500 text-xs">{errors.accommodationName}</p>}
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-semibold tracking-wide text-[#7a001f]">ACCOMMODATION TYPE</label>
          <select
            value={accommodationType}
            onChange={(e) => setField("accommodationType", e.target.value as any)}
            className="border border-[#e5cfd4] rounded-xl p-3 text-sm w-full focus:outline-none focus:ring-2 focus:ring-[#7a001f]/30"
          >
            <option value="">Select type</option>
            <option value="on-campus">On Campus</option>
            <option value="off-campus">Off Campus</option>
            <option value="partner_housing">Partnered Housing (UPLB)</option>
          </select>
          {errors.accommodationType && <p className="text-red-500 text-xs">{errors.accommodationType}</p>}
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-[10px] font-semibold tracking-wide text-[#7a001f]">ACCOMMODATION ADDRESS</label>
        <LocationPickerMap />
        {errors.location && <p className="text-red-500 text-xs">{errors.location}</p>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-semibold tracking-wide text-[#7a001f]">TENANT RESTRICTION</label>
          <select
            value={tenantRestriction}
            onChange={(e) => setField("tenantRestriction", e.target.value as any)}
            className="border border-[#e5cfd4] rounded-xl p-3 text-sm w-full focus:outline-none focus:ring-2 focus:ring-[#7a001f]/30"
          >
            <option value="">Select restriction</option>
            <option value="coed">Co-ed</option>
            <option value="female-only">Female only</option>
            <option value="male-only">Male only</option>
          </select>
          {errors.tenantRestriction && <p className="text-red-500 text-xs">{errors.tenantRestriction}</p>}
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-semibold tracking-wide text-[#7a001f]">CAPACITY</label>
          <input
            type="number"
            value={accommodationCapacity}
            onChange={(e) => setField("accommodationCapacity", e.target.value)}
            placeholder="e.g., 20"
            className="border border-[#e5cfd4] rounded-xl p-3 text-sm w-full focus:outline-none focus:ring-2 focus:ring-[#7a001f]/30"
          />
          {errors.accommodationCapacity && <p className="text-red-500 text-xs">{errors.accommodationCapacity}</p>}
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-[10px] font-semibold tracking-wide text-[#7a001f]">BUSINESS PERMIT</label>
        <div
          className={`flex flex-col items-center justify-center gap-3 border-2 border-dashed rounded-2xl p-4 sm:p-6 cursor-pointer transition
            ${dragOver ? "border-[#C9973A] bg-[#C9973A]/5" : "border-[#6B0F2B]/20 bg-white"}`}
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFileUpload(e.dataTransfer.files[0]); }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            className="hidden"
            onChange={(e) => handleFileUpload(e.target.files?.[0] ?? null)}
          />
          <div className="bg-[#6B0F2B]/10 rounded-2xl p-4">
            <Upload className="w-6 h-6 text-[#6B0F2B]" strokeWidth={2} />
          </div>
          <div className="text-center">
            <p className="font-semibold text-[#1a1a1a]">Upload Business Permit</p>
            <p className="text-xs text-gray-400 mt-0.5 uppercase">.PDF, .JPG, .PNG. Max 5MB</p>
          </div>
          {businessPermit ? (
            <div className="flex items-center gap-1.5 text-xs text-[#6B0F2B] bg-[#6B0F2B]/10 px-3 py-1.5 rounded-full max-w-full min-w-0">
              <Paperclip className="w-3 h-3 flex-shrink-0" />
              <span className="min-w-0 flex-1 truncate">{businessPermit.name}</span>
              <button
                onClick={(e) => { e.stopPropagation(); setBusinessPermit(null); }}
                className="ml-1 hover:text-red-500 transition flex-shrink-0"
              >✕</button>
            </div>
          ) : (
            <span className="text-xs font-bold text-[#6B0F2B] px-4 py-1.5 rounded-full border border-[#6B0F2B]/10 bg-[#6B0F2B]/10 flex items-center gap-1">
              📄 Required
            </span>
          )}
        </div>
        {errors.businessPermit && <p className="text-red-500 text-xs">{errors.businessPermit}</p>}
      </div>

      <div className="flex justify-end">
        <Button onClick={handleNext}>Next →</Button>
      </div>
    </div>
  );
};

// ─── STEP 2: Images + Submit ──────────────────────────────────────────────────
const StepTwo = ({ onBack, onClose }: { onBack: () => void; onClose: () => void }) => {
  const {
    images, imagePreviews, primaryImageIndex,
    accommodationName, accommodationType, accommodationLocation,
    accommodationCapacity, tenantRestriction, businessPermit,
    latitude, longitude, addImages, removeImage, setPrimaryImage, reset,
  } = useAccommodationFormStore();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      if (images.length === 0) throw new Error("At least one image is required.");

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

      const res = await api.post("/landlord/accommodations", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    },
    onSuccess: () => { reset(); onClose(); },
    onError: (err: any) => {
      setSubmitError(err?.response?.data?.message ?? "Something went wrong. Please try again.");
    },
  });

  const handleImageUpload = (files: FileList | null) => {
    if (!files) return;
    addImages(Array.from(files));
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {imagePreviews.map((preview, i) => (
          <div key={i} className={`relative rounded-xl overflow-hidden ${primaryImageIndex === i ? "ring-2 ring-[#7a001f]" : ""}`}>
            <img src={preview} className="w-full h-32 object-cover" alt={`Upload ${i}`} />
            <div className="absolute top-2 left-2 flex gap-2">
              <button onClick={() => setPrimaryImage(i)} className="bg-white text-xs px-2 py-1 rounded-full shadow hover:bg-gray-100">
                {primaryImageIndex === i ? "Primary ✓" : "Set as Primary"}
              </button>
              <button onClick={() => removeImage(i)} className="bg-red-500 text-white text-xs px-2 py-1 rounded-full shadow hover:bg-red-600">
                Remove
              </button>
            </div>
          </div>
        ))}

        <div
          className={`border-2 border-dashed rounded-xl h-32 flex flex-col items-center justify-center cursor-pointer transition
            ${dragOver ? "border-[#C9973A] bg-[#C9973A]/5" : "border-[#6B0F2B]/20 bg-white"}`}
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); handleImageUpload(e.dataTransfer.files); }}
        >
        <input ref={fileInputRef} type="file" accept=".jpg,.jpeg,.png,.webp" multiple className="hidden" onChange={(e) => handleImageUpload(e.target.files)} />
          <div className="bg-[#6B0F2B]/10 rounded-xl p-2 mb-1">
            <Upload className="w-5 h-5 text-[#6B0F2B]" strokeWidth={2} />
          </div>
          <p className="text-xs text-gray-500">Click or drag to upload</p>
        </div>
      </div>

      {images.length === 0 && <p className="text-xs text-red-500">At least one image is required.</p>}
      {submitError && <p className="text-xs text-red-500 text-center">{submitError}</p>}

      <div className="flex justify-between gap-4">
        <Button onClick={onBack} variant="secondary" size="md" disabled={isPending}>← Back</Button>
        <Button onClick={() => mutate()} variant="primary" size="md" disabled={isPending || images.length === 0}>
          {isPending ? (
            <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Uploading...
            </div>
            ) : "Submit"}
        </Button>
      </div>
    </div>
  );
};

// ─── Main Dashboard Page ──────────────────────────────────────────────────────
const ManageAccommodationDashboard: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);
  const reset = useAccommodationFormStore((s) => s.reset);
  const navigate = useNavigate();

  useEffect(() => {
    setLandlordSidebarContext("minimal");
  }, []);

  // ─── Fetch current user ───────────────────────────────────────────────────
  const { data: user, isLoading, isError } = useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      const res = await api.get('/me')
      return res.data
    }
  })

  // ─── Fetch landlord's accommodations ─────────────────────────────────────
  const { data: accommodations, refetch } = useQuery({
    queryKey: ['landlord-accommodations'],
    queryFn: async () => {
      const res = await api.get('/landlord/accommodations')
      return res.data ?? []
    },
    staleTime: 0
  })

  // ─── Redirect to login if session expired ─────────────────────────────────
  useEffect(() => {
    if (isError) {
      navigate('/auth/signin')
    }
  }, [isError, navigate])

  const handleClose = () => {
    setOpen(false);
    setStep(1);
  };

  const handleSuccessClose = () => {
    setOpen(false);
    setStep(1);
    reset();
    refetch();
  };

  if (isLoading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  if (isError) return null // will redirect via useEffect

  return (
    <div className="flex flex-col lg:flex-row bg-[#f5f5f5] min-h-screen">
      <Sidebar
        role="landlord-manage"
        profile={{
          fullName: `${user?.fname ?? ''} ${user?.lname ?? ''}`.trim(),
          shortName: user?.fname ?? '',
          email: user?.email ?? '',
        }}
      />

      <div className="flex-1 p-4 sm:p-6 lg:p-10 mt-12 lg:mt-0">
        <div className="text-center">
          <p className="text-[10px] text-[#c59a5d] font-semibold tracking-[0.25em] mb-1 leading-none">
            GOOD DAY, {user?.fname?.toUpperCase()}
          </p>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-['Cormorant_Garamond'] font-semibold tracking-tight leading-[0.85]">
            Manage Your Accommodations
          </h1>
          <p className="text-sm text-gray-500 mt-2 max-w-md mx-auto leading-snug">
            Easily manage, review, and update your accommodations to keep your listings accurate and up to date.
          </p>
        </div>

        <div className="mt-10 sm:mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 px-2 sm:px-0">
          {(accommodations ?? []).map((accommodation: any) => (
            <AccommodationCard
              key={accommodation.id}
              accommodation={accommodation}
            />
          ))}
          <AddCard onClick={() => setOpen(true)} />
        </div>
      </div>

      <Modal
        open={open}
        onClose={handleClose}
        title={step === 1 ? "ADD A NEW ACCOMMODATION" : "UPLOAD ACCOMMODATION IMAGES"}
        eyebrow={step === 1 ? "FILL IN THE DETAILS" : "ADD PHOTOS"}
        maxWidth={560}
      >
        {step === 1 ? <StepOne onNext={() => setStep(2)} /> : <StepTwo onBack={() => setStep(1)} onClose={handleSuccessClose} />}
      </Modal>
    </div>
  );
};

export default ManageAccommodationDashboard;