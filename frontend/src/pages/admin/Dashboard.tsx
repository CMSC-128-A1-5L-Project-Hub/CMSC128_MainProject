import React, { useEffect, useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"
import { api } from "../../api/axios"
// IMPORTS OF COMPONENTS
import Sidebar from "../../components/Sidebar"
import HeroBanner from "@/components/dashboard/HeroBanner"
import Card from "@/components/ui/Card"
import RecentActivityLogs from "@/components/dashboard/admin/RecentActivityLogs"
import StudentVerifications from "@/components/dashboard/admin/StudentVerifications"
import HousingAdminVerifications from "@/components/dashboard/admin/HousingAdminVerifications"
import PendingAccommodations from "@/components/dashboard/admin/PendingAccommodations"
import SystemSettings from "@/components/dashboard/admin/SystemSettings"
import ActivityLogs from "@/components/dashboard/admin/ActivityLogs"

const AdminDashboard = () => {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const [academicYear, setAcademicYear] = useState("")
  const [semester, setSemester] = useState("")
  const [autoVerifyUsers, setAutoVerifyUsers] = useState(false)
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
    data: facilitiesData,
    isLoading: isFacilitiesLoading,
    isError: isFacilitiesError,
  } = useQuery({
    queryKey: ["admin-facilities-count"],
    queryFn: async () => {
      const res = await api.get("/admin/facilities/count")
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
        autoVerifyUsers,
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
      setAutoVerifyUsers(settings.autoVerifyUsers ?? false)
    }
  }, [settings])

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
      <p className="text-xs font-semibold tracking-widest text-gray-500">
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
          <div className="relative pl-10 lg:pl-0 flex flex-row items-center justify-between border-b border-[#6B0F2B]/7 mb-2 pb-1">
            <div className="flex flex-row items-center">
              <div
                className="hidden lg:inline w-2 h-8 rounded-xl mt-1 mr-2"
                style={{
                  background:
                    'linear-gradient(to bottom right, #6B0F2B 0%, #9E2040 100%)',
                }}
              />
              <h1 className="text-4xl font-serif italic font-bold text-[#6B0F2B]">
                Dashboard
              </h1>
            </div>
          </div>
          <HeroBanner
            greeting="Welcome back"
            name={user?.fname ?? "Admin"}
            title="Overview of UBLE's System"
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
              label="Housing Facilities"
              value={
                isFacilitiesLoading
                  ? "..."
                  : isFacilitiesError
                  ? "Error"
                  : facilitiesData?.total ?? 0
              }
              helper="Registered facilities"
            />
          </section>
          {/* RECENT ACTIVITY LOGS */}
          {/* <RecentActivityLogs
            logs={recentLogsList}
            isLoading={isRecentLogsLoading}
            isError={isRecentLogsError}
          /> */}
          <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* STUDENT VERIFICATIONS */}
            <StudentVerifications
              students={studentPending}
              isLoading={isPendingLoading}
              verifyingUserId={verifyingUserId}
              onApprove={(userId) =>
                verifyUserMutation.mutate({
                  userId,
                  roleToAssign: "student",
                })
              }
            />
            {/* HOUSING ADMIN VERIFICATIONS */}
            <HousingAdminVerifications
              admins={housingAdminPending}
              isLoading={isPendingLoading}
              verifyingUserId={verifyingUserId}
              onApprove={(userId) =>
                verifyUserMutation.mutate({
                  userId,
                  roleToAssign: "landlord",
                })
              }
            />
          </section>
          {/* PENDING ACCOMMODATION APPROVAL */}
          <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <PendingAccommodations
              accommodations={pendingAccommodations}
              isLoading={isPendingAccommodationsLoading}
              verifyingAccommodationId={verifyingAccommodationId}
              onVerify={(id, status) =>
                verifyAccommodationMutation.mutate({
                  id,
                  status,
                })
              }
            />
            {/* SYSTEM SETTINGS */}
            <SystemSettings
              academicYear={academicYear}
              semester={semester}
              autoVerifyUsers={autoVerifyUsers}
              isLoading={isSettingsLoading}
              isError={isSettingsError}
              isUpdating={updateSettingsMutation.isPending}
              onAcademicYearChange={setAcademicYear}
              onSemesterChange={setSemester}
              onAutoVerifyChange={setAutoVerifyUsers}
              onUpdate={() => updateSettingsMutation.mutate()}
            />
          </section>
          {/* ACTIVITY LOGS */}
          <ActivityLogs
            logs={logsList}
            isLoading={isLogsLoading}
            isError={isLogsError}
            filterDate={filterDate}
            filterAction={filterAction}
            onFilterDateChange={setFilterDate}
            onFilterActionChange={setFilterAction}
          />
        </div>
      </main>
    </div>
  )
}

export default AdminDashboard