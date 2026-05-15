import { BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import env from '#start/env'
import {
  S3Client,
  PutBucketCorsCommand,
  GetBucketCorsCommand,
} from '@aws-sdk/client-s3'

export default class ConfigureB2Cors extends BaseCommand {
  static commandName = 'configure:b2-cors'
  static description = 'Apply CORS rules to the Backblaze B2 bucket so the frontend can load images without CORS errors'

  static options: CommandOptions = {
    startApp: true,
  }

  async run() {
    const bucket = env.get('S3_BUCKET')
    const endpoint = env.get('S3_ENDPOINT')
    const region = env.get('REGION')

    this.logger.info(`Configuring CORS on bucket "${bucket}" via ${endpoint}`)

    const client = new S3Client({
      region,
      endpoint,
      forcePathStyle: true,
      credentials: {
        accessKeyId: env.get('ACCESS_KEY_ID'),
        secretAccessKey: env.get('SECRET_ACCESS_KEY'),
      },
    })

    const rules = [
      {
        AllowedOrigins: ['https://uble-ics.vercel.app'],
        AllowedMethods: ['GET', 'HEAD'],
        AllowedHeaders: ['*'],
        ExposeHeaders: ['ETag'],
        MaxAgeSeconds: 3600,
      },
    ]

    try {
      await client.send(
        new PutBucketCorsCommand({
          Bucket: bucket,
          CORSConfiguration: { CORSRules: rules },
        })
      )
      this.logger.success('CORS rules applied.')
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      this.logger.error(`Failed to apply CORS rules: ${message}`)
      throw error
    }

    try {
      const current = await client.send(new GetBucketCorsCommand({ Bucket: bucket }))
      this.logger.info('Active CORS ruleset:')
      this.logger.info(JSON.stringify(current.CORSRules, null, 2))
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      this.logger.warning(`Applied rules, but failed to read them back: ${message}`)
    }
  }
}
