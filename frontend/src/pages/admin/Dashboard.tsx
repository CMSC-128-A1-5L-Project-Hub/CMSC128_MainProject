import React, { useEffect, useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"
import Sidebar from "../../components/Sidebar"
import HeroBanner from "@/components/dashboard/HeroBanner"
import Card from "@/components/ui/Card"
import RecentActivityLogs from "@/components/dashboard/admin/RecentActivityLogs"
import { api } from "../../api/axios"

const AdminDashboard = () => {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const [academicYear, setAcademicYear] = useState("")
  const [semester, setSemester] = useState("")
  const [filterDate, setFilterDate] = useState("")
  const [filterAction, setFilterAction] = useState("")
  const [verifyingUserId, setVerifyingUserId] = useState<number | null>(null)
  const [verifyingAccommodationId, setVerifyingAccommodationId] = useState<number | null>(null)

  const {
    data: user,
    isLoading: isUserLoading,
    isError,
  } = useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const res = await api.get("/me")
      return res.data
    },
    retry: false,
  })

  const {
    data: pendingUsersRaw,
    isLoading: isPendingLoading,
    isError: isPendingError,
  } = useQuery({
    queryKey: ["admin-pending-users"],
    queryFn: async () => {
      const res = await api.get("/admin/users/pending")
      return res.data
    },
  })

  const {
    data: settings,
    isLoading: isSettingsLoading,
    isError: isSettingsError,
  } = useQuery({
    queryKey: ["admin-settings"],
    queryFn: async () => {
      const res = await api.get("/admin/settings")
      return res.data
    },
  })

  const {
    data: totalUsersData,
    isLoading: isTotalUsersLoading,
    isError: isTotalUsersError,
  } = useQuery({
    queryKey: ["admin-total-users"],
    queryFn: async () => {
      const res = await api.get("/admin/users/count")
      return res.data
    },
  })

  const {
    data: availableRoomsData,
    isLoading: isRoomsLoading,
    isError: isRoomsError,
  } = useQuery({
    queryKey: ["admin-available-rooms"],
    queryFn: async () => {
      const res = await api.get("/admin/rooms/available/count")
      return res.data
    },
  })

  const {
    data: recentLogs,
    isLoading: isRecentLogsLoading,
    isError: isRecentLogsError,
  } = useQuery({
    queryKey: ["admin-recent-logs"],
    queryFn: async () => {
      const res = await api.get("/admin/logs")
      return res.data
    },
  })

  const {
    data: logs,
    isLoading: isLogsLoading,
    isError: isLogsError,
  } = useQuery({
    queryKey: ["admin-logs", filterDate, filterAction],
    queryFn: async () => {
      const params: any = {}

      if (filterDate) params.date = filterDate
      if (filterAction) params.entity_type = filterAction

      const res = await api.get("/admin/logs", { params })
      return res.data
    },
  })

  const {
    data: pendingAccommodationsRaw,
    isLoading: isPendingAccommodationsLoading,
  } = useQuery({
    queryKey: ["admin-pending-accommodations"],
    queryFn: async () => {
      const res = await api.get("/admin/accommodations/pending")
      return res.data
    },
  })

  const updateSettingsMutation = useMutation({
    mutationFn: async () => {
      const semesterMapReverse: Record<string, string> = {
        "1st Semester": "first_sem",
        "2nd Semester": "second_sem",
        Midyear: "midyear",
      }

      const res = await api.put("/admin/settings", {
        currentSy: academicYear,
        currentSemester: semesterMapReverse[semester] ?? semester,
      })

      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-settings"] })
    },
  })

  const verifyUserMutation = useMutation({
    mutationFn: async ({
      userId,
      roleToAssign,
    }: {
      userId: number
      roleToAssign: "student" | "landlord"
    }) => {
      setVerifyingUserId(userId)

      const res = await api.patch(`/admin/users/${userId}/verify`, {
        roleToAssign,
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

  const pendingUsers = Array.isArray(pendingUsersRaw)
    ? pendingUsersRaw
    : Array.isArray(pendingUsersRaw?.data)
    ? pendingUsersRaw.data
    : []

  const pendingAccommodations = Array.isArray(pendingAccommodationsRaw)
    ? pendingAccommodationsRaw
    : []

  const logsList = Array.isArray(logs)
    ? logs
    : Array.isArray(logs?.data)
    ? logs.data
    : []

  const recentLogsList = Array.isArray(recentLogs)
    ? recentLogs
    : Array.isArray(recentLogs?.data)
    ? recentLogs.data
    : []

  const studentPending = pendingUsers.filter(
    (item: any) => item.requestedRole === "student"
  )

  const housingAdminPending = pendingUsers.filter(
    (item: any) => item.requestedRole === "landlord"
  )

  useEffect(() => {
    if (isError) navigate("/auth/signin")
  }, [isError, navigate])

  useEffect(() => {
    if (user && user.role !== "manager" && user.role !== "super_admin") {
      navigate("/auth/signin")
    }
  }, [user, navigate])

  useEffect(() => {
    if (settings) {
      setAcademicYear(settings.currentSy ?? "")
      setSemester(settings.currentSemester ?? "")
    }
  }, [settings])

  const formatAction = (action: string) => {
    if (!action) return "Activity"

    return action
      .replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase())
  }

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString()
  }

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString()
  }

  const formatAppliedDate = (timestamp?: string) => {
    if (!timestamp) return "N/A"

    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  if (isUserLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#F9F4F5]">
        <p className="text-sm text-[#6B0F2B]">Loading...</p>
      </div>
    )
  }

  if (!user || (user.role !== "manager" && user.role !== "super_admin")) {
    return null
  }

  const StatCard = ({
    label,
    value,
    helper,
  }: {
    label: string
    value: string | number
    helper?: string
  }) => (
    <Card className="shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-widest text-[#C9973A]">
        {label}
      </p>
      <p className="mt-3 text-3xl font-bold text-[#2A0410]">{value}</p>
      {helper && <p className="mt-1 text-xs text-gray-500">{helper}</p>}
    </Card>
  )

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

      <main className="flex-1 p-5 lg:p-8 mt-12 lg:mt-0 overflow-x-hidden">
        <div className="space-y-6">
          <HeroBanner
            greeting="Welcome back"
            name={user?.fname ?? "Admin"}
            title="Admin Dashboard"
            subtitle="Manage users, accommodations, activity logs, and system settings."
            type="full"
          />

          <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <StatCard
              label="Total Users"
              value={
                isTotalUsersLoading
                  ? "..."
                  : isTotalUsersError
                  ? "Error"
                  : totalUsersData?.total ?? 0
              }
              helper="Registered accounts"
            />

            <StatCard
              label="Pending Users"
              value={
                isPendingLoading
                  ? "..."
                  : isPendingError
                  ? "Error"
                  : pendingUsers.length
              }
              helper="Needs verification"
            />

            <StatCard
              label="Academic Term"
              value={
                isSettingsLoading
                  ? "..."
                  : isSettingsError
                  ? "Error"
                  : settings
                  ? settings.currentSemester ?? "N/A"
                  : "N/A"
              }
              helper={settings?.currentSy ? `A.Y. ${settings.currentSy}` : "Current setting"}
            />

            <StatCard
              label="Available Rooms"
              value={
                isRoomsLoading
                  ? "..."
                  : isRoomsError
                  ? "Error"
                  : availableRoomsData?.total ?? 0
              }
              helper="Open for tenants"
            />
          </section>

          <RecentActivityLogs
            logs={recentLogsList}
            isLoading={isRecentLogsLoading}
            isError={isRecentLogsError}
          />
          <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <Card className="shadow-sm">
              <div className="mb-4">
                <h2 className="text-lg font-bold text-[#2A0410]">
                  Student Verifications
                </h2>
                <p className="text-xs text-gray-500">
                  Review pending student account requests.
                </p>
              </div>

              {isPendingLoading ? (
                <p className="text-sm text-gray-500">Loading...</p>
              ) : studentPending.length === 0 ? (
                <p className="text-sm text-gray-500">No pending students.</p>
              ) : (
                <div className="max-h-[280px] overflow-y-auto rounded-xl border border-[#F2D9DF]">
                  <table className="min-w-full text-sm">
                    <thead className="bg-[#FFF7F9] sticky top-0">
                      <tr>
                        <th className="text-left px-4 py-3 border-b border-[#F2D9DF]">
                          Student
                        </th>
                        <th className="text-left px-4 py-3 border-b border-[#F2D9DF]">
                          Applied
                        </th>
                        <th className="text-left px-4 py-3 border-b border-[#F2D9DF]">
                          Action
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {studentPending.slice(0, 5).map((item: any) => (
                        <tr key={item.user.id} className="hover:bg-[#FFF7F9]">
                          <td className="px-4 py-3 border-b border-[#F2D9DF]">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-[#6B0F2B] text-white flex items-center justify-center font-bold">
                                {item.user.fname?.[0] ?? "S"}
                              </div>
                              <p className="font-medium text-[#2A0410]">
                                {`${item.user.fname} ${item.user.lname}`}
                              </p>
                            </div>
                          </td>

                          <td className="px-4 py-3 border-b border-[#F2D9DF] text-gray-600">
                            {formatAppliedDate(item.user.createdAt)}
                          </td>

                          <td className="px-4 py-3 border-b border-[#F2D9DF]">
                            <button
                              onClick={() =>
                                verifyUserMutation.mutate({
                                  userId: item.user.id,
                                  roleToAssign: "student",
                                })
                              }
                              disabled={verifyingUserId === item.user.id}
                              className="text-xs px-4 py-2 rounded-lg bg-[#6B0F2B] text-white hover:bg-[#2A0410] disabled:opacity-60"
                            >
                              {verifyingUserId === item.user.id
                                ? "Approving..."
                                : "Approve"}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>

            <Card className="shadow-sm">
              <div className="mb-4">
                <h2 className="text-lg font-bold text-[#2A0410]">
                  Housing Administrator Verifications
                </h2>
                <p className="text-xs text-gray-500">
                  Review pending landlord account requests.
                </p>
              </div>

              {isPendingLoading ? (
                <p className="text-sm text-gray-500">Loading...</p>
              ) : housingAdminPending.length === 0 ? (
                <p className="text-sm text-gray-500">
                  No pending housing administrators.
                </p>
              ) : (
                <div className="max-h-[280px] overflow-y-auto rounded-xl border border-[#F2D9DF]">
                  <table className="min-w-full text-sm">
                    <thead className="bg-[#FFF7F9] sticky top-0">
                      <tr>
                        <th className="text-left px-4 py-3 border-b border-[#F2D9DF]">
                          Housing Admin
                        </th>
                        <th className="text-left px-4 py-3 border-b border-[#F2D9DF]">
                          Applied
                        </th>
                        <th className="text-left px-4 py-3 border-b border-[#F2D9DF]">
                          Action
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {housingAdminPending.slice(0, 5).map((item: any) => (
                        <tr key={item.user.id} className="hover:bg-[#FFF7F9]">
                          <td className="px-4 py-3 border-b border-[#F2D9DF]">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-[#6B0F2B] text-white flex items-center justify-center font-bold">
                                {item.user.fname?.[0] ?? "H"}
                              </div>
                              <p className="font-medium text-[#2A0410]">
                                {`${item.user.fname} ${item.user.lname}`}
                              </p>
                            </div>
                          </td>

                          <td className="px-4 py-3 border-b border-[#F2D9DF] text-gray-600">
                            {formatAppliedDate(item.appliedAt)}
                          </td>

                          <td className="px-4 py-3 border-b border-[#F2D9DF]">
                            <button
                              onClick={() =>
                                verifyUserMutation.mutate({
                                  userId: item.user.id,
                                  roleToAssign: "landlord",
                                })
                              }
                              disabled={verifyingUserId === item.user.id}
                              className="text-xs px-4 py-2 rounded-lg bg-[#6B0F2B] text-white hover:bg-[#2A0410] disabled:opacity-60"
                            >
                              {verifyingUserId === item.user.id
                                ? "Approving..."
                                : "Approve"}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </section>

          <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <Card className="shadow-sm">
              <div className="mb-4">
                <h2 className="text-lg font-bold text-[#2A0410]">
                  Pending Accommodation Approvals
                </h2>
                <p className="text-xs text-gray-500">
                  Approve or reject submitted accommodations.
                </p>
              </div>

              {isPendingAccommodationsLoading ? (
                <p className="text-sm text-gray-500">Loading...</p>
              ) : pendingAccommodations.length === 0 ? (
                <p className="text-sm text-gray-500">
                  No pending accommodations.
                </p>
              ) : (
                <div className="max-h-[300px] overflow-y-auto rounded-xl border border-[#F2D9DF]">
                  <table className="min-w-full text-sm">
                    <thead className="bg-[#FFF7F9] sticky top-0">
                      <tr>
                        <th className="text-left px-4 py-3 border-b border-[#F2D9DF]">
                          Accommodation
                        </th>
                        <th className="text-left px-4 py-3 border-b border-[#F2D9DF]">
                          Landlord
                        </th>
                        <th className="text-left px-4 py-3 border-b border-[#F2D9DF]">
                          Actions
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {pendingAccommodations.map((item: any) => (
                        <tr key={item.id} className="hover:bg-[#FFF7F9]">
                          <td className="px-4 py-3 border-b border-[#F2D9DF]">
                            <p className="font-medium text-[#2A0410]">
                              {item.accommodationName ?? "—"}
                            </p>
                            <p className="text-xs text-gray-500">
                              {item.accommodationLocation ?? "—"}
                            </p>
                          </td>

                          <td className="px-4 py-3 border-b border-[#F2D9DF] text-gray-600">
                            {item.landlord?.user
                              ? `${item.landlord.user.fname} ${item.landlord.user.lname}`
                              : "—"}
                          </td>

                          <td className="px-4 py-3 border-b border-[#F2D9DF]">
                            <div className="flex gap-2">
                              <button
                                onClick={() =>
                                  verifyAccommodationMutation.mutate({
                                    id: item.id,
                                    status: "verified",
                                  })
                                }
                                disabled={verifyingAccommodationId === item.id}
                                className="text-xs px-3 py-2 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 disabled:opacity-60"
                              >
                                {verifyingAccommodationId === item.id
                                  ? "Approving..."
                                  : "Approve"}
                              </button>

                              <button
                                onClick={() =>
                                  verifyAccommodationMutation.mutate({
                                    id: item.id,
                                    status: "rejected",
                                  })
                                }
                                disabled={verifyingAccommodationId === item.id}
                                className="text-xs px-3 py-2 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 disabled:opacity-60"
                              >
                                Reject
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>

            <Card className="shadow-sm">
              <div className="mb-4">
                <h2 className="text-lg font-bold text-[#2A0410]">
                  System Settings
                </h2>
                <p className="text-xs text-gray-500">
                  Update the current academic year and semester.
                </p>
              </div>

              {isSettingsLoading ? (
                <p className="text-sm text-gray-500">Loading...</p>
              ) : isSettingsError ? (
                <p className="text-sm text-red-500">
                  Error loading settings.
                </p>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[#2A0410] mb-1">
                      Academic Year
                    </label>
                    <input
                      type="text"
                      value={academicYear}
                      onChange={(e) => setAcademicYear(e.target.value)}
                      className="w-full border border-[#F2D9DF] rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9973A]"
                      placeholder="2025-2026"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#2A0410] mb-1">
                      Semester
                    </label>
                    <select
                      value={semester}
                      onChange={(e) => setSemester(e.target.value)}
                      className="w-full border border-[#F2D9DF] rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9973A]"
                    >
                      <option value="">Select semester</option>
                      <option value="1st Semester">1st Semester</option>
                      <option value="2nd Semester">2nd Semester</option>
                      <option value="Midyear">Midyear</option>
                    </select>
                  </div>

                  <button
                    onClick={() => updateSettingsMutation.mutate()}
                    disabled={updateSettingsMutation.isPending}
                    className="w-full sm:w-auto text-sm px-5 py-2 rounded-xl bg-[#6B0F2B] text-white hover:bg-[#2A0410] disabled:opacity-60"
                  >
                    {updateSettingsMutation.isPending
                      ? "Updating..."
                      : "Update Settings"}
                  </button>
                </div>
              )}
            </Card>
          </section>

          <Card className="shadow-sm">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
              <div>
                <h2 className="text-lg font-bold text-[#2A0410]">
                  Activity Logs
                </h2>
                <p className="text-xs text-gray-500">
                  Filter logs by date and action type.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="border border-[#F2D9DF] rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9973A]"
                />

                <select
                  value={filterAction}
                  onChange={(e) => setFilterAction(e.target.value)}
                  className="border border-[#F2D9DF] rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9973A]"
                >
                  <option value="">All Actions</option>
                  <option value="application">Application</option>
                  <option value="assignment">Assignment</option>
                  <option value="payment">Payment</option>
                  <option value="room">Room</option>
                  <option value="account">Account</option>
                </select>
              </div>
            </div>

            {isLogsLoading ? (
              <p className="text-sm text-gray-500">Loading...</p>
            ) : isLogsError ? (
              <p className="text-sm text-red-500">Error loading logs.</p>
            ) : logsList.length === 0 ? (
              <p className="text-sm text-gray-500">No logs found.</p>
            ) : (
              <div className="overflow-x-auto">
                <div className="max-h-[320px] overflow-y-auto rounded-xl border border-[#F2D9DF]">
                  <table className="min-w-full text-sm">
                    <thead className="bg-[#FFF7F9] sticky top-0">
                      <tr>
                        <th className="text-left px-4 py-3 border-b border-[#F2D9DF]">
                          Action
                        </th>
                        <th className="text-left px-4 py-3 border-b border-[#F2D9DF]">
                          Details
                        </th>
                        <th className="text-left px-4 py-3 border-b border-[#F2D9DF]">
                          Date
                        </th>
                        <th className="text-left px-4 py-3 border-b border-[#F2D9DF]">
                          Time
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {logsList.map((log: any) => (
                        <tr key={log.id} className="hover:bg-[#FFF7F9]">
                          <td className="px-4 py-3 border-b border-[#F2D9DF] font-medium text-[#2A0410]">
                            {formatAction(log.activityType)}
                          </td>
                          <td className="px-4 py-3 border-b border-[#F2D9DF] text-gray-600">
                            {log.activityDetails}
                          </td>
                          <td className="px-4 py-3 border-b border-[#F2D9DF] text-gray-600">
                            {formatDate(log.logTimestamp)}
                          </td>
                          <td className="px-4 py-3 border-b border-[#F2D9DF] text-gray-600">
                            {formatTime(log.logTimestamp)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </Card>
        </div>
      </main>
    </div>
  )
}

export default AdminDashboard