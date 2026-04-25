import type { HttpContext } from '@adonisjs/core/http'
import Notification from '#models/notification'
import User from '#models/user'

export default class NotificationsController {
    // retrieve notifications for currently authenticated user
    async index({ auth, response }: HttpContext) {
        try {
            const user = auth.user

            if (!user) {
            return response.unauthorized({
                message: 'Unauthorized',
            })
            }

            const notifications = await Notification.query()
            .where('userId', user.id)
            .orderBy('notificationTimestamp', 'desc')

            return response.ok({
            message: 'Notifications retrieved successfully',
            data: notifications,
            })
        } catch (error: any) {
            console.error('Error fetching notifications:', error.message)

            return response.internalServerError({
                message: 'Failed to retrieve notifications',
                error: error.message,
            })
        }
    }
    // update a specific notification by ID
    async update({ params, request, auth, response }: HttpContext) {
        try {
            const user = auth.user

            if (!user) {
            return response.unauthorized({
                message: 'Unauthorized',
            })
            }

            const notificationId = params.id

            const notification = await Notification.query()
            .where('id', notificationId)
            .andWhere('userId', user.id)
            .first()

            if (!notification) {
            return response.notFound({
                message: 'Notification not found or unauthorized',
            })
            }

            const { readStatus } = request.only(['readStatus'])

            if (readStatus && ['read', 'unread'].includes(readStatus)) {
            notification.readStatus = readStatus
            }

            await notification.save()

            return response.ok({
            message: 'Notification updated successfully',
            data: notification,
            })
        } catch (error: any) {
            console.error('Error fetching notifications:', error.message)

            return response.internalServerError({
                message: 'Failed to retrieve notifications',
                error: error.message,
            })
        }
    }
}