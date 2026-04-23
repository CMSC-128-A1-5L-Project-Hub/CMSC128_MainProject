"use client";

import { useEffect, useState } from "react";
import ReactDOM from "react-dom";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  eyebrow?: string;
  /** Max width of the modal card in px (default 560) */
  maxWidth?: number | string;
  /** Optional footer slot — rendered below the body */
  maxHeight?: number;
  footer?: React.ReactNode;
}

export function Modal({
  open,
  onClose,
  children,
  title,
  eyebrow,
  maxWidth = 560,
  maxHeight= 560,
  footer,
}: ModalProps) {
  const [mounted, setMounted] = useState(false);

  // Mount check (for Next.js / SSR)
  useEffect(() => setMounted(true), []);

  // Lock scroll
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!mounted) return null;

  const content = (
    <>
      {/* BACKDROP */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-[9998] bg-[rgba(10,2,6,0.72)] transition-all duration-300
          ${
            open
              ? "opacity-100 backdrop-blur-[8px]"
              : "opacity-0 backdrop-blur-0 pointer-events-none"
          }
        `}
      />

      {/* SHELL */}
      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.target === e.currentTarget && onClose()}
        className={`fixed inset-0 z-[9999] flex items-center justify-center p-5
          ${open ? "pointer-events-auto" : "pointer-events-none"}
        `}
      >
        {/* CARD */}
        <div
          style={{
            width: "100%",
            maxWidth: typeof maxWidth === "number" ? `${maxWidth}px` : maxWidth,
            maxHeight: "70vh",
            overflowY: "auto",
            display:"flex",
            flexDirection: "column",
            background: "#fff",
            borderRadius: 24,
            overflow: "hidden",
            boxShadow:
              "0 40px 100px rgba(26,10,15,0.55), 0 8px 32px rgba(26,10,15,0.25)",
            opacity:   open ? 1 : 0,
            transform: open ? "translateY(0) scale(1)" : "translateY(32px) scale(0.95)",
            transition:
              "opacity 0.35s cubic-bezier(0.4,0,0.2,1), transform 0.35s cubic-bezier(0.4,0,0.2,1)",
          }}
          className={` w-full bg-white rounded-[24px] overflow-hidden shadow-[0_40px_100px_rgba(26,10,15,0.55),0_8px_32px_rgba(26,10,15,0.25)] transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]
            ${
              open
                ? "opacity-100 translate-y-0 scale-100"
                : "opacity-0 translate-y-8 scale-95"
            }
          `}
        >
          {/* HEADER */}
          {(title || eyebrow) && (
            <div className="relative flex items-center justify-center px-8 py-7 overflow-hidden bg-gradient-to-br from-[#8C1535] to-[#3D0718]">
              
              {/* GRID */}
              <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(255,255,255,.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.05)_1px,transparent_1px)] bg-[size:28px_28px]" />

              {/* GLOW */}
              <div className="absolute -top-[60px] right-[10%] w-[200px] h-[200px] pointer-events-none bg-[radial-gradient(circle,rgba(201,151,58,0.14)_0%,transparent_65%)]" />

              {/* TITLE */}
              <div className="relative z-10 flex-1 text-center">
                {eyebrow && (
                  <p className="text-[9px] font-bold tracking-[0.22em] uppercase text-white/50 mb-2 font-['Plus_Jakarta_Sans']">
                    {eyebrow}
                  </p>
                )}
                {title && (
                  <h2
                  className="text-[22px] font-extrabold tracking-[0.06em] uppercase text-white leading-none font-['Plus_Jakarta_Sans']"  
                  style={{
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      fontSize: "clamp(16px, 2vw, 22px)",
                      fontWeight: 800,
                      color: "#fff",
                      letterSpacing: "0.06em",
                      lineHeight: 1,
                      textTransform: "uppercase",
                    }}
                  >
                    {title}
                  </h2>
                )}
              </div>

              {/* CLOSE BUTTON */}
              <button
                  onClick={onClose}
                  aria-label="Close modal"
                  className="
                      absolute top-4 right-4 z-20
                      w-9 h-9 rounded-full
                      flex items-center justify-center flex-shrink-0
                      bg-white/15 border border-white/30
                      text-white
                      transition-all duration-200
                      hover:bg-white/30 hover:scale-110
                  "
              >
                  ✕
              </button>
            </div>
          )}

          {/* ── Body ── */}
          <div
            className="px-7 py-6 max-h-[52vh] overflow-y-auto flex-1 min-h-0"
            style={{
              padding: "24px 28px",
              maxHeight: "70vh",
              overflowY: "auto",
              position: "relative",
            }}
          >
            {children}
          </div>

          {/* FOOTER */}
          {footer && (
            <div className="px-7 pt-4 pb-5 border-t border-[#6B0F2B]/10 flex items-center gap-3">
              {footer}
            </div>
          )}
        </div>
      </div>
    </>
  );

  return ReactDOM.createPortal(content, document.body);
}

export default Modal;