type DonutChartProps = {
    percentage: number
    pctSize: string
    color?: string | [string, string]
    trackColor?: string | [string, string]
    size?: number
    strokeWidth?: number
    id?: string  // stable id to avoid gradient flickering
}

export default function DonutChart({
    percentage,
    pctSize,
    color = "#8C1535",
    trackColor = "#F5ECF0",
    size = 60,
    strokeWidth = 6,
    id = "donut",
}: DonutChartProps) {
    const radius = (size - strokeWidth) / 2
    const circumference = 2 * Math.PI * radius
    const offset = circumference - (percentage / 100) * circumference

    const gradientId = `${id}-color`
    const trackGradientId = `${id}-track`
    const isColorGradient = Array.isArray(color)
    const isTrackGradient = Array.isArray(trackColor)

    return (
        <div className="relative flex items-center justify-center flex-shrink-0" style={{ width: size, height: size }}>
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                <defs>
                    {isColorGradient && (
                        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor={(color as [string, string])[0]} />
                            <stop offset="100%" stopColor={(color as [string, string])[1]} />
                        </linearGradient>
                    )}
                    {isTrackGradient && (
                        <linearGradient id={trackGradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor={(trackColor as [string, string])[0]} />
                            <stop offset="100%" stopColor={(trackColor as [string, string])[1]} />
                        </linearGradient>
                    )}
                </defs>
                <circle
                    cx={size / 2} cy={size / 2} r={radius}
                    fill="none"
                    stroke={isTrackGradient ? `url(#${trackGradientId})` : (trackColor as string)}
                    strokeWidth={strokeWidth}
                />
                <circle
                    cx={size / 2} cy={size / 2} r={radius}
                    fill="none"
                    stroke={isColorGradient ? `url(#${gradientId})` : (color as string)}
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    transform={`rotate(-90 ${size / 2} ${size / 2})`}
                />
            </svg>
            <span
                className={`absolute font-semibold text-black text-${pctSize}`}>
                {percentage}%
            </span>
        </div>
    )
}