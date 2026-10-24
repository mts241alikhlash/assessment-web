// @vitest-environment happy-dom
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import { defineComponent } from 'vue'
import { createPinia, setActivePinia } from 'pinia'
import QuestionFormView from './QuestionFormView.vue'
import { useExamBankStore } from '../stores/examBankStore'
import type { QuestionDetail } from '../types'

const {
  route,
  push,
  replace,
  permissions,
  loadReferences,
  loadQuestion,
  createQuestion,
  updateQuestion,
  submitQuestion,
  loadTeachers,
} = vi.hoisted(() => ({
  route: { params: {} },
  push: vi.fn(),
  replace: vi.fn(),
  permissions: new Set<string>(),
  loadReferences: vi.fn(),
  loadQuestion: vi.fn(),
  createQuestion: vi.fn(),
  updateQuestion: vi.fn(),
  submitQuestion: vi.fn(),
  loadTeachers: vi.fn(),
}))

vi.mock('vue-router', () => ({
  useRoute: () => route,
  useRouter: () => ({ push, replace }),
}))
vi.mock('@/features/platform/auth', () => ({
  useAuthSession: () => ({
    hasPermission: (code: string) => permissions.has(code),
  }),
}))
vi.mock('@mts241alikhlash/web-shared/composables/useBreadcrumbs', () => ({
  useBreadcrumbs: vi.fn(),
}))
vi.mock('vue-sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }))
vi.mock('../services/examBankService', () => ({
  examBankService: {
    loadReferences,
    loadQuestion,
    createQuestion,
    updateQuestion,
    submitQuestion,
    loadTeachers,
  },
}))

const passthrough = defineComponent({ template: '<div><slot /></div>' })
const field = defineComponent({
  props: { label: String, for: String, error: String, floating: Boolean },
  template:
    '<div><label :for="$props.for">{{ error ?? label }}</label><slot /></div>',
})
const button = defineComponent({
  props: { disabled: Boolean },
  template: '<button :disabled="disabled"><slot /></button>',
})
const dialog = defineComponent({
  props: { open: Boolean },
  template: '<div v-if="open" role="alertdialog"><slot /></div>',
})
const select = defineComponent({
  props: { modelValue: String },
  emits: ['update:modelValue'],
  template: '<div><slot /></div>',
})
const editor = defineComponent({
  props: { modelValue: Object, type: String },
  emits: ['update:modelValue'],
  template: '<div data-testid="editor" />',
})

const stubs = {
  BackButton: button,
  Button: button,
  Badge: passthrough,
  Card: passthrough,
  CardHeader: passthrough,
  CardTitle: passthrough,
  CardContent: passthrough,
  CardFooter: passthrough,
  FloatingLabelField: field,
  AlertDialog: dialog,
  AlertDialogContent: passthrough,
  AlertDialogHeader: passthrough,
  AlertDialogTitle: passthrough,
  AlertDialogDescription: passthrough,
  AlertDialogFooter: passthrough,
  Select: select,
  SelectContent: passthrough,
  SelectItem: passthrough,
  SelectTrigger: passthrough,
  SelectValue: passthrough,
  QuestionEditor: editor,
}

const detail = (overrides: Partial<QuestionDetail> = {}): QuestionDetail => {
  const current = {
    id: 'v1',
    questionId: 'q-1',
    number: 1,
    bodyHtml: '<p>Bumi bulat</p>',
    content: { answer: { value: true } },
    points: 1,
    createdById: 'user-1',
    createdAt: '2026-10-24T08:00:00.000Z',
  }
  return {
    id: 'q-1',
    subjectId: 'math',
    gradeId: 'g7',
    authorEmployeeId: 'emp-1',
    type: 'TRUE_FALSE',
    status: 'DRAFT',
    currentVersion: 1,
    approvedVersion: null,
    revision: 1,
    createdById: 'user-1',
    createdAt: '2026-10-24T08:00:00.000Z',
    updatedAt: '2026-10-24T08:00:00.000Z',
    current,
    approved: null,
    reviews: [],
    ...overrides,
  }
}

function seedScope() {
  const store = useExamBankStore()
  store.scope = {
    all: false,
    pairs: [
      {
        subjectId: 'math',
        subjectName: 'Matematika',
        gradeId: 'g7',
        gradeLevel: 7,
        gradeName: null,
      },
    ],
  }
}

function findButton(wrapper: unknown, text: string) {
  return (wrapper as VueWrapper)
    .findAll('button')
    .find((node) => node.text().includes(text))
}

describe('QuestionFormView', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    route.params = {}
    permissions.clear()
    ;['read', 'create', 'update'].forEach((action) =>
      permissions.add(`exam-questions.${action}`),
    )
    seedScope()
    loadReferences.mockResolvedValue(undefined)
  })

  it('asks for the subject, the grade and a body before creating', async () => {
    const wrapper = mount(QuestionFormView, { global: { stubs } })
    await flushPromises()

    await findButton(wrapper, 'Simpan')!.trigger('click')

    expect(wrapper.text()).toContain('Mapel wajib dipilih')
    expect(wrapper.text()).toContain('Tingkat wajib dipilih')
    expect(createQuestion).not.toHaveBeenCalled()
  })

  it('warns before saving a change to an approved question, and saves only after confirmation', async () => {
    route.params = { id: 'q-1' }
    loadQuestion.mockResolvedValue(
      detail({ status: 'APPROVED', approvedVersion: 1 }),
    )
    updateQuestion.mockResolvedValue({
      success: true,
      data: detail({ status: 'DRAFT', currentVersion: 2, approvedVersion: 1 }),
    })
    const wrapper = mount(QuestionFormView, { global: { stubs } })
    await flushPromises()

    await findButton(wrapper, 'Simpan')!.trigger('click')
    await flushPromises()

    expect(wrapper.text()).toContain(
      'Soal ini sudah disetujui. Perubahan akan menjadi versi baru dan perlu disetujui lagi.',
    )
    expect(updateQuestion).not.toHaveBeenCalled()

    await findButton(wrapper, 'Simpan versi baru')!.trigger('click')
    await flushPromises()

    expect(updateQuestion).toHaveBeenCalledWith('q-1', {
      bodyHtml: '<p>Bumi bulat</p>',
      content: { answer: { value: true } },
      points: 1,
    })
  })

  it('saves a draft straight away, with no warning', async () => {
    route.params = { id: 'q-1' }
    loadQuestion.mockResolvedValue(detail())
    updateQuestion.mockResolvedValue({ success: true, data: detail() })
    const wrapper = mount(QuestionFormView, { global: { stubs } })
    await flushPromises()

    await findButton(wrapper, 'Simpan')!.trigger('click')
    await flushPromises()

    expect(updateQuestion).toHaveBeenCalledTimes(1)
    expect(wrapper.find('[role="alertdialog"]').exists()).toBe(false)
  })

  it('shows the note of a returned question and lets the author submit it again', async () => {
    route.params = { id: 'q-1' }
    loadQuestion.mockResolvedValue(
      detail({
        status: 'RETURNED',
        reviews: [
          {
            id: 'r1',
            questionId: 'q-1',
            versionNumber: 1,
            action: 'RETURNED',
            note: 'Kunci jawaban keliru',
            byUserId: 'user-9',
            createdAt: '2026-10-24T09:00:00.000Z',
          },
        ],
      }),
    )
    submitQuestion.mockResolvedValue(true)
    const wrapper = mount(QuestionFormView, { global: { stubs } })
    await flushPromises()

    expect(wrapper.text()).toContain('Kunci jawaban keliru')
    await findButton(wrapper, 'Ajukan untuk persetujuan')!.trigger('click')
    await flushPromises()

    expect(submitQuestion).toHaveBeenCalledWith('q-1')
  })

  it('goes back to the list when the question cannot be loaded', async () => {
    route.params = { id: 'q-404' }
    loadQuestion.mockResolvedValue(null)
    mount(QuestionFormView, { global: { stubs } })
    await flushPromises()

    expect(replace).toHaveBeenCalledWith('/bank-soal')
  })
})
