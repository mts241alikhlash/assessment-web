// @vitest-environment happy-dom
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import { defineComponent, ref } from 'vue'
import { createPinia, setActivePinia } from 'pinia'
import PackageFormView from './PackageFormView.vue'
import { useExamPackageStore } from '../stores/examPackageStore'
import type { ExamPackageView, PackageCandidate } from '../types'

const { push, route, savePackage, loadPackage, loadReferences, permissions } =
  vi.hoisted(() => ({
    push: vi.fn(),
    route: ((): { params: Record<string, string> } => ({ params: {} }))(),
    savePackage: vi.fn(),
    loadPackage: vi.fn(),
    loadReferences: vi.fn(),
    permissions: new Set<string>(),
  }))
const candidateState = {
  stale: ref(false),
  candidates: ref<PackageCandidate[]>([]),
  totalItems: ref(0),
  loading: ref(false),
  error: ref<string | null>(null),
}

vi.mock('@/features/platform/auth', () => ({
  useAuthSession: () => ({
    hasPermission: (code: string) => permissions.has(code),
  }),
}))
vi.mock('vue-router', () => ({
  useRouter: () => ({ push }),
  useRoute: () => route,
}))
vi.mock('@mts241alikhlash/web-shared/composables/useBreadcrumbs', () => ({
  useBreadcrumbs: vi.fn(),
}))
vi.mock('../services/examPackageService', () => ({
  examPackageService: { savePackage, loadPackage, loadReferences },
}))
vi.mock('../composables/useCandidateList', () => ({
  useCandidateList: (
    subjectId: { value: string },
    gradeId: { value: string },
  ) => ({
    ...candidateState,
    enabled: {
      get value() {
        return subjectId.value !== '' && gradeId.value !== ''
      },
    },
    pageSize: 8,
  }),
}))

const passthrough = defineComponent({ template: '<div><slot /></div>' })
const floatingField = defineComponent({
  props: { label: String, for: String, floating: Boolean, error: String },
  template: '<div><label :for="$props.for">{{ label }}</label><slot /></div>',
})
const input = defineComponent({
  props: { modelValue: String, id: String },
  emits: ['update:modelValue'],
  template:
    '<input :id="id" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
})
const searchInput = defineComponent({
  props: { modelValue: String, label: String },
  emits: ['update:modelValue'],
  template:
    '<input :aria-label="label" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
})
const button = defineComponent({
  props: { variant: String, disabled: Boolean, type: String },
  template: '<button :disabled="disabled" type="button"><slot /></button>',
})
const backButton = defineComponent({
  props: { label: String },
  template: '<button type="button">{{ label }}</button>',
})
const select = defineComponent({
  name: 'SelectStub',
  props: { modelValue: String },
  emits: ['update:modelValue'],
  template: '<div><slot /></div>',
})
const trigger = defineComponent({
  template: '<button type="button"><slot /></button>',
})
const item = defineComponent({
  props: { value: String },
  template: '<option :value="value"><slot /></option>',
})

const stubs = {
  Card: passthrough,
  CardHeader: passthrough,
  CardTitle: passthrough,
  CardContent: passthrough,
  CardFooter: passthrough,
  BackButton: backButton,
  Button: button,
  Input: input,
  SearchInput: searchInput,
  FloatingLabelField: floatingField,
  Select: select,
  SelectContent: passthrough,
  SelectItem: item,
  SelectTrigger: trigger,
  SelectValue: passthrough,
}

const candidate = (id: string): PackageCandidate => ({
  id,
  type: 'TRUE_FALSE',
  summary: `Soal ${id}`,
  points: 2,
  approvedVersion: 1,
})

const saved = (): ExamPackageView => ({
  id: 'p9',
  title: 'UTS',
  subjectId: 'math',
  gradeId: 'g7',
  status: 'DRAFT',
  lockedAt: null,
  createdById: 'u1',
  createdAt: '2026-10-30T00:00:00.000Z',
  updatedAt: '2026-10-30T00:00:00.000Z',
  items: [],
})

async function choose(host: unknown, index: number, value: string) {
  const selects = (host as VueWrapper).findAllComponents({
    name: 'SelectStub',
  })
  ;(
    selects[index].vm as unknown as {
      $emit: (event: string, value?: unknown) => void
    }
  ).$emit('update:modelValue', value)
  await flushPromises()
}

