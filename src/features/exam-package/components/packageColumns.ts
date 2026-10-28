import { h } from 'vue'
import type { ColumnDef } from '@tanstack/vue-table'
import { ActionCell } from '@mts241alikhlash/ui'
import { Badge } from '@mts241alikhlash/ui/badge'
import { Copy } from '@lucide/vue'
import type { ExamPackageSummary } from '../types'
import { packageStatusLabel, packageStatusTone } from '../types'

export interface PackageColumnOptions {
  subjectName: (id: string) => string
  gradeName: (id: string) => string
  canDelete: boolean
  canCopy: boolean
  onOpen: (pkg: ExamPackageSummary) => void
  onCopy: (pkg: ExamPackageSummary) => void | Promise<void>
  onDelete: (
    pkg: ExamPackageSummary,
    controls: { closeAlert: () => void; setLoading: (state: boolean) => void },
  ) => void | Promise<void>
}

const BADGE_VARIANT = {
  neutral: 'outline',
  info: 'secondary',
  success: 'default',
  warning: 'destructive',
} as const

const itemsLabel = (pkg: ExamPackageSummary) => `${pkg.itemCount} soal`

export function buildPackageColumns(
  options: PackageColumnOptions,
): ColumnDef<ExamPackageSummary>[] {
  return [
    {
      id: 'title',
      header: 'Paket',
      meta: { align: 'left', strong: true },
      cell: ({ row }) => row.original.title,
    },
    {
      id: 'subject',
      header: 'Mapel',
      meta: {
        mobileLabel: 'Mapel',
        mobileValue: (row: ExamPackageSummary) =>
          options.subjectName(row.subjectId),
      },
      cell: ({ row }) => options.subjectName(row.original.subjectId),
    },
    {
      id: 'grade',
      header: 'Tingkat',
      meta: {
        mobileLabel: 'Tingkat',
        mobileValue: (row: ExamPackageSummary) =>
          options.gradeName(row.gradeId),
      },
      cell: ({ row }) => options.gradeName(row.original.gradeId),
    },
    {
      id: 'items',
      header: 'Jumlah Soal',
      meta: {
        align: 'center',
        mobileLabel: 'Jumlah Soal',
        mobileValue: (row: ExamPackageSummary) => itemsLabel(row),
      },
      cell: ({ row }) => itemsLabel(row.original),
    },
    {
      id: 'status',
      header: 'Status',
      meta: {
        align: 'center',
        mobileLabel: 'Status',
        mobileValue: (row: ExamPackageSummary) =>
          packageStatusLabel(row.status),
      },
      cell: ({ row }) =>
        h(
          Badge,
          { variant: BADGE_VARIANT[packageStatusTone(row.original.status)] },
          () => packageStatusLabel(row.original.status),
        ),
    },
    {
      id: 'actions',
      header: 'Aksi',
      enableSorting: false,
      cell: ({ row }) =>
        h(ActionCell, {
          hideEdit: true,
          viewLabel: 'Lihat',
          hideDelete: !options.canDelete || row.original.status !== 'DRAFT',
          deleteTitle: 'Hapus paket?',
          deleteDescription:
            'Paket yang dihapus tidak muncul lagi. Paket yang sudah dijadwalkan tidak bisa dihapus.',
          items: options.canCopy
            ? [
                {
                  label: 'Salin',
                  icon: Copy,
                  onClick: () => {
                    void options.onCopy(row.original)
                  },
                },
              ]
            : [],
          onView: () => options.onOpen(row.original),
          onDelete: (controls: {
            closeAlert: () => void
            setLoading: (state: boolean) => void
          }) => {
            void options.onDelete(row.original, controls)
          },
        }),
    },
  ]
}
