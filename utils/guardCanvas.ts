/**
 * iOS Safari canvas pixel limit — 16,777,216 pixels (4096×4096).
 * Canvases exceeding this limit will be silently blank on iOS Safari.
 * Reference: INFR-05
 */
export const IOS_CANVAS_PIXEL_LIMIT = 16_777_216

/**
 * Guards image dimensions against the iOS Safari canvas pixel limit.
 *
 * If the total pixel count (width × height) exceeds IOS_CANVAS_PIXEL_LIMIT,
 * both dimensions are scaled down proportionally so the image fits within
 * the limit. This auto-scale approach (per D-01) reduces friction — images
 * are processed at reduced resolution rather than rejected outright.
 *
 * @param width - Original image width in pixels
 * @param height - Original image height in pixels
 * @returns Object with clamped width and height, and a `scaled` flag
 */
export function guardCanvasDimensions(
  width: number,
  height: number,
): { width: number; height: number; scaled: boolean } {
  if (width * height <= IOS_CANVAS_PIXEL_LIMIT) {
    return { width, height, scaled: false }
  }

  const scale = Math.sqrt(IOS_CANVAS_PIXEL_LIMIT / (width * height))
  return {
    width: Math.floor(width * scale),
    height: Math.floor(height * scale),
    scaled: true,
  }
}
