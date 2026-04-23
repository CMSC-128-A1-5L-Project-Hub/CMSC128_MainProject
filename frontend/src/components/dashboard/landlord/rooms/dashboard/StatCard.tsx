import Card from "../../../../ui/Card";

export default function StatCard({
  title,
  value,
  subtitle,
  positive = true,
}: any) {
  return (
    <Card>
      <p className="text-[8px] md:text-[10px] truncate text-[#9A7080] font-bold">{title}</p>
      <h2 className="text-[18px] md:text-[22px] lg:text-[26px] font-bold truncate">{value}</h2>
      <p className={`text-[11px] md:text-[12px] truncate ${positive ? "text-green-600" : "text-orange-500"}`}>
        {subtitle}
      </p>
    </Card>
  );
}