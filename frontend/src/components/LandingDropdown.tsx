import { useState, useRef, useEffect } from "react"
import { ChevronDown } from "lucide-react"

const labelStyle: React.CSSProperties = {
  fontSize: 9,
  fontWeight: 700,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  color: "#9A7080",
  marginBottom: 6,
  fontFamily: "'Plus Jakarta Sans',sans-serif",
}

interface LandingDropdownProps {
  label: string
  value: string
  onChange: (value: string) => void
  options: { label: string; value?: string }[]
  isMobile?: boolean
  borderRight?: boolean
  hoverBg?: string
  hoverText?: string
  activeBg?: string
  activeText?: string
  dropdownBg?: string
}

export default function LandingDropdown({
  label,
  value,
  onChange,
  options,
  isMobile = false,
  borderRight = true,
  hoverBg = "#fdf4f7",
  hoverText = "#6B0F2B",
  activeBg = "#6B0F2B",
  activeText = "#ffffff",
  dropdownBg = "#ffffff",
}: LandingDropdownProps) {
  const [open, setOpen] = useState(false)
  const [hoveredValue, setHoveredValue] = useState<string | null>(null)
  const ref = useRef<HTMLDivElement>(null)

  const selectedLabel = options.find(o => (o.value ?? o.label) === value)?.label ?? value

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div
      style={{
        padding: "14px 16px",
        borderRight: borderRight ? "1px solid #f0eaea" : "none",
        borderBottom: isMobile ? "1px solid #f0eaea" : "none",
      }}
    >
      <p style={labelStyle}>{label}</p>

      {/* Trigger wrapper — relative anchor for dropdown */}
      <div ref={ref} style={{ position: "relative" }}>
        <button
          onClick={() => setOpen(prev => !prev)}
          style={{
            width: "100%",
            background: "transparent",
            border: "none",
            outline: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: 14,
            color: "#1A0008",
            padding: 0,
            fontFamily: "'Plus Jakarta Sans',sans-serif",
          }}
        >
          <span>{selectedLabel}</span>
          <ChevronDown
            size={14}
            color="#9A7080"
            style={{
              marginLeft: 6,
              flexShrink: 0,
              transition: "transform 0.2s",
              transform: open ? "rotate(180deg)" : "rotate(0deg)",
            }}
          />
        </button>

        {/* Dropdown — always rendered, fades in/out */}
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            left: 0,
            minWidth: "160px",
            background: dropdownBg,
            borderRadius: 10,
            boxShadow: "0 4px 20px rgba(107,15,43,0.12)",
            zIndex: 9999,
            padding: "4px",
            opacity: open ? 1 : 0,
            transform: open ? "translateY(0)" : "translateY(-6px)",
            pointerEvents: open ? "all" : "none",
            transition: "opacity 0.18s ease, transform 0.18s ease",
          }}
        >
          {options.map(option => {
            const val = option.value ?? option.label
            const isActive = val === value
            const isHovered = val === hoveredValue
            return (
              <button
                key={val}
                onClick={() => { onChange(val); setOpen(false) }}
                onMouseEnter={() => setHoveredValue(val)}
                onMouseLeave={() => setHoveredValue(null)}
                style={{
                  display: "block",
                  width: "100%",
                  textAlign: "left",
                  padding: "8px 12px",
                  fontSize: 13,
                  fontFamily: "'Plus Jakarta Sans',sans-serif",
                  cursor: "pointer",
                  border: "none",
                  borderRadius: 7,
                  transition: "background 0.15s, color 0.15s",
                  background: isActive ? activeBg : isHovered ? hoverBg : "transparent",
                  color: isActive ? activeText : isHovered ? hoverText : "#1A0008",
                  fontWeight: isActive ? 600 : 400,
                }}
              >
                {option.label}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}