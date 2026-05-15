import { useEffect, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"
import { api } from "../../api/axios"
import Sidebar from "../../components/Sidebar"
import HeroBanner from "@/components/dashboard/HeroBanner"
import Card from "@/components/ui/Card"
import { FiSearch } from "react-icons/fi"

const LOGS_PER_PAGE = 20

export default function ActivityLogsPage() {
  const navigate = useNavigate()

  const [searchTerm, setSearchTerm] = useState("")
  const [sortOrder, setSortOrder] = useState("latest")
  const [isSortOpen, setIsSortOpen] = useState(false)
  const [filterDate, setFilterDate] = useState("")
  const [filterAction, setFilterAction] = useState("")
  const [currentPage, setCurrentPage] = useState(1)

  const { data: user, isLoading: isUserLoading, isError } = useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const res = await api.get("/me")
      return res.data
    },
    retry: false,
  })

  const {
    data: logsRaw,
    isLoading: isLogsLoading,
    isError: isLogsError,
  } = useQuery({
    queryKey: ["admin-logs", filterDate, filterAction],
    queryFn: async () => {
      const params: Record<string, string> = {}
      if (filterDate) params.date = filterDate
      if (filterAction) params.entity_type = filterAction

      const res = await api.get("/admin/logs", { params })
      return res.data
    },
  })

  useEffect(() => {
    setCurrentPage(1)
  }, [filterDate, filterAction, searchTerm, sortOrder])

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

  const logs: any[] = Array.isArray(logsRaw)
    ? logsRaw
    : Array.isArray(logsRaw?.data)
    ? logsRaw.data
    : []

  const formatAction = (action: string) => {
    if (!action) return "Activity"
    return action
      .toLowerCase()
      .replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase())
  }

  const formatDate = (timestamp: string) => {
    if (!timestamp) return "N/A"
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const formatTime = (timestamp: string) => {
    if (!timestamp) return "N/A"
    return new Date(timestamp).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const filteredLogs = logs
    .filter((log: any) => {
      if (!searchTerm) return true
      const action = formatAction(log.activityType ?? "").toLowerCase()
      const details = (log.activityDetails ?? "").toLowerCase()
      const term = searchTerm.toLowerCase()
      return action.includes(term) || details.includes(term)
    })
    .sort((a: any, b: any) => {
      const dateA = new Date(a.logTimestamp ?? 0).getTime()
      const dateB = new Date(b.logTimestamp ?? 0).getTime()
      return sortOrder === "latest" ? dateB - dateA : dateA - dateB
    })

  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / LOGS_PER_PAGE))
  const safePage = Math.min(currentPage, totalPages)
  const startIndex = (safePage - 1) * LOGS_PER_PAGE
  const pagedLogs = filteredLogs.slice(startIndex, startIndex + LOGS_PER_PAGE)

  // Sliding window: always show exactly 3 consecutive page numbers
  // Window starts so the current page stays in the middle when possible
  const getWindowStart = () => {
    if (totalPages <= 3) return 1
    if (safePage === 1) return 1
    if (safePage === totalPages) return totalPages - 2
    return safePage - 1
  }
  const windowStart = getWindowStart()
  const visiblePages = Array.from(
    { length: Math.min(3, totalPages) },
    (_, i) => windowStart + i
  )

  const handlePrev = () => setCurrentPage((p) => Math.max(1, p - 1))
  const handleNext = () => setCurrentPage((p) => Math.min(totalPages, p + 1))

  return (
    <div className="flex min-h-screen bg-[#F9F4F5]">

      <main className="mt-12 flex-1 overflow-x-hidden p-5 lg:mt-0 lg:p-8">
        <div className="space-y-6">
          {/* TITLE */}
          <div className="relative mb-2 flex items-center border-b border-[#6B0F2B]/7 pb-1 pl-10 lg:pl-0">
            <div className="mr-2 mt-1 hidden h-8 w-2 rounded-xl bg-gradient-to-br from-[#6B0F2B] to-[#9E2040] lg:inline" />
            <h1 className="font-serif text-4xl font-bold italic text-[#6B0F2B]">
              Activity Logs
            </h1>
          </div>

          {/* HERO */}
          <HeroBanner
            greeting="Good day"
            name={user?.fname ?? "Admin"}
            title="Monitor system activity"
            subtitle="Review all actions made across the platform."
            type="mini"
          />

          {/* CARD */}
          <Card className="flex min-h-[620px] flex-col rounded-3xl border border-[#F2D9DF] bg-white p-8 shadow-sm">
            {/* HEADER */}
            <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h4 className="text-xl font-semibold text-[#2A0410]">
                  Activity Logs
                </h4>
                <p className="mt-1 text-sm text-[#A06B7C]">
                  {filteredLogs.length} log{filteredLogs.length !== 1 ? "s" : ""} found
                </p>
              </div>

              {/* FILTERS ROW */}
              <div className="flex flex-wrap items-center gap-3">
                {/* DATE FILTER */}
                <input
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="h-[68px] rounded-2xl border border-[#F2D9DF] bg-white px-4 text-sm text-[#2A0410] shadow-sm outline-none focus:ring-2 focus:ring-[#C9973A] hover:border-[#D9B8C4]"
                />

                {/* ACTION TYPE FILTER */}
                <select
                  value={filterAction}
                  onChange={(e) => setFilterAction(e.target.value)}
                  className="h-[68px] rounded-2xl border border-[#F2D9DF] bg-white px-4 text-sm text-[#2A0410] shadow-sm outline-none focus:ring-2 focus:ring-[#C9973A] hover:border-[#D9B8C4]"
                >
                  <option value="">All Actions</option>
                  <option value="application">Application</option>
                  <option value="assignment">Assignment</option>
                  <option value="payment">Payment</option>
                  <option value="room">Room</option>
                  <option value="account">Account</option>
                  <option value="accommodation">Accommodation</option>
                  <option value="document">Document</option>
                  <option value="fee">Fee/Billing</option>
                </select>

                {/* SORT */}
                <div className="relative w-[180px]">
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
                        {sortOrder === "latest" ? "Latest First" : "Oldest First"}
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
                        onClick={() => { setSortOrder("latest"); setIsSortOpen(false) }}
                        className="w-full px-4 py-3 text-left text-sm hover:bg-[#FFF7F9]"
                      >
                        Latest First
                      </button>
                      <button
                        onClick={() => { setSortOrder("oldest"); setIsSortOpen(false) }}
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
                    placeholder="Search logs..."
                    className="h-[68px] w-[200px] rounded-2xl border border-[#F2D9DF] bg-[#FFF7F9] pl-11 pr-4 text-sm text-[#2A0410] outline-none placeholder:text-[#C9A6B3] focus:ring-2 focus:ring-[#D9B8C4]"
                  />
                </div>
              </div>
            </div>

            {/* CONTENT */}
            {isLogsLoading ? (
              <p className="text-sm text-gray-500">Loading...</p>
            ) : isLogsError ? (
              <p className="text-sm text-red-500">Error loading logs.</p>
            ) : filteredLogs.length === 0 ? (
              <div className="flex h-[390px] items-center justify-center border-t border-[#F2D9DF]">
                <p className="text-lg font-medium text-[#9A7080] text-center">
                  No activity logs found
                </p>
              </div>
            ) : (
              <>
                {/* SCROLLABLE TABLE */}
                <div className="-mx-6 max-h-[440px] overflow-y-auto">
                  <table className="min-w-full border-separate border-spacing-0">
                    <thead className="sticky top-0 z-10 bg-[#FFF7F9]">
                      <tr>
                        <th className="border-y border-[#F2D9DF] px-8 py-4 text-left text-xs font-semibold uppercase tracking-wide text-[#A06B7C]">
                          Action
                        </th>
                        <th className="border-y border-[#F2D9DF] px-8 py-4 text-left text-xs font-semibold uppercase tracking-wide text-[#A06B7C]">
                          Details
                        </th>
                        <th className="border-y border-[#F2D9DF] px-8 py-4 text-left text-xs font-semibold uppercase tracking-wide text-[#A06B7C]">
                          Performed By
                        </th>
                        <th className="border-y border-[#F2D9DF] px-8 py-4 text-left text-xs font-semibold uppercase tracking-wide text-[#A06B7C]">
                          Date
                        </th>
                        <th className="border-y border-[#F2D9DF] px-8 py-4 text-left text-xs font-semibold uppercase tracking-wide text-[#A06B7C]">
                          Time
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {pagedLogs.map((log: any) => (
                        <tr key={log.id} className="hover:bg-[#FFF7F9]">
                          <td className="border-b border-[#F2D9DF] px-8 py-5">
                            <span className="text-xs font-semibold text-[#6B0F2B]">
                              {formatAction(log.activityType)}
                            </span>
                          </td>

                          <td className="border-b border-[#F2D9DF] px-8 py-5 max-w-xs text-sm text-gray-600">
                            <p className="truncate" title={log.activityDetails}>
                              {log.activityDetails ?? "—"}
                            </p>
                          </td>

                          <td className="border-b border-[#F2D9DF] px-8 py-5">
                            {log.user ? (
                              <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#6B0F2B] to-[#B32042] text-sm font-bold text-white">
                                  {log.user.fname?.[0]?.toUpperCase() ?? "?"}
                                </div>
                                <div>
                                  <p className="text-sm font-semibold text-[#2A0410]">
                                    {log.user.fname} {log.user.lname}
                                  </p>
                                  <p className="text-xs text-[#A06B7C]">
                                    {log.user.email}
                                  </p>
                                </div>
                              </div>
                            ) : (
                              <span className="text-sm text-[#A06B7C]">System</span>
                            )}
                          </td>

                          <td className="border-b border-[#F2D9DF] px-8 py-5 text-sm text-[#A06B7C]">
                            {formatDate(log.logTimestamp)}
                          </td>

                          <td className="border-b border-[#F2D9DF] px-8 py-5 text-sm text-[#A06B7C]">
                            {formatTime(log.logTimestamp)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* FOOTER */}
                <div className="mt-auto flex items-center justify-between pt-5">
                  <p className="text-sm text-[#A06B7C]">
                    Showing {startIndex + 1}–{Math.min(startIndex + LOGS_PER_PAGE, filteredLogs.length)} of{" "}
                    {filteredLogs.length} log{filteredLogs.length !== 1 ? "s" : ""}
                  </p>

                  <div className="flex items-center gap-1">
                    {/* Prev */}
                    <button
                      onClick={handlePrev}
                      disabled={safePage === 1}
                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#F2D9DF] text-sm text-[#6B0F2B] hover:bg-[#FFF7F9] disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      ‹
                    </button>

                    {/* Sliding window of 3 pages */}
                    {visiblePages.map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-semibold transition-colors ${
                          safePage === page
                            ? "bg-[#6B0F2B] text-white"
                            : "border border-[#F2D9DF] text-[#6B0F2B] hover:bg-[#FFF7F9]"
                        }`}
                      >
                        {page}
                      </button>
                    ))}

                    {/* Next */}
                    <button
                      onClick={handleNext}
                      disabled={safePage === totalPages}
                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#F2D9DF] text-sm text-[#6B0F2B] hover:bg-[#FFF7F9] disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      ›
                    </button>
                  </div>
                </div>
              </>
            )}
          </Card>
        </div>
      </main>
    </div>
  )
}