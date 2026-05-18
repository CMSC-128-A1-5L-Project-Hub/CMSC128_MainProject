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
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin-pending-accommodations"],
      })
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

  const totalPages = Math.ceil(filteredAccommodations.length / rows)
  const paginatedAccommodations = filteredAccommodations.slice(
    (currentPage - 1) * rows,
    currentPage * rows
  )

  return (
    <div className="flex min-h-screen bg-[#F6F2F4]">

      <div className="flex flex-col flex-1 min-h-0 min-w-0">
        <CustomHeader
          title="Pending Acommodations">
        </CustomHeader>
        <main className="flex flex-1 overflow-x-hidden p-6 h-full w-full">
          <div className="space-y-6 w-full">
            <HeroBanner
              greeting="Good day"
              name={user?.fname ?? "Admin"}
              title="Review pending accommodation submissions"
              subtitle="Approve or reject accommodations submitted by housing administrators."
              type="mini"
            />
            <Card className="flex h-full flex-col rounded-2xl bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h4 className="text-[16px] font-bold">
                    Pending Accommodations
                  </h4>
                  <p className="text-[13px]">
                    {filteredAccommodations.length} pending accommodation submissions
                  </p>
                </div>
                <div className="flex items-center gap-2">
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
                      onSelect={(label) => { setRows(parseInt(label, 10)); setCurrentPage(1); }}
                    />
                  </div>
                  <Dropdown
                    title="Sort by"
                    items={[
                      { label: "Status", href: "" },
                      { label: "Date issued (Asc.)", href: "" },
                      { label: "Date issued (Desc.)", href: "" },
                      { label: "Amount (Asc.)", href: "" },
                      { label: "Amount (Desc.)", href: "" },
                    ]}
                    direction="down"
                    widthClass="w-32 lg:w-44"
                    titleClass="text-[10px] lg:text-[11px]"
                    selectedClass="text-[12px] lg:text-[13px]"
                    onSelect={(label) => { setSortBy(label); setCurrentPage(1); }}
                  />
                  <SearchBar
                    value={searchQuery}
                    onChange={setSearchQuery}
                    onPageReset={() => setCurrentPage(1)}
                  />
                </div>
              </div>
              {isLoading ? (
                <p className="text-sm text-gray-500">Loading...</p>
              ) : isPendingError ? (
                <p className="text-sm text-red-500">Error loading requests.</p>
              ) : filteredAccommodations.length === 0 ? (
                <div className="flex h-[390px] items-center justify-center border-t border-[#F2D9DF]">
                  <p className="text-lg font-medium text-[#9A7080] text-center">
                    No pending accommodations
                  </p>
                </div>
              ) : (
                <>
                  <div className="">
                    <table className="min-w-full border-collapse">
                      <thead className="">
                        <tr className="border-y border-[#F2D9DF]">
                          <th className="p-2 text-left text-xs font-semibold uppercase tracking-wide text-[#A06B7C]">
                            Accommodation
                          </th>
                          <th className="p-2 text-left text-xs font-semibold uppercase tracking-wide text-[#A06B7C]">
                            Submitted On
                          </th>
                          <th className="p-2 text-left text-xs font-semibold uppercase tracking-wide text-[#A06B7C]">
                            Landlord
                          </th>
                          <th className="p-2 text-center text-xs font-semibold uppercase tracking-wide text-[#A06B7C]">
                            Status
                          </th>
                          <th className="p-2 text-center text-xs font-semibold uppercase tracking-wide text-[#A06B7C]">
                            Action
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedAccommodations.map((item: any) => (
                          <tr
                            key={item.id}
                            className="border-b border-[#F2D9DF] hover:bg-[#FFF7F9]"
                          >
                            <td className="p-2">
                              <div className="flex items-center gap-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#6B0F2B] to-[#B32042] font-bold text-white">
                                  {item.accommodationName?.[0]?.toUpperCase() ?? "A"}
                                </div>
                                <div>
                                  <p className="text-base font-semibold text-[#2A0410]">
                                    {item.accommodationName}
                                  </p>
                                  <p className="text-xs text-[#A06B7C]">
                                    {item.accommodationLocation ?? "—"}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="p-2 text-sm text-[#A06B7C]">
                              {formatAppliedDate(item.createdAt)}
                            </td>
                            <td className="p-2 text-sm text-gray-600">
                              {item.landlord?.user
                                ? `${item.landlord.user.fname} ${item.landlord.user.lname}`
                                : "—"}
                            </td>
                            <td className="p-2 text-center">
                              <span className="rounded-full bg-[#FFF7F9] px-3 py-1 text-xs font-semibold text-[#A06B7C]">
                                Pending
                              </span>
                            </td>
                            <td className="p-2 text-center">
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
                  <div className="mt-auto flex items-center justify-between pt-5">
                    <p className="text-sm text-[#A06B7C]">
                      Showing {Math.min((currentPage - 1) * rows + 1, filteredAccommodations.length)}–
                      {Math.min(currentPage * rows, filteredAccommodations.length)} of{" "}
                      {filteredAccommodations.length} accommodations
                    </p>
                    <div className="flex items-center gap-2">
                      {Array.from({ length: totalPages }, (_, i) => (
                        <button
                          key={i + 1}
                          onClick={() => setCurrentPage(i + 1)}
                          className={`h-9 w-9 rounded-lg text-sm font-semibold ${
                            currentPage === i + 1
                              ? "bg-[#6B0F2B] text-white"
                              : "border border-[#F2D9DF] text-[#6B0F2B] hover:bg-[#FFF7F9]"
                          }`}
                        >
                          {i + 1}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </Card>
          </div>
        </main>
      </div>

      <AccommodationVerificationModal
        open={isModalOpen}
        onClose={handleCloseModal}
        selectedItem={selectedItem}
        verifyingAccommodationId={verifyingAccommodationId}
        onApprove={async (id) => {
          await verifyAccommodationMutation.mutateAsync({ id, status: "verified" })
          handleCloseModal()
        }}
        onReject={async (id) => {
          await verifyAccommodationMutation.mutateAsync({ id, status: "rejected" })
          handleCloseModal()
        }}
      />
    </div>
  )
}
