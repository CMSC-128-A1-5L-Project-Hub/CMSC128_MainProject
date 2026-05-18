// src/components/BillingDashboard/BillingModal.tsx
import { useState, useRef } from "react";
import Button from '../Button';
import Modal from '../../components/Modal';
import cashIcon from "../../assets/icons/cash.svg";
import onlineIcon from "../../assets/icons/online.svg";
import downloadIcon from "../../assets/icons/download.svg";
import StylizedStatus from "./StylizedStatus";
import { useUploadPayment } from '../../../hooks/useBillingQueries';
import { downloadReport } from '../../api/downloadReport';
import type { Bill } from '../../pages/student/BillingDashboard';

interface BillingModalProps {
    bill: Bill;
    onClose: () => void;
    onSubmit?: (success: boolean) => void;   // called after successful payment
}

export default function BillingModal({ bill, onClose, onSubmit }: BillingModalProps) {
    const [isDownloading, setIsDownloading] = useState(false);
    const isPaid = bill.status === 'paid';

    const handleDownload = async () => {
        if (isDownloading) return;
        setIsDownloading(true);
        try {
            const date = new Date().toISOString().slice(0, 10);
            await downloadReport(
                `/fees/${bill.id}/statement.pdf`,
                `billing-statement-${bill.id}-${date}.pdf`
            );
        } catch (err) {
            console.error('Failed to download statement', err);
            alert('Could not generate the billing statement.');
        } finally {
            setIsDownloading(false);
        }
    };

    const [paymentMethod, setPaymentMethod] = useState("");
    const [confirmText, setConfirmText] = useState("");
    const [cashAmount, setCashAmount] = useState<number | undefined>();
    const [receiptFile, setReceiptFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const uploadMutation = useUploadPayment();

    const handleSubmit = async () => {
        if (!cashAmount || cashAmount <= 0) {
            alert("Please enter a valid amount.");
            return;
        }
        try {
            await uploadMutation.mutateAsync({
                feeId: bill.id,
                paymentAmount: cashAmount,
                modeOfPayment: paymentMethod,
                receiptFile: paymentMethod === 'online' ? receiptFile : null,
            });
            onClose();
            onSubmit?.(true);   // optional callback
        } catch (err: any) {
            onSubmit?.(false);
        }
    };

    // … (rest of the JSX is exactly the same as before – no changes needed)
    // I’m including the unchanged JSX for completeness

    return (
        <Modal open={true} onClose={onClose} title="Billing Statement" maxWidth="clamp(360px, 50vw, 640px)"
            footer={
                <div className='flex w-full justify-end'>
                    <Button onClick={handleSubmit} disabled={isPaid || confirmText.trim().toLowerCase() !== "confirm" || uploadMutation.isPending}
                        className='disabled:opacity-40 disabled:cursor-not-allowed' variant="primary">
                        {isPaid ? 'Paid' : uploadMutation.isPending ? 'Submitting…' : 'Submit'}
                    </Button>
                </div>
            }>
            <div className="flex flex-row items-start">
                <div className='flex flex-col w-full flex-[3]'>
                    <div className="flex flex-row justify-between w-full bg-gradient-to-br from-[#2A0410] via-[#6B0F2B] to-[#C05070] p-4 rounded-xl shrink-0">
                        <div>
                            <p className="uppercase font-bold text-white text-opacity-75 text-[12px]">Billing Statement</p>
                            <h1 className="font-bold text-[18px] text-white">₱{bill.amount.toLocaleString()}</h1>
                            <p className="text-white font-semibold capitalize text-opacity-55 text-[12px]">{bill.category}</p>
                        </div>
                        <button
                            type="button"
                            onClick={handleDownload}
                            disabled={isDownloading}
                            className="flex self-center transition-transform duration-150 hover:-translate-y-px hover:scale-105 active:scale-95 focus-visible:ring-red-900 flex-row text-[13px] text-white rounded-xl border-2 font-semibold border-white bg-white fill-white bg-opacity-25 disabled:opacity-50 disabled:cursor-not-allowed px-2 py-1">
                            <p>{isDownloading ? 'Downloading…' : 'Download'}</p>
                            <svg className='w-5 h-5 ml-2 mr-0 fill-white' viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path fillRule="evenodd" clipRule="evenodd" d="M8 10C8 7.79086 9.79086 6 12 6C14.2091 6 16 7.79086 16 10V11H17C18.933 11 20.5 12.567 20.5 14.5C20.5 16.433 18.933 18 17 18H16.9C16.3477 18 15.9 18.4477 15.9 19C15.9 19.5523 16.3477 20 16.9 20H17C20.0376 20 22.5 17.5376 22.5 14.5C22.5 11.7793 20.5245 9.51997 17.9296 9.07824C17.4862 6.20213 15.0003 4 12 4C8.99974 4 6.51381 6.20213 6.07036 9.07824C3.47551 9.51997 1.5 11.7793 1.5 14.5C1.5 17.5376 3.96243 20 7 20H7.1C7.65228 20 8.1 19.5523 8.1 19C8.1 18.4477 7.65228 18 7.1 18H7C5.067 18 3.5 16.433 3.5 14.5C3.5 12.567 5.067 11 7 11H8V10ZM13 11C13 10.4477 12.5523 10 12 10C11.4477 10 11 10.4477 11 11V16.5858L9.70711 15.2929C9.31658 14.9024 8.68342 14.9024 8.29289 15.2929C7.90237 15.6834 7.90237 16.3166 8.29289 16.7071L11.2929 19.7071C11.6834 20.0976 12.3166 20.0976 12.7071 19.7071L15.7071 16.7071C16.0976 16.3166 16.0976 15.6834 15.7071 15.2929C15.3166 14.9024 14.6834 14.9024 14.2929 15.2929L13 16.5858V11Z" />
                            </svg>  
                        </button>
                    </div>
                    <div className="flex w-full flex-row justify-between items-center border-2 border-opacity-10 border-[#6B0F2B] bg-[#FAF4F6] p-4 mt-4 rounded-xl shrink-0">
                        <div>
                            <p className="uppercase font-bold text-[#9A7080] text-opacity-55 text-[12px]">due date</p>
                            <h1 className="font-bold text-[18px] text-black">
                                {new Date(bill.due_date).toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'})}
                            </h1>
                            <p className="text-[#9A7080] font-semibold mt-1 text-[12px]">Balance: ₱{bill.balance.toLocaleString()}</p>
                        </div>
                        <StylizedStatus status={bill.status} />
                    </div>
                    <p className='uppercase font-bold text-[#6B4050] text-[13px] mt-2'>payment method</p>
                    <div className='grid grid-cols-2 grid-rows-1 gap-2 mt-1.5 text-[14px]'>
                        <button disabled={isPaid} onClick={() => {paymentMethod === "cash" ? setPaymentMethod("") : setPaymentMethod("cash")}}
                            className={`${paymentMethod === "cash" ? "border-[#9E2040]" : "border-opacity-30 border-[#C8B0B8]"} border-2 items-center py-2 px-3 flex flex-row transition-transform duration-150 hover:-translate-y-px hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:scale-100`}>
                            <img src={cashIcon} alt="cash" className="w-6 h-6 mr-2" /> Cash
                        </button>
                        <button disabled={isPaid} onClick={() => {paymentMethod === "online" ? setPaymentMethod("") : setPaymentMethod("online")}}
                            className={`${paymentMethod === "online" ? "border-[#9E2040]" : "border-opacity-30 border-[#C8B0B8]"} border-2 items-center py-2 px-3 flex flex-row transition-transform duration-150 hover:-translate-y-px hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:scale-100`}>
                            <img src={onlineIcon} alt="online" className="w-6 h-6 mr-2" /> Online
                        </button>
                    </div>
                    <div className="flex flex-row justify-between items-end mt-2">
                        <p className='uppercase font-bold text-[#6B4050] text-[13px]'>amount paid</p>
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${bill.allowInstallments ? 'text-emerald-800 bg-emerald-100' : 'text-[#9E2040] bg-[#FBE6EC]'}`}>
                            {bill.allowInstallments ? 'Installments allowed' : 'Full payment only'}
                        </span>
                    </div>
                    <p className='text-[11px] text-[#9A7080] mt-1'>
                        {bill.allowInstallments
                            ? `You may pay any amount up to ₱${bill.balance.toLocaleString()}.`
                            : `You must pay the exact remaining balance of ₱${bill.balance.toLocaleString()}.`}
                    </p>
                    <input value={cashAmount ?? ''} onChange={(e) => setCashAmount(e.target.value === '' ? undefined : Number(e.target.value))}
                        disabled={isPaid}
                        className='text-[14px] mt-2 p-4 placeholder-[#C8B0B8] text-[#6B4050] w-full h-12 border-2 border-[#C8B0B8] rounded-xl disabled:opacity-40 disabled:cursor-not-allowed'
                        type="number" inputMode="numeric" placeholder='Input amount' />
                    <div className={`${paymentMethod === "online" ? "" : "hidden"} flex flex-col`}>
                        <p className="uppercase font-bold text-[#6B4050] text-[13px] mt-2">upload receipts here</p>
                        <button type="button" onClick={() => fileInputRef.current?.click()}
                            className="flex flex-col border-dashed w-full h-30 border-2 border-[#C8B0B8] mt-2 items-center justify-center p-3">
                            {receiptFile ? (
                                <p className="text-[14px] text-green-700 font-bold">{receiptFile.name}</p>
                            ) : (
                                <>
                                    <img className="w-10 h-10 p-2 rounded-xl bg-[#F5ECF0]" src={downloadIcon} alt="" />
                                    <p className='text-[14px] text-[#1A0008] font-bold'>Upload Receipt</p>
                                    <p className='text-[12px] text-[#C8B0B8]'>PDF, JPG, or PNG • Max 5mb</p>
                                </>
                            )}
                            <input ref={fileInputRef} type="file" accept=".pdf,.jpg,.jpeg,.png"
                                onChange={(e) => setReceiptFile(e.target.files?.[0] ?? null)} className="hidden" />
                        </button>
                    </div>
                </div>
                <div className='hidden lg:flex flex-col flex-[2] gap-3 ml-8 bg-gradient-to-b from-[#000000]/5 via-[#ffffff] to-[#000000]/5 p-4'>
                    {[
                        { n: 1, title: 'Download Billing Statement', sub: "Know how much you're paying" },
                        { n: 2, title: 'Choose payment method', sub: "Choose whatever's comfortable" },
                        { n: 3, title: 'Upload Receipt', sub: 'Only if paid online' },
                        { n: 4, title: 'Submit when you are sure', sub: 'Check if receipt is correct' },
                    ].map(step => (
                        <div key={step.n} className='flex flex-row'>
                            <div className='w-8 h-8 bg-[#6B0F2B] border-2 border-[#C9973A]/40 rounded-full items-center justify-center flex shrink-0'>
                                <p className='text-white font-bold text-[14px]'>{step.n}</p>
                            </div>
                            <div className='flex flex-col ml-2 justify-center'>
                                <p className='text-black font-bold text-[11px]'>{step.title}</p>
                                <p className='text-[#C9973A] text-[10px] -mt-1'>{step.sub}</p>
                            </div>
                        </div>
                    ))}
                    <div className='flex flex-col bg-white'>
                        <p className="text-[#6B4050] font-bold text-[11px]">Description</p>
                        <p className='text-black text-opacity-70 text-[10px]'>Please review your billing statement carefully before making a payment. Ensure that the amount is correct and upload a valid, authentic receipt for verification.</p>
                    </div>
                    <div className='flex flex-col'>
                        <p className='text-[12px] font-bold text-[#6B4050]'>Type:</p>
                        <textarea className='text-[10px] h-20 text-black/50 bg-[#6B0F2B]/10 border-2 p-2 mt-1 disabled:opacity-40 disabled:cursor-not-allowed'
                            disabled={isPaid}
                            value={confirmText} onChange={(e) => setConfirmText(e.target.value)}
                            placeholder="By typing 'CONFIRM', you verify that the uploaded receipt is authentic and the payment amount is correct.">
                        </textarea>
                    </div>
                </div>
            </div>
        </Modal>
    )
}