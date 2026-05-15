// components/ReportAccommodationModal.tsx
import { useState } from "react"
import Modal from "./Modal"
import Button from "./Button"
import FormSelect from "./SignUpForm/shared/FormSelect"
import GradientPillSelect from "./DropDownGradient"
import { api } from "../api/axios"

type ReportType = "dorm" | "manager"

type ReportForm = {
  reason: string
  details: string
}

const DORM_REASONS = [
  { label: "Inaccurate listing information", value: "inaccurate_listing" },
  { label: "Unsafe or unhealthy conditions", value: "unsafe" },
  { label: "Fraudulent listing", value: "fraudulent_listing" },
  { label: "Inappropriate photos", value: "inappropriate_photos" },
  { label: "Unavailable but listed as available", value: "unavailable" },
  { label: "Other", value: "other" },
]

const MANAGER_REASONS = [
  { label: "Unprofessional behavior", value: "unprofessional_behavior" },
  { label: "Harassment or discrimination", value: "harassment" },
  { label: "Unresponsive to concerns", value: "unresponsive" },
  { label: "Fraudulent activity", value: "fraudulent_activity" },
  { label: "Violation of housing policies", value: "violation_of_policies" },
  { label: "Other", value: "other" },
]

type ReportAccommodationModalProps = {
  open: boolean
  onClose: () => void
  reportType: ReportType
  reportableId: number
  accommodationName?: string
  managerName?: string
  onSuccess?: () => void
  onError?: () => void
}

export default function ReportAccommodationModal({
  open,
  onClose,
  reportType,
  reportableId,
  accommodationName,
  managerName,
  onSuccess,
  onError
}: ReportAccommodationModalProps) {
  const [form, setForm] = useState<ReportForm>({ reason: "", details: "" })
  const [errors, setErrors] = useState({ reason: false, details: false })
  const [submitting, setSubmitting] = useState(false)

  const reasonOptions = reportType === "dorm" ? DORM_REASONS : MANAGER_REASONS
  
  const subjectLabel = reportType === "dorm"
    ? accommodationName ?? "this accommodation"
    : managerName ?? "this manager"

  const title = reportType === "dorm" ? "Report Accommodation" : "Report Manager"

  const handleClose = () => {
    onClose()
    setForm({ reason: "", details: "" })
    setErrors({ reason: false, details: false })
  }

  const handleSubmit = async () => {
    const newErrors = {
      reason: !form.reason,
      details: !form.details.trim(),
    }

    setErrors(newErrors)

    if (Object.values(newErrors).some(Boolean)) return

    setSubmitting(true)


    try {
      await api.post('/issue-reports', {
        reportableType: reportType === 'dorm'
          ? 'accommodation'
          : 'manager',

        reportableId,

        reason: form.reason,
        additionalDetails: form.details,
      })

      handleClose()
      onSuccess?.()
    } catch (error) {
      console.error('Failed to submit report:', error)
      onError?.()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={title}
      maxWidth={520}
      maxHeight={520}
      footer={
        <div className="flex flex-row justify-end w-full">
          <Button variant="reddishPink" onClick={handleSubmit}>Submit Report</Button>
        </div>
      }
    >
      <div className="flex flex-col gap-5 py-1">
        {/* Subject pill */}
        <div className="flex items-center gap-2 bg-[#F7EFF2] border border-[#F0E8EC] rounded-xl px-4 py-2.5">
          <svg className="w-3.5 h-3.5 flex-shrink-0 text-[#6B0F2B]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            {reportType === "dorm" ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12L12 3l9 9M4 10v10a1 1 0 001 1h5v-6h4v6h5a1 1 0 001-1V10" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            )}
          </svg>
          <p className="text-[12px] font-semibold text-[#3D0718] truncate">
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
          <label className={`block text-[11px] font-bold tracking-widest text-[#9A7080] mb-1.5
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