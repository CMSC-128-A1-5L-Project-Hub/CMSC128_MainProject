// components/ShareModal.tsx
import { useState } from "react"
import Modal from "./Modal"
import Button from "./Button"

type ShareModalProps = {
  open: boolean
  onClose: () => void
  accommodationName: string
  url?: string
}

export default function ShareModal({ open, onClose, accommodationName, url }: ShareModalProps) {
  const [copied, setCopied] = useState(false)
  const shareUrl = url ?? window.location.href
  const encodedUrl = encodeURIComponent(shareUrl)
  const encodedText = encodeURIComponent(`Check out ${accommodationName} on UBLE!`)

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const handleFacebook = () => {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      '_blank',
      'width=600,height=400'
    )
  }

  const handleX = () => {
    window.open(
      `https://x.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`,
      '_blank',
      'width=600,height=400'
    )
  }

  const handleEmail = () => {
    window.open(
      `mailto:?subject=${encodeURIComponent(`Check out ${accommodationName}`)}&body=${encodeURIComponent(`Hey! I found this accommodation on UBLE: ${shareUrl}`)}`
    )
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Share"
      maxWidth={600}
      maxHeight={600}
      footer={
        <div className="flex flex-row justify-end w-full">
          <Button variant="reddishPink" onClick={onClose}>Done</Button>
        </div>
      }
    >
      <div className="flex flex-col gap-5 py-1">
        <p className="text-[25px] text-[#3D0718]">
          Share <span className="font-bold text-[#3D0718] font-sans italic">{accommodationName}</span> to the community!
        </p>

        {/* <div className="w-full h-[6px] bg-[#9A7080]"></div> */}

        {/* URL row */}
        <div>
          <p className="text-[11px] font-semibold tracking-widest uppercase text-[#6B4050] mb-4 font-sans">
            Your unique link
          </p>
          <div className="flex items-center border border-[#6B0F2B3E] rounded-xl overflow-hidden">
            <div className="flex-1 px-4 py-2.5 text-[12px] text-[#6B0F2B] font-medium bg-white truncate">
              {shareUrl}
            </div>
            <div className="w-px h-8 bg-[#6B0F2B3E]" />
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-4 py-2.5 text-[12px] font-semibold transition-colors flex-shrink-0"
              style={{ color: copied ? "#1A7A4A" : "#6B0F2B" }}
            >
              {copied ? (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Copied!
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy link
                </>
              )}
            </button>
          </div>
        </div>

        {/* Share via */}
        <div>
          <p className="text-[11px] font-semibold tracking-widest uppercase text-[#6B4050] mb-4 font-sans">
            Share via
          </p>
          <div className="flex items-center justify-center gap-8">
            {/* Facebook */}
            <button onClick={handleFacebook} className="flex flex-col items-center gap-2 group">
              <div className="w-14 h-14 rounded-full flex items-center justify-center transition-opacity group-hover:opacity-80"
                style={{ background: "#1877F2" }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
                  <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
                </svg>
              </div>
              <span className="text-[12px] font-medium text-gray-600">Facebook</span>
            </button>

            {/* X */}
            <button onClick={handleX} className="flex flex-col items-center gap-2 group">
              <div className="w-14 h-14 rounded-full flex items-center justify-center transition-opacity group-hover:opacity-80"
                style={{ background: "#000000" }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </div>
              <span className="text-[12px] font-medium text-gray-600">X</span>
            </button>

            {/* Email */}
            <button onClick={handleEmail} className="flex flex-col items-center gap-2 group">
              <div className="w-14 h-14 rounded-full flex items-center justify-center transition-opacity group-hover:opacity-80"
                style={{ background: "#E5E7EB" }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </div>
              <span className="text-[12px] font-medium text-gray-600">Email</span>
            </button>
          </div>
        </div>
      </div>
    </Modal>
  )
}