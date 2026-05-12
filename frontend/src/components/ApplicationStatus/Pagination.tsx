interface PageProps {
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  buttonSize?: string;
}

export default function Pagination({ totalPages, currentPage, onPageChange, buttonSize = "w-7 h-7" }: PageProps) {
  const getVisiblePages = () => {
    if (totalPages <= 3) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (currentPage === 1) return [1, 2, 3];
    if (currentPage === totalPages) return [totalPages - 2, totalPages - 1, totalPages];
    return [currentPage - 1, currentPage, currentPage + 1];
  };

  return (
    <div className="flex items-center justify-center gap-1 mt-3 mb-2">
      {getVisiblePages().map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`${buttonSize} text-xs rounded-md font-medium transition flex items-center justify-center
            ${currentPage === page
              ? "text-white"
              : "text-[#9A7080] border border-[#E8D5DC] hover:bg-[#F5ECF0]"}`}
          style={currentPage === page ? { background: "linear-gradient(135deg, #6B0F2B, #9E2040)" } : {}}
        >
          {page}
        </button>
      ))}

      {currentPage < totalPages && (
        <button
          onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
          className={`flex items-center justify-center ${buttonSize} text-xs rounded-md border border-[#E8D5DC] text-[#9A7080] hover:bg-[#F5ECF0] transition`}
        >
          {">"}
        </button>
      )}
    </div>
  );
}