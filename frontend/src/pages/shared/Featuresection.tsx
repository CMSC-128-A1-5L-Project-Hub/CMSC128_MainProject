"use client";

import { useState, useRef, useEffect, useCallback } from "react";

type Role = "student" | "dormitory" | "administrator";

const ROLES = [
  {
    id: "student" as Role,
    label: "Student",
    tag: "WHAT WE OFFER",
    title: "Student",
    description: "Find, apply, and move into your perfect UPLB dorm — all from one place.",
    features: [
      { icon: "map",       title: "Interactive Dorm Map",   sub: "Click pins to explore rooms near UPLB" },
      { icon: "home",      title: "Browse Accommodations",  sub: "Filter by price, location & amenities" },
      { icon: "clipboard", title: "Apply & Track",          sub: "Submit applications and monitor status" },
    ],
    cta: "Get Started →",
    image: "/images/student-mockup.png",
    bg: "linear-gradient(155deg, #8C1A38 0%, #6B1228 42%, #4A0D1E 100%)",
  },
  {
    id: "dormitory" as Role,
    label: "Dormitory Manager",
    tag: "FOR MANAGERS",
    title: "Dormitory\nManager",
    description: "Manage listings, review applicants, and track occupancy in real time.",
    features: [
      { icon: "home",      title: "Manage Listings",      sub: "Add, edit, and publish your dorm rooms" },
      { icon: "clipboard", title: "Review Applications",  sub: "Approve or decline tenants easily" },
      { icon: "chart",     title: "Occupancy Dashboard",  sub: "See live stats on rooms and tenants" },
    ],
    cta: "Manage Dorm →",
    image: "/images/dorm-mockup.png",
    bg: "linear-gradient(155deg, #9E2040 0%, #7A1530 42%, #521020 100%)",
  },
  {
    id: "administrator" as Role,
    label: "Housing Administrator",
    tag: "FOR ADMINS",
    title: "Housing\nAdministrator",
    description: "Oversee the entire UPLB housing ecosystem — approvals, compliance, and reporting.",
    features: [
      { icon: "clipboard", title: "System Oversight",    sub: "Review all listings and applications" },
      { icon: "chart",     title: "Analytics & Reports", sub: "Export data and generate housing reports" },
      { icon: "shield",    title: "Policy Enforcement",  sub: "Flag and manage non-compliant listings" },
    ],
    cta: "Admin Portal →",
    image: "/images/admin-mockup.png",
    bg: "linear-gradient(155deg, #B02245 0%, #8C1A38 42%, #5E1225 100%)",
  },
];

// ─── Icons ────────────────────────────────────────────────────────────────────
function Icon({ name }: { name: string }) {
  const p = { width: 17, height: 17, fill: "none" as const, stroke: "currentColor", strokeWidth: 1.75, viewBox: "0 0 24 24" };
  if (name === "map")       return <svg {...p}><path strokeLinecap="round" strokeLinejoin="round" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx={12} cy={9} r={2.5} strokeLinecap="round"/></svg>;
  if (name === "home")      return <svg {...p}><path strokeLinecap="round" strokeLinejoin="round" d="M3 12L12 3l9 9M5 10v10a1 1 0 001 1h4v-5h4v5h4a1 1 0 001-1V10"/></svg>;
  if (name === "clipboard") return <svg {...p}><rect x={8} y={2} width={8} height={4} rx={1} strokeLinecap="round"/><path strokeLinecap="round" strokeLinejoin="round" d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2M9 12h6M9 16h4"/></svg>;
  if (name === "chart")     return <svg {...p}><path strokeLinecap="round" strokeLinejoin="round" d="M3 3v18h18M7 16l4-4 4 4 4-4"/></svg>;
  if (name === "shield")    return <svg {...p}><path strokeLinecap="round" strokeLinejoin="round" d="M12 2L4 6v6c0 5.25 3.5 9.74 8 11 4.5-1.26 8-5.75 8-11V6l-8-4z"/></svg>;
  return null;
}

// ─── Grain overlay ────────────────────────────────────────────────────────────
function GrainOverlay() {
  return (
    <svg
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.04, pointerEvents: "none", zIndex: 1 }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <filter id="grain-feat">
        <feTurbulence type="fractalNoise" baseFrequency="0.78" numOctaves="4" stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#grain-feat)" />
    </svg>
  );
}

