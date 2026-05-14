import { useState } from 'react'
import Sidebar from '../../components/Sidebar'
import HeroBanner from '../../components/dashboard/HeroBanner'
import DonutStatCard from '../../components/dashboard/DonutStatCard'
import Applications from '../../components/dashboard/manager/Applications'
import Waitlist from '../../components/dashboard/manager/Waitlist'
import ConfirmedStudents from '../../components/dashboard/manager/ConfirmedStudents'
import Moves from '../../components/dashboard/manager/Moves'
import ProfileCard from '../../components/dashboard/manager/ProfileCard'
import ActivityLogs from '../../components/dashboard/landlord/rooms/dashboard/ActivityLogs'
import AvailableRooms from '../../components/dashboard/manager/AvailableRooms'
import OccupiedRooms from '../../components/dashboard/manager/OccupiedRooms'
import CustomHeader from '../../components/CustomHeader';
import ReportModal from '../../components/ReportModal'
import Toast from '../../components/Toast'
import {
  useProfile,
  useIncomingApps,
  useApprovedApps,
  useAssignments,
  useRooms,
  useLogs,
  transformApp,
  mergeAppWithAssignment,
  useRefreshDashboard,
} from '../../../hooks/useDashboardQueries'

// ─── Filter Tabs ──────────────────────────────────────────────────────
function FilterTabs({ active, setActive }: { active: string; setActive: (tab: string) => void }) {
  const tabs = ["Students", "Rooms"]
  return (
    <div className="w-full">
      <div className="inline-flex bg-white p-1 rounded-xl gap-1 shadow-sm border border-gray-100">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActive(tab)}
            className={`px-6 py-2 text-sm rounded-lg font-semibold transition-all duration-200 ${
              active === tab
                ? "bg-gradient-to-r from-[#6B0F2B] to-[#8C1535] text-white shadow-md"
                : "text-gray-500 hover:text-[#6B0F2B] hover:bg-gray-50"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
    </div>
  )
}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("Students")
  const { data: profile, isLoading: profileLoading } = useProfile()
  const { data: incomingApps = [] } = useIncomingApps()
  const { data: approvedApps = [] } = useApprovedApps()
  const { data: assignments = [] } = useAssignments()
  const { data: rooms = [] } = useRooms()
  const { data: logs = [] } = useLogs()
  const refreshDashboard = useRefreshDashboard()

  const [reportOpen, setReportOpen] = useState(false)
  const [toast, setToast] = useState<{
    show: boolean;
    type: "success" | "error" | "info" | "warning" | "loading";
    title: string;
    message?: string;
  }>({ show: false, type: "success", title: "" });

  if (profileLoading) {
    return null
  }

  const transformedIncoming = incomingApps.map(transformApp)
  const transformedApproved = approvedApps.map(transformApp)

  const pendingApps = transformedIncoming
    .filter((a) => a.applicationStatus === 'pending')
    .slice(0, 5)

  const waitlistedApps = transformedIncoming
    .filter((a) => a.applicationStatus === 'waitlisted')
    .slice(0, 5)

  const readyForAssignment = transformedApproved
    .slice(0, 5)
    .map((app) => mergeAppWithAssignment(app, assignments))
    .filter((item) => item.status !== 'assigned')
    .sort((a, b) => {
      if (a.status === 'not assigned' && b.status !== 'not assigned') return -1
      if (a.status !== 'not assigned' && b.status === 'not assigned') return 1
      return 0
    })

  const today = new Date()
  const nextWeek = new Date()
  nextWeek.setDate(today.getDate() + 7)

  const moves = assignments
    .filter((a) => {
      const moveInDate = new Date(a.moveIn)
      const moveOutDate = new Date(a.expectedMoveOut)
      return (
        (moveInDate >= today && moveInDate <= nextWeek) ||
        (moveOutDate >= today && moveOutDate <= nextWeek)
      )
    })
    .sort((a, b) => {
      const aMoveIn = new Date(a.moveIn)
      const aMoveOut = new Date(a.expectedMoveOut)
      const bMoveIn = new Date(b.moveIn)
      const bMoveOut = new Date(b.expectedMoveOut)

      const dateA = (aMoveIn >= today ? aMoveIn : aMoveOut).getTime()
      const dateB = (bMoveIn >= today ? bMoveIn : bMoveOut).getTime()
      return dateA - dateB
    })
    .slice(0, 5)
    .map((a) => {
      const moveInDate = new Date(a.moveIn)
      const isMoveIn = moveInDate >= today
      const displayDate = isMoveIn ? a.moveIn : a.expectedMoveOut

      return {
        studentName: `${a.student.user.fname} ${a.student.user.lname}`,
        room: a.room.roomNumber,
        building: a.room.roomBuilding,
        roomType: a.room.roomType,
        stayType: a.room.roomStayType,
        type: isMoveIn ? ('move-in' as const) : ('move-out' as const),
        date: new Date(displayDate).toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        }),
      }
    })

  const recentLogs = logs.slice(0, 5)

  const availableRooms = rooms.filter((r) => r.roomCurrentOccupancy < r.roomCapacity)
  const occupiedRoomsList = rooms.filter((r) => r.roomCurrentOccupancy >= r.roomCapacity)
  const soloAvailable = availableRooms.filter((r) => r.roomType === 'single').length
  const doubleAvailable = availableRooms.filter((r) => r.roomType === 'double').length
  const sharedAvailable = availableRooms.filter((r) => r.roomType === 'shared').length

  const soloOccupied = occupiedRoomsList.filter((r) => r.roomType === 'single').length
  const doubleOccupied = occupiedRoomsList.filter((r) => r.roomType === 'double').length
  const sharedOccupied = occupiedRoomsList.filter((r) => r.roomType === 'shared').length

  const totalSolo = rooms.filter((r) => r.roomType === 'single').length
  const totalDouble = rooms.filter((r) => r.roomType === 'double').length
  const totalShared = rooms.filter((r) => r.roomType === 'shared').length

  const fullName = profile ? `${profile.fname} ${profile.lname}` : ''
  const primaryPhone = profile?.phoneNumbers?.find((p: any) => p.isPrimary)?.contactNumber ?? ''
  const heroTitle = 'Efficiently manage applicants & housing accommodation'
  const heroSubtitle = `You have ${pendingApps.length} pending applications and ${readyForAssignment.filter((i) => i.status === 'pending_confirmation').length} waiting for confirmation.`
  const totalTenants = assignments.filter((a) => !a.actualMoveOut).length

  const handleActionSuccess = (message: string) => {
    setToast({
      show: true,
      type: "success",
      title: "Action Completed",
      message
    })
    refreshDashboard()
  }

  return (
    <>
      <ReportModal open={reportOpen} onClose={() => setReportOpen(false)} />
      <div className="flex h-screen overflow-hidden bg-[#F5EEF0] font-sans">     
        <div className="flex-1 flex flex-col overflow-hidden">
          <CustomHeader title="Dashboard" />
          
          <div className="flex-1 overflow-y-auto p-6">
            <main className="flex flex-col gap-6">
              <HeroBanner
                greeting="Good Day"
                name={fullName}
                title={heroTitle}
                subtitle={heroSubtitle}
                type="full"
              />

              {/* Stats Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <DonutStatCard
                  title="Pending Approvals"
                  value={pendingApps.length}
                  total={30}
                />
                <DonutStatCard
                  title="Pending Confirmations"
                  value={readyForAssignment.filter(item => item.status === 'pending_confirmation').length}
                  total={approvedApps.length}
                />
                <DonutStatCard
                  title="Total Tenants"
                  value={totalTenants}
                  total={100}
                />
              </div>

              {/* Tabs */}
              <FilterTabs active={activeTab} setActive={setActiveTab} />

              {/* Mobile View */}
              <div className="flex flex-col gap-6 lg:hidden">
                <AvailableRooms
                  totalRooms={rooms.length}
                  soloRooms={soloAvailable}
                  doubleRooms={doubleAvailable}
                  sharedRooms={sharedAvailable}
                />
                <OccupiedRooms
                  occupiedSolo={soloOccupied}
                  totalSolo={totalSolo}
                  occupiedDouble={doubleOccupied}
                  totalDouble={totalDouble}
                  occupiedShared={sharedOccupied}
                  totalShared={totalShared}
                />
                <ActivityLogs data={recentLogs} />
              </div>

              {/* STUDENTS TAB - Applications + Waitlist */}
              {activeTab === "Students" && (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 items-stretch w-full">
                  <Applications
                    data={pendingApps}
                    className="col-span-1 lg:col-span-1 xl:col-span-2"
                    onAction={refreshDashboard}
                  />
                  <Waitlist waitlists={waitlistedApps} className="col-span-1" />
                </div>
              )}

              {/* ROOMS TAB - Room Assignment + Upcoming Moves */}
              {activeTab === "Rooms" && (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 items-stretch w-full">
                  <ConfirmedStudents
                    data={readyForAssignment}
                    allRooms={rooms}
                    onAssigned={refreshDashboard}
                    className="col-span-1 lg:col-span-2 xl:col-span-3"
                  />
                  <Moves data={moves} className="col-span-1 lg:col-span-2 xl:col-span-3" />
                </div>
              )}
            </main>
          </div>
        </div>

        {/* Right Sidebar  */}
        <aside className="hidden lg:flex lg:w-[380px] xl:w-[420px] flex-shrink-0 flex-col bg-[#F5EEF0] overflow-y-auto">
          <div className="flex flex-col gap-4 p-4">
            <ProfileCard
              fullName={fullName}
              role="Dormitory Manager"
              email={profile?.email ?? ''}
              phoneNumber={primaryPhone}
              dormitory={profile?.dormitory ?? 'Loading...'}
              status={profile?.accountStatus ?? 'pending'}
              onNotification={() => {}}
            />
            <AvailableRooms
              totalRooms={rooms.length}
              soloRooms={soloAvailable}
              doubleRooms={doubleAvailable}
              sharedRooms={sharedAvailable}
            />
            <OccupiedRooms
              occupiedSolo={soloOccupied}
              totalSolo={totalSolo}
              occupiedDouble={doubleOccupied}
              totalDouble={totalDouble}
              occupiedShared={sharedOccupied}
              totalShared={totalShared}
            />
            <ActivityLogs data={recentLogs} />
          </div>
        </aside>
      </div>

      <Toast
        type={toast.type}
        title={toast.title}
        message={toast.message}
        show={toast.show}
        onClose={() => setToast(prev => ({ ...prev, show: false }))}
      />
    </>
  )
}