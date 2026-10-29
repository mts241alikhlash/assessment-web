import { describe, expect, it, vi } from 'vitest'
import type { VNode } from 'vue'
import { buildPackageColumns } from './packageColumns'
import type { ExamPackageSummary } from '../types'

const pkg = (
  overrides: Partial<ExamPackageSummary> = {},
): ExamPackageSummary => ({
  id: 'p1',
  title: 'UTS Matematika',
  subjectId: 'math',
  gradeId: 'g7',
  status: 'DRAFT',
  lockedAt: null,
  createdById: 'u1',
  createdAt: '2026-10-30T00:00:00.000Z',
  updatedAt: '2026-10-30T00:00:00.000Z',
  itemCount: 12,
  ...overrides,
})

function columns(
  overrides: Partial<Parameters<typeof buildPackageColumns>[0]> = {},
) {
  return buildPackageColumns({
    subjectName: (id) => (id === 'math' ? 'Matematika' : '-'),
    gradeName: (id) => (id === 'g7' ? 'Kelas 7' : '-'),
    canDelete: true,
    canCopy: true,
    onOpen: vi.fn(),
    onCopy: vi.fn(),
    onDelete: vi.fn(),
    ...overrides,
  })
}

function actions(
  options: Partial<Parameters<typeof buildPackageColumns>[0]>,
  row: ExamPackageSummary,
) {
  const column = columns(options).find((item) => item.id === 'actions')!
  const cell = column.cell as (ctx: {
    row: { original: ExamPackageSummary }
  }) => VNode
  return cell({ row: { original: row } }).props as Record<string, unknown>
}

describe('buildPackageColumns', () => {
  it('shows title, subject, grade, item count and status', () => {
    const built = columns()
    const text = (id: string) => {
      const column = built.find((item) => item.id === id)!
      const meta = column.meta as {
        mobileValue?: (row: ExamPackageSummary) => string
      }
      return meta.mobileValue?.(pkg())
    }

    expect(built.map((column) => column.id)).toEqual([
      'title',
      'subject',
      'grade',
      'items',
      'status',
      'actions',
    ])
    expect(text('subject')).toBe('Matematika')
    expect(text('grade')).toBe('Kelas 7')
    expect(text('items')).toBe('12 soal')
    expect(text('status')).toBe('Draf')
  })

  it('offers delete only for a draft and only with the permission', () => {
    expect(actions({}, pkg()).hideDelete).toBe(false)
    expect(actions({}, pkg({ status: 'LOCKED' })).hideDelete).toBe(true)
    expect(actions({ canDelete: false }, pkg()).hideDelete).toBe(true)
  })

  it('offers a copy entry only with the permission', () => {
    const withCopy = actions({}, pkg()).items as { label: string }[]
    const without = actions({ canCopy: false }, pkg()).items as {
      label: string
    }[]

    expect(withCopy.map((entry) => entry.label)).toEqual(['Salin'])
    expect(without).toEqual([])
  })

  it('opens a package for viewing and hides the edit entry', () => {
    const props = actions({}, pkg())

    expect(props.viewLabel).toBe('Lihat')
    expect(props.hideEdit).toBe(true)
  })
})
