type NumberProps = {
    label: string
    name: string
    value: string
    onChange: any
    className: string
    error?: string
}

export default function PhoneNumber({
    label,
    name,
    value,
    onChange,
    className="",
    error
}: NumberProps) {
    return (
        <div className={className}>
                <label className={`block text-[11px] font-semibold lg:tracking-widest tracking-wider uppercase mb-1.5
                    ${error
                    ? "text-red-500" : "text-[#6B4050]"}`}>
                    {label}
                </label>

                <div className="flex gap-2 min-w-0">
                    <div className="border border-[#6B0F2B3E] rounded-xl px-3 py-3 text-sm text-gray-600 flex items-center">
                        +63
                    </div>

                    <input
                        type="tel"
                        name={name}
                        value={value}
                        onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, "").replace(/^0+/, "")
                            onChange({ target: { name: e.target.name, value: val } })
                        }}
                        placeholder="9XXXXXXXXXX"
                        maxLength={10}
                        className={`min-w-0 flex-1 border rounded-xl px-4 py-3 text-sm text-[#6B0F2B] placeholder:text-gray-300 focus:outline-none focus:ring-2 transition
                            ${error
                                ? "border-red-400 focus:ring-red-200 focus:border-red-400"
                                : "border-[#6B0F2B3E] focus:ring-[#C9973A]/40 focus:border-[#C9973A]"
                            }`}
                    />
                </div>
                {/* Error label */}
                {error && (
                    <p className="text-red-500 text-[10px] mt-1">{error}</p>
                )}
            </div>
    )
}