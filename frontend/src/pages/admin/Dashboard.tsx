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

    const pendingUsers = Array.isArray(pendingUsersRaw)
    ? pendingUsersRaw
    : Array.isArray(pendingUsersRaw?.data)
    ? pendingUsersRaw.data
    : []

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
    </div>
  </div>
)
}
export default AdminDashboard