import DonutChart from "../ui/DonutChart"

type StatCardProps = {
    title: string
    value: number
    total?: number        // used to compute the donut percentage
    subtitle?: string
    color?: string
}

export default function StatCard({
    title,
    value,
    total = 100,
    subtitle,
    color = "#6B0F2B"
}: StatCardProps) {
    const percentage = Math.round((value / total) * 100)

    return (
        <div className="flex flex-col lg:flex-row items-center gap-4 bg-white rounded-2xl px-5 py-3 lg:py-4 border border-[#6B0F2B]/10">
            <DonutChart percentage={percentage} color={color} />
            <div>
                <p className="text-xs text-center lg:text-sm font-semibold text-[#3D0718]">{title}</p>
                <p className="hidden lg:block text-2xl font-bold text-[#6B0F2B]">{value}</p>
                {subtitle && (
                    <p className="hidden lg:block text-xs text-[#3D0718]/50">{subtitle}</p>
                )}
            </div>
        </div>
    )
}