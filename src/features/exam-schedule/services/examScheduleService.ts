import { toast } from 'vue-sonner'
import { PAGINATION } from '@mts241alikhlash/web-shared/constants/pagination'
import { getIndonesianErrorMessage } from '@mts241alikhlash/web-shared/utils/error-handler'
import { messageOf } from '@/features/exam-package/utils/messageOf'
import { examPackageApi } from '@/features/exam-package/api/examPackageApi'
import type { ExamPackageSummary } from '@/features/exam-package/types'
import { classroomApi, type Classroom } from '@/features/lookup/classroom'
import { semesterApi } from '@/features/lookup/semester'
import { examScheduleApi } from '../api/examScheduleApi'
import type {
  AccessCode,
  ExamSchedule,
  ScheduleCreatePayload,
  SchedulePayload,
  ScheduleSession,
} from '../types'

export type SaveResult =
  { success: true; data: ExamSchedule } | { success: false; error: string }

export type AccessCodeResult =
  { success: true; data: AccessCode } | { success: false; error: string }

export type SaveTarget = { mode: 'create' } | { mode: 'edit'; id: string }

export const examScheduleService = {
  async loadPackages(): Promise<ExamPackageSummary[]> {
    try {
      const response = await examPackageApi.getPackages({
        limit: PAGINATION.REFERENCE_LIMIT,
      })
      return response.data?.data ?? []
    } catch (err: unknown) {
      toast.error(getIndonesianErrorMessage(err, 'Gagal memuat daftar paket.'))
      return []
    }
  },

  async loadClassrooms(gradeId: string): Promise<Classroom[]> {
    try {
      const semesters = await semesterApi.getSemesters({
        isActive: true,
        limit: 1,
      })
      const academicYearId = semesters.data?.data?.[0]?.academicYearId
      if (!academicYearId) return []
      const response = await classroomApi.getClassrooms({
        gradeId,
        academicYearId,
        isActive: true,
        limit: PAGINATION.REFERENCE_LIMIT,
      })
      return response.data?.data ?? []
    } catch (err: unknown) {
      toast.error(getIndonesianErrorMessage(err, 'Gagal memuat daftar kelas.'))
      return []
    }
  },

  async saveSchedule(
    target: SaveTarget,
    payload: ScheduleCreatePayload | SchedulePayload,
  ): Promise<SaveResult> {
    try {
      const response =
        target.mode === 'create'
          ? await examScheduleApi.createSchedule(
              payload as ScheduleCreatePayload,
            )
          : await examScheduleApi.updateSchedule(target.id, payload)
      return { success: true, data: response.data.data }
    } catch (err: unknown) {
      return {
        success: false,
        error: messageOf(err, 'Gagal menyimpan jadwal.'),
      }
    }
  },

  async cancelSchedule(id: string): Promise<boolean> {
    try {
      await examScheduleApi.cancelSchedule(id)
      toast.success('Jadwal dibatalkan.')
      return true
    } catch (err: unknown) {
      toast.error(messageOf(err, 'Gagal membatalkan jadwal.'))
      return false
    }
  },

  async loadAccessCode(id: string): Promise<AccessCodeResult> {
    try {
      const response = await examScheduleApi.getAccessCode(id)
      return { success: true, data: response.data.data }
    } catch (err: unknown) {
      return {
        success: false,
        error: messageOf(err, 'Gagal memuat token ujian.'),
      }
    }
  },

  async rotateAccessCode(id: string): Promise<AccessCodeResult> {
    try {
      const response = await examScheduleApi.rotateAccessCode(id)
      return { success: true, data: response.data.data }
    } catch (err: unknown) {
      return {
        success: false,
        error: messageOf(err, 'Gagal mengganti token ujian.'),
      }
    }
  },

  async loadSessions(
    id: string,
  ): Promise<
    { success: true; data: ScheduleSession[] } | { success: false; error: string }
  > {
    try {
      const response = await examScheduleApi.getSessions(id, {
        page: 1,
        limit: PAGINATION.REFERENCE_LIMIT,
      })
      return { success: true, data: response.data?.data ?? [] }
    } catch (err: unknown) {
      return {
        success: false,
        error: messageOf(err, 'Gagal memuat daftar sesi.'),
      }
    }
  },

  async releaseSession(sessionId: string): Promise<boolean> {
    try {
      await examScheduleApi.releaseSession(sessionId)
      toast.success('Sesi dilepas. Siswa bisa masuk lagi dengan token.')
      return true
    } catch (err: unknown) {
      toast.error(messageOf(err, 'Gagal melepas sesi.'))
      return false
    }
  },
}
