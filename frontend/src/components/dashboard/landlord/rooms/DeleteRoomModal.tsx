import Modal from "../../../Modal";
import Button from "../../../Button";
import type { Room } from "../../../../pages/landlord/RoomPage";

interface DeleteRoomModalProps {
  open: boolean;
  room: Room | null;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DeleteRoomModal({ open, room, onClose, onConfirm }: DeleteRoomModalProps) {
  if (!open || !room) return null;

  return (
    <Modal open={open} onClose={onClose} title="Delete Room">
      <p className="text-sm">
        Are you sure you want to delete <strong>{room.name}</strong>? This will also remove all associated tenants.
      </p>
      <div className="mt-6 flex gap-3">
        <Button variant="secondary" className="flex-1" onClick={onClose}>Cancel</Button>
        <Button variant="danger" className="flex-1" onClick={onConfirm}>Delete Permanently</Button>
      </div>
    </Modal>
  );
}