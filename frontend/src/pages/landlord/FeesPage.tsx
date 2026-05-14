import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../api/axios'
import { useUserStore } from '../../stores/useUserStore'
import Sidebar from '../../components/Sidebar'
import HeroBanner from '../../components/dashboard/HeroBanner'
import Dropdown from "@/components/ApplicationStatus/Dropdown";
import SearchBar from "@/components/SearchBar";

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
  }
  proofFile: { filePath: string } | null
}

// ─── API ───────────────────────────────────────────────────────────────────

const fetchOverdueFees = async (): Promise<OverdueFee[]> => {
  const res = await api.get('/fees/overdue')
  return res.data
}

const fetchPendingPayments = async (): Promise<PendingPayment[]> => {
  const res = await api.get('/payments/pending')
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

function initials(fname: string, lname: string) {
  return `${fname?.[0] ?? ''}${lname?.[0] ?? ''}`.toUpperCase()
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

// ─── Overdue Fee Modal ──────────────────────────────────────────────────────

function OverdueFeeModal({ fee, onClose }: { fee: OverdueFee; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl w-[480px] overflow-hidden shadow-xl">
        <div className="bg-[#6B0F2B] text-white text-center py-4 relative">
          <h2 className="font-bold tracking-widest text-sm uppercase">Overdue Fee</h2>
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
              <p className="text-lg font-bold text-[#3D0718]">₱{fee.fee_balance.toLocaleString()}</p>
            </div>

            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Room</p>
              <div className="grid grid-cols-2 gap-1 text-xs">
                <div>
                  <p className="text-gray-400">Room Number</p>
                  <p className="font-medium">{fee.room_number}</p>
                </div>
                <div>
                  <p className="text-gray-400">Building</p>
                  <p className="font-medium">{fee.accommodation_name}</p>
                </div>
                <div className="mt-1">
                  <p className="text-gray-400">Room Type</p>
                  <p className="font-medium capitalize">{fee.room_type}</p>
                </div>
              </div>
            </div>

            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Occupancy Details</p>
              <div className="text-xs">
                <p className="text-gray-400">Duration</p>
                <p className="font-medium">
                  {fee.move_in
                    ? new Date(fee.move_in).toLocaleDateString('en-PH', { month: 'long', year: 'numeric' })
                    : '—'}
                  {' – '}
                  {fee.expected_move_out
                    ? new Date(fee.expected_move_out).toLocaleDateString('en-PH', { month: 'long', year: 'numeric' })
                    : '—'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 pb-5 flex justify-end">
          <button className="bg-[#3D0718] text-white text-sm px-6 py-2 rounded-lg hover:bg-[#6B0F2B] transition-colors">
            Send Reminder
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────

export default function FeesPage() {
  const { user } = useUserStore()
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [selectedFee, setSelectedFee] = useState<OverdueFee | null>(null)
  const [activeTab, setActiveTab] = useState<ActiveTab>('Payment Verification')
  const [sortBy, setSortBy] = useState<"latest" | "earliest">("latest")
  const [itemsPerPage, setItemsPerPage] = useState(6)
  const [currentPage, setCurrentPage] = useState(1)
  const [paymentSearch, setPaymentSearch] = useState('')
  

  const { data: overdueFees = [], isLoading: loadingFees } = useQuery({
    queryKey: ['fees', 'overdue'],
    queryFn: fetchOverdueFees,
  })

  const { data: pendingPayments = [], isLoading: loadingPayments } = useQuery({
    queryKey: ['payments', 'pending'],
    queryFn: fetchPendingPayments,
  })

  const verifyMutation = useMutation({
    mutationFn: verifyPayment,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['payments', 'pending'] })
      qc.invalidateQueries({ queryKey: ['fees', 'overdue'] })
    },
  })

  const filteredFees = overdueFees.filter((f) =>
    `${f.fname} ${f.lname}`.toLowerCase().includes(search.toLowerCase())
  )

  const filteredPayments = pendingPayments.filter((p) =>
    p.fee?.studentNumber?.toLowerCase().includes(paymentSearch.toLowerCase())
  )

  const fullName = user ? `${user.fname} ${user.lname}` : ''

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

        <div className="mt-5 space-y-4">

          {/* ── Tabs ── */}
          <div className="flex justify-between items-center">
            <FilterTabs active={activeTab} setActive={setActiveTab} />
          </div>

          {/* ── Payment Verification Panel ── */}
          {activeTab === 'Payment Verification' && (
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <div className="flex flex-row items-center mb-3">
                <div>
                  <h2 className="text-[16px] font-bold text-black">Payment Verification</h2>
                  <p className="text-[12px] italic">{pendingPayments.length} total tenants</p>
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
                  <Dropdown
                    title="Sort By"
                    items={[
                      { label: "Latest", href: "" },
                      { label: "Earliest", href: "" },
                    ]}
                    direction="down"
                    widthClass="w-29 lg:w-32"
                    titleClass="text-[10px] lg:text-[11px]"
                    selectedClass="text-[12px] lg:text-[13px] block"
                    onSelect={(label) => {
                      setSortBy(label === "Latest" ? "latest" : "earliest")
                      setCurrentPage(1)
                    }}
                  />
                  <SearchBar
                    value={paymentSearch}
                    onChange={(query) => {
                      setPaymentSearch(query)
                      setCurrentPage(1)
                    }}
                    onPageReset={() => setCurrentPage(1)}
                  />
                </div>
              </div>

              <table className="w-full lg:table-fixed text-sm">
                <thead>
                  <tr className="text-[10px] text-[#9A7080] uppercase tracking-widest font-bold text-left border-y border-[#6B0F2B]/10">
                    <th className="px-4 py-2">Student</th>
                    <th className="px-4 py-2 text-right whitespace-nowrap">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingPayments.length === 0 ? (
                    <tr>
                      <td colSpan={2} className="text-center py-16 text-gray-400 text-sm">
                        No pending payments.
                      </td>
                    </tr>
                  ) : (
                    pendingPayments.map((payment) => (
                      <tr key={payment.id} className="hover:bg-gray-50 transition-all border-b last:border-0">
                        {/* ... row cells ... */}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              <div className="flex items-center justify-between px-2 mt-4 pt-3 border-t border-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                <span>
                  {pendingPayments.length === 0
                    ? 'No results'
                    : `Showing 1–${pendingPayments.length} of ${pendingPayments.length}`}
                </span>
                <div className="flex gap-1">
                  <button
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-semibold text-white"
                    style={{ background: 'linear-gradient(135deg,#3D0718,#6B0F2B)', boxShadow: '0 4px 12px rgba(107,15,43,0.35)' }}
                  >
                    1
                  </button>
                  <button className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-semibold border border-gray-200 text-[#6B0F2B]">
                    ›
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── Overdue Fees Panel ── */}
          {activeTab === 'Overdue Fees' && (
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <div className="flex flex-row items-center mb-3">
                <div>
                  <h2 className="text-[16px] font-bold text-black">Overdue Fees</h2>
                  <p className="text-[12px] italic">{filteredFees.length} total tenants</p>
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
                  <Dropdown
                    title="Sort By"
                    items={[
                      { label: "Latest", href: "" },
                      { label: "Earliest", href: "" },
                    ]}
                    direction="down"
                    widthClass="w-29 lg:w-32"
                    titleClass="text-[10px] lg:text-[11px]"
                    selectedClass="text-[12px] lg:text-[13px] block"
                    onSelect={(label) => {
                      setSortBy(label === "Latest" ? "latest" : "earliest")
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

              <table className="w-full lg:table-fixed text-sm">
                <thead>
                  <tr className="text-[10px] text-[#9A7080] uppercase tracking-widest font-bold text-left border-y border-[#6B0F2B]/10">
                    <th className="p-2 px-4 py-2">Student</th>
                    <th className="p-2 px-24 py-2">Amount Due</th>
                    <th className="p-2 px-24 py-2">Date</th>
                    <th className="p-2 px-4 py-2 text-right whitespace-nowrap">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingPayments.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center py-16 text-gray-400 text-sm">
                        No pending payments.
                      </td>
                    </tr>
                  ) : (
                    pendingPayments.map((payment) => (
                      <tr key={payment.id} className="hover:bg-gray-50 transition-all border-b last:border-0">
                        {/* ... row cells ... */}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              <div className="flex items-center justify-between px-2 mt-4 pt-3 border-t border-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                <span>
                  {filteredFees.length === 0
                    ? 'No results'
                    : `Showing 1–${filteredFees.length} of ${filteredFees.length}`}
                </span>
                <div className="flex gap-1">
                  <button
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-semibold text-white"
                    style={{ background: 'linear-gradient(135deg,#3D0718,#6B0F2B)', boxShadow: '0 4px 12px rgba(107,15,43,0.35)' }}
                  >
                    1
                  </button>
                  <button className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-semibold border border-gray-200 text-[#6B0F2B]">
                    ›
                  </button>
                </div>
              </div>
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