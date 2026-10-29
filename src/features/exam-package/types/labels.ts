import type { ExamPackageStatus } from './package'

export type PackageTone = 'neutral' | 'info' | 'success' | 'warning'

const STATUS_LABELS: Record<ExamPackageStatus, string> = {
  DRAFT: 'Draf',
  LOCKED: 'Terkunci',
}

const STATUS_TONES: Record<ExamPackageStatus, PackageTone> = {
  DRAFT: 'neutral',
  LOCKED: 'success',
}

export const packageStatusLabel = (status: ExamPackageStatus): string =>
  STATUS_LABELS[status]

export const packageStatusTone = (status: ExamPackageStatus): PackageTone =>
  STATUS_TONES[status]
