"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { MdChevronLeft, MdChevronRight } from "react-icons/md";
import { api } from "../../api/axios";
import { useNavigate } from "react-router-dom";
import MiniAuthModal from "../../components/MiniAuthModal";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Residence {
  id?: number;
  icon: string;
  name: string;
  type: string;
  desc: string;
  students: string;
  rating: string;
  price: string;
  per: string;
  tags: string[];
  featured?: boolean;
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const RESIDENCES: Residence[] = [
  {
    icon: "🏠",
    name: "Narra Residence",
    type: "Shared",
    desc: "Cozy shared rooms near UPLB Gate 1. WiFi & water included in rent.",
    students: "124+ students",
    rating: "4.6",
    price: "₱2,800",
    per: "/sem",
    tags: ["WiFi", "Water Inc.", "Near Gate 1"],
  },
  {
    icon: "🏛️",
    name: "Kamia Residence",
    type: "Studio",
    desc: "On-campus studio rooms with modern furnishings. 22 m², air-con, WiFi, and laundry access included.",
    students: "240+ students",
    rating: "4.9",
    price: "₱5,200",
    per: "/month",
    tags: ["WiFi", "Furnished", "Air-con"],
    featured: true,
  },
  {
    icon: "🌿",
    name: "Molave Residence",
    type: "En-Suite",
    desc: "Private en-suite rooms with modern amenities. Air-con and study desk included.",
    students: "98+ students",
    rating: "4.7",
    price: "₱3,800",
    per: "/month",
    tags: ["Air-con", "Study Desk", "Private Bath"],
  },
  {
    icon: "🌸",
    name: "Ilang Residence",
    type: "Dormitory",
    desc: "Affordable dormitory-style rooms close to the main library. Meals optional.",
    students: "310+ students",
    rating: "4.4",
    price: "₱1,900",
    per: "/sem",
    tags: ["Meals Opt.", "Library Nearby", "Budget"],
  },
  {
    icon: "🏡",
    name: "Acacia Residence",
    type: "Apartment",
    desc: "Spacious apartment units ideal for graduate students. Parking and gym access available.",
    students: "55+ students",
    rating: "4.8",
    price: "₱7,500",
    per: "/month",
    tags: ["Parking", "Gym", "Spacious"],
  },
];

// ─── Residence Card Component ────────────────────────────────────────────────
function ResidenceCard({
  residence,
  isActive,
  onClick,
  position,
  onLearnMore,
}: {
  residence: Residence;
  isActive: boolean;
  onClick: () => void;
  position: "left" | "center" | "right";
  onLearnMore: (residence: Residence) => void;
}) {
  // Determine classes based on position and active state
  const getPositionClasses = () => {
    if (position === "center") {
      return "scale-100 translate-y-0";
    }
    return "scale-[0.92] translate-y-6";
  };

  return (
    <div
      onClick={onClick}
      className={`
        flex-shrink-0 w-[320px] sm:w-[360px] rounded-3xl p-5 sm:p-6
        transition-all duration-500 ease-out cursor-pointer relative overflow-hidden
        ${getPositionClasses()}
        ${isActive
          ? "bg-gradient-to-br from-[#8B1A2E] to-[#5E1020] shadow-[0_30px_60px_rgba(139,26,46,0.3)] opacity-100 z-20"
          : "bg-white shadow-[0_8px_30px_rgba(0,0,0,0.08)] opacity-85 hover:opacity-100 z-5"
        }
      `}
    >
      {/* Shimmer effect on active */}
      {isActive && (
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_20%_15%,rgba(255,255,255,0.12)_0%,transparent_70%)]" />
      )}

      {/* Featured pill */}
      <div
        className={`
          absolute top-4 left-4 text-[0.58rem] font-bold tracking-wide uppercase
          bg-[#C4973A] text-white py-0.5 px-2 rounded-full
          transition-all duration-300 ease-out
          ${isActive && residence.featured ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"}
        `}
      >
        Featured
      </div>

      {/* Icon */}
      <div
        className={`
          w-12 h-12 sm:w-14 sm:h-14 rounded-full flex-shrink-0 flex items-center justify-center text-xl sm:text-2xl
          transition-all duration-300 ease-out
          ${isActive ? "bg-white/15" : "bg-[#F5F0EB]"}
        `}
      >
        {residence.icon}
      </div>

      {/* Type badge */}
      <span
        className={`
          inline-block text-[0.62rem] font-semibold tracking-wide uppercase
          py-0.5 px-2 rounded-full mb-2.5 transition-all duration-300 ease-out
          ${isActive ? "bg-white/20 text-white" : "bg-[#F0E8E0] text-[#8B1A2E]"}
        `}
      >
        {residence.type}
      </span>

      {/* Title */}
      <h3
        className={`
          font-serif font-semibold text-xl sm:text-[1.55rem] leading-tight mb-1.5 transition-all duration-300 ease-out
          ${isActive ? "text-white" : "text-[#1a1a1a]"}
        `}
      >
        {residence.name}
      </h3>

      {/* Description */}
      <p
        className={`
          text-[0.8rem] leading-relaxed mb-3 transition-all duration-300 ease-out
          ${isActive ? "text-white/75" : "text-[#6B6059]"}
        `}
      >
        {residence.desc}
      </p>

      {/* Divider */}
      <div
        className={`h-px my-3 transition-all duration-300 ease-out
          ${isActive ? "bg-white/15" : "bg-[#EEE8E2]"}
        `}
      />

      {/* Meta info */}
      <div
        className={`
          flex items-center justify-between text-[0.73rem] mb-2.5 transition-all duration-300 ease-out
          ${isActive ? "text-white/70" : "text-[#8a7a72]"}
        `}
      >
        <span>👥 {residence.students}</span>
        <span>★ {residence.rating}</span>
      </div>

      {/* Price */}
      <div className="flex items-baseline gap-1 mb-3">
        <span
          className={`
            font-serif text-2xl sm:text-[1.8rem] font-bold transition-all duration-300 ease-out
            ${isActive ? "text-white" : "text-[#8B1A2E]"}
          `}
        >
          {residence.price}
        </span>
        <span
          className={`text-[0.7rem] transition-all duration-300 ease-out
            ${isActive ? "text-white/55" : "text-[#9A8880]"}
          `}
        >
          {residence.per}
        </span>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {residence.tags.map((tag) => (
          <span
            key={tag}
            className={`
              text-[0.62rem] font-medium py-0.5 px-1.5 rounded-full transition-all duration-300 ease-out
              ${isActive ? "bg-white/15 text-white" : "bg-[#F3EDE7] text-[#7a6055]"}
            `}
          >
            {tag}
          </span>
        ))}
      </div>

      {/* CTA Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onLearnMore(residence);
        }}
        className={`
          inline-flex items-center gap-2 text-[0.8rem] font-semibold py-2 px-4 rounded-full
          transition-all duration-200 ease-out hover:-translate-y-0.5
          ${isActive
            ? "bg-white text-[#8B1A2E] shadow-md hover:shadow-lg"
            : "bg-[#F0E8E0] text-[#8B1A2E]"
          }
        `}
      >
        Learn More {isActive && "→"}
      </button>

      {/* Verified badge - only on active */}
      {isActive && (
        <div className="flex items-center gap-1.5 text-[0.7rem] text-white/65 mt-2.5 opacity-100 translate-y-0 transition-all duration-300 ease-out delay-100">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          Verified · ★ {residence.rating}
        </div>
      )}
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
      className={`
        w-12 h-12 sm:w-14 sm:h-14 rounded-full flex-shrink-0 flex items-center justify-center
        transition-all duration-200 ease-out hover:scale-110 active:scale-95
        ${isPrev
          ? "bg-white text-[#1a1a1a] shadow-[0_4px_16px_rgba(0,0,0,0.08)] border border-gray-100"
          : "bg-[#8B1A2E] text-white shadow-[0_4px_16px_rgba(139,26,46,0.3)]"
        }
      `}
    >
      {icon}
    </button>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────
export default function ResidenceCarousel() {
  const [current, setCurrent] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [pendingResidenceId, setPendingResidenceId] = useState<number | null>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const autoRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const touchX = useRef(0);

  const [residences, setResidences] = useState<Residence[]>([]);
  const navigate = useNavigate();
  const displayResidences = residences.length > 0 ? residences : RESIDENCES;

  const total = displayResidences.length;

  // Scroll trigger for the entire section
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.2, rootMargin: "0px 0px -50px 0px" }
    );
    
    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }
    
    return () => observer.disconnect();
  }, []);

  const goTo = useCallback(
    (idx: number) => setCurrent(((idx % total) + total) % total),
    [total]
  );

  const resetAuto = useCallback(() => {
    if (autoRef.current) clearInterval(autoRef.current);
    autoRef.current = setInterval(
      () => setCurrent((c) => (c + 1) % total),
      5000
    );
  }, [total]);

  useEffect(() => {
    resetAuto();
    return () => { if (autoRef.current) clearInterval(autoRef.current); };
  }, [resetAuto]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") { goTo(current - 1); resetAuto(); }
      if (e.key === "ArrowRight") { goTo(current + 1); resetAuto(); }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [current, goTo, resetAuto]);

  useEffect(() => {
    const fetchTopRated = async () => {
      try {
        const res = await api.get("/accommodations/top-rated");

        const formatted = res.data.map((item: any) => ({
          icon: "🏠",
          name: item.name,
          type:
            item.meta
              ?.split("-")
              .map((word: string) =>
                word.charAt(0).toUpperCase() + word.slice(1)
              )
              .join("-") ?? "",
          desc: item.subtitle ?? "",
          students: "Verified Listing",
          rating:
            item.rating === 0
              ? "Unrated"
              : String(item.rating),
          price: `₱${Number(item.price).toLocaleString()}`,
          per: "/month",
          tags: item.chips ?? [],
          featured: true,
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

    // Store the intended destination
    sessionStorage.setItem("redirectAfterAuth", `/student/roomview/${residenceId}`);
    setPendingResidenceId(residenceId);
    // Show the auth modal
    setAuthModalOpen(true);
  };
  
  const prevIdx = (current - 1 + total) % total;
  const nextIdx = (current + 1) % total;

  return (
    <>
      <section 
        id="recommended" 
        ref={sectionRef}
        className="min-h-screen flex items-center justify-center py-16 sm:py-20 px-4 sm:px-8 bg-white"
      >
        <div className="w-full max-w-6xl mx-auto">
          {/* Header with scroll animation */}
          <div className="text-center mb-12 sm:mb-16">
            <div 
              className="flex items-center justify-center gap-4 mb-4 transition-all duration-700 ease-out"
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? "translateY(0)" : "translateY(30px)",
                transitionDelay: "0ms"
              }}
            >
              <span className="flex-1 max-w-[60px] h-[1.5px] bg-[#C4973A]" />
              <p className="text-[0.7rem] sm:text-xs font-semibold tracking-[0.3em] text-[#C4973A] uppercase">
                Recommended
              </p>
              <span className="flex-1 max-w-[60px] h-[1.5px] bg-[#C4973A]" />
            </div>

            <h2 
              className="font-serif text-3xl sm:text-5xl md:text-6xl font-semibold text-[#1a1a1a] leading-tight transition-all duration-700 ease-out"
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? "translateY(0)" : "translateY(30px)",
                transitionDelay: "100ms"
              }}
            >
              Experience Only the{" "}
              <em className="text-[#8B1A2E] italic">Best</em>
            </h2>

            <p 
              className="text-sm sm:text-base text-[#8a7a72] max-width-md mx-auto mt-4 leading-relaxed transition-all duration-700 ease-out"
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? "translateY(0)" : "translateY(30px)",
                transitionDelay: "200ms"
              }}
            >
              Handpicked residences for every student's comfort and budget.
            </p>
          </div>

          {/* Carousel with scroll animation */}
          <div 
            className="transition-all duration-700 ease-out"
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? "translateY(0)" : "translateY(30px)",
              transitionDelay: "300ms"
            }}
          >
            <div className="flex items-center justify-center gap-2 sm:gap-4 md:gap-6">
              {/* Previous button - desktop */}
              <div className="hidden sm:block">
                <NavBtn 
                  variant="prev" 
                  label="Previous" 
                  onClick={() => { goTo(current - 1); resetAuto(); }}
                  icon={<MdChevronLeft size={32} />}
                />
              </div>

              {/* Cards */}
              <div className="flex-1 overflow-visible flex justify-center">
                {/* Mobile: Single card */}
                <div className="block sm:hidden">
                  <ResidenceCard
                    residence={displayResidences[current]}
                    isActive={true}
                    onClick={() => {}}
                    position="center"
                    onLearnMore={handleLearnMore}
                  />
                </div>

                {/* Desktop: Three cards */}
                <div className="hidden sm:flex items-center justify-center gap-4 md:gap-2">
                  <ResidenceCard
                    residence={displayResidences[prevIdx]}
                    isActive={false}
                    onClick={() => { goTo(prevIdx); resetAuto(); }}
                    position="left"
                    onLearnMore={handleLearnMore}
                  />
                  <ResidenceCard
                    residence={displayResidences[current]}
                    isActive={true}
                    onClick={() => {}}
                    position="center"
                    onLearnMore={handleLearnMore}
                  />
                  <ResidenceCard
                    residence={displayResidences[nextIdx]}
                    isActive={false}
                    onClick={() => { goTo(nextIdx); resetAuto(); }}
                    position="right"
                    onLearnMore={handleLearnMore}
                  />
                </div>
              </div>

              {/* Next button - desktop */}
              <div className="hidden sm:block">
                <NavBtn 
                  variant="next" 
                  label="Next" 
                  onClick={() => { goTo(current + 1); resetAuto(); }}
                  icon={<MdChevronRight size={32} />}
                />
              </div>
            </div>

            {/* Mobile navigation buttons */}
            <div className="flex items-center justify-center gap-6 mt-6 sm:hidden">
              <button
                onClick={() => { goTo(current - 1); resetAuto(); }}
                className="w-14 h-14 rounded-full bg-white shadow-md flex items-center justify-center text-[#1a1a1a] active:scale-95 transition-all duration-200 ease-out border border-gray-100"
              >
                <MdChevronLeft size={32} />
              </button>
              <button
                onClick={() => { goTo(current + 1); resetAuto(); }}
                className="w-14 h-14 rounded-full bg-[#8B1A2E] shadow-md flex items-center justify-center text-white active:scale-95 transition-all duration-200 ease-out"
              >
                <MdChevronRight size={32} />
              </button>
            </div>

            {/* Line indicator */}
            <div className="flex justify-center items-center gap-2 mt-8 sm:mt-10">
              {displayResidences.map((_, i) => (
                <button
                  key={i}
                  onClick={() => { goTo(i); resetAuto(); }}
                  aria-label={`Go to slide ${i + 1}`}
                  className={`transition-all duration-300 ease-out cursor-pointer border-0 p-0 ${
                    i === current ? "bg-[#8B1A2E]" : "bg-[#D4C9C1]"
                  }`}
                  style={{ 
                    height: "3px", 
                    width: i === current ? "32px" : "16px", 
                    minHeight: "unset", 
                    display: "block",
                    borderRadius: "9999px"
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Mini Auth Modal */}
      <MiniAuthModal
        open={authModalOpen}
        onClose={() => {
          setAuthModalOpen(false);
          setPendingResidenceId(null);
        }}
      />
    </>
  );
}