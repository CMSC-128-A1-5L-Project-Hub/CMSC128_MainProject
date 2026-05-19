import { useEffect, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"
import { api } from "../../api/axios"
import Sidebar from "../../components/Sidebar"
import HeroBanner from "@/components/dashboard/HeroBanner"
import Card from "@/components/ui/Card"
import { FiSearch } from "react-icons/fi"
import CustomHeader from '../../components/CustomHeader';
import Dropdown from "@/components/ApplicationStatus/Dropdown"
import SearchBar from "@/components/SearchBar"
import Pagination from "@/components/ApplicationStatus/Pagination"
import Toast from "@/components/Toast"

export default function ActivityLogsPage() {
  const navigate = useNavigate()

  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("Date issued (Desc.)")
  const [filterDate, setFilterDate] = useState("")
  const [filterAction, setFilterAction] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [logsPerPage, setLogsPerPage] = useState(20)
  
  // Toast state
  const [toast, setToast] = useState<{
    show: boolean; type: "success" | "error" | "info" | "warning" | "loading"; title: string; message?: string
  }>({ show: false, type: "success", title: "" })

  const { data: user, isLoading: isUserLoading, isError, refetch: refetchUser } = useQuery({
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
    refetch: refetchLogs,
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
  }, [filterDate, filterAction, searchQuery, sortBy, logsPerPage])

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
      if (!searchQuery) return true
      const action = formatAction(log.activityType ?? "").toLowerCase()
      const details = (log.activityDetails ?? "").toLowerCase()
      const term = searchQuery.toLowerCase()
      return action.includes(term) || details.includes(term)
    })
    .sort((a: any, b: any) => {
      const dateA = new Date(a.logTimestamp ?? 0).getTime()
      const dateB = new Date(b.logTimestamp ?? 0).getTime()
      if (sortBy === "Date issued (Asc.)") return dateA - dateB
      if (sortBy === "Date issued (Desc.)") return dateB - dateA
      return dateB - dateA // default: newest first
    })

  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / logsPerPage))
  const safePage = Math.min(currentPage, totalPages)
  const startIndex = (safePage - 1) * logsPerPage
  const pagedLogs = filteredLogs.slice(startIndex, startIndex + logsPerPage)

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

  // Refresh logs handler with toast
  const handleRefreshLogs = async () => {
    setToast({ show: true, type: "loading", title: "Refreshing...", message: "Fetching latest logs." })
    try {
      await refetchLogs()
      setToast({ show: true, type: "success", title: "Refreshed!", message: "Logs have been updated." })
    } catch (error) {
      setToast({ show: true, type: "error", title: "Refresh Failed", message: "Could not refresh logs." })
    }
  }

  // Copy log details to clipboard
  const handleCopyLogDetails = (details: string) => {
    navigator.clipboard.writeText(details)
    setToast({ show: true, type: "success", title: "Copied!", message: "Log details copied to clipboard." })
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#F6F2F4]">
      <CustomHeader title="Activity Logs" />
      <main className="flex flex-col flex-1 min-h-0 p-6 gap-6">
        <div>
          <HeroBanner
            greeting="Good day"
            name={user?.fname ?? "Admin"}
            title="Monitor system activity"
            subtitle="Review all actions made across the platform."
            type="mini"
          />
        </div>
        {/* CARD */}
        <Card className="flex flex-col flex-1 min-h-0 bg-white rounded-2xl p-6">
          {/* HEADER */}
          <div className="flex justify-between items-center mb-2">
            <div className="flex flex-col">
              <h4 className="text-[16px] font-bold text-[#2A0410]">
                Activity Logs
              </h4>
              <p className="text-[13px] italic">
                {filteredLogs.length} log{filteredLogs.length !== 1 ? "s" : ""} found
              </p>
            </div>
            <div className="flex flex-row gap-2 items-center">
              <button
                onClick={handleRefreshLogs}
                className="px-3 py-1.5 text-xs font-semibold text-[#6B0F2B] border border-[#6B0F2B]/20 rounded-lg hover:bg-[#6B0F2B]/5 transition"
              >
                Refresh
              </button>
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
                    setLogsPerPage(parseInt(label, 10))
                    setCurrentPage(1)
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
                  setSortBy(label)
                  setCurrentPage(1)
                  setToast({ show: true, type: "info", title: "Sorted", message: `Logs sorted by ${label}.` })
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
          {isLogsLoading ? (
            <div className="flex h-[390px] items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6B0F2B]"></div>
              <p className="text-sm text-gray-500 ml-2">Loading logs...</p>
            </div>
          ) : isLogsError ? (
            <div className="flex h-[390px] items-center justify-center">
              <p className="text-sm text-red-500">Error loading logs. Please try again.</p>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="flex h-[390px] items-center justify-center border-t border-[#F2D9DF]">
              <p className="text-lg font-medium text-[#9A7080] text-center">
                No activity logs found
              </p>
            </div>
          ) : (
            <>
              {/* SCROLLABLE TABLE */}
              <div className="max-h-[440px] overflow-y-auto mt-3">
                <table className="min-w-full border-separate border-spacing-0">
                  <thead className="sticky top-0 z-10 bg-white">
                    <tr>
                      <th className="border-y border-[#F2D9DF] p-2 text-left text-xs font-bold uppercase tracking-widest text-[#A06B7C]">
                        Action
                      </th>
                      <th className="border-y border-[#F2D9DF] p-2 text-left text-xs font-bold uppercase tracking-widest text-[#A06B7C]">
                        Details
                      </th>
                      <th className="border-y border-[#F2D9DF] p-2 text-left text-xs font-bold uppercase tracking-widest text-[#A06B7C]">
                        Performed By
                      </th>
                      <th className="border-y border-[#F2D9DF] p-2 text-left text-xs font-bold uppercase tracking-widest text-[#A06B7C]">
                        Date
                      </th>
                      <th className="border-y border-[#F2D9DF] p-2 text-left text-xs font-bold uppercase tracking-widest text-[#A06B7C]">
                        Time
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {pagedLogs.map((log: any) => (
                      <tr key={log.id} className="hover:bg-[#FFF7F9] group">
                        <td className="p-2">
                          <span className="text-xs font-semibold text-[#6B0F2B]">
                            {formatAction(log.activityType)}
                          </span>
                        </td>
                        <td className="p-2 max-w-xs text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <p className="truncate" title={log.activityDetails}>
                              {log.activityDetails ?? "—"}
                            </p>
                            {log.activityDetails && (
                              <button
                                onClick={() => handleCopyLogDetails(log.activityDetails)}
                                className="opacity-0 group-hover:opacity-100 transition p-1 rounded hover:bg-gray-100"
                                title="Copy details"
                              >
                                <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                              </button>
                            )}
                          </div>
                        </td>
                        <td className="p-2">
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
                        <td className="p-2 text-sm text-[#A06B7C]">
                          {formatDate(log.logTimestamp)}
                        </td>
                        <td className="p-2 text-sm text-[#A06B7C]">
                          {formatTime(log.logTimestamp)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* FOOTER */}
              <div className="flex flex-col mt-4">
                <hr className="border-[#6B0F2B]/10" />
                <div className="flex flex-row justify-between items-center mt-3">
                  <div className="flex justify-center items-center gap-2">
                    <span className="text-[13px] text-[#A06B7C] justify-center items-center">
                      Showing {startIndex + 1}–{Math.min(startIndex + logsPerPage, filteredLogs.length)} of{" "}
                      {filteredLogs.length} log{filteredLogs.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="flex gap-2 text-[12px] lg:text-[15px]">
                    <Pagination
                      totalPages={totalPages}
                      currentPage={currentPage}
                      onPageChange={(page) => {
                        setCurrentPage(page)
                        setToast({ show: true, type: "info", title: "Page Changed", message: `Viewing page ${page} of ${totalPages}.` })
                      }}
                    />
                  </div>
                </div>
              </div>
            </>
          )}
        </Card>
      </main>

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