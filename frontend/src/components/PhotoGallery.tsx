import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MdChevronLeft, MdChevronRight } from "react-icons/md";

const CLR = { dark: "#3D0718", mid: "#902C4A" } as const;

interface PhotoGalleryAssets {
  photos: string[];
  onViewAll: () => void;
}

const IconPlus = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
  </svg>
);

export default function PhotoGallery({ photos }: PhotoGalleryAssets) {
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);
  const [showModal, setShowModal] = useState(false);

  const prev = () => setCurrent((c) => (c - 1 + photos.length) % photos.length);
  const next = () => setCurrent((c) => (c + 1) % photos.length);

  return (
    <div>
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm font-semibold mb-3 hover:underline"
        style={{ color: CLR.mid }}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5M12 5l-7 7 7 7" />
        </svg>
        Back
      </button>

      {/* ===== GALLERY LAYOUT ===== */}
      <div className="grid grid-cols-[1.75fr_1fr] grid-rows-2 gap-2 h-[260px] rounded-2xl overflow-hidden">

        {/* MAIN IMAGE (LEFT, BIG) */}
        <div className="relative row-span-2 overflow-hidden">
          <img
            src={photos[current]}
            alt="Main"
            className="w-full h-full object-cover"
          />

          {/* Left button */}
          <button
            onClick={prev}
            className="text-white absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-10 h-10 rounded-full text-white shadow-md"
            style={{ background: CLR.mid }}
          >
            <MdChevronLeft size={22} style={{ color: "#fff" }} 
            />
          </button>

          {/* Right button */}
          <button
            onClick={next}
            className="text-white absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-10 h-10 rounded-full text-white shadow-md"
            style={{ background: CLR.mid }}
          >
            <MdChevronRight size={22} style={{ color: "#fff" }} />
          </button>
        </div>

        {/* TOP RIGHT (SECOND LARGEST) */}
        <div
          className="relative overflow-hidden cursor-pointer"
          onClick={() => setCurrent(1)}
        >
          <img
            src={photos[1]}
            alt="Second"
            className="w-full h-full object-cover"
          />
        </div>

        {/* BOTTOM RIGHT (2 SMALL IMAGES) */}
        <div className="grid grid-cols-2 gap-2">

          {/* SMALL 1 */}
          <div
            className="relative overflow-hidden cursor-pointer"
            onClick={() => setCurrent(2)}
          >
            <img
              src={photos[2]}
              alt="Third"
              className="w-full h-full object-cover"
            />
          </div>

          {/* SMALL 2 (VIEW ALL) */}
          <div
            className="relative overflow-hidden cursor-pointer"
            onClick={() => setCurrent(3)}
          >
            <img
              src={photos[3]}
              alt="Fourth"
              className="w-full h-full object-cover"
            />

            {/* Overlay */}
            <div className="absolute inset-0 bg-[#6B0F2B]/70 flex items-center justify-center">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowModal(true);
                }}
                className="bg-white text-gray-900 text-sm font-semibold px-4 py-2 rounded-full flex items-center gap-2 shadow"
              >
                <IconPlus /> All photos
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* ===== MODAL ===== */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-5xl w-full max-h-[90vh] overflow-auto p-4">

            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">All Photos</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-600 hover:text-black"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {photos.map((src, i) => (
                <img
                  key={i}
                  src={src}
                  alt={`Photo ${i}`}
                  className="w-full h-40 object-cover rounded-lg"
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}