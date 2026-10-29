import { beforeEach, describe, expect, it, vi } from 'vitest'
import { usePackageForm } from './usePackageForm'
import type { ExamPackageView, PackageCandidate } from '../types'

const { savePackage, loadPackage } = vi.hoisted(() => ({
  savePackage: vi.fn(),
  loadPackage: vi.fn(),
}))
vi.mock('../services/examPackageService', () => ({
  examPackageService: { savePackage, loadPackage },
}))

const candidate = (id: string, points = 2): PackageCandidate => ({
  id,
  type: 'TRUE_FALSE',
  summary: `Soal ${id}`,
  points,
  approvedVersion: 1,
})

const view = (overrides: Partial<ExamPackageView> = {}): ExamPackageView => ({
  id: 'p1',
  title: 'UTS',
  subjectId: 'math',
  gradeId: 'g7',
  status: 'DRAFT',
  lockedAt: null,
  createdById: 'u1',
  createdAt: '2026-10-30T00:00:00.000Z',
  updatedAt: '2026-10-30T00:00:00.000Z',
  items: [
    {
      questionId: 'q2',
      questionVersion: 3,
      position: 1,
      type: 'ESSAY',
      summary: 'Dua',
      points: 5,
    },
    {
      questionId: 'q1',
      questionVersion: 1,
      position: 2,
      type: 'TRUE_FALSE',
      summary: 'Satu',
      points: 2,
    },
  ],
  ...overrides,
})

