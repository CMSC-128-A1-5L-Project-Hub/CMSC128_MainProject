import Button from "../../Button"

type WaitlistProps = {
    students: string[]
    className: string
}

export default function Waitlist({ students=[], className="" }:WaitlistProps) {
    return (
        <div className={className}>
            <div className="bg-white border border-[#E8D0D8] rounded-xl p-3 lg:p-4 shadow-sm w-full h-full flex flex-col">
                <div className="flex flex-row justify-between w-full pb-2 border-b border-[#F5ECF0]">
                    <p className="text-[#1A0008] font-bold">
                        Waitlist
                    </p>
                    <p className="text-[#6B0F2B] font-bold text-sm hover:underline cursor-pointer">
                        View all →
                    </p>
                </div>
                <div className="grid grid-cols-3 border-b border-[#F5ECF0] uppercase">
                    <p className="col-span-2 text-[#9A7080] text-xs lg:text-sm font-bold p-1">
                        Student
                    </p>
                    <p className="col-span-1 text-[#9A7080] text-xs lg:text-sm font-bold p-1">
                        Action
                    </p>
                </div>
                {students.length > 0 ? (
                    <div className="grid grid-cols-3">
                        {students.map((student, i) => (
                            <div key={i} className="col-span-3 grid grid-cols-3 flex justify-between items-center py-2">
                                <p className="col-span-2 text-xs lg:text-sm text-[#1A0008]">
                                    {student}
                                </p>
                                <div className="col-span-1 flex items-center">
                                    <Button variant="tertiary" size="sm">
                                        Review
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex-1 flex justify-center items-center py-4 italic text-gray-500">
                        {/* Empty card */}
                        Nothing to see here
                    </div>
                )}
                
            </div>
        </div>
    )
}