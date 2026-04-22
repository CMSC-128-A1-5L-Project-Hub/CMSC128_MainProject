//Asset/Component imports
import Sidebar from "../../components/Sidebar"
import HeroBanner from "../../components/dashboard/HeroBanner"
import DonutStatCard from "../../components/dashboard/DonutStatCard"
import Applications from "../../components/dashboard/manager/Applications"
import Waitlist from "../../components/dashboard/manager/Waitlist"
import ConfirmedStudents from "../../components/dashboard/manager/ConfirmedStudents"
import Moves from "../../components/dashboard/manager/Moves"
import ProfileCard from "../../components/dashboard/manager/ProfileCard"
import ActivityLogs from "../../components/dashboard/ActivityLogs"
import AvailableRooms from "../../components/dashboard/manager/AvailableRooms"
import OccupiedRooms from "../../components/dashboard/manager/OccupiedRooms"

//TODO: Donut Card stack

//Interfaces
interface ManagerProfile {
    fullName: string
    shortName: string
    email: string
    phoneNumber: string
    status: string
    dormitory: string
}

interface HeroContent {
    greeting: string
    title: string
    subtitle: string
}

interface Stat {
    title: string
    value: number
    total: number
    subtitle: string
}

interface Student {
  fullName: string
  shortName: string
  course: string
  campus: string
  email: string
  phone: string
  studentNo: string
  college: string
  yearLevel: string
  status: string
}

interface Accomodation {
    building: string
}

interface Application {
    student: Student
    accommodation: Accomodation
    roomType: "single" | "double" | "shared"
    stayType: "transient" | "non-transient"
    rejectionReason?: string | null
    applicationStatus: 'pending' | 'approved' | 'rejected' | 'cancelled' | 'waitlisted' | 'under_review'
    durationOfStayDays: number
    applicationDate: string 
}

//update na lang para sa Room model
interface Assignment {
    student: Application
    roomNumber: string
    roomBuilding: string
    roomType: string
    stayType: string
    moveIn: string
    expectedMoveOut: string
    status: "assigned" | "not assigned"
}

interface Move {
    studentName: string
    room: string
    building: string
    roomType: string
    stayType: string
    type: "move-out" | "move-in"
    date: string
}

//Mock Data
const managerProfile: ManagerProfile = {
    fullName: "Dal Cadsawan",
    shortName: "Dal",
    email: "ddcadsawan@up.edu.ph",
    phoneNumber: "+63 912 345 6789",
    status: "Active",
    dormitory: "Narra Residences"
}

{/* Commenting out this part for now (might be useful later) */}
const heroContent: HeroContent = {
    greeting: "Good Day",
    title: "Efficiently manage applicants & housing accommodation",
    subtitle: "You have 2 pending applications and 3 new notifications"
}

const stats: Stat[] = [
    {title: "Pending Approvals", subtitle: "Subtitle",  value:19, total: 30},
    {title: "Approved Applications", subtitle: "Subtitle", value:21, total: 30},
    {title: "Total Tenants", subtitle: "Subtitle", value:64, total: 100}
]

