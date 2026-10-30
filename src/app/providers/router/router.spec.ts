import { describe, it, expect } from 'vitest'
import { createMemoryHistory, createRouter } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { assessmentItemRoutes } from '@/features/assessment/assessment-item'
import { examPackageRoutes } from '@/features/exam-package'
import { examScheduleRoutes } from '@/features/exam-schedule'
import { examGradingRoutes } from '@/features/exam-grading'
import { examScoreRoutes } from '@/features/exam-score'
import { attendanceRoutes } from '@/features/assessment/attendance'
import { myDashboardRoutes } from '@/features/assessment/my-dashboard'
import { raporRoutes } from '@/features/assessment/rapor/routes'
import { studentScoreRoutes } from '@/features/assessment/student-score'
import {
  studentExamFocusRoutes,
  studentExamRoutes,
} from '@/features/student-exam/routes'
import { menuSections } from '@/config/menuConfig'
import en from '@/i18n/locales/en'
import id from '@/i18n/locales/id'

const Stub = { render: () => null }
const Layout = { render: () => null }

const ALL: RouteRecordRaw[] = [
  ...myDashboardRoutes,
  ...assessmentItemRoutes,
  ...studentScoreRoutes,
  ...examPackageRoutes,
  ...examScheduleRoutes,
  ...examGradingRoutes,
  ...examScoreRoutes,
  ...raporRoutes,
  ...attendanceRoutes,
  ...studentExamRoutes,
]

function buildRouter(children: RouteRecordRaw[]) {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', redirect: '/dashboard' },
      { path: '/', component: Layout, children },
      { path: '/:pathMatch(.*)*', name: 'not-found', component: Stub },
    ],
  })
}

describe('assessment route tree', () => {
  it('redirects / to the dashboard even though the layout also owns /', () => {
    const resolved = buildRouter(ALL).resolve('/')
    expect(resolved.matched).toHaveLength(1)
    expect(resolved.matched[0]?.redirect).toBe('/dashboard')
    expect(resolved.matched[0]?.components?.default).not.toBe(Layout)
  })

  it('renders every route through the layout without changing its URL', () => {
    for (const route of ALL) {
      if (route.redirect) continue
      const resolved = buildRouter(ALL).resolve(route.path)
      expect(
        resolved.matched,
        `${String(route.name)} missed the layout`,
      ).toHaveLength(2)
      expect(resolved.matched[0]?.components?.default).toBe(Layout)
    }
  })

  it('leaves no route under the old /academic prefix', () => {
    const stale = ALL.filter((route) => route.path.startsWith('/academic'))
    expect(stale.map((route) => route.path)).toEqual([])
  })

  it('states a trail on every route inside the layout', () => {
    // Rute fokus (lembar ujian) sengaja tanpa layout dan tanpa breadcrumb.
    const focus = new Set(studentExamFocusRoutes.map((route) => route.name))
    for (const route of ALL) {
      if (route.redirect || focus.has(route.name)) continue
      expect(
        route.meta?.breadcrumbs,
        `${String(route.name)} has no trail`,
      ).toBeDefined()
    }
  })

  it('keeps the exam sheet outside the app layout', () => {
    // Susunan sama seperti router asli: rute fokus didaftarkan sebelum layout.
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/', redirect: '/dashboard' },
        ...studentExamFocusRoutes,
        { path: '/', component: Layout, children: ALL },
        { path: '/:pathMatch(.*)*', name: 'not-found', component: Stub },
      ],
    })
    for (const route of studentExamFocusRoutes) {
      const resolved = router.resolve(route.path)
      expect(
        resolved.matched,
        `${String(route.name)} must not render inside the layout`,
      ).toHaveLength(1)
      expect(resolved.matched[0]?.components?.default).not.toBe(Layout)
    }
  })
})

