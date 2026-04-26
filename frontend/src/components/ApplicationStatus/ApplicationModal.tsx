import { useState } from "react";
import type { Application } from "../../pages/student/ApplicationStatus";
import StylizedStatus from "../BillingDashboard/StylizedStatus";
import Modal from "../Modal";

interface ApplicationModalProps {
    application: Application;
    onClose: () => void;
    onSubmit: () => void;
}

function timeAgo(date: Date) {
    const diff = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (diff === 0) return 'today';
    if (diff === 1) return 'yesterday';
    return `${diff} days ago`;
}

export default function ApplicationModal({application, onClose, onSubmit}: ApplicationModalProps){
    const [cancelOpen, setCancelOpen] = useState(false);
    const [typed, setTyped] = useState("");
    const [typedCancel, setTypedCancel] = useState(false);
    const [confirmCancel, setConfirmCancel] = useState(false);
    
    return (
        <Modal open={true} onClose={onClose} title="Application Status" maxWidth="clamp(360px, 50vw, 600px)">
            <div className='flex flex-col'>
                {/*pede pa palitan to para scrollable siya, di ko lang alam pano format ng data kaya ganto muna*/}
                <img src={application.image} alt="" className='h-28 w-full mb-3 rounded-xl object-cover' />
                
                <div className='flex flex-row p-0 justify-between'>
                    <div className='flex flex-col w-52'>
                        <p className="text-[14px] font-bold">{application.dormitory}</p>
                        <p className='text-[11px] pr-2'>{application.address}</p>
                        <p className="text-[11px] text-[#9A7080]">{application.room_type} • {application.location}</p>
                    </div>
                    <div className='flex flex-col center-self'>
                        <p className='text-[#9A7080] uppercase font-bold text-[12px]'>monthly rate</p>
                        <p className='font-bold text-[#C9973A] -mt-1 text-[18px]'>₱{application.rent.toLocaleString()}</p>
                        <p className='text-[#9A7080] text-[12px] -mt-1'>per month</p>
                    </div>
                </div>
                {/* <div className='mt-3 flex flex-row justify-between'>
                    <div className='flex flex-col items-center text-center justify-center'>
                        <div className='rounded-full w-10 h-10 bg-[#1A7A4A] flex items-center justify-center'>
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none">
                                <path d="M20 6L9 17L4 12" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </div>
                        <p className='text-[#1A7A4A] text-[11px] font-bold'>Submitted</p>
                        <p className='text-[#9A7080] text-[9px] -mt-1'>
                            {application.application_date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                    </div>

                    <div className='flex flex-col items-center text-center justify-center'>
                        <div className='rounded-full w-10 h-10 flex items-center justify-center'
                            style={{ backgroundColor: isFinal ? '#1A7A4A' : statusStyles[application.status]?.bg ?? '#ccc' }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none">
                                <path d="M20 6L9 17L4 12" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </div>
                        <p className='text-[11px] capitalize font-bold'
                            style={{ color: isFinal ? '#1A7A4A' : statusStyles[application.status]?.text ?? '#ccc' }}>
                            {application.status.replace('_', ' ')}
                        </p>
                        <p className='text-[#9A7080] text-[9px] -mt-1'>-</p>
                    </div>

                    <div className='flex flex-col items-center text-center justify-center'>
                        <div className='rounded-full w-10 h-10 flex items-center justify-center'
                            style={{ backgroundColor: step3Style?.bg ?? '#e5e7eb' }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none">
                                <path d="M20 6L9 17L4 12" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </div>
                        <p className='text-[11px] capitalize font-bold'
                            style={{ color: step3Style?.text ?? '#9ca3af' }}>
                            {isApproved ? 'Approved' : isWaitlisted ? 'Waitlisted' : 'Pending'}
                        </p>
                        <p className='text-[#9A7080] text-[9px] -mt-1'>
                            -
                        </p>
                    </div>
                </div> */}
                <p className='uppercase pt-3 pb-1 font-bold text-[12px] text-[#9A7080]'>application information</p>
                <div className='w-full grid grid-cols-2 grid-rows-3 lg:grid-cols-3 lg:grid-rows-2'>
                    <div className='flex flex-col'>
                        <p className='uppercase font-bold text-[11px] text-[#6B4050]'>application id</p>
                        <p className='font-bold truncate text-[11px]'>{application.id}</p>
                    </div>
                    <div className='flex flex-col'>
                        <p className='uppercase font-bold text-[11px] text-[#6B4050]'>current status</p>
                        <StylizedStatus
                            status={application.status}>

                        </StylizedStatus>
                    </div>
                    <div className='flex flex-col'>
                        <p className='uppercase font-bold text-[11px] text-[#6B4050]'>date applied</p>
                        <p className='font-bold text-[11px]'>
                            {application.application_date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                        <p className='text-[#9A7080] text-[9px]'>{timeAgo(application.application_date)}</p>
                    </div>    
                </div>
                <p className='uppercase pt-3 pb-1 font-bold text-[12px] text-[#9A7080]'>landlord remarks</p>
                <div className='w-full h-30 text-[11px] border-2 border-[#6B0F2B] border-opacity-5 rounded-xl p-2 text-[#9A7080] bg-[#FAF4F6]'>{application.rejection_reason ?? "No remarks by admin"}</div>
                
                <div className='flex flex-row gap-1 justify-end mt-2'>
                    <p className='hidden text-[9px] border-2 border-[#6B0F2B] border-opacity-5 rounded-xl p-2 text-[#9A7080] bg-[#FAF4F6]'>By typing “CANCEL”, you are sure to cancel your application to this accommodation</p>
                    <button className={`${application.status !== "approved" ? "hidden" : ""} text-[13px] py-0 px-4 h-10 font-bold text-white rounded-[100px] bg-gradient-to-br from-[#6B0F2B] to-[#9E2040] border-0`}>Accept</button>
                    <button 
                        onClick={() => setCancelOpen(true)}
                        className='text-[13px] font-bold text-white rounded-[100px] bg-gradient-to-br from-[#F3C9D9] to-[#3D2E2E] border-0'>Cancel</button>
                </div>
            </div>

            {cancelOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-40 z-[10000] flex items-center justify-center">
                    <div className="bg-white rounded-xl p-4 w-[60%] shadow-xl">
                        <div className="flex items-center gap-2 border-2 border-[#6B0F2B] border-opacity-10 rounded-[8.8px] px-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24">
                                <path stroke="#9A7080" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m21 21-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0Z"/>
                            </svg>
                            <input
                                autoFocus
                                type="text"
                                placeholder=""
                                value={typed}
                                onChange={(e) => { setTyped(e.target.value); }}
                                className="text-[12px] py-2 outline-none w-full"
                            />
                        </div>
                        <button onClick={() => {
                            const isCancel = typed.toLowerCase() === "cancel";
                            setTypedCancel(isCancel);
                            if (isCancel) {
                                setConfirmCancel(true);
                                setCancelOpen(false);
                            }}}
                            className="mt-3 text-[12px] text-[#9A7080] w-full text-center">
                            Confirm
                        </button>
                        <button onClick={() => {setCancelOpen(false);}} className="mt-3 text-[12px] text-[#9A7080] w-full text-center">
                            Cancel
                        </button>
                    </div>
                </div>
            )}
            {confirmCancel && (
                <div className="fixed inset-0 bg-black bg-opacity-40 z-[11000] flex items-center justify-center">
                    <div className="bg-white rounded-xl p-4 w-[60%] shadow-xl">
                        <p>You have successfully cancelled your application</p>
                        <button onClick={() => { setConfirmCancel(false); onSubmit(); }} className="mt-3 text-[12px] text-[#9A7080] w-full text-center">
                            Close
                        </button>
                    </div>
                </div>
            )}
        </Modal>

        
    )
}