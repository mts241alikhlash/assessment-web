import { h } from 'vue'
import type { ColumnDef } from '@tanstack/vue-table'
import { ActionCell } from '@mts241alikhlash/ui'
import { Badge } from '@mts241alikhlash/ui/badge'
import { Ban, KeyRound } from '@lucide/vue'
import type { ExamSchedule } from '../types'
import { phaseLabel, phaseTone } from '../types'
import { formatWindow } from '../utils/formatWindow'
import { schedulePhase } from '../utils/schedulePhase'

export interface ScheduleColumnOptions {
  canUpdate: boolean
  canCancel: boolean
  canAccessCode: boolean
  now: () => Date
  onEdit: (schedule: ExamSchedule) => void
  onCancel: (schedule: ExamSchedule) => void
  onAccessCode: (schedule: ExamSchedule) => void
}

const BADGE_VARIANT = {
  neutral: 'outline',
  info: 'secondary',
  success: 'default',
  warning: 'destructive',
} as const

const classroomText = (schedule: ExamSchedule) => schedule.classroomName ?? '-'
const windowText = (schedule: ExamSchedule) =>
  formatWindow(schedule.startsAt, schedule.endsAt)
const durationText = (schedule: ExamSchedule) =>
  `${schedule.durationMinutes} menit`

export function buildScheduleColumns(
  options: ScheduleColumnOptions,
): ColumnDef<ExamSchedule>[] {
  const phase = (schedule: ExamSchedule) =>
    schedulePhase(schedule, options.now())

  return [
    {
      id: 'package',
      header: 'Paket',
      meta: { align: 'left', strong: true },
      cell: ({ row }) => row.original.packageTitle,
    },
    {
      id: 'classroom',
      header: 'Kelas',
      meta: { mobileLabel: 'Kelas', mobileValue: classroomText },
      cell: ({ row }) => classroomText(row.original),
    },
    {
      id: 'window',
      header: 'Waktu',
      meta: { mobileLabel: 'Waktu', mobileValue: windowText },
      cell: ({ row }) => windowText(row.original),
    },
    {
      id: 'duration',
      header: 'Durasi',
      meta: {
        align: 'center',
        mobileLabel: 'Durasi',
        mobileValue: durationText,
      },
      cell: ({ row }) => durationText(row.original),
    },
    {
      id: 'phase',
      header: 'Status',
      meta: {
        align: 'center',
        mobileLabel: 'Status',
        mobileValue: (row: ExamSchedule) => phaseLabel(phase(row)),
      },
      cell: ({ row }) =>
        h(
          Badge,
          { variant: BADGE_VARIANT[phaseTone(phase(row.original))] },
          () => phaseLabel(phase(row.original)),
        ),
    },
    {
      id: 'actions',
      header: 'Aksi',
      enableSorting: false,
      cell: ({ row }) => {
        const current = phase(row.original)
        const canChange = current === 'UPCOMING' || current === 'RUNNING'
        const items = []
        if (canChange && options.canAccessCode) {
          items.push({
            label: 'Token',
            icon: KeyRound,
            onClick: () => options.onAccessCode(row.original),
          })
        }
        if (current === 'UPCOMING' && options.canCancel) {
          items.push({
            label: 'Batalkan',
            icon: Ban,
            destructive: true,
            onClick: () => options.onCancel(row.original),
          })
        }
        return h(ActionCell, {
          editLabel: 'Ubah',
          hideEdit: !canChange || !options.canUpdate,
          hideDelete: true,
          items,
          onEdit: () => options.onEdit(row.original),
        })
      },
    },
  ]
}
