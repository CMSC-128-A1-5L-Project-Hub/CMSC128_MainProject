import { useState } from "react";
import type { Tenant } from "../../pages/landlord/FeesPage";
import Modal from "../Modal";
import Button from "../Button";

interface OverdueFeesModalProps {
    tenant: Tenant;
    onClose: () => void;
    onSendReminder?: (tenantId: number) => void;
}

export default function OverdueFeesModal({ tenant, onClose, onSendReminder }: OverdueFeesModalProps) {
    const [isSending, setIsSending] = useState(false);

    const dueDate = new Date(tenant.dateConfirmed);
    const today = new Date();
    const daysOverdue = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));

    const handleSendReminder = async () => {
        setIsSending(true);
        if (onSendReminder) {
            await onSendReminder(tenant.id);
        }
        setIsSending(false);
    };

    return (
        <Modal open={true} onClose={onClose} title="OVERDUE FEE" maxWidth="clamp(400px, 60vw, 700px)">
            <div className='flex flex-col p-2'>
                {/* Tenant Name */}
                <div className='flex flex-col mb-6'>
                    <h2 className="text-2xl font-bold text-[#6B0F2B]">{tenant.name}</h2>
                </div>

                {/* Due Date Section */}
                <div className="mb-6">
                    <h3 className="text-md font-semibold text-[#9E2040] mb-2">Due Date</h3>
                    <p className="text-[15px] text-gray-800">
                        {dueDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>
                    <p className="text-sm text-red-500 mt-1">
                        {daysOverdue} days ago
                    </p>
                </div>

                {/* Room Details */}
                <div className="mb-6">
                    <h3 className="text-md font-semibold text-[#6B0F2B] mb-2">Room</h3>
                    <p className="text-[15px] text-gray-800">
                        Room Number {tenant.roomNumber}
                    </p>
                    <p className="text-sm text-[#9A7080]">
                        {tenant.building}
                    </p>
                </div>

                {/* Occupancy Details */}
                <div className="mb-6">
                    <h3 className="text-md font-semibold text-[#6B0F2B] mb-2">Occupancy Details</h3>
                    <div className="space-y-1">
                        <p className="text-[15px] text-gray-800">
                            Semester: 2, AY 2025–2026
                        </p>
                        <p className="text-sm text-[#9A7080]">
                            Duration: January 2026 – May 2026
                        </p>
                    </div>
                </div>

                {/* Amount Due */}
                <div className="mb-6 pb-4 border-b border-[#6B0F2B]/10">
                    <div className="flex justify-between items-center">
                        <span className="text-md font-semibold text-[#6B0F2B]">Amount Due</span>
                        <span className="text-xl font-bold text-[#9E2040]">
                            ₱{tenant.amountDue?.toLocaleString()}
                        </span>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-2 flex gap-3">
                    <Button
                        variant="reddishPink"
                        size="md"
                        fullWidth={true}
                        onClick={handleSendReminder}
                        isLoading={isSending}
                    >
                        Send Reminder
                    </Button>
                </div>
            </div>
        </Modal>
    );
}