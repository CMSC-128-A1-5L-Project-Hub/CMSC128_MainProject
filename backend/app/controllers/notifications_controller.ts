import type { HttpContext } from '@adonisjs/core/http'
import Notification from '#models/notification'

export default class NotificationsController {
    // retrieve notifications for currently authenticated user
    async index({ auth, response }: HttpContext) {
        try {
            // ensure the user is authenticated
            const user = auth.user!

            // fetch notifications belonging to the user, newest first
            const notifications = await Notification.query()
            .where('userId', user.id)
            .orderBy('notificationTimestamp', 'desc')

            return response.ok({
                message: 'Notifications retrieved successfully',
                data: notifications,
            })
        } catch (error) {
            console.error('Error fetching notifications:', error)
            return response.internalServerError({
                message: 'Failed to retrieve notifications',
                error: error.message,
            })
        }
    }
    // update a specific notification by ID
    async update({ params, request, auth, response }: HttpContext) {
        try {
            const user = auth.user!
            const notificationId = params.id

            // find the notification and ensure it belongs to the authenticated user
            const notification = await Notification.query()
                .where('id', notificationId)
                .andWhere('userId', user.id)
                .first()

            // return 404 if it foes not exist or belongs to someone else
            if (!notification) {
                return response.notFound({
                    message: 'Notification not found or unauthorized',
                })
            }

            // extract the fields we want to allow updating
            const { readStatus } = request.only(['readStatus'])

            // update the notification if a valid status is provided
            if (readStatus && ['read', 'unread'].includes(readStatus)) {
                notification.readStatus = readStatus
            }

            // save changes to database
            await notification.save()

            return response.ok({
                message: 'Notification updated successfully',
                data: notification,
            })

        } catch (error) {
            console.error('Error updating notification:', error)
            return response.internalServerError({
                message: 'Failed to update notification',
                error: error.message
            })
        }
    }
}