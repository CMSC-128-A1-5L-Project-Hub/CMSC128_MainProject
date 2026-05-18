// app/controllers/assignments_controller.ts
import type { HttpContext } from '@adonisjs/core/http'
import { ModelQueryBuilderContract } from '@adonisjs/lucid/types/model'
import { DateTime } from 'luxon'
import { inject } from '@adonisjs/core'
import db from '@adonisjs/lucid/services/db'
import Application from '#models/application'
import Assignment from '#models/assignment'
import Room from '#models/room'
import Student from '#models/student'
import LogService from '#services/log_service'
import NotificationService from '#services/notification_service'
import WaitlistWorkflowService from '#services/waitlisted_workflow_service'
import { withPrimaryImageUrl } from '#services/image_service'
import Accommodation from '#models/accommodation'
import EarlyMoveOutRequest from '#models/early_move_out_request'

@inject()
export default class AssignmentsController {
  constructor(
    protected notificationService: NotificationService,
    protected waitlistService: WaitlistWorkflowService
  ) {}

  // ─── MANAGER: ALL ASSIGNMENTS FOR DASHBOARD ───
  async managerIndex({ auth, response }: HttpContext) {
    const user = auth.user!
    const accommodations = await Accommodation.query().where('managerId', user.id)
    const accIds = accommodations.map(a => a.id)
    if (accIds.length === 0) return response.ok([])

    const rooms = await Room.query().whereIn('accommodationId', accIds)
    const roomIds = rooms.map(r => r.id)

    const assignments = await Assignment.query()
      .whereIn('roomId', roomIds)
      .preload('room', (q) => q.preload('accommodation'))
      .preload('student', (q) => q.preload('user'))
      .orderBy('moveIn', 'asc')

    return response.ok(assignments)
  }

