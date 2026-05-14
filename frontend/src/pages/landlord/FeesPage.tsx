import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../api/axios'
import { useUserStore } from '../../stores/useUserStore'
import Sidebar from '../../components/Sidebar'
import HeroBanner from '../../components/dashboard/HeroBanner'
import Dropdown from "@/components/ApplicationStatus/Dropdown"
import SearchBar from "@/components/SearchBar"

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

function PaymentRow({ payment, onVerify }: { payment: PendingPayment; onVerify: (id: number, action: 'approve' | 'reject') => void }) {
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
        {showActions ? (
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => onVerify(payment.id, 'approve')}
              className="px-3 py-1 rounded-lg bg-green-600 text-white text-xs font-semibold hover:bg-green-700"
            >
              Approve
            </button>
            <button
              onClick={() => onVerify(payment.id, 'reject')}
              className="px-3 py-1 rounded-lg bg-red-600 text-white text-xs font-semibold hover:bg-red-700"
            >
              Reject
            </button>
            <button
              onClick={() => setShowActions(false)}
              className="px-3 py-1 rounded-lg bg-gray-200 text-gray-700 text-xs font-semibold hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowActions(true)}
            className="px-4 py-1.5 rounded-lg bg-[#6B0F2B] text-white text-sm font-semibold hover:bg-[#5a0822]"
          >
            Review
          </button>
        )}
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
        <button
          onClick={() => onView(fee)}
          className="px-4 py-1.5 rounded-lg border border-[#6B0F2B] text-[#6B0F2B] text-sm font-semibold hover:bg-[#6B0F2B] hover:text-white transition"
        >
          View Details
        </button>
      </td>
    </tr>
  )
}

// ─── Overdue Fee Modal ──────────────────────────────────────────────────────

