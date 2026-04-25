// import type { HttpContext } from '@adonisjs/core/http'

import type { HttpContext } from '@adonisjs/core/http'
import { ModelQueryBuilderContract } from '@adonisjs/lucid/types/model'
import Assignment from '#models/assignment'
import Student from '#models/student'
import Room from '#models/room'
import Accommodation from '#models/accommodation'
// Imports: Assignment, Room, LogService, etc.

export default class AssignmentsController {
  
  // ─── MANAGER FUNCTION: MOVE STUDENT IN ───
  // POST /assignments
  async store({ request, response, serialize }: HttpContext) {
    // Logic: Double-booking check, Room capacity check, Create Assignment
  }

  // ─── MANAGER FUNCTION: MOVE STUDENT OUT ───
  // PATCH /assignments/:id/move-out
  async moveOut({ params, request, response, serialize }: HttpContext) {
    // Logic: Update actual_move_out, decrement room occupancy, LogService
  }

  // ─── MANAGER FUNCTION: VIEW ROOM ───
  async index({ request, serialize }: HttpContext) {
    // Logic: Retrieve by room_id (Manager seeing who is in a room)
  }
  
  // ─── STUDENT FUNCTION: VIEW CURRENT STAY ───
  // GET /my-stay/current
  async currentStay({ auth, serialize }: HttpContext) {
    // Logic: Fetch assignment where studentNumber matches auth user AND actual_move_out is NULL
  }

  // ─── STUDENT FUNCTION: VIEW PAST STAYS ───
  // GET /my-stay/history
  async stayHistory({ auth, serialize }: HttpContext) {
    // Logic: Fetch assignments where studentNumber matches auth user AND actual_move_out is NOT NULL
  }

  // ─── MANAGER: VIEW ASSIGNMENTS //TESTER ───
  async viewAllAssignments({ auth, response, serialize }: HttpContext) {
    const user = auth.user!

    if (user.role !== 'manager') {
      return response.forbidden({ message: 'access denied' })
    }

    const assignments = await Assignment.query()
      .preload('room', (roomQuery: ModelQueryBuilderContract<typeof Room>) => {
        roomQuery.preload('accommodation')
      })
      .preload('student', (studentQuery: ModelQueryBuilderContract<typeof Student>) => {
        studentQuery.preload('user')
      })

    return serialize(assignments)
  }

  // ─── MANAGER: VIEW ASSIGNMENTS ───
  async viewAssignments({ auth, response, serialize }: HttpContext) {
    const user = auth.user!

    if (user.role !== 'manager') {
      return response.forbidden({ message: 'access denied' })
    }

    const assignments = await Assignment.query()
      .whereHas('room', (roomQuery: ModelQueryBuilderContract<typeof Room>) => {
        roomQuery.whereHas('accommodation', (accommodationQuery: ModelQueryBuilderContract<typeof Accommodation>) => {
          accommodationQuery.where('managerId', user.id)
        })
      })
      .preload('room', (roomQuery: ModelQueryBuilderContract<typeof Room>) => {
        roomQuery.preload('accommodation')
      })
      .preload('student', (studentQuery: ModelQueryBuilderContract<typeof Student>) => {
        studentQuery.preload('user')
      })

    return serialize(assignments)
  }
}