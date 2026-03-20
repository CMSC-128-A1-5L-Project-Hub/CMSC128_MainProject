import type { HttpContext } from '@adonisjs/core/http'
// Imports: Payment, Fee, LogService, etc.

export default class PaymentsController {
  
  // ─── STUDENT: UPLOAD GCASH RECEIPT ───
  // POST /fees/:feeId/pay
  async uploadProof({ params, request, response, serialize }: HttpContext) {
    // Logic: Handle file upload to Backblaze.
    // Create new payment row linked to feeId with status 'pending_verification'.
  }

  // ─── MANAGER: VIEW PENDING PAYMENTS ───
  // GET /payments/pending
  async pending({ auth, serialize }: HttpContext) {
    // Logic: Fetch all payments where status is 'pending_verification' 
    // that belong to accommodations managed by auth.user.
  }

  // ─── MANAGER: APPROVE/REJECT PAYMENT ───
  // PATCH /payments/:id/verify
  async verify({ params, request, response, serialize }: HttpContext) {
    // Logic: If 'approve', set payment_status to 'verified'.
    // Subtract payment_amount from fees.fee_balance.
    // If balance <= 0, set fees.fee_status to 'paid'.
    // If 'reject', set payment_status to 'rejected'. Trigger LogService.
  }
}