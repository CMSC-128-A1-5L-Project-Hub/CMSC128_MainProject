import { useState, useMemo, useRef } from 'react'
import Dropdown from "../../components/ApplicationStatus/Dropdown";
import Pagination from '../../components/ApplicationStatus/Pagination';
import Sidebar from '../../components/Sidebar';
import HeroBanner from '../../components/dashboard/HeroBanner';
import BillingModal from '../../components/BillingDashboard/BillingModal';
import BillingTable from '../../components/BillingDashboard/BillingTable';
import SummaryCards from '../../components/BillingDashboard/SummaryCards';
import SearchBar from '../../components/SearchBar';

interface HeroContent {
    greeting: string
    name: string
    title: string
    subtitle: string
}

export interface Bill {
  startPeriod: Date;
  endPeriod: Date;
  dateIssued: Date;
  amount: number;
  status: 'paid' | 'unpaid';
  semester: String;
}

export default function BillingDashboard(){
    const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
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
    
    const bills: Bill[] = [
        { semester: "2nd", startPeriod: new Date(2026, 0, 1), endPeriod: new Date(2026, 0, 31), dateIssued: new Date(2026, 1, 1), amount: 2800, status: "paid" },
        { semester: "2nd", startPeriod: new Date(2026, 0, 1), endPeriod: new Date(2026, 0, 31), dateIssued: new Date(2026, 1, 1), amount: 750, status: "paid" },
        { semester: "2nd", startPeriod: new Date(2026, 0, 1), endPeriod: new Date(2026, 0, 31), dateIssued: new Date(2026, 1, 2), amount: 1500, status: "paid" },
        { semester: "2nd", startPeriod: new Date(2026, 0, 1), endPeriod: new Date(2026, 0, 31), dateIssued: new Date(2026, 0, 1), amount: 12000, status: "paid" },

        { semester: "2nd", startPeriod: new Date(2026, 1, 1), endPeriod: new Date(2026, 1, 28), dateIssued: new Date(2026, 2, 1), amount: 3000, status: "paid" },
        { semester: "2nd", startPeriod: new Date(2026, 1, 1), endPeriod: new Date(2026, 1, 28), dateIssued: new Date(2026, 2, 1), amount: 820, status: "paid" },
        { semester: "2nd", startPeriod: new Date(2026, 1, 1), endPeriod: new Date(2026, 1, 28), dateIssued: new Date(2026, 2, 2), amount: 1500, status: "paid" },
        { semester: "2nd", startPeriod: new Date(2026, 1, 1), endPeriod: new Date(2026, 1, 28), dateIssued: new Date(2026, 1, 1), amount: 12000, status: "paid" },

        { semester: "2nd", startPeriod: new Date(2026, 2, 1), endPeriod: new Date(2026, 2, 31), dateIssued: new Date(2026, 3, 1), amount: 3200, status: "paid" },
        { semester: "2nd", startPeriod: new Date(2026, 2, 1), endPeriod: new Date(2026, 2, 31), dateIssued: new Date(2026, 3, 1), amount: 900, status: "paid" },
        { semester: "2nd", startPeriod: new Date(2026, 2, 1), endPeriod: new Date(2026, 2, 31), dateIssued: new Date(2026, 3, 2), amount: 1500, status: "unpaid" },
        { semester: "2nd", startPeriod: new Date(2026, 2, 1), endPeriod: new Date(2026, 2, 31), dateIssued: new Date(2026, 2, 1), amount: 12000, status: "paid" },

        { semester: "2nd", startPeriod: new Date(2026, 3, 1), endPeriod: new Date(2026, 3, 30), dateIssued: new Date(2026, 4, 1), amount: 2900, status: "unpaid" },
        { semester: "2nd", startPeriod: new Date(2026, 3, 1), endPeriod: new Date(2026, 3, 30), dateIssued: new Date(2026, 4, 1), amount: 880, status: "paid" },
        { semester: "2nd", startPeriod: new Date(2026, 3, 1), endPeriod: new Date(2026, 3, 30), dateIssued: new Date(2026, 4, 2), amount: 1500, status: "paid" },
        { semester: "2nd", startPeriod: new Date(2026, 3, 1), endPeriod: new Date(2026, 3, 30), dateIssued: new Date(2026, 3, 1), amount: 12000, status: "paid" },

        { semester: "2nd", startPeriod: new Date(2026, 4, 1), endPeriod: new Date(2026, 4, 31), dateIssued: new Date(2026, 5, 1), amount: 3100, status: "unpaid" },
        { semester: "2nd", startPeriod: new Date(2026, 4, 1), endPeriod: new Date(2026, 4, 31), dateIssued: new Date(2026, 5, 1), amount: 870, status: "unpaid" },
        { semester: "2nd", startPeriod: new Date(2026, 4, 1), endPeriod: new Date(2026, 4, 31), dateIssued: new Date(2026, 5, 2), amount: 1500, status: "paid" },
        { semester: "2nd", startPeriod: new Date(2026, 4, 1), endPeriod: new Date(2026, 4, 31), dateIssued: new Date(2026, 4, 1), amount: 12000, status: "unpaid" },

        { semester: "2nd", startPeriod: new Date(2026, 4, 1), endPeriod: new Date(2026, 4, 31), dateIssued: new Date(2026, 4, 5), amount: 500, status: "paid" },

        { semester: "1st", startPeriod: new Date(2026, 5, 1), endPeriod: new Date(2026, 5, 30), dateIssued: new Date(2026, 6, 1), amount: 3300, status: "unpaid" },
        { semester: "1st", startPeriod: new Date(2026, 5, 1), endPeriod: new Date(2026, 5, 30), dateIssued: new Date(2026, 6, 1), amount: 910, status: "paid" },
        { semester: "1st", startPeriod: new Date(2026, 5, 1), endPeriod: new Date(2026, 5, 30), dateIssued: new Date(2026, 6, 2), amount: 1500, status: "paid" },
        { semester: "1st", startPeriod: new Date(2026, 5, 1), endPeriod: new Date(2026, 5, 30), dateIssued: new Date(2026, 5, 1), amount: 12000, status: "paid" }
    ];

    const earliestBill = [...bills]
        .filter(b => b.status === 'unpaid')
        .sort((a,b) => a.dateIssued.getTime() - b.dateIssued.getTime())[0] ?? null;
    
    
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

    const [sortBy, setSortBy] = useState("Status");
    const [searchQuery, setSearchQuery] = useState("");

    const sortedBills = useMemo(() => {
        const q = searchQuery.toLowerCase();
        return [...bills]
            .filter(a => !q || [
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
                if (sortBy === "Period (Asc.)")  return parseDate(a.endPeriod) - parseDate(b.endPeriod);
                if (sortBy === "Period (Desc.)") return parseDate(b.endPeriod) - parseDate(a.endPeriod);
                if (sortBy === "Amount (Asc.)") return a.amount - b.amount;
                if (sortBy === "Amount (Desc.)") return b.amount - a.amount;

                if (a.status !== b.status) return b.status.localeCompare(a.status);
                return a.dateIssued.getTime() - b.dateIssued.getTime();

            });
        }, [sortBy, searchQuery]);

    const totalApps = sortedBills.length;
    const [ROWS_PER_PAGE, setRows] = useState(5);
    const [currentPage, setCurrentPage] = useState(1);
    const totalPages = Math.ceil(sortedBills.length / ROWS_PER_PAGE);
    const inputRef = useRef<HTMLInputElement>(null);
    const paginated = sortedBills.slice((currentPage - 1) * ROWS_PER_PAGE, currentPage * ROWS_PER_PAGE);

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
                        <SummaryCards
                            key={card.label}
                            label={card.label}
                            value={card.value}
                            color={card.color}
                            sub={card.sub}
                        />
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
                    
                            <SearchBar
                                value={searchQuery}
                                onChange={setSearchQuery}
                                onPageReset={() => setCurrentPage(1)}/>
                        </div>
                    </div>
                    
                    <div className='overflow-auto flex-1 min-h-0 mt-3 rounded-t-lg'>
                        <BillingTable
                            bills={paginated}
                            onPay={(bill) => {setSelectedBill(bill); setPayOpen(true); }}>
                        </BillingTable>
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
                        <BillingModal
                            bill={selectedBill}
                            onClose={() => { setPayOpen(false); setSelectedBill(null); }}
                            onSubmit={() => { setPayOpen(false); setSelectedBill(null); }}
                        />
                    )}

                </div>
            </div>
            
        </div>
    )
}