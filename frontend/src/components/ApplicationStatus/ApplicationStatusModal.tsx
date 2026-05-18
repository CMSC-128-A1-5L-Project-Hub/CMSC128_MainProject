import React, { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Modal from "../Modal";
import Toast from "../Toast";
import type { ApplicationStatus } from "../../pages/student/ApplicationStatus";
import ApprovalProgress from "./ApprovalProgress";
import defaultAccommodation from "@/assets/defaults/accommodation.png";
import PhotoCarousel from "./PhotoCarousel";
import RightArrow from "../../assets/icons/right-arrow.svg";
import Button from "../Button";
import { api } from "../../api/axios";
import { CalendarDays, ChevronLeft, ChevronRight, Check } from "lucide-react";

export interface Application {
    id: number;
    accommodationId: number;
    studentNumber: string;
    applicationRoomType: string;
    applicationStayType: string;
    applicationStatus: ApplicationStatus;
    durationOfStayDays: number;
    applicationDate: string;
    rejectionReason: string | null;
    reviewedAt?: string | null;
    reviewedBy?: number | null;
    approvedAt?: string | null;
    roomId?: number | null;
    slotConfirmDeadline?: string | null;
    slotConfirmedAt?: string | null;
    estimatedMonthlyRent?: number | null;
    contractMonths?: number;
    accommodation: {
        id: number;
        accommodationName: string;
        accommodationLocation: string;
        accommodationType: string;
        primaryImageUrl?: string;
        contractMonths: number;
    };
}

interface ApplicationStatusModalProps {
  open: boolean;
  onClose: () => void;
  application: Application | null;
}

// Status badge styling
const STATUS_STYLES: Record<ApplicationStatus, { bg: string; text: string; dot: string; label: string }> = {
  pending: { bg: "#FEF8EE", text: "#C9973A", dot: "#C9973A", label: "Pending" },
  under_review: { bg: "#F4F0FA", text: "#6B3AB7", dot: "#6B3AB7", label: "Under Review" },
  approved: { bg: "#F0F7F3", text: "#1A7A4A", dot: "#1A7A4A", label: "Approved" },
  confirmed: { bg: "#F0F7F3", text: "#1A7A4A", dot: "#1A7A4A", label: "Confirmed" },
  rejected: { bg: "#FDF0F3", text: "#9E2040", dot: "#9E2040", label: "Rejected" },
  waitlisted: { bg: "#F0F7F3", text: "#3A6AB7", dot: "#3A6AB7", label: "Waitlisted" },
  cancelled: { bg: "#FAF0F7", text: "#AE2F67", dot: "#AE2F67", label: "Cancelled" },
};

function StatusBadge({ status }: { status: ApplicationStatus }) {
  const style = STATUS_STYLES[status] || STATUS_STYLES.pending;
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[0.7rem] font-semibold whitespace-nowrap"
      style={{ background: style.bg, color: style.text }}
    >
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: style.dot }} />
      {style.label}
    </span>
  );
}

