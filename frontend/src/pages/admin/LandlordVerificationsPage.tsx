import { useEffect, useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"
import { api } from "../../api/axios"
import Sidebar from "../../components/Sidebar"
import HeroBanner from "@/components/dashboard/HeroBanner"
import Card from "@/components/ui/Card"
import CustomHeader from '../../components/CustomHeader';
import HousingAdminVerificationModal from "@/components/dashboard/admin/HousingAdminVerificationsModal"
import Dropdown from "@/components/ApplicationStatus/Dropdown"
import SearchBar from "@/components/SearchBar"
import Pagination from "@/components/ApplicationStatus/Pagination"
import Toast from "@/components/Toast"

export default function LandlordVerificationsPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [processingUserId, setProcessingUserId] = useState<number | null>(null)
  const [processingAction, setProcessingAction] = useState<"approve" | "reject" | null>(null)
  const [selectedItem, setSelectedItem] = useState<any | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("Date issued (Desc.)")
  const [rows, setRows] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)
  
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
    data: pendingUsersRaw,
    isLoading,
    isError: isPendingError,
  } = useQuery({
    queryKey: ["admin-pending-users"],
    queryFn: async () => {
      const res = await api.get("/admin/users/pending")
      return res.data
    },
  })

  const verifyUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      setProcessingUserId(userId)
      setProcessingAction("approve")
      const res = await api.patch(`/admin/users/${userId}/verify`, { roleToAssign: "landlord" })
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-pending-users"] })
      queryClient.invalidateQueries({ queryKey: ["admin-total-users"] })
      setToast({ show: true, type: "success", title: "Landlord Approved", message: "The housing administrator account has been verified." })
    },
    onError: (error: any) => {
      setToast({ show: true, type: "error", title: "Approval Failed", message: error?.response?.data?.message || "Could not verify landlord." })
    },
    onSettled: () => {
      setProcessingUserId(null)
      setProcessingAction(null)
    },
  })

  const rejectUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      setProcessingUserId(userId)
      setProcessingAction("reject")
      const res = await api.patch(`/admin/users/${userId}/reject`)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-pending-users"] })
      queryClient.invalidateQueries({ queryKey: ["admin-total-users"] })
      setToast({ show: true, type: "warning", title: "Landlord Rejected", message: "The housing administrator account has been rejected." })
    },
    onError: (error: any) => {
      setToast({ show: true, type: "error", title: "Rejection Failed", message: error?.response?.data?.message || "Could not reject landlord." })
    },
    onSettled: () => {
      setProcessingUserId(null)
      setProcessingAction(null)
    },
  })

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
      await queryClient.invalidateQueries({ queryKey: ["admin-pending-users"] })
      setToast({ show: true, type: "success", title: "Refreshed!", message: "Landlord requests have been updated." })
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

  const pendingUsers = Array.isArray(pendingUsersRaw)
    ? pendingUsersRaw
    : Array.isArray(pendingUsersRaw?.data)
    ? pendingUsersRaw.data
    : []

  const landlordPending = pendingUsers.filter(
    (item: any) => item.requestedRole === "landlord"
  )

  const formatAppliedDate = (timestamp?: string) => {
    if (!timestamp) return "N/A"
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const filteredLandlords = landlordPending
    .filter((item: any) => {
      const fullName = `${item.user.fname} ${item.user.lname}`.toLowerCase()
      const email = item.user.email?.toLowerCase() ?? ""
      return (
        fullName.includes(searchQuery.toLowerCase()) ||
        email.includes(searchQuery.toLowerCase())
      )
    })
    .sort((a: any, b: any) => {
      const dateA = new Date(a.user.createdAt ?? 0).getTime()
      const dateB = new Date(b.user.createdAt ?? 0).getTime()
      if (sortBy === "Date issued (Asc.)") return dateA - dateB
      if (sortBy === "Date issued (Desc.)") return dateB - dateA
      return dateB - dateA
    })

  const totalPages = Math.max(1, Math.ceil(filteredLandlords.length / rows))
  const safePage = Math.min(currentPage, totalPages)
  const startIndex = (safePage - 1) * rows
  const paginated = filteredLandlords.slice(startIndex, startIndex + rows)

  return (
    <div className="flex flex-col h-screen bg-[#F6F2F4]">
      <CustomHeader 
        title="Housing Administrator Verifications"
        right={
          <button
            onClick={handleRefresh}
            className="px-3 py-1.5 text-xs font-semibold text-[#6B0F2B] border border-[#6B0F2B]/20 rounded-lg hover:bg-[#6B0F2B]/5 transition"
          >
            Refresh
          </button>
        }
      />
      <main className="flex flex-col flex-1 min-h-0 overflow-x-hidden p-6 gap-6">
        <div>
          <HeroBanner
            greeting="Good day"
            name={user?.fname ?? "Admin"}
            title="Review pending landlord requests"
            subtitle="Approve housing administrator verification requests."
            type="mini"
          />
        </div>

        <Card className="flex flex-1 min-h-0 flex-col rounded-2xl bg-white p-6 shadow-sm">
          {/* HEADER */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-[16px] font-bold text-[#2A0410]">
                Housing Administrator Verifications
              </h4>
              <p className="text-[13px] italic">
                {filteredLandlords.length} pending landlord request{filteredLandlords.length === 1 ? "" : "s"}
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
                  direction="down"
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

          {/* CONTENT */}
          {isLoading ? (
            <div className="flex h-[390px] items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6B0F2B]"></div>
              <p className="text-sm text-gray-500 ml-2">Loading requests...</p>
            </div>
          ) : isPendingError ? (
            <div className="flex h-[390px] items-center justify-center">
              <p className="text-sm text-red-500">Error loading requests. Please try again.</p>
            </div>
          ) : filteredLandlords.length === 0 ? (
            <div className="flex flex-col justify-center items-center h-full text-center py-12">
              <p className="text-[#9A7080] font-medium text-lg">No pending verifications found</p>
              <p className="text-[#9A7080]/60 text-sm mt-1">When a landlord applies, they will appear here</p>
            </div>
          ) : (
            <div className="flex flex-col flex-1 min-h-0">
              {/* TABLE */}
              <div className="flex-1 -mx-6">
                <table className="min-w-full border-collapse">
                  <thead className="bg-[#FFF7F9]">
                    <tr className="border-y border-[#F2D9DF]">
                      <th className="px-8 py-4 text-left text-xs font-bold uppercase tracking-widest text-[#A06B7C]">
                        Landlord
                      </th>
                      <th className="px-8 py-4 text-left text-xs font-bold uppercase tracking-widest text-[#A06B7C]">
                        Applied
                      </th>
                      <th className="px-8 py-4 text-left text-xs font-bold uppercase tracking-widest text-[#A06B7C]">
                        Email
                      </th>
                      <th className="px-8 py-4 text-center text-xs font-bold uppercase tracking-widest text-[#A06B7C]">
                        Status
                      </th>
                      <th className="px-8 py-4 text-center text-xs font-bold uppercase tracking-widest text-[#A06B7C]">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginated.map((item: any) => (
                      <tr key={item.user.id} className="border-b border-[#F2D9DF] hover:bg-[#FFF7F9]">
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#6B0F2B] to-[#B32042] font-bold text-white">
                              {item.user.fname?.[0]?.toUpperCase() ?? "L"}
                            </div>
                            <div>
                              <p className="text-[14px] font-semibold text-[#2A0410]">
                                {item.user.fname} {item.user.lname}
                              </p>
                              <p className="text-xs text-[#A06B7C]">
                                Housing Administrator Account
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-5 text-sm text-[#A06B7C]">
                          {formatAppliedDate(item.user.submittedAt)}
                        </td>
                        <td className="px-8 py-5 text-sm text-gray-600">
                          {item.user.email}
                        </td>
                        <td className="px-8 py-5 text-center">
                          <span className="rounded-full bg-[#FFF7F9] px-3 py-1 text-xs font-semibold text-[#A06B7C]">
                            Pending
                          </span>
                        </td>
                        <td className="px-8 py-5 text-center">
                          <button
                            onClick={() => handleOpenModal(item)}
                            className="rounded-xl border border-[#D9B8C4] bg-[#FFF7F9] px-6 py-2 text-sm font-semibold text-[#6B0F2B] hover:bg-[#F2D9DF] transition"
                          >
                            Review
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* FOOTER */}
              <div className="flex flex-col mt-4">
                <hr className="border-[#6B0F2B]/10" />
                <div className="relative flex items-center justify-end py-2">
                  <span className="absolute left-1/2 -translate-x-1/2 text-[13px] text-[#A06B7C]">
                    Showing {startIndex + 1}–{Math.min(startIndex + rows, filteredLandlords.length)} of{" "}
                    {filteredLandlords.length} request{filteredLandlords.length === 1 ? "" : "s"}
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
            </div>
          )}
        </Card>
      </main>

      <HousingAdminVerificationModal
        open={isModalOpen}
        onClose={handleCloseModal}
        selectedItem={selectedItem}
        verifyingUserId={processingUserId}
        processingAction={processingAction}
        onApprove={async (userId) => {
          await verifyUserMutation.mutateAsync(userId)
          handleCloseModal()
        }}
        onReject={async (userId) => {
          await rejectUserMutation.mutateAsync(userId)
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