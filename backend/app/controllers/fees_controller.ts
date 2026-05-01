// app/controllers/fees_controller.ts
import type { HttpContext } from '@adonisjs/core/http'
import Fee from '#models/fee'
import Student from '#models/student'
import LogService from '#services/log_service'
import Manager from '#models/manager'
import Assignment from '#models/assignment'
import Room from '#models/room'
import Accommodation from '#models/accommodation'
import db from '@adonisjs/lucid/services/db'
import { DateTime } from 'luxon'

export default class FeesController {

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

    return response.created({ message: 'Fee created successfully', fee })
  }

  // ─── MANAGER/LANDLORD: VIEW OVERDUE FEES ───
  // GET /fees/overdue
  async overdueForManager({ auth, response }: HttpContext) {
    const user = auth.user!

    const manager = await Manager
      .query()
      .where('userId', user.id)
      .preload('accommodations')
      .firstOrFail()

    const accommodationIds = manager.accommodations.map((a) => a.id)

    if (accommodationIds.length === 0) {
      return response.ok({ data: [] })
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
}
