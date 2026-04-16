import type React from "react"

//Asset/Component imports
import Sidebar from "../../components/Sidebar"
import HeroBanner from "../../components/Dashboard/manager/HeroBanner"
import StatCard from "../../components/Dashboard/manager/StatCard"
import Applications from "../../components/Dashboard/manager/Applications"

import Clipboard from "../../assets/icons/clipboard.svg"
import { BsFillPeopleFill } from "react-icons/bs";

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
    icon: React.ReactNode
}

interface Application {
    studentName: string
    type: string
    appliedDate: string 
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

const heroContent: HeroContent = {
    greeting: "Good Day",
    title: "Efficiently manage applicants & housing accommodation",
    pendingApplications: 2,
    newNotifications: 3
}

const stats: Stat[] = [
    {title: "Pending Approvals", value: 19, icon: <img src={Clipboard} className="w-10 h-10"/>},
    {title: "Occupied Rooms", value:20, icon: <BsFillPeopleFill color="#3B0718" size={30} />},
    {title: "Available Rooms", value:100, icon: <BsFillPeopleFill color="#3B0718" size={30} />},
    {title: "Total Tenants", value:64, icon: <BsFillPeopleFill color="#3B0718" size={30} />}
]

const applications: Application[] = [
    {studentName: "Ana Marie Reyes", type: "Non-transient", appliedDate: "Mar 12, 2026"},
    {studentName: "Ana Marie Reyes", type: "Non-transient", appliedDate: "Mar 14, 2026"},
    {studentName: "Ana Marie Reyes", type: "Non-transient", appliedDate: "Mar 15, 2026"}
]

export default function Dashboard() {
    return (
        <div className="flex h-screen overflow-hidden bg-[#F5EEF0] font-sans">
            <Sidebar role="manager" profile={managerProfile}/>

            {/* Main Content */}
            <div className="flex-1 flex-col p-5">
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
                        pendingApplications={heroContent.pendingApplications}
                        newNotifications={heroContent.newNotifications}
                    />

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {stats.map((stat, i) => (
                            <StatCard
                                key={i}
                                title={stat.title}
                                value={stat.value}
                                icon={stat.icon}
                            />
                        ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        <Applications 
                            data={applications}
                            className="col-span-2"
                        />
                        <div className="col-span-1 bg-white border border-[#E8D0D8] rounded-xl p-3 lg:p-4 shadow-sm flex flex-row">

                        </div>

                        <div className="col-span-2 flex flex-col gap-4">
                            <div className="bg-white border border-[#E8D0D8] rounded-xl p-3 lg:p-4 shadow-sm flex flex-row">

                            </div>
                            <div className="bg-white border border-[#E8D0D8] rounded-xl p-3 lg:p-4 shadow-sm flex flex-row">

                            </div>
                        </div>
                        <div className="col-span-1 bg-white border border-[#E8D0D8] rounded-xl p-3 lg:p-4 shadow-sm flex flex-row">

                        </div>
                    </div>
                </main>
            </div>
        </div>
    )
}