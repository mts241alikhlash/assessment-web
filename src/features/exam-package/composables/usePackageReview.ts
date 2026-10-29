import { computed, ref, toValue, type MaybeRefOrGetter } from 'vue'
import type { QuestionDetail } from '@/features/exam-bank/types'
import { examPackageService } from '../services/examPackageService'
import type { ExamPackageView } from '../types'

const BATCH = 8

export function usePackageReview(id: MaybeRefOrGetter<string>) {
  const pkg = ref<ExamPackageView | null>(null)
  const questions = ref<Record<string, QuestionDetail>>({})
  const notes = ref<Record<string, string>>({})
  const loading = ref(true)
  const loadFailed = ref(false)
  const notFound = ref(false)
  const busy = ref(false)
  const error = ref<string | null>(null)

  const canReview = computed(() => pkg.value?.status === 'SUBMITTED')

  async function load() {
    loading.value = true
    loadFailed.value = false
    notFound.value = false
    questions.value = {}
    try {
      pkg.value = await examPackageService.loadPackage(toValue(id))
      notFound.value = pkg.value === null
      const items = pkg.value?.items ?? []
      for (let start = 0; start < items.length; start += BATCH) {
        const found = await Promise.all(
          items
            .slice(start, start + BATCH)
            .map((item) =>
              examPackageService.loadQuestion(toValue(id), item.questionId),
            ),
        )
        found.forEach((question, index) => {
          if (question) {
            questions.value = {
              ...questions.value,
              [items[start + index].questionId]: question,
            }
          }
        })
      }
    } catch {
      pkg.value = null
      loadFailed.value = true
    }
    loading.value = false
  }

  function setNote(questionId: string, text: string) {
    notes.value = { ...notes.value, [questionId]: text }
  }

  async function approve(note?: string): Promise<boolean> {
    if (busy.value) return false
    busy.value = true
    error.value = null
    const result = await examPackageService.approve(
      toValue(id),
      note?.trim() ? note.trim() : undefined,
    )
    busy.value = false
    if (!result.success) error.value = result.error
    return result.success
  }

  async function returnPackage(note: string): Promise<boolean> {
    const general = note.trim()
    if (general === '') {
      error.value = 'Catatan wajib diisi'
      return false
    }
    if (busy.value) return false
    const inPackage = new Set((pkg.value?.items ?? []).map((i) => i.questionId))
    const questionNotes = Object.entries(notes.value)
      .filter(
        ([questionId, text]) => inPackage.has(questionId) && text.trim() !== '',
      )
      .map(([questionId, text]) => ({ questionId, note: text.trim() }))
    busy.value = true
    error.value = null
    const result = await examPackageService.returnPackage(toValue(id), {
      note: general,
      questionNotes,
    })
    busy.value = false
    if (!result.success) error.value = result.error
    return result.success
  }

  return {
    pkg,
    questions,
    notes,
    loading,
    loadFailed,
    notFound,
    busy,
    error,
    canReview,
    load,
    setNote,
    approve,
    returnPackage,
  }
}