const students: Student[] = [
  {
    fullName: "Ana Marie Reyes",
    shortName: "Ana Reyes",
    course: "BS Computer Science",
    campus: "Main Campus",
    email: "anamariel.reyes@student.edu.ph",
    phone: "09171234567",
    studentNo: "2021-00123",
    college: "College of Engineering",
    yearLevel: "3rd Year",
    status: "Regular"
  },
  {
    fullName: "Carlos Miguel Santos",
    shortName: "Carlos Santos",
    course: "BS Civil Engineering",
    campus: "Main Campus",
    email: "carlos.santos@student.edu.ph",
    phone: "09189876543",
    studentNo: "2020-00456",
    college: "College of Engineering",
    yearLevel: "4th Year",
    status: "Regular"
  },
  {
    fullName: "Maria Cristina Dela Cruz",
    shortName: "Maria Dela Cruz",
    course: "BS Nursing",
    campus: "North Campus",
    email: "mariacristina.delacruz@student.edu.ph",
    phone: "09201122334",
    studentNo: "2022-00789",
    college: "College of Allied Health",
    yearLevel: "2nd Year",
    status: "Regular"
  },
  {
    fullName: "Jose Ramon Villanueva",
    shortName: "Jose Villanueva",
    course: "BS Architecture",
    campus: "Main Campus",
    email: "jose.villanueva@student.edu.ph",
    phone: "09334455667",
    studentNo: "2019-01011",
    college: "College of Architecture",
    yearLevel: "5th Year",
    status: "Irregular"
  },
  {
    fullName: "Liza Mae Fontanilla",
    shortName: "Liza Fontanilla",
    course: "BS Education",
    campus: "South Campus",
    email: "lizamae.fontanilla@student.edu.ph",
    phone: "09451234567",
    studentNo: "2023-00321",
    college: "College of Education",
    yearLevel: "1st Year",
    status: "Regular"
  },
  {
    fullName: "Ramon Kristoffer Aquino",
    shortName: "Ramon Aquino",
    course: "BS Information Technology",
    campus: "Main Campus",
    email: "ramon.aquino@student.edu.ph",
    phone: "09278765432",
    studentNo: "2022-00654",
    college: "College of Engineering",
    yearLevel: "2nd Year",
    status: "Regular"
  }
]

const accommodations: Accomodation[] = [
  { building: "Building 6" },
  { building: "Building 3" },
  { building: "Building 1" },
  { building: "Building 4" },
  { building: "Building 2" },
  { building: "Building 5" }  
]

const applications: Application[] = [
  {
    student: students[0],
    accommodation: accommodations[0],
    roomType: "single",
    stayType: "non-transient",
    rejectionReason: null,
    applicationStatus: "pending",
    durationOfStayDays: 180,
    applicationDate: "Mar 12, 2026"
  },
  {
    student: students[1],
    accommodation: accommodations[1],
    roomType: "double",
    stayType: "non-transient",
    rejectionReason: null,
    applicationStatus: "approved",
    durationOfStayDays: 180,
    applicationDate: "Mar 14, 2026"
  },
  {
    student: students[2],
    accommodation: accommodations[2],
    roomType: "shared",
    stayType: "transient",
    rejectionReason: null,
    applicationStatus: "under_review",
    durationOfStayDays: 7,
    applicationDate: "Mar 15, 2026"
  },
  {
    student: students[3],
    accommodation: accommodations[3],
    roomType: "single",
    stayType: "non-transient",
    rejectionReason: "No available slots for the selected room type.",
    applicationStatus: "rejected",
    durationOfStayDays: 180,
    applicationDate: "Mar 16, 2026"
  },
  {
    student: students[4],
    accommodation: accommodations[4],
    roomType: "double",
    stayType: "non-transient",
    rejectionReason: null,
    applicationStatus: "waitlisted",
    durationOfStayDays: 180,
    applicationDate: "Mar 17, 2026"
  },
  {
    student: students[5],
    accommodation: accommodations[5],
    roomType: "shared",
    stayType: "non-transient",
    rejectionReason: null,
    applicationStatus: "waitlisted",
    durationOfStayDays: 180,
    applicationDate: "Mar 18, 2026"
  },
  {
    student: students[0],
    accommodation: accommodations[2],
    roomType: "double",
    stayType: "non-transient",
    rejectionReason: null,
    applicationStatus: "pending",
    durationOfStayDays: 180,
    applicationDate: "Mar 19, 2026"
  },
  {
    student: students[2],
    accommodation: accommodations[3],
    roomType: "single",
    stayType: "transient",
    rejectionReason: null,
    applicationStatus: "pending",
    durationOfStayDays: 14,
    applicationDate: "Mar 20, 2026"
  },
  {
    student: students[4],
    accommodation: accommodations[0],
    roomType: "shared",
    stayType: "non-transient",
    rejectionReason: null,
    applicationStatus: "pending",
    durationOfStayDays: 180,
    applicationDate: "Mar 21, 2026"
  },
  {
    student: students[5],
    accommodation: accommodations[1],
    roomType: "single",
    stayType: "non-transient",
    rejectionReason: null,
    applicationStatus: "pending",
    durationOfStayDays: 180,
    applicationDate: "Mar 22, 2026"
  },
  {
    student: students[3],
    accommodation: accommodations[5],
    roomType: "double",
    stayType: "transient",
    rejectionReason: null,
    applicationStatus: "pending",
    durationOfStayDays: 7,
    applicationDate: "Mar 23, 2026"
  }
]

