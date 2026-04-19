import env from '#start/env'

interface SemaphoreResponse {
  message_id?: number
  code?: string | number
  status?: string
}

export default class OtpService {
  
  /**
   * Sends an OTP via Semaphore and returns the generated code.
   */
  async sendOtp(phoneNumber: string): Promise<string> {
    const apiKey = env.get('SMS_KEY') as string
    
    if (!apiKey) {
      throw new Error('CRITICAL: Semaphore API Key is missing from environment variables.')
    }

    const message = "Your UBLE verification code is {otp}. Please do not share this with anyone. It will expire in 5 minutes"

    try {
      // 1. Make the request to Semaphore (10s timeout)
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 10_000)

      const response = await fetch('https://api.semaphore.co/api/v4/otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          apikey: apiKey,
          number: phoneNumber,
          message: message,
        }),
        signal: controller.signal,
      })
      clearTimeout(timeout)

      const data = await response.json() as SemaphoreResponse[]

      // 2. Error Handling
      if (!response.ok) {
        console.error('Semaphore API Error:', data)
        throw new Error('Failed to reach SMS provider.')
      }

      // 3. Extract the generated code from Semaphore's response array
      const generatedCode = data[0]?.code
      
      if (!generatedCode) {
        throw new Error('Semaphore did not return an OTP code.')
      }

      return generatedCode.toString()

    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.error('SMS Service: Semaphore request timed out')
        throw new Error('SMS provider timed out. Check your network or verify the API key is active on semaphore.co.')
      }
      console.error('SMS Service Error:', error)
      throw new Error('Could not send OTP. Please try again later.')
    }
  }
}