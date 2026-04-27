import { useState } from "react";

interface PhotoCarouselProps {
    photos: string[];
}

export default function PhotoCarousel({photos} : PhotoCarouselProps) {
const [currentPhoto, setCurrentPhoto] = useState(0);

    return (
        <div className="relative w-full mb-3 h-40 overflow-hidden rounded-xl border-0 bg-gray-100">
            {photos.length === 0 ? (
                <div className="w-full h-full flex items-center justify-center text-[#9A7080] text-[12px]">
                    No photos available
                </div>
            ) : (
                <>
                    <img 
                        src={photos[currentPhoto]} 
                        alt="" 
                        className="w-full h-full object-cover"
                    />
                    {photos.length > 1 && (
                        <>
                            <button
                                onClick={() => setCurrentPhoto(i => (i - 1 + photos.length) % photos.length)}
                                className="absolute left-2 top-1/2 -translate-y-1/2 bg-[#6B0F2B]/40 text-white rounded-full w-8 h-8 flex items-center justify-center">
                                
                            </button>
                            <button
                                onClick={() => setCurrentPhoto(i => (i + 1) % photos.length)}
                                className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#6B0F2B]/40 text-white rounded-full w-8 h-8 flex items-center justify-center">
                                ›
                            </button>
                            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                                {photos.map((_, i) => (
                                    <div
                                        key={i}
                                        onClick={() => setCurrentPhoto(i)}
                                        className={`w-1.5 h-1.5 rounded-full cursor-pointer ${i === currentPhoto ? 'bg-white' : 'bg-white/50'}`}
                                    />
                                ))}
                            </div>
                        </>
                    )}
                </>
            )}
        </div>
    )
}
