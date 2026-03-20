import type { HttpContext } from '@adonisjs/core/http'

export default class ApplicationsController {
    // Student function: submit application to applications table
    async store({ auth, request, response }: HttpContext) {
        // 1. Validate the accommodation exists
        // 2. Check "Conflict Prevention" - no multiple active stays
        // 3. Create entry in applications table
        // 4. Trigger Audit Log 
    }

    // Student function: get list of applications
    async index({ auth }: HttpContext) {
        // GET (/api/v1/applications/my-applications)
    }

    // Landlord/Manager function: Update status of application (Landlords and managers can just use one function, just add in an if condition to check their roles in the function)
    async updateStatus({ request, params }: HttpContext) {
        // Level 1: Manager verification
            // Check if user is manager and application status is pending; Then accept or reject. if reject, give reason why, if accept change application status to under_review

        // Level 2: Landlord verification
            // check if user is landlord and application status is under_review; Then accept or reject. if reject, give reason why, if accept change application status to approved

        // oh and audit log it as well

        // save and return application here.
    }

    // Student function: cancel application
    async destroy({ auth, params }: HttpContext) {
        // Logic: Cancel while its still pending.
        // add audit log
    }

    // more functions? kung may maisip kayo na kailangan pa forda applications
}