import { useState } from "react";
import Modal from "../../../../Modal";
import Button from "../../../../Button";
import notif_icon from "../../../../../assets/icons/notif_icon.svg";
import edit_icon from "../../../../../assets/icons/edit.svg";

type ManagerStatus = "assigned" | "pending" | "none";

interface ProfileCardProps {
  status?: ManagerStatus;
  name?: string;
  role?: string;
  phone?: string;
  email?: string;
  dormitory?: string;
  onNotification?: () => void;
}

export default function ProfileCard({
  status = "assigned",
  name = "Dal Cadsawan",
  role = "Dormitory Manager",
  phone = "+63 912 345 6789",
  email = "ddcadsawan@gmail.com",
  dormitory = "Narra Residence",
  onNotification,
}: ProfileCardProps) {
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [replacementEmail, setReplacementEmail] = useState("");

  const CLR = {
    dark: "#3D0718",
    mid: "#6B0F2B",
    accent: "#8C1535",
    gold: "#C9973A",
    goldLt: "#E8C37A",
    goldDk: "#a07825",
  };

  const handleSendInvite = () => {
    console.log("Send invite to:", replacementEmail);
    setEditModalOpen(false);
    setReplacementEmail("");
  };

  const SilhouetteAvatar = () => (
    <svg viewBox="0 0 80 80" fill="none" className="w-full h-full">
      <rect width="80" height="80" fill="#C9B8BC" />
      <circle cx="40" cy="29" r="15" fill="#A08890" />
      <ellipse cx="40" cy="70" rx="26" ry="20" fill="#A08890" />
    </svg>
  );

  // EditModal – only email field for replacing manager
  const EditModal = (
    <Modal
      open={editModalOpen}
      onClose={() => {
        setEditModalOpen(false);
        setReplacementEmail("");
      }}
      title="Replace Your Manager"
      eyebrow="Manager Profile"
      footer={
        <Button variant="primary" size="md" className="ml-auto" onClick={handleSendInvite}>
          Send Invite
        </Button>
      }
    >
      <div className="flex flex-col gap-4">
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
            Invite using their Google Account
          </p>
          <input
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#8C1535]"
            placeholder="email@example.com"
            value={replacementEmail}
            onChange={(e) => setReplacementEmail(e.target.value)}
          />
        </div>
      </div>
    </Modal>
  );

  // InviteModal (for adding a manager when none exists or pending)
  const InviteModal = (
    <Modal
      open={inviteModalOpen}
      onClose={() => setInviteModalOpen(false)}
      title={status === "assigned" ? "Replace Your Manager" : "Add a Manager"}
      eyebrow="Manager Profile"
      footer={
        <Button variant="primary" size="md" className="ml-auto">
          Invite
        </Button>
      }
    >
      <div className="flex flex-col gap-4">
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
            Invite using their Google Account
          </p>
          <input
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#8C1535]"
            placeholder="email@example.com"
          />
        </div>
      </div>
    </Modal>
  );

  const EmptyShell = ({ children }: { children: React.ReactNode }) => (
    <div
      className="relative rounded-b-[30px] overflow-hidden shadow-[0_10px_24px_rgba(61,7,24,0.18)]"
      style={{ background: `linear-gradient(145deg, ${CLR.dark} 0%, ${CLR.mid} 60%, ${CLR.accent} 100%)` }}
    >
      <div className="flex flex-col items-center justify-center py-12 px-6 gap-4">
        {children}
      </div>
    </div>
  );

  if (status === "none") {
    return (
      <>
        <EmptyShell>
          <p className="text-white/80 text-sm text-center">
            No manager has been assigned to this dormitory yet.
          </p>
          <Button variant="secondary" size="sm" onClick={() => setInviteModalOpen(true)}>
            Add a Manager
          </Button>
        </EmptyShell>
        {InviteModal}
      </>
    );
  }

  if (status === "pending") {
    return (
      <>
        <EmptyShell>
          <p className="text-white/80 text-sm text-center">
            Manager has not activated their account yet.
          </p>
          <Button variant="secondary" size="sm" onClick={() => setInviteModalOpen(true)}>
            Edit Invitation
          </Button>
        </EmptyShell>
        {InviteModal}
      </>
    );
  }

  const isActive = status === "assigned";

  return (
    <>
      <div
        className="relative rounded-b-[30px] px-7 pt-6 pb-6 shadow-lg w-full"
        style={{ background: `linear-gradient(145deg, ${CLR.dark} 0%, ${CLR.mid} 60%, ${CLR.accent} 100%)` }}
      >
        <div
          className="absolute top-0 left-0 w-full h-[79px] pointer-events-none"
          style={{ background: "linear-gradient(90deg, #7A0C23 0%, #A61C3C 100%)" }}
        />

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <span className="text-sm font-bold tracking-widest uppercase text-white/75 flex justify-center">
              Manager Profile
            </span>
            <div className="flex flex-row gap-2">
              <button
                onClick={() => setEditModalOpen(true)}
                className="w-12 h-11 rounded-2xl flex items-center justify-center relative overflow-hidden 
                          transition-all duration-150 bg-white/10 hover:bg-white/20 active:bg-white/30
                          hover:-translate-y-1 active:translate-y-0 active:scale-95"
              >
                <img src={edit_icon} alt="Edit" className="w-full h-full object-contain scale-[2.5]" />
              </button>
              <button
                onClick={onNotification}
                className="w-12 h-11 rounded-2xl flex items-center justify-center relative overflow-hidden 
                          transition-all duration-150 bg-white/10 hover:bg-white/20 active:bg-white/30
                          hover:-translate-y-1 active:translate-y-0 active:scale-95"
              >
                <img src={notif_icon} alt="Notifications" className="w-full h-full object-contain scale-[2.5]" />
                <span
                  className="absolute top-0.5 right-1 w-3 h-3 rounded-full border-2 border-white/80"
                  style={{ background: CLR.gold }}
                />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative flex-shrink-0">
              <div
                className="w-[78px] h-[78px] rounded-full bg-white/20 flex items-center justify-center border-[4px] overflow-hidden shadow-md"
                style={{ borderColor: CLR.gold }}
              >
                <SilhouetteAvatar />
              </div>
              <div className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-green-600 border-[3px] border-white flex items-center justify-center">
                <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>

            <div className="min-w-0">
              <p className="text-white font-bold text-[20px] leading-tight">{name}</p>
              <p className="text-[15px] font-bold leading-tight mt-1" style={{ color: CLR.goldLt }}>
                {role}
              </p>
              <p className="text-white/70 text-sm mt-1 truncate">{email}</p>
              <p className="text-white/70 text-sm">{phone}</p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4">
            <div>
              <p className="text-white/50 text-[10px] font-medium leading-tight mb-1.5 uppercase tracking-wider">
                Dormitory
              </p>
              <p className="text-white text-[14px] font-bold leading-tight">{dormitory}</p>
            </div>
            <div className="flex flex-col items-center">
              <p className="text-white/50 text-[10px] font-medium leading-tight mb-1.5 uppercase tracking-wider">
                Status
              </p>
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-green-100 text-green-700">
                {isActive ? "Active" : "Pending"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {EditModal}
      {InviteModal}
    </>
  );
}