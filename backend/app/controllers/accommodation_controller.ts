import type { HttpContext } from '@adonisjs/core/http'
import Accommodation from '#models/accommodation'
import AccommodationTag from '#models/accommodation_tag'
import Student from '#models/student'
import BookMark from '#models/bookmark'
import AccommodationImage from '#models/accommodation_image'
import FileMetadata from '#models/file_metadatum'
import DistanceService from '#services/distance'
import db from '@adonisjs/lucid/services/db'
import { uploadImage, deleteImage } from '#services/b2_services'
import { AccommodationService } from '#services/accommodation_service'
import Landlord from '#models/landlord'
import { withPrimaryImageUrl, signImageUrl, withAllImageUrls } from '#services/image_service'
import ZipExportService from '#services/zip_export_service'
import type { ZipEntry } from '#services/zip_export_service'
import Room from '#models/room'
import DocumentRequirement from '#models/document_requirement'
import LogService from '#services/log_service'

export default class AccommodationController {
  private accommodationService = new AccommodationService()

  // ─── GET /accommodations ──────────────────────────────────────────────────
  // Public: list all accommodations with optional filters via query string
  async index({ request, response }: HttpContext) {
    // qs() automatically parses the tags[] array from the URL
    const filters = request.qs()

    const catalog = await this.accommodationService.getFilteredCatalog(filters)

    return response.ok(catalog)
  }

  // ─── GET /accommodations/:id ──────────────────────────────────────────────
  // Public: single accommodation with full details
  async show({ params, response }: HttpContext) {
    const accommodation = await Accommodation.query()
      .where('id', params.id)
      .where('status', 'verified')
      .preload('images', (q) => q.preload('file'))
      .preload('tags')
      .preload('manager', (q) => q.preload('user', (q2) => q2.preload('profilePicture').preload('phoneNumbers')))
      .preload('rooms', (q) => {
        q.preload('tags')  // Preload room inclusions
        q.orderBy('roomRent', 'asc')  // Cheapest first
      })
      .preload('reviews', (q) => {
        q.preload('student', (studentQuery) => {
          studentQuery.preload('user')
        })
      })
      .preload('bookmarks')
      .first()

    if (!accommodation) {
      return response.notFound({
        status: 404,
        error: 'Not Found',
        message: 'Accommodation not found.',
      })
    }

    // Attach pricing summary for the detail view
    const serialized = accommodation.serialize() as any

    // Group rooms by type and calculate price ranges
    const roomsByType: Record<string, Room[]> = {}
    const roomTypePricing: Record<string, any> = {}
    const allInclusions = new Set<string>()

    for (const room of accommodation.rooms) {
      // Group rooms by type
      if (!roomsByType[room.roomType]) {
        roomsByType[room.roomType] = []
      }
      roomsByType[room.roomType].push(room)

      // Collect all inclusions across all rooms
      room.tags?.forEach(tag => allInclusions.add(tag.tagDetail))
    }

    // Calculate price ranges per room type
    for (const [type, rooms] of Object.entries(roomsByType)) {
      const prices = rooms.map(r => r.roomRent)
      const inclusions = new Set<string>()
      rooms.forEach(room => {
        room.tags?.forEach(tag => inclusions.add(tag.tagDetail))
      })

      roomTypePricing[type] = {
        roomCount: rooms.length,
        minPrice: Math.min(...prices),
        maxPrice: Math.max(...prices),
        inclusions: Array.from(inclusions)
      }
    }

    // Calculate overall starting price
    const allPrices = accommodation.rooms.map(r => r.roomRent)
    const overallStartingPrice = allPrices.length > 0 ? Math.min(...allPrices) : null

    // Attach pricing metadata
    serialized.pricing = {
      overallStartingPrice,
      roomTypes: roomTypePricing,
      allInclusions: Array.from(allInclusions)
    }

    // Attach signed image URLs
    if (accommodation.images?.length > 0) {
      const primary = accommodation.images[accommodation.primaryImageIndex]
      serialized.primaryImageUrl = await signImageUrl(primary?.file?.filePath)
    }
    await withAllImageUrls(serialized, accommodation)

    // Attach signed manager profile picture URL
    const managerUser = accommodation.manager?.user
    if (managerUser && serialized.manager?.user) {
      serialized.manager.user.pfpUrl = await signImageUrl(managerUser.profilePicture?.filePath)
    }

    return response.ok(serialized)
  }

