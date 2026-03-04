import type { HttpContext } from '@adonisjs/core/http'

export default class AuthController {
    // STEP 1: make an async function called redirect that sends the user to the google login screen
    async redirect({ ally }: HttpContext) {
        return ally.use('google').redirect()
    }

    // STEP 2: make an async function called callback that handles the response from google.
    async callback({ ally }: HttpContext) {
        const google = ally.use('google')

        // Handle errors before fetching the user
        if (google.accessDenied()) {
            return 'Access was denied'
        }
        if (google.stateMisMatch()) {
            return 'Request expired. Retry again'
        }
        if (google.hasError()) {
            return google.getError()
        }

        // Fetch the user data
        const googleUser = await google.user()
        
        // Returns the user object as JSON to your browser
        return googleUser 
    }
}