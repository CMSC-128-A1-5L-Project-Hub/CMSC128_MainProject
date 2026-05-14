import { useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { PrintShell, PrintHeader, decodePayload } from "./printShared";

type HistoryRow = {
  assignment_id: number;
  student_number: string;
  student_name: string;
  accommodation_name: string;
  room_number: string;
  move_in: string | null;
  actual_move_out: string | null;
};

type Payload = {
  landlordName: string;
  generatedAt: string;
  rows: HistoryRow[];
};

function fmtDate(d: string | null): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-PH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function durationDays(start: string | null, end: string | null): string {
  if (!start || !end) return "—";
  const ms = new Date(end).getTime() - new Date(start).getTime();
  const days = Math.max(0, Math.round(ms / (1000 * 60 * 60 * 24)));
  return `${days} day${days === 1 ? "" : "s"}`;
}

export default function AccommodationHistoryReportPrint() {
  const [params] = useSearchParams();
  const payload = useMemo(() => decodePayload<Payload>(params.get("d")), [params]);

  useEffect(() => {
    document.title = "Accommodation History";
  }, []);

  if (!payload) {
    return (
      <div style={{ padding: 40, fontFamily: "sans-serif" }}>
        Missing or invalid report data.
      </div>
    );
  }

  const { landlordName, generatedAt, rows } = payload;

  return (
    <PrintShell>
      <PrintHeader
        title="Accommodation History"
        landlordName={landlordName}
        generatedAt={generatedAt}
      />

      <h2>Past Assignments (moved out)</h2>
      <p className="muted" style={{ fontSize: 10, margin: "0 0 12px 0" }}>
        {rows.length} record{rows.length === 1 ? "" : "s"} total.
      </p>

      <table>
        <thead>
          <tr>
            <th>Student #</th>
            <th>Student Name</th>
            <th>Accommodation</th>
            <th>Room</th>
            <th>Move-in</th>
            <th>Move-out</th>
            <th className="right">Stay</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={7} className="muted" style={{ fontStyle: "italic" }}>
                No past assignments recorded.
              </td>
            </tr>
          ) : (
            rows.map((r) => (
              <tr key={r.assignment_id}>
                <td>{r.student_number}</td>
                <td>{r.student_name}</td>
                <td>{r.accommodation_name}</td>
                <td>{r.room_number}</td>
                <td>{fmtDate(r.move_in)}</td>
                <td>{fmtDate(r.actual_move_out)}</td>
                <td className="right">{durationDays(r.move_in, r.actual_move_out)}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </PrintShell>
  );
}
