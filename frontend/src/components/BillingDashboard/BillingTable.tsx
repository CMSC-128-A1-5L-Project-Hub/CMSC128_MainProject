import pdfIcon from "../../assets/icons/pdf_icon.svg";
import downloadIcon from "../../assets/icons/download.svg";
import Button from "../Button";
import StylizedStatus from "./StylizedStatus";
import type {Bill} from '../../pages/student/BillingDashboard';

interface BillingTableProps {
    bills: Bill[];
    onPay: (bill: Bill) => void;
}

const rowStyles: Record<string, {bg: string; text: string}> = {
    paid:   { bg: '#FFFFFF', text: '#000000' },
    unpaid: { bg: '#6B0F2B', text: '#9A7080' },
};

const format = (date: Date) => 
    new Date(date).toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'});

export default function BillingTable({ bills, onPay }: BillingTableProps){
    if (bills.length === 0) return null;

    return (
        <table className= "table-fixed w-full border-separate border-spacing-0">
            <thead className='sticky z-20 top-0 rounded-t-lg bg-white border-y-2 border-[#6B0F2B]/5'>
                <tr className="text-[#9A7080] text-[12px] lg:text-xs tracking-widest font-bold">
                {[
                    { label: 'bill name',   width: 'w-40' },
                    { label: 'period',      width: 'w-44' },
                    { label: 'date issued', width: 'w-32' },
                    { label: 'amount',      width: 'w-32' },
                    { label: 'status',      width: 'w-32' },
                    { label: 'action',      width: 'w-36' },
                ].map(col => (
                    <th key = {col.label} className={`uppercase p-2 text-left whitespace-nowrap border-y-2 border-[#6B0F2B]/5`}>
                        {col.label}
                    </th>
                ))}
                </tr>
            </thead>
            <tbody>
                {bills.map((bill, index) => (
                    <tr key={index}
                    style = {{ backgroundColor: (rowStyles[bill.status]?.bg ?? '#888')  + '0D',
                        color: (rowStyles[bill.status]?.text ?? '#888'),
                    }}>
                        <td className='px-2 py-2 flex flex-row'>
                            <img className="w-9 h-9 p-0 rounded-xl" src={pdfIcon} alt="" />
                            <div className='flex flex-col ml-1 justify-center'>
                                <span className="block flex-row text-[13px] lg:text-sm font-semibold">
                                    Billing Statement
                                </span>
                                <span className="block text-[10px] lg:text-[12px] text-[#9A7080]">{bill.dateIssued.toLocaleDateString('en-US', {month: 'long', year: 'numeric'})}</span>
                            </div>
                        </td>
                        <td className='px-2 py-2'>
                            <span className="block text-[12px] lg:text-[13px]">
                                {format(bill.startPeriod)} -  
                                {format(bill.endPeriod)}</span>
                        </td>
                        <td className='px-2 py-2'>
                            <span className='block text-[12px] lg:text-[13px]'>{format(bill.dateIssued)}</span>
                        </td>
                        <td className='px-2 py-2'>
                            <span className='block text-[12px] lg:text-[13px]'>₱{bill.amount.toLocaleString()}</span>
                        </td>
                        <td className='text-[11px] capitalize'>
                            <StylizedStatus
                                status={bill.status}>
                            </StylizedStatus>
                        </td>
                        <td className='px-2 py-2 text-[12px] lg:text-[14px]'>
                            <div className='flex flex-row gap-2 '>
                                <Button 
                                    variant="reddishPink"
                                    size="sm"
                                    fullWidth={false}
                                    isLoading={false}
                                    onClick={() => {onPay(bill)}}
                                    >
                                        {bill.status === "paid" ? "View" : "Pay Now"}
                                </Button>
                                <button 
                                    className="transition-transform duration-150 hover:-translate-y-px hover:scale-105 active:scale-95 focus-visible:ring-red-900 text-white p-1 font-semibold text-[12px] lg:text-[15px] lg:border-1 items-center justify-center bg-white border-[#6B0F2B]/40 rounded-[8.8px] flex flex-row">
                                        <img src={downloadIcon} alt="cash" className="w-6 h-6 p-0 z-0 center-self opacity-50" />    
                                </button>
                            </div>
                            
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    )
}