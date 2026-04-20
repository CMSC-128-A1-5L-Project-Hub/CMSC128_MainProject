import Button from "../../Button";

type ConfirmedStudent = {
    studentName: string
    stayType: string
    dateConfirmed: string
    status: "assigned" | "not assigned"
}

export default function ConfirmedStudents({ data, className="" }: any) {
    //avatar initials from name
    const getInitials = (name: string) => name[0]

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
                <div className="grid grid-cols-5 border-b border-[#F5ECF0] uppercase">
                    <p className="col-span-1 text-[#9A7080] text-xs lg:text-sm font-bold p-1">
                        Student
                    </p>
                    <p className="col-span-1 px-2 text-center text-[#9A7080] text-xs lg:text-sm font-bold p-1">
                        Confirmed Room Type
                    </p>
                    <p className="col-span-1 px-2 text-center text-[#9A7080] text-xs lg:text-sm font-bold p-1">
                        Date Confirmed
                    </p>
                    <p className="col-span-1 px-2 text-center text-[#9A7080] text-xs lg:text-sm font-bold p-1">
                        Status
                    </p>
                    <p className="col-span-1 px-2 text-center text-[#9A7080] text-xs lg:text-sm font-bold p-1">
                        Action
                    </p>
                </div>
                {data.length > 0 
                    ? (
                        <div className="flex flex-col">
                            {data.map((student: ConfirmedStudent, i:number) => (
                                <div key={i} className="grid grid-cols-5 items-center py-2">
                                    <div className="col-span-1 flex flex-row items-center">
                                        {/* Should be the student's image */}
                                        <div className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center text-white text-xs font-bold"
                                            style={{ background: "linear-gradient(135deg, #6B0F2B, #9E2040)" }}>
                                            {getInitials(student.studentName)}
                                        </div>
                                        <p className="text-black text-xs lg:text-sm pl-1">
                                            {student.studentName}
                                        </p>
                                    </div>
                                    <p className="col-span-1 px-2 text-center text-[#9A7080] text-xs lg:text-sm">
                                        {student.stayType}
                                    </p>
                                    <p className="col-span-1 px-2 text-center text-[#9A7080] text-xs lg:text-sm">
                                        {student.dateConfirmed}
                                    </p>
                                    <div className="col-span-1 px-2 flex justify-center">
                                        <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium capitalize
                                            ${student.status === "assigned"
                                                ? "bg-green-50 text-green-700"
                                                : "bg-pink-50 text-[#9E2040]"}`}>
                                            <span className={`w-1.5 h-1.5 rounded-full
                                                ${student.status === "assigned" ? "bg-green-500" : "bg-[#9E2040]"}`} />
                                            {student.status}
                                        </span>
                                    </div>
                                    <div className="col-span-1 px-2 flex items-center justify-center">
                                        <Button variant="tertiary" size="sm">
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
    )
}