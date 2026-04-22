import Button from "../../Button"

type Move = {
    studentName: string
    room: string
    building: string
    roomType: string
    stayType: string
    type: string
    date: string
}

export default function Moves({ data, className="" }: {data: Move[], className: string}) {
    //avatar initials from name
    const getInitials = (name: string) => name[0]

    return (
        <div className={className}>
            <div className="bg-white border border-[#E8D0D8] rounded-xl p-3 lg:p-4 shadow-sm w-full h-full flex flex-col">
                <div className="flex flex-row justify-between w-full pb-2 border-b border-[#F5ECF0]">
                    <p className="text-[#1A0008] font-bold">
                        Upcoming Move-ins & Move-outs
                    </p>
                    <p className="text-[#6B0F2B] font-bold text-sm hover:underline cursor-pointer">
                        View all →
                    </p>
                </div>

                <div className="overflow-y-auto -mx-0">
                    <div className="min-w-[780px] pb-3 lg:pb-0">
                        <div className="grid grid-cols-6 border-b border-[#F5ECF0] uppercase"
                            style={{ gridTemplateColumns: "1.25fr 1fr 1fr 1fr 1fr 1fr" }}
                        >
                            <p className="col-span-1 text-[#9A7080] text-xs font-bold py-1">
                                Student
                            </p>
                            <p className="col-span-1 text-[#9A7080] text-xs font-bold py-1">
                                Room
                            </p>
                            <p className="col-span-1 text-[#9A7080] text-xs font-bold py-1">
                                Room Type
                            </p>
                            <p className="col-span-1 text-[#9A7080] text-xs font-bold py-1">
                                Date
                            </p>
                            <p className="col-span-1 text-center text-[#9A7080] text-xs font-bold py-1">
                                Type
                            </p>
                            <p className="col-span-1 text-center text-[#9A7080] text-xs font-bold py-1">
                                Action
                            </p>
                        </div>
                        {data.length > 0 
                            ? (
                                <div className="flex flex-col">
                                    {data.map((move: Move, i:number) => (
                                        <div key={i} className="grid grid-cols-6 flex py-2"
                                            style={{ gridTemplateColumns: "1.25fr 1fr 1fr 1fr 1fr 1fr" }}
                                        >
                                            <div className="col-span-1 flex flex-row items-center px-1">
                                                <div className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center text-white text-xs font-bold"
                                                    style={{ background: "linear-gradient(135deg, #6B0F2B, #9E2040)" }}>
                                                    {getInitials(move.studentName)}
                                                </div>
                                                <p className="text-black text-sm pl-2">
                                                    {move.studentName}
                                                </p>
                                            </div>
                                            <div className="flex flex-col">
                                                <p className="col-span-1 text-[#1A0008] text-sm">
                                                    {move.room}
                                                </p>
                                                <p className="col-span-1 text-[#9A7080] text-xs">
                                                    {move.building}
                                                </p>
                                            </div>
                                            <div className="flex flex-col">
                                                <p className="col-span-1 text-[#1A0008] text-sm">
                                                    {move.stayType}
                                                </p>
                                                <p className="col-span-1 text-[#9A7080] text-xs">
                                                    {move.roomType}
                                                </p>
                                            </div>
                                            <p className="col-span-1 text-[#1A0008] text-sm flex items-center">
                                                {move.date}
                                            </p>
                                            <div className="col-span-1 px-2 flex justify-center items-center">
                                                <span className={`inline-flex items-center justify-center gap-1 text-xs px-2 py-1.5 w-full max-w-[100px] rounded-full font-bold capitalize
                                                    ${move.type === "move-out" ? "bg-[#9E2040]/10 text-[#9E2040]" : "bg-[#1A7A4A]/10 text-[#1A7A4A]"}
                                                `}>
                                                <span className={`w-2 h-2 rounded-full 
                                                    ${move.type === "move-out" ? "bg-[#9E2040]" : "bg-[#1A7A4A]"}
                                                `}/>
                                                    {move.type}
                                                </span>
                                            </div>
                                            <div className="col-span-1 flex justify-center items-center">
                                                <Button variant="reddishPink" size="sm" className="px-6">
                                                    View
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