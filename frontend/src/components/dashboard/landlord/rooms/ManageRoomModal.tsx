import { useState } from "react";
import Modal from "../../../Modal";
import Button from "../../../Button";
import { User, ArrowRight, ArrowLeft } from "lucide-react";
import type { Room, Tenant } from "../../../../pages/landlord/RoomPage";

interface ManageRoomModalProps {
  open: boolean;
  room: Room | null;
  rooms: Room[];
  onClose: () => void;
  onReassign: (tenant: Tenant, fromRoom: Room, toRoom: Room) => void;
}

export default function ManageRoomModal({ open, room, rooms, onClose, onReassign }: ManageRoomModalProps) {
  const [view, setView] = useState<"occupants" | "reassign">("occupants");
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);

  if (!open || !room) return null;

  const getAvailableRooms = (currentRoom: Room) => {
    return rooms.filter(r =>
      r.id !== currentRoom.id &&
      r.type === currentRoom.type &&
      r.occupants.length < r.capacity
    );
  };

  const handleReassign = (targetRoom: Room) => {
    if (selectedTenant) {
      onReassign(selectedTenant, room, targetRoom);
      setView("occupants");
      setSelectedTenant(null);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={`Manage ${room.name}`}>
      {view === "occupants" ? (
        <div className="space-y-5">
          <div className="p-3 bg-[#F9F6F7] rounded-xl flex justify-between items-center">
            <div>
              <p className="text-xs font-bold text-[#8C1535] uppercase">Occupancy</p>
              <p className="text-2xl font-bold">{room.occupants.length} / {room.capacity}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-[#7A4E5D]">Building</p>
              <p className="font-medium">{room.building}</p>
            </div>
          </div>
          {room.occupants.length === 0 ? (
            <div className="text-center py-8 text-gray-400">No tenants assigned to this room.</div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {room.occupants.map((tenant) => (
                <div key={tenant.id} className="border rounded-xl p-3 space-y-2">
                  <div className="flex justify-between items-start">
                    <div className="flex gap-2">
                      <div className="h-8 w-8 rounded-full bg-[#8C1535]/10 flex items-center justify-center">
                        <User size={14} className="text-[#8C1535]" />
                      </div>
                      <div>
                        <p className="font-bold text-[#4A1F2D]">{tenant.name}</p>
                        <p className="text-xs text-gray-500">{tenant.email || "no email"}</p>
                        <p className="text-xs text-gray-500">{tenant.phone || "no phone"} • {tenant.degree || "no degree"}</p>
                      </div>
                    </div>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="text-xs py-1 px-3"
                      onClick={() => {
                        setSelectedTenant(tenant);
                        setView("reassign");
                      }}
                    >
                      Reassign <ArrowRight size={12} className="ml-1" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-[#F2D9DF]">
            <button onClick={() => setView("occupants")} className="text-[#8C1535] hover:text-[#6B0F2B] transition flex items-center gap-1 text-sm">
              <ArrowLeft size={16} /> Back
            </button>
            <span className="text-sm text-[#7A4E5D]">Moving: <strong>{selectedTenant?.name}</strong></span>
          </div>
          <p className="text-sm text-[#7A4E5D]">Select a {room.type} room with available space:</p>
          {getAvailableRooms(room).length === 0 ? (
            <div className="text-center py-8 text-gray-400">No other {room.type} rooms with free capacity.</div>
          ) : (
            <div className="grid gap-2 max-h-80 overflow-y-auto">
              {getAvailableRooms(room).map((target) => (
                <div
                  key={target.id}
                  className="flex justify-between items-center p-3 border rounded-xl hover:bg-[#F9F6F7] cursor-pointer transition"
                  onClick={() => handleReassign(target)}
                >
                  <div>
                    <p className="font-semibold">{target.name}</p>
                    <p className="text-xs text-gray-500">{target.building} • {target.occupants.length}/{target.capacity} occupied</p>
                  </div>
                  <Button variant="secondary" size="sm">Move →</Button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}