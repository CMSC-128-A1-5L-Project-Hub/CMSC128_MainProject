type DonutChartProps = {
    percentage: number
    size?: number
    strokeWidth?: number
    color?: string
    trackColor?: string
    textSize?:string
}

export default function DonutChart({
    percentage,
    size = 80,
    strokeWidth = 8,
    color = "#8C1535",
    trackColor = "#E5D0D5",
    textSize="sm"
}: DonutChartProps) {
    const radius = (size - strokeWidth) / 2
    const circumference = 2 * Math.PI * radius
    const offset = circumference - (percentage / 100) * circumference

    return (
        <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
            <svg width={size} height={size} className="-rotate-90">
                {/* Track */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={trackColor}
                    strokeWidth={strokeWidth}
                />
                {/* Progress */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={color}
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                />
            </svg>
            <span className={`absolute text-${textSize} font-semibold text-[#3D0718]`}>
                {percentage}%
            </span>
        </div>
    )
}