import { h } from 'vue'
import type { ColumnDef } from '@tanstack/vue-table'
import { Badge } from '@mts241alikhlash/ui/badge'
import { Button } from '@mts241alikhlash/ui/button'
import type { ScheduleSession } from '../types'
import { sessionStatusLabel } from '../types'

export interface SessionColumnOptions {
  canRelease: boolean
  onRelease: (session: ScheduleSession) => void
}

const timeFormat = new Intl.DateTimeFormat('id-ID', {
  hour: '2-digit',
  minute: '2-digit',
})

const studentText = (session: ScheduleSession) =>
  [session.studentName ?? 'Siswa tidak ditemukan', session.studentNis]
    .filter(Boolean)
    .join(' · ')
const startedText = (session: ScheduleSession) =>
  timeFormat.format(new Date(session.startedAt))
const scoreText = (session: ScheduleSession) =>
  session.rawScore === null || session.maxScore === null
    ? '-'
    : `${session.rawScore} / ${session.maxScore}`
const deviceText = (session: ScheduleSession) =>
  session.status !== 'IN_PROGRESS'
    ? '-'
    : session.deviceBound
      ? 'Terikat'
      : 'Dilepas'

export function buildSessionColumns(
  options: SessionColumnOptions,
): ColumnDef<ScheduleSession>[] {
  return [
    {
      id: 'student',
      header: 'Siswa',
      meta: { align: 'left', strong: true },
      cell: ({ row }) => studentText(row.original),
    },
    {
      id: 'status',
      header: 'Status',
      meta: {
        align: 'center',
        mobileLabel: 'Status',
        mobileValue: (row: ScheduleSession) => sessionStatusLabel(row.status),
      },
      cell: ({ row }) =>
        h(
          Badge,
          { variant: row.original.status === 'GRADED' ? 'default' : 'outline' },
          () => sessionStatusLabel(row.original.status),
        ),
    },
    {
      id: 'started',
      header: 'Mulai',
      meta: {
        align: 'center',
        mobileLabel: 'Mulai',
        mobileValue: startedText,
      },
      cell: ({ row }) => startedText(row.original),
    },
    {
      id: 'score',
      header: 'Nilai',
      meta: {
        align: 'center',
        mobileLabel: 'Nilai',
        mobileValue: scoreText,
      },
      cell: ({ row }) => scoreText(row.original),
    },
    {
      id: 'device',
      header: 'Perangkat',
      meta: {
        align: 'center',
        mobileLabel: 'Perangkat',
        mobileValue: deviceText,
      },
      cell: ({ row }) => deviceText(row.original),
    },
    {
      id: 'actions',
      header: 'Aksi',
      enableSorting: false,
      cell: ({ row }) =>
        options.canRelease && row.original.status === 'IN_PROGRESS'
          ? h(
              Button,
              {
                size: 'sm',
                variant: 'outline',
                onClick: () => options.onRelease(row.original),
              },
              () => 'Lepas Sesi',
            )
          : null,
    },
  ]
}
