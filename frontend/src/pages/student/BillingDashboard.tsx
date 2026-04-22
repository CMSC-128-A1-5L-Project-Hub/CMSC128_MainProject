import { useState, useMemo, useRef } from 'react'
import Dropdown from "../../components/ApplicationStatus/Dropdown";
import Pagination from '../../components/ApplicationStatus/Pagination';
import Sidebar from '../../components/Sidebar';
import Modal from '../../components/Modal';
import cashIcon from "../../assets/icons/cash.svg";
import onlineIcon from "../../assets/icons/online.svg";
import bankIcon from "../../assets/icons/bank.svg";
import downloadIcon from "../../assets/icons/download.svg";

export default function BillingDashboard(){
    const [selectedBill, setSelectedBill] = useState<typeof bills[0] | null>(null);
    const [payOpen, setPayOpen] = useState(false);

    const semesterStart = new Date("2026-01-19");
    const semesterEnd = new Date("2026-04-29");
    const semCount = 2;
    
    const currentResidence = "Kamia Residence";
    const currentAY = semCount === 2
        ? `AY ${semesterEnd.getFullYear() - 1}-${semesterEnd.getFullYear()}`
        : `AY ${semesterEnd.getFullYear()}-${semesterEnd.getFullYear() + 1}`;
    
    const bills = [
        { billName: 'Electricity', startPeriod: new Date(2026, 0, 1), endPeriod: new Date(2026, 0, 31), dateIssued: new Date(2026, 1, 1), amount: 2800, status: "paid" },
        { billName: 'Water', startPeriod: new Date(2026, 0, 1), endPeriod: new Date(2026, 0, 31), dateIssued: new Date(2026, 1, 1), amount: 750, status: "paid" },
        { billName: 'Internet', startPeriod: new Date(2026, 0, 1), endPeriod: new Date(2026, 0, 31), dateIssued: new Date(2026, 1, 2), amount: 1500, status: "paid" },
        { billName: 'Rent', startPeriod: new Date(2026, 0, 1), endPeriod: new Date(2026, 0, 31), dateIssued: new Date(2026, 0, 1), amount: 12000, status: "paid" },

        { billName: 'Electricity', startPeriod: new Date(2026, 1, 1), endPeriod: new Date(2026, 1, 28), dateIssued: new Date(2026, 2, 1), amount: 3000, status: "paid" },
        { billName: 'Water', startPeriod: new Date(2026, 1, 1), endPeriod: new Date(2026, 1, 28), dateIssued: new Date(2026, 2, 1), amount: 820, status: "paid" },
        { billName: 'Internet', startPeriod: new Date(2026, 1, 1), endPeriod: new Date(2026, 1, 28), dateIssued: new Date(2026, 2, 2), amount: 1500, status: "paid" },
        { billName: 'Rent', startPeriod: new Date(2026, 1, 1), endPeriod: new Date(2026, 1, 28), dateIssued: new Date(2026, 1, 1), amount: 12000, status: "paid" },

        { billName: 'Electricity', startPeriod: new Date(2026, 2, 1), endPeriod: new Date(2026, 2, 31), dateIssued: new Date(2026, 3, 1), amount: 3200, status: "paid" },
        { billName: 'Water', startPeriod: new Date(2026, 2, 1), endPeriod: new Date(2026, 2, 31), dateIssued: new Date(2026, 3, 1), amount: 900, status: "paid" },
        { billName: 'Internet', startPeriod: new Date(2026, 2, 1), endPeriod: new Date(2026, 2, 31), dateIssued: new Date(2026, 3, 2), amount: 1500, status: "unpaid" },
        { billName: 'Rent', startPeriod: new Date(2026, 2, 1), endPeriod: new Date(2026, 2, 31), dateIssued: new Date(2026, 2, 1), amount: 12000, status: "paid" },

        { billName: 'Electricity', startPeriod: new Date(2026, 3, 1), endPeriod: new Date(2026, 3, 30), dateIssued: new Date(2026, 4, 1), amount: 2900, status: "unpaid" },
        { billName: 'Water', startPeriod: new Date(2026, 3, 1), endPeriod: new Date(2026, 3, 30), dateIssued: new Date(2026, 4, 1), amount: 880, status: "paid" },
        { billName: 'Internet', startPeriod: new Date(2026, 3, 1), endPeriod: new Date(2026, 3, 30), dateIssued: new Date(2026, 4, 2), amount: 1500, status: "paid" },
        { billName: 'Rent', startPeriod: new Date(2026, 3, 1), endPeriod: new Date(2026, 3, 30), dateIssued: new Date(2026, 3, 1), amount: 12000, status: "paid" },

        { billName: 'Electricity', startPeriod: new Date(2026, 4, 1), endPeriod: new Date(2026, 4, 31), dateIssued: new Date(2026, 5, 1), amount: 3100, status: "unpaid" },
        { billName: 'Water', startPeriod: new Date(2026, 4, 1), endPeriod: new Date(2026, 4, 31), dateIssued: new Date(2026, 5, 1), amount: 870, status: "unpaid" },
        { billName: 'Internet', startPeriod: new Date(2026, 4, 1), endPeriod: new Date(2026, 4, 31), dateIssued: new Date(2026, 5, 2), amount: 1500, status: "paid" },
        { billName: 'Rent', startPeriod: new Date(2026, 4, 1), endPeriod: new Date(2026, 4, 31), dateIssued: new Date(2026, 4, 1), amount: 12000, status: "unpaid" },

        { billName: 'Maintenance Fee', startPeriod: new Date(2026, 4, 1), endPeriod: new Date(2026, 4, 31), dateIssued: new Date(2026, 4, 5), amount: 500, status: "paid" },
        { billName: 'Electricity', startPeriod: new Date(2026, 5, 1), endPeriod: new Date(2026, 5, 30), dateIssued: new Date(2026, 6, 1), amount: 3300, status: "unpaid" },
        { billName: 'Water', startPeriod: new Date(2026, 5, 1), endPeriod: new Date(2026, 5, 30), dateIssued: new Date(2026, 6, 1), amount: 910, status: "paid" },
        { billName: 'Internet', startPeriod: new Date(2026, 5, 1), endPeriod: new Date(2026, 5, 30), dateIssued: new Date(2026, 6, 2), amount: 1500, status: "paid" },
        { billName: 'Rent', startPeriod: new Date(2026, 5, 1), endPeriod: new Date(2026, 5, 30), dateIssued: new Date(2026, 5, 1), amount: 12000, status: "paid" }
    ];

    const earliestBill = [...bills]
        .filter(b => b.status === 'unpaid')
        .sort((a,b) => a.dateIssued.getTime() - b.dateIssued.getTime())[0];
    
    const [paymentMethod, setPaymentMethod] = useState("");
    const AYBills = bills.filter(a => a.dateIssued >= semesterStart && a.dateIssued <= semesterEnd);
    const AYBillSum = AYBills.reduce((acc, curr) => acc + curr.amount, 0);
    const AYPaidSum = AYBills.reduce((acc, curr) => curr.status === "paid" ? acc + curr.amount : acc, 0);
    
    const summaryCards = [
        {
            label: "outstanding",
            value: earliestBill.amount,
            color: "#9E2040",
            sub: earliestBill.endPeriod.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
        },
        {
            label: "next due",
            value: earliestBill.amount,
            color: "#000000",
            sub: earliestBill.endPeriod.getMonth() < 6 ? "1st Semester" : "2nd Semester"
        },
        {
            label: "total billed",
            value: AYBillSum,
            color: "#000000",
            sub: currentAY
        },
        {
            label: "total paid",
            value: AYPaidSum,
            color: "#1A7A4A",
            sub: `${bills.length === 0 ? 0 : Math.trunc((AYPaidSum / AYBillSum) * 100)}% of total`
        },
    ];

    const format = (date: Date) =>
    new Date(date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });

    const [sortBy, setSortBy] = useState("Date applied (Asc.)");
    const [searchQuery, setSearchQuery] = useState("");
    const [cashAmount, setCashAmount] = useState<number>();;
    const [searchOpen, setSearchOpen] = useState(false);

    const sortedBills = useMemo(() => {
        const q = searchQuery.toLowerCase();
        return [...bills]
            .filter(a => !q || [
                a.billName, 
                String(a.amount),
                format(a.dateIssued), 
                format(a.endPeriod), 
                format(a.startPeriod), 
                a.status]
                .some(field => field.toLowerCase().includes(q))
            )
            .sort((a, b) => {
                const parseDate = (str: string | Date) => str === '-' ? 0 : new Date(str).getTime();

                if (sortBy === "Date issued (Asc.)")  return parseDate(a.dateIssued) - parseDate(b.dateIssued);
                if (sortBy === "Date issued (Desc.)") return parseDate(b.dateIssued) - parseDate(a.dateIssued);
                if (sortBy === "Period (Asc.)") return parseDate(a.endPeriod)  - parseDate(b.endPeriod);
                if (sortBy === "Period (Desc.)") return parseDate(b.endPeriod)  - parseDate(a.endPeriod);
                if (sortBy === "Status") return a.status.localeCompare(b.status);
                if (sortBy === "Amount (Asc.)") return a.amount - b.amount;
                if (sortBy === "Amount (Desc.)") return b.amount - a.amount;
                return 0;

            });
        }, [sortBy, searchQuery]);

    
    const trueTotal = bills.length;
    const totalApps = sortedBills.length;
    const [ROWS_PER_PAGE, setRows] = useState(5);
    const [infoOpen, setInfoOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const totalPages = Math.ceil(sortedBills.length / ROWS_PER_PAGE);
    const inputRef = useRef<HTMLInputElement>(null);
    const paginated = sortedBills.slice((currentPage - 1) * ROWS_PER_PAGE, currentPage * ROWS_PER_PAGE);

    const rowStyles: Record<string, { bg: string; text: string}> = {
        paid:      { bg: '#FFFFFF', text: '#000000'},
        unpaid:      { bg: '#6B0F2B', text: '#9A7080'},
    }

    const statusStyles: Record<string, { bg: string; dot: string ; text: string}> = {
        paid:      { bg: '#1A7A4A', dot: '#1A7A4A' , text: '#1A7A4A'},
        unpaid:      { bg: '#6B0F2B', dot: '#9E2040' , text: '#9E2040'},
    }

    return (
        <div className="bg-[#F5EEF0] h-screen overflow-hidden flex flex-row">
            <hr className="fixed border-t-1 top-14 w-full border-t border-[#6B0F2B] border-opacity-10 my-3" />
            
            <Sidebar 
                role='student'
            />
            <div className="flex-1 flex flex-col overflow-hidden">
                <div className='flex flex-row justify-start items-center mt-4'>
                    <div className='hidden lg:block w-2 h-6 rounded-xl bg-gradient-to-b ml-5 mr-3 mb-1 from-[#2A0410] via-[#6B0F2B] to-[#C05070]'></div> 
                    <div className="flex flex-col justify-left gap-[1px]">
                        <h1 className='font-serif font-bold italic text-[28.5px] lg:text-[31px] text-[#6B0F2B] pl-16 lg:p-0 leading-tight -mt-2'>Billing Dashboard</h1>
                         <p className="text-[#9A7080] text-[13px] pl-16 lg:pl-0 -mt-1 lg:-mt-2">{currentResidence}     •     {currentAY}</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mx-4 mt-6 my-2">
                    <div className="flex items-center flex-row justify-between bg-gradient-to-br from-[#2A0410] via-[#6B0F2B] to-[#C05070] p-4 col-span-2 lg:col-span-1 rounded-xl shrink-0">
                        <div>
                            <p className="uppercase font-bold text-white text-opacity-55 text-[12px] lg:text-[13px]">pay now</p>
                            <h1 className="font-bold text-[20.22px] lg:text-[21.22px] text-white">₱{earliestBill.amount.toLocaleString()}</h1>
                            <p className="text-white font-semibold text-opacity-55 text-[12.5px] lg:text-[13.5px]">{earliestBill.dateIssued.toLocaleDateString('en-US', {month: 'long', year:'numeric'})}</p>
                        </div>
                        <button 
                            onClick={() => {setPayOpen(true); setSelectedBill(earliestBill); }}
                            className="flex shrink-0 justify-center items-center w-30 h-10 flex-row text-[13px] text-white rounded-xl border-2 font-semibold border-white bg-white fill-white bg-opacity-25">
                            Pay Now
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="w-4 h-4 text-[#6B0F2B] self-center ml-2"
                                viewBox="0 0 24 24"
                                fill="none"
                            >
                                <path
                                    d="M9 18l6-6-6-6"
                                    stroke="white"
                                    strokeWidth="3"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </button>
                    </div>
                    
                    {summaryCards.map(card => (
                        <div key={card.label} className="flex flex-col bg-white rounded-xl shrink-0 justify-center p-4">
                            <p className="text-[#9A7080] font-bold uppercase text-[11px]">{card.label}</p>
                            <p className="font-bold"
                            style={{ color: card.color }}
                                >₱{card.value.toLocaleString()}</p>
                            <p className="text-[#9A7080] text-[11px]">{card.sub}</p>
                        </div>
                    ))}
                </div>

                <div className="flex-1 min-h-0 flex flex-col bg-white mx-4 mt-2 mb-4 rounded-xl p-4">
                    <div className='flex flex-row justify-between'>
                        <div className=''>
                            <p className='font-bold'>Billing History</p>
                            <p className='italic text-[11px] lg:text-[12px]'>{bills.length} total bills</p>
                        </div>

                        <div className='flex flex-row gap-2'>
                            <Dropdown 
                                title="Sort by"
                                items={[
                                    { label: "Date issued (Asc.)", href: "" },
                                    { label: "Date issued (Desc.)", href: "" },
                                    { label: "Period (Asc.)", href: "" },
                                    { label: "Period (Desc.)", href: "" },
                                    { label: "Status", href: "" },
                                    { label: "Amount (Asc.)", href: "" },
                                    { label: "Amount (Desc.)", href: "" },
                                ]}
                                direction="down"
                                widthClass="w-32 lg:w-44"
                                titleClass="text-[10px] lg:text-[11px]"
                                selectedClass="text-[12px] lg:text-[13px]"
                                onSelect={(label) => { setSortBy(label); setCurrentPage(1); }}
                            />
                    
                            <div className="flex items-center gap-2 lg:gap-3">
                                {/* Desktop: expanding search bar */}
                                <div className="hidden p-0 lg:flex items-center gap-2 ">
                                    <div className={`px-1 flex items-center border-2 lg:border-3 bg-[#FAF4F6] border-[#6B0F2B] border-opacity-10 rounded-[8.8px] h-12 overflow-hidden transition-all duration-300 ${searchOpen ? 'w-44' : 'w-12'}`}>
                                        <button 
                                        onClick={() => { setSearchOpen(!searchOpen); if (!searchOpen) inputRef.current?.focus(); }}
                                            className="p-1 shrink-0">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="26" height="36" fill="#FAF4F6" viewBox="0 0 24 24">
                                                <path stroke="#9A7080" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m21 21-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0Z"/>
                                            </svg>
                                        </button>
                                            <input  
                                                type="text"
                                                placeholder="Search..."
                                                ref={inputRef}
                                                value={searchQuery}
                                                onBlur={() => { setSearchOpen(false); setSearchQuery(""); }}
                                                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                                                className={`bg-[#FAF4F6] text-[12px] lg:text-[13px] px-1 outline-none transition-all duration-300 ${searchOpen ? 'w-full opacity-100' : 'w-0 opacity-0'} w-full`}
                                            />
                                    </div>
                                </div>

                                {/* Mobile: icon that opens modal */}
                                <button className="lg:hidden border-2 p-1 px-2 bg-[#FAF4F6] border-[#6B0F2B] border-opacity-10 rounded-[8.8px] overflow-hidden" onClick={() => setSearchOpen(true)}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="32" fill="none" viewBox="0 0 24 24">
                                        <path stroke="#9A7080" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m21 21-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0Z"/>
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <div className='overflow-auto flex-1 min-h-0 mt-3 rounded-t-lg'>
                        <table className= {` ${bills.length === 0 ? "hidden" : "table-fixed w-full"} border-separate border-spacing-0`}>
                            <thead className={`${bills.length === 0 ? "hidden" : 'sticky top-0 bg-[#F7F3F3] rounded-t-lg'}`}>
                                <tr className="text-[#9A7080] text-[12px] lg:text-[14px]">
                                    <th className='uppercase p-2 text-left whitespace-nowrap w-40 border-[#6B0F2B] border-opacity-5 border-t-1 lg:border-b-4'>bill name</th>
                                    <th className='uppercase p-2 text-left whitespace-nowrap w-44 border-[#6B0F2B] border-opacity-5 border-t-1 lg:border-b-4'>period</th>
                                    <th className='uppercase p-2 text-left whitespace-nowrap w-32 border-[#6B0F2B] border-opacity-5 border-t-1 lg:border-b-4'>date issued</th>
                                    <th className='uppercase p-2 text-left whitespace-nowrap w-32 border-[#6B0F2B] border-opacity-5 border-t-1 lg:border-b-4'>amount</th>
                                    <th className='uppercase p-2 text-left whitespace-nowrap w-32 border-[#6B0F2B] border-opacity-5 border-t-1 lg:border-b-4'>status</th>
                                    <th className='uppercase p-2 text-left whitespace-nowrap w-36 border-[#6B0F2B] border-opacity-5 border-t-1 lg:border-b-4'>action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginated.map((bill, index) => (
                                    <tr key={index}
                                    style = {{ backgroundColor: (rowStyles[bill.status]?.bg ?? '#888')  + '0D',
                                        color: (rowStyles[bill.status]?.text ?? '#888'),
                                    }}>
                                        <td className='px-2 py-2 border-b-2 border-opacity-5 border-[#6B0F2B]'>
                                            <span className="block text-[13px] lg:text-[15px] font-semibold">{bill.billName}</span>
                                            <span className="block text-[10px] lg:text-[12px] text-[#9A7080]">{bill.dateIssued.toLocaleDateString('en-US', {month: 'long', year: 'numeric'})}</span>
                                        </td>
                                        <td className='px-2 py-2 border-b-2 border-opacity-5 whitespace-nowrap border-[#6B0F2B] '>
                                            <span className="block text-[12px] lg:text-[14px]">
                                                {bill.startPeriod.toLocaleDateString("en-US", {month: 'short', day: 'numeric', year:'numeric'})} -  
                                                {bill.endPeriod.toLocaleDateString("en-US", {month: 'short', day: 'numeric', year:'numeric'})}</span>
                                        </td>
                                        <td className='px-2 py-2 border-b-2 border-opacity-5 whitespace-nowrap border-[#6B0F2B] '>
                                            <span className='block text-[12px] lg:text-[14px]'>{bill.dateIssued.toLocaleDateString("en-US", {month: 'short', day: 'numeric', year:'numeric'})}</span>
                                        </td>
                                        <td className='px-2 py-2 border-b-2 border-opacity-5 whitespace-nowrap border-[#6B0F2B] '>
                                            <span className='block text-[12px] lg:text-[14px]'>₱{bill.amount}</span>
                                        </td>
                                        <td className='text-[11px] capitalize border-[#6B0F2B] border-b-2 border-opacity-5 font-bold'>
                                            <div className='bg-opacity-10 p-2 w-fit rounded-[50px] flex flex-row'
                                                style = {{ backgroundColor: (statusStyles[bill.status]?.bg ?? '#F0F0F0')  + '1A' }}
                                            >
                                                <div className='p-1 w-1.5 h-1.5 ml-1 mr-1.5 mt-1 rounded-[100px]'
                                                    style = {{ backgroundColor: statusStyles[bill.status]?.dot ?? '#888' }}
                                                />
                                                <p 
                                                className='mt-0'
                                                style = {{ color: statusStyles[bill.status]?.text ?? '#888',
                                                    fontWeight: 'bold',
                                                }}>{bill.status}</p>
                                            </div>
                                        </td>
                                        <td className='px-2 py-2 text-[12px] lg:text-[14px] border-b-2 border-opacity-5 border-[#6B0F2B]'>
                                            <button 
                                            onClick={() => {setPayOpen(true); setSelectedBill(bill); }}
                                            className="text-white w-32 p-0 bg-gradient-to-br from-[#6B0F2B] to-[#9E2040] font-semibold text-[12px] lg:text-[15px] border-2 lg:border-3 py-1 px-4 lg:py-1.5 lg:px-5 bg-[#F5ECF0] border-[#6B0F2B] border-opacity-5 rounded-[8.8px] flex flex-row justify-between">
                                                <img src={downloadIcon} alt="cash" className="w-[30px] h-[20px] p-0 mr-1 center-self" />    
                                                Download
                                                </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className='flex flex-nowrap justify-between'>
                        <div className='flex justify-start items-center gap-2'>
                            <div className='m-1 mt-4'>                       
                                <Dropdown 
                                    title="No. of Items"
                                    items={[
                                        { label: "5", href: "" },
                                        { label: "10", href: "" },
                                        { label: "15", href: "" },
                                        { label: "20", href: "" },
                                    ]}
                                    direction='up'
                                    widthClass="w-29 lg:w-32"
                                    titleClass="text-[10px] lg:text-[12px]"
                                    selectedClass="text-[12px] lg:text-[14px]"
                                    onSelect={(label) => {setRows(parseInt(label, 10)); setCurrentPage(1)}}
                                />
                                
                            </div>
                            <span className='text-[11px] self-center:text-[13px] text-[#9A7080] p-0 mt-2 m-0'>Showing {(currentPage-1) * ROWS_PER_PAGE + 1}-{Math.min(currentPage * ROWS_PER_PAGE, totalApps)} of {totalApps}</span>
                        </div>
                            
                        <div className="flex justify-between items-center m-2 mt-6 lg:mt-6 text-sm text-[#9A7080]">     
                            <div className="flex gap-2 text-[12px] lg:text-[15px]">
                                <Pagination
                                    totalPages={totalPages}
                                    currentPage={currentPage}
                                    onPageChange={setCurrentPage}
                                    buttonSize='w-6 h-6 p-0 lg:w-8 lg:h-8'
                                />
                            </div>
                        </div>
                    </div>
                    
                    {payOpen && selectedBill && (
                        <Modal open={payOpen} onClose={() => setPayOpen(false)} title="Billing Statement" maxWidth="clamp(360px, 50vw, 600px)"
                        footer={
                            <div className='lg:hidden w-full flex justify-end'>
                                <button
                                    onClick={() => setInfoOpen(true)}
                                    className='w-10 h-10 rounded-full bg-[#6B0F2B] flex items-center justify-center shadow-lg'
                                >
                                    <p className='text-white font-bold text-[14px]'>?</p>
                                </button>
                            </div>
                        }>
                            <div className="flex flex-row items-stretch">
                                <div className='flex flex-col w-full flex-[3]'>
                                    <div className="flex flex-row justify-between w-full bg-gradient-to-br from-[#2A0410] via-[#6B0F2B] to-[#C05070] p-4 rounded-xl shrink-0">
                                        <div>
                                            <p className="uppercase font-bold text-white text-opacity-75 text-[12px]">{selectedBill.billName}</p>
                                            <h1 className="font-bold text-[18px] text-white">₱{selectedBill.amount.toLocaleString()}</h1>
                                            <p className="text-white font-semibold text-opacity-55 text-[12px]">{selectedBill.dateIssued.toLocaleDateString('en-US', {month: 'long', day: 'numeric', year:'numeric'})}</p>
                                        </div>
                                        <button className="flex self-center w-10 h-10 flex-row text-[11px] text-white rounded-xl border-2 font-semibold border-white bg-white fill-white bg-opacity-25">
                                            <img src={downloadIcon} alt="cash" className="w-[50px] h-[50px]" />
                                        </button>
                                    </div>
                                    <div className="flex w-full flex-row justify-between border-2 border-opacity-10 border-[#6B0F2B] bg-[#FAF4F6] p-4 mt-4 rounded-xl shrink-0">
                                        <div>
                                            <p className="uppercase font-bold text-[#9A7080] text-opacity-55 text-[12px]">due date</p>
                                            <h1 className="font-bold text-[18px] text-black">{selectedBill.endPeriod.toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'})}</h1>
                                            <p className="text-[#9A7080] font-semibold text-opacity-55 text-[12px]">2nd Semester</p>
                                        </div>
                                        <div className='self-center capitalize bg-opacity-10 p-2 w-fit rounded-[50px] text-[13px] flex flex-row'
                                            style = {{ backgroundColor: (statusStyles[selectedBill.status]?.bg ?? '#F0F0F0')  + '1A' }}
                                        >
                                            <div className='p-1 w-1 h-1 mx-1.5 mt-1.5 lg:mt-1 rounded-[100px]'
                                                style = {{ backgroundColor: statusStyles[selectedBill.status]?.dot ?? '#888' }}
                                            />
                                            <p 
                                            className='mr-1.5'
                                            style = {{ color: statusStyles[selectedBill.status]?.text ?? '#888',
                                                fontWeight: 'bold',
                                            }}>{selectedBill.status}</p>
                                        </div>
                                    </div>
                                    <p className='uppercase font-bold text-[#6B4050] text-[13px] mt-2'>payment method</p>
                                    <div className='grid grid-cols-2 grid-rows-1 gap-2 mt-1.5 text-[14px]'>
                                        <button 
                                            onClick={() => {setPaymentMethod("cash")}}
                                            className={` ${paymentMethod === "cash" ? "border-[#9E2040]" : "border-opacity-30 border-[#C8B0B8]"} border-2 flex flex-row`}>
                                                <img src={cashIcon} alt="cash" className="w-4 h-4" />
                                                <p>Cash</p>
                                        </button>
                                        <button 
                                            onClick={() => {setPaymentMethod("online")}}
                                            className={` ${paymentMethod === "online" ? "border-[#9E2040]" : "border-opacity-30 border-[#C8B0B8]"} border-2 flex flex-row`}>
                                                <img src={onlineIcon} alt="cash" className="w-4 h-4" />
                                                <p>Online</p>
                                        </button>
                                    </div>
                                    <p className={`${paymentMethod === "online" ? "" : "hidden"} uppercase font-bold text-[#6B4050] text-[13px] mt-2`}>upload receipts here</p>
                                    <button className={` ${paymentMethod === "online" ? "" : "hidden"} flex flex-col border-dashed w-full h-30 border-2 border-[#C8B0B8] mt-2 items-center justify-center p-3`}>
                                        {/*placeholder icon*/}
                                        <img className="w-10 h-10 p-2 rounded-xl bg-[#F5ECF0]" src={downloadIcon} alt="" />
                                        <p className='text-[14px] text-[#1A0008] font-bold'>Upload Receipt</p>
                                        <p className='text-[12px] text-[#C8B0B8]'>PDF, JPG, or PNG  •  Max 5mb</p>
                                    </button>
                                    <p className={`${paymentMethod === "cash" ? "" : "hidden"} uppercase font-bold text-[#6B4050] text-[13px] mt-2`}>amount of cash paid</p>
                                    <input 
                                        value = {cashAmount}
                                        onChange={(e) => setCashAmount(Number(e.target.value))}
                                        className={`${paymentMethod === "cash" ? "" : "hidden"} text-[14px] mt-2 p-4 placeholder-[#C8B0B8] text-[#6B4050] w-full h-12 border-2 border-[#C8B0B8] rounded-xl`} 
                                        type="text" 
                                        inputMode="numeric"
                                        pattern="[0-9]*"
                                        placeholder='Input amount' />
                                </div>
                                {/* Desktop: always visible column */}
                                <div className='hidden lg:flex flex-col flex-[2] gap-3 ml-8'>
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
                                    <div className='flex flex-col bg-[#6B0F2B] bg-opacity-10 p-2 mt-auto'>
                                        <p className = " text-[#6B4050] font-bold text-[12px]">Description</p>
                                        <p className=' text-black text-opacity-70 text-[10px]'>Please review your billing statement carefully before making a payment. Ensure that the amount is correct and upload a valid, authentic receipt for verification. Kindly check your payment status from time to time.</p>
                                    </div>
                                </div>
                            </div>
                        </Modal>
                    )}

                    {/* Mobile info button + panel - outside modal */}
                    {payOpen && (
                        <div className='lg:hidden'>
                            <button
                                onClick={() => setInfoOpen(true)}
                                className='fixed bottom-6 right-6 z-[10001] w-10 h-10 rounded-full bg-[#6B0F2B] flex items-center justify-center shadow-lg'
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
                    )}

                    {searchOpen && (
                        <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center lg:hidden">
                            <div className="bg-white rounded-xl p-4 w-[60%] shadow-xl">
                                <div className="flex items-center gap-2 border-2 border-[#6B0F2B] border-opacity-10 rounded-[8.8px] px-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24">
                                        <path stroke="#9A7080" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m21 21-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0Z"/>
                                    </svg>
                                    <input
                                        autoFocus
                                        type="text"
                                        placeholder="Search dormitory, status, type..."
                                        value={searchQuery}
                                        onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                                        className="text-[12px] py-2 outline-none w-full"
                                    />
                                </div>
                                <button onClick={() => setSearchOpen(false)} className="mt-3 text-[12px] text-[#9A7080] w-full text-center">
                                    Close
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            
        </div>
    )
}