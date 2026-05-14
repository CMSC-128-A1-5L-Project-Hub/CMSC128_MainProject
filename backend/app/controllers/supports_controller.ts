import type { HttpContext } from '@adonisjs/core/http'
import mail from '@adonisjs/mail/services/main'

export default class SupportsController {
  async contact({ request, response }: HttpContext) {
    const { name, email, message } = request.only(['name', 'email', 'message'])

    if (!name || !email || !message) {
      return response.badRequest({
        message: 'Name, email, and message are required.',
      })
    }

    await mail.send((mailMessage) => {
    mailMessage
        .to('uble@uplb.edu.ph')
        //  .cc('windee0109@gmail.com')
        .from('no-reply@yourdomain.com')
        .replyTo(email)
        .subject(`UBLE Support Message from ${name}`)
        .text(`Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`)
    })

    return response.ok({
      message: 'Support message received.',
    })
  }
}