import Accommodation from '#models/accommodation'
import FileMetadata from '#models/file_metadatum'
import drive from '@adonisjs/drive/services/main'

export function fileKeyFromPath(filePath: string): string {
  return decodeURIComponent(
    filePath.startsWith('https://')
      ? new URL(filePath).pathname.replace(/^\/[^/]+\//, '')
      : filePath
  )
}

export async function signImageUrl(filePath: string | null | undefined): Promise<string | null> {
  if (!filePath) return null
  return drive.use('s3').getSignedUrl(fileKeyFromPath(filePath), { expiresIn: '5 hours' })
}

// Resolves a FileMetadata into a URL the browser can fetch.
// - B2-backed files (filePath starts with https://) get a 5h signed URL.
// - Local-looking paths (e.g. "/uploads/images/pfp_1.jpg", "defaults/default_pfp.png")
//   are returned as-is, so seed data and static defaults still work.
export async function signFileUrl(file: FileMetadata | null | undefined): Promise<string | null> {
  if (!file?.filePath) return null
  if (!file.filePath.startsWith('https://')) return file.filePath
  return signImageUrl(file.filePath)
}

export async function withPrimaryImageUrl(accommodation: Accommodation): Promise<any> {
  const serialized = accommodation.serialize() as any
  const primary = accommodation.images?.[accommodation.primaryImageIndex]
  serialized.primaryImageUrl = await signImageUrl(primary?.file?.filePath)
  return serialized
}