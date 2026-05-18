import Modal from "../Modal"

type Props = {
  open: boolean
  onClose: () => void
  url: string | null
  name: string
}

export default function DocumentPreviewModal({ open, onClose, url, name }: Props) {
  const pathOnly = url ? url.split("?")[0].toLowerCase() : ""
  const isPdf = pathOnly.endsWith(".pdf")

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={name}
      eyebrow="Document Preview"
      maxWidth={900}
      maxHeight={800}
    >
      {url ? (
        isPdf ? (
          <iframe
            src={url}
            title={name}
            className="w-full rounded-xl bg-white"
            style={{ height: "70vh", border: "1px solid rgba(140,21,53,0.12)" }}
          />
        ) : (
          <img
            src={url}
            alt={name}
            className="w-full max-h-[70vh] object-contain rounded-xl bg-[#FAFAFA]"
            style={{ border: "1px solid rgba(140,21,53,0.12)" }}
          />
        )
      ) : (
        <p className="text-center text-gray-400 italic py-10">No document available.</p>
      )}
      <div className="mt-3 flex justify-end">
        <a
          href={url ?? "#"}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[11px] font-bold tracking-[0.10em] uppercase text-[#8C1535] hover:underline"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          Open in new tab ↗
        </a>
      </div>
    </Modal>
  )
}
