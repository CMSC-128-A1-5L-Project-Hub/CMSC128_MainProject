import { useState, useEffect, useRef } from "react";
import { api } from "../../api/axios";
import { useNavigate } from "react-router-dom";

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  speedX: number;
  speedY: number;
  color: string;
}

export default function UBLEFooter() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [scrolled, setScrolled] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const heroRef = useRef<HTMLDivElement>(null);
  const animFrameRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    try {
      setSending(true);
      setSent(false);

      await api.post("/support/contact", form);

      setForm({ name: "", email: "", message: "" });
      setSent(true);
    } catch (error) {
      console.error("Failed to send support message:", error);
    } finally {
      setSending(false);
    }
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);

    if (el) {
      el.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  // Scroll-triggered reveal with better detection
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setScrolled(true);
          setTimeout(() => {
            if (heroRef.current) observer.unobserve(heroRef.current);
          }, 1000);
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -100px 0px" }
    );
    if (heroRef.current) observer.observe(heroRef.current);
    return () => observer.disconnect();
  }, []);

  // Floating particles
  useEffect(() => {
    const colors = ["#c9a84c", "#e8c05c", "#f0d080", "#ffffff", "#d4a840"];
    const initial: Particle[] = Array.from({ length: 28 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      opacity: Math.random() * 0.35 + 0.08,
      speedX: (Math.random() - 0.5) * 0.018,
      speedY: (Math.random() - 0.5) * 0.012,
      color: colors[Math.floor(Math.random() * colors.length)],
    }));
    particlesRef.current = initial;
    setParticles([...initial]);

    const animate = () => {
      particlesRef.current = particlesRef.current.map(p => {
        let nx = p.x + p.speedX;
        let ny = p.y + p.speedY;
        if (nx < 0) nx = 100;
        if (nx > 100) nx = 0;
        if (ny < 0) ny = 100;
        if (ny > 100) ny = 0;
        return { ...p, x: nx, y: ny };
      });
      setParticles([...particlesRef.current]);
      animFrameRef.current = requestAnimationFrame(animate);
    };
    animFrameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, []);

  const inputStyle: React.CSSProperties = {
    width: "100%",
    boxSizing: "border-box",
    padding: "12px 16px",
    borderRadius: 8,
    background: "rgba(255,255,255,0.07)",
    border: "1px solid rgba(255,255,255,0.1)",
    color: "white",
    fontSize: 13,
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    outline: "none",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    color: "rgba(255,255,255,0.5)",
    fontSize: 11,
    letterSpacing: "0.12em",
    marginBottom: 6,
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  };

  return (
    <div id="support" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", margin: 0, padding: 0 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamont:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600;1,700&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
        
        @keyframes shimmer {
          0%   { background-position: -400% center; }
          100% { background-position: 400% center; }
        }
        @keyframes diamondPulse {
          0%, 100% { transform: rotate(45deg) scale(1); opacity: 0.9; }
          50%       { transform: rotate(45deg) scale(1.3); opacity: 1; }
        }
        @keyframes glowPulse {
          0% { text-shadow: 0 0 0px rgba(201,168,76,0); }
          100% { text-shadow: 0 0 20px rgba(201,168,76,0.6), 0 0 40px rgba(201,168,76,0.3); }
        }

        /* Mobile responsive stacking */
        @media (max-width: 768px) {
          .footer-grid {
            display: grid !important;
            grid-template-columns: 1fr !important;
            gap: 48px !important;
          }
          
          /* Make Quick Links and Resources side by side */
          .links-row {
            display: grid !important;
            grid-template-columns: 1fr 1fr !important;
            gap: 32px !important;
            grid-column: 1 / -1 !important;
          }
          
          /* Expand brand description text on mobile */
          .brand-description {
            max-width: 100% !important;
          }
          
          .bottom-bar {
            flex-direction: column !important;
            text-align: center !important;
            gap: 12px !important;
          }
          
          .footer-padding {
            padding: 64px 24px 56px !important;
          }
        }
      `}</style>

      {/* ── HERO + FOOTER seamless block ── */}
      <div style={{
        background: `
          radial-gradient(ellipse 70% 50% at 18% 25%, rgba(185,35,80,0.65) 0%, transparent 60%),
          radial-gradient(ellipse 55% 45% at 82% 22%, rgba(140,22,58,0.4) 0%, transparent 55%),
          radial-gradient(ellipse 60% 55% at 14% 75%, rgba(155,22,60,0.32) 0%, transparent 50%),
          radial-gradient(ellipse 40% 40% at 85% 70%, rgba(120,15,45,0.2) 0%, transparent 50%),
          linear-gradient(180deg,
            #6e1530 0%, #7e1838 8%, #8f1d40 14%, #7a1535 22%,
            #5a1025 32%, #3d0d1a 44%, #2a0812 56%,
            #1e0610 70%, #15040c 82%, #0f0309 100%
          )
        `,
        position: "relative",
      }}>

        {/* ── HERO QUOTE SECTION ── */}
        <div ref={heroRef} style={{
          minHeight: 520,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
          padding: "150px 20px 120px",
        }}>
          {/* Floating particles */}
          {particles.map(p => (
            <div key={p.id} style={{
              position: "absolute",
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: p.size,
              height: p.size,
              borderRadius: "50%",
              background: p.color,
              opacity: p.opacity,
              pointerEvents: "none",
              transition: "left 0.1s linear, top 0.1s linear",
            }} />
          ))}

          {/* Top divider line */}
          <div style={{
            position: "absolute",
            top: 120,
            left: "50%",
            transform: scrolled ? "translateX(-50%) scaleX(1)" : "translateX(-50%) scaleX(0)",
            display: "flex",
            alignItems: "center",
            width: 420,
            opacity: scrolled ? 1 : 0,
            transition: "transform 0.8s cubic-bezier(0.34, 1.2, 0.64, 1), opacity 0.6s ease",
            transformOrigin: "center",
          }}>
            <div style={{
              width: 8, height: 8, flexShrink: 0,
              background: "linear-gradient(135deg, #f5d67a, #b8861c)",
              transform: scrolled ? "rotate(45deg) scale(1)" : "rotate(45deg) scale(0)",
              boxShadow: "0 0 6px rgba(201,168,76,0.8), 0 0 12px rgba(201,168,76,0.4)",
              animation: scrolled ? "diamondPulse 2.5s ease-in-out infinite" : "none",
              transition: "transform 0.5s cubic-bezier(0.34, 1.2, 0.64, 1) 0.1s",
            }} />
            <div style={{ flex: 1, height: 1, marginLeft: 10, marginRight: 10, position: "relative", overflow: "hidden" }}>
              <div style={{
                position: "absolute", inset: 0,
                background: "linear-gradient(to right, rgba(201,168,76,0.2), rgba(245,214,122,0.7), rgba(201,168,76,0.9), rgba(245,214,122,0.7), rgba(201,168,76,0.2))",
              }} />
              <div style={{
                position: "absolute", inset: 0,
                background: "linear-gradient(90deg, transparent 0%, rgba(255,255,240,0.9) 50%, transparent 100%)",
                backgroundSize: "200% 100%",
                animation: scrolled ? "shimmer 3s linear infinite" : "none",
              }} />
            </div>
            <div style={{
              width: 8, height: 8, flexShrink: 0,
              background: "linear-gradient(135deg, #f5d67a, #b8861c)",
              transform: scrolled ? "rotate(45deg) scale(1)" : "rotate(45deg) scale(0)",
              boxShadow: "0 0 6px rgba(201,168,76,0.8), 0 0 12px rgba(201,168,76,0.4)",
              animation: scrolled ? "diamondPulse 2.5s ease-in-out infinite 1.25s" : "none",
              transition: "transform 0.5s cubic-bezier(0.34, 1.2, 0.64, 1) 0.2s",
            }} />
          </div>

          {/* Corner brackets */}
          <div style={{ 
            position: "absolute", top: 60, left: 40, width: 30, height: 30, 
            borderTop: "1px solid rgba(255,255,255,0.22)", 
            borderLeft: "1px solid rgba(255,255,255,0.22)",
            opacity: scrolled ? 1 : 0,
            transform: scrolled ? "scale(1)" : "scale(0.5)",
            transition: "opacity 0.6s ease 0.2s, transform 0.6s cubic-bezier(0.34, 1.2, 0.64, 1) 0.2s",
          }} />
          <div style={{ 
            position: "absolute", bottom: 80, right: 40, width: 30, height: 30, 
            borderBottom: "1px solid rgba(255,255,255,0.22)", 
            borderRight: "1px solid rgba(255,255,255,0.22)",
            opacity: scrolled ? 1 : 0,
            transform: scrolled ? "scale(1)" : "scale(0.5)",
            transition: "opacity 0.6s ease 0.3s, transform 0.6s cubic-bezier(0.34, 1.2, 0.64, 1) 0.3s",
          }} />
          <div style={{ 
            position: "absolute", bottom: 80, left: 40, width: 20, height: 20, 
            borderBottom: "1px solid rgba(255,255,255,0.13)", 
            borderLeft: "1px solid rgba(255,255,255,0.13)",
            opacity: scrolled ? 1 : 0,
            transform: scrolled ? "scale(1)" : "scale(0.5)",
            transition: "opacity 0.6s ease 0.4s, transform 0.6s cubic-bezier(0.34, 1.2, 0.64, 1) 0.4s",
          }} />
          <div style={{ 
            position: "absolute", top: 60, right: 40, width: 20, height: 20, 
            borderTop: "1px solid rgba(255,255,255,0.13)", 
            borderRight: "1px solid rgba(255,255,255,0.13)",
            opacity: scrolled ? 1 : 0,
            transform: scrolled ? "scale(1)" : "scale(0.5)",
            transition: "opacity 0.6s ease 0.5s, transform 0.6s cubic-bezier(0.34, 1.2, 0.64, 1) 0.5s",
          }} />

          {/* Quote text */}
          <div style={{ textAlign: "center", position: "relative", zIndex: 1 }}>
            <h1 style={{
              color: "white",
              fontSize: "clamp(32px,4.5vw,52px)",
              fontWeight: 500,
              lineHeight: 1.3,
              margin: "0 0 8px",
              fontFamily: "'Cormorant Garamont', serif",
              opacity: scrolled ? 1 : 0,
              transform: scrolled ? "translateY(0) scale(1)" : "translateY(60px) scale(0.9)",
              transition: "opacity 0.9s cubic-bezier(0.22, 1, 0.36, 1), transform 0.9s cubic-bezier(0.34, 1.2, 0.64, 1)",
              letterSpacing: scrolled ? "normal" : "2px",
              transitionDelay: "0.1s",
            }}>
              Great things happen<br />when you feel
            </h1>
            <h1 style={{
              color: "#c9a84c",
              fontSize: "clamp(32px,4.5vw,52px)",
              fontWeight: 500,
              fontStyle: "italic",
              lineHeight: 1.3,
              margin: 0,
              fontFamily: "'Cormorant Garamont', serif",
              opacity: scrolled ? 1 : 0,
              transform: scrolled ? "translateY(0) scale(1)" : "translateY(60px) scale(0.9)",
              transition: "opacity 0.9s cubic-bezier(0.22, 1, 0.36, 1), transform 0.9s cubic-bezier(0.34, 1.2, 0.64, 1)",
              transitionDelay: "0.25s",
              animation: scrolled ? "glowPulse 2s ease-out forwards" : "none",
            }}>
              at home.
            </h1>

            {/* Center divider */}
            <div style={{
              width: 340,
              margin: "40px auto 24px",
              display: "flex",
              alignItems: "center",
              gap: 10,
              opacity: scrolled ? 1 : 0,
              transform: scrolled ? "scaleX(1)" : "scaleX(0.8)",
              transition: "opacity 0.7s ease 0.5s, transform 0.7s cubic-bezier(0.34, 1.2, 0.64, 1) 0.5s",
              transformOrigin: "center",
            }}>
              <div style={{ flex: 1, height: 1, position: "relative", overflow: "hidden" }}>
                <div style={{
                  position: "absolute", inset: 0,
                  background: "linear-gradient(to right, transparent, rgba(201,168,76,0.5), rgba(245,214,122,0.85))",
                }} />
                <div style={{
                  position: "absolute", inset: 0,
                  background: "linear-gradient(90deg, transparent 0%, rgba(255,255,240,0.8) 50%, transparent 100%)",
                  backgroundSize: "200% 100%",
                  animation: scrolled ? "shimmer 4s linear infinite 1s" : "none",
                }} />
              </div>
              <div style={{
                width: 6, height: 6, flexShrink: 0,
                background: "linear-gradient(135deg, #f5d67a, #c9a84c)",
                transform: scrolled ? "rotate(45deg) scale(1)" : "rotate(45deg) scale(0)",
                boxShadow: "0 0 5px rgba(201,168,76,0.9), 0 0 10px rgba(201,168,76,0.5)",
                transition: "transform 0.5s cubic-bezier(0.34, 1.2, 0.64, 1) 0.6s",
              }} />
              <div style={{ flex: 1, height: 1, position: "relative", overflow: "hidden" }}>
                <div style={{
                  position: "absolute", inset: 0,
                  background: "linear-gradient(to left, transparent, rgba(201,168,76,0.5), rgba(245,214,122,0.85))",
                }} />
                <div style={{
                  position: "absolute", inset: 0,
                  background: "linear-gradient(90deg, transparent 0%, rgba(255,255,240,0.8) 50%, transparent 100%)",
                  backgroundSize: "200% 100%",
                  animation: scrolled ? "shimmer 4s linear infinite 1s" : "none",
                }} />
              </div>
            </div>

            <p style={{
              color: "rgba(255,255,255,0.5)",
              fontSize: 13,
              letterSpacing: "0.13em",
              margin: 0,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              opacity: scrolled ? 1 : 0,
              transform: scrolled ? "translateY(0)" : "translateY(20px)",
              transition: "opacity 0.7s ease 0.7s, transform 0.7s cubic-bezier(0.34, 1.2, 0.64, 1) 0.7s",
            }}>— UBLE</p>
          </div>
        </div>

        {/* ── FOOTER GRID ── */}
        <div className="footer-padding" style={{ padding: "64px 64px 56px" }}>
          <div className="footer-grid" style={{
            maxWidth: 1100,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "1.7fr 1fr 1fr 1.8fr",
            gap: 48,
          }}>

            {/* BRAND */}
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{
                  width: 42, height: 42, borderRadius: 10,
                  background: "linear-gradient(135deg, #d4a840, #9a7220)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "white", fontWeight: 700, fontSize: 20,
                }}>U</div>
                <span style={{ color: "white", fontSize: 20, fontWeight: 600, letterSpacing: "0.04em" }}>UBLE</span>
              </div>
              <p className="brand-description" style={{ color: "rgba(255,255,255,0.42)", fontSize: 13, lineHeight: 1.7, margin: 0, maxWidth: 215 }}>
                Trusted student housing near UPLB. Find your perfect campus home — verified, safe, and all in one place.
              </p>
              <div style={{ display: "flex", gap: 10 }}>
                {([
                  <svg key="fb" viewBox="0 0 24 24" fill="currentColor" width={14} height={14}><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>,
                  <svg key="x" viewBox="0 0 24 24" fill="currentColor" width={13} height={13}><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>,
                  <svg key="ig" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={14} height={14}><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>,
                  <svg key="li" viewBox="0 0 24 24" fill="currentColor" width={14} height={14}><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>,
                ] as React.ReactNode[]).map((icon, i) => (
                  <button key={i} style={{
                    padding: "0px",
                    width: 37, height: 37, borderRadius: "50%",
                    background: "rgba(255,255,255,0.08)", border: "none",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "rgba(255,255,255,0.52)", cursor: "pointer",
                  }}>{icon}</button>
                ))}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 4 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, color: "rgba(255,255,255,0.42)", fontSize: 12 }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={12} height={12}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                  uble@uplb.edu.ph
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, color: "rgba(255,255,255,0.42)", fontSize: 12 }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={12} height={12}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  Los Baños, Laguna, Philippines
                </div>
              </div>
            </div>

            {/* QUICK LINKS and RESOURCES wrapper for mobile */}
            <div className="links-row" style={{ display: "contents" }}>
              {/* QUICK LINKS */}
              <div>
                <h3 style={{ color: "white", fontSize: 15, fontWeight: 600, margin: "0 0 10px" }}>Quick Links</h3>
                <div style={{ height: 1, background: "linear-gradient(to right, #c9a84c 0%, transparent 80%)", marginBottom: 20 }} />
                <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 15 }}>
                  {[
                    { label: "Home", action: () => scrollToSection("home") },
                    { label: "Browse Rooms", action: () => navigate("/student/browse") },
                    { label: "About Us", action: () => scrollToSection("about") },
                    { label: "Features", action: () => scrollToSection("features") },
                    { label: "Support", action: () => scrollToSection("support") },
                    { label: "Sign In", action: () => navigate("/auth/signin") },
                  ].map((l) => (
                    <li key={l.label}>
                      <button
                        onClick={l.action}
                        style={{
                          color: "rgba(255,255,255,0.48)",
                          fontSize: 13,
                          textDecoration: "none",
                          background: "none",
                          border: "none",
                          padding: 0,
                          cursor: "pointer",
                          fontFamily: "'Plus Jakarta Sans', sans-serif",
                        }}
                      >
                        {l.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* RESOURCES */}
              <div>
                <h3 style={{ color: "white", fontSize: 15, fontWeight: 600, margin: "0 0 10px" }}>Resources</h3>
                <div style={{ height: 1, background: "linear-gradient(to right, #c9a84c 0%, transparent 80%)", marginBottom: 20 }} />
                <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 15 }}>
                  {[
                    { label: "How It Works", action: () => scrollToSection("features") },
                    { label: "For Landlords", action: () => navigate("/auth/signin") },
                    { label: "For Managers", action: () => navigate("/auth/signin") },
                    { label: "FAQs", action: () => scrollToSection("support") },
                    { label: "Privacy Policy", action: () => {} },
                    { label: "Terms of Service", action: () => {} },
                  ].map((l) => (
                    <li key={l.label}>
                      <button
                        onClick={l.action}
                        style={{
                          color: "rgba(255,255,255,0.48)",
                          fontSize: 13,
                          textDecoration: "none",
                          background: "none",
                          border: "none",
                          padding: 0,
                          cursor: "pointer",
                          fontFamily: "'Plus Jakarta Sans', sans-serif",
                        }}
                      >
                        {l.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* CONTACT */}
            <div>
              <h3 style={{ color: "white", fontSize: 15, fontWeight: 600, margin: "0 0 10px" }}>Contact Us</h3>
              <div style={{ height: 1, background: "linear-gradient(to right, #c9a84c 0%, transparent 80%)", marginBottom: 20 }} />
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div>
                  <label style={labelStyle}>NAME</label>
                  <input type="text" placeholder="Your name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>EMAIL</label>
                  <input type="email" placeholder="your.email@example.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>MESSAGE</label>
                  <textarea placeholder="How can we help you?" rows={4} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} style={{ ...inputStyle, resize: "none" }} />
                </div>
                <button
                  onClick={handleSubmit}
                  disabled={sending}
                  style={{
                    padding: "13px 28px",
                    borderRadius: 999,
                    background: "linear-gradient(135deg, #e8c05c, #c8a03a)",
                    border: "none",
                    cursor: sending ? "not-allowed" : "pointer",
                    color: "#2e0610",
                    fontWeight: 700,
                    fontSize: 14,
                    alignSelf: "flex-start",
                    opacity: sending ? 0.7 : 1,
                  }}
                >
                  {sending ? "Sending..." : "Send Message"}
                </button>
                {sent && (
                  <p style={{ color: "#c9a84c", fontSize: 12, margin: 0 }}>
                    Message sent successfully.
                  </p>
                )}
                <p style={{ color: "rgba(255,255,255,0.32)", fontSize: 12, margin: 0 }}>
                  Or email us directly at:{" "}
                  <a href="mailto:uble@uplb.edu.ph" style={{ color: "#c9a84c", textDecoration: "none" }}>uble@uplb.edu.ph</a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── BOTTOM BAR ── */}
      <div className="bottom-bar" style={{
        background: "#3a0a14",
        padding: "18px 64px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <p style={{ color: "rgba(255,255,255,0.28)", fontSize: 12, margin: 0 }}>© 2026 UBLE. All rights reserved.</p>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          {["Terms of Service", "Privacy Policy", "Cookie Policy"].map((l, i) => (
            <span key={l} style={{ display: "flex", alignItems: "center", gap: 14 }}>
              {i > 0 && <span style={{ color: "rgba(255,255,255,0.22)", fontSize: 8 }}>●</span>}
              <a href="#" style={{ color: "rgba(255,255,255,0.28)", fontSize: 12, textDecoration: "none" }}>{l}</a>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}