  // ─── MANAGER/LANDLORD: ASSIGN ROOM (Creates pending assignment) ───
  async store({ auth, request, response }: HttpContext) {
    const user = auth.user!
    const { applicationId, roomId, moveIn, expectedMoveOut, gracePeriodDays } = request.body()

    if (!applicationId || !roomId || !moveIn || !expectedMoveOut) {
      return response.badRequest({
        message: 'applicationId, roomId, moveIn, and expectedMoveOut are required',
      })
    }

    const application = await Application.query()
      .where('id', applicationId)
      .preload('accommodation')
      .preload('student', (q) => q.preload('user'))
      .firstOrFail()

    const accommodation = application.accommodation

    if (user.role === 'manager' && accommodation.managerId !== user.id) {
      return response.forbidden({ message: 'You do not manage this accommodation' })
    }
    if (user.role === 'landlord' && accommodation.landlordId !== user.id) {
      return response.forbidden({ message: 'You do not own this accommodation' })
    }

    // State gate: application must be approved or already slot-confirmed
    if (application.applicationStatus !== 'approved' && application.applicationStatus !== 'confirmed') {
      return response.badRequest({ message: 'Application is not approved or slot-confirmed' })
    }

    // Prevent double assignment for this student (active/pending)
    const existingAssignment = await Assignment.query()
      .where('studentNumber', application.studentNumber)
      .whereNull('actualMoveOut')
      .whereNotIn('confirmationStatus', ['rejected', 'cancelled'])
      .first()

    const trx = await db.transaction()

    try {
      // Handle override logic
      if (existingAssignment) {
        if (user.role === 'landlord') {
          const oldRoom = await Room.findOrFail(existingAssignment.roomId)
          // Only decrement occupancy if the old assignment was active
          if (existingAssignment.confirmationStatus === 'active') {
            oldRoom.roomCurrentOccupancy = Math.max(0, oldRoom.roomCurrentOccupancy - 1)
            if (oldRoom.roomCurrentOccupancy < oldRoom.roomCapacity) {
              oldRoom.roomAvailability = 'available'
            }
            await oldRoom.useTransaction(trx).save()
          }
          // Cancel the old assignment
          existingAssignment.confirmationStatus = 'cancelled'
          await existingAssignment.useTransaction(trx).save()
        } else {
          // managers cannot override
          await trx.rollback()
          return response.conflict({ message: 'Student already has a pending or active assignment' })
        }
      }

      // Load the target room
      const room = await Room.findOrFail(roomId)

      // Room validations
      if (room.accommodationId !== accommodation.id) {
        await trx.rollback()
        return response.badRequest({ message: 'Room does not belong to this accommodation' })
      }
      if (room.roomType !== application.applicationRoomType || room.roomStayType !== application.applicationStayType) {
        await trx.rollback()
        return response.badRequest({ message: 'Room type does not match application' })
      }
      if (room.roomCurrentOccupancy >= room.roomCapacity) {
        await trx.rollback()
        return response.conflict({ message: 'Room is full' })
      }

      // Calculate deadline date
      const deadlineDays = gracePeriodDays ?? 5
      const deadlineDate = DateTime.now().plus({ days: deadlineDays })
      const formattedDeadline = deadlineDate.toFormat('MMMM d, yyyy h:mm a')

      // Check if student already confirmed their slot
      const isAlreadyConfirmed = application.applicationStatus === 'confirmed'

      // Create the assignment WITHOUT incrementing occupancy
      const assignment = new Assignment()
      assignment.studentNumber = application.studentNumber
      assignment.roomId = room.id
      assignment.confirmedDate = DateTime.now()
      assignment.moveIn = DateTime.fromISO(moveIn)
      assignment.expectedMoveOut = DateTime.fromISO(expectedMoveOut)
      assignment.gracePeriodDays = deadlineDays
      assignment.confirmationStatus = isAlreadyConfirmed ? 'active' : 'pending_confirmation'
      
      await assignment.useTransaction(trx).save()

      // Update application with slotConfirmDeadline and roomId
      application.slotConfirmDeadline = deadlineDate
      application.roomId = room.id
      if (isAlreadyConfirmed) {
        application.applicationStatus = 'confirmed'
      }
      await application.useTransaction(trx).save()

      // If the student already confirmed, increment occupancy now
      if (isAlreadyConfirmed) {
        room.roomCurrentOccupancy += 1
        if (room.roomCurrentOccupancy >= room.roomCapacity) {
          room.roomAvailability = 'occupied'
        }
        await room.useTransaction(trx).save()
      }

      await trx.commit()

      // Send notification to student with deadline
      await this.notificationService.sendRoomAssignmentEmail(
        application.student.user,
        accommodation.accommodationName,
        room.roomNumber,
        room.roomBuilding,
        assignment.moveIn.toISODate() ?? '',
        formattedDeadline,
        deadlineDays
      )

      // Log the assignment
      const autoConfirmedSuffix = assignment.confirmationStatus === 'active' ? ' (auto-confirmed: slot already confirmed)' : ''
      if (existingAssignment && user.role === 'landlord') {
        await LogService.record(
          user.id,
          'assignment',
          assignment.id,
          'LANDLORD_ASSIGNED_ROOM_OVERRIDE',
          `Landlord ${user.id} overrode existing assignment ${existingAssignment.id} and assigned student ${application.studentNumber} to room ${room.roomNumber} (building ${room.roomBuilding})${autoConfirmedSuffix}`
        )
      } else {
        const activityType = user.role === 'manager' ? 'MANAGER_ASSIGNED_ROOM' : 'LANDLORD_ASSIGNED_ROOM'
        await LogService.record(
          user.id,
          'assignment',
          assignment.id,
          activityType,
          `${user.role === 'manager' ? 'Manager' : 'Landlord'} ${user.id} assigned student ${application.studentNumber} to room ${room.roomNumber} (building ${room.roomBuilding}) at "${accommodation.accommodationName}"${autoConfirmedSuffix}`
        )
      }
      
      return response.ok(assignment)

    } catch (error) {
      await trx.rollback()
      throw error
    }
  }