const assignments: Assignment[] = [
    {
        student: applications[1], // Carlos Miguel Santos — applicationStatus: "approved"
        roomNumber: "312",
        roomBuilding: "Building 4",
        roomType: "Double",
        stayType: "Non-Transient",
        moveIn: "Mar 15, 2026",
        expectedMoveOut: "Aug 15, 2026",
        status: "not assigned"
    }
]

const moves: Move[] = [
    {studentName: "Ana Marie Reyes", room: "Room 6543", building: "Building 6", roomType: "Shared", stayType: "Transient", type: "move-out", date:"March 28, 2026"}
]

export default function Dashboard() {
    const waitlistedApplications = applications.filter(
        (application) => application.applicationStatus === "waitlisted"
    ).slice(0, 5)

    const pendingApplications = applications.filter(
        (application) => application.applicationStatus === "pending"
    ).slice(0, 5)

    const confirmedStudents = assignments.filter(
        (assignment) => assignment.student.applicationStatus === "approved"
    ).slice(0, 5)

    return (
        <div className="relative flex h-screen overflow-hidden bg-[#F5EEF0] font-sans">
            <Sidebar role="manager" profile={managerProfile} />

            {/* Main Content */}
            <div className="relative z-10 flex-1 flex flex-col px-8 py-5 overflow-y-auto">
                <div className="pl-10 lg:pl-0 flex flex-row border-b border-[#6B0F2B]/7 mb-2 pb-1">
                    <div className="hidden lg:inline w-2 h-8 rounded-xl mt-1 mr-2"
                        style={{ background: "linear-gradient(to bottom right, #6B0F2B 0%, #9E2040 100%)"}}
                    />
                    <h1 className="text-4xl font-serif italic font-bold text-[#6B0F2B]">
                        Dashboard
                    </h1>
                </div>
                <main className="flex-1 flex flex-col gap-4">
                    <HeroBanner 
                        greeting={heroContent.greeting}
                        name={managerProfile.fullName}
                        title={heroContent.title}
                        subtitle={heroContent.subtitle}
                        type="full"
                    />

                    <div className="grid grid-cols-3 lg:grid-cols-3 gap-4">
                        {stats.map((stat, i) => (
                            <DonutStatCard 
                                key={i}
                                title={stat.title}
                                value={stat.value}
                                total={stat.total}
                            />
                        ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch w-full">
                        <Applications 
                            data={pendingApplications}
                            className="col-span-1 lg:col-span-2 w-full h-full min-w-0"
                        />
                        <Waitlist 
                            waitlists={waitlistedApplications}
                            className="col-span-1 w-full h-full min-w-0"
                        />

                        <ConfirmedStudents 
                            data={confirmedStudents}
                            className="col-span-1 lg:col-span-3"
                        />
                        <Moves 
                            data={moves}
                            className="col-span-1 lg:col-span-3"
                        />
                    </div>
                </main>
            </div>
            <aside className="relative z-10 hidden lg:flex w-[400px] flex-shrink-0 flex-col gap-4 pr-4 pl-1 pb-4 bg-[#F5EEF0] overflow-y-auto">
                <ProfileCard
                    fullName={managerProfile.fullName}
                    role="Dormitory Manager"
                    email={managerProfile.email}
                    phoneNumber={managerProfile.phoneNumber}
                    dormitory={managerProfile.dormitory}
                    status={managerProfile.status}
                    //change these sa backend connection 
                    onNotification={() => console.log("notifications")}
                />
                <AvailableRooms 
                    totalRooms={100}
                    soloRooms={10}
                    doubleRooms={15}
                    sharedRooms={20}
                />
                <OccupiedRooms 
                    occupiedSolo={2}
                    totalSolo={15}
                    occupiedDouble={5}
                    totalDouble={20}
                    occupiedShared={13}
                    totalShared={25}
                />
                <ActivityLogs />
            </aside>
        </div>
    )
}