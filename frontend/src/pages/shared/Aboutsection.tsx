"use client";

import { useEffect, useState, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import DormCard from "../../components/DormCard";

const KF = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,600;0,700;1,600;1,700&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');

  @keyframes f0  { 0%,100%{transform:translateY(0) rotate(-8deg)}  50%{transform:translateY(-7px)  rotate(-8deg)}  }
  @keyframes f1  { 0%,100%{transform:translateY(0) rotate(4deg)}   50%{transform:translateY(-9px)  rotate(4deg)}   }
  @keyframes f2  { 0%,100%{transform:translateY(0) rotate(-5deg)}  50%{transform:translateY(-6px)  rotate(-5deg)}  }
  @keyframes f3  { 0%,100%{transform:translateY(0) rotate(9deg)}   50%{transform:translateY(-8px)  rotate(9deg)}   }
  @keyframes f4  { 0%,100%{transform:translateY(0) rotate(0deg)}   50%{transform:translateY(-10px) rotate(0deg)}   }
  @keyframes f5  { 0%,100%{transform:translateY(0) rotate(-4deg)}  50%{transform:translateY(-7px)  rotate(-4deg)}  }
  @keyframes f6  { 0%,100%{transform:translateY(0) rotate(6deg)}   50%{transform:translateY(-8px)  rotate(6deg)}   }
  @keyframes f7  { 0%,100%{transform:translateY(0) rotate(-6deg)}  50%{transform:translateY(-9px)  rotate(-6deg)}  }
  @keyframes f8  { 0%,100%{transform:translateY(0) rotate(2deg)}   50%{transform:translateY(-10px) rotate(2deg)}   }
  @keyframes f9  { 0%,100%{transform:translateY(0) rotate(-5deg)}  50%{transform:translateY(-7px)  rotate(-5deg)}  }
  @keyframes f10 { 0%,100%{transform:translateY(0) rotate(-7deg)}  50%{transform:translateY(-8px)  rotate(-7deg)}  }
  @keyframes f11 { 0%,100%{transform:translateY(0) rotate(5deg)}   50%{transform:translateY(-9px)  rotate(5deg)}   }
  @keyframes fdot{ 0%,100%{transform:translateY(0)}                50%{transform:translateY(-6px)}                 }

  @media (max-width: 1200px) {
    .about-outer-grid {
      display: flex !important;
      flex-direction: column !important;
      align-items: center !important;
      text-align: center !important;
      padding: 40px 24px !important;
    }

    .text-container {
      display: flex !important;
      flex-direction: column !important;
      align-items: center !important;
      margin-bottom: 40px !important;
    }
  }

  @media (max-width: 960px) {
    .stats-outer-wrapper {
      justify-content: center !important;
      max-width: 100vw !important;
      gap: clamp(10px, 4vw, 30px) !important;
      padding: 0 20px !important;
    }
    
    .stat-item-box {
      padding-left: clamp(15px, 3vw, 44px) !important;
      padding-right: clamp(15px, 3vw, 44px) !important;
    }
  }

  /* ONLY ON SMALL SCREENS - rearrange layout */
  @media (max-width: 900px) {
    .about-inner-grid {
      display: flex !important;
      flex-direction: column !important;
      align-items: center !important;
      gap: 24px !important;
      width: 100% !important;
    }
    
    /* Top row wrapper - DormCard and RoomsCard side by side */
    .top-row-cards {
      display: flex !important;
      flex-direction: row !important;
      justify-content: center !important;
      gap: 20px !important;
      width: 100% !important;
      flex-wrap: wrap !important;
    }
    
    /* Bottom row wrapper - OccCard and ReviewCard side by side */
    .bottom-row-cards {
      display: flex !important;
      flex-direction: row !important;
      justify-content: center !important;
      gap: 20px !important;
      width: 100% !important;
      flex-wrap: wrap !important;
    }
    
    .top-row-cards > div,
    .bottom-row-cards > div {
      flex: 1 !important;
      min-width: 250px !important;
      max-width: 320px !important;
    }
    
    .rooms-card-wrapper {
      padding-top: 0 !important;
      position: relative !important;
    }
    
    /* Hide the original grid layout */
    .original-grid-layout {
      display: none !important;
    }
  }
  
  /* On very small screens, stack each row vertically */
  @media (max-width: 600px) {
    .top-row-cards {
      flex-direction: column !important;
      align-items: center !important;
    }
    
    .bottom-row-cards {
      flex-direction: column !important;
      align-items: center !important;
    }
    
    .top-row-cards > div,
    .bottom-row-cards > div {
      width: 100% !important;
      max-width: 320px !important;
    }
  }
`;

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as const } 
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.12 } }
};

type PillProps = {
  label?: string; bg: string; color: string; border?: string;
  anim: string; delay: string; dur: string;
  style?: React.CSSProperties;
  isAnchor?: boolean; isCircle?: boolean;
};

function Pill({ label, bg, color, border, anim, delay, dur, style, isAnchor, isCircle }: PillProps) {
  const base: React.CSSProperties = {
    position: "absolute",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    background: bg,
    color,
    border: border ?? "none",
    animation: `${anim} ${dur} ${delay} ease-in-out infinite`,
    boxShadow: "0 2px 10px rgba(26,10,15,0.13)",
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    whiteSpace: "nowrap",
    ...style,
  };
  if (isCircle) return <span style={{ ...base, width: 28, height: 28, borderRadius: "50%", fontSize: 6.5, fontWeight: 800, letterSpacing: "0.05em", flexDirection: "column", padding: 0 }}>{label}</span>;
  if (isAnchor) return <span style={{ ...base, flexDirection: "column", borderRadius: 999, padding: "4px 8px", gap: 1 }}><span style={{ fontSize: 5.5, letterSpacing: "0.14em", color: "#fff", textTransform: "uppercase" }}>UBLE</span><span style={{ fontSize: 10.5, fontWeight: 700, color: "#fff" }}>Find Your Home</span></span>;
  return <span style={{ ...base, borderRadius: 999, padding: "3px 10px", fontSize: 8.5, fontWeight: 650 }}>{label}</span>;
}

function TagsCloud() {
  return (
    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 154, pointerEvents: "none", zIndex: 10 }}>
      <Pill label="WiFi Included" bg="#fff" color="#6B0F2B" border="1.5px solid #6B0F2B" anim="f0" delay="0s" dur="3.8s" style={{ top: 0, left: 0 }} />
      <span style={{ position: "absolute", top: 0, left: 130, width: 18, height: 18, borderRadius: "50%", background: "rgb(201, 151, 58)", animation: "fdot 4.2s 0.2s ease-in-out infinite" }} />
      <Pill label="Near Campus" bg="#F5ECF0" color="#6B0F2B" border="1.5px solid #D4A0B0" anim="f2" delay="0.6s" dur="3.5s" style={{ top: 0, right: 0 }} />
      <Pill label="Interactive Map" bg="#C9973A" color="#fff" anim="f1" delay="0.35s" dur="4.2s" style={{ top: 38, left: 14 }} />
      <Pill label="Safe" bg="#3D0718" color="#fff" anim="f3" delay="0.9s" dur="4.0s" style={{ top: 40, left: 118 }} />
      <Pill label="UPLB" bg="#C9973A" color="#fff" anim="f4" delay="0.15s" dur="3.6s" style={{ top: 37, right: 0 }} isCircle />
      <span style={{ position: "absolute", top: 80, left: 20, width: 18, height: 18, borderRadius: "50%", background: "rgb(201, 151, 58)", animation: "fdot 4.2s 0.2s ease-in-out infinite" }} />
      <Pill label="Transient-Friendly" bg="#fff" color="#C9973A" border="1.5px solid rgb(201, 151, 58)" anim="f5" delay="0.5s" dur="4.4s" style={{ top: 80, left: 45 }} />
      <span style={{ position: "absolute", top: 80, left: 150, width: 18, height: 18, borderRadius: "50%", background: "rgba(158, 40, 77, 0.55)", animation: "fdot 4.2s 0.2s ease-in-out infinite" }} />
      <Pill label="✓ Verified Listings" bg="#6B0F2B" color="#fff" anim="f6" delay="0.75s" dur="4.1s" style={{ top: 80, right: 0 }} />
      <Pill label="Study-Friendly" bg="#FDF5F0" color="#6B0F2B" border="1.5px solid #C9973A" anim="f7" delay="0.4s" dur="3.7s" style={{ top: 118, left: 0 }} />
      <Pill bg="#6B0F2B" color="#fff" anim="f8" delay="0s" dur="4.5s" style={{ top: 115, left: 95 }} isAnchor />
      <Pill label="24/7 Support" bg="#C05070" color="#fff" anim="f9" delay="0.8s" dur="3.9s" style={{ top: 118, right: 0 }} />
      <span style={{ position: "absolute", top: 158, left: 2, width: 18, height: 18, borderRadius: "50%", background: "rgba(232,160,176,0.55)", animation: "fdot 4.2s 0.2s ease-in-out infinite" }} />
      <Pill label="Affordable Rates" bg="#FDF5F0" color="#6B0F2B" border="1.5px solid #D4A0B0" anim="f10" delay="1.0s" dur="4.3s" style={{ top: 158, left: 26 }} />
      <Pill label="Near UPLB Gate" bg="#C9973A" color="#fff" anim="f11" delay="0.2s" dur="3.6s" style={{ top: 158, right: 0 }} />
    </div>
  );
}

function RoomsCard() {
  return (
    <div style={{ background: "#fff", borderRadius: 18, padding: "18px", boxShadow: "0 6px 28px rgba(26,10,15,0.09)", display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ width: 48, height: 48, borderRadius: 12, background: "#6B0F2B", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 4 }}>
        <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"/><path d="M9 21V12h6v9"/>
        </svg>
      </div>
      <p style={{ fontSize: 10.5, color: "#8A5060" }}>Available Rooms</p>
      <p style={{ fontSize: 38, fontWeight: 700, color: "#2A0410", lineHeight: 1 }}>124</p>
      <p style={{ fontSize: 10, color: "#8A5060" }}>across UPLB area</p>
      <span style={{ alignSelf: "flex-start", fontSize: 10.5, fontWeight: 600, color: "#2D7A4A", background: "#EAF4EE", borderRadius: 999, padding: "4px 12px" }}>↑ 18% this sem</span>
    </div>
  );
}

function OccCard() {
  const OCC = [{ label: "Kamia", pct: 88 }, { label: "Narra", pct: 74 }, { label: "Molave", pct: 61 }, { label: "Yakal", pct: 45 }];
  return (
    <div style={{ background: "#fff", borderRadius: 18, padding: "18px", boxShadow: "0 6px 28px rgba(26,10,15,0.09)", display: "flex", flexDirection: "column", gap: 10 }}>
      <div>
        <p style={{ fontSize: 14, fontWeight: 700, color: "#2A0410" }}>Dorm Occupancy</p>
        <p style={{ fontSize: 10.5, color: "#8A5060", marginTop: 2 }}>Current semester</p>
      </div>
      {OCC.map(({ label, pct }) => (
        <div key={label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 10.5, fontWeight: 600, color: "#2A0410", width: 46 }}>{label}</span>
          <div style={{ flex: 1, height: 7, borderRadius: 999, background: "#F5ECF0", overflow: "hidden" }}>
            <div style={{ width: `${pct}%`, height: "100%", borderRadius: 999, background: "linear-gradient(90deg,#8B1A2F,#C9973A)" }} />
          </div>
          <span style={{ fontSize: 10.5, color: "#8A5060", width: 30, textAlign: "right" }}>{pct}%</span>
        </div>
      ))}
    </div>
  );
}

function ReviewCard() {
  return (
    <div style={{ background: "#fff", borderRadius: 18, padding: "18px", boxShadow: "0 6px 28px rgba(26,10,15,0.09)", display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", gap: 2 }}>{[0,1,2,3,4].map(i => <span key={i} style={{ fontSize: 15, color: "#C9973A" }}>★</span>)}</div>
      <p style={{ fontSize: 11.5, fontStyle: "italic", lineHeight: 1.65, color: "#3A1020", fontFamily: "Georgia,serif" }}>Found my room in one afternoon. Kamia was exactly what I needed.</p>
      <div style={{ height: 1, background: "#F0E8EC" }} />
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 34, height: 34, borderRadius: "50%", background: "#7B3020", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 13, fontWeight: 700 }}>A</div>
        <div>
          <p style={{ fontSize: 12, fontWeight: 700, color: "#2A0410" }}>Ana Reyes</p>
          <p style={{ fontSize: 10, color: "#8A5060" }}>BS Biology · UPLB</p>
        </div>
      </div>
    </div>
  );
}

function Stat({ value, l1, l2, border }: { value: string; l1: string; l2: string; border?: boolean }) {
  return (
    <motion.div variants={fadeInUp} style={{ display: "flex", alignItems: "stretch" }}>
      <div className="stat-item-box" style={{ padding: "22px 44px", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <span style={{ fontFamily: "Georgia, serif", fontSize: "clamp(32px, 5vw, 58px)", fontWeight: 700, color: "#6B0F2B", lineHeight: 1 }}>{value}</span>
        <span style={{ fontSize: "clamp(8px, 1.6vw, 10px)", fontWeight: 700, letterSpacing: "0.14em", color: "#8A5060", marginTop: 7, lineHeight: 1.5, textAlign: "center" }}>{l1}<br />{l2}</span>
      </div>
      {border && <div className="stat-divider" style={{ width: 1, background: "#E8DFE3", margin: "18px 0" }} />}
    </motion.div>
  );
}

export default function AboutSection() {
  const scrollRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: scrollRef,
    offset: ["start end", "end start"]
  });

  const yColA = useTransform(scrollYProgress, [0, 1], [0, 0]);
  const yColB = useTransform(scrollYProgress, [0, 1], [100, -180]); 
  const yColC = useTransform(scrollYProgress, [0, 1], [40, -80]);

  return (
    <>
      <style>{KF}</style>
      <section ref={scrollRef} id="about" style={{ width: "100%", background: "#fff", position: "relative", overflow: "hidden" }}>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 20, paddingTop: 56, paddingBottom: 32 }}
        >
          <div style={{ height: 2, width: 48, background: "#C9973A" }} />
          <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "0.22em", color: "#C4973A" }}>ABOUT UBLE</span>
          <div style={{ height: 2, width: 48, background: "#C9973A" }} />
        </motion.div>

        <motion.div 
          className="stats-outer-wrapper"
          variants={staggerContainer} 
          initial="hidden" 
          whileInView="visible" 
          viewport={{ once: true, amount: 0.3 }} 
          style={{ display: "flex", justifyContent: "center", width: "100%", gap: "20px" }}
        >
          <Stat value="24+"  l1="PARTNERED" l2="DORMS"  border />
          <Stat value="480+" l1="TOTAL"     l2="ROOMS"  border />
          <Stat value="4.9★" l1="AVERAGE"   l2="RATING" />
        </motion.div>

        <div className="about-outer-grid" style={{ maxWidth: 1200, margin: "0 auto", padding: "52px 2px 100px", display: "grid", gridTemplateColumns: "400px 1fr", gap: "clamp(20px, 5vw, 80px)", alignItems: "center" }}>
          
          <motion.div className="text-container" initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <div style={{ height: 2, width: 24, background: "#C9973A" }} />
              <span style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: "0.18em", color: "#8A5060" }}>WHY UBLE</span>
            </div>
            <h2 style={{ fontFamily: "Cormorant Garamond", fontSize: "clamp(24px, 2.4vw, 34px)", fontWeight: 700, color: "#1A0A0F", lineHeight: 1.2, marginBottom: 14 }}>
              Built for students,<br />
              by people who <em style={{ fontStyle: "italic", color: "#C9973A" }}>get it</em>
            </h2>
            <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 13, lineHeight: 1.85, color: "#5A3040", fontWeight: 400 }}>
              We know what it's like—scrolling endlessly, messaging listings, and still not being sure if a place is right. Housing shouldn't feel like a gamble.
              UBLE was created to change that. By connecting students with trusted dorms and clear, reliable information, we take the guesswork out of the process. No more uncertainty—just real options, made for real student needs.
              Because your university experience deserves a home that supports it.
            </p>
          </motion.div>

          {/* DESKTOP: Original 3-column grid layout */}
          <div className="original-grid-layout" style={{ display: "grid", gridTemplateColumns: "220px 280px 220px", gap: 16, alignItems: "end" }}>
            <motion.div style={{ y: yColA as any }} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <DormCard name="Kamia Residence" subtitle="Hall" meta="Studio · 22 m² · On-campus" price={3200} priceUnit="/ month" featured chips={["WiFi", "Furnished", "Air-con"]} rating={4.9} verified onView={() => {}} />
            </motion.div>

            <motion.div style={{ position: "relative", paddingTop: 190, y: yColB as any }} initial={{ opacity: 0, y: 60 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}>
              <TagsCloud />
              <motion.div whileHover={{ scale: 1.03 }}><RoomsCard /></motion.div>
            </motion.div>

            <motion.div style={{ display: "flex", flexDirection: "column", gap: 14, y: yColC as any }} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}>
              <motion.div whileHover={{ scale: 1.03 }}><OccCard /></motion.div>
              <motion.div whileHover={{ scale: 1.03 }}><ReviewCard /></motion.div>
            </motion.div>
          </div>

          {/* MOBILE: Rearranged layout (hidden on desktop, shown on small screens) */}
          <div className="mobile-rearranged-layout" style={{ display: "none", flexDirection: "column", gap: 24 }}>
            {/* Top row: DormCard and RoomsCard side by side */}
            <div className="top-row-cards" style={{ display: "flex", gap: 16, justifyContent: "center" }}>
              <motion.div style={{ y: yColA as any }} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                <DormCard name="Kamia Residence" subtitle="Hall" meta="Studio · 22 m² · On-campus" price={3200} priceUnit="/ month" featured chips={["WiFi", "Furnished", "Air-con"]} rating={4.9} verified onView={() => {}} />
              </motion.div>

              <motion.div className="rooms-card-wrapper" style={{ position: "relative", paddingTop: 0, y: yColB as any }} initial={{ opacity: 0, y: 60 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}>
                <TagsCloud />
                <motion.div whileHover={{ scale: 1.03 }}><RoomsCard /></motion.div>
              </motion.div>
            </div>

            {/* Bottom row: OccCard and ReviewCard side by side */}
            <div className="bottom-row-cards" style={{ display: "flex", gap: 16, justifyContent: "center" }}>
              <motion.div whileHover={{ scale: 1.03 }} style={{ y: yColC as any, width: "100%" }} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}>
                <OccCard />
              </motion.div>
              <motion.div whileHover={{ scale: 1.03 }} style={{ y: yColC as any, width: "100%" }} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}>
                <ReviewCard />
              </motion.div>
            </div>
          </div>

        </div>
      </section>
    </>
  );
}