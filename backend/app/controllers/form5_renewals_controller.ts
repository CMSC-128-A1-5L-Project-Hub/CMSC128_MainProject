import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import db from '@adonisjs/lucid/services/db'
import Student from '#models/student'
import FileMetadata from '#models/file_metadatum'
import Document from '#models/document'
import Assignment from '#models/assignment'
import Accommodation from '#models/accommodation'
import LogService from '#services/log_service'
import { signImageUrl } from '#services/image_service'
import { uploadImage } from '#services/b2_services'
import Notification from '#models/notification'

export default class Form5RenewalsController {
  // ─── POST /me/form5-renewal — student uploads new Form 5 ────────────────
  async uploadRenewal({ auth, request, response }: HttpContext) {
    const user = auth.user!
    const student = await Student.query().where('userId', user.id).first()
    if (!student) {
      return response.forbidden({ message: 'Only students can renew Form 5.' })
    }

    const file = request.file('form5', {
      size: '16mb',
      extnames: ['jpg', 'jpeg', 'png', 'pdf'],
    })

    if (!file) return response.badRequest({ message: 'No file uploaded.' })
    if (!file.isValid) {
      return response.badRequest({ message: file.errors[0]?.message ?? 'Invalid file.' })
    }

    const filePath = await uploadImage(file, `form5/${student.studentNumber}`, file.clientName ?? undefined)

    const meta = await FileMetadata.create({
      fileName: file.clientName ?? `form5_${Date.now()}`,
      filePath,
      fileType: 'document',
    })

    await Document.create({ userId: user.id, fileId: meta.id })

    student.enrollmentProofFileId = meta.id
    student.form5Renewal = false
    student.form5RenewalSubmittedAt = DateTime.now()
    await student.save()

    try {
      await LogService.record(
        user.id,
        'account',
        user.id,
        'FORM5_RENEWAL_SUBMITTED',
        `Student ${student.studentNumber} submitted Form 5 renewal`
      )
    } catch (e) {
      console.error('Failed to log FORM5_RENEWAL_SUBMITTED:', e)
    }

    const url = await signImageUrl(filePath)
    return response.ok({
      message: 'Form 5 submitted for verification.',
      enrollmentProof: {
        id: meta.id,
        fileName: meta.fileName,
        fileType: meta.fileType,
        url,
      },
      form5Renewal: student.form5Renewal,
      form5RenewalSubmittedAt: student.form5RenewalSubmittedAt,
    })
  }

  // ─── GET /admin/form5-renewals — pending renewals queue ─────────────────
  async indexAdmin({ response }: HttpContext) {
    const students = await Student.query()
      .where('form5Renewal', false)
      .whereNotNull('form5RenewalSubmittedAt')
      .preload('user')
      .preload('enrollmentProof')
      .preload('assignments', (q) =>
        q.whereNull('actualMoveOut').preload('room', (r) => r.preload('accommodation'))
      )
      .orderBy('form5RenewalSubmittedAt', 'asc')

    const result = []
    for (const s of students) {
      const activeAssignment = s.assignments?.[0]
      result.push({
        studentNumber: s.studentNumber,
        userId: s.userId,
        college: s.college,
        degreeProgram: s.degreeProgram,
        yearLevel: s.yearLevel,
        form5Renewal: s.form5Renewal,
        form5RenewalSubmittedAt: s.form5RenewalSubmittedAt,
        user: s.user
          ? {
              id: s.user.id,
              fname: s.user.fname,
              lname: s.user.lname,
              email: s.user.email,
            }
          : null,
        accommodation: activeAssignment?.room?.accommodation
          ? {
              id: activeAssignment.room.accommodation.id,
              name: activeAssignment.room.accommodation.accommodationName,
              roomNumber: activeAssignment.room.roomNumber,
            }
          : null,
        enrollmentProof: s.enrollmentProof
          ? {
              id: s.enrollmentProof.id,
              fileName: s.enrollmentProof.fileName,
              fileType: s.enrollmentProof.fileType,
              url: await signImageUrl(s.enrollmentProof.filePath),
            }
          : null,
      })
    }

    return response.ok(result)
  }

  // ─── PATCH /admin/form5-renewals/:studentNumber/verify ──────────────────
  async verify({ auth, params, response }: HttpContext) {
    const student = await Student.findOrFail(params.studentNumber)

    student.form5Renewal = true
    await student.save()

    try {
      await LogService.record(
        auth.user?.id ?? null,
        'account',
        student.userId,
        'FORM5_RENEWAL_APPROVED',
        `Admin ${auth.user?.id ?? 'system'} approved Form 5 renewal for student ${student.studentNumber}`
      )
    } catch (e) {
      console.error('Failed to log FORM5_RENEWAL_APPROVED:', e)
    }

    try {
      await Notification.create({
        userId: student.userId,
        notificationType: 'system',
        notificationContent: 'Your Form 5 renewal has been verified.',
        readStatus: 'unread',
      })
    } catch (e) {
      console.error('Failed to notify student on Form 5 approval:', e)
    }

    return response.ok({ message: 'Form 5 renewal verified.', studentNumber: student.studentNumber })
  }

