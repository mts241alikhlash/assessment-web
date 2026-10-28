import { computed, type Ref } from 'vue'
import { keepPreviousData, useQuery } from '@tanstack/vue-query'
import { refDebounced } from '@vueuse/core'
import { getIndonesianErrorMessage } from '@mts241alikhlash/web-shared/utils/error-handler'
import { examPackageApi } from '../api/examPackageApi'

export function useCandidateList(
  subjectId: Ref<string>,
  gradeId: Ref<string>,
  search: Ref<string>,
  page: Ref<number>,
  pageSize = 8,
) {
  const debouncedSearch = refDebounced(search, 300)
  const enabled = computed(() => subjectId.value !== '' && gradeId.value !== '')

  const query = useQuery({
    queryKey: [
      'exam-package',
      'candidates',
      subjectId,
      gradeId,
      debouncedSearch,
      page,
    ],
    enabled,
    queryFn: async () =>
      (
        await examPackageApi.getCandidates({
          subjectId: subjectId.value,
          gradeId: gradeId.value,
          search: debouncedSearch.value.trim() || undefined,
          page: page.value,
          limit: pageSize,
        })
      ).data,
    placeholderData: keepPreviousData,
  })

  return {
    enabled,
    stale: query.isPlaceholderData,
    candidates: computed(() => query.data.value?.data ?? []),
    totalItems: computed(() => query.data.value?.meta?.total ?? 0),
    loading: query.isPending,
    pageSize,
    error: computed(() =>
      query.error.value
        ? getIndonesianErrorMessage(
            query.error.value,
            'Gagal memuat daftar soal.',
          )
        : null,
    ),
  }
}
