import type { HttpContext } from '@adonisjs/core/http'
// Imports: Fee, Student, etc.
import Fee from '#models/fee'
import Student from '#models/student'
import LogService from '#services/log_service'
import Manager from '#models/manager'
import Assignment from '#models/assignment'
import Room from '#models/room'
import Accommodation from '#models/accommodation'
import db from '@adonisjs/lucid/services/db'

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
      'fees.fee_category',
      'fees.fee_amount',
      'fees.fee_balance',
      'fees.fee_status',
      'accommodations.accommodation_name'
    )

  return response.ok({
    data: studentFees,
  })
}

  // ─── MANAGER/LANDLORD: CREATE FEES ───
  // POST /fees
        // Logic:
        // Verify the manager actually manages the dorm this student lives in.
        // Create a row in the fees table with fee_balance equal to fee_amount, and fee_status set to 'unpaid'.
        // Trigger a LogService event ("Manual fee created").
  async store({ auth, request, response }: HttpContext) {
    const user = auth.user!
    const student = await Student.findByOrFail('userId', user.id)

    // Verify manager if same
    // User -> Student -> Assignment -> Room -> Accoms -> Manager
    // User -> Manager
    const manager = await Manager.findByOrFail('userId', user.id)
    
    const assignment = await Assignment.findByOrFail('studentNumber', student.studentNumber)
    const room = await Room.findByOrFail('id', assignment.roomId)
    const accom = await Accommodation
      .query()
      .where('id', room.accommodationId)
      .preload('manager')
      .firstOrFail()
    
    if (accom.manager.userId != manager.userId)
      return response.badRequest({ message: "Manager does not manage the dorm student lives in." })

    const feeAmount = request.input('feeAmount')  

    if (!feeAmount || feeAmount <= 0)
      return response.badRequest({ message: 'Invalid fee amount' })
    
    const fee = await Fee.create({
      landlordId: user.id,
      studentNumber: student.studentNumber,
      feeAmount: feeAmount,
      feeBalance: feeAmount,
      feeStatus: 'unpaid'
    })

    await LogService.record(
      user.id,
      'fee',
      fee.id,
      'manual_fee_created',
      `Manual fee created for student ${student.studentNumber}`
    )

    return response.created({
      message: 'Fee created successfully',
      fee
    })
  }
}