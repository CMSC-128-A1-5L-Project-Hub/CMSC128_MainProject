import { useEffect, useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"
import { api } from "../../api/axios"
import HeroBanner from "@/components/dashboard/HeroBanner"
import Card from "@/components/ui/Card"
import { FiSearch } from "react-icons/fi"
import AccommodationVerificationModal from "@/components/dashboard/admin/PendingAccommodationsModal"

export default function PendingAccommodationsPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [verifyingAccommodationId, setVerifyingAccommodationId] = useState<number | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortOrder, setSortOrder] = useState("latest")
  const [isSortOpen, setIsSortOpen] = useState(false)
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

      const q = searchTerm.toLowerCase()
      return name.includes(q) || location.includes(q) || landlordName.includes(q)
    })
    .sort((a: any, b: any) => {
      const dateA = new Date(a.createdAt ?? 0).getTime()
      const dateB = new Date(b.createdAt ?? 0).getTime()

      return sortOrder === "latest" ? dateB - dateA : dateA - dateB
    })

  return (
    <div className="flex min-h-screen bg-[#F9F4F5]">

      <main className="mt-12 flex-1 overflow-x-hidden p-5 lg:mt-0 lg:p-8">
        <div className="space-y-6">
          <div className="relative mb-2 flex items-center border-b border-[#6B0F2B]/7 pb-1 pl-10 lg:pl-0">
            <div className="mr-2 mt-1 hidden h-8 w-2 rounded-xl bg-gradient-to-br from-[#6B0F2B] to-[#9E2040] lg:inline" />
            <h1 className="font-serif text-4xl font-bold italic text-[#6B0F2B]">
              Pending Accommodations
            </h1>
          </div>

          <HeroBanner
            greeting="Good day"
            name={user?.fname ?? "Admin"}
            title="Review pending accommodation submissions"
            subtitle="Approve or reject accommodations submitted by housing administrators."
            type="mini"
          />

          <Card className="flex min-h-[620px] flex-col rounded-3xl border border-[#F2D9DF] bg-white p-8 shadow-sm">
            <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h4 className="text-xl font-semibold text-[#2A0410]">
                  Pending Accommodations
                </h4>
                <p className="mt-1 text-sm text-[#A06B7C]">
                  {filteredAccommodations.length} pending accommodation submissions
                </p>
              </div>

              <div className="flex items-center gap-3">
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

                <div className="relative">
                  <FiSearch className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#C9A6B3]" />

                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search accommodations..."
                    className="h-[68px] w-[280px] rounded-2xl border border-[#F2D9DF] bg-[#FFF7F9] pl-11 pr-4 text-sm text-[#2A0410] outline-none placeholder:text-[#C9A6B3] focus:ring-2 focus:ring-[#D9B8C4]"
                  />
                </div>
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
                <div className="-mx-6">
                  <table className="min-w-full border-collapse">
                    <thead className="bg-[#FFF7F9]">
                      <tr className="border-y border-[#F2D9DF]">
                        <th className="px-8 py-4 text-left text-xs font-semibold uppercase tracking-wide text-[#A06B7C]">
                          Accommodation
                        </th>
                        <th className="px-8 py-4 text-left text-xs font-semibold uppercase tracking-wide text-[#A06B7C]">
                          Submitted
                        </th>
                        <th className="px-8 py-4 text-left text-xs font-semibold uppercase tracking-wide text-[#A06B7C]">
                          Landlord
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
                      {filteredAccommodations.map((item: any) => (
                        <tr
                          key={item.id}
                          className="border-b border-[#F2D9DF] hover:bg-[#FFF7F9]"
                        >
                          <td className="px-8 py-5">
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

                          <td className="px-8 py-5 text-sm text-[#A06B7C]">
                            {formatAppliedDate(item.createdAt)}
                          </td>

                          <td className="px-8 py-5 text-sm text-gray-600">
                            {item.landlord?.user
                              ? `${item.landlord.user.fname} ${item.landlord.user.lname}`
                              : "—"}
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

                <div className="mt-auto flex items-center justify-between pt-5">
                  <p className="text-sm text-[#A06B7C]">
                    Showing 1–{filteredAccommodations.length} of{" "}
                    {filteredAccommodations.length} accommodations
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
