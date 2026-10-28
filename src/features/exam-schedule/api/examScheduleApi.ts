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

  rotateAccessCode: (id: string) =>
    api.post<ApiSingleResponse<AccessCode>>(
      `/exam-schedules/${seg(id)}/access-code/rotate`,
    ),
}
