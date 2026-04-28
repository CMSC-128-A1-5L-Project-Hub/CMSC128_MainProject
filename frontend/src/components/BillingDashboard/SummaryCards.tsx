interface SummaryCardsProps {
    label: string;
    value: number;
    color: string;
    sub: string;
}

export default function SummaryCards({label, value, color, sub} : SummaryCardsProps) {
    return (
        <div key={label} className="flex flex-col bg-white rounded-2xl shrink-0 justify-center p-6">
            <p className="text-[#9A7080] font-bold uppercase text-[13px]">{label}</p>
            <p className="font-bold text-[21.22px]" style={{ color: color }}>₱{value.toLocaleString()}</p>
            <p className="text-[#9A7080] text-[13.5px]">{sub}</p>
        </div>
    )
}