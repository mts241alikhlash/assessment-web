import { computed, ref } from 'vue'
import { examScheduleService } from '../services/examScheduleService'
import type { Absentee, ExamSchedule, MakeupReason } from '../types'
import { toInstant } from '../utils/instant'
import { validateSchedule } from '../utils/validateSchedule'

export function useMakeupForm(original: ExamSchedule) {
  const absentees = ref<Absentee[]>([])
  const loading = ref(false)
  const loadError = ref<string | null>(null)
  const selected = ref<Set<string>>(new Set())
  const reason = ref<MakeupReason>('SICK')
  const packageId = ref(original.packageId)
  const date = ref('')
  const startTime = ref('')
  const endTime = ref('')
  const durationMinutes = ref<number | null>(original.durationMinutes)
  const saving = ref(false)
  const error = ref<string | null>(null)

  async function load() {
    loading.value = true
    loadError.value = null
    const result = await examScheduleService.loadAbsentees(original.id)
    loading.value = false
    if (result.success) {
      absentees.value = result.data
    } else {
      absentees.value = []
      loadError.value = result.error
    }
  }

  const eligible = (studentId: string) =>
    absentees.value.some((row) => row.studentId === studentId && row.eligible)

  function toggle(studentId: string) {
    if (!eligible(studentId)) return
    const next = new Set(selected.value)
    if (next.has(studentId)) next.delete(studentId)
    else next.add(studentId)
    selected.value = next
  }

  function selectAll() {
    selected.value = new Set(
      absentees.value.filter((row) => row.eligible).map((row) => row.studentId),
    )
  }

  function clear() {
    selected.value = new Set()
  }

  const problem = computed<string | null>(() => {
    if (selected.value.size === 0) return 'Pilih minimal satu siswa'
    const invalid = validateSchedule({
      date: date.value,
      startTime: startTime.value,
      endTime: endTime.value,
      durationMinutes: durationMinutes.value,
    })
    if (invalid !== null) return invalid
    if (
      new Date(toInstant(date.value, startTime.value)).getTime() <
      new Date(original.endsAt).getTime()
    ) {
      return 'Susulan harus dimulai setelah ujian utama berakhir'
    }
    return null
  })

  async function submit(): Promise<ExamSchedule | null> {
    if (problem.value !== null || saving.value) return null
    saving.value = true
    error.value = null
    const result = await examScheduleService.createMakeup(original.id, {
      packageId: packageId.value,
      startsAt: toInstant(date.value, startTime.value),
      endsAt: toInstant(date.value, endTime.value),
      durationMinutes: durationMinutes.value ?? 0,
      participants: [...selected.value].map((studentId) => ({
        studentId,
        reason: reason.value,
      })),
    })
    saving.value = false
    if (!result.success) {
      error.value = result.error
      return null
    }
    return result.data
  }

  return {
    absentees,
    loading,
    loadError,
    selected,
    reason,
    packageId,
    date,
    startTime,
    endTime,
    durationMinutes,
    saving,
    error,
    problem,
    load,
    toggle,
    selectAll,
    clear,
    submit,
  }
}
