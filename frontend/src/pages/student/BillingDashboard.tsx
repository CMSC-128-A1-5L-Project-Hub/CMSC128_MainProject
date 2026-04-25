import { useState, useMemo, useRef } from 'react'
import Dropdown from "../../components/ApplicationStatus/Dropdown";
import Pagination from '../../components/ApplicationStatus/Pagination';
import Sidebar from '../../components/Sidebar';
import Modal from '../../components/Modal';
import cashIcon from "../../assets/icons/cash.svg";
import onlineIcon from "../../assets/icons/online.svg";
import bankIcon from "../../assets/icons/bank.svg";
import downloadIcon from "../../assets/icons/download.svg";
import pdfIcon from "../../assets/icons/pdf_icon.svg";
import HeroBanner from '../../components/dashboard/HeroBanner';
import Button from '../../components/Button';

interface HeroContent {
    greeting: string
    name: string
    title: string
    subtitle: string
}

export default function BillingDashboard(){
    const [selectedBill, setSelectedBill] = useState<typeof bills[0] | null>(null);
    const [payOpen, setPayOpen] = useState(false);

    const semesterStart = new Date("2026-01-19");
    const semesterEnd = new Date("2026-04-29");
    
    const currentResidence = "Kamia Residence";
    const currentAY = "AY 2025-2026"

    const heroContent: HeroContent = {
        name: "Ana Reyes",
        greeting: "Good Day",
        title: "Manage your billing and payments",
        subtitle: "Stay on top of your balances, track transactions, and view your payment history with ease",
    }
    
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
    const [confirmText, setConfirmText] = useState("");
    
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

    const [sortBy, setSortBy] = useState("Status");
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

    const totalApps = sortedBills.length;
    const [ROWS_PER_PAGE, setRows] = useState(5);
    const [infoOpen, setInfoOpen] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
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
                <div className='pt-7 px-4'>
                    <HeroBanner
                        greeting={heroContent.greeting}
                        name={heroContent.name}
                        title={heroContent.title}
                        subtitle={heroContent.subtitle}
                        type="mini"
                    />
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mx-4 mt-4 my-2">
                    <div className="flex items-center flex-row justify-between bg-gradient-to-br from-[#2A0410] via-[#6B0F2B] to-[#C05070] p-6 col-span-2 lg:col-span-1 rounded-xl shrink-0">
                        <div>
                            <p className="uppercase font-bold text-white text-opacity-55 text-[12px] lg:text-[13px]">pay now</p>
                            <h1 className="font-bold text-[20.22px] lg:text-[21.22px] text-white">₱{earliestBill.amount.toLocaleString()}</h1>
                            <p className="text-white font-semibold text-opacity-55 text-[12.5px] lg:text-[13.5px]">{earliestBill.dateIssued.toLocaleDateString('en-US', {month: 'long', year:'numeric'})}</p>
                        </div>
                        <button 
                            onClick={() => {setPayOpen(true); setSelectedBill(earliestBill); }}
                            className="flex shrink-0 justify-center items-center w-30 lg:w-14 h-10 flex-row text-[11px] text-white rounded-xl border-2 font-semibold border-white bg-white fill-white bg-opacity-25">
                            <p className='lg:hidden'>Pay Now</p>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="w-4 h-4 text-[#6B0F2B] self-center ml-2 lg:m-0"
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
                        <div key={card.label} className="flex flex-col bg-white rounded-xl shrink-0 justify-center p-6">
                            <p className="text-[#9A7080] font-bold uppercase text-[13px]">{card.label}</p>
                            <p className="font-bold text-[21.22px]"
                            style={{ color: card.color }}
                                >₱{card.value.toLocaleString()}</p>
                            <p className="text-[#9A7080] text-[13.5px]">{card.sub}</p>
                        </div>
                    ))}
                </div>

                <div className="flex-1 min-h-0 flex flex-col bg-white mx-4 mt-2 mb-4 rounded-xl p-6">
                    <div className='flex flex-row justify-between'>
                        <div className=''>
                            <p className='font-bold'>Billing History</p>
                            <p className='italic text-[11px] lg:text-[12px]'>{bills.length} total bills</p>
                        </div>

                        <div className='flex flex-row gap-2'>
                            <Dropdown 
                                title="Sort by"
                                items={[
                                    { label: "Status", href: "" },
                                    { label: "Date issued (Asc.)", href: "" },
                                    { label: "Date issued (Desc.)", href: "" },
                                    { label: "Period (Asc.)", href: "" },
                                    { label: "Period (Desc.)", href: "" },    
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
                            <thead className={`${bills.length === 0 ? "hidden" : 'sticky top-0 rounded-t-lg bg-white border-y-2 z-10 border-[#6B0F2B]/5'}`}>
                                <tr className="text-[#9A7080] text-[12px] lg:text-xs tracking-widest font-bold">
                                    <th className='uppercase p-2 text-left whitespace-nowrap w-40 border-y-2 border-[#6B0F2B]/5'>bill name</th>
                                    <th className='uppercase p-2 text-left whitespace-nowrap w-44 border-y-2 border-[#6B0F2B]/5'>period</th>
                                    <th className='uppercase p-2 text-left whitespace-nowrap w-32 border-y-2 border-[#6B0F2B]/5'>date issued</th>
                                    <th className='uppercase p-2 text-left whitespace-nowrap w-32 border-y-2 border-[#6B0F2B]/5'>amount</th>
                                    <th className='uppercase p-2 text-left whitespace-nowrap w-32 border-y-2 border-[#6B0F2B]/5'>status</th>
                                    <th className='uppercase p-2 text-left whitespace-nowrap w-36 border-y-2 border-[#6B0F2B]/5'>action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginated.map((bill, index) => (
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
                                                {bill.startPeriod.toLocaleDateString("en-US", {month: 'short', day: 'numeric', year:'numeric'})} -  
                                                {bill.endPeriod.toLocaleDateString("en-US", {month: 'short', day: 'numeric', year:'numeric'})}</span>
                                        </td>
                                        <td className='px-2 py-2'>
                                            <span className='block text-[12px] lg:text-[13px]'>{bill.dateIssued.toLocaleDateString("en-US", {month: 'short', day: 'numeric', year:'numeric'})}</span>
                                        </td>
                                        <td className='px-2 py-2'>
                                            <span className='block text-[12px] lg:text-[13px]'>₱{bill.amount.toLocaleString()}</span>
                                        </td>
                                        <td className='text-[11px] capitalize'>
                                            <div className='bg-opacity-10 p-2 w-fit rounded-[50px] flex flex-row items-center justify-center'
                                                style = {{ backgroundColor: (statusStyles[bill.status]?.bg ?? '#F0F0F0')  + '1A' }}
                                            >
                                                <div className='w-2 h-2 mx-1 rounded-[100px]'
                                                    style = {{ backgroundColor: statusStyles[bill.status]?.dot ?? '#888' }}
                                                />
                                                <p 
                                                className='mt-0.5 text-[12px]'
                                                style = {{ color: statusStyles[bill.status]?.text ?? '#888',
                                                    fontWeight: 'bold',
                                                }}>{bill.status}</p>
                                            </div>
                                        </td>
                                        <td className='px-2 py-2 text-[12px] lg:text-[14px]'>
                                            <div className='flex flex-row gap-2 '>
                                                <Button 
                                                    variant="reddishPink"
                                                    size="sm"
                                                    fullWidth={false}
                                                    isLoading={false}
                                                    onClick={() => {setPayOpen(true); setSelectedBill(bill)}}
                                                    >
                                                        {bill.status === "paid" ? "View" : "Pay Now"}
                                                </Button>
                                                <button 
                                                    className="text-white p-1 font-semibold text-[12px] lg:text-[15px] lg:border-1 items-center justify-center bg-white border-[#6B0F2B]/40 rounded-[8.8px] flex flex-row">
                                                        <img src={downloadIcon} alt="cash" className="w-6 h-6 p-0 center-self opacity-50" />    
                                                </button>
                                            </div>
                                            
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
                        <Modal open={payOpen} onClose={() => { setPayOpen(false); setPaymentMethod(""); setConfirmText(""); setCashAmount(undefined); }} title="Billing Statement" maxWidth="clamp(360px, 50vw, 640px)"
                        footer={
                            <div className='flex w-full justify-end'>    
                                <Button
                                    onClick={() => { setIsSubmitted(true) }}
                                    disabled={confirmText.trim().toLowerCase() !== "confirm"}
                                    className='disabled:opacity-40 disabled:cursor-not-allowed'
                                    variant="primary"
                                    >
                                    Submit
                                </Button>
                                <div className='lg:hidden w-full flex justify-end'>
                                <button
                                    onClick={() => setInfoOpen(true)}
                                    className='w-10 h-10 rounded-full bg-[#6B0F2B] flex items-center justify-center shadow-lg'
                                >
                                    <p className='text-white font-bold text-[14px]'>?</p>
                                </button>
                            </div>
                            </div>
                        }>
                            <div className="flex flex-row items-stretch">
                                <div className='flex flex-col w-full flex-[3]'>
                                    <div className="flex flex-row justify-between w-full bg-gradient-to-br from-[#2A0410] via-[#6B0F2B] to-[#C05070] p-4 rounded-xl shrink-0">
                                        <div>
                                            <p className="uppercase font-bold text-white text-opacity-75 text-[12px]">Billing Statement</p>
                                            <h1 className="font-bold text-[18px] text-white">₱{selectedBill.amount.toLocaleString()}</h1>
                                            <p className="text-white font-semibold text-opacity-55 text-[12px]">{selectedBill.dateIssued.toLocaleDateString('en-US', {month: 'long', day: 'numeric', year:'numeric'})}</p>
                                        </div>
                                        <button 
                                        className="flex self-center transition-transform duration-150 hover:-translate-y-px hover:scale-105 active:scale-95 focus-visible:ring-red-900 flex-row text-[13px] text-white rounded-xl border-2 font-semibold border-white bg-white fill-white bg-opacity-25">
                                            <p>Download</p>
                                            <svg 
                                                className='w-5 h-5 ml-2 mr-0 fill-white'
                                                viewBox="0 0 24 24" 
                                                xmlns="http://www.w3.org/2000/svg">
                                                <path fillRule="evenodd" clipRule="evenodd" d="M8 10C8 7.79086 9.79086 6 12 6C14.2091 6 16 7.79086 16 10V11H17C18.933 11 20.5 12.567 20.5 14.5C20.5 16.433 18.933 18 17 18H16.9C16.3477 18 15.9 18.4477 15.9 19C15.9 19.5523 16.3477 20 16.9 20H17C20.0376 20 22.5 17.5376 22.5 14.5C22.5 11.7793 20.5245 9.51997 17.9296 9.07824C17.4862 6.20213 15.0003 4 12 4C8.99974 4 6.51381 6.20213 6.07036 9.07824C3.47551 9.51997 1.5 11.7793 1.5 14.5C1.5 17.5376 3.96243 20 7 20H7.1C7.65228 20 8.1 19.5523 8.1 19C8.1 18.4477 7.65228 18 7.1 18H7C5.067 18 3.5 16.433 3.5 14.5C3.5 12.567 5.067 11 7 11H8V10ZM13 11C13 10.4477 12.5523 10 12 10C11.4477 10 11 10.4477 11 11V16.5858L9.70711 15.2929C9.31658 14.9024 8.68342 14.9024 8.29289 15.2929C7.90237 15.6834 7.90237 16.3166 8.29289 16.7071L11.2929 19.7071C11.6834 20.0976 12.3166 20.0976 12.7071 19.7071L15.7071 16.7071C16.0976 16.3166 16.0976 15.6834 15.7071 15.2929C15.3166 14.9024 14.6834 14.9024 14.2929 15.2929L13 16.5858V11Z" />
                                            </svg>  
                                        </button>
                                    </div>
                                    <div className="flex w-full flex-row justify-between border-2 border-opacity-10 border-[#6B0F2B] bg-[#FAF4F6] p-4 mt-4 rounded-xl shrink-0">
                                        <div>
                                            <p className="uppercase font-bold text-[#9A7080] text-opacity-55 text-[12px]">due date</p>
                                            <h1 className="font-bold text-[18px] text-black">{selectedBill.endPeriod.toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'})}</h1>
                                            <p className="text-[#9A7080] font-semibold text-opacity-55 text-[12px]">2nd Semester</p>
                                        </div>
                                        <div className='self-center capitalize bg-opacity-10 p-2 w-fit rounded-[50px] text-[13px] flex flex-row justify-center items-center'
                                            style = {{ backgroundColor: (statusStyles[selectedBill.status]?.bg ?? '#F0F0F0')  + '1A' }}
                                        >
                                            <div className='w-2 h-2 m-1 rounded-[100px] '
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
                                            onClick={() => {paymentMethod === "cash" ? setPaymentMethod("") : setPaymentMethod("cash")}}
                                            className={` ${paymentMethod === "cash" ? "border-[#9E2040]" : "border-opacity-30 border-[#C8B0B8]"} border-2 items-center py-2 px-3 flex flex-row transition-transform duration-150 hover:-translate-y-px hover:scale-105 active:scale-95 focus-visible:ring-red-900 `}>
                                                <img src={cashIcon} alt="cash" className="w-6 h-6 mr-2" />
                                                <p>Cash</p>
                                        </button>
                                        <button 
                                            onClick={() => {paymentMethod === "online" ? setPaymentMethod("") : setPaymentMethod("online")}}
                                            className={` ${paymentMethod === "online" ? "border-[#9E2040]" : "border-opacity-30 border-[#C8B0B8]"} border-2 items-center py-2 px-3 flex flex-row transition-transform duration-150 hover:-translate-y-px hover:scale-105 active:scale-95 focus-visible:ring-red-900 `}>
                                                <img src={onlineIcon} alt="cash" className="w-6 h-6 mr-2" />
                                                <p>Online</p>
                                        </button>
                                    </div>
                                    <p className={`uppercase font-bold text-[#6B4050] text-[13px] mt-2`}>amount paid</p>
                                    <input 
                                        value = {cashAmount}
                                        onChange={(e) => setCashAmount(Number(e.target.value))}
                                        className={`text-[14px] mt-2 p-4 placeholder-[#C8B0B8] text-[#6B4050] w-full h-12 border-2 border-[#C8B0B8] rounded-xl`} 
                                        type="text" 
                                        inputMode="numeric"
                                        pattern="[0-9]*"
                                        placeholder='Input amount' />
                                    <p className={`${paymentMethod === "online" ? "" : "hidden"} uppercase font-bold text-[#6B4050] text-[13px] mt-2`}>upload receipts here</p>
                                    <button className={` ${paymentMethod === "online" ? "" : "hidden"} flex flex-col border-dashed w-full h-30 border-2 border-[#C8B0B8] mt-2 items-center justify-center p-3 transition-transform duration-150 hover:-translate-y-px hover:scale-105 active:scale-95 focus-visible:ring-red-900 `}>
                                        {/*placeholder icon*/}
                                        <img className="w-10 h-10 p-2 rounded-xl bg-[#F5ECF0]" src={downloadIcon} alt="" />
                                        <p className='text-[14px] text-[#1A0008] font-bold'>Upload Receipt</p>
                                        <p className='text-[12px] text-[#C8B0B8]'>PDF, JPG, or PNG  •  Max 5mb</p>
                                    </button>
                                </div>
                                {/* Desktop: always visible column */}
                                <div className='hidden lg:flex flex-col flex-[2] gap-3 ml-8 bg-gradient-to-b from-[#000000]/5 via-[#ffffff] to-[#000000]/5 p-4'>
                                    {/* Steps - same as desktop */}
                                    {[
                                        { n: 1, title: 'Download Billing Statement', sub: "Know how much you're paying" },
                                        { n: 2, title: 'Choose payment method', sub: "Choose whatever's comfortable" },
                                        { n: 3, title: 'Upload Receipt', sub: 'Only if paid online' },
                                        { n: 4, title: 'Submit when you are sure', sub: 'Check if receipt is correct' },
                                    ].map(step => (
                                        <div key={step.n} className='flex flex-row'>
                                            <div className='w-8 h-8 bg-[#6B0F2B] border-2 border-[#C9973A]/40 rounded-full items-center justify-center flex shrink-0'>
                                                <p className='text-white font-bold text-[14px]'>{step.n}</p>
                                            </div>
                                            <div className='flex flex-col ml-2 justify-center'>
                                                <p className='text-black font-bold text-[11px]'>{step.title}</p>
                                                <p className='text-[#C9973A] text-[10px] -mt-1'>{step.sub}</p>
                                            </div>
                                        </div>
                                    ))}
                                    <div className='flex flex-col bg-white mt-auto'>
                                        <p className = " text-[#6B4050] font-bold text-[11px]">Description</p>
                                        <p className=' text-black text-opacity-70 text-[10px]'>Please review your billing statement carefully before making a payment. Ensure that the amount is correct and upload a valid, authentic receipt for verification. Kindly check your payment status from time to time.</p>
                                    </div>
                                    <div className='flex flex-col'>
                                    <p className='text-[12px] font-bold text-[#6B4050]'>Type:</p>
                                    <textarea 
                                        className='text-[10px] h-20 text-black/50 bg-[#6B0F2B]/10 border-2 p-2 mt-1'
                                        value={confirmText}
                                        onChange={(e) => setConfirmText(e.target.value)}
                                        name="" 
                                        id=""
                                        placeholder='By typing ‘CONFIRM’, you verify that the uploaded receipt is authentic and the payment amount is correct.'>
                                    </textarea>
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
                                className='fixed bottom-6 right-6 z-[10001] w-10 h-10 rounded-full bg-[#6B0F2B] flex items-center justify-center shadow-lg transition-transform duration-150 hover:-translate-y-px hover:scale-105 active:scale-95 focus-visible:ring-red-900 '
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