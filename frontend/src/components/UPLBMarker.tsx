import { Marker, Popup } from 'react-map-gl'
import { GraduationCap } from 'lucide-react'
import { UPLB } from '../constants/uplb'

interface UPLBMarkerProps {
    selected: boolean
    onOpen: () => void
    onClose: () => void
    compact?: boolean
}

export default function UPLBMarker({ selected, onOpen, onClose, compact = false }: UPLBMarkerProps) {
    return (
        <>
            <Marker
                longitude={UPLB.longitude}
                latitude={UPLB.latitude}
                anchor="bottom"
                style={{ zIndex: 499 }}
                onClick={(e) => {
                    e.originalEvent.stopPropagation()
                    onOpen()
                }}
            >
                {compact ? (
                    // Zoomed-out: tight circular badge with just the cap icon
                    <div
                        className="relative flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-br from-[#6B0F2B] to-[#9E2040] shadow-md ring-2 ring-white cursor-pointer"
                        title={UPLB.name}
                    >
                        <GraduationCap size={14} stroke="white" strokeWidth={2} />
                    </div>
                ) : (
                    <div className="relative flex flex-col items-center w-fit cursor-pointer">
                        <div className="relative flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-br from-[#6B0F2B] to-[#9E2040] shadow-md ring-1 ring-white/40 overflow-hidden z-10">
                            <div
                                className="absolute inset-0 z-0"
                                style={{ background: "linear-gradient(135deg, transparent 40%, rgba(42,4,16,0.55) 100%)" }}
                            />
                            <div className="relative flex items-center gap-1.5 z-10">
                                <GraduationCap size={13} stroke="white" strokeWidth={2} />
                                <span className="text-[11px] font-bold tracking-tight text-white leading-none">UPLB</span>
                            </div>
                        </div>
                        <div className="w-0 h-0 border-l-[8px] border-r-[8px] border-t-[10px] border-l-transparent border-r-transparent border-t-[#9E2040] -mt-px z-0" />
                    </div>
                )}
            </Marker>

            {selected && (
                <Popup
                    longitude={UPLB.longitude}
                    latitude={UPLB.latitude}
                    anchor="top"
                    onClose={onClose}
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
