import Modal from "@/components/Modal"

type Props = {
  open: boolean
  onClose: () => void
  selectedItem:any
  verifyingAccommodationId:number | null
  onApprove:(id:number)=>void
  onReject:(id:number)=>void
}

function InfoRow({
  label,
  value,
}:{
  label:string
  value?:string|number|null
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[9px] font-bold tracking-[0.18em] uppercase text-[#9E2040]">
        {label}
      </span>

      <span className="text-[13px] font-semibold text-[#1A0A10]">
        {value || (
          <span className="italic text-gray-400">
            —
          </span>
        )}
      </span>
    </div>
  )
}

export default function AccommodationVerificationModal({
  open,
  onClose,
  selectedItem,
  verifyingAccommodationId,
  onApprove,
  onReject
}:Props){

  if(!selectedItem) return null

  const capitalize = (text?: string) =>
    text
        ? text.charAt(0).toUpperCase() + text.slice(1)
        : "—"

  const isProcessing =
    verifyingAccommodationId === selectedItem.id

  const permit =
    selectedItem.businessPermit

  const modalFooter=(
    <div className="w-full grid grid-cols-2 gap-3">

      <button
        onClick={() =>
          onReject(selectedItem.id)
        }
        disabled={isProcessing}
        className="py-2.5 rounded-xl text-[12px] font-bold border border-[#8C1535]/25 text-[#8C1535]"
      >
        Reject
      </button>

      <button
        onClick={() =>
          onApprove(selectedItem.id)
        }
        disabled={isProcessing}
        className="py-2.5 rounded-xl text-[12px] font-bold text-white"
        style={{
          background:
          "linear-gradient(135deg,#8C1535 0%,#3D0718 100%)"
        }}
      >
        {isProcessing
          ? "Approving..."
          : "Approve"}
      </button>

    </div>
  )

  return(
    <Modal
      open={open}
      onClose={onClose}
      title="Review Accommodation"
      eyebrow="Pending Verification"
      maxWidth={520}
      footer={modalFooter}
    >
      <div className="space-y-4">

        <div
          className="p-4 rounded-2xl"
          style={{
            background:
            "linear-gradient(135deg, rgba(140,21,53,.06), rgba(61,7,24,.04))",
            border:"1px solid rgba(140,21,53,.1)"
          }}
        >
          <p className="font-bold text-lg">
            {selectedItem.accommodationName}
          </p>

          <p className="text-sm text-[#9E2040]">
            {selectedItem.accommodationLocation}
          </p>
        </div>

        <div
            className="grid grid-cols-2 gap-5 p-4 rounded-2xl bg-[#FAFAFA]"
            style={{
                border:"1px solid rgba(26,10,15,.07)"
            }}
            >
            
            <InfoRow
                label="Landlord"
                value={
                    selectedItem.landlord?.user
                    ? `${selectedItem.landlord.user.fname} ${selectedItem.landlord.user.lname}`
                    : "—"
                }
            />
            
            <InfoRow
                label="Capacity"
                value={selectedItem.capacity}
            />

            <InfoRow
                label="Accommodation Type"
                value={capitalize(selectedItem.accommodationType)}
            />
            
            <InfoRow
                label="Tenant Restriction"
                value={capitalize(selectedItem.tenantRestriction)}
            />

            <div className="col-span-2">
                <InfoRow
                label="Address"
                value={selectedItem.accommodationLocation}
                />
            </div>

            <div className="col-span-2">
                <InfoRow
                label="Business Permit"
                value= "BUSINESS PERMIT" // ewan aba
                />
            </div>
        </div>

        {permit?.url && (
          <div
            className="rounded-2xl overflow-hidden"
            style={{
              border:
              "1px solid rgba(140,21,53,.12)"
            }}
          >
            <p className="px-4 py-2 text-[10px] font-bold uppercase text-[#9E2040] bg-[#FFF7F9]">
              Business Permit
            </p>

            <div className="p-4 flex items-center justify-between">
              <p className="text-sm">
                {permit.fileName}
              </p>

              <a
                href={permit.url}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 rounded-xl text-white text-xs font-bold"
                style={{
                  background:
                  "linear-gradient(135deg,#8C1535,#3D0718)"
                }}
              >
                View
              </a>
            </div>
          </div>
        )}

      </div>
    </Modal>
  )
}