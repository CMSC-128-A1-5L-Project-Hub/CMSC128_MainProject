import { useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import {
  PrintShell,
  PrintHeader,
  decodePayload,
} from "../../landlord/reports/printShared";

type PaymentRow = {
  id: number;
  paymentTimestamp: string;
  paymentAmount: number;
  modeOfPayment: string;
  paymentStatus: string;
};

type Payload = {
  landlordName: string;
  generatedAt: string;
  fee: {
    id: number;
    category: string;
    amount: number;
    balance: number;
    status: string;
    dueDate: string | null;
    allowInstallments: boolean;
  };
  student: {
    studentNumber: string;
    name: string;
    email: string | null;
  };
  accommodation: {
    name: string | null;
    roomNumber: string | null;
  };
  payments: PaymentRow[];
};

const peso = (n: number) =>
  `₱${Number(n ?? 0).toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const formatDate = (iso: string | null) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-PH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export default function BillingStatementPrint() {
  const [params] = useSearchParams();
  const payload = useMemo(
    () => decodePayload<Payload>(params.get("d")),
    [params]
  );

  useEffect(() => {
    document.title = "Billing Statement";
  }, []);

  if (!payload) {
    return (
      <div style={{ padding: 40, fontFamily: "sans-serif" }}>
        Missing or invalid statement data.
      </div>
    );
  }

  const { landlordName, generatedAt, fee, student, accommodation, payments } =
    payload;

  const totalPaid = (fee.amount ?? 0) - (fee.balance ?? 0);

  return (
    <PrintShell>
      <PrintHeader
        title="Billing Statement"
        landlordName={landlordName}
        generatedAt={generatedAt}
      />

      <h2>Statement Details</h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 12,
          marginBottom: 24,
        }}
      >
        <div
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
              marginBottom: 6,
            }}
          >
            Billed To
          </div>
          <div style={{ fontSize: 13, fontWeight: 700 }}>{student.name}</div>
          <div style={{ fontSize: 11, color: "#6B7280" }}>
            Student No. {student.studentNumber}
          </div>
          {student.email && (
            <div style={{ fontSize: 11, color: "#6B7280" }}>
              {student.email}
            </div>
          )}
        </div>

        <div
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
              marginBottom: 6,
            }}
          >
            Accommodation
          </div>
          <div style={{ fontSize: 13, fontWeight: 700 }}>
            {accommodation.name ?? "—"}
          </div>
          <div style={{ fontSize: 11, color: "#6B7280" }}>
            Room {accommodation.roomNumber ?? "—"}
          </div>
        </div>
      </div>

      <h2>Fee Summary</h2>
      <table style={{ marginBottom: 24 }}>
        <tbody>
          <tr>
            <td style={{ width: "40%" }} className="muted">
              Statement No.
            </td>
            <td>#{String(fee.id).padStart(6, "0")}</td>
          </tr>
          <tr>
            <td className="muted">Category</td>
            <td style={{ textTransform: "capitalize" }}>{fee.category}</td>
          </tr>
          <tr>
            <td className="muted">Due Date</td>
            <td>{formatDate(fee.dueDate)}</td>
          </tr>
          <tr>
            <td className="muted">Status</td>
            <td style={{ textTransform: "capitalize" }}>{fee.status}</td>
          </tr>
          <tr>
            <td className="muted">Installments Allowed</td>
            <td>{fee.allowInstallments ? "Yes" : "No"}</td>
          </tr>
          <tr>
            <td className="muted">Original Amount</td>
            <td>{peso(fee.amount)}</td>
          </tr>
          <tr>
            <td className="muted">Total Paid</td>
            <td>{peso(totalPaid)}</td>
          </tr>
          <tr>
            <td className="muted" style={{ fontWeight: 700 }}>
              Balance Due
            </td>
            <td style={{ fontWeight: 700, color: "#8C1535" }}>
              {peso(fee.balance)}
            </td>
          </tr>
        </tbody>
      </table>

      <h2>Payment History</h2>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Mode</th>
            <th>Status</th>
            <th className="right">Amount</th>
          </tr>
        </thead>
        <tbody>
          {payments.length === 0 ? (
            <tr>
              <td colSpan={4} className="muted" style={{ fontStyle: "italic" }}>
                No payments recorded yet.
              </td>
            </tr>
          ) : (
            payments.map((p) => (
              <tr key={p.id}>
                <td>{formatDate(p.paymentTimestamp)}</td>
                <td style={{ textTransform: "capitalize" }}>
                  {p.modeOfPayment}
                </td>
                <td style={{ textTransform: "capitalize" }}>
                  {p.paymentStatus}
                </td>
                <td className="right">{peso(p.paymentAmount)}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <p
        style={{
          marginTop: 24,
          fontSize: 10,
          color: "#6B7280",
          fontStyle: "italic",
        }}
      >
        This statement reflects the fee record as of {generatedAt}. Payments
        pending verification are listed above but not yet applied to the
        balance.
      </p>
    </PrintShell>
  );
}