describe('menu', () => {
  const labels = () =>
    menuSections.flatMap((section) => [
      section.label,
      ...section.items.flatMap((item) => [
        item.title,
        ...(item.items ?? []).map((sub) => sub.title),
      ]),
    ])

  it('links only to paths this app actually routes', () => {
    const urls = menuSections
      .flatMap((section) => section.items)
      .flatMap((item) => [item.url, ...(item.items ?? []).map((s) => s.url)])
      .filter((url) => url !== '#')

    const router = buildRouter(ALL)
    for (const url of urls) {
      expect(router.resolve(url).name, `${url} resolves to not-found`).not.toBe(
        'not-found',
      )
    }
  })

  it('uses translation keys, never literal text', () => {
    for (const label of labels()) {
      expect(label, `${label} is not a key`).toMatch(/^[a-z]+(\.[a-zA-Z]+)+$/)
    }
  })

  it('has both locales covering every key the menu uses, en being the source', () => {
    const read = (obj: unknown, key: string) =>
      key.split('.').reduce<unknown>((acc, part) => {
        if (acc && typeof acc === 'object' && part in acc) {
          return (acc as Record<string, unknown>)[part]
        }
        return undefined
      }, obj)

    for (const key of labels()) {
      expect(read(en, key), `en is missing ${key}`).toBeTypeOf('string')
      expect(read(id, key), `id is missing ${key}`).toBeTypeOf('string')
    }
  })
})

describe('exam package and schedule routes', () => {
  const required: Record<string, string> = {
    '/paket-soal': 'exam-packages.read',
    '/paket-soal/p1': 'exam-packages.read',
    '/paket-soal/p1/soal/baru': 'exam-packages.update',
    '/paket-soal/p1/soal/q1': 'exam-packages.read',
    '/paket-soal/p1/impor': 'exam-questions.create',
    '/persetujuan-paket': 'exam-questions.approve',
    '/persetujuan-paket/p1': 'exam-questions.approve',
    '/jadwal-ujian': 'exam-schedules.read',
    '/penilaian-ujian': 'exam-grading.read',
    '/penilaian-ujian/s1': 'exam-grading.read',
    '/penilaian-ujian/s1/x1': 'exam-grading.read',
    '/nilai-ujian': 'exam-scores.read',
  }

  it.each(Object.entries(required))('%s needs %s', (path, permission) => {
    const resolved = buildRouter(ALL).resolve(path)
    const meta = resolved.matched.at(-1)?.meta

    expect(resolved.name).not.toBe('not-found')
    expect(meta?.requiresAuth).toBe(true)
    expect(meta?.requiredPermission).toBe(permission)
  })

  it('resolves the new question address to the form, not to a question called "baru"', () => {
    expect(buildRouter(ALL).resolve('/paket-soal/p1/soal/baru').name).toBe(
      'ExamPackageQuestionCreate',
    )
    expect(buildRouter(ALL).resolve('/paket-soal/p1/soal/q1').name).toBe(
      'ExamPackageQuestion',
    )
  })

  it('has no question bank left: no bank section and no /bank-soal route', () => {
    expect(menuSections.map((section) => section.key)).not.toContain(
      'exam-bank',
    )
    expect(buildRouter(ALL).resolve('/bank-soal').name).toBe('not-found')
  })

  it('resolves a package address to its page', () => {
    expect(buildRouter(ALL).resolve('/paket-soal/abc').name).toBe(
      'ExamPackageDetail',
    )
  })

  it('shows the exam menu section only through the exam permissions', () => {
    const section = menuSections.find((candidate) => candidate.key === 'exam')

    expect(
      section?.items.map((item) => [item.url, item.requiredPermission]),
    ).toEqual([
      ['/paket-soal', 'exam-packages.read'],
      ['/persetujuan-paket', 'exam-questions.approve'],
      ['/jadwal-ujian', 'exam-schedules.read'],
      ['/penilaian-ujian', 'exam-grading.read'],
      ['/nilai-ujian', 'exam-scores.read'],
    ])
  })
})
