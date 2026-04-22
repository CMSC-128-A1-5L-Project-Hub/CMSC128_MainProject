import Card from "../ui/Card";
import EditIcon from '../../assets/icons/edit.svg';
import Modal from "../Modal";
import Button from "../Button";
import { useState } from "react";

type ManagerStatus = "assigned" | "pending" | "none";

interface ProfileCardProps {
  status?: ManagerStatus;
  name?: string;
  role?: string;
  phone?: string;
  email?: string;
}

export default function ProfileCard({
  status = "assigned",
  name = "Juan Dela Cruz",
  role = "Dorm Manager",
  phone = "(+63) XXX XXX",
  email = "analyn@gmail.com",
}: ProfileCardProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");

  const ManagerModal = (
    <Modal
      open={modalOpen}
      onClose={() => setModalOpen(false)}
      title={status === "assigned" ? "Replace Your Manager" : "Add a Manager"}
      eyebrow="My Profile"
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
            placeholder="mvreyes8@up.edu.ph"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
          />
        </div>
      </div>
    </Modal>
  );

  // ── NO MANAGER ──
  if (status === "none") {
    return (
      <>
        <Card>
          <div className="flex flex-col items-center justify-center py-6 gap-3">
            <p className="text-xs text-[#8C1535]/60 italic text-center">
              No manager has been assigned in this dormitory yet.
            </p>
            <Button variant="secondary" size="sm" onClick={() => setModalOpen(true)}>
              Add a Manager
            </Button>
          </div>
        </Card>
        {ManagerModal}
      </>
    );
  }

  // ── PENDING ──
  if (status === "pending") {
    return (
      <>
        <Card>
          <div className="flex flex-col items-center justify-center py-6 gap-3">
            <p className="text-xs text-[#8C1535]/60 italic text-center">
              Manager has not activated their account yet.
            </p>
            <Button variant="secondary" size="sm" onClick={() => setModalOpen(true)}>
              Edit
            </Button>
          </div>
        </Card>
        {ManagerModal}
      </>
    );
  }

  // ── ASSIGNED ──
  return (
    <>
      <Card>
        <div className="text-center relative">

          {/* Edit button */}
          <button
            onClick={() => setModalOpen(true)}
            className="absolute -top-5 -right-7 text-[#6B0F2B] hover:opacity-70 transition"
          >
            <img src={EditIcon} className="w-6 h-6" />
          </button>

          {/* Avatar with gold ring */}
          <div className="relative mx-auto w-16 h-16 rounded-full p-[3px] bg-yellow-500">
            <div className="w-full h-full bg-[#8C1535] rounded-full" />
            <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full" />
          </div>

          <h3 className="mt-3 font-semibold">{name}</h3>
          <p className="text-xs text-gray-500">{role}</p>

          <div className="text-xs text-gray-500 mt-2">
            <p>{phone}</p>
            <p>{email}</p>
          </div>
        </div>
      </Card>
      {ManagerModal}
    </>
  );
}