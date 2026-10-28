import {
  CalendarCheck,
  CalendarClock,
  ClipboardList,
  ClipboardPen,
  Medal,
  FileText,
  LayoutDashboard,
  Library,
  ListChecks,
  Package,
  SquareCheckBig,
  Upload,
} from '@lucide/vue'

export type {
  SubMenuItem,
  MenuItem,
  MenuSection,
} from '@mts241alikhlash/web-shared/types/menu.types'
import type { MenuSection } from '@mts241alikhlash/web-shared/types/menu.types'

export const menuSections: MenuSection[] = [
  {
    key: 'overview',
    label: 'menu.section.overview',
    items: [
      {
        key: 'dashboard',
        title: 'menu.dashboard',
        url: '/dashboard',
        icon: LayoutDashboard,
      },
    ],
  },
  {
    key: 'assessment',
    label: 'menu.section.assessment',
    items: [
      {
        key: 'assessment-items',
        title: 'menu.assessmentItems',
        url: '/assessment/items',
        icon: ListChecks,
        requiredPermission: 'assessment-items.read',
      },
      {
        key: 'student-scores',
        title: 'menu.studentScores',
        url: '/student-scores',
        icon: ClipboardList,
        requiredPermission: 'student-scores.read',
      },
      {
        key: 'report-card',
        title: 'menu.reportCard',
        url: '/report-card',
        icon: FileText,
        requiredPermission: 'report-cards.read',
      },
    ],
  },
  {
    key: 'exam-bank',
    label: 'menu.section.examBank',
    items: [
      {
        key: 'exam-questions',
        title: 'menu.examQuestions',
        url: '/bank-soal',
        icon: Library,
        requiredPermission: 'exam-questions.read',
      },
      {
        key: 'exam-question-import',
        title: 'menu.examQuestionImport',
        url: '/bank-soal/impor',
        icon: Upload,
        requiredPermission: 'exam-questions.create',
      },
      {
        key: 'exam-question-review',
        title: 'menu.examQuestionReview',
        url: '/bank-soal/persetujuan',
        icon: SquareCheckBig,
        requiredPermission: 'exam-questions.approve',
      },
    ],
  },
  {
    key: 'exam',
    label: 'menu.section.exam',
    items: [
      {
        key: 'exam-packages',
        title: 'menu.examPackages',
        url: '/paket-soal',
        icon: Package,
        requiredPermission: 'exam-packages.read',
      },
      {
        key: 'exam-schedules',
        title: 'menu.examSchedules',
        url: '/jadwal-ujian',
        icon: CalendarClock,
        requiredPermission: 'exam-schedules.read',
      },
      {
        key: 'exam-grading',
        title: 'menu.examGrading',
        url: '/penilaian-ujian',
        icon: ClipboardPen,
        requiredPermission: 'exam-grading.read',
      },
      {
        key: 'exam-scores',
        title: 'menu.examScores',
        url: '/nilai-ujian',
        icon: Medal,
        requiredPermission: 'exam-scores.read',
      },
    ],
  },
  {
    key: 'attendance',
    label: 'menu.section.attendance',
    items: [
      {
        key: 'attendance',
        title: 'menu.attendance',
        url: '#',
        icon: CalendarCheck,
        items: [
          {
            title: 'menu.attendanceInput',
            url: '/attendance/input',
            requiredPermission: 'attendances.manage',
          },
          {
            title: 'menu.attendanceRecap',
            url: '/attendance/recap',
            requiredPermission: 'attendances.read',
          },
        ],
      },
    ],
  },
  {
    key: 'mine',
    label: 'menu.section.mine',
    items: [
      {
        key: 'my-scores',
        title: 'menu.myScores',
        url: '/my/scores',
        icon: ClipboardList,
        requiredPermission: 'student-scores.read-own',
      },
      {
        key: 'my-report-card',
        title: 'menu.myReportCard',
        url: '/my/report-card',
        icon: FileText,
        requiredPermission: 'report-cards.read-own',
      },
      {
        key: 'my-attendance',
        title: 'menu.myAttendance',
        url: '/my/attendance',
        icon: CalendarCheck,
        requiredPermission: 'attendances.read-own',
      },
    ],
  },
]
