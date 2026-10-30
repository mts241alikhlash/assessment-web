import type { RouteRecordRaw } from 'vue-router'

/** Daftar dan token tetap di dalam layout aplikasi. */
export const studentExamRoutes: RouteRecordRaw[] = [
  {
    path: '/ujian',
    name: 'student-exam-list',
    component: () => import('./views/ExamListView.vue'),
    meta: {
      requiresAuth: true,
      title: 'Daftar Ujian',
      requiredPermission: 'exam-sessions.take',
      breadcrumbs: [{ title: 'Daftar Ujian' }],
    },
  },
  {
    path: '/ujian/:scheduleId/token',
    name: 'student-exam-token',
    component: () => import('./views/ExamTokenView.vue'),
    meta: {
      requiresAuth: true,
      title: 'Token Ujian',
      requiredPermission: 'exam-sessions.take',
      breadcrumbs: [
        { title: 'Daftar Ujian', href: '/ujian' },
        { title: 'Token Ujian' },
      ],
    },
  },
]

/**
 * Lembar ujian sengaja di luar AppLayout: tanpa sidebar dan tanpa menu, supaya
 * siswa tidak bisa berpindah halaman saat ujian berlangsung.
 */
export const studentExamFocusRoutes: RouteRecordRaw[] = [
  {
    path: '/ujian/sesi/:sessionId',
    name: 'student-exam-sheet',
    component: () => import('./views/ExamSheetView.vue'),
    meta: {
      requiresAuth: true,
      title: 'Lembar Ujian',
      requiredPermission: 'exam-sessions.take',
    },
  },
]
