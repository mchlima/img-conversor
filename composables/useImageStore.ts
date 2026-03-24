import type { ImageItem } from '~/types'
import { useProcessor } from '~/composables/useProcessor'
import { useConvertOptions } from '~/composables/useConvertOptions'
import { hasAlpha } from '~/utils/hasAlpha'

export function useImageStore() {
  const images = useState<ImageItem[]>('images', () => [])
  const { convert } = useProcessor()
  const { options } = useConvertOptions()

  // UPLD-01: new upload ACCUMULATES onto the existing list
  async function addImages(files: File[]) {
    const items: ImageItem[] = files.map(file => ({
      id: crypto.randomUUID(),
      file,
      name: file.name,
      originalSize: file.size,
      originalWidth: 0,
      originalHeight: 0,
      convertedSize: null,
      convertedBlob: null,
      status: 'idle' as const,
      error: null,
      previewUrl: URL.createObjectURL(file),
      hasAlpha: false,
      resizeWidth: null,
      resizeHeight: null,
      resizeOverride: false,
      resizePercent: options.value.resizePercent,
      resizePercentOverride: false,
    }))
    images.value = [...images.value, ...items]
    // Run background tasks on the REACTIVE items (not the local copies)
    const startIdx = images.value.length - items.length
    for (let i = 0; i < items.length; i++) {
      const reactiveItem = images.value[startIdx + i]
      // hasAlpha check for PNG files (D-10 conditional color picker)
      if (reactiveItem.file.type === 'image/png') {
        hasAlpha(reactiveItem.file).then((alpha) => { reactiveItem.hasAlpha = alpha })
      }
      // Populate original dimensions + pre-fill per-image resize (RSZN-11)
      createImageBitmap(reactiveItem.file).then((bmp) => {
        reactiveItem.originalWidth = bmp.width
        reactiveItem.originalHeight = bmp.height
        reactiveItem.resizeWidth = bmp.width
        reactiveItem.resizeHeight = bmp.height
        bmp.close()
      })
    }
  }

  function removeImage(id: string) {
    const img = images.value.find(i => i.id === id)
    if (img?.previewUrl) URL.revokeObjectURL(img.previewUrl)
    images.value = images.value.filter(i => i.id !== id)
  }

  function clearImages() {
    for (const img of images.value) {
      if (img.previewUrl) URL.revokeObjectURL(img.previewUrl)
    }
    images.value = []
  }

  // RSZN-12: manually override per-image dimensions; marks image as overridden
  function updateImageResize(id: string, width: number | null, height: number | null) {
    const item = images.value.find(i => i.id === id)
    if (!item) return
    if (width !== null) {
      item.resizeWidth = Math.min(width, item.originalWidth)
    }
    if (height !== null) {
      item.resizeHeight = Math.min(height, item.originalHeight)
    }
    item.resizeOverride = true
  }

  // Per-image proportional resize
  function updateImageResizePercent(id: string, percent: number) {
    const item = images.value.find(i => i.id === id)
    if (!item) return
    item.resizePercent = Math.max(1, Math.min(100, percent))
    item.resizePercentOverride = true
  }

  // Propagate global % to non-overridden images
  function propagateGlobalResizePercent(globalPercent: number) {
    for (const item of images.value) {
      if (item.resizePercentOverride === true) continue
      item.resizePercent = globalPercent
    }
  }

  // RSZN-13: propagate global resize values to non-overridden images only
  function propagateGlobalResize(globalWidth: number | null, globalHeight: number | null) {
    for (const item of images.value) {
      if (item.resizeOverride === true) continue
      item.resizeWidth = globalWidth !== null
        ? Math.min(globalWidth, item.originalWidth)
        : item.originalWidth
      item.resizeHeight = globalHeight !== null
        ? Math.min(globalHeight, item.originalHeight)
        : item.originalHeight
    }
  }

  // D-08: explicit Convert button triggers this
  async function convertAll() {
    for (const item of images.value) {
      if (item.status === 'done' || item.status === 'processing') continue
      item.status = 'processing'
      try {
        const blob = await convert(item, options.value)
        item.convertedBlob = blob
        item.convertedSize = blob.size
        item.status = 'done'
      }
      catch (err) {
        item.status = 'error'
        item.error = err instanceof Error ? err.message : String(err)
      }
    }
  }

  // Computed: is any image currently processing? (for disabling Convert button)
  const isProcessing = computed(() => images.value.some(i => i.status === 'processing'))

  // Computed: are ALL images converted? (for enabling Download All button — D-03)
  const allConverted = computed(() =>
    images.value.length > 0 && images.value.every(i => i.status === 'done')
  )

  return { images, addImages, removeImage, clearImages, convertAll, isProcessing, allConverted, updateImageResize, propagateGlobalResize, updateImageResizePercent, propagateGlobalResizePercent }
}
