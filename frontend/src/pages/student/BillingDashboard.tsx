// src/pages/student/BillingDashboard.tsx
import { useState, useMemo } from 'react'
import { motion } from "framer-motion"
import Dropdown from "../../components/ApplicationStatus/Dropdown";
import Pagination from '../../components/ApplicationStatus/Pagination';
import Sidebar from '../../components/Sidebar';
import HeroBanner from '../../components/dashboard/HeroBanner';
import BillingModal from '../../components/BillingDashboard/BillingModal';
import BillingTable from '../../components/BillingDashboard/BillingTable';
import SummaryCards from '../../components/BillingDashboard/SummaryCards';
import SearchBar from '../../components/SearchBar';
import { useFees } from '../../../hooks/useBillingQueries';
import { useProfile } from '../../../hooks/useDashboardQueries';
import CustomHeader from '../../components/CustomHeader';
import Toast from '@/components/Toast';
import UbleLoader from '../shared/LoadingPage';

// ── Types ──────────────────────────────────────────────────────
export interface Bill {
  id: number;
  landlord_id: number;
  student_number: string;
  due_date: Date;
  category: 'rent' | 'utilities' | 'miscellaneous';
  amount: number;
  balance: number;
  status: 'paid' | 'unpaid' | 'overdue' | 'partial';
  allowInstallments?: boolean;
  accommodation_name?: string;
}

