// src/pages/Landingpage.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import SeeMoreModal from "../../components/SeeMoreModal";
import uplbLogo from "../../assets/logos/uplb.png";
import casLogo from "../../assets/logos/cas.png";
import icsLogo from "../../assets/logos/ics.png";
import PriceRangeSlider from "../../components/PriceRangeSlider"
import { useNavigate } from "react-router-dom";
import { api } from "../../api/axios"
import { useQuery } from "@tanstack/react-query"

// ─── Constants ────────────────────────────────────────────────────────────────
const NAV_LINKS = ["HOME", "ABOUT", "FEATURES", "RECOMMENDED", "SUPPORT"] as const;
const QUICK_TAGS = ["WiFi", "Furnished", "Air-con", "Transient", "Near Library", "Laundry"];
const MIN_PRICE = 2500;
const MAX_PRICE = 10000;
const STEP = 500;

// ─── Particle Canvas ──────────────────────────────────────────────────────────
function Particles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);
    type Dot = { x: number; y: number; r: number; dx: number; dy: number; alpha: number; isGold: boolean };
    const dots: Dot[] = Array.from({ length: 50 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * (canvas.height * 0.65),
      r: Math.random() * 1.5 + 0.3,
      dx: (Math.random() - 0.5) * 0.2,
      dy: (Math.random() - 0.5) * 0.2,
      alpha: Math.random() * 0.3 + 0.07,
      isGold: Math.random() > 0.75,
    }));
    let raf: number;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      dots.forEach(d => {
        d.x += d.dx; d.y += d.dy;
        if (d.x < 0 || d.x > canvas.width) d.dx *= -1;
        if (d.y < 0 || d.y > canvas.height * 0.65) d.dy *= -1;
        ctx.beginPath(); ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fillStyle = d.isGold ? `rgba(201,151,58,${d.alpha})` : `rgba(255,255,255,${d.alpha})`;
        ctx.fill();
      });
      for (let i = 0; i < dots.length; i++) {
        for (let j = i + 1; j < dots.length; j++) {
          const dist = Math.hypot(dots[i].x - dots[j].x, dots[i].y - dots[j].y);
          if (dist < 100) {
            ctx.beginPath(); ctx.moveTo(dots[i].x, dots[i].y); ctx.lineTo(dots[j].x, dots[j].y);
            ctx.strokeStyle = `rgba(255,255,255,${0.06 * (1 - dist / 100)})`;
            ctx.lineWidth = 0.5; ctx.stroke();
          }
        }
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);
  return (
    <canvas
      ref={canvasRef}
      style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 1 }}
    />
  );
}

