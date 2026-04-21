import DonutChart from "../ui/DonutChart"
import Card from "../ui/Card"

type StatCardProps = {
    title: string
    value: number
    total?: number        // used to compute the donut percentage
    subtitle?: string
    color?: string
    donutSize?: number
    strokeWidth?: number
}

export default function StatCard({
    title,
    value,
    total = 100,
    subtitle,
    color = "#8C1535",
    donutSize = 60,
    strokeWidth = 6
}: StatCardProps) {
    const percentage = Math.round((value / total) * 100)

    return (
        <Card 
            className="flex flex-col lg:flex-row items-center gap-4 bg-white rounded-2xl px-5 py-3 lg:py-4"
            children={
                <>
                <DonutChart percentage={percentage} color={color} size={donutSize} strokeWidth={strokeWidth}/>
                <div>
                    <p className="text-xs text-center lg:text-sm font-semibold text-[#3D0718]">{title}</p>
                    <p className="hidden lg:block text-xl font-bold text-[#6B0F2B]">{value}</p>
                    {subtitle && (
                        <p className="hidden lg:block text-xs text-[#3D0718]/50">{subtitle}</p>
                    )}
                </div>
                </>
            }
        />
    )
}