  // ─── MANAGER/LANDLORD: RECORD MOVE-OUT ───
  async moveOut({ auth, params, request, response }: HttpContext) {
    const user = auth.user!
    const { actualMoveOut } = request.body()

    const assignment = await Assignment.query()
      .where('id', params.id)
      .preload('room', (q) => q.preload('accommodation'))
      .firstOrFail()

    const room = assignment.room
    const accommodation = room.accommodation

    // Authorize
    if (user.role === 'manager' && accommodation.managerId !== user.id) {
      return response.forbidden({ message: 'You do not manage this accommodation' })
    }
    if (user.role === 'landlord' && accommodation.landlordId !== user.id) {
      return response.forbidden({ message: 'You do not own this accommodation' })
    }

    if (assignment.actualMoveOut) {
      return response.badRequest({ message: 'Already moved out' })
    }

    assignment.actualMoveOut = actualMoveOut ? DateTime.fromISO(actualMoveOut) : DateTime.now()
    await assignment.save()

    // Free up room - DECREMENT occupancy
    room.roomCurrentOccupancy = Math.max(0, room.roomCurrentOccupancy - 1)
    if (room.roomCurrentOccupancy < room.roomCapacity) {
      room.roomAvailability = 'available'
    }
    await room.save()

    // Promote next waitlisted student
    await this.waitlistService.processMoveOut(accommodation.id, room)

    await LogService.record(user.id, 'assignment', assignment.id, 'MOVED_OUT')

    try {
      const student = await Student.query()
        .where('studentNumber', assignment.studentNumber)
        .preload('user')
        .first()
      if (student?.user) {
        await this.notificationService.notify(
          student.user.id,
          'system',
          `Your stay at ${accommodation.accommodationName} has been marked moved out as of ${assignment.actualMoveOut?.toISODate() ?? ''}.`
        )
      }
    } catch (e) {
      console.error('[notify] in-app move-out controller-wrap failed:', e)
    }

    return response.ok(assignment)
  }

  // ─── MANAGER/LANDLORD: TRANSFER active assignment to a different room ───
  async transfer({ auth, params, request, response }: HttpContext) {
    const user = auth.user!
    const { targetRoomId } = request.body()

    if (!targetRoomId) {
      return response.badRequest({ message: 'targetRoomId is required' })
    }

    const assignment = await Assignment.query()
      .where('id', params.id)
      .preload('room', (q) => q.preload('accommodation'))
      .firstOrFail()

    if (assignment.confirmationStatus !== 'active') {
      return response.badRequest({ message: 'Only active assignments can be transferred' })
    }

    const sourceRoom = assignment.room
    const sourceAccommodation = sourceRoom.accommodation

    if (user.role === 'manager' && sourceAccommodation.managerId !== user.id) {
      return response.forbidden({ message: 'You do not manage this accommodation' })
    }
    if (user.role === 'landlord' && sourceAccommodation.landlordId !== user.id) {
      return response.forbidden({ message: 'You do not own this accommodation' })
    }

    const targetRoom = await Room.query()
      .where('id', targetRoomId)
      .preload('accommodation')
      .firstOrFail()

    if (user.role === 'manager' && targetRoom.accommodation.managerId !== user.id) {
      return response.forbidden({ message: 'You do not manage the target accommodation' })
    }
    if (user.role === 'landlord' && targetRoom.accommodation.landlordId !== user.id) {
      return response.forbidden({ message: 'You do not own the target accommodation' })
    }

    if (targetRoom.id === sourceRoom.id) {
      return response.badRequest({ message: 'Target room must differ from current room' })
    }
    if (targetRoom.roomType !== sourceRoom.roomType) {
      return response.badRequest({ message: 'Target room type must match current room type' })
    }
    if (targetRoom.roomCurrentOccupancy >= targetRoom.roomCapacity) {
      return response.conflict({ message: 'Target room is full' })
    }

    const trx = await db.transaction()
    try {
      // Release the source room (DECREMENT occupancy)
      sourceRoom.roomCurrentOccupancy = Math.max(0, sourceRoom.roomCurrentOccupancy - 1)
      if (sourceRoom.roomCurrentOccupancy < sourceRoom.roomCapacity) {
        sourceRoom.roomAvailability = 'available'
      }
      await sourceRoom.useTransaction(trx).save()

      // Occupy the target room (INCREMENT occupancy)
      targetRoom.roomCurrentOccupancy += 1
      if (targetRoom.roomCurrentOccupancy >= targetRoom.roomCapacity) {
        targetRoom.roomAvailability = 'occupied'
      }
      await targetRoom.useTransaction(trx).save()

      // Update the assignment
      assignment.roomId = targetRoom.id
      await assignment.useTransaction(trx).save()

      await trx.commit()
    } catch (error) {
      await trx.rollback()
      throw error
    }

    // Promote next waitlisted student for the source room's accommodation
    await this.waitlistService.processMoveOut(sourceAccommodation.id, sourceRoom)

    await LogService.record(
      user.id,
      'assignment',
      assignment.id,
      'ASSIGNMENT_TRANSFERRED',
      `Transferred assignment ${assignment.id} from room ${sourceRoom.id} to room ${targetRoom.id}`
    )

    await assignment.load('room', (q) => q.preload('accommodation'))
    await assignment.load('student', (q) => q.preload('user'))
    return response.ok(assignment)
  }