// ─── Hamburger ────────────────────────────────────────────────────────────────
function HamburgerIcon({ open }: { open: boolean }) {
  return (
    <div style={{ width: 22, height: 16, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
      {[
        { transform: open ? "translateY(7px) rotate(45deg)" : "none", width: "100%", opacity: 1 },
        { transform: "none", opacity: open ? 0 : 1, width: open ? "100%" : "65%" },
        { transform: open ? "translateY(-7px) rotate(-45deg)" : "none", width: "100%", opacity: 1 },
      ].map((b, i) => (
        <span key={i} style={{ display: "block", height: 2, borderRadius: 2, background: "#fff", transformOrigin: "center", transition: "transform 0.38s cubic-bezier(0.4,0,0.2,1), opacity 0.22s ease, width 0.28s ease", ...b }} />
      ))}
    </div>
  );
}

// ─── Mobile Drawer ────────────────────────────────────────────────────────────
function MobileDrawer({ open, onClose, activeNav, setActiveNav, scrollTo }: {
  open: boolean; onClose: () => void; activeNav: string; setActiveNav: (l: string) => void;
  scrollTo: (id: string, nav: string) => void;

}) {
  const navigate = useNavigate();
  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: "fixed", top: 0, right: 0, bottom: 0, left: 0, zIndex: 200,
          background: "rgba(10,2,6,0.55)",
          backdropFilter: open ? "blur(4px)" : "blur(0px)",
          opacity: open ? 1 : 0,
          pointerEvents: open ? "all" : "none",
          transition: "opacity 0.38s cubic-bezier(0.4,0,0.2,1)",
        }}
      />
      <div
        style={{
          position: "fixed", top: 0, left: 0, bottom: 0, zIndex: 210, width: 280,
          background: "linear-gradient(160deg,#3D0718 0%,#6B0F2B 100%)",
          boxShadow: open ? "8px 0 48px rgba(0,0,0,0.45)" : "none",
          transform: open ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.42s cubic-bezier(0.4,0,0.2,1)",
          display: "flex", flexDirection: "column", overflowY: "auto",
        }}
      >
        <div style={{ position: "absolute", top: 0, right: 0, bottom: 0, left: 0, pointerEvents: "none", backgroundImage: "linear-gradient(rgba(255,255,255,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.04) 1px,transparent 1px)", backgroundSize: "32px 32px" }} />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px", borderBottom: "1px solid rgba(255,255,255,0.08)", position: "relative", zIndex: 2 }}>
          <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 22, fontWeight: 700, color: "#fff" }}>UBLE</span>
          <button onClick={onClose} style={{ lineHeight: 1, paddingBottom: 4, padding: "0px", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, width: 32, height: 32, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.7)", fontSize: 18 }}>×</button>
        </div>
        <nav style={{ padding: "16px 0", position: "relative", zIndex: 2, flex: 1 }}>
          {NAV_LINKS.map((link, i) => (
            <button
              key={link}
              onClick={() => {
                onClose();
                const map: Record<"HOME" | "ABOUT" | "FEATURES" | "RECOMMENDED" | "SUPPORT", string> = {
                  HOME: "home",
                  ABOUT: "about",
                  FEATURES: "features",
                  RECOMMENDED: "recommended",
                  SUPPORT: "support",
                };
                scrollTo(map[link], link);
              }}
              style={{
                display: "flex", alignItems: "center", width: "100%", padding: "14px 24px",
                background: activeNav === link ? "rgba(255,255,255,0.10)" : "transparent",
                border: "none", borderLeft: activeNav === link ? "3px solid #C9973A" : "3px solid transparent",
                cursor: "pointer", fontFamily: "Plus Jakarta Sans',sans-serif", fontSize: 13, fontWeight: 700,
                letterSpacing: "0.09em", textTransform: "uppercase",
                color: activeNav === link ? "#fff" : "rgba(255,255,255,0.6)",
                opacity: open ? 1 : 0, transform: open ? "translateX(0)" : "translateX(-14px)",
                transition: `opacity 0.35s ease ${open ? 0.08 + i * 0.055 : 0}s, transform 0.35s cubic-bezier(0.4,0,0.2,1) ${open ? 0.08 + i * 0.055 : 0}s`,
              }}
            >{link}</button>
          ))}
        </nav>
        <div style={{ padding: "20px 24px", borderTop: "1px solid rgba(255,255,255,0.08)", position: "relative", zIndex: 2, opacity: open ? 1 : 0, transition: `opacity 0.38s ease ${open ? 0.42 : 0}s` }}>
          <button
            onClick={() => navigate("/auth/signin")}
            className="w-full py-3 rounded-xl border-none cursor-pointer text-[13px] font-bold text-white"
            style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", background: "linear-gradient(135deg,#C9973A,#a07825)" }}
          >Sign In →</button>
        </div>
      </div>
    </>
  );
}

