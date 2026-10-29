export const EXAM_TYPES = ['UH', 'QUIZ', 'TUGAS', 'UTS', 'UAS'] as const

export type ExamType = (typeof EXAM_TYPES)[number]

export const SCHEDULE_STATUSES = ['SCHEDULED', 'CANCELLED'] as const

export type ExamScheduleStatus = (typeof SCHEDULE_STATUSES)[number]

export type SchedulePhase = 'CANCELLED' | 'UPCOMING' | 'RUNNING' | 'ENDED'

export interface ExamSchedule {
  id: string
  packageId: string
  packageTitle: string
  classroomId: string
  classroomName: string | null
  semesterId: string
  type: ExamType
  startsAt: string
  endsAt: string
  durationMinutes: number
  status: ExamScheduleStatus
  hasSessions: boolean
  createdById: string
  createdAt: string
  updatedAt: string
}

export interface SchedulePayload {
  type: ExamType
  startsAt: string
  endsAt: string
  durationMinutes: number
}

export interface ScheduleCreatePayload extends SchedulePayload {
  packageId: string
  classroomId: string
}

export interface ScheduleQueryParams {
  page?: number
  limit?: number
  classroomId?: string
  packageId?: string
  status?: ExamScheduleStatus
  from?: string
  to?: string
}

export interface AccessCode {
  accessCode: string
  rotation: number
}

export const SESSION_STATUSES = [
  'IN_PROGRESS',
  'SUBMITTED',
  'EXPIRED',
  'GRADED',
] as const

export type ExamSessionStatus = (typeof SESSION_STATUSES)[number]

export interface ScheduleSession {
  sessionId: string
  studentId: string
  studentName: string | null
  studentNis: string | null
  status: ExamSessionStatus
  startedAt: string
  submittedAt: string | null
  rawScore: number | null
  maxScore: number | null
  deviceBound: boolean
}
