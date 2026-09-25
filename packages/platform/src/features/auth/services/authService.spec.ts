import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { AuthUser } from '../types'

vi.mock('@mts241alikhlash/web-shared/utils/api', () => ({
  restoreSession: vi.fn(),
  setAccessToken: vi.fn(),
  clearSession: vi.fn(),
}))

vi.mock('./authSessionService', () => ({
  authSessionService: {
    persistUser: vi.fn(),
    hydrateUser: vi.fn(),
    clearPersistedSession: vi.fn(),
  },
}))

vi.mock('./authIdentityService', () => ({
  authIdentityService: { fetchIdentity: vi.fn() },
}))

const { restoreSession: mintTokenFromCookie, clearSession } =
  await import('@mts241alikhlash/web-shared/utils/api')
const { authSessionService } = await import('./authSessionService')
const { authIdentityService } = await import('./authIdentityService')
const { authService } = await import('./authService')

const IDENTITY: AuthUser = {
  id: 'user-1',
  identifier: 'guru01',
  isActive: true,
  roles: ['TEACHER'],
  permissions: ['presence-records.read-own'],
  name: 'Ahmad',
}

describe('authService.restoreSession', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('reports no session when the cookie is absent or dead', async () => {
    vi.mocked(mintTokenFromCookie).mockResolvedValue(null)

    await expect(authService.restoreSession()).resolves.toBe(false)
    expect(authIdentityService.fetchIdentity).not.toHaveBeenCalled()
    expect(authSessionService.persistUser).not.toHaveBeenCalled()
  })

  it('trusts the identity this origin already holds, without refetching', async () => {
    vi.mocked(mintTokenFromCookie).mockResolvedValue({
      id: 'user-1',
      identifier: 'guru01',
      isActive: true,
    })
    vi.mocked(authSessionService.hydrateUser).mockReturnValue(IDENTITY)

    await expect(authService.restoreSession()).resolves.toBe(true)
    expect(authIdentityService.fetchIdentity).not.toHaveBeenCalled()
  })

  it('fetches and persists the identity on an origin that has none', async () => {
    vi.mocked(mintTokenFromCookie).mockResolvedValue({
      id: 'user-1',
      identifier: 'guru01',
      isActive: true,
    })
    vi.mocked(authSessionService.hydrateUser).mockReturnValue(null)
    vi.mocked(authIdentityService.fetchIdentity).mockResolvedValue(IDENTITY)

    await expect(authService.restoreSession()).resolves.toBe(true)
    expect(authSessionService.persistUser).toHaveBeenCalledWith(IDENTITY)
  })

  it('drops the token when the identity cannot be read', async () => {
    vi.mocked(mintTokenFromCookie).mockResolvedValue({
      id: 'user-1',
      identifier: 'guru01',
      isActive: true,
    })
    vi.mocked(authSessionService.hydrateUser).mockReturnValue(null)
    vi.mocked(authIdentityService.fetchIdentity).mockRejectedValue(
      new Error('network'),
    )

    await expect(authService.restoreSession()).resolves.toBe(false)
    expect(clearSession).toHaveBeenCalled()
    expect(authSessionService.persistUser).not.toHaveBeenCalled()
  })
})
