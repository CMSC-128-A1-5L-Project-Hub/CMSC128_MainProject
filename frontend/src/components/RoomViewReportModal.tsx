// components/ReportAccommodationModal.tsx
import { useState } from "react"
import Modal from "./Modal"
import Button from "./Button"
import GradientPillSelect from "./DropDownGradient"

type ReportType = "dorm" | "manager"

type ReportForm = {
  reason: string
  details: string
}

const DORM_REASONS = [
  "Inaccurate listing information",
  "Unsafe or unhealthy conditions",
  "Fraudulent listing",
  "Inappropriate photos",
  "Unavailable but listed as available",
  "Other",
]

const MANAGER_REASONS = [
  "Unprofessional behavior",
  "Harassment or discrimination",
  "Unresponsive to concerns",
  "Fraudulent activity",
  "Violation of housing policies",
  "Other",
]

type ReportAccommodationModalProps = {
  open: boolean
  onClose: () => void
  reportType: ReportType
  accommodationName?: string
  managerName?: string
}

export default function ReportAccommodationModal({
  open,
  onClose,
  reportType,
  accommodationName,
  managerName,
}: ReportAccommodationModalProps) {
  const [form, setForm] = useState<ReportForm>({ reason: "", details: "" })
  const [errors, setErrors] = useState({ reason: false, details: false })

  const reasons = reportType === "dorm" ? DORM_REASONS : MANAGER_REASONS
  const reasonOptions = reasons.map((r) => ({ label: r, value: r }))

  const subjectLabel = reportType === "dorm"
    ? accommodationName ?? "this accommodation"
    : managerName ?? "this manager"

  const title = reportType === "dorm" ? "Report Accommodation" : "Report Manager"

  const handleClose = () => {
    onClose()
    setForm({ reason: "", details: "" })
    setErrors({ reason: false, details: false })
  }

  const handleSubmit = () => {
    const newErrors = {
      reason:  !form.reason,
      details: !form.details.trim(),
    }
    setErrors(newErrors)
    if (Object.values(newErrors).some(Boolean)) return
    console.log("Report submitted:", { reportType, ...form })
    handleClose()
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={title}
      maxWidth={600}
      maxHeight={800}
      footer={
        <div className="flex flex-row justify-end w-full">
          <Button variant="reddishPink" onClick={handleSubmit}>Submit Report</Button>
        </div>
      }
    >
      <div className="flex flex-col gap-5 py-1">
        {/* Subject pill */}
        <div className="flex items-center gap-2 bg-[#6B0F2B] border border-[#F0E8EC] rounded-xl px-4 py-2.5">
          <svg className="w-5 h-5 flex-shrink-0 text-[#F0E8EC]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            {reportType === "dorm" ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12L12 3l9 9M4 10v10a1 1 0 001 1h5v-6h4v6h5a1 1 0 001-1V10" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            )}
          </svg>
          <p className="text-[15px] font-semibold text-[#F0E8EC] truncate font-sans">
            {reportType === "dorm" ? "Accommodation: " : "Manager: "}
            <span className="font-bold">{subjectLabel}</span>
          </p>
        </div>

        {/* Reason dropdown */}
        <GradientPillSelect
          label="Reason for Report"
          options={reasonOptions}
          value={form.reason as any}
          onChange={(v) => {
            setForm({ ...form, reason: v })
            setErrors({ ...errors, reason: false })
          }}
          width="w-full"
          labelSize="text-[11px]"
          optionSize="text-[13px]"
        />
        {errors.reason && (
          <p className="text-red-500 text-[10px] mt-1">This field is required</p>
        )}
        {/* Details */}
        <div>
          <label className={`block text-[11px] font-semibold tracking-widest uppercase mb-1.5
            ${errors.details ? "text-red-500" : "text-[#6B4050]"}`}>
            Additional Details
          </label>
          <textarea
            value={form.details}
            onChange={(e) => {
              setForm({ ...form, details: e.target.value })
              setErrors({ ...errors, details: false })
            }}
            placeholder="Describe the issue in detail..."
            rows={5}
            className={`w-full border rounded-xl px-4 py-3 text-sm text-[#1A0008] placeholder:text-[#C8B0B8] resize-none focus:outline-none transition
              ${errors.details
                ? "border-red-400 focus:ring-2 focus:ring-red-200 focus:border-red-400"
                : "border-[#6B0F2B3E] focus:ring-2 focus:ring-[#C9973A]/40 focus:border-[#C9973A]"
              }`}
          />
          {errors.details && (
            <p className="text-red-500 text-[10px] mt-1">This field is required</p>
          )}
        </div>
      </div>
    </Modal>
  )
}