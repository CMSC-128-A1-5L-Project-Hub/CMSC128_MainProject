//Asset/Component imports
import Sidebar from "../../components/Sidebar"
import HeroCard from "../../components/dashboard/HeroCard"
import StatCard from "../../components/dashboard/StatCard"
import Applications from "../../components/Dashboard/manager/Applications"
import Waitlist from "../../components/Dashboard/manager/Waitlist"
import ConfirmedStudents from "../../components/Dashboard/manager/ConfirmedStudents"
import Moves from "../../components/Dashboard/manager/Moves"
import ProfileCard from "../../components/dashboard/ManagerCard"
import ActivityLogs from "../../components/dashboard/ActivityLogs"

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
    pendingApplications: number
    newNotifications: number
}

interface Stat {
    title: string
    value: number
    subtitle: string
    positive: boolean
}

interface Application {
    studentName: string
    type: string
    appliedDate: string 
}

interface ConfirmedStudent {
    studentName: string
    stayType: string
}

interface Move {
    studentName: string
    room: string
    action: string
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
// const heroContent: HeroContent = {
//     greeting: "Good Day",
//     title: "Efficiently manage applicants & housing accommodation",
//     pendingApplications: 2,
//     newNotifications: 3
// }

const stats: Stat[] = [
    {title: "Pending Approvals", subtitle: "Subtitle",  value:19, positive: true},
    {title: "Occupied Rooms", subtitle: "Subtitle", value:20, positive: false},
    {title: "Available Rooms", subtitle: "Subtitle", value:100, positive: true},
    {title: "Total Tenants", subtitle: "Subtitle", value:64, positive: false}
]

const applications: Application[] = [
    {studentName: "Ana Marie Reyes", type: "Non-transient", appliedDate: "Mar 12, 2026"},
    {studentName: "Ana Marie Reyes", type: "Non-transient", appliedDate: "Mar 14, 2026"},
    {studentName: "Ana Marie Reyes", type: "Non-transient", appliedDate: "Mar 15, 2026"}
]

const confirmedStudents: ConfirmedStudent[] = [
    {studentName: "Ana Marie Reyes", stayType: "Non-transient"}
]

const moves: Move[] = [
    {studentName: "Ana Marie Reyes", room: "Room 210", action: "Move-out", date:"March 28, 2026"}
]

export default function Dashboard() {
    return (
        <div className="flex h-screen overflow-hidden bg-[#F5EEF0] font-sans">
            <Sidebar role="manager" profile={managerProfile}/>

            {/* Main Content */}
            <div className="flex-1 flex flex-col p-5 overflow-y-auto">
                <div className="pl-10 lg:pl-0 flex flex-row border-b border-[#6B0F2B]/7 mb-2 pb-1">
                    <div className="hidden lg:inline w-2 h-8 rounded-xl mt-1 mr-2"
                        style={{ background: "linear-gradient(to bottom right, #6B0F2B 0%, #9E2040 100%)"}}
                    />
                    <h1 className="text-4xl font-serif italic font-bold text-[#6B0F2B]">
                        Dashboard
                    </h1>
                </div>
                <main className="flex-1 flex flex-col gap-4">
                    <HeroCard />

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {stats.map((stat, i) => (
                            <StatCard
                                key={i}
                                title={stat.title}
                                subtitle={stat.subtitle}
                                value={stat.value}
                                positive={stat.positive}
                            />
                        ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch w-full">
                        <Applications 
                            data={applications}
                            className="col-span-1 lg:col-span-2 w-full h-full"
                        />
                        <Waitlist 
                            students={["Ana Marie Reyes", "Ana Marie Reyes"]}
                            className="col-span-1 w-full h-full"
                        />

                        <div className="col-span-1 lg:col-span-2 flex flex-col gap-4">
                            <ConfirmedStudents 
                                data={confirmedStudents}
                                className="lg: col-span-1"
                            />
                            <Moves 
                                data={moves}
                                className="lg: col-span-1"
                            />
                        </div>
                        <div className="col-span-1 bg-white border border-[#E8D0D8] rounded-xl p-3 lg:p-4 shadow-sm flex flex-row">

                        </div>
                    </div>
                </main>
            </div>
            <aside className="hidden lg:flex w-[300px] border-l bg-white/60 backdrop-blur p-4 flex-col gap-4 overflow-y-auto">
                <ProfileCard />
                <ActivityLogs />
            </aside>
        </div>
    )
}