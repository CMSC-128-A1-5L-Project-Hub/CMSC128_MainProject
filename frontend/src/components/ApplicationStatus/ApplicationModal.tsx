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

export default function ApplicationModal({ application, onClose, onSubmit }: ApplicationModalProps) {
    const [cancelOpen, setCancelOpen] = useState(false);
    const [typed, setTyped] = useState("");
    const [confirmCancel, setConfirmCancel] = useState(false);

    const applicationDate = new Date(application.applicationDate);

    return (
        <Modal open={true} onClose={onClose} title="Application Status" maxWidth="clamp(360px, 50vw, 600px)">
            <div className='flex flex-col'>
                <div className='flex flex-row p-0 justify-between'>
                    <div className='flex flex-col w-52'>
                        <p className="text-[14px] font-bold">{application.accommodation.accommodationName}</p>
                        <p className="text-[11px] text-[#9A7080]">
                            {application.applicationRoomType} • {application.accommodation.accommodationLocation}
                        </p>
                        <p className="text-[11px] text-[#9A7080]">
                            {application.accommodation.accommodationType}
                        </p>
                    </div>
                    <div className='flex flex-col center-self'>
                        <p className='text-[#9A7080] uppercase font-bold text-[12px]'>stay type</p>
                        <p className='font-bold text-[#C9973A] -mt-1 text-[14px] capitalize'>
                            {application.applicationStayType.replace('_', ' ')}
                        </p>
                        <p className='text-[#9A7080] text-[12px] -mt-1'>{application.durationOfStayDays} days</p>
                    </div>
                </div>

                <p className='uppercase pt-3 pb-1 font-bold text-[12px] text-[#9A7080]'>application information</p>
                <div className='w-full grid grid-cols-2 lg:grid-cols-3 gap-y-2'>
                    <div className='flex flex-col'>
                        <p className='uppercase font-bold text-[11px] text-[#6B4050]'>application id</p>
                        <p className='font-bold truncate text-[11px]'>{application.id}</p>
                    </div>
                    <div className='flex flex-col'>
                        <p className='uppercase font-bold text-[11px] text-[#6B4050]'>room type</p>
                        <p className='font-bold truncate text-[11px] capitalize'>{application.applicationRoomType}</p>
                    </div>
                    <div className='flex flex-col'>
                        <p className='uppercase font-bold text-[11px] text-[#6B4050]'>current status</p>
                        <StylizedStatus status={application.applicationStatus} />
                    </div>
                    <div className='flex flex-col'>
                        <p className='uppercase font-bold text-[11px] text-[#6B4050]'>date applied</p>
                        <p className='font-bold text-[11px]'>
                            {applicationDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                        <p className='text-[#9A7080] text-[9px]'>{timeAgo(applicationDate)}</p>
                    </div>
                    <div className='flex flex-col'>
                        <p className='uppercase font-bold text-[11px] text-[#6B4050]'>duration</p>
                        <p className='font-bold truncate text-[11px]'>{application.durationOfStayDays} days</p>
                    </div>
                    <div className='flex flex-col'>
                        <p className='uppercase font-bold text-[11px] text-[#6B4050]'>stay type</p>
                        <p className='font-bold truncate text-[11px] capitalize'>
                            {application.applicationStayType.replace('_', ' ')}
                        </p>
                    </div>
                </div>

                <p className='uppercase pt-3 pb-1 font-bold text-[12px] text-[#9A7080]'>landlord remarks</p>
                <div className='w-full h-30 text-[11px] border-2 border-[#6B0F2B] border-opacity-5 rounded-xl p-2 text-[#9A7080] bg-[#FAF4F6]'>
                    {application.rejectionReason ?? "No remarks by admin"}
                </div>

                <div className='flex flex-row gap-1 justify-end mt-2'>
                    <button
                        className={`${application.applicationStatus !== "approved" ? "hidden" : ""} text-[13px] py-0 px-4 h-10 font-bold text-white rounded-[100px] bg-gradient-to-br from-[#6B0F2B] to-[#9E2040] border-0`}>
                        Accept
                    </button>
                    <button
                        onClick={() => setCancelOpen(true)}
                        className='text-[13px] font-bold text-white rounded-[100px] bg-gradient-to-br from-[#F3C9D9] to-[#3D2E2E] border-0 px-4 h-10'>
                        Cancel
                    </button>
                </div>
            </div>

            {cancelOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-40 z-[10000] flex items-center justify-center">
                    <div className="bg-white rounded-xl p-4 w-[60%] shadow-xl">
                        <p className="text-[12px] text-[#9A7080] mb-2">
                            Type "CANCEL" to confirm cancellation of your application.
                        </p>
                        <div className="flex items-center gap-2 border-2 border-[#6B0F2B] border-opacity-10 rounded-[8.8px] px-2">
                            <input
                                autoFocus
                                type="text"
                                placeholder="Type CANCEL"
                                value={typed}
                                onChange={(e) => setTyped(e.target.value)}
                                className="text-[12px] py-2 outline-none w-full"
                            />
                        </div>
                        <button
                            onClick={() => {
                                if (typed.toLowerCase() === "cancel") {
                                    setConfirmCancel(true);
                                    setCancelOpen(false);
                                }
                            }}
                            className="mt-3 text-[12px] text-[#9A7080] w-full text-center">
                            Confirm
                        </button>
                        <button
                            onClick={() => setCancelOpen(false)}
                            className="mt-2 text-[12px] text-[#9A7080] w-full text-center">
                            Close
                        </button>
                    </div>
                </div>
            )}

            {confirmCancel && (
                <div className="fixed inset-0 bg-black bg-opacity-40 z-[11000] flex items-center justify-center">
                    <div className="bg-white rounded-xl p-4 w-[60%] shadow-xl">
                        <p className="text-[12px] text-[#9A7080]">You have successfully cancelled your application.</p>
                        <button
                            onClick={() => { setConfirmCancel(false); onSubmit(); }}
                            className="mt-3 text-[12px] text-[#9A7080] w-full text-center">
                            Close
                        </button>
                    </div>
                </div>
            )}
        </Modal>
    )
}