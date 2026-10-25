export const QUESTION_TYPES = [
  'MULTIPLE_CHOICE',
  'MULTIPLE_RESPONSE',
  'TRUE_FALSE',
  'SHORT_ANSWER',
  'ESSAY',
] as const

export type QuestionType = (typeof QUESTION_TYPES)[number]

export const QUESTION_STATUSES = [
  'DRAFT',
  'SUBMITTED',
  'APPROVED',
  'RETURNED',
] as const

export type QuestionStatus = (typeof QUESTION_STATUSES)[number]

export const CHOICE_KEYS = ['A', 'B', 'C', 'D', 'E'] as const

export type ChoiceKey = (typeof CHOICE_KEYS)[number]

export interface Choice {
  key: ChoiceKey
  html: string
}

export interface MultipleChoiceContent {
  choices: Choice[]
  answer: { key: ChoiceKey }
}

export interface MultipleResponseContent {
  choices: Choice[]
  answer: { keys: ChoiceKey[] }
}

export interface TrueFalseContent {
  answer: { value: boolean }
}

export interface ShortAnswerContent {
  answer: {
    accepted: string[]
    ignoreCase: boolean
    ignoreHarakat: boolean
  }
}

export interface EssayContent {
  guideHtml: string | null
}

export type QuestionContent =
  | MultipleChoiceContent
  | MultipleResponseContent
  | TrueFalseContent
  | ShortAnswerContent
  | EssayContent

export interface QuestionVersion {
  id: string
  questionId: string
  number: number
  bodyHtml: string
  content: QuestionContent
  points: number
  createdById: string
  createdAt: string
}

export type ReviewAction = 'SUBMITTED' | 'APPROVED' | 'RETURNED'

export interface QuestionReview {
  id: string
  questionId: string
  versionNumber: number
  action: ReviewAction
  note: string | null
  byUserId: string
  createdAt: string
}

export interface QuestionSummary {
  id: string
  subjectId: string
  gradeId: string
  authorEmployeeId: string
  type: QuestionType
  status: QuestionStatus
  currentVersion: number
  approvedVersion: number | null
  revision: number
  bodyHtml: string
  points: number
  authorName: string | null
  createdAt: string
  updatedAt: string
}

export interface QuestionDetail {
  id: string
  subjectId: string
  gradeId: string
  authorEmployeeId: string
  type: QuestionType
  status: QuestionStatus
  currentVersion: number
  approvedVersion: number | null
  revision: number
  createdById: string
  createdAt: string
  updatedAt: string
  current: QuestionVersion
  approved: QuestionVersion | null
  reviews: QuestionReview[]
}
