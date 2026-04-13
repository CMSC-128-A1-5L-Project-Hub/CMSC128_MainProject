import drive from '@adonisjs/drive/services/main'
import { randomUUID } from 'node:crypto' // Ensure none would overwrite each other
import { readFileSync } from 'node:fs' // Reads a file from disk into memory
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
export async function deleteImage(filePath: string): Promise<void> {
  // Evoke niyo na lang pag kailangan
  const key = filePath.split('.com/')[1] // We extract key here
  await drive.use('s3').delete(key) // S3 deletes by key not by URL
}
