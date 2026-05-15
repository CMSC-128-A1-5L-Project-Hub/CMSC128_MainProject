import type { HttpContext } from '@adonisjs/core/http'
import Accommodation from '#models/accommodation'
import Manager from '#models/manager'
import Application from '#models/application'
import LogService from '#services/log_service'
import NotificationService from '#services/notification_service'
import { inject } from '@adonisjs/core'

@inject()
export default class ManagerHandoverController {
  constructor(protected notificationService: NotificationService) {}

  // Landlord: freeze accommodation — blocks approve/reject but allows new applications
  async freeze({ params, request, auth, response }: HttpContext) {
    const user = auth.user!

    const accommodation = await Accommodation.query()
      .where('id', params.id)
      .where('landlord_id', user.id)
      .preload('manager', (q) => q.preload('user'))
      .first()

    if (!accommodation) {
      return response.notFound({
        status: 404,
        error: 'Not Found',
        message: 'Accommodation not found or does not belong to you.',
      })
    }

    if (accommodation.isFrozen) {
      return response.badRequest({
        status: 400,
        error: 'Bad Request',
        message: 'Accommodation is already frozen.',
      })
    }

    const { freeze_reason } = request.body()

    if (!freeze_reason) {
      return response.badRequest({
        status: 400,
        error: 'Validation Error',
        message: 'freeze_reason is required.',
      })
    }

    accommodation.isFrozen = true
    accommodation.freezeReason = freeze_reason
    accommodation.freezeStartedAt = new Date() as any
    await accommodation.save()

    await LogService.record(
      user.id,
      'accommodation',
      accommodation.id,
      'frozen',
      `Accommodation frozen by landlord. Reason: ${freeze_reason}`
    )

    if (accommodation.manager?.user) {
      await this.notificationService.sendManagerFreezeNotification(
        accommodation.manager.user,
        accommodation.accommodationName,
        freeze_reason
      )
    }

    return response.ok({
      status: 200,
      message: 'Accommodation frozen successfully.',
      data: {
        accommodationId: accommodation.id,
        isFrozen: accommodation.isFrozen,
        freezeReason: accommodation.freezeReason,
        freezeStartedAt: accommodation.freezeStartedAt,
      },
    })
  }

  // Landlord: unfreeze + optionally assign new manager
  async unfreeze({ params, request, auth, response }: HttpContext) {
    const user = auth.user!

    const accommodation = await Accommodation.query()
      .where('id', params.id)
      .where('landlord_id', user.id)
      .preload('manager', (q) => q.preload('user'))
      .first()

    if (!accommodation) {
      return response.notFound({
        status: 404,
        error: 'Not Found',
        message: 'Accommodation not found or does not belong to you.',
      })
    }

    if (!accommodation.isFrozen) {
      return response.badRequest({
        status: 400,
        error: 'Bad Request',
        message: 'Accommodation is not frozen.',
      })
    }

    const { new_manager_id } = request.body()

    const oldManager = accommodation.manager?.user ?? null
    const oldManagerId = accommodation.managerId

    // If new manager provided, validate and assign
    if (new_manager_id) {
      const newManager = await Manager.query()
        .where('user_id', new_manager_id)
        .preload('user')
        .first()

      if (!newManager) {
        return response.notFound({
          status: 404,
          error: 'Not Found',
          message: 'New manager not found.',
        })
      }

      // Check new manager is not already assigned to another accommodation
      const alreadyAssigned = await Accommodation.query()
        .where('manager_id', new_manager_id)
        .whereNot('id', accommodation.id)
        .first()

      if (alreadyAssigned) {
        return response.badRequest({
          status: 400,
          error: 'Bad Request',
          message: 'This manager is already assigned to another accommodation.',
        })
      }

      // Deactivate old manager
      if (oldManagerId) {
        const oldManagerRecord = await Manager.findBy('userId', oldManagerId)
        if (oldManagerRecord) {
          oldManagerRecord.managerStatus = 'inactive'
          await oldManagerRecord.save()
        }
      }

      // Activate/reactivate new manager
      newManager.managerStatus = 'active'
      await newManager.save()

      // Replace manager
      accommodation.managerId = new_manager_id

      // Notify new manager of assignment
      if (newManager.user) {
        await this.notificationService.sendManagerAssignmentEmailNotification(
          newManager.user,
          accommodation.accommodationName
        )
      }

      // Log handover
      await LogService.record(
        user.id,
        'accommodation',
        accommodation.id,
        'manager_handover',
        `Manager changed from user_id ${oldManagerId} to user_id ${new_manager_id} during unfreeze`
      )
    }

    // Unfreeze
    accommodation.isFrozen = false
    accommodation.freezeReason = null
    accommodation.freezeStartedAt = null
    await accommodation.save()

    await LogService.record(
      user.id,
      'accommodation',
      accommodation.id,
      'unfrozen',
      `Accommodation unfrozen by landlord${new_manager_id ? ' with new manager assigned' : ''}`
    )

    // Notify old manager they no longer have access (if manager changed)
    if (new_manager_id && oldManager) {
      await this.notificationService.sendManagerRemovedNotification(
        oldManager,
        accommodation.accommodationName
      )
    }

    const pendingCount = await Application.query()
      .where('accommodation_id', accommodation.id)
      .where('application_status', 'pending')
      .count('* as total')

    return response.ok({
      status: 200,
      message: 'Accommodation unfrozen successfully.',
      data: {
        accommodationId: accommodation.id,
        isFrozen: false,
        newManagerId: new_manager_id ?? null,
        pendingApplications: Number(pendingCount[0].$extras.total),
      },
    })
  }

  // GET /landlord/accommodations/:id/freeze-status
  async status({ params, auth, response }: HttpContext) {
    const user = auth.user!

    const accommodation = await Accommodation.query()
      .where('id', params.id)
      .where('landlord_id', user.id)
      .preload('manager', (q) => q.preload('user'))
      .first()

    if (!accommodation) {
      return response.notFound({
        status: 404,
        error: 'Not Found',
        message: 'Accommodation not found or does not belong to you.',
      })
    }

    const pendingCount = await Application.query()
      .where('accommodation_id', accommodation.id)
      .where('application_status', 'pending')
      .count('* as total')

    return response.ok({
      status: 200,
      data: {
        accommodationId: accommodation.id,
        accommodationName: accommodation.accommodationName,
        isFrozen: accommodation.isFrozen,
        freezeReason: accommodation.freezeReason ?? null,
        freezeStartedAt: accommodation.freezeStartedAt ?? null,
        currentManager: accommodation.manager?.user
          ? {
              userId: accommodation.manager.user.id,
              name: `${accommodation.manager.user.fname} ${accommodation.manager.user.lname}`,
              email: accommodation.manager.user.email,
            }
          : null,
        pendingApplications: Number(pendingCount[0].$extras.total),
      },
    })
  }
}