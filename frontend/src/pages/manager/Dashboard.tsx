import { useEffect, useState, useRef } from 'react'
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
import ReportModal from '../../components/ReportModal'
import NotificationPanel, {
  MOCK_NOTIFICATIONS,
  type Notification,
} from '../../components/NotificationPanel'
import notif_icon from '../../assets/icons/notif_icon.svg'
import report_icon from '../../assets/icons/report.svg'

export default function Dashboard() {
  const [profile, setProfile] = useState<any>(null)
  const [incomingApps, setIncomingApps] = useState<any[]>([])
  const [confirmedApps, setConfirmedApps] = useState<any[]>([])
  const [assignments, setAssignments] = useState<any[]>([])
  const [rooms, setRooms] = useState<any[]>([])
  const [logs, setLogs] = useState<any[]>([])

  const [reportOpen, setReportOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS)
  const notifWrapperRef = useRef<HTMLDivElement>(null)

  const unreadCount = notifications.filter((n) => !n.read).length
  const markAllRead = () =>
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  const markOneRead = (id: number) =>
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    )

  const BASE = 'http://localhost:3333'  

  async function loadData() {
    try {
      const [meR, incR, confR, asgnR, roomsR, logsR] = await Promise.all([
        fetch(`${BASE}/me`, { credentials: 'include' }),
        fetch(`${BASE}/applications/incoming`, { credentials: 'include' }),
        fetch(`${BASE}/manager/applications/confirmed`, { credentials: 'include' }),
        fetch(`${BASE}/manager/assignments`, { credentials: 'include' }),
        fetch(`${BASE}/manager/rooms`, { credentials: 'include' }),
        fetch(`${BASE}/manager/logs`, { credentials: 'include' }),
      ])
      const meJson = await meR.json()
      setProfile(meJson.data ?? meJson)   // <-- unwrap if wrapped
      setIncomingApps(await incR.json())
      setConfirmedApps(await confR.json())
      setAssignments(await asgnR.json())
      setRooms(await roomsR.json())
      setLogs(await logsR.json())
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // ---------- Transformations ----------
  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

const transformStudent = (app: any) => {
  const s = app.student,
    u = s.user
  return {
    ...app,
    student: {
      fullName: `${u.fname} ${u.lname}`,
      shortName: u.fname,
      email: u.email,
      course: s.degreeProgram,
      college: s.college,
      yearLevel: s.yearLevel,
      phone: u.phoneNumbers?.find((p: any) => p.isPrimary)?.contactNumber
      ?? u.phoneNumbers?.[0]?.contactNumber
      ?? '',
      studentNo: s.studentNumber,
      gender: s.gender,
      status: 'active',
    },
    // Add the missing application preference fields
    stayType: app.applicationStayType?.replace('_', '-'),
    roomType: app.applicationRoomType,
    applicationDate: formatDate(app.applicationDate),
  }
}
  const transformAccommodation = (app: any) => ({
    ...app,
    accommodation: {
      ...app.accommodation,
      building: app.accommodation.accommodationName,
      tenantRestriction: app.accommodation.tenantRestriction,
    },
  })

  const transformApp = (app: any) => transformAccommodation(transformStudent(app))

  // Pending (limit 5)
  const pendingApps = incomingApps
    .filter((a) => a.applicationStatus === 'pending')
    .map(transformApp)
    .slice(0, 5)

  // Waitlisted (limit 5)
  const waitlistedApps = incomingApps
    .filter((a) => a.applicationStatus === 'waitlisted')
    .map(transformApp)
    .slice(0, 5)

  // Confirmed students (limit 5) – merge with assignments to show assigned status
  const confirmedStudents = confirmedApps
    .map(transformApp)
    .slice(0, 5)
    .map((app) => {
      const activeAssign = assignments.find(
        (a) => a.studentNumber === app.student.studentNo && !a.actualMoveOut
      )
      if (activeAssign) {
        return {
          student: app,
          roomNumber: activeAssign.room.roomNumber,
          roomBuilding: activeAssign.room.roomBuilding,
          roomType: activeAssign.room.roomType,
          stayType: activeAssign.room.roomStayType,
          moveIn: activeAssign.moveIn,
          expectedMoveOut: activeAssign.expectedMoveOut,
          status: 'assigned' as const,
        }
      } else {
        return {
          student: app,
          roomNumber: '',
          roomBuilding: '',
          roomType: '',
          stayType: '',
          moveIn: '',
          expectedMoveOut: '',
          status: 'not assigned' as const,
        }
      }
    }).filter((item) => item.status === 'not assigned')

  // Upcoming moves (next 7 days, limit 5)
  const today = new Date()
  const nextWeek = new Date()
  nextWeek.setDate(today.getDate() + 7)
  const moves = assignments
    .filter((a) => {
      const moveIn = new Date(a.moveIn),
        moveOut = new Date(a.expectedMoveOut)
      return (
        (moveIn >= today && moveIn <= nextWeek) ||
        (moveOut >= today && moveOut <= nextWeek)
      )
    })
    .sort((a, b) => {
      const dateA = new Date(
        a.moveIn >= today ? a.moveIn : a.expectedMoveOut
      ).getTime()
      const dateB = new Date(
        b.moveIn >= today ? b.moveIn : b.expectedMoveOut
      ).getTime()
      return dateA - dateB
    })
    .slice(0, 5)
    .map((a) => ({
      studentName: `${a.student.user.fname} ${a.student.user.lname}`,
      room: a.room.roomNumber,
      building: a.room.roomBuilding,
      roomType: a.room.roomType,
      stayType: a.room.roomStayType,
      type:
        new Date(a.moveIn) >= today ? ('move-in' as const) : ('move-out' as const),
      date: new Date(
        a.moveIn >= today ? a.moveIn : a.expectedMoveOut
      ).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }),
    }))

  // Activity logs (limit 5)
  const recentLogs = logs.slice(0, 5)

  // Room stats
  const availableRooms = rooms.filter((r) => r.roomAvailability === 'available')
  const occupiedRooms = rooms.filter((r) => r.roomAvailability === 'occupied')
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
  const heroSubtitle = `You have ${pendingApps.length} pending applications and ${confirmedApps.length} confirmed.`
  const totalTenants = assignments.filter((a) => !a.actualMoveOut).length

  return (
    <>
      <ReportModal open={reportOpen} onClose={() => setReportOpen(false)} />
      <div className="relative flex h-screen overflow-hidden bg-[#F5EEF0] font-sans">
        <Sidebar role="manager" profile={profile} />
        <div className="relative z-10 flex-1 flex flex-col px-8 py-5 overflow-y-auto">
          {/* Header */}
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
          </div>

          <main className="flex-1 flex flex-col gap-4">
            <HeroBanner
              greeting="Good Day"
              name={fullName}
              title={heroTitle}
              subtitle={heroSubtitle}
              type="full"
            />

            <div className="grid grid-cols-3 lg:grid-cols-3 gap-4">
              <DonutStatCard
                title="Pending Approvals"
                value={pendingApps.length}
                total={30}
              />
              <DonutStatCard
                title="Confirmed Students"
                value={confirmedApps.length}
                total={30}
              />
              <DonutStatCard
                title="Total Tenants"
                value={totalTenants}
                total={100}
              />
            </div>

            {/* Mobile room stats */}
            <div className="flex flex-col gap-4 lg:hidden">
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch w-full">
                <Applications
                data={pendingApps}
                className="col-span-1 lg:col-span-2"
                baseUrl={BASE}
                onAction={loadData}
                />
              <Waitlist waitlists={waitlistedApps} className="col-span-1" />
              <ConfirmedStudents
                data={confirmedStudents}
                allRooms={rooms}
                onAssigned={loadData}
                baseUrl={BASE}              // <-- pass BASE as baseUrl
                className="col-span-1 lg:col-span-3"
              />
              <Moves data={moves} className="col-span-1 lg:col-span-3" />
            </div>
          </main>
        </div>

        {/* Desktop Side Panel */}
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