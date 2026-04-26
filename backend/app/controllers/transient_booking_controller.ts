import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import TransientBooking from '#models/transient_booking'
import Room from '#models/room'
import Student from '#models/student'
import FileMetadata from '#models/file_metadatum'
import { uploadImage } from '#services/b2_services'
import NotificationService from '#services/notification_service'
import { inject } from '@adonisjs/core'

@inject()
export default class TransientBookingsController {
  constructor(protected notificationService: NotificationService) {}

  // ─── STUDENT: Create a new transient booking ───
  async store({ auth, request, response, serialize }: HttpContext) {
    const user = auth.user!
    const student = await Student.findByOrFail('userId', user.id)
    const { roomId, checkInDate, checkOutDate } = request.body()

    if (!roomId || !checkInDate || !checkOutDate) {
      return response.badRequest({ message: 'roomId, checkInDate, checkOutDate required' })
    }

    const room = await Room.query().where('id', roomId).firstOrFail()
    if (room.roomStayType !== 'transient') {
      return response.badRequest({ message: 'Room not for transient booking' })
    }

    const paymentDeadline = DateTime.now().plus({ hours: 3 })

    const booking = await TransientBooking.create({
      roomId,
      studentNumber: student.studentNumber,
      checkInDate,
      checkOutDate,
      paymentDeadline,
      status: 'pending_payment',
    })

    return serialize(booking)
  }

  // ─── STUDENT: Upload payment proof ───
  async uploadProof({ auth, params, request, response, serialize }: HttpContext) {
    const user = auth.user!
    const student = await Student.findByOrFail('userId', user.id)

    const booking = await TransientBooking.query()
      .where('id', params.id)
      .where('student_number', student.studentNumber)
      .firstOrFail()

    if (booking.status !== 'pending_payment' || DateTime.now() > booking.paymentDeadline) {
      return response.badRequest({ message: 'Payment deadline passed or incorrect state' })
    }

    const file = request.file('receipt', { size: '5mb', extnames: ['jpg', 'png', 'jpeg', 'pdf'] })
    if (!file) return response.badRequest({ message: 'No receipt file' })

    await file.moveToDisk('./tmp')
    const fileUrl = await uploadImage(file, 'transient_payments')
    const fileMeta = await FileMetadata.create({
      fileName: file.clientName ?? 'receipt.jpg',
      filePath: fileUrl,
      fileType: 'image',
    })

    booking.proofFileId = fileMeta.id
    booking.status = 'pending_verification'
    await booking.save()

    // Load relationships to notify landlord
    await booking.load('room', (q) => q.preload('accommodation', (a) => a.preload('landlord', (l) => l.preload('user'))))
    const landlord = booking.room.accommodation?.landlord
    if (landlord?.user) {
      await this.notificationService.sendTransientPaymentPending(
        landlord.user,
        booking.room.roomNumber,
        student.studentNumber,
        booking.checkInDate,
        booking.checkOutDate
      )
    }

    return serialize(booking)
  }

  // ─── LANDLORD: Verify / reject booking ───
  async verify({ auth, params, request, response, serialize }: HttpContext) {
    const user = auth.user!
    const { action } = request.body()   // 'approve' or 'reject'

    const booking = await TransientBooking.query()
      .where('id', params.id)
      .preload('room', (q) => q.preload('accommodation'))
      .firstOrFail()

    if (booking.room.accommodation.landlordId !== user.id) {
      return response.forbidden({ message: 'Not your accommodation' })
    }
    if (booking.status !== 'pending_verification') {
      return response.badRequest({ message: 'Booking not in verification state' })
    }

    booking.status = action === 'approve' ? 'confirmed' : 'rejected'
    await booking.save()

    return serialize(booking)
  }

  // ─── STUDENT: View my transient bookings ───
  async myBookings({ auth, serialize }: HttpContext) {
    const user = auth.user!
    const student = await Student.findByOrFail('userId', user.id)

    const bookings = await TransientBooking.query()
      .where('student_number', student.studentNumber)
      .preload('room', (q) => q.preload('accommodation'))
      .orderBy('created_at', 'desc')
    return serialize(bookings)
  }
}