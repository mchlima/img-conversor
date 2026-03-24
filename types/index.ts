export type OutputFormat = 'image/webp' | 'image/jpeg' | 'image/png'

export type ProcessingStatus = 'idle' | 'processing' | 'done' | 'error'

export interface ImageItem {
  id: string
  file: File
  name: string
  originalSize: number
  convertedSize: number | null
  convertedBlob: Blob | null
  status: ProcessingStatus
  error: string | null
  previewUrl: string | null
}

export interface ConvertOptions {
  format: OutputFormat
  quality: number
  resizeMode: 'none' | 'proportional' | 'exact'
  resizePercent: number
  resizeWidth: number | null
  resizeHeight: number | null
}
