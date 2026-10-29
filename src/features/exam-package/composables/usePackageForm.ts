import { computed, ref, watch } from 'vue'
import { examPackageService } from '../services/examPackageService'
import type { ExamPackageView, PackageCandidate } from '../types'

export type PackageFormOptions =
  { mode: 'create' } | { mode: 'edit'; id: string }

export function usePackageForm(options: PackageFormOptions) {
  const title = ref('')
  const subjectId = ref('')
  const gradeId = ref('')
  const selected = ref<PackageCandidate[]>([])
  const loading = ref(false)
  const saving = ref(false)
  const locked = ref(false)
  const error = ref<string | null>(null)
  const loadError = ref<string | null>(null)

  watch(
    [subjectId, gradeId],
    () => {
      if (options.mode === 'create') selected.value = []
    },
    { flush: 'sync' },
  )

  const totalPoints = computed(() =>
    selected.value.reduce((sum, item) => sum + item.points, 0),
  )

  const canSubmit = computed(
    () =>
      !locked.value &&
      loadError.value === null &&
      !saving.value &&
      title.value.trim().length > 0 &&
      subjectId.value !== '' &&
      gradeId.value !== '' &&
      selected.value.length > 0,
  )

  const isSelected = (id: string) =>
    selected.value.some((item) => item.id === id)

  function toggle(candidate: PackageCandidate) {
    selected.value = isSelected(candidate.id)
      ? selected.value.filter((item) => item.id !== candidate.id)
      : [...selected.value, candidate]
  }

  function move(index: number, delta: -1 | 1) {
    const target = index + delta
    if (target < 0 || target >= selected.value.length) return
    const next = [...selected.value]
    ;[next[index], next[target]] = [next[target], next[index]]
    selected.value = next
  }

  function remove(index: number) {
    selected.value = selected.value.filter((_, position) => position !== index)
  }

  async function load(): Promise<void> {
    if (options.mode !== 'edit') return
    loading.value = true
    loadError.value = null
    let found: ExamPackageView | null = null
    try {
      found = await examPackageService.loadPackage(options.id)
    } catch {
      loadError.value = 'Paket tidak dapat dimuat. Coba lagi.'
    }
    loading.value = false
    if (loadError.value !== null) return
    if (found === null) {
      loadError.value = 'Paket tidak ditemukan.'
      return
    }
    title.value = found.title
    subjectId.value = found.subjectId
    gradeId.value = found.gradeId
    selected.value = found.items.map((item) => ({
      id: item.questionId,
      type: item.type,
      summary: item.summary,
      points: item.points,
      approvedVersion: item.questionVersion,
    }))
    locked.value = found.status === 'LOCKED'
  }

  async function submit(): Promise<ExamPackageView | null> {
    if (!canSubmit.value) return null
    saving.value = true
    error.value = null
    const questionIds = selected.value.map((item) => item.id)
    const result =
      options.mode === 'create'
        ? await examPackageService.savePackage(
            { mode: 'create' },
            {
              title: title.value.trim(),
              subjectId: subjectId.value,
              gradeId: gradeId.value,
              questionIds,
            },
          )
        : await examPackageService.savePackage(
            { mode: 'edit', id: options.id },
            { title: title.value.trim(), questionIds },
          )
    saving.value = false
    if (!result.success) {
      error.value = result.error
      return null
    }
    return result.data
  }

  return {
    title,
    subjectId,
    gradeId,
    selected,
    loading,
    saving,
    locked,
    error,
    loadError,
    totalPoints,
    canSubmit,
    isSelected,
    toggle,
    move,
    remove,
    load,
    submit,
  }
}
