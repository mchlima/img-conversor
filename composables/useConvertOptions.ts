import type { ConvertOptions, OutputFormat } from '~/types'

const defaults: ConvertOptions = {
  format: 'image/webp',
  quality: 80,
  resizeMode: 'none',
  resizePercent: 100,
  resizeWidth: null,
  resizeHeight: null,
  backgroundColor: '#ffffff',
}

export function useConvertOptions() {
  const state = useState<ConvertOptions>('convertOptions', () => ({ ...defaults }))

  const options = computed<ConvertOptions>(() => ({ ...state.value }))

  function setFormat(format: OutputFormat): void {
    state.value.format = format
  }

  function setQuality(quality: number): void {
    state.value.quality = Math.min(100, Math.max(1, quality))
  }

  /**
   * Switch resize mode with mutual exclusion (per D-06, RSZN-03).
   * - 'proportional': reset exact-mode fields (resizeWidth, resizeHeight)
   * - 'exact': reset proportional-mode field (resizePercent)
   * - 'none': reset all resize fields
   */
  function setResizeMode(mode: 'none' | 'proportional' | 'exact'): void {
    state.value.resizeMode = mode
    if (mode === 'proportional') {
      state.value.resizeWidth = null
      state.value.resizeHeight = null
    }
    else if (mode === 'exact') {
      state.value.resizePercent = 100
    }
    else {
      // none — reset everything
      state.value.resizePercent = 100
      state.value.resizeWidth = null
      state.value.resizeHeight = null
    }
  }

  /**
   * Set resize percentage. Only meaningful when resizeMode === 'proportional'.
   * Clamps to 1–100 range.
   */
  function setResizePercent(percent: number): void {
    state.value.resizePercent = Math.min(100, Math.max(1, percent))
  }

  /**
   * Set exact dimensions. Only meaningful when resizeMode === 'exact'.
   * Null values mean "use original dimension" for that axis.
   */
  function setResizeDimensions(width: number | null, height: number | null): void {
    state.value.resizeWidth = width
    state.value.resizeHeight = height
  }

  function setBackgroundColor(color: string): void {
    state.value.backgroundColor = color
  }

  return {
    options,
    setFormat,
    setQuality,
    setResizeMode,
    setResizePercent,
    setResizeDimensions,
    setBackgroundColor,
  }
}