// ─── Search Bar ───────────────────────────────────────────────────────────────
const labelStyle: React.CSSProperties = { fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#9A7080", marginBottom: 6, fontFamily: "'Plus Jakarta Sans',sans-serif" };
const selectStyle: React.CSSProperties = { fontSize: 13, fontWeight: 600, color: "#2a1018", background: "transparent", border: "none", outline: "none", width: "100%", cursor: "pointer", fontFamily: "'Plus Jakarta Sans',sans-serif" };

function SearchBar({ isMobile }: { isMobile: boolean }) {
  const navigate = useNavigate();

  const [dormType, setDormType] = useState("All Types");
  const [location, setLocation] = useState("Anywhere");
  const [minPrice, setMinPrice] = useState(500)
  const [maxPrice, setMaxPrice] = useState(7000)
  const [origMin, setOrigMin] = useState(800)
  const [origMax, setOrigMax] = useState(7000)
  const [rating, setRating] = useState(3);
  const [activeTags, setActiveTags] = useState<string[]>(["WiFi"]);
  const [extraTags, setExtraTags] = useState<string[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [sliderResetKey, setSliderResetKey] = useState(0);

  const toggleTag = (label: string) =>
    setActiveTags(prev => prev.includes(label) ? prev.filter(t => t !== label) : [...prev, label]);

  const displayedExtra = extraTags.slice(0, 3);
  const hiddenCount = extraTags.length - displayedExtra.length;
  const [searchTerm, setSearchTerm] = useState("")
  const [activeFilter, setActiveFilter] = useState("All")

  const { data: accommodations = [], isError: accommodationsError, isSuccess, isLoading: accLoading } = useQuery({
    queryKey: ["accommodations", searchTerm, activeFilter],
    queryFn: async () => {
      const params: Record<string, any> = {}
      if (searchTerm.trim()) params.search = searchTerm.trim()
      if (activeFilter !== "All") {
        if (activeFilter === "On-Campus") params.dormType = "On-Campus"
        else if (activeFilter === "Off-Campus") params.dormType = "Off-Campus"
        else if (activeFilter === "UPLB Partner") params.dormType = "UPLB Partner"
      }
      const res = await api.get("/accommodations", { params })
      return Array.isArray(res.data) ? res.data : []
    },
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    placeholderData: (prev: any) => prev,
    refetchOnMount: "always",
  })

  // Reset to first page when filters change
  useEffect(() => {
    if (!isSuccess || accommodations.length === 0) return


    let min = Infinity
    let max = -Infinity
    const tagSet = new Set<string>();

    accommodations.forEach(({ rooms }: { rooms: { roomRent: number }[] }) => {
      rooms.forEach((el: { roomRent: number }) => {
        const rent = Number(el.roomRent)

        if (rent < min) min = rent
        if (rent > max) max = rent
      })

    })


    setMinPrice(min);
    setMaxPrice(max);
    setOrigMin(min)
    setOrigMax(max)
    setSliderResetKey(prev => prev + 1)

  }, [isSuccess, accommodations])

  const handleSearch = () => {
    const params = new URLSearchParams()

    // Dorm type → MapPage `type` param (matches AccommodationPin.accommodationType)
    const typeMap: Record<string, string> = {
      'On-campus': 'on-campus',
      'Off-campus': 'off-campus',
      'Partner-housing': 'partner_housing',
    }
    if (typeMap[dormType]) params.set('type', typeMap[dormType])

    // Price range → MapPage `min_rent` / `max_rent`
    if (minPrice > origMin) params.set('min_rent', String(minPrice))
    if (maxPrice < origMax) params.set('max_rent', String(maxPrice))

    // Min rating
    if (rating > 0) params.set('rating', String(rating))

    // Tags (active + extra) → comma-separated
    const allTags = [...activeTags, ...extraTags]
    if (allTags.length > 0) params.set('tags', allTags.join(','))

    const qs = params.toString()
    navigate(qs ? `/map?${qs}` : '/map')
  };
  const [range, setRange] = useState({ min: 0, max: 100 });
  const handleRangeChange = (value: { min: number; max: number }) => {
    setRange(value);
    setMinPrice(value.min)
    setMaxPrice(value.max)
  };

  return (
    <>
      <SeeMoreModal open={modalOpen} onClose={() => setModalOpen(false)} extraTags={extraTags} setExtraTags={setExtraTags} />

      <div style={{ background: "rgba(255,255,255,0.97)", backdropFilter: "blur(16px)", borderRadius: 20, overflow: "hidden", boxShadow: "0 24px 64px rgba(26,10,15,0.18), 0 4px 16px rgba(26,10,15,0.1)", border: "1px solid rgba(255,255,255,0.8)" }}>

        {/* Filter grid */}
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "1fr 1fr 1.2fr auto", borderBottom: "1px solid #f0eaea" }}>

          {/* Dorm Type */}
          <div style={{ padding: "14px 16px", borderRight: "1px solid #f0eaea", borderBottom: isMobile ? "1px solid #f0eaea" : "none" }}>
            <p style={labelStyle}>Dorm Type</p>
            <select value={dormType} onChange={e => setDormType(e.target.value)} style={selectStyle}>
              <option>All Types</option>
              <option value="On-campus">On-Campus</option>
              <option value="Off-campus">Off-Campus</option>
              <option value="Partner-housing">Partner Housing</option>
            </select>
          </div>

          {/* Location */}
          <div style={{ padding: "14px 16px", borderRight: isMobile ? "none" : "1px solid #f0eaea", borderBottom: isMobile ? "1px solid #f0eaea" : "none" }}>
            <p style={labelStyle}>Location</p>
            <select value={location} onChange={e => setLocation(e.target.value)} style={selectStyle}>
              <option>Anywhere</option>
              <option>Near Gate 1</option>
              <option>Near Gate 2</option>
              <option>Umali</option>
              <option>Pili Drive</option>
            </select>
          </div>

          {/* Price Range — dual slider - moved up */}
          <div style={{ padding: "14px 16px", borderRight: "1px solid #f0eaea", marginTop: "-4px" }}>
            <p style={{ ...labelStyle, marginBottom: 4 }}>Price Range</p>

            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              marginTop: "4px",
            }}>
              <PriceRangeSlider
                key={sliderResetKey}
                min={origMin}
                max={origMax}
                mobileScreen={true}
                onChange={handleRangeChange}
                trackColor="linear-gradient(90deg, #E8A0AA, #B5344F, #6B0F2B)"
                rangeColor="#8C1535"
                width="100%" 
              />
            </div>
          </div>

          {/* Min Rating + Search */}
          <div style={{ padding: "14px 12px", display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ flex: 1 }}>
              <p style={labelStyle}>Min Rating</p>
              <div style={{ display: "flex", gap: 1, marginTop: 4 }}>
                {[1, 2, 3, 4, 5].map(s => (
                  <button
                    key={s}
                    onClick={() => setRating(s)}
                    style={{ background: "none", border: "none", cursor: "pointer", fontSize: 16, lineHeight: 1, padding: "0 1px", color: s <= rating ? "#C9973A" : "#ddd" }}
                  >★</button>
                ))}
              </div>
            </div>
            {/* Search button — bigger icon */}
            <button
              onClick={handleSearch}
              style={{
                padding: "0px",
                display: "flex", alignItems: "center", justifyContent: "center",
                width: 50, height: 50, borderRadius: 14, border: "none", cursor: "pointer",
                background: "linear-gradient(135deg,#6B0F2B,#3D0718)",
                color: "#fff", flexShrink: 0,
                boxShadow: "0 6px 20px rgba(107,15,43,0.4)",
                transition: "transform 0.15s",
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "scale(1.08)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "scale(1)"; }}
            >
              {/* Bigger search icon — 22px */}
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                <path stroke="#ffffff" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                  d="m21 21-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0Z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Quick tags */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 14px", overflowX: "auto" }}>
          <span style={{ ...labelStyle, marginBottom: 0, marginRight: 2, whiteSpace: "nowrap" }}>Quick:</span>

          {QUICK_TAGS.map(tag => (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              style={{
                padding: "4px 12px", borderRadius: 99, fontSize: 11, fontWeight: 600, cursor: "pointer",
                fontFamily: "'Plus Jakarta Sans',sans-serif", whiteSpace: "nowrap", flexShrink: 0,
                transition: "all 0.15s",
                background: activeTags.includes(tag) ? "linear-gradient(135deg,#6B0F2B,#3D0718)" : "#f5f0f2",
                color: activeTags.includes(tag) ? "#fff" : "#5A3040",
                border: activeTags.includes(tag) ? "none" : "1px solid #e8dfe3",
              }}
            >{tag}</button>
          ))}

          {displayedExtra.map(tag => (
            <button
              key={tag}
              onClick={() => setExtraTags(prev => prev.filter(t => t !== tag))}
              title="Click to remove"
              style={{ padding: "4px 12px", borderRadius: 99, fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "'Plus Jakarta Sans',sans-serif", whiteSpace: "nowrap", flexShrink: 0, background: "linear-gradient(135deg,#B5344F,#6B0F2B)", color: "#fff", border: "none", display: "flex", alignItems: "center", gap: 4 }}
            >
              {tag} <span style={{ opacity: 0.7, fontSize: 10 }}>×</span>
            </button>
          ))}

          {hiddenCount > 0 && (
            <span style={{ fontSize: 11, color: "#9A7080", fontFamily: "'Plus Jakarta Sans',sans-serif", whiteSpace: "nowrap", flexShrink: 0 }}>+{hiddenCount} more</span>
          )}

          <button
            onClick={() => setModalOpen(true)}
            style={{
              padding: "4px 12px", borderRadius: 99, fontSize: 11, fontWeight: 600, cursor: "pointer",
              fontFamily: "'Plus Jakarta Sans',sans-serif", whiteSpace: "nowrap", flexShrink: 0,
              background: extraTags.length > 0 ? "rgba(107,15,43,0.07)" : "#f5f0f2",
              color: extraTags.length > 0 ? "#6B0F2B" : "#5A3040",
              border: extraTags.length > 0 ? "1.5px solid rgba(107,15,43,0.22)" : "1px solid #e8dfe3",
              transition: "all 0.2s",
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(107,15,43,0.12)"; (e.currentTarget as HTMLElement).style.color = "#6B0F2B"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = extraTags.length > 0 ? "rgba(107,15,43,0.07)" : "#f5f0f2"; (e.currentTarget as HTMLElement).style.color = extraTags.length > 0 ? "#6B0F2B" : "#5A3040"; }}
          >
            {extraTags.length > 0 ? `✦ Filters (${extraTags.length})` : "+ See More"}
          </button>

          <button
            onClick={() => { setActiveTags([]); setExtraTags([]); setMinPrice(MIN_PRICE); setMaxPrice(MAX_PRICE); }}
            style={{ flexShrink: 0, fontSize: 11, fontWeight: 500, color: "#9A7080", background: "none", border: "none", cursor: "pointer", fontFamily: "'Plus Jakarta Sans',sans-serif", whiteSpace: "nowrap" }}
          >Clear all</button>
        </div>
      </div>
    </>
  );
}

