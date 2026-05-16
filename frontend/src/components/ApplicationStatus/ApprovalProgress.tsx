import type { Application } from "./ApplicationStatusModal";

interface ApprovalProgressProps {
    app: Application;
}

const CheckIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-7 h-7">
        <path d="M4 12.6111L8.92308 17.5L20 6.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

const EllipsisIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-7 h-7">
        <path d="M12 13.75C12.9665 13.75 13.75 12.9665 13.75 12C13.75 11.0335 12.9665 10.25 12 10.25C11.0335 10.25 10.25 11.0335 10.25 12C10.25 12.9665 11.0335 13.75 12 13.75Z" fill="white"/>
        <path d="M19 13.75C19.9665 13.75 20.75 12.9665 20.75 12C20.75 11.0335 19.9665 10.25 19 10.25C18.0335 10.25 17.25 11.0335 17.25 12C17.25 12.9665 18.0335 13.75 19 13.75Z" fill="white"/>
        <path d="M5 13.75C5.9665 13.75 6.75 12.9665 6.75 12C6.75 11.0335 5.9665 10.25 5 10.25C4.0335 10.25 3.25 11.0335 3.25 12C3.25 12.9665 4.0335 13.75 5 13.75Z" fill="white"/>
    </svg>
);

const XIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-7 h-7">
        <path d="M18 6L6 18M6 6L18 18" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

export default function ApprovalProgress({ app }: ApprovalProgressProps) {
    const s = app.applicationStatus;

    const isCancelled   = s === 'cancelled';
    const isPending     = s === 'pending';
    const isUnderReview = s === 'under_review';
    const isWaitlisted  = s === 'waitlisted';
    const isApproved    = s === 'approved';
    const isRejected    = s === 'rejected';
    const isConfirmed   = s === 'confirmed';

    const step1Color = isCancelled || isRejected
        ? 'bg-[#9E2040]'
        : isPending
        ? 'bg-[#FFD83C]'
        : 'bg-[#1A7A4A]';

    const step2Color = isCancelled || isRejected
        ? 'bg-[#9E2040]'
        : isUnderReview || isWaitlisted || isApproved || isConfirmed
        ? 'bg-[#1A7A4A]'
        : 'bg-transparent border-2 border-[#C8B0B8]';

    const step3Color = isApproved
        ? 'bg-[#1A7A4A]'
        : isWaitlisted
        ? 'bg-[#3A6AB7]'
        : 'bg-transparent border-2 border-[#C8B0B8]';

    const step1Icon = isCancelled || isRejected ? <XIcon /> : isPending ? <EllipsisIcon /> : <CheckIcon />;
    const step2Icon = isCancelled || isRejected ? <XIcon /> : isUnderReview || isWaitlisted || isApproved || isConfirmed ? <CheckIcon /> : null;
    const step3Icon = isApproved || isConfirmed || isWaitlisted ? <CheckIcon /> : null;

    const stepHexColors = [
        isCancelled || isRejected ? '#9E2040' : isPending ? '#FFD83C' : '#1A7A4A',
        isCancelled || isRejected ? '#9E2040' : isUnderReview || isWaitlisted || isApproved || isConfirmed ? '#1A7A4A' : '#C8B0B8',
        isApproved || isConfirmed? '#1A7A4A' : isWaitlisted ? '#3A6AB7' : '#C8B0B8',
    ];

    const applicationDate = new Date(app.applicationDate).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric'
    });

    const steps = [
        {
            label: 'Pending',
            color: step1Color,
            icon: step1Icon,
            sub: applicationDate,
        },
        {
            label: 'Under Review',
            color: step2Color,
            icon: step2Icon,
            sub: 'Manager Approval',
        },
        {
            label: isConfirmed ? 'Confirmed' : isApproved ? 'Approved' : isWaitlisted ? 'Waitlisted' : 'Decision',
            color: step3Color,
            icon: step3Icon,
            sub: 'Landlord Approval',
        },
    ];

    return (
        <div className="flex flex-col w-full">
            <ol className="flex items-center w-full">
                {steps.map((step, i) => (
                    <li key={i} className="flex w-full relative items-center">
                        <div className="flex flex-col items-center w-full z-10">
                            <div className={`rounded-full w-11 h-11 flex items-center justify-center ${step.color}`}>
                                {step.icon}
                            </div>
                            <p
                                className='font-bold mt-1 text-[12px] text-center whitespace-nowrap'
                                style={{ color: stepHexColors[i] }}>
                                {step.label}
                            </p>
                            <p
                                className='text-[10px] font-semibold -mt-1'
                                style={{ color: "#9A7080" }}>
                                {step.sub}
                            </p>
                        </div>

                        {/* connector line between steps */}
                        {i < steps.length - 1 && (
                            <div
                                className="absolute h-1 top-5 z-0"
                                style={{
                                    left: 'calc(50% + 22px)',
                                    width: 'calc(100% - 44px)',
                                    background: stepHexColors[i + 1] === '#C8B0B8'
                                        ? '#C8B0B8'
                                        : `linear-gradient(to right, ${stepHexColors[i]}, ${stepHexColors[i + 1]})`
                                }}
                            />
                        )}
                    </li>
                ))}
            </ol>
        </div>
    );
}