function OverdueFeeModal({ fee, onClose }: { fee: OverdueFee; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-2xl w-[480px] overflow-hidden shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="bg-[#6B0F2B] text-white text-center py-4 relative">
          <h2 className="font-bold tracking-widest text-sm uppercase">Overdue Fee Details</h2>
          <button onClick={onClose} className="absolute right-4 top-4 text-white/70 hover:text-white">✕</button>
        </div>

        <div className="p-6">
          <h3 className="text-xl font-bold text-[#3D0718] mb-5">{fee.fname} {fee.lname}</h3>

          <div className="grid grid-cols-2 gap-5">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Due Date</p>
              <p className="font-medium text-sm">
                {new Date(fee.due_date).toLocaleDateString('en-PH', { month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
              <p className="text-xs text-red-400">{timeAgo(fee.due_date)}</p>
            </div>

            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Amount Due</p>
              <p className="text-lg font-bold text-red-600">₱{fee.fee_balance?.toLocaleString() ?? 0}</p>
              <p className="text-xs text-gray-400">Original: ₱{fee.fee_amount?.toLocaleString() ?? 0}</p>
            </div>

            <div className="col-span-2">
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Room Information</p>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div>
                  <p className="text-gray-400 text-xs">Room Number</p>
                  <p className="font-medium">{fee.room_number || '—'}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Building</p>
                  <p className="font-medium">{fee.accommodation_name || '—'}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Room Type</p>
                  <p className="font-medium capitalize">{fee.room_type || '—'}</p>
                </div>
              </div>
            </div>

            <div className="col-span-2">
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Stay Duration</p>
              <p className="text-sm">
                {fee.move_in ? new Date(fee.move_in).toLocaleDateString('en-PH', { month: 'long', year: 'numeric' }) : '—'}
                {' – '}
                {fee.expected_move_out ? new Date(fee.expected_move_out).toLocaleDateString('en-PH', { month: 'long', year: 'numeric' }) : '—'}
              </p>
            </div>
          </div>
        </div>

        <div className="px-6 pb-5 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 text-sm hover:bg-gray-50"
          >
            Close
          </button>
          <button className="bg-[#3D0718] text-white text-sm px-6 py-2 rounded-lg hover:bg-[#6B0F2B] transition-colors">
            Send Reminder
          </button>
        </div>
      </div>
    </div>
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
  const [selectedFee, setSelectedFee] = useState<OverdueFee | null>(null)
  const [activeTab, setActiveTab] = useState<ActiveTab>('Payment Verification')
  const [itemsPerPage, setItemsPerPage] = useState(6)
  const [currentPage, setCurrentPage] = useState(1)
  const [paymentSearch, setPaymentSearch] = useState('')
  const [accommodations, setAccommodations] = useState<{ id: number; accommodationName: string }[]>([])
  const [selectedAccomId, setSelectedAccomId] = useState<number | null>(null)

  // ─── FETCH ACCOMMODATIONS ON MOUNT (mirrors RoomsPage) ───
  useEffect(() => {
    api.get('/landlord/accommodations').then((res) => {
      const list = res.data ?? []
      setAccommodations(list)
      if (list.length > 0) {
        const storedId = Number(sessionStorage.getItem('landlord-acc-id'))
        const match = list.find((a: any) => a.id === storedId)
        setSelectedAccomId(match ? storedId : list[0].id)
      }
    })
  }, [])

  const { data: overdueFees = [], isLoading: loadingFees, refetch: refetchOverdue } = useQuery({
    queryKey: ['fees', 'overdue', selectedAccomId],
    queryFn: () => fetchOverdueFees(selectedAccomId!),
    enabled: !!selectedAccomId,
  })

  const { data: pendingPayments = [], isLoading: loadingPayments, refetch: refetchPayments } = useQuery({
    queryKey: ['payments', 'pending', selectedAccomId],
    queryFn: () => fetchPendingPayments(selectedAccomId!),
    enabled: !!selectedAccomId,
  })

  const verifyMutation = useMutation({
    mutationFn: verifyPayment,
    onSuccess: () => {
      refetchPayments()
      refetchOverdue()
    },
  })

  const handleVerify = (id: number, action: 'approve' | 'reject') => {
    verifyMutation.mutate({ id, action })
  }

  const handleAccomChange = (id: number) => {
    setSelectedAccomId(id)
    sessionStorage.setItem('landlord-acc-id', String(id))
    setCurrentPage(1)
  }

  // Filter and paginate overdue fees
  const filteredFees = overdueFees.filter((f) =>
    `${f.fname} ${f.lname}`.toLowerCase().includes(search.toLowerCase())
  )

  const totalFeePages = Math.ceil(filteredFees.length / itemsPerPage)
  const paginatedFees = filteredFees.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  // Filter pending payments
  const filteredPayments = pendingPayments.filter((p) =>
    p.fee?.studentNumber?.toLowerCase().includes(paymentSearch.toLowerCase()) ||
    p.fee?.student?.user?.fname?.toLowerCase().includes(paymentSearch.toLowerCase())
  )

  const fullName = user ? `${user.fname} ${user.lname}` : ''

  const totalOverdue = overdueFees.reduce((sum, f) => sum + (Number(f.fee_balance) || 0), 0)
  const totalPendingPayments = pendingPayments.reduce((sum, p) => sum + (p.paymentAmount || 0), 0)

  return (
    <div className="flex min-h-screen bg-[#f5f0f1]">
      <Sidebar role="landlord" />

      <div className="flex-1 p-6 overflow-y-auto">
        <HeroBanner
          greeting={greeting()}
          name={fullName}
          title="Check the billing status of your tenants"
          subtitle="We make it easy for you to track the accommodation applications you manage."
          type="mini"
        />

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-5">
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <p className="text-xs text-gray-400 uppercase tracking-wide">Total Overdue</p>
            <p className="text-2xl font-bold text-red-600">₱{totalOverdue.toLocaleString()}</p>
            <p className="text-xs text-gray-400 mt-1">{overdueFees.length} overdue accounts</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <p className="text-xs text-gray-400 uppercase tracking-wide">Pending Verifications</p>
            <p className="text-2xl font-bold text-amber-600">₱{totalPendingPayments.toLocaleString()}</p>
            <p className="text-xs text-gray-400 mt-1">{pendingPayments.length} payments to review</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <p className="text-xs text-gray-400 uppercase tracking-wide">Total Collections</p>
            <p className="text-2xl font-bold text-green-600">—</p>
            <p className="text-xs text-gray-400 mt-1">This month</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <p className="text-xs text-gray-400 uppercase tracking-wide">Collection Rate</p>
            <p className="text-2xl font-bold text-[#6B0F2B]">—</p>
            <p className="text-xs text-gray-400 mt-1">Target: 95%</p>
          </div>
        </div>

        <div className="mt-5 space-y-4">
          {/* Tabs + Accommodation Switcher */}
          <div className="flex justify-between items-center flex-wrap gap-3">
            <FilterTabs active={activeTab} setActive={setActiveTab} />
            {accommodations.length > 1 && (
              <select
                value={selectedAccomId ?? ''}
                onChange={(e) => handleAccomChange(Number(e.target.value))}
                className="bg-white border border-gray-200 rounded-xl px-4 py-2 text-xs font-bold text-gray-500 outline-none shadow-sm"
              >
                {accommodations.map((acc) => (
                  <option key={acc.id} value={acc.id}>{acc.accommodationName}</option>
                ))}
              </select>
            )}
          </div>

          {/* Payment Verification Panel */}
          {activeTab === 'Payment Verification' && (
            <div className="bg-white rounded-2xl shadow-sm p-5">
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
                    <tr><td colSpan={4} className="text-center py-16 text-gray-400">Loading...</td></tr>
                  ) : filteredPayments.length === 0 ? (
                    <tr><td colSpan={4} className="text-center py-16 text-gray-400">No pending payments.</td></tr>
                  ) : (
                    filteredPayments.map((payment) => (
                      <PaymentRow key={payment.id} payment={payment} onVerify={handleVerify} />
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
                    <tr><td colSpan={4} className="text-center py-16 text-gray-400">Loading...</td></tr>
                  ) : paginatedFees.length === 0 ? (
                    <tr><td colSpan={4} className="text-center py-16 text-gray-400">No overdue fees.</td></tr>
                  ) : (
                    paginatedFees.map((fee) => (
                      <OverdueRow key={fee.id} fee={fee} onView={setSelectedFee} />
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
      </div>

      {selectedFee && (
        <OverdueFeeModal fee={selectedFee} onClose={() => setSelectedFee(null)} />
      )}
    </div>
  )
}