const feeStatusStyles: Record<string, { bg: string; dot: string; text: string; label: string }> = {
    paid: {
        bg: '#1A7A4A',
        dot: '#1A7A4A',
        text: '#1A7A4A',
        label: 'Paid'
    },
    partially_paid: {
        bg: '#C9973A',
        dot: '#C9973A',
        text: '#C9973A',
        label: 'Partially Paid'
    },
    unpaid: {
        bg: '#9E2040',
        dot: '#9E2040',
        text: '#9E2040',
        label: 'Unpaid'
    },
    pending_verification: {
        bg: '#F59E0B',
        dot: '#F59E0B',
        text: '#B45309',
        label: 'Pending Verification'
    }
};

interface StylizedFeeStatusProps {
    status: string;
}

export default function StylizedFeeStatus({ status }: StylizedFeeStatusProps) {
    const style = feeStatusStyles[status];
    
    return (
        <div 
            className='bg-opacity-10 p-2 w-fit h-fit capitalize rounded-[50px] flex flex-row items-center justify-center'
            style={{ backgroundColor: style?.bg + '1A' }}
        >
            <div 
                className='w-2 h-2 mx-1 rounded-[100px]'
                style={{ backgroundColor: style?.dot }}
            />
            <p 
                className='text-[12px] font-bold'
                style={{ color: style?.text }}
            >
                {style?.label}
            </p>
        </div>
    );
}