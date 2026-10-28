import type {
  ApiPaginatedResponse,
  ApiSingleResponse,
} from '@mts241alikhlash/web-shared/types/api'
import api from '@mts241alikhlash/web-shared/utils/api'
import type {
  AccessCode,
  ExamSchedule,
  ScheduleCreatePayload,
  SchedulePayload,
  ScheduleQueryParams,
  ScheduleSession,
} from '../types'

const seg = encodeURIComponent

export const examScheduleApi = {
  getSchedules: (params?: ScheduleQueryParams) =>
    api.get<ApiPaginatedResponse<ExamSchedule>>('/exam-schedules', { params }),

  getSchedule: (id: string) =>
    api.get<ApiSingleResponse<ExamSchedule>>(`/exam-schedules/${seg(id)}`),

  createSchedule: (payload: ScheduleCreatePayload) =>
    api.post<ApiSingleResponse<ExamSchedule>>('/exam-schedules', payload),

  updateSchedule: (id: string, payload: SchedulePayload) =>
    api.patch<ApiSingleResponse<ExamSchedule>>(
      `/exam-schedules/${seg(id)}`,
      payload,
    ),

  cancelSchedule: (id: string) => api.post(`/exam-schedules/${seg(id)}/cancel`),

  getAccessCode: (id: string) =>
    api.get<ApiSingleResponse<AccessCode>>(
      `/exam-schedules/${seg(id)}/access-code`,
    ),

  getSessions: (id: string, params?: { page?: number; limit?: number }) =>
    api.get<ApiPaginatedResponse<ScheduleSession>>(
      `/exam-schedules/${seg(id)}/sessions`,
      { params },
    ),

  releaseSession: (sessionId: string) =>
    api.post(`/exam-sessions/${seg(sessionId)}/release`),

  rotateAccessCode: (id: string) =>
    api.post<ApiSingleResponse<AccessCode>>(
      `/exam-schedules/${seg(id)}/access-code/rotate`,
    ),
}
