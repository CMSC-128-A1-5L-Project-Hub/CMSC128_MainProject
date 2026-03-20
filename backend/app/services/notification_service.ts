import { inject } from '@adonisjs/core'
import mail from '@adonisjs/mail/services/main'
import User from '#models/user'

@inject()
export default class NotificationService {
    // Sends the 6-digit OTP for Identity Verification (For now its sending to email, i haven't setup the one for SMS yet)
    async sendVerificationOTP(user: User, otp: string) {
        try {
        await mail.send((message) => {
            message
            .subject('Please verify your Identity')
            .from('noreply@usat.com', 'USAT Housing')
            .to(user.email)
            .subject('Your USAT Verification Code')
            // Points to resources/views/emails/otp.edge
            .html(
                "Your verificataion code is blahal"
            )
        })
        } catch (error) {
        console.error('Email failed to send:', error)
        }
    }
}