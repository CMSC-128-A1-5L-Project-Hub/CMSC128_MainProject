type StatProps = {
    title: string
    value: number
    icon: React.ReactNode
}

export default function StatCard({ title, value, icon }: StatProps) {
    return (
        <div className="bg-white border border-[#E8D0D8] rounded-xl p-3 lg:p-4 shadow-sm flex flex-row">
            <div className="flex text-[#3B0718] text-lg mr-1 items-center justify-center">
                {icon}
            </div>
            <div className="flex flex-col">
                <p className="text-[12px] lg:text-sm text-[#1A0008] font-bold text-nowrap">
                    {title}
                </p>
                <p className="text-[12px] lg:text-sm text-[#7F1633] font-bold">
                    {value}
                </p>
            </div>
            
        </div>
    )
}