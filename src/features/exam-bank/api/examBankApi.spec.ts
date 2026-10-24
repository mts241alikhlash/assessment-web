import { beforeEach, describe, expect, it, vi } from 'vitest'
import { examBankApi } from './examBankApi'

const { get, post, patch, remove } = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  patch: vi.fn(),
  remove: vi.fn(),
}))
vi.mock('@mts241alikhlash/web-shared/utils/api', () => ({
  default: { get, post, patch, delete: remove },
}))

describe('examBankApi', () => {
  beforeEach(() => vi.clearAllMocks())

  it('keeps an id inside its own path segment', () => {
    const hostile = '../../users/me?x=1#y'
    const safe = encodeURIComponent(hostile)

    void examBankApi.getQuestion(hostile)
    void examBankApi.getVersions(hostile)
    void examBankApi.updateQuestion(hostile, {})
    void examBankApi.deleteQuestion(hostile)
    void examBankApi.submitQuestion(hostile)
    void examBankApi.approveQuestion(hostile, 1)
    void examBankApi.returnQuestion(hostile, 'x', 1)
    void examBankApi.getImage(hostile)

    const paths = [
      ...get.mock.calls,
      ...post.mock.calls,
      ...patch.mock.calls,
      ...remove.mock.calls,
    ].map((call) => String(call[0]))
    expect(paths).toHaveLength(8)
    for (const path of paths) {
      expect(path).toContain(safe)
      const tail = path.slice(path.indexOf(safe))
      expect(tail.replace(safe, '')).not.toMatch(/[?#]/)
      expect(safe).not.toMatch(/[/?#]/)
    }
  })
})
