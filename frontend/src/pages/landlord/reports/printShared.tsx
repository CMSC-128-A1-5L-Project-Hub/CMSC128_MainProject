import type { ReactNode } from "react";

export const PRINT_CSS = `
  @page { size: A4; margin: 0; }
  html, body { margin: 0; padding: 0; background: white; }
  body { font-family: 'Helvetica', 'Arial', sans-serif; color: #1F2937; }
  .report-page { width: 210mm; min-height: 297mm; padding: 15mm; box-sizing: border-box; }
  table { width: 100%; border-collapse: collapse; font-size: 11px; }
  th { text-align: left; padding: 10px 12px; font-weight: 700; background: #F3F4F6; }
  td { padding: 8px 12px; border-bottom: 1px solid #F3F4F6; }
  tr:nth-child(even) td { background: #F9FAFB; }
  h1 { font-size: 24px; font-weight: 700; margin: 20px 0 24px 0; }
  h2 { font-size: 13px; font-weight: 700; margin: 0 0 12px 0; }
  .muted { color: #6B7280; }
  .right { text-align: right; }
`;

export function PrintHeader({
  title,
  landlordName,
  generatedAt,
}: {
  title: string;
  landlordName: string;
  generatedAt: string;
}) {
  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <div>
          <div
            style={{
              color: "#8C1535",
              fontWeight: 700,
              fontSize: 24,
              lineHeight: 1,
            }}
          >
            UBLE
          </div>
          <div style={{ color: "#6B7280", fontSize: 10, marginTop: 4 }}>
            University Student Accommodation Tracker
          </div>
        </div>
        <div
          style={{
            textAlign: "right",
            color: "#6B7280",
            fontSize: 10,
          }}
        >
          <div>Generated: {generatedAt}</div>
          <div>Landlord: {landlordName}</div>
        </div>
      </div>

      <div style={{ height: 2, background: "#8C1535", marginTop: 16 }} />

      <h1>{title}</h1>
    </>
  );
}

export function decodePayload<T>(encoded: string | null): T | null {
  if (!encoded) return null;
  try {
    const b64 = encoded.replace(/-/g, "+").replace(/_/g, "/");
    const padded = b64 + "=".repeat((4 - (b64.length % 4)) % 4);
    return JSON.parse(atob(padded)) as T;
  } catch {
    return null;
  }
}

export function PrintShell({ children }: { children: ReactNode }) {
  return (
    <>
      <style>{PRINT_CSS}</style>
      <div className="report-page">{children}</div>
    </>
  );
}