// Helper functions for date
function formatDate(date: Date): string {
  return date.toLocaleDateString("en-PH", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatDateISO(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

// Calendar Component
interface MoveInCalendarProps {
  selectedDate: Date | null;
  onSelect: (date: Date) => void;
  minDate: Date;
  maxDate: Date;
}

function MoveInCalendar({ selectedDate, onSelect, minDate, maxDate }: MoveInCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const today = new Date();
    return { year: today.getFullYear(), month: today.getMonth() };
  });

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const isDateDisabled = (date: Date) => {
    return date < minDate || date > maxDate;
  };

  const isDateSelected = (date: Date) => {
    return selectedDate ? date.toDateString() === selectedDate.toDateString() : false;
  };

  const handlePrevMonth = () => {
    if (currentMonth.month === 0) {
      setCurrentMonth({ year: currentMonth.year - 1, month: 11 });
    } else {
      setCurrentMonth({ ...currentMonth, month: currentMonth.month - 1 });
    }
  };

  const handleNextMonth = () => {
    if (currentMonth.month === 11) {
      setCurrentMonth({ year: currentMonth.year + 1, month: 0 });
    } else {
      setCurrentMonth({ ...currentMonth, month: currentMonth.month + 1 });
    }
  };

  const daysInMonth = getDaysInMonth(currentMonth.year, currentMonth.month);
  const firstDay = getFirstDayOfMonth(currentMonth.year, currentMonth.month);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyCells = Array.from({ length: firstDay }, (_, i) => i);

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  return (
    <div className="bg-white rounded-xl">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={handlePrevMonth}
          className="p-1 hover:bg-gray-100 rounded-full transition"
        >
          <ChevronLeft size={18} className="text-gray-600" />
        </button>
        <span className="text-sm font-semibold text-gray-800">
          {monthNames[currentMonth.month]} {currentMonth.year}
        </span>
        <button
          onClick={handleNextMonth}
          className="p-1 hover:bg-gray-100 rounded-full transition"
        >
          <ChevronRight size={18} className="text-gray-600" />
        </button>
      </div>

      {/* Day Headers */}
      <div className="grid grid-cols-7 mb-2">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
          <div key={day} className="text-center text-[10px] font-semibold text-gray-400 py-1">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-y-1">
        {emptyCells.map((_, i) => (
          <div key={`empty-${i}`} className="h-8" />
        ))}
        {days.map((day) => {
          const date = new Date(currentMonth.year, currentMonth.month, day);
          const disabled = isDateDisabled(date);
          const selected = isDateSelected(date);

          return (
            <button
              key={day}
              onClick={() => !disabled && onSelect(date)}
              disabled={disabled}
              className={`
                h-8 w-8 rounded-full flex items-center justify-center text-xs font-medium transition-all
                ${selected ? "bg-[#6B0F2B] text-white" : ""}
                ${!disabled && !selected ? "text-gray-700 hover:bg-gray-100" : ""}
                ${disabled ? "text-gray-300 cursor-not-allowed" : "cursor-pointer"}
              `}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function ApplicationStatusModal({ open, onClose, application }: ApplicationStatusModalProps) {
  const queryClient = useQueryClient();
  const [cancelConfirmation, setCancelConfirmation] = useState("");
  const [carouselOpen, setCarouselOpen] = useState(false);
  const [selectedMoveInDate, setSelectedMoveInDate] = useState<Date | null>(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [toast, setToast] = useState<{
    show: boolean;
    type: "success" | "error" | "info" | "warning" | "loading";
    title: string;
    message?: string;
  }>({ show: false, type: "success", title: "" });
  
  const calendarRef = useRef<HTMLDivElement>(null);

  // Get contract months from accommodation
  const contractMonths = application?.accommodation?.contractMonths || 6;
  
  // Calculate date range
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const maxDate = new Date();
  maxDate.setMonth(maxDate.getMonth() + contractMonths);

  // Calculate expected move-out date when move-in is selected
  const getExpectedMoveOut = (moveInDate: Date): Date => {
    const expectedDate = new Date(moveInDate);
    expectedDate.setMonth(expectedDate.getMonth() + contractMonths);
    return expectedDate;
  };

  // Close calendar when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setShowCalendar(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch accommodation details
  const { data: accomData, isLoading } = useQuery({
    queryKey: ["accommodation", application?.accommodationId],
    queryFn: async () => {
      const res = await api.get(`/accommodations/${application?.accommodationId}`);
      return res.data.data ?? res.data;
    },
    enabled: !!application?.accommodationId && open,
  });

  const accommodationPhotos = accomData?.imageUrls?.length > 0
    ? accomData.imageUrls
    : application?.accommodation?.primaryImageUrl
      ? [application.accommodation.primaryImageUrl]
      : [defaultAccommodation];

  // Mutation to cancel the application
  const cancelMutation = useMutation({
    mutationFn: async () => {
      if (!application) throw new Error("No application selected");
      
      let res;

      if (application.applicationStatus === "approved" || application.applicationStatus === "waitlisted") {
        res = await api.post(`/applications/${application.id}/confirm`, {
          action: "decline"
        });
      } 
      else if (application.applicationStatus === "pending") {
        res = await api.patch(`/applications/${application.id}`, {
          status: "cancelled"
        });
      }
      else {
        throw new Error(`Cannot cancel application with status: ${application.applicationStatus}`);
      }

      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student-applications"] });
      setToast({
        show: true,
        type: "success",
        title: "Application Cancelled",
        message: "Your application has been successfully cancelled."
      });
      setTimeout(() => {
        onClose();
        setCancelConfirmation("");
        setSelectedMoveInDate(null);
      }, 1500);
    },
    onError: (error: any) => {
      console.error("Cancel error caught in UI:", error);
      setToast({
        show: true,
        type: "error",
        title: "Cancellation Failed",
        message: error.response?.data?.message || "Could not cancel application. Please try again."
      });
    },
  });

  // Mutation to accept the approved slot
  const acceptMutation = useMutation({
    mutationFn: async () => {
      if (!application) throw new Error("No application selected");
      if (!selectedMoveInDate) throw new Error("Please select a move-in date");
      
      const moveInDateISO = formatDateISO(selectedMoveInDate);
      const expectedMoveOutDate = getExpectedMoveOut(selectedMoveInDate);
      const expectedMoveOutISO = formatDateISO(expectedMoveOutDate);
      
      const res = await api.post(`/applications/${application.id}/confirm-slot`, {
        moveInDate: moveInDateISO,
        expectedMoveOutDate: expectedMoveOutISO,
        contractMonths: contractMonths
      });
      
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student-applications"] });
      setToast({
        show: true,
        type: "success",
        title: "Slot Confirmed!",
        message: "You have successfully confirmed your room assignment."
      });
      setTimeout(() => {
        onClose();
        setCancelConfirmation("");
        setSelectedMoveInDate(null);
      }, 1500);
    },
    onError: (error: any) => {
      console.error("Accept error caught in UI:", error);
      setToast({
        show: true,
        type: "error",
        title: "Confirmation Failed",
        message: error.response?.data?.message || "Could not confirm slot. Please try again."
      });
    },
  });

  if (!application) return null;

  const formattedRate =
    application.estimatedMonthlyRent !== null && application.estimatedMonthlyRent !== undefined
      ? new Intl.NumberFormat("en-PH", {
          style: "currency",
          currency: "PHP",
        }).format(Number(application.estimatedMonthlyRent))
      : "—";

  // Status checks for buttons
  const isApproved = application.applicationStatus === "approved";
  const isConfirmed = application.applicationStatus === "confirmed";
  const isRejected = application.applicationStatus === "rejected";
  const isCancelled = application.applicationStatus === "cancelled";
  const isUnderReview = application.applicationStatus === "under_review";
  
  // Check if a room has been assigned by the manager (has deadline from assignment)
  const hasRoomAssignment = !!application.slotConfirmDeadline;
  const hasDeadlinePassed = application.slotConfirmDeadline 
    ? new Date() > new Date(application.slotConfirmDeadline)
    : false;

  // Accept button ONLY when:
  // 1. Status is "approved" AND
  // 2. A room has been assigned by manager (slotConfirmDeadline exists) AND
  // 3. Deadline hasn't passed
  const canAccept = isApproved && hasRoomAssignment && !hasDeadlinePassed;
  
  // Cancel button: ONLY for "pending", "approved", "waitlisted"
  const canCancel = application.applicationStatus === "pending" || 
                    application.applicationStatus === "waitlisted" ||
                    (application.applicationStatus === "approved" && hasRoomAssignment);
  
  const isCancelInputDisabled = !canCancel || cancelMutation.isPending;
  const isAcceptDisabled = !canAccept || acceptMutation.isPending || !selectedMoveInDate;

  // Preview expected move-out date
  const expectedMoveOutPreview = selectedMoveInDate ? getExpectedMoveOut(selectedMoveInDate) : null;

  const modalFooter = (
    <div className="flex flex-col gap-3 w-full">
      {canCancel && (
        <div className="flex flex-col gap-1">
          <label className="text-[12px] text-gray-400 font-semibold">
            Type <span className="font-mono font-bold">"CANCEL"</span> to confirm cancellation
          </label>
          <input
            type="text"
            value={cancelConfirmation}
            onChange={(e) => setCancelConfirmation(e.target.value)}
            placeholder="CANCEL"
            disabled={isCancelInputDisabled}
            className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#8C1535]"
          />
        </div>
      )}
      
      <div className="flex justify-between items-center">
        <span className={`text-[10px] text-gray-400 max-w-[200px] leading-tight 
            ${canCancel || canAccept ? 'text-wrap' : 'text-nowrap'}`}>
          {canCancel 
            ? 'By typing "CANCEL", you are sure to cancel your application to this accommodation'
            : isUnderReview
              ? 'Your application is under review. You cannot cancel at this stage.'
              : isConfirmed 
                ? 'Your slot has been confirmed. No further actions available.'
                : isRejected || isCancelled
                  ? 'This application is no longer active.'
                  : 'No actions available.'}
        </span>
        <div className="flex gap-2">
          {/* ACCEPT BUTTON */}
          {isApproved && (
            <button
              className={`px-6 py-2 rounded-full font-bold text-sm transition-colors ${
                isAcceptDisabled && !acceptMutation.isPending
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-[#8C1535] text-white hover:bg-[#6B0F2B] cursor-pointer shadow-sm"
              }`}
              onClick={() => !isAcceptDisabled && acceptMutation.mutate()}
              disabled={isAcceptDisabled || acceptMutation.isPending}
              title={
                !hasRoomAssignment 
                  ? "Waiting for manager to assign a room"
                  : hasDeadlinePassed 
                    ? "Deadline has passed"
                    : !selectedMoveInDate
                      ? "Please select a move-in date"
                      : "Confirm your room assignment"
              }
            >
              {acceptMutation.isPending 
                ? "Confirming..." 
                : !hasRoomAssignment 
                  ? "Waiting for Room Assignment" 
                  : hasDeadlinePassed 
                    ? "Deadline Passed" 
                    : "Confirm Slot"}
            </button>
          )}

          {/* CANCEL BUTTON */}
          {canCancel && (
            <Button
              variant="primary"
              size="md"
              onClick={() => cancelConfirmation === "CANCEL" && cancelMutation.mutate()}
              disabled={cancelConfirmation !== "CANCEL" || cancelMutation.isPending || !canCancel}
              isLoading={cancelMutation.isPending}
            >
              Cancel
            </Button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <Modal open={open} onClose={onClose} title="APPLICATION STATUS" footer={modalFooter} maxWidth={650}>
        <div className="font-sans">
          <PhotoCarousel 
            hidden={!carouselOpen}
            photos={accommodationPhotos}/>
          <div className={`${carouselOpen ? "mt-4" : "mt-0"} flex flex-row w-full gap-3`}>
              <button 
              onClick={()=> setCarouselOpen(!(carouselOpen))}
              className={`${carouselOpen ? "w-10" : "w-1/5 opacity-100"} transition-all p-0 overflow-hidden relative min-w-0 self-stretch bg-gradient-to-br from-[#3D0718] to-[#8C1535]`}>
                <span className={`${carouselOpen ? "hidden" : ""} absolute top-8 left-4 w-1/2 h-[6px] bg-white/30 rounded-full`}></span>
                <span className={`${carouselOpen ? "hidden" : ""} absolute top-4 left-4 w-1/3 h-[6px] bg-white/20 rounded-full`}></span>
                <img src={RightArrow} className={`${carouselOpen ? "opacity-30" : "hidden"} "w-10 h-10"`} alt="" />
              </button>
              <div className="flex flex-col flex-1 min-w-0">
                  <h3 className="font-bold text-lg text-gray-900 leading-tight">
                      {application.accommodation?.accommodationName || "Unknown Dormitory"}
                  </h3>
                  <p className="text-xs text-[#9A7080] mt-0.5 capitalize">
                      {application.accommodation?.accommodationType?.replace("_", "-") || "Unknown"} • {application.applicationRoomType} • {application.accommodation?.accommodationLocation}
                  </p>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                      {isLoading ? (
                          <span className="bg-gray-100 text-[#9A7080] text-[10px] px-1 py-0.5 rounded-full font-bold">Loading tags...</span>
                      ) : (
                          accomData?.tags?.map((tag: any) => (
                              <span key={tag.id} className="bg-[#FDF2F4] text-[#8C1535] text-[10px] px-2 py-0.5 rounded-full font-bold">
                                  {tag.tagDetail}
                              </span>
                          ))
                      )}
                  </div>
              </div>
              <div className="flex flex-col flex-shrink-0 items-end">
                  <p className="text-[#9A7080] uppercase font-bold text-[12px] mb-1">Starts at</p>
                  {isLoading ? (
                      <div className="h-6 w-20 bg-gray-200 rounded animate-pulse"></div>
                  ) : (
                      <p className="font-bold text-2xl text-[#C9973A] leading-none">{formattedRate}</p>
                  )}
                  <p className="text-[11px] text-[#9A7080] mt-1">per month</p>
              </div>
          </div>

          {/* Timeline Status */}
          <div className="my-2 mt-4">
            <ApprovalProgress app={application} />
          </div>

          {/* Application Information Grid */}
          <div className="mb-2">
            <h4 className="uppercase pt-3 font-bold text-[12px] text-[#6B4050]">Application Information</h4>
            <div className="grid grid-cols-3 gap-y-6 gap-x-4 text-sm">
              <div className='flex flex-col'>
                <p className='uppercase font-bold text-[11px] text-[#6B4050]'>application id</p>
                <p className='font-bold truncate text-[13px] -mt-1'>{application.id}</p>
              </div>
              <div className='flex flex-col'>
                <p className="uppercase font-bold text-[11px] text-[#6B4050]">Stay Duration</p>
                <p className="font-bold text-[13px] -mt-1">
                  {application.durationOfStayDays ? `${application.durationOfStayDays} Days` : "N/A"}
                </p>
              </div>
              <div>
                <p className="uppercase font-bold text-[11px] text-[#6B4050]">Current Status</p>
                <StatusBadge status={application.applicationStatus} />
              </div>
              <div>
                <p className="uppercase font-bold text-[11px] text-[#6B4050]">Date Applied</p>
                <p className="font-bold text-[13px] -mt-1">
                  {new Date(application.applicationDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </p>
              </div>
              <div>
                <p className="uppercase font-bold text-[11px] text-[#6B4050]">Reviewed By</p>
                <p className="font-bold text-[13px] -mt-1">
                  {accomData?.manager?.user?.fname 
                    ? `${accomData.manager.user.fname} ${accomData.manager.user.lname}` 
                    : "—"}
                </p>
              </div>
              <div>
                <p className="uppercase font-bold text-[11px] text-[#6B4050]">Reviewed On</p>
                <p className="font-bold text-[13px] -mt-1">
                  {application.reviewedAt 
                    ? new Date(application.reviewedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                    : "—"}
                </p>
              </div>

              {application.slotConfirmDeadline && (
                <div>
                  <p className="text-[11px] text-[#8C1535] uppercase font-bold mb-1">Confirm By</p>
                  <p className="font-bold -mt-1.5 text-[#8C1535]">
                    {new Date(application.slotConfirmDeadline).toLocaleString("en-US", { 
                      month: "short", 
                      day: "numeric", 
                      year: "numeric",
                      hour: "numeric",
                      minute: "2-digit"
                    })}
                  </p>
                </div>
              )}

              <div className="col-span-3 mt-6">
                <p className="uppercase font-bold text-[11px] text-[#6B4050]">Assigned Room</p>
                <p className="font-bold text-[13px] -mt-1">
                  {hasRoomAssignment ? (
                    <span className="text-[#1A7A4A]">Room has been assigned. Please confirm your slot.</span>
                  ) : application.applicationStatus === "approved" ? (
                    <span className="text-[#C9973A]">Waiting for manager to assign a room...</span>
                  ) : application.applicationStatus === "confirmed" ? (
                    "Check My Stays Tab"
                  ) : (
                    "Pending Assignment"
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Move-In Date Selection - Only show when canAccept */}
          {canAccept && (
            <div className="mt-4 pt-2 border-t border-gray-100">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Select Move-In Date <span className="text-red-500">*</span>
              </label>
              
              <div className="relative" ref={calendarRef}>
                <button
                  onClick={() => setShowCalendar(!showCalendar)}
                  className="w-full flex items-center justify-between px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6B0F2B]/30 transition bg-white"
                >
                  <div className="flex items-center gap-2">
                    <CalendarDays size={18} className="text-[#6B0F2B]" />
                    <span className="text-sm text-gray-700">
                      {selectedMoveInDate ? formatDate(selectedMoveInDate) : "Select a date"}
                    </span>
                  </div>
                  <ChevronRight size={16} className={`text-gray-400 transition-transform ${showCalendar ? "rotate-90" : ""}`} />
                </button>
                
                {showCalendar && (
                  <div className="absolute left-0 right-0 top-full mt-2 z-50 bg-white border border-gray-200 rounded-xl shadow-lg p-4">
                    <MoveInCalendar
                      selectedDate={selectedMoveInDate}
                      onSelect={(date) => {
                        setSelectedMoveInDate(date);
                        setShowCalendar(false);
                      }}
                      minDate={today}
                      maxDate={maxDate}
                    />
                    <div className="mt-3 pt-2 border-t border-gray-100">
                      <p className="text-[10px] text-gray-400 text-center">
                        Contract Duration: {contractMonths} months
                      </p>
                    </div>
                  </div>
                )}
              </div>
              
              {expectedMoveOutPreview && (
                <div className="mt-2 p-2 bg-[#F5ECF0] rounded-lg">
                  <p className="text-[11px] text-[#6B4050] font-medium">
                    Expected Move-Out: <span className="font-bold">{formatDate(expectedMoveOutPreview)}</span>
                  </p>
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    Based on {contractMonths}-month contract
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Remarks */}
          <div>
            <p className="uppercase pb-1 pt-3 font-bold text-[12px] text-[#6B4050]">Landlord Remarks</p>
            <div className="w-full h-30 text-[11px] border-2 border-[#6B0F2B] border-opacity-5 rounded-xl p-2 text-[#9A7080] bg-[#FAF4F6]">
              {application.rejectionReason ? (
                  <p className="text-sm text-gray-800">{application.rejectionReason}</p>
              ) : (
                  <p className="text-sm text-gray-400 italic">No remark provided.</p>
              )}
            </div>
          </div>
        </div>
      </Modal>

      {/* Toast Notifications */}
      <Toast
        type={toast.type}
        title={toast.title}
        message={toast.message}
        show={toast.show}
        onClose={() => setToast(prev => ({ ...prev, show: false }))}
      />
    </>
  );
}