import { useEffect, useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"
import { api } from "../../api/axios"
import CustomHeader from '../../components/CustomHeader';
import Sidebar from "../../components/Sidebar"
import HeroBanner from "@/components/dashboard/HeroBanner"
import Card from "@/components/ui/Card"
import { FiSearch } from "react-icons/fi"
import StudentVerificationsModal from "@/components/dashboard/admin/StudentVerificationsModal"
import Dropdown from "@/components/ApplicationStatus/Dropdown";
import SearchBar from "@/components/SearchBar";
import StylizedStatus from "@/components/BillingDashboard/StylizedStatus";
import Pagination from "@/components/ApplicationStatus/Pagination";
import Toast from "@/components/Toast"

export default function StudentVerificationsPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [processingUserId, setProcessingUserId] = useState<number | null>(null)
  const [processingAction, setProcessingAction] = useState<"approve" | "reject" | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortOrder, setSortOrder] = useState("latest")
  const [isSortOpen, setIsSortOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<any | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [rows, setRows] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)
  const [sortBy, setSortBy] = useState("Date issued (Desc.)")
  const [searchQuery, setSearchQuery] = useState("")
  
  // Toast state
  const [toast, setToast] = useState<{
    show: boolean; type: "success" | "error" | "info" | "warning" | "loading"; title: string; message?: string
  }>({ show: false, type: "success", title: "" })

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

      const res = await api.patch(`/admin/users/${userId}/verify`, {
        roleToAssign: "student",
      })

      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-pending-users"] })
      queryClient.invalidateQueries({ queryKey: ["admin-total-users"] })
      setToast({ show: true, type: "success", title: "Student Verified", message: "The student account has been approved." })
    },
    onError: (error: any) => {
      setToast({ show: true, type: "error", title: "Verification Failed", message: error?.response?.data?.message || "Could not verify student." })
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
      setToast({ show: true, type: "warning", title: "Student Rejected", message: "The student account has been rejected." })
    },
    onError: (error: any) => {
      setToast({ show: true, type: "error", title: "Rejection Failed", message: error?.response?.data?.message || "Could not reject student." })
    },
    onSettled: () => {
      setProcessingUserId(null)
      setProcessingAction(null)
    },
  })

  const pendingUsers = Array.isArray(pendingUsersRaw)
    ? pendingUsersRaw
    : Array.isArray(pendingUsersRaw?.data)
    ? pendingUsersRaw.data
    : []

  const studentPending = pendingUsers.filter(
    (item: any) => item.requestedRole === "student"
  )

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
      await queryClient.invalidateQueries({ queryKey: ["admin-pending-users"] })
      setToast({ show: true, type: "success", title: "Refreshed!", message: "Student requests have been updated." })
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

  const filteredStudents = studentPending
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
      return 0
    })

  const totalPages = Math.max(1, Math.ceil(filteredStudents.length / rows))
  const safePage = Math.min(currentPage, totalPages)
  const startIndex = (safePage - 1) * rows
  const paginated = filteredStudents.slice(startIndex, startIndex + rows)

  const handleOpenModal = (item: any) => {
    setSelectedItem(item)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedItem(null)
  }

  return (
    <div className="flex min-h-screen w-full bg-[#F6F2F4]">
      <div className="flex flex-col min-h-screen w-full">
        <CustomHeader
          title="Student Verifications"
          right={
            <button
              onClick={handleRefresh}
              className="px-3 py-1.5 text-xs font-semibold text-[#6B0F2B] border border-[#6B0F2B]/20 rounded-lg hover:bg-[#6B0F2B]/5 transition"
            >
              Refresh
            </button>
          }
        />
        <main className="flex flex-col flex-1 w-full overflow-x-hidden p-6 gap-6">
          <div className="flex flex-col flex-1 w-full gap-6">
            {/* HERO */}
            <HeroBanner
              greeting="Good day"
              name={user?.fname ?? "Admin"}
              title="Review pending student requests"
              subtitle="Approve student account verification requests."
              type="mini"
            />
            {/* CARD */}
            <Card className="flex flex-1 w-full h-full flex-col rounded-2xl bg-white p-6 shadow-sm">
              {/* HEADER */}
              <div className="flex flex-row justify-between mb-4">
                <div className="flex flex-col">
                  <h4 className="text-[16px] font-bold">
                    Student Verifications
                  </h4>
                  <p className="text-[13px] italic">
                    {filteredStudents.length} pending student request{filteredStudents.length === 1 ? "" : "s"}
                  </p>
                </div>
                <div className="flex flex-row gap-2">
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
              ) : filteredStudents.length === 0 ? (
                <div className="flex flex-col justify-center items-center h-full text-center py-12">
                  <p className="text-[#9A7080] font-medium text-lg">No pending verifications found</p>
                  <p className="text-[#9A7080]/60 text-sm mt-1">When a student applies, they will appear here</p>
                </div>
              ) : (
                <>
                  {/* TABLE */}
                  <div className="flex-1">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-y border-[#F2D9DF]">
                          <th className="p-2 text-left text-[12px] font-bold uppercase tracking-widest text-[#A06B7C]">
                            Student
                          </th>
                          <th className="p-2 text-left text-[12px] font-bold uppercase tracking-widest text-[#A06B7C]">
                            Applied
                          </th>
                          <th className="p-2 text-left text-[12px] font-bold uppercase tracking-widest text-[#A06B7C]">
                            Email
                          </th>
                          <th className="p-2 text-left text-[12px] font-bold uppercase tracking-widest text-[#A06B7C]">
                            Status
                          </th>
                          <th className="p-2 text-center text-[12px] font-bold uppercase tracking-widest text-[#A06B7C]">
                            Action
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginated.map((item: any) => (
                          <tr
                            key={item.user.id}
                            className="hover:bg-[#FFF7F9] transition"
                          >
                            <td className="p-2">
                              <div className="flex items-center gap-2">
                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#6B0F2B] to-[#B32042] font-bold text-white">
                                  {item.user.fname?.[0]?.toUpperCase() ?? "S"}
                                </div>
                                <div>
                                  <p className="text-[14px] font-semibold">
                                    {item.user.fname} {item.user.lname}
                                  </p>
                                  <p className="text-xs text-[#A06B7C]">
                                    Student Account
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="p-2 text-sm text-[#A06B7C]">
                              {formatAppliedDate(item.user.submittedAt)}
                            </td>
                            <td className="p-2 text-sm">
                              {item.user.email}
                            </td>
                            <td className="p-2">
                              <StylizedStatus status="pending" />
                            </td>
                            <td className="p-2 text-center">
                              <button
                                onClick={() => handleOpenModal(item)}
                                className="rounded-xl border border-[#D9B8C4] bg-[#FFF7F9] px-4 py-2 text-[12px] font-semibold text-[#6B0F2B] hover:bg-[#F2D9DF] transition"
                              >
                                Review
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {/* PAGINATION */}
                  <div className="flex flex-col mt-4">
                    <hr className="border-[#F2D9DF] border-t" />
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-xs text-[#9A7080]">
                        {filteredStudents.length === 0
                          ? "No results"
                          : `Showing ${startIndex + 1}–${Math.min(startIndex + rows, filteredStudents.length)} of ${filteredStudents.length}`}
                      </p>
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
                </>
              )}
            </Card>
          </div>
        </main>
      </div>
      
      <StudentVerificationsModal
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