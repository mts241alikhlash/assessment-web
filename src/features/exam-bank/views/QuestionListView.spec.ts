// @vitest-environment happy-dom
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { defineComponent, ref, type Ref } from 'vue'
import { createPinia, setActivePinia } from 'pinia'
import QuestionListView from './QuestionListView.vue'
import { useExamBankStore } from '../stores/examBankStore'
import type { QuestionSummary } from '../types'
import {
  CARDS,
  cardRows,
  nextCardPage,
  rowActionProps,
} from '@/test/dataTableCards'

const { filters, loadReferences, loadAuthors, push, permissions } = vi.hoisted(
  () => ({
    filters: {} as Record<
      'search' | 'subjectId' | 'gradeId' | 'type' | 'status' | 'authorId',
      Ref<string>
    > &
      Record<'page' | 'pageSize', Ref<number>>,
    loadReferences: vi.fn<() => Promise<void>>(),
    loadAuthors: vi.fn<() => Promise<void>>(),
    push: vi.fn(),
    permissions: new Set<string>(),
  }),
)
const listState = {
  questions: ref<QuestionSummary[]>([]),
  totalItems: ref(0),
  loading: ref(false),
  listError: ref<string | null>(null),
  filtersPending: ref(false),
}

vi.mock('@/features/platform/auth', () => ({
  useAuthSession: () => ({
    hasPermission: (code: string) => permissions.has(code),
  }),
}))
vi.mock('vue-router', () => ({
  useRouter: () => ({ push }),
  useRoute: () => ({ query: {} }),
}))
vi.mock('../services/examBankService', () => ({
  examBankService: {
    loadReferences,
    loadAuthors,
    submitQuestion: vi.fn(),
    deleteQuestion: vi.fn(),
  },
}))
vi.mock('../composables/useQuestionList', () => ({
  useQuestionList: (
    state: typeof filters,
    page: Ref<number>,
    pageSize: Ref<number>,
  ) => {
    Object.assign(filters, state, { page, pageSize })
    return {
      ...listState,
      refresh: vi.fn(),
    }
  },
}))

const passthrough = defineComponent({ template: '<div><slot /></div>' })
const floatingField = defineComponent({
  props: { label: String, for: String, floating: Boolean },
  template: '<div><label :for="$props.for">{{ label }}</label><slot /></div>',
})
const searchInput = defineComponent({
  props: { modelValue: String, label: String },
  emits: ['update:modelValue'],
  template:
    '<input :aria-label="label" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
})
const button = defineComponent({
  props: { variant: String, disabled: Boolean },
  template: '<button :disabled="disabled"><slot /></button>',
})
const select = defineComponent({
  name: 'SelectStub',
  props: { modelValue: String },
  emits: ['update:modelValue'],
  template: '<div><slot /></div>',
})
const trigger = defineComponent({
  props: { id: String },
  template: '<button :id="id" type="button"><slot /></button>',
})
const item = defineComponent({
  props: { value: String },
  template: '<option :value="value"><slot /></option>',
})

const stubs = {
  Button: button,
  Card: passthrough,
  Tooltip: passthrough,
  TooltipTrigger: passthrough,
  TooltipContent: passthrough,
  FloatingLabelField: floatingField,
  SearchInput: searchInput,
  Plus: true,
  Select: select,
  SelectContent: passthrough,
  SelectItem: item,
  SelectTrigger: trigger,
  SelectValue: passthrough,
}

const question = (
  overrides: Partial<QuestionSummary> = {},
): QuestionSummary => ({
  id: 'q-1',
  subjectId: 'math',
  gradeId: 'g7',
  authorEmployeeId: 'emp-1',
  type: 'MULTIPLE_CHOICE',
  status: 'DRAFT',
  currentVersion: 1,
  approvedVersion: null,
  revision: 1,
  bodyHtml: '<p dir="auto">Berapa $2+3$?</p>',
  points: 1,
  authorName: 'Ustadz Ahmad',
  createdAt: '2026-10-24T08:00:00.000Z',
  updatedAt: '2026-10-24T08:00:00.000Z',
  ...overrides,
})

