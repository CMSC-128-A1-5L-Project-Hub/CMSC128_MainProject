import { useState } from "react";
import Card from "../../../../ui/Card";
import { downloadReport } from "../../../../../api/downloadReport";

type ReportConfig = {
  label: string;
  path?: string;
  filenamePrefix?: string;
};

const reports: ReportConfig[] = [
  {
    label: "Occupancy Rate",
    path: "/reports/occupancy/pdf",
    filenamePrefix: "occupancy",
  },
  {
    label: "Revenue Summary",
    path: "/reports/revenue/pdf",
    filenamePrefix: "revenue-summary",
  },
  {
    label: "Waiting List",
    path: "/reports/waiting-list/xlsx",
    filenamePrefix: "waiting-list",
  },
  {
    label: "Housed Students",
    path: "/reports/housed-students/xlsx",
    filenamePrefix: "housed-students",
  },
  {
    label: "Accommodation History",
    path: "/reports/accommodation-history/pdf",
    filenamePrefix: "accommodation-history",
  },
  {
    label: "Overdue Fees",
    path: "/reports/overdue-fees/xlsx",
    filenamePrefix: "overdue-fees",
  },
];

export default function ReportsPanel() {
  const [loading, setLoading] = useState<string | null>(null);

  const handleClick = async (r: ReportConfig) => {
    if (!r.path || !r.filenamePrefix) return;
    setLoading(r.label);
    try {
      const date = new Date().toISOString().slice(0, 10);
      const ext = r.path.endsWith("/xlsx") ? "xlsx" : "pdf";
      await downloadReport(r.path, `${r.filenamePrefix}-${date}.${ext}`);
    } catch (err) {
      console.error("Failed to download report:", err);
    } finally {
      setLoading(null);
    }
  };

  return (
    <Card>
      <h3 className="text-sm font-bold mb-3">Generate Reports</h3>

      <div className="grid grid-cols-2 gap-2">
        {reports.map((r) => {
          const isLoading = loading === r.label;
          const isEnabled = !!r.path;
          return (
            <button
              key={r.label}
              onClick={() => handleClick(r)}
              disabled={!isEnabled || isLoading}
              className="
                group relative overflow-hidden rounded-xl
                py-2.5 px-3 text-xs font-medium text-white text-center
                transition-all duration-200 active:scale-95 hover:-translate-y-0.5
                disabled:hover:translate-y-0 disabled:active:scale-100
                disabled:cursor-not-allowed

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
                {isLoading ? "Downloading…" : r.label}
              </span>
            </button>
          );
        })}
      </div>
    </Card>
  );
}
