import { describe, expect, it, vi } from 'vitest'
import type { VNode } from 'vue'
import {
  buildGradingScheduleColumns,
  buildGradingSessionColumns,
} from './gradingColumns'
import type { GradingSchedule, GradingSessionRow } from '../types'

const schedule: GradingSchedule = {
  id: 's1',
  title: 'UTS Matematika',
  subjectId: 'sub',
  classroomId: 'c1',
  classroomName: 'VII A',
  semesterId: 'sem',
  startsAt: '2026-11-02T01:00:00.000Z',
  endsAt: '2026-11-02T04:00:00.000Z',
  sessions: 30,
  awaitingGrading: 4,
  graded: 20,
}

const session = (
  overrides: Partial<GradingSessionRow> = {},
): GradingSessionRow => ({
  sessionId: 'x1',
  studentId: 'st1',
  studentName: 'Ahmad Fauzi',
  studentNis: '2024001',
  status: 'SUBMITTED',
  submittedAt: '2026-11-02T03:00:00.000Z',
  rawScore: null,
  maxScore: null,
  awaitingGrading: true,
  publication: null,
  ...overrides,
})

type Cell<T> = (ctx: { row: { original: T } }) => unknown

describe('grading columns', () => {
  it('counts the students of an exam and those waiting for a grade', () => {
    const built = buildGradingScheduleColumns({ onOpen: vi.fn() })
    const text = (id: string) =>
      (
        built.find((column) => column.id === id)!.meta as {
          mobileValue: (row: GradingSchedule) => string
        }
      ).mobileValue(schedule)

    expect(text('sessions')).toBe('30')
    expect(text('awaiting')).toBe('4')
    expect(text('graded')).toBe('20')
    expect(text('classroom')).toBe('VII A')
  })

  it('opens the exam of the row', () => {
    const onOpen = vi.fn()
    const cell = buildGradingScheduleColumns({ onOpen }).find(
      (column) => column.id === 'actions',
    )!.cell as Cell<GradingSchedule>

    ;(
      (cell({ row: { original: schedule } }) as VNode).props as {
        onClick: () => void
      }
    ).onClick()

    expect(onOpen).toHaveBeenCalledWith(schedule)
  })

  it('invites the teacher to grade a session that waits and only to look at the others', () => {
    const cell = buildGradingSessionColumns({ onOpen: vi.fn() }).find(
      (column) => column.id === 'actions',
    )!.cell as Cell<GradingSessionRow>
    const label = (row: GradingSessionRow) =>
      (
        (cell({ row: { original: row } }) as VNode).children as {
          default: () => string
        }
      ).default()

    expect(label(session())).toBe('Nilai')
    expect(label(session({ awaitingGrading: false, status: 'GRADED' }))).toBe(
      'Lihat',
    )
  })

  it('shows the score and whether it reached the assessment', () => {
    const built = buildGradingSessionColumns({ onOpen: vi.fn() })
    const text = (id: string, row: GradingSessionRow) =>
      (
        built.find((column) => column.id === id)!.meta as {
          mobileValue: (value: GradingSessionRow) => string
        }
      ).mobileValue(row)

    expect(text('score', session({ rawScore: 8, maxScore: 10 }))).toBe('8 / 10')
    expect(text('score', session())).toBe('-')
    expect(text('publication', session({ publication: 'SENT' }))).toBe(
      'Terkirim ke penilaian',
    )
    expect(text('status', session())).toBe('Menunggu penilaian')
  })
})
