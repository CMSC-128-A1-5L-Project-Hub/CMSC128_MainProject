/*
  ProfilePage.tsx - Student profile view and edit with early move-out request and reviews
*/

import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { create } from "zustand";
import { useRef, useState, useEffect } from "react";
import { api } from "../../api/axios";
import Modal from "../../components/Modal";
import Button from "../../components/Button";
import Toast from "../../components/Toast";
import CustomHeader from "../../components/CustomHeader";
import { useUserStore } from '../../stores/useUserStore';
import femalePfp from "../../assets/defaults/female-pfp.png";
import malePfp from "../../assets/defaults/male-pfp.png";

// Icons
import Camera from "../../assets/icons/camera.svg";
import Pencil from "../../assets/icons/edit.svg";
import BadgeCheck from "../../assets/icons/verify.svg";
import Save from "../../assets/icons/save.svg";
import { Calendar, AlertCircle, Send, Star, X, ChevronLeft } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface UserProfile {
  id: number;
  fname: string;
  mname: string | null;
  lname: string;
  email: string;
  facebookAccount: string | null;
  role: string;
  accountStatus: string;
  profilePictureUrl: string | null;
  phoneNumbers: { contactNumber: string; isPrimary: boolean }[];
  student: {
    studentNumber: string;
    college: string;
    degreeProgram: string;
    gender: string;
    yearLevel: string | null;
    classification: string | null;
    emergencyContactName: string | null;
    emergencyContactNumber: string | null;
  } | null;
  updatedAt: string;
}

interface AccommodationHistoryItem {
  id: number;
  roomId: number;
  moveIn: string;
  expectedMoveOut: string;
  actualMoveOut: string | null;
  room: {
    roomName: string;
    monthlyRate: number;
    roomType: string;
    accommodation: {
      id: number;
      accommodationName: string;
      accommodationType: string;
    };
  };
  review?: { rating: number; content: string; createdAt: string } | null;
}

