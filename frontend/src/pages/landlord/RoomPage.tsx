"use client";

import { useState, useMemo, useEffect } from "react";
import Sidebar from "../../components/Sidebar";
import HeroBanner from "../../components/dashboard/HeroBanner";
import Button from "../../components/Button";
import Card from "@/components/ui/Card";
import CustomHeader from '../../components/CustomHeader';

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
} from "lucide-react";
import RoomCard from "../../components/dashboard/landlord/rooms/RoomCard";
import AddRoomModal from "../../components/dashboard/landlord/rooms/AddRoomModal";
import DeleteRoomModal from "../../components/dashboard/landlord/rooms/DeleteRoomModal";
import ManageRoomModal from "../../components/dashboard/landlord/rooms/ManageRoomModal";
import BillingModal from "../../components/dashboard/landlord/rooms/BillingModal";
import Pagination from "../../components/dashboard/landlord/rooms/Pagination";
import { api } from "../../api/axios";

/* ================= TYPES ================= */
export interface Tenant {
  id: number;
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
    name: fullName || student.studentNumber,
    email: user.email,
    phone: primaryPhone?.contactNumber,
    degree: student.degreeProgram,
  }
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
  const [rooms, setRooms] = useState<Room[]>([]);
  const [reportedIssues, setReportedIssues] = useState<RoomIssue[]>([
    {
      id: 1,
      roomId: 1,
      roomName: "Sunrise Suite",
      building: "Main Hall",
      reportedBy: "Kayanne Reyes",
      reportedByRole: "student",
      issueDetails: "Air conditioning unit is not working properly. Room gets very warm in the afternoon.",
      reportedAt: "2025-04-28",
    },
    {
      id: 2,
      roomId: 3,
      roomName: "Cozy Nook",
      building: "West Wing",
      reportedBy: "Manager Name",
      reportedByRole: "manager",
      issueDetails: "Water leak from ceiling during heavy rain. Needs immediate attention.",
      reportedAt: "2025-04-27",
    },
  ]);
  const [loading, setLoading] = useState(true);
  const [accommodations, setAccommodations] = useState<{ id: number; accommodationName: string }[]>([]);
  const [selectedAccomId, setSelectedAccomId] = useState<number | null>(null);

  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [modalType, setModalType] = useState<"add" | "delete" | "manage" | "billing" | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBuilding, setSelectedBuilding] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedStayType, setSelectedStayType] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Pagination
  const [itemsPerPage, setItemsPerPage] = useState<number>(8);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // ─── FETCH ACCOMMODATIONS ON MOUNT ───
  useEffect(() => {
    api.get("/landlord/accommodations").then((res) => {
      const list = res.data ?? [];
      setAccommodations(list);
      if (list.length > 0) setSelectedAccomId(list[0].id);
    });
  }, []);

  // ─── FETCH ROOMS WHEN ACCOMMODATION CHANGES ───
  useEffect(() => {
    if (!selectedAccomId) return;
    setLoading(true);
    api
      .get(`/accommodations/${selectedAccomId}/rooms`)
      .then((res) => setRooms((res.data ?? []).map(mapRoom)))
      .finally(() => setLoading(false));
  }, [selectedAccomId]);

  // Extract unique buildings
  const buildings = useMemo(() => [...new Set(rooms.map(r => r.building))].sort(), [rooms]);

  // Filter rooms
  const filteredRooms = useMemo(() => {
    return rooms.filter(room => {
      if (searchQuery && !room.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !room.building.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      if (selectedBuilding !== "all" && room.building !== selectedBuilding) return false;
      if (selectedType !== "all" && room.type !== selectedType) return false;
      if (selectedStayType !== "all" && room.stay_type !== selectedStayType) return false;
      if (selectedStatus === "available" && room.availability !== "available") return false;
      if (selectedStatus === "full" && room.availability === "available") return false;
      return true;
    });
  }, [rooms, searchQuery, selectedBuilding, selectedType, selectedStayType, selectedStatus]);

  // Stats
  const stats = useMemo(() => ({
    total: filteredRooms.length,
    available: filteredRooms.filter(r => r.availability === "available").length,
    full: filteredRooms.filter(r => r.availability !== "available").length,
    totalTenants: filteredRooms.reduce((sum, r) => sum + r.currentOccupancy, 0),
  }), [filteredRooms]);

  // Pagination
  const totalPages = Math.ceil(filteredRooms.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedRooms = filteredRooms.slice(startIndex, startIndex + itemsPerPage);

  const hasActiveFilters = searchQuery !== "" || selectedBuilding !== "all" || selectedType !== "all" ||
    selectedStayType !== "all" || selectedStatus !== "all";

  // Reset page on filter change
  const handleFilterChange = (filter: string, value: string) => {
    switch(filter) {
      case "building": setSelectedBuilding(value); break;
      case "type": setSelectedType(value); break;
      case "stayType": setSelectedStayType(value); break;
      case "status": setSelectedStatus(value); break;
    }
    setCurrentPage(1);
  };

  const updateFilter = (setter: Function, value: any) => {
    setter(value);
    setCurrentPage(1);
  };

  const clearAllFilters = () => {
    setSearchQuery("");
    setSelectedBuilding("all");
    setSelectedType("all");
    setSelectedStayType("all");
    setSelectedStatus("all");
    setCurrentPage(1);
  };

  const dismissIssue = (issueId: number) => {
    setReportedIssues(prev => prev.filter(issue => issue.id !== issueId));
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
  };

  const deleteRoom = async () => {
    if (!selectedRoom) return;
    await api.delete(`/rooms/${selectedRoom.id}`);
    setRooms(prev => prev.filter(r => r.id !== selectedRoom.id));
    closeModal();
  };

  const reassignTenant = (tenant: Tenant, fromRoom: Room, toRoom: Room) => {
    setRooms(rooms.map(room => {
      if (room.id === fromRoom.id) return { ...room, occupants: room.occupants.filter(t => t.id !== tenant.id) };
      if (room.id === toRoom.id) return { ...room, occupants: [...room.occupants, tenant] };
      return room;
    }));
    closeModal();
  };

  const generateBilling = (billingData: {
    tenantId: number | "all";
    month: string;
    year: string;
    amount: number;
    allowInstallments: boolean;
  }) => {
    console.log("Billing data:", billingData);
    return Promise.resolve();
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#F5EEF0] font-sans">
      <Sidebar role="landlord" />
      <div className="flex flex-col w-full">
        <CustomHeader
            title={"Manage Rooms"}
            right = 
              {accommodations.length > 1 ? (
                <div className="relative">
                  <select
                    value={selectedAccomId ?? ""}
                    onChange={e => { setSelectedAccomId(Number(e.target.value)); setCurrentPage(1); }}
                    className="appearance-none text-xs sm:text-sm pl-3 pr-8 py-2 rounded-xl border border-gray-200 bg-white text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-[#8C1535]/10"
                  >
                    {accommodations.map(a => (
                      <option key={a.id} value={a.id}>{a.accommodationName}</option>
                    ))}
                  </select>
                  <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              ) : null } >
        </CustomHeader>
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <HeroBanner
              greeting="Good Day"
              name="Landlord"
              title="Check out your accommodation rooms"
              subtitle="Manage, update, and organize your available spaces."
              type="mini"
            />
            {/* Stats Overview Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <p className="text-[8px] md:text-[10px] truncate text-[#9A7080] font-bold">TOTAL ROOMS</p>
                <h2 className="text-[16px] sm:text-[18px] md:text-[22px] lg:text-[26px] font-bold truncate">{filteredRooms.length}</h2>
                <p className={`text-[10px] md:text-[12px] truncate ${hasActiveFilters ? "text-amber-500" : "text-green-600"}`}>
                  {hasActiveFilters ? `${rooms.length} total` : "All rooms"}
                </p>
              </Card>
              <Card>
                <p className="text-[8px] md:text-[10px] truncate text-[#9A7080] font-bold">AVAILABLE</p>
                <h2 className="text-[16px] sm:text-[18px] md:text-[22px] lg:text-[26px] font-bold truncate">{stats.available}</h2>
                <p className="text-[10px] md:text-[12px] truncate text-green-600">
                  {filteredRooms.length > 0 ? `${Math.round((stats.available / filteredRooms.length) * 100)}% of rooms` : "No rooms"}
                </p>
              </Card>
              <Card>
                <p className="text-[8px] md:text-[10px] truncate text-[#9A7080] font-bold">FULL</p>
                <h2 className="text-[16px] sm:text-[18px] md:text-[22px] lg:text-[26px] font-bold truncate">{stats.full}</h2>
                <p className="text-[10px] md:text-[12px] truncate text-orange-500">
                  {filteredRooms.length > 0 ? `${Math.round((stats.full / filteredRooms.length) * 100)}% of rooms` : "No rooms"}
                </p>
              </Card>
              <Card>
                <p className="text-[8px] md:text-[10px] truncate text-[#9A7080] font-bold">TENANTS</p>
                <h2 className="text-[16px] sm:text-[18px] md:text-[22px] lg:text-[26px] font-bold truncate">{stats.totalTenants}</h2>
                <p className={`text-[10px] md:text-[12px] truncate ${stats.totalTenants > 0 ? "text-green-600" : "text-[#9A7080]"}`}>
                  {stats.totalTenants > 0 ? "Active occupants" : "No occupants"}
                </p>
              </Card>
            </div>
            {/* Reported Issues Section - Only shows if there are issues */}
            {reportedIssues.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 sm:p-4">
                <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
                    <AlertTriangle size={16} className="sm:w-5 sm:h-5 text-red-500" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-gray-800">Reported Room Issues</h3>
                    <p className="text-[9px] sm:text-[10px] text-gray-400">{reportedIssues.length} issue{reportedIssues.length > 1 ? 's' : ''} reported</p>
                  </div>
                </div>
                <div className="space-y-2 sm:space-y-3">
                  {reportedIssues.map((issue) => (
                    <div
                      key={issue.id}
                      className="p-3 sm:p-4 rounded-xl border border-gray-100 hover:border-[#8C1535]/20 transition-colors"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1.5">
                            <h4 className="text-xs sm:text-sm font-bold text-gray-800">{issue.roomName}</h4>
                            <span className="text-[8px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 font-medium">
                              {issue.building}
                            </span>
                            <span className={`text-[8px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 rounded-full font-medium ${
                              issue.reportedByRole === "student"
                                ? "bg-blue-50 text-blue-600"
                                : "bg-purple-50 text-purple-600"
                            }`}>
                              Reported by {issue.reportedByRole}
                            </span>
                          </div>
                          <p className="text-[10px] sm:text-xs text-gray-500 mb-1.5 sm:mb-2">{issue.issueDetails}</p>
                          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[8px] sm:text-[10px] text-gray-400">
                            <span>{issue.reportedBy}</span>
                            <span className="hidden sm:inline">•</span>
                            <span>{issue.reportedAt}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => dismissIssue(issue.id)}
                          className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-xl text-[10px] sm:text-xs font-bold transition-colors flex-shrink-0 self-end sm:self-start"
                          title="Mark as resolved"
                        >
                          <CheckCircle size={12} className="sm:w-3.5 sm:h-3.5" />
                          <span className="hidden sm:inline">Resolve</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {/* Search & Filter Bar */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-2 sm:p-3">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
                <div className="relative flex-1">
                  <Search size={14} className="sm:w-4 sm:h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => updateFilter(setSearchQuery, e.target.value)}
                    placeholder="Search by room name or building..."
                    className="w-full pl-9 sm:pl-10 pr-8 sm:pr-10 py-2 sm:py-2.5 bg-gray-50 border-0 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#8C1535]/10 focus:bg-white transition-all"
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery("")} className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-200 rounded-full transition">
                      <X size={12} className="sm:w-3.5 sm:h-3.5 text-gray-400" />
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <div className="hidden sm:flex bg-gray-100 rounded-lg p-1">
                    <button onClick={() => setViewMode("grid")} className={`p-1.5 rounded-md transition-all ${viewMode === "grid" ? "bg-white shadow-sm text-[#8C1535]" : "text-gray-400 hover:text-gray-600"}`} title="Grid view">
                      <LayoutGrid size={15} />
                    </button>
                    <button onClick={() => setViewMode("list")} className={`p-1.5 rounded-md transition-all ${viewMode === "list" ? "bg-white shadow-sm text-[#8C1535]" : "text-gray-400 hover:text-gray-600"}`} title="List view">
                      <List size={15} />
                    </button>
                  </div>
                  {hasActiveFilters && (
                    <button onClick={clearAllFilters} className="flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs font-medium text-red-500 hover:text-red-600 bg-red-50 hover:bg-red-100 px-2 sm:px-3 py-1.5 sm:py-2 rounded-xl transition-all">
                      <X size={12} className="sm:w-3.5 sm:h-3.5" />
                      <span className="hidden sm:inline">Clear</span>
                    </button>
                  )}
                  <Button onClick={() => openModal("add")} size="sm" className="text-xs sm:text-sm">
                    <Plus size={14} className="sm:w-4 sm:h-4" /> <span className="hidden sm:inline ml-1">Add Room</span>
                  </Button>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-gray-100">
                <div className="relative">
                  <select value={selectedBuilding} onChange={(e) => handleFilterChange("building", e.target.value)} className="appearance-none text-[10px] sm:text-xs pl-7 sm:pl-8 pr-7 sm:pr-8 py-1.5 sm:py-2 rounded-xl border font-medium cursor-pointer transition-all bg-gray-50 border-gray-200 text-gray-600 hover:border-[#8C1535]/30 focus:outline-none focus:ring-2 focus:ring-[#8C1535]/10 min-w-[110px] sm:min-w-[130px]">
                    <option value="all">All Buildings</option>
                    {buildings.map(building => (<option key={building} value={building}>{building}</option>))}
                  </select>
                  <Building2 size={12} className="sm:w-3.5 sm:h-3.5 absolute left-2 sm:left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <ChevronDown size={10} className="sm:w-3 sm:h-3 absolute right-2 sm:right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
                <div className="relative">
                  <select value={selectedType} onChange={(e) => handleFilterChange("type", e.target.value)} className="appearance-none text-[10px] sm:text-xs pl-7 sm:pl-8 pr-7 sm:pr-8 py-1.5 sm:py-2 rounded-xl border font-medium cursor-pointer transition-all bg-gray-50 border-gray-200 text-gray-600 hover:border-[#8C1535]/30 focus:outline-none focus:ring-2 focus:ring-[#8C1535]/10 min-w-[95px] sm:min-w-[110px]">
                    <option value="all">All Types</option>
                    <option value="Single">Single</option>
                    <option value="Double">Double</option>
                    <option value="Shared">Shared</option>
                  </select>
                  <BedDouble size={12} className="sm:w-3.5 sm:h-3.5 absolute left-2 sm:left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <ChevronDown size={10} className="sm:w-3 sm:h-3 absolute right-2 sm:right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
                <div className="relative">
                  <select value={selectedStayType} onChange={(e) => handleFilterChange("stayType", e.target.value)} className="appearance-none text-[10px] sm:text-xs pl-7 sm:pl-8 pr-7 sm:pr-8 py-1.5 sm:py-2 rounded-xl border font-medium cursor-pointer transition-all bg-gray-50 border-gray-200 text-gray-600 hover:border-[#8C1535]/30 focus:outline-none focus:ring-2 focus:ring-[#8C1535]/10 min-w-[110px] sm:min-w-[130px]">
                    <option value="all">All Stay Types</option>
                    <option value="non_transient">Non-Transient</option>
                    <option value="transient">Transient</option>
                  </select>
                  <Clock size={12} className="sm:w-3.5 sm:h-3.5 absolute left-2 sm:left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <ChevronDown size={10} className="sm:w-3 sm:h-3 absolute right-2 sm:right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
                <div className="relative">
                  <select value={selectedStatus} onChange={(e) => handleFilterChange("status", e.target.value)} className="appearance-none text-[10px] sm:text-xs pl-7 sm:pl-8 pr-7 sm:pr-8 py-1.5 sm:py-2 rounded-xl border font-medium cursor-pointer transition-all bg-gray-50 border-gray-200 text-gray-600 hover:border-[#8C1535]/30 focus:outline-none focus:ring-2 focus:ring-[#8C1535]/10 min-w-[95px] sm:min-w-[110px]">
                    <option value="all">All Status</option>
                    <option value="available">Available</option>
                    <option value="full">Full</option>
                  </select>
                  <Tag size={12} className="sm:w-3.5 sm:h-3.5 absolute left-2 sm:left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <ChevronDown size={10} className="sm:w-3 sm:h-3 absolute right-2 sm:right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>
              {hasActiveFilters && (
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-gray-100">
                  <span className="text-[8px] sm:text-[10px] text-gray-400 font-medium">Active:</span>
                  <div className="flex flex-wrap gap-1 sm:gap-1.5">
                    {selectedBuilding !== "all" && (
                      <span className="inline-flex items-center gap-0.5 sm:gap-1 text-[8px] sm:text-[10px] px-2 sm:px-2.5 py-0.5 sm:py-1 bg-[#8C1535]/5 text-[#8C1535] rounded-lg font-medium border border-[#8C1535]/10">
                        <Building2 size={9} className="sm:w-2.5 sm:h-2.5" />{selectedBuilding}
                        <button onClick={() => handleFilterChange("building", "all")} className="ml-0.5 hover:text-red-500"><X size={9} className="sm:w-2.5 sm:h-2.5" /></button>
                      </span>
                    )}
                    {selectedType !== "all" && (
                      <span className="inline-flex items-center gap-0.5 sm:gap-1 text-[8px] sm:text-[10px] px-2 sm:px-2.5 py-0.5 sm:py-1 bg-[#8C1535]/5 text-[#8C1535] rounded-lg font-medium border border-[#8C1535]/10">
                        <BedDouble size={9} className="sm:w-2.5 sm:h-2.5" />{selectedType}
                        <button onClick={() => handleFilterChange("type", "all")} className="ml-0.5 hover:text-red-500"><X size={9} className="sm:w-2.5 sm:h-2.5" /></button>
                      </span>
                    )}
                    {selectedStayType !== "all" && (
                      <span className="inline-flex items-center gap-0.5 sm:gap-1 text-[8px] sm:text-[10px] px-2 sm:px-2.5 py-0.5 sm:py-1 bg-[#8C1535]/5 text-[#8C1535] rounded-lg font-medium border border-[#8C1535]/10">
                        <Clock size={9} className="sm:w-2.5 sm:h-2.5" />{selectedStayType === "non_transient" ? "Non-Transient" : "Transient"}
                        <button onClick={() => handleFilterChange("stayType", "all")} className="ml-0.5 hover:text-red-500"><X size={9} className="sm:w-2.5 sm:h-2.5" /></button>
                      </span>
                    )}
                    {selectedStatus !== "all" && (
                      <span className="inline-flex items-center gap-0.5 sm:gap-1 text-[8px] sm:text-[10px] px-2 sm:px-2.5 py-0.5 sm:py-1 bg-[#8C1535]/5 text-[#8C1535] rounded-lg font-medium border border-[#8C1535]/10">
                        <div className={`w-1.5 h-1.5 rounded-full ${selectedStatus === "available" ? "bg-emerald-500" : "bg-red-500"}`} />{selectedStatus}
                        <button onClick={() => handleFilterChange("status", "all")} className="ml-0.5 hover:text-red-500"><X size={9} className="sm:w-2.5 sm:h-2.5" /></button>
                      </span>
                    )}
                    {searchQuery && (
                      <span className="inline-flex items-center gap-0.5 sm:gap-1 text-[8px] sm:text-[10px] px-2 sm:px-2.5 py-0.5 sm:py-1 bg-amber-50 text-amber-700 rounded-lg font-medium border border-amber-100">
                        <Search size={9} className="sm:w-2.5 sm:h-2.5" />"{searchQuery}"
                        <button onClick={() => setSearchQuery("")} className="ml-0.5 hover:text-red-500"><X size={9} className="sm:w-2.5 sm:h-2.5" /></button>
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
            {/* Rooms Grid / Loading / Empty State */}
            {loading ? (
              <div className="flex items-center justify-center py-20 text-gray-400 text-sm">Loading rooms…</div>
            ) : filteredRooms.length > 0 ? (
              <>
                <div className={`grid gap-3 sm:gap-4 ${
                  viewMode === "grid"
                    ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                    : "grid-cols-1"
                }`}>
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
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mt-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
                    <span className="text-xs sm:text-sm text-[#7A4E5D]">
                      Showing <strong className="text-[#8C1535]">{startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredRooms.length)}</strong> of <strong>{filteredRooms.length}</strong>
                    </span>
                    <div className="flex items-center gap-2">
                      <label className="text-[10px] sm:text-xs text-[#7A4E5D]">Show:</label>
                      <select
                        value={itemsPerPage}
                        onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                        className="border border-[#F2D9DF] rounded-lg px-2 py-1 text-xs sm:text-sm bg-white focus:outline-none focus:ring-1 focus:ring-[#8C1535]"
                      >
                        <option value={4}>4</option>
                        <option value={8}>8</option>
                        <option value={12}>12</option>
                        <option value={16}>16</option>
                      </select>
                    </div>
                  </div>
                  {totalPages > 1 && (
                    <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                  )}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 sm:py-20 text-center px-4">
                <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gray-100 rounded-3xl flex items-center justify-center mb-4 sm:mb-6 rotate-3">
                  <Search size={28} className="sm:w-10 sm:h-10 text-gray-300 -rotate-3" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-600 mb-1 sm:mb-2">No rooms found</h3>
                <p className="text-xs sm:text-sm text-gray-400 max-w-md">
                  {hasActiveFilters
                    ? "No rooms match your current filters. Try adjusting your search criteria."
                    : "Your accommodation doesn't have any rooms yet. Add your first room to get started!"}
                </p>
                {hasActiveFilters ? (
                  <button onClick={clearAllFilters} className="mt-3 sm:mt-4 text-xs sm:text-sm font-medium text-[#8C1535] hover:text-[#6B0F2B] flex items-center gap-1.5">
                    <X size={14} /> Clear all filters
                  </button>
                ) : (
                  <Button onClick={() => openModal("add")} size="sm" className="mt-3 sm:mt-4 text-xs sm:text-sm">
                    <Plus size={14} className="sm:w-4 sm:h-4" /> Add Your First Room
                  </Button>
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Modals */}
      <AddRoomModal open={modalType === "add"} onClose={closeModal} onAdd={addRoom} />
      <DeleteRoomModal open={modalType === "delete"} room={selectedRoom} onClose={closeModal} onConfirm={deleteRoom} />
      <ManageRoomModal open={modalType === "manage"} room={selectedRoom} rooms={rooms} onClose={closeModal} onReassign={reassignTenant} />
      <BillingModal open={modalType === "billing"} room={selectedRoom} onClose={closeModal} onGenerate={generateBilling} />
    </div>
  );
}
