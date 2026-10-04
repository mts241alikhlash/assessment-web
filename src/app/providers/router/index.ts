import '@mts241alikhlash/web-shared/types/router'
import { createRouter, createWebHistory } from 'vue-router'
import { ssoAuthRoutes } from '@/features/platform/auth'
import { assessmentItemRoutes } from '@/features/assessment/assessment-item'
import { attendanceRoutes } from '@/features/assessment/attendance'
import { myDashboardRoutes } from '@/features/assessment/my-dashboard'
import { raporRoutes } from '@/features/assessment/rapor/routes'
import { studentScoreRoutes } from '@/features/assessment/student-score'
import { authSessionService, useAuthStore } from '@/features/platform/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/dashboard',
    },
    ...ssoAuthRoutes,
    {
      path: '/',
      component: () => import('@/layouts/AppLayout.vue'),
      children: [
        ...myDashboardRoutes,
        ...assessmentItemRoutes,
        ...studentScoreRoutes,
        ...raporRoutes,
        ...attendanceRoutes,
      ],
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/layouts/NotFoundPage.vue'),
      meta: { title: 'Halaman Tidak Ditemukan' },
    },
  ],
})

router.beforeEach((to) => {
  const store = useAuthStore()
  if (!store.user) {
    const user = authSessionService.hydrateUser()
    if (user) {
      store.setUser(user)
    }
  }

  const hasSession = Boolean(store.user)

  if (to.meta.requiresAuth && !hasSession) {
    return { name: 'login' }
  }

  if (to.meta.guestOnly && hasSession) {
    return { name: 'dashboard' }
  }

  const requiredPermission = to.meta.requiredPermission
  const requiredAnyPermission = to.meta.requiredAnyPermission
  if (requiredPermission || requiredAnyPermission?.length) {
    const user = store.user
    if (!user) return { name: 'login' }
    const userPermissions = user.permissions ?? []

    const allowed = requiredPermission
      ? userPermissions.includes(requiredPermission)
      : (requiredAnyPermission ?? []).some((code) =>
          userPermissions.includes(code),
        )

    if (!allowed) return { name: 'dashboard' }
  }

  return true
})

router.afterEach((to) => {
  const title = to.meta.title
  if (typeof title === 'string') document.title = title
})

export default router
