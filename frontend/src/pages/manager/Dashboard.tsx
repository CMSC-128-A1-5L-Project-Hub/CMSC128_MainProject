//Asset/Component imports
import Sidebar from "../../components/Sidebar"
import HeroBanner from "../../components/dashboard/HeroBanner"
import StatCard from "../../components/dashboard/StatCard"
import Applications from "../../components/dashboard/manager/Applications"
import Waitlist from "../../components/dashboard/manager/Waitlist"
import ConfirmedStudents from "../../components/dashboard/manager/ConfirmedStudents"
import Moves from "../../components/dashboard/manager/Moves"
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
    subtitle: string
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
    dateConfirmed: string
    status: "assigned" | "not assigned"
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
const heroContent: HeroContent = {
    greeting: "Good Day",
    title: "Efficiently manage applicants & housing accommodation",
    subtitle: "You have 2 pending applications and 3 new notifications"
}

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
    {studentName: "Ana Marie Reyes", stayType: "Non-transient", dateConfirmed: "Mar 14, 2026", status:"assigned"}
]

const moves: Move[] = [
    {studentName: "Ana Marie Reyes", room: "Room 210", action: "Move-out", date:"March 28, 2026"}
]

export default function Dashboard() {
    return (
        <div className="flex h-screen overflow-hidden bg-[#F5EEF0] font-sans">
            <Sidebar role="manager" profile={managerProfile}/>

            {/* Main Content */}
            <div className="flex-1 flex flex-col p-5 overflow-hidden">
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
            <aside className="hidden lg:flex w-[300px] border-l bg-white/60 backdrop-blur p-4 flex-col gap-4 overflow-y-auto">
                <ProfileCard />
                <ActivityLogs />
            </aside>
        </div>
    )
}