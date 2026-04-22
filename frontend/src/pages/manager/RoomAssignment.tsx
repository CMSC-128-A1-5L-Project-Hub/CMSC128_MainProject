import Sidebar from "../../components/Sidebar"
import HeroBanner from "../../components/dashboard/HeroBanner"
import Card from "../../components/ui/Card"
import StatBar from "../../components/ui/StatBar"

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

//Mock data
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
    title: "Assign a room to your confirmed applicant",
    subtitle: "We make it easy for you to track the accommodation applications you manage. "
}

export default function RoomAssignment() {
    return (
        <div className="flex h-screen overflow-hidden bg-[#F5EEF0] font-sans">
            <Sidebar role="manager" profile={managerProfile}/>

             <div className="flex-1 flex flex-col p-5 overflow-y-auto">
                <div className="pl-10 lg:pl-0 flex flex-row border-b border-[#6B0F2B]/7 mb-2 pb-1">
                    <div className="hidden lg:inline w-2 h-8 rounded-xl mt-1 mr-2"
                        style={{ background: "linear-gradient(to bottom right, #6B0F2B 0%, #9E2040 100%)"}}
                    />
                    <h1 className="text-4xl font-serif italic font-bold text-[#6B0F2B]">
                        Room Assignment
                    </h1>
                </div>

                <main className="flex-1 flex flex-col gap-4">
                    <HeroBanner 
                        greeting={heroContent.greeting}
                        name={managerProfile.fullName}
                        title={heroContent.title}
                        subtitle={heroContent.subtitle}
                        type="mini"
                    />

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <Card 
                            className="col-span-1"
                            children={
                                <div className="grid grid-cols-2 gap-4">
                                    <StatBar
                                        label="Assigned"
                                        value={1}
                                        total={6}
                                        from="#1A7A4A"
                                        to="#2D9A5F"
                                        bg="#F0F7F3"
                                        textColor="#1A7A4A"
                                        className="col-span-1"
                                    />

                                    <StatBar
                                        label="Pending"
                                        value={2}
                                        total={6}
                                        from="#C9973A"
                                        to="#E0B040"
                                        bg="#FDF6E8"
                                        textColor="#C9973A"
                                        className="col-span-1"
                                    />
                                </div>
                            }
                        />
                        <Card 
                            className="col-span-1"
                            children={
                                <div className="grid grid-cols-2 gap-4">
                                    <StatBar
                                        label="Available Rooms"
                                        value={100}
                                        total={120}
                                        from="#703FBC"
                                        to="#9968E5"
                                        bg="#F4F0FA"
                                        textColor="#6B3AB7"
                                        className="col-span-1"
                                    />

                                    <StatBar
                                        label="Occupied Rooms"
                                        value={20}
                                        total={120}
                                        from="#9E2040"
                                        to="#C84060"
                                        bg="#FDF0F3"
                                        textColor="#9E2040"
                                        className="col-span-1"
                                    />
                                </div>
                            }
                        />
                    </div>
                </main>
            </div>
        </div>
    )
}