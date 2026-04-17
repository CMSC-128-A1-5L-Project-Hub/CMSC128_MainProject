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
        className={`
          fixed inset-0 z-[9998]
          transition-all duration-300 ease-out
          ${open 
            ? 'opacity-100 pointer-events-auto backdrop-blur-md' 
            : 'opacity-0 pointer-events-none backdrop-blur-none'
          }
        `}
        style={{ background: "rgba(10,2,6,0.72)" }}
      />

      {/* Centering container */}
      <div
        role="dialog"
        aria-modal="true"
        className={`
          fixed inset-0 z-[9999]
          flex items-center justify-center
          p-[clamp(10px,4vw,24px)] box-border
          ${open ? 'pointer-events-auto' : 'pointer-events-none'}
        `}
        onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      >
        {/* Modal card */}
        <div
          className={`
            w-full max-w-[580px] bg-white rounded-3xl overflow-hidden
            transition-all duration-350 ease-[cubic-bezier(0.4,0,0.2,1)]
            ${open 
              ? 'opacity-100 translate-y-0 scale-100' 
              : 'opacity-0 translate-y-8 scale-95'
            }
          `}
          style={{ boxShadow: "0 40px 100px rgba(26,10,15,0.55), 0 8px 32px rgba(26,10,15,0.25)" }}
        >
          {/* ── Maroon header ── */}
          <div className="relative overflow-hidden bg-gradient-to-br from-[#8C1535] to-[#3D0718] p-[28px_60px_28px_32px] flex items-center justify-center">
            {/* Grid texture */}
            <div
              aria-hidden="true"
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(255,255,255,.05) 1px,transparent 1px)," +
                  "linear-gradient(90deg,rgba(255,255,255,.05) 1px,transparent 1px)",
                backgroundSize: "28px 28px",
              }}
            />
            
            {/* Gold glow */}
            <div
              aria-hidden="true"
              className="absolute -top-[60px] right-[10%] w-[200px] h-[200px] pointer-events-none"
              style={{ background: "radial-gradient(circle, rgba(201,151,58,0.14) 0%, transparent 65%)" }}
            />

            {/* Title block */}
            <div className="relative z-10 text-center">
              <p className="font-['Plus_Jakarta_Sans',sans-serif] text-[9px] font-bold tracking-[0.22em] uppercase text-white/50 mb-2">
                SEARCH FILTERS
              </p>
              <h2 className="font-['Plus_Jakarta_Sans',sans-serif] text-[clamp(20px,5vw,26px)] font-extrabold text-white tracking-[0.04em] leading-none uppercase m-0">
                More Filters
              </h2>
            </div>

            {/* ── Circular × button ── */}
            <button
              onClick={onClose}
              aria-label="Close modal"
              className="absolute top-4 right-4 z-30 w-9 h-9 shrink-0 rounded-full bg-white/15 border-[1.5px] border-white/30 cursor-pointer flex items-center justify-center text-white/90 text-[20px] leading-none p-0 transition-all duration-200 hover:bg-white/28 hover:scale-110"
            >
              ×
            </button>
          </div>

          {/* ── Body ── */}
          <div className="p-[clamp(16px,4vw,28px)] max-h-[52vh] overflow-y-auto">
            <p className="font-['Plus_Jakarta_Sans',sans-serif] text-[9px] font-bold tracking-[0.14em] uppercase text-[#9A7080] mb-[14px]">
              Select Filters
            </p>

            {/* Tag grid */}
            <div className="flex flex-wrap gap-2.5 mb-6">
              {allTags.map(tag => {
                const isActive = selected.includes(tag);
                const isCustom = customList.includes(tag);
                return (
                  <button
                    key={tag}
                    onClick={() => toggle(tag)}
                    className={`
                      font-['Plus_Jakarta_Sans',sans-serif] text-[13px] font-semibold
                      py-[9px] px-[18px] rounded-full cursor-pointer flex items-center gap-1.5
                      transition-all duration-200
                      ${isActive 
                        ? 'bg-gradient-to-br from-[#6B0F2B] to-[#3D0718] text-white shadow-[0_4px_14px_rgba(107,15,43,0.28)] scale-104 border-none' 
                        : isCustom
                          ? 'bg-[rgba(107,15,43,0.05)] text-[#5A3040] border-[1.5px] border-dashed border-[#B5344F]'
                          : 'bg-[#f5f0f2] text-[#5A3040] border-[1.5px] border-[#e8dfe3]'
                      }
                    `}
                  >
                    {tag}
                    {isActive && <span className="text-[10px] opacity-75">✓</span>}
                  </button>
                );
              })}
            </div>

            {/* Divider */}
            <div className="flex items-center gap-2.5 mb-4">
              <div className="flex-1 h-px bg-[rgba(107,15,43,0.1)]" />
              <span className="font-['Plus_Jakarta_Sans',sans-serif] text-[9px] font-bold tracking-[0.14em] uppercase text-[#9A7080] whitespace-nowrap">
                Add Your Own
              </span>
              <div className="flex-1 h-px bg-[rgba(107,15,43,0.1)]" />
            </div>

            {/* Custom input */}
            <div className="flex gap-2.5">
              <input
                value={customInput}
                onChange={e => setCustomInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder='e.g. "Near Gym", "With Desk"…'
                className="flex-1 py-[11px] px-4 rounded-xl text-[13px] font-['Plus_Jakarta_Sans',sans-serif] text-[#1A0A0F] border-[1.5px] border-[rgba(107,15,43,0.15)] bg-[#fdf8fa] outline-none transition-all duration-200 focus:border-[#6B0F2B] focus:shadow-[0_0_0_3px_rgba(107,15,43,0.08)] min-w-0"
              />
              <button
                onClick={addCustom}
                className="shrink-0 py-[11px] px-[22px] rounded-xl border-none cursor-pointer text-[13px] font-bold font-['Plus_Jakarta_Sans',sans-serif] text-white bg-gradient-to-br from-[#6B0F2B] to-[#3D0718] shadow-[0_4px_14px_rgba(107,15,43,0.28)] transition-transform duration-150 hover:scale-105"
              >
                Add
              </button>
            </div>
          </div>

          {/* ── Footer ── */}
          <div className="p-[16px_clamp(16px,4vw,28px)_22px] border-t border-[rgba(107,15,43,0.08)] flex flex-wrap items-center gap-3">
            <span className="flex-1 min-w-[100px] text-xs font-['Plus_Jakarta_Sans',sans-serif] text-[#9A7080]">
              {selected.length > 0
                ? <><strong className="text-[#6B0F2B]">{selected.length}</strong> filter{selected.length !== 1 ? "s" : ""} selected</>
                : "No filters selected"}
            </span>

            <button
              onClick={handleReset}
              className="shrink-0 py-2.5 px-[22px] rounded-full text-[13px] font-semibold font-['Plus_Jakarta_Sans',sans-serif] border-[1.5px] border-[rgba(107,15,43,0.2)] bg-transparent text-[#5A3040] cursor-pointer transition-all duration-200 hover:border-[#6B0F2B] hover:text-[#6B0F2B]"
            >
              Reset
            </button>

            <button
              onClick={handleApply}
              className="shrink-0 py-2.5 px-7 rounded-full border-none text-[13px] font-bold font-['Plus_Jakarta_Sans',sans-serif] text-white cursor-pointer bg-gradient-to-br from-[#6B0F2B] to-[#3D0718] shadow-[0_6px_20px_rgba(107,15,43,0.35)] transition-all duration-200 hover:-translate-y-px hover:scale-103"
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