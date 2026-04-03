"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from 'react';
import ReactDOM from "react-dom";

// ─── Types ────────────────────────────────────────────────────────────────────
interface ModalProps {
  open: boolean;
  onClose: () => void;
  /** Content rendered inside the white body area */
  children: ReactNode;
  /** Maroon header title — uses Plus Jakarta Sans bold */
  title?: string;
  /** Small uppercase label above the title */
  eyebrow?: string;
  /** Max width of the modal card in px (default 560) */
  maxWidth?: number;
  /** Optional footer slot — rendered below the body */
  footer?: ReactNode;
}

// ─── Modal ────────────────────────────────────────────────────────────────────
export function Modal({
  open,
  onClose,
  children,
  title,
  eyebrow,
  maxWidth = 560,
  footer,
}: ModalProps) {
  const [mounted, setMounted] = useState(false);

  // Only mount portal on client
  useEffect(() => { setMounted(true); }, []);

  // Lock body scroll when open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!mounted) return null;

  const content = (
    <>
      {/* ── Backdrop ── */}
      <div
        aria-hidden="true"
        onClick={onClose}
        style={{
          position: "fixed",
          top: 0, left: 0, right: 0, bottom: 0,
          zIndex: 9998,
          background: "rgba(10,2,6,0.72)",
          backdropFilter:       open ? "blur(8px)" : "blur(0px)",
          WebkitBackdropFilter: open ? "blur(8px)" : "blur(0px)",
          opacity:       open ? 1 : 0,
          pointerEvents: open ? "all" : "none",
          transition: "opacity 0.3s ease, backdrop-filter 0.3s ease",
        }}
      />

      {/* ── Centering shell ── */}
      <div
        role="dialog"
        aria-modal="true"
        style={{
          position: "fixed",
          top: 0, left: 0, right: 0, bottom: 0,
          zIndex: 9999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
          pointerEvents: open ? "all" : "none",
        }}
        onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      >
        {/* ── Card ── */}
        <div
          style={{
            width: "100%",
            maxWidth,
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
        >
          {/* ── Maroon header (only rendered when title is provided) ── */}
          {(title || eyebrow) && (
            <div
              style={{
                background: "linear-gradient(135deg, #8C1535 0%, #3D0718 100%)",
                padding: "28px 32px",
                position: "relative",
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {/* Grid texture */}
              <div
                aria-hidden="true"
                style={{
                  position: "absolute",
                  top: 0, left: 0, right: 0, bottom: 0,
                  backgroundImage:
                    "linear-gradient(rgba(255,255,255,.05) 1px,transparent 1px)," +
                    "linear-gradient(90deg,rgba(255,255,255,.05) 1px,transparent 1px)",
                  backgroundSize: "28px 28px",
                  pointerEvents: "none",
                }}
              />
              {/* Gold glow accent */}
              <div
                aria-hidden="true"
                style={{
                  position: "absolute",
                  top: "-60px", right: "10%",
                  width: 200, height: 200,
                  background:
                    "radial-gradient(circle, rgba(201,151,58,0.14) 0%, transparent 65%)",
                  pointerEvents: "none",
                }}
              />

              {/* Title block — centered */}
              <div
                style={{
                  position: "relative",
                  zIndex: 2,
                  flex: 1,
                  textAlign: "center",
                }}
              >
                {eyebrow && (
                  <p
                    style={{
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      fontSize: 9,
                      fontWeight: 700,
                      letterSpacing: "0.22em",
                      textTransform: "uppercase",
                      color: "rgba(255,255,255,0.5)",
                      marginBottom: 8,
                    }}
                  >
                    {eyebrow}
                  </p>
                )}
                {title && (
                  <h2
                    style={{
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      fontSize: 22,
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

              {/* ── Circular close button — absolute top-right ── */}
              <button
                onClick={onClose}
                aria-label="Close modal"
                style={{
                  position: "absolute",
                  top: 16, right: 16,
                  zIndex: 3,
                  width: 36, height: 36,
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
                  const el = e.currentTarget as HTMLElement;
                  el.style.background = "rgba(255,255,255,0.28)";
                  el.style.transform  = "scale(1.1)";
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.background = "rgba(255,255,255,0.15)";
                  el.style.transform  = "scale(1)";
                }}
              >
                ×
              </button>
            </div>
          )}

          {/* ── Body ── */}
          <div
            style={{
              padding: "24px 28px",
              maxHeight: "52vh",
              overflowY: "auto",
            }}
          >
            {children}
          </div>

          {/* ── Footer (optional) ── */}
          {footer && (
            <div
              style={{
                padding: "16px 28px 22px",
                borderTop: "1px solid rgba(107,15,43,0.08)",
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
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