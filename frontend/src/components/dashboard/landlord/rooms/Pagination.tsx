import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  const [pageLimits, setPageLimits] = useState<[number, number]>([
    1,
    Math.min(5, totalPages),
  ]);

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
    if (page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };

  const buttonBase =
    "flex w-10 h-10 items-center justify-center rounded-xl text-sm font-semibold leading-none shadow-sm transition-all duration-200";

  return (
    <div className="flex flex-col items-center gap-4 mt-0">
      {/* Pagination Controls */}
      <div className="flex items-center justify-center gap-2">
        {/* Previous Range */}
        {pageLimits[0] > 1 && (
          <button
            onClick={goToPreviousRange}
            className={`${buttonBase} bg-white text-[#654050] border border-[#E8D4E2] hover:bg-[#5A1021] hover:text-white`}
          >
            <ChevronLeft size={20} />
            <ChevronLeft size={20} className="-ml-2" />
          </button>
        )}

        {/* Previous Page */}
        <button
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage === 1}
          className={`${buttonBase} ${
            currentPage === 1
              ? "bg-gray-100 text-gray-300 border border-gray-200 cursor-not-allowed shadow-none"
              : "bg-white text-[#654050] border border-[#E8D4E2] hover:bg-[#5A1021] hover:text-white"
          }`}
        >
          <ChevronLeft size={20} />
        </button>

        {/* Page Numbers */}
        {Array.from(
          { length: pageLimits[1] - pageLimits[0] + 1 },
          (_, i) => pageLimits[0] + i
        ).map((page) => (
          <button
            key={page}
            onClick={() => goToPage(page)}
            className={`${buttonBase} ${
              currentPage === page
                ? "bg-gradient-to-br from-[#8C1535] to-[#5A1021] text-white border border-transparent shadow-md scale-105"
                : "bg-white text-[#654050] border border-[#E8D4E2] hover:bg-[#5A1021] hover:text-white hover:scale-105"
            }`}
          >
            {page}
          </button>
        ))}

        {/* Next Page */}
        <button
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`${buttonBase} ${
            currentPage === totalPages
              ? "bg-gray-100 text-gray-300 border border-gray-200 cursor-not-allowed shadow-none"
              : "bg-white text-[#654050] border border-[#E8D4E2] hover:bg-[#5A1021] hover:text-white"
          }`}
        >
          <ChevronRight size={20} />
        </button>

        {/* Next Range */}
        {pageLimits[1] < totalPages && (
          <button
            onClick={goToNextRange}
            className={`${buttonBase} bg-white text-[#654050] border border-[#E8D4E2] hover:bg-[#5A1021] hover:text-white`}
          >
            <ChevronRight size={20} />
            <ChevronRight size={20} className="-ml-2" />
          </button>
        )}
      </div>

      {/* Footer */}
      <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-[#7A4E5D]">
        <span>
          Page{" "}
          <strong className="text-[#8C1535]">{currentPage}</strong> of{" "}
          <strong>{totalPages}</strong>
        </span>

        <div className="flex items-center gap-2">
          <label htmlFor="jumpToPage" className="text-xs font-medium">
            Go to page:
          </label>

          <input
            id="jumpToPage"
            type="number"
            min={1}
            max={totalPages}
            value={currentPage}
            onChange={(e) => {
              const val = parseInt(e.target.value);
              if (!isNaN(val) && val >= 1 && val <= totalPages) {
                goToPage(val);
              }
            }}
            className="w-16 px-2 py-2 border border-[#F2D9DF] rounded-xl text-center text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#8C1535]"
          />
        </div>
      </div>
    </div>
  );
}