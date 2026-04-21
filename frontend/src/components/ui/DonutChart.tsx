type DonutChartProps = {
    percentage: number
    size?: number
    strokeWidth?: number
    color?: string
    trackColor?: string
}

export default function DonutChart({
    percentage,
    size = 80,
    strokeWidth = 8,
    color = "#6B0F2B",
    trackColor = "#E5D0D5"
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
            <span className="absolute text-xs font-semibold text-[#3D0718]">
                {percentage}%
            </span>
        </div>
    )
}