  // ─── PATCH /admin/form5-renewals/:studentNumber/reject ──────────────────
  async reject({ auth, request, params, response }: HttpContext) {
    const student = await Student.findOrFail(params.studentNumber)
    const remarks = (request.input('remarks') ?? '').toString().trim()
    if (!remarks) {
      return response.badRequest({ message: 'Rejection remarks are required.' })
    }

    student.form5Renewal = false
    student.form5RenewalSubmittedAt = null
    await student.save()

    try {
      await LogService.record(
        auth.user?.id ?? null,
        'account',
        student.userId,
        'FORM5_RENEWAL_REJECTED',
        `Admin ${auth.user?.id ?? 'system'} rejected Form 5 renewal for student ${student.studentNumber}: ${remarks}`
      )
    } catch (e) {
      console.error('Failed to log FORM5_RENEWAL_REJECTED:', e)
    }

    try {
      await Notification.create({
        userId: student.userId,
        notificationType: 'system',
        notificationContent: `Your Form 5 renewal was rejected: ${remarks}. Please upload a new copy.`,
        readStatus: 'unread',
      })
    } catch (e) {
      console.error('Failed to notify student on Form 5 rejection:', e)
    }

    return response.ok({ message: 'Form 5 renewal rejected.', studentNumber: student.studentNumber })
  }

  // ─── POST /admin/form5-renewals/start-cycle — reset all assigned students ─
  async startCycle({ auth, response }: HttpContext) {
    const activeStudentNumbers = await Assignment.query()
      .whereNull('actualMoveOut')
      .where('confirmationStatus', 'active')
      .distinct('student_number')
      .select('student_number')

    const studentNumbers = activeStudentNumbers.map((a: any) => a.studentNumber)

    if (studentNumbers.length === 0) {
      return response.ok({ message: 'No active students to reset.', count: 0 })
    }

    await db
      .from('students')
      .whereIn('student_number', studentNumbers)
      .update({
        form5_renewal: false,
        form5_renewal_submitted_at: null,
      })

    try {
      await LogService.record(
        auth.user?.id ?? null,
        'account',
        auth.user?.id ?? 0,
        'FORM5_RENEWAL_CYCLE_STARTED',
        `Admin ${auth.user?.id ?? 'system'} started new Form 5 renewal cycle for ${studentNumbers.length} active students`
      )
    } catch (e) {
      console.error('Failed to log FORM5_RENEWAL_CYCLE_STARTED:', e)
    }

    for (const sn of studentNumbers) {
      try {
        const s = await Student.find(sn)
        if (s) {
          await Notification.create({
            userId: s.userId,
            notificationType: 'system',
            notificationContent: 'A new semester has started. Please upload your renewed Form 5 from your profile page.',
            readStatus: 'unread',
          })
        }
      } catch (e) {
        console.error('Failed to notify student about renewal cycle:', e)
      }
    }

    return response.ok({
      message: 'New Form 5 renewal cycle started.',
      count: studentNumbers.length,
    })
  }

  // ─── GET /landlord/accommodations/:id/form5-renewals ────────────────────
  async indexForLandlord({ auth, params, response }: HttpContext) {
    const accommodationId = Number(params.id)
    const accommodation = await Accommodation.find(accommodationId)
    if (!accommodation) return response.notFound({ message: 'Accommodation not found.' })
    if (accommodation.landlordId !== auth.user!.id) {
      return response.forbidden({ message: 'You do not own this accommodation.' })
    }

    const assignments = await Assignment.query()
      .whereNull('actualMoveOut')
      .where('confirmationStatus', 'active')
      .whereHas('room', (q) => q.where('accommodationId', accommodationId))
      .preload('student', (s) => s.preload('user'))

    const roster = assignments.map((a) => {
      const s = a.student
      const u = s?.user
      return {
        studentNumber: a.studentNumber,
        name: u ? `${u.fname} ${u.lname}` : s?.studentNumber ?? '',
        form5Renewal: !!s?.form5Renewal,
        form5RenewalSubmittedAt: s?.form5RenewalSubmittedAt ?? null,
      }
    })

    const total = roster.length
    const verified = roster.filter((r) => r.form5Renewal).length
    const submittedPending = roster.filter(
      (r) => !r.form5Renewal && r.form5RenewalSubmittedAt
    ).length
    const notSubmitted = roster.filter(
      (r) => !r.form5Renewal && !r.form5RenewalSubmittedAt
    ).length

    return response.ok({
      total,
      verified,
      submittedPending,
      notSubmitted,
      percentVerified: total > 0 ? Math.round((verified / total) * 100) : 0,
      roster,
    })
  }
}
