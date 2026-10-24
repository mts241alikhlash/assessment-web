import type {
  ApiPaginatedResponse,
  ApiSingleResponse,
} from '@mts241alikhlash/web-shared/types/api'
import api from '@mts241alikhlash/web-shared/utils/api'
import type {
  ApprovalItem,
  ApprovalResult,
  ExamFile,
  ImportResult,
  QuestionCreatePayload,
  QuestionDetail,
  QuestionQueryParams,
  QuestionScope,
  QuestionSummary,
  QuestionUpdatePayload,
  QuestionVersion,
  TemplateFormat,
} from '../types'

export const examBankApi = {
  getScope: () =>
    api.get<ApiSingleResponse<QuestionScope>>('/exam-questions/scope'),

  getQuestions: (params?: QuestionQueryParams) =>
    api.get<ApiPaginatedResponse<QuestionSummary>>('/exam-questions', {
      params,
    }),

  getQuestion: (id: string) =>
    api.get<ApiSingleResponse<QuestionDetail>>(`/exam-questions/${id}`),

  getVersions: (id: string) =>
    api.get<ApiSingleResponse<QuestionVersion[]>>(
      `/exam-questions/${id}/versions`,
    ),

  createQuestion: (payload: QuestionCreatePayload) =>
    api.post<ApiSingleResponse<QuestionDetail>>('/exam-questions', payload),

  updateQuestion: (id: string, payload: QuestionUpdatePayload) =>
    api.patch<ApiSingleResponse<QuestionDetail>>(
      `/exam-questions/${id}`,
      payload,
    ),

  deleteQuestion: (id: string) => api.delete(`/exam-questions/${id}`),

  submitQuestion: (id: string) =>
    api.post<ApiSingleResponse<QuestionDetail>>(`/exam-questions/${id}/submit`),

  approveQuestion: (id: string, revision: number) =>
    api.post<ApiSingleResponse<QuestionDetail>>(
      `/exam-questions/${id}/approve`,
      { revision },
    ),

  returnQuestion: (id: string, note: string, revision: number) =>
    api.post<ApiSingleResponse<QuestionDetail>>(
      `/exam-questions/${id}/return`,
      { note, revision },
    ),

  approveMany: (items: ApprovalItem[]) =>
    api.post<ApiSingleResponse<ApprovalResult[]>>(
      '/exam-questions/approve-many',
      { items },
    ),

  uploadImage: (file: File) => {
    const form = new FormData()
    form.append('file', file)
    return api.post<ApiSingleResponse<ExamFile>>('/exam-files', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  getImage: (id: string) =>
    api.get<Blob>(`/exam-files/${id}`, { responseType: 'blob' }),

  downloadTemplate: (format: TemplateFormat) =>
    api.get<Blob>('/exam-imports/template', {
      params: { format },
      responseType: 'blob',
    }),

  importQuestions: (form: FormData) =>
    api.post<ApiSingleResponse<ImportResult>>('/exam-imports', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
}
