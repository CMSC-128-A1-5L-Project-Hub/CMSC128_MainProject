import type { HttpContext } from '@adonisjs/core/http'
// Imports: Fee, Student, etc.
import Fee from '#models/fee'
import Student from '#models/student'
import LogService from '#services/log_service'
import Manager from '#models/manager'
import Assignment from '#models/assignment'
import Room from '#models/room'
import Accommodation from '#models/accommodation'

export default class FeesController {
  
  // ─── STUDENT: VIEW MY BILLS ───
  // GET /my-fees
  async index({ auth, serialize }: HttpContext) {
    // Logic: Get student_number from auth.user.
    const user = auth.user!
    const student = await Student.findByOrFail('userId', user.id)

    // Fetch all fees for this student, and .preload('payments') to show history.]
    const studentFee = await Fee
      .query()
      .where('studentNumber', student.studentNumber)
      .preload('payments')

    return serialize(studentFee)
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
    
    if (accom.manager.userId != manager.userId) {
      return response.badRequest({ message: "Manager does not manage the dorm student lives in." })
    }
    
    const fee = await Fee.create({
      landlordId: user.id,
      studentNumber: student.studentNumber,
      // feeBalance
      feeStatus: 'unpaid'
    })

    await LogService.record(
      user.id,
      'fee',
      fee.id,
      'manual_fee_created',
      `Manual fee created for student ${student.studentNumber}`
    )
  }
}