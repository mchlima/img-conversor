import { guardCanvasDimensions } from '~/utils/guardCanvas'
import type { ConvertOptions } from '~/types'

export function useProcessor() {
  /**
   * Convert a File to a Blob using the provided ConvertOptions.
   *
   * Processing order:
   * 1. Decode file to ImageBitmap (EXIF-corrected via imageOrientation)
   * 2. Compute target dimensions from resizeMode
   * 3. Guard dimensions against iOS Safari 16M pixel limit
   * 4. Resize via @jsquash/resize (Lanczos) if dimensions differ
   * 5. Encode by format:
   *    - WebP: @jsquash/webp WASM encode (Safari-safe, never Canvas)
   *    - JPEG: Canvas convertToBlob with background fill before drawImage
   *    - PNG:  Canvas convertToBlob with putImageData (no fill needed)
   * 6. Memory cleanup — bitmap.close(), canvas.width = 0
   */
  const convert = async (file: File, opts: ConvertOptions): Promise<Blob> => {
    let bitmap: ImageBitmap | null = null
    let tempCanvas: OffscreenCanvas | null = null
    let finalCanvas: OffscreenCanvas | null = null

    try {
      // 1. Decode — EXIF orientation correction via imageOrientation option
      try {
        bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' })
      }
      catch {
        // Fallback: imageOrientation option dict may not be supported in all browsers
        bitmap = await createImageBitmap(file)
      }

      // 2. Compute target dimensions from resizeMode
      let targetW: number
      let targetH: number

      if (opts.resizeMode === 'proportional') {
        targetW = Math.max(1, Math.round(bitmap.width * opts.resizePercent / 100))
        targetH = Math.max(1, Math.round(bitmap.height * opts.resizePercent / 100))
      }
      else if (opts.resizeMode === 'exact') {
        targetW = Math.max(1, opts.resizeWidth ?? bitmap.width)
        targetH = Math.max(1, opts.resizeHeight ?? bitmap.height)
      }
      else {
        targetW = bitmap.width
        targetH = bitmap.height
      }

      // 3. iOS Safari guard — auto-scale to fit 16M pixel limit
      const guarded = guardCanvasDimensions(targetW, targetH)
      if (guarded.scaled) {
        console.warn(
          `[useProcessor] Image auto-scaled from ${targetW}x${targetH} to ${guarded.width}x${guarded.height} to fit iOS Safari canvas limit`,
        )
      }
      const guardedW = guarded.width
      const guardedH = guarded.height

      // 4. Extract ImageData (always) — optionally resize via @jsquash/resize
      let imageData: ImageData

      const needsResize = guardedW !== bitmap.width || guardedH !== bitmap.height

      // Draw bitmap to a source canvas at original dimensions
      tempCanvas = new OffscreenCanvas(bitmap.width, bitmap.height)
      const tempCtx = tempCanvas.getContext('2d')
      if (!tempCtx) throw new Error('Failed to get 2D context from OffscreenCanvas')
      tempCtx.drawImage(bitmap, 0, 0)
      // Close bitmap immediately after drawImage
      bitmap.close()
      bitmap = null

      const srcImageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height)
      // Release temp canvas memory
      tempCanvas.width = 0
      tempCanvas.height = 0
      tempCanvas = null

      if (needsResize) {
        const { default: resize } = await import('@jsquash/resize')
        imageData = await resize(srcImageData, { width: guardedW, height: guardedH })
      }
      else {
        imageData = srcImageData
      }

      // 5. Encode by format
      if (opts.format === 'image/webp') {
        // WebP path: always use @jsquash/webp WASM — NEVER Canvas (Safari silent PNG fallback)
        const { encode: encodeWebP } = await import('@jsquash/webp')
        // jSquash quality: 0–100 integer — map directly from UI slider (no division)
        const arrayBuffer = await encodeWebP(imageData, { quality: opts.quality })
        return new Blob([arrayBuffer], { type: 'image/webp' })
      }
      else if (opts.format === 'image/jpeg') {
        // JPEG path: fill background BEFORE drawing image to handle transparent PNGs (INFR-04)
        // CRITICAL: do NOT use putImageData after fillRect — putImageData overwrites ALL pixels
        // including the fill. Instead, draw via drawImage(tempCanvas) which composites (respects alpha).
        finalCanvas = new OffscreenCanvas(guardedW, guardedH)
        const ctx = finalCanvas.getContext('2d')
        if (!ctx) throw new Error('Failed to get 2D context for JPEG canvas')

        // Fill background first (D-02 — user-selected color, default white)
        ctx.fillStyle = opts.backgroundColor
        ctx.fillRect(0, 0, guardedW, guardedH)

        // Create a temp canvas from ImageData so we can use drawImage (compositing preserved)
        const imgDataCanvas = new OffscreenCanvas(guardedW, guardedH)
        const imgDataCtx = imgDataCanvas.getContext('2d')
        if (!imgDataCtx) throw new Error('Failed to get 2D context for ImageData canvas')
        imgDataCtx.putImageData(imageData, 0, 0)
        // drawImage composites (respects alpha) — transparent pixels show the fill below
        ctx.drawImage(imgDataCanvas, 0, 0)
        // Clean up intermediate canvas
        imgDataCanvas.width = 0
        imgDataCanvas.height = 0

        // Canvas API quality is 0.0–1.0 — divide slider value by 100
        const blob = await finalCanvas.convertToBlob({ type: 'image/jpeg', quality: opts.quality / 100 })
        finalCanvas.width = 0
        finalCanvas.height = 0
        finalCanvas = null
        return blob
      }
      else {
        // PNG path: supports transparency — putImageData directly (no fill needed)
        finalCanvas = new OffscreenCanvas(guardedW, guardedH)
        const ctx = finalCanvas.getContext('2d')
        if (!ctx) throw new Error('Failed to get 2D context for PNG canvas')
        ctx.putImageData(imageData, 0, 0)
        // PNG quality param is ignored by convertToBlob
        const blob = await finalCanvas.convertToBlob({ type: 'image/png' })
        finalCanvas.width = 0
        finalCanvas.height = 0
        finalCanvas = null
        return blob
      }
    }
    catch (err) {
      const originalError = err instanceof Error ? err : new Error(String(err))
      throw new Error(`Conversion failed for ${file.name}: ${originalError.message}`)
    }
    finally {
      // Memory cleanup — ensure resources are freed even on error
      if (bitmap) {
        bitmap.close()
      }
      if (tempCanvas) {
        tempCanvas.width = 0
        tempCanvas.height = 0
      }
      if (finalCanvas) {
        finalCanvas.width = 0
        finalCanvas.height = 0
      }
    }
  }

  return { convert }
}
