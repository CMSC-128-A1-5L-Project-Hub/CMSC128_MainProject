import { useState } from "react";
import type { Tenant } from "../../pages/landlord/FeesPage";
import Modal from "../Modal";
import Button from "../Button";

interface RejectModalProps {
    tenant: Tenant;
    onClose: () => void;
    onConfirmReject?: (tenantId: number, reason: string) => void;
}

export default function RejectModal({ tenant, onClose, onConfirmReject }: RejectModalProps) {
    const [rejectReason, setRejectReason] = useState("");
    const [isConfirming, setIsConfirming] = useState(false);

    const handleConfirmReject = async () => {
        setIsConfirming(true);
        if (onConfirmReject) {
            await onConfirmReject(tenant.id, rejectReason);
        }
        setIsConfirming(false);
        onClose();
    };

    return (
        <Modal open={true} onClose={onClose} title="REJECT APPLICATION" maxWidth="clamp(400px, 50vw, 520px)">
            <div className="p-4">
                <p className="text-gray-700 text-sm mb-4">
                    Please provide a reason for rejecting <span className="font-bold">{tenant.name}</span>'s application.
                </p>
                <textarea
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800 resize-none focus:outline-none focus:ring-1 focus:ring-[#6B0F2B] placeholder-gray-400"
                    rows={3}
                    placeholder="Enter rejection reason..."
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                />
                <div className="mt-4 flex gap-3">
                    <Button variant="secondary" size="md" fullWidth={true} onClick={onClose}>
                        Cancel
                    </Button>
                    <Button
                        variant="reddishPink"
                        size="md"
                        fullWidth={true}
                        disabled={!rejectReason.trim()}
                        onClick={handleConfirmReject}
                        isLoading={isConfirming}
                    >
                        Confirm Reject
                    </Button>
                </div>
            </div>
        </Modal>
    );
}