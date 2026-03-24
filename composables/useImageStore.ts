import type { ImageItem } from '~/types'
import { useProcessor } from '~/composables/useProcessor'
import { useConvertOptions } from '~/composables/useConvertOptions'
import { hasAlpha } from '~/utils/hasAlpha'

export function useImageStore() {
  const images = useState<ImageItem[]>('images', () => [])
  const { convert } = useProcessor()
  const { options } = useConvertOptions()

  // D-02: new upload REPLACES the existing list (not accumulate)
  async function addImages(files: File[]) {
    // Revoke existing preview URLs before replacing (memory leak prevention)
    for (const img of images.value) {
      if (img.previewUrl) URL.revokeObjectURL(img.previewUrl)
    }
    const items: ImageItem[] = files.map(file => ({
      id: crypto.randomUUID(),
      file,
      name: file.name,
      originalSize: file.size,
      convertedSize: null,
      convertedBlob: null,
      status: 'idle' as const,
      error: null,
      previewUrl: URL.createObjectURL(file),
      hasAlpha: false,
    }))
    images.value = items
    // Run hasAlpha checks in background for PNG files (for D-10 conditional color picker)
    for (const item of images.value) {
      if (item.file.type === 'image/png') {
        hasAlpha(item.file).then(alpha => { item.hasAlpha = alpha })
      }
    }
  }

  function removeImage(id: string) {
    const img = images.value.find(i => i.id === id)
    if (img?.previewUrl) URL.revokeObjectURL(img.previewUrl)
    images.value = images.value.filter(i => i.id !== id)
  }

  // D-08: explicit Convert button triggers this
  async function convertAll() {
    for (const item of images.value) {
      if (item.status === 'done' || item.status === 'processing') continue
      item.status = 'processing'
      try {
        const blob = await convert(item.file, options.value)
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

  return { images, addImages, removeImage, convertAll, isProcessing, allConverted }
}
