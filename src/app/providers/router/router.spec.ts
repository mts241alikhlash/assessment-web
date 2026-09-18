import { describe, it, expect } from 'vitest'
import { createMemoryHistory, createRouter } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { assessmentItemRoutes } from '@/features/assessment/assessment-item'
import { attendanceRoutes } from '@/features/assessment/attendance'
import { myDashboardRoutes } from '@/features/assessment/my-dashboard'
import { raporRoutes } from '@/features/assessment/rapor/routes'
import { studentScoreRoutes } from '@/features/assessment/student-score'
import { menuSections } from '@/config/menuConfig'
import en from '@/i18n/locales/en'
import id from '@/i18n/locales/id'

const Stub = { render: () => null }
const Layout = { render: () => null }

const ALL: RouteRecordRaw[] = [
  ...myDashboardRoutes,
  ...assessmentItemRoutes,
  ...studentScoreRoutes,
  ...raporRoutes,
  ...attendanceRoutes,
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

  it('states a trail on every route that renders a view', () => {
    for (const route of ALL) {
      if (route.redirect) continue
      expect(
        route.meta?.breadcrumbs,
        `${String(route.name)} has no trail`,
      ).toBeDefined()
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
