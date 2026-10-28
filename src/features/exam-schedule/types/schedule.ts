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
  startsAt: string
  endsAt: string
  durationMinutes: number
  status: ExamScheduleStatus
  createdById: string
  createdAt: string
  updatedAt: string
}

export interface SchedulePayload {
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
