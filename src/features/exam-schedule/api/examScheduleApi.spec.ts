import { beforeEach, describe, expect, it, vi } from 'vitest'
import { examScheduleApi } from './examScheduleApi'

const { get, post, patch } = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  patch: vi.fn(),
}))
vi.mock('@mts241alikhlash/web-shared/utils/api', () => ({
  default: { get, post, patch },
}))

const window = {
  startsAt: '2026-11-02T01:00:00.000Z',
  endsAt: '2026-11-02T04:00:00.000Z',
  durationMinutes: 90,
}

describe('examScheduleApi', () => {
  beforeEach(() => vi.clearAllMocks())

  it('lists schedules with the given filters', () => {
    void examScheduleApi.getSchedules({ page: 1, limit: 10, classroomId: 'c1' })

    expect(get).toHaveBeenCalledWith('/exam-schedules', {
      params: { page: 1, limit: 10, classroomId: 'c1' },
    })
  })

  it('reads, creates and updates a schedule', () => {
    void examScheduleApi.getSchedule('s1')
    void examScheduleApi.createSchedule({
      ...window,
      packageId: 'p1',
      classroomId: 'c1',
    })
    void examScheduleApi.updateSchedule('s1', window)

    expect(get).toHaveBeenCalledWith('/exam-schedules/s1')
    expect(post).toHaveBeenCalledWith('/exam-schedules', {
      ...window,
      packageId: 'p1',
      classroomId: 'c1',
    })
    expect(patch).toHaveBeenCalledWith('/exam-schedules/s1', window)
  })

  it('cancels a schedule', () => {
    void examScheduleApi.cancelSchedule('s1')

    expect(post).toHaveBeenCalledWith('/exam-schedules/s1/cancel')
  })

  it('reads and rotates the access code', () => {
    void examScheduleApi.getAccessCode('s1')
    void examScheduleApi.rotateAccessCode('s1')

    expect(get).toHaveBeenCalledWith('/exam-schedules/s1/access-code')
    expect(post).toHaveBeenCalledWith('/exam-schedules/s1/access-code/rotate')
  })

  it('keeps an id inside its own path segment', () => {
    const hostile = '../../users/me?x=1#y'
    const safe = encodeURIComponent(hostile)

    void examScheduleApi.getSchedule(hostile)
    void examScheduleApi.updateSchedule(hostile, window)
    void examScheduleApi.cancelSchedule(hostile)
    void examScheduleApi.getAccessCode(hostile)
    void examScheduleApi.rotateAccessCode(hostile)

    const paths = [
      ...get.mock.calls,
      ...post.mock.calls,
      ...patch.mock.calls,
    ].map((call) => String(call[0]))
    expect(paths).toHaveLength(5)
    for (const path of paths) expect(path).toContain(safe)
  })

  it('lists the sessions of a schedule and releases one', () => {
    void examScheduleApi.getSessions('s 1', { page: 1, limit: 100 })
    void examScheduleApi.releaseSession('x1')

    expect(get).toHaveBeenCalledWith('/exam-schedules/s%201/sessions', {
      params: { page: 1, limit: 100 },
    })
    expect(post).toHaveBeenCalledWith('/exam-sessions/x1/release')
  })
})
