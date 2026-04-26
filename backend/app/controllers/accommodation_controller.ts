import type { HttpContext } from '@adonisjs/core/http'
import Accommodation from '#models/accommodation'
import AccommodationImage from '#models/accommodation_image'
import FileMetadata from '#models/file_metadatum'
import DistanceService from '#services/distance'
import db from '@adonisjs/lucid/services/db'
import { uploadImage, deleteImage } from '#services/b2_services'
import { AccommodationService } from '#services/accommodation_service'
import Landlord from '#models/landlord'
import drive from '@adonisjs/drive/services/main'
import ZipExportService from '#services/zip_export_service'
import type { ZipEntry } from '#services/zip_export_service'

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
      .where('id', params.id)
      .preload('images', (q) => q.preload('file'))
      .preload('tags')
      .preload('manager', (q) => q.preload('user'))
      .preload('rooms')
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
  const startTime = Date.now()
  console.log('=== STORE START ===')
  const landlordId = auth.user!.id
  console.log('landlordId:', landlordId)

  const landlord = await Landlord.query()
  .where('user_id', landlordId)
  .first()

  if (!landlord) {
    return response.forbidden({
      status: 403,
      error: 'Forbidden',
      message: 'You are not registered as a landlord.',
    })
  }

  const {
    accommodation_name,
    accommodation_location,
    accommodation_type,
    accommodation_capacity,
    tenant_restriction,
    latitude,
    longitude,
    primary_image_index,
  } = request.body()

  console.log('body:', { accommodation_name, accommodation_location, accommodation_type, accommodation_capacity, tenant_restriction, latitude, longitude })

  if (
    !accommodation_name ||
    !accommodation_location ||
    !accommodation_type ||
    !accommodation_capacity ||
    !tenant_restriction ||
    latitude === undefined ||
    longitude === undefined
  ) {
    return response.badRequest({
      status: 400,
      error: 'Validation Error',
      message: 'All fields are required',
    })
  }

  const capacity = Number(accommodation_capacity)
    if (isNaN(capacity) || capacity < 1 || capacity > 10000) {
      return response.badRequest({
        status: 400,
        error: 'Validation Error',
        message: 'Accommodation capacity must be between 1 and 10,000',
      })
}

  console.log(`[${Date.now() - startTime}ms] Validation passed`)

  const businessPermitFile = request.file('business_permit', {
    extnames: ['pdf', 'jpg', 'jpeg', 'png'],
    size: '5mb',
  })

  console.log('businessPermitFile:', businessPermitFile?.clientName)

  if (!businessPermitFile) {
    return response.badRequest({
      status: 400,
      error: 'Validation Error',
      message: 'Business permit is required',
    })
  }

  const images = request.files('images', {
    extnames: ['jpg', 'jpeg', 'png', 'webp'],
    size: '16mb',
  })

  const MAX_IMAGES = 10


  console.log('images count:', images?.length)

  if (!images || images.length === 0) {
    return response.badRequest({
      status: 400,
      error: 'Validation Error',
      message: 'At least one image is required',
    })
  }

  if (images.length > MAX_IMAGES) {
    return response.badRequest({
      status: 400,
      error: 'Validation Error',
      message: `You can only upload a maximum of ${MAX_IMAGES} images.`,
    })
}

  const validImages = images.filter((img) => img.isValid && img.tmpPath)

  if (validImages.length === 0) {
    return response.badRequest({
      status: 400,
      error: 'Validation Error',
      message: 'No valid images provided',
    })
  }

  const primaryIndex = Number(primary_image_index ?? 0)

  if (isNaN(primaryIndex) || primaryIndex < 0 || primaryIndex >= validImages.length) {
    return response.badRequest({
      status: 400,
      error: 'Validation Error',
      message: `primary_image_index must be between 0 and ${validImages.length - 1}`,
    })
  }

  console.log(`[${Date.now() - startTime}ms] Starting distance calculation`)
  const { walkingMinutes, drivingMinutes, cyclingMinutes } =
    await DistanceService.calculate(Number(latitude), Number(longitude))
  console.log(`[${Date.now() - startTime}ms] Distance calculated:`, { walkingMinutes, drivingMinutes, cyclingMinutes })

  const trx = await db.transaction()

  try {
    console.log(`[${Date.now() - startTime}ms] Starting permit upload`)
    const permitUrl = await uploadImage(businessPermitFile, 'business_permits')
    console.log(`[${Date.now() - startTime}ms] Permit uploaded:`, permitUrl)

    const permitMeta = await FileMetadata.create(
      {
        fileName: businessPermitFile.clientName ?? 'permit.pdf',
        filePath: permitUrl,
        fileType: 'document',
      },
      { client: trx }
    )
    console.log(`[${Date.now() - startTime}ms] Permit meta created, id:`, permitMeta.id)

    const accommodation = await Accommodation.create(
      {
        landlordId,
        managerId: null,
        businessPermitId: permitMeta.id,
        primaryImageIndex: primaryIndex,
        accommodationName: accommodation_name,
        accommodationLocation: accommodation_location,
        accommodationType: accommodation_type,
        accommodationCapacity: accommodation_capacity,
        tenantRestriction: tenant_restriction,
        applicationStartDate: null,
        applicationEndDate: null,
        latitude: Number(latitude),
        longitude: Number(longitude),
        walkingDistance: walkingMinutes,
        drivingDistance: drivingMinutes,
        bikingDistance: cyclingMinutes,
      },
      { client: trx }
    )
    console.log(`[${Date.now() - startTime}ms] Accommodation created, id:`, accommodation.id)

    console.log(`[${Date.now() - startTime}ms] Starting parallel image uploads (${validImages.length} images)`)

    const fileUrls = await Promise.all(
      validImages.map((img) => uploadImage(img, `accommodations/${accommodation.id}`))
    )
    console.log(`[${Date.now() - startTime}ms] All images uploaded to B2`)

    for (let i = 0; i < validImages.length; i++) {
      const fileMeta = await FileMetadata.create(
        {
          fileName: validImages[i].clientName ?? 'image.jpg',
          filePath: fileUrls[i],
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
    console.log(`[${Date.now() - startTime}ms] Image metadata saved to DB`)

    await trx.commit()
    console.log(`[${Date.now() - startTime}ms] === TOTAL TIME: ${Date.now() - startTime}ms ===`)

    return serialize(accommodation.serialize())
  } catch (error) {
    await trx.rollback()
    const err = error as Error
    console.error('=== ERROR ===', err.message, err.stack)
    return response.internalServerError({
      status: 500,
      error: 'Internal Server Error',
      message: err.message,
    })
  }
}

  // ─── PUT /landlord/accommodations/:id ────────────────────────────────────
  // Landlord: update accommodation details
  async update({ params, request, auth, response, serialize }: HttpContext) {
    const landlordId = auth.user!.id

    const accommodation = await Accommodation.query()
      .where('id', params.id)
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
      .where('id', params.id)
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
  async landlordIndex({ auth, serialize }: HttpContext) {
    const landlordId = auth.user!.id

    const accommodations = await Accommodation.query()
      .where('landlord_id', landlordId)
      .preload('images', (q) => q.preload('file'))
      .preload('tags')

    const data = await Promise.all(
      accommodations.map(async (a) => {
        const serialized = a.serialize()
        const primaryImage = a.images[a.primaryImageIndex]
        if (primaryImage?.file?.filePath) {
          const filePath = primaryImage.file.filePath
          const key = decodeURIComponent(
            filePath.startsWith('https://')
              ? new URL(filePath).pathname.replace(/^\/[^/]+\//, '')
              : filePath
          )
          serialized.primaryImageUrl = await drive.use('s3').getSignedUrl(key, {
            expiresIn: '5 hours'
          })
        }
        return serialized
      })
    )

    return serialize({
      message: 'Accommodations retrieved successfully',
      data,
    })
  }

  // ─── GET /api/v1/accommodations/:id/export-documents ─────────────────────
  // Role: Manager | Landlord
  // Fetches all Backblaze file URLs for the accommodation (business permit +
  // images) and streams them as a single .zip download to the client.
  async exportDocuments({ params, auth, response }: HttpContext) {
    const userId = auth.user!.id

    // Verify the caller is the landlord or assigned manager of this accommodation
    const accommodation = await Accommodation.query()
      .where('id', params.id)
      .where((q) => {
        q.where('landlord_id', userId).orWhere('manager_id', userId)
      })
      .preload('businessPermit')
      .preload('images', (q) => q.preload('file'))
      .first()

    if (!accommodation) {
      return response.notFound({
        status: 404,
        error: 'Not Found',
        message: 'Accommodation not found or you do not have access to it.',
      })
    }

    const entries: ZipEntry[] = []

    // Business permit (file_metadata via business_permit_id)
    if (accommodation.businessPermit) {
      entries.push({
        url: accommodation.businessPermit.filePath,
        archiveName: `business-permit/${accommodation.businessPermit.fileName}`,
      })
    }

    // Accommodation images (accommodation_images → file_metadata)
    for (const image of accommodation.images) {
      if (!image.file) continue
      entries.push({
        url: image.file.filePath,
        archiveName: `images/${image.file.fileName}`,
      })
    }

    if (entries.length === 0) {
      return response.noContent()
    }

    const safeName = accommodation.accommodationName.replace(/[^a-z0-9_\-]/gi, '_')
    const zipService = new ZipExportService()

    try {
      await zipService.streamZip(entries, `${safeName}-documents.zip`, response)
    } catch (err) {
      console.error('[exportDocuments] Zip streaming error:', err)
    }
  }
}
