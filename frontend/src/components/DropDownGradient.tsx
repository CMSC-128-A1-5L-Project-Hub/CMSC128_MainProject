import { useState } from "react";
import { useRef } from "react";
import { useEffect } from "react";
interface Option<T extends string> {
  value: T;
  label: string;
}

//
interface GradientPillSelectProps<T extends string> {
  label: string;
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
  width?: string;      
  textSize?: string;    
}

const IconChevron = ({ open }: { open: boolean }) => (
  <svg
    className="w-4 h-4 flex-shrink-0 transition-transform duration-200"
    style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
    viewBox="0 0 24 24"
    fill="none"
    stroke="#3D0718"
    strokeWidth={2.5}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
  </svg>
);

const IconCheck = () => (
  <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={3}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

export default function GradientPillSelect<T extends string>({
  label,
  options,
  value,
  onChange,
  width = "w-44",  
  textSize = "text-[15px]",
}: GradientPillSelectProps<T>) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selectedLabel = options.find((o) => o.value === value)?.label ?? value;

  return (
    <div className="flex flex-col gap-1.5">
      <p className={`${textSize} font-bold tracking-widest text-[#9A7080]`}>
        {label}
      </p>

      {/* Pill butto*/}
      <div className={`relative ${width}`} ref={containerRef}>

  
        <div
          className="relative p-[1.5px] transition-all duration-150"
          style={{
            borderRadius: open ? "14px 14px 0 0" : "999px",
            background: "linear-gradient(135deg, #3D0718, #8C1535)",
          }}
        >
          <button
            onClick={() => setOpen((o) => !o)}
            className={`relative flex items-center justify-between gap-3 w-full px-4 py-[7px] bg-white ${textSize} font-semibold transition-all duration-150`}
            style={{
              borderRadius: open ? "12px 12px 0 0" : "999px",
              color: "#3D0718",
            }}
          >
            <span>{selectedLabel}</span>
            <IconChevron open={open} />
          </button>
        </div>

        {/* Dropdown list */}
        {open && (
          <div
            className="absolute top-full left-0 right-0 z-50 overflow-hidden"
            style={{ borderRadius: "0 0 14px 14px" }}
          >

            <div
              className="p-[1.5px] pt-0"
              style={{
                background: "linear-gradient(135deg, #8C1535, #3D0718)",
                borderRadius: "0 0 14px 14px",
              }}
            >
              <div
                className="overflow-hidden bg-white"
                style={{ borderRadius: "0 0 12px 12px" }}
              >
                {options.map((opt, i) => {
                  const isSelected = opt.value === value;
                  const isLast = i === options.length - 1;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => {
                        onChange(opt.value);
                        setOpen(false);
                      }}
                      className={`flex items-center justify-between w-full px-4 py-[9px] ${textSize} font-semibold text-left transition-colors`}
                      style={{
                        background: isSelected
                          ? "linear-gradient(90deg, #3D0718, #6B0F2B)"
                          : "white",
                        color: isSelected ? "#fff" : "#3D0718",
                        borderRadius: isLast ? "0 0 11px 11px" : "0",
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) e.currentTarget.style.background = "#fdf0f3";
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) e.currentTarget.style.background = "white";
                      }}
                    >
                      <span>{opt.label}</span>
                      {isSelected && <IconCheck />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
