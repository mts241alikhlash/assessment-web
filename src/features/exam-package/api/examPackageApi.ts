import type {
  ApiPaginatedResponse,
  ApiSingleResponse,
} from '@mts241alikhlash/web-shared/types/api'
import api from '@mts241alikhlash/web-shared/utils/api'
import type {
  CandidateQueryParams,
  ExamPackageCreatePayload,
  ExamPackagePayload,
  ExamPackageQueryParams,
  ExamPackageSummary,
  ExamPackageView,
  PackageCandidate,
} from '../types'

const seg = encodeURIComponent

export const examPackageApi = {
  getPackages: (params?: ExamPackageQueryParams) =>
    api.get<ApiPaginatedResponse<ExamPackageSummary>>('/exam-packages', {
      params,
    }),

  getPackage: (id: string) =>
    api.get<ApiSingleResponse<ExamPackageView>>(`/exam-packages/${seg(id)}`),

  getCandidates: (params: CandidateQueryParams) =>
    api.get<ApiPaginatedResponse<PackageCandidate>>(
      '/exam-packages/candidates',
      { params },
    ),

  createPackage: (payload: ExamPackageCreatePayload) =>
    api.post<ApiSingleResponse<ExamPackageView>>('/exam-packages', payload),

  updatePackage: (id: string, payload: ExamPackagePayload) =>
    api.patch<ApiSingleResponse<ExamPackageView>>(
      `/exam-packages/${seg(id)}`,
      payload,
    ),

  deletePackage: (id: string) => api.delete(`/exam-packages/${seg(id)}`),

  copyPackage: (id: string) =>
    api.post<ApiSingleResponse<ExamPackageView>>(
      `/exam-packages/${seg(id)}/copy`,
    ),
}
