interface Stat {
    label: string;
    count: number;
    from: string;
    to: string;
    bg: string;
    text: string;
}

interface StatsBannerProps {
    stats: Stat[];
    total: number;
    cols?: number;
}

export default function StatsBanner({ stats, total, cols = 5 }: StatsBannerProps){
    return (
        <div className="bg-white p-6 rounded-2xl shrink-0">
            <div
                className="grid grid-cols-2 gap-4"
                style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
                >
                {stats.map((stat, i) => (
                    <div key={stat.label} className={i === 0 ? "col-span-2 lg:col-span-1" : "col-span-1"}>
                        <span className="block uppercase font-bold text-[11px] lg:text-[11px] tracking-widest" style={{ color: stat.text }}>
                            {stat.label}
                        </span>
                        <div className="flex flex-grow items-center gap-3 mt-1">
                            <div className="flex-1 rounded-full h-5 lg:h-7" style={{ backgroundColor: stat.bg }}>
                                <div
                                    className="lg:h-7 h-5 rounded-full flex items-center justify-left pl-2"
                                    style={{
                                        width: `${total === 0 ? 0 : (stat.count / total) * 100}%`,
                                        background: stat.count === 0
                                            ? 'transparent'
                                            : `linear-gradient(to right, ${stat.from}, ${stat.to})`
                                    }}
                                >
                                    <span
                                        className="tracking-widest drop-shadow-[0_2px_4px_rgba(0,0,0,0.2)] pl-1 text-[11px] lg:text-[12px] font-bold"
                                        style={{ color: stat.count === 0 ? stat.text : '#ffffff' }}
                                    >
                                        {stat.count}/{total}
                                    </span>
                                </div>
                            </div>
                            <span className="-ml-1 text-[12px] lg:text-[13px] font-semibold" 
                                style={{ color: stat.text }}
                            >
                                {total === 0 ? 0 : Math.round((stat.count / total) * 100)}%
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}