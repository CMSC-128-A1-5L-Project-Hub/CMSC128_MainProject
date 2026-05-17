export interface FileMetadata {
  id: number

  fileName: string
  filePath: string
  fileType: 'document' | 'image'
}