// app/controllers/fees_controller.ts
import type { HttpContext } from '@adonisjs/core/http'
import Fee from '#models/fee'
import Student from '#models/student'
import LogService from '#services/log_service'
import Manager from '#models/manager'
import Landlord from '#models/landlord'
import Assignment from '#models/assignment'
import Room from '#models/room'
import Accommodation from '#models/accommodation'
import db from '@adonisjs/lucid/services/db'
import { DateTime } from 'luxon'
import { inject } from '@adonisjs/core'
import NotificationService from '#services/notification_service'
import ReportExportService from '#services/report_export_service'

// DB columns are DECIMAL(10, 2) → max value 99,999,999.99
const MAX_FEE_AMOUNT = 99_999_999.99

@inject()
export default class FeesController {
  constructor(protected notificationService: NotificationService) {}

  // ─── STUDENT: VIEW MY BILLS ───
  // GET /my-fees
  async index({ auth, response }: HttpContext) {
    const user = auth.user

    if (!user) {
      return response.unauthorized({ message: 'Unauthorized' })
    }

    const student = await Student.findByOrFail('userId', user.id)

    const studentFees = await db
      .from('fees')
      .leftJoin('assignments', 'fees.student_number', 'assignments.student_number')
      .leftJoin('rooms', 'assignments.room_id', 'rooms.id')
      .leftJoin('accommodations', 'rooms.accommodation_id', 'accommodations.id')
      .where('fees.student_number', student.studentNumber)
      .select(
        'fees.id',
        'fees.landlord_id',
        'fees.student_number',
        'fees.due_date',
        'fees.fee_category as category',
        'fees.fee_amount as amount',
        'fees.fee_balance as balance',
        'fees.fee_status as status',
        'fees.allow_installments as allowInstallments',
        'accommodations.accommodation_name'
      )

    return response.ok({ data: studentFees })
  }

  // ─── DOWNLOAD INDIVIDUAL BILLING STATEMENT (PDF) ───
  // GET /fees/:id/statement.pdf
  async statementPdf({ auth, params, response }: HttpContext) {
    const user = auth.user
    if (!user) {
      return response.unauthorized({ message: 'Unauthorized' })
    }

    const fee = await Fee.query()
      .where('id', params.id)
      .preload('student', (s) => s.preload('user'))
      .preload('payments')
      .first()

    if (!fee) {
      return response.notFound({ message: 'Fee not found' })
    }

    // Resolve accommodation + room via the student's current assignment
    const assignment = await Assignment.query()
      .where('studentNumber', fee.studentNumber)
      .whereNull('actualMoveOut')
      .preload('room', (q) => q.preload('accommodation'))
      .first()

    const accommodation = assignment?.room?.accommodation ?? null
    const roomNumber = assignment?.room?.roomNumber ?? null

    // Authorize
    if (user.role === 'student') {
      const student = await Student.findBy('userId', user.id)
      if (!student || student.studentNumber !== fee.studentNumber) {
        return response.forbidden({ message: 'Access denied' })
      }
    } else if (user.role === 'landlord') {
      if (fee.landlordId !== user.id) {
        return response.forbidden({ message: 'Access denied' })
      }
    } else if (user.role === 'manager') {
      if (!accommodation || accommodation.managerId !== user.id) {
        return response.forbidden({ message: 'Access denied' })
      }
    } else {
      return response.forbidden({ message: 'Access denied' })
    }

    // Landlord name for header
    const landlord = await Landlord.query()
      .where('userId', fee.landlordId)
      .preload('user')
      .first()
    const landlordName = landlord?.user
      ? [landlord.user.fname, landlord.user.mname, landlord.user.lname]
          .filter(Boolean)
          .join(' ')
      : '—'

    const studentUser = fee.student?.user
    const studentName = studentUser
      ? [studentUser.fname, studentUser.mname, studentUser.lname]
          .filter(Boolean)
          .join(' ')
      : fee.studentNumber

    const buf = await ReportExportService.generateBillingStatementPdf({
      landlordName,
      fee: {
        id: fee.id,
        category: fee.feeCategory,
        amount: Number(fee.feeAmount),
        balance: Number(fee.feeBalance),
        status: fee.feeStatus,
        dueDate: fee.dueDate ? fee.dueDate.toISO() : null,
        allowInstallments: !!fee.allowInstallments,
      },
      student: {
        studentNumber: fee.studentNumber,
        name: studentName,
        email: studentUser?.email ?? null,
      },
      accommodation: {
        name: accommodation?.accommodationName ?? null,
        roomNumber: roomNumber,
      },
      payments: fee.payments.map((p) => ({
        id: p.id,
        paymentTimestamp: p.paymentTimestamp.toISO() ?? '',
        paymentAmount: Number(p.paymentAmount),
        modeOfPayment: p.modeOfPayment,
        paymentStatus: p.paymentStatus,
      })),
    })

    const date = new Date().toISOString().slice(0, 10)
    response.header('Content-Type', 'application/pdf')
    response.header(
      'Content-Disposition',
      `attachment; filename="billing-statement-${fee.id}-${date}.pdf"`
    )
    return response.send(buf)
  }

