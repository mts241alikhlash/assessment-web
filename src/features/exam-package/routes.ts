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
  {
    path: '/paket-soal/:id/soal/baru',
    name: 'ExamPackageQuestionCreate',
    component: () => import('./views/PackageQuestionFormView.vue'),
    meta: {
      title: 'Tambah Soal',
      requiresAuth: true,
      requiredPermission: 'exam-packages.update',
      breadcrumbs: [
        { title: 'Ujian', href: '#' },
        { title: 'Paket Soal', href: '/paket-soal' },
      ],
    },
  },
  {
    path: '/paket-soal/:id/soal/:questionId',
    name: 'ExamPackageQuestion',
    component: () => import('./views/PackageQuestionFormView.vue'),
    meta: {
      title: 'Soal',
      requiresAuth: true,
      requiredPermission: 'exam-packages.read',
      breadcrumbs: [
        { title: 'Ujian', href: '#' },
        { title: 'Paket Soal', href: '/paket-soal' },
      ],
    },
  },
  {
    path: '/paket-soal/:id/impor',
    name: 'ExamPackageImport',
    component: () => import('./views/PackageImportView.vue'),
    meta: {
      title: 'Impor Soal',
      requiresAuth: true,
      requiredPermission: 'exam-questions.create',
      breadcrumbs: [
        { title: 'Ujian', href: '#' },
        { title: 'Paket Soal', href: '/paket-soal' },
      ],
    },
  },
  {
    path: '/persetujuan-paket',
    name: 'ExamPackageReviewList',
    component: () => import('./views/PackageReviewListView.vue'),
    meta: {
      title: 'Persetujuan Paket',
      requiresAuth: true,
      requiredPermission: 'exam-questions.approve',
      breadcrumbs: [{ title: 'Ujian', href: '#' }],
    },
  },
  {
    path: '/persetujuan-paket/:id',
    name: 'ExamPackageReview',
    component: () => import('./views/PackageReviewView.vue'),
    meta: {
      title: 'Tinjau Paket',
      requiresAuth: true,
      requiredPermission: 'exam-questions.approve',
      breadcrumbs: [
        { title: 'Ujian', href: '#' },
        { title: 'Persetujuan Paket', href: '/persetujuan-paket' },
      ],
    },
  },
]
