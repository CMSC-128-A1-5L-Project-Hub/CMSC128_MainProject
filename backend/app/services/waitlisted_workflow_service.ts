import Application from "#models/application";
import Room from "#models/room";
import app from "@adonisjs/core/services/app";
import NotificationService from "./notification_service";
import { inject } from '@adonisjs/core'

@inject()

export default class WaitlistWorkflowService {
    constructor(protected notificationService: NotificationService){}

    // Call when HA approves an application
    // Check room availability and either:
    // 1. Sets status to 'approved' (room available)
    // 2. Sets status to 'waitlisted' (no room available)
    async processApproval(applicationId: number){
        const application = await Application.query()
            .where('id', applicationId)
            .preload('student', (q) => q.preload('user'))
            .preload('accommodation')
            .firstOrFail()

        // Check if there's an available room mathcing the student's preferred room type
        const availableRoom = await Room.query()
            .where('accommodation_id', application.accommodationId)
            .where('room_type', application.applicationRoomType)
            .where('room_stay_type', application.applicationStayType)
            .where('room_availability', 'available')
            .first()
        
        if(availableRoom) {
            // If room available, accept.
            application.applicationStatus = 'approved'
            await application.save()

            await this.notificationService.sendApplicationStatusEmail(
                application.student.user,
                'approved',
                application.accommodation.accommodationName
            )
        } else {
            // If no room available, waitlisted
            const waitlistPosition = await this.getNextWaitlistPosition(application.accommodationId)

            application.applicationStatus = 'waitlisted'
            await application.save()

            // Notify Student of waitlist placement and postion
            await this.notificationService.sendWaitlistEmail(
                application.student.user,
                application.accommodation.accommodationName,
                waitlistPosition
            )
        }

        return application
    }

    // Call when a slot confirmation deadline expires
    // Cancels the application and promotes the next waitlisted student
    async processSlotExpiry(applicationId: number){
        const application = await Application.query()
            .where('id', applicationId)
            .preload('student', (q) => q.preload('user'))
            .preload('accommodation')
            .firstOrFail()

        // Cancel the expired application
        application.applicationStatus = 'cancelled'
        await application.save()

        // Notify student that slot was forfeited
        await this.notificationService.sendSlotExpiredEmail(
            application.student.user,
            application.accommodation.accommodationName
        )

        // Promote next waitlisted student
        await this.promoteNextWaitlisted(application.accommodationId)
    }

    // Call when move-out event is recorded
    // Promoted the next waitlisted student when a room becomes available
    async processMoveOut(accommodationId: number){
        await this.promoteNextWaitlisted(accommodationId)
    }

    async processWaitlistCancellation(applicationId: number){
        const application = await Application.query()
            .where('id', applicationId)
            .preload('student', (q) => q.preload('user'))
            .preload('accommodation')
            .firstOrFail()
        
        if (application.applicationStatus !== 'waitlisted'){
            throw new Error('Application is not waitlisted.')
        }

        application.applicationStatus = 'cancelled'
        await application.save()

        // Notify student of cancellation confirmation
        await this.notificationService.sendCancellationEmail(
            application.student.user,
            application.accommodation.accommodationName
        )
    }

    // Promotes the next 'waitlisted' studen to 'approved'
    private async promoteNextWaitlisted(accommodationId: number){
        //Get the earliest waitlisted application (by application_date)
        const nextWaitlisted = await Application.query()
            .where('accommodation_id', accommodationId)
            .where('application_status', 'waitlisted')
            .orderBy('application_date', 'asc')
            .preload('student', (q) => q.preload('user'))
            .preload('accommodation')
            .first()

        if(!nextWaitlisted){
            // No one on the waitlist; wala na gagawin hehe
            return
        }

        // Promote to approved
        nextWaitlisted.applicationStatus = 'approved'
        await nextWaitlisted.save()

        // Notify studen with slot confirmation instructions
        await this.notificationService.sendApplicationStatusEmail(
            nextWaitlisted.student.user,
            'approved',
            nextWaitlisted.accommodation.accommodationName
        )
    }

    // Get the next waitlist position for a new waitlisted student
    private async getNextWaitlistPosition(accommodationId: number){
        const waitlistCount = await Application.query()
            .where('accommodation_id', accommodationId)
            .where('application_status', 'waitlisted')
            .count('* as total')

        // Count + 1 means you give the new position to that student
        return Number(waitlistCount[0].$extras.total) + 1
    }

    // Get current waitlist position for a specific student
    async getWaitlistPosition(applicationId: number): Promise<number> {
        const application = await Application.findOrFail(applicationId)

        // Count how many waitlisted application were submitted before this one
        const position = await Application.query()
            .where('accommodation_id', application.accommodationId)
            .where('application_status', 'waitlisted')
            .where('application_date', '<', application.applicationDate.toJSDate())
            .count('* as total')

    return Number(position[0].$extras.total)
    }
    
}