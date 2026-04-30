import { useState } from "react";
import type { Tenant } from "../../pages/landlord/FeesPage";
import Modal from "../Modal";
import Button from "../Button";

interface PaymentVerificationModalProps {
    tenant: Tenant;
    onClose: () => void;
    onConfirmPayment?: (tenantId: number, approved: boolean) => void;
}

export default function PaymentVerificationModal({ tenant, onClose, onConfirmPayment }: PaymentVerificationModalProps) {
    const [isConfirming, setIsConfirming] = useState(false);
    const [showDocumentModal, setShowDocumentModal] = useState(false);
    const [rejectReason, setRejectReason] = useState("");

    const handleConfirm = async (approved: boolean) => {
        setIsConfirming(true);
        if (onConfirmPayment) {
            await onConfirmPayment(tenant.id, approved);
        }
        setIsConfirming(false);
        onClose();
    };

    // Mock document image URL
    const documentImageUrl = "/document-placeholder.png";

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
                                    onClick={() => setShowDocumentModal(true)}
                                >
                                    View Document
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-2 flex gap-3 items-end">
                        <textarea
                            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800 resize-none focus:outline-none focus:ring-1 focus:ring-[#6B0F2B] placeholder-gray-400"
                            rows={2}
                            placeholder="Reason for rejection..."
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                        />
                        <div className="flex flex-col gap-2">
                            <Button
                                variant="secondary"
                                size="md"
                                fullWidth={false}
                                onClick={() => handleConfirm(false)}
                                isLoading={isConfirming}
                                disabled={!rejectReason.trim()}
                            >
                                Reject
                            </Button>
                            <Button
                                variant="reddishPink"
                                size="md"
                                fullWidth={false}
                                onClick={() => handleConfirm(true)}
                                isLoading={isConfirming}
                            >
                                Confirm Payment
                            </Button>
                        </div>
                    </div>
                </div>
            </Modal>

            {/* Document Image Modal */}
            {showDocumentModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-[10000] flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-auto">
                        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                            <h3 className="text-lg font-semibold text-[#6B0F2B]">Document</h3>
                            <button
                                onClick={() => setShowDocumentModal(false)}
                                className="text-gray-500 hover:text-gray-700 text-2xl"
                            >
                                ×
                            </button>
                        </div>
                        <div className="p-6">
                            <div className="flex justify-center items-center min-h-[300px] bg-gray-100 rounded-lg overflow-hidden">
                                <img
                                    src={documentImageUrl}
                                    alt="Document"
                                    className="max-w-full h-auto object-contain"
                                    onError={(e) => {
                                        e.currentTarget.src = "https://placehold.co/600x400/6B0F2B/white?text=Document+Placeholder";
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}