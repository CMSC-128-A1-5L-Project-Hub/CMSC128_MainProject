import { useState } from "react";

interface DropdownProps {
  title: string;
  items: { label: string; href: string }[];
}

export default function Dropdown({ title, items }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(items[0].label);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        type="button"
        className="px-2 py-1 border-2 border-[#6B0F2B] border-opacity-10 bg-white rounded-[8.8px] flex items-center justify-between gap-4 w-32"
      >
        <div className="flex flex-col items-start overflow-hidden w-full">
          <span className="text-[10px] text-[#9A7080] uppercase">{title}</span>
          <span className="text-[12px] font-medium text-gray-800 truncate w-full">{selected}</span>
        </div>
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24">
          <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 9-7 7-7-7"/>
        </svg>
      </button>

      {open && (
        <div className="absolute mt-1 w-56 bg-white border border-gray-200 rounded shadow-lg z-10">
          <ul className="p-2 text-sm">
            {items.map((item) => (
              <li key={item.label}>
                <a
                  onClick={() => { setSelected(item.label); setOpen(false); }}
                  className="block p-2 justify-start hover:bg-gray-100 rounded w-50"
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