function seed(all: boolean) {
  const store = useExamBankStore()
  store.scope = {
    all,
    pairs: all
      ? []
      : [
          {
            subjectId: 'math',
            subjectName: 'Matematika',
            gradeId: 'g7',
            gradeLevel: 7,
            gradeName: null,
          },
        ],
  }
  store.subjects = all ? [{ id: 'math', name: 'Matematika' }] : []
  store.grades = all ? [{ id: 'g7', level: 7, name: null }] : []
  return store
}

describe('QuestionListView', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    permissions.clear()
    ;['read', 'create', 'update', 'delete'].forEach((action) =>
      permissions.add(`exam-questions.${action}`),
    )
    listState.questions.value = [question()]
    listState.totalItems.value = 1
    listState.loading.value = false
    listState.listError.value = null
    listState.filtersPending.value = false
    vi.clearAllMocks()
  })

  it('shows each question with its excerpt, labels and status', async () => {
    seed(false)
    const wrapper = mount(QuestionListView, { global: { stubs } })
    await flushPromises()

    const text = wrapper.get(CARDS).text()
    expect(cardRows(wrapper)).toHaveLength(1)
    expect(text).toContain('Berapa $2+3$?')
    expect(text).toContain('Pilihan Ganda')
    expect(text).toContain('Matematika')
    expect(text).toContain('Kelas 7')
    expect(text).toContain('Ustadz Ahmad')
    expect(text).toContain('Draf')
    wrapper.unmount()
  })

  it('goes back to the first page when a filter changes', async () => {
    seed(false)
    listState.totalItems.value = 50
    const wrapper = mount(QuestionListView, { global: { stubs } })
    await nextCardPage(wrapper).trigger('click')
    expect(filters.page.value).toBe(2)

    filters.status.value = 'SUBMITTED'

    expect(filters.page.value).toBe(1)
    wrapper.unmount()
  })

  it('offers no delete on a question that was approved once, and no submit on a submitted one', async () => {
    seed(false)
    const wrapper = mount(QuestionListView, { global: { stubs } })
    await flushPromises()

    const never = rowActionProps(wrapper, question())
    const approvedOnce = rowActionProps(
      wrapper,
      question({ status: 'DRAFT', currentVersion: 2, approvedVersion: 1 }),
    )
    const submitted = rowActionProps(wrapper, question({ status: 'SUBMITTED' }))

    expect(never.hideDelete).toBe(false)
    expect(approvedOnce.hideDelete).toBe(true)
    expect(
      (never.items as unknown as { disabled: boolean }[])[0]?.disabled,
    ).toBe(false)
    expect(
      (submitted.items as unknown as { disabled: boolean }[])[0]?.disabled,
    ).toBe(true)
    wrapper.unmount()
  })

  it('hides the delete and submit actions from a user who cannot change questions', async () => {
    seed(false)
    permissions.clear()
    permissions.add('exam-questions.read')
    const wrapper = mount(QuestionListView, { global: { stubs } })
    await flushPromises()

    const props = rowActionProps(wrapper, question())
    expect(props.hideDelete).toBe(true)
    expect(props.hideEdit).toBe(true)
    expect(props.items).toEqual([])
    expect(wrapper.text()).not.toContain('Tambah')
    wrapper.unmount()
  })

  it('shows the author filter only to a user who manages every question', async () => {
    seed(false)
    const teacher = mount(QuestionListView, { global: { stubs } })
    await flushPromises()
    expect(teacher.findAll('label').map((label) => label.text())).not.toContain(
      'Penulis',
    )
    expect(loadAuthors).not.toHaveBeenCalled()
    teacher.unmount()

    seed(true)
    const manager = mount(QuestionListView, { global: { stubs } })
    await flushPromises()
    expect(manager.findAll('label').map((label) => label.text())).toContain(
      'Penulis',
    )
    expect(loadAuthors).toHaveBeenCalled()
    manager.unmount()
  })
})
