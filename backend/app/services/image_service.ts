import Accommodation from '#models/accommodation'
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

export async function withPrimaryImageUrl(accommodation: Accommodation): Promise<any> {
  const serialized = accommodation.serialize() as any
  const primary = accommodation.images?.[accommodation.primaryImageIndex]
  serialized.primaryImageUrl = await signImageUrl(primary?.file?.filePath)
  return serialized
}