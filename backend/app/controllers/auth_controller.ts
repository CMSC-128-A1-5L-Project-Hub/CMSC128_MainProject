import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import ProvisioningService from '#services/provisioning_service'
import NotificationService from '#services/notification_service'

@inject()
export default class AuthController {
    constructor(
        protected provisioningService: ProvisioningService,
        protected notificationService: NotificationService
    ) {}

    // STEP 1: make an async function called redirect that sends the user to the google login screen
    async redirect({ ally }: HttpContext) {
        return ally.use('google').redirect()
    }

    // STEP 2: make an async function called callback that handles the response from google.
    async callback({ ally, auth, response }: HttpContext) {
        const google = ally.use('google')

        // Handle errors before fetching the user
        if (google.accessDenied()) return 'Access was denied'
        if (google.stateMisMatch()) return 'Request expired. Retry again'
        if (google.hasError()) return google.getError()

        // Fetch the user data
        const googleUser = await google.user()

        // provision the user (In the service it should check if the user exists in the database, if not create new user give them the 'unassigned' role)
        const user = await this.provisioningService.provision({
            email: googleUser.email,
            firstName: googleUser.original.given_name,
            lastName: googleUser.original.family_name,
        })

        // Log the user in
        await auth.use('web').login(user)

        // Redirect to setup if unassigned
        // NOTE: Once we've setup the frontend react, uncomment out the return response.redirect and delete the return {} stuff. thats just for testing
        if (user.role === 'unassigned') {
            // return response.redirect('http://localhost:5173/api/v1/setup')
            return {
            status: 'success',
            isNewUser: user.role === 'unassigned',
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                fullName: `${user.firstName} ${user.lastName}`
            },
            nextStep: user.role === 'unassigned' ? 'Go to /setup' : 'Go to /dashboard'
        }
        }

        // Else just go to dashboard
        if (user.role === 'student') {
            // return response.redirect('http://localhost:5173/api/v1/dashboard/student')
        }

        if (user.role === 'landlord') {
            // return response.redirect('http://localhost:5173/api/v1/dashboard/landlord')
        }



    }
}