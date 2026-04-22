import Card from "../../../ui/Card";
import Button from "../../../Button";
import {
  BedDouble,
  Users,
  Wallet,
  Trash2,
  User,
  Building,
  Tag,
  FileText,
} from "lucide-react";
import type { Room } from "../../../../pages/landlord/RoomPage";

interface RoomCardProps {
  room: Room;
  onManage: () => void;
  onBilling: () => void;
  onDelete: () => void;
}

const getStatusInfo = (room: Room) => {
  const isFull = room.occupants.length >= room.capacity;
  const isEmpty = room.occupants.length === 0;
  if (isFull) return { label: "FULL", bg: "bg-red-50", text: "text-red-600", border: "border-red-100", bar: "bg-[#8C1535]" };
  if (isEmpty) return { label: null, bg: "", text: "", border: "", bar: "bg-[#D4AF37]" };
  return { label: "AVAILABLE", bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-100", bar: "bg-[#8C1535]" };
};

export default function RoomCard({ room, onManage, onBilling, onDelete }: RoomCardProps) {
  const status = getStatusInfo(room);
  const fillPercentage = (room.occupants.length / room.capacity) * 100;

  return (
    <Card className="p-0 overflow-hidden group relative flex flex-col border border-[#F2D9DF] bg-white hover:shadow-md transition-all">
      <div className={`h-1 w-full ${status.bar}`} />
      <div className="p-3 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="text-base font-bold text-[#4A1F2D]">{room.name}</h3>
            <div className="flex items-center gap-1 mt-0.5 text-[#8A5C6B] text-xs">
              <Building size={11} />
              <span>{room.building}</span>
              <span className="mx-1">•</span>
              <BedDouble size={11} />
              <span>{room.type}</span>
            </div>
          </div>
          {status.label && (
            <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${status.bg} ${status.text} border`}>
              {status.label}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center gap-1.5 flex-1 px-2 py-1.5 rounded-lg bg-[#F9F6F7]/60 border">
            <Wallet size={12} className="text-[#8C1535]" />
            <span className="text-xs font-bold">₱{room.price.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1.5 flex-1 px-2 py-1.5 rounded-lg bg-[#F9F6F7]/60 border">
            <Users size={12} className="text-[#8C1535]" />
            <span className="text-xs font-bold">{room.occupants.length}/{room.capacity}</span>
          </div>
        </div>

        {room.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {room.tags.map((tag) => (
              <span key={tag} className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[9px] rounded-full bg-[#6B0F2B] text-white font-medium">
                <Tag size={8} />
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="mt-auto">
          <div className="w-full bg-[#F2D9DF]/50 rounded-full h-1.5 mb-2 overflow-hidden">
            <div className={`h-1.5 rounded-full transition-all duration-500 ${status.bar}`} style={{ width: `${fillPercentage}%` }} />
          </div>
          <div className="min-h-[32px]">
            {room.occupants.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {room.occupants.slice(0, 2).map((t) => (
                  <span key={t.id} className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] rounded-md bg-white border border-[#F2D9DF]">
                    <User size={8} className="text-[#8C1535]" />
                    {t.name.length > 12 ? t.name.slice(0, 10) + "..." : t.name}
                  </span>
                ))}
                {room.occupants.length > 2 && <span className="text-[9px] text-[#9A7080]">+{room.occupants.length - 2}</span>}
              </div>
            ) : (
              <div className="flex items-center justify-center rounded-md border border-dashed py-1">
                <span className="text-[9px] text-[#9A7080]">No occupants</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-[#F2D9DF] p-2 bg-gray-50/50 flex gap-2">
        <Button variant="secondary" size="sm" className="flex-1 text-xs py-1.5" onClick={onManage}>
          Manage
        </Button>
        <Button variant="secondary" size="sm" className="flex-1 text-xs py-1.5" onClick={onBilling}>
          <FileText size={12} className="mr-1" /> Billing
        </Button>
        <Button variant="danger" size="sm" className="py-1.5 px-3" onClick={onDelete}>
          <Trash2 size={13} />
        </Button>
      </div>
    </Card>
  );
}