import type { Application } from "../../pages/student/ApplicationStatus";

interface ApprovalProgressProps {
    app: Application;
}

const CheckIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5">
        <path d="M4 12.6111L8.92308 17.5L20 6.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

const EllipsisIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5">
        <path d="M12 13.75C12.9665 13.75 13.75 12.9665 13.75 12C13.75 11.0335 12.9665 10.25 12 10.25C11.0335 10.25 10.25 11.0335 10.25 12C10.25 12.9665 11.0335 13.75 12 13.75Z" fill="white"/>
        <path d="M19 13.75C19.9665 13.75 20.75 12.9665 20.75 12C20.75 11.0335 19.9665 10.25 19 10.25C18.0335 10.25 17.25 11.0335 17.25 12C17.25 12.9665 18.0335 13.75 19 13.75Z" fill="white"/>
        <path d="M5 13.75C5.9665 13.75 6.75 12.9665 6.75 12C6.75 11.0335 5.9665 10.25 5 10.25C4.0335 10.25 3.25 11.0335 3.25 12C3.25 12.9665 4.0335 13.75 5 13.75Z" fill="white"/>
    </svg>
);

const XIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5">
        <path d="M18 6L6 18M6 6L18 18" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

export default function ApprovalProgress({ app }: ApprovalProgressProps) {
    const s = app.applicationStatus;

    const isCancelled  = s === 'cancelled';
    const isPending    = s === 'pending';
    const isUnderReview = s === 'under_review';
    const isWaitlisted = s === 'waitlisted';
    const isApproved   = s === 'approved';
    const isRejected   = s === 'rejected';

    // step 1: yellow (pending), red (cancelled/rejected), green (anything further along)
    const step1Color = isCancelled || isRejected
        ? 'bg-[#9E2040]'
        : isPending
        ? 'bg-[#FFD83C]'
        : 'bg-[#1A7A4A]';

    // step 2: green (under_review, waitlisted, approved), red (cancelled/rejected), gray (pending)
    const step2Color = isCancelled || isRejected
        ? 'bg-[#9E2040]'
        : isUnderReview || isWaitlisted || isApproved
        ? 'bg-[#1A7A4A]'
        : 'bg-transparent border-2 border-gray-300';

    // step 3: green (approved), blue (waitlisted), gray (everything else)
    const step3Color = isApproved
        ? 'bg-[#1A7A4A]'
        : isWaitlisted
        ? 'bg-[#3A6AB7]'
        : 'bg-transparent border-2 border-gray-300';

    const step1Icon = isCancelled || isRejected ? <XIcon /> : isPending ? <EllipsisIcon /> : <CheckIcon />;
    const step2Icon = isCancelled || isRejected ? <XIcon /> : isUnderReview || isWaitlisted || isApproved ? <CheckIcon /> : null;
    const step3Icon = isApproved || isWaitlisted ? <CheckIcon /> : null;

    const applicationDate = new Date(app.applicationDate).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric'
    });

    const steps = [
        { label: 'Pending',      color: step1Color, icon: step1Icon, sub: applicationDate },
        { label: 'Under Review', color: step2Color, icon: step2Icon, sub: '-' },
        { label: isApproved ? 'Approved' : isWaitlisted ? 'Waitlisted' : 'Decision', color: step3Color, icon: step3Icon, sub: '-' },
    ];

    return (
        <div className='mt-3 flex flex-row justify-between'>
            {steps.map((step, i) => (
                <div key={i} className='flex flex-col items-center text-center justify-center'>
                    <div className={`rounded-full w-10 h-10 flex items-center justify-center ${step.color}`}>
                        {step.icon}
                    </div>
                    <p className='text-[12px] font-bold mt-1'>{step.label}</p>
                    <p className='text-[#9A7080] text-[9px]'>{step.sub}</p>
                </div>
            ))}
        </div>
    );
}