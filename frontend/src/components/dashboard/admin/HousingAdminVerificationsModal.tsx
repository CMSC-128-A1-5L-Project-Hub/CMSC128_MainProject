import Modal from "@/components/Modal"

type Props = {
  open: boolean
  onClose: () => void
  selectedItem: any | null
  verifyingUserId: number | null
  processingAction: "approve" | "reject" | null
  onApprove: (userId: number) => Promise<void>
  onReject: (userId: number) => Promise<void>
}

function InfoRow({
  label,
  value,
}: {
  label: string
  value?: string | number | null
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <span
        className="text-[9px] font-bold tracking-[0.18em] uppercase text-[#9E2040]"
        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
      >
        {label}
      </span>

      <span
        className="text-[13px] font-semibold text-[#1A0A10]"
        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
      >
        {value ?? (
          <span className="text-gray-400 font-normal italic">—</span>
        )}
      </span>
    </div>
  )
}

export default function HousingAdminVerificationModal({
  open,
  onClose,
  selectedItem,
  verifyingUserId,
  processingAction,
  onApprove,
  onReject,
}: Props) {
  const user = selectedItem?.user
  const profileDetails = selectedItem?.profileDetails

  if (!user) return null

  const fullName = `${user.fname ?? ""} ${user.lname ?? ""}`.trim()
  const initials = fullName
    .split(" ")
    .map((n: string) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()

  const isProcessing = verifyingUserId === user.id
  const isApproving = isProcessing && processingAction === "approve"
  const isRejecting = isProcessing && processingAction === "reject"

  const formatDate = (timestamp?: string) => {
    if (!timestamp) return "N/A"
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const modalFooter = (
    <div className="w-full grid grid-cols-2 gap-3">
      {/* Reject */}
      <button
        onClick={() => onReject(user.id)}
        disabled={isProcessing}
        className="py-2.5 rounded-xl text-[12px] font-bold tracking-[0.10em] uppercase transition-all duration-200 hover:brightness-105 active:scale-[0.98] disabled:opacity-60"
        style={{
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          background: "#fff",
          color: "#8C1535",
          border: "1px solid rgba(140,21,53,0.25)",
        }}
      >
        {isRejecting ? (
          <span className="flex items-center justify-center gap-2">
            <span className="inline-block w-3.5 h-3.5 rounded-full border-2 border-[#8C1535]/30 border-t-[#8C1535] animate-spin" />
            Rejecting…
          </span>
        ) : (
          "Reject"
        )}
      </button>
      {/* Approve */}
      <button
        onClick={() => onApprove(user.id)}
        disabled={isProcessing}
        className="w-full py-2.5 rounded-xl text-[12px] font-bold tracking-[0.10em] uppercase transition-all duration-200 hover:brightness-110 active:scale-[0.98] disabled:opacity-60"
        style={{
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          background: "linear-gradient(135deg, #8C1535 0%, #3D0718 100%)",
          color: "#fff",
          boxShadow: "0 4px 14px rgba(140,21,53,0.35)",
        }}
      >
        {isApproving ? (
          <span className="flex items-center justify-center gap-2">
            <span className="inline-block w-3.5 h-3.5 rounded-full border-2 border-white/40 border-t-white animate-spin" />
            Approving…
          </span>
        ) : (
          "Approve"
        )}
      </button>
    </div>
  )

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Review Housing Administrator"
      eyebrow="Pending Verification"
      maxWidth={520}
      footer={modalFooter}
    >
      <div className="space-y-4">
        {/* Profile */}
        <div
          className="flex items-center gap-4 p-4 rounded-2xl"
          style={{
            background: "linear-gradient(135deg, rgba(140,21,53,0.06) 0%, rgba(61,7,24,0.04) 100%)",
            border: "1px solid rgba(140,21,53,0.10)",
          }}
        >
          <div
            className="flex-shrink-0 w-14 h-14 rounded-full flex items-center justify-center text-[20px] font-extrabold text-white"
            style={{
              background: "linear-gradient(135deg, #8C1535 0%, #3D0718 100%)",
              boxShadow: "0 4px 16px rgba(140,21,53,0.35)",
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}
          >
            {initials}
          </div>

          <div className="min-w-0">
            <p
              className="text-[17px] font-extrabold text-[#1A0A10] leading-tight truncate"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              {fullName}
            </p>

            <p
              className="text-[12px] text-[#9E2040] font-medium truncate mt-0.5"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              {user.email}
            </p>

            <span
              className="inline-flex items-center gap-1.5 mt-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-[0.12em] uppercase"
              style={{
                background: "rgba(140,21,53,0.10)",
                color: "#8C1535",
                border: "1px solid rgba(140,21,53,0.20)",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#8C1535]" />
              Housing Administrator
            </span>
          </div>
        </div>

        {/* Details */}
        <div
          className="grid grid-cols-2 gap-x-6 gap-y-4 p-4 rounded-2xl"
          style={{
            background: "#FAFAFA",
            border: "1px solid rgba(26,10,15,0.07)",
          }}
        >
          <InfoRow label="First Name" value={user.fname} />
          <InfoRow label="Last Name" value={user.lname} />

          <InfoRow label="Email Address" value={user.email} />

          <div className="col-span-2">
            <InfoRow label="TIN" value={profileDetails?.tin} />
          </div>

          <div className="col-span-2">
            <InfoRow label="Application Date" value={formatDate(user.submittedAt)} />
          </div>
        </div>

        {/* Business Permit / ID */}
        {profileDetails?.businessPermit?.url && (
          <div
            className="rounded-2xl overflow-hidden"
            style={{ border: "1px solid rgba(140,21,53,0.12)" }}
          >
            <p
              className="px-4 py-2 text-[9px] font-bold tracking-[0.18em] uppercase text-[#9E2040]"
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                background: "rgba(140,21,53,0.05)",
                borderBottom: "1px solid rgba(140,21,53,0.08)",
              }}
            >
              Business Permit
            </p>

            <img
              src={profileDetails.businessPermit.url}
              alt="Business Permit"
              className="w-full object-cover max-h-48"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "https://via.placeholder.com/400x200?text=No+Image"
              }}
            />
          </div>
        )}
      </div>
    </Modal>
  )
}