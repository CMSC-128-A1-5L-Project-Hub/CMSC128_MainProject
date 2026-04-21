import React from "react";
import { useQuery } from "@tanstack/react-query";
import Modal from "./Modal";

// ─── 1. Exact Types from Applications.tsx ─────────────────────────────
export type ApplicationStatus = "pending" | "under_review" | "approved" | "rejected" | "waitlisted" | "cancelled";

export interface Application {
  id: number;
  accommodationId: number;
  studentNumber: string;
  applicationRoomType: string;
  applicationStayType: string;
  applicationStatus: ApplicationStatus;
  durationOfStayDays: number;
  applicationDate: string;
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
  
  // ─── 2. Fetch Dynamic Accommodation Data ─────────────────────────────────
  const { data: accomData, isLoading } = useQuery({
    queryKey: ["accommodation", application?.accommodationId],
    queryFn: async () => {
      // Hits the 'show' method in AccommodationController
      const res = await fetch(`http://localhost:3333/accommodations/${application?.accommodationId}`);
      if (!res.ok) throw new Error("Failed to fetch accommodation details");
      return res.json();
    },
    // Only fetch if the modal is actually open and we have an ID to look up
    enabled: !!application?.accommodationId && open, 
  });

  if (!application) return null;

  // ─── 3. Extract specific details ─────────────────────────────────────────
  
  // Find the exact room they applied for to get the accurate monthly rent
  const appliedRoom = accomData?.rooms?.find(
    (r: any) => r.roomType.toLowerCase() === application.applicationRoomType.toLowerCase()
  );
  
  // Format the rent to Philippine Peso
  const formattedRate = appliedRoom?.roomRent 
    ? new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(appliedRoom.roomRent)
    : "—";

  // Grab the first image from the preloaded images array
  const imageUrl = accomData?.images?.[0]?.file?.filePath;

  // ─── Modal Footer ────────────────────────────────────────────────────────
  const modalFooter = (
    <div className="flex w-full justify-between items-center">
      <span className="text-[10px] text-gray-400 max-w-[200px] leading-tight">
        By typing "CANCEL", you are sure to cancel your application to this accommodation
      </span>
      <div className="flex gap-2">
        <button 
          className="bg-[#8C1535] text-white px-6 py-2 rounded-full font-bold text-sm hover:bg-[#6B0F2B] transition-colors"
          onClick={() => console.log("Accept clicked")}
        >
          Accept
        </button>
        <button 
          className="bg-gray-400 text-white px-6 py-2 rounded-full font-bold text-sm hover:bg-gray-500 transition-colors"
          onClick={onClose}
        >
          Cancel
        </button>
      </div>
    </div>
  );

