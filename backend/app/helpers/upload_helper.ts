import env from '#start/env'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { readFile } from 'node:fs/promises'

export default class UploadHelper {

    // Initialize the S3 Client
    private static s3 = new S3Client({
        endpoint: env.get('S3_ENDPOINT'),
        credentials: {
        accessKeyId: env.get('AWS_ACCESS_KEY_ID'),
        secretAccessKey: env.get('AWS_SECRET_ACCESS_KEY'),
        },
    })

    static async upload(file: any, folder: 'profiles' | 'accommodations'): Promise<string> {
        // Generate a unique file name
        const fileName = `${folder}/${Date.now()}-${file.clientName}`
        const bucketName = env.get('S3_BUCKET')

        // Read the file from the temp directory into a buffer
        const fileContent = await readFile(file.tmpPath!)

        // Send the file to backblaze
        await this.s3.send(
            new PutObjectCommand({
                Bucket: bucketName,
                Key: fileName,
                Body: fileContent,
                ContentType: file.contentType,
            })
        )

        // Return a file path that they will then store
        return `https://${bucketName}.${env.get('B2_ENDPOINT_HOST')}/${fileName}`
    }
}
