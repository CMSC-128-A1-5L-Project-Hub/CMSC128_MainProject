// app/services/notification_service.ts
import { inject } from '@adonisjs/core'
import env from '#start/env'
import User from '#models/user'
import Notification from '#models/notification'

@inject()
export default class NotificationService {
  // For sending notifications via the system's notification service
  async notify(
    userId: number,
    type: 'fee_due' | 'application_status' | 'system' | 'other',
    content: string
  ) {
    // Uncomment na lang pag di na need
    try {
      console.log('Creating notification...')

      const notification = await Notification.create({
        userId,
        notificationType: type,
        notificationContent: content,
        readStatus: 'unread'
      })

      console.log('Created:', notification)
    } catch (error) {
      console.error(error)
    }
  }

  // ─── Helper: send email via Brevo HTTP API ────────────────────────────────
  private async send(to: string, subject: string, html: string) {
    try {
      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'api-key': env.get('BREVO_API_KEY'),
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          sender: {
            name: env.get('MAIL_FROM_NAME'),
            email: env.get('MAIL_FROM_ADDRESS'),
          },
          to: [{ email: to }],
          subject,
          htmlContent: html,
        }),
      })

      if (!response.ok) {
        const error = await response.text()
        console.error('Email failed to send:', error)
      }
    } catch (error) {
      console.error('Email failed to send:', error)
    }
  }

  // ─── OTP Verification ─────────────────────────────────────────────────────
  async sendVerificationOTP(user: User, otp: string) {
    await this.send(
      user.email,
      'Your UBLE Verification Code',
      `
        <p>Hello ${user.fname},</p>
        <p>Your verification code is: <strong>${otp}</strong></p>
        <p>This code is valid for 5 minutes. Do not share this with anyone.</p>
        <br/>
        <p>UBLE Housing</p>
      `
    )
  }

  // ─── Application Status Emails ────────────────────────────────────────────

  // Called when: DM approves (pending → under_review) or HA approves (under_review → approved)
  async sendApplicationStatusEmail(
    user: User,
    status: 'under_review' | 'approved' | 'rejected' | 'cancelled',
    accommodationName: string,
    reason?: string
  ) {
    const subjects: Record<string, string> = {
      under_review: 'Your application has passed initial screening',
      approved: 'Your accommodation application has been approved!',
      rejected: 'Your accommodation application has been rejected',
      cancelled: 'Your accommodation slot has been cancelled',
    }

    const bodies: Record<string, string> = {
      under_review: `
        <p>Hello ${user.fname},</p>
        <p>Your application for <strong>${accommodationName}</strong> has passed initial screening by the Dormitory Manager and is now awaiting final review by the Housing Administrator.</p>
        <p>We will notify you once a final decision has been made.</p>
        <br/>
        <p>UBLE Housing</p>
      `,
      approved: `
        <p>Hello ${user.fname},</p>
        <p>Congratulations! Your application for <strong>${accommodationName}</strong> has been approved.</p>
        <p>Please log in to UBLE and confirm your slot within the deadline. Failure to confirm will result in your slot being forfeited.</p>
        <br/>
        <p>UBLE Housing</p>
      `,
      rejected: `
        <p>Hello ${user.fname},</p>
        <p>We regret to inform you that your application for <strong>${accommodationName}</strong> has been rejected.</p>
        ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
        <br/>
        <p>UBLE Housing</p>
      `,
      cancelled: `
        <p>Hello ${user.fname},</p>
        <p>Your application for <strong>${accommodationName}</strong> has been cancelled.</p>
        <br/>
        <p>UBLE Housing</p>
      `,
    }

    await this.send(user.email, subjects[status], bodies[status])
  }

  // ─── Waitlist Placement Email ─────────────────────────────────────────────
  // Called when: HA approves but no room available → student is waitlisted
  async sendWaitlistEmail(user: User, accommodationName: string, position: number) {
    await this.send(
      user.email,
      'You have been placed on the waitlist',
      `
        <p>Hello ${user.fname},</p>
        <p>Your application for <strong>${accommodationName}</strong> has been reviewed and approved by the Housing Administrator. However, no rooms are currently available matching your preferred room type.</p>
        <p>You have been placed on the waitlist. Your current position is: <strong>#${position}</strong></p>
        <p>You will be notified automatically when a room becomes available and your slot is confirmed.</p>
        <br/>
        <p>UBLE Housing</p>
      `
    )
  }

  // ─── Slot Expired Email ───────────────────────────────────────────────────
  // Called when: student fails to confirm slot within deadline
  async sendSlotExpiredEmail(user: User, accommodationName: string) {
    await this.send(
      user.email,
      'Your accommodation slot has been forfeited',
      `
        <p>Hello ${user.fname},</p>
        <p>Unfortunately, your slot for <strong>${accommodationName}</strong> has been forfeited because you did not confirm within the required deadline.</p>
        <p>If you are still interested in accommodation, you may submit a new application during the next application period.</p>
        <br/>
        <p>UBLE Housing</p>
      `
    )
  }

  // ─── Waitlist Cancellation Confirmation Email ─────────────────────────────
  // Called when: student cancels their own waitlisted application
  async sendCancellationEmail(user: User, accommodationName: string) {
    await this.send(
      user.email,
      'Your waitlist application has been cancelled',
      `
        <p>Hello ${user.fname},</p>
        <p>Your waitlisted application for <strong>${accommodationName}</strong> has been successfully cancelled as per your request.</p>
        <p>If you wish to apply again in the future, you may do so during the next application period.</p>
        <br/>
        <p>UBLE Housing</p>
      `
    )
  }

  // ─── Room Assignment Email ────────────────────────────────────────────────
  // Called when: DM assigns a room to the student
  async sendRoomAssignmentEmail(
    user: User,
    accommodationName: string,
    roomNumber: string,
    roomBuilding: string,
    moveInDate: string
  ) {
    await this.send(
      user.email,
      'Your room assignment is confirmed!',
      `
        <p>Hello ${user.fname},</p>
        <p>Your room assignment for <strong>${accommodationName}</strong> has been confirmed!</p>
        <p><strong>Room Number:</strong> ${roomNumber}</p>
        <p><strong>Building:</strong> ${roomBuilding}</p>
        <p> Do not forget to confirm or reject your application </p>
        <br/>
        <p>UBLE Housing</p>
      `
    )
  }

  // ─── Dormitory Manager Notification ──────────────────────────────────────
  // Called when: student confirms slot → notify DM to assign room
  async sendManagerAssignmentNotification(
    manager: User,
    studentName: string,
    accommodationName: string
  ) {
    await this.send(
      manager.email,
      'A student has confirmed their slot — room assignment required',
      `
        <p>Hello ${manager.fname},</p>
        <p><strong>${studentName}</strong> has confirmed their slot for <strong>${accommodationName}</strong>.</p>
        <p>Please log in to UBLE and proceed with room assignment at your earliest convenience.</p>
        <br/>
        <p>UBLE Housing</p>
      `
    )
  }

  // ─── Manager Freeze Notification ─────────────────────────────────────────
  // Called when: landlord freezes accommodation → notify current manager
  async sendManagerFreezeNotification(manager: User, accommodationName: string, reason: string) {
    await this.send(
      manager.email,
      `${accommodationName} has been frozen`,
      `
        <p>Hello ${manager.fname},</p>
        <p>The accommodation <strong>${accommodationName}</strong> has been frozen by the landlord.</p>
        <p><strong>Reason:</strong> ${reason}</p>
        <p>During this period, you can still view applications but cannot approve or reject them. The freeze will be lifted once the landlord completes the handover process.</p>
        <br/>
        <p>UBLE Housing</p>
      `
    )
  }

  // ─── New Manager Assignment Email ─────────────────────────────────────────
  // Called when: landlord assigns a new manager during unfreeze
  async sendManagerAssignmentEmailNotification(manager: User, accommodationName: string) {
    await this.send(
      manager.email,
      `You have been assigned to ${accommodationName}`,
      `
        <p>Hello ${manager.fname},</p>
        <p>You have been assigned as the manager of <strong>${accommodationName}</strong>.</p>
        <p>Please log in to UBLE to begin processing pending applications.</p>
        <br/>
        <p>UBLE Housing</p>
      `
    )
  }

  // ─── Manager Removed Notification ────────────────────────────────────────
  // Called when: old manager is replaced during unfreeze
  async sendManagerRemovedNotification(manager: User, accommodationName: string) {
    await this.send(
      manager.email,
      `Your assignment to ${accommodationName} has ended`,
      `
        <p>Hello ${manager.fname},</p>
        <p>Your assignment as manager of <strong>${accommodationName}</strong> has ended.</p>
        <p>You no longer have access to this accommodation's applications and records.</p>
        <p>Thank you for your service.</p>
        <br/>
        <p>UBLE Housing</p>
      `
    )
  }

  // ─── Account Approved Email ───────────────────────────────────────────────
  // Called when: admin approves a user's account (student or landlord)
  async sendAccountApprovedEmail(user: User, role: string) {
    const roleLabel = role === 'landlord' ? 'Housing Administrator' : 'Student'
    await this.send(
      user.email,
      'Your UBLE account has been approved!',
      `
        <p>Hello ${user.fname},</p>
        <p>Your UBLE account has been reviewed and approved as a <strong>${roleLabel}</strong>.</p>
        <p>You can now log in and access your dashboard.</p>
        <br/>
        <p>UBLE Housing</p>
      `
    )
  }

  // ─── Accommodation Approved Email ─────────────────────────────────────────
  // Called when: admin approves a landlord's accommodation listing
  async sendAccommodationApprovedEmail(user: User, accommodationName: string) {
    await this.send(
      user.email,
      'Your accommodation listing has been approved!',
      `
        <p>Hello ${user.fname},</p>
        <p>Your accommodation listing <strong>${accommodationName}</strong> has been reviewed and approved by the admin.</p>
        <p>It is now live on the UBLE platform and visible to students. You may now manage it from your dashboard.</p>
        <br/>
        <p>UBLE Housing</p>
      `
    )
  }

  async sendManagerInvitationEmail(
    email: string,
    accommodationName: string,
    landlordName: string
  ) {
    const signInUrl = `${env.get('FRONTEND_URL') ?? 'http://localhost:5173'}/api/auth/google/redirect`
    await this.send(
      email,
      `You have been invited to manage ${accommodationName} on UBLE`,
      `
        <p>Hello,</p>
        <p>${landlordName} has invited you to become the manager of
          <strong>${accommodationName}</strong> on UBLE Housing.</p>
        <p>To accept this invitation, please register using this email address:</p>
        <p><a href='${signInUrl}'>Click here to sign in</a></p>
        <p>Once you sign in with this email, you will be guided through a short
          setup and then automatically assigned to ${accommodationName}.</p>
        <br/>
        <p>UBLE Housing</p>
      `
    )
  }

  // ─── Approval with Tag Matching Email ────────────────────────────────────
  async sendApprovalWithTags(
    studentUser: User,
    accommodationName: string,
    matchedTags: string[],
    unmatchedTags: string[]
  ) {
    const matchedList = matchedTags.length > 0
      ? `<ul>${matchedTags.map(t => `<li>${t}</li>`).join('')}</ul>`
      : '<p>None</p>'
    const unmatchedList = unmatchedTags.length > 0
      ? `<ul>${unmatchedTags.map(t => `<li>${t}</li>`).join('')}</ul>`
      : '<p>None</p>'

    await this.send(
      studentUser.email,
      `Your application to ${accommodationName} has been approved`,
      `
        <p>Hello ${studentUser.fname},</p>
        <p>Your application to <strong>${accommodationName}</strong> has been approved.</p>
        <p><strong>Matched amenities:</strong> ${matchedList}</p>
        <p><strong>Unmatched amenities:</strong> ${unmatchedList}</p>
        <p>Please log in to UBLE to confirm your slot.</p>
        <br/>
        <p>UBLE Housing</p>
      `
    )
  }

  // ─── Transient Payment Pending Notification ───────────────────────────────
  async sendTransientPaymentPending(
    landlordUser: User,
    roomNumber: string,
    studentNumber: string,
    checkIn: string,
    checkOut: string
  ) {
    await this.send(
      landlordUser.email,
      'New transient booking payment pending',
      `
        <p>Hello ${landlordUser.fname},</p>
        <p>A student (${studentNumber}) has booked room ${roomNumber} for ${checkIn} to ${checkOut}.</p>
        <p>The payment proof is ready for verification. Please review and confirm or reject the booking.</p>
        <p>UBLE Housing</p>
      `
    )
  }

  // ─── Room Issue Report Email ──────────────────────────────────────────────
  async sendRoomIssueReportEmail(
    landlordUser: User,
    roomNumber: string,
    building: string,
    managerFirstName: string,
    managerLastName: string,
    issueDetails: string
  ) {
    await this.send(
      landlordUser.email,
      `Room issue reported for Room ${roomNumber}`,
      `
        <p>Hello ${landlordUser.fname},</p>
        <p>The dormitory manager <strong>${managerFirstName} ${managerLastName}</strong> has reported an issue with the following room:</p>
        <ul>
          <li>Building: ${building}</li>
          <li>Room: ${roomNumber}</li>
          <li>Issue: ${issueDetails}</li>
        </ul>
        <p>Please review and take necessary action.</p>
        <br/>
        <p>UBLE Housing</p>
      `
    )
  }

  // ─── Admin: New User Pending Verification ─────────────────────────────────
  async sendNewUserPendingVerificationEmail(newUser: User, roleAppliedFor: string) {
    const admins = await User.query().where('role', 'super_admin')

    const subject = `[UBLE] New ${roleAppliedFor} account pending verification`
    const html = `
      <p>A new user has submitted their setup form and is awaiting account verification.</p>
      <table>
        <tr><td><strong>Name:</strong></td><td>${newUser.fname} ${newUser.lname}</td></tr>
        <tr><td><strong>Email:</strong></td><td>${newUser.email}</td></tr>
        <tr><td><strong>Role applied for:</strong></td><td>${roleAppliedFor}</td></tr>
      </table>
      <br/>
      <p>Please log in to the UBLE admin dashboard to review and verify this account.</p>
      <br/>
      <p>UBLE Housing</p>
    `

    await Promise.all(admins.map((admin) => this.send(admin.email, subject, html)))
  }

    async sendOverdueFeeReminderEmail(
    user: User,
    studentNumber: string,
    feeCategory: string,
    amount: number,
    dueDate: string,
    accommodationName: string
  ) {
    const formattedAmount = new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(amount)

    const formattedDueDate = new Date(dueDate).toLocaleDateString('en-PH', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    })

    await this.send(
      user.email,
      'Overdue Fee Reminder',
      `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #8C1535;">Overdue Fee Reminder</h2>
          <p>Dear <strong>${user.fname}</strong>,</p>
          
          <p>This is a reminder that you have an overdue payment for your accommodation at <strong>${accommodationName}</strong>.</p>
          
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr style="background-color: #F5ECF0;">
              <td style="padding: 10px; border: 1px solid #E8D4DF;"><strong>Student Number:</strong></td>
              <td style="padding: 10px; border: 1px solid #E8D4DF;">${studentNumber}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #E8D4DF;"><strong>Fee Category:</strong></td>
              <td style="padding: 10px; border: 1px solid #E8D4DF;">${feeCategory}</td>
            </tr>
            <tr style="background-color: #F5ECF0;">
              <td style="padding: 10px; border: 1px solid #E8D4DF;"><strong>Amount Due:</strong></td>
              <td style="padding: 10px; border: 1px solid #E8D4DF; color: #DC2626; font-weight: bold;">${formattedAmount}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #E8D4DF;"><strong>Due Date:</strong></td>
              <td style="padding: 10px; border: 1px solid #E8D4DF;">${formattedDueDate}</td>
            </tr>
          </table>
          
          <div style="background-color: #FFF5F7; border-left: 4px solid #DC2626; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; color: #DC2626; font-weight: bold;"> Payment Overdue</p>
            <p style="margin: 10px 0 0 0;">Please settle your outstanding balance as soon as possible to avoid further penalties.</p>
          </div>
          
          <p>If you have already made the payment, please disregard this reminder.</p>
          
          <br/>
          <p>Best regards,</p>
          <p><strong>UBLE Housing Team</strong></p>
        </div>
      `
    )
  }
}