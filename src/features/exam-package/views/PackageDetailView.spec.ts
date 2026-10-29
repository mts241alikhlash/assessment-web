// @vitest-environment happy-dom
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import { defineComponent } from 'vue'
import { createPinia, setActivePinia } from 'pinia'
import * as vueRouter from 'vue-router'
import PackageDetailView from './PackageDetailView.vue'
import { useExamPackageStore } from '../stores/examPackageStore'
import type { ExamPackageView } from '../types'
import { CARDS, cardRows } from '@/test/dataTableCards'

const {
  push,
  loadPackage,
  copyPackage,
  deletePackage,
  loadReferences,
  permissions,
} = vi.hoisted(() => ({
  push: vi.fn(),
  loadPackage: vi.fn(),
  copyPackage: vi.fn(),
  deletePackage: vi.fn(),
  loadReferences: vi.fn(),
  permissions: new Set<string>(),
}))

vi.mock('vue-router', async () => {
  const { reactive } = await import('vue')
  const state = reactive<{ params: Record<string, string> }>({
    params: { id: 'p1' },
  })
  return { useRouter: () => ({ push }), useRoute: () => state, __route: state }
})
vi.mock('@mts241alikhlash/web-shared/composables/useBreadcrumbs', () => ({
  useBreadcrumbs: vi.fn(),
}))
vi.mock('@/features/platform/auth', () => ({
  useAuthSession: () => ({
    hasPermission: (code: string) => permissions.has(code),
  }),
}))
vi.mock('../services/examPackageService', () => ({
  examPackageService: {
    loadPackage,
    copyPackage,
    deletePackage,
    loadReferences,
  },
}))
vi.mock('@/features/exam-schedule/components/ScheduleFormDialog.vue', () => ({
  default: defineComponent({
    name: 'ScheduleFormDialogStub',
    props: {
      open: Boolean,
      packageId: String,
      packageGradeId: String,
      packageTitle: String,
    },
    emits: ['update:open', 'saved'],
    template:
      '<div data-test="schedule-dialog" :data-package="packageId" :data-grade="packageGradeId" :data-title="packageTitle" />',
  }),
}))

const passthrough = defineComponent({ template: '<div><slot /></div>' })
const button = defineComponent({
  props: { variant: String, disabled: Boolean, type: String },
  template: '<button :disabled="disabled" type="button"><slot /></button>',
})
const backButton = defineComponent({
  props: { label: String },
  template: '<button type="button">{{ label }}</button>',
})
const alertDialog = defineComponent({
  props: { open: Boolean },
  template: '<div v-if="open" data-test="confirm"><slot /></div>',
})

const stubs = {
  Card: passthrough,
  CardHeader: passthrough,
  CardTitle: passthrough,
  CardContent: passthrough,
  Tooltip: passthrough,
  TooltipTrigger: passthrough,
  TooltipContent: passthrough,
  BackButton: backButton,
  Button: button,
  AlertDialog: alertDialog,
  AlertDialogContent: passthrough,
  AlertDialogHeader: passthrough,
  AlertDialogFooter: passthrough,
  AlertDialogTitle: passthrough,
  AlertDialogDescription: passthrough,
  AlertDialogCancel: button,
  AlertDialogAction: button,
}

const routeState = () =>
  (vueRouter as unknown as { __route: { params: Record<string, string> } })
    .__route

const view = (overrides: Partial<ExamPackageView> = {}): ExamPackageView => ({
  id: 'p1',
  title: 'UTS Matematika Kelas 7',
  subjectId: 'math',
  gradeId: 'g7',
  status: 'DRAFT',
  lockedAt: null,
  createdById: 'u1',
  createdAt: '2026-10-30T00:00:00.000Z',
  updatedAt: '2026-10-30T00:00:00.000Z',
  reviews: [],
  items: [
    {
      questionId: 'q1',
      questionVersion: 1,
      position: 1,
      type: 'TRUE_FALSE',
      marker: 'NEW',
      summary: 'Langit berwarna biru',
      points: 2,
    },
    {
      questionId: 'q2',
      questionVersion: 3,
      position: 2,
      type: 'ESSAY',
      marker: 'NEW',
      summary: 'Jelaskan fotosintesis',
      points: 5,
    },
  ],
  ...overrides,
})

