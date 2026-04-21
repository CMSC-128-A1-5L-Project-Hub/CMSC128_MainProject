import Button from "../../Button";

type ConfirmedStudent = {
    studentName: string
    stayType: string
    roomType: string
    dateConfirmed: string
    status: "assigned" | "not assigned"
}

export default function ConfirmedStudents({ data, className="" }: {data: ConfirmedStudent[], className: string}) {
    //avatar initials from name
    const getInitials = (name: string) => name[0]

    //compute time since given date (in str)
    const timeAgo = (dateStr: string): string => {
        const date = new Date(dateStr)
        const now = new Date()
        const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

        const intervals = [
            { label: "year",   seconds: 31536000 },
            { label: "month",  seconds: 2592000  },
            { label: "week",   seconds: 604800   },
            { label: "day",    seconds: 86400    },
            { label: "hour",   seconds: 3600     },
            { label: "minute", seconds: 60       },
        ]

        for (const interval of intervals) {
            const count = Math.floor(seconds / interval.seconds)
            if (count >= 1) return `${count} ${interval.label}${count !== 1 ? "s" : ""} ago`
        }

        return "Just now"
    }

    return (
        <div className={className}>
            <div className="bg-white border border-[#E8D0D8] rounded-xl p-3 lg:p-4 shadow-sm w-full h-full flex flex-col">
                <div className="flex flex-row justify-between w-full pb-2 border-b border-[#F5ECF0]">
                    <p className="text-[#1A0008] font-bold">
                        Confirmed Students
                    </p>
                    <p className="text-[#6B0F2B] font-bold text-sm hover:underline cursor-pointer">
                        View all →
                    </p>
                </div>
                <div className="overflow-y-auto -mx-0">
                    <div className="min-w-[680px] pb-3 lg:pb-0">
                        {/* Table headers */}
                        <div className="grid grid-cols-5 border-b border-[#F5ECF0] uppercase"
                            style={{ gridTemplateColumns: "2fr 1.5fr 1fr 1.5fr 1.5fr" }}
                        >
                            <p className="col-span-1 text-[#9A7080] text-xs font-bold p-1">
                                Student
                            </p>
                            <p className="col-span-1 px-2 text-[#9A7080] text-xs font-bold p-1">
                                Confirmed Room Type
                            </p>
                            <p className="col-span-1 px-2 text-[#9A7080] text-xs font-bold p-1">
                                Date Confirmed
                            </p>
                            <p className="col-span-1 px-2 text-center text-[#9A7080] text-xs font-bold p-1">
                                Status
                            </p>
                            <p className="col-span-1 px-2 text-center text-[#9A7080] text-xs font-bold p-1">
                                Action
                            </p>
                        </div>
                        {/* Actual data entries */}
                        {data.length > 0 
                            ? (
                                <div className="flex flex-col">
                                    {data.map((student: ConfirmedStudent, i:number) => (
                                        <div key={i} className="grid grid-cols-5 items-center mt-3"
                                            style={{ gridTemplateColumns: "2fr 1.5fr 1fr 1.5fr 1.5fr" }}
                                        >
                                            <div className="col-span-1 flex flex-row items-center">
                                                <div className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center text-white text-xs font-bold"
                                                    style={{ background: "linear-gradient(135deg, #6B0F2B, #9E2040)" }}>
                                                    {getInitials(student.studentName)}
                                                </div>
                                                <p className="text-black text-sm pl-2">
                                                    {student.studentName}
                                                </p>
                                            </div>
                                            <div className="flex flex-col px-2">
                                                <p className="col-span-1 text-[#1A0008] text-sm">
                                                    {student.stayType}
                                                </p>
                                                <p className="col-span-1 text-[#9A7080] text-xs">
                                                    {student.roomType}
                                                </p>
                                            </div>
                                            <div className="flex flex-col px-2">
                                                <p className="col-span-1 text-[#1A0008] text-sm">
                                                    {student.dateConfirmed}
                                                </p>
                                                <p className="col-span-1 text-[#9A7080] text-xs">
                                                    {timeAgo(student.dateConfirmed)}
                                                </p>
                                            </div>
                                            <div className="col-span-1 px-2 flex justify-center items-center">
                                                <span className={`inline-flex items-center justify-center gap-1 text-xs px-2 py-1.5 w-full max-w-[100px] rounded-full font-bold capitalize
                                                    ${student.status === "not assigned" ? "bg-[#9E2040]/10 text-[#9E2040]" : "bg-[#1A7A4A]/10 text-[#1A7A4A]"}
                                                `}>
                                                <span className={`w-2 h-2 rounded-full 
                                                    ${student.status === "not assigned" ? "bg-[#9E2040]" : "bg-[#1A7A4A]"}
                                                `}/>
                                                    {student.status}
                                                </span>
                                            </div>
                                            <div className="col-span-1 px-2 flex justify-center items-center">
                                                <Button variant="reddishPink" size="sm">
                                                    Assign Room
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )
                            : (
                                <div className="flex-1 flex justify-center items-center py-4 italic text-gray-500">
                                    {/* Empty card */}
                                    Nothing to see here
                                </div>
                            )
                        }

                    </div>
                </div>
                           
            </div>
        </div>
    )
}