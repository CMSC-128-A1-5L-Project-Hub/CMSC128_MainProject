import Card from "../../ui/Card"
import DonutChart from "../../ui/DonutChart"

type AvailableRoomsProps = {
    totalRooms: number
    soloRooms: number
    doubleRooms: number
    sharedRooms: number
}

export default function AvailableRooms({
    totalRooms,
    soloRooms,
    doubleRooms,
    sharedRooms
}: AvailableRoomsProps) {
    const percentage = totalRooms > 0 ? Math.round(((soloRooms + doubleRooms + sharedRooms) / totalRooms) * 100) : 0

    const rooms = [
        { label: "Solo Rooms",   value: soloRooms },
        { label: "Double Rooms", value: doubleRooms },
        { label: "Shared Rooms", value: sharedRooms },
    ]

    return (
        <Card
            children={
                <>
                    <p className="text-[#1A0008] font-bold">Available Rooms</p>
                    <div className="flex flex-row items-center mt-3 gap-4">
                        <DonutChart
                            percentage={percentage}
                            size={120}
                            strokeWidth={12}
                            pctSize="lg"
                        />
                        <div className="flex flex-col gap-2 flex-1 min-w-0">
                            {rooms.map((room) => (
                                <div
                                    key={room.label}
                                    className="flex flex-row items-center justify-between rounded-xl bg-[#FCF3F3] px-3 py-2"
                                >
                                    <div>
                                        <p className="text-[#9A7080] text-xs">{room.label}</p>
                                        <p className="text-[#1A0008] text-base leading-tight">{room.value}</p>
                                    </div>
                                    <div className="w-2 h-2 rounded-full bg-[#9A0134] flex-shrink-0" />
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            }
        />
    )
}