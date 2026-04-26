type Status = 'pending' | 'approved' | 'rejected' | 'cancelled' | 'waitlisted' | 'under_review'

const statusConfig: Record<Status, { label: string; dotColor: string; bg: string; text: string }> = {
  pending:      { label: "Pending",      dotColor: "#B8860B", bg: "#FDF6E3", text: "#B8860B" },
  approved:     { label: "Approved",     dotColor: "#2E7D32", bg: "#EDF7EE", text: "#2E7D32" },
  rejected:     { label: "Rejected",     dotColor: "#C62828", bg: "#FDECEA", text: "#C62828" },
  cancelled:    { label: "Cancelled",    dotColor: "#757575", bg: "#F5F5F5", text: "#757575" },
  waitlisted:   { label: "Waitlisted",   dotColor: "#6B3AB7", bg: "#F4F0FA", text: "#6B3AB7" },
  under_review: { label: "Under Review", dotColor: "#1565C0", bg: "#E8F0FE", text: "#1565C0" },
}

export default function StatusBadge({ status }: { status: Status }) {
  const { label, dotColor, bg, text } = statusConfig[status]

  return (
    <div
      className="inline-flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-sm"
      style={{ backgroundColor: bg, color: text }}
    >
      <span
        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
        style={{ backgroundColor: dotColor }}
      />
      {label}
    </div>
  )
}