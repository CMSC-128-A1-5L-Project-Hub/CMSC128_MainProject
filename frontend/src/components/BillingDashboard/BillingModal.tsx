import { useEffect, useState } from "react";

import type {Bill} from '../../pages/student/BillingDashboard';
import Button from '../Button';
import Modal from '../../components/Modal';
import cashIcon from "../../assets/icons/cash.svg";
import onlineIcon from "../../assets/icons/online.svg";
import downloadIcon from "../../assets/icons/download.svg";
import StylizedStatus from "./StylizedStatus";

interface BillingModalProps {
    bill: Bill;
    onClose: () => void;
    onSubmit: () => void;
}

export default function BillingModal({bill, onClose, onSubmit}: BillingModalProps){
    const [paymentMethod, setPaymentMethod] = useState("");
    const [confirmText, setConfirmText] = useState("");
    const [cashAmount, setCashAmount] = useState<number>();
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [infoOpen, setInfoOpen] = useState(false);
    
    return (
        <Modal 
            open={true} 
            onClose={onClose}
            title="Billing Statement" 
            maxWidth="clamp(360px, 50vw, 640px)"
            footer={
                <div className='flex w-full justify-end'>    
                    <Button
                        onClick={() => { setIsSubmitted(true) }}
                        disabled={confirmText.trim().toLowerCase() !== "confirm"}
                        className='disabled:opacity-40 disabled:cursor-not-allowed'
                        variant="primary"
                        >
                        Submit
                    </Button>
                    <div className='lg:hidden w-full flex justify-end'>
                    <button
                        onClick={() => setInfoOpen(true)}
                        className='w-10 h-10 rounded-full bg-[#6B0F2B] flex items-center justify-center shadow-lg'
                    >
                        <p className='text-white font-bold text-[14px]'>?</p>
                    </button>
                </div>
                </div>
            }>
                <div className="flex flex-row items-stretch">
                    <div className='flex flex-col w-full flex-[3]'>
                        <div className="flex flex-row justify-between w-full bg-gradient-to-br from-[#2A0410] via-[#6B0F2B] to-[#C05070] p-4 rounded-xl shrink-0">
                            <div>
                                <p className="uppercase font-bold text-white text-opacity-75 text-[12px]">Billing Statement</p>
                                <h1 className="font-bold text-[18px] text-white">₱{bill.amount.toLocaleString()}</h1>
                                <p className="text-white font-semibold text-opacity-55 text-[12px]">{bill.dateIssued.toLocaleDateString('en-US', {month: 'long', day: 'numeric', year:'numeric'})}</p>
                            </div>
                            <button 
                            className="flex self-center transition-transform duration-150 hover:-translate-y-px hover:scale-105 active:scale-95 focus-visible:ring-red-900 flex-row text-[13px] text-white rounded-xl border-2 font-semibold border-white bg-white fill-white bg-opacity-25">
                                <p>Download</p>
                                <svg 
                                    className='w-5 h-5 ml-2 mr-0 fill-white'
                                    viewBox="0 0 24 24" 
                                    xmlns="http://www.w3.org/2000/svg">
                                    <path fillRule="evenodd" clipRule="evenodd" d="M8 10C8 7.79086 9.79086 6 12 6C14.2091 6 16 7.79086 16 10V11H17C18.933 11 20.5 12.567 20.5 14.5C20.5 16.433 18.933 18 17 18H16.9C16.3477 18 15.9 18.4477 15.9 19C15.9 19.5523 16.3477 20 16.9 20H17C20.0376 20 22.5 17.5376 22.5 14.5C22.5 11.7793 20.5245 9.51997 17.9296 9.07824C17.4862 6.20213 15.0003 4 12 4C8.99974 4 6.51381 6.20213 6.07036 9.07824C3.47551 9.51997 1.5 11.7793 1.5 14.5C1.5 17.5376 3.96243 20 7 20H7.1C7.65228 20 8.1 19.5523 8.1 19C8.1 18.4477 7.65228 18 7.1 18H7C5.067 18 3.5 16.433 3.5 14.5C3.5 12.567 5.067 11 7 11H8V10ZM13 11C13 10.4477 12.5523 10 12 10C11.4477 10 11 10.4477 11 11V16.5858L9.70711 15.2929C9.31658 14.9024 8.68342 14.9024 8.29289 15.2929C7.90237 15.6834 7.90237 16.3166 8.29289 16.7071L11.2929 19.7071C11.6834 20.0976 12.3166 20.0976 12.7071 19.7071L15.7071 16.7071C16.0976 16.3166 16.0976 15.6834 15.7071 15.2929C15.3166 14.9024 14.6834 14.9024 14.2929 15.2929L13 16.5858V11Z" />
                                </svg>  
                            </button>
                        </div>
                        <div className="flex w-full flex-row justify-between border-2 border-opacity-10 border-[#6B0F2B] bg-[#FAF4F6] p-4 mt-4 rounded-xl shrink-0">
                            <div>
                                <p className="uppercase font-bold text-[#9A7080] text-opacity-55 text-[12px]">due date</p>
                                <h1 className="font-bold text-[18px] text-black">{bill.endPeriod.toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'})}</h1>
                                <p className="text-[#9A7080] font-semibold text-opacity-55 text-[12px]">{bill.semester}</p>
                            </div>
                            <StylizedStatus status={bill.status} />
                        </div>
                        <p className='uppercase font-bold text-[#6B4050] text-[13px] mt-2'>payment method</p>
                        <div className='grid grid-cols-2 grid-rows-1 gap-2 mt-1.5 text-[14px]'>
                            <button 
                                onClick={() => {paymentMethod === "cash" ? setPaymentMethod("") : setPaymentMethod("cash")}}
                                className={` ${paymentMethod === "cash" ? "border-[#9E2040]" : "border-opacity-30 border-[#C8B0B8]"} border-2 items-center py-2 px-3 flex flex-row transition-transform duration-150 hover:-translate-y-px hover:scale-105 active:scale-95 focus-visible:ring-red-900 `}>
                                    <img src={cashIcon} alt="cash" className="w-6 h-6 mr-2" />
                                    <p>Cash</p>
                            </button>
                            <button 
                                onClick={() => {paymentMethod === "online" ? setPaymentMethod("") : setPaymentMethod("online")}}
                                className={` ${paymentMethod === "online" ? "border-[#9E2040]" : "border-opacity-30 border-[#C8B0B8]"} border-2 items-center py-2 px-3 flex flex-row transition-transform duration-150 hover:-translate-y-px hover:scale-105 active:scale-95 focus-visible:ring-red-900 `}>
                                    <img src={onlineIcon} alt="cash" className="w-6 h-6 mr-2" />
                                    <p>Online</p>
                            </button>
                        </div>
                        <p className={`uppercase font-bold text-[#6B4050] text-[13px] mt-2`}>amount paid</p>
                        <input 
                            value = {cashAmount}
                            onChange={(e) => setCashAmount(Number(e.target.value))}
                            className={`text-[14px] mt-2 p-4 placeholder-[#C8B0B8] text-[#6B4050] w-full h-12 border-2 border-[#C8B0B8] rounded-xl`} 
                            type="text" 
                            inputMode="numeric"
                            pattern="[0-9]*"
                            placeholder='Input amount' />
                        <p className={`${paymentMethod === "online" ? "" : "hidden"} uppercase font-bold text-[#6B4050] text-[13px] mt-2`}>upload receipts here</p>
                        <button className={` ${paymentMethod === "online" ? "" : "hidden"} flex flex-col border-dashed w-full h-30 border-2 border-[#C8B0B8] mt-2 items-center justify-center p-3 transition-transform duration-150 hover:-translate-y-px hover:scale-105 active:scale-95 focus-visible:ring-red-900 `}>
                            {/*placeholder icon*/}
                            <img className="w-10 h-10 p-2 rounded-xl bg-[#F5ECF0]" src={downloadIcon} alt="" />
                            <p className='text-[14px] text-[#1A0008] font-bold'>Upload Receipt</p>
                            <p className='text-[12px] text-[#C8B0B8]'>PDF, JPG, or PNG  •  Max 5mb</p>
                        </button>
                    </div>
                    {/* Desktop: always visible column */}
                    <div className='hidden lg:flex flex-col flex-[2] gap-3 ml-8 bg-gradient-to-b from-[#000000]/5 via-[#ffffff] to-[#000000]/5 p-4'>
                        {/* Steps - same as desktop */}
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
                        <div className='flex flex-col bg-white mt-auto'>
                            <p className = " text-[#6B4050] font-bold text-[11px]">Description</p>
                            <p className=' text-black text-opacity-70 text-[10px]'>Please review your billing statement carefully before making a payment. Ensure that the amount is correct and upload a valid, authentic receipt for verification. Kindly check your payment status from time to time.</p>
                        </div>
                        <div className='flex flex-col'>
                            <p className='text-[12px] font-bold text-[#6B4050]'>Type:</p>
                            <textarea 
                                className='text-[10px] h-20 text-black/50 bg-[#6B0F2B]/10 border-2 p-2 mt-1'
                                value={confirmText}
                                onChange={(e) => setConfirmText(e.target.value)}
                                name="" 
                                id=""
                                placeholder='By typing ‘CONFIRM’, you verify that the uploaded receipt is authentic and the payment amount is correct.'>
                            </textarea>
                        </div>
                    </div>
                    {/* Mobile info button + panel - outside modal */}
                    <div className='lg:hidden'>
                        <button
                            onClick={() => setInfoOpen(true)}
                            className='fixed bottom-6 right-6 z-[10001] w-10 h-10 rounded-full bg-[#6B0F2B] flex items-center justify-center shadow-lg transition-transform duration-150 hover:-translate-y-px hover:scale-105 active:scale-95 focus-visible:ring-red-900 '
                        >
                            <p className='sticky bottom-4 left-full text-white font-bold text-[14px]'>?</p>
                        </button>

                        {infoOpen && (
                            <div
                                className='fixed inset-0 z-[10001] bg-black/40'
                                onClick={() => setInfoOpen(false)}
                            />
                        )}

                        <div className={`fixed top-0 right-0 bottom-0 z-[10002] w-[80%] bg-white p-6 flex flex-col gap-3 shadow-xl transition-transform duration-300 ease-in-out ${infoOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                            <div className='flex justify-between items-center mb-2'>
                                <p className='font-bold text-[#6B0F2B] text-[14px]'>How it works</p>
                                <button onClick={() => setInfoOpen(false)} className='text-[#9A7080] text-xl'>✕</button>
                            </div>

                            {/* Steps - same as desktop */}
                            {[
                                { n: 1, title: 'Download Billing Statement', sub: "Know how much you're paying" },
                                { n: 2, title: 'Choose payment method', sub: "Choose whatever's comfortable" },
                                { n: 3, title: 'Upload Receipt', sub: 'Only if paid online' },
                                { n: 4, title: 'Submit when you are sure', sub: 'Check if receipt is correct' },
                            ].map(step => (
                                <div key={step.n} className='flex flex-row'>
                                    <div className='w-8 h-8 bg-[#6B0F2B] rounded-full items-center justify-center flex shrink-0'>
                                        <p className='text-white font-bold text-[14px]'>{step.n}</p>
                                    </div>
                                    <div className='flex flex-col ml-2 justify-center'>
                                        <p className='text-black font-bold text-[12px]'>{step.title}</p>
                                        <p className='text-[#C9973A] text-[10px] -mt-1'>{step.sub}</p>
                                    </div>
                                </div>
                            ))}

                            <div className='flex flex-col bg-[#6B0F2B] bg-opacity-10 p-2 mt-auto rounded-xl'>
                                <p className='text-[#6B4050] font-bold text-[12px]'>Description</p>
                                <p className='text-black text-opacity-70 text-[10px]'>Please review your billing statement carefully before making a payment. Ensure that the amount is correct and upload a valid, authentic receipt for verification. Kindly check your payment status from time to time.</p>
                            </div>
                        </div>
                    </div>   
                </div>
            </Modal>
    )
}