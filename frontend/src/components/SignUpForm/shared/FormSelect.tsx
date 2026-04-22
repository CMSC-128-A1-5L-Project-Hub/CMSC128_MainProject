type SelectProps = {
    label: string
    name: string
    value: string
    //defaultSelect refers sa default na non-selectable option, parang placeholder ganon
    defaultSelect: string
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
    options: { label: string; value: string }[]
    className?: string
    error?: string
}

export default function FormSelect({
    label,
    name,
    value,
    defaultSelect="Select",
    onChange,
    options,
    className="",
    error,
}: SelectProps) {
    return (
        <div className={className}>
            <label className={`block text-[11px] font-semibold tracking-widest uppercase mb-1.5
                ${error ? "text-red-500" : "text-[#6B4050]"}`}>
                {label}
            </label>

            <div className="relative">
                <select
                    name={name}
                    value={value}
                    onChange={onChange}
                    className={`
                        w-full appearance-none border border-[#6B0F2B3E] rounded-xl px-4 py-3 
                        text-sm ${value ? "text-[#6B0F2B]" : "text-[#C8B0B8]"} 
                        bg-white focus:outline-none focus:ring-2 focus:ring-[#C9973A]/40 focus:border-[#C9973A] transition
                        ${error
                            ? "border-red-400 focus:ring-red-200 focus:border-red-400"
                            : "border-[#6B0F2B3E] focus:ring-[#C9973A]/40 focus:border-[#C9973A]"
                        }
                    `}
                >
                    <option value="" disabled>{defaultSelect}</option>
                    {options.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
            </div>

            {error && (
                <p className="text-red-500 text-[10px] mt-1">
                    This field is required
                </p>
            )}
        </div>
    )
}