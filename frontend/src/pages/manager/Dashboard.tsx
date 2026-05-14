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
import UbleLoader from '../shared/LoadingPage'
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

export default function Dashboard() {
  const { data: profile, isLoading: profileLoading } = useProfile()
  const { data: incomingApps = [] } = useIncomingApps()
  const { data: approvedApps = [] } = useApprovedApps()
  const { data: assignments = [] } = useAssignments()
  const { data: rooms = [] } = useRooms()
  const { data: logs = [] } = useLogs()
  const refreshDashboard = useRefreshDashboard()

  const [reportOpen, setReportOpen] = useState(false)

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
  const occupiedRooms = rooms.filter((r) => r.roomCurrentOccupancy >= r.roomCapacity)
  const soloAvailable = availableRooms.filter((r) => r.roomType === 'single').length
  const doubleAvailable = availableRooms.filter((r) => r.roomType === 'double').length
  const sharedAvailable = availableRooms.filter((r) => r.roomType === 'shared').length

  const soloOccupied = occupiedRooms.filter((r) => r.roomType === 'single').length
  const doubleOccupied = occupiedRooms.filter((r) => r.roomType === 'double').length
  const sharedOccupied = occupiedRooms.filter((r) => r.roomType === 'shared').length

  const totalSolo = rooms.filter((r) => r.roomType === 'single').length
  const totalDouble = rooms.filter((r) => r.roomType === 'double').length
  const totalShared = rooms.filter((r) => r.roomType === 'shared').length

  const fullName = profile ? `${profile.fname} ${profile.lname}` : ''
  const primaryPhone =
    profile?.phoneNumbers?.find((p: any) => p.isPrimary)?.contactNumber ?? ''
  const heroTitle = 'Efficiently manage applicants & housing accommodation'
  const heroSubtitle = `You have ${pendingApps.length} pending applications and ${readyForAssignment.filter((i) => i.status === 'pending_confirmation').length} waiting for confirmation.`
  const totalTenants = assignments.filter((a) => !a.actualMoveOut).length

  return (
    <>
      <ReportModal open={reportOpen} onClose={() => setReportOpen(false)} />
      <div className="relative flex h-screen overflow-hidden bg-[#F5EEF0] font-sans">
        <div className='flex flex-col'>
            <div className="relative z-10 flex-1 flex flex-col p-6 pt-6 gap-6 overflow-y-auto">
              <CustomHeader
              title="Dashboard"></CustomHeader>
              {/* Header */}
              
              {/* <div className="relative pl-10 lg:pl-0 flex flex-row items-center justify-between mb-2 pb-1">
                <div className="flex flex-row gap-2 lg:hidden">
                  <button
                    onClick={() => setReportOpen(true)}
                    className="w-12 h-11 rounded-2xl flex items-center justify-center"
                  >
                    <img src={report_icon} alt="Report" className="w-6 h-6" />
                  </button>
                  <div ref={notifWrapperRef} className="relative">
                    <button
                      onClick={() => setNotifOpen((prev) => !prev)}
                      className="w-12 h-11 rounded-2xl flex items-center justify-center"
                    >
                      <img src={notif_icon} alt="Notifications" className="w-6 h-6" />
                      {unreadCount > 0 && (
                        <span className="absolute top-0.5 right-1 w-3 h-3 rounded-full border border-white bg-[#C9973A]" />
                      )}
                    </button>
                    <NotificationPanel
                      open={notifOpen}
                      notifications={notifications}
                      unreadCount={unreadCount}
                      onMarkAllRead={markAllRead}
                      onMarkOneRead={markOneRead}
                      onClose={() => setNotifOpen(false)}
                      wrapperRef={notifWrapperRef}
                    />
                  </div>
                </div>
              </div> */}

              <main className="flex-1 flex flex-col gap-6">
                <HeroBanner
                  greeting="Good Day"
                  name={fullName}
                  title={heroTitle}
                  subtitle={heroSubtitle}
                  type="full"
                />

                <div className="grid grid-cols-3 lg:grid-cols-3 gap-6">
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

                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 items-stretch w-full">
                  <Applications
                    data={pendingApps}
                    className="col-span-1 lg:col-span-1 xl:col-span-2"
                    onAction={refreshDashboard}
                  />
                  <Waitlist waitlists={waitlistedApps} className="col-span-1" />
                  <ConfirmedStudents
                    data={readyForAssignment}
                    allRooms={rooms}
                    onAssigned={refreshDashboard}
                    className="col-span-1 lg:col-span-2 xl:col-span-3"
                  />
                  <Moves data={moves} className="col-span-1 lg:col-span-2 xl:col-span-3" />
                </div>
              </main>
            </div>
        </div>
        

        <aside className="relative z-10 hidden lg:flex w-[400px] flex-shrink-0 flex-col gap-4 pr-4 pl-1 pb-4 bg-[#F5EEF0] overflow-y-auto">
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
        </aside>
      </div>
    </>
  )
}