type Move = {
    studentName: string
    room: string
    action: string
    date: string
}

export default function Moves({ data, className="" }: any) {
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
                <div className="grid grid-cols-4 border-b border-[#F5ECF0] uppercase">
                    <p className="col-span-1 text-[#9A7080] text-xs lg:text-sm font-bold p-1">
                        Student
                    </p>
                    <p className="col-span-1 text-[#9A7080] text-xs lg:text-sm font-bold p-1">
                        Confirmed
                    </p>
                    <p className="col-span-1 text-[#9A7080] text-xs lg:text-sm font-bold p-1">
                        Action
                    </p>
                    <p className="col-span-1 text-[#9A7080] text-xs lg:text-sm font-bold p-1">
                        Date
                    </p>
                </div>
                {data.length > 0 
                    ? (
                        <div className="flex flex-col">
                            {data.map((move: Move, i:number) => (
                                <div key={i} className="grid grid-cols-4 flex py-2">
                                    <p className="col-span-1 text-xs lg:text-sm">
                                        {move.studentName}
                                    </p>
                                    <p className="col-span-1 text-[#9A7080] text-xs lg:text-sm">
                                        {move.room}
                                    </p>
                                    <p className="col-span-1 text-[#9A7080] text-xs lg:text-sm">
                                        {move.action}
                                    </p>
                                    <p className="col-span-1 text-[#9A7080] text-xs lg:text-sm">
                                        {move.date}
                                    </p>
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