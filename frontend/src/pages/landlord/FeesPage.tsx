import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../api/axios'
import { useUserStore } from '../../stores/useUserStore'
import Sidebar from '../../components/Sidebar'
import HeroBanner from '../../components/dashboard/HeroBanner'
import CustomHeader from '../../components/CustomHeader';
import Dropdown from "@/components/ApplicationStatus/Dropdown"
import SearchBar from "@/components/SearchBar"
import Toast from "@/components/Toast"
import Modal from "@/components/Modal"
import Button from "@/components/Button"
import Card from "@/components/ui/Card"
import SummaryCards from '../../components/BillingDashboard/SummaryCards';
import { IoPersonSharp, IoCalendarSharp, IoBedSharp, IoDocumentSharp, IoDocumentTextSharp, IoIdCardSharp } from "react-icons/io5"

// ─── Types ─────────────────────────────────────────────────────────────────

interface OverdueFee {
  id: number
  student_number: string
  due_date: string
  fee_amount: number
  fee_balance: number
  fee_status: string
  fee_category: string
  fname: string
  lname: string
  room_number: string
  room_type: string
  accommodation_name: string
  move_in: string
  expected_move_out: string
}

interface PendingPayment {
  id: number
  paymentAmount: number
  paymentStatus: string
  paymentTimestamp: string
  modeOfPayment: string
  fee: {
    id: number
    feeCategory: string
    studentNumber: string
    student?: {
      user?: { fname: string; lname: string; email: string }
    }
  }
  proofFile: { filePath: string } | null
}

// ─── API ───────────────────────────────────────────────────────────────────

const fetchOverdueFees = async (accommodationId: number): Promise<OverdueFee[]> => {
  const res = await api.get('/fees/overdue', { params: { accommodationId } })
  return res.data
}

const fetchPendingPayments = async (accommodationId: number): Promise<PendingPayment[]> => {
  const res = await api.get('/payments/pending', { params: { accommodationId } })
  return res.data
}

const verifyPayment = async ({ id, action }: { id: number; action: 'approve' | 'reject' }) => {
  const res = await api.patch(`/payments/${id}/verify`, { action })
  return res.data
}

const sendReminder = async ({ feeId, studentNumber, feeCategory, amount, dueDate }: { 
  feeId: number; 
  studentNumber: string; 
  feeCategory: string; 
  amount: number; 
  dueDate: string 
}) => {
  const res = await api.post(`/fees/${feeId}/reminder`, {
    studentNumber,
    feeCategory,
    amount,
    dueDate
  })
  return res.data
}

