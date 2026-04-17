import React, { useEffect, useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"
import Sidebar from "../../components/Sidebar"
import Button from "../../components/Button"
import { api } from "../../api/axios"

const AdminDashboard = () => {
  const queryClient = useQueryClient()

  const [academicYear, setAcademicYear] = useState("")
  const [semester, setSemester] = useState("")

  const navigate = useNavigate()

  const {
    data: user,
    isLoading: isUserLoading,
    isError: isError,
  } = useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const res = await api.get("/me")
      console.log("GET /me:", res.data)
      return res.data.data
    },
  })

  // Pending users
  const {
    data: pendingUsersRaw,
    isLoading: isPendingLoading,
    isError: isPendingError,
  } = useQuery({
    queryKey: ["admin-pending-users"],
    queryFn: async () => {
      const res = await api.get("/admin/users/pending")
      console.log("pending users:", res.data)
      return res.data.data ?? res.data
    },
  })

  // Settings
  const {
    data: settings,
    isLoading: isSettingsLoading,
    isError: isSettingsError,
  } = useQuery({
    queryKey: ["admin-settings"],
    queryFn: async () => {
      const res = await api.get("/admin/settings")
      console.log("settings:", res.data)
      return res.data.data
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
      console.log("total users:", res.data)
      return res.data.data
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
      return res.data.data
    },
  })

  const {
    data: logs,
    isLoading: isLogsLoading,
    isError: isLogsError,
  } = useQuery({
    queryKey: ["admin-logs"],
    queryFn: async () => {
      const res = await api.get("/admin/logs")
      console.log("logs:", res.data)
      return res.data.data ?? res.data
    },
  })

  const pendingUsers = Array.isArray(pendingUsersRaw)
    ? pendingUsersRaw
    : Array.isArray(pendingUsersRaw?.data)
    ? pendingUsersRaw.data
    : []

  const logsList = Array.isArray(logs)
    ? logs
    : Array.isArray(logs?.data)
    ? logs.data
    : []

  const studentPending = pendingUsers.filter(
    (item: any) => item.requestedRole === "student"
  )

  const landlordPending = pendingUsers.filter(
    (item: any) => item.requestedRole === "landlord"
  )

  useEffect(() => {
    if (isError) {
      navigate("/auth/signin")
    }
  }, [isError, navigate])

  useEffect(() => {
    if (
      user &&
      user.role !== "manager" &&
      user.role !== "super_admin"
    ) {
      navigate("/auth/signin")
    }
  }, [user, navigate])

  if (isUserLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Loading...</p>
      </div>
    )
  }

  if (
    !user ||
    (user.role !== "manager" && user.role !== "super_admin")
  ) {
    return null
  }

  // Helper
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

  return (
    <div className="flex flex-col lg:flex-row bg-[#f5f5f5] min-h-screen">
      <Sidebar
        role={user?.role}
        profile={{
          fullName: `${user?.fname ?? ""} ${user?.lname ?? ""}`.trim(),
          shortName: user?.fname ?? "",
          email: user?.email ?? "",
        }}
      />

      <div className="flex-1 p-6 lg:p-10 mt-12 lg:mt-0">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold">Admin Dashboard</h1>
          <p className="text-sm text-gray-500 mt-2">
            Overview of system activity and settings.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Users */}
          <div className="bg-white rounded-xl shadow p-4">
            <p className="text-sm text-gray-500">Total Users</p>
            <p className="text-2xl font-bold">
              {isTotalUsersLoading
                ? "..."
                : isTotalUsersError
                ? "Error"
                : totalUsersData?.total ?? 0}
            </p>
          </div>

          {/* Pending Verifications */}
          <div className="bg-white rounded-xl shadow p-4">
            <p className="text-sm text-gray-500">Pending Verifications</p>
            <p className="text-2xl font-bold">
              {isPendingLoading ? "..." : isPendingError ? "Error" : pendingUsers.length}
            </p>
          </div>

          {/* Current Academic Year */}
          <div className="bg-white rounded-xl shadow p-4">
            <p className="text-sm text-gray-500">Current Academic Year</p>
            <p className="text-lg font-semibold">
              {isSettingsLoading
                ? "..."
                : isSettingsError
                ? "Error"
                : settings
                ? `${settings.currentSemester} A.Y. ${settings.currentSy}`
                : "N/A"}
            </p>
          </div>

          {/* Available Rooms */}
          <div className="bg-white rounded-xl shadow p-4">
            <p className="text-sm text-gray-500">Available Rooms</p>
            <p className="text-2xl font-bold">
              {isRoomsLoading
                ? "..."
                : isRoomsError
                ? "Error"
                : availableRoomsData?.total ?? 0}
            </p>
          </div>
        </div>

        <div className="mt-8 bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Activity Logs</h2>

          {isLogsLoading ? (
            <p className="text-sm text-gray-500">Loading...</p>
          ) : isLogsError ? (
            <p className="text-sm text-red-500">Error loading logs.</p>
          ) : logsList.length === 0 ? (
            <p className="text-sm text-gray-500">No activity yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <div className="max-h-[300px] overflow-y-auto border rounded-lg">
                <table className="min-w-full text-sm">
                  {/* HEADER */}
                  <thead className="bg-gray-100 sticky top-0">
                    <tr>
                      <th className="text-left px-4 py-2 font-medium border-b">
                        Action
                      </th>
                      <th className="text-left px-4 py-2 font-medium border-b">
                        Details
                      </th>
                      <th className="text-left px-4 py-2 font-medium border-b">
                        Date
                      </th>
                      <th className="text-left px-4 py-2 font-medium border-b">
                        Time
                      </th>
                    </tr>
                  </thead>

                  {/* BODY */}
                  <tbody>
                    {logsList.map((log: any) => (
                      <tr key={log.id} className="hover:bg-gray-50">
                        <td className="px-4 py-2 border-b">
                          {formatAction(log.activityType)}
                        </td>

                        <td className="px-4 py-2 border-b text-gray-600">
                          {log.activityDetails}
                        </td>

                        <td className="px-4 py-2 border-b">
                          {formatDate(log.logTimestamp)}
                        </td>

                        <td className="px-4 py-2 border-b">
                          {formatTime(log.logTimestamp)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* STUDENT VERIFICATIONS */}
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Student Verifications</h2>
              <button className="text-sm text-red-600 hover:underline">
                View all →
              </button>
            </div>

            {isPendingLoading ? (
              <p className="text-sm text-gray-500">Loading...</p>
            ) : studentPending.length === 0 ? (
              <p className="text-sm text-gray-500">No pending students.</p>
            ) : (
              <div className="overflow-x-auto">
                <div className="max-h-[260px] overflow-y-auto border rounded-lg">
                  <table className="min-w-full text-sm">
                    <thead className="bg-gray-100 sticky top-0">
                      <tr>
                        <th className="text-left px-4 py-2 font-medium border-b">
                          Student
                        </th>
                        <th className="text-left px-4 py-2 font-medium border-b">
                          Applied
                        </th>
                        <th className="text-left px-4 py-2 font-medium border-b">
                          Action
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {studentPending.slice(0, 5).map((item: any) => (
                        <tr key={item.user.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 border-b">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-red-700 rounded-md"></div>
                              <div>
                                <p className="font-medium">
                                  {`${item.user.fname} ${item.user.lname}`}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* this is alwys N/A, might need to update user model or sumn idk -w */}
                          <td className="px-4 py-3 border-b text-gray-600">
                            {item.user.createdAt
                              ? new Date(item.user.createdAt).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })
                              : "N/A"}
                          </td>

                          <td className="px-4 py-3 border-b">
                            <button className="text-sm px-3 py-1 border rounded-md hover:bg-gray-100">
                              Review
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}

export default AdminDashboard