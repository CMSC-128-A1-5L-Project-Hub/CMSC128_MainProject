import { useEffect, useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"
import { api } from "../../api/axios"
import HeroBanner from "@/components/dashboard/HeroBanner"
import Card from "@/components/ui/Card"
import { FiSearch } from "react-icons/fi"
import CustomHeader from '../../components/CustomHeader';
import AccommodationVerificationModal from "@/components/dashboard/admin/PendingAccommodationsModal"
import Dropdown from "@/components/ApplicationStatus/Dropdown"
import SearchBar from "@/components/SearchBar"
import StylizedStatus from "@/components/BillingDashboard/StylizedStatus"
import Pagination from "@/components/ApplicationStatus/Pagination"
import Toast from "@/components/Toast"

export default function PendingAccommodationsPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [verifyingAccommodationId, setVerifyingAccommodationId] = useState<number | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortOrder, setSortOrder] = useState("latest")
  const [isSortOpen, setIsSortOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("Date issued (Desc.)")
  const [rows, setRows] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedItem, setSelectedItem] = useState<any | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  
  // Toast state
  const [toast, setToast] = useState<{
    show: boolean; type: "success" | "error" | "info" | "warning" | "loading"; title: string; message?: string
  }>({ show: false, type: "success", title: "" })

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedItem(null)
  }

  const handleOpenModal = (item: any) => {
    setSelectedItem(item)
    setIsModalOpen(true)
  }

  const { data: user, isLoading: isUserLoading, isError } = useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const res = await api.get("/me")
      return res.data
    },
    retry: false,
  })

  const {
    data: pendingAccommodationsRaw,
    isLoading,
    isError: isPendingError,
  } = useQuery({
    queryKey: ["admin-pending-accommodations"],
    queryFn: async () => {
      const res = await api.get("/admin/accommodations/pending")
      return res.data
    },
  })

  const verifyAccommodationMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      setVerifyingAccommodationId(id)

      const res = await api.patch(`/admin/accommodations/${id}/verify`, {
        status,
      })

      return res.data
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["admin-pending-accommodations"],
      })
      const statusText = variables.status === "verified" ? "verified" : "rejected"
      setToast({ show: true, type: "success", title: `Accommodation ${statusText}`, message: `The accommodation has been ${statusText}.` })
      handleCloseModal()
    },
    onError: (error: any) => {
      setToast({ show: true, type: "error", title: "Verification Failed", message: error?.response?.data?.message || "Could not process accommodation." })
    },
    onSettled: () => {
      setVerifyingAccommodationId(null)
    },
  })

  const pendingAccommodations = Array.isArray(pendingAccommodationsRaw)
    ? pendingAccommodationsRaw
    : Array.isArray(pendingAccommodationsRaw?.data)
    ? pendingAccommodationsRaw.data
    : []

  const formatAppliedDate = (timestamp?: string) => {
    if (!timestamp) return "N/A"

    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, sortBy, rows])

  useEffect(() => {
    if (isError) {
      setToast({ show: true, type: "error", title: "Authentication Error", message: "Please login again." })
      setTimeout(() => navigate("/auth/signin"), 1500)
    }
  }, [isError, navigate])

  useEffect(() => {
    if (user && user.role !== "manager" && user.role !== "super_admin") {
      setToast({ show: true, type: "error", title: "Access Denied", message: "You don't have permission to view this page." })
      setTimeout(() => navigate("/auth/signin"), 1500)
    }
  }, [user, navigate])

  // Refresh data handler
  const handleRefresh = async () => {
    setToast({ show: true, type: "loading", title: "Refreshing...", message: "Fetching latest data." })
    try {
      await queryClient.invalidateQueries({ queryKey: ["admin-pending-accommodations"] })
      setToast({ show: true, type: "success", title: "Refreshed!", message: "Accommodation requests have been updated." })
    } catch (error) {
      setToast({ show: true, type: "error", title: "Refresh Failed", message: "Could not refresh data." })
    }
  }

  if (isUserLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#F9F4F5]">
        <p className="text-sm text-[#6B0F2B]">Loading...</p>
      </div>
    )
  }

  if (!user || (user.role !== "manager" && user.role !== "super_admin")) {
    return null
  }

  const filteredAccommodations = pendingAccommodations
    .filter((item: any) => {
      const name = (item.accommodationName ?? "").toLowerCase()
      const location = (item.accommodationLocation ?? "").toLowerCase()
      const landlordName = item.landlord?.user
        ? `${item.landlord.user.fname ?? ""} ${item.landlord.user.lname ?? ""}`.toLowerCase()
        : ""
      const q = searchQuery.toLowerCase()
      return name.includes(q) || location.includes(q) || landlordName.includes(q)
    })
    .sort((a: any, b: any) => {
      const dateA = new Date(a.createdAt ?? 0).getTime()
      const dateB = new Date(b.createdAt ?? 0).getTime()
      if (sortBy === "Date issued (Asc.)") return dateA - dateB
      if (sortBy === "Date issued (Desc.)") return dateB - dateA
      return 0
    })

  const totalPages = Math.max(1, Math.ceil(filteredAccommodations.length / rows))
  const safePage = Math.min(currentPage, totalPages)
  const startIndex = (safePage - 1) * rows
  const paginatedAccommodations = filteredAccommodations.slice(startIndex, startIndex + rows)

  return (
    <div className="flex flex-col h-screen bg-[#F6F2F4]">
      <CustomHeader
        title="Pending Accommodations"
        right={
          <button
            onClick={handleRefresh}
            className="px-3 py-1.5 text-xs font-semibold text-[#6B0F2B] border border-[#6B0F2B]/20 rounded-lg hover:bg-[#6B0F2B]/5 transition"
          >
            Refresh
          </button>
        }
      />
      <div className="flex flex-col flex-1 min-h-0 p-6 gap-6">
        <div>
          <HeroBanner
            greeting="Good day"
            name={user?.fname ?? "Admin"}
            title="Review pending accommodation submissions"
            subtitle="Approve or reject accommodations submitted by housing administrators."
            type="mini"
          />
        </div>
        <div className="flex flex-col flex-1 min-h-0 bg-white rounded-2xl p-6">
          <div className="flex justify-between">  
            <div className="flex flex-col justify-center self-center mb-4">
              <h4 className="text-[16px] font-bold">
                Pending Accommodations
              </h4>
              <p className="text-[13px]">
                {filteredAccommodations.length} pending accommodation submission{filteredAccommodations.length === 1 ? "" : "s"}
              </p>
            </div>
            <div className="flex flex-row gap-2 items-center">
              <div className='hidden lg:block'>
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
                    setRows(parseInt(label, 10)); 
                    setCurrentPage(1);
                    setToast({ show: true, type: "info", title: "Updated", message: `Showing ${label} items per page.` })
                  }}
                />
              </div>
              <Dropdown
                title="Sort by"
                items={[
                  { label: "Date issued (Asc.)", href: "" },
                  { label: "Date issued (Desc.)", href: "" },
                ]}
                direction="down"
                widthClass="w-32 lg:w-44"
                titleClass="text-[10px] lg:text-[11px]"
                selectedClass="text-[12px] lg:text-[13px]"
                onSelect={(label) => { 
                  setSortBy(label); 
                  setCurrentPage(1);
                  setToast({ show: true, type: "info", title: "Sorted", message: `Requests sorted by ${label}.` })
                }}
              />
              <SearchBar
                value={searchQuery}
                onChange={(query) => {
                  setSearchQuery(query)
                  setCurrentPage(1)
                }}
                onPageReset={() => setCurrentPage(1)}
              />
            </div>
          </div>
          {isLoading ? (
            <div className="flex h-[390px] items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6B0F2B]"></div>
              <p className="text-sm text-gray-500 ml-2">Loading accommodations...</p>
            </div>
          ) : isPendingError ? (
            <div className="flex h-[390px] items-center justify-center">
              <p className="text-sm text-red-500">Error loading accommodations. Please try again.</p>
            </div>
          ) : filteredAccommodations.length === 0 ? (
            <div className="flex flex-col justify-center items-center h-full text-center py-12">
              <p className="text-[#9A7080] font-medium text-lg">No accommodations found</p>
              <p className="text-[#9A7080]/60 text-sm mt-1">When accommodations apply for UBLE, they will appear here</p>
            </div>
          ) : (
            <div className="overflow-y-auto min-h-0 flex-1">
              <table className="min-w-full">
              <thead className="">
                <tr className="border-y border-[#F2D9DF]">
                  <th className="p-2 text-left text-xs font-bold uppercase tracking-widest text-[#A06B7C]">
                    Accommodation
                  </th>
                  <th className="p-2 text-left text-xs font-bold uppercase tracking-widest text-[#A06B7C]">
                    Submitted On
                  </th>
                  <th className="p-2 text-left text-xs font-bold uppercase tracking-widest text-[#A06B7C]">
                    Landlord
                  </th>
                  <th className="p-2 text-left text-xs font-bold uppercase tracking-widest text-[#A06B7C]">
                    Status
                  </th>
                  <th className="p-2 text-center text-xs font-bold uppercase tracking-widest text-[#A06B7C]">
                    Action
                  </th>
                </tr>  
              </thead>
                <tbody>
                  {paginatedAccommodations.map((item: any) => (
                    <tr
                      key={item.id}
                      className="hover:bg-[#FFF7F9] transition"
                    >
                      <td className="p-2">
                        <div className="flex items-center gap-2">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl text-[14px] bg-gradient-to-br from-[#6B0F2B] to-[#B32042] font-bold text-white">
                            {item.accommodationName?.[0]?.toUpperCase() ?? "A"}
                          </div>
                          <div>
                            <p className="text-[14px] font-semibold text-[#2A0410]">
                              {item.accommodationName}
                            </p>
                            <p className="text-[12px] text-[#A06B7C]">
                              {item.accommodationLocation ?? "—"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-2 text-sm text-[#A06B7C]">
                        {formatAppliedDate(item.createdAt)}
                      </td>
                      <td className="p-2 text-sm">
                        {item.landlord?.user
                          ? `${item.landlord.user.fname} ${item.landlord.user.lname}`
                          : "—"}
                      </td>
                      <td className="p-2">
                        <StylizedStatus status={"pending"} />
                      </td>
                      <td className="p-2 text-center">
                        <button
                          onClick={() => handleOpenModal(item)}
                          className="rounded-xl border border-[#D9B8C4] bg-[#FFF7F9] px-4 py-2 text-[13px] font-semibold text-[#6B0F2B] hover:bg-[#F2D9DF] transition"
                        >
                          Review
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {/* Pagination Footer */}
          {filteredAccommodations.length > 0 && (
            <div className="flex flex-col mt-4">
              <hr className="border-[#6B0F2B]/10" />
              <div className="relative flex items-center justify-end py-2">
                <span className="absolute left-1/2 -translate-x-1/2 text-[13px] text-[#A06B7C]">
                  Showing {startIndex + 1}–{Math.min(startIndex + rows, filteredAccommodations.length)} of{" "}
                  {filteredAccommodations.length} accommodation{filteredAccommodations.length === 1 ? "" : "s"}
                </span>
                <Pagination
                  totalPages={totalPages}
                  currentPage={safePage}
                  onPageChange={(page) => {
                    setCurrentPage(page)
                    setToast({ show: true, type: "info", title: "Page Changed", message: `Viewing page ${page} of ${totalPages}.` })
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
      
      <AccommodationVerificationModal
        open={isModalOpen}
        onClose={handleCloseModal}
        selectedItem={selectedItem}
        verifyingAccommodationId={verifyingAccommodationId}
        onApprove={(id) => {
          verifyAccommodationMutation.mutate({ id, status: "verified" })
          handleCloseModal()
        }}
        onReject={(id) => {
          verifyAccommodationMutation.mutate({ id, status: "rejected" })
          handleCloseModal()
        }}
      />

      {/* Toast Notifications */}
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