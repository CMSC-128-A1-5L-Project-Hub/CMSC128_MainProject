interface PageProps {
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  buttonSize?: string;
}

export default function Pagination({ totalPages, currentPage, onPageChange, buttonSize ="w-8 h-8" }: PageProps) {
    const getVisiblePages = () => {
        if (totalPages <= 3) return Array.from({ length: totalPages}, (_,i) => i + 1);
        if (currentPage === 1) return [1, 2, 3];
        if (currentPage === totalPages) return [totalPages-2, totalPages-1, totalPages];
        return [currentPage-1, currentPage, currentPage+1];
    }
    
    return (
        <div className="flex gap-2">
            {getVisiblePages().map((page) => (
                <button key={page} onClick ={() => onPageChange(page)} className={page === currentPage
                ? `transition-all text-white bg-gradient-to-br from-[#2A0410] via-[#6B0F2B] to-[#C05070] font-bold ${buttonSize} rounded-[6.8px] flex items-center justify-center text-sm leading-none`
                : `transition-all text-[#6B4050] ${buttonSize} rounded-[6.8px] border-2 border-[#6B4050] border-opacity-10 flex items-center justify-center text-sm leading-none`
                }>
                    {page}
                </button>
            ))}
        </div>
    )
}