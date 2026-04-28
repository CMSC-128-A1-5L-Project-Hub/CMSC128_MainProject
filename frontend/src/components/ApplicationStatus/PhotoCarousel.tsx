import { useState } from "react";

interface PhotoCarouselProps {
    photos: string[];
    hidden?: boolean;
}

const LeftArrowIcon = () => (
    <svg fill="#ffffff" height="200px" width="200px" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512.006 512.006" stroke="#ffffff"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g> <g> <path d="M388.419,475.59L168.834,256.005L388.418,36.421c8.341-8.341,8.341-21.824,0-30.165s-21.824-8.341-30.165,0 L123.586,240.923c-8.341,8.341-8.341,21.824,0,30.165l234.667,234.667c4.16,4.16,9.621,6.251,15.083,6.251 c5.461,0,10.923-2.091,15.083-6.251C396.76,497.414,396.76,483.931,388.419,475.59z"></path> </g> </g> </g></svg>
);

const RightArrowIcon = () => (
    <svg fill="#ffffff" height="200px" width="200px" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512.005 512.005" stroke="#ffffff"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g> <g> <path d="M388.418,240.923L153.751,6.256c-8.341-8.341-21.824-8.341-30.165,0s-8.341,21.824,0,30.165L343.17,256.005 L123.586,475.589c-8.341,8.341-8.341,21.824,0,30.165c4.16,4.16,9.621,6.251,15.083,6.251c5.461,0,10.923-2.091,15.083-6.251 l234.667-234.667C396.759,262.747,396.759,249.264,388.418,240.923z"></path> </g> </g> </g></svg>
);

export default function PhotoCarousel({photos, hidden} : PhotoCarouselProps) {
const [currentPhoto, setCurrentPhoto] = useState(0);

    return (
        <div className={`${hidden ? "w-0 h-0" : "w-full h-40"} relative transition-all overflow-hidden rounded-xl border-0 bg-gray-100`}>
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
                                className="absolute left-2 top-1/2 p-0 -translate-y-1/2 bg-[#6B0F2B]/40 text-white rounded-full w-8 h-8 flex items-center justify-center">
                                <p className="-mt-1 font-bold">‹</p>
                            </button>
                            <button
                                onClick={() => setCurrentPhoto(i => (i + 1) % photos.length)}
                                className="absolute right-2 top-1/2 p-0 -translate-y-1/2 bg-[#6B0F2B]/40 text-white rounded-full w-8 h-8 flex items-center justify-center">
                                <p className="-mt-1 font-bold">›</p>
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
