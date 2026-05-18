import { useState, useMemo, useEffect } from "react"
import { api } from "../../api/axios";
import CustomHeader from '../../components/CustomHeader';
import Dropdown from "../../components/ApplicationStatus/Dropdown";
import SearchBar from '../../components/SearchBar';
import Toast from "@/components/Toast";
import Button from "../../components/Button";
import Modal from "../../components/Modal";

import HeroBanner from "../../components/dashboard/HeroBanner"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DateTime } from 'luxon'
import { AlertCircle, CheckCircle, XCircle, FileText, Eye } from "lucide-react";
import Pagination from "@/components/ApplicationStatus/Pagination";

const CLR = {
  dark: "#3D0718",
  mid: "#6B0F2B",
  accent: "#8C1535",
  gold: "#C9973A",
} as const;

interface User {
  id: number;
  accountStatus: string | null;
  email: string;
  facebookAccount: string | null;
  fname: string;
  mname: string | null;
  lname: string;
  suffix: string | null;
  role: string;
  otpCode: string | null;
  otpExpiresAt: string | null;
  pfpFileId: number | null;
}

interface Student {
  studentNumber: string;
  userId: number;
  phone: number;
  college: string;
  degreeProgram: string;
  gender: string;
  yearLevel: string | null;
  emergencyContactName: string | null;
  emergencyContactNumber: string | null;
  enrollmentProofFileId: number;
  form5Renewal: boolean | null;
  user: User;
}

interface Accommodation {
  id: number;
  landlordId: number;
  managerId: number | null;
  accommodationName: string;
  accommodationType: string;
  accommodationLocation: string;
  latitude: string | null;
  longitude: string | null;
  accommodationCapacity: number;
  status: string | null;
  tenantRestriction: string;
  businessPermitId: number;
  primaryImageIndex: number | null;
  applicationStartDate: string | null;
  applicationEndDate: string | null;
  walkingDistance: number | null;
  bikingDistance: number | null;
  drivingDistance: number | null;
  invitedManagerEmail: string | null;
}

export interface Room {
  id: number
  accommodationId: number
  roomNumber: string
  roomType: string
  roomStayType: string
  roomCapacity: number
  roomCurrentOccupancy: number
  roomBuilding: string
  roomRent: string
  tenantRestriction: string
  roomAvailability: string
  accommodation: Accommodation
}

export interface AssignmentResponse {
  id: number
  studentNumber: string
  roomId: number
  confirmedDate: string
  moveIn: DateTime | string
  expectedMoveOut: DateTime | string
  actualMoveOut: DateTime | string | null
  gracePeriodDays: number
  student: Student
  room: Room 
}

interface EarlyMoveOutRequest {
  id: number;
  assignmentId: number;
  studentName: string;
  studentNumber: string;
  roomNumber: string;
  roomBuilding: string;
  accommodationName: string;
  currentMoveOutDate: string;
  requestedMoveOutDate: string;
  reason: string;
  requestedAt: string;
  status: 'pending' | 'approved' | 'rejected';
}

const diffFromNow = (isoDate: string | DateTime | undefined | null): number => {
  if (!isoDate) return 0
  const target = typeof isoDate === 'string' ? DateTime.fromISO(isoDate) : isoDate
  const now = DateTime.now()
  const { days } = now.diff(target, 'days').toObject()
  return Math.trunc(days ?? 0)
}

type FilterType = "all" | "move-in" | "move-out" | "requests"

const getInitial = (name: string): string => name[0].toUpperCase()

