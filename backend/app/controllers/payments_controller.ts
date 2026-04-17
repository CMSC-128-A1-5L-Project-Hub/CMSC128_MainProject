import type { HttpContext } from '@adonisjs/core/http'
// Imports: Payment, Fee, LogService, etc.
import { uploadImage } from '#services/b2_services'
import Payment from '#models/payment'
import Fee from '#models/fee'
import FileMetadata from '#models/file_metadatum'
import Manager from '#models/manager'
import LogService from '#services/log_service'

export default class PaymentsController {
  
  // ─── STUDENT: UPLOAD GCASH RECEIPT ───
  // POST /payments/:feeId/pay
  async uploadProof({ params, request, response, serialize }: HttpContext) {
    // Logic: Handle file upload to Backblaze.
    // Create new payment row linked to feeId with status 'pending_verification'.

    const feeId = params.feeId
    const fee = await Fee.findOrFail(feeId)

    const file = request.file('receipt', {
      size: '5mb',
      extnames: ['jpg', 'png', 'jpeg', 'pdf'],
    })

    if (!file)
      return response.badRequest({ message: 'No file uploaded' })

    await file.moveToDisk('./tmp')
    const fileUrl = await uploadImage(file, 'payments')

    const fileMeta = await FileMetadata.create({
      filePath: fileUrl,
      fileName: file.clientName,
    })

    const payment = await Payment.create({
      feeId: fee.id,
      proofFileId: fileMeta.id,
      paymentAmount: request.input('paymentAmount'),
      modeOfPayment: 'gcash'
    })

    return response.ok({
      message: `Proof uploaded successfully`,
      payment: serialize(payment)
    })
  }

  // ─── MANAGER: VIEW PENDING PAYMENTS ───
  // GET /payments/pending
  async pending({ auth, serialize }: HttpContext) {
    // Logic: Fetch all payments where status is 'pending_verification' 
    // that belong to accommodations managed by auth.user.

    const user = auth.user!
    const manager = await Manager
      .query()
      .where('userId', user.id)
      .preload('accommodations')
      .firstOrFail()

    const accoms = manager.accommodations.map(accom => accom.id)
    if (accoms.length === 0)
      return serialize([])
    
    const payments = await Payment
      .query()
      .where('paymentStatus', 'pending_verification')
      .whereHas('fee', (feeQuery) => {
        feeQuery.whereIn('accommodationId', accoms)
      })
      .preload('fee')
      .preload('proofFile')

    return serialize(payments)
  }

  // ─── MANAGER: APPROVE/REJECT PAYMENT ───
  // PATCH /payments/:id/verify
  async verify({ auth, params, request, response, serialize }: HttpContext) {
    // Logic: If 'approve', set payment_status to 'verified'.
    // Subtract payment_amount from fees.fee_balance.
    // If balance <= 0, set fees.fee_status to 'paid'.
    // If 'reject', set payment_status to 'rejected'. Trigger LogService.

    const user = auth.user!
    const payment = await Payment
      .query()
      .where('id', params.id)
      .preload('fee')
      .firstOrFail()

    const fee = payment.fee
    const action = request.input('action')
    if (!['approve', 'reject'].includes(action)) {
      return response.badRequest({ message: 'Invalid action' })
    }

    if (action === 'approve') {
      payment.paymentStatus = 'verified'
      fee.feeBalance -= payment.paymentAmount
      if (fee.feeBalance <= 0) fee.feeStatus = 'paid'
        await fee.save()
    } else {
      payment.paymentStatus = 'rejected'
    }

    await payment.save()

    await LogService.record(
      user.id,
      'fee',
      fee.id,
      'payment_action',
      `Payment actioned with ${action}`
    )

    return response.ok({
      message: `Payment actioned with ${action} successful`,
      payment: serialize(payment)
    })
  }
}