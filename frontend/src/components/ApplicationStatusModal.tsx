import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Modal from "./Modal";
import type { ApplicationStatus } from "../pages/student/ApplicationStatus";
import StylizedStatus from "./BillingDashboard/StylizedStatus";
import ApprovalProgress from "./ApplicationStatus/ApprovalProgress";
import PhotoCarousel from "./ApplicationStatus/PhotoCarousel";
import Photo1 from "../assets/images/forManager.png";
import Photo2 from "../assets/images/phone.png";
import Photo3 from "../assets/images/sample_dorm.jpg";
import RightArrow from "../assets/icons/right-arrow.svg";

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
    accommodation: {
        id: number;
        accommodationName: string;
        accommodationLocation: string;
        accommodationType: string;
    };
}

interface ApplicationStatusModalProps {
  open: boolean;
  onClose: () => void;
  application: Application | null;
}

export default function ApplicationStatusModal({ open, onClose, application }: ApplicationStatusModalProps) {
  const queryClient = useQueryClient();
  const [cancelConfirmation, setCancelConfirmation] = useState("");
  const [carouselOpen, setCarouselOpen] = useState(false);
  const accommodationPhotos = [Photo1, Photo2, Photo3];

  // Fetch accommodation details
  const { data: accomData, isLoading } = useQuery({
    queryKey: ["accommodation", application?.accommodationId],
    queryFn: async () => {
      const res = await fetch(`/api/accommodations/${application?.accommodationId}`);
      if (!res.ok) throw new Error("Failed to fetch accommodation details");
      const json = await res.json();
      return json.data;
    },
    enabled: !!application?.accommodationId && open,
  });

  // Mutation to cancel the application
  const cancelMutation = useMutation({
    mutationFn: async () => {
      if (!application) throw new Error("No application selected");
      const res = await fetch(`/api/applications/${application.id}`, {
        method: "PATCH",
        credentials: "include", // Ensures cookies/tokens are sent
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "cancelled" }),
      });
      if (!res.ok) throw new Error("Failed to cancel application");
      return res.json();
    },
    onSuccess: () => {
      // Invalidate applications list to refresh the table
      queryClient.invalidateQueries({ queryKey: ["applications"] });
      onClose(); // close modal
      // Reset confirmation text for next time
      setCancelConfirmation("");
    },
    onError: (error) => {
      console.error("Cancel error:", error);
      alert("Could not cancel application. Please try again.");
    },
  });

  if (!application) return null;

  const appliedRoom = accomData?.rooms?.find(
    (r: any) => r.roomType.toLowerCase() === application.applicationRoomType.toLowerCase()
  );

  const formattedRate =
  appliedRoom?.roomRent !== null &&
  appliedRoom?.roomRent !== undefined
    ? new Intl.NumberFormat("en-PH", {
        style: "currency",
        currency: "PHP",
      }).format(Number(appliedRoom.roomRent))
    : "—";

  const imageUrl = accomData?.images?.[0]?.file?.filePath;

  // Modal footer with confirmation input and buttons
  const modalFooter = (
    <div className="flex flex-col gap-3 w-full">
      <div className="flex flex-col gap-1">
        <label className="text-[12px] text-gray-400 font-semibold">
          Type <span className="font-mono font-bold">"CANCEL"</span> to confirm cancellation
        </label>
        <input
          type="text"
          value={cancelConfirmation}
          onChange={(e) => setCancelConfirmation(e.target.value)}
          placeholder="CANCEL"
          className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#8C1535]"
        />
      </div>
      <div className="flex justify-between items-center">
        <span className="text-[10px] text-gray-400 max-w-[200px] leading-tight">
          By typing "CANCEL", you are sure to cancel your application to this accommodation
        </span>
        <div className="flex gap-2">
          <button
            className="bg-gradient-to-br from-[#6B0F2B] to-[#9E2040] border-0 hover:-translate-y-px hover:scale-105 active:scale-95 cursor-pointer text-white px-6 py-2 rounded-full font-bold text-sm hover:bg-[#6B0F2B] transition-all"
            onClick={() => console.log("Accept clicked")}
          >
            Accept
          </button>
          <button
            className={`px-6 py-2 rounded-full font-bold text-sm  ${
              cancelConfirmation === "CANCEL" && !cancelMutation.isPending
                ? " bg-gradient-to-br from-[#F3C9D9] to-[#3D2E2E] border-0 hover:-translate-y-px hover:scale-105 active:scale-95 text-white cursor-pointer transition-all"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
            onClick={() => cancelConfirmation === "CANCEL" && cancelMutation.mutate()}
            disabled={cancelConfirmation !== "CANCEL" || cancelMutation.isPending}
          >
            {cancelMutation.isPending ? "Cancelling..." : "Cancel"}
          </button>
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
                <p className="text-[#9A7080] uppercase font-bold text-[12px] mb-1">Monthly Rate</p>
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
          <ApprovalProgress
            app= {application}
            />
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
              <StylizedStatus
                  status = {application.applicationStatus.replace("_", " ") as ApplicationStatus} />
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
            <div className="col-span-3 mt-6">
              <p className="uppercase font-bold text-[11px] text-[#6B4050]">Assigned Room</p>
              {/* Assignment info is handled in the Assignment model natively, so typically "Pending" while an app is being processed */}
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