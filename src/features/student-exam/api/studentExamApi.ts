import api from '@mts241alikhlash/web-shared/utils/api'
import type { ApiEnvelope } from '@mts241alikhlash/web-shared/types/api'
import type {
  AnswerPayload,
  MyExam,
  PaperQuestion,
  SavedAnswer,
  SavedAnswerAck,
  StartedSession,
  SubmittedSession,
} from '../types'

const seg = encodeURIComponent

const deviceHeaders = (deviceId: string) => ({ 'X-Device-Id': deviceId })

export const studentExamApi = {
  listExams: () => api.get<ApiEnvelope<MyExam[]>>('/me/exams'),

  startSession: (scheduleId: string, accessCode: string, deviceId: string) =>
    api.post<ApiEnvelope<StartedSession>>(
      `/me/exams/${seg(scheduleId)}/sessions`,
      { accessCode, deviceId },
    ),

  getQuestions: (sessionId: string, deviceId: string) =>
    api.get<ApiEnvelope<PaperQuestion[]>>(
      `/student-exams/${seg(sessionId)}/questions`,
      { headers: deviceHeaders(deviceId) },
    ),

  getAnswers: (sessionId: string, deviceId: string) =>
    api.get<ApiEnvelope<SavedAnswer[]>>(
      `/student-exams/${seg(sessionId)}/answers`,
      { headers: deviceHeaders(deviceId) },
    ),

  saveAnswer: (
    sessionId: string,
    deviceId: string,
    payload: {
      questionId: string
      clientId: string
      answer: AnswerPayload
    },
  ) =>
    api.post<ApiEnvelope<SavedAnswerAck>>(
      `/student-exams/${seg(sessionId)}/answers`,
      payload,
      { headers: deviceHeaders(deviceId) },
    ),

  submit: (sessionId: string, deviceId: string, violations = 0) =>
    api.post<ApiEnvelope<SubmittedSession>>(
      `/student-exams/${seg(sessionId)}/submit`,
      { violations },
      { headers: deviceHeaders(deviceId) },
    ),
}