// ─── Overdue Fee Modal Content ─────────────────────────────────────────────
function OverdueFeeModalContent({ fee, onClose, onSendReminder, isSending }: { 
  fee: OverdueFee; 
  onClose: () => void; 
  onSendReminder: () => void;
  isSending: boolean;
}) {
  return (
    <Card className="!p-0">
      <div className="flex flex-col gap-6 p-6">
        {/* HEADER */}
        <div className="flex flex-row justify-between items-start">
          <div className="flex flex-col">
            <p className="text-[#1A0008] font-bold text-xl">{fee.fname} {fee.lname}</p>
            <p className="text-[#C8B0B8] text-xs mt-1">
              Student Number: {fee.student_number}
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[0.7rem] font-semibold whitespace-nowrap bg-red-100 text-red-800">
            <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
            Overdue
          </span>
        </div>

        {/* FEE DETAILS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border border-[#F5ECF0] rounded-xl p-4">
          <div className="col-span-1 sm:border-r border-[#F5ECF0] sm:pr-4">
            <p className="flex flex-row gap-2 items-center font-semibold text-[#1A0008] mb-3">
              <IoDocumentSharp size={18} color="#6B0F2B" />
              Fee Details
            </p>
            <div className="grid grid-cols-2 gap-y-3">
              <div className="col-span-2">
                <p className="text-[#9A7080] text-[10px] uppercase font-semibold tracking-wide">Category</p>
                <p className="text-[#1A0008] text-sm capitalize">{fee.fee_category}</p>
              </div>
              <div className="col-span-1">
                <p className="text-[#9A7080] text-[10px] uppercase font-semibold tracking-wide">Original Amount</p>
                <p className="text-[#1A0008] text-sm">₱{fee.fee_amount?.toLocaleString() ?? 0}</p>
              </div>
              <div className="col-span-1">
                <p className="text-[#9A7080] text-[10px] uppercase font-semibold tracking-wide">Balance</p>
                <p className="text-[#1A0008] text-sm font-bold text-red-600">₱{fee.fee_balance?.toLocaleString() ?? 0}</p>
              </div>
            </div>
          </div>

          <div className="col-span-1 sm:pl-2">
            <p className="flex flex-row gap-2 items-center font-semibold text-[#1A0008] mb-3">
              <IoCalendarSharp size={18} color="#6B0F2B" />
              Due Date
            </p>
            <div className="flex flex-col gap-3">
              <div>
                <p className="text-[#9A7080] text-[10px] uppercase font-semibold tracking-wide">Due Date</p>
                <p className="text-[#1A0008] text-sm">
                  {new Date(fee.due_date).toLocaleDateString('en-PH', { month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
              <div>
                <p className="text-[#9A7080] text-[10px] uppercase font-semibold tracking-wide">Overdue Since</p>
                <p className="text-[#1A0008] text-sm text-red-600">{timeAgo(fee.due_date)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* ROOM INFORMATION */}
        <div className="border border-[#F5ECF0] rounded-xl p-4">
          <p className="flex flex-row gap-2 items-center font-semibold text-[#1A0008] mb-3">
            <IoBedSharp size={18} color="#6B0F2B" />
            Room Information
          </p>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-[#9A7080] text-[10px] uppercase font-semibold tracking-wide">Room Number</p>
              <p className="text-[#1A0008] text-sm">{fee.room_number || '—'}</p>
            </div>
            <div>
              <p className="text-[#9A7080] text-[10px] uppercase font-semibold tracking-wide">Building</p>
              <p className="text-[#1A0008] text-sm">{fee.accommodation_name || '—'}</p>
            </div>
            <div>
              <p className="text-[#9A7080] text-[10px] uppercase font-semibold tracking-wide">Room Type</p>
              <p className="text-[#1A0008] text-sm capitalize">{fee.room_type || '—'}</p>
            </div>
          </div>
        </div>

        {/* STAY DURATION */}
        <div className="border border-[#F5ECF0] rounded-xl p-4">
          <p className="flex flex-row gap-2 items-center font-semibold text-[#1A0008] mb-3">
            <IoCalendarSharp size={18} color="#6B0F2B" />
            Stay Duration
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[#9A7080] text-[10px] uppercase font-semibold tracking-wide">Move In</p>
              <p className="text-[#1A0008] text-sm">
                {fee.move_in ? new Date(fee.move_in).toLocaleDateString('en-PH', { month: 'long', year: 'numeric' }) : '—'}
              </p>
            </div>
            <div>
              <p className="text-[#9A7080] text-[10px] uppercase font-semibold tracking-wide">Expected Move Out</p>
              <p className="text-[#1A0008] text-sm">
                {fee.expected_move_out ? new Date(fee.expected_move_out).toLocaleDateString('en-PH', { month: 'long', year: 'numeric' }) : '—'}
              </p>
            </div>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="flex flex-row justify-end gap-3 pt-1">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
          <Button 
            variant="primary" 
            onClick={onSendReminder} 
            disabled={isSending}
          >
            {isSending ? "Sending..." : "Send Reminder"}
          </Button>
        </div>
      </div>
    </Card>
  )
}

// ─── Helpers ───────────────────────────────────────────────────────────────

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good Morning'
  if (h < 18) return 'Good Afternoon'
  return 'Good Evening'
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  if (days === 0) return 'Today'
  if (days === 1) return '1 day ago'
  return `${days} days ago`
}

// ─── Filter Tabs ──────────────────────────────────────────────────────

type ActiveTab = 'Payment Verification' | 'Overdue Fees'

function FilterTabs({ active, setActive }: { active: ActiveTab; setActive: (tab: ActiveTab) => void }) {
  const tabs: ActiveTab[] = ['Payment Verification', 'Overdue Fees']
  return (
    <div className="bg-white p-1 rounded-xl inline-flex gap-1">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => setActive(tab)}
          className={`px-4 py-1.5 text-sm rounded-lg transition ${
            active === tab
              ? 'bg-[#6B0F2B] text-white shadow'
              : 'text-gray-500 hover:text-black'
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  )
}

// ─── Payment Verification Row ──────────────────────────────────────────────

function PaymentRow({ payment, onVerify, isPending }: { 
  payment: PendingPayment; 
  onVerify: (id: number, action: 'approve' | 'reject') => void;
  isPending: boolean;
}) {
  const [showActions, setShowActions] = useState(false)
  const studentName = payment.fee?.student?.user
    ? `${payment.fee.student.user.fname} ${payment.fee.student.user.lname}`
    : payment.fee?.studentNumber || 'Unknown'

  return (
    <tr className="hover:bg-gray-50 transition-all border-b last:border-0">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#6B0F2B] to-[#9E2040] flex items-center justify-center text-white font-bold text-sm">
            {studentName.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-medium text-sm">{studentName}</p>
            <p className="text-xs text-gray-400">{payment.fee?.studentNumber}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <p className="font-semibold text-[#C9973A]">₱{payment.paymentAmount.toLocaleString()}</p>
        <p className="text-xs text-gray-400 capitalize">{payment.modeOfPayment}</p>
      </td>
      <td className="px-4 py-3">
        <p className="text-sm">{new Date(payment.paymentTimestamp).toLocaleDateString()}</p>
        <p className="text-xs text-gray-400">{timeAgo(payment.paymentTimestamp)}</p>
      </td>
      <td className="px-4 py-3 text-right relative">
        <div className="flex gap-2 justify-end items-center">
          {payment.proofFile?.filePath && (
            <a
              href={payment.proofFile.filePath}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1 rounded-lg border border-[#6B0F2B] text-[#6B0F2B] text-xs font-semibold hover:bg-[#6B0F2B]/5"
            >
              View Proof
            </a>
          )}
          {showActions ? (
            <>
              <button
                onClick={() => onVerify(payment.id, 'approve')}
                disabled={isPending}
                className="px-3 py-1 rounded-lg bg-green-600 text-white text-xs font-semibold hover:bg-green-700 disabled:opacity-50"
              >
                Approve
              </button>
              <button
                onClick={() => onVerify(payment.id, 'reject')}
                disabled={isPending}
                className="px-3 py-1 rounded-lg bg-red-600 text-white text-xs font-semibold hover:bg-red-700 disabled:opacity-50"
              >
                Reject
              </button>
              <button
                onClick={() => setShowActions(false)}
                className="px-3 py-1 rounded-lg bg-gray-200 text-gray-700 text-xs font-semibold hover:bg-gray-300"
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              onClick={() => setShowActions(true)}
              className="px-4 py-1.5 rounded-lg bg-[#6B0F2B] text-white text-sm font-semibold hover:bg-[#5a0822]"
            >
              Review
            </button>
          )}
        </div>
      </td>
    </tr>
  )
}

// ─── Overdue Fee Row ───────────────────────────────────────────────────────

function OverdueRow({ fee, onView }: { fee: OverdueFee; onView: (fee: OverdueFee) => void }) {
  return (
    <tr className="hover:bg-gray-50 transition-all border-b last:border-0">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#6B0F2B] to-[#9E2040] flex items-center justify-center text-white font-bold text-sm">
            {fee.fname?.charAt(0)?.toUpperCase() || '?'}
          </div>
          <div>
            <p className="font-medium text-sm">{fee.fname} {fee.lname}</p>
            <p className="text-xs text-gray-400">{fee.student_number}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <p className="font-semibold text-red-600">₱{fee.fee_balance?.toLocaleString() ?? 0}</p>
        <p className="text-xs text-gray-400 capitalize">{fee.fee_category}</p>
      </td>
      <td className="px-4 py-3">
        <p className="text-sm">{new Date(fee.due_date).toLocaleDateString()}</p>
        <p className="text-xs text-red-400">{timeAgo(fee.due_date)}</p>
      </td>
      <td className="px-4 py-3 text-right">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onView(fee)}
        >
          View Details
        </Button>
      </td>
    </tr>
  )
}

// ─── Pagination ────────────────────────────────────────────────────────────

function Pagination({ currentPage, totalPages, onPageChange }: { currentPage: number; totalPages: number; onPageChange: (page: number) => void }) {
  if (totalPages <= 1) return null

  return (
    <div className="flex gap-1">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-semibold border border-gray-200 text-[#6B0F2B] disabled:opacity-40 disabled:cursor-not-allowed"
      >
        ‹
      </button>
      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
        let pageNum = currentPage
        if (totalPages <= 5) pageNum = i + 1
        else if (currentPage <= 3) pageNum = i + 1
        else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i
        else pageNum = currentPage - 2 + i

        if (pageNum > totalPages) return null
        return (
          <button
            key={pageNum}
            onClick={() => onPageChange(pageNum)}
            className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-semibold transition ${
              currentPage === pageNum
                ? 'text-white'
                : 'border border-gray-200 text-[#6B0F2B]'
            }`}
            style={currentPage === pageNum ? { background: 'linear-gradient(135deg,#3D0718,#6B0F2B)', boxShadow: '0 4px 12px rgba(107,15,43,0.35)' } : {}}
          >
            {pageNum}
          </button>
        )
      })}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-semibold border border-gray-200 text-[#6B0F2B] disabled:opacity-40 disabled:cursor-not-allowed"
      >
        ›
      </button>
    </div>
  )
}

