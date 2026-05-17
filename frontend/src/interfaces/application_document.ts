import type { Application } from './application'
import type { FileMetadata } from './file_metadatum'
import type { DocumentRequirement } from './document_requirement'

export interface ApplicationDocument {
  id: number

  applicationId: number
  documentRequirementId: number | null
  fileId: number
  requirementName: string

  createdAt: string
  updatedAt: string

  application?: Application
  file?: FileMetadata
  documentRequirement?: DocumentRequirement | null
}