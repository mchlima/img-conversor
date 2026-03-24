import { zip } from 'fflate'
import type { ImageItem, OutputFormat } from '~/types'

/**
 * Generates a ZIP file from all converted images and triggers a browser download.
 * Uses async zip() to avoid blocking the UI thread.
 * Deduplicates filenames to prevent silent overwrites.
 */
export async function downloadAll(images: ImageItem[], format: OutputFormat): Promise<void> {
  const extMap: Record<OutputFormat, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
  }
  const ext = extMap[format]

  // Build a map of filename -> Uint8Array entries, deduplicating filenames
  const seen = new Map<string, number>()
  const zippable: Record<string, Uint8Array> = {}

  for (const item of images) {
    if (!item.convertedBlob) continue

    // Strip original extension from the filename, append the new one
    const baseName = item.name.replace(/\.[^.]+$/, '')
    const candidateKey = `${baseName}.${ext}`

    // Deduplicate: if filename already taken, append -2, -3, etc.
    let finalKey: string
    if (!seen.has(candidateKey)) {
      seen.set(candidateKey, 1)
      finalKey = candidateKey
    }
    else {
      const count = seen.get(candidateKey)! + 1
      seen.set(candidateKey, count)
      finalKey = `${baseName}-${count}.${ext}`
    }

    const buffer = await item.convertedBlob.arrayBuffer()
    zippable[finalKey] = new Uint8Array(buffer)
  }

  // Generate ZIP asynchronously (non-blocking)
  const zipData = await new Promise<Uint8Array>((resolve, reject) => {
    zip(zippable, (err, data) => {
      if (err) reject(err)
      else resolve(data)
    })
  })

  // Build timestamped filename: img-conversor-YYYY-MM-DD-HHmmss.zip (D-01)
  const now = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  const ts = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`

  // Trigger download using the Firefox-safe anchor pattern
  const blob = new Blob([zipData as BlobPart], { type: 'application/zip' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `img-conversor-${ts}.zip`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 100)
}