  // ─── STUDENT: VIEW CURRENT STAY ───
  async currentStay({ auth, response }: HttpContext) {
    const user = auth.user!
    const student = await Student.findByOrFail('userId', user.id)

    const assignment = await Assignment.query()
      .where('studentNumber', student.studentNumber)
      .whereNull('actualMoveOut')
      .preload('room', (q) =>
        q.preload('tags').preload('accommodation', (a) =>
          a.preload('images', (i) => i.preload('file'))
        )
      )
      .first()

    if (!assignment) return response.ok(null)

    return response.ok(await this.shapeStayResponse(assignment))
  }

  // ─── STUDENT: VIEW PAST STAYS ───
  async stayHistory({ auth, response }: HttpContext) {
    const user = auth.user!
    const student = await Student.findByOrFail('userId', user.id)

    const assignments = await Assignment.query()
      .where('studentNumber', student.studentNumber)
      .whereNotNull('actualMoveOut')
      .preload('room', (q) =>
        q.preload('tags').preload('accommodation', (a) =>
          a.preload('images', (i) => i.preload('file'))
        )
      )
      .orderBy('actualMoveOut', 'desc')

    const data = await Promise.all(assignments.map((a) => this.shapeStayResponse(a)))
    return response.ok(data)
  }

  // ─── MANAGER: VIEW ALL ASSIGNMENTS (TESTER) ───
  async viewAllAssignments({ auth, response }: HttpContext) {
    const user = auth.user!
    if (user.role !== 'manager') return response.forbidden({ message: 'access denied' })

    const assignments = await Assignment.query()
      .preload('room', (roomQuery: ModelQueryBuilderContract<typeof Room>) => {
        roomQuery.preload('accommodation')
      })
      .preload('student', (studentQuery: ModelQueryBuilderContract<typeof Student>) => {
        studentQuery.preload('user')
      })

    return response.ok(assignments)
  }

  // ─── MANAGER: VIEW ASSIGNMENTS FOR MY ACCOMMODATIONS ───
  async viewAssignments({ auth, response }: HttpContext) {
    const user = auth.user!
    if (user.role !== 'manager') return response.forbidden({ message: 'access denied' })

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
      .orderBy('moveIn', 'desc')

    return response.ok(assignments)
  }

