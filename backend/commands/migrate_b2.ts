import { BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import drive from '@adonisjs/drive/services/main'
import { readdir, readFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { extname, join } from 'node:path'
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import FileMetadata from '#models/file_metadatum'

const __dirname = dirname(fileURLToPath(import.meta.url))
const IMAGES_DIR = join(__dirname, '..', 'database', 'seed_data', 'images')
const FOLDER = 'accommodations/seed'

const EXT_TO_MIME: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
}

export default class MigrateB2 extends BaseCommand {
  static commandName = 'migrate:b2'
  static description =
    'Re-upload seed images to the active B2 bucket and update file_metadata URLs'

  static options: CommandOptions = {
    startApp: true,
  }

  async run() {
    if (!existsSync(IMAGES_DIR)) {
      this.logger.error(`Seed images directory not found: ${IMAGES_DIR}`)
      return
    }

    const files = await readdir(IMAGES_DIR)
    const imageFiles = files.filter((f) => EXT_TO_MIME[extname(f).toLowerCase()])

    this.logger.info(`Found ${imageFiles.length} image(s) in ${IMAGES_DIR}`)

    let succeeded = 0
    let skipped = 0
    let failed = 0

    for (const fileName of imageFiles) {
      const localPath = join(IMAGES_DIR, fileName)
      const b2Key = `${FOLDER}/${fileName}`
      const mimeType = EXT_TO_MIME[extname(fileName).toLowerCase()]

      try {
        const buffer = await readFile(localPath)
        await drive.use('s3').put(b2Key, buffer, { contentType: mimeType })
        const newUrl = await drive.use('s3').getUrl(b2Key)

        const record = await FileMetadata.findBy('fileName', fileName)
        if (record) {
          record.filePath = newUrl
          await record.save()
          this.logger.success(`[ok]      ${fileName}`)
          succeeded++
        } else {
          this.logger.warning(`[no row]  ${fileName} — uploaded but no file_metadata row found`)
          skipped++
        }
      } catch (err) {
        const cause = (err as any)?.cause ?? (err as any)?.original ?? err
        const message = err instanceof Error ? err.message : String(err)
        const detail = cause instanceof Error ? cause.message : String(cause)
        this.logger.error(`[failed]  ${fileName} — ${message}`)
        if (detail !== message) this.logger.error(`          cause: ${detail}`)
        failed++
      }
    }

    this.logger.info(`Done. ${succeeded} migrated, ${skipped} skipped (no DB row), ${failed} failed.`)
  }
}
