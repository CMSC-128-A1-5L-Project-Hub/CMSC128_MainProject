import drive from '@adonisjs/drive/services/main'
import { randomUUID } from 'node:crypto' // Ensure none would overwrite each other
import { readFileSync, existsSync } from 'node:fs' // Reads a file from disk into memory
import { extname } from 'node:path'
import { MultipartFile } from '@adonisjs/core/bodyparser' // File object created when user apload a file

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
]

export async function uploadImage(
  file: MultipartFile,
  folder: string
): Promise<string> {
  const mimeType = file.headers['content-type'] ?? ''

  if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
    throw new Error(`Invalid file type: ${mimeType}`)
  }

  const fileName = `${folder}/${randomUUID()}-${file.clientName}`
  const buffer = readFileSync(file.tmpPath!)

  try {
    await drive.use('s3').put(fileName, buffer, {
      contentType: mimeType,
    })
  } catch (error) {
    const err = error as any
    console.error('B2 Upload Error:', err.message)
    console.error('B2 Error Details:', err.$response ?? err.cause ?? err)
    throw error
  }

  return await drive.use('s3').getUrl(fileName)
}
const EXT_TO_MIME: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
}

// Used by seeders to upload a local image file directly to B2.
// Uses a deterministic B2 key (no UUID) so the same file always maps to the same
// B2 path — re-seeding after migration:fresh reuses the existing B2 object.
// localPath — absolute path to the file on disk
// originalName — filename (e.g. 'kamia_hall_front.jpg'), becomes the B2 key suffix
// folder — B2 folder prefix (e.g. 'accommodations/seed')
export async function uploadImageFromLocalPath(
  localPath: string,
  originalName: string,
  folder: string
): Promise<string> {
  if (!existsSync(localPath)) {
    throw new Error(`Seed image not found: ${localPath}`)
  }

  const ext = extname(originalName).toLowerCase()
  const mimeType = EXT_TO_MIME[ext]
  if (!mimeType) {
    throw new Error(`Unsupported image extension "${ext}" for file: ${originalName}`)
  }

  // Deterministic key — no UUID — so the same image always lives at the same B2 path.
  const b2Key = `${folder}/${originalName}`

  const exists = await drive.use('s3').exists(b2Key)
  if (exists) {
    return await drive.use('s3').getUrl(b2Key)
  }

  const buffer = readFileSync(localPath)
  try {
    await drive.use('s3').put(b2Key, buffer, { contentType: mimeType })
  } catch (error) {
    const err = error as any
    console.error('B2 Upload Error:', err.message)
    console.error('B2 Error Details:', err.$response ?? err.cause ?? err)
    throw error
  }

  return await drive.use('s3').getUrl(b2Key)
}

export async function deleteImage(filePath: string): Promise<void> {
  // Evoke niyo na lang pag kailangan
  const key = filePath.split('.com/')[1] // We extract key here
  await drive.use('s3').delete(key) // S3 deletes by key not by URL
}
