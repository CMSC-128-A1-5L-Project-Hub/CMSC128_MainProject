import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import { uploadImage } from '#services/b2_services'
import Payment from '#models/payment'
import Fee from '#models/fee'
import FileMetadata from '#models/file_metadatum'
import Manager from '#models/manager'
import LogService from '#services/log_service'
import Accommodation from '#models/accommodation'
import Assignment from '#models/assignment'
import NotificationService from '#services/notification_service'
import { signImageUrl } from '#services/image_service'
import { inject } from '@adonisjs/core'
import { DateTime } from 'luxon'

@inject()
export default class PaymentsController {
  constructor(protected notificationService: NotificationService) {}

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

    fee.feeStatus = 'pending'
    await fee.save()

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

    try {
      await fee.load('student', (s) => s.preload('user'))
      const assignment = await Assignment.query()
        .where('studentNumber', fee.studentNumber)
        .whereNull('actualMoveOut')
        .preload('room', (q) => q.preload('accommodation', (a) => a.preload('landlord', (l) => l.preload('user'))))
        .first()
      const landlordUser = assignment?.room?.accommodation?.landlord?.user
      const studentUser = fee.student?.user
      const accommodationName = assignment?.room?.accommodation?.accommodationName ?? 'your accommodation'
      const studentLabel = studentUser ? `${studentUser.fname} ${studentUser.lname}` : `Student ${fee.studentNumber}`
      if (landlordUser) {
        await this.notificationService.notify(
          landlordUser.id,
          'other',
          `New payment proof from ${studentLabel} for ${accommodationName} pending verification.`
        )
      }
    } catch (e) {
      console.error('[notify] in-app landlord-payment-proof controller-wrap failed:', e)
    }

    return response.ok({
      message: 'Payment proof uploaded successfully',
      payment, // adonis auto-serialize
    })
  }

// ─── MANAGER/LANDLORD: VIEW PENDING PAYMENTS ───
// GET /payments/pending
async pending({ auth, request, response }: HttpContext) {
  const user = auth.user!
  const accommodationId = request.input('accommodationId') // Get from query param

  let accommodationIds: number[] = []

  if (user.role === 'manager') {
    let query = Accommodation.query().where('managerId', user.id)
    if (accommodationId) {
      query = query.where('id', accommodationId)
    }
    const accommodations = await query
    accommodationIds = accommodations.map((a) => a.id)
  } 
  else if (user.role === 'landlord') {
    let query = Accommodation.query().where('landlordId', user.id)
    if (accommodationId) {
      query = query.where('id', accommodationId)
    }
    const accommodations = await query
    accommodationIds = accommodations.map((a) => a.id)
  }
  else {
    return response.forbidden({ message: 'Access denied' })
  }

  if (accommodationIds.length === 0) {
    return response.ok([])
  }

  const payments = await Payment
    .query()
    .where('paymentStatus', 'pending')
    .whereHas('fee', (feeQuery) => {
      feeQuery
        .whereHas('student', (studentQuery) => {
          studentQuery
            .whereHas('assignments', (assignmentQuery) => {
              assignmentQuery
                .whereHas('room', (roomQuery) => {
                  roomQuery
                    .whereHas('accommodation', (accommodationQuery) => {
                      accommodationQuery.whereIn('id', accommodationIds)
                    })
                })
                .whereNull('actualMoveOut')
                .where('confirmationStatus', 'active')
            })
        })
    })
    .preload('fee', (feeQuery) => {
      feeQuery.preload('student', (studentQuery) => {
        studentQuery.preload('user')
      })
    })
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
      .preload('fee', (q) => q.preload('student', (s) => s.preload('user')))
      .firstOrFail()

    const fee = payment.fee
    const action = request.input('action')

    if (!['approve', 'reject'].includes(action)) {
      return response.badRequest({ message: 'Invalid action' })
    }

    if (action === 'approve') {
      payment.paymentStatus = 'verified'
      fee.feeBalance -= payment.paymentAmount
    } else {
      payment.paymentStatus = 'rejected'
    }

    await payment.save()

    // Recompute fee status. Any other pending payments keep the fee in 'pending'.
    const otherPending = await Payment.query()
      .where('feeId', fee.id)
      .where('paymentStatus', 'pending')
      .whereNot('id', payment.id)
      .first()

    if (otherPending) {
      fee.feeStatus = 'pending'
    } else if (fee.feeBalance <= 0) {
      fee.feeStatus = 'paid'
    } else if (fee.dueDate && fee.dueDate < DateTime.now()) {
      fee.feeStatus = 'overdue'
    } else if (fee.feeBalance < fee.feeAmount) {
      fee.feeStatus = 'partial'
    } else {
      fee.feeStatus = 'unpaid'
    }

    await fee.save()

    await LogService.record(
      user.id,
      'fee',
      fee.id,
      'payment_action',
      `Payment actioned with ${action}`
    )

    try {
      const studentUser = fee.student?.user
      if (studentUser) {
        if (action === 'approve') {
          await this.notificationService.notify(
            studentUser.id,
            'fee_due',
            `Your payment of ₱${payment.paymentAmount} for ${fee.feeCategory} has been verified.`
          )
        } else {
          await this.notificationService.notify(
            studentUser.id,
            'fee_due',
            `Your payment proof for ${fee.feeCategory} was rejected. Please re-upload.`
          )
        }
      }
    } catch (e) {
      console.error('[notify] in-app payment-verify controller-wrap failed:', e)
    }

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

  // ─── MANAGER/LANDLORD: VIEW PAYMENT PROOF ───
  // GET /payments/:id/proof
  async viewProof({ params, response }: HttpContext) {
    const payment = await Payment.query()
      .where('id', params.id)
      .preload('proofFile')
      .firstOrFail()

    const filePath = payment.proofFile?.filePath
    if (!filePath) {
      return response.notFound({ message: 'Payment proof not available' })
    }

    const url = await signImageUrl(filePath)
    if (!url) {
      return response.notFound({ message: 'Payment proof not available' })
    }

    return response.ok({ url })
  }
}