  // ─── MANAGER/LANDLORD: FEE COLLECTION STATS ───
  // GET /fees/stats?accommodationId=
  async stats({ auth, request, response }: HttpContext) {
    const user = auth.user!
    const accommodationId = request.input('accommodationId')

    if (!accommodationId) {
      return response.badRequest({ message: 'accommodationId is required' })
    }

    // Authorize: must own/manage the accommodation
    const accom = await Accommodation.find(accommodationId)
    if (!accom) {
      return response.notFound({ message: 'Accommodation not found' })
    }
    if (user.role === 'landlord' && accom.landlordId !== user.id) {
      return response.forbidden({ message: 'Access denied' })
    }
    if (user.role === 'manager' && accom.managerId !== user.id) {
      return response.forbidden({ message: 'Access denied' })
    }

    const now = DateTime.now()
    const monthStart = now.startOf('month').toSQL()
    const monthEnd = now.endOf('month').toSQL()

    // Total verified collections this month, for fees tied to active tenants of this accommodation
    const collectionsRow = await db
      .from('payments')
      .leftJoin('fees', 'payments.fee_id', 'fees.id')
      .leftJoin('assignments', 'fees.student_number', 'assignments.student_number')
      .leftJoin('rooms', 'assignments.room_id', 'rooms.id')
      .where('rooms.accommodation_id', accommodationId)
      .where('payments.payment_status', 'verified')
      .whereBetween('payments.payment_timestamp', [monthStart, monthEnd])
      .sum('payments.payment_amount as total')
      .first()

    const totalCollectionsMonth = Number(collectionsRow?.total ?? 0)

    // Collection rate: lifetime (sum(amount)-sum(balance)) / sum(amount) for fees on this accommodation
    const feesRow = await db
      .from('fees')
      .leftJoin('assignments', 'fees.student_number', 'assignments.student_number')
      .leftJoin('rooms', 'assignments.room_id', 'rooms.id')
      .where('rooms.accommodation_id', accommodationId)
      .select(
        db.raw('COALESCE(SUM(fees.fee_amount), 0) as billed'),
        db.raw('COALESCE(SUM(fees.fee_balance), 0) as outstanding')
      )
      .first()

    const billed = Number(feesRow?.billed ?? 0)
    const outstanding = Number(feesRow?.outstanding ?? 0)
    const collected = billed - outstanding
    const collectionRate = billed > 0 ? (collected / billed) * 100 : 0

    return response.ok({
      totalCollectionsMonth,
      collectionRate,
      billed,
      collected,
    })
  }

