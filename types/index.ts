export type OutputFormat = 'image/webp' | 'image/jpeg' | 'image/png'

export type ProcessingStatus = 'idle' | 'processing' | 'done' | 'error'

export interface ImageItem {
  id: string
  file: File
  name: string
  originalSize: number
  originalWidth: number
  originalHeight: number
  convertedSize: number | null
  convertedBlob: Blob | null
  status: ProcessingStatus
  error: string | null
  previewUrl: string | null
  hasAlpha: boolean
  resizeWidth: number | null
  resizeHeight: number | null
  resizeOverride: boolean
  resizePercent: number
  resizePercentOverride: boolean
}

export interface ConvertOptions {
  format: OutputFormat
  quality: number
  resizeMode: 'none' | 'proportional' | 'exact'
  resizePercent: number
  resizeWidth: number | null
  resizeHeight: number | null
  backgroundColor: string   // hex color e.g. '#ffffff' — used when PNG->JPEG (per D-02)
}