export default function MoveinMoveout() {
    const queryClient = useQueryClient();
    const [selectedRequest, setSelectedRequest] = useState<EarlyMoveOutRequest | null>(null);
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [responseAction, setResponseAction] = useState<'approve' | 'reject' | null>(null);
    const [responseRemark, setResponseRemark] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5);
    const [search, setSearch] = useState("");
    const [sortBy, setSortBy] = useState<string>("Date");
    const [filter, setFilter] = useState<FilterType>("all");
    const [tableCurrentPage, setTableCurrentPage] = useState(1);
    const [tableItemsPerPage, setTableItemsPerPage] = useState(5);
    const [tableSearch, setTableSearch] = useState("");
    const [tableSortBy, setTableSortBy] = useState<string>("Date");
    
    const {
        data: user,
        isLoading: isLoadingUser,
        isError: isErrorUser,
    } = useQuery({
        queryKey: ["me"],
        queryFn: async () => {
            const res = await api.get("/me");
            return res.data;
        },
    });

    const {
        data: assignments = [],
        isLoading: isLoadingList,
        isError: isErrorList,
        refetch: refetchAssignments,
    } = useQuery<AssignmentResponse[]>({
        queryKey: ["moveInMoveOutlist"],
        queryFn: async () => {
            const res = await api.get("/view-assignments");
            return res.data;
        },
        placeholderData: (prev) => prev,
    });

    const {
        data: moveOutRequests = [],
        isLoading: isLoadingRequests,
        refetch: refetchRequests,
    } = useQuery<EarlyMoveOutRequest[]>({
        queryKey: ["early-moveout-requests"],
        queryFn: async () => {
            const res = await api.get("/assignments/early-moveout-requests");
            return res.data;
        },
    });

    const [toast, setToast] = useState<{
        show: boolean;
        type: "success" | "error" | "info" | "warning" | "loading";
        title: string;
        message?: string;
    }>({ show: false, type: "success", title: "" });

    const respondToRequest = useMutation({
        mutationFn: async ({ requestId, action, remark }: { requestId: number; action: 'approve' | 'reject'; remark?: string }) => {
            const res = await api.patch(`/assignments/early-moveout-requests/${requestId}/respond`, {
                action,
                remark,
            });
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["early-moveout-requests"] });
            queryClient.invalidateQueries({ queryKey: ["moveInMoveOutlist"] });
            setViewModalOpen(false);
            setSelectedRequest(null);
            setResponseAction(null);
            setResponseRemark("");
            setToast({
                show: true,
                type: "success",
                title: "Request Processed",
                message: "The early move-out request has been processed successfully."
            });
        },
        onError: (error: any) => {
            setToast({
                show: true,
                type: "error",
                title: "Action Failed",
                message: error.response?.data?.message || "Could not process the request."
            });
        },
    });

    useEffect(() => {
        if (isErrorList) {
            setToast({ show: true, type: "error", title: "Failed to load data", message: "Could not fetch move-in/move-out records." });
        }
    }, [isErrorList]);

    const handleOpenViewModal = (request: EarlyMoveOutRequest) => {
        setSelectedRequest(request);
        setResponseAction(null);
        setResponseRemark("");
        setViewModalOpen(true);
    };

    const handleApprove = () => {
        if (selectedRequest) {
            setResponseAction('approve');
        }
    };

    const handleReject = () => {
        if (selectedRequest) {
            setResponseAction('reject');
        }
    };

    const handleConfirmResponse = () => {
        if (selectedRequest && responseAction) {
            respondToRequest.mutate({
                requestId: selectedRequest.id,
                action: responseAction,
                remark: responseRemark || undefined,
            });
        }
    };

    const handleCloseActionModal = () => {
        setResponseAction(null);
        setResponseRemark("");
    };

    const filteredRequests = useMemo(() => {
        const q = search.toLowerCase();
        return (moveOutRequests || []).filter((req: EarlyMoveOutRequest) => {
            const matchesSearch = 
                req.studentName.toLowerCase().includes(q) ||
                req.studentNumber.toLowerCase().includes(q) ||
                req.roomNumber.toLowerCase().includes(q) ||
                req.roomBuilding.toLowerCase().includes(q);
            return matchesSearch;
        }).sort((a: EarlyMoveOutRequest, b: EarlyMoveOutRequest) => {
            if (sortBy === "Date") {
                return new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime();
            }
            if (sortBy === "Student") {
                return a.studentName.localeCompare(b.studentName);
            }
            if (sortBy === "Room") {
                return a.roomNumber.localeCompare(b.roomNumber);
            }
            return 0;
        });
    }, [moveOutRequests, search, sortBy]);

    const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedRequests = filteredRequests.slice(startIndex, startIndex + itemsPerPage);

    const safeRecords = assignments ?? [];
    
    const filteredRecords = useMemo(() => {
    const q = tableSearch.toLowerCase();
    const currentFilter = filter as FilterType;
    
    return safeRecords.filter((record: AssignmentResponse) => {
        const moveIn = record.moveIn;
        const expectedMoveOut = record.expectedMoveOut;
        const actualMoveOut = record.actualMoveOut;
        
        // Check if there's an actual move-out date (could be future or past)
        const hasActualMoveOut = !!(actualMoveOut !== null && actualMoveOut !== undefined);
        
        // Calculate diff values and ensure they're numbers
        const moveInDiff = moveIn ? Number(diffFromNow(moveIn)) : 0;
        const expectedDiff = expectedMoveOut ? Number(diffFromNow(expectedMoveOut)) : 0;
        
        // Force boolean values with !! (double bang)
        const isMoveInRecord = !!(hasActualMoveOut === false && moveIn && moveInDiff <= 0);
        const isMoveOutRecord = hasActualMoveOut || (expectedMoveOut !== null && expectedMoveOut !== undefined);   
             
        let matchesFilter: boolean = true;
        if (currentFilter === "move-in") {
            matchesFilter = isMoveInRecord;
        } else if (currentFilter === "move-out") {
            matchesFilter = isMoveOutRecord;
        }
        // "all" filter - matchesFilter stays true
        
        const lname = record.student?.user?.lname?.toLowerCase() ?? "";
        const fname = record.student?.user?.fname?.toLowerCase() ?? "";
        const building = record.room?.roomBuilding?.toLowerCase() ?? "";
        const roomNumber = record.room?.roomNumber?.toLowerCase() ?? "";
        const roomType = record.room?.roomType?.toLowerCase() ?? "";
        const matchesSearch = lname.includes(q) || fname.includes(q) || building.includes(q) || roomNumber.includes(q) || roomType.includes(q);
        
        return matchesFilter && matchesSearch;
    });
}, [safeRecords, tableSearch, filter]);

    const sortedRecords = useMemo(() => {
        return [...filteredRecords].sort((a: AssignmentResponse, b: AssignmentResponse) => {
            const aRoomType = a.room?.roomType ?? "";
            const bRoomType = b.room?.roomType ?? "";
            const aBuilding = a.room?.roomBuilding ?? "";
            const bBuilding = b.room?.roomBuilding ?? "";
            const aMoveIn = a.moveIn ? (typeof a.moveIn === "string" ? new Date(a.moveIn).getTime() : a.moveIn.toMillis()) : 0;
            const bMoveIn = b.moveIn ? (typeof b.moveIn === "string" ? new Date(b.moveIn).getTime() : b.moveIn.toMillis()) : 0;
            if (tableSortBy === "Room Type") return aRoomType.localeCompare(bRoomType);
            if (tableSortBy === "Building") return aBuilding.localeCompare(bBuilding);
            if (tableSortBy === "Date") return aMoveIn - bMoveIn;
            return 0;
        });
    }, [filteredRecords, tableSortBy]);

    const totalRecordsPages = Math.ceil(sortedRecords.length / tableItemsPerPage);
    const recordsStartIndex = (tableCurrentPage - 1) * tableItemsPerPage;
    const paginatedRecords = sortedRecords.slice(recordsStartIndex, recordsStartIndex + tableItemsPerPage);

    const handleFilterChange = (newFilter: FilterType) => {
        setFilter(newFilter);
        setTableCurrentPage(1);
    };

    return (
        <div className="flex h-screen overflow-hidden bg-[#F6F2F4] font-sans">
            <div className="flex flex-col flex-1 min-w-0 min-h-0 w-full overflow-hidden">
                <CustomHeader title="Move In & Move Out" />    
                <div className="flex-1 flex flex-col overflow-hidden gap-6 p-6">
                    <main className="flex flex-col gap-6 flex-1 overflow-y-auto">
                        <div>
                            <HeroBanner
                                greeting="Good Day"
                                name={isLoadingUser ? "Loading..." : isErrorUser ? "Error Loading Name" : user?.fname}
                                title="Manage tenant move-ins and move-outs"
                                subtitle="Track upcoming move-ins, move-outs, and review early move-out requests."
                                type="mini"
                            />
                        </div>
                        
                        {/* Filter Tabs */}
                        <div className="bg-white p-1 rounded-xl inline-flex gap-1 w-fit">
                            {(["all", "move-in", "move-out", "requests"] as FilterType[]).map((f) => (
                                <button
                                    key={f}
                                    onClick={() => handleFilterChange(f)}
                                    className={`px-4 py-1.5 text-sm rounded-lg transition capitalize
                                        ${filter === f ? "bg-[#6B0F2B] text-white shadow" : "text-gray-500 hover:text-black"}`}
                                >
                                    {f === "all" ? "All" : f === "move-in" ? "Move in" : f === "move-out" ? "Move out" : "Move Out Requests"}
                                </button>
                            ))}
                        </div>

                        {/* Move Out Requests Table */}
                        {filter === "requests" && (
                            <div className="bg-white rounded-2xl shadow-sm p-6 border overflow-hidden">
                                <div className="flex items-start justify-between">
                                    <div className="flex flex-col gap-1">
                                        <h2 className="text-[#1A0008] font-bold text-sm lg:text-lg leading-tight whitespace-nowrap">
                                            Early Move-Out Requests
                                        </h2>
                                        <p className="italic font-normal text-[11px] lg:text-[12px]">
                                            {filteredRequests.length} total request{filteredRequests.length !== 1 ? 's' : ''}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="hidden lg:block">
                                            <Dropdown
                                                title="No. of Items"
                                                items={[
                                                    { label: "5", href: "" },
                                                    { label: "10", href: "" },
                                                    { label: "15", href: "" },
                                                    { label: "20", href: "" },
                                                ]}
                                                direction='down'
                                                widthClass="w-29 lg:w-32"
                                                titleClass="text-[10px] lg:text-[11px]"
                                                selectedClass="text-[12px] lg:text-[13px]"
                                                onSelect={(label) => {
                                                    setItemsPerPage(Number(label))
                                                    setCurrentPage(1)
                                                }}
                                            />
                                        </div>
                                        <Dropdown
                                            title="Sort By"
                                            items={[
                                                { label: "Date", href: "" },
                                                { label: "Student", href: "" },
                                                { label: "Room", href: "" },
                                            ]}
                                            direction='down'
                                            widthClass="w-29 lg:w-32"
                                            titleClass="text-[10px] lg:text-[11px]"
                                            selectedClass="text-[12px] lg:text-[13px] block"
                                            onSelect={(label) => {
                                                setSortBy(label)
                                                setCurrentPage(1)
                                            }}
                                        />
                                        <SearchBar
                                            value={search}
                                            onChange={(query) => setSearch(query)}
                                            onPageReset={() => setCurrentPage(1)}
                                        />
                                    </div>
                                </div>

                                {isLoadingRequests ? (
                                    <div className="py-12 flex flex-col items-center justify-center text-center">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: CLR.mid }} />
                                        <p className="text-sm text-[#9A7080] mt-2">Loading requests...</p>
                                    </div>
                                ) : paginatedRequests.length === 0 ? (
                                    <div className="py-12 flex flex-col items-center justify-center text-center">
                                        <FileText size={48} className="text-gray-300 mb-3" />
                                        <p className="text-[#9A7080] font-medium text-lg">No move-out requests</p>
                                        <p className="text-[#9A7080]/60 text-sm mt-1">When students request early move-out, they will appear here</p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="w-full overflow-x-auto">
                                            <table className="min-w-[800px] w-full mt-4 border-[#F5ECF0]">
                                                <thead>
                                                    <tr className="border-y sticky bg-white border-[#6B0F2B]/5">
                                                        <th className="text-[#9A7080] text-xs font-bold tracking-widest uppercase pl-3 py-2 text-left">Student</th>
                                                        <th className="text-[#9A7080] text-xs font-bold tracking-widest uppercase px-4 py-2 text-left">Unit/Room</th>
                                                        <th className="text-[#9A7080] text-xs font-bold tracking-widest uppercase px-4 py-2 text-left">Requested Date</th>
                                                        <th className="text-[#9A7080] text-xs font-bold tracking-widest uppercase px-4 py-2 text-center">Status</th>
                                                        <th className="text-[#9A7080] text-xs font-bold tracking-widest uppercase px-4 py-2 text-center">Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {paginatedRequests.map((request: EarlyMoveOutRequest) => (
                                                        <tr key={request.id} className="border-b border-gray-50 hover:bg-gray-50">
                                                            <td className="py-3 pl-3">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center text-white text-sm font-bold" 
                                                                         style={{ background: "linear-gradient(135deg, #6B0F2B, #9E2040)" }}>
                                                                        {getInitial(request.studentName)}
                                                                    </div>
                                                                    <div>
                                                                        <p className="font-bold text-sm text-[#1A0008]">{request.studentName}</p>
                                                                        <p className="text-xs text-[#9A7080]">{request.studentNumber}</p>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                <p className="text-sm text-[#1A0008] font-medium">{request.roomNumber}</p>
                                                                <p className="text-xs text-[#9A7080]">{request.roomBuilding}</p>
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                <p className="text-sm text-amber-600 font-medium">
                                                                    {new Date(request.requestedMoveOutDate).toLocaleDateString()}
                                                                </p>
                                                                <p className="text-xs text-gray-400">
                                                                    Current: {new Date(request.currentMoveOutDate).toLocaleDateString()}
                                                                </p>
                                                            </td>
                                                            <td className="px-4 py-3 text-center">
                                                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
                                                                    ${request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                                      request.status === 'approved' ? 'bg-green-100 text-green-800' :
                                                                      'bg-red-100 text-red-800'}`}>
                                                                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-3 text-center">
                                                                <Button 
                                                                    variant="secondary" 
                                                                    size="sm"
                                                                    onClick={() => handleOpenViewModal(request)}
                                                                >
                                                                    <Eye size={14} className="mr-1" /> View
                                                                </Button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                        <div className="flex items-center justify-between mt-4">
                                            <p className="text-xs text-[#9A7080]">
                                                {filteredRequests.length === 0 ? "" : `Showing ${startIndex + 1}–${Math.min(startIndex + itemsPerPage, filteredRequests.length)} of ${filteredRequests.length}`}
                                            </p>
                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={() => setCurrentPage((p: number) => Math.max(1, p - 1))}
                                                    disabled={currentPage === 1}
                                                    className="w-7 h-7 text-xs rounded-md border border-[#E8D5DC] text-[#9A7080] hover:bg-[#F5ECF0] disabled:opacity-40 disabled:cursor-not-allowed"
                                                >
                                                    {"<"}
                                                </button>
                                                {Array.from({ length: totalPages }, (_, i: number) => i + 1).map((page: number) => (
                                                    <button
                                                        key={page}
                                                        onClick={() => setCurrentPage(page)}
                                                        className={`w-7 h-7 text-xs rounded-md font-medium transition flex items-center justify-center
                                                            ${currentPage === page ? "text-white" : "text-[#9A7080] border border-[#E8D5DC] hover:bg-[#F5ECF0]"}`}
                                                        style={currentPage === page ? { background: "linear-gradient(135deg, #6B0F2B, #9E2040)" } : {}}
                                                    >
                                                        {page}
                                                    </button>
                                                ))}
                                                <button
                                                    onClick={() => setCurrentPage((p: number) => Math.min(totalPages, p + 1))}
                                                    disabled={currentPage === totalPages}
                                                    className="w-7 h-7 text-xs rounded-md border border-[#E8D5DC] text-[#9A7080] hover:bg-[#F5ECF0] disabled:opacity-40 disabled:cursor-not-allowed"
                                                >
                                                    {">"}
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}

                        {/* Regular Move In/Out Table */}
                        {filter !== "requests" && (
                            <div className="bg-white rounded-2xl shadow-sm p-6 flex flex-col min-h-0 flex-1">
                                <div className="flex items-start justify-between">
                                    <div className="flex flex-col gap-1">
                                        <h2 className="text-[#1A0008] font-bold text-sm lg:text-[16px] leading-tight whitespace-nowrap">
                                            {filter === "move-in" ? "Move in History" : filter === "move-out" ? "Move out History" : "Move in & Move out History"}
                                        </h2>
                                        <p className="italic font-normal text-[11px] lg:text-[13px]">
                                            {filteredRecords.length} total {filter === "all" ? "move-ins and move-outs" : filter === "move-out" ? "move-outs" : "move-ins"}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="hidden lg:block">
                                            <Dropdown
                                                title="No. of Items"
                                                items={[
                                                    { label: "5", href: "" },
                                                    { label: "10", href: "" },
                                                    { label: "15", href: "" },
                                                    { label: "20", href: "" },
                                                ]}
                                                direction='down'
                                                widthClass="w-29 lg:w-32"
                                                titleClass="text-[10px] lg:text-[11px]"
                                                selectedClass="text-[12px] lg:text-[13px]"
                                                onSelect={(label) => {
                                                    setTableItemsPerPage(Number(label))
                                                    setTableCurrentPage(1)
                                                }}
                                            />
                                        </div>
                                        <Dropdown
                                            title="Sort By"
                                            items={[
                                                { label: "Date", href: "" },
                                                { label: "Room Type", href: "" },
                                                { label: "Building", href: "" },
                                            ]}
                                            direction='down'
                                            widthClass="w-29 lg:w-32"
                                            titleClass="text-[10px] lg:text-[11px]"
                                            selectedClass="text-[12px] lg:text-[13px] block"
                                            onSelect={(label) => {
                                                setTableSortBy(label)
                                                setTableCurrentPage(1)
                                            }}
                                        />
                                        <SearchBar
                                            value={tableSearch}
                                            onChange={(query) => setTableSearch(query)}
                                            onPageReset={() => setTableCurrentPage(1)}
                                        />
                                    </div>
                                </div>

                                {isLoadingList ? (
                                    <div className="py-12 flex flex-col flex-1 items-center justify-center text-center">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: CLR.mid }} />
                                        <p className="text-sm text-[#9A7080] mt-2">Fetching records...</p>
                                    </div>
                                ) : paginatedRecords.length === 0 ? (
                                    <div className="flex flex-1 flex-col items-center justify-center text-center">
                                        <p className="text-[#9A7080] font-medium text-lg">No records found</p>
                                        <p className="text-[#9A7080]/60 text-sm mt-1">No {filter === "move-in" ? "upcoming move-ins" : filter === "move-out" ? "upcoming move-outs" : "move records"} at this time</p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="w-full overflow-x-auto overflow-y-auto flex-1 min-h-0">
                                            <table className="min-w-[900px] w-full mt-4 border-[#F5ECF0]">
                                                <thead>
                                                    <tr className="border-y border-[#6B0F2B]/5">
                                                        {["Students", "Room", "Room Type", "Date", "Type"].map((h) => (
                                                            <th key={h} className="text-[#9A7080] text-xs font-bold tracking-widest uppercase pl-3 py-2 text-left">
                                                                {h}
                                                            </th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {paginatedRecords.map((record: AssignmentResponse, index: number) => {
                                                        const diffMoveIn = diffFromNow(record.moveIn)
                                                        const diffMoveOut = diffFromNow(record.expectedMoveOut)
                                                        const actualMoveOut = record.actualMoveOut
                                                        
                                                        // Check if there's an actual move-out date
                                                        const hasActualMoveOut = actualMoveOut !== null && actualMoveOut !== undefined
                                                        
                                                        // Parse the move-out date if it exists
                                                        let moveOutDate: Date | null = null
                                                        if (hasActualMoveOut && actualMoveOut) {
                                                            if (typeof actualMoveOut === 'string') {
                                                                moveOutDate = new Date(actualMoveOut)
                                                            } else if (actualMoveOut.toJSDate) {
                                                                moveOutDate = actualMoveOut.toJSDate()
                                                            } else {
                                                                moveOutDate = new Date(actualMoveOut.toString())
                                                            }
                                                        }
                                                        
                                                        // Check if the move-out date has already passed
                                                        let hasActuallyMovedOut = false
                                                        if (moveOutDate) {
                                                            const today = new Date()
                                                            today.setHours(0, 0, 0, 0)
                                                            hasActuallyMovedOut = moveOutDate <= today
                                                        }
                                                        
                                                        const isMoveIn = !hasActualMoveOut && diffMoveIn <= 0
                                                        const isFutureMoveOut = hasActualMoveOut && !hasActuallyMovedOut
                                                        
                                                        // Determine row background color
                                                        let rowBgClass = ""
                                                        if (hasActuallyMovedOut) {
                                                            rowBgClass = "bg-green-50"  // GREEN - Already moved out
                                                        } else if (isFutureMoveOut) {
                                                            rowBgClass = "bg-blue-50"   // BLUE - Scheduled early move-out (future)
                                                        } else if (!isMoveIn && !hasActualMoveOut) {
                                                            rowBgClass = "bg-[#FDF4F7]"  // Pinkish - Upcoming regular move-out
                                                        }
                                                        
                                                        // Determine display date
                                                        let displayDate = ""
                                                        if (moveOutDate) {
                                                            displayDate = moveOutDate.toLocaleDateString()
                                                        } else if (isMoveIn && record.moveIn) {
                                                            const moveInDate = typeof record.moveIn === 'string' 
                                                                ? new Date(record.moveIn) 
                                                                : record.moveIn.toJSDate?.() || new Date(record.moveIn.toString())
                                                            displayDate = moveInDate.toLocaleDateString()
                                                        } else if (record.expectedMoveOut) {
                                                            const expectedDate = typeof record.expectedMoveOut === 'string' 
                                                                ? new Date(record.expectedMoveOut) 
                                                                : record.expectedMoveOut.toJSDate?.() || new Date(record.expectedMoveOut.toString())
                                                            displayDate = expectedDate.toLocaleDateString()
                                                        } else {
                                                            displayDate = "—"
                                                        }
                                                        
                                                        // Determine display text
                                                        let displayText = ""
                                                        if (hasActuallyMovedOut && moveOutDate) {
                                                            displayText = `Moved out on ${moveOutDate.toLocaleDateString()}`
                                                        } else if (isFutureMoveOut && moveOutDate) {
                                                            const daysUntil = Math.ceil((moveOutDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                                                            displayText = `Scheduled early move-out in ${daysUntil} days`
                                                        } else if (isMoveIn) {
                                                            displayText = `${Math.abs(diffMoveIn)} days until move-in`
                                                        } else {
                                                            const days = Math.abs(diffMoveOut)
                                                            displayText = diffMoveOut < 0 
                                                                ? `${days} days until move-out` 
                                                                : `${days} days since expected move-out`
                                                        }
                                                        
                                                        // Determine display type
                                                        let displayType = ""
                                                        let typeTextClass = ""
                                                        if (hasActuallyMovedOut) {
                                                            displayType = "Move-out"
                                                            typeTextClass = "text-green-600"
                                                        } else if (isFutureMoveOut) {
                                                            displayType = "Early Move-out"
                                                            typeTextClass = "text-blue-600"
                                                        } else if (isMoveIn) {
                                                            displayType = "Move-in"
                                                            typeTextClass = "text-[#1A0008]"
                                                        } else {
                                                            displayType = "Move-out"
                                                            typeTextClass = "text-[#9E2040]"
                                                        }
                                                        
                                                        const dateTextClass = hasActuallyMovedOut 
                                                            ? "text-green-600" 
                                                            : isFutureMoveOut
                                                                ? "text-blue-600"
                                                                : isMoveIn 
                                                                    ? "text-[#9A7080]" 
                                                                    : "text-[#9E2040]"

                                                        return (
                                                            <tr key={index} className={`transition ${rowBgClass}`}>
                                                                <td className="py-3 pl-3">
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center text-white text-sm font-bold" 
                                                                             style={{ background: "linear-gradient(135deg, #6B0F2B, #9E2040)" }}>
                                                                            {record?.student?.user?.lname ? getInitial(record.student.user.lname) || "U" : "U"}
                                                                        </div>
                                                                        <p className="font-bold text-sm text-[#1A0008]">
                                                                            {record?.student?.user?.fname && record?.student?.user?.lname ?
                                                                                `${record.student.user.fname} ${record.student.user.lname}` :
                                                                                "Loading name..."
                                                                            }
                                                                        </p>
                                                                    </div>
                                                                 </td>
                                                                <td className="px-4 py-3">
                                                                    <div className="flex flex-col">
                                                                        <span className="text-sm text-[#1A0008]">{record?.room?.roomNumber ?? "—"}</span>
                                                                        <span className="text-xs text-[#9A7080]">{record?.room?.roomBuilding ?? "—"}</span>
                                                                    </div>
                                                                 </td>
                                                                <td className="px-4 py-3">
                                                                    <div className="flex flex-col">
                                                                        <span className="text-sm text-[#1A0008] capitalize">{record?.room?.roomStayType ? record.room.roomStayType.replace("_", " ") : "—"}</span>
                                                                        <span className="text-xs text-[#9A7080] capitalize">{record?.room?.roomType ?? "—"}</span>
                                                                    </div>
                                                                 </td>
                                                                <td className="px-4 py-3">
                                                                    <div className="flex flex-col">
                                                                        <span className="text-sm text-[#1A0008]">{displayDate}</span>
                                                                        <span className={`text-xs ${dateTextClass}`}>
                                                                            {displayText}
                                                                        </span>
                                                                    </div>
                                                                 </td>
                                                                <td>
                                                                    <span className={`text-sm font-medium capitalize ${typeTextClass}`}>
                                                                        {displayType}
                                                                    </span>
                                                                 </td>
                                                             </tr>
                                                        )
                                                    })}
                                                </tbody>
                                             </table>
                                        </div>
                                        <div className="flex flex-col">
                                            <hr className="border-[#6B0F2B]/10 border-t mb-2" />
                                            <div className="flex flex-row justify-between">
                                                <p className="text-xs text-[#9A7080] mt-3">
                                                    {sortedRecords.length === 0 ? "" : `Showing ${recordsStartIndex + 1}–${Math.min(recordsStartIndex + tableItemsPerPage, sortedRecords.length)} of ${sortedRecords.length}`}
                                                </p>
                                                <Pagination
                                                    totalPages={totalPages}
                                                    currentPage={currentPage}
                                                    onPageChange={setCurrentPage}
                                                />
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </main>
                </div>
            </div>

            {/* View Modal - Shows details AND has Approve/Reject buttons for pending requests */}
            <Modal
                open={viewModalOpen && selectedRequest !== null}
                onClose={() => {
                    setViewModalOpen(false);
                    setSelectedRequest(null);
                    setResponseAction(null);
                    setResponseRemark("");
                }}
                title="Early Move-Out Request Details"
                eyebrow="VIEW REQUEST"
                maxWidth={500}
                footer={
                    <div className="flex justify-end gap-3 w-full">
                        {selectedRequest?.status === 'pending' && (
                            <>
                                <Button 
                                    variant="primary"
                                    onClick={handleApprove}
                                    className="bg-emerald-600 hover:bg-emerald-700"
                                >
                                    <CheckCircle size={14} className="mr-1" /> Approve
                                </Button>
                                <Button 
                                    variant="secondary"
                                    onClick={handleReject}
                                    className="border-red-200 text-red-600 hover:bg-red-50"
                                >
                                    <XCircle size={14} className="mr-1" /> Reject
                                </Button>
                            </>
                        )}
                    </div>
                }
            >
                <div className="space-y-4">
                    {selectedRequest && (
                        <>
                            <div className="bg-gray-50 rounded-xl p-4">
                                <p className="text-sm font-semibold text-gray-700">{selectedRequest.studentName}</p>
                                <p className="text-xs text-gray-500">{selectedRequest.studentNumber}</p>
                                <p className="text-xs text-gray-500 mt-1">Room {selectedRequest.roomNumber} - {selectedRequest.roomBuilding}</p>
                                <p className="text-xs text-gray-500">{selectedRequest.accommodationName}</p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Status</p>
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
                                    ${selectedRequest.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                      selectedRequest.status === 'approved' ? 'bg-green-100 text-green-800' :
                                      'bg-red-100 text-red-800'}`}>
                                    {selectedRequest.status.charAt(0).toUpperCase() + selectedRequest.status.slice(1)}
                                </span>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Requested Move-Out Date</p>
                                <p className="text-base font-bold text-amber-600">{new Date(selectedRequest.requestedMoveOutDate).toLocaleDateString()}</p>
                                <p className="text-xs text-gray-400 mt-0.5">Current move-out: {new Date(selectedRequest.currentMoveOutDate).toLocaleDateString()}</p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Reason</p>
                                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{selectedRequest.reason}</p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Requested On</p>
                                <p className="text-sm text-gray-600">{new Date(selectedRequest.requestedAt).toLocaleString()}</p>
                            </div>
                        </>
                    )}
                </div>
            </Modal>

            {/* Confirmation Modal for Approve/Reject action */}
            <Modal
                open={responseAction !== null && selectedRequest !== null}
                onClose={handleCloseActionModal}
                title={`${responseAction === 'approve' ? 'Approve' : 'Reject'} Early Move-Out Request`}
                eyebrow="Confirm Action"
                maxWidth={500}
                footer={
                    <div className="flex justify-end gap-3 w-full">
                        <Button variant="secondary" onClick={handleCloseActionModal}>
                            Cancel
                        </Button>
                        <Button 
                            variant={responseAction === 'approve' ? 'primary' : 'secondary'}
                            onClick={handleConfirmResponse}
                            disabled={respondToRequest.isPending}
                            className={responseAction === 'approve' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
                        >
                            {respondToRequest.isPending ? "Processing..." : `Yes, ${responseAction === 'approve' ? 'Approve' : 'Reject'}`}
                        </Button>
                    </div>
                }
            >
                <div className="space-y-4">
                    {selectedRequest && (
                        <>
                            <div className="bg-gray-50 rounded-xl p-4">
                                <p className="text-sm font-semibold text-gray-700">{selectedRequest.studentName}</p>
                                <p className="text-xs text-gray-500">{selectedRequest.studentNumber}</p>
                                <p className="text-xs text-gray-500 mt-1">Room {selectedRequest.roomNumber} - {selectedRequest.roomBuilding}</p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Requested Move-Out Date</p>
                                <p className="text-base font-bold text-amber-600">{new Date(selectedRequest.requestedMoveOutDate).toLocaleDateString()}</p>
                                <p className="text-xs text-gray-400 mt-0.5">Current move-out: {new Date(selectedRequest.currentMoveOutDate).toLocaleDateString()}</p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Reason</p>
                                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{selectedRequest.reason}</p>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                                    {responseAction === 'approve' ? 'Optional Remark' : 'Reason for Rejection (Optional)'}
                                </label>
                                <textarea
                                    value={responseRemark}
                                    onChange={(e) => setResponseRemark(e.target.value)}
                                    placeholder={responseAction === 'approve' ? "Add any notes (optional)" : "Provide a reason for rejection (optional)"}
                                    rows={3}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#6B0F2B]/30"
                                />
                            </div>
                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex gap-2">
                                <AlertCircle size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
                                <p className="text-xs text-amber-700">
                                    {responseAction === 'approve' 
                                        ? "Approving this request will schedule the tenant's move-out date. The room will be freed up on that date."
                                        : "Rejecting this request will keep the tenant's current move-out date unchanged."}
                                </p>
                            </div>
                        </>
                    )}
                </div>
            </Modal>

            <Toast
                type={toast.type}
                title={toast.title}
                message={toast.message}
                show={toast.show}
                onClose={() => setToast(prev => ({ ...prev, show: false }))}
            />
        </div>
    )
}