  // ─── helper: shape an Assignment into the frontend's AccommodationHistoryItem ───
  private async shapeStayResponse(assignment: Assignment): Promise<any> {
    const room = assignment.room
    const accommodation = room.accommodation
    const accommodationWithImage = await withPrimaryImageUrl(accommodation)

    return {
      id: assignment.id,
      roomId: assignment.roomId,
      moveIn: assignment.moveIn?.toISODate() ?? null,
      expectedMoveOut: assignment.expectedMoveOut?.toISODate() ?? null,
      actualMoveOut: assignment.actualMoveOut?.toISODate() ?? null,
      room: {
        roomName: room.roomNumber,
        monthlyRate: room.roomRent,
        roomType: room.roomType,
        accommodation: {
          accommodationName: accommodation.accommodationName,
          accommodationType: accommodation.accommodationType,
          primaryImageUrl: accommodationWithImage.primaryImageUrl,
        },
      },
      review: null,
    }
  }

  // ─── STUDENT: REQUEST EARLY MOVE-OUT ─────────────────────────
  async requestEarlyMoveOut({ auth, params, request, response }: HttpContext) {
    const user = auth.user!
    const student = await Student.query()
      .where('userId', user.id)
      .preload('user')
      .firstOrFail()
      
    const { requestedMoveOutDate, reason } = request.body()

    // Validate required fields
    if (!requestedMoveOutDate || !reason) {
      return response.badRequest({ message: 'Requested date and reason are required' })
    }

    // Find the assignment with proper preloads
    const assignment = await Assignment.query()
      .where('id', params.id)
      .where('studentNumber', student.studentNumber)
      .preload('room', (q) => q.preload('accommodation'))
      .preload('student', (q) => q.preload('user'))
      .firstOrFail()

    // Check if student has already moved in
    const hasMovedIn = assignment.confirmationStatus === 'active' && assignment.moveIn <= DateTime.now()
    
    if (!hasMovedIn) {
      return response.badRequest({ 
        message: 'You cannot request an early move-out before you have moved in. Please wait until after your move-in date.' 
      })
    }

    // Check if already moved out
    if (assignment.actualMoveOut) {
      return response.badRequest({ message: 'You have already moved out.' })
    }

    // Check if there's already a pending request
    const existingRequest = await EarlyMoveOutRequest.query()
      .where('assignmentId', assignment.id)
      .where('status', 'pending')
      .first()

    if (existingRequest) {
      return response.conflict({ message: 'You already have a pending early move-out request.' })
    }

    const requestedDate = DateTime.fromISO(requestedMoveOutDate)
    const moveInDate = assignment.moveIn
    const expectedDate = assignment.expectedMoveOut
    const today = DateTime.now().startOf('day')

    // VALIDATION 1: Requested date cannot be before move-in date
    if (requestedDate < moveInDate) {
      return response.badRequest({ 
        message: `Requested move-out date cannot be before your move-in date (${moveInDate.toFormat('MMMM d, yyyy')}).` 
      })
    }

    // VALIDATION 2: Requested date must be before expected move-out date
    if (requestedDate >= expectedDate) {
      return response.badRequest({ 
        message: `Requested date must be earlier than your expected move-out date (${expectedDate.toFormat('MMMM d, yyyy')}).` 
      })
    }

    // VALIDATION 3: Requested date cannot be in the past
    if (requestedDate < today) {
      return response.badRequest({ message: 'Requested date cannot be in the past.' })
    }

    const trx = await db.transaction()

    try {
      // Create the move-out request
      const moveOutRequest = await EarlyMoveOutRequest.create(
        {
          assignmentId: assignment.id,
          studentNumber: student.studentNumber,
          requestedMoveOutDate: requestedDate,
          reason: reason.trim(),
          status: 'pending',
        },
        { client: trx }
      )

      await trx.commit()

      // Notify the manager
      const accommodation = assignment.room.accommodation
      await accommodation.load('manager', (q) => q.preload('user'))
      
      const studentUser = assignment.student?.user || student.user
      
      if (accommodation.manager?.user && studentUser) {
        await this.notificationService.notify(
          accommodation.manager.user.id,
          'move_out_request',
          `${studentUser.fname} ${studentUser.lname} has requested early move-out from Room ${assignment.room.roomNumber} (${accommodation.accommodationName}). Requested date: ${requestedDate.toFormat('MMMM d, yyyy')}.`
        )
      }

      await LogService.record(
        user.id,
        'assignment',
        assignment.id,
        'EARLY_MOVE_OUT_REQUESTED',
        `Student requested early move-out on ${requestedMoveOutDate}: ${reason}`
      )

      return response.ok({ 
        message: 'Request submitted successfully',
        request: moveOutRequest 
      })

    } catch (error) {
      await trx.rollback()
      throw error
    }
  }

