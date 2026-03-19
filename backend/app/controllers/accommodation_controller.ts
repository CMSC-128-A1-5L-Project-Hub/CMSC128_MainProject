import type { HttpContext } from '@adonisjs/core/http'
import Accommodation from '#models/accommodation'
import AccommodationImage from '#models/accommodation_image'
import FileMetadata from '#models/file_metadata'
import Room from '#models/room'
import db from '@adonisjs/lucid/services/db'
import { uploadImage, deleteImage } from '#services/b2_services'

export default class AccommodationController {
  // ─── GET /accommodations ──────────────────────────────────────────────────
  // Public: list all accommodations with images and tags
  async index({ response }: HttpContext) {
    const accommodations = await Accommodation.query()
      .preload('images', (q) => q.preload('file'))
      .preload('tags')
      .preload('manager', (q) => q.preload('user'))

    return response.ok({ status: 200, data: accommodations })
  }

  // ─── GET /accommodations/:id ──────────────────────────────────────────────
  // Public: single accommodation with full details
  async show({ params, response }: HttpContext) {
    const accommodation = await Accommodation.query()
      .where('accommodation_id', params.id)
      .preload('images', (q) => q.preload('file'))
      .preload('tags')
      .preload('manager', (q) => q.preload('user'))
      .preload('rooms', (q) => {
        q.preload('transient')
        q.preload('nonTransient')
      })
      .preload('reviews')
      .first()

    if (!accommodation) {
      return response.notFound({
        status: 404,
        error: 'Not Found',
        message: 'Accommodation not found.',
      })
    }

    return response.ok({ status: 200, data: accommodation })
  }

  // ─── POST /landlord/accommodations ───────────────────────────────────────
  // Landlord: create a new accommodation
  async store({ request, session, response }: HttpContext) {
    const landlordId = session.get('userId')

    const {
      accommodation_name,
      accommodation_location,
      accommodation_type,
      accommodation_capacity,
      tenant_restriction,
      application_start_date,
      application_end_date,
      manager_id,
      business_permit_id,
    } = request.body()

    if (
      !accommodation_name ||
      !accommodation_location ||
      !accommodation_type ||
      !accommodation_capacity ||
      !tenant_restriction ||
      !application_start_date ||
      !application_end_date ||
      !manager_id ||
      !business_permit_id
    ) {
      return response.badRequest({
        status: 400,
        error: 'Validation Error',
        message:
          'All fields are required: accommodation_name, accommodation_location, accommodation_type, accommodation_capacity, tenant_restriction, application_start_date, application_end_date, manager_id, business_permit_id.',
      })
    }

    const trx = await db.transaction()

    try {
      const accommodation = await Accommodation.create(
        {
          landlordId,
          managerId: manager_id,
          businessPermitId: business_permit_id,
          accommodationName: accommodation_name,
          accommodationLocation: accommodation_location,
          accommodationType: accommodation_type,
          accommodationCapacity: accommodation_capacity,
          tenantRestriction: tenant_restriction,
          applicationStartDate: application_start_date,
          applicationEndDate: application_end_date,
        },
        { client: trx }
      )

      // Optional: upload images alongside creation
      const images = request.files('images', {
        extnames: ['jpg', 'jpeg', 'png', 'webp'],
        size: '16mb',
      })

      for (const image of images) {
        if (!image.isValid || !image.tmpPath) continue

        const fileUrl = await uploadImage(image, `accommodations/${accommodation.accommodationId}`)

        const fileMeta = await FileMetadata.create(
          {
            fileName: image.clientName ?? 'image.jpg',
            filePath: fileUrl,
            fileType: 'image',
          },
          { client: trx }
        )

        await AccommodationImage.create(
          {
            accommodationId: accommodation.accommodationId,
            imageFileId: fileMeta.fileId,
          },
          { client: trx }
        )
      }

      await trx.commit()

      return response.created({
        status: 201,
        message: 'Accommodation created successfully.',
        data: { accommodation_id: accommodation.accommodationId },
      })
    } catch (error) {
      await trx.rollback()
      console.error('Accommodation creation error:', error)
      return response.internalServerError({
        status: 500,
        error: 'Internal Server Error',
        message: 'Failed to create accommodation.',
      })
    }
  }

  // ─── PUT /landlord/accommodations/:id ────────────────────────────────────
  // Landlord: update accommodation details
  async update({ params, request, session, response }: HttpContext) {
    const landlordId = session.get('userId')

    const accommodation = await Accommodation.query()
      .where('accommodation_id', params.id)
      .where('landlord_id', landlordId)
      .first()

    if (!accommodation) {
      return response.notFound({
        status: 404,
        error: 'Not Found',
        message: 'Accommodation not found or does not belong to you.',
      })
    }

    const {
      accommodation_name,
      accommodation_location,
      accommodation_type,
      accommodation_capacity,
      tenant_restriction,
      application_start_date,
      application_end_date,
    } = request.body()

    accommodation.merge({
      ...(accommodation_name && { accommodationName: accommodation_name }),
      ...(accommodation_location && { accommodationLocation: accommodation_location }),
      ...(accommodation_type && { accommodationType: accommodation_type }),
      ...(accommodation_capacity && { accommodationCapacity: accommodation_capacity }),
      ...(tenant_restriction && { tenantRestriction: tenant_restriction }),
      ...(application_start_date && { applicationStartDate: application_start_date }),
      ...(application_end_date && { applicationEndDate: application_end_date }),
    })

    await accommodation.save()

    return response.ok({
      status: 200,
      message: 'Accommodation updated successfully.',
      data: accommodation,
    })
  }

