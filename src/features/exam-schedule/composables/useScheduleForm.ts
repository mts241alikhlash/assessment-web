import { computed, ref, watch } from 'vue'
import { examScheduleService } from '../services/examScheduleService'
import type { ExamSchedule } from '../types'
import { fromInstant, toInstant } from '../utils/instant'
import { validateSchedule } from '../utils/validateSchedule'

export type ScheduleFormOptions =
  { mode: 'create' } | { mode: 'edit'; schedule: ExamSchedule }

export function useScheduleForm(options: ScheduleFormOptions) {
  const start =
    options.mode === 'edit' ? fromInstant(options.schedule.startsAt) : null
  const end =
    options.mode === 'edit' ? fromInstant(options.schedule.endsAt) : null

  const multiDay = start !== null && end !== null && start.date !== end.date

  const packageId = ref('')
  const classroomId = ref('')
  const date = ref(start?.date ?? '')
  const startTime = ref(start?.time ?? '')
  const endTime = ref(end?.time ?? '')
  const durationMinutes = ref<number | null>(
    options.mode === 'edit' ? options.schedule.durationMinutes : 90,
  )
  const saving = ref(false)
  const error = ref<string | null>(null)

  watch(
    packageId,
    () => {
      classroomId.value = ''
    },
    { flush: 'sync' },
  )

  const problem = computed<string | null>(() => {
    if (multiDay) {
      return 'Jadwal ini berlangsung lebih dari satu hari dan hanya bisa diubah lewat API.'
    }
    if (options.mode === 'create') {
      if (!packageId.value) return 'Pilih paket'
      if (!classroomId.value) return 'Pilih kelas'
    }
    return validateSchedule({
      date: date.value,
      startTime: startTime.value,
      endTime: endTime.value,
      durationMinutes: durationMinutes.value,
    })
  })

  function window() {
    return {
      startsAt: toInstant(date.value, startTime.value),
      endsAt: toInstant(date.value, endTime.value),
      durationMinutes: durationMinutes.value ?? 0,
    }
  }

  async function submit(): Promise<ExamSchedule | null> {
    if (problem.value !== null || saving.value) return null
    saving.value = true
    error.value = null
    const result =
      options.mode === 'create'
        ? await examScheduleService.saveSchedule(
            { mode: 'create' },
            {
              packageId: packageId.value,
              classroomId: classroomId.value,
              ...window(),
            },
          )
        : await examScheduleService.saveSchedule(
            { mode: 'edit', id: options.schedule.id },
            window(),
          )
    saving.value = false
    if (!result.success) {
      error.value = result.error
      return null
    }
    return result.data
  }

  return {
    packageId,
    classroomId,
    date,
    startTime,
    endTime,
    durationMinutes,
    multiDay,
    saving,
    error,
    problem,
    submit,
  }
}
