import Card from "../ui/Card";

export default function SectionCard({ title, action, children }: any) {
  return (
    <Card>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-[14px] font-bold ">{title}</h3>
        {action && (
          <button className="text-[12px] font-bold text-[#6B0F2B] hover:underline transition-all cursor-pointer">
            {action} 
          </button>
        )}
      </div>
      {children}
    </Card>
  );
}