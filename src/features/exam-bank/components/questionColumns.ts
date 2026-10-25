import { h } from 'vue'
import type { ColumnDef } from '@tanstack/vue-table'
import { ActionCell } from '@mts241alikhlash/ui'
import { Badge } from '@mts241alikhlash/ui/badge'
import { Send } from '@lucide/vue'
import type { QuestionSummary } from '../types'
import { statusLabel, statusTone, typeLabel } from '../types'
import { plainExcerpt } from '../utils/plainText'

export interface QuestionColumnOptions {
  subjectName: (id: string) => string
  gradeName: (id: string) => string
  canUpdate: boolean
  canDelete: boolean
  canModify: (question: QuestionSummary) => boolean
  onEdit: (question: QuestionSummary) => void
  onSubmit: (question: QuestionSummary) => void | Promise<void>
  onDelete: (
    question: QuestionSummary,
    controls: { closeAlert: () => void; setLoading: (state: boolean) => void },
  ) => void | Promise<void>
}

const BADGE_VARIANT = {
  neutral: 'outline',
  info: 'secondary',
  success: 'default',
  warning: 'destructive',
} as const

export function versionLabel(question: QuestionSummary): string {
  const current = `v${question.currentVersion}`
  return question.approvedVersion !== null &&
    question.approvedVersion !== question.currentVersion
    ? `${current} (disetujui v${question.approvedVersion})`
    : current
}

export function canSubmit(question: QuestionSummary): boolean {
  return question.status === 'DRAFT' || question.status === 'RETURNED'
}

export function buildQuestionColumns(
  options: QuestionColumnOptions,
): ColumnDef<QuestionSummary>[] {
  return [
    {
      id: 'body',
      header: 'Soal',
      meta: { align: 'left', strong: true },
      cell: ({ row }) => plainExcerpt(row.original.bodyHtml) || '-',
    },
    {
      id: 'type',
      header: 'Jenis',
      meta: {
        mobileLabel: 'Jenis',
        mobileValue: (row: QuestionSummary) => typeLabel(row.type),
      },
      cell: ({ row }) => typeLabel(row.original.type),
    },
    {
      id: 'subject',
      header: 'Mapel',
      meta: {
        mobileLabel: 'Mapel',
        mobileValue: (row: QuestionSummary) =>
          options.subjectName(row.subjectId),
      },
      cell: ({ row }) => options.subjectName(row.original.subjectId),
    },
    {
      id: 'grade',
      header: 'Tingkat',
      meta: {
        mobileLabel: 'Tingkat',
        mobileValue: (row: QuestionSummary) => options.gradeName(row.gradeId),
      },
      cell: ({ row }) => options.gradeName(row.original.gradeId),
    },
    {
      id: 'author',
      header: 'Penulis',
      meta: {
        mobileLabel: 'Penulis',
        mobileValue: (row: QuestionSummary) => row.authorName ?? '-',
      },
      cell: ({ row }) => row.original.authorName ?? '-',
    },
    {
      id: 'status',
      header: 'Status',
      meta: {
        align: 'center',
        mobileLabel: 'Status',
        mobileValue: (row: QuestionSummary) => statusLabel(row.status),
      },
      cell: ({ row }) =>
        h(
          Badge,
          { variant: BADGE_VARIANT[statusTone(row.original.status)] },
          () => statusLabel(row.original.status),
        ),
    },
    {
      id: 'version',
      header: 'Versi',
      meta: {
        align: 'center',
        mobileLabel: 'Versi',
        mobileValue: (row: QuestionSummary) => versionLabel(row),
      },
      cell: ({ row }) => versionLabel(row.original),
    },
    {
      id: 'actions',
      header: 'Aksi',
      enableSorting: false,
      cell: ({ row }) => {
        const mine = options.canModify(row.original)
        const mayChange = options.canUpdate && mine
        return h(ActionCell, {
          editLabel: 'Ubah',
          hideEdit: !mayChange,
          viewLabel: mayChange ? undefined : 'Lihat',
          hideDelete:
            !options.canDelete ||
            !mine ||
            row.original.approvedVersion !== null,
          deleteTitle: 'Hapus soal?',
          deleteDescription:
            'Soal yang dihapus tidak muncul lagi di bank soal.',
          items: mayChange
            ? [
                {
                  label: 'Kirim untuk persetujuan',
                  icon: Send,
                  disabled: !canSubmit(row.original),
                  onClick: () => {
                    void options.onSubmit(row.original)
                  },
                },
              ]
            : [],
          onEdit: () => options.onEdit(row.original),
          onView: () => options.onEdit(row.original),
          onDelete: (controls: {
            closeAlert: () => void
            setLoading: (state: boolean) => void
          }) => {
            void options.onDelete(row.original, controls)
          },
        })
      },
    },
  ]
}
