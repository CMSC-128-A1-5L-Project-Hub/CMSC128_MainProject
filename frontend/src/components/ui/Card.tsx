export default function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`bg-white border border-[#F2D9DF] rounded-2xl p-5 ${className}`}>
      {children}
    </div>
  );
} 
