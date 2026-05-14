import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import { uploadImage } from '#services/b2_services'
import Payment from '#models/payment'
import Fee from '#models/fee'
import FileMetadata from '#models/file_metadatum'
import Manager from '#models/manager'
import LogService from '#services/log_service'
import { DateTime } from 'luxon'

export default class PaymentsController {

  // ─── STUDENT: UPLOAD PAYMENT PROOF ───
  // POST /payments/:feeId/pay
  async uploadProof({ auth, params, request, response }: HttpContext) {
    const feeId = params.feeId
    const fee = await Fee.findOrFail(feeId)

    const paymentAmount = Number(request.input('paymentAmount'))
    const modeOfPayment = request.input('modeOfPayment') ?? 'gcash'

    if (isNaN(paymentAmount) || paymentAmount <= 0) {
      return response.badRequest({ message: 'Payment amount must be greater than zero' })
    }

    if (paymentAmount > fee.feeBalance) {
      return response.badRequest({ message: 'Payment amount exceeds the remaining balance' })
    }

    // If installments are NOT allowed, student must pay full balance
    if (!fee.allowInstallments && paymentAmount !== fee.feeBalance) {
      return response.badRequest({
        message: 'Full payment is required for this fee. Please pay the exact remaining balance.',
      })
    }

    const file = request.file('receipt', {
      size: '5mb',
      extnames: ['jpg', 'png', 'jpeg', 'pdf'],
    })

    // Cash payments do not require receipt
    if (modeOfPayment !== 'cash' && !file) {
      return response.badRequest({ message: 'No receipt file uploaded for online payment' })
    }

    let fileMeta: FileMetadata | null = null

    if (file) {
      await file.moveToDisk('./tmp')
      const fileUrl = await uploadImage(file, 'payments')

      fileMeta = await FileMetadata.create({
        fileName: file.clientName ?? 'receipt.jpg',
        filePath: fileUrl,
        fileType: 'image',
      })
    }

    const payment = await Payment.create({
      feeId: fee.id,
      proofFileId: fileMeta?.id ?? null,
      paymentAmount,
      modeOfPayment,
      paymentStatus: 'pending',
    })

    try {
      await LogService.record(
        auth.user?.id ?? null,
        'payment',
        payment.id,
        'PAYMENT_PROOF_UPLOADED',
        `Student ${auth.user?.id ?? 'unknown'} uploaded ${modeOfPayment} payment of ${paymentAmount} for Fee ${fee.id}`
      )
    } catch (e) {
      console.error('Failed to log PAYMENT_PROOF_UPLOADED:', e)
    }

    return response.ok({
      message: 'Payment proof uploaded successfully',
      payment, // adonis auto-serialize
    })
  }

  // ─── MANAGER: VIEW PENDING PAYMENTS ───
  // GET /payments/pending
  async pending({ auth, response }: HttpContext) {
    const user = auth.user!

    const manager = await Manager
      .query()
      .where('userId', user.id)
      .preload('accommodations')
      .firstOrFail()

    const accoms = manager.accommodations.map(accom => accom.id)

    if (accoms.length === 0) {
      return response.ok([]) // was: return []
    }

    const payments = await Payment
      .query()
      .where('paymentStatus', 'pending')
      .whereHas('fee', (feeQuery) => {
        feeQuery.whereIn('accommodationId', accoms)
      })
      .preload('fee')
      .preload('proofFile')

    return response.ok(payments)
  }

  // ─── MANAGER: VERIFY PAYMENT ───
  // PATCH /payments/:id/verify
  async verify({ auth, params, request, response }: HttpContext) {
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

      if (fee.feeBalance <= 0) {
        fee.feeStatus = 'paid'
      } else if (fee.dueDate && fee.dueDate < DateTime.now()) {
        fee.feeStatus = 'overdue'
      } else {
        fee.feeStatus = 'partial'
      }

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
      payment, // auto-serialized
    })
  }

  // ─── STUDENT: VIEW PAYMENT HISTORY ───
  // GET /my-payments
  async getStudentPaymentHistory({ auth }: HttpContext) {
    const user = auth.user as User
    const userId = user.id

    const payments = await Payment
      .query()
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

    return payments // auto-serialized
  }
}