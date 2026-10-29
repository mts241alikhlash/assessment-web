import { beforeEach, describe, expect, it, vi } from 'vitest'
import { examPackageApi } from './examPackageApi'

const { get, post, patch, remove } = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  patch: vi.fn(),
  remove: vi.fn(),
}))
vi.mock('@mts241alikhlash/web-shared/utils/api', () => ({
  default: { get, post, patch, delete: remove },
}))

describe('examPackageApi', () => {
  beforeEach(() => vi.clearAllMocks())

  it('lists packages with the given filters', () => {
    void examPackageApi.getPackages({ page: 2, limit: 10, status: 'DRAFT' })

    expect(get).toHaveBeenCalledWith('/exam-packages', {
      params: { page: 2, limit: 10, status: 'DRAFT' },
    })
  })

  it('reads one package', () => {
    void examPackageApi.getPackage('p1')

    expect(get).toHaveBeenCalledWith('/exam-packages/p1')
  })

  it('lists the candidates of a subject and grade', () => {
    void examPackageApi.getCandidates({
      subjectId: 's1',
      gradeId: 'g1',
      search: 'luas',
      page: 1,
      limit: 20,
    })

    expect(get).toHaveBeenCalledWith('/exam-packages/candidates', {
      params: {
        subjectId: 's1',
        gradeId: 'g1',
        search: 'luas',
        page: 1,
        limit: 20,
      },
    })
  })

  it('creates, updates, deletes and copies a package', () => {
    const payload = {
      title: 'UTS',
      subjectId: 's1',
      gradeId: 'g1',
      questionIds: ['q1'],
    }
    void examPackageApi.createPackage(payload)
    void examPackageApi.updatePackage('p1', {
      title: 'UTS 2',
      questionIds: ['q1', 'q2'],
    })
    void examPackageApi.deletePackage('p1')
    void examPackageApi.copyPackage('p1')

    expect(post).toHaveBeenCalledWith('/exam-packages', payload)
    expect(patch).toHaveBeenCalledWith('/exam-packages/p1', {
      title: 'UTS 2',
      questionIds: ['q1', 'q2'],
    })
    expect(remove).toHaveBeenCalledWith('/exam-packages/p1')
    expect(post).toHaveBeenCalledWith('/exam-packages/p1/copy')
  })

  it('keeps an id inside its own path segment', () => {
    const hostile = '../../users/me?x=1#y'
    const safe = encodeURIComponent(hostile)

    void examPackageApi.getPackage(hostile)
    void examPackageApi.updatePackage(hostile, { title: 'x', questionIds: [] })
    void examPackageApi.deletePackage(hostile)
    void examPackageApi.copyPackage(hostile)

    const paths = [
      ...get.mock.calls,
      ...post.mock.calls,
      ...patch.mock.calls,
      ...remove.mock.calls,
    ].map((call) => String(call[0]))
    expect(paths).toHaveLength(4)
    for (const path of paths) expect(path).toContain(safe)
  })
})
