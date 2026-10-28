import type { RouteRecordRaw } from 'vue-router'

export const examScheduleRoutes: RouteRecordRaw[] = [
  {
    path: '/jadwal-ujian',
    name: 'ExamSchedules',
    component: () => import('./views/ScheduleListView.vue'),
    meta: {
      title: 'Jadwal Ujian',
      requiresAuth: true,
      requiredPermission: 'exam-schedules.read',
      breadcrumbs: [
        { title: 'Ujian', href: '#' },
        { title: 'Jadwal Ujian', href: '/jadwal-ujian' },
      ],
    },
  },
]
