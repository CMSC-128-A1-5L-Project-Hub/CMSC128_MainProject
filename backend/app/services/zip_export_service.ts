import archiver from 'archiver'
import { Readable } from 'node:stream'
import type { HttpContext } from '@adonisjs/core/http'

type Response = HttpContext['response']

export interface ZipEntry {
  /** Full public Backblaze URL stored in file_metadata.file_path */
  url: string
  /** Filename that will appear inside the zip archive */
  archiveName: string
}

export default class ZipExportService {
  /**
   * Fetch all provided public Backblaze URLs and stream them as a single
   * .zip download directly into the AdonisJS HTTP response.
   */
  async streamZip(entries: ZipEntry[], zipName: string, response: Response): Promise<void> {
    response.header('Content-Type', 'application/zip')
    response.header('Content-Disposition', `attachment; filename="${zipName}"`)
    response.header('Transfer-Encoding', 'chunked')

    const archive = archiver('zip', { zlib: { level: 0 } })

    archive.on('warning', (err) => {
      if (err.code !== 'ENOENT') throw err
    })

    archive.on('error', (err) => {
      throw err
    })

    // Pipe archive output straight into the HTTP response stream
    archive.pipe(response.response)

    for (const entry of entries) {
      try {
        // Files are uploaded as public visibility — fetch directly via stored URL
        // (same pattern as uploadImage which stores the public getUrl() result)
        const res = await fetch(entry.url)

        if (!res.ok || !res.body) {
          console.warn(`[ZipExportService] Skipping "${entry.archiveName}" — HTTP ${res.status}`)
          continue
        }

        // Convert WHATWG ReadableStream → Node.js Readable for archiver
        const nodeStream = Readable.fromWeb(res.body as import('node:stream/web').ReadableStream)
        archive.append(nodeStream, { name: entry.archiveName })
      } catch (err) {
        // Skip bad files — don't abort the whole zip
        console.error(`[ZipExportService] Failed to fetch "${entry.archiveName}":`, err)
      }
    }

    await archive.finalize()
  }
}