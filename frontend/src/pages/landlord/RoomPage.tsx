"use client";

import { useState, useMemo, useEffect } from "react";
import Sidebar from "../../components/Sidebar";
import HeroBanner from "../../components/dashboard/HeroBanner";
import Button from "../../components/Button";
import Card from "@/components/ui/Card";
import CustomHeader from '../../components/CustomHeader';
import Toast from "@/components/Toast";

import {
  Plus,
  Search,
  X,
  Building2,
  BedDouble,
  Clock,
  Users,
  LayoutGrid,
  List,
  ChevronDown,
  Tag,
  AlertTriangle,
  CheckCircle,
  Filter,
} from "lucide-react";
import RoomCard from "../../components/dashboard/landlord/rooms/RoomCard";
import AddRoomModal from "../../components/dashboard/landlord/rooms/AddRoomModal";
import DeleteRoomModal from "../../components/dashboard/landlord/rooms/DeleteRoomModal";
import ManageRoomModal from "../../components/dashboard/landlord/rooms/ManageRoomModal";
import BillingModal from "../../components/dashboard/landlord/rooms/BillingModal";
import Pagination from "../../components/dashboard/landlord/rooms/Pagination";
import { api } from "../../api/axios";
import { useUserStore } from "../../stores/useUserStore";

/* ================= TYPES ================= */
export interface Tenant {
  id: number;
  assignmentId: number;
  name: string;
  email?: string;
  phone?: string;
  degree?: string;
}

export interface RoomTag {
  name: string;
  type: "inclusion" | "preference";
}

export interface Room {
  id: number;
  name: string;
  building: string;
  type: "Single" | "Double" | "Shared";
  capacity: number;
  price: number;
  occupants: Tenant[];
  currentOccupancy: number;
  availability: "available" | "occupied" | "maintenance";
  tags: RoomTag[];
  stay_type: "transient" | "non_transient";
  tenant_restriction: "coed" | "non-coed";
}

export interface RoomIssue {
  id: number;
  roomId: number;
  roomName: string;
  building: string;
  reportedBy: string;
  reportedByRole: "student" | "manager";
  issueDetails: string;
  reportedAt: string;
}

/* ================= HELPERS ================= */
function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning";
  if (h < 18) return "Good Afternoon";
  return "Good Evening";
}

function capitalizeFirst(s: string): "Single" | "Double" | "Shared" {
  return (s.charAt(0).toUpperCase() + s.slice(1)) as "Single" | "Double" | "Shared";
}

function mapOccupant(a: any): Tenant | null {
  const student = a.student
  const user = student?.user
  if (!user) return null
  const fullName = [user.fname, user.mname, user.lname, user.suffix]
    .filter((p: string | null | undefined) => p && String(p).trim() !== "")
    .join(" ")
  const phones = user.phoneNumbers ?? []
  const primaryPhone = phones.find((p: any) => p.isPrimary) ?? phones[0]
  return {
    id: user.id,
    assignmentId: a.id,
    name: fullName || student.studentNumber,
    email: user.email,
    phone: primaryPhone?.contactNumber,
    degree: student.degreeProgram,
  }
}

function mapIssue(i: any): RoomIssue {
  const reporter = i.reporter ?? {};
  const reporterName = [reporter.fname, reporter.lname]
    .filter((p: string | null | undefined) => p && String(p).trim() !== "")
    .join(" ");
  const room = i.room ?? {};
  return {
    id: i.id,
    roomId: i.roomId ?? i.room_id ?? room.id,
    roomName: room.roomNumber ?? room.room_number ?? "",
    building: room.roomBuilding ?? room.room_building ?? "",
    reportedBy: reporterName || "Unknown",
    reportedByRole: (i.reporterRole ?? i.reporter_role) as "student" | "manager",
    issueDetails: i.issueDetails ?? i.issue_details ?? "",
    reportedAt: (i.createdAt ?? i.created_at ?? "").toString().slice(0, 10),
  };
}

function mapRoom(r: any): Room {
  return {
    id: r.id,
    name: r.roomNumber,
    building: r.roomBuilding,
    type: capitalizeFirst(r.roomType),
    capacity: r.roomCapacity,
    price: Number(r.roomRent),
    occupants: ((r.assignments ?? []).map(mapOccupant).filter(Boolean)) as Tenant[],
    currentOccupancy: r.roomCurrentOccupancy,
    availability: r.roomAvailability,
    tags: (r.tags ?? []).map((t: any) => ({ name: t.tagDetail, type: "inclusion" as const })),
    stay_type: r.roomStayType,
    tenant_restriction: r.tenantRestriction,
  };
}

