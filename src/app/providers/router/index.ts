import '@mts241alikhlash/web-shared/types/router'
import { createRouter, createWebHistory } from 'vue-router'
import { authRoutes } from '@/features/platform/auth'
import { profileRoutes } from '@/features/platform/profile'
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
    ...authRoutes,
    {
      path: '/',
      component: () => import('@/layouts/AppLayout.vue'),
      children: [
        ...myDashboardRoutes,
        ...assessmentItemRoutes,
        ...studentScoreRoutes,
        ...raporRoutes,
        ...attendanceRoutes,
        ...profileRoutes,
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

  const allowedRoles = to.meta.allowedRoles
  if (allowedRoles && allowedRoles.length > 0) {
    const user = store.user
    if (user) {
      const userRoles = user.roles ?? []
      if (userRoles.includes('SUPER_ADMIN')) return true
      const hasAccess = allowedRoles.some((r: string) => userRoles.includes(r))
      if (!hasAccess) {
        return { name: 'dashboard' }
      }
    } else {
      return { name: 'login' }
    }
  }

  const requiredPermission = to.meta.requiredPermission
  const requiredAnyPermission = to.meta.requiredAnyPermission
  if (requiredPermission || requiredAnyPermission?.length) {
    const user = store.user
    if (!user) return { name: 'login' }
    const userRoles = user.roles ?? []
    const userPermissions = user.permissions ?? []

    const allowed =
      userRoles.includes('SUPER_ADMIN') ||
      (requiredPermission
        ? userPermissions.includes(requiredPermission)
        : (requiredAnyPermission ?? []).some((code) =>
            userPermissions.includes(code),
          ))

    if (!allowed) return { name: 'dashboard' }
  }

  return true
})

router.afterEach((to) => {
  const title = to.meta.title
  if (typeof title === 'string') document.title = title
})

export default router
