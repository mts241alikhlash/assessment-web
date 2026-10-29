import { beforeEach, describe, expect, it, vi } from 'vitest'
import { examScheduleService } from './examScheduleService'

const {
  createSchedule,
  cancelSchedule,
  getAccessCode,
  rotateAccessCode,
  error,
} = vi.hoisted(() => ({
  createSchedule: vi.fn(),
  cancelSchedule: vi.fn(),
  getAccessCode: vi.fn(),
  rotateAccessCode: vi.fn(),
  error: vi.fn(),
}))
vi.mock('../api/examScheduleApi', () => ({
  examScheduleApi: {
    createSchedule,
    cancelSchedule,
    getAccessCode,
    rotateAccessCode,
    updateSchedule: vi.fn(),
  },
}))
vi.mock('vue-sonner', () => ({ toast: { success: vi.fn(), error } }))

const refused = (status: number, message: string) => ({
  isAxiosError: true,
  response: { status, data: { statusCode: status, message, data: null } },
})

describe('examScheduleService', () => {
  beforeEach(() => vi.clearAllMocks())

  it('hands the server message of a refused schedule to the form', async () => {
    createSchedule.mockRejectedValue(
      refused(400, 'Kelas bukan kelas tahun ajaran aktif'),
    )

    const result = await examScheduleService.saveSchedule(
      { mode: 'create' },
      {
        packageId: 'p1',
        classroomId: 'c1',
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
