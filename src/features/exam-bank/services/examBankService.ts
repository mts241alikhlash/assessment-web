import { toast } from 'vue-sonner'
import { PAGINATION } from '@mts241alikhlash/web-shared/constants/pagination'
import { getIndonesianErrorMessage } from '@mts241alikhlash/web-shared/utils/error-handler'
import { subjectApi } from '@/features/lookup/subject'
import { examBankApi } from '../api/examBankApi'
import { useExamBankStore } from '../stores/examBankStore'
import type { QuestionStatus } from '../types'

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
}
