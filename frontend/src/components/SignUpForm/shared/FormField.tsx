{/* input var types */}
{/* add na lang kayo ng types if may gusto kayo iadd
    make sure lang na di maaapektuhan nang sobra ung ibang pages
    na nagamit din ng component    
*/}
type InputProps = {
    label: string
    name: string
    value: string
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
    placeholder: string
    type?: string
    className?: string
    disabled?: boolean
    readOnly?: boolean
    maxLength?: number
    error?: string
}

export default function FormField({
    label,
    name,
    value,
    onChange,
    placeholder,
    type="text",
    className="",
    disabled,
    readOnly,
    maxLength,
    error,
}: InputProps) {
    return (
        <div className={className}>
            <label className={`block text-[11px] font-semibold tracking-widest uppercase mb-1.5
                ${error ? "text-red-500" : "text-[#6B4050]"}`}>
                {label}
            </label>
            <input 
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                maxLength={maxLength}
                disabled={disabled}
                readOnly={readOnly}
                className={`w-full border border-[#6B0F2B3E] rounded-xl px-4 py-3 text-sm text-[#6B0F2B] placeholder:text-[#C8B0B8] focus:outline-none focus:ring-2 focus:ring-[#C9973A]/40 focus:border-[#C9973A] transition 
                    ${disabled || readOnly 
                        ? "bg-[#6B0F2B1F] border-[#6B0F2B1A] text-[#6B0F2B] cursor-not-allowed" 
                        : error
                        ? "border-red-400 focus:ring-red-200 focus:border-red-400 text-[#6B0F2B]"
                            : "border-[#6B0F2B3E] focus:ring-[#C9973A]/40 focus:border-[#C9973A] text-[#6B0F2B]"}`}
            />
            {error && (
                <p className="text-red-500 text-[10px] mt-1">
                    {error}
                </p>
            )}
        </div>
    )
}