import { beforeEach, describe, expect, it, vi } from 'vitest'
import { examScheduleService } from './examScheduleService'

const {
  getPackages,
  createSchedule,
  cancelSchedule,
  getAccessCode,
  rotateAccessCode,
  getSessions,
  releaseSession,
  error,
} = vi.hoisted(() => ({
  getPackages: vi.fn(),
  createSchedule: vi.fn(),
  cancelSchedule: vi.fn(),
  getAccessCode: vi.fn(),
  rotateAccessCode: vi.fn(),
  getSessions: vi.fn(),
  releaseSession: vi.fn(),
  error: vi.fn(),
}))
vi.mock('../api/examScheduleApi', () => ({
  examScheduleApi: {
    createSchedule,
    cancelSchedule,
    getAccessCode,
    rotateAccessCode,
    getSessions,
    releaseSession,
    updateSchedule: vi.fn(),
  },
}))
vi.mock('@/features/exam-package/api/examPackageApi', () => ({
  examPackageApi: { getPackages },
}))
vi.mock('vue-sonner', () => ({ toast: { success: vi.fn(), error } }))

const refused = (status: number, message: string) => ({
  isAxiosError: true,
  response: { status, data: { statusCode: status, message, data: null } },
})

describe('examScheduleService', () => {
  beforeEach(() => vi.clearAllMocks())

  it('offers only approved and already scheduled packages, sorted by title', async () => {
    getPackages.mockImplementation(async ({ status }: { status: string }) => ({
      data: {
        data:
          status === 'APPROVED'
            ? [{ id: 'a', title: 'UH Bab 2' }]
            : status === 'LOCKED'
              ? [{ id: 'l', title: 'UAS Ganjil' }]
              : [{ id: 'd', title: 'Draf' }],
      },
    }))

    const packages = await examScheduleService.loadPackages()

    expect(getPackages).toHaveBeenCalledTimes(2)
    expect(
      getPackages.mock.calls.map(([query]) => query.status).sort(),
    ).toEqual(['APPROVED', 'LOCKED'])
    expect(packages.map((pkg) => pkg.id)).toEqual(['l', 'a'])
  })

  it('tells the user and returns nothing when the packages cannot load', async () => {
    getPackages.mockRejectedValue(new Error('down'))

    expect(await examScheduleService.loadPackages()).toEqual([])
    expect(error).toHaveBeenCalled()
  })

  it('hands the server message of a refused schedule to the form', async () => {
    createSchedule.mockRejectedValue(
      refused(400, 'Kelas bukan kelas tahun ajaran aktif'),
    )

    const result = await examScheduleService.saveSchedule(
      { mode: 'create' },
      {
        packageId: 'p1',
        classroomId: 'c1',
        type: 'UTS',
        startsAt: '2030-11-02T01:00:00.000Z',
        endsAt: '2030-11-02T04:00:00.000Z',
        durationMinutes: 90,
      },
    )

    expect(result).toEqual({
      success: false,
      error: 'Kelas bukan kelas tahun ajaran aktif',
    })
  })

  it('shows the server message when a cancel is refused', async () => {
    cancelSchedule.mockRejectedValue(refused(409, 'Jadwal sudah dibatalkan'))

    expect(await examScheduleService.cancelSchedule('s1')).toBe(false)
    expect(error).toHaveBeenCalledWith('Jadwal sudah dibatalkan')
  })

  it('hands the server message of the access code endpoints to the dialog', async () => {
    getAccessCode.mockRejectedValue(refused(409, 'Jadwal sudah dibatalkan'))
    rotateAccessCode.mockRejectedValue(refused(409, 'Jadwal sudah dibatalkan'))

    expect(await examScheduleService.loadAccessCode('s1')).toEqual({
      success: false,
      error: 'Jadwal sudah dibatalkan',
    })
    expect(await examScheduleService.rotateAccessCode('s1')).toEqual({
      success: false,
      error: 'Jadwal sudah dibatalkan',
    })
  })
})

describe('examScheduleService sessions', () => {
  beforeEach(() => vi.clearAllMocks())

  it('loads the sessions of a schedule', async () => {
    getSessions.mockResolvedValue({
      data: { data: [{ sessionId: 'x1' }], meta: { total: 1 } },
    })

    const result = await examScheduleService.loadSessions('s1')

    expect(result).toEqual({
      success: true,
      data: [{ sessionId: 'x1' }],
      total: 1,
    })
  })

  it('shows the server message when the sessions cannot be loaded', async () => {
    getSessions.mockRejectedValue(refused(404, 'Jadwal tidak ditemukan'))

    const result = await examScheduleService.loadSessions('s1')

    expect(result).toEqual({ success: false, error: 'Jadwal tidak ditemukan' })
  })

  it('releases a session and reports a refusal with the server message', async () => {
    releaseSession.mockResolvedValueOnce({})
    expect(await examScheduleService.releaseSession('x1')).toBe(true)

    releaseSession.mockRejectedValueOnce(
      refused(409, 'Sesi sudah selesai dan tidak bisa dilepas'),
    )
    expect(await examScheduleService.releaseSession('x1')).toBe(false)
    expect(error).toHaveBeenCalledWith(
      'Sesi sudah selesai dan tidak bisa dilepas',
    )
  })

  it('reports the real total when more sessions exist than were loaded', async () => {
    getSessions.mockResolvedValue({
      data: { data: [{ sessionId: 'x1' }], meta: { total: 1400 } },
    })

    const result = await examScheduleService.loadSessions('s1')

    expect(result).toMatchObject({ success: true, total: 1400 })
  })
})
