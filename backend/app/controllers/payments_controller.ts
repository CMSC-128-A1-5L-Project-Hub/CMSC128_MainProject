import type { HttpContext } from '@adonisjs/core/http'
import Payment from '#models/payment'
import User from '#models/user'

// Imports: Payment, Fee, LogService, etc.

export default class PaymentsController {
  
  // ─── STUDENT: UPLOAD GCASH RECEIPT ───
  // POST /payments/:feeId/pay
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

  // based from the working SQL query:
  //   SELECT 
  //     p.id AS payment_id,
  //     p.payment_amount,
  //     p.payment_timestamp, 
  //     p.mode_of_payment,
  //     p.payment_status,
  //     f.fee_category,
  //     f.fee_status,
  //     acc.accommodation_name,
  //     rm.room_number,
  //     fm.file_path AS receipt_url
  // FROM payments p
  // JOIN fees f ON p.fee_id = f.id
  // JOIN students s ON f.student_number = s.student_number
  // JOIN users u ON s.user_id = u.id
  // LEFT JOIN file_metadata fm ON p.proof_file_id = fm.id
  // LEFT JOIN assignments asg ON s.student_number = asg.student_number
  // LEFT JOIN rooms rm ON asg.room_id = rm.id
  // LEFT JOIN accommodations acc ON rm.accommodation_id = acc.id
  // WHERE u.id = 3
  // ORDER BY p.payment_timestamp DESC;
  async getStudentPaymentHistory ({ auth }: HttpContext) {
    // grab the authenticated user object, must exist so add !
    const user = auth.user as User

    // extract the ID
    const userId = user.id

    // use the userID in the Lucid query
    const payments = await Payment.query()
    .whereHas('fee', (feeQuery) => {
      feeQuery.whereHas('student', (studentQuery) => {
        studentQuery.where('userId', userId)
      })
    })
    .preload('proofFile')
    .preload('fee', (feeQuery) => {
      feeQuery.preload('student', (studentQuery) => {
        studentQuery.preload('assignments', (assignmentQuery) => {
          assignmentQuery.preload('room', (roomQuery) => {
            roomQuery.preload('accommodation')
          })
        })
      })
    })
    .orderBy('paymentTimestamp', 'desc')
  return payments
  }

}