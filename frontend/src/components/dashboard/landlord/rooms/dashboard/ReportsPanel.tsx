import Card from "../../../../ui/Card";

const reports = [
  "Occupancy Rate",
  "Revenue Summary",
  "Waiting List",
  "Housed Students",
  "Accommodation History",
  "Overdue Fees",
];

export default function ReportsPanel() {
  return (
    <Card>
      <h3 className="text-sm font-bold mb-3">Generate Reports</h3>

      <div className="grid grid-cols-2 gap-2">
        {reports.map((r) => (
          <button
            key={r}
            className="
              group relative overflow-hidden rounded-xl
              py-2.5 px-3 text-xs font-medium text-white text-center
              transition-all duration-200 active:scale-95 hover:-translate-y-0.5

              bg-[linear-gradient(135deg,#8C1535,#5A0D22)]
              shadow-[0_3px_8px_rgba(140,21,53,0.3)]
            "
          >
            {/* hover shine */}
            <span
              className="
                absolute inset-0 rounded-xl opacity-0
                transition-opacity duration-200
                group-hover:opacity-100
                bg-[linear-gradient(135deg,rgba(255,255,255,0.1),transparent)]
              "
            />

            <span className="relative z-10 leading-tight">
              {r}
            </span>
          </button>
        ))}
      </div>
    </Card>
  );
}