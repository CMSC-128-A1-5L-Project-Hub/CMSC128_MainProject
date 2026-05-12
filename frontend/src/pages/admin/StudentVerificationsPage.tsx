import { useEffect, useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"
import { api } from "../../api/axios"
import Sidebar from "../../components/Sidebar"
import HeroBanner from "@/components/dashboard/HeroBanner"
import Card from "@/components/ui/Card"
import { FiSearch } from "react-icons/fi"
import StudentVerificationsModal from "@/components/dashboard/admin/StudentVerificationsModal"

export default function StudentVerificationsPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [verifyingUserId, setVerifyingUserId] = useState<number | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortOrder, setSortOrder] = useState("latest")
  const [isSortOpen, setIsSortOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<any | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

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
      setVerifyingUserId(userId)

      const res = await api.patch(`/admin/users/${userId}/verify`, {
        roleToAssign: "student",
      })

      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-pending-users"] })
      queryClient.invalidateQueries({ queryKey: ["admin-total-users"] })
    },
    onSettled: () => {
      setVerifyingUserId(null)
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
    if (isError) navigate("/auth/signin")
  }, [isError, navigate])

  useEffect(() => {
    if (user && user.role !== "manager" && user.role !== "super_admin") {
      navigate("/auth/signin")
    }
  }, [user, navigate])

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
        fullName.includes(searchTerm.toLowerCase()) ||
        email.includes(searchTerm.toLowerCase())
      )
    })
    .sort((a: any, b: any) => {
      const dateA = new Date(a.user.createdAt ?? 0).getTime()
      const dateB = new Date(b.user.createdAt ?? 0).getTime()

      return sortOrder === "latest" ? dateB - dateA : dateA - dateB
    })

    const handleOpenModal = (item: any) => {
      setSelectedItem(item)
      setIsModalOpen(true)
    }

    const handleCloseModal = () => {
      setIsModalOpen(false)
      setSelectedItem(null)
    }

  return (
    <div className="flex min-h-screen bg-[#F9F4F5]">
      <Sidebar
        role={user?.role}
        profile={{
          fullName: `${user?.fname ?? ""} ${user?.lname ?? ""}`.trim(),
          shortName: user?.fname ?? "",
          email: user?.email ?? "",
        }}
      />

      <main className="mt-12 flex-1 overflow-x-hidden p-5 lg:mt-0 lg:p-8">
        <div className="space-y-6">
          {/* TITLE */}
          <div className="relative mb-2 flex items-center border-b border-[#6B0F2B]/7 pb-1 pl-10 lg:pl-0">
            <div className="mr-2 mt-1 hidden h-8 w-2 rounded-xl bg-gradient-to-br from-[#6B0F2B] to-[#9E2040] lg:inline" />
            <h1 className="font-serif text-4xl font-bold italic text-[#6B0F2B]">
              Student Verifications
            </h1>
          </div>

          {/* HERO */}
          <HeroBanner
            greeting="Good day"
            name={user?.fname ?? "Admin"}
            title="Review pending student requests"
            subtitle="Approve student account verification requests."
            type="mini"
          />

          {/* CARD */}
          <Card className="flex min-h-[620px] flex-col rounded-3xl border border-[#F2D9DF] bg-white p-8 shadow-sm">
            {/* HEADER */}
            <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h4 className="text-xl font-semibold text-[#2A0410]">
                  Student Verifications
                </h4>
                <p className="mt-1 text-sm text-[#A06B7C]">
                  {filteredStudents.length} pending student requests
                </p>
              </div>

              {/* SORT + SEARCH */}
              <div className="flex items-center gap-3">
                {/* SORT */}
                <div className="relative w-[200px]">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setIsSortOpen((prev) => !prev)
                    }}
                    className="h-[68px] w-full rounded-2xl border border-[#F2D9DF] bg-white px-4 text-left shadow-sm hover:border-[#D9B8C4]"
                  >
                    <p className="text-xs font-bold uppercase tracking-wide text-[#A06B7C]">
                      Sort By
                    </p>

                    <div className="mt-1 flex items-center justify-between">
                      <span className="text-base font-semibold text-[#2A0410]">
                        {sortOrder === "latest"
                          ? "Latest First"
                          : "Oldest First"}
                      </span>

                      <span
                        className={`text-[#6B0F2B] transition-transform ${
                          isSortOpen ? "rotate-180" : ""
                        }`}
                      >
                        ▾
                      </span>
                    </div>
                  </button>

                  {isSortOpen && (
                    <div className="absolute z-20 mt-2 w-full rounded-xl border border-[#F2D9DF] bg-white shadow-lg">
                      <button
                        onClick={() => {
                          setSortOrder("latest")
                          setIsSortOpen(false)
                        }}
                        className="w-full px-4 py-3 text-left text-sm hover:bg-[#FFF7F9]"
                      >
                        Latest First
                      </button>

                      <button
                        onClick={() => {
                          setSortOrder("oldest")
                          setIsSortOpen(false)
                        }}
                        className="w-full px-4 py-3 text-left text-sm hover:bg-[#FFF7F9]"
                      >
                        Oldest First
                      </button>
                    </div>
                  )}
                </div>

                {/* SEARCH */}
                <div className="relative">
                  <FiSearch className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#C9A6B3]" />

                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search students..."
                    className="h-[68px] w-[220px] rounded-2xl border border-[#F2D9DF] bg-[#FFF7F9] pl-11 pr-4 text-sm text-[#2A0410] outline-none placeholder:text-[#C9A6B3] focus:ring-2 focus:ring-[#D9B8C4]"
                  />
                </div>
              </div>
            </div>

            {/* CONTENT */}
            {isLoading ? (
              <p className="text-sm text-gray-500">Loading...</p>
            ) : isPendingError ? (
              <p className="text-sm text-red-500">Error loading requests.</p>
            ) : filteredStudents.length === 0 ? (
              <div className="flex h-[390px] items-center justify-center border-t border-[#F2D9DF]">
                <p className="text-5xl font-light tracking-wide text-gray-200">
                  NO PENDING STUDENTS
                </p>
              </div>
            ) : (
              <>
                {/* TABLE */}
                <div className="-mx-6">
                  <table className="min-w-full border-collapse">
                    <thead className="bg-[#FFF7F9]">
                      <tr className="border-y border-[#F2D9DF]">
                        <th className="px-8 py-4 text-left text-xs font-semibold uppercase tracking-wide text-[#A06B7C]">
                          Student
                        </th>
                        <th className="px-8 py-4 text-left text-xs font-semibold uppercase tracking-wide text-[#A06B7C]">
                          Applied
                        </th>
                        <th className="px-8 py-4 text-left text-xs font-semibold uppercase tracking-wide text-[#A06B7C]">
                          Email
                        </th>
                        <th className="px-8 py-4 text-center text-xs font-semibold uppercase tracking-wide text-[#A06B7C]">
                          Status
                        </th>
                        <th className="px-8 py-4 text-center text-xs font-semibold uppercase tracking-wide text-[#A06B7C]">
                          Action
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredStudents.map((item: any) => (
                        <tr
                          key={item.user.id}
                          className="border-b border-[#F2D9DF] hover:bg-[#FFF7F9]"
                        >
                          <td className="px-8 py-5">
                            <div className="flex items-center gap-4">
                              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#6B0F2B] to-[#B32042] font-bold text-white">
                                {item.user.fname?.[0]?.toUpperCase() ?? "S"}
                              </div>

                              <div>
                                <p className="text-base font-semibold text-[#2A0410]">
                                  {item.user.fname} {item.user.lname}
                                </p>
                                <p className="text-xs text-[#A06B7C]">
                                  Student Account
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
                              className="rounded-xl border border-[#D9B8C4] bg-[#FFF7F9] px-6 py-2 text-sm font-semibold text-[#6B0F2B] hover:bg-[#F2D9DF]"
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
                <div className="mt-auto flex items-center justify-between pt-5">
                  <p className="text-sm text-[#A06B7C]">
                    Showing 1–{filteredStudents.length} of{" "}
                    {filteredStudents.length} requests
                  </p>

                  <div className="flex items-center gap-2">
                    <button className="h-9 w-9 rounded-lg bg-[#6B0F2B] text-sm font-semibold text-white">
                      1
                    </button>
                  </div>
                </div>
              </>
            )}
          </Card>
        </div>
      </main>
      <StudentVerificationsModal
        open={isModalOpen}
        onClose={handleCloseModal}
        selectedItem={selectedItem}
        verifyingUserId={verifyingUserId}
        onApprove={async (userId) => {
          await verifyUserMutation.mutateAsync(userId)
          handleCloseModal()
        }}
        onReject={async (userId) => {
          await verifyUserMutation.mutateAsync(userId)
          handleCloseModal()  
        }}
      />
    </div>
  )
}