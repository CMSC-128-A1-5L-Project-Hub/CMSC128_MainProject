// src/components/SeeMoreModal.tsx
import { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import type { KeyboardEvent } from "react";

const PRESET_TAGS = [
  "Parking", "Pet-friendly", "With Kitchen", "With Bathroom",
  "Near Church", "Near Market", "Study Room", "CCTV",
  "24/7 Security", "With Elevator", "Garden", "Rooftop",
];

interface Props {
  open: boolean;
  onClose: () => void;
  extraTags: string[];
  setExtraTags: (tags: string[]) => void;
}

export default function SeeMoreModal({ open, onClose, extraTags, setExtraTags }: Props) {
  const [customInput, setCustomInput] = useState("");
  const [customList, setCustomList] = useState<string[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => { if (open) setSelected(extraTags); }, [open]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: globalThis.KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const toggle = (tag: string) =>
    setSelected(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);

  const addCustom = () => {
    const t = customInput.trim();
    if (!t || customList.includes(t) || PRESET_TAGS.includes(t)) return;
    setCustomList(prev => [...prev, t]);
    setSelected(prev => [...prev, t]);
    setCustomInput("");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => { if (e.key === "Enter") addCustom(); };
  const handleApply = () => { setExtraTags(selected); onClose(); };
  const handleReset = () => { setSelected([]); setCustomList([]); setCustomInput(""); };

  const allTags = [...PRESET_TAGS, ...customList];

  if (!mounted) return null;

  const content = (
    <>
      {/* Backdrop */}
      <div
        aria-hidden="true"
        onClick={onClose}
        style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          zIndex: 9998,
          background: "rgba(10,2,6,0.72)",
          backdropFilter: open ? "blur(8px)" : "blur(0px)",
          WebkitBackdropFilter: open ? "blur(8px)" : "blur(0px)",
          opacity: open ? 1 : 0,
          pointerEvents: open ? "all" : "none",
          transition: "opacity 0.3s ease, backdrop-filter 0.3s ease",
        }}
      />

      {/* Centering container */}
      <div
        role="dialog"
        aria-modal="true"
        style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          zIndex: 9999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          // Generous but not excessive padding — keeps card from touching edges
          padding: "clamp(10px, 4vw, 24px)",
          boxSizing: "border-box",
          pointerEvents: open ? "all" : "none",
        }}
        onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      >
        {/* Modal card */}
        <div
          style={{
            width: "100%",
            maxWidth: 580,
            background: "#fff",
            borderRadius: 24,
            overflow: "hidden",
            boxShadow: "0 40px 100px rgba(26,10,15,0.55), 0 8px 32px rgba(26,10,15,0.25)",
            opacity: open ? 1 : 0,
            transform: open ? "translateY(0) scale(1)" : "translateY(32px) scale(0.95)",
            transition: "opacity 0.35s cubic-bezier(0.4,0,0.2,1), transform 0.35s cubic-bezier(0.4,0,0.2,1)",
          }}
        >
          {/* ── Maroon header ── */}
          <div
            style={{
              position: "relative",           // ← critical: keeps × inside
              overflow: "hidden",
              background: "linear-gradient(135deg, #8C1535 0%, #3D0718 100%)",
              // Generous vertical padding; horizontal has room for the × button
              padding: "28px 60px 28px 32px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {/* Grid texture */}
            <div
              aria-hidden="true"
              style={{
                position: "absolute", inset: 0,
                backgroundImage:
                  "linear-gradient(rgba(255,255,255,.05) 1px,transparent 1px)," +
                  "linear-gradient(90deg,rgba(255,255,255,.05) 1px,transparent 1px)",
                backgroundSize: "28px 28px",
                pointerEvents: "none",
              }}
            />
            {/* Gold glow */}
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                top: "-60px", right: "10%",
                width: 200, height: 200,
                background: "radial-gradient(circle, rgba(201,151,58,0.14) 0%, transparent 65%)",
                pointerEvents: "none",
              }}
            />

            {/* Title block */}
            <div style={{ position: "relative", zIndex: 2, textAlign: "center" }}>
              <p
                style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: 9,
                  fontWeight: 700,
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.5)",
                  marginBottom: 8,
                  margin: "0 0 8px",
                }}
              >
                SEARCH FILTERS
              </p>
              <h2
                style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: "clamp(20px, 5vw, 26px)",
                  fontWeight: 800,
                  color: "#fff",
                  letterSpacing: "0.04em",
                  lineHeight: 1,
                  textTransform: "uppercase",
                  margin: 0,
                }}
              >
                More Filters
              </h2>
            </div>

            {/* ── Circular × — contained within header ── */}
            <button
              onClick={onClose}
              aria-label="Close modal"
              style={{
                position: "absolute",
                top: 16,
                right: 16,
                zIndex: 3,
                width: 36,
                height: 36,
                flexShrink: 0,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.15)",
                border: "1.5px solid rgba(255,255,255,0.30)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "rgba(255,255,255,0.9)",
                fontSize: 20,
                lineHeight: 1,
                padding: 0,
                transition: "background 0.2s, transform 0.2s",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.28)";
                (e.currentTarget as HTMLElement).style.transform = "scale(1.1)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.15)";
                (e.currentTarget as HTMLElement).style.transform = "scale(1)";
              }}
            >
              ×
            </button>
          </div>

          {/* ── Body ── */}
          <div
            style={{
              // Generous, responsive padding — clamp gives mobile-friendly values
              padding: "clamp(16px, 4vw, 28px)",
              maxHeight: "52vh",
              overflowY: "auto",
            }}
          >
            <p
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: 9,
                fontWeight: 700,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "#9A7080",
                marginBottom: 14,
                margin: "0 0 14px",
              }}
            >
              Select Filters
            </p>

            {/* Tag grid */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 24 }}>
              {allTags.map(tag => {
                const isActive = selected.includes(tag);
                const isCustom = customList.includes(tag);
                return (
                  <button
                    key={tag}
                    onClick={() => toggle(tag)}
                    style={{
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      fontSize: 13,
                      fontWeight: 600,
                      padding: "9px 18px",
                      borderRadius: 999,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      transition: "all 0.2s",
                      background: isActive
                        ? "linear-gradient(135deg,#6B0F2B,#3D0718)"
                        : isCustom
                          ? "rgba(107,15,43,0.05)"
                          : "#f5f0f2",
                      color: isActive ? "#fff" : "#5A3040",
                      border: isActive
                        ? "none"
                        : isCustom
                          ? "1.5px dashed #B5344F"
                          : "1.5px solid #e8dfe3",
                      boxShadow: isActive ? "0 4px 14px rgba(107,15,43,0.28)" : "none",
                      transform: isActive ? "scale(1.04)" : "scale(1)",
                    }}
                  >
                    {tag}
                    {isActive && <span style={{ fontSize: 10, opacity: 0.75 }}>✓</span>}
                  </button>
                );
              })}
            </div>

            {/* Divider */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <div style={{ flex: 1, height: 1, background: "rgba(107,15,43,0.1)" }} />
              <span
                style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: 9,
                  fontWeight: 700,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "#9A7080",
                  whiteSpace: "nowrap",
                }}
              >
                Add Your Own
              </span>
              <div style={{ flex: 1, height: 1, background: "rgba(107,15,43,0.1)" }} />
            </div>

            {/* Custom input */}
            <div style={{ display: "flex", gap: 10 }}>
              <input
                value={customInput}
                onChange={e => setCustomInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder='e.g. "Near Gym", "With Desk"…'
                style={{
                  flex: 1,
                  padding: "11px 16px",
                  borderRadius: 12,
                  fontSize: 13,
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  color: "#1A0A0F",
                  border: "1.5px solid rgba(107,15,43,0.15)",
                  background: "#fdf8fa",
                  outline: "none",
                  transition: "border-color 0.2s, box-shadow 0.2s",
                  minWidth: 0,        // ← prevents flex overflow
                }}
                onFocus={e => {
                  e.currentTarget.style.borderColor = "#6B0F2B";
                  e.currentTarget.style.boxShadow = "0 0 0 3px rgba(107,15,43,0.08)";
                }}
                onBlur={e => {
                  e.currentTarget.style.borderColor = "rgba(107,15,43,0.15)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              />
              <button
                onClick={addCustom}
                style={{
                  flexShrink: 0,
                  padding: "11px 22px",
                  borderRadius: 12,
                  border: "none",
                  cursor: "pointer",
                  fontSize: 13,
                  fontWeight: 700,
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  color: "#fff",
                  background: "linear-gradient(135deg,#6B0F2B,#3D0718)",
                  boxShadow: "0 4px 14px rgba(107,15,43,0.28)",
                  transition: "transform 0.15s",
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "scale(1.05)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "scale(1)"; }}
              >
                Add
              </button>
            </div>
          </div>

          {/* ── Footer ── */}
          <div
            style={{
              padding: "16px clamp(16px, 4vw, 28px) 22px",
              borderTop: "1px solid rgba(107,15,43,0.08)",
              display: "flex",
              flexWrap: "wrap",       // ← wraps on very narrow screens
              alignItems: "center",
              gap: 12,
            }}
          >
            <span
              style={{
                flex: 1,
                minWidth: 100,        // ← prevents squishing
                fontSize: 12,
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                color: "#9A7080",
              }}
            >
              {selected.length > 0
                ? <><strong style={{ color: "#6B0F2B" }}>{selected.length}</strong> filter{selected.length !== 1 ? "s" : ""} selected</>
                : "No filters selected"}
            </span>

            <button
              onClick={handleReset}
              style={{
                flexShrink: 0,
                padding: "10px 22px",
                borderRadius: 999,
                fontSize: 13,
                fontWeight: 600,
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                border: "1.5px solid rgba(107,15,43,0.2)",
                background: "transparent",
                color: "#5A3040",
                cursor: "pointer",
                transition: "border-color 0.2s, color 0.2s",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.borderColor = "#6B0F2B";
                (e.currentTarget as HTMLElement).style.color = "#6B0F2B";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(107,15,43,0.2)";
                (e.currentTarget as HTMLElement).style.color = "#5A3040";
              }}
            >
              Reset
            </button>

            <button
              onClick={handleApply}
              style={{
                flexShrink: 0,
                padding: "10px 28px",
                borderRadius: 999,
                border: "none",
                fontSize: 13,
                fontWeight: 700,
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                color: "#fff",
                cursor: "pointer",
                background: "linear-gradient(135deg,#6B0F2B,#3D0718)",
                boxShadow: "0 6px 20px rgba(107,15,43,0.35)",
                transition: "transform 0.2s, box-shadow 0.2s",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.transform = "translateY(-1px) scale(1.03)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.transform = "translateY(0) scale(1)";
              }}
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>
    </>
  );

  return typeof document !== "undefined"
    ? ReactDOM.createPortal(content, document.body)
    : null;
}