// ─── Landing Page ─────────────────────────────────────────────────────────────
export default function LandingPage() {
  const navigate = useNavigate();
  const isScrollingRef = useRef(false);
  const [mounted, setMounted] = useState(false);
  const [activeNav, setActiveNav] = useState("HOME");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [semesterLabel, setSemesterLabel] = useState("Now Accepting Applications · AY 2025–2026");
  const [isAboutVisible, setIsAboutVisible] = useState(false);

  const scrollTo = (id: string, nav: string) => {
    setActiveNav(nav);
    setIsAboutVisible(nav !== "HOME");
    isScrollingRef.current = true;
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setTimeout(() => { isScrollingRef.current = false; }, 800);
  };

  useEffect(() => { const t = setTimeout(() => setMounted(true), 60); return () => clearTimeout(t); }, []);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => { if (isMobile === false) setDrawerOpen(false); }, [isMobile]);
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [drawerOpen]);

  useEffect(() => {
    const fetchSystemSettings = async () => {
      try {
        const res = await api.get("/settings");
        const data = res.data;

        if (data?.currentSemester && data?.currentSy) {
          setSemesterLabel(
            `Now Accepting Applications · ${data.currentSemester} AY ${data.currentSy}`
          );
        }
      } catch (error) {
        console.error("Failed to fetch system settings:", error);
      }
    };

    fetchSystemSettings();
  }, []);

  useEffect(() => {
    const sections = [
      { id: "home", nav: "HOME" },
      { id: "about", nav: "ABOUT" },
      { id: "features", nav: "FEATURES" },
      { id: "recommended", nav: "RECOMMENDED" },
      { id: "support", nav: "SUPPORT" },
    ];

    const observers: IntersectionObserver[] = [];

    sections.forEach(({ id, nav }) => {
      const el = document.getElementById(id);
      if (!el) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting && !isScrollingRef.current) {
            setActiveNav(nav);
            setIsAboutVisible(nav !== "HOME");
          }
        },
        { threshold: 0.3 }
      );

      observer.observe(el);
      observers.push(observer);
    });

    return () => observers.forEach(o => o.disconnect());
  }, []);

  const fu = (delay: number): React.CSSProperties => ({
    opacity: mounted ? 1 : 0,
    transform: mounted ? "translateY(0)" : "translateY(24px)",
    transition: `opacity 0.75s cubic-bezier(0.4,0,0.2,1) ${delay}s, transform 0.75s cubic-bezier(0.4,0,0.2,1) ${delay}s`,
  });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,600;0,700;1,600;1,700&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        body { overflow-x:hidden; }
        .hero-root {
          position:relative; min-height:100vh;
          background:
            radial-gradient(ellipse 120% 60% at 50% -5%,#8C1535 0%,#4A0A1E 35%,#3D0718 52%,transparent 72%),
            radial-gradient(ellipse 80% 45% at 15% 5%,rgba(107,15,43,.65) 0%,transparent 55%),
            radial-gradient(ellipse 80% 45% at 85% 5%,rgba(107,15,43,.5) 0%,transparent 55%),
            linear-gradient(180deg,#3D0718 0%,#6B0F2B 16%,#B5344F 33%,#E8A0AA 50%,#F9E8EC 64%,#FDF5F7 76%,#FFFFFF 100%);
        }
        .bg-grid {
          position:absolute; top:0; right:0; bottom:0; left:0; z-index:2; pointer-events:none;
          background-image:linear-gradient(rgba(255,255,255,.055) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.055) 1px,transparent 1px);
          background-size:55px 55px;
          -webkit-mask-image:linear-gradient(180deg,rgba(0,0,0,1) 0%,rgba(0,0,0,0) 58%);
          mask-image:linear-gradient(180deg,rgba(0,0,0,1) 0%,rgba(0,0,0,0) 58%);
        }
        .hero-content { position:relative; z-index:10; display:flex; flex-direction:column; align-items:center; min-height:100vh; padding-top:80px; }
        
        .nav-pill { 
          display:flex; align-items:center; gap:2px;
          border-radius:99px; padding:4px 6px; backdrop-filter:blur(14px);
          transition: background 0.4s ease, border 0.4s ease, box-shadow 0.4s ease;
        }
        .nav-item { 
          padding:8px 18px; border-radius:99px; border:none; background:none;
          font-family:'Plus Jakarta Sans',sans-serif; font-size:11px; font-weight:700;
          letter-spacing:0.09em; text-transform:uppercase; cursor:pointer; transition:color 0.2s;
        }
        .nav-item.active { 
          background:linear-gradient(135deg,#8C1535,#3D0718); 
          color:#fff !important;
          box-shadow:0 4px 18px rgba(140,21,53,0.55); 
        }
          
        .sign-in-btn { 
          display:flex; 
          align-items:center; 
          gap:6px; 
          padding:9px 22px; 
          border-radius:99px; 
          border:none; 
          cursor:pointer; 
          font-family:'Plus Jakarta Sans',sans-serif; 
          font-size:12px; 
          font-weight:700; 
          letter-spacing:0.04em; 
          background:linear-gradient(135deg,#C9973A,#a07825); 
          color:#fff; 
          box-shadow:0 4px 20px rgba(201,151,58,0.4); 
          transition:transform 0.2s,box-shadow 0.2s; 
        }
        .sign-in-btn:hover { transform:translateY(-1px) scale(1.04); box-shadow:0 8px 28px rgba(201,151,58,0.55); }
        .hamburger-btn { background:rgba(255,255,255,0.1); border:1px solid rgba(255,255,255,0.15); border-radius:10px; width:40px; height:40px; display:flex; align-items:center; justify-content:center; cursor:pointer; backdrop-filter:blur(10px); transition:background 0.2s; }
        .hamburger-btn:hover { background:rgba(255,255,255,0.18); }
        .status-badge { display:flex; align-items:center; gap:7px; margin-top:16px; background:rgba(255,255,255,0.14); border:1px solid rgba(255,255,255,0.25); border-radius:99px; padding:5px 14px; backdrop-filter:blur(10px); font-family:'Plus Jakarta Sans',sans-serif; font-size:10px; font-weight:600; letter-spacing:0.10em; text-transform:uppercase; color:rgba(255,255,255,0.85); }
        .status-dot { width:6px; height:6px; border-radius:50%; background:#E8C37A; box-shadow:0 0 7px #E8C37A; animation:blink 2s ease-in-out infinite; }
        @keyframes blink { 0%,100%{opacity:1;} 50%{opacity:0.3;} }
        .hero-title { font-family:'Cormorant Garamond',serif; text-align:center; line-height:1.0; margin-top:18px; padding:0 16px; }
        .t-white { display:block; font-size:clamp(44px,7.5vw,96px); font-weight:700; color:#fff; letter-spacing:-0.016em; text-shadow:0 4px 40px rgba(0,0,0,0.18); }
        .t-row2 { display:flex; align-items:baseline; justify-content:center; gap:10px; flex-wrap:wrap; }
        .t-gold { font-size:clamp(44px,7.5vw,96px); font-style:italic; font-weight:600; background:linear-gradient(135deg,#C9973A 0%,#E8C37A 50%,#C9973A 100%); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; letter-spacing:-0.016em; }
        .hero-sub { font-family:'Plus Jakarta Sans',sans-serif; font-size:14px; font-weight:300; color:rgba(255,255,255,0.75); text-align:center; margin-top:14px; line-height:1.78; padding:0 24px; max-width:420px; }
        .logos-row { display:flex; align-items:center; gap:16px; margin-top:24px; }
        .logo-ring { width:78px; height:78px; border-radius:50%; background:rgba(255,255,255,0.15); border:2px solid rgba(255,255,255,0.3); display:flex; align-items:center; justify-content:center; overflow:hidden; backdrop-filter:blur(8px); transition:transform 0.3s cubic-bezier(.34,1.56,.64,1),background 0.25s; }
        .logo-ring:hover { transform:scale(1.1) translateY(-3px); background:rgba(255,255,255,0.25); }
        .logo-ph { font-family:'Plus Jakarta Sans',sans-serif; font-size:9px; font-weight:700; letter-spacing:0.06em; color:rgba(255,255,255,0.5); }
        .logo-sep { width:1px; height:28px; background:rgba(255,255,255,0.2); }
        .browse-btn { margin-top:24px; display:flex; align-items:center; gap:8px; padding:13px 32px; border-radius:99px; border:none; cursor:pointer; font-family:'Plus Jakarta Sans',sans-serif; font-size:14px; font-weight:700; letter-spacing:0.04em; background:linear-gradient(135deg,#C9973A,#a07825); color:#fff; box-shadow:0 6px 28px rgba(201,151,58,0.45); transition:transform 0.22s cubic-bezier(0.4,0,0.2,1),box-shadow 0.22s; }
        .browse-btn:hover { transform:translateY(-3px) scale(1.04); box-shadow:0 14px 36px rgba(201,151,58,0.55); }
        .browse-btn:active { transform:scale(0.97); }
        .search-wrapper { margin-top:28px; padding:0 16px 60px; width:100%; max-width:800px; }
        @media(max-width:400px){.t-white,.t-gold{font-size:40px;}}
      `}</style>

      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} activeNav={activeNav} setActiveNav={setActiveNav} scrollTo={scrollTo} />

      <div className="hero-root" id="home">
        <div className="bg-grid" />
        <Particles />

        {/* Desktop Nav - only show when NOT mobile */}
        {!isMobile && (
          <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: "18px 48px" }}>
            <div
              className="nav-pill"
              style={{
                background: isAboutVisible
                  ? "linear-gradient(135deg, rgba(240,225,230,0.82) 0%, rgba(255,255,255,0.75) 50%, rgba(220,200,210,0.82) 100%)"
                  : "rgba(255,255,255,0.08)",
                border: isAboutVisible
                  ? "1px solid rgba(255,255,255,0.9)"
                  : "1px solid rgba(255,255,255,0.14)",
                boxShadow: isAboutVisible
                  ? "0 4px 24px rgba(140,21,53,0.12), inset 0 1px 0 rgba(255,255,255,0.8)"
                  : "none",
              }}
            >
              {NAV_LINKS.map(link => (
                <button
                  key={link}
                  className={`nav-item${activeNav === link ? " active" : ""}`}
                  style={{
                    color: activeNav === link
                      ? "#fff"
                      : isAboutVisible
                        ? "rgba(80,20,35,0.7)"
                        : "rgba(255,255,255,0.6)",
                  }}
                  onClick={() => {
                    const map: Record<string, string> = {
                      HOME: "home",
                      ABOUT: "about",
                      FEATURES: "features",
                      RECOMMENDED: "recommended",
                      SUPPORT: "support",
                    };
                    scrollTo(map[link], link);
                  }}
                >{link}</button>
              ))}
            </div>
            <button
              className="sign-in-btn"
              style={{ position: "absolute", right: 48 }}
              onClick={() => navigate("/auth/signin")}
            >Sign In →</button>
          </nav>
        )}

        {/* Mobile Nav - only show on mobile */}
        {isMobile && (
          <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px" }}>
            <button className="hamburger-btn" style={{ padding: "0px" }} onClick={() => setDrawerOpen(o => !o)}>
              <HamburgerIcon open={drawerOpen} />
            </button>
            <button
              className="sign-in-btn"
              onClick={() => navigate("/auth/signin")}
            >Sign In →</button>
          </nav>
        )}

        {/* Hero Content */}
        <div className="hero-content">
          <div className="status-badge" style={fu(0.12)}>
            <span className="status-dot" />
            {semesterLabel}
          </div>

          <h1 className="hero-title" style={fu(0.22)}>
            <span className="t-white">Find your</span>
            <span className="t-row2">
              <span className="t-gold">perfect</span>
              <span className="t-white">campus home.</span>
            </span>
          </h1>

          <p className="hero-sub" style={fu(0.34)}>Trusted housing for every UPLB student, all in one place.</p>

          <div className="logos-row" style={fu(0.44)}>
            <img src={uplbLogo} alt="Logo" className="logo-ring" />
            <div className="logo-sep" />
            <img src={casLogo} alt="Logo" className="logo-ring" />
            <div className="logo-sep" />
            <img src={icsLogo} alt="Logo" className="logo-ring" />
          </div>

          <button
            className="browse-btn"
            style={fu(0.54)}
            onClick={() => { window.location.href = "/map"; }}
          >Browse Rooms →</button>

          <div className="search-wrapper" style={fu(0.64)}>
            <SearchBar isMobile={isMobile} />
          </div>
        </div>
      </div>
    </>
  );
}