import pdfIcon from "../../assets/icons/pdf_icon.svg";
import downloadIcon from "../../assets/icons/download.svg";
import Button from "../Button";
import StylizedStatus from "./StylizedStatus";
import type { Bill } from '../../pages/student/BillingDashboard';

interface BillingTableProps {
    bills: Bill[];
    onPay: (bill: Bill) => void;
    onDownload?: (bill: Bill) => void;
    downloadingId?: number | null;
}

export default function BillingTable({ bills, onPay, onDownload, downloadingId }: BillingTableProps){
    if (bills.length === 0) return (
        <div className="flex flex-col justify-center items-center h-full text-center">
            <p className="text-[#9A7080] font-medium text-lg">No bills found</p>
            <p className="text-[#9A7080]/60 text-sm mt-1">When you receive a bill, it will appear here</p>
        </div>
    );

    

    const format = (date: Date) => 
        new Date(date).toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'});

    return (
        <div className="overflow-x-auto w-full">
            <table className="w-full border-separate border-spacing-0">
                <thead className='sticky z-20 top-0 rounded-t-lg bg-white border-y-2 border-[#6B0F2B]/5'>
                    <tr className="text-[#9A7080] text-[12px] lg:text-xs tracking-widest font-bold">
                        {[
                            { label: 'bill name' },
                            { label: 'due date' },
                            { label: 'amount'},
                            { label: 'status'},
                            { label: 'action'},
                        ].map(col => (
                            <th key={col.label} className={`uppercase p-2 text-left whitespace-nowrap border-y-2 border-[#6B0F2B]/5`}>
                                {col.label}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {bills.map((bill, index) => (
                        <tr key={index}
                            className="border-gray-100 last:border-none"
                            style={{ backgroundColor: 'transparent' }}
                        >
                            <td className='px-2 py-2 flex flex-row'>
                                <img className="hidden lg:block w-9 h-9 p-0 rounded-xl" src={pdfIcon} alt="" />
                                <div className='flex flex-col ml-1 justify-center'>
                                    <span className="block truncate flex-row text-[13px] lg:text-sm capitalize font-semibold">
                                        Billing Statement
                                    </span>
                                    <span className="block text-[#9A7080] -mt-1 flex-row text-[13px] lg:text-[12px] capitalize">
                                        {bill.category}
                                        {bill.allowInstallments && (
                                            <span className="ml-1 text-[10px] text-green-700">(Installments allowed)</span>
                                        )}
                                    </span>
                                </div>
                            </td>
                            <td className='px-2 py-2'>
                                <span className="truncate block text-[12px] lg:text-[13px]">
                                    {format(bill.due_date)}
                                </span>
                            </td>
                            <td className='px-2 py-2'>
                                <span className='block text-[12px] lg:text-[13px]'>₱{(bill.amount ?? 0).toLocaleString()}</span>
                            </td>
                            <td className='text-[11px] capitalize'>
                                <StylizedStatus status={bill.status} />
                            </td>
                            <td className='px-2 py-2 text-[12px] lg:text-[14px]'>
                                <div className='flex flex-row gap-2'>
                                    <Button
                                        variant="reddishPink"
                                        size="sm"
                                        fullWidth={false}
                                        isLoading={false}
                                        onClick={() => onPay(bill)}
                                    >
                                        {bill.status === "paid" ? "View" : "Pay Now"}
                                    </Button>
                                    <button
                                        type="button"
                                        title="Download billing statement"
                                        onClick={() => onDownload?.(bill)}
                                        disabled={downloadingId === bill.id}
                                        className="transition-transform duration-150 hover:-translate-y-px hover:scale-105 active:scale-95 focus-visible:ring-red-900 text-white p-1 font-semibold text-[12px] lg:text-[15px] lg:border-1 items-center justify-center bg-white border-[#6B0F2B]/40 rounded-[8.8px] flex flex-row disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <svg className="h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M12 12V19M12 19L9.75 16.6667M12 19L14.25 16.6667M6.6 17.8333C4.61178 17.8333 3 16.1917 3 14.1667C3 12.498 4.09438 11.0897 5.59198 10.6457C5.65562 10.6268 5.7 10.5675 5.7 10.5C5.7 7.46243 8.11766 5 11.1 5C14.0823 5 16.5 7.46243 16.5 10.5C16.5 10.5582 16.5536 10.6014 16.6094 10.5887C16.8638 10.5306 17.1284 10.5 17.4 10.5C19.3882 10.5 21 12.1416 21 14.1667C21 16.1917 19.3882 17.8333 17.4 17.8333" stroke="#6B0F2B" stroke-linecap="round" stroke-linejoin="round"></path></g></svg>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
        
        
    )
}