import type { QuestionType } from '@/features/exam-bank/types'

export const PACKAGE_STATUSES = ['DRAFT', 'LOCKED'] as const

export type ExamPackageStatus = (typeof PACKAGE_STATUSES)[number]

export interface ExamPackageSummary {
  id: string
  title: string
  subjectId: string
  gradeId: string
  status: ExamPackageStatus
  lockedAt: string | null
  createdById: string
  createdAt: string
  updatedAt: string
  itemCount: number
}

export interface ExamPackageItemView {
  questionId: string
  questionVersion: number
  position: number
  type: QuestionType
  summary: string
  points: number
}

export interface ExamPackageView extends Omit<ExamPackageSummary, 'itemCount'> {
  items: ExamPackageItemView[]
}

export interface PackageCandidate {
  id: string
  type: QuestionType
  summary: string
  points: number
  approvedVersion: number
}

export interface ExamPackagePayload {
  title: string
  questionIds: string[]
}

export interface ExamPackageCreatePayload extends ExamPackagePayload {
  subjectId: string
  gradeId: string
}

export interface ExamPackageQueryParams {
  page?: number
  limit?: number
  subjectId?: string
  gradeId?: string
  status?: ExamPackageStatus
  search?: string
}

export interface CandidateQueryParams {
  subjectId: string
  gradeId: string
  search?: string
  page?: number
  limit?: number
}
