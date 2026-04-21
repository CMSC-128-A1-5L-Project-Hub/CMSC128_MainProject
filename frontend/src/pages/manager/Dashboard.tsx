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

interface Application {
    studentName: string
    type: string
    building: string
    appliedDate: string 
}

interface ConfirmedStudent {
    studentName: string
    stayType: string
    roomType: string
    dateConfirmed: string
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

const applications: Application[] = [
    {studentName: "Ana Marie Reyes", type: "Non-transient", building: "Building 6", appliedDate: "Mar 12, 2026"},
    {studentName: "Ana Marie Reyes", type: "Non-transient", building: "Building 6", appliedDate: "Mar 14, 2026"},
    {studentName: "Ana Marie Reyes", type: "Non-transient", building: "Building 6", appliedDate: "Mar 15, 2026"}
]

const confirmedStudents: ConfirmedStudent[] = [
    {studentName: "Ana Marie Reyes", stayType: "Transient", roomType: "Shared", dateConfirmed: "Mar 14, 2026", status:"assigned"}
]

const moves: Move[] = [
    {studentName: "Ana Marie Reyes", room: "Room 6543", building: "Building 6", roomType: "Shared", stayType: "Transient", type: "move-out", date:"March 28, 2026"}
]



export default function Dashboard() {
    return (
        <div className="flex h-screen overflow-hidden bg-[#F5EEF0] font-sans">
            <Sidebar role="manager" profile={managerProfile}/>

            {/* Main Content */}
            <div className="flex-1 flex flex-col p-8 overflow-y-auto">
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
                            data={applications}
                            className="col-span-1 lg:col-span-2 w-full h-full min-w-0"
                        />
                        <Waitlist 
                            students={["Ana Marie Reyes", "Ana Marie Reyes"]}
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
            <aside className="hidden lg:flex w-[390px] xl:w-[420px] flex-shrink-0 flex-col gap-4 px-4 pb-4 bg-[#F6F2F4]">
                <ProfileCard
                    fullName={managerProfile.fullName}
                    role="Dormitory Manager"
                    email={managerProfile.email}
                    phoneNumber={managerProfile.phoneNumber}
                    dormitory={managerProfile.dormitory}
                    status={managerProfile.status}
                    //change these sa backend connection 
                    onNotification={() => console.log("notifications")}
                    onReport={() => console.log("report")}
                />
                <AvailableRooms 
                    totalRooms={100}
                    soloRooms={10}
                    doubleRooms={15}
                    sharedRooms={20}
                />
                <ActivityLogs />
            </aside>
        </div>
    )
}