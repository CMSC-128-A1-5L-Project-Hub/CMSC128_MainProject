import { useState, useEffect } from "react";
import Modal from "../../../Modal";
import Button from "../../../Button";
import { CheckCircle } from "lucide-react";
import type { Room, InstallmentPlan } from "../../../../pages/landlord/RoomPage";

interface BillingModalProps {
  open: boolean;
  room: Room | null;
  onClose: () => void;
  onGenerate: (data: {
    tenantId: number | "all";
    month: string;
    year: string;
    amount: number;
    installmentPlan: InstallmentPlan;
  }) => Promise<void>;
}

export default function BillingModal({ open, room, onClose, onGenerate }: BillingModalProps) {
  const [billingTenantId, setBillingTenantId] = useState<number | "all">("all");
  const [billingMonth, setBillingMonth] = useState<string>("");
  const [billingYear, setBillingYear] = useState<string>("");
  const [billingAmount, setBillingAmount] = useState<string>("");
  const [installmentPlan, setInstallmentPlan] = useState<InstallmentPlan>("full");
  const [billingSuccess, setBillingSuccess] = useState(false);

  useEffect(() => {
    if (open && room) {
      setBillingTenantId("all");
      setBillingMonth(new Date().getMonth().toString());
      setBillingYear(new Date().getFullYear().toString());
      setBillingAmount(room.price.toString());
      setInstallmentPlan("full");
      setBillingSuccess(false);
    }
  }, [open, room]);

  if (!open || !room) return null;

  const handleGenerate = async () => {
    await onGenerate({
      tenantId: billingTenantId,
      month: billingMonth,
      year: billingYear,
      amount: parseFloat(billingAmount),
      installmentPlan,
    });
    setBillingSuccess(true);
    setTimeout(() => onClose(), 2000);
  };

  const amountNum = parseFloat(billingAmount) || 0;

  return (
    <Modal open={open} onClose={onClose} title={`Generate Billing Statement - ${room.name}`}>
      {billingSuccess ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <p className="text-lg font-semibold text-green-800">Billing statement generated!</p>
          <p className="text-sm text-gray-500 mt-2">The statement has been sent to the tenant(s).</p>
        </div>
      ) : (
        <div className="space-y-5">
          {room.occupants.length > 1 && (
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-semibold tracking-wide text-[#7a001f]">BILL FOR</label>
              <select
                value={billingTenantId}
                onChange={(e) => setBillingTenantId(e.target.value === "all" ? "all" : parseInt(e.target.value))}
                className="border border-[#e5cfd4] rounded-xl p-3 text-sm w-full focus:outline-none focus:ring-2 focus:ring-[#7a001f]/30"
              >
                <option value="all">All tenants in this room</option>
                {room.occupants.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-semibold tracking-wide text-[#7a001f]">MONTH</label>
              <select
                value={billingMonth}
                onChange={(e) => setBillingMonth(e.target.value)}
                className="border border-[#e5cfd4] rounded-xl p-3 text-sm w-full focus:outline-none focus:ring-2 focus:ring-[#7a001f]/30"
              >
                {["January","February","March","April","May","June","July","August","September","October","November","December"].map((m, idx) => (
                  <option key={m} value={idx}>{m}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-semibold tracking-wide text-[#7a001f]">YEAR</label>
              <input
                type="number"
                value={billingYear}
                onChange={(e) => setBillingYear(e.target.value)}
                className="border border-[#e5cfd4] rounded-xl p-3 text-sm w-full focus:outline-none focus:ring-2 focus:ring-[#7a001f]/30"
                placeholder="2025"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-semibold tracking-wide text-[#7a001f]">INSTALLMENT PLAN</label>
            <div className="space-y-2">
              <label className="flex items-center gap-3 p-2 rounded-lg border border-[#e5cfd4] hover:bg-[#F9F6F7] cursor-pointer">
                <input type="radio" name="installment" checked={installmentPlan === "full"} onChange={() => setInstallmentPlan("full")} className="w-4 h-4 text-[#8C1535]" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">Full Payment (1 month)</p>
                  <p className="text-xs text-gray-500">Pay the full amount ₱{amountNum.toLocaleString()} now</p>
                </div>
                {installmentPlan === "full" && <CheckCircle size={16} className="text-[#8C1535]" />}
              </label>
              <label className="flex items-center gap-3 p-2 rounded-lg border border-[#e5cfd4] hover:bg-[#F9F6F7] cursor-pointer">
                <input type="radio" name="installment" checked={installmentPlan === "monthly"} onChange={() => setInstallmentPlan("monthly")} className="w-4 h-4 text-[#8C1535]" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">Monthly Installment (3 months)</p>
                  <p className="text-xs text-gray-500">₱{(amountNum / 3).toLocaleString()} / month for 3 months</p>
                </div>
                {installmentPlan === "monthly" && <CheckCircle size={16} className="text-[#8C1535]" />}
              </label>
              <label className="flex items-center gap-3 p-2 rounded-lg border border-[#e5cfd4] hover:bg-[#F9F6F7] cursor-pointer">
                <input type="radio" name="installment" checked={installmentPlan === "semestral"} onChange={() => setInstallmentPlan("semestral")} className="w-4 h-4 text-[#8C1535]" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">Semestral Installment (6 months)</p>
                  <p className="text-xs text-gray-500">₱{(amountNum / 6).toLocaleString()} / month for 6 months</p>
                </div>
                {installmentPlan === "semestral" && <CheckCircle size={16} className="text-[#8C1535]" />}
              </label>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-semibold tracking-wide text-[#7a001f]">TOTAL AMOUNT (₱)</label>
            <input
              type="number"
              value={billingAmount}
              onChange={(e) => setBillingAmount(e.target.value)}
              className="border border-[#e5cfd4] rounded-xl p-3 text-sm w-full focus:outline-none focus:ring-2 focus:ring-[#7a001f]/30"
              placeholder="0.00"
            />
            <p className="text-[10px] text-gray-400 mt-1">Base rent per month. Adjust if needed.</p>
          </div>

          <Button className="w-full py-2.5 mt-2" onClick={handleGenerate}>Generate Statement</Button>
        </div>
      )}
    </Modal>
  );
}