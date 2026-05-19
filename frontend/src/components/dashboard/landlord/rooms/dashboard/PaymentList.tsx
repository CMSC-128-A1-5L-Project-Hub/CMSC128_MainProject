import Card from "../../../../ui/Card";
import Button from "../../../../Button";
import { useNavigate } from "react-router-dom";

interface DelinquentStudent {
  fee_id: number
  student_number: string
  student_name: string
  due_date: string
  category: string
  amount: number
  balance: number
  status: string
}

interface PendingPayment {
  id: number
  paymentAmount: number
  modeOfPayment: string
  fee?: {
    feeCategory: string
    student?: {
      user?: { fname: string; lname: string }
    }
  }
}

interface PaymentListProps {
  delinquent?: DelinquentStudent[]
  pendingPayments?: PendingPayment[]
  isLoading?: boolean
}

function fmt(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-PH", {
    month: "long", day: "numeric", year: "numeric",
  });
}

export default function PaymentList({ delinquent = [], pendingPayments = [], isLoading }: PaymentListProps) {
  const navigate = useNavigate();
  const totalOverdue = delinquent.reduce((sum, d) => sum + d.balance, 0);
  const uniqueStudents = new Set(delinquent.map((d) => d.student_number)).size;
  const oldestDue = delinquent.length > 0 ? delinquent[0].due_date : null; // already sorted asc

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

      {/* OVERDUE FEES */}
      <Card>
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-bold text-sm">Overdue Fees</h3>
            <p className="text-xs text-[#9A7080] font-bold mt-0.5">
              As of {new Date().toLocaleDateString("en-PH", { month: "long", day: "numeric", year: "numeric" })}
            </p>
          </div>
          {delinquent.length > 0 && (
            <div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-[#8C1535]"
              style={{ background: "rgba(140,21,53,0.08)" }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              {delinquent.length} Past Due
            </div>
          )}
        </div>

        <hr className="border-gray-100 mb-4" />

        <div className="mb-4">
          <div className="flex justify-between items-center mb-1">
            <p className="text-xs uppercase tracking-wider text-[#9A7080] font-bold">Total Overdue</p>
          </div>
          <p className="text-2xl font-bold text-[#000000]">
            {isLoading ? "—" : `₱${totalOverdue.toLocaleString("en-PH")}`}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl p-3" style={{ background: "rgba(140,21,53,0.05)" }}>
            <p className="text-xs text-gray-400 mb-1">Students Overdue</p>
            <p className="text-lg font-bold text-[#6B0F2B]">{isLoading ? "—" : uniqueStudents}</p>
          </div>
          <div className="rounded-xl p-3" style={{ background: "rgba(140,21,53,0.05)" }}>
            <p className="text-xs text-gray-400 mb-1">Oldest Due</p>
            <p className="text-sm font-bold text-[#6B0F2B]">
              {isLoading ? "—" : oldestDue ? fmt(oldestDue) : "None"}
            </p>
          </div>
        </div>

        <button
          className="mt-3 w-full py-2 rounded-xl text-xs font-bold text-white transition-all duration-200 hover:-translate-y-0.5 active:scale-95"
          style={{ background: "linear-gradient(135deg, #8C1535, #5A0D22)", boxShadow: "0 3px 8px rgba(140,21,53,0.3)" }}
        >
          Send Reminders to All
        </button>
      </Card>

      {/* PAYMENT VERIFICATIONS */}
      <Card>
        <div className="w-full h-full flex flex-col min-w-0">
          <div className="flex flex-row justify-between w-full pb-2">
            <p className="text-[#1A0008] font-bold flex flex-col">
              Payment Verifications
              <span className="italic font-normal text-[11px] lg:text-[12px]">
                {pendingPayments.length} pending verifications
              </span>
            </p>

            <p
              className="text-[#6B0F2B] font-bold text-sm hover:underline cursor-pointer"
              onClick={() => navigate("/landlord/fees")}
            >
              View all →
            </p>
          </div>

          {isLoading ? (
            <p className="text-xs text-gray-400 py-4 text-center">
              Loading…
            </p>
          ) : pendingPayments.length === 0 ? (
            <div className="flex-1 flex flex-col justify-center items-center text-center py-4">
              <p className="text-[#9A7080] font-medium text-sm">
                No pending payment verifications
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto border-t border-[#F5ECF0]">
              <div className="min-w-[400px] pb-3 xl:pb-0">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#F5ECF0] uppercase">
                      <th className="text-[#9A7080] tracking-widest text-xs font-bold p-1 text-left w-[45%]">
                        Student
                      </th>

                      <th className="text-[#9A7080] tracking-widest text-xs font-bold p-1 text-left w-[25%]">
                        Amount
                      </th>

                      <th className="text-[#9A7080] tracking-widest text-xs font-bold p-1 text-left w-[15%]">
                        Method
                      </th>

                      <th className="text-[#9A7080] tracking-widest text-xs font-bold p-1 text-center w-[15%]">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {pendingPayments.map((p) => {
                      const name = p.fee?.student?.user
                        ? `${p.fee.student.user.fname} ${p.fee.student.user.lname}`
                        : "Student";

                      const initial =
                        p.fee?.student?.user?.fname?.charAt(0)?.toUpperCase() ||
                        "S";

                      return (
                        <tr key={p.id}>
                          <td className="p-1 py-2">
                            <div className="flex flex-row items-center">
                              <div
                                className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center text-white text-xs font-bold"
                                style={{
                                  background:
                                    "linear-gradient(135deg, #6B0F2B, #9E2040)",
                                }}
                              >
                                {initial}
                              </div>

                              <div className="pl-2 min-w-0">
                                <p className="text-black text-sm truncate">
                                  {name}
                                </p>

                                <p className="text-[#9A7080] text-xs truncate">
                                  {p.fee?.feeCategory || "Payment"}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="p-1 py-2">
                            <p className="text-[#9A7080] text-sm font-medium">
                              ₱
                              {Number(p.paymentAmount).toLocaleString("en-PH")}
                            </p>
                          </td>

                          <td className="p-1 py-2">
                            <p className="text-[#9A7080] text-sm capitalize">
                              {p.modeOfPayment}
                            </p>
                          </td>

                          <td className="p-1 py-2 text-center">
                            <Button
                              variant="reddishPink"
                              size="sm"
                              className="!rounded-xl"
                            >
                              Review
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </Card>

    </div>
  );
}