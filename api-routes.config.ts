
export const SERVICE_PREFIXES = {
  identity: [
    '/auth',
    '/users',
    '/profiles',
    '/roles',
    '/permissions',
    '/school-units',
    '/religions',
    '/blood-types',
  ],

  assessment: [
    '/assessment-items',
    '/assessment-weights',
    '/attendances',
    '/dashboards',
    '/rapors',
    '/student-scores',
  ],

  academic: [
    '/academic-years',
    '/classrooms',
    '/semesters',
    '/subjects',
    '/teaching-assignments',
  ],

  student: [
    '/students',
    '/student-enrollments',
  ],
} as const satisfies Record<string, readonly string[]>

export type RoutedService = keyof typeof SERVICE_PREFIXES

export const UNROUTED_PREFIXES: readonly string[] = []

export const HEALTH_ROUTES = [
  { path: '/health/identity', service: 'identity' },
  { path: '/health/assessment', service: 'assessment' },
  { path: '/health/academic', service: 'academic' },
  { path: '/health/student', service: 'student' },
] as const