  // ─── GET /accommodations/:id/rooms ─────────────────────────────────────────
  // Public: get rooms matching specific criteria for dynamic filtering
  async filterRooms({ params, request, response }: HttpContext) {
    const accommodation = await Accommodation.query()
      .where('id', params.id)
      .where('status', 'verified')
      .first()

    if (!accommodation) {
      return response.notFound({
        status: 404,
        error: 'Not Found',
        message: 'Accommodation not found.',
      })
    }

    const { roomType, inclusions } = request.qs()

    // Parse inclusions from query string
    let parsedInclusions: string[] = []
    if (inclusions) {
      if (typeof inclusions === 'string') {
        try {
          parsedInclusions = JSON.parse(inclusions)
        } catch {
          parsedInclusions = inclusions.split(',').map(t => t.trim())
        }
      } else if (Array.isArray(inclusions)) {
        parsedInclusions = inclusions
      }
    }

    // Query rooms with filters
    let roomQuery = Room.query()
      .where('accommodationId', accommodation.id)
      .where('roomAvailability', 'available')
      .preload('tags')
      .orderBy('roomRent', 'asc')

    if (roomType) {
      roomQuery.where('roomType', roomType)
    }

    let rooms = await roomQuery

    // Filter by inclusions (must have ALL requested inclusions)
    if (parsedInclusions.length > 0) {
      rooms = rooms.filter(room => {
        const roomInclusions = room.tags?.map(t => t.tagDetail) || []
        return parsedInclusions.every(inclusion => roomInclusions.includes(inclusion))
      })
    }

    // Calculate pricing summary
    const availableRoomTypes = [...new Set(rooms.map(r => r.roomType))]
    const prices = rooms.map(r => r.roomRent)
    const allAvailableInclusions = new Set<string>()
    rooms.forEach(room => {
      room.tags?.forEach(tag => allAvailableInclusions.add(tag.tagDetail))
    })

    return response.ok({
      rooms,
      summary: {
        totalRooms: rooms.length,
        minPrice: prices.length > 0 ? Math.min(...prices) : null,
        maxPrice: prices.length > 0 ? Math.max(...prices) : null,
        roomTypes: availableRoomTypes,
        availableInclusions: Array.from(allAvailableInclusions),
        requestedInclusions: parsedInclusions,
        matchesAllFilters: rooms.length > 0
      }
    })
  }


  // ─── PUT /accommodations/bookmark ────────────────────────────────────
  // update bookmark of accommodations
  async updateBookmark({ params, request, response }: HttpContext) {

    const accommodation = await Accommodation.query()
      .where('id', params.id)
      .first()

    if (!accommodation) {
      return response.notFound({
        status: 404,
        error: 'Not Found',
        message: 'Accommodation not found or does not belong to you.',
      })
    }

    const {
      studentNumber,
      favorite
    } = request.body()

    if (favorite) {
      await BookMark.create({
        studentNumber: studentNumber,
        accommodationId: accommodation.id,
      })

      await accommodation.load('bookmarks')
    }
    else {
      const bookmark = await BookMark.query()
        .where('accommodationId', params.id)
        .where('studentNumber', studentNumber)
        .first()

      if (bookmark) {
        await bookmark.delete()
      }
    }
    return response.ok(accommodation.serialize())

  }
  
// ─── POST /landlord/accommodations ───────────────────────────────────────
// Landlord: create a new accommodation
async store({ request, auth, response }: HttpContext) {
  const startTime = Date.now()
  console.log('=== STORE START ===')
  const landlordId = auth.user!.id

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
    accommodation_size,
    tenant_restriction,
    contract_months,
    latitude,
    longitude,
    primary_image_index,
    tags,
  } = request.body()