const buttonByText = (host: unknown, text: string) =>
  (host as VueWrapper)
    .findAll('button')
    .find(
      (candidateButton) =>
        candidateButton.text() === text ||
        candidateButton.attributes('aria-label') === text,
    )

async function mountView() {
  const wrapper = mount(PackageDetailView, { global: { stubs } })
  await flushPromises()
  return wrapper
}

describe('PackageDetailView', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    const store = useExamPackageStore()
    store.subjects = [{ id: 'math', name: 'Matematika' }]
    store.grades = [{ id: 'g7', level: 7, name: null }]
    permissions.clear()
    ;['update', 'delete', 'create'].forEach((action) =>
      permissions.add(`exam-packages.${action}`),
    )
    permissions.add('exam-schedules.create')
    routeState().params = { id: 'p1' }
    loadPackage.mockResolvedValue(view())
    vi.clearAllMocks()
    loadPackage.mockResolvedValue(view())
  })

  it('shows every item from the version that was pinned', async () => {
    const wrapper = await mountView()

    const text = wrapper.get(CARDS).text()
    expect(cardRows(wrapper)).toHaveLength(2)
    expect(text).toContain('Langit berwarna biru')
    expect(text).toContain('Benar/Salah')
    expect(text).toContain('v3')
    expect(wrapper.text()).toContain('UTS Matematika Kelas 7')
    expect(wrapper.text()).toContain('Matematika')
    expect(wrapper.text()).toContain('Total 7 poin')
    wrapper.unmount()
  })

  it('offers change, delete, copy and schedule for a draft', async () => {
    const wrapper = await mountView()

    for (const label of ['Ubah', 'Hapus', 'Salin', 'Jadwalkan']) {
      expect(buttonByText(wrapper, label), label).toBeDefined()
    }
    wrapper.unmount()
  })

  it('hides change and delete once the package is locked', async () => {
    loadPackage.mockResolvedValue(view({ status: 'LOCKED' }))
    const wrapper = await mountView()

    expect(buttonByText(wrapper, 'Ubah')).toBeUndefined()
    expect(buttonByText(wrapper, 'Hapus')).toBeUndefined()
    expect(buttonByText(wrapper, 'Salin')).toBeDefined()
    expect(wrapper.text()).toContain('Terjadwal')
    wrapper.unmount()
  })

  it('follows the permissions of the user', async () => {
    permissions.clear()
    permissions.add('exam-packages.update')
    const wrapper = await mountView()

    expect(buttonByText(wrapper, 'Ubah')).toBeDefined()
    expect(buttonByText(wrapper, 'Hapus')).toBeUndefined()
    expect(buttonByText(wrapper, 'Salin')).toBeUndefined()
    expect(buttonByText(wrapper, 'Jadwalkan')).toBeUndefined()
    wrapper.unmount()
  })

  it('goes to the edit page', async () => {
    const wrapper = await mountView()

    await buttonByText(wrapper, 'Ubah')!.trigger('click')

    expect(push).toHaveBeenCalledWith('/paket-soal/p1/ubah')
    wrapper.unmount()
  })

  it('copies the package and opens the new draft', async () => {
    copyPackage.mockResolvedValue(view({ id: 'p2' }))
    const wrapper = await mountView()

    await buttonByText(wrapper, 'Salin')!.trigger('click')
    await flushPromises()

    expect(copyPackage).toHaveBeenCalledWith('p1')
    expect(push).toHaveBeenCalledWith('/paket-soal/p2')
    wrapper.unmount()
  })

  it('asks for confirmation before deleting and returns to the list', async () => {
    deletePackage.mockResolvedValue(true)
    const wrapper = await mountView()

    await buttonByText(wrapper, 'Hapus')!.trigger('click')
    expect(wrapper.find('[data-test="confirm"]').exists()).toBe(true)
    expect(deletePackage).not.toHaveBeenCalled()

    await buttonByText(wrapper, 'Ya, hapus')!.trigger('click')
    await flushPromises()

    expect(deletePackage).toHaveBeenCalledWith('p1')
    expect(push).toHaveBeenCalledWith('/paket-soal')
    wrapper.unmount()
  })

  it('opens the schedule dialog for this package and goes to the schedules once saved', async () => {
    const wrapper = await mountView()
    expect(wrapper.find('[data-test="schedule-dialog"]').exists()).toBe(false)

    await buttonByText(wrapper, 'Jadwalkan')!.trigger('click')
    const dialog = wrapper.find('[data-test="schedule-dialog"]')
    expect(dialog.attributes('data-package')).toBe('p1')

    ;(
      wrapper.findComponent({ name: 'ScheduleFormDialogStub' })
        .vm as unknown as { $emit: (event: string, value?: unknown) => void }
    ).$emit('saved')
    await flushPromises()

    expect(push).toHaveBeenCalledWith('/jadwal-ujian')
    wrapper.unmount()
  })

  it('shows a not-found state for a missing package', async () => {
    loadPackage.mockResolvedValue(null)
    const wrapper = await mountView()

    expect(wrapper.text()).toContain('Paket tidak ditemukan.')
    expect(buttonByText(wrapper, 'Ubah')).toBeUndefined()
    wrapper.unmount()
  })

  it('loads the other package when the address changes, as after Salin from a locked package', async () => {
    loadPackage.mockResolvedValueOnce(view({ status: 'LOCKED' }))
    const wrapper = await mountView()
    expect(buttonByText(wrapper, 'Ubah')).toBeUndefined()

    loadPackage.mockResolvedValueOnce(
      view({ id: 'p2', title: 'Salinan UTS Matematika', status: 'DRAFT' }),
    )
    routeState().params = { id: 'p2' }
    await flushPromises()

    expect(loadPackage).toHaveBeenLastCalledWith('p2')
    expect(wrapper.text()).toContain('Salinan UTS Matematika')
    expect(buttonByText(wrapper, 'Ubah')).toBeDefined()
    wrapper.unmount()
  })

  it('hands the package grade and title to the schedule dialog', async () => {
    const wrapper = await mountView()

    await buttonByText(wrapper, 'Jadwalkan')!.trigger('click')
    const dialog = wrapper.get('[data-test="schedule-dialog"]')

    expect(dialog.attributes('data-grade')).toBe('g7')
    expect(dialog.attributes('data-title')).toBe('UTS Matematika Kelas 7')
    wrapper.unmount()
  })

  it('copies only once when the button is pressed twice', async () => {
    let finish: (value: ExamPackageView) => void = () => undefined
    copyPackage.mockReturnValue(
      new Promise<ExamPackageView>((resolve) => {
        finish = resolve
      }),
    )
    const wrapper = await mountView()

    await buttonByText(wrapper, 'Salin')!.trigger('click')
    await buttonByText(wrapper, 'Salin')!.trigger('click')
    finish(view({ id: 'p2' }))
    await flushPromises()

    expect(copyPackage).toHaveBeenCalledTimes(1)
    wrapper.unmount()
  })

  it('does not call a package that could not be loaded missing, and lets the user retry', async () => {
    loadPackage.mockRejectedValueOnce(new Error('down'))
    const wrapper = await mountView()

    expect(wrapper.text()).toContain('Paket tidak dapat dimuat.')
    expect(wrapper.text()).not.toContain('Paket tidak ditemukan.')

    await buttonByText(wrapper, 'Coba lagi')!.trigger('click')
    await flushPromises()

    expect(loadPackage).toHaveBeenCalledTimes(2)
    expect(wrapper.text()).toContain('UTS Matematika Kelas 7')
    wrapper.unmount()
  })
})
