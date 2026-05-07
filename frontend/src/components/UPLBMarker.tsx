import { useState } from 'react'
import { Marker, Popup } from 'react-map-gl'
import { GraduationCap } from 'lucide-react'
import { UPLB } from '../constants/uplb'

interface UPLBMarkerProps {
    onSelect?: () => void
}

export default function UPLBMarker({ onSelect }: UPLBMarkerProps) {
    const [selected, setSelected] = useState(false)

    return (
        <>
            <Marker
                longitude={UPLB.longitude}
                latitude={UPLB.latitude}
                anchor="bottom"
                onClick={(e) => {
                    e.originalEvent.stopPropagation()
                    setSelected(true)
                    onSelect?.()
                }}
            >
                <div className="relative flex flex-col items-center w-fit">
                    <div className="relative flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-br from-[#6B0F2B] to-[#9E2040] shadow-md overflow-hidden z-10">
                        <div
                            className="absolute inset-0 z-0"
                            style={{ background: "linear-gradient(135deg, transparent 40%, rgba(42,4,16,0.55) 100%)" }}
                        />
                        <div className="relative flex items-center gap-2 z-10">
                            <GraduationCap size={18} stroke="white" strokeWidth={1.5} />
                            <span className="text-base font-medium tracking-tight text-white">UPLB</span>
                        </div>
                    </div>
                    <div className="w-0 h-0 border-l-[14px] border-r-[14px] border-t-[18px] border-l-transparent border-r-transparent border-t-[#9E2040] -mt-1 z-0" />
                </div>
            </Marker>

            {selected && (
                <Popup
                    longitude={UPLB.longitude}
                    latitude={UPLB.latitude}
                    anchor="top"
                    onClose={() => setSelected(false)}
                    closeButton
                    closeOnClick={false}
                    maxWidth="220px"
                    className="up-popup"
                >
                    <div style={{ fontFamily: 'sans-serif', padding: '4px' }}>
                        <p style={{ fontWeight: 'bold', fontSize: '14px', margin: '0 0 4px 0' }}>🎓 {UPLB.name}</p>
                        <p style={{ fontSize: '12px', color: '#6B7280', margin: 0 }}>University of the Philippines Los Baños</p>
                    </div>
                </Popup>
            )}
        </>
    )
}
