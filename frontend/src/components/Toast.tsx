import { useEffect, useState } from "react"
import { CheckCircle2, X, AlertCircle, Info, AlertTriangle, Loader2 } from "lucide-react"

type ToastType = "success" | "error" | "info" | "warning" | "loading"

interface ToastProps {
  type?: ToastType
  title: string
  message?: string
  show: boolean
  onClose: () => void
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

const iconMap = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle,
  loading: Loader2,
}

const colorMap = {
  success: { bg: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-200" },
  error: { bg: "bg-red-50", text: "text-red-600", border: "border-red-200" },
  info: { bg: "bg-[#F5ECF0]", text: "text-[#6B0F2B]", border: "border-[#E8D0D8]" },
  warning: { bg: "bg-amber-50", text: "text-amber-600", border: "border-amber-200" },
  loading: { bg: "bg-[#F5ECF0]", text: "text-[#6B0F2B]", border: "border-[#E8D0D8]" },
}

export default function Toast({
  type = "info",
  title,
  message,
  show,
  onClose,
  duration = 4000,
  action,
}: ToastProps) {
  const [visible, setVisible] = useState(false)
  const [exiting, setExiting] = useState(false)

  useEffect(() => {
    if (show) {
      setVisible(true)
      setExiting(false)
      if (type !== "loading") {
        const timer = setTimeout(() => dismiss(), duration)
        return () => clearTimeout(timer)
      }
    }
  }, [show, duration, type])

  const dismiss = () => {
    setExiting(true)
    setTimeout(() => {
      setVisible(false)
      onClose()
    }, 300)
  }

  if (!visible) return null

  const Icon = iconMap[type]
  const colors = colorMap[type]

  return (
    <div
      className={`
        fixed top-4 right-4 sm:top-6 sm:right-6 z-[9999] 
        flex items-start sm:items-center gap-2.5 sm:gap-3 px-4 sm:px-5 py-3.5 sm:py-4 
        bg-white
        border ${colors.border}
        rounded-xl sm:rounded-xl 
        shadow-[0_8px_32px_rgba(107,15,43,0.12),0_2px_8px_rgba(107,15,43,0.06)]
        backdrop-blur-md
        max-w-[calc(100vw-2rem)] sm:max-w-md w-full
        transition-all duration-300 ease-out
        ${exiting 
          ? "opacity-0 -translate-y-4" 
          : "opacity-100 translate-y-0 animate-[slideDown_0.4s_cubic-bezier(0.22,1,0.36,1)]"
        }
      `}
    >
      <div className={`flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center mt-0.5 sm:mt-0 ${colors.bg} ${colors.text}`}>
        <Icon size={16} className={`sm:w-[18px] sm:h-[18px] ${type === "loading" ? "animate-spin" : ""}`} />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-[13px] sm:text-sm font-semibold text-[#1A0008] leading-tight">
          {title}
        </p>
        {message && (
          <p className="text-[11px] sm:text-xs text-[#9A7080] mt-0.5 leading-relaxed">
            {message}
          </p>
        )}
      </div>

      {action && (
        <button
          onClick={action.onClick}
          className="flex-shrink-0 px-2.5 sm:px-3 py-1 sm:py-1.5 text-[11px] sm:text-xs font-semibold rounded-lg bg-gradient-to-r from-[#6B0F2B] to-[#8C1535] text-white hover:opacity-90 transition-opacity shadow-md"
        >
          {action.label}
        </button>
      )}

      <button
        onClick={dismiss}
        className="flex-shrink-0 p-1 rounded-md text-[#9A7080] hover:text-[#6B0F2B] hover:bg-[#F5ECF0] transition-colors mt-0.5 sm:mt-0"
      >
        <X size={14} />
      </button>

      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-100%); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}

/*

Ganito usage mga yass

import Toast from "@/components/Toast"

const [toast, setToast] = useState<{
  show: boolean; type: "success" | "error"; title: string; message?: string
}>({ show: false, type: "success", title: "" })

// After approve:
setToast({ show: true, type: "success", title: "Approved!", message: "Application has been approved." })

// In JSX:
<Toast
  type={toast.type}
  title={toast.title}
  message={toast.message}
  show={toast.show}
  onClose={() => setToast(prev => ({ ...prev, show: false }))}
/>

*/