"use client";

import { forwardRef } from "react";
import type {ButtonHTMLAttributes} from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────
type ButtonVariant = "primary" | "secondary" | "tertiary" | "ghost" | "gold" | "danger";
type ButtonSize    = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:   ButtonVariant;
  size?:      ButtonSize;
  fullWidth?: boolean;
  isLoading?: boolean;
}

// ─── Base Tailwind classes (no arbitrary values — safe without JIT) ───────────
const BASE =
  "inline-flex items-center justify-center gap-2 font-sans font-bold " +
  "cursor-pointer border-none rounded-full transition-all duration-200 " +
  "select-none whitespace-nowrap tracking-wide leading-none " +
  "disabled:opacity-50 disabled:cursor-not-allowed " +
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2";

const VARIANTS: Record<ButtonVariant, string> = {
  primary:   "hover:-translate-y-px hover:scale-105 active:scale-95 focus-visible:ring-red-900",
  secondary: "hover:scale-105 active:scale-95 focus-visible:ring-red-900",
  tertiary: "hover:scale-105 active:scale-95 focus-visible:ring-red-900",
  ghost:     "hover:opacity-80 active:scale-95 focus-visible:ring-gray-400",
  gold:      "hover:-translate-y-px hover:scale-105 active:scale-95 focus-visible:ring-yellow-500",
  danger:    "hover:-translate-y-px hover:scale-105 active:scale-95 focus-visible:ring-red-500",
};

const SIZES: Record<ButtonSize, string> = {
  sm: "text-xs px-3 py-2",
  md: "text-sm px-6 py-3",
  lg: "text-base px-8 py-4",
};

// ─── Inline styles — color is set HERE so it always wins over browser defaults ─
const VARIANT_STYLES: Record<ButtonVariant, React.CSSProperties> = {
  primary: {
    background: "linear-gradient(135deg, #6B0F2B, #3D0718)",
    boxShadow:  "0 6px 20px rgba(107,15,43,0.35)",
    color:      "#ffffff",   // ← explicit white, can't be overridden
  },
  secondary: {
    background: "transparent",
    border:     "1.5px solid rgba(107,15,43,0.25)",
    boxShadow:  "none",
    color:      "#5A3040",
  },
  tertiary: {
    background: "#F5ECF0",
    border:     "1px solid rgba(107, 15, 43, 0.12)",
    boxShadow:  "none",
    color:      "#6B0F2B"
  },
  ghost: {
    background: "none",
    border:     "none",
    boxShadow:  "none",
    padding:    "0",
    color:      "#9A7080",
  },
  gold: {
    background: "linear-gradient(135deg, #C9973A, #a07825)",
    boxShadow:  "0 6px 28px rgba(201,151,58,0.45)",
    color:      "#ffffff",   // ← explicit white
  },
  danger: {
    background: "linear-gradient(135deg, #dc2626, #991b1b)",
    boxShadow:  "0 6px 20px rgba(220,38,38,0.35)",
    color:      "#ffffff",   // ← explicit white
  },
};

// ─── Component ────────────────────────────────────────────────────────────────
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant   = "primary",
      size      = "md",
      fullWidth = false,
      isLoading = false,
      children,
      style,
      className = "",
      disabled,
      ...props
    },
    ref
  ) => {
    const classes = [
      BASE,
      VARIANTS[variant],
      SIZES[size],
      fullWidth ? "w-full" : "",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <button
        ref={ref}
        className={classes}
        // VARIANT_STYLES spread first so caller's `style` prop can still override
        style={{ ...VARIANT_STYLES[variant], ...style }}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <svg
              className="animate-spin"
              style={{ width: 14, height: 14, opacity: 0.8 }}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
            </svg>
            Loading…
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
export default Button;