import { useState } from "react";
import type { Tenant } from "../../pages/landlord/FeesPage";
import Modal from "../Modal";
import Button from "../Button";
import { api } from "../../api/axios";
import DocumentPreviewModal from "../applications/DocumentPreviewModal";

interface PaymentVerificationModalProps {
    tenant: Tenant;
    onClose: () => void;
    onReject?: () => void;
    onConfirmPayment?: (tenantId: number, approved: boolean) => void;
}

export default function PaymentVerificationModal({ tenant, onClose, onReject, onConfirmPayment }: PaymentVerificationModalProps) {
    const [isConfirming, setIsConfirming] = useState(false);
    const [preview, setPreview] = useState<{ url: string; name: string } | null>(null);

    const handleConfirm = async (approved: boolean) => {
        setIsConfirming(true);
        if (onConfirmPayment) {
            await onConfirmPayment(tenant.id, approved);
        }
        setIsConfirming(false);
        onClose();
    };

    const handleViewProof = async () => {
        try {
            const res = await api.get(`/payments/${tenant.id}/proof`)
            if (res.status === 200 && res.data?.url) {
                setPreview({ url: res.data.url, name: `${tenant.name} — Payment Proof` })
            } else {
                alert("Payment proof not available.")
            }
        } catch (err) {
            console.error(err)
            alert("Could not fetch payment proof.")
        }
    };

    return (
        <>
            <Modal open={true} onClose={onClose} title="PAYMENT VERIFICATION" maxWidth="clamp(400px, 60vw, 700px)">
                <div className='flex flex-col p-2'>
                    {/* Tenant Name */}
                    <div className='flex flex-col mb-6'>
                        <h2 className="text-2xl font-bold text-[#6B0F2B]">{tenant.name}</h2>
                    </div>

                    {/* Payment Details */}
                    <div className="mb-6">
                        <h3 className="text-md font-semibold text-[#6B0F2B] mb-3">Payment Details</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                                <span className="text-[#9A7080]">Name</span>
                                <span className="text-gray-800">{tenant.name.toLowerCase().replace(' ', '')}@gmail.com</span>
                            </div>
                            <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                                <span className="text-[#9A7080]">Payment Amount</span>
                                <span className="text-[#C9973A] font-semibold">
                                    ₱{tenant.amountDue?.toLocaleString()}
                                </span>
                            </div>
                            <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                                <span className="text-[#9A7080]">Method of Payment</span>
                                <span className="text-gray-800">Cash</span>
                            </div>
                        </div>
                    </div>

                    {/* Document Section */}
                    <div className="mb-6">
                        <h3 className="text-md font-semibold text-[#6B0F2B] mb-3">Document</h3>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                                <span className="text-[#9A7080]">Document File</span>
                                <Button
                                    variant="reddishPink"
                                    size="sm"
                                    fullWidth={false}
                                    onClick={handleViewProof}
                                >
                                    View Document
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-2 flex gap-3">
                        <Button
                            variant="reddishPink"
                            size="md"
                            fullWidth={true}
                            onClick={() => handleConfirm(true)}
                            isLoading={isConfirming}
                        >
                            Confirm Payment
                        </Button>
                        <Button
                            variant="secondary"
                            size="md"
                            fullWidth={true}
                            onClick={() => onReject?.()}
                        >
                            Reject
                        </Button>
                    </div>
                </div>
            </Modal>

            <DocumentPreviewModal
                open={!!preview}
                onClose={() => setPreview(null)}
                url={preview?.url ?? null}
                name={preview?.name ?? ""}
            />
        </>
    );
}