import { computed, type Ref } from 'vue'
import { refDebounced } from '@vueuse/core'
import { examBankApi } from '../api/examBankApi'
import type { QuestionStatus, QuestionType } from '../types'
import { usePagedList } from './usePagedList'

export interface QuestionFilters {
  search: Ref<string>
  subjectId: Ref<string>
  gradeId: Ref<string>
  type: Ref<string>
  status: Ref<string>
  authorId: Ref<string>
}

const unless = (value: string) => (value === 'ALL' ? undefined : value)

export function useQuestionList(
  filters: QuestionFilters,
  page: Ref<number>,
  pageSize: Ref<number>,
  scope: string[] = ['exam-bank', 'questions'],
  fixedStatus?: QuestionStatus,
) {
  const debouncedSearch = refDebounced(filters.search, 300)

  const list = usePagedList({
    page,
    pageSize,
    scope,
    filters: {
      search: debouncedSearch,
      subjectId: filters.subjectId,
      gradeId: filters.gradeId,
      type: filters.type,
      status: filters.status,
      authorId: filters.authorId,
    },
    fetchPage: async (current, limit) =>
      (
        await examBankApi.getQuestions({
          page: current,
          limit,
          search: debouncedSearch.value.trim() || undefined,
          subjectId: unless(filters.subjectId.value),
          gradeId: unless(filters.gradeId.value),
          type: unless(filters.type.value) as QuestionType | undefined,
          status:
            fixedStatus ??
            (unless(filters.status.value) as QuestionStatus | undefined),
          authorEmployeeId: unless(filters.authorId.value),
        })
      ).data,
    errorMessage: 'Gagal memuat daftar soal.',
  })

  return {
    ...list,
    filtersPending: computed(
      () =>
        filters.search.value !== debouncedSearch.value ||
        list.isPlaceholderData.value,
    ),
    questions: list.items,
  }
}
