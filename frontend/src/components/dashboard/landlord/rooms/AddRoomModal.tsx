import { useState, useEffect } from "react";
import Modal from "../../../Modal";
import Button from "../../../Button";
import { Tag } from "lucide-react";
import type { Room } from "../../../../pages/landlord/RoomPage";

interface AddRoomModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (room: Omit<Room, "id" | "occupants"> & { tags: string[] }) => void;
}

export default function AddRoomModal({ open, onClose, onAdd }: AddRoomModalProps) {
  const [newRoom, setNewRoom] = useState({
    name: "",
    building: "",
    type: "Double" as Room["type"],
    capacity: 2,
    price: "" as string,
    tagInput: "",
    tags: [] as string[],
  });
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
        tagInput: "",
        tags: [],
      });
      setCapacityInput("2");
      setErrors({});
    }
  }, [open]);

  const addTag = () => {
    const trimmed = newRoom.tagInput.trim();
    if (trimmed && !newRoom.tags.includes(trimmed)) {
      setNewRoom(prev => ({ ...prev, tags: [...prev.tags, trimmed], tagInput: "" }));
    }
  };

  const removeTag = (tagToRemove: string) => {
    setNewRoom(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tagToRemove) }));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag();
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

    setNewRoom(prev => ({
      ...prev,
      capacity: num,
      type: newType,
    }));
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
    else if (type === "Shared") {
      if (newCapacity <= 2) newCapacity = 3;
    }
    setNewRoom(prev => ({
      ...prev,
      type,
      capacity: newCapacity,
    }));
    setCapacityInput(newCapacity.toString());
    if (errors.capacity) setErrors(prev => ({ ...prev, capacity: "" }));
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!newRoom.name.trim()) errs.name = "Room name is required";
    if (!newRoom.building.trim()) errs.building = "Building is required";
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
    onAdd({
      name: newRoom.name.trim(),
      building: newRoom.building.trim(),
      type: newRoom.type,
      capacity: newRoom.capacity,
      price: parseFloat(newRoom.price),
      tags: newRoom.tags,
    });
  };

  if (!open) return null;

  return (
    <Modal open={open} onClose={onClose} title="Add New Room">
      <div className="space-y-5">
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-semibold tracking-wide text-[#7a001f]">ROOM NAME</label>
          <input type="text" value={newRoom.name} onChange={(e) => setNewRoom({ ...newRoom, name: e.target.value })} className={`border rounded-xl p-3 text-sm w-full focus:outline-none focus:ring-2 focus:ring-[#7a001f]/30 ${errors.name ? "border-red-500" : "border-[#e5cfd4]"}`} placeholder="e.g., Executive Suite" />
          {errors.name && <p className="text-red-500 text-xs">{errors.name}</p>}
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-semibold tracking-wide text-[#7a001f]">BUILDING</label>
          <input type="text" value={newRoom.building} onChange={(e) => setNewRoom({ ...newRoom, building: e.target.value })} className={`border rounded-xl p-3 text-sm w-full focus:outline-none focus:ring-2 focus:ring-[#7a001f]/30 ${errors.building ? "border-red-500" : "border-[#e5cfd4]"}`} placeholder="e.g., North Tower" />
          {errors.building && <p className="text-red-500 text-xs">{errors.building}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-semibold tracking-wide text-[#7a001f]">ROOM TYPE</label>
            <select value={newRoom.type} onChange={(e) => handleTypeChange(e.target.value as Room["type"])} className={`border rounded-xl p-3 text-sm w-full focus:outline-none focus:ring-2 focus:ring-[#7a001f]/30 ${errors.type ? "border-red-500" : "border-[#e5cfd4]"}`}>
              <option value="Single">Single</option>
              <option value="Double">Double</option>
              <option value="Shared">Shared</option>
            </select>
            {errors.type && <p className="text-red-500 text-xs">{errors.type}</p>}
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-semibold tracking-wide text-[#7a001f]">CAPACITY {newRoom.type !== "Shared" ? "(fixed)" : "(min 3)"}</label>
            <input type="text" value={capacityInput} onChange={handleCapacityInputChange} onBlur={applyCapacityUpdate} onKeyDown={handleCapacityKeyDown} disabled={newRoom.type !== "Shared"} className={`border rounded-xl p-3 text-sm w-full focus:outline-none focus:ring-2 focus:ring-[#7a001f]/30 ${errors.capacity ? "border-red-500" : "border-[#e5cfd4]"} ${newRoom.type !== "Shared" ? "bg-gray-100 cursor-not-allowed" : ""}`} />
            {errors.capacity && <p className="text-red-500 text-xs">{errors.capacity}</p>}
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-semibold tracking-wide text-[#7a001f]">PRICE (₱)</label>
          <input type="number" value={newRoom.price} onChange={(e) => setNewRoom({ ...newRoom, price: e.target.value })} className={`border rounded-xl p-3 text-sm w-full focus:outline-none focus:ring-2 focus:ring-[#7a001f]/30 ${errors.price ? "border-red-500" : "border-[#e5cfd4]"}`} placeholder="0" />
          {errors.price && <p className="text-red-500 text-xs">{errors.price}</p>}
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-semibold tracking-wide text-[#7a001f]">ROOM TAGS</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {newRoom.tags.map((tag) => (
              <span key={tag} className="inline-flex items-center gap-2 pl-3 pr-1.5 py-2 bg-[#6B0F2B] text-white rounded-full text-xs font-bold">
                <Tag size={12} />
                {tag}
                <button type="button" onClick={() => removeTag(tag)} className="w-5 h-5 flex items-center justify-center transition shrink-0">✕</button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input type="text" value={newRoom.tagInput} onChange={(e) => setNewRoom({ ...newRoom, tagInput: e.target.value })} onKeyDown={handleTagKeyDown} placeholder="Type tag and press Enter or comma" className="flex-1 border border-[#e5cfd4] rounded-xl p-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7a001f]/30" />
            <Button variant="secondary" size="sm" onClick={addTag} type="button">Add</Button>
          </div>
          <p className="text-[10px] text-gray-400 mt-1">Press Enter or comma to add a tag</p>
        </div>

        <Button className="w-full py-2.5 mt-2" onClick={handleSubmit}>Create Room</Button>
      </div>
    </Modal>
  );
}