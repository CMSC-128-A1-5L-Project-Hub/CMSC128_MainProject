import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../api/axios'
import { useUserStore } from '../../stores/useUserStore'
import Sidebar from '../../components/Sidebar'
import HeroBanner from '../../components/dashboard/HeroBanner'

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

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 mt-5">

          {/* ── Overdue Fees ── */}
          <div className="bg-white rounded-2xl shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="font-semibold text-base">Overdue Fees</h2>
                <p className="text-xs text-gray-400">{filteredFees.length} total tenants</p>
              </div>
              <input
                type="text"
                placeholder="Search applications..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="text-xs border border-gray-200 rounded-lg px-3 py-2 w-44 focus:outline-none"
              />
            </div>

            {loadingFees ? (
              <p className="text-sm text-gray-400 py-8 text-center">Loading...</p>
            ) : filteredFees.length === 0 ? (
              <p className="text-sm text-gray-400 py-8 text-center">No overdue fees.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[10px] text-gray-400 uppercase border-b">
                    <th className="pb-2">Students</th>
                    <th className="pb-2">Room Number</th>
                    <th className="pb-2">Due Date</th>
                    <th className="pb-2">Amount Due</th>
                    <th className="pb-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFees.map((fee) => (
                    <tr key={fee.id} className="border-b last:border-0">
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-[#6B0F2B] text-white text-xs font-bold flex items-center justify-center shrink-0">
                            {initials(fee.fname, fee.lname)}
                          </div>
                          <span className="font-medium">{fee.fname} {fee.lname}</span>
                        </div>
                      </td>
                      <td className="py-3">
                        <div>{fee.room_number}</div>
                        <div className="text-xs text-gray-400">{fee.accommodation_name}</div>
                      </td>
                      <td className="py-3">
                        <div>{new Date(fee.due_date).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                        <div className="text-xs text-gray-400">{timeAgo(fee.due_date)}</div>
                      </td>
                      <td className="py-3">₱{fee.fee_balance.toLocaleString()}</td>
                      <td className="py-3">
                        <button
                          onClick={() => setSelectedFee(fee)}
                          className="text-xs px-4 py-1.5 border border-[#8C1535] text-[#8C1535] rounded-lg hover:bg-[#8C1535] hover:text-white transition-colors"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-50 text-xs text-gray-400">
              <span>Showing 1–{filteredFees.length} of {filteredFees.length} tenants</span>
              <div className="flex gap-1">
                <button className="w-7 h-7 rounded bg-[#3D0718] text-white font-bold">1</button>
                <button className="w-7 h-7 rounded border border-gray-200 text-gray-500">›</button>
              </div>
            </div>
          </div>

          {/* ── Payment Verification ── */}
          <div className="bg-white rounded-2xl shadow-sm p-5">
            <div className="mb-3">
              <h2 className="font-semibold text-base">Payment Verification</h2>
              <p className="text-xs text-gray-400">{pendingPayments.length} total tenants</p>
            </div>

            {loadingPayments ? (
              <p className="text-sm text-gray-400 py-8 text-center">Loading...</p>
            ) : pendingPayments.length === 0 ? (
              <p className="text-sm text-gray-400 py-8 text-center">No pending payments.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[10px] text-gray-400 uppercase border-b">
                    <th className="pb-2">Students</th>
                    <th className="pb-2">Amount</th>
                    <th className="pb-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingPayments.map((payment) => (
                    <tr key={payment.id} className="border-b last:border-0">
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-[#6B0F2B] text-white text-xs font-bold flex items-center justify-center shrink-0">
                            {payment.fee?.studentNumber?.[0] ?? 'S'}
                          </div>
                          <div>
                            <div className="font-medium">{payment.fee?.studentNumber ?? '—'}</div>
                            <div className="text-xs text-gray-400 capitalize">{payment.paymentStatus}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3">₱{payment.paymentAmount.toLocaleString()}</td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          {payment.proofFile && (
                            <a href={payment.proofFile.filePath} target="_blank" rel="noreferrer" className="text-xs text-blue-500 underline">
                              Receipt
                            </a>
                          )}
                          <button
                            onClick={() => verifyMutation.mutate({ id: payment.id, action: 'approve' })}
                            disabled={verifyMutation.isPending}
                            className="text-xs px-3 py-1.5 border border-gray-200 text-gray-600 rounded-lg hover:bg-green-50 hover:border-green-400 hover:text-green-700 transition-colors disabled:opacity-50"
                          >
                            Review
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-50 text-xs text-gray-400">
              <span>Showing 1–{pendingPayments.length} of {pendingPayments.length} tenants</span>
              <div className="flex gap-1">
                <button className="w-7 h-7 rounded bg-[#3D0718] text-white font-bold">1</button>
                <button className="w-7 h-7 rounded border border-gray-200 text-gray-500">›</button>
              </div>
            </div>
          </div>

        </div>
      </div>

      {selectedFee && (
        <OverdueFeeModal fee={selectedFee} onClose={() => setSelectedFee(null)} />
      )}
    </div>
  )
}