  // ─── MANAGER/LANDLORD: CREATE A FEE ───
  // POST /fees
  async store({ auth, request, response }: HttpContext) {
    const user = auth.user!

    const manager = await Manager.findByOrFail('userId', user.id)

    const { studentNumber, feeAmount, dueDate, feeCategory, allowInstallments } = request.all()

    if (!studentNumber) {
      return response.badRequest({ message: 'Student number is required' })
    }

    if (!feeAmount || feeAmount <= 0) {
      return response.badRequest({ message: 'Invalid fee amount' })
    }

    if (feeAmount > MAX_FEE_AMOUNT) {
      return response.badRequest({ message: `Fee amount cannot exceed ₱${MAX_FEE_AMOUNT.toLocaleString()}` })
    }

    if (!['rent', 'utilities', 'miscellaneous'].includes(feeCategory)) {
      return response.badRequest({ message: 'Invalid fee category' })
    }

    const student = await Student.findByOrFail('studentNumber', studentNumber)
    const assignment = await Assignment.findByOrFail('studentNumber', student.studentNumber)
    const room = await Room.findByOrFail('id', assignment.roomId)
    const accom = await Accommodation
      .query()
      .where('id', room.accommodationId)
      .preload('manager')
      .firstOrFail()

    if (accom.manager.userId !== manager.userId) {
      return response.badRequest({ message: 'Manager does not manage the dorm this student lives in.' })
    }

    // Only rent fees can allow installments
    const parsedAllowInstallments = feeCategory === 'rent'
      ? (allowInstallments === true || allowInstallments === 'true')
      : false

    const fee = await Fee.create({
      landlordId: accom.landlordId,
      studentNumber: student.studentNumber,
      feeAmount: feeAmount,
      feeBalance: feeAmount,
      feeCategory: feeCategory,
      feeStatus: 'unpaid',
      dueDate: dueDate ? DateTime.fromISO(dueDate) : DateTime.now().plus({ days: 30 }),
      allowInstallments: parsedAllowInstallments,
    })

    await LogService.record(
      user.id,
      'fee',
      fee.id,
      'manual_fee_created',
      `Manual fee created for student ${student.studentNumber} – ${feeCategory}`
    )

    try {
      await student.load('user')
      if (student.user) {
        await this.notificationService.notify(
          student.user.id,
          'fee_due',
          `New ${feeCategory} fee of ₱${feeAmount} due ${fee.dueDate.toISODate() ?? ''}.`
        )
      }
    } catch (e) {
      console.error('[notify] in-app new-fee controller-wrap failed:', e)
    }

    return response.created({ message: 'Fee created successfully', fee })
  }

  // ─── LANDLORD: BULK CREATE RENT FEES FOR A ROOM ───
  // POST /landlord/fees/bulk
  async bulkStore({ auth, request, response }: HttpContext) {
    const user = auth.user!
    const landlord = await Landlord.findByOrFail('userId', user.id)

    const { roomId, tenantId, month, year, amount, allowInstallments } = request.body()

    if (!roomId) {
      return response.badRequest({ message: 'roomId is required' })
    }
    if (typeof month !== 'number' || month < 0 || month > 11) {
      return response.badRequest({ message: 'month must be a number 0-11' })
    }
    if (typeof year !== 'number') {
      return response.badRequest({ message: 'year is required' })
    }
    if (!amount || amount <= 0) {
      return response.badRequest({ message: 'Invalid amount' })
    }

    if (amount > MAX_FEE_AMOUNT) {
      return response.badRequest({ message: `Amount cannot exceed ₱${MAX_FEE_AMOUNT.toLocaleString()}` })
    }

    const room = await Room.findOrFail(roomId)
    const accom = await Accommodation.findOrFail(room.accommodationId)
    if (accom.landlordId !== landlord.userId) {
      return response.forbidden({ message: 'You do not own this accommodation' })
    }

    let assignmentQuery = Assignment.query()
      .where('roomId', roomId)
      .where('confirmationStatus', 'active')
      .whereNull('actualMoveOut')
      .preload('student', (s) => s.preload('user'))

    if (tenantId !== 'all') {
      const targetUserId = Number(tenantId)
      if (!Number.isFinite(targetUserId)) {
        return response.badRequest({ message: 'Invalid tenantId' })
      }
      assignmentQuery = assignmentQuery.whereHas('student', (s) =>
        s.where('userId', targetUserId)
      )
    }

    const assignments = await assignmentQuery
    if (assignments.length === 0) {
      return response.badRequest({ message: 'No active tenants match the selection' })
    }

    const dueDate = DateTime.fromObject({ year, month: month + 1, day: 1 }).endOf('month')
    const parsedAllowInstallments = allowInstallments === true || allowInstallments === 'true'

    const trx = await db.transaction()
    const created: Fee[] = []
    try {
      for (const assignment of assignments) {
        const fee = new Fee()
        fee.landlordId = accom.landlordId
        fee.studentNumber = assignment.studentNumber
        fee.feeAmount = amount
        fee.feeBalance = amount
        fee.feeCategory = 'rent'
        fee.feeStatus = 'unpaid'
        fee.dueDate = dueDate
        fee.allowInstallments = parsedAllowInstallments
        await fee.useTransaction(trx).save()
        created.push(fee)
      }
      await trx.commit()
    } catch (error) {
      await trx.rollback()
      throw error
    }

    await LogService.record(
      user.id,
      'fee',
      room.id,
      'BULK_BILLING_GENERATED',
      `Bulk billing for room ${room.roomNumber}: ${created.length} tenant(s) at ₱${amount}`
    )

    for (const assignment of assignments) {
      try {
        if (assignment.student?.user) {
          await this.notificationService.notify(
            assignment.student.user.id,
            'fee_due',
            `New rent bill of ₱${amount} for Room ${room.roomNumber} due ${dueDate.toISODate() ?? ''}.`
          )
        }
      } catch (e) {
        console.error('[notify] in-app bulk-billing controller-wrap failed:', e)
      }
    }

    return response.created({ created })
  }

