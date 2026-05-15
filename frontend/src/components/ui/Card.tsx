export default function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`bg-white rounded-2xl p-4 lg:p-6 w-full ${className}`}>
      {children}
    </div>
  );
}