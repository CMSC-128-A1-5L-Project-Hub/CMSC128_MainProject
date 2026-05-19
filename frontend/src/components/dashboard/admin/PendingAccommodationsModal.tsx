import { useState } from "react"
import Modal from "@/components/Modal"

type Props = {
  open: boolean
  onClose: () => void
  selectedItem: any
  verifyingAccommodationId: number | null
  onApprove: (id: number) => void
  onReject: (id: number) => void
}

type PreviewItem = {
  fileName: string
  url: string
  isPdf: boolean
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
}: Props) {

  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewItem, setPreviewItem] = useState<PreviewItem | null>(null)

  if (!selectedItem) return null

  const capitalize = (text?: string) =>
    text
      ? text.charAt(0).toUpperCase() + text.slice(1)
      : "—"

  const isProcessing = verifyingAccommodationId === selectedItem.id

  const permit = selectedItem.businessPermit as
    | { fileName: string; fileType: "document" | "image"; url: string }
    | null
    | undefined

  const images = (selectedItem.images ?? []) as Array<{
    id: number
    fileName: string | null
    fileType: "document" | "image" | null
    url: string | null
  }>

  const isFilePdf = (fileName?: string | null, fileType?: string | null) =>
    fileType === "document" || (fileName ?? "").toLowerCase().endsWith(".pdf")

  const permitIsPdf = isFilePdf(permit?.fileName, permit?.fileType)

  const openPreview = (item: PreviewItem) => {
    setPreviewItem(item)
    setPreviewOpen(true)
  }

  const modalFooter = (
    <div className="w-full grid grid-cols-2 gap-3">
      <button
        onClick={() => onReject(selectedItem.id)}
        disabled={isProcessing}
        className="py-2.5 rounded-xl text-[12px] font-bold border border-[#8C1535]/25 text-[#8C1535] hover:bg-[#8C1535]/5 transition-all disabled:opacity-50"
      >
        {isProcessing ? "Rejecting..." : "Reject"}
      </button>

      <button
        onClick={() => onApprove(selectedItem.id)}
        disabled={isProcessing}
        className="py-2.5 rounded-xl text-[12px] font-bold text-white transition-all hover:brightness-110 disabled:opacity-50"
        style={{
          background: "linear-gradient(135deg,#8C1535 0%,#3D0718 100%)"
        }}
      >
        {isProcessing ? "Approving..." : "Approve"}
      </button>
    </div>
  )

  return (
    <>
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
              background: "linear-gradient(135deg, rgba(140,21,53,.06), rgba(61,7,24,.04))",
              border: "1px solid rgba(140,21,53,.1)"
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
              border: "1px solid rgba(26,10,15,.07)"
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
              value={selectedItem.accommodationCapacity}
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
          </div>

          {permit?.url && (
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
                Submitted Documents
              </p>

              <div className="flex items-center gap-3 p-3 bg-white">
                <div
                  className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-[10px] font-extrabold text-white"
                  style={{
                    background: "linear-gradient(135deg, #8C1535 0%, #3D0718 100%)",
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                  }}
                >
                  {permitIsPdf ? "PDF" : "IMG"}
                </div>
                <div className="min-w-0 flex-1">
                  <p
                    className="text-[9px] font-bold tracking-[0.18em] uppercase text-[#9E2040]"
                    style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                  >
                    Business Permit
                  </p>
                  <p
                    className="text-[12px] font-semibold text-[#1A0A10] truncate"
                    style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                    title={permit.fileName}
                  >
                    {permit.fileName}
                  </p>
                </div>
                <button
                  onClick={() =>
                    openPreview({
                      fileName: permit.fileName,
                      url: permit.url,
                      isPdf: permitIsPdf,
                    })
                  }
                  className="px-4 py-2 rounded-xl text-[11px] font-bold tracking-[0.10em] uppercase transition-all hover:brightness-110 active:scale-[0.98]"
                  style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    background: "linear-gradient(135deg, #8C1535 0%, #3D0718 100%)",
                    color: "#fff",
                  }}
                >
                  View
                </button>
              </div>
            </div>
          )}

          {images.length > 0 && (
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
                Submitted Images
              </p>

              <div className="p-3 grid grid-cols-3 gap-2 bg-white">
                {images.map((img) => {
                  if (!img.url) return null
                  return (
                    <button
                      key={img.id}
                      type="button"
                      onClick={() =>
                        openPreview({
                          fileName: img.fileName ?? "Image",
                          url: img.url as string,
                          isPdf: isFilePdf(img.fileName, img.fileType),
                        })
                      }
                      className="aspect-square rounded-xl overflow-hidden bg-[#FAFAFA] hover:brightness-95 active:scale-[0.98] transition-all"
                      style={{ border: "1px solid rgba(140,21,53,0.12)" }}
                      title={img.fileName ?? undefined}
                    >
                      <img
                        src={img.url}
                        alt={img.fileName ?? "Accommodation image"}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* Preview Modal */}
      <Modal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        title={previewItem?.fileName ?? "Document"}
        eyebrow="Submitted File"
        maxWidth={900}
        maxHeight={800}
      >
        {previewItem?.url ? (
          previewItem.isPdf ? (
            <iframe
              src={previewItem.url}
              title={previewItem.fileName}
              className="w-full rounded-xl bg-white"
              style={{ height: "70vh", border: "1px solid rgba(140,21,53,0.12)" }}
            />
          ) : (
            <img
              src={previewItem.url}
              alt={previewItem.fileName}
              className="w-full max-h-[70vh] object-contain rounded-xl bg-[#FAFAFA]"
              style={{ border: "1px solid rgba(140,21,53,0.12)" }}
            />
          )
        ) : (
          <p className="text-center text-gray-400 italic py-10">No document available.</p>
        )}
        <div className="mt-3 flex justify-end">
          <a
            href={previewItem?.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] font-bold tracking-[0.10em] uppercase text-[#8C1535] hover:underline"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Open in new tab ↗
          </a>
        </div>
      </Modal>
    </>
  )
}