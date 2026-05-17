"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MdChevronLeft, MdChevronRight } from "react-icons/md";
import { api } from "../../api/axios";
import { useNavigate } from "react-router-dom";
import MiniAuthModal from "../../components/MiniAuthModal";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Residence {
  id?: number;
  name: string;
  type: string;
  desc: string;
  students: string;
  rating: string;
  price: string;
  per: string;
  tags: string[];
  featured?: boolean;
  campusType: string;
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const RESIDENCES: Residence[] = [
  {
    name: "Narra Residence",
    type: "Shared",
    desc: "Cozy shared rooms near UPLB Gate 1. WiFi & water included in rent.",
    students: "124+ students",
    rating: "4.6",
    price: "₱2,800",
    per: "/sem",
    tags: ["WiFi", "Water Inc.", "Near Gate 1"],
    campusType: "Off-Campus",
  },
  {
    name: "Kamia Residence",
    type: "Studio",
    desc: "On-campus studio rooms with modern furnishings. 22 m², air-con, WiFi, and laundry access included.",
    students: "240+ students",
    rating: "4.9",
    price: "₱5,200",
    per: "/month",
    tags: ["WiFi", "Furnished", "Air-con"],
    featured: true,
    campusType: "On-Campus",
  },
  {
    name: "Molave Residence",
    type: "En-Suite",
    desc: "Private en-suite rooms with modern amenities. Air-con and study desk included.",
    students: "98+ students",
    rating: "4.7",
    price: "₱3,800",
    per: "/month",
    tags: ["Air-con", "Study Desk", "Private Bath"],
    campusType: "Off-Campus",
  },
  {
    name: "Ilang Residence",
    type: "Dormitory",
    desc: "Affordable dormitory-style rooms close to the main library. Meals optional.",
    students: "310+ students",
    rating: "4.4",
    price: "₱1,900",
    per: "/sem",
    tags: ["Meals Opt.", "Library Nearby", "Budget"],
    campusType: "UPLB Partner",
  },
  {
    name: "Acacia Residence",
    type: "Apartment",
    desc: "Spacious apartment units ideal for graduate students. Parking and gym access available.",
    students: "55+ students",
    rating: "4.8",
    price: "₱7,500",
    per: "/month",
    tags: ["Parking", "Gym", "Spacious"],
    campusType: "Off-Campus",
  },
];

// ─── Helper Functions ─────────────────────────────────────────────────────────
const getCampusTypeColor = (type: string) => {
  switch (type) {
    case "On-Campus":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "Off-Campus":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "UPLB Partner":
      return "bg-purple-50 text-purple-700 border-purple-200";
    default:
      return "bg-gray-50 text-gray-700 border-gray-200";
  }
};

const getCampusTypeIcon = (type: string) => {
  switch (type) {
    case "On-Campus":
      return (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      );
    case "Off-Campus":
      return (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H5.78a1.65 1.65 0 0 0-1.51 1 1.65 1.65 0 0 0 .33 1.82l.07.07A10 10 0 0 0 12 17.66a10 10 0 0 0 6.18-2.21l.07-.07z" />
        </svg>
      );
    case "UPLB Partner":
      return (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      );
    default:
      return null;
  }
};

// ─── Residence Card Component ────────────────────────────────────────────────
const CARD_HEIGHT_PX = 460;

function ResidenceCard({
  residence,
  isActive,
  onClick,
  onLearnMore,
}: {
  residence: Residence;
  isActive: boolean;
  onClick: () => void;
  onLearnMore: (residence: Residence) => void;
}) {
  const campusColor = getCampusTypeColor(residence.campusType);
  const campusIcon = getCampusTypeIcon(residence.campusType);

  return (
    <div
      onClick={onClick}
      className="flex-shrink-0 w-[280px] sm:w-[320px] md:w-[360px] rounded-3xl p-4 sm:p-5 md:p-6 cursor-pointer relative overflow-hidden bg-white border border-gray-100/50 transition-all duration-500 transform dynamic-hover hover:scale-[1.02]"
      style={{
        height: CARD_HEIGHT_PX,
        boxShadow: isActive
          ? "0 35px 70px -15px rgba(139,26,46,0.35), 0 0 30px rgba(196,151,58,0.1)"
          : "0 10px 40px -10px rgba(0,0,0,0.05)",
      }}
    >
      {/* Red gradient overlay */}
      <motion.div
        className="absolute inset-0 rounded-3xl pointer-events-none bg-gradient-to-br from-[#8B1A2E] via-[#751424] to-[#4A0B17]"
        animate={{ opacity: isActive ? 1 : 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      />

      {/* Shimmer effect on active */}
      <motion.div
        className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_30%_20%,rgba(255,255,255,0.15)_0%,transparent_75%)]"
        animate={{ opacity: isActive ? 1 : 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      />

      {/* Gold rim highlight */}
      <div 
        className={`absolute inset-0 rounded-3xl border-2 pointer-events-none transition-opacity duration-500
          ${isActive ? "border-[#C4973A]/30 opacity-100" : "border-transparent opacity-0"}`} 
      />

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-between">
        <div>
          {/* Top Row: Campus Badge & Featured Pill */}
          <div className="flex items-center justify-between mb-4">
            <div
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold border
                transition-all duration-300 ease-out
                ${isActive 
                  ? "bg-white/15 text-white border-white/20" 
                  : campusColor
                }`}
            >
              {campusIcon}
              <span>{residence.campusType}</span>
            </div>

            <div
              className={`text-[0.6rem] font-bold tracking-widest uppercase bg-gradient-to-r from-[#C4973A] to-[#E5B85C] text-white py-1 px-3 rounded-full shadow-sm transition-all duration-500 ease-out
                ${isActive && residence.featured ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4"}`}
            >
              Featured
            </div>
          </div>

          {/* Type badge */}
          <span
            className={`inline-block text-[0.62rem] font-bold tracking-wider uppercase py-0.5 px-2.5 rounded-md mb-3 transition-all duration-300 ease-out
              ${isActive ? "bg-white/20 text-white" : "bg-[#F0E8E0] text-[#8B1A2E]"}`}
          >
            {residence.type}
          </span>

          {/* Title */}
          <h3
            className={`font-serif font-semibold text-lg sm:text-xl md:text-[1.55rem] leading-tight mb-2 transition-all duration-300 ease-out
              ${isActive ? "text-white tracking-wide" : "text-[#1a1a1a]"}`}
          >
            {residence.name}
          </h3>

          {/* Description */}
          <p
            className={`text-[0.75rem] sm:text-[0.8rem] leading-relaxed mb-4 transition-all duration-300 ease-out
              ${isActive ? "text-white/80" : "text-[#6B6059]"}`}
            style={{
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {residence.desc}
          </p>
        </div>

        <div>
          {/* Divider */}
          <div className={`h-px mb-4 transition-all duration-300 ease-out ${isActive ? "bg-white/20" : "bg-[#EEE8E2]"}`} />

          {/* Meta info */}
          <div
            className={`flex items-center justify-between text-[0.7rem] sm:text-[0.73rem] font-medium mb-3 transition-all duration-300 ease-out
              ${isActive ? "text-white/80" : "text-[#8a7a72]"}`}
          >
            <span className="flex items-center gap-1">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <span className="truncate">{residence.students}</span>
            </span>
            <span className="flex items-center gap-1 text-[#C4973A] font-bold">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
              <span className={isActive ? "text-white" : "text-[#1a1a1a]"}>{residence.rating}</span>
            </span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-1 mb-4">
            <span
              className={`font-serif text-xl sm:text-2xl md:text-[1.8rem] font-bold tracking-tight transition-all duration-300 ease-out
                ${isActive ? "text-white" : "text-[#8B1A2E]"}`}
            >
              {residence.price}
            </span>
            <span className={`text-[0.65rem] sm:text-[0.7rem] font-medium transition-all duration-300 ease-out ${isActive ? "text-white/60" : "text-[#9A8880]"}`}>
              {residence.per}
            </span>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mb-5">
            {residence.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className={`text-[0.55rem] sm:text-[0.62rem] font-semibold py-0.5 px-2 rounded-md transition-all duration-300 ease-out backdrop-blur-sm
                  ${isActive ? "bg-white/10 text-white border border-white/10" : "bg-[#F3EDE7] text-[#7a6055]"}`}
              >
                {tag}
              </span>
            ))}
          </div>

          {/* CTA Button */}
          <div className="flex items-center justify-between mt-auto">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onLearnMore(residence);
              }}
              className={`inline-flex items-center gap-2 text-[0.75rem] sm:text-[0.8rem] font-bold py-2 px-3 sm:px-5 rounded-xl transition-all duration-300 active:scale-95
                ${isActive
                  ? "bg-white text-[#8B1A2E] shadow-lg hover:bg-neutral-50 hover:shadow-xl"
                  : "bg-[#8B1A2E] text-white hover:bg-[#751424] shadow-md"
                }`}
            >
              Learn More {isActive && "→"}
            </button>

            {/* Verified badge */}
            <motion.div
              className="flex items-center gap-1 text-[0.65rem] sm:text-[0.7rem] text-white/75 font-medium"
              animate={{ opacity: isActive ? 1 : 0, x: isActive ? 0 : -10 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              style={{ pointerEvents: isActive ? "auto" : "none" }}
            >
              <span className="inline-block bg-emerald-500 text-white rounded-full p-0.5">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </span>
              Verified
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Navigation Button ───────────────────────────────────────────────────────
function NavBtn({
  onClick,
  variant,
  label,
  icon,
}: {
  onClick: () => void;
  variant: "prev" | "next";
  label: string;
  icon: React.ReactNode;
}) {
  const isPrev = variant === "prev";

  return (
    <button
      onClick={onClick}
      aria-label={label}
      className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex-shrink-0 flex items-center justify-center transition-all duration-300 hover:-translate-y-1 active:scale-95 backdrop-blur-sm
        ${isPrev
          ? "bg-white text-[#1a1a1a] shadow-[0_10px_25px_rgba(0,0,0,0.05)] border border-neutral-200/60"
          : "bg-[#8B1A2E] text-white shadow-[0_10px_25px_rgba(139,26,46,0.25)] hover:bg-[#751424]"
        }`}
    >
      {icon}
    </button>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────
export default function ResidenceCarousel() {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isVisible, setIsVisible] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [pendingResidenceId, setPendingResidenceId] = useState<number | null>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const autoRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [residences, setResidences] = useState<Residence[]>([]);
  const navigate = useNavigate();
  const displayResidences = residences.length > 0 ? residences : RESIDENCES;

  const total = displayResidences.length;

  // Get dynamic card width based on screen size
  const getCardWidth = () => {
    if (windowWidth < 640) return 280; // mobile
    if (windowWidth < 768) return 320; // tablet
    return 360; // desktop
  };

  const cardWidth = getCardWidth();
  const halfCardWidth = cardWidth / 2;

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -30px 0px" }
    );
    
    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }
    
    return () => observer.disconnect();
  }, []);

  const goTo = useCallback(
    (idx: number, dir: number = 1) => {
      setDirection(dir);
      setCurrent(((idx % total) + total) % total);
    },
    [total]
  );

  const goNext = useCallback(() => goTo(current + 1, 1), [goTo, current]);
  const goPrev = useCallback(() => goTo(current - 1, -1), [goTo, current]);
  const goIdx = useCallback(
    (idx: number) => goTo(idx, idx > current ? 1 : -1),
    [goTo, current]
  );

  const resetAuto = useCallback(() => {
    if (autoRef.current) clearInterval(autoRef.current);
    autoRef.current = setInterval(() => {
      setDirection(1);
      setCurrent((c) => (c + 1) % total);
    }, 6000);
  }, [total]);

  useEffect(() => {
    resetAuto();
    return () => { if (autoRef.current) clearInterval(autoRef.current); };
  }, [resetAuto]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") { goPrev(); resetAuto(); }
      if (e.key === "ArrowRight") { goNext(); resetAuto(); }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [goNext, goPrev, resetAuto]);

  useEffect(() => {
    const fetchTopRated = async () => {
      try {
        const res = await api.get("/accommodations/top-rated");

        const formatted = res.data.map((item: any) => ({
          name: item.name,
          type: item.meta?.split("-").map((word: string) =>
            word.charAt(0).toUpperCase() + word.slice(1)
          ).join("-") ?? "",
          desc: item.subtitle ?? "",
          students: "Verified Listing",
          rating: item.rating === 0 ? "Unrated" : String(item.rating),
          price: `₱${Number(item.price).toLocaleString()}`,
          per: "/month",
          tags: item.chips ?? [],
          featured: true,
          campusType: item.campusType ?? "Off-Campus",
          id: item.id,
        }));

        setResidences(formatted);
      } catch (error) {
        console.error("Failed to fetch residences:", error);
      }
    };

    fetchTopRated();
  }, []);

  const handleLearnMore = async (residence: Residence) => {
    const residenceId = residence.id;
    if (!residenceId) return;

    sessionStorage.setItem("redirectAfterAuth", `/student/roomview/${residenceId}`);
    setPendingResidenceId(residenceId);
    setAuthModalOpen(true);
  };
  
  const visualOffset = (i: number) => {
    let d = i - current;
    if (d > total / 2) d -= total;
    if (d < -total / 2) d += total;
    return d;
  };

  const handleDragEnd = (
    _: MouseEvent | TouchEvent | PointerEvent,
    info: { offset: { x: number }; velocity: { x: number } }
  ) => {
    const SWIPE_THRESHOLD = 60;
    const VELOCITY_THRESHOLD = 300;
    if (info.offset.x < -SWIPE_THRESHOLD || info.velocity.x < -VELOCITY_THRESHOLD) {
      goNext();
      resetAuto();
    } else if (info.offset.x > SWIPE_THRESHOLD || info.velocity.x > VELOCITY_THRESHOLD) {
      goPrev();
      resetAuto();
    }
  };

  // Dynamic slot spacing based on screen size
  const getSlotPx = () => {
    if (windowWidth < 640) return 200; // mobile - tighter overlap
    if (windowWidth < 768) return 260; // tablet
    return 290; // desktop
  };

  const getSideScale = () => {
    if (windowWidth < 640) return 0.7;
    if (windowWidth < 768) return 0.82;
    return 0.88;
  };

  const getSideOpacity = () => {
    if (windowWidth < 640) return 0.3;
    if (windowWidth < 768) return 0.38;
    return 0.45;
  };

  return (
    <section 
      id="recommended" 
      ref={sectionRef}
      className="min-h-screen flex items-center justify-center py-16 sm:py-24 px-4 sm:px-8 bg-white relative overflow-hidden"
    >
      <div className="w-full max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-20">
          <div 
            className="flex items-center justify-center gap-4 mb-5 transition-all duration-1000 ease-out"
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? "translateY(0)" : "translateY(25px)",
            }}
          >
            <span className="flex-1 max-w-[40px] h-[2px] bg-gradient-to-r from-transparent to-[#C4973A]" />
            <p className="text-[0.75rem] font-bold tracking-[0.35em] text-[#C4973A] uppercase">
              Premium Selection
            </p>
            <span className="flex-1 max-w-[40px] h-[2px] bg-gradient-to-l from-transparent to-[#C4973A]" />
          </div>

          <h2 
            className="font-serif text-3xl sm:text-5xl md:text-6xl font-semibold text-[#1a1a1a] tracking-tight leading-[1.15] transition-all duration-1000 ease-out"
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? "translateY(0)" : "translateY(25px)",
              transitionDelay: "150ms"
            }}
          >
            Experience Only the <em className="text-[#8B1A2E] not-italic font-normal bg-gradient-to-r from-[#8B1A2E] to-[#A32338] bg-clip-text text-transparent">Best</em>
          </h2>

          <p 
            className="text-sm sm:text-base text-[#8a7a72] max-w-md mx-auto mt-4 sm:mt-5 leading-relaxed font-medium transition-all duration-1000 ease-out"
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? "translateY(0)" : "translateY(25px)",
              transitionDelay: "300ms"
            }}
          >
            Handpicked premium residences curated perfectly for your academic journey comfort.
          </p>
        </div>

        {/* Carousel */}
        <div 
          className="transition-all duration-1000 ease-out"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? "translateY(0)" : "translateY(35px)",
            transitionDelay: "450ms"
          }}
        >
          <div className="flex items-center justify-center gap-2 sm:gap-6 md:gap-8">
            {/* Prev button - desktop only */}
            <div className="hidden sm:block">
              <NavBtn
                variant="prev"
                label="Previous Slide"
                onClick={() => { goPrev(); resetAuto(); }}
                icon={<MdChevronLeft size={34} />}
              />
            </div>

            {/* Cards */}
            <div
              className="flex-1 flex justify-center select-none overflow-visible"
              style={{ touchAction: "pan-y" }}
            >
              <motion.div
                className="relative overflow-visible"
                style={{
                  width: "min(1100px, 100%)",
                  height: CARD_HEIGHT_PX + 50,
                }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.15}
                onDragEnd={handleDragEnd}
              >
                {displayResidences.map((res, i) => {
                  const offset = visualOffset(i);
                  const isCenter = offset === 0;
                  const isCardVisible = Math.abs(offset) <= 1;
                  const showOnMobile = Math.abs(offset) <= 1;
                  const slotPx = getSlotPx();
                  const sideScale = getSideScale();
                  const sideOpacity = getSideOpacity();

                  return (
                    <motion.div
                      key={res.id ?? `card-${i}`}
                      className={`absolute top-0 left-1/2 ${
                        isCardVisible ? "" : "pointer-events-none"
                      }`}
                      style={{
                        marginLeft: -halfCardWidth,
                        overflow: "visible",
                      }}
                      animate={{
                        x: offset * slotPx,
                        scale: isCenter ? 1 : sideScale,
                        rotate: isCenter ? 0 : offset * 2,
                        y: isCenter ? 0 : (windowWidth < 640 ? 8 : 16),
                        opacity: isCardVisible ? (isCenter ? 1 : sideOpacity) : 0,
                        zIndex: isCenter ? 30 : (windowWidth < 640 ? 15 : 10 - Math.abs(offset)),
                      }}
                      transition={{ duration: 0.6, ease: [0.25, 1, 0.5, 1] }}
                      onClick={() => {
                        if (isCenter) return;
                        goTo(i, offset > 0 ? 1 : -1);
                        resetAuto();
                      }}
                    >
                      <div className={showOnMobile ? "block" : "hidden sm:block"}>
                        <ResidenceCard
                          residence={res}
                          isActive={isCenter}
                          onClick={() => {}}
                          onLearnMore={handleLearnMore}
                        />
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            </div>

            {/* Next button - desktop only */}
            <div className="hidden sm:block">
              <NavBtn
                variant="next"
                label="Next Slide"
                onClick={() => { goNext(); resetAuto(); }}
                icon={<MdChevronRight size={34} />}
              />
            </div>
          </div>

          {/* Indicators */}
          <div className="flex justify-center items-center gap-2.5 mt-8 sm:mt-12">
            {displayResidences.map((_, i) => (
              <button
                key={i}
                onClick={() => { goIdx(i); resetAuto(); }}
                aria-label={`Jump to slide ${i + 1}`}
                className={`transition-all duration-500 ease-out cursor-pointer border-0 p-0 rounded-full h-1.5
                  ${i === current ? "bg-[#8B1A2E] w-8 shadow-sm" : "bg-[#D4C9C1] hover:bg-[#b0a297] w-2"}`}
                style={{ 
                  minHeight: "unset", 
                  display: "block",
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Mini Auth Modal */}
      <MiniAuthModal
        open={authModalOpen}
        onClose={() => {
          setAuthModalOpen(false);
          setPendingResidenceId(null);
        }}
      />
    </section>
  );
}