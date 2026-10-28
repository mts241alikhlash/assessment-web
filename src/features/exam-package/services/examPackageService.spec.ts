import { beforeEach, describe, expect, it, vi } from 'vitest'
import { examPackageService } from './examPackageService'

const { createPackage, updatePackage, getPackage, error } = vi.hoisted(() => ({
  createPackage: vi.fn(),
  updatePackage: vi.fn(),
  getPackage: vi.fn(),
  error: vi.fn(),
}))
vi.mock('../api/examPackageApi', () => ({
  examPackageApi: { createPackage, updatePackage, getPackage },
}))
vi.mock('vue-sonner', () => ({ toast: { success: vi.fn(), error } }))

const refused = (status: number, message: string) => ({
  isAxiosError: true,
  response: { status, data: { statusCode: status, message, data: null } },
})

describe('examPackageService', () => {
  beforeEach(() => vi.clearAllMocks())

  it('hands the server message of a refused save to the form', async () => {
    updatePackage.mockRejectedValue(
      refused(409, 'Paket sudah dijadwalkan dan tidak bisa diubah'),
    )

    const result = await examPackageService.savePackage(
      { mode: 'edit', id: 'p1' },
      { title: 'UTS', questionIds: ['q1'] },
    )

    expect(result).toEqual({
      success: false,
      error: 'Paket sudah dijadwalkan dan tidak bisa diubah',
    })
  })

  it('shows the server message when a copy or delete is refused', async () => {
    const { examPackageApi } = await import('../api/examPackageApi')
    Object.assign(examPackageApi, {
      copyPackage: vi
        .fn()
        .mockRejectedValue(refused(404, 'Paket tidak ditemukan')),
      deletePackage: vi
        .fn()
        .mockRejectedValue(
          refused(409, 'Paket yang sudah dijadwalkan tidak bisa dihapus'),
        ),
    })

    await examPackageService.copyPackage('p1')
    await examPackageService.deletePackage('p1')

    expect(error).toHaveBeenNthCalledWith(1, 'Paket tidak ditemukan')
    expect(error).toHaveBeenNthCalledWith(
      2,
      'Paket yang sudah dijadwalkan tidak bisa dihapus',
    )
  })

  it('answers null without a toast for a package that does not exist', async () => {
    getPackage.mockRejectedValue(refused(404, 'Paket tidak ditemukan'))

    expect(await examPackageService.loadPackage('p1')).toBeNull()
    expect(error).not.toHaveBeenCalled()
  })

  it('shows a toast and throws when the package cannot be loaded', async () => {
    getPackage.mockRejectedValue(refused(503, 'academic down'))

    await expect(examPackageService.loadPackage('p1')).rejects.toBeDefined()
    expect(error).toHaveBeenCalledTimes(1)
  })
})
