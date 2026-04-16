type StatProps = {
    title: string
    subtitle: string
    value: number
}

export default function StatCard({ title, subtitle, value }: StatProps) {
    return (
        <div className="bg-white border border-[#E8D0D8] rounded-xl p-3 lg:p-3 shadow-sm flex flex-row">
            <div className="flex flex-col">
                <p className="text-xs lg:text-sm text-[#9B2244] text-nowrap">
                    {title}
                </p>
                <p className="text-xl lg:text-2xl text-[#6B0F2B]">
                    {value}
                </p>
                <p className="text-[#0F6E56] text-xs lg:text-sm">
                    {subtitle}
                </p>
            </div>
            
        </div>
    )
}