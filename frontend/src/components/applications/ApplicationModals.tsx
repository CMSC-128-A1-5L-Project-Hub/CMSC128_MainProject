import { useState } from "react";
import Modal from "../../components/Modal";
import Button from "../../components/Button";
import Card from "../../components/ui/Card";
import {
  IoPersonSharp,
  IoCalendarSharp,
  IoBedSharp,
  IoDocumentSharp,
  IoDocumentTextSharp,
  IoIdCardSharp,
} from "react-icons/io5";

// STATUS 
const StatusBadge = ({
  status,
  statusConfig,
}: {
  status: any;
  statusConfig: Record<string, { color: string; bg: string; dot: string }>;
}) => {
  const cfg = statusConfig[status];

  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[0.7rem] font-semibold whitespace-nowrap"
      style={{ background: cfg.bg, color: cfg.color }}
    >
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: cfg.dot }} />
      {status.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase())}
    </span>
  );
};

// DATE AND TIME
function formatDate(dateString: string) {
  const date = new Date(dateString);

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}
function formatTime(dateString: string) {
  const date = new Date(dateString);

  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

// MAIN CONTENT INSIDE MODAL 
const ApplicationModalContent = ({
  app,
  status,
  rejectionRemark,
  onAccept,
  onReject,
  statusConfig,
}: {
  app: any;
  status: any;
  rejectionRemark: string | null;
  onAccept: () => void;
  onReject: () => void;
  statusConfig: Record<string, { color: string; bg: string; dot: string }>;
}) => {
  const fullName = `${app.student.user.fname} ${app.student.user.lname}`;

  return (
    <Card
      children={
        // HEADER [ NAME AND STTAUS ]
        <div className="flex flex-col gap-6">
          <div className="flex flex-row justify-between items-start">
            <div className="flex flex-col">
              <p className="text-[#1A0008] font-bold text-xl">{fullName}</p>
              <p className="text-[#C8B0B8] text-xs mt-1">
                Date Applied: {formatDate(app.applicationDate)}
              </p>
            </div>
            <StatusBadge status={status} statusConfig={statusConfig} />
          </div>
          {/* ======================= APPLICANT AND OCCUOANCY ======================= */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border border-[#F5ECF0] rounded-xl p-4">
            <div className="col-span-1 sm:border-r border-[#F5ECF0] sm:pr-4">
              <p className="flex flex-row gap-2 items-center font-semibold text-[#1A0008] mb-3">
                <IoPersonSharp size={18} color="#6B0F2B" />
                Applicant Details
              </p>
          {/* ======================= LEFT : APPLICANT DETAILS  ======================= */}
              <div className="grid grid-cols-2 gap-y-3">
                <div className="col-span-2">
                  <p className="text-[#9A7080] text-[10px] uppercase font-semibold tracking-wide">Email</p>
                  <p className="text-[#1A0008] text-sm break-all">{app.student.user.email}</p>
                </div>

                <div className="col-span-1">
                  <p className="text-[#9A7080] text-[10px] uppercase font-semibold tracking-wide">Year Level</p>
                  <p className="text-[#1A0008] text-sm">{app.student.yearLevel || "N/A"}</p>
                </div>

                <div className="col-span-1">
                  <p className="text-[#9A7080] text-[10px] uppercase font-semibold tracking-wide">Phone Number</p>
                  <p className="text-[#1A0008] text-sm">{app.student.phone || "N/A"}</p>
                </div>

                <div className="col-span-2">
                  <p className="text-[#9A7080] text-[10px] uppercase font-semibold tracking-wide">Degree Program</p>
                  <p className="text-[#1A0008] text-sm">{app.student.degreeProgram}</p>
                </div>

                <div className="col-span-1">
                  <p className="text-[#9A7080] text-[10px] uppercase font-semibold tracking-wide">College</p>
                  <p className="text-[#1A0008] text-sm">{app.student.college.toUpperCase()}</p>
                </div>

                <div className="col-span-1">
                  <p className="text-[#9A7080] text-[10px] uppercase font-semibold tracking-wide">Student Number</p>
                  <p className="text-[#1A0008] text-sm">{app.student.studentNumber}</p>
                </div>
              </div>
            </div>
          {/* ======================= RIGHT : OCCUPANCY DETAILS  ======================= */}
            <div className="col-span-1 sm:pl-2">
              <p className="flex flex-row gap-2 items-center font-semibold text-[#1A0008] mb-3">
                <IoCalendarSharp size={18} color="#6B0F2B" />
                Occupancy Details
              </p>

              <div className="flex flex-col gap-3">
                <div>
                  <p className="text-[#9A7080] text-[10px] uppercase font-semibold tracking-wide">Application Date</p>
                  <p className="text-[#1A0008] text-sm">{formatDate(app.applicationDate)}</p>
                </div>

                <div>
                  <p className="text-[#9A7080] text-[10px] uppercase font-semibold tracking-wide">Time Submitted</p>
                  <p className="text-[#1A0008] text-sm">{formatTime(app.applicationDate)}</p>
                </div>

                {/* Only display when stay type is transient */}
                {app.applicationStayType === "transient" ? (
                  <div>
                    <p className="text-[#9A7080] text-[10px] uppercase font-semibold tracking-wide">Duration</p>
                    <p className="text-[#1A0008] text-sm">
                      {app.durationOfStayDays} day{app.durationOfStayDays !== 1 ? "s" : ""}
                    </p>
                  </div>
                  )
                  : undefined
                }
              </div>
            </div>
          </div>
          {/* ======================= ROOM AND DOCUMENTS  ======================= */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border border-[#F5ECF0] rounded-xl p-4">
            {/* ======================= LEFT : ROOM PREFERENCE  ======================= */}
            <div className="col-span-1 sm:border-r border-[#F5ECF0] sm:pr-4">
              <p className="flex flex-row gap-2 items-center font-semibold text-[#1A0008] mb-3">
                <IoBedSharp size={18} color="#6B0F2B" />
                Room Preference
              </p>

              <div className="grid grid-cols-2 gap-y-3">
                <div className="col-span-1">
                  <p className="text-[#9A7080] text-[10px] uppercase font-semibold tracking-wide">Stay</p>
                  <p className="text-[#1A0008] text-sm">
                    {app.applicationStayType === "non_transient" ? "Non-Transient" : "Transient"}
                  </p>
                </div>

                <div className="col-span-1">
                  <p className="text-[#9A7080] text-[10px] uppercase font-semibold tracking-wide">Facility</p>
                  <p className="text-[#1A0008] text-sm">{app.accommodation.accommodationName}</p>
                </div>

                <div className="col-span-1">
                  <p className="text-[#9A7080] text-[10px] uppercase font-semibold tracking-wide">Room Type</p>
                  <p className="text-[#1A0008] text-sm">
                    {app.applicationRoomType === "shared" ? "Shared"
                      : app.applicationRoomType === "single" ? "Single" : "Double"
                    }
                  </p>
                </div>

                <div className="col-span-1">
                  <p className="text-[#9A7080] text-[10px] uppercase font-semibold tracking-wide">Location</p>
                  <p className="text-[#1A0008] text-sm">{app.accommodation.accommodationLocation}</p>
                </div>
              </div>
            </div>
            {/* ======================= RIGHT : DOCUMENTS  ======================= */}
            <div className="col-span-1 sm:pl-2">
              <p className="flex flex-row gap-2 items-center font-semibold text-[#1A0008] mb-3">
                <IoDocumentSharp size={18} color="#6B0F2B" />
                Uploaded Documents
              </p>

              <div className="flex flex-col gap-3">
                {[
                  { label: "FORM 5", icon: <IoDocumentTextSharp size={16} color="white" /> },
                  { label: "VALID ID", icon: <IoIdCardSharp size={16} color="white" /> },
                ].map((doc) => (
                  <div key={doc.label} className="grid grid-cols-[auto_1fr_60px] items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: "linear-gradient(135deg, #6B0F2B, #9E2040)" }}
                    >
                      {doc.icon}
                    </div>

                    <p className="text-[#1A0008] text-xs font-semibold">{doc.label}</p>

                    <Button variant="reddishPink" size="sm">
                      View
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
          {/* ======================= REJECTION REASON  ======================= */}
          {status === "rejected" && rejectionRemark && (
            <div className="border border-[#F5D5DC] bg-[#FFF5F7] rounded-xl p-4">
              <p className="text-[#9E2040] text-[10px] uppercase font-bold tracking-wide mb-1">
                Rejection Remark
              </p>
              <p className="text-[#1A0008] text-sm">{rejectionRemark}</p>
            </div>
          )}
          {/* ======================= ACTIONS FOR PENDING ONLY  ======================= */}
          {status === "pending" && (
            <div className="flex flex-row justify-end gap-3 pt-1">
              <Button variant="primary" onClick={onAccept}>
                Accept
              </Button>
              <Button variant="secondary" onClick={onReject}>
                Reject
              </Button>
            </div>
          )}
        </div>
      }
    />
  );
};

const RejectionModal = ({
  open,
  target,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  target: any;
  onCancel: () => void;
  onConfirm: (reason: string) => void;
}) => {
  const [reason, setReason] = useState("");

  const handleConfirm = () => {
    if (!reason.trim()) return;
    onConfirm(reason.trim());
    setReason("");
  };

  const handleCancel = () => {
    setReason("");
    onCancel();
  };

  return (
    <Modal
      open={open}
      onClose={handleCancel}
      title="Reject Application"
      children={
        <div className="flex flex-col gap-4">
          <p className="text-[#1A0008] text-sm">
            Please provide a reason for rejecting{" "}
            <span className="font-semibold">
              {target ? `${target.student.user.fname} ${target.student.user.lname}` : ""}
            </span>
            's application.
          </p>

          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Enter rejection reason..."
            rows={4}
            className="w-full border border-[#F5ECF0] rounded-xl p-3 text-sm text-[#1A0008] placeholder:text-[#C8B0B8] resize-none focus:outline-none focus:border-[#6B0F2B]"
          />

          <div className="flex flex-row justify-end gap-3">
            <Button variant="secondary" onClick={handleCancel}>
              Cancel
            </Button>
            <Button
              variant="reddishPink"
              disabled={!reason.trim()}
              onClick={handleConfirm}
            >
              Confirm Reject
            </Button>
          </div>
        </div>
      }
    />
  );
};

export default function ApplicationModals({
  selectedApp,
  rejectingApp,
  getAppStatus,
  rejectionRemarks,
  handleAccept,
  handleStartReject,
  handleConfirmReject,
  setSelectedApp,
  setRejectingApp,
  statusConfig,
}: {
  selectedApp: any;
  rejectingApp: any;
  getAppStatus: (app: any) => any;
  rejectionRemarks: Record<number, string>;
  handleAccept: (appId: number) => void;
  handleStartReject: (app: any) => void;
  handleConfirmReject: (remark: string) => void;
  setSelectedApp: (app: any) => void;
  setRejectingApp: (app: any) => void;
  statusConfig: Record<string, { color: string; bg: string; dot: string }>;
}) {
  return (
    <>
      <Modal
        open={!!selectedApp}
        onClose={() => setSelectedApp(null)}
        title="APPLICATION"
        maxWidth={900}
        maxHeight={650}
      >
        {selectedApp && (
          <ApplicationModalContent
            app={selectedApp}
            status={getAppStatus(selectedApp)}
            rejectionRemark={rejectionRemarks[selectedApp.id] ?? null}
            onAccept={() => handleAccept(selectedApp.id)}
            onReject={() => handleStartReject(selectedApp)}
            statusConfig={statusConfig}
          />
        )}
      </Modal>

      <RejectionModal
        open={!!rejectingApp}
        target={rejectingApp}
        onCancel={() => setRejectingApp(null)}
        onConfirm={handleConfirmReject}
      />
    </>
  );
}