const buttonByText = (host: unknown, text: string) =>
  (host as VueWrapper)
    .findAll('button')
    .find(
      (candidateButton) =>
        candidateButton.text() === text ||
        candidateButton.attributes('aria-label') === text,
    )

describe('PackageFormView', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    const store = useExamPackageStore()
    store.subjects = [{ id: 'math', name: 'Matematika' }]
    store.grades = [{ id: 'g7', level: 7, name: null }]
    route.params = {}
    permissions.clear()
    permissions.add('exam-packages.create')
    candidateState.stale.value = false
    candidateState.candidates.value = [candidate('a'), candidate('b')]
    candidateState.totalItems.value = 2
    candidateState.error.value = null
    vi.clearAllMocks()
  })

  it('asks for a subject and a grade before it shows candidates', async () => {
    const wrapper = mount(PackageFormView, { global: { stubs } })
    await flushPromises()

    expect(wrapper.text()).toContain('Pilih mapel dan tingkat dahulu')
    expect(wrapper.text()).not.toContain('Soal a')
    wrapper.unmount()
  })

  it('lists candidates once a subject and grade are chosen and adds one to the package', async () => {
    const wrapper = mount(PackageFormView, { global: { stubs } })
    await choose(wrapper, 0, 'math')
    await choose(wrapper, 1, 'g7')

    expect(wrapper.text()).toContain('Soal a')
    await buttonByText(wrapper, 'Tambahkan Soal a')!.trigger('click')

    expect(wrapper.text()).toContain('Soal Terpilih (1)')
    expect(wrapper.text()).toContain('Total 2 poin')
    wrapper.unmount()
  })

  it('keeps Simpan disabled without a title or without questions', async () => {
    const wrapper = mount(PackageFormView, { global: { stubs } })
    await choose(wrapper, 0, 'math')
    await choose(wrapper, 1, 'g7')
    const save = () => buttonByText(wrapper, 'Simpan')!

    expect(save().attributes('disabled')).toBeDefined()
    await buttonByText(wrapper, 'Tambahkan Soal a')!.trigger('click')
    expect(save().attributes('disabled')).toBeDefined()
    await wrapper.get('input#package-title').setValue('UTS')
    expect(save().attributes('disabled')).toBeUndefined()
    wrapper.unmount()
  })

  it('saves and goes to the new package', async () => {
    savePackage.mockResolvedValue({ success: true, data: saved() })
    const wrapper = mount(PackageFormView, { global: { stubs } })
    await choose(wrapper, 0, 'math')
    await choose(wrapper, 1, 'g7')
    await buttonByText(wrapper, 'Tambahkan Soal a')!.trigger('click')
    await wrapper.get('input#package-title').setValue('UTS')

    await buttonByText(wrapper, 'Simpan')!.trigger('click')
    await flushPromises()

    expect(savePackage).toHaveBeenCalledWith(
      { mode: 'create' },
      { title: 'UTS', subjectId: 'math', gradeId: 'g7', questionIds: ['a'] },
    )
    expect(push).toHaveBeenCalledWith('/paket-soal/p9')
    wrapper.unmount()
  })

  it('shows the server message and stays on the page when saving fails', async () => {
    savePackage.mockResolvedValue({
      success: false,
      error: 'Paket sudah dijadwalkan dan tidak bisa diubah',
    })
    const wrapper = mount(PackageFormView, { global: { stubs } })
    await choose(wrapper, 0, 'math')
    await choose(wrapper, 1, 'g7')
    await buttonByText(wrapper, 'Tambahkan Soal a')!.trigger('click')
    await wrapper.get('input#package-title').setValue('UTS')

    await buttonByText(wrapper, 'Simpan')!.trigger('click')
    await flushPromises()

    expect(wrapper.get('[role="alert"]').text()).toContain(
      'Paket sudah dijadwalkan dan tidak bisa diubah',
    )
    expect(push).not.toHaveBeenCalled()
    wrapper.unmount()
  })

  it('loads an existing package for editing and fixes its subject and grade', async () => {
    route.params = { id: 'p1' }
    loadPackage.mockResolvedValue({
      ...saved(),
      id: 'p1',
      title: 'UTS Lama',
      items: [
        {
          questionId: 'q1',
          questionVersion: 2,
          position: 1,
          type: 'ESSAY',
          summary: 'Uraian satu',
          points: 5,
        },
      ],
    })
    const wrapper = mount(PackageFormView, { global: { stubs } })
    await flushPromises()

    expect(loadPackage).toHaveBeenCalledWith('p1')
    expect(wrapper.text()).toContain('Ubah Paket')
    expect(wrapper.text()).toContain('Uraian satu')
    expect(wrapper.findAllComponents({ name: 'SelectStub' })).toHaveLength(0)
    expect(
      (wrapper.get('input#package-title').element as HTMLInputElement).value,
    ).toBe('UTS Lama')
    wrapper.unmount()
  })

  it('shows a locked package as read only', async () => {
    route.params = { id: 'p1' }
    loadPackage.mockResolvedValue({ ...saved(), id: 'p1', status: 'LOCKED' })
    const wrapper = mount(PackageFormView, { global: { stubs } })
    await flushPromises()

    expect(wrapper.text()).toContain(
      'Paket sudah dijadwalkan dan tidak bisa diubah',
    )
    expect(buttonByText(wrapper, 'Simpan')).toBeUndefined()
    wrapper.unmount()
  })

  it('does not offer the old candidates while the new ones are loading', async () => {
    const wrapper = mount(PackageFormView, { global: { stubs } })
    await choose(wrapper, 0, 'math')
    await choose(wrapper, 1, 'g7')
    expect(buttonByText(wrapper, 'Tambahkan Soal a')).toBeDefined()

    candidateState.stale.value = true
    await flushPromises()

    expect(buttonByText(wrapper, 'Tambahkan Soal a')).toBeUndefined()
    expect(wrapper.text()).toContain('Memuat soal')
    wrapper.unmount()
  })

  it('tells assistive technology which questions are already in the package', async () => {
    const wrapper = mount(PackageFormView, { global: { stubs } })
    await choose(wrapper, 0, 'math')
    await choose(wrapper, 1, 'g7')

    const before = buttonByText(wrapper, 'Tambahkan Soal a')!
    expect(before.attributes('aria-pressed')).toBe('false')
    await before.trigger('click')

    const chosen = buttonByText(wrapper, 'Dipilih')!
    expect(chosen.attributes('aria-pressed')).toBe('true')
    expect(chosen.attributes('aria-label')).toBeUndefined()
    wrapper.unmount()
  })

  it('names a question without text in the label of its button', async () => {
    candidateState.candidates.value = [{ ...candidate('z'), summary: '' }]
    const wrapper = mount(PackageFormView, { global: { stubs } })
    await choose(wrapper, 0, 'math')
    await choose(wrapper, 1, 'g7')

    expect(buttonByText(wrapper, 'Tambahkan soal tanpa teks')).toBeDefined()
    wrapper.unmount()
  })

  it('lets someone without exam-packages.create reorder and remove but not pick', async () => {
    route.params = { id: 'p1' }
    permissions.clear()
    permissions.add('exam-packages.update')
    loadPackage.mockResolvedValue({
      ...saved(),
      id: 'p1',
      items: [
        {
          questionId: 'q1',
          questionVersion: 1,
          position: 1,
          type: 'ESSAY',
          summary: 'Uraian satu',
          points: 5,
        },
      ],
    })
    const wrapper = mount(PackageFormView, { global: { stubs } })
    await flushPromises()

    expect(wrapper.text()).not.toContain('Soal Tersedia')
    expect(wrapper.text()).toContain(
      'Menambah soal membutuhkan izin Tambah Paket.',
    )
    expect(wrapper.text()).toContain('Uraian satu')
    expect(buttonByText(wrapper, 'Hapus dari paket')).toBeDefined()
    wrapper.unmount()
  })

  it('shows why an edit page cannot be used when the package cannot be loaded', async () => {
    route.params = { id: 'p1' }
    loadPackage.mockResolvedValue(null)
    const wrapper = mount(PackageFormView, { global: { stubs } })
    await flushPromises()

    expect(wrapper.get('[role="alert"]').text()).toContain(
      'Paket tidak ditemukan.',
    )
    expect(buttonByText(wrapper, 'Simpan')).toBeUndefined()
    expect(wrapper.find('input#package-title').exists()).toBe(false)
    wrapper.unmount()
  })
})
