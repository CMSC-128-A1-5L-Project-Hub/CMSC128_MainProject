import type { HttpContext } from '@adonisjs/core/http'
import Accommodation from '#models/accommodation'
import AccommodationImage from '#models/accommodation_image'
import FileMetadata from '#models/file_metadatum'
import DistanceService from '#services/distance'
import db from '@adonisjs/lucid/services/db'
import { uploadImage, deleteImage } from '#services/b2_services'
import AccommodationService from '#services/accommodation_service'

export default class AccommodationController {
  private accommodationService = new AccommodationService()

  // ─── GET /accommodations ──────────────────────────────────────────────────
  // Public: list all accommodations with optional filters via query string
  async index({ request, serialize }: HttpContext) {
    // qs() automatically parses the tags[] array from the URL
    const filters = request.qs() 

    const catalog = await this.accommodationService.getFilteredCatalog(filters)
    
    return serialize({
      message: 'Catalog retrieved successfully',
      data: catalog
    })
  } 

  // ─── GET /accommodations/:id ──────────────────────────────────────────────
  // Public: single accommodation with full details
  async show({ params, serialize, response }: HttpContext) {
    const accommodation = await Accommodation.query()
      .where('accommodation_id', params.id)
      .preload('images', (q) => q.preload('file'))
      .preload('tags')
      .preload('manager', (q) => q.preload('user'))
      .preload('rooms')
      .preload('reviews')
      .first()

    if (!accommodation) {
      return response.notFound({
        status: 404,
        error: 'Not Found',
        message: 'Accommodation not found.',
      })
    }

    return serialize(accommodation.serialize())
  }

  // ─── POST /landlord/accommodations ───────────────────────────────────────
  // Landlord: create a new accommodation
  async store({ request, auth, response, serialize }: HttpContext) {
    const landlordId = auth.user!.id

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
      latitude,
      longitude,
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
      !business_permit_id ||
      latitude === undefined ||
      longitude === undefined
    ) {
      return response.badRequest({
        status: 400,
        error: 'Validation Error',
        message: 'All fields are required',
      })
    }

    // Calculate distances to UPLB using Mapbox Directions API
    const { walkingMinutes, drivingMinutes, cyclingMinutes } =
      await DistanceService.calculate(Number(latitude), Number(longitude))

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
          latitude: Number(latitude),
          longitude: Number(longitude),
          walkingDistance: walkingMinutes,
          drivingDistance: drivingMinutes,
          bikingDistance: cyclingMinutes,
        },
        { client: trx }
      )

      const images = request.files('images', {
        extnames: ['jpg', 'jpeg', 'png', 'webp'],
        size: '16mb',
      })

      for (const image of images) {
        if (!image.isValid || !image.tmpPath) continue

        const fileUrl = await uploadImage(image, `accommodations/${accommodation.id}`)

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
            accommodationId: accommodation.id,
            imageFileId: fileMeta.id,
          },
          { client: trx }
        )
      }

      await trx.commit()

      return serialize(accommodation.serialize())
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
  async update({ params, request, auth, response, serialize }: HttpContext) {
    const landlordId = auth.user!.id

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
      latitude,
      longitude,
    } = request.body()

    // If lat/lng changed, recalculate distances
    let distances = {}
    if (latitude && longitude) {
      const { walkingMinutes, drivingMinutes, cyclingMinutes } =
        await DistanceService.calculate(Number(latitude), Number(longitude))
      distances = {
        latitude: Number(latitude),
        longitude: Number(longitude),
        walkingDistance: walkingMinutes,
        drivingDistance: drivingMinutes,
        bikingDistance: cyclingMinutes,
      }
    }

    accommodation.merge({
      ...(accommodation_name && { accommodationName: accommodation_name }),
      ...(accommodation_location && { accommodationLocation: accommodation_location }),
      ...(accommodation_type && { accommodationType: accommodation_type }),
      ...(accommodation_capacity && { accommodationCapacity: accommodation_capacity }),
      ...(tenant_restriction && { tenantRestriction: tenant_restriction }),
      ...(application_start_date && { applicationStartDate: application_start_date }),
      ...(application_end_date && { applicationEndDate: application_end_date }),
      ...distances,
    })

    await accommodation.save()

    return serialize(accommodation.serialize())
  }

  // ─── POST /landlord/accommodations/:id/images ────────────────────────────
  // Landlord: upload images to an existing accommodation
  async uploadImages({ params, request, auth, response, serialize }: HttpContext) {
    const landlordId = auth.user!.id

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
    const uploaded: { file_id: number; url: string }[] = []

    try {
      for (const image of images) {
        if (!image.isValid || !image.tmpPath) continue

        const fileUrl = await uploadImage(image, `accommodations/${accommodation.id}`)

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
            accommodationId: accommodation.id,
            imageFileId: fileMeta.id,
          },
          { client: trx }
        )

        uploaded.push({ file_id: fileMeta.id, url: fileUrl })
      }

      await trx.commit()

      return serialize(uploaded)

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
  async deleteImage({ params, auth, response, serialize }: HttpContext) {
    const landlordId = auth.user!.id

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

      return serialize({message: 'Image deleted successfully' })
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
}