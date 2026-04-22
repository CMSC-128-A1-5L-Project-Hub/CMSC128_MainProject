import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  const [pageLimits, setPageLimits] = useState<[number, number]>([1, Math.min(5, totalPages)]);

  useEffect(() => {
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = start + maxVisible - 1;
    if (end > totalPages) {
      end = totalPages;
      start = Math.max(1, end - maxVisible + 1);
    }
    setPageLimits([start, end]);
  }, [currentPage, totalPages]);

  const goToPreviousRange = () => {
    const newStart = Math.max(1, pageLimits[0] - 5);
    const newEnd = Math.min(totalPages, newStart + 4);
    setPageLimits([newStart, newEnd]);
    onPageChange(newStart);
  };

  const goToNextRange = () => {
    const newStart = Math.min(totalPages - 4, pageLimits[1] + 1);
    const newEnd = Math.min(totalPages, newStart + 4);
    setPageLimits([newStart, newEnd]);
    onPageChange(newStart);
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) onPageChange(page);
  };

  return (
    <div className="flex flex-col items-center gap-4 mt-6">
      <div className="flex justify-center items-center gap-2">
        {pageLimits[0] > 1 && (
          <button onClick={goToPreviousRange} className="flex w-8 h-8 items-center justify-center rounded-lg bg-white text-sm font-semibold text-[#654050] shadow-md hover:bg-[#5a1021] hover:text-white border border-[#E8D4E2] transition">
            <ChevronLeft size={14} /><ChevronLeft size={14} className="-ml-2" />
          </button>
        )}
        <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1} className={`flex w-8 h-8 items-center justify-center rounded-lg text-sm font-semibold shadow-md transition ${currentPage === 1 ? "bg-gray-100 text-gray-300 cursor-not-allowed border border-gray-200" : "bg-white text-[#654050] hover:bg-[#5a1021] hover:text-white border border-[#E8D4E2]"}`}>
          <ChevronLeft size={14} />
        </button>
        {Array.from({ length: pageLimits[1] - pageLimits[0] + 1 }, (_, i) => pageLimits[0] + i).map((page) => (
          <button key={page} onClick={() => goToPage(page)} className={`flex w-8 h-8 items-center justify-center rounded-lg text-sm font-semibold shadow-md transition ${currentPage === page ? "bg-[#7A162D] text-white" : "bg-white text-[#654050] hover:bg-[#5a1021] hover:text-white border border-[#E8D4E2]"}`}>
            {page}
          </button>
        ))}
        <button onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages} className={`flex w-8 h-8 items-center justify-center rounded-lg text-sm font-semibold shadow-md transition ${currentPage === totalPages ? "bg-gray-100 text-gray-300 cursor-not-allowed border border-gray-200" : "bg-white text-[#654050] hover:bg-[#5a1021] hover:text-white border border-[#E8D4E2]"}`}>
          <ChevronRight size={14} />
        </button>
        {pageLimits[1] < totalPages && (
          <button onClick={goToNextRange} className="flex w-8 h-8 items-center justify-center rounded-lg bg-white text-sm font-semibold text-[#654050] shadow-md hover:bg-[#5a1021] hover:text-white border border-[#E8D4E2] transition">
            <ChevronRight size={14} /><ChevronRight size={14} className="-ml-2" />
          </button>
        )}
      </div>
      <div className="flex items-center gap-3 text-sm text-[#7A4E5D]">
        <span>Page <strong className="text-[#8C1535]">{currentPage}</strong> of <strong>{totalPages}</strong></span>
        <div className="flex items-center gap-2">
          <label htmlFor="jumpToPage" className="text-xs">Go to page:</label>
          <input
            id="jumpToPage"
            type="number"
            min={1}
            max={totalPages}
            defaultValue={currentPage}
            onBlur={(e) => {
              const val = parseInt(e.target.value);
              if (!isNaN(val) && val >= 1 && val <= totalPages) goToPage(val);
              else e.target.value = currentPage.toString();
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                const val = parseInt((e.target as HTMLInputElement).value);
                if (!isNaN(val) && val >= 1 && val <= totalPages) goToPage(val);
                else (e.target as HTMLInputElement).value = currentPage.toString();
              }
            }}
            className="w-16 px-2 py-1 border border-[#F2D9DF] rounded-lg text-center text-sm focus:outline-none focus:ring-1 focus:ring-[#8C1535]"
          />
        </div>
      </div>
    </div>
  );
}