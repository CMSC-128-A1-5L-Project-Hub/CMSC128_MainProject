interface PageProps {
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ totalPages, currentPage, onPageChange }: PageProps) {
    return (
        <div className="flex gap-2">
            {Array.from({ length: totalPages}, (_,i) => i + 1).map((page) => (
                <button key={page} onClick ={() => onPageChange(page)} className={page === currentPage ? "font-bold" : ""}>
                    {page}
                </button>
            ))}
        </div>
    )
}