// ─── Main Page ─────────────────────────────────────────────────────────────

export default function FeesPage() {
  const { user } = useUserStore()
  const qc = useQueryClient()
  const [search, setSearch] = useState('')

  // Overdue fee modal state
  const [selectedFee, setSelectedFee] = useState<OverdueFee | null>(null)
  const [feeModalOpen, setFeeModalOpen] = useState(false)
  const [isSendingReminder, setIsSendingReminder] = useState(false)

  const handleViewFee = (fee: OverdueFee) => {
    setSelectedFee(fee)
    setFeeModalOpen(true)
  }

  const handleCloseFeeModal = () => {
    setFeeModalOpen(false)
    setTimeout(() => setSelectedFee(null), 350)
  }

  // Send reminder mutation
  const sendReminderMutation = useMutation({
    mutationFn: sendReminder,
    onSuccess: () => {
      setToast({
        show: true,
        type: "success",
        title: "Reminder Sent",
        message: `A payment reminder has been sent to ${selectedFee?.fname} ${selectedFee?.lname}.`
      })
      handleCloseFeeModal()
    },
    onError: (error: any) => {
      setToast({
        show: true,
        type: "error",
        title: "Failed to Send Reminder",
        message: error.response?.data?.message || "Could not send the payment reminder."
      })
    },
    onSettled: () => {
      setIsSendingReminder(false)
    }
  })

  const handleSendReminder = () => {
    if (!selectedFee) return
    setIsSendingReminder(true)
    sendReminderMutation.mutate({
      feeId: selectedFee.id,
      studentNumber: selectedFee.student_number,
      feeCategory: selectedFee.fee_category,
      amount: selectedFee.fee_balance,
      dueDate: selectedFee.due_date
    })
  }

  const [activeTab, setActiveTab] = useState<ActiveTab>('Payment Verification')
  const [itemsPerPage, setItemsPerPage] = useState(6)
  const [currentPage, setCurrentPage] = useState(1)
  const [paymentSearch, setPaymentSearch] = useState('')
  const [accommodations, setAccommodations] = useState<{ id: number; accommodationName: string }[]>([])
  const [selectedAccomId, setSelectedAccomId] = useState<number | null>(null)

  const [toast, setToast] = useState<{
    show: boolean;
    type: "success" | "error" | "info" | "warning" | "loading";
    title: string;
    message?: string;
  }>({ show: false, type: "success", title: "" });

  useEffect(() => {
    api.get('/landlord/accommodations').then((res) => {
      const list = res.data ?? []
      setAccommodations(list)
      if (list.length > 0) {
        const storedId = Number(sessionStorage.getItem('landlord-acc-id'))
        const match = list.find((a: any) => a.id === storedId)
        setSelectedAccomId(match ? storedId : list[0].id)
      }
    }).catch(() => {
      setToast({ show: true, type: "error", title: "Failed to Load", message: "Could not load accommodations." })
    })
  }, [])

  const { data: overdueFees = [], isLoading: loadingFees, refetch: refetchOverdue, error: overdueError } = useQuery({
    queryKey: ['fees', 'overdue', selectedAccomId],
    queryFn: () => fetchOverdueFees(selectedAccomId!),
    enabled: !!selectedAccomId,
  })

  const { data: pendingPayments = [], isLoading: loadingPayments, refetch: refetchPayments, error: paymentError } = useQuery({
    queryKey: ['payments', 'pending', selectedAccomId],
    queryFn: () => fetchPendingPayments(selectedAccomId!),
    enabled: !!selectedAccomId,
  })

  useEffect(() => {
    if (overdueError) setToast({ show: true, type: "error", title: "Failed to Load Overdue Fees", message: "Could not fetch overdue fees data." })
  }, [overdueError])

  useEffect(() => {
    if (paymentError) setToast({ show: true, type: "error", title: "Failed to Load Payments", message: "Could not fetch pending payments data." })
  }, [paymentError])

  const verifyMutation = useMutation({
    mutationFn: verifyPayment,
    onSuccess: (data, variables) => {
      refetchPayments()
      refetchOverdue()
      if (variables.action === 'approve') {
        setToast({ show: true, type: "success", title: "Payment Approved!", message: "The payment has been successfully verified." })
      } else {
        setToast({ show: true, type: "success", title: "Payment Rejected", message: "The payment has been rejected." })
      }
    },
    onError: (error: any) => {
      setToast({ show: true, type: "error", title: "Action Failed", message: error.response?.data?.message || "Could not process the payment verification." })
    }
  })

  const handleVerify = (id: number, action: 'approve' | 'reject') => {
    verifyMutation.mutate({ id, action })
  }

  const filteredFees = overdueFees.filter((f) =>
    `${f.fname} ${f.lname}`.toLowerCase().includes(search.toLowerCase())
  )

  const totalFeePages = Math.ceil(filteredFees.length / itemsPerPage)
  const paginatedFees = filteredFees.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const filteredPayments = pendingPayments.filter((p) =>
    p.fee?.studentNumber?.toLowerCase().includes(paymentSearch.toLowerCase()) ||
    p.fee?.student?.user?.fname?.toLowerCase().includes(paymentSearch.toLowerCase())
  )

  const fullName = user ? `${user.fname} ${user.lname}` : ''
  const totalOverdue = overdueFees.reduce((sum, f) => sum + (Number(f.fee_balance) || 0), 0)
  const totalPendingPayments = pendingPayments.reduce((sum, p) => sum + (p.paymentAmount || 0), 0)

  const summaryCards = [
    {
      label: "total overdue",
      value: totalOverdue,
      color: "#9E2040",
      sub: `${overdueFees.length} overdue account${overdueFees.length !== 1 ? "s" : ""}`,
      includePeso: true
    },
    {
      label: "pending verifications",
      value: totalPendingPayments,
      color: "#D97706",
      sub: `${pendingPayments.length} payment${pendingPayments.length !== 1 ? "s" : ""} to review`,
      includePeso: false
    },
    {
      label: "total collections",
      value: "—",
      color: "#1A7A4A",
      sub: "This month",
      includePeso: false
    },
    {
      label: "collection rate",
      value: "—",
      color: "#000000",
      sub: "Target: 95%",
      includePeso: false
    },
  ];

  return (
    <div className="flex h-screen bg-[#F6F2F4] w-full">
      <div className="flex flex-col w-full h-full">
        <CustomHeader title="Fees" />
        <main className="flex-1 p-6 overflow-y-auto w-full">
          <HeroBanner
            greeting={greeting()}
            name={fullName}
            title="Check the billing status of your tenants"
            subtitle="We make it easy for you to track the bills you manage."
            type="mini"
          />
          
          <div className='grid grid-cols-2 lg:grid-cols-4 w-full gap-6 mt-6'>
              {/* Summary Cards */}
              {summaryCards.map(card => (
                  <SummaryCards
                    key={card.label}
                    label={card.label}
                    value={card.value}
                    color={card.color}
                    sub={card.sub}
                    includePeso={card.includePeso}
                  />
                ))}
          </div>
          
          
          

          <div className="mt-5 space-y-4">
            <div className="flex justify-between items-center flex-wrap gap-3">
              <FilterTabs active={activeTab} setActive={setActiveTab} />
            </div>

            {/* Payment Verification Panel */}
            {activeTab === 'Payment Verification' && (
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <div className="flex flex-row items-center mb-3">
                  <div>
                    <h2 className="text-[16px] font-bold text-black">Payment Verification</h2>
                    <p className="text-[12px] italic text-gray-500">{filteredPayments.length} pending payments</p>
                  </div>
                  <div className="flex items-end gap-3 ml-auto">
                    <Dropdown
                      title="No. of Items"
                      items={[
                        { label: "5", href: "" },
                        { label: "10", href: "" },
                        { label: "15", href: "" },
                        { label: "20", href: "" },
                      ]}
                      direction="down"
                      widthClass="w-29 lg:w-32"
                      titleClass="text-[10px] lg:text-[11px]"
                      selectedClass="text-[12px] lg:text-[13px]"
                      onSelect={(label) => setItemsPerPage(Number(label))}
                    />
                    <SearchBar
                      value={paymentSearch}
                      onChange={(query) => setPaymentSearch(query)}
                      onPageReset={() => setCurrentPage(1)}
                    />
                  </div>
                </div>

                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-[10px] text-[#9A7080] uppercase tracking-widest font-bold text-left border-y border-[#6B0F2B]/10">
                      <th className="px-4 py-2">Student</th>
                      <th className="px-4 py-2">Amount</th>
                      <th className="px-4 py-2">Date</th>
                      <th className="px-4 py-2 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingPayments ? (
                      <tr>
                        <td colSpan={4} className="text-center py-16 text-gray-400">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6B0F2B] mx-auto mb-2" />
                          Loading...
                        </td>
                      </tr>
                    ) : filteredPayments.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="text-center py-16 text-gray-400">No pending payments.</td>
                      </tr>
                    ) : (
                      filteredPayments.map((payment) => (
                        <PaymentRow
                          key={payment.id}
                          payment={payment}
                          onVerify={handleVerify}
                          isPending={verifyMutation.isPending}
                        />
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Overdue Fees Panel */}
            {activeTab === 'Overdue Fees' && (
              <div className="bg-white rounded-2xl shadow-sm p-5">
                <div className="flex flex-row items-center mb-3">
                  <div>
                    <h2 className="text-[16px] font-bold text-black">Overdue Fees</h2>
                    <p className="text-[12px] italic text-gray-500">{filteredFees.length} overdue tenants</p>
                  </div>
                  <div className="flex items-end gap-3 ml-auto">
                    <Dropdown
                      title="No. of Items"
                      items={[
                        { label: "5", href: "" },
                        { label: "10", href: "" },
                        { label: "15", href: "" },
                        { label: "20", href: "" },
                      ]}
                      direction="down"
                      widthClass="w-29 lg:w-32"
                      titleClass="text-[10px] lg:text-[11px]"
                      selectedClass="text-[12px] lg:text-[13px]"
                      onSelect={(label) => {
                        setItemsPerPage(Number(label))
                        setCurrentPage(1)
                      }}
                    />
                    <SearchBar
                      value={search}
                      onChange={(query) => {
                        setSearch(query)
                        setCurrentPage(1)
                      }}
                      onPageReset={() => setCurrentPage(1)}
                    />
                  </div>
                </div>

                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-[10px] text-[#9A7080] uppercase tracking-widest font-bold text-left border-y border-[#6B0F2B]/10">
                      <th className="px-4 py-2">Student</th>
                      <th className="px-4 py-2">Amount Due</th>
                      <th className="px-4 py-2">Date</th>
                      <th className="px-4 py-2 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingFees ? (
                      <tr>
                        <td colSpan={4} className="text-center py-16 text-gray-400">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6B0F2B] mx-auto mb-2" />
                          Loading...
                        </td>
                      </tr>
                    ) : paginatedFees.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="text-center py-16 text-gray-400">No overdue fees.</td>
                      </tr>
                    ) : (
                      paginatedFees.map((fee) => (
                        <OverdueRow key={fee.id} fee={fee} onView={handleViewFee} />
                      ))
                    )}
                  </tbody>
                </table>

                {totalFeePages > 1 && (
                  <div className="flex items-center justify-between px-2 mt-4 pt-3 border-t border-gray-100">
                    <span className="text-xs text-gray-400">
                      Showing {(currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, filteredFees.length)} of {filteredFees.length}
                    </span>
                    <Pagination currentPage={currentPage} totalPages={totalFeePages} onPageChange={setCurrentPage} />
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Overdue Fee Modal */}
      <Modal
        open={feeModalOpen}
        onClose={handleCloseFeeModal}
        title="OVERDUE FEE DETAILS"
        eyebrow="Payment Information"
        maxWidth={700}
        maxHeight={650}
      >
        {selectedFee && (
          <OverdueFeeModalContent 
            fee={selectedFee} 
            onClose={handleCloseFeeModal}
            onSendReminder={handleSendReminder}
            isSending={isSendingReminder}
          />
        )}
      </Modal>

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