  // ─── MANAGER/LANDLORD: VIEW PENDING EARLY MOVE-OUT REQUESTS ───
  async viewEarlyMoveOutRequests({ auth, response }: HttpContext) {
    const user = auth.user!
    
    // Get all accommodations managed by this manager or owned by landlord
    let accommodations
    if (user.role === 'manager') {
      accommodations = await Accommodation.query().where('managerId', user.id)
    } else if (user.role === 'landlord') {
      accommodations = await Accommodation.query().where('landlordId', user.id)
    } else {
      return response.forbidden({ message: 'Access denied' })
    }

    const accIds = accommodations.map(a => a.id)
    if (accIds.length === 0) return response.ok([])

    // Get all rooms in those accommodations
    const rooms = await Room.query().whereIn('accommodationId', accIds)
    const roomIds = rooms.map(r => r.id)

    // Get all active assignments in those rooms
    const assignments = await Assignment.query()
      .whereIn('roomId', roomIds)
      .whereNull('actualMoveOut')
      .where('confirmationStatus', 'active')
      .preload('student', (q) => q.preload('user'))

    const assignmentIds = assignments.map(a => a.id)
    if (assignmentIds.length === 0) return response.ok([])

    // Get all pending early move-out requests
    const requests = await EarlyMoveOutRequest.query()
      .whereIn('assignmentId', assignmentIds)
      .where('status', 'pending')
      .preload('assignment', (q) => {
        q.preload('room', (r) => r.preload('accommodation'))
        q.preload('student', (s) => s.preload('user'))
      })
      .orderBy('createdAt', 'asc')

    // Format the response
    const formattedRequests = requests.map(req => ({
      id: req.id,
      assignmentId: req.assignmentId,
      studentName: `${req.assignment.student.user.fname} ${req.assignment.student.user.lname}`,
      studentNumber: req.studentNumber,
      roomNumber: req.assignment.room.roomNumber,
      roomBuilding: req.assignment.room.roomBuilding,
      accommodationName: req.assignment.room.accommodation.accommodationName,
      currentMoveOutDate: req.assignment.expectedMoveOut?.toISODate(),
      requestedMoveOutDate: req.requestedMoveOutDate.toISODate(),
      reason: req.reason,
      requestedAt: req.createdAt.toISO(),
      status: req.status,
    }))

    return response.ok(formattedRequests)
  }