  // ─── POST /landlord/accommodations/:id/images ────────────────────────────
  // Landlord: upload images to an existing accommodation
  async uploadImages({ params, request, session, response }: HttpContext) {
    const landlordId = session.get('userId')

    const accommodation = await Accommodation.query()
      .where('accommodation_id', params.id)
      .where('landlord_id', landlordId)
      .first()

    if (!accommodation) {
      return response.notFound({
        status: 404,
        error: 'Not Found',
        message: 'Accommodation not found or does not belong to you.',
      })
    }

    const images = request.files('images', {
      extnames: ['jpg', 'jpeg', 'png', 'webp'],
      size: '16mb',
    })

    if (!images || images.length === 0) {
      return response.badRequest({
        status: 400,
        error: 'Validation Error',
        message: 'At least one image is required.',
      })
    }

    const trx = await db.transaction()
    const uploaded: any[] = []

    try {
      for (const image of images) {
        if (!image.isValid || !image.tmpPath) continue

        const fileUrl = await uploadImage(image, `accommodations/${accommodation.accommodationId}`)

        const fileMeta = await FileMetadata.create(
          {
            fileName: image.clientName ?? 'image.jpg',
            filePath: fileUrl,
            fileType: 'image',
          },
          { client: trx }
        )

        await AccommodationImage.create(
          {
            accommodationId: accommodation.accommodationId,
            imageFileId: fileMeta.fileId,
          },
          { client: trx }
        )

        uploaded.push({ file_id: fileMeta.fileId, url: fileUrl })
      }

      await trx.commit()

      return response.created({
        status: 201,
        message: `${uploaded.length} image(s) uploaded successfully.`,
        data: uploaded,
      })
    } catch (error) {
      await trx.rollback()
      console.error('Image upload error:', error)
      return response.internalServerError({
        status: 500,
        error: 'Internal Server Error',
        message: 'Failed to upload images.',
      })
    }
  }

  // ─── DELETE /landlord/accommodations/:id/images/:imageId ─────────────────
  // Landlord: delete a specific image
  async deleteImage({ params, session, response }: HttpContext) {
    const landlordId = session.get('userId')

    const image = await AccommodationImage.query()
      .where('images_id', params.imageId)
      .preload('accommodation')
      .preload('file')
      .first()

    if (!image || image.accommodation.landlordId !== landlordId) {
      return response.notFound({
        status: 404,
        error: 'Not Found',
        message: 'Image not found or does not belong to you.',
      })
    }

    const trx = await db.transaction()

    try {
      await deleteImage(image.file.filePath)
      await image.useTransaction(trx).delete()
      await image.file.useTransaction(trx).delete()

      await trx.commit()

      return response.ok({ status: 200, message: 'Image deleted successfully.' })
    } catch (error) {
      await trx.rollback()
      console.error('Image delete error:', error)
      return response.internalServerError({
        status: 500,
        error: 'Internal Server Error',
        message: 'Failed to delete image.',
      })
    }
  }

  // ─── GET /accommodations/:id/rooms ───────────────────────────────────────
  // Public: list all rooms of an accommodation
  async getRooms({ params, response }: HttpContext) {
    const accommodation = await Accommodation.find(params.id)

    if (!accommodation) {
      return response.notFound({
        status: 404,
        error: 'Not Found',
        message: 'Accommodation not found.',
      })
    }

    const rooms = await Room.query()
      .where('accommodation_id', params.id)
      .preload('transient')
      .preload('nonTransient')

    return response.ok({ status: 200, data: rooms })
  }

  // ─── POST /landlord/accommodations/:id/rooms ─────────────────────────────
  // Landlord: add a room to an accommodation
  async addRoom({ params, request, session, response }: HttpContext) {
    const landlordId = session.get('userId')

    const accommodation = await Accommodation.query()
      .where('accommodation_id', params.id)
      .where('landlord_id', landlordId)
      .first()

    if (!accommodation) {
      return response.notFound({
        status: 404,
        error: 'Not Found',
        message: 'Accommodation not found or does not belong to you.',
      })
    }

    const {
      room_number,
      room_type,
      room_capacity,
      room_building,
      room_rent,
      tenant_restriction,
      stay_type, // 'transient' or 'non_transient'
    } = request.body()

    if (
      !room_number ||
      !room_type ||
      !room_capacity ||
      !room_building ||
      !room_rent ||
      !tenant_restriction ||
      !stay_type
    ) {
      return response.badRequest({
        status: 400,
        error: 'Validation Error',
        message:
          'Required: room_number, room_type, room_capacity, room_building, room_rent, tenant_restriction, stay_type.',
      })
    }

    const trx = await db.transaction()

    try {
      const room = await Room.create(
        {
          accommodationId: accommodation.accommodationId,
          roomNumber: room_number,
          roomType: room_type,
          roomCapacity: room_capacity,
          roomCurrentOccupancy: 0,
          roomBuilding: room_building,
          roomRent: room_rent,
          tenantRestriction: tenant_restriction,
          roomAvailability: 'available',
        },
        { client: trx }
      )

      // Create transient or non_transient sub-record based on stay_type
      if (stay_type === 'transient') {
        const { default: Transient } = await import('#models/transient')
        await Transient.create({ roomId: room.roomId }, { client: trx })
      } else if (stay_type === 'non_transient') {
        const { default: NonTransient } = await import('#models/non_transient')
        await NonTransient.create({ roomId: room.roomId }, { client: trx })
      }

      await trx.commit()

      return response.created({
        status: 201,
        message: 'Room added successfully.',
        data: { room_id: room.roomId },
      })
    } catch (error) {
      await trx.rollback()
      console.error('Add room error:', error)
      return response.internalServerError({
        status: 500,
        error: 'Internal Server Error',
        message: 'Failed to add room.',
      })
    }
  }
}
