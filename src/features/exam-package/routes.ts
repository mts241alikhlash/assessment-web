import type { RouteRecordRaw } from 'vue-router'

export const examPackageRoutes: RouteRecordRaw[] = [
  {
    path: '/paket-soal',
    name: 'ExamPackages',
    component: () => import('./views/PackageListView.vue'),
    meta: {
      title: 'Paket Soal',
      requiresAuth: true,
      requiredPermission: 'exam-packages.read',
      breadcrumbs: [
        { title: 'Ujian', href: '#' },
        { title: 'Paket Soal', href: '/paket-soal' },
      ],
    },
  },
  {
    path: '/paket-soal/:id',
    name: 'ExamPackageDetail',
    component: () => import('./views/PackageDetailView.vue'),
    meta: {
      title: 'Paket Soal',
      requiresAuth: true,
      requiredPermission: 'exam-packages.read',
      breadcrumbs: [
        { title: 'Ujian', href: '#' },
        { title: 'Paket Soal', href: '/paket-soal' },
      ],
    },
  },
]
