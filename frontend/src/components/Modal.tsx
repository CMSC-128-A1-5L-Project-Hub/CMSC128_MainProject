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
  /* Max height (optional) default 560 (same as width) */
  maxHeight?: number | string;
  /** Optional footer slot — rendered below the body */
  footer?: React.ReactNode;
}

export function Modal({
  open,
  onClose,
  children,
  title,
  eyebrow,
  maxWidth = 560,
  maxHeight = 560,
  footer,
}: ModalProps) {
  const [mounted, setMounted] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);

  // Mount check (for Next.js / SSR)
  useEffect(() => setMounted(true), []);

  // Handle animation timing
  useEffect(() => {
    if (open) {
      // Reset animation-out flag
      setIsAnimatingOut(false);
      // Render the modal first (hidden)
      setShouldRender(true);
      // Use setTimeout to ensure DOM is ready before showing
      const showTimer = setTimeout(() => {
        setIsVisible(true);
      }, 10);
      return () => clearTimeout(showTimer);
    } else {
      // Start closing animation
      setIsVisible(false);
      setIsAnimatingOut(true);
      // Wait for animation to complete before unmounting
      const hideTimer = setTimeout(() => {
        setShouldRender(false);
        setIsAnimatingOut(false);
      }, 350); // Slightly longer than transition
      return () => clearTimeout(hideTimer);
    }
  }, [open]);

  // Body scroll lock
  useEffect(() => {
    if (open && shouldRender) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = "hidden";
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    } else {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    };
  }, [open, shouldRender]);

  if (!mounted || !shouldRender) return null;

  const content = (
    <>
      {/* BACKDROP */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9998,
          backgroundColor: isVisible ? "rgba(10,2,6,0.72)" : "rgba(10,2,6,0)",
          backdropFilter: isVisible ? "blur(8px)" : "blur(0px)",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          pointerEvents: isVisible ? "auto" : "none",
        }}
      />

      {/* SHELL */}
      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.target === e.currentTarget && onClose()}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
          pointerEvents: isVisible ? "auto" : "none",
        }}
      >
        {/* CARD */}
        <div
          style={{
            width: "100%",
            maxWidth: typeof maxWidth === "number" ? `${maxWidth}px` : maxWidth,
            maxHeight: maxHeight === "fit-content" ? "fit-content" : typeof maxHeight === "number" ? `${maxHeight}px` : maxHeight,
            display: "flex",
            flexDirection: "column",
            background: "#fff",
            borderRadius: 24,
            overflow: "hidden",
            boxShadow: "0 40px 100px rgba(26,10,15,0.55), 0 8px 32px rgba(26,10,15,0.25)",
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? "translateY(0) scale(1)" : "translateY(32px) scale(0.95)",
            transition: "opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1), transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
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

          {/* BODY */}
          <div
            style={{
              padding: "24px 28px",
              maxHeight: maxHeight === "fit-content" ? "none" : "calc(70vh - 120px)",
              overflowY: maxHeight === "fit-content" ? "visible" : "auto",
              position: "relative",
              flex: 1,
              minHeight: 0,
            }}
          >
            {children}
          </div>

          {/* FOOTER */}
          {footer && (
            <div style={{
              padding: "16px 28px 20px 28px",
              borderTop: "1px solid rgba(107, 15, 43, 0.1)",
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}>
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