  return (
    <Modal 
      open={open} 
      onClose={onClose} 
      title="APPLICATION STATUS" 
      footer={modalFooter}
      maxWidth={600}
    >
      <div className="space-y-8 font-sans">
        
        {/* Header: Dorm Info & Rate */}
        <div className="flex justify-between items-start">
          <div className="flex gap-4">
            
            {/* Dynamic Image or Fallback */}
            {imageUrl ? (
              <img src={imageUrl} alt="Dorm" className="w-24 h-16 object-cover rounded-xl flex-shrink-0" />
            ) : (
              <div className="w-24 h-16 bg-[#6B0F2B] rounded-xl flex-shrink-0 animate-pulse"></div>
            )}

            <div>
              <h3 className="font-bold text-lg text-gray-900 leading-tight">
                {application.accommodation?.accommodationName || "Unknown Dormitory"}
              </h3>
              <p className="text-xs text-gray-500 mt-1 capitalize">
                {application.accommodation?.accommodationType?.replace("_", "-") || "Unknown"} • {application.applicationRoomType}
              </p>
              
              {/* Dynamic Tags */}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {isLoading ? (
                  <span className="bg-gray-100 text-gray-400 text-[10px] px-2 py-0.5 rounded-full font-bold">Loading tags...</span>
                ) : accomData?.tags?.map((tag: any) => (
                  <span key={tag.id} className="bg-[#FDF2F4] text-[#8C1535] text-[10px] px-2 py-0.5 rounded-full font-bold">
                    {tag.tagDetail}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Dynamic Rate */}
          <div className="text-right">
            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1">Monthly Rate</p>
            {isLoading ? (
              <div className="h-6 w-20 bg-gray-200 rounded animate-pulse ml-auto"></div>
            ) : (
              <p className="font-bold text-2xl text-[#C9973A] leading-none">{formattedRate}</p>
            )}
            <p className="text-[10px] text-gray-400 mt-1">per month</p>
          </div>
        </div>

        {/* Timeline Status */}
        <div className="flex items-center justify-between relative px-4">
          <div className="absolute top-4 left-8 right-8 h-0.5 bg-gray-200 -z-10"></div>
          
          <div className="flex flex-col items-center bg-white px-2">
            <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center text-sm font-bold shadow-sm">✓</div>
            <p className="font-bold text-[11px] mt-2 text-green-700">Submitted</p>
            <p className="text-[10px] text-gray-400">
              {new Date(application.applicationDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </p>
          </div>

          <div className="flex flex-col items-center bg-white px-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-sm ${application.applicationStatus !== 'pending' ? 'bg-green-600 text-white' : 'bg-green-600 text-white'}`}>✓</div>
            <p className="font-bold text-[11px] mt-2 text-green-700">Pending</p>
          </div>

          <div className="flex flex-col items-center bg-white px-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm shadow-sm ${application.applicationStatus === 'under_review' || application.applicationStatus === 'approved' ? 'bg-green-600 text-white font-bold' : 'bg-white border-2 border-gray-200 text-transparent'}`}>✓</div>
            <p className={`font-bold text-[11px] mt-2 ${application.applicationStatus === 'under_review' || application.applicationStatus === 'approved' ? 'text-green-700' : 'text-gray-400'}`}>Under Review</p>
          </div>
        </div>

        {/* Application Information Grid */}
        <div>
          <h4 className="text-[10px] font-bold text-[#6B0F2B] uppercase tracking-wider mb-4">Application Information</h4>
          <div className="grid grid-cols-3 gap-y-6 gap-x-4 text-sm">
            
            <div>
              <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">Application ID</p>
              <p className="font-bold text-gray-900">{application.id}</p>
            </div>
            
            <div>
              <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">Semester</p>
              <p className="font-bold text-gray-900">Semester 2, AY 2025-26</p>
            </div>
            
            <div>
              <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">Current Status</p>
              <span className="inline-flex bg-green-50 text-green-700 px-2 py-0.5 rounded font-bold text-[11px] capitalize">
                <span className="w-1.5 h-1.5 rounded-full bg-green-600 mr-1.5 my-auto"></span>
                {application.applicationStatus.replace("_", " ")}
              </span>
            </div>

            <div>
              <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">Date Applied</p>
              <p className="font-bold text-gray-900">
                {new Date(application.applicationDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </p>
            </div>

            <div>
              <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">Reviewed By</p>
              <p className="font-bold text-gray-900">{accomData?.manager?.user?.fname ? `${accomData.manager.user.fname} ${accomData.manager.user.lname}` : "—"}</p>
            </div>

            <div>
              <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">Last Updated</p>
              <p className="font-bold text-gray-900">—</p>
            </div>

            <div className="col-span-3">
              <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">Assigned Room</p>
              <p className="font-bold text-gray-900">NONE</p>
            </div>
          </div>
        </div>

        {/* Remarks */}
        <div>
          <p className="text-[10px] text-gray-400 uppercase font-bold mb-2">Landlord Remarks</p>
          <div className="bg-[#FCFAFA] border border-gray-100 rounded-xl p-3">
            <p className="text-sm text-gray-400 italic">No remark by admin</p>
          </div>
        </div>

      </div>
    </Modal>
  );
}