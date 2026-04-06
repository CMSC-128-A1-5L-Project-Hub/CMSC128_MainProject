import { useState, useRef } from "react";
import { Upload, Paperclip } from "lucide-react";

{/* to be modified, to handle multiple file uploads */}

type FileUploadProps = {
    label: string
    name: string
    required?: boolean
    accept?: string
    maxSize?: number //in mb
    value: File | null
    onChange: (file: File | null) => void
    error?: String
}

export default function FileUpload({
    label,
    name,
    required=false,
    accept=".pdf",
    maxSize=5,
    value,
    onChange,
    error,
}: FileUploadProps) {
    const inputRef = useRef<HTMLInputElement>(null)
    const [dragOver, setDragOver] = useState(false)

    const handleFile = (file: File) => {
        if (file.size > maxSize * 1024 * 1024) {
            return
        }
        onChange(file)
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setDragOver(false)
        const file = e.dataTransfer.files[0]
        if (file) handleFile(file)
    }

    return (
        <div
            className={`flex flex-col items-center justify-center gap-3 border-2 border-dashed rounded-2xl p-8 cursor-pointer transition
                ${dragOver ? "border-[#C9973A] bg-[#C9973A]/5"
                    : error ? "border-red-300 bg-white" : "border-[#6B0F2B]/20 bg-white"}
                `}
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => {e.preventDefault(); setDragOver(true)}}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
        >
            <input
                ref={inputRef}
                type="file"
                name={name}
                accept={accept}
                className="hidden"
                onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleFile(file)
                }}
            />

            <div className="bg-[#6B0F2B]/10 rounded-2xl p-4">
                <Upload className="w-6 h-6 text-[#6B0F2B]" strokeWidth={2}/>
            </div>

            <div className="text-center">
                <p className="font-semibold text=[#1a1a1a]">
                    {label}
                </p>
                <p className="text-xs text-gray-400 mt-0.5 uppercase">
                    {accept}. Max {maxSize}MB
                </p>
            </div>

            {value ? (
                <div className="flex items-center gap-1.5 text-xs text-[#6B0F2B] bg-[#6B0F2B]/10 px-3 py-1.5 rounded-full">
                    <Paperclip className="w-3 h-3"/>
                    <span className="max-w-[160px] truncate">{value.name}</span>
                    <button
                        onClick={(e) => {e.preventDefault(); onChange(null)}}
                        className="ml-1 hover:text-red-500 transition"
                    >
                        X
                    </button>
                </div>
            ) : (
                <span
                    className="text-xs font-bold text-[#6B0F2B] px-4 py-1.5 rounded-full border border-[#6B0F2B1B] bg-[#6B0F2B]/10 flex items-center gap-1 whitespace-nowrap"
                >
                    {required ? "📄 Required" : "📎 Optional"}
                </span>
            )}

            {error && 
                <p className="text-red-500 text-[10px]">
                    {error}
                </p>
            }
        </div>
    )
}