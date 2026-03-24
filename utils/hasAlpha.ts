/**
 * Detects whether a PNG file contains any transparent pixels.
 *
 * NOTE: This function should ONLY be called on PNG files (`file.type === 'image/png'`).
 * Other formats (JPEG, WebP) do not support transparency and will always return false.
 *
 * @param file - A PNG File object to inspect
 * @returns Promise<boolean> — true if any pixel has alpha < 255
 */
export async function hasAlpha(file: File): Promise<boolean> {
  const bitmap = await createImageBitmap(file)

  // Downsample to max 200px on the longest side for performance
  const maxSide = 200
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height))
  const sampledWidth = Math.max(1, Math.floor(bitmap.width * scale))
  const sampledHeight = Math.max(1, Math.floor(bitmap.height * scale))

  const canvas = new OffscreenCanvas(sampledWidth, sampledHeight)
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    bitmap.close()
    return false
  }
  ctx.drawImage(bitmap, 0, 0, sampledWidth, sampledHeight)

  const { data } = ctx.getImageData(0, 0, sampledWidth, sampledHeight)

  // Clean up bitmap memory immediately after reading pixels
  bitmap.close()

  // Scan alpha channel — every 4th byte starting at index 3
  let foundTransparent = false
  for (let i = 3; i < data.length; i += 4) {
    const alpha = data[i]
    if (alpha !== undefined && alpha < 255) {
      foundTransparent = true
      break
    }
  }

  // Release canvas memory
  canvas.width = 0
  canvas.height = 0

  return foundTransparent
}
