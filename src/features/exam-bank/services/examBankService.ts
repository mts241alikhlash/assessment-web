import { toast } from 'vue-sonner'
import { PAGINATION } from '@mts241alikhlash/web-shared/constants/pagination'
import { getIndonesianErrorMessage } from '@mts241alikhlash/web-shared/utils/error-handler'
import { subjectApi } from '@/features/lookup/subject'
import { loadAssignments } from '@/features/lookup/teaching-assignment'
import { examBankApi } from '../api/examBankApi'
import { useExamBankStore } from '../stores/examBankStore'
import type {
  NamedOption,
  QuestionCreatePayload,
  QuestionDetail,
  QuestionStatus,
  QuestionUpdatePayload,
} from '../types'

export type SaveResult =
  { success: true; data: QuestionDetail } | { success: false; error: string }

export const examBankService = {
  async loadReferences() {
    const store = useExamBankStore()
    try {
      const response = await examBankApi.getScope()
      store.scope = response.data?.data ?? { all: false, pairs: [] }
      if (store.scope.all) {
        const [subjectRes, gradeRes] = await Promise.all([
          subjectApi.getSubjects({ limit: PAGINATION.REFERENCE_LIMIT }),
          examBankApi.getGrades({ limit: PAGINATION.REFERENCE_LIMIT }),
        ])
        store.subjects = subjectRes.data?.data ?? []
        store.grades = gradeRes.data?.data ?? []
      }
      store.scopeLoaded = true
    } catch (err: unknown) {
      toast.error(
        getIndonesianErrorMessage(err, 'Gagal memuat mapel dan tingkat.'),
      )
    }
  },

  async loadAuthors(status?: QuestionStatus) {
    const store = useExamBankStore()
    try {
      const response = await examBankApi.getAuthors(status)
      store.authors = response.data?.data ?? []
    } catch (err: unknown) {
      toast.error(getIndonesianErrorMessage(err, 'Gagal memuat penulis soal.'))
    }
  },

  async submitQuestion(id: string): Promise<boolean> {
    try {
      await examBankApi.submitQuestion(id)
      toast.success('Soal diajukan untuk persetujuan.')
      return true
    } catch (err: unknown) {
      toast.error(getIndonesianErrorMessage(err, 'Gagal mengajukan soal.'))
      return false
    }
  },

  async deleteQuestion(id: string): Promise<boolean> {
    try {
      await examBankApi.deleteQuestion(id)
      toast.success('Soal dihapus.')
      return true
    } catch (err: unknown) {
      toast.error(getIndonesianErrorMessage(err, 'Gagal menghapus soal.'))
      return false
    }
  },

  async loadQuestion(id: string): Promise<QuestionDetail | null> {
    try {
      const response = await examBankApi.getQuestion(id)
      return response.data?.data ?? null
    } catch (err: unknown) {
      toast.error(getIndonesianErrorMessage(err, 'Gagal memuat soal.'))
      return null
    }
  },

  async createQuestion(payload: QuestionCreatePayload): Promise<SaveResult> {
    try {
      const response = await examBankApi.createQuestion(payload)
      return { success: true, data: response.data.data }
    } catch (err: unknown) {
      return {
        success: false,
        error: getIndonesianErrorMessage(err, 'Gagal menyimpan soal.'),
      }
    }
  },

  async updateQuestion(
    id: string,
    payload: QuestionUpdatePayload,
  ): Promise<SaveResult> {
    try {
      const response = await examBankApi.updateQuestion(id, payload)
      return { success: true, data: response.data.data }
    } catch (err: unknown) {
      return {
        success: false,
        error: getIndonesianErrorMessage(err, 'Gagal menyimpan soal.'),
      }
    }
  },

  async loadTeachers(subjectId: string): Promise<NamedOption[]> {
    try {
      const { rows } = await loadAssignments({
        subjectId,
        limit: PAGINATION.REFERENCE_LIMIT,
      })
      const teachers = new Map<string, string>()
      for (const row of rows) {
        teachers.set(
          row.employeeId,
          row.employee?.user?.profile?.name ?? row.employee?.nip ?? '-',
        )
      }
      return [...teachers]
        .map(([id, name]) => ({ id, name }))
        .sort((a, b) => a.name.localeCompare(b.name, 'id'))
    } catch (err: unknown) {
      toast.error(getIndonesianErrorMessage(err, 'Gagal memuat daftar guru.'))
      return []
    }
  },
}
