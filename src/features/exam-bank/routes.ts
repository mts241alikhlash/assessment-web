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
]
