// import type { HttpContext } from '@adonisjs/core/http'

import type { HttpContext } from '@adonisjs/core/http'
import Accommodation from '#models/accommodation'
import Room from '#models/room'
import Assignment from '#models/assignment'

export default class OccupancyRecordsController {
  async rooms({ auth, response }: HttpContext) {
    const authUser = auth.user

    if (!authUser) {
      return response.unauthorized({ message: 'Unauthorized' })
    }

    const accommodation = await Accommodation.query()
      .where('manager_id', authUser.id)
      .first()

    if (!accommodation) {
      return response.notFound({
        message: 'No accommodation assigned to this manager',
      })
    }

    const rooms = await Room.query()
      .where('accommodationId', accommodation.id)
      .preload('assignments', (assignmentQuery) => {
        assignmentQuery
          .whereNull('actualMoveOut')
          .preload('student', (studentQuery) => {
            studentQuery.preload('user', (userQuery) => {
              userQuery.preload('phoneNumbers')
            })
          })
      })

    const data = rooms.map((room) => ({
      id: room.id,
      roomNumber: room.roomNumber,
      stayType:
        room.roomStayType === 'non_transient' ? 'non-transient' : 'transient',
      roomType: room.roomType,
      roomCapacity: room.roomCapacity,
      roomCurrentOccupancy: room.roomCurrentOccupancy,
      roomBuilding: room.roomBuilding,
      tenants: room.assignments.map((assignment) => {
        const student = assignment.student
        const user = student?.user

        const primaryPhone =
          user?.phoneNumbers?.find((p) => p.isPrimary)?.contactNumber ?? 'N/A'

        return {
          fullName: `${user?.fname ?? ''} ${user?.lname ?? ''}`.trim() || 'N/A',
          email: user?.email ?? 'N/A',
          phoneNumber: primaryPhone,
        }
      }),
    }))

    return response.ok(data)
  }

  async history({ auth, response }: HttpContext) {
    const authUser = auth.user

    if (!authUser) {
      return response.unauthorized({ message: 'Unauthorized' })
    }

    const accommodation = await Accommodation.query()
      .where('manager_id', authUser.id)
      .first()

    if (!accommodation) {
      return response.notFound({
        message: 'No accommodation assigned to this manager',
      })
    }

    const assignments = await   Assignment.query()
      .preload('room')
      .preload('student', (studentQuery) => {
        studentQuery.preload('user', (userQuery) => {
          userQuery.preload('phoneNumbers')
        })
      })
      .whereHas('room', (roomQuery) => {
        roomQuery.where('accommodationId', accommodation.id)
      })
      .orderBy('created_at', 'desc')

    const data = assignments.flatMap((assignment) => {
      const student = assignment.student
      const user = student?.user
      const room = assignment.room

      const primaryPhone =
        user?.phoneNumbers?.find((p) => p.isPrimary)?.contactNumber ?? 'N/A'

      const tenant = {
        fullName: `${user?.fname ?? ''} ${user?.lname ?? ''}`.trim() || 'N/A',
        email: user?.email ?? 'N/A',
        phoneNumber: primaryPhone,
      }

      const records = [
        {
          tenant,
          roomNumber: room.roomNumber,
          roomBuilding: room.roomBuilding,
          roomType: room.roomType,
          action: 'Move-in',
          date: assignment.moveIn.toFormat('MMM dd, yyyy'),
          time: assignment.moveIn.toFormat('hh:mm a'),
        },
      ]

      if (assignment.actualMoveOut) {
        records.push({
          tenant,
          roomNumber: room.roomNumber,
          roomBuilding: room.roomBuilding,
          roomType: room.roomType,
          action: 'Move-out',
          date: assignment.actualMoveOut.toFormat('MMM dd, yyyy'),
          time: assignment.actualMoveOut.toFormat('hh:mm a'),
        })
      }

      return records
    })

    return response.ok(data)
  }
}