  // ─── MANAGER/LANDLORD: APPROVE OR REJECT EARLY MOVE-OUT REQUEST ───
  async respondToEarlyMoveOutRequest({ auth, params, request, response }: HttpContext) {
    const user = auth.user!
    const { action, remark } = request.body()

    if (!action || !['approve', 'reject'].includes(action)) {
      return response.badRequest({ message: 'Action must be approve or reject' })
    }

    const moveOutRequest = await EarlyMoveOutRequest.query()
      .where('id', params.id)
      .preload('assignment', (q) => {
        q.preload('room', (r) => r.preload('accommodation'))
        q.preload('student', (s) => s.preload('user'))
      })
      .firstOrFail()

    // Verify the manager/landlord has permission
    const accommodation = moveOutRequest.assignment.room.accommodation
    if (user.role === 'manager' && accommodation.managerId !== user.id) {
      return response.forbidden({ message: 'You do not manage this accommodation' })
    }
    if (user.role === 'landlord' && accommodation.landlordId !== user.id) {
      return response.forbidden({ message: 'You do not own this accommodation' })
    }

    if (moveOutRequest.status !== 'pending') {
      return response.badRequest({ message: `This request has already been ${moveOutRequest.status}` })
    }

    const trx = await db.transaction()

    try {
      // Update the request status
      moveOutRequest.status = action === 'approve' ? 'approved' : 'rejected'
      moveOutRequest.reviewedBy = user.id
      moveOutRequest.reviewedAt = DateTime.now()
      if (remark) {
        moveOutRequest.adminRemark = remark
      }
      await moveOutRequest.useTransaction(trx).save()

      // If approved, update the assignment's actual move-out date
      if (action === 'approve') {
        const assignment = moveOutRequest.assignment
        const requestedDate = moveOutRequest.requestedMoveOutDate
        const moveInDate = assignment.moveIn
        const expectedDate = assignment.expectedMoveOut
        
        // Double-check validations before approving
        if (requestedDate < moveInDate) {
          await trx.rollback()
          return response.badRequest({ 
            message: `Cannot approve: Requested date (${requestedDate.toFormat('MMMM d, yyyy')}) is before move-in date (${moveInDate.toFormat('MMMM d, yyyy')}).` 
          })
        }
        
        if (requestedDate >= expectedDate) {
          await trx.rollback()
          return response.badRequest({ 
            message: `Cannot approve: Requested date (${requestedDate.toFormat('MMMM d, yyyy')}) is on or after expected move-out date (${expectedDate.toFormat('MMMM d, yyyy')}).` 
          })
        }
        
        // Set the actualMoveOut to the requested date
        assignment.actualMoveOut = requestedDate
        await assignment.useTransaction(trx).save()

        // Free up the room
        const room = assignment.room
        room.roomCurrentOccupancy = Math.max(0, room.roomCurrentOccupancy - 1)
        if (room.roomCurrentOccupancy < room.roomCapacity) {
          room.roomAvailability = 'available'
        }
        await room.useTransaction(trx).save()

        // Promote next waitlisted student
        await this.waitlistService.processMoveOut(room.accommodationId, room)
      }

      await trx.commit()

      // Notify the student
      const studentUser = moveOutRequest.assignment.student.user
      const statusText = action === 'approve' ? 'approved' : 'rejected'
      const dateText = moveOutRequest.requestedMoveOutDate.toFormat('MMMM d, yyyy')
      
      await this.notificationService.notify(
        studentUser.id,
        'move_out_request_response',
        `Your early move-out request for Room ${moveOutRequest.assignment.room.roomNumber} has been ${statusText}.${action === 'approve' ? ` You are scheduled to move out on ${dateText}.` : ''}${remark ? ` Remark: ${remark}` : ''}`
      )

      await LogService.record(
        user.id,
        'assignment',
        moveOutRequest.assignmentId,
        action === 'approve' ? 'EARLY_MOVE_OUT_APPROVED' : 'EARLY_MOVE_OUT_REJECTED',
        `${user.role} ${action === 'approve' ? 'approved' : 'rejected'} early move-out request for student ${moveOutRequest.studentNumber} to ${moveOutRequest.requestedMoveOutDate.toISODate()}. Reason: ${moveOutRequest.reason}`
      )

      return response.ok({ 
        message: `Request ${action === 'approve' ? 'approved' : 'rejected'} successfully`,
        request: moveOutRequest 
      })

    } catch (error) {
      await trx.rollback()
      throw error
    }
  }
}