// ── Component ──────────────────────────────────────────────────
export default function BillingDashboard() {
  const { data: bills = [], isLoading: billsLoading, isError, error } = useFees();
  const { data: profile, isLoading: profileLoading } = useProfile();

  const safeBills: Bill[] = Array.isArray(bills) ? bills : [];

  const currentResidence = safeBills[0]?.accommodation_name ?? '—';
  const studentName = profile ? `${profile.fname}` : '';

  const pendingBills = safeBills.filter(b =>
    b.status === 'unpaid' || b.status === 'partial' || b.status === 'overdue'
  );

  const totalOutstanding = pendingBills.reduce((acc, curr) => acc + (Number(curr.balance) || 0), 0);

  const nextDueBill = pendingBills
    .filter(b => b.status === 'unpaid' || b.status === 'partial')
    .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())[0] ?? null;

  const totalBilled = safeBills.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  const totalPaid = safeBills.reduce((acc, curr) => acc + (Number(curr.amount) - Number(curr.balance)), 0);

  const summaryCards = [
    {
      label: "outstanding",
      value: totalOutstanding,
      color: "#9E2040",
      sub: `${pendingBills.length} unpaid bill${pendingBills.length !== 1 ? 's' : ''}`
    },
    {
      label: "next due",
      value: nextDueBill?.amount ?? 0,
      color: "#000000",
      sub: nextDueBill?.due_date
        ? new Date(nextDueBill.due_date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
        : "-"
    },
    {
      label: "total billed",
      value: totalBilled,
      color: "#000000",
      sub: "all time"
    },
    {
      label: "total paid",
      value: totalPaid,
      color: "#1A7A4A",
      sub: `${totalBilled > 0 ? Math.trunc((totalPaid / totalBilled) * 100) : 0}% of total`
    },
  ];

  const [sortBy, setSortBy] = useState("Status");
  const [searchQuery, setSearchQuery] = useState("");

  const sortedBills = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return [...safeBills]
      .filter(a => !q || [
        String(a.amount),
        String(a.balance),
        a.category,
        a.status,
        new Date(a.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      ].some(field => field.toLowerCase().includes(q)))
      .sort((a, b) => {
        if (sortBy === "Date issued (Asc.)")  return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
        if (sortBy === "Date issued (Desc.)") return new Date(b.due_date).getTime() - new Date(a.due_date).getTime();
        if (sortBy === "Amount (Asc.)")  return (a.amount || 0) - (b.amount || 0);
        if (sortBy === "Amount (Desc.)") return (b.amount || 0) - (a.amount || 0);

        const order = { overdue: 0, unpaid: 1, partial: 2, paid: 3 } as Record<string, number>;
        if (a.status !== b.status) return (order[a.status] ?? 0) - (order[b.status] ?? 0);
        return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
      })
  }, [sortBy, searchQuery, safeBills]);

  const totalApps = sortedBills.length;
  const [ROWS_PER_PAGE, setRows] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(sortedBills.length / ROWS_PER_PAGE);
  const paginated = sortedBills.slice((currentPage - 1) * ROWS_PER_PAGE, currentPage * ROWS_PER_PAGE);

  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [payOpen, setPayOpen] = useState(false);

  const [toast, setToast] = useState<{
    show: boolean;
    type: "success" | "error" | "info" | "warning" | "loading";
    title: string;
    message?: string;
  }>({ show: false, type: "success", title: "" });

  if (billsLoading || profileLoading) {
      return <UbleLoader />
  }

  if (isError) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#F5EEF0]">
        <p className="text-[#6B0F2B] text-lg font-semibold">
          Failed to load fees. {error instanceof Error ? error.message : ''}
        </p>
      </div>
    )
  }

  return (
    <div className="bg-[#F5EEF0] h-screen overflow-hidden flex flex-row">
      <div className="flex flex-col w-full">
        <CustomHeader title="Billing Dashboard" />
        <div className="flex-1 flex flex-col overflow-hidden gap-6 p-6">

          <div>
            <HeroBanner
              greeting="Good Day"
              name={studentName}
              title="Manage your billing and payments"
              subtitle="Stay on top of your balances, track transactions, and view your payment history with ease"
              type="mini"
            />
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-6">
            <div className="flex items-center flex-row justify-between bg-gradient-to-br from-[#2A0410] via-[#6B0F2B] to-[#C05070] p-6 col-span-2 lg:col-span-1 rounded-2xl shrink-0">
              <div>
                <p className="uppercase font-bold text-white text-opacity-55 text-[12px] lg:text-[13px]">pay now</p>
                <h1 className="font-bold text-[20.22px] lg:text-[21.22px] text-white">
                  ₱{(nextDueBill?.amount ?? 0).toLocaleString()}
                </h1>
                <p className="text-white font-semibold text-opacity-55 text-[12.5px] lg:text-[13.5px]">
                  {nextDueBill?.due_date
                    ? new Date(nextDueBill.due_date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
                    : '-'}
                </p>
              </div>
              <button
                onClick={() => { 
                  if (nextDueBill) { 
                    setSelectedBill(nextDueBill); 
                    setPayOpen(true); 
                  } else {
                    setToast({ show: true, type: "info", title: "No bills due", message: "You have no outstanding payments." });
                  }
                }}
                className="flex shrink-0 justify-center items-center w-30 lg:w-14 h-10 flex-row text-[11px] text-white rounded-xl border-2 font-semibold border-white bg-white fill-white bg-opacity-25"
              >
                <p className='lg:hidden'>Pay Now</p>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-[#6B0F2B] self-center ml-2 lg:m-0" viewBox="0 0 24 24" fill="none">
                  <path d="M9 18l6-6-6-6" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
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

          <div className="flex-1 min-h-0 flex flex-col bg-white rounded-2xl p-6">
            <div className='flex flex-row justify-between'>
              <div className='my-auto'>
                <p className='font-bold'>Billing History</p>
                <p className='italic text-[11px] lg:text-[12px]'>{safeBills.length} total bills</p>
              </div>
              <div className='flex flex-row gap-2'>
                <div className='hidden lg:block'>
                  <Dropdown
                    title="No. of Items"
                    items={[
                      { label: "5", href: "" },
                      { label: "10", href: "" },
                      { label: "15", href: "" },
                      { label: "20", href: "" },
                    ]}
                    direction='down'
                    widthClass="w-29 lg:w-32"
                    titleClass="text-[10px] lg:text-[11px]"
                    selectedClass="text-[12px] lg:text-[13px]"
                    onSelect={(label) => { setRows(parseInt(label, 10)); setCurrentPage(1); }}
                  />
                </div>
                <Dropdown
                  title="Sort by"
                  items={[
                    { label: "Status", href: "" },
                    { label: "Date issued (Asc.)", href: "" },
                    { label: "Date issued (Desc.)", href: "" },
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
                  onPageReset={() => setCurrentPage(1)}
                />
              </div>
            </div>

            <div className='overflow-auto flex-1 min-h-0 mt-3 rounded-t-lg'>
              <BillingTable
                bills={paginated}
                onPay={(bill) => { setSelectedBill(bill); setPayOpen(true); }}
              />
            </div>

            <div className={`${bills.length === 0 ? "hidden" : "flex"} flex-col`}>
              <hr className="border-[#6B0F2B]/5 border-t-2" />
              <div className='flex flex-nowrap justify-between'>
                <div className='flex justify-start items-center gap-2'>
                  <span className='text-[11px] text-[#9A7080] p-0 mt-2 m-0'>
                    Showing {safeBills.length === 0 ? 0 : (currentPage - 1) * ROWS_PER_PAGE + 1}–{Math.min(currentPage * ROWS_PER_PAGE, totalApps)} of {totalApps}
                  </span>
                </div>
                <div className="flex justify-between items-center m-2 mt-6 text-sm text-[#9A7080]">
                  <div className="flex gap-2 text-[12px] lg:text-[15px]">
                    <Pagination
                      totalPages={totalPages}
                      currentPage={currentPage}
                      onPageChange={setCurrentPage}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {payOpen && selectedBill && (
        <BillingModal
          bill={selectedBill}
          onClose={() => { setPayOpen(false); setSelectedBill(null); }}
          onSubmit={(success: any) => { 
            setPayOpen(false); 
            setSelectedBill(null); 
            setToast({
              show: true,
              type: success ? "success" : "error",
              title: success ? "Payment Submitted!" : "Payment Failed",
              message: success ? "Your payment is being verified." : "Please try again."
            });
          }}
        />
      )}
      <Toast
        type={toast.type}
        title={toast.title}
        message={toast.message}
        show={toast.show}
        onClose={() => setToast(prev => ({ ...prev, show: false }))}
      />
    </div>
  )
}