  // ─── MANAGER/LANDLORD: VIEW OVERDUE FEES ───
  // GET /fees/overdue
  async overdueForManager({ auth, request, response }: HttpContext) {
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
      return response.forbidden({ message: 'Access denied. Must be a manager or landlord.' })
    }

    if (accommodationIds.length === 0) {
      return response.ok([])
    }

    const overdueFees = await db
      .from('fees')
      .leftJoin('students', 'fees.student_number', 'students.student_number')
      .leftJoin('users', 'students.user_id', 'users.id')
      .leftJoin('assignments', 'students.student_number', 'assignments.student_number')
      .leftJoin('rooms', 'assignments.room_id', 'rooms.id')
      .leftJoin('accommodations', 'rooms.accommodation_id', 'accommodations.id')
      .whereIn('accommodations.id', accommodationIds)
      .where('fees.fee_status', 'overdue')
      .whereNull('assignments.actual_move_out')
      .where('assignments.confirmation_status', 'active')
      .select(
        'fees.id',
        'fees.student_number',
        'fees.due_date',
        'fees.fee_amount',
        'fees.fee_balance',
        'fees.fee_status',
        'fees.fee_category',
        'users.fname',
        'users.lname',
        'rooms.room_number',
        'rooms.room_type',
        'accommodations.accommodation_name',
        'assignments.move_in',
        'assignments.expected_move_out'
      )

    return response.ok(overdueFees)
  }

  

  async sendReminder({ auth, params, request, response }: HttpContext) {
    const user = auth.user!
    const { id } = params
    const { studentNumber, feeCategory, amount, dueDate } = request.body()

    try {
      // 1. Find the fee
      const fee = await Fee.find(id)
      if (!fee) {
        return response.notFound({ message: 'Fee not found' })
      }

      // 2. Find the student
      const student = await Student.query()
        .where('studentNumber', studentNumber)
        .preload('user')
        .first()

      if (!student || !student.user) {
        return response.notFound({ message: 'Student not found' })
      }

      // 3. Get accommodation info 
      const assignment = await Assignment.query()
        .where('studentNumber', studentNumber)
        .whereNull('actualMoveOut')
        .preload('room', (q) => q.preload('accommodation'))
        .first()

      const accommodationName = assignment?.room?.accommodation?.accommodationName || 'your accommodation'

      // 4. Send email notification
      await this.notificationService.sendOverdueFeeReminderEmail(
        student.user,
        studentNumber,
        feeCategory,
        amount,
        dueDate,
        accommodationName
      )

      // 5. Log the action
      await LogService.record(
        user.id,
        'fee',
        fee.id,
        'OVERDUE_REMINDER_SENT',
        `Overdue fee reminder sent to student ${studentNumber} for fee category: ${feeCategory}, amount: ₱${amount}`
      )

      return response.ok({ 
        message: `Reminder sent successfully to ${student.user.fname} ${student.user.lname}` 
      })

    } catch (error) {
      console.error('Failed to send reminder:', error)
      return response.internalServerError({ 
        message: 'Failed to send reminder. Please try again.' 
      })
    }
  }
}