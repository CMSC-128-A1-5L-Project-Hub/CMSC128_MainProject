import { useState, useEffect, useRef } from "react";
import Modal from "../../../Modal";
import Button from "../../../Button";
import { CheckCircle, CreditCard, FileText } from "lucide-react";
import type { Room } from "../../../../pages/landlord/RoomPage";

interface BillingModalProps {
  open: boolean;
  room: Room | null;
  onClose: () => void;
  onGenerate: (data: {
    tenantId: number | "all";
    month: string;
    year: string;
    amount: number;
    allowInstallments: boolean;
  }) => Promise<void>;
}

export default function BillingModal({ open, room, onClose, onGenerate }: BillingModalProps) {
  const [billingTenantId, setBillingTenantId] = useState<number | "all">("all");
  const [billingMonth, setBillingMonth] = useState<string>("");
  const [billingYear, setBillingYear] = useState<string>("");
  const [billingAmount, setBillingAmount] = useState<string>("");
  const [allowInstallments, setAllowInstallments] = useState(false);
  const [billingSuccess, setBillingSuccess] = useState(false);

  // Hold the last known room so content doesn't wipe during close animation
  const lastRoom = useRef<Room | null>(room);
  if (room) lastRoom.current = room;
  const displayRoom = lastRoom.current;

  useEffect(() => {
    if (open && room) {
      setBillingTenantId("all");
      setBillingMonth(new Date().getMonth().toString());
      setBillingYear(new Date().getFullYear().toString());
      setBillingAmount(room.price.toString());
      setAllowInstallments(false);
      setBillingSuccess(false);
    }
  }, [open, room]);

  const MAX_AMOUNT = 99_999_999.99

  const parsedAmount = parseFloat(billingAmount)
  const amountTooLarge = !isNaN(parsedAmount) && parsedAmount > MAX_AMOUNT

  // No early return — let Modal handle its own visibility and animation
  const handleGenerate = async () => {
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      alert("Please enter a valid amount.")
      return
    }
    if (parsedAmount > MAX_AMOUNT) {
      alert(`Amount cannot exceed ₱${MAX_AMOUNT.toLocaleString()}.`)
      return
    }
    await onGenerate({
      tenantId: billingTenantId,
      month: billingMonth,
      year: billingYear,
      amount: parsedAmount,
      allowInstallments,
    });
    setBillingSuccess(true);
    setTimeout(() => onClose(), 2000);
  };

  return (
    <Modal open={open} onClose={onClose} title={displayRoom ? `Generate Billing - ${displayRoom.name}` : "Generate Billing"}>
      {billingSuccess ? (
        <div className="text-center py-6 sm:py-8">
          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
            <CheckCircle className="w-7 h-7 sm:w-8 sm:h-8 text-green-600" />
          </div>
          <p className="text-base sm:text-lg font-semibold text-green-800">Billing statement generated!</p>
          <p className="text-xs sm:text-sm text-gray-500 mt-2">The statement has been sent to the tenant(s).</p>
        </div>
      ) : displayRoom ? (
        <div className="space-y-4 sm:space-y-5">
          <div className="bg-[#F9F6F7] rounded-xl p-3 sm:p-4 space-y-1.5 sm:space-y-2">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <FileText size={14} className="sm:w-4 sm:h-4 text-[#8C1535]" />
              <span className="text-xs sm:text-sm font-semibold text-[#4A1F2D]">Room Summary</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5 sm:gap-2 text-[10px] sm:text-xs">
              <div><p className="text-gray-500">Room</p><p className="font-semibold">{displayRoom.name}</p></div>
              <div><p className="text-gray-500">Type</p><p className="font-semibold">{displayRoom.type}</p></div>
              <div><p className="text-gray-500">Capacity</p><p className="font-semibold">{displayRoom.currentOccupancy}/{displayRoom.capacity}</p></div>
            </div>
          </div>

          {displayRoom.currentOccupancy > 1 && (
            <div className="flex flex-col gap-1">
              <label className="text-[9px] sm:text-[10px] font-semibold tracking-wide text-[#7a001f]">BILL FOR</label>
              <select
                value={billingTenantId}
                onChange={(e) => setBillingTenantId(e.target.value === "all" ? "all" : parseInt(e.target.value))}
                className="border border-[#e5cfd4] rounded-xl p-2.5 sm:p-3 text-xs sm:text-sm w-full focus:outline-none focus:ring-2 focus:ring-[#7a001f]/30"
              >
                <option value="all">All tenants in this room</option>
                {displayRoom.occupants.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-[9px] sm:text-[10px] font-semibold tracking-wide text-[#7a001f]">MONTH</label>
              <select
                value={billingMonth}
                onChange={(e) => setBillingMonth(e.target.value)}
                className="border border-[#e5cfd4] rounded-xl p-2.5 sm:p-3 text-xs sm:text-sm w-full focus:outline-none focus:ring-2 focus:ring-[#7a001f]/30"
              >
                {["January","February","March","April","May","June","July","August","September","October","November","December"].map((m, idx) => (
                  <option key={m} value={idx}>{m}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[9px] sm:text-[10px] font-semibold tracking-wide text-[#7a001f]">YEAR</label>
              <input
                type="number"
                value={billingYear}
                onChange={(e) => setBillingYear(e.target.value)}
                className="border border-[#e5cfd4] rounded-xl p-2.5 sm:p-3 text-xs sm:text-sm w-full focus:outline-none focus:ring-2 focus:ring-[#7a001f]/30"
                placeholder="2025"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[9px] sm:text-[10px] font-semibold tracking-wide text-[#7a001f]">TOTAL AMOUNT (₱)</label>
            <input
              type="number"
              value={billingAmount}
              onChange={(e) => setBillingAmount(e.target.value)}
              max={MAX_AMOUNT}
              className={`border ${amountTooLarge ? 'border-red-500' : 'border-[#e5cfd4]'} rounded-xl p-2.5 sm:p-3 text-xs sm:text-sm w-full focus:outline-none focus:ring-2 focus:ring-[#7a001f]/30`}
              placeholder="0.00"
            />
            {amountTooLarge ? (
              <p className="text-[8px] sm:text-[10px] text-red-600 mt-1">Amount cannot exceed ₱{MAX_AMOUNT.toLocaleString()}.</p>
            ) : (
              <p className="text-[8px] sm:text-[10px] text-gray-400 mt-1">Base rent per month. Adjust if needed. Max ₱{MAX_AMOUNT.toLocaleString()}.</p>
            )}
          </div>

          <button
            type="button"
            onClick={() => setAllowInstallments(!allowInstallments)}
            className={`w-full flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl border-2 transition-all duration-200 ${
              allowInstallments
                ? "bg-emerald-50 border-emerald-300 shadow-sm"
                : "bg-white border-[#e5cfd4] hover:border-gray-300"
            }`}
          >
            <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-colors ${
              allowInstallments ? "bg-emerald-600" : "bg-gray-200"
            }`}>
              <CreditCard size={16} className="sm:w-[18px] sm:h-[18px] text-white" />
            </div>
            <div className="flex-1 text-left">
              <p className={`text-xs sm:text-sm font-semibold ${allowInstallments ? "text-emerald-800" : "text-gray-700"}`}>
                {allowInstallments ? "Installment Payment Allowed" : "Full Payment Only"}
              </p>
              <p className="text-[9px] sm:text-[10px] text-gray-500">
                {allowInstallments ? "Student can pay this bill in installments" : "Student must pay the full amount upfront"}
              </p>
            </div>
            <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-md border-2 flex items-center justify-center transition-colors ${
              allowInstallments ? "bg-emerald-600 border-emerald-600" : "border-gray-300"
            }`}>
              {allowInstallments && <CheckCircle size={12} className="sm:w-[14px] sm:h-[14px] text-white" />}
            </div>
          </button>

          <Button className="w-full py-2 sm:py-2.5 mt-2 text-xs sm:text-sm" onClick={handleGenerate} disabled={amountTooLarge || !billingAmount}>
            Generate Statement
          </Button>
        </div>
      ) : null}
    </Modal>
  );
}