import { useEffect, useState } from "react";

interface DropdownProps {
  title: string;
  items: { label: string; href: string }[];
  onSelect?: (label: string) => void;
  direction?: "up" | "down";
  widthClass?: string;
  titleClass?: string;
  selectedClass?: string;
}

export default function Dropdown({ title, items, onSelect, direction = "down", widthClass = "w-32", titleClass = "text-[10px]", selectedClass = "text-[12px]" }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(items[0].label);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        type="button"
        className={`px-2 py-1 border-2 lg:border-3 border-[#6B0F2B] border-opacity-10 bg-white rounded-[8.8px] flex items-center justify-between gap-4 ${widthClass}`}
      >
        <div className="flex flex-col items-start overflow-hidden w-full">
          <span className={`${titleClass} text-[#9A7080] uppercase`}>{title}</span>
          <span className={`${selectedClass} font-medium text-gray-800 truncate w-full`}>{selected}</span>
        </div>
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24">
          <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 9-7 7-7-7"/>
        </svg>
      </button>

      {open && (
        <div className={`absolute mt-1 bg-white w-fit border-2 border-[#6B0F2B] border-opacity-10 rounded-[8.8px] shadow-lg z-10 ${
          direction === "up" ? "bottom-full mb-1" : "top-full mt-1" }`}>
          <ul className="p-2 text-sm">
            {items.map((item) => (
              <li key={item.label}>
                <a
                  onClick={() => { 
                    setSelected(item.label); 
                    setOpen(false); 
                    onSelect?.(item.label);
                  }}
                  className="text-[12px] block p-2 justify-start hover:bg-gray-100 rounded w-50"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}