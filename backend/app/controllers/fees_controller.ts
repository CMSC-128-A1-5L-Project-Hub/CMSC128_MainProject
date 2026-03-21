import type { HttpContext } from '@adonisjs/core/http'
// Imports: Fee, Student, etc.

export default class FeesController {
  
  // ─── STUDENT: VIEW MY BILLS ───
  // GET /my-fees
  async index({ auth, serialize }: HttpContext) {
    // Logic: Get student_number from auth.user.
    // Fetch all fees for this student, and .preload('payments') to show history.
  }

  // ─── MANAGER/LANDLORD: CREATE FEES ───
  // POST /fees
        // Logic:
        // Verify the manager actually manages the dorm this student lives in.
        // Create a row in the fees table with fee_balance equal to fee_amount, and fee_status set to 'unpaid'.
        // Trigger a LogService event ("Manual fee created").
}