"use client";

import { useState } from "react";
import { 
  Trash2, 
  FileText, 
  Crown, 
  BedDouble, 
  Users, 
  Building2, 
  Settings2, 
  ChevronDown,
  User 
} from "lucide-react";
import Button from "../../../Button";
import type { Room } from "../../../../pages/landlord/RoomPage";

interface RoomCardProps {
  room: Room;
  onManage: () => void;
  onBilling: () => void;
  onDelete: () => void;
}

export default function RoomCard({ room, onManage, onBilling, onDelete }: RoomCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const fillPercentage = (room.currentOccupancy / room.capacity) * 100;
  const TypeIcon = room.type === "Single" ? Crown : room.type === "Double" ? BedDouble : Users;

  return (
    <div 
      className={`group bg-white rounded-[2rem] border transition-all duration-300 overflow-hidden flex flex-col ${
        isExpanded 
          ? "ring-2 ring-[#8C1535] shadow-2xl translate-y-[-4px]" 
          : "border-gray-100 shadow-sm hover:shadow-xl hover:border-[#8C1535]/20"
      }`}
    >
      {/* Upper Content */}
      <div className="p-6 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex justify-between items-start mb-6">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${
            isExpanded ? "bg-[#8C1535] text-white" : "bg-[#F5EEF0] text-[#8C1535]"
          }`}>
            <TypeIcon size={24} />
          </div>
          <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
            room.availability === "available" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
          }`}>
            {room.availability}
          </div>
        </div>

        <div className="space-y-1 mb-6">
          <h3 className="text-xl font-black text-gray-900 leading-tight">Room {room.name}</h3>
          <p className="text-sm font-bold text-gray-400 flex items-center gap-1.5">
            <Building2 size={14} /> {room.building}
          </p>
        </div>

        {/* Occupancy Indicator */}
        <div className="space-y-2">
          <div className="flex justify-between items-end">
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Occupancy</span>
            <div className="flex items-center gap-1">
              <span className="text-sm font-black text-gray-900">{room.currentOccupancy}</span>
              <span className="text-xs font-bold text-gray-400">/ {room.capacity}</span>
            </div>
          </div>
          <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-1000 ease-out ${
                fillPercentage >= 100 ? 'bg-orange-500' : 'bg-[#8C1535]'
              }`}
              style={{ width: `${fillPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Footer Strip */}
      <div className="mt-auto border-t border-gray-50 bg-gray-50/30 px-6 py-4 flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Monthly Rent</span>
          <span className="text-lg font-black text-gray-900">₱{room.price.toLocaleString()}</span>
        </div>
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className={`p-2 rounded-xl transition-all ${isExpanded ? "bg-[#8C1535] text-white rotate-180" : "bg-white text-gray-400 shadow-sm"}`}
        >
          <ChevronDown size={20} />
        </button>
      </div>

      {/* Expanded Actions */}
      <div className={`px-6 overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? "max-h-60 pb-6 opacity-100" : "max-h-0 opacity-0"}`}>
        <div className="pt-4 space-y-4">
          {/* Tenant Avatars */}
          {room.occupants.length > 0 && (
            <div className="flex -space-x-2">
              {room.occupants.map((t, i) => (
                <div key={i} title={t.name} className="w-8 h-8 rounded-full border-2 border-white bg-[#8C1535] flex items-center justify-center text-[10px] font-bold text-white uppercase">
                  {t.name.charAt(0)}
                </div>
              ))}
              <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-400">
                <User size={12} />
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            <button 
              onClick={(e) => { e.stopPropagation(); onManage(); }}
              className="flex items-center justify-center gap-2 bg-[#8C1535] text-white text-xs font-bold py-3 rounded-2xl hover:bg-[#6B0F2B] transition-all"
            >
              <Settings2 size={16} /> Manage
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); onBilling(); }}
              className="flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 text-xs font-bold py-3 rounded-2xl hover:border-[#8C1535] transition-all"
            >
              <FileText size={16} /> Billing
            </button>
          </div>
          <button 
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="w-full flex items-center justify-center gap-2 text-red-500 text-[11px] font-bold py-2 hover:bg-red-50 rounded-xl transition-all"
          >
            <Trash2 size={14} /> Delete Room
          </button>
        </div>
      </div>
    </div>
  );
}