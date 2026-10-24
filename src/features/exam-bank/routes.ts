import type { RouteRecordRaw } from 'vue-router'

export const examBankRoutes: RouteRecordRaw[] = [
  {
    path: '/bank-soal',
    name: 'ExamQuestions',
    component: () => import('./views/QuestionListView.vue'),
    meta: {
      title: 'Bank Soal',
      requiresAuth: true,
      requiredPermission: 'exam-questions.read',
      breadcrumbs: [
        { title: 'Bank Soal', href: '#' },
        { title: 'Soal', href: '/bank-soal' },
      ],
    },
  },
  {
    path: '/bank-soal/baru',
    name: 'ExamQuestionCreate',
    component: () => import('./views/QuestionFormView.vue'),
    meta: {
      title: 'Tambah Soal',
      requiresAuth: true,
      requiredPermission: 'exam-questions.create',
      breadcrumbs: [
        { title: 'Bank Soal', href: '#' },
        { title: 'Soal', href: '/bank-soal' },
        { title: 'Tambah', href: '/bank-soal/baru' },
      ],
    },
  },
  {
    path: '/bank-soal/:id',
    name: 'ExamQuestionEdit',
    component: () => import('./views/QuestionFormView.vue'),
    meta: {
      title: 'Ubah Soal',
      requiresAuth: true,
      requiredPermission: 'exam-questions.read',
      breadcrumbs: [
        { title: 'Bank Soal', href: '#' },
        { title: 'Soal', href: '/bank-soal' },
        { title: 'Ubah', href: '#' },
      ],
    },
  },
]
