import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import SmsService from '#services/otp_service'
import { DateTime } from 'luxon'
import PhoneNumber from "#models/phone_number"

@inject()
export default class SmsVerificationsController {
  constructor(protected smsService: SmsService) {}

  // POST /auth/send-otp
  async send({ auth, request, response }: HttpContext) {
    const user = auth.user!
    
    // Grab the phone number the user just submitted
    const { phoneNumber } = request.only(['phoneNumber'])

    // 1. Call the servie to send the otp
    const otpCode = await this.smsService.sendOtp(phoneNumber)

    // 2. Save the code to the user's database record so we can verify it later
    user.otpCode = otpCode
    user.otpExpiresAt = DateTime.now().plus({ minutes: 5 }) // Standard 5 min expiry
    await user.save()

    return response.ok({
      message: 'OTP sent successfully',
    })
  }

  // POST /auth/verify-sms
  async verify({ auth, request, response }: HttpContext) {
    const user = auth.user!
    const { code, phoneNumber } = request.only(['code', 'phoneNumber'])

    // TODO: OTP verification disabled for testing — re-enable before production
    // 1. Check if the code expired
    // if (user.otpExpiresAt && user.otpExpiresAt < DateTime.now()) {
    //   return response.badRequest({ message: 'OTP has expired. Please request a new one.' })
    // }

    // 2. Check if the code matches what Semaphore gave us
    // if (user.otpCode !== code) {
    //   return response.badRequest({ message: 'Invalid OTP code.' })
    // }

    // 3. Success! Create new phonenumber in the database
    await PhoneNumber.create({
      userId: user.id,
      contactNumber: phoneNumber,
      isPrimary: true,
    })

    // Then clear the otpCode and ExpiresAt in users
    user.otpCode = null
    user.otpExpiresAt = null
    await user.save()

    return response.ok({
      message: 'Phone number verified successfully!',
    })
  }
}