interface ProfileEditFields {
  primaryPhone: string;
  secondaryPhone: string;
  facebookAccount: string;
  emergencyContactNumber: string;
  emergencyContactName: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const CLR = {
  dark: "#3D0718",
  mid: "#6B0F2B",
  accent: "#8C1535",
  gold: "#C9973A",
  goldLt: "#E8C37A",
  goldDk: "#a07825",
} as const;

// ─── Zustand store for edit-form state ───────────────────────────────────────

interface ProfileEditStore {
  isEditing: boolean;
  showHistory: boolean;
  form: ProfileEditFields;
  setIsEditing: (v: boolean) => void;
  setShowHistory: (v: boolean) => void;
  setForm: (f: ProfileEditFields) => void;
  patchForm: (patch: Partial<ProfileEditFields>) => void;
}

const useProfileStore = create<ProfileEditStore>((set) => ({
  isEditing: false,
  showHistory: false,
  form: {
    primaryPhone: '',
    secondaryPhone: '',
    facebookAccount: '',
    emergencyContactNumber: '',
    emergencyContactName: '',
  },
  setIsEditing: (v) => set({ isEditing: v }),
  setShowHistory: (v) => set({ showHistory: v }),
  setForm: (form) => set({ form }),
  patchForm: (patch) => set((s) => ({ form: { ...s.form, ...patch } })),
}));

// ─── API helpers ─────────────────────────────────────────────────────────────

async function fetchMe(): Promise<UserProfile> {
  const res = await api.get("/me");
  return res.data;
}

async function fetchHistory(): Promise<AccommodationHistoryItem[]> {
  try {
    const [historyRes, currentRes] = await Promise.all([
      api.get('/my-stay/history'),
      api.get('/my-stay/current'),
    ]);
    const past = Array.isArray(historyRes.data) ? historyRes.data : [];
    const current = currentRes.data ? [currentRes.data] : [];
    return [...current, ...past];
  } catch {
    return [];
  }
}

async function updateMe(form: ProfileEditFields): Promise<UserProfile> {
  const res = await api.put("/me", {
    primaryPhone: form.primaryPhone,
    secondaryPhone: form.secondaryPhone,
    facebookAccount: form.facebookAccount,
    emergencyContactName: form.emergencyContactName,
    emergencyContactNumber: form.emergencyContactNumber,
  });
  return res.data;
}

async function uploadProfilePicture(file: File): Promise<{ profilePictureUrl: string }> {
  const form = new FormData();
  form.append("profilePicture", file);
  const res = await api.post("/me/profile-picture", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

async function checkPhoneDuplicate(phone: string): Promise<boolean> {
  try {
    const res = await api.get(`/check-phone/${phone}`);
    return res.data.exists;
  } catch {
    return false;
  }
}

function isValidPhilippinePhone(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, "");
  return cleaned.length === 11 && cleaned.startsWith("09");
}

// ─── Utility functions ────────────────────────────────────────────────────────

function fullName(p: UserProfile) {
  return `${p.fname} ${p.mname || ''} ${p.lname}`.replace(/\s+/g, ' ').trim();
}

function initials(p: UserProfile) {
  return `${p.fname?.[0] ?? ""}${p.lname?.[0] ?? ""}`.toUpperCase();
}

function primaryPhone(p: UserProfile) {
  return p.phoneNumbers?.find((n) => n.isPrimary)?.contactNumber ?? "";
}

function secondaryPhone(p: UserProfile) {
  const extras = p.phoneNumbers?.filter((n) => !n.isPrimary);
  return extras?.length ? extras[0].contactNumber : "";
}

function formatSemester(dateStr: string) {
  const d = new Date(dateStr);
  const mo = d.getMonth();
  const sem = mo >= 5 && mo <= 10 ? 1 : 2;
  const ayStart = sem === 1 ? d.getFullYear() : d.getFullYear() - 1;
  return `Semester ${sem}, AY ${ayStart}–${String(ayStart + 1).slice(2)}`;
}

function formatCurrency(n: number) {
  return `₱${n.toLocaleString("en-PH")}`;
}

// ─── Review Modal Component ───────────────────────────────────────────────────

interface ReviewModalProps {
  open: boolean;
  onClose: () => void;
  onBack?: () => void;
  accommodationName: string;
  accommodationId: number;
  roomNumber: string;
  moveInDate: string;
  actualMoveOutDate: string | null;
  expectedMoveOutDate: string;
  onSubmit: (rating: number, content: string) => void;
  isSubmitting?: boolean;
  existingReview?: { rating: number; content: string; createdAt: string } | null;
}

function ReviewModal({
  open,
  onClose,
  // onBack,  // Remove this
  accommodationName,
  roomNumber,
  moveInDate,
  actualMoveOutDate,
  expectedMoveOutDate,
  onSubmit,
  isSubmitting = false,
  existingReview = null,
}: ReviewModalProps) {
  const [rating, setRating] = useState<number>(existingReview?.rating || 0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [content, setContent] = useState<string>(existingReview?.content || "");
  const [error, setError] = useState<string>("");

  const hasMovedIn = new Date(moveInDate) <= new Date();
  const hasMovedOut = actualMoveOutDate !== null;
  const canReviewNow = !existingReview && (hasMovedIn || hasMovedOut);
  const isAlreadyReviewed = !!existingReview;

  const handleSubmit = () => {
    if (rating === 0) {
      setError("Please select a rating");
      return;
    }
    if (!content.trim()) {
      setError("Please write a review");
      return;
    }
    setError("");
    onSubmit(rating, content);
  };

  const getStatusMessage = () => {
    if (isAlreadyReviewed) {
      return "You have already reviewed this accommodation.";
    }
    if (!hasMovedIn && !hasMovedOut) {
      return "You can review this accommodation after you have moved in or moved out.";
    }
    return null;
  };

  const statusMessage = getStatusMessage();

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isAlreadyReviewed ? "YOUR REVIEW" : "WRITE A REVIEW"}
      eyebrow={accommodationName}
      maxWidth={550}
      footer={
        !isAlreadyReviewed && canReviewNow && (
          <div className="flex justify-end gap-3 w-full">
            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={isSubmitting || rating === 0 || !content.trim()}
            >
              {isSubmitting ? "Submitting..." : "Submit Review"}
            </Button>
          </div>
        )
      }
    >
      <div className="space-y-5">
        <div className="bg-gray-50 rounded-xl p-4">
          <p className="text-sm font-semibold text-gray-700">{accommodationName}</p>
          <p className="text-xs text-gray-500">Room {roomNumber}</p>
          <div className="flex flex-col gap-1 mt-2">
            <p className="text-xs text-gray-500">
              Move-in date: {new Date(moveInDate).toLocaleDateString()}
            </p>
            {actualMoveOutDate ? (
              <p className="text-xs text-green-600">
                Moved out on: {new Date(actualMoveOutDate).toLocaleDateString()}
              </p>
            ) : (
              <p className="text-xs text-amber-600">
                Expected move-out: {new Date(expectedMoveOutDate).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>

        {isAlreadyReviewed ? (
          <>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Your Rating
              </p>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-6 h-6 ${
                      star <= existingReview.rating
                        ? "fill-amber-400 text-amber-400"
                        : "fill-gray-200 text-gray-200"
                    }`}
                  />
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Your Review
              </p>
              <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                {existingReview.content}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Reviewed On
              </p>
              <p className="text-sm text-gray-500">
                {new Date(existingReview.createdAt).toLocaleDateString()}
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex gap-2">
              <AlertCircle size={16} className="text-blue-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-blue-700">
                You have already reviewed this accommodation. Thank you for your feedback!
              </p>
            </div>
          </>
        ) : canReviewNow ? (
          <>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Your Rating <span className="text-red-500">*</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className="focus:outline-none transition-transform hover:scale-110"
                  >
                    <Star
                      className={`w-8 h-8 sm:w-10 sm:h-10 ${
                        star <= (hoveredRating || rating)
                          ? "fill-amber-400 text-amber-400"
                          : "fill-gray-200 text-gray-200"
                      }`}
                    />
                  </button>
                ))}
              </div>
              {rating > 0 && (
                <p className="text-xs text-gray-500 mt-2">
                  {rating === 5 && "Excellent! 🌟"}
                  {rating === 4 && "Very Good! 👍"}
                  {rating === 3 && "Good 👌"}
                  {rating === 2 && "Fair 🤔"}
                  {rating === 1 && "Poor 😞"}
                </p>
              )}
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Your Review <span className="text-red-500">*</span>
              </p>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Share your experience about this accommodation... (e.g., cleanliness, amenities, location, staff, etc.)"
                rows={5}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6B0F2B]/30 resize-none text-sm"
              />
              <p className="text-xs text-gray-400 mt-1">
                {content.length}/500 characters
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex gap-2">
                <AlertCircle size={16} className="text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-red-600">{error}</p>
              </div>
            )}

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex gap-2">
              <AlertCircle size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700">
                Your review will be visible to other students and the accommodation manager.
                Please be honest and respectful.
              </p>
            </div>
          </>
        ) : (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex gap-3">
            <AlertCircle size={20} className="text-gray-500 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-gray-700">Review Not Available Yet</p>
              <p className="text-xs text-gray-600 mt-1">
                {statusMessage || "You can review this accommodation after you have moved in or completed your stay."}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                {!hasMovedIn && !hasMovedOut && (
                  <>Your move-in date is {new Date(moveInDate).toLocaleDateString()}</>
                )}
              </p>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

// ─── Accommodation History Modal Component ───────────────────────────────────

function AccomHistoryModal({
  history,
  onClose,
  studentName,
  onWriteReview,
}: {
  history: AccommodationHistoryItem[];
  onClose: () => void;
  studentName: string;
  onWriteReview: (item: AccommodationHistoryItem) => void;
}) {
  return (
    <Modal
      open={true}
      onClose={onClose}
      title="ACCOMMODATION HISTORY"
      eyebrow={`${studentName.toUpperCase()}'S HISTORY`}
      maxWidth={700}
      maxHeight={"85vh"}
    >
      <div className="flex flex-col gap-3 overflow-y-auto max-h-[70vh] px-1">
        {history.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No accommodation history yet.</p>
        ) : (
          history.map((item) => {
            const isActive = !item.actualMoveOut;
            const hasReviewed = !!item.review;
            const canReview = !isActive && !hasReviewed;

            return (
              <div
                key={item.id}
                className={`flex flex-col gap-3 rounded-xl p-4 border ${
                  isActive ? "border-[#C9973A] bg-[#FDF8F0]" : "border-[#E8D0D8] bg-[#F9F5F6]"
                }`}
              >
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="w-full sm:w-20 h-16 rounded-lg bg-gradient-to-br from-[#6B0F2B] to-[#3D0718] flex items-center justify-center text-[#E8C37A] text-xs font-bold text-center shrink-0">
                    AY {new Date(item.moveIn).getFullYear()}–
                    {String(new Date(item.moveIn).getFullYear() + 1).slice(2)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-[#2A1F1A] text-sm sm:text-base">{item.room.accommodation.accommodationName}</p>
                    <p className="text-xs text-gray-500 mb-2">
                      {item.room.roomType} · {item.room.accommodation.accommodationType} · Room {item.room.roomName}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-xs">
                      <div>
                        <span className="text-gray-400">Semester:</span>
                        <span className="ml-2 text-gray-700">{formatSemester(item.moveIn)}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Monthly Rate:</span>
                        <span className="ml-2 text-gray-700 font-semibold">{formatCurrency(item.room.monthlyRate)}</span>
                      </div>
                      <div className="col-span-1 sm:col-span-2">
                        <span className="text-gray-400">{isActive ? "Move-in:" : "Duration:"}</span>
                        <span className="ml-2 text-gray-700">
                          {isActive
                            ? new Date(item.moveIn).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" })
                            : `${new Date(item.moveIn).toLocaleDateString("en-PH", { month: "short", year: "numeric" })} – ${new Date(item.actualMoveOut!).toLocaleDateString("en-PH", { month: "short", year: "numeric" })}`}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-row sm:flex-col items-center sm:items-end gap-2 sm:gap-2">
                    <span
                      className={`text-xs font-semibold px-2 py-1 rounded-full whitespace-nowrap ${
                        isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {isActive ? "Active" : "Completed"}
                    </span>
                    
                    {!isActive && !hasReviewed && (
                      <button
                        onClick={() => onWriteReview(item)}
                        className="text-xs font-semibold px-3 py-1 rounded-full bg-amber-100 text-amber-700 hover:bg-amber-200 transition flex items-center gap-1 whitespace-nowrap"
                      >
                        <Star size={12} /> Write Review
                      </button>
                    )}
                    
                    {hasReviewed && (
                      <span className="text-xs font-semibold px-2 py-1 rounded-full bg-green-100 text-green-700 flex items-center gap-1 whitespace-nowrap">
                        <Star size={12} className="fill-green-600" /> Reviewed
                      </span>
                    )}
                  </div>
                </div>

                {item.review && (
                  <div className="mt-2 pt-2 border-t border-gray-200">
                    <div className="flex items-center gap-1 mb-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-3 h-3 ${
                            star <= item.review!.rating
                              ? "fill-amber-400 text-amber-400"
                              : "fill-gray-200 text-gray-200"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 italic">"{item.review.content}"</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Reviewed on {new Date(item.review.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </Modal>
  );
}

// ─── Early Move-Out Request Modal ───────────────────────────────────────────

function EarlyMoveOutModal({
  open,
  onClose,
  assignmentId,
  accommodationName,
  roomNumber,
  currentMoveOutDate,
  onSuccess,
  setToast,
}: {
  open: boolean;
  onClose: () => void;
  assignmentId: number;
  accommodationName: string;
  roomNumber: string;
  currentMoveOutDate: string;
  onSuccess: () => void;
  setToast: (t: { show: boolean; type: "success" | "error" | "info" | "warning" | "loading"; title: string; message?: string }) => void;
}) {
  const [requestedDate, setRequestedDate] = useState("");
  const [reason, setReason] = useState("");
  const queryClient = useQueryClient();

  const today = new Date().toISOString().split('T')[0];
  const maxDate = new Date(currentMoveOutDate);
  const maxDateStr = maxDate.toISOString().split('T')[0];

  const submitRequest = useMutation({
    mutationFn: async () => {
      const res = await api.post(`/assignments/${assignmentId}/request-early-moveout`, {
        requestedMoveOutDate: requestedDate,
        reason: reason,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-stay-history"] });
      setToast({
        show: true,
        type: "success",
        title: "Request Submitted",
        message: "Your early move-out request has been sent to the manager."
      });
      setTimeout(() => {
        onSuccess();
        onClose();
        setRequestedDate("");
        setReason("");
      }, 1500);
    },
    onError: (error: any) => {
      setToast({
        show: true,
        type: "error",
        title: "Request Failed",
        message: error.response?.data?.message || "Could not submit request. Please try again."
      });
    },
  });

  const handleSubmit = () => {
    if (!requestedDate) {
      setToast({
        show: true,
        type: "error",
        title: "Date Required",
        message: "Please select a requested move-out date."
      });
      return;
    }
    if (!reason.trim()) {
      setToast({
        show: true,
        type: "error",
        title: "Reason Required",
        message: "Please provide a reason for early move-out."
      });
      return;
    }
    submitRequest.mutate();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="REQUEST EARLY MOVE-OUT"
      eyebrow="Submit a request to move out early"
      maxWidth={500}
      footer={
        <div className="flex justify-end gap-3 w-full">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={submitRequest.isPending || !requestedDate || !reason.trim()}
          >
            {submitRequest.isPending ? "Submitting..." : "Submit Request"}
          </Button>
        </div>
      }
    >
      <div className="space-y-5">
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
          <AlertCircle size={20} className="text-amber-600 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-amber-800">Important Notice</p>
            <p className="text-xs text-amber-700 mt-0.5">
              Early move-out requests are subject to approval by your dorm manager.
              You may be subject to penalties as stated in your contract.
            </p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Requested Move-Out Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={requestedDate}
            onChange={(e) => setRequestedDate(e.target.value)}
            min={today}
            max={maxDateStr}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6B0F2B]/30 text-sm"
          />
          <p className="text-xs text-gray-400 mt-1">
            Current expected move-out: {new Date(currentMoveOutDate).toLocaleDateString()}
          </p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Reason for Early Move-Out <span className="text-red-500">*</span>
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g., Academic schedule conflict, financial reasons, relocation, etc."
            rows={4}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6B0F2B]/30 resize-none text-sm"
          />
        </div>

        <div className="bg-gray-50 rounded-xl p-4">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Dorm Information</p>
          <p className="text-sm font-medium text-gray-700">{accommodationName}</p>
          <p className="text-xs text-gray-500">Room {roomNumber}</p>
        </div>
      </div>
    </Modal>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

/**
 * Always read-only field — label + plain text value, no box.
 * Matches the view-mode style of LandlordProfile's Field component.
 */
function Field({
  label,
  value,
  isCaps = false,
}: {
  label: string;
  value: string;
  isCaps?: boolean;
}) {
  return (
    <div className="min-w-0">
      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-[#A88993]">{label}</p>
      <div className={`text-sm text-[#4A3940] ${isCaps ? "uppercase" : ""}`}>
        {value || "—"}
      </div>
    </div>
  );
}

/**
 * Editable field — plain text in view mode, styled input in edit mode.
 * Mirrors LandlordProfile's Field component pattern exactly.
 */
function EditableField({
  label,
  value,
  isEditing,
  onChange,
  isCaps = false,
  placeholder = "",
  type = "text",
  maxLength,
}: {
  label: string;
  value: string;
  isEditing: boolean;
  onChange?: (val: string) => void;
  isCaps?: boolean;
  placeholder?: string;
  type?: string;
  maxLength?: number;
}) {
  return (
    <div className="min-w-0">
      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-[#A88993]">{label}</p>
      {isEditing ? (
        <input
          value={value || ""}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={placeholder}
          type={type}
          maxLength={maxLength}
          inputMode={type === "tel" ? "numeric" : undefined}
          className={`w-full rounded-xl border border-[#E6CAD3] bg-[#FBF5F7] px-3 py-2 text-sm text-[#2A1F1A] outline-none focus:border-[#A04E66] transition-colors ${isCaps ? "uppercase" : ""}`}
        />
      ) : (
        <div className={`text-sm text-[#4A3940] ${isCaps ? "uppercase" : ""}`}>
          {value || "—"}
        </div>
      )}
    </div>
  );
}

function capitalizeFirstLetter(str: string) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ProfilePage() {
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { isEditing, showHistory, form, setIsEditing, setShowHistory, setForm, patchForm } =
    useProfileStore();
  const { setUser } = useUserStore();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [tempImage, setTempImage] = useState<string | null>(null);
  const [pfpUploading, setPfpUploading] = useState(false);

  // Early move-out modal state
  const [earlyMoveOutModalOpen, setEarlyMoveOutModalOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<AccommodationHistoryItem | null>(null);

  const handleSubmitReview = (rating: number, content: string) => {
    setSubmittingReview(true);
    submitReview.mutate({ rating, content });
  };

  // Review modal state - track which modal is open
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedForReview, setSelectedForReview] = useState<AccommodationHistoryItem | null>(null);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [returnToHistory, setReturnToHistory] = useState(false);

  // OTP Modal states
  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [pendingPhone, setPendingPhone] = useState("");
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

  // Toast state
  const [toast, setToast] = useState<{
    show: boolean;
    type: "success" | "error" | "info" | "warning" | "loading";
    title: string;
    message?: string;
  }>({ show: false, type: "success", title: "" });

  // ── Queries ────────────────────────────────────────────────────────────────

  const {
    data: profile,
    isLoading: profileLoading,
    isError: profileError,
    refetch: refetchProfile,
  } = useQuery<UserProfile>({
    queryKey: ["me"],
    queryFn: fetchMe,
  });

  const { data: history = [], refetch: refetchHistory } = useQuery<AccommodationHistoryItem[]>({
    queryKey: ["my-stay-history"],
    queryFn: fetchHistory,
  });

  // ── Mutations ──────────────────────────────────────────────────────────────

  const saveMutation = useMutation({
    mutationFn: updateMe,
    onSuccess: (updatedProfile) => {
      qc.invalidateQueries({ queryKey: ['me'] });
      refetchProfile();
      setUser(updatedProfile);
      setIsEditing(false);
      setToast({
        show: true,
        type: "success",
        title: "Profile Updated!",
        message: "Your profile has been saved successfully."
      });
    },
    onError: (err: any) => {
      console.error("Save failed:", err.response?.data || err.message);
      setToast({
        show: true,
        type: "error",
        title: "Save Failed",
        message: err?.response?.data?.message ?? 'Could not save changes. Please try again.'
      });
    },
  });

  const pfpMutation = useMutation({
    mutationFn: uploadProfilePicture,
    onMutate: () => setPfpUploading(true),
    onSettled: () => setPfpUploading(false),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['me'] });
      refetchProfile();
      setTempImage(null);
      setToast({
        show: true,
        type: "success",
        title: "Photo Updated!",
        message: "Your profile picture has been updated."
      });
    },
    onError: (err: any) => {
      console.error("Upload failed", err);
      setToast({
        show: true,
        type: "error",
        title: "Upload Failed",
        message: err?.response?.data?.message ?? 'Failed to upload photo.'
      });
    },
  });

  const submitReview = useMutation({
    mutationFn: async ({ rating, content }: { rating: number; content: string }) => {
      if (!selectedForReview) return;
      // TODO: Connect to backend when ready
      // const res = await api.post(`/accommodations/${selectedForReview.room.accommodation.id}/reviews`, {
      //   rating,
      //   content
      // });
      // return res.data;
      
      // Mock for now
      console.log("Submitting review for accommodation:", selectedForReview.room.accommodation.id, { rating, content });
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return { success: true };
    },
    onSuccess: () => {
      setToast({
        show: true,
        type: "success",
        title: "Review Submitted!",
        message: "Thank you for sharing your feedback."
      });
      // Close review modal and show history modal again
      setReviewModalOpen(false);
      setSelectedForReview(null);
      refetchHistory();
    },
    onError: () => {
      setToast({
        show: true,
        type: "error",
        title: "Submission Failed",
        message: "Could not submit your review. Please try again."
      });
    },
    onSettled: () => {
      setSubmittingReview(false);
    },
  });

  // ── Initialize form when profile loads ─────────────────────────────────────

  useEffect(() => {
    if (profile) {
      setForm({
        primaryPhone: primaryPhone(profile),
        secondaryPhone: secondaryPhone(profile),
        facebookAccount: profile.facebookAccount || "",
        emergencyContactName: profile.student?.emergencyContactName || "",
        emergencyContactNumber: profile.student?.emergencyContactNumber || "",
      });
      setPendingPhone(primaryPhone(profile));
    }
  }, [profile, setForm]);

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleCancelEdit = () => {
    if (profile) {
      setForm({
        primaryPhone: primaryPhone(profile),
        secondaryPhone: secondaryPhone(profile),
        facebookAccount: profile.facebookAccount || "",
        emergencyContactName: profile.student?.emergencyContactName || "",
        emergencyContactNumber: profile.student?.emergencyContactNumber || "",
      });
      setPendingPhone(primaryPhone(profile));
    }
    setIsEditing(false);
    setToast({
      show: true,
      type: "info",
      title: "Edit Cancelled",
      message: "No changes were saved."
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setToast({
          show: true,
          type: "error",
          title: "Invalid File",
          message: "Please upload an image file (JPG, PNG, or WEBP)."
        });
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setToast({
          show: true,
          type: "error",
          title: "File Too Large",
          message: "Image must be under 5MB."
        });
        return;
      }
      const imageUrl = URL.createObjectURL(file);
      setTempImage(imageUrl);
      pfpMutation.mutate(file);
    }
  };

  const handleSendOtp = async () => {
    const phone = pendingPhone.replace(/\D/g, "");

    if (!isValidPhilippinePhone(phone)) {
      setOtpError("Phone number must be 11 digits and start with 09 (e.g., 09123456789).");
      return;
    }

    const isDuplicate = await checkPhoneDuplicate(phone);
    if (isDuplicate) {
      setOtpError("This phone number is already registered to another account.");
      return;
    }

    setIsSendingOtp(true);
    setOtpError(null);
    try {
      await api.post("/auth/send-otp", { phoneNumber: phone });
      setOtpSent(true);
      setToast({
        show: true,
        type: "info",
        title: "OTP Sent",
        message: "A verification code has been sent to your phone."
      });
    } catch (err: any) {
      setOtpError(err?.response?.data?.message || "Failed to send OTP. Please try again.");
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otpCode.length !== 6) {
      setOtpError("Please enter the complete 6-digit code.");
      return;
    }
    setIsVerifyingOtp(true);
    setOtpError(null);
    try {
      const phone = pendingPhone.replace(/\D/g, "");
      await api.post("/auth/verify-sms", { code: otpCode, phoneNumber: phone });

      setOtpModalOpen(false);
      setOtpSent(false);
      setOtpCode("");
      setPendingPhone(phone);
      patchForm({ primaryPhone: phone });

      await saveMutation.mutateAsync({
        ...form,
        primaryPhone: phone,
      });
    } catch {
      setOtpError("Invalid OTP code. Please try again.");
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleSaveClick = async () => {
    if (!isEditing || !profile) return;

    const primary = pendingPhone;
    const secondary = form.secondaryPhone || "";

    if (!primary) {
      setToast({
        show: true,
        type: "error",
        title: "Validation Error",
        message: "Primary phone number is required."
      });
      return;
    }

    if (!isValidPhilippinePhone(primary)) {
      setToast({
        show: true,
        type: "error",
        title: "Invalid Phone Number",
        message: "Primary phone must be 11 digits and start with 09 (e.g., 09123456789)."
      });
      return;
    }

    if (secondary && !isValidPhilippinePhone(secondary)) {
      setToast({
        show: true,
        type: "error",
        title: "Invalid Phone Number",
        message: "Secondary phone must be 11 digits and start with 09 (e.g., 09123456789)."
      });
      return;
    }

    if (secondary && primary === secondary) {
      setToast({
        show: true,
        type: "error",
        title: "Duplicate Phone",
        message: "Primary and secondary phone numbers cannot be the same."
      });
      return;
    }

    const originalSecondary = secondaryPhone(profile);
    if (secondary && secondary !== originalSecondary) {
      const isSecondaryDuplicate = await checkPhoneDuplicate(secondary);
      if (isSecondaryDuplicate) {
        setToast({
          show: true,
          type: "error",
          title: "Duplicate Phone",
          message: "This secondary phone number is already registered to another account."
        });
        return;
      }
    }

    const originalPrimary = primaryPhone(profile);
    if (primary !== originalPrimary) {
      const isPrimaryDuplicate = await checkPhoneDuplicate(primary);
      if (isPrimaryDuplicate) {
        setOtpError("This phone number is already registered to another account.");
        setOtpModalOpen(true);
        setOtpSent(false);
        setOtpCode("");
        return;
      }
      setOtpModalOpen(true);
      setOtpSent(false);
      setOtpCode("");
      setOtpError(null);
      return;
    }

    saveMutation.mutate(form);
  };

  const handleEarlyMoveOut = (assignment: AccommodationHistoryItem) => {
    setSelectedAssignment(assignment);
    setEarlyMoveOutModalOpen(true);
  };

  const handleOpenReviewModal = (item: AccommodationHistoryItem) => {
    setSelectedForReview(item);
    setReturnToHistory(true);
    setShowHistory(false);  
    setReviewModalOpen(true);
  };

  const handleCloseReviewModal = () => {
    setReviewModalOpen(false);
    setSelectedForReview(null);
    if (returnToHistory) {
      setShowHistory(true);
      setReturnToHistory(false);
    }
  };

  const handleBackToHistory = () => {
    setReviewModalOpen(false);
    setSelectedForReview(null);
    setShowHistory(true);
    setReturnToHistory(false);
  };


  // ── Derived values ─────────────────────────────────────────────────────────

  const currentDorm = history.find((h) => !h.actualMoveOut) ?? null;
  const defaultPfp = profile?.student?.gender?.toLowerCase() === "female" ? femalePfp : malePfp;
  const verifyDate = new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

  // ── Loading / error states ─────────────────────────────────────────────────

  if (profileLoading) {
    return (
      <div className="flex h-screen items-center justify-center font-bold text-[#8C1535] font-['Plus_Jakarta_Sans']">
        Loading...
      </div>
    );
  }

  if (profileError || !profile) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 text-[#8C1535] font-['Plus_Jakarta_Sans']">
        <div className="text-lg">Error loading profile.</div>
        <button
          onClick={() => navigate("/student/dashboard")}
          className="rounded-lg bg-[#6B0F2B] px-6 py-2 text-white hover:bg-[#8C1535] transition-colors"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#F6F2F4] text-[#2A1F1A] lg:flex overflow-y-auto font-['Plus_Jakarta_Sans']">
      <div className="flex-1">
        <CustomHeader title="Profile" />

        <main className="px-3 py-4 md:px-6 lg:px-8 lg:py-6">
          <section className="overflow-hidden rounded-[28px] border border-[#EADFD3] bg-white shadow-sm">
            <div className="p-4 md:p-6 lg:p-8">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-8">

                {/* LEFT COLUMN */}
                <div className="w-full lg:w-[290px] lg:shrink-0">

                  {/* PROFILE CARD */}
                  <div className="overflow-hidden rounded-[28px] border border-[#EFE3E6] bg-[#F8EFF2]">
                    <div className="relative h-[220px] md:h-[260px] lg:h-[300px] bg-[#F6EDEF]">

                      <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleImageUpload}
                      />

                      <button 
                          aria-label="Change photo" 
                          onClick={() => fileInputRef.current?.click()}
                          className="absolute top-2 right-2 sm:top-4 sm:right-4 z-20 p-2 bg-white/50 hover:bg-white/80 rounded-full transition-all backdrop-blur-sm"
                      >
                          <img src={Camera} alt="" className="h-5 w-5 sm:h-6 sm:w-6" />
                      </button>

                      <img
                        src={tempImage || profile.profilePictureUrl || defaultPfp}
                        alt="Profile"
                        className="h-full w-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).src = defaultPfp; }}
                      />

                      {pfpUploading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                          <span className="text-sm font-bold text-white">Uploading...</span>
                        </div>
                      )}
                    </div>

                    
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center gap-3 rounded-2xl border border-[#D9E8DD] bg-[#EEF8F1] px-4 py-3">
                      <img src={BadgeCheck} alt="" className="h-5 w-5" />
                      <div className="min-w-0">
                        <p className="text-[11px] font-extrabold uppercase tracking-wide text-[#1F7A3A]">
                          Verified UPLB Student
                        </p>
                        <p className="text-[10px] text-[#1F7A3A]/70">
                          Verified {verifyDate}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* CURRENT DORM */}
                  <div className="mt-5 rounded-[28px] border border-[#EADFD3] bg-white p-5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#8C1535] text-sm font-bold text-white shrink-0">
                        {currentDorm?.room.accommodation.accommodationName?.[0] || "D"}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-[#2A1F1A]">
                          {currentDorm?.room.accommodation.accommodationName || "No Assignment"}
                        </p>
                        <p className="text-xs text-[#A88993]">
                          {currentDorm?.room.roomType || "Shared Residence"}
                        </p>
                      </div>
                    </div>

                    {currentDorm && (
                      <>
                        <div className="mt-5 space-y-3">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-[#A88993]">Room</span>
                            <span className="font-semibold text-[#2A1F1A]">{currentDorm.room.roomName}</span>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-[#A88993]">Move-In</span>
                            <span className="font-semibold text-[#2A1F1A]">
                              {new Date(currentDorm.moveIn).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-[#A88993]">Expected Move-Out</span>
                            <span className="font-semibold text-[#2A1F1A]">
                              {new Date(currentDorm.expectedMoveOut).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => handleEarlyMoveOut(currentDorm)}
                          className="mt-5 w-full rounded-2xl bg-[#8C1535] py-3 text-xs font-bold uppercase tracking-wide text-white hover:bg-[#6B0F2B] transition-colors"
                        >
                          Request Early Move-Out
                        </button>
                      </>
                    )}

                    <button
                      onClick={() => setShowHistory(true)}
                      className="mt-3 w-full rounded-2xl border border-[#E0C7CF] bg-white py-3 text-xs font-bold uppercase tracking-wide text-[#8C1535] hover:bg-[#F9F1F4] transition-colors"
                    >
                      View Accommodation History
                    </button>
                  </div>
                </div>

                {/* RIGHT COLUMN */}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="min-w-0">
                      <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-[#A88993]">
                        Full Name
                      </p>
                      <h1 className="break-words text-2xl font-bold leading-none text-[#2A1F1A] sm:text-3xl">
                        {fullName(profile)}
                      </h1>
                    </div>

                    <div className="flex gap-3">
                      {isEditing && (
                        <button
                          onClick={handleCancelEdit}
                          disabled={saveMutation.isPending}
                          className="inline-flex items-center justify-center rounded-xl border border-[#E2D5D9] px-5 py-2.5 sm:py-3 text-sm font-semibold text-[#2A1F1A] hover:bg-gray-100 transition-all"
                        >
                          Cancel
                        </button>
                      )}

                      <button
                        onClick={
                          isEditing
                            ? handleSaveClick
                            : () => {
                                setIsEditing(true);
                                setPendingPhone(primaryPhone(profile));
                              }
                        }
                        disabled={saveMutation.isPending || pfpUploading}
                        className="group inline-flex items-center gap-2 rounded-xl border border-[#A04E66] px-5 py-2.5 sm:py-3 text-sm font-semibold text-[#A04E66] hover:bg-[#8C1535]/90 hover:text-white transition-all w-full sm:w-auto justify-center"
                      >
                        <img
                          src={Pencil}
                          alt=""
                          className="h-4 w-4 transition-all filter group-hover:brightness-0 group-hover:invert"
                        />
                        {saveMutation.isPending
                          ? "Saving..."
                          : isEditing
                          ? "Save Profile"
                          : "Edit Profile"}
                      </button>
                    </div>
                  </div>

                  {/* FIELDS GRID */}
                  <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-x-6 sm:gap-x-10 gap-y-4 sm:gap-y-5">

                    <Field label="UP Mail" value={profile.email} />

                    <Field label="College" value={profile.student?.college.toUpperCase() || ""} />

                    <Field label="Middle Name" value={profile.mname || ""} />

                    <Field label="Degree Program" value={profile.student?.degreeProgram || ""} />

                    <EditableField
                      label="Primary Phone"
                      value={isEditing ? pendingPhone : form.primaryPhone}
                      isEditing={isEditing}
                      onChange={(v) => {
                        const cleaned = v.replace(/\D/g, "").slice(0, 11);
                        setPendingPhone(cleaned);
                      }}
                      type="tel"
                      maxLength={11}
                      placeholder="09123456789"
                    />

                    <Field label="Student Number" value={profile.student?.studentNumber || ""} />

                    <EditableField
                      label="Secondary Phone"
                      value={form.secondaryPhone}
                      isEditing={isEditing}
                      onChange={(v) => {
                        const cleaned = v.replace(/\D/g, "").slice(0, 11);
                        patchForm({ secondaryPhone: cleaned });
                      }}
                      type="tel"
                      maxLength={11}
                      placeholder="09123456789"
                    />

                    <Field
                      label="Gender"
                      value={capitalizeFirstLetter(profile.student?.gender || "")}
                    />

                    <EditableField
                      label="Facebook Link"
                      value={form.facebookAccount}
                      isEditing={isEditing}
                      onChange={(v) => patchForm({ facebookAccount: v })}
                    />

                    <Field label="Classification" value={profile.student?.classification || ""} isCaps />

                    <EditableField
                      label="Emergency Contact"
                      value={form.emergencyContactName}
                      isEditing={isEditing}
                      onChange={(v) => patchForm({ emergencyContactName: v })}
                    />

                    <Field label="Year Level" value={profile.student?.yearLevel || ""} isCaps />

                    <EditableField
                      label="Emergency Contact #"
                      value={form.emergencyContactNumber}
                      isEditing={isEditing}
                      onChange={(v) =>
                        patchForm({ emergencyContactNumber: v.replace(/\D/g, "").slice(0, 11) })
                      }
                      type="tel"
                      maxLength={11}
                      placeholder="09123456789"
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>

      {/* OTP Verification Modal */}
      <Modal
        open={otpModalOpen}
        onClose={() => {
          setOtpModalOpen(false);
          setOtpSent(false);
          setOtpCode("");
          setOtpError(null);
        }}
        title="Verify Phone Number"
        eyebrow="OTP VERIFICATION"
        maxWidth={480}
        footer={
          <div className="flex flex-row justify-end w-full">
            <Button
              variant="reddishPink"
              onClick={otpSent ? handleVerifyOtp : handleSendOtp}
              disabled={isSendingOtp || isVerifyingOtp}
            >
              {isSendingOtp
                ? "Sending..."
                : isVerifyingOtp
                ? "Verifying..."
                : otpSent
                ? "Verify OTP"
                : "Send OTP"}
            </Button>
          </div>
        }
      >
        <div className="flex flex-col gap-5 py-2">
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-gray-400">
              Phone Number
            </p>
            <p className="text-base font-bold text-[#2A1F1A]">{pendingPhone}</p>
          </div>

          {otpSent && (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
                Enter OTP Code
              </p>
              <div className="flex justify-center gap-2">
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <input
                    key={i}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={otpCode[i] || ""}
                    onChange={(e) => {
                      const newOtp = otpCode.split("");
                      newOtp[i] = e.target.value.replace(/\D/g, "");
                      setOtpCode(newOtp.join(""));
                      if (e.target.value && i < 5) {
                        const next = document.querySelector(`input[name=otp-${i + 1}]`) as HTMLInputElement;
                        next?.focus();
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Backspace" && !otpCode[i] && i > 0) {
                        const prev = document.querySelector(`input[name=otp-${i - 1}]`) as HTMLInputElement;
                        prev?.focus();
                      }
                    }}
                    name={`otp-${i}`}
                    className="h-14 w-12 rounded-xl border border-[#6B0F2B3E] text-center text-lg font-bold text-[#2A1F1A] outline-none transition focus:border-[#8C1535] focus:ring-2 focus:ring-[#8C1535]/30"
                  />
                ))}
              </div>
              <p className="mt-3 text-center text-[10px] text-gray-400">
                Enter the 6-digit code sent to your phone
              </p>
            </div>
          )}

          {otpError && (
            <p className="rounded-lg bg-red-50 py-2 text-center text-xs text-red-500">
              {otpError}
            </p>
          )}
        </div>
      </Modal>

      {/* Early Move-Out Modal */}
      {selectedAssignment && (
        <EarlyMoveOutModal
          open={earlyMoveOutModalOpen}
          onClose={() => {
            setEarlyMoveOutModalOpen(false);
            setSelectedAssignment(null);
          }}
          assignmentId={selectedAssignment.id}
          accommodationName={selectedAssignment.room.accommodation.accommodationName}
          roomNumber={selectedAssignment.room.roomName}
          currentMoveOutDate={selectedAssignment.expectedMoveOut}
          onSuccess={() => { refetchHistory(); }}
          setToast={setToast}
        />
      )}
      

      {/* Review Modal - opens on top of history modal */}
      {selectedForReview && (
        <ReviewModal
          open={reviewModalOpen}
          onClose={handleCloseReviewModal}
          onBack={returnToHistory ? handleBackToHistory : undefined}
          accommodationName={selectedForReview.room.accommodation.accommodationName}
          accommodationId={selectedForReview.room.accommodation.id}
          roomNumber={selectedForReview.room.roomName}
          moveInDate={selectedForReview.moveIn}
          actualMoveOutDate={selectedForReview.actualMoveOut}
          expectedMoveOutDate={selectedForReview.expectedMoveOut}
          onSubmit={handleSubmitReview}
          isSubmitting={submittingReview}
          existingReview={selectedForReview.review}
        />
      )}

      {/* Accommodation History Modal */}
      {showHistory && (
        <AccomHistoryModal
          history={history}
          studentName={profile.fname}
          onClose={() => setShowHistory(false)}
          onWriteReview={handleOpenReviewModal}
        />
      )}

      {/* Toast */}
      <Toast
        type={toast.type}
        title={toast.title}
        message={toast.message}
        show={toast.show}
        onClose={() => setToast((prev) => ({ ...prev, show: false }))}
      />
    </div>
  );
}