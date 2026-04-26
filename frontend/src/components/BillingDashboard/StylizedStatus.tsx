const statusStyles: Record<string, { bg: string; dot: string; text: string }> = {
  paid:    { bg: '#1A7A4A', dot: '#1A7A4A', text: '#1A7A4A' },
  unpaid:  { bg: '#6B0F2B', dot: '#9E2040', text: '#9E2040' },
  overdue: { bg: '#7A3A1A', dot: '#C05020', text: '#C05020' },
  partial: { bg: '#7A6A1A', dot: '#B09020', text: '#9A7A10' },
};

interface StylizedStatusProps {
    status: 'paid' | 'unpaid' | 'overdue' | 'partial';
}

export default function StylizedStatus({status}:StylizedStatusProps){
    const style = statusStyles[status];
    return (
        <div className='bg-opacity-10 p-2 w-fit h-fit capitalize rounded-[50px] flex flex-row items-center justify-center'
            style = {{ backgroundColor: (style?.bg ?? '#F0F0F0')  + '1A' }}
        >
            <div className='w-2 h-2 mx-1 rounded-[100px]'
                style = {{ backgroundColor: style?.dot ?? '#888' }}
            />
            <p 
            className='text-[12px]'
            style = {{ color: style?.text ?? '#888',
                fontWeight: 'bold',
            }}>{status}</p>
        </div>
    );
}