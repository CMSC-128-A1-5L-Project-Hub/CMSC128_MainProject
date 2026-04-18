import { IoPersonSharp } from "react-icons/io5";
import Button from "../../Button";

type ConfirmedStudent = {
    studentName: string
    stayType: string
}

export default function ConfirmedStudents({ data, className="" }: any) {
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
                <div className="grid grid-cols-4 border-b border-[#F5ECF0] uppercase">
                    <p className="col-span-2 text-[#9A7080] text-xs lg:text-sm font-bold p-1">
                        Student
                    </p>
                    <p className="col-span-1 text-[#9A7080] text-xs lg:text-sm font-bold p-1">
                        Confirmed
                    </p>
                </div>
                {data.length > 0 
                    ? (
                        <div className="flex flex-col">
                            {data.map((student: ConfirmedStudent, i:number) => (
                                <div key={i} className="grid grid-cols-4 flex justify-between items-center py-2">
                                    <div className="col-span-2 flex flex-row">
                                        <div className="w-8 h-8 bg-red-400 rounded-lg flex items-center justify-center mr-2" style={{ background: "linear-gradient(to bottom right, #6B0F2B 0%, #9E2040 100%)"}}>
                                            <IoPersonSharp size={20} color="white"/>
                                        </div>
                                        <p className="text-xs lg:text-sm flex items-center justify-center">
                                            {student.studentName}
                                        </p>
                                    </div>
                                    <p className="col-span-1 text-[#9A7080] text-xs lg:text-sm">
                                        {student.stayType}
                                    </p>
                                    <div className="col-span-1">
                                        <Button variant="tertiary" size="sm">
                                            Assign
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