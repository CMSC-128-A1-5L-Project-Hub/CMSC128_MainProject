import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Modal from "../Modal";
import type { ApplicationStatus } from "../../pages/student/ApplicationStatus";
import ApprovalProgress from "./ApprovalProgress";
import defaultAccommodation from "@/assets/defaults/accommodation.png";
import PhotoCarousel from "./PhotoCarousel";
import RightArrow from "../../assets/icons/right-arrow.svg";
import { api } from "../../api/axios";

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
    slotConfirmDeadline?: string | null;
    slotConfirmedAt?: string | null;
    estimatedMonthlyRent?: number | null;
    accommodation: {
        id: number;
        accommodationName: string;
        accommodationLocation: string;
        accommodationType: string;
        primaryImageUrl?: string;
    };
}

interface ApplicationStatusModalProps {
  open: boolean;
  onClose: () => void;
  application: Application | null;
}

// CORRECTED Status badge styling matching the stats banner and table
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

export default function ApplicationStatusModal({ open, onClose, application }: ApplicationStatusModalProps) {
  const queryClient = useQueryClient();
  const [cancelConfirmation, setCancelConfirmation] = useState("");
  const [carouselOpen, setCarouselOpen] = useState(false);

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
      
      console.log(`[Cancel Flow] Attempting to cancel application ${application.id} (Status: ${application.applicationStatus})`);
      
      let res;

      // If approved or waitlisted, we must "decline" the slot so the waitlist service runs
      if (application.applicationStatus === "approved" || application.applicationStatus === "waitlisted") {
        console.log(`[Cancel Flow] Status is ${application.applicationStatus}. Routing to POST /confirm with action: 'decline'`);
        res = await api.post(`/applications/${application.id}/confirm`, {
          action: "decline"
        });
      } 
      // If pending only - standard cancellation
      else if (application.applicationStatus === "pending") {
        console.log(`[Cancel Flow] Status is ${application.applicationStatus}. Routing to PATCH /cancel`);
        res = await api.patch(`/applications/${application.id}`, {
          status: "cancelled"
        });
      }
      // under_review, confirmed, rejected, cancelled CANNOT cancel
      else {
        throw new Error(`Cannot cancel application with status: ${application.applicationStatus}`);
      }

      console.log("[Cancel Flow] Success!", res.data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student-applications"] });
      onClose(); 
      setCancelConfirmation("");
    },
    onError: (error: any) => {
      console.error("Cancel error caught in UI:", error);
      alert(error.response?.data?.message || error.message || "Could not cancel application. Please try again.");
    },
  });

  // Mutation to accept the approved slot
  const acceptMutation = useMutation({
    mutationFn: async () => {
      if (!application) throw new Error("No application selected");
      
      console.log(`[Accept Flow] Attempting to confirm slot for application ${application.id}`);

      const res = await api.post(`/applications/${application.id}/confirm-slot`);
      
      console.log("[Accept Flow] Success!", res.data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student-applications"] });
      onClose(); 
      setCancelConfirmation("");
    },
    onError: (error: any) => {
      console.error("Accept error caught in UI:", error);
      alert(error.response?.data?.message || error.message || "Could not confirm slot. Please try again.");
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

  // CORRECTED: Status checks for buttons
  const isApproved = application.applicationStatus === "approved";
  const isConfirmed = application.applicationStatus === "confirmed";
  const isRejected = application.applicationStatus === "rejected";
  const isCancelled = application.applicationStatus === "cancelled";
  const isUnderReview = application.applicationStatus === "under_review";
  
  const hasDeadlinePassed = application.slotConfirmDeadline 
    ? new Date() > new Date(application.slotConfirmDeadline)
    : false;

  // Accept button: ONLY when status is "approved" AND deadline not passed
  const canAccept = isApproved && !hasDeadlinePassed;
  
  // Cancel button: ONLY for "pending", "approved", "waitlisted"
  // NOT for "under_review", "confirmed", "rejected", "cancelled"
  const canCancel = application.applicationStatus === "pending" || 
                    application.applicationStatus === "approved" || 
                    application.applicationStatus === "waitlisted";
  
  const isCancelInputDisabled = !canCancel || cancelMutation.isPending;

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
        <span className="text-[10px] text-gray-400 max-w-[200px] leading-tight">
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
          {/* ACCEPT BUTTON - Only show when status is "approved" */}
          {isApproved && (
            <button
              className={`px-6 py-2 rounded-full font-bold text-sm transition-colors ${
                canAccept && !acceptMutation.isPending
                  ? "bg-[#8C1535] text-white hover:bg-[#6B0F2B] cursor-pointer shadow-sm"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
              onClick={() => canAccept && acceptMutation.mutate()}
              disabled={!canAccept || acceptMutation.isPending}
            >
              {acceptMutation.isPending ? "Accepting..." : "Accept"}
            </button>
          )}

          {/* CANCEL BUTTON - Only show for pending, approved, waitlisted */}
          {canCancel && (
            <button
              className={`px-6 py-2 rounded-full font-bold text-sm ${
                cancelConfirmation === "CANCEL" && !cancelMutation.isPending && canCancel
                  ? "bg-gradient-to-br from-[#F3C9D9] to-[#3D2E2E] border-0 hover:-translate-y-px hover:scale-105 active:scale-95 text-white cursor-pointer transition-all"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
              onClick={() => cancelConfirmation === "CANCEL" && cancelMutation.mutate()}
              disabled={cancelConfirmation !== "CANCEL" || cancelMutation.isPending || !canCancel}
            >
              {cancelMutation.isPending ? "Cancelling..." : "Cancel"}
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <Modal open={open} onClose={onClose} title="APPLICATION STATUS" footer={modalFooter} maxWidth={600}>
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
              <p className="font-bold text-[13px] -mt-1">{application.durationOfStayDays} Days</p>
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
                {application.applicationStatus === "confirmed" ? "Check My Stays Tab" : "Pending Assignment"}
              </p>
            </div>
          </div>
        </div>

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
  );
}