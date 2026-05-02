"use client";

import Button from "../../../Button";
import {
  Wallet,
  Trash2,
  FileText,
  Crown,
  BedDouble,
  Users,
} from "lucide-react";
import type { Room } from "../../../../pages/landlord/RoomPage";
import { useState } from "react";

interface RoomCardProps {
  room: Room;
  onManage: () => void;
  onBilling: () => void;
  onDelete: () => void;
}

export default function RoomCard({ room, onManage, onBilling, onDelete }: RoomCardProps) {
  const isFull = room.currentOccupancy >= room.capacity;
  const fillPercentage = (room.currentOccupancy / room.capacity) * 100;
  const [isExpanded, setIsExpanded] = useState(false);

  const TypeIcon = room.type === "Single" ? Crown : room.type === "Double" ? BedDouble : Users;

  // Maroon spectrum based on occupancy
  const getMaroonGradient = () => {
    if (fillPercentage === 0) return "from-[#8C1535]/20 to-[#8C1535]/30";
    if (fillPercentage >= 100) return "from-[#4A0E1B] to-[#3A0A15]";
    if (fillPercentage >= 75) return "from-red-600 to-red-700";
    if (fillPercentage >= 50) return "from-[#8C1535] to-[#6B0F2B]";
    return "from-[#8C1535]/50 to-[#8C1535]/70";
  };

  const gradient = getMaroonGradient();

  return (
    <div 
      className={`relative transition-all duration-300 cursor-pointer ${
        isExpanded ? "z-20 scale-105" : "z-10 hover:scale-[1.02]"
      }`}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      {/* Main Compact Card */}
      <div className={`bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all border border-gray-100`}>
        <div className="flex items-stretch">
          {/* Left Color Bar - Maroon Spectrum */}
          <div className={`w-2 flex-shrink-0 bg-gradient-to-b ${gradient}`} />
          
          <div className="flex-1 p-3">
            <div className="flex items-center justify-between">
              {/* Left: Name + Type */}
              <div className="flex items-center gap-2 min-w-0">
                <TypeIcon size={16} className="text-gray-400 flex-shrink-0" />
                <div className="min-w-0">
                  <h3 className="text-sm font-black text-gray-800 truncate">{room.name}</h3>
                  <p className="text-[10px] text-gray-400 truncate">{room.building} • {room.type}</p>
                </div>
              </div>

              {/* Right: Price + Dots */}
              <div className="flex items-center gap-3 flex-shrink-0 ml-2">
                <div className="text-right">
                  <p className="text-lg font-black text-gray-800 leading-none">₱{room.price}</p>
                  <p className="text-[9px] text-gray-400">/month</p>
                </div>
                
                {/* Circular Progress */}
                <div className="relative w-10 h-10 flex-shrink-0">
                  <svg className="w-10 h-10 transform -rotate-90">
                    <circle
                      cx="20"
                      cy="20"
                      r="16"
                      stroke="#f3f4f6"
                      strokeWidth="3"
                      fill="none"
                    />
                    <circle
                      cx="20"
                      cy="20"
                      r="16"
                      stroke={isFull ? "#4A0E1B" : "#8C1535"}
                      strokeWidth="3"
                      fill="none"
                      strokeDasharray={`${fillPercentage * 1.005} 100`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[9px] font-black text-gray-600">{room.currentOccupancy}/{room.capacity}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Expandable Section */}
            <div className={`grid transition-all duration-300 ${
              isExpanded ? "grid-rows-[1fr] opacity-100 mt-3" : "grid-rows-[0fr] opacity-0"
            }`}>
              <div className="overflow-hidden">
                {/* Tags Row */}
                {room.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {room.tags.map(tag => (
                      <span 
                        key={tag.name}
                        className={`text-[9px] px-2 py-0.5 rounded-full font-medium ${
                          tag.type === "inclusion" 
                            ? "bg-emerald-50 text-emerald-600" 
                            : "bg-amber-50 text-amber-600"
                        }`}
                      >
                        {tag.name}
                      </span>
                    ))}
                  </div>
                )}

                {/* Tenants Mini List */}
                {room.occupants.length > 0 && (
                  <div className="mb-3">
                    {room.occupants.map(t => (
                      <div key={t.id} className="flex items-center gap-1.5 text-[10px] text-gray-500 py-0.5">
                        <div className="w-3 h-3 rounded-full bg-[#8C1535]" />
                        {t.name}
                      </div>
                    ))}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button variant="secondary" size="sm" className="flex-1 text-[10px] py-1.5 rounded-lg font-bold" onClick={(e) => { e.stopPropagation(); onManage(); }}>
                    Manage
                  </Button>
                  <Button variant="secondary" size="sm" className="flex-1 text-[10px] py-1.5 rounded-lg font-bold" onClick={(e) => { e.stopPropagation(); onBilling(); }}>
                    <FileText size={11} className="mr-1" /> Bill
                  </Button>
                  <Button variant="danger" size="sm" className="text-[10px] py-1.5 px-3 rounded-lg" onClick={(e) => { e.stopPropagation(); onDelete(); }}>
                    <Trash2 size={11} />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}