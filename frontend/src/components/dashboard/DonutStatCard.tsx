import DonutChart from "../ui/DonutChart"
import Card from "../ui/Card"

type StatCardProps = {
    id?: string          // passed to DonutChart for stable gradient ids
    title: string
    value: number
    total?: number
    subtitle?: string
    pctSize?: string
    color?: string | [string, string]
    trackColor?: string | [string, string]
    titleClassName?: string
    subtitleClassName?: string
    valueColor?: string          // explicit override; defaults to color
    valueSize?: string
    valueWeight?: string
    donutSize?: number
    strokeWidth?: number
}

export default function DonutStatCard({
    id = "donut",
    title,
    value,
    total = 100,
    subtitle,
    pctSize = "sm",
    color = "#8C1535",
    trackColor = "#F5ECF0",
    titleClassName = "",
    subtitleClassName = "",
    valueColor,
    valueSize = "sm",
    valueWeight = "semibold",
    donutSize = 60,
    strokeWidth = 6,
}: StatCardProps) {
    const percentage = total > 0 ? Math.round((value / total) * 100) : 0
    
    return (
        <Card className="flex flex-col xl:flex-row items-center gap-4 bg-white rounded-2xl px-5 py-3 lg:py-4">
            <DonutChart
                id={id}
                percentage={percentage}
                color={color}
                trackColor={trackColor}
                size={donutSize}
                strokeWidth={strokeWidth}
                pctSize={pctSize}
            />
            <div className="flex flex-col gap-0.5">
                <p className={`${titleClassName} font-semibold text-center xl:text-left`}>
                    {title}
                </p>
                <p className={`hidden xl:block font-${valueWeight} text-[${valueColor}] text-${valueSize}`}>
                    {value}
                </p>
                {subtitle && (
                    <p className={`hidden lg:block ${subtitleClassName}`}>
                        {subtitle}
                    </p>
                )}
            </div>
        </Card>
    )
}