describe('usePackageForm', () => {
  beforeEach(() => vi.clearAllMocks())

  it('adds a question once and removes it on the second toggle, keeping the order', () => {
    const form = usePackageForm({ mode: 'create' })

    form.toggle(candidate('a'))
    form.toggle(candidate('b'))
    form.toggle(candidate('c'))
    form.toggle(candidate('b'))

    expect(form.selected.value.map((item) => item.id)).toEqual(['a', 'c'])
    expect(form.isSelected('a')).toBe(true)
    expect(form.isSelected('b')).toBe(false)
  })

  it('moves a question up and down and ignores moves past the ends', () => {
    const form = usePackageForm({ mode: 'create' })
    ;['a', 'b', 'c'].forEach((id) => form.toggle(candidate(id)))

    form.move(2, -1)
    expect(form.selected.value.map((item) => item.id)).toEqual(['a', 'c', 'b'])
    form.move(0, -1)
    form.move(2, 1)
    expect(form.selected.value.map((item) => item.id)).toEqual(['a', 'c', 'b'])
    form.move(0, 1)
    expect(form.selected.value.map((item) => item.id)).toEqual(['c', 'a', 'b'])
  })

  it('removes a question by position', () => {
    const form = usePackageForm({ mode: 'create' })
    ;['a', 'b'].forEach((id) => form.toggle(candidate(id)))

    form.remove(0)

    expect(form.selected.value.map((item) => item.id)).toEqual(['b'])
  })

  it('sums the points of the selected questions', () => {
    const form = usePackageForm({ mode: 'create' })
    form.toggle(candidate('a', 2))
    form.toggle(candidate('b', 3.5))

    expect(form.totalPoints.value).toBe(5.5)
  })

  it('blocks submit without a title or without questions', () => {
    const form = usePackageForm({ mode: 'create' })
    form.subjectId.value = 'math'
    form.gradeId.value = 'g7'
    expect(form.canSubmit.value).toBe(false)

    form.toggle(candidate('a'))
    expect(form.canSubmit.value).toBe(false)

    form.title.value = '   '
    expect(form.canSubmit.value).toBe(false)

    form.title.value = 'UTS'
    expect(form.canSubmit.value).toBe(true)
  })

  it('clears the selection when the subject or grade changes while creating', () => {
    const form = usePackageForm({ mode: 'create' })
    form.subjectId.value = 'math'
    form.gradeId.value = 'g7'
    form.toggle(candidate('a'))

    form.gradeId.value = 'g8'

    expect(form.selected.value).toEqual([])
  })

  it('sends the trimmed title and the question ids in order on create', async () => {
    savePackage.mockResolvedValue({ success: true, data: view() })
    const form = usePackageForm({ mode: 'create' })
    form.title.value = '  UTS Matematika  '
    form.subjectId.value = 'math'
    form.gradeId.value = 'g7'
    form.toggle(candidate('b'))
    form.toggle(candidate('a'))

    const saved = await form.submit()

    expect(saved?.id).toBe('p1')
    expect(savePackage).toHaveBeenCalledWith(
      { mode: 'create' },
      {
        title: 'UTS Matematika',
        subjectId: 'math',
        gradeId: 'g7',
        questionIds: ['b', 'a'],
      },
    )
  })

  it('sends only the title and the ids on edit', async () => {
    loadPackage.mockResolvedValue(view())
    savePackage.mockResolvedValue({ success: true, data: view() })
    const form = usePackageForm({ mode: 'edit', id: 'p1' })
    await form.load()
    form.title.value = 'UTS 2'

    await form.submit()

    expect(savePackage).toHaveBeenCalledWith(
      { mode: 'edit', id: 'p1' },
      { title: 'UTS 2', questionIds: ['q2', 'q1'] },
    )
  })

  it('loads an existing package from its pinned versions and fixes subject and grade', async () => {
    loadPackage.mockResolvedValue(view())
    const form = usePackageForm({ mode: 'edit', id: 'p1' })

    await form.load()

    expect(form.title.value).toBe('UTS')
    expect(form.subjectId.value).toBe('math')
    expect(form.gradeId.value).toBe('g7')
    expect(form.selected.value).toEqual([
      {
        id: 'q2',
        type: 'ESSAY',
        summary: 'Dua',
        points: 5,
        approvedVersion: 3,
      },
      {
        id: 'q1',
        type: 'TRUE_FALSE',
        summary: 'Satu',
        points: 2,
        approvedVersion: 1,
      },
    ])
    expect(form.locked.value).toBe(false)
  })

  it('treats a locked package as read only', async () => {
    loadPackage.mockResolvedValue(view({ status: 'LOCKED' }))
    const form = usePackageForm({ mode: 'edit', id: 'p1' })

    await form.load()

    expect(form.locked.value).toBe(true)
    expect(form.canSubmit.value).toBe(false)
  })

  it('keeps the server message and returns nothing when saving fails', async () => {
    savePackage.mockResolvedValue({
      success: false,
      error: 'Paket sudah dijadwalkan dan tidak bisa diubah',
    })
    const form = usePackageForm({ mode: 'create' })
    form.title.value = 'UTS'
    form.subjectId.value = 'math'
    form.gradeId.value = 'g7'
    form.toggle(candidate('a'))

    const saved = await form.submit()

    expect(saved).toBeNull()
    expect(form.error.value).toBe(
      'Paket sudah dijadwalkan dan tidak bisa diubah',
    )
    expect(form.saving.value).toBe(false)
  })

  it('does not call the server when it cannot submit', async () => {
    const form = usePackageForm({ mode: 'create' })

    expect(await form.submit()).toBeNull()
    expect(savePackage).not.toHaveBeenCalled()
  })

  it('says so when the package to edit does not exist', async () => {
    loadPackage.mockResolvedValue(null)
    const form = usePackageForm({ mode: 'edit', id: 'p1' })

    await form.load()

    expect(form.loadError.value).toBe('Paket tidak ditemukan.')
    expect(form.canSubmit.value).toBe(false)
  })

  it('says so when the package to edit cannot be loaded', async () => {
    loadPackage.mockRejectedValue(new Error('down'))
    const form = usePackageForm({ mode: 'edit', id: 'p1' })

    await form.load()

    expect(form.loadError.value).toBe('Paket tidak dapat dimuat. Coba lagi.')
    expect(form.canSubmit.value).toBe(false)
  })
})
