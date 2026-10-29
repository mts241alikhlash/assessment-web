import type { ColumnDef } from '@tanstack/vue-table'
import { typeLabel } from '@/features/exam-bank/types'
import type { ExamPackageItemView } from '../types'

const versionText = (item: ExamPackageItemView) => `v${item.questionVersion}`
const pointsText = (item: ExamPackageItemView) => String(item.points)

export function buildPackageItemColumns(): ColumnDef<ExamPackageItemView>[] {
  return [
    {
      id: 'position',
      header: 'No',
      meta: {
        align: 'center',
        mobileLabel: 'No',
        mobileValue: (row: ExamPackageItemView) => String(row.position),
      },
      cell: ({ row }) => row.original.position,
    },
    {
      id: 'summary',
      header: 'Soal',
      meta: { align: 'left', strong: true },
      cell: ({ row }) => row.original.summary || '-',
    },
    {
      id: 'type',
      header: 'Jenis',
      meta: {
        mobileLabel: 'Jenis',
        mobileValue: (row: ExamPackageItemView) => typeLabel(row.type),
      },
      cell: ({ row }) => typeLabel(row.original.type),
    },
    {
      id: 'points',
      header: 'Poin',
      meta: {
        align: 'center',
        mobileLabel: 'Poin',
        mobileValue: pointsText,
      },
      cell: ({ row }) => pointsText(row.original),
    },
    {
      id: 'version',
      header: 'Versi',
      meta: {
        align: 'center',
        mobileLabel: 'Versi',
        mobileValue: versionText,
      },
      cell: ({ row }) => versionText(row.original),
    },
  ]
}
