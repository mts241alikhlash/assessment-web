import type { QuestionStatus, QuestionType } from './question'

const TYPE_LABELS: Record<QuestionType, string> = {
  MULTIPLE_CHOICE: 'Pilihan Ganda',
  MULTIPLE_RESPONSE: 'Pilihan Ganda Kompleks',
  TRUE_FALSE: 'Benar/Salah',
  SHORT_ANSWER: 'Isian Singkat',
  ESSAY: 'Uraian',
}

const STATUS_LABELS: Record<QuestionStatus, string> = {
  DRAFT: 'Draf',
  SUBMITTED: 'Diajukan',
  APPROVED: 'Disetujui',
  RETURNED: 'Dikembalikan',
}

export type StatusTone = 'neutral' | 'info' | 'success' | 'warning'

const STATUS_TONES: Record<QuestionStatus, StatusTone> = {
  DRAFT: 'neutral',
  SUBMITTED: 'info',
  APPROVED: 'success',
  RETURNED: 'warning',
}

export const typeLabel = (type: QuestionType): string => TYPE_LABELS[type]
export const statusLabel = (status: QuestionStatus): string =>
  STATUS_LABELS[status]
export const statusTone = (status: QuestionStatus): StatusTone =>
  STATUS_TONES[status]
