// app/services/notification_service.ts
import { inject } from '@adonisjs/core'
import mail from '@adonisjs/mail/services/main'
import User from '#models/user'

@inject()
export default class NotificationService {

  // ─── Helper: send email ───────────────────────────────────────────────────
  private async send(to: string, subject: string, html: string) {
    try {
      await mail.send((message) => {
        message
          .from('noreply@uble.com', 'UBLE Housing') // Iniba ko from noreply@usat.com to @uble.com
          .to(to)
          .subject(subject)
          .html(html)
      })
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
        <p><strong>Move-in Date:</strong> ${moveInDate}</p>
        <p>Please present this email upon move-in.</p>
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
}