// ─── Parallax image ───────────────────────────────────────────────────────────
function ParallaxImage({ src, alt, isActive }: { src: string; alt: string; isActive: boolean }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const imgRef  = useRef<HTMLImageElement>(null);

  const onMove = useCallback((e: MouseEvent) => {
    if (!wrapRef.current || !imgRef.current) return;
    const r  = wrapRef.current.getBoundingClientRect();
    const cx = (e.clientX - r.left)  / r.width  - 0.5;
    const cy = (e.clientY - r.top)   / r.height - 0.5;
    imgRef.current.style.transform = `translate(${cx * -20}px, ${cy * -16}px) scale(1.07)`;
  }, []);

  const onLeave = useCallback(() => {
    if (imgRef.current) imgRef.current.style.transform = "translate(0,0) scale(1.03)";
  }, []);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => { el.removeEventListener("mousemove", onMove); el.removeEventListener("mouseleave", onLeave); };
  }, [onMove, onLeave]);

  return (
    <div ref={wrapRef} style={{ width: "100%", height: "100%", overflow: "hidden", borderRadius: 18, position: "relative" }}>
      <div style={{
        position: "absolute", inset: 0, borderRadius: 18,
        display: "flex", alignItems: "center", justifyContent: "center",
        border: "1.5px dashed rgba(255,255,255,0.13)",
        background: "rgba(255,255,255,0.04)",
      }}>
        <span style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 10, color: "rgba(255,255,255,0.28)", letterSpacing: "0.12em", textTransform: "uppercase" }}>
          {alt} Image
        </span>
      </div>
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        style={{
          position: "relative", zIndex: 2,
          width: "100%", height: "100%", objectFit: "contain",
          transform: "translate(0,0) scale(1.03)",
          transition: "transform 0.65s cubic-bezier(0.23,1,0.32,1), opacity 0.45s ease",
          willChange: "transform",
          opacity: isActive ? 1 : 0,
        }}
      />
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function FeaturesSection() {
  const [active, setActive] = useState<Role>("student");
  const [animating, setAnimating] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  const switchRole = (id: Role) => {
    if (id === active || animating) return;
    setAnimating(true);
    setActive(id);
    setTimeout(() => setAnimating(false), 600);
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.2, rootMargin: "0px 0px -100px 0px" }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,600;0,700;1,600;1,700&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');


        .fs-wrap { 
        width:100%; 
        background:#fff; 
        padding:72px 24px 88px;
        opacity: 0;
        transform: translateY(60px);
        transition: opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1), transform 0.8s cubic-bezier(0.4, 0, 0.2, 1);
        }

        @media (max-width: 640px) {
        .fs-wrap {
            padding-top: 8px !important;
        }
        }
        
        .fs-wrap.visible {
          opacity: 1;
          transform: translateY(0);
        }

        /* heading animations */
        .fs-tag-row { 
          display:flex; 
          align-items:center; 
          justify-content:center; 
          gap:12px; 
          margin-bottom:14px;
          opacity: 0;
          transform: scale(0.9);
          transition: opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1), transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
          transition-delay: 0.1s;
        }
        
        .fs-wrap.visible .fs-tag-row {
          opacity: 1;
          transform: scale(1);
        }
        
        .fs-tag-line { height:1.5px; width:36px; background:#C9973A; border-radius:99px; }
        .fs-tag-lbl  { font-family:'Plus Jakarta Sans',sans-serif; font-size:10px; font-weight:700; letter-spacing:0.2em; text-transform:uppercase; color:#C9973A; }
        
        .fs-h2 { 
          font-family:'Cormorant Garamond',serif; 
          font-size:clamp(40px,5.5vw,64px); 
          font-weight:700; 
          text-align:center; 
          color:#1a0810; 
          line-height:1.05; 
          margin-bottom:12px;
          opacity: 0;
          transform: translateY(30px);
          transition: opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1), transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
          transition-delay: 0.2s;
        }
        
        .fs-wrap.visible .fs-h2 {
          opacity: 1;
          transform: translateY(0);
        }
        
        .fs-h2 em    { color:#6B0F2B; font-style:italic; }
        
        .fs-p { 
          font-family:'Plus Jakarta Sans',sans-serif; 
          font-size:14px; 
          font-weight:300; 
          color:#7a4a58; 
          text-align:center; 
          max-width:420px; 
          margin:0 auto 52px; 
          line-height:1.8;
          opacity: 0;
          transform: translateY(30px);
          transition: opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1), transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
          transition-delay: 0.3s;
        }
        
        .fs-wrap.visible .fs-p {
          opacity: 1;
          transform: translateY(0);
        }
        
        .fs-p strong { font-weight:600; font-style:italic; color:#4a0d1e; }

        /* slider */
        .fs-slider {
          display:flex; max-width:1120px; margin:0 auto;
          border-radius:26px; overflow:hidden; height:580px;
          box-shadow:0 40px 90px rgba(74,13,30,0.38), 0 8px 32px rgba(0,0,0,0.16);
          opacity: 0;
          transform: scale(0.95);
          transition: opacity 0.7s cubic-bezier(0.4, 0, 0.2, 1), transform 0.7s cubic-bezier(0.4, 0, 0.2, 1);
          transition-delay: 0.4s;
        }
        
        .fs-wrap.visible .fs-slider {
          opacity: 1;
          transform: scale(1);
        }

        /* panel */
        .fs-panel {
          position:relative; overflow:hidden; cursor:pointer; flex-shrink:0;
          transition:width 0.7s cubic-bezier(0.77,0,0.175,1);
        }
        .fs-panel.open     { width:70%; cursor:default; }
        .fs-panel.closed   { width:15%; }

        /* elegant hover effect - just a subtle brightness increase */
        .fs-panel.closed:hover {
          filter: brightness(1.05);
        }

        /* glow - keep it subtle */
        .fs-glow {
          position:absolute; inset:0; z-index:2; pointer-events:none;
          background:radial-gradient(ellipse 60% 55% at 12% 8%, rgba(255,255,255,0.08) 0%, transparent 62%);
          transition: opacity 0.5s ease;
        }
        .fs-panel.closed:hover .fs-glow {
          opacity: 0.6;
        }

        /* vertical label - elegant fade */
        .fs-vlabel {
          position:absolute; inset:0; z-index:10;
          display:flex; align-items:center; justify-content:center;
          transition:opacity 0.4s ease;
        }
        .fs-vlabel span {
          font-family:'Plus Jakarta Sans',sans-serif; font-size:9.5px; font-weight:700;
          letter-spacing:0.22em; text-transform:uppercase;
          color:rgba(255,255,255,0.5); white-space:nowrap;
          writing-mode:vertical-rl; text-orientation:mixed; transform:rotate(180deg);
          transition:color 0.3s ease;
        }
        .fs-panel.closed:hover .fs-vlabel span { 
          color:rgba(255,255,255,0.85);
        }

        /* expanded content */
        .fs-content {
          position:absolute; inset:0; z-index:5;
          display:flex; flex-direction:row;
          transition:opacity 0.5s ease;
        }
        .fs-content.hide { opacity:0; pointer-events:none; }
        .fs-content.show { opacity:1; pointer-events:all; }

        /* text pane */
        .fs-text { 
            flex: 1; min-width: 0; 
            padding: 38px 34px 34px; 
            display: flex; flex-direction: column; 
            justify-content: flex-start;
            gap: 0;
        }

        /* pill - elegant */
        .fs-pill {
          display:inline-flex; align-items:center; gap:7px;
          background:rgba(255,255,255,0.08); border:1px solid rgba(255,255,255,0.12);
          border-radius:99px; padding:5px 14px; margin-bottom:18px;
          backdrop-filter:blur(10px); width:fit-content;
        }
        .fs-dot { width:5px; height:5px; border-radius:50%; background:#E8C37A; box-shadow:0 0 6px #E8C37A; animation:fsDot 2.2s ease-in-out infinite; }
        @keyframes fsDot { 0%,100%{opacity:1} 50%{opacity:0.25} }
        .fs-pill-txt { font-family:'Plus Jakarta Sans',sans-serif; font-size:9px; font-weight:700; letter-spacing:0.16em; text-transform:uppercase; color:rgba(255,255,255,0.62); }

        /* title */
        .fs-title {
          font-family:'Cormorant Garamond',serif;
          font-size:clamp(34px,3.8vw,54px); font-style:italic; font-weight:700;
          color:#fff; line-height:1.0; margin-bottom:11px; white-space:pre-line;
          text-shadow:0 3px 28px rgba(0,0,0,0.28);
        }
        .fs-desc {
          font-family:'Plus Jakarta Sans',sans-serif;
          font-size:13px; font-weight:300; color:rgba(255,255,255,0.58);
          line-height:1.78; margin-bottom:22px; max-width:275px;
        }

        /* feature row - elegant subtle lift */
        .fs-row {
          display:flex; align-items:center; gap:12px;
          background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.06);
          border-radius:14px; padding:11px 14px; margin-bottom:8px;
          transition:all 0.3s ease;
          cursor:default;
        }
        .fs-row:hover { 
          background:rgba(255,255,255,0.09); 
          border-color:rgba(255,255,255,0.12);
          transform: translateX(6px);
        }
        .fs-icon-box { width:32px; height:32px; border-radius:10px; background:rgba(255,255,255,0.08); flex-shrink:0; display:flex; align-items:center; justify-content:center; color:rgba(255,255,255,0.75); transition: all 0.3s ease; }
        .fs-row:hover .fs-icon-box {
          background: rgba(201,151,58,0.2);
        }
        .fs-row-t { font-family:'Plus Jakarta Sans',sans-serif; font-size:12px; font-weight:700; color:#fff; line-height:1.3; }
        .fs-row-s { font-family:'Plus Jakarta Sans',sans-serif; font-size:10px; font-weight:400; color:rgba(255,255,255,0.42); line-height:1.4; }

        /* cta - elegant */
        .fs-cta {
          display:inline-flex; align-items:center; gap:7px;
          background:#C9973A; color:#fff; border:none; cursor:pointer;
          font-family:'Plus Jakarta Sans',sans-serif; font-size:13px; font-weight:700;
          padding:11px 26px; border-radius:99px; margin-top:18px; align-self:flex-start;
          box-shadow:0 6px 24px rgba(201,151,58,0.36);
          transition:all 0.3s ease;
        }
        .fs-cta:hover  { 
          transform:translateY(-2px); 
          box-shadow:0 10px 30px rgba(201,151,58,0.5); 
          background:#d9a845;
        }
        .fs-cta:active { transform:translateY(0); }

        /* image pane */
        .fs-img-pane {
          width:290px; flex-shrink:0;
          display:flex; align-items:center; justify-content:center;
          padding:28px 24px 28px 8px;
        }

        /* elegant staggered fade-in */
        @keyframes fsFadeUp {
          from { opacity:0; transform:translateY(12px); }
          to   { opacity:1; transform:translateY(0); }
        }
        .fs-content.show .fs-pill        { animation:fsFadeUp 0.5s ease 0.10s both; }
        .fs-content.show .fs-title       { animation:fsFadeUp 0.5s ease 0.17s both; }
        .fs-content.show .fs-desc        { animation:fsFadeUp 0.5s ease 0.23s both; }
        .fs-content.show .fs-row:nth-child(1) { animation:fsFadeUp 0.5s ease 0.27s both; }
        .fs-content.show .fs-row:nth-child(2) { animation:fsFadeUp 0.5s ease 0.33s both; }
        .fs-content.show .fs-row:nth-child(3) { animation:fsFadeUp 0.5s ease 0.39s both; }
        .fs-content.show .fs-cta         { animation:fsFadeUp 0.5s ease 0.44s both; }
        .fs-content.show .fs-img-pane    { animation:fsFadeUp 0.6s ease 0.18s both; }

        @media(max-width:960px) { .fs-img-pane { display:none; } }
        @media(max-width:768px) {
          .fs-slider { flex-direction:column; height:auto; border-radius:20px; }
          .fs-panel.open   { width:100%; min-height:560px; }
          .fs-panel.closed { width:100%; min-height:52px; }
          .fs-vlabel span  { writing-mode:horizontal-tb; transform:none; }
        }
      `}</style>

      <section ref={sectionRef} className={`fs-wrap ${isVisible ? "visible" : ""}`} id="features">
        <div className="fs-tag-row">
          <div className="fs-tag-line" />
          <span className="fs-tag-lbl">Features</span>
          <div className="fs-tag-line" />
        </div>
        <h2 className="fs-h2">Your Role, <em>Your Rules.</em></h2>
        <p className="fs-p">
          <strong>UBLE</strong> is built for everyone in the housing ecosystem — students, landlords, and dorm managers.
        </p>

        <div className="fs-slider">
          {ROLES.map((role) => {
            const isOpen = active === role.id;
            return (
              <div
                key={role.id}
                className={`fs-panel ${isOpen ? "open" : "closed"}`}
                style={{ background: role.bg }}
                onClick={() => switchRole(role.id)}
              >
                <GrainOverlay />
                <div className="fs-glow" />

                <div className="fs-vlabel" style={{ opacity: isOpen ? 0 : 1, pointerEvents: isOpen ? "none" : "all" }}>
                  <span>{role.label}</span>
                </div>

                <div className={`fs-content ${isOpen ? "show" : "hide"}`}>
                  <div className="fs-text">
                    <div className="fs-pill">
                      <div className="fs-dot" />
                      <span className="fs-pill-txt">{role.tag}</span>
                    </div>

                    <div className="fs-title">{role.title}</div>
                    <div className="fs-desc">{role.description}</div>

                    <div style={{ flex: 1 }}>
                      {role.features.map((f, i) => (
                        <div className="fs-row" key={i}>
                          <div className="fs-icon-box"><Icon name={f.icon} /></div>
                          <div>
                            <div className="fs-row-t">{f.title}</div>
                            <div className="fs-row-s">{f.sub}</div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <button className="fs-cta">{role.cta}</button>
                  </div>

                  <div className="fs-img-pane">
                    <ParallaxImage src={role.image} alt={role.label} isActive={isOpen} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}