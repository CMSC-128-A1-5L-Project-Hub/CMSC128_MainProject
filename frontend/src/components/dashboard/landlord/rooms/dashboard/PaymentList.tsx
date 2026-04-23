import Card from "../../../../ui/Card";
import Button from "../../../../Button";

const payments = [
  { name: "Ana Marie Reyes", amount: "₱5000", status: "Pending" },
  { name: "Ana Marie Reyes", amount: "₱5000", status: "Pending" },
  { name: "Ana Marie Reyes", amount: "₱5000", status: "Pending" },
];

export default function PaymentList() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

      {/* OVERDUE FEES */}
    <Card>
    <div className="flex justify-between items-start mb-3">
        <div>
        <h3 className="font-bold text-sm">Overdue Fees</h3>
        <p className="text-xs text-[#9A7080] font-bold mt-0.5">As of April 18, 2026</p>
        </div>
        <div
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-[#8C1535]"
        style={{ background: "rgba(140,21,53,0.08)" }}
        >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
        4 Past Due
        </div>
    </div>

    <hr className="border-gray-100 mb-4" />

    {/* BIG TOTAL */}
    <div className="mb-4">
    <div className="flex justify-between items-center mb-1">
        <p className="text-xs uppercase tracking-wider text-[#9A7080] font-bold">Total Overdue</p>
        <span className="text-xs font-bold text-[#6B0F2B] cursor-pointer hover:underline">
        View all →
        </span>
    </div>
    <p className="text-2xl font-bold text-[#000000]">₱12,500</p>
    </div>

    {/* SECONDARY STATS */}
    <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl p-3" style={{ background: "rgba(140,21,53,0.05)" }}>
        <p className="text-xs text-gray-400 mb-1">Students Overdue</p>
        <p className="text-lg font-bold text-[#6B0F2B]">4</p>
        </div>
        <div className="rounded-xl p-3" style={{ background: "rgba(140,21,53,0.05)" }}>
        <p className="text-xs text-gray-400 mb-1">Oldest Due</p>
        <p className="text-sm font-bold text-[#6B0F2B]">March 1, 2026</p>
        </div>
    </div>

    {/* QUICK ACTION */}
    <button
        className="mt-3 w-full py-2 rounded-xl text-xs font-bold text-white transition-all duration-200 hover:-translate-y-0.5 active:scale-95"
        style={{
        background: "linear-gradient(135deg, #8C1535, #5A0D22)",
        boxShadow: "0 3px 8px rgba(140,21,53,0.3)",
        }}
    >
        Send Reminders to All
    </button>
    </Card>

      {/* PAYMENT VERIFICATIONS */}
      <Card>
        <div className="flex justify-between items-center mb-1">
          <h3 className="font-bold text-sm">Payment Verifications</h3>
          <span className="text-xs font-bold text-[#6B0F2B] cursor-pointer">View all →</span>
        </div>
        <hr className="border-gray-100 mb-2" />
        <div className="flex text-[10px] font-semibold text-gray-400 uppercase tracking-wider pb-2 border-b border-gray-100">
          <span className="flex-[3] text-[#9A7080] font-bold">Student</span>
          <span className="flex-[1] text-right text-[#9A7080] font-bold">Action</span>
        </div>
        {payments.map((p, i) => (
          <div key={i} className="flex items-center py-2.5 border-b border-gray-50 last:border-0">
            <div className="flex-[3] flex gap-3 items-center">
              <div className="w-9 h-9 bg-[#8C1535] rounded-xl shrink-0" />
              <div>
                <p className="text-sm font-medium">{p.name}</p>
                <p className="text-xs text-gray-500">{p.amount} · {p.status}</p>
              </div>
            </div>
            <div className="flex-[1] flex justify-end">
            <Button variant="reddishPink" size="sm" className="!rounded-xl">
                Review
              </Button>
            </div>
          </div>
        ))}
      </Card>

    </div>
  );
}