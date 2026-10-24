import { h } from 'vue'
import type { ColumnDef } from '@tanstack/vue-table'
import { ActionCell } from '@mts241alikhlash/ui'
import { Checkbox } from '@mts241alikhlash/ui/checkbox'
import type { QuestionSummary } from '../types'
import { typeLabel } from '../types'
import { plainExcerpt } from '../utils/plainText'

export interface ReviewColumnOptions {
  subjectName: (id: string) => string
  gradeName: (id: string) => string
  isSelected: (id: string) => boolean
  allSelected: () => boolean
  onToggle: (id: string, checked: boolean) => void
  onToggleAll: (checked: boolean) => void
  onReview: (question: QuestionSummary) => void
}

export function buildReviewColumns(
  options: ReviewColumnOptions,
): ColumnDef<QuestionSummary>[] {
  return [
    {
      id: 'select',
      header: () =>
        h(Checkbox, {
          modelValue: options.allSelected(),
          'aria-label': 'Pilih semua',
          'onUpdate:modelValue': (checked: boolean | 'indeterminate') =>
            options.onToggleAll(checked === true),
        }),
      cell: ({ row }) =>
        h(Checkbox, {
          modelValue: options.isSelected(row.original.id),
          'aria-label': `Pilih soal ${plainExcerpt(row.original.bodyHtml, 30)}`,
          'onUpdate:modelValue': (checked: boolean | 'indeterminate') =>
            options.onToggle(row.original.id, checked === true),
        }),
      meta: { align: 'left' },
      enableSorting: false,
    },
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
      id: 'actions',
      header: 'Aksi',
      enableSorting: false,
      cell: ({ row }) =>
        h(ActionCell, {
          viewLabel: 'Tinjau',
          hideEdit: true,
          hideDelete: true,
          onView: () => options.onReview(row.original),
        }),
    },
  ]
}