export default function RoomsPage() {
  const { user } = useUserStore();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [reportedIssues, setReportedIssues] = useState<RoomIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAccomId, setSelectedAccomId] = useState<number | null>(null);

  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [modalType, setModalType] = useState<"add" | "delete" | "manage" | "billing" | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Toast state
  const [toast, setToast] = useState<{
    show: boolean;
    type: "success" | "error" | "info" | "warning" | "loading";
    title: string;
    message?: string;
  }>({ show: false, type: "success", title: "" });

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedStayType, setSelectedStayType] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Pagination
  const [itemsPerPage, setItemsPerPage] = useState<number>(8);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // ─── FETCH AND SET ACCOMMODATION ID ON MOUNT ───
  useEffect(() => {
    const storedId = sessionStorage.getItem("landlord-acc-id");
    if (storedId) {
      setSelectedAccomId(Number(storedId));
    } else {
      // If no stored ID, fetch accommodations and use the first one
      api.get("/landlord/accommodations")
        .then((res) => {
          const list = res.data ?? [];
          if (list.length > 0) {
            const id = list[0].id;
            setSelectedAccomId(id);
            sessionStorage.setItem("landlord-acc-id", String(id));
          }
        })
        .catch(() => {
          setToast({
            show: true,
            type: "error",
            title: "Failed to Load",
            message: "Could not load accommodations."
          });
        });
    }
  }, []);

  // ─── FETCH REPORTED ISSUES ON MOUNT ───
  useEffect(() => {
    api.get("/landlord/room-issues")
      .then((res) => {
        setReportedIssues((res.data ?? []).map(mapIssue));
      })
      .catch(() => {
        setToast({
          show: true,
          type: "error",
          title: "Failed to Load Issues",
          message: "Could not load reported issues."
        });
      });
  }, []);

  // ─── FETCH ROOMS WHEN ACCOMMODATION CHANGES ───
  useEffect(() => {
    if (!selectedAccomId) return;
    setLoading(true);
    api
      .get(`/accommodations/${selectedAccomId}/rooms`)
      .then((res) => setRooms((res.data ?? []).map(mapRoom)))
      .catch(() => {
        setToast({
          show: true,
          type: "error",
          title: "Failed to Load Rooms",
          message: "Could not load rooms for this accommodation."
        });
      })
      .finally(() => setLoading(false));
  }, [selectedAccomId]);

  // Filter rooms
  const filteredRooms = useMemo(() => {
    return rooms.filter(room => {
      if (searchQuery && !room.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !room.building.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      if (selectedType !== "all" && room.type !== selectedType) return false;
      if (selectedStayType !== "all" && room.stay_type !== selectedStayType) return false;
      if (selectedStatus === "available" && room.availability !== "available") return false;
      if (selectedStatus === "full" && room.availability === "available") return false;
      return true;
    });
  }, [rooms, searchQuery, selectedType, selectedStayType, selectedStatus]);

  // Pagination
  const totalPages = Math.ceil(filteredRooms.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedRooms = filteredRooms.slice(startIndex, startIndex + itemsPerPage);

  const hasActiveFilters = searchQuery !== "" || selectedType !== "all" ||
    selectedStayType !== "all" || selectedStatus !== "all";

  const handleFilterChange = (filter: string, value: string) => {
    switch(filter) {
      case "type": setSelectedType(value); break;
      case "stayType": setSelectedStayType(value); break;
      case "status": setSelectedStatus(value); break;
    }
    setCurrentPage(1);
  };

  const clearAllFilters = () => {
    setSearchQuery("");
    setSelectedType("all");
    setSelectedStayType("all");
    setSelectedStatus("all");
    setCurrentPage(1);
    setToast({
      show: true,
      type: "info",
      title: "Filters Cleared",
      message: "All filters have been reset."
    });
  };

  const dismissIssue = async (issueId: number) => {
    try {
      await api.patch(`/room-issues/${issueId}/resolve`);
      setReportedIssues(prev => prev.filter(issue => issue.id !== issueId));
      setToast({
        show: true,
        type: "success",
        title: "Issue Resolved",
        message: "The reported issue has been marked as resolved."
      });
    } catch {
      setToast({
        show: true,
        type: "error",
        title: "Failed to Resolve",
        message: "Could not resolve the issue. Please try again."
      });
    }
  };

  const openModal = (type: typeof modalType, room?: Room) => {
    setModalType(type);
    setSelectedRoom(room || null);
  };

  const closeModal = () => {
    setModalType(null);
    setSelectedRoom(null);
  };

  const addRoom = async (roomData: Omit<Room, "id" | "occupants" | "currentOccupancy" | "availability"> & { tags: RoomTag[] }) => {
    if (!selectedAccomId) return;
    setIsProcessing(true);
    setToast({ show: true, type: "loading", title: "Adding Room...", message: "Please wait." });
    
    try {
      const res = await api.post(`/accommodations/${selectedAccomId}/rooms`, {
        room_number: roomData.name,
        room_type: roomData.type.toLowerCase(),
        room_stay_type: roomData.stay_type,
        room_capacity: roomData.capacity,
        room_building: roomData.building,
        room_rent: roomData.price,
        tenant_restriction: roomData.tenant_restriction,
        tags: roomData.tags.map(t => t.name),
      });
      setRooms(prev => [...prev, mapRoom(res.data)]);
      closeModal();
      setToast({
        show: true,
        type: "success",
        title: "Room Added!",
        message: `${roomData.name} has been successfully created.`
      });
    } catch (error: any) {
      setToast({
        show: true,
        type: "error",
        title: "Failed to Add Room",
        message: error.response?.data?.message || "Could not create the room."
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const deleteRoom = async () => {
    if (!selectedRoom) return;
    setIsProcessing(true);
    setToast({ show: true, type: "loading", title: "Deleting Room...", message: "Please wait." });
    
    try {
      await api.delete(`/rooms/${selectedRoom.id}`);
      setRooms(prev => prev.filter(r => r.id !== selectedRoom.id));
      closeModal();
      setToast({
        show: true,
        type: "success",
        title: "Room Deleted",
        message: `${selectedRoom.name} has been permanently removed.`
      });
    } catch (error: any) {
      setToast({
        show: true,
        type: "error",
        title: "Failed to Delete Room",
        message: error.response?.data?.message || "Could not delete the room. Make sure it's empty."
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const reassignTenant = async (tenant: Tenant, _fromRoom: Room, toRoom: Room) => {
    if (!selectedAccomId) return;
    setIsProcessing(true);
    setToast({ show: true, type: "loading", title: "Reassigning Tenant...", message: "Please wait." });
    
    try {
      await api.patch(`/assignments/${tenant.assignmentId}/transfer`, { targetRoomId: toRoom.id });
      const res = await api.get(`/accommodations/${selectedAccomId}/rooms`);
      setRooms((res.data ?? []).map(mapRoom));
      closeModal();
      setToast({
        show: true,
        type: "success",
        title: "Tenant Reassigned",
        message: `${tenant.name} has been moved to Room ${toRoom.name}.`
      });
    } catch (error: any) {
      setToast({
        show: true,
        type: "error",
        title: "Failed to Reassign",
        message: error.response?.data?.message || "Could not reassign the tenant."
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const generateBilling = async (billingData: {
    tenantId: number | "all";
    month: string;
    year: string;
    amount: number;
    allowInstallments: boolean;
  }) => {
    if (!selectedRoom) return;
    setIsProcessing(true);
    setToast({ show: true, type: "loading", title: "Generating Bill...", message: "Please wait." });
    
    try {
      await api.post("/landlord/fees/bulk", {
        roomId: selectedRoom.id,
        tenantId: billingData.tenantId,
        month: parseInt(billingData.month, 10),
        year: parseInt(billingData.year, 10),
        amount: billingData.amount,
        allowInstallments: billingData.allowInstallments,
      });
      closeModal();
      setToast({
        show: true,
        type: "success",
        title: "Bill Generated!",
        message: `Billing statement has been sent to ${billingData.tenantId === "all" ? "all tenants" : "the tenant"}.`
      });
    } catch (error: any) {
      setToast({
        show: true,
        type: "error",
        title: "Failed to Generate Bill",
        message: error.response?.data?.message || "Could not generate the billing statement."
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#F6F2F4] font-sans">
      <div className="flex flex-col w-full">
        <CustomHeader title={"Manage Rooms"} />
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          <HeroBanner
            greeting={greeting()}
            name={user ? user.fname : ""}
            title="Accommodation Room Control"
            subtitle="Monitor occupancy, manage billing, and update room availability."
            type="mini"
          />

          {/* CONTROL BAR - Mobile Optimized */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search Bar */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                placeholder="Search rooms..." 
                className="w-full bg-white border border-gray-200 rounded-xl pl-11 pr-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-[#8C1535]/10 focus:border-[#8C1535]/20 transition-all outline-none shadow-sm"
              />
            </div>
            
            {/* Desktop Filters - No accommodation dropdown */}
            <div className="hidden sm:flex items-center gap-2">
              <select value={selectedType} onChange={(e) => handleFilterChange("type", e.target.value)}
                className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-bold text-gray-500 hover:border-[#8C1535]/30 transition-all outline-none shadow-sm">
                <option value="all">All Types</option>
                <option value="Single">Single</option>
                <option value="Double">Double</option>
                <option value="Shared">Shared</option>
              </select>
              <select value={selectedStayType} onChange={(e) => handleFilterChange("stayType", e.target.value)}
                className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-bold text-gray-500 hover:border-[#8C1535]/30 transition-all outline-none shadow-sm">
                <option value="all">All Stay Types</option>
                <option value="non_transient">Non-Transient</option>
                <option value="transient">Transient</option>
              </select>
              <select value={selectedStatus} onChange={(e) => handleFilterChange("status", e.target.value)}
                className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-bold text-gray-500 hover:border-[#8C1535]/30 transition-all outline-none shadow-sm">
                <option value="all">All Status</option>
                <option value="available">Available</option>
                <option value="full">Full</option>
              </select>
              {hasActiveFilters && (
                <button onClick={clearAllFilters}
                  className="text-xs font-bold text-[#8C1535] px-4 py-2.5 hover:bg-[#8C1535]/5 rounded-xl transition-all flex items-center gap-2">
                  <X size={14} /> Clear
                </button>
              )}
            </div>

            {/* Mobile Filter Button */}
            <div className="flex gap-2 sm:hidden">
              <button
                onClick={() => setShowMobileFilters(!showMobileFilters)}
                className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-bold text-gray-600 flex items-center justify-center gap-2"
              >
                <Filter size={14} />
                Filters {hasActiveFilters && `(${Object.values({selectedType, selectedStayType, selectedStatus}).filter(v => v !== "all").length + (searchQuery ? 1 : 0)})`}
              </button>
              <button onClick={() => openModal("add")}
                className="bg-[#8C1535] hover:bg-[#6B0F2B] text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-[#8C1535]/20 text-sm">
                <Plus size={18} /> <span className="hidden sm:inline">Add Room</span>
                <span className="sm:hidden">Add</span>
              </button>
            </div>

            {/* Desktop Add Button */}
            <button onClick={() => openModal("add")}
              className="hidden sm:flex bg-[#8C1535] hover:bg-[#6B0F2B] text-white px-6 py-2.5 rounded-xl font-bold items-center gap-2 transition-all shadow-lg shadow-[#8C1535]/20 text-sm">
              <Plus size={18} /> <span>Add Room</span>
            </button>
          </div>

          {/* Mobile Filter Panel - No accommodation dropdown */}
          {showMobileFilters && (
            <div className="sm:hidden bg-white rounded-xl border border-gray-200 p-4 space-y-3">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-gray-600">Room Type</label>
                <select value={selectedType} onChange={(e) => handleFilterChange("type", e.target.value)}
                  className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm w-full">
                  <option value="all">All Types</option>
                  <option value="Single">Single</option>
                  <option value="Double">Double</option>
                  <option value="Shared">Shared</option>
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-gray-600">Stay Type</label>
                <select value={selectedStayType} onChange={(e) => handleFilterChange("stayType", e.target.value)}
                  className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm w-full">
                  <option value="all">All Stay Types</option>
                  <option value="non_transient">Non-Transient</option>
                  <option value="transient">Transient</option>
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-gray-600">Status</label>
                <select value={selectedStatus} onChange={(e) => handleFilterChange("status", e.target.value)}
                  className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm w-full">
                  <option value="all">All Status</option>
                  <option value="available">Available</option>
                  <option value="full">Full</option>
                </select>
              </div>
              {hasActiveFilters && (
                <button onClick={() => { clearAllFilters(); setShowMobileFilters(false); }}
                  className="w-full text-xs font-bold text-[#8C1535] py-2 hover:bg-[#8C1535]/5 rounded-lg transition-all flex items-center justify-center gap-2">
                  <X size={14} /> Clear All Filters
                </button>
              )}
            </div>
          )}

          {/* REPORTED ISSUES */}
          {reportedIssues.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 sm:p-5">
              <div className="flex items-start sm:items-center gap-3 mb-4 flex-col sm:flex-row">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
                    <AlertTriangle size={18} className="text-red-500" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-800">Reported Room Issues</h3>
                    <p className="text-[10px] text-gray-400">{reportedIssues.length} issue{reportedIssues.length > 1 ? 's' : ''} reported</p>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                {reportedIssues.map((issue) => (
                  <div
                    key={issue.id}
                    className="p-3 rounded-lg border border-gray-100 hover:border-[#8C1535]/20 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1.5">
                          <h4 className="text-sm font-bold text-gray-800">{issue.roomName}</h4>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 font-medium">
                            {issue.building}
                          </span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                            issue.reportedByRole === "student"
                              ? "bg-blue-50 text-blue-600"
                              : "bg-purple-50 text-purple-600"
                          }`}>
                            by {issue.reportedByRole}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mb-1.5 break-words">{issue.issueDetails}</p>
                        <div className="flex flex-wrap items-center gap-2 text-[10px] text-gray-400">
                          <span>{issue.reportedBy}</span>
                          <span>•</span>
                          <span>{issue.reportedAt}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => dismissIssue(issue.id)}
                        className="flex items-center justify-center gap-1 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-lg text-[11px] font-bold transition-colors flex-shrink-0"
                      >
                        <CheckCircle size={13} />
                        Resolve
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ROOMS GRID - Responsive */}
          {loading ? (
            <div className="flex items-center justify-center py-20 text-gray-400 text-sm font-bold uppercase tracking-widest">Loading Inventory...</div>
          ) : filteredRooms.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
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
              
              {/* Pagination Controls - Responsive */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                  <span className="text-sm text-gray-500 font-medium text-center sm:text-left">
                    <strong className="text-gray-700">{startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredRooms.length)}</strong> of <strong>{filteredRooms.length}</strong> rooms
                  </span>
                  <select value={itemsPerPage} onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                    className="border border-gray-200 rounded-lg px-3 py-1.5 text-xs font-bold bg-white w-full sm:w-auto">
                    <option value={4}>Show 4</option>
                    <option value={8}>Show 8</option>
                    <option value={12}>Show 12</option>
                    <option value={16}>Show 16</option>
                  </select>
                </div>
                {totalPages > 1 && <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 sm:py-20 text-center px-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-2xl flex items-center justify-center mb-4 sm:mb-5">
                <Search size={28} className="text-gray-300 sm:size-8" />
              </div>
              <h3 className="text-base font-bold text-gray-600 mb-1.5">No rooms found</h3>
              <p className="text-sm text-gray-400 max-w-md mb-4">
                {hasActiveFilters ? "No rooms match your filters." : "Your accommodation doesn't have any rooms yet."}
              </p>
              {hasActiveFilters ? (
                <button onClick={clearAllFilters} className="text-sm font-bold text-[#8C1535] flex items-center gap-1.5">
                  <X size={15} /> Clear filters
                </button>
              ) : (
                <button onClick={() => openModal("add")}
                  className="bg-[#8C1535] text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2">
                  <Plus size={16} /> Add Your First Room
                </button>
              )}
            </div>
          )}
        </main>
      </div>

      <AddRoomModal open={modalType === "add"} onClose={closeModal} onAdd={addRoom} />
      <DeleteRoomModal open={modalType === "delete"} room={selectedRoom} onClose={closeModal} onConfirm={deleteRoom} />
      <ManageRoomModal open={modalType === "manage"} room={selectedRoom} rooms={rooms} onClose={closeModal} onReassign={reassignTenant} />
      <BillingModal open={modalType === "billing"} room={selectedRoom} onClose={closeModal} onGenerate={generateBilling} />

      {/* Toast Notifications */}
      <Toast
        type={toast.type}
        title={toast.title}
        message={toast.message}
        show={toast.show}
        onClose={() => setToast(prev => ({ ...prev, show: false }))}
      />
    </div>
  );
}