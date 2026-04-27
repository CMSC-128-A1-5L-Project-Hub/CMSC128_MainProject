"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import HeroBanner from "../../components/dashboard/HeroBanner";
import Button from "../../components/Button";
import { Plus } from "lucide-react";
import RoomCard from "../../components/dashboard/landlord/rooms/RoomCard";
import AddRoomModal from "../../components/dashboard/landlord/rooms/AddRoomModal";
import DeleteRoomModal from "../../components/dashboard/landlord/rooms/DeleteRoomModal";
import ManageRoomModal from "../../components/dashboard/landlord/rooms/ManageRoomModal";
import BillingModal from "../../components/dashboard/landlord/rooms/BillingModal";
import Pagination from "../../components/dashboard/landlord/rooms/Pagination";

/* ================= TYPES ================= */
export interface Tenant {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  degree?: string;
}

export interface Room {
  id: number;
  name: string;
  building: string;
  type: "Single" | "Double" | "Shared";
  capacity: number;
  price: number;
  occupants: Tenant[];
  tags: string[];
  stay_type: "transient" | "non_transient";
  tenant_restriction: "coed" | "non-coed";
}

export type InstallmentPlan = "full" | "monthly" | "semestral";

export default function RoomsPage() {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState<Room[]>([
    {
      id: 1,
      name: "Sunrise Suite",
      building: "Main Hall",
      type: "Double",
      capacity: 2,
      price: 3500,
      occupants: [
        { id: 1, name: "Kayanne Reyes", email: "kayanne@example.com", phone: "09123456789", degree: "Computer Science" },
        { id: 2, name: "Mark Rivera", email: "mark@example.com", phone: "09234567890", degree: "Business Admin" },
      ],
      tags: ["WiFi", "Aircon", "Study Desk"],
      stay_type: "non_transient",
      tenant_restriction: "coed",
    },
    {
      id: 2,
      name: "Garden View",
      building: "East Wing",
      type: "Shared",
      capacity: 4,
      price: 5200,
      occupants: [],
      tags: ["WiFi", "Shared Kitchen"],
      stay_type: "transient",
      tenant_restriction: "non-coed",
    },
    {
      id: 3,
      name: "Cozy Nook",
      building: "West Wing",
      type: "Single",
      capacity: 1,
      price: 2800,
      occupants: [],
      tags: ["Quiet", "Window View"],
      stay_type: "non_transient",
      tenant_restriction: "coed",
    },
  ]);

  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [modalType, setModalType] = useState<"add" | "delete" | "manage" | "billing" | null>(null);

  const [itemsPerPage, setItemsPerPage] = useState<number>(5);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Pagination logic
  const totalRooms = rooms.length;
  const totalPages = Math.ceil(totalRooms / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedRooms = rooms.slice(startIndex, startIndex + itemsPerPage);

  const resetPagination = () => setCurrentPage(1);
  const handleItemsPerPageChange = (newLimit: number) => {
    setItemsPerPage(newLimit);
    setCurrentPage(1);
  };
  const handleRoomsChange = () => resetPagination();

  const openModal = (type: typeof modalType, room?: Room) => {
    setModalType(type);
    setSelectedRoom(room || null);
  };

  const closeModal = () => {
    setModalType(null);
    setSelectedRoom(null);
  };

  // Room CRUD operations (replace with API calls)
  const addRoom = (roomData: Omit<Room, "id" | "occupants"> & { tags: string[] }) => {
    const newId = Math.max(0, ...rooms.map(r => r.id)) + 1;
    const newRoom: Room = {
      id: newId,
      ...roomData,
      occupants: [],
    };
    setRooms([...rooms, newRoom]);
    handleRoomsChange();
    closeModal();
  };

  const deleteRoom = () => {
    if (selectedRoom) {
      setRooms(rooms.filter(r => r.id !== selectedRoom.id));
      handleRoomsChange();
      closeModal();
    }
  };

  const reassignTenant = (tenant: Tenant, fromRoom: Room, toRoom: Room) => {
    const updatedRooms = rooms.map(room => {
      if (room.id === fromRoom.id) {
        return { ...room, occupants: room.occupants.filter(t => t.id !== tenant.id) };
      }
      if (room.id === toRoom.id) {
        return { ...room, occupants: [...room.occupants, tenant] };
      }
      return room;
    });
    setRooms(updatedRooms);
    closeModal();
  };

  const generateBilling = (billingData: {
    tenantId: number | "all";
    month: string;
    year: string;
    amount: number;
    installmentPlan: InstallmentPlan;
  }) => {
    // Replace with actual API call
    console.log("Billing data:", billingData);
    return Promise.resolve();
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#F5EEF0] font-sans">
      <Sidebar role="landlordDashboard" />
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="flex-1 overflow-y-auto px-8 sm:px-6 lg:px-8 py-5 space-y-5">
          {/* Header */}
          <div className="pl-16 lg:pl-0 flex items-center gap-3 mb-2">
            <div
              className="hidden lg:inline w-2 h-8 rounded-xl mt-1"
              style={{ background: "linear-gradient(to bottom right, #6B0F2B 0%, #9E2040 100%)" }}
            />
            <h1 className="text-4xl font-serif italic font-bold text-[#6B0F2B]">Manage Rooms</h1>
          </div>

          

          <HeroBanner
            greeting="Good Day"
            name="Landlord"
            title="Check out your accommodation rooms"
            subtitle="Manage, update, and organize your available spaces."
            type="mini"
          />

          {/* Action bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <p className="text-sm text-[#7A4E5D]">
                Total Rooms: <span className="font-semibold text-[#6B0F2B]">{rooms.length}</span>
              </p>
              <div className="flex items-center gap-2">
                <label className="text-xs text-[#7A4E5D]">Show:</label>
                <select
                  value={itemsPerPage}
                  onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                  className="border border-[#F2D9DF] rounded-lg px-2 py-1 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-[#8C1535]"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={15}>15</option>
                  <option value={20}>20</option>
                </select>
              </div>
            </div>
            <Button onClick={() => openModal("add")} size="sm">
              <Plus size={16} /> Add Room
            </Button>
          </div>

          {/* Rooms grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {paginatedRooms.map((room) => (
              <RoomCard
                key={room.id}
                room={room}
                onManage={() => openModal("manage", room)}
                onBilling={() => openModal("billing", room)}
                onDelete={() => openModal("delete", room)}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}

          {/* Modals */}
          <AddRoomModal
            open={modalType === "add"}
            onClose={closeModal}
            onAdd={addRoom}
          />
          <DeleteRoomModal
            open={modalType === "delete"}
            room={selectedRoom}
            onClose={closeModal}
            onConfirm={deleteRoom}
          />
          <ManageRoomModal
            open={modalType === "manage"}
            room={selectedRoom}
            rooms={rooms}
            onClose={closeModal}
            onReassign={reassignTenant}
          />
          <BillingModal
            open={modalType === "billing"}
            room={selectedRoom}
            onClose={closeModal}
            onGenerate={generateBilling}
          />
        </div>
      </main>
    </div>
  );
}