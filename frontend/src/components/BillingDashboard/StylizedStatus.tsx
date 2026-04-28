const statusStyles: Record<string, { bg: string; dot: string; text: string }> = {
    paid:    { bg: '#1A7A4A', dot: '#1A7A4A', text: '#1A7A4A' },
    unpaid:  { bg: '#6B0F2B', dot: '#9E2040', text: '#9E2040' },
    overdue: { bg: '#7A3A1A', dot: '#C05020', text: '#C05020' },
    partial: { bg: '#7A6A1A', dot: '#B09020', text: '#9A7A10' },
    approved:     { bg: '#1A7A4A', dot: '#1A7A4A', text: '#1A7A4A' },
    pending:      { bg: '#C9973A', dot: '#C9973A', text: '#C9973A' },
    under_review: { bg: '#6B3AB7', dot: '#6B3AB7', text: '#6B3AB7' },
    rejected:     { bg: '#6B0F2B', dot: '#9E2040', text: '#9E2040' },
    waitlisted:   { bg: '#3A6AB7', dot: '#3A6AB7', text: '#3A6AB7' },
    cancelled:    { bg: '#888888', dot: '#888888', text: '#888888' },
};

interface StylizedStatusProps {
    status: 'paid' | 'unpaid' | 'overdue' | 'partial' | 'approved' | 'pending' | 'under_review' | 'rejected' | 'waitlisted' | 'cancelled';
}

export default function StylizedStatus({status}:StylizedStatusProps){
    const style = statusStyles[status];
    return (
        <div className='bg-opacity-10 p-2 w-fit h-fit capitalize rounded-[50px] flex flex-row items-center justify-center'
            style={{ backgroundColor: (style?.bg ?? '#F0F0F0') + '1A' }}>
            <div className='w-2 h-2 mx-1 rounded-[100px]' style={{ backgroundColor: style?.dot ?? '#888' }} />
            <p className='text-[12px]' style={{ color: style?.text ?? '#888', fontWeight: 'bold' }}>
                {status.replace('_', ' ')}
            </p>
        </div>
    );
}