  // Basic field validation
  if (
    !accommodation_name ||
    !accommodation_location ||
    !accommodation_type ||
    !accommodation_capacity ||
    !tenant_restriction ||
    !contract_months ||
    latitude === undefined ||
    longitude === undefined
  ) {
    return response.badRequest({
      status: 400,
      error: 'Validation Error',
      message: 'All fields are required, including contract months',
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

  // Validate contract months
  const contractMonthsNum = Number(contract_months)
  if (isNaN(contractMonthsNum) || contractMonthsNum < 1 || contractMonthsNum > 60) {
    return response.badRequest({
      status: 400,
      error: 'Validation Error',
      message: 'Contract months must be between 1 and 60',
    })
  }

  // Optional validation for tags
  const tagList = Array.isArray(tags) ? tags.filter(t => typeof t === 'string' && t.trim().length > 0) : []

  const businessPermitFile = request.file('business_permit', {
    extnames: ['pdf', 'jpg', 'jpeg', 'png'],
    size: '5mb',
  })

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

  const { walkingMinutes, drivingMinutes, cyclingMinutes } =
    await DistanceService.calculate(Number(latitude), Number(longitude))

  const trx = await db.transaction()

  // Helper function to sanitize filename
  const sanitizeFilename = (filename: string): string => {
    const lastDotIndex = filename.lastIndexOf('.')
    const extension = lastDotIndex !== -1 ? filename.slice(lastDotIndex) : ''
    const nameWithoutExt = lastDotIndex !== -1 ? filename.slice(0, lastDotIndex) : filename
    
    const sanitizedName = nameWithoutExt
      .replace(/[^a-zA-Z0-9\-_]/g, '_')  // Replace special chars with underscore
      .replace(/_+/g, '_')               // Replace multiple underscores with single
      .replace(/^_+|_+$/g, '')          // Remove leading/trailing underscores
    
    const finalName = sanitizedName || `image_${Date.now()}`
    
    return `${finalName}${extension}`
  }

  try {
    // Upload business permit
    const permitUrl = await uploadImage(businessPermitFile, 'business_permits')
    const permitMeta = await FileMetadata.create(
      {
        fileName: businessPermitFile.clientName ?? 'permit.pdf',
        filePath: permitUrl,
        fileType: 'document',
      },
      { client: trx }
    )

    // Create accommodation WITH contract_months
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
        accommodationSize: accommodation_size,
        contractMonths: contractMonthsNum,
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

    // Save accommodation tags
    if (tagList.length > 0) {
      await AccommodationTag.createMany(
        tagList.map(tagDetail => ({
          accommodationId: accommodation.id,
          tagDetail,
        })),
        { client: trx }
      )
    }

    // Upload images with sanitized filenames
    const fileUrls = await Promise.all(
      validImages.map((img, index) => {
        const originalName = img.clientName ?? `image_${index}.jpg`
        const sanitizedFileName = sanitizeFilename(originalName)
        return uploadImage(img, `accommodations/${accommodation.id}`, sanitizedFileName)
      })
    )

    for (let i = 0; i < validImages.length; i++) {
      const image = validImages[i]
      const originalName = image.clientName ?? `image_${i}.jpg`
      const sanitizedFileName = sanitizeFilename(originalName)
      
      const fileMeta = await FileMetadata.create(
        {
          fileName: sanitizedFileName,
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

    // Default facility-specific document requirements
    await DocumentRequirement.create(
      {
        accommodationId: accommodation.id,
        requirementName: 'Valid ID',
        acceptedFormat: 'any',
      },
      { client: trx }
    )

    await trx.commit()
    console.log(`[${Date.now() - startTime}ms] === TOTAL TIME: ${Date.now() - startTime}ms ===`)

    try {
      await LogService.record(
        landlordId,
        'accommodation',
        accommodation.id,
        'ACCOMMODATION_CREATED',
        `Landlord ${landlordId} created accommodation "${accommodation.accommodationName}" with ${contractMonthsNum} month contract`
      )
    } catch (e) {
      console.error('Failed to log ACCOMMODATION_CREATED:', e)
    }

    return response.ok(accommodation.serialize())
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
  async update({ params, request, auth, response }: HttpContext) {
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
      accommodation_size,
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

    const changedFields: string[] = []
    if (accommodation_name) changedFields.push('name')
    if (accommodation_location) changedFields.push('location')
    if (accommodation_type) changedFields.push('type')
    if (accommodation_capacity) changedFields.push('capacity')
    if (tenant_restriction) changedFields.push('tenant_restriction')
    if (accommodation_size) changedFields.push('size')
    if (application_start_date) changedFields.push('application_start_date')
    if (application_end_date) changedFields.push('application_end_date')
    if (latitude && longitude) changedFields.push('location_coords')

    accommodation.merge({
      ...(accommodation_name && { accommodationName: accommodation_name }),
      ...(accommodation_location && { accommodationLocation: accommodation_location }),
      ...(accommodation_type && { accommodationType: accommodation_type }),
      ...(accommodation_capacity && { accommodationCapacity: accommodation_capacity }),
      ...(tenant_restriction && { tenantRestriction: tenant_restriction }),
      ...(accommodation_size && { accommodationSize: accommodation_size }),
      ...(application_start_date && { applicationStartDate: application_start_date }),
      ...(application_end_date && { applicationEndDate: application_end_date }),
      ...distances,
    })

    await accommodation.save()

    try {
      await LogService.record(
        landlordId,
        'accommodation',
        accommodation.id,
        'ACCOMMODATION_UPDATED',
        `Landlord ${landlordId} updated accommodation "${accommodation.accommodationName}" (fields: ${changedFields.join(', ') || 'none'})`
      )
    } catch (e) {
      console.error('Failed to log ACCOMMODATION_UPDATED:', e)
    }

    return response.ok(accommodation.serialize())
  }

  // ─── POST /landlord/accommodations/:id/images ────────────────────────────
  // Landlord: upload images to an existing accommodation
  async uploadImages({ params, request, auth, response }: HttpContext) {
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

      try {
        await LogService.record(
          landlordId,
          'accommodation',
          accommodation.id,
          'ACCOMMODATION_IMAGES_UPLOADED',
          `Landlord ${landlordId} uploaded ${uploaded.length} image(s) to accommodation "${accommodation.accommodationName}"`
        )
      } catch (e) {
        console.error('Failed to log ACCOMMODATION_IMAGES_UPLOADED:', e)
      }

      return response.ok(uploaded)

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
  async deleteImage({ params, auth, response }: HttpContext) {
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

      try {
        await LogService.record(
          landlordId,
          'accommodation',
          image.accommodation.id,
          'ACCOMMODATION_IMAGE_DELETED',
          `Landlord ${landlordId} deleted an image from accommodation "${image.accommodation.accommodationName}"`
        )
      } catch (e) {
        console.error('Failed to log ACCOMMODATION_IMAGE_DELETED:', e)
      }

      return response.ok({ message: 'Image deleted successfully' })
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
  async landlordIndex({ auth, response }: HttpContext) {
    const landlordId = auth.user!.id
    const accommodations = await Accommodation.query()
      .where('landlord_id', landlordId)
      .preload('images', (q) => q.preload('file'))
      .preload('tags')
      .preload('manager', (q) => q.preload('user', (q2) => q2.preload('phoneNumbers')))

    const data = await Promise.all(accommodations.map(withPrimaryImageUrl))

    // Temporary debug
    console.log('primaryImageUrls:', data.map(d => d.primaryImageUrl))

    return response.ok(data)
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

  // Recommendation 
  async recommended({ auth, response }: HttpContext) {
    const user = auth.user

    if (!user) {
      return response.unauthorized({ message: 'Unauthorized' })
    }

    const student = await Student.findByOrFail('userId', user.id)

    const gender = (student.gender ?? '').toLowerCase()

    const allowedRestrictions =
      gender === 'female'
        ? ['female-only', 'coed']
        : gender === 'male'
          ? ['male-only', 'coed']
          : ['coed']

    const accommodations = await db
      .from('accommodations')
      .leftJoin('reviews', 'accommodations.id', 'reviews.accommodation_id')
      .leftJoin('accommodation_images', 'accommodations.id', 'accommodation_images.accommodation_id')
      .leftJoin('file_metadata', 'accommodation_images.image_file_id', 'file_metadata.id')
      .where('accommodations.status', 'verified')
      // .whereNotNull('accommodations.manager_id')
      .whereIn('accommodations.tenant_restriction', allowedRestrictions)
      .groupBy('accommodations.id')
      .select(
        'accommodations.id',
        'accommodations.accommodation_name',
        'accommodations.accommodation_location',
        'accommodations.accommodation_type',
        'accommodations.tenant_restriction',
        'accommodations.accommodation_size'
      )
      .select(db.raw('COALESCE(AVG(reviews.rating), 0) as average_rating'))
      .select(db.raw('MIN(file_metadata.file_path) as primary_image_path'))
      .orderBy('average_rating', 'desc')
      .limit(5)

    const data = await Promise.all(
      accommodations.map(async (acc: any) => ({
        ...acc,
        primaryImageUrl: await signImageUrl(acc.primary_image_path),
      }))
    )

    return response.ok(data)
  }

  // ─── GET /accommodations/:id/document-requirements ───────────────────────
  // Public: list all document requirements for an accommodation
  async listDocumentRequirements({ params, response }: HttpContext) {
    const requirements = await DocumentRequirement.query()
      .where('accommodationId', params.id)
      .orderBy('createdAt', 'asc')

    return response.ok(requirements)
  }

  // ─── POST /landlord/accommodations/:id/document-requirements ─────────────
  // Role: Landlord — add a document requirement to their accommodation
  async addDocumentRequirement({ params, request, auth, response }: HttpContext) {
    const landlordId = auth.user!.id

    const accommodation = await Accommodation.query()
      .where('id', params.id)
      .where('landlord_id', landlordId)
      .first()

    if (!accommodation) {
      return response.notFound({
        status: 404,
        error: 'Not Found',
        message: 'Accommodation not found or you do not have access to it.',
      })
    }

    const { requirement_name, accepted_format } = request.body()

    if (!requirement_name || typeof requirement_name !== 'string' || !requirement_name.trim()) {
      return response.badRequest({
        status: 400,
        error: 'Validation Error',
        message: 'requirement_name is required.',
      })
    }

    const validFormats = ['pdf', 'image', 'any']
    const format = validFormats.includes(accepted_format) ? accepted_format : 'any'

    const requirement = await DocumentRequirement.create({
      accommodationId: accommodation.id,
      requirementName: requirement_name.trim(),
      acceptedFormat: format,
    })

    try {
      await LogService.record(
        landlordId,
        'document',
        requirement.id,
        'DOCUMENT_REQUIREMENT_ADDED',
        `Landlord ${landlordId} added document requirement "${requirement.requirementName}" to accommodation "${accommodation.accommodationName}"`
      )
    } catch (e) {
      console.error('Failed to log DOCUMENT_REQUIREMENT_ADDED:', e)
    }

    return response.created(requirement)
  }

  // ─── DELETE /landlord/accommodations/:id/document-requirements/:reqId ────
  // Role: Landlord — remove a document requirement from their accommodation
  async removeDocumentRequirement({ params, auth, response }: HttpContext) {
    const landlordId = auth.user!.id

    const accommodation = await Accommodation.query()
      .where('id', params.id)
      .where('landlord_id', landlordId)
      .first()

    if (!accommodation) {
      return response.notFound({
        status: 404,
        error: 'Not Found',
        message: 'Accommodation not found or you do not have access to it.',
      })
    }

    const requirement = await DocumentRequirement.query()
      .where('id', params.reqId)
      .where('accommodationId', accommodation.id)
      .first()

    if (!requirement) {
      return response.notFound({
        status: 404,
        error: 'Not Found',
        message: 'Document requirement not found.',
      })
    }

    const removedName = requirement.requirementName
    const removedId = requirement.id
    await requirement.delete()

    try {
      await LogService.record(
        landlordId,
        'document',
        removedId,
        'DOCUMENT_REQUIREMENT_REMOVED',
        `Landlord ${landlordId} removed document requirement "${removedName}" from accommodation "${accommodation.accommodationName}"`
      )
    } catch (e) {
      console.error('Failed to log DOCUMENT_REQUIREMENT_REMOVED:', e)
    }

    return response.ok({ message: 'Document requirement removed.' })
  }

  // Top 5 dorms by average rating, regardless of tenant restriction (for landing page)
  async topRated({ response }: HttpContext) {
    const accommodations = await db
      .from('accommodations')
      .leftJoin('reviews', 'accommodations.id', 'reviews.accommodation_id')
      .leftJoin('rooms', 'accommodations.id', 'rooms.accommodation_id')
      .leftJoin('accommodation_tags', 'accommodations.id', 'accommodation_tags.accommodation_id')
      .leftJoin('accommodation_images', 'accommodations.id', 'accommodation_images.accommodation_id')
      .leftJoin('file_metadata', 'accommodation_images.image_file_id', 'file_metadata.id')
      .where('accommodations.status', 'verified')
      .groupBy('accommodations.id')
      .select(
        'accommodations.id',
        'accommodations.accommodation_name',
        'accommodations.accommodation_location',
        'accommodations.accommodation_type'
      )
      .select(db.raw('COALESCE(AVG(reviews.rating), 0) as average_rating'))
      .select(db.raw('COALESCE(MIN(rooms.room_rent), 0) as starting_price'))
      .select(db.raw('GROUP_CONCAT(DISTINCT accommodation_tags.tag_detail) as tags'))
      .select(db.raw('MIN(file_metadata.file_path) as primary_image_path'))
      .orderBy('average_rating', 'desc')
      .limit(5)

    const data = await Promise.all(
      accommodations.map(async (acc: any) => ({
        id: acc.id,
        name: acc.accommodation_name,
        subtitle: acc.accommodation_location,
        meta: acc.accommodation_type,
        price: Number(acc.starting_price ?? 0),
        rating: Number(Number(acc.average_rating ?? 0).toFixed(1)),
        chips: acc.tags ? acc.tags.split(',').slice(0, 3) : [],
        primaryImageUrl: acc.primary_image_path
          ? await signImageUrl(acc.primary_image_path)
          : null,
      }))
    )

    return response.ok(data)
  }
}