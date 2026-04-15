interface PageProps {
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ totalPages, currentPage, onPageChange }: PageProps) {
    const getVisiblePages = () => {
        if (totalPages <= 3) return Array.from({ length: totalPages}, (_,i) => i + 1);
        if (currentPage === 1) return [1, 2, 3];
        if (currentPage === totalPages) return [totalPages-2, totalPages-1, totalPages];
        return [currentPage-1, currentPage, currentPage+1];
    }
    
    return (
        <div className="flex gap-2">
            {getVisiblePages().map((page) => (
                <button key={page} onClick ={() => onPageChange(page)} className={page === currentPage ? "text-white bg-gradient-to-br from-[#2A0410] via-[#6B0F2B] to-[#C05070] font-bold w-6 h-6 rounded-[6.8px]" : "text-[#6B4050] w-6 h-6 rounded-[6.8px] border-2 border-[#6B4050] border-opacity-10"}>
                    {page}
                </button>
            ))}
        </div>
    )
}