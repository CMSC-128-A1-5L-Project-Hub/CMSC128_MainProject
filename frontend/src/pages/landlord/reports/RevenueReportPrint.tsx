import { useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { PrintShell, PrintHeader, decodePayload } from "./printShared";

type RevenueRow = {
  accommodation_id: number;
  accommodation_name: string;
  room_id: number;
  room_number: string;
  rent: number;
  assigned_students: number;
  projected_monthly_revenue: number;
};

type Payload = {
  landlordName: string;
  generatedAt: string;
  data: {
    projectedMonthlyRevenue: number;
    rooms: RevenueRow[];
  };
};

function fmtPeso(n: number): string {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
  }).format(n);
}

export default function RevenueReportPrint() {
  const [params] = useSearchParams();
  const payload = useMemo(() => decodePayload<Payload>(params.get("d")), [params]);

  useEffect(() => {
    document.title = "Revenue Summary";
  }, []);

  if (!payload) {
    return (
      <div style={{ padding: 40, fontFamily: "sans-serif" }}>
        Missing or invalid report data.
      </div>
    );
  }

  const { landlordName, generatedAt, data } = payload;

  // Group rooms by accommodation for cleaner display
  const grouped: Record<string, RevenueRow[]> = {};
  for (const row of data.rooms) {
    if (!grouped[row.accommodation_name]) grouped[row.accommodation_name] = [];
    grouped[row.accommodation_name].push(row);
  }
  const accommodations = Object.entries(grouped);

  return (
    <PrintShell>
      <PrintHeader
        title="Revenue Summary"
        landlordName={landlordName}
        generatedAt={generatedAt}
      />

      <h2>Projected Monthly Revenue</h2>
      <div
        style={{
          border: "1px solid #E5E7EB",
          borderRadius: 8,
          padding: "16px 20px",
          marginBottom: 32,
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
        }}
      >
        <div
          style={{
            fontSize: 10,
            color: "#6B7280",
            textTransform: "uppercase",
            letterSpacing: 0.5,
            fontWeight: 600,
          }}
        >
          Total across all accommodations
        </div>
        <div
          style={{
            fontSize: 32,
            fontWeight: 700,
            color: "#8C1535",
            lineHeight: 1,
          }}
        >
          {fmtPeso(data.projectedMonthlyRevenue)}
        </div>
      </div>

      <h2>By Room</h2>
      {accommodations.length === 0 ? (
        <p className="muted" style={{ fontStyle: "italic" }}>
          No active assignments generating revenue.
        </p>
      ) : (
        accommodations.map(([accName, rooms]) => {
          const subtotal = rooms.reduce(
            (s, r) => s + r.projected_monthly_revenue,
            0
          );
          return (
            <div key={accName} style={{ marginBottom: 24, pageBreakInside: "avoid" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                  marginBottom: 6,
                }}
              >
                <div style={{ fontWeight: 700, fontSize: 12 }}>{accName}</div>
                <div style={{ fontSize: 11, color: "#6B7280" }}>
                  Subtotal: <strong style={{ color: "#1F2937" }}>{fmtPeso(subtotal)}</strong>
                </div>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>Room</th>
                    <th className="right">Rent / student</th>
                    <th className="right">Assigned</th>
                    <th className="right">Projected revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {rooms.map((r) => (
                    <tr key={r.room_id}>
                      <td>{r.room_number}</td>
                      <td className="right">{fmtPeso(r.rent)}</td>
                      <td className="right">{r.assigned_students}</td>
                      <td className="right">{fmtPeso(r.projected_monthly_revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        })
      )}
    </PrintShell>
  );
}
