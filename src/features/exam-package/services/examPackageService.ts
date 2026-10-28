import { toast } from 'vue-sonner'
import { PAGINATION } from '@mts241alikhlash/web-shared/constants/pagination'
import { getIndonesianErrorMessage } from '@mts241alikhlash/web-shared/utils/error-handler'
import { messageOf, statusOf } from '../utils/messageOf'
import { examBankApi } from '@/features/exam-bank/api/examBankApi'
import { subjectApi } from '@/features/lookup/subject'
import { examPackageApi } from '../api/examPackageApi'
import { useExamPackageStore } from '../stores/examPackageStore'
import type {
  ExamPackageCreatePayload,
  ExamPackagePayload,
  ExamPackageView,
} from '../types'

export type SaveResult =
  { success: true; data: ExamPackageView } | { success: false; error: string }

export type SaveTarget = { mode: 'create' } | { mode: 'edit'; id: string }

export const examPackageService = {
  async loadReferences(): Promise<void> {
    const store = useExamPackageStore()
    try {
      const [subjectRes, gradeRes] = await Promise.all([
        subjectApi.getSubjects({ limit: PAGINATION.REFERENCE_LIMIT }),
        examBankApi.getGrades({ limit: PAGINATION.REFERENCE_LIMIT }),
      ])
      store.subjects = subjectRes.data?.data ?? []
      store.grades = gradeRes.data?.data ?? []
    } catch (err: unknown) {
      toast.error(
        getIndonesianErrorMessage(err, 'Gagal memuat mapel dan tingkat.'),
      )
    }
  },

  async copyPackage(id: string): Promise<ExamPackageView | null> {
    try {
      const response = await examPackageApi.copyPackage(id)
      toast.success('Paket disalin sebagai draf baru.')
      return response.data.data
    } catch (err: unknown) {
      toast.error(messageOf(err, 'Gagal menyalin paket.'))
      return null
    }
  },

  async deletePackage(id: string): Promise<boolean> {
    try {
      await examPackageApi.deletePackage(id)
      toast.success('Paket dihapus.')
      return true
    } catch (err: unknown) {
      toast.error(messageOf(err, 'Gagal menghapus paket.'))
      return false
    }
  },

  async loadPackage(id: string): Promise<ExamPackageView | null> {
    try {
      const response = await examPackageApi.getPackage(id)
      return response.data?.data ?? null
    } catch (err: unknown) {
      if (statusOf(err) === 404) return null
      toast.error(getIndonesianErrorMessage(err, 'Gagal memuat paket.'))
      throw err
    }
  },

  async savePackage(
    target: SaveTarget,
    payload: ExamPackageCreatePayload | ExamPackagePayload,
  ): Promise<SaveResult> {
    try {
      const response =
        target.mode === 'create'
          ? await examPackageApi.createPackage(
              payload as ExamPackageCreatePayload,
            )
          : await examPackageApi.updatePackage(target.id, payload)
      return { success: true, data: response.data.data }
    } catch (err: unknown) {
      return {
        success: false,
        error: messageOf(err, 'Gagal menyimpan paket.'),
      }
    }
  },
}
