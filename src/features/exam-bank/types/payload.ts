import type { QuestionContent, QuestionStatus, QuestionType } from './question'

export interface QuestionQueryParams {
  page?: number
  limit?: number
  subjectId?: string
  gradeId?: string
  type?: QuestionType
  status?: QuestionStatus
  authorEmployeeId?: string
  search?: string
}

export interface QuestionCreatePayload {
  subjectId: string
  gradeId: string
  authorEmployeeId?: string
  type: QuestionType
  bodyHtml: string
  content: QuestionContent
  points: number
}

export interface QuestionUpdatePayload {
  bodyHtml?: string
  content?: QuestionContent
  points?: number
}

export interface ApprovalItem {
  id: string
  revision: number
}

export interface ApprovalResult {
  id: string
  ok: boolean
  reason?: string
}

export interface ScopePair {
  subjectId: string
  subjectName: string | null
  gradeId: string
  gradeLevel: number | null
  gradeName: string | null
}

export interface QuestionScope {
  all: boolean
  pairs: ScopePair[]
}

export interface QuestionAuthor {
  id: string
  name: string
}

export interface NamedOption {
  id: string
  name: string
}

export interface GradeRecord {
  id: string
  level: number
  name: string | null
}

export interface ExamFile {
  id: string
  mimeType: string
  sizeBytes: number
}

export interface ImportRowError {
  row: number
  reason: string
}

export interface ImportResult {
  created: number
  questionIds: string[]
  errors: ImportRowError[]
}

export type TemplateFormat = 'xlsx' | 'docx'
