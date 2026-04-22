interface StatBarProps {
    label: string
    value: number
    total: number
    from: string        // gradient start color
    to: string          // gradient end color
    bg: string          // track background color
    textColor: string   // label + percentage color
    className?: string
}

const StatBar = ({
    label,
    value,
    total,
    from,
    to,
    bg,
    textColor,
    className
}: StatBarProps) => {
    const pct = total > 0 ? Math.round((value / total) * 100) : 0

    return (
        <div className={className}>
            {/* Label */}
            <span
                className="block uppercase font-bold text-[11px] lg:text-[12px]"
                style={{ color: textColor }}
            >
                {label}
            </span>

            {/* Bar row */}
            <div className="flex items-center gap-3 mt-1">
                <div
                    className="flex-1 rounded-xl h-5 lg:h-7"
                    style={{ backgroundColor: bg }}
                >
                    <div
                        className="h-5 lg:h-7 rounded-xl flex items-center pl-2"
                        style={{
                            width: `${total === 0 ? 0 : pct}%`,
                            background: `linear-gradient(to right, ${from}, ${to})`
                        }}
                    >
                        <span className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.2)] text-white text-[11px] lg:text-[12px] font-bold">
                            {value}/{total}
                        </span>
                    </div>
                </div>

                {/* Percentage */}
                <span
                    className="text-[12px] lg:text-[13px] font-bold flex-shrink-0"
                    style={{ color: textColor }}
                >
                    {total === 0 ? 0 : pct}%
                </span>
            </div>
        </div>
    )
}

export default StatBar