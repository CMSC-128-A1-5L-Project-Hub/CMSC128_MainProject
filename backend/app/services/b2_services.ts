import drive from '@adonisjs/drive/services/main'
import { randomUUID } from 'node:crypto' // Ensure none would overwrite each other
import { readFileSync } from 'node:fs'  // Reads a file from disk into memory
import { MultipartFile } from '@adonisjs/core/bodyparser'  // File object created when user apload a file

export async function uploadImage( // Uploads an image to S3 and return the public URL
    file: MultipartFile, // The uploaded Image
    folder: string       // Where to store it
): Promise<string>{ // Function will return a string later
    const fileName = `${folder}/${randomUUID()}-${file.clientName}`
    const buffer = readFileSync(file.tmpPath!)

    await drive.use('s3').put(fileName, buffer, {
        contentType: file.headers['content-type'] ?? 'image/jpeg',  // Uses .jpeg as default if header is missing
        visibility: 'public'
    })

    return await drive.use('s3').getUrl(fileName) // What is stored in the database
}

export async function deleteImage(filePath: string): Promise<void> { // Evoke niyo na lang pag kailangan
    const key = filePath.split('.com/')[1] // We extract key here
    await drive.use('s3').delete(key) // S3 deletes by key not by URL
}