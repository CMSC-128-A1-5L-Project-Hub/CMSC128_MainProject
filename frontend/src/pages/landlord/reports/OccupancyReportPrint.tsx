import { useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { PrintShell, PrintHeader, decodePayload } from "./printShared";

type OccupancyStats = {
  totalCapacity: number;
  currentlyOccupied: number;
  vacantSlots: number;
  breakdown: Record<string, number>;
};

type Payload = {
  landlordName: string;
  generatedAt: string;
  stats: OccupancyStats;
};

export default function OccupancyReportPrint() {
  const [params] = useSearchParams();
  const payload = useMemo(() => decodePayload<Payload>(params.get("d")), [params]);

  useEffect(() => {
    document.title = "Occupancy Report";
  }, []);

  if (!payload) {
    return (
      <div style={{ padding: 40, fontFamily: "sans-serif" }}>
        Missing or invalid report data.
      </div>
    );
  }

  const { landlordName, generatedAt, stats } = payload;
  const occupancyPct =
    stats.totalCapacity > 0
      ? Math.round((stats.currentlyOccupied / stats.totalCapacity) * 100)
      : 0;

  const cards = [
    { label: "Total Capacity", value: stats.totalCapacity },
    { label: "Currently Occupied", value: stats.currentlyOccupied },
    { label: "Vacant Slots", value: stats.vacantSlots },
    { label: "Occupancy Rate", value: `${occupancyPct}%` },
  ];

  const breakdownEntries = Object.entries(stats.breakdown);

  return (
    <PrintShell>
      <PrintHeader
        title="Occupancy Report"
        landlordName={landlordName}
        generatedAt={generatedAt}
      />

      <h2>Summary</h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 12,
          marginBottom: 32,
        }}
      >
        {cards.map((c) => (
          <div
            key={c.label}
            style={{
              border: "1px solid #E5E7EB",
              borderRadius: 8,
              padding: "12px 14px",
            }}
          >
            <div
              style={{
                fontSize: 9,
                color: "#6B7280",
                textTransform: "uppercase",
                letterSpacing: 0.5,
                fontWeight: 600,
              }}
            >
              {c.label}
            </div>
            <div
              style={{
                fontSize: 28,
                fontWeight: 700,
                color: "#8C1535",
                marginTop: 6,
                lineHeight: 1,
              }}
            >
              {c.value}
            </div>
          </div>
        ))}
      </div>

      <h2>Occupancy by Gender</h2>
      <table>
        <thead>
          <tr>
            <th>Gender</th>
            <th className="right">Occupied</th>
          </tr>
        </thead>
        <tbody>
          {breakdownEntries.length === 0 ? (
            <tr>
              <td colSpan={2} className="muted" style={{ fontStyle: "italic" }}>
                No active assignments.
              </td>
            </tr>
          ) : (
            breakdownEntries.map(([gender, count]) => (
              <tr key={gender}>
                <td>{gender || "Unspecified"}</td>
                <td className="right">{count}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </PrintShell>
  );
}
