"use client";

import { useState, useEffect } from "react";
import Modal from "../../../Modal";
import Button from "../../../Button";
import { Tag, X, Check } from "lucide-react";
import type { Room, RoomTag } from "../../../../pages/landlord/RoomPage";

interface AddRoomModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (room: Omit<Room, "id" | "occupants" | "currentOccupancy" | "availability"> & { tags: RoomTag[] }) => void;
}

const COMMON_INCLUSIONS = [
  "Furnished", "WiFi Ready", "Study Desk", "Private Bathroom", 
  "Balcony", "CCTV Security", "Keycard Access", "Laundry Access",
  "Kitchen Access", "Parking", "Lobby", "Elevator"
];

const COMMON_PREFERENCES = [
  "Air Conditioning", "Water Heater", "Cleaning Service", 
  "Quiet Zone", "Garden View", "High Floor", "Near Elevator",
  "Mini Fridge", "TV", "Bidet", "Meal Plan"
];

export default function AddRoomModal({ open, onClose, onAdd }: AddRoomModalProps) {
  const [newRoom, setNewRoom] = useState({
    name: "",
    building: "",
    type: "Double" as Room["type"],
    capacity: 2,
    price: "" as string,
    stay_type: "non_transient" as "transient" | "non_transient",
    tenant_restriction: "coed" as "coed" | "non-coed",
  });
  
  const [inclusions, setInclusions] = useState<RoomTag[]>([]);
  const [preferences, setPreferences] = useState<RoomTag[]>([]);
  const [customInclusionInput, setCustomInclusionInput] = useState("");
  const [customPreferenceInput, setCustomPreferenceInput] = useState("");
  const [capacityInput, setCapacityInput] = useState<string>("2");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      setNewRoom({
        name: "",
        building: "",
        type: "Double",
        capacity: 2,
        price: "",
        stay_type: "non_transient",
        tenant_restriction: "coed",
      });
      setInclusions([]);
      setPreferences([]);
      setCustomInclusionInput("");
      setCustomPreferenceInput("");
      setCapacityInput("2");
      setErrors({});
    }
  }, [open]);

  const toggleInclusion = (name: string) => {
    setInclusions(prev => {
      const exists = prev.find(t => t.name === name);
      if (exists) return prev.filter(t => t.name !== name);
      return [...prev, { name, type: "inclusion" }];
    });
  };

  const togglePreference = (name: string) => {
    setPreferences(prev => {
      const exists = prev.find(t => t.name === name);
      if (exists) return prev.filter(t => t.name !== name);
      return [...prev, { name, type: "preference" }];
    });
  };

  const addCustomInclusion = () => {
    const trimmed = customInclusionInput.trim();
    if (trimmed && !inclusions.find(t => t.name === trimmed) && !preferences.find(t => t.name === trimmed)) {
      setInclusions(prev => [...prev, { name: trimmed, type: "inclusion" }]);
      setCustomInclusionInput("");
    }
  };

  const addCustomPreference = () => {
    const trimmed = customPreferenceInput.trim();
    if (trimmed && !preferences.find(t => t.name === trimmed) && !inclusions.find(t => t.name === trimmed)) {
      setPreferences(prev => [...prev, { name: trimmed, type: "preference" }]);
      setCustomPreferenceInput("");
    }
  };

  const removeTag = (tag: RoomTag) => {
    if (tag.type === "inclusion") {
      setInclusions(prev => prev.filter(t => t.name !== tag.name));
    } else {
      setPreferences(prev => prev.filter(t => t.name !== tag.name));
    }
  };

  const handleCapacityInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCapacityInput(e.target.value);
  };

  const applyCapacityUpdate = () => {
    const raw = capacityInput.trim();
    if (raw === "") {
      setCapacityInput(newRoom.capacity.toString());
      return;
    }
    const num = parseInt(raw, 10);
    if (isNaN(num) || num < 1) {
      setCapacityInput(newRoom.capacity.toString());
      if (errors.capacity) setErrors(prev => ({ ...prev, capacity: "" }));
      return;
    }

    let newType = newRoom.type;
    if (num === 1) newType = "Single";
    else if (num === 2) newType = "Double";
    else if (num >= 3) newType = "Shared";

    setNewRoom(prev => ({ ...prev, capacity: num, type: newType }));
    setCapacityInput(num.toString());
    if (errors.capacity) setErrors(prev => ({ ...prev, capacity: "" }));
  };

  const handleCapacityKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      applyCapacityUpdate();
    }
  };

  const handleTypeChange = (type: Room["type"]) => {
    let newCapacity = newRoom.capacity;
    if (type === "Single") newCapacity = 1;
    else if (type === "Double") newCapacity = 2;
    else if (type === "Shared" && newCapacity <= 2) newCapacity = 3;
    
    setNewRoom(prev => ({ ...prev, type, capacity: newCapacity }));
    setCapacityInput(newCapacity.toString());
    if (errors.capacity) setErrors(prev => ({ ...prev, capacity: "" }));
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!newRoom.name.trim()) errs.name = "Room name is required";
    else if (newRoom.name.trim().length > 5) errs.name = "Room name must be 5 characters or fewer";
    if (!newRoom.building.trim()) errs.building = "Building is required";
    else if (newRoom.building.trim().length > 20) errs.building = "Building must be 20 characters or fewer";
    if (!newRoom.type) errs.type = "Room type is required";
    const priceNum = parseFloat(newRoom.price);
    if (isNaN(priceNum) || priceNum <= 0) errs.price = "Price must be greater than 0";
    if (newRoom.capacity < 1) errs.capacity = "Capacity must be at least 1";
    if (newRoom.type === "Shared" && newRoom.capacity < 3) errs.capacity = "Shared rooms must have capacity at least 3";
    if (newRoom.type === "Single" && newRoom.capacity !== 1) errs.capacity = "Single room capacity must be exactly 1";
    if (newRoom.type === "Double" && newRoom.capacity !== 2) errs.capacity = "Double room capacity must be exactly 2";
    return errs;
  };

  const handleSubmit = () => {
    applyCapacityUpdate();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    
    const allTags: RoomTag[] = [...inclusions, ...preferences];
    
    onAdd({
      name: newRoom.name.trim(),
      building: newRoom.building.trim(),
      type: newRoom.type,
      capacity: newRoom.capacity,
      price: parseFloat(newRoom.price),
      tags: allTags,
      stay_type: newRoom.stay_type,
      tenant_restriction: newRoom.tenant_restriction,
    });
    
    onClose();
  };

  const handleClose = () => {
    onClose();
    setNewRoom({
      name: "",
      building: "",
      type: "Double",
      capacity: 2,
      price: "",
      stay_type: "non_transient",
      tenant_restriction: "coed",
    });
    setInclusions([]);
    setPreferences([]);
    setErrors({});
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Add New Room"
      footer={
        <div className="flex flex-row justify-end w-full">
          <Button variant="primary" onClick={handleSubmit}>
            Create Room
          </Button>
        </div>
      }
    >
      <div className="space-y-4 sm:space-y-5">
        {/* Room Name */}
        <div className="flex flex-col gap-1">
          <label className="text-[9px] sm:text-[10px] font-semibold tracking-wide text-[#7a001f]">ROOM NAME <span className="text-[#7a001f]/60 font-normal">(max 5 chars)</span></label>
          <input
            type="text"
            value={newRoom.name}
            maxLength={5}
            onChange={(e) => setNewRoom({ ...newRoom, name: e.target.value })}
            className={`border rounded-xl p-2.5 sm:p-3 text-xs sm:text-sm w-full focus:outline-none focus:ring-2 focus:ring-[#7a001f]/30 transition ${
              errors.name ? "border-red-500" : "border-[#e5cfd4]"
            }`}
            placeholder="e.g., 2D5"
          />
          {errors.name && <p className="text-red-500 text-[10px] sm:text-xs">{errors.name}</p>}
        </div>

        {/* Building */}
        <div className="flex flex-col gap-1">
          <label className="text-[9px] sm:text-[10px] font-semibold tracking-wide text-[#7a001f]">BUILDING <span className="text-[#7a001f]/60 font-normal">(max 20 chars)</span></label>
          <input
            type="text"
            value={newRoom.building}
            maxLength={20}
            onChange={(e) => setNewRoom({ ...newRoom, building: e.target.value })}
            className={`border rounded-xl p-2.5 sm:p-3 text-xs sm:text-sm w-full focus:outline-none focus:ring-2 focus:ring-[#7a001f]/30 transition ${
              errors.building ? "border-red-500" : "border-[#e5cfd4]"
            }`}
            placeholder="e.g., North Tower"
          />
          {errors.building && <p className="text-red-500 text-[10px] sm:text-xs">{errors.building}</p>}
        </div>

        {/* Room Type + Capacity */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-[9px] sm:text-[10px] font-semibold tracking-wide text-[#7a001f]">ROOM TYPE</label>
            <select
              value={newRoom.type}
              onChange={(e) => handleTypeChange(e.target.value as Room["type"])}
              className={`border rounded-xl p-2.5 sm:p-3 text-xs sm:text-sm w-full focus:outline-none focus:ring-2 focus:ring-[#7a001f]/30 transition ${
                errors.type ? "border-red-500" : "border-[#e5cfd4]"
              }`}
            >
              <option value="Single">Single</option>
              <option value="Double">Double</option>
              <option value="Shared">Shared</option>
            </select>
            {errors.type && <p className="text-red-500 text-[10px] sm:text-xs">{errors.type}</p>}
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[9px] sm:text-[10px] font-semibold tracking-wide text-[#7a001f]">
              CAPACITY {newRoom.type !== "Shared" ? "(fixed)" : "(min 3)"}
            </label>
            <input
              type="text"
              value={capacityInput}
              onChange={handleCapacityInputChange}
              onBlur={applyCapacityUpdate}
              onKeyDown={handleCapacityKeyDown}
              disabled={newRoom.type !== "Shared"}
              className={`border rounded-xl p-2.5 sm:p-3 text-xs sm:text-sm w-full focus:outline-none focus:ring-2 focus:ring-[#7a001f]/30 transition ${
                errors.capacity ? "border-red-500" : "border-[#e5cfd4]"
              } ${newRoom.type !== "Shared" ? "bg-gray-100 cursor-not-allowed" : ""}`}
            />
            {errors.capacity && <p className="text-red-500 text-[10px] sm:text-xs">{errors.capacity}</p>}
          </div>
        </div>

        {/* Price */}
        <div className="flex flex-col gap-1">
          <label className="text-[9px] sm:text-[10px] font-semibold tracking-wide text-[#7a001f]">MONTHLY RENT (₱)</label>
          <input
            type="number"
            value={newRoom.price}
            onChange={(e) => setNewRoom({ ...newRoom, price: e.target.value })}
            className={`border rounded-xl p-2.5 sm:p-3 text-xs sm:text-sm w-full focus:outline-none focus:ring-2 focus:ring-[#7a001f]/30 transition ${
              errors.price ? "border-red-500" : "border-[#e5cfd4]"
            }`}
            placeholder="0"
          />
          {errors.price && <p className="text-red-500 text-[10px] sm:text-xs">{errors.price}</p>}
          <p className="text-[8px] sm:text-[10px] text-gray-400 mt-1">This is the total monthly price students will pay</p>
        </div>

        {/* Stay Type and Tenant Restriction */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-[9px] sm:text-[10px] font-semibold tracking-wide text-[#7a001f]">STAY TYPE</label>
            <select
              value={newRoom.stay_type}
              onChange={(e) => setNewRoom({ ...newRoom, stay_type: e.target.value as "transient" | "non_transient" })}
              className="border border-[#e5cfd4] rounded-xl p-2.5 sm:p-3 text-xs sm:text-sm w-full focus:outline-none focus:ring-2 focus:ring-[#7a001f]/30 transition"
            >
              <option value="transient">Transient</option>
              <option value="non_transient">Non‑Transient</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[9px] sm:text-[10px] font-semibold tracking-wide text-[#7a001f]">TENANT RESTRICTION</label>
            <select
              value={newRoom.tenant_restriction}
              onChange={(e) => setNewRoom({ ...newRoom, tenant_restriction: e.target.value as "coed" | "non-coed" })}
              className="border border-[#e5cfd4] rounded-xl p-2.5 sm:p-3 text-xs sm:text-sm w-full focus:outline-none focus:ring-2 focus:ring-[#7a001f]/30 transition"
            >
              <option value="coed">Co‑ed</option>
              <option value="non-coed">Non‑Coed</option>
            </select>
          </div>
        </div>

        {/* Inclusions Section */}
        <div className="border border-[#e5cfd4] rounded-xl p-3 sm:p-4 space-y-2 sm:space-y-3">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Check size={14} className="sm:w-4 sm:h-4 text-emerald-600" />
            <label className="text-[10px] sm:text-xs font-bold tracking-wide text-emerald-700">ROOM INCLUSIONS</label>
            <span className="text-[8px] sm:text-[10px] text-gray-400 ml-auto hidden sm:inline">Fixed features included in the price</span>
          </div>
          
          {inclusions.length > 0 && (
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {inclusions.map((tag) => (
                <span key={tag.name} className="inline-flex items-center gap-1 sm:gap-1.5 pl-2 sm:pl-2.5 pr-1 sm:pr-1.5 py-1 sm:py-1.5 bg-emerald-600 text-white rounded-full text-[10px] sm:text-xs font-medium">
                  <Check size={10} className="sm:w-3 sm:h-3" />
                  {tag.name}
                  <button type="button" onClick={() => removeTag(tag)} className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex items-center justify-center hover:bg-emerald-700 rounded-full transition">
                    <X size={10} className="sm:w-3 sm:h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}

          <div>
            <p className="text-[8px] sm:text-[10px] text-gray-500 mb-1.5">Common inclusions (click to toggle):</p>
            <div className="flex flex-wrap gap-1 sm:gap-1.5">
              {COMMON_INCLUSIONS.map((name) => {
                const isSelected = inclusions.some(t => t.name === name);
                return (
                  <button
                    key={name}
                    type="button"
                    onClick={() => toggleInclusion(name)}
                    className={`inline-flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[8px] sm:text-[10px] font-medium transition-all border ${
                      isSelected 
                        ? "bg-emerald-600 text-white border-emerald-600" 
                        : "bg-white text-gray-600 border-gray-200 hover:border-emerald-300 hover:text-emerald-700"
                    }`}
                  >
                    {isSelected && <Check size={8} className="sm:w-2.5 sm:h-2.5" />}
                    {name}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex gap-1.5 sm:gap-2">
            <input
              type="text"
              value={customInclusionInput}
              onChange={(e) => setCustomInclusionInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCustomInclusion(); }}}
              placeholder="Add custom inclusion..."
              className="flex-1 border border-[#e5cfd4] rounded-lg px-2.5 sm:px-3 py-1.5 text-[10px] sm:text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 transition"
            />
            <Button variant="secondary" size="sm" onClick={addCustomInclusion} type="button" className="text-[10px] sm:text-xs">Add</Button>
          </div>
        </div>

        {/* Preferences Section */}
        <div className="border border-[#e5cfd4] rounded-xl p-3 sm:p-4 space-y-2 sm:space-y-3">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Tag size={14} className="sm:w-4 sm:h-4 text-amber-600" />
            <label className="text-[10px] sm:text-xs font-bold tracking-wide text-amber-700">ROOM PREFERENCES</label>
            <span className="text-[8px] sm:text-[10px] text-gray-400 ml-auto hidden sm:inline">Students can filter by these</span>
          </div>
          
          {preferences.length > 0 && (
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {preferences.map((tag) => (
                <span key={tag.name} className="inline-flex items-center gap-1 sm:gap-1.5 pl-2 sm:pl-2.5 pr-1 sm:pr-1.5 py-1 sm:py-1.5 bg-amber-600 text-white rounded-full text-[10px] sm:text-xs font-medium">
                  <Tag size={10} className="sm:w-3 sm:h-3" />
                  {tag.name}
                  <button type="button" onClick={() => removeTag(tag)} className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex items-center justify-center hover:bg-amber-700 rounded-full transition">
                    <X size={10} className="sm:w-3 sm:h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}

          <div>
            <p className="text-[8px] sm:text-[10px] text-gray-500 mb-1.5">Common preferences (click to toggle):</p>
            <div className="flex flex-wrap gap-1 sm:gap-1.5">
              {COMMON_PREFERENCES.map((name) => {
                const isSelected = preferences.some(t => t.name === name);
                return (
                  <button
                    key={name}
                    type="button"
                    onClick={() => togglePreference(name)}
                    className={`inline-flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[8px] sm:text-[10px] font-medium transition-all border ${
                      isSelected 
                        ? "bg-amber-600 text-white border-amber-600" 
                        : "bg-white text-gray-600 border-gray-200 hover:border-amber-300 hover:text-amber-700"
                    }`}
                  >
                    {isSelected && <Check size={8} className="sm:w-2.5 sm:h-2.5" />}
                    {name}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex gap-1.5 sm:gap-2">
            <input
              type="text"
              value={customPreferenceInput}
              onChange={(e) => setCustomPreferenceInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCustomPreference(); }}}
              placeholder="Add custom preference..."
              className="flex-1 border border-[#e5cfd4] rounded-lg px-2.5 sm:px-3 py-1.5 text-[10px] sm:text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 transition"
            />
            <Button variant="secondary" size="sm" onClick={addCustomPreference} type="button" className="text-[10px] sm:text-xs">Add</Button>
          </div>
        </div>

        {/* Summary */}
        <div className="bg-gray-50 rounded-xl p-3 sm:p-4 space-y-1.5 sm:space-y-2">
          <p className="text-[8px] sm:text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Room Summary</p>
          <div className="grid grid-cols-2 gap-1.5 sm:gap-2 text-[10px] sm:text-xs">
            <div><p className="text-gray-500">Name</p><p className="font-semibold">{newRoom.name || "—"}</p></div>
            <div><p className="text-gray-500">Building</p><p className="font-semibold">{newRoom.building || "—"}</p></div>
            <div><p className="text-gray-500">Type</p><p className="font-semibold">{newRoom.type}</p></div>
            <div><p className="text-gray-500">Capacity</p><p className="font-semibold">{newRoom.capacity}</p></div>
            <div><p className="text-gray-500">Price</p><p className="font-semibold text-emerald-700">{newRoom.price ? `₱${parseFloat(newRoom.price).toLocaleString()}/mo` : "—"}</p></div>
          </div>
          {inclusions.length > 0 && <div><p className="text-gray-500 text-[10px] sm:text-xs">Inclusions</p><p className="text-[10px] sm:text-xs">{inclusions.map(t => t.name).join(", ")}</p></div>}
          {preferences.length > 0 && <div><p className="text-gray-500 text-[10px] sm:text-xs">Preferences</p><p className="text-[10px] sm:text-xs">{preferences.map(t => t.name).join(", ")}</p></div>}
        </div>
      </div>
    </Modal>
  );
}