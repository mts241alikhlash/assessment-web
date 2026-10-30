import { computed, onUnmounted, ref } from 'vue'
import { studentExamService } from '../services/studentExamService'
import { countAnswered, formatRemaining, isAnswered } from '../logic/exam'
import type { AnswerPayload, PaperQuestion } from '../types'

export interface UseExamSessionOptions {
  onExpired?: () => void
}

/**
 * State satu sesi ujian. Jawaban disimpan ke server per soal; antrean lokal
 * menjaga urutan kirim dan mencegah dua request untuk soal yang sama berjalan
 * bersamaan.
 */
export function useExamSession(options: UseExamSessionOptions = {}) {
  const questions = ref<PaperQuestion[]>([])
  const answers = ref(new Map<string, AnswerPayload>())
  const loading = ref(true)
  const error = ref<string | null>(null)
  const saving = ref(new Set<string>())
  const submitted = ref(false)
  const remaining = ref(0)

  let deadline = 0
  let offset = 0
  let ticker: ReturnType<typeof setInterval> | null = null

  const answeredCount = computed(() =>
    countAnswered(questions.value, answers.value),
  )
  const remainingLabel = computed(() => formatRemaining(remaining.value))
  const expired = computed(() => remaining.value <= 0)

  function startClock(nextDeadline: number, serverTime: number) {
    deadline = nextDeadline
    offset = serverTime - Date.now()
    const tick = () => {
      remaining.value = Math.max(0, deadline - (Date.now() + offset))
      if (remaining.value <= 0) {
        stopClock()
        options.onExpired?.()
      }
    }
    tick()
    stopClock()
    ticker = setInterval(tick, 1000)
  }

  function stopClock() {
    if (ticker !== null) {
      clearInterval(ticker)
      ticker = null
    }
  }

  async function load(sessionId: string) {
    loading.value = true
    error.value = null
    try {
      const [paper, saved] = await Promise.all([
        studentExamService.getQuestions(sessionId),
        studentExamService.getAnswers(sessionId),
      ])
      questions.value = paper
      const restored = new Map<string, AnswerPayload>()
      for (const row of saved) {
        if (row.answer) restored.set(row.questionId, row.answer)
      }
      answers.value = restored
    } catch (cause) {
      error.value =
        cause instanceof Error ? cause.message : 'Soal gagal dimuat.'
    } finally {
      loading.value = false
    }
  }

  async function answer(
    sessionId: string,
    question: PaperQuestion,
    payload: AnswerPayload,
  ) {
    answers.value.set(question.id, payload)
    answers.value = new Map(answers.value)
    saving.value = new Set(saving.value).add(question.id)
    try {
      await studentExamService.saveAnswer(sessionId, question.id, payload)
    } catch (cause) {
      error.value =
        cause instanceof Error ? cause.message : 'Jawaban gagal disimpan.'
      throw cause
    } finally {
      const next = new Set(saving.value)
      next.delete(question.id)
      saving.value = next
    }
  }

  async function submit(sessionId: string) {
    await studentExamService.submit(sessionId)
    submitted.value = true
    stopClock()
  }

  onUnmounted(stopClock)

  return {
    questions,
    answers,
    loading,
    error,
    saving,
    submitted,
    remaining,
    remainingLabel,
    answeredCount,
    expired,
    startClock,
    stopClock,
    load,
    answer,
    submit,
    isAnswered,
  }
}
