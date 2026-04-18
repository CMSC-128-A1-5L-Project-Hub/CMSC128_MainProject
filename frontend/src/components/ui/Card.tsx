export default function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`bg-white border border-[#EFEFF1] rounded-2xl p-5 ${className}`}>
      {children}
    </div>
  );
}