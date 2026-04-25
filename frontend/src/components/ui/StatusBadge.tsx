export type Status =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'cancelled'
  | 'waitlisted'
  | 'under_review'
  | 'confirmed'               
  | 'pending_confirmation'    

const statusConfig: Record<Status, { label: string; dotColor: string; bg: string; text: string }> = {
  pending:      { label: "Pending",      dotColor: "#B8860B", bg: "#FDF6E3", text: "#B8860B" },
  approved:     { label: "Approved",     dotColor: "#2E7D32", bg: "#EDF7EE", text: "#2E7D32" },
  rejected:     { label: "Rejected",     dotColor: "#C62828", bg: "#FDECEA", text: "#C62828" },
  cancelled:    { label: "Cancelled",    dotColor: "#757575", bg: "#F5F5F5", text: "#757575" },
  waitlisted:   { label: "Waitlisted",   dotColor: "#E65100", bg: "#FFF3E0", text: "#E65100" },
  under_review: { label: "Under Review", dotColor: "#1565C0", bg: "#E8F0FE", text: "#1565C0" },
  confirmed:         { label: "Confirmed",         dotColor: "#2E7D32", bg: "#E8F5E9", text: "#2E7D32" },
  pending_confirmation: { label: "Pending Confirmation", dotColor: "#F59E0B", bg: "#FFF7ED", text: "#B45309" },
}

export default function StatusBadge({ status }: { status: Status }) {
  const config = statusConfig[status] ?? statusConfig.pending
  const { label, dotColor, bg, text } = config

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