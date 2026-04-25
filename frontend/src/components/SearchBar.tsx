import { useRef, useState } from "react"

interface SearchBarProps {
    value: string
    onChange: (query: string) => void
    onPageReset: () => void
}

const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
    <path stroke="#9A7080" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
      d="m21 21-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0Z" />
  </svg>
)

export default function SearchBar({value, onChange, onPageReset} : SearchBarProps){
    const [searchOpen, setSearchOpen] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange(e.target.value)
        onPageReset()
    }

    const handleBlur = () => {
        setSearchOpen(false)
        onChange('')
    }

    return (
        <div className="flex items-center gap-2 lg:gap-3">
        {/* Desktop: expanding search bar */}
        <div className="hidden lg:flex items-center gap-2">
            <div className={`px-1 flex items-center border-2 lg:border-3 bg-[#FAF4F6] border-[#6B0F2B] border-opacity-10 rounded-[8.8px] h-12 overflow-hidden transition-all duration-300 ${searchOpen ? 'w-44' : 'w-12'}`}>
            <button
                onClick={() => { setSearchOpen(!searchOpen); if (!searchOpen) inputRef.current?.focus() }}
                className="p-1 shrink-0"
            >
                <SearchIcon />
            </button>
            <input
                ref={inputRef}
                type="text"
                placeholder="Search..."
                value={value}
                onBlur={handleBlur}
                onChange={handleChange}
                className={`bg-[#FAF4F6] text-[12px] lg:text-[13px] px-1 outline-none transition-all duration-300 ${searchOpen ? 'w-full opacity-100' : 'w-0 opacity-0'}`}
            />
            </div>
        </div>

        {/* Mobile: icon that opens modal */}
        <button
            className="lg:hidden border-2 p-1 px-2 bg-[#FAF4F6] border-[#6B0F2B] border-opacity-10 rounded-[8.8px]"
            onClick={() => setSearchOpen(true)}
        >
            <SearchIcon />
        </button>

        {/* Mobile: modal */}
        {searchOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center lg:hidden">
            <div className="bg-white rounded-xl p-4 w-[60%] shadow-xl">
                <div className="flex items-center gap-2 border-2 border-[#6B0F2B] border-opacity-10 rounded-[8.8px] px-2">
                <SearchIcon />
                <input
                    autoFocus
                    type="text"
                    placeholder="Search dormitory, status, type..."
                    value={value}
                    onChange={handleChange}
                    className="text-[12px] py-2 outline-none w-full"
                />
                </div>
                <button
                onClick={() => setSearchOpen(false)}
                className="mt-3 text-[12px] text-[#9A7080] w-full text-center"
                >
                Close
                </button>
            </div>
            </div>
        )}
        </div>
    )
}