import type { ApiEnvelope } from '@mts241alikhlash/web-shared/types/api'
import { isAxiosError } from 'axios'
import { studentExamApi } from '../api/studentExamApi'
import { deviceId } from './deviceId'
import type {
  AnswerPayload,
  MyExam,
  PaperQuestion,
  SavedAnswer,
  SavedAnswerAck,
  StartedSession,
  SubmittedSession,
} from '../types'

export function examErrorMessage(error: unknown, fallback: string): string {
  if (isAxiosError(error)) {
    const message = (error.response?.data as { message?: unknown } | null)
      ?.message
    if (typeof message === 'string' && message.trim()) return message
    if (Array.isArray(message) && typeof message[0] === 'string') {
      return message[0]
    }
  }
  return fallback
}

function unwrap<T>(response: { data: ApiEnvelope<T> }): T {
  const payload = response.data?.data
  if (payload === null || payload === undefined) {
    throw new Error('Respons server kosong.')
  }
  return payload
}

export const studentExamService = {
  async listExams(): Promise<MyExam[]> {
    try {
      return unwrap(await studentExamApi.listExams())
    } catch (error) {
      throw new Error(examErrorMessage(error, 'Daftar ujian gagal dimuat.'), {
        cause: error,
      })
    }
  },

  async startSession(
    scheduleId: string,
    accessCode: string,
  ): Promise<StartedSession> {
    try {
      return unwrap(
        await studentExamApi.startSession(
          scheduleId,
          accessCode.trim(),
          deviceId(),
        ),
      )
    } catch (error) {
      throw new Error(examErrorMessage(error, 'Ujian gagal dimulai.'), {
        cause: error,
      })
    }
  },

  async getQuestions(sessionId: string): Promise<PaperQuestion[]> {
    try {
      return unwrap(await studentExamApi.getQuestions(sessionId, deviceId()))
    } catch (error) {
      throw new Error(examErrorMessage(error, 'Soal gagal dimuat.'), {
        cause: error,
      })
    }
  },

  async getAnswers(sessionId: string): Promise<SavedAnswer[]> {
    try {
      return unwrap(await studentExamApi.getAnswers(sessionId, deviceId()))
    } catch (error) {
      throw new Error(examErrorMessage(error, 'Jawaban gagal dimuat.'), {
        cause: error,
      })
    }
  },

  async saveAnswer(
    sessionId: string,
    questionId: string,
    answer: AnswerPayload,
  ): Promise<SavedAnswerAck> {
    try {
      return unwrap(
        await studentExamApi.saveAnswer(sessionId, deviceId(), {
          questionId,
          clientId: crypto.randomUUID(),
          answer,
        }),
      )
    } catch (error) {
      throw new Error(examErrorMessage(error, 'Jawaban gagal disimpan.'), {
        cause: error,
      })
    }
  },

  async submit(sessionId: string): Promise<SubmittedSession> {
    try {
      return unwrap(await studentExamApi.submit(sessionId, deviceId()))
    } catch (error) {
      throw new Error(examErrorMessage(error, 'Ujian gagal dikumpulkan.'), {
        cause: error,
      })
    }
  },
}
