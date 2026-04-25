import Card from "../../ui/Card";

type OccupiedRoomsProps = {
    occupiedSolo: number
    totalSolo: number
    occupiedDouble: number
    totalDouble: number
    occupiedShared: number
    totalShared: number
}

//might refactor this later para mas clean tingnan idk

export default function OccupiedRooms({
    occupiedSolo,
    totalSolo,
    occupiedDouble,
    totalDouble,
    occupiedShared,
    totalShared
}: OccupiedRoomsProps) {
    const soloPct = totalSolo > 0 ? Math.round((occupiedSolo / totalSolo) * 100) : 0
    const doublePct = totalDouble > 0 ? Math.round((occupiedDouble / totalDouble) * 100) : 0
    const sharedPct = totalShared > 0 ? Math.round((occupiedShared / totalShared) * 100) : 0

    return (
        <Card>
            <p className="text-[#1A0008] font-bold mb-2">Occupied Rooms</p>

            {/* Solo */}
            <p className="text-[#1A0008] font-semibold text-sm">Solo</p>
            <div className="flex items-center gap-4 w-full mb-2">
                <div className="flex-1 h-4 bg-[#D9D9D9] rounded-xl overflow-hidden">
                    <div
                        className="h-full rounded-xl"
                        style={{
                            width: `${soloPct}%`,
                            background: `linear-gradient(to right, #340714, #911D3A)`
                        }}
                    />
                </div>
                <span className="w-14 text-center drop-shadow-[0_2px_4px_rgba(0,0,0,0.2)] text-black text-sm font-bold">
                    {occupiedSolo}/{totalSolo}
                </span>
            </div>

            {/* Double */}
            <p className="text-[#1A0008] font-semibold text-sm">Double</p>
            <div className="flex items-center gap-4 w-full mb-2">
                <div className="flex-1 h-4 bg-[#D9D9D9] rounded-xl overflow-hidden">
                    <div
                        className="h-full rounded-xl"
                        style={{
                            width: `${doublePct}%`,
                            background: `linear-gradient(to right, #340714, #911D3A)`
                        }}
                    />
                </div>
                <span className="w-14 text-center drop-shadow-[0_2px_4px_rgba(0,0,0,0.2)] text-black text-sm font-bold">
                    {occupiedDouble}/{totalDouble}
                </span>
            </div>

            {/* Shared */}
            <p className="text-[#1A0008] font-semibold text-sm">Shared</p>
            <div className="flex items-center gap-4 w-full">
                <div className="flex-1 h-4 bg-[#D9D9D9] rounded-xl overflow-hidden">
                    <div
                        className="h-full rounded-xl"
                        style={{
                            width: `${sharedPct}%`,
                            background: `linear-gradient(to right, #340714, #911D3A)`
                        }}
                    />
                </div>
                <span className="w-14 text-center drop-shadow-[0_2px_4px_rgba(0,0,0,0.2)] text-black text-sm font-bold">
                    {occupiedShared}/{totalShared}
                </span>
            </div>
        </Card>
    )
}