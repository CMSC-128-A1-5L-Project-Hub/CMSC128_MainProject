import Button from "../../Button"

type WaitlistProps = {
    students: string[]
    className: string
}

export default function Waitlist({ students=[], className="" }:WaitlistProps) {
    //avatar initials from name
    const getInitials = (name: string) => name[0]

    return (
        <div className={className}>
            <div className="bg-white border border-[#E8D0D8] rounded-xl p-3 lg:p-4 shadow-sm w-full h-full flex flex-col min-w-0">
                <div className="flex flex-row justify-between w-full pb-2 border-b border-[#F5ECF0]">
                    <p className="text-[#1A0008] font-bold">
                        Waitlist
                    </p>
                    <p className="text-[#6B0F2B] font-bold text-sm hover:underline cursor-pointer">
                        View all →
                    </p>
                </div>
                <div className="grid grid-cols-3 border-b border-[#F5ECF0] uppercase">
                    <p className="col-span-2 text-[#9A7080] text-xs font-bold p-1">
                        Student
                    </p>
                    <p className="col-span-1 text-center text-[#9A7080] text-xs font-bold p-1">
                        Action
                    </p>
                </div>
                {students.length > 0 ? (
                    <div className="grid grid-cols-3">
                        {students.map((student, i) => (
                            <div key={i} className="col-span-3 grid grid-cols-3 flex justify-between items-center py-2 px-1">
                                <div className="col-span-2 flex flex-row items-center">
                                    <div className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center text-white text-xs font-bold"
                                        style={{ background: "linear-gradient(135deg, #6B0F2B, #9E2040)" }}>
                                        {getInitials(student)}
                                    </div>
                                    <p className="text-sm text-[#1A0008] pl-2">
                                        {student}
                                    </p>
                                </div>
                                <div className="col-span-1 flex items-center justify-center">
                                    <Button variant="reddishPink" size="sm">
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