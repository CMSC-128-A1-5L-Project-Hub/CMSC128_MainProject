import Button from "../../Button"

type Application = {
    studentName: string
    type: string
    appliedDate: string 
}

export default function Applications({ data, className="" }: any) {
    //avatar initials from name
    const getInitials = (name: string) => name[0]

    return(
        <div className={className}>
            <div className="bg-white border border-[#E8D0D8] rounded-xl p-3 lg:p-4 shadow-sm w-full h-full flex flex-col min-w-0">
                <div className="flex flex-row justify-between w-full pb-2 border-b border-[#F5ECF0]">
                    <p className="text-[#1A0008] font-bold">
                        Applications
                    </p>
                    <p className="text-[#6B0F2B] font-bold text-sm hover:underline cursor-pointer">
                        View all →
                    </p>
                </div>
                <div className="grid grid-cols-5 border-b border-[#F5ECF0] uppercase">
                    
                    <p className="col-span-2 text-[#9A7080] text-xs lg:text-sm font-bold p-1">
                        Student
                    </p>
                    <p className="col-span-1 text-[#9A7080] text-xs lg:text-sm font-bold p-1">
                        Type
                    </p>
                    <p className="col-span-1 text-[#9A7080] text-xs lg:text-sm font-bold p-1">
                        Applied
                    </p>
                    <p className="col-span-1 text-[#9A7080] text-xs lg:text-sm font-bold p-1">
                        Action
                    </p>
                </div>
                <div className="grid grid-cols-5">
                {data.map((application: Application, i:number) => (
                        <div key={i} className="col-span-5 grid grid-cols-5 mt-3">
                            <div className="col-span-2 flex flex-row items-center">
                                <div className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center text-white text-xs font-bold"
                                    style={{ background: "linear-gradient(135deg, #6B0F2B, #9E2040)" }}>
                                    {getInitials(application.studentName)}
                                </div>
                                <p className="text-black text-xs lg:text-sm pl-1">
                                    {application.studentName}
                                </p>
                            </div>
                            <p className="col-span-1 text-[#9A7080] text-xs lg:text-sm p-1">
                                {application.type}
                            </p>
                            <p className="col-span-1 text-[#9A7080] text-xs lg:text-sm p-1">
                                {application.appliedDate}
                            </p>
                            <div className="col-span-1 flex items-center">
                                <Button variant="tertiary" size="sm">
                                    Review
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
