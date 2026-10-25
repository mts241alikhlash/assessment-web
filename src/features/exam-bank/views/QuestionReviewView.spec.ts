// @vitest-environment happy-dom
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import { defineComponent, ref, type Ref } from 'vue'
import { createPinia, setActivePinia } from 'pinia'
import QuestionReviewView from './QuestionReviewView.vue'
import type { QuestionSummary } from '../types'
import { CARDS, cardRows } from '@/test/dataTableCards'

const { loadReferences, loadAuthors, approveMany, refresh, fixed } = vi.hoisted(
  () => ({
    loadReferences: vi.fn<() => Promise<void>>(),
    loadAuthors: vi.fn<() => Promise<void>>(),
    approveMany: vi.fn(),
    refresh: vi.fn(),
    fixed: { status: undefined as string | undefined },
  }),
)
const listState = {
  questions: ref<QuestionSummary[]>([]),
  totalItems: ref(0),
  loading: ref(false),
  listError: ref<string | null>(null),
  filtersPending: ref(false),
}

vi.mock('../services/examBankService', () => ({
  examBankService: { loadReferences, loadAuthors, approveMany },
}))
vi.mock('../composables/useQuestionList', () => ({
  useQuestionList: (
    _filters: unknown,
    _page: Ref<number>,
    _size: Ref<number>,
    _scope: string[],
    status?: string,
  ) => {
    fixed.status = status
    return { ...listState, refresh }
  },
}))

const passthrough = defineComponent({ template: '<div><slot /></div>' })
const floatingField = defineComponent({
  props: { label: String, for: String, floating: Boolean },
  template: '<div><label :for="$props.for">{{ label }}</label><slot /></div>',
})
const searchInput = defineComponent({
  props: { modelValue: String, label: String },
  template: '<input :aria-label="label" :value="modelValue" />',
})
const button = defineComponent({
  props: { variant: String, disabled: Boolean },
  template: '<button :disabled="disabled"><slot /></button>',
})
const select = defineComponent({
  props: { modelValue: String },
  template: '<div><slot /></div>',
})
const trigger = defineComponent({
  props: { id: String },
  template: '<button :id="id" type="button"><slot /></button>',
})
const stubs = {
  Button: button,
  Card: passthrough,
  Tooltip: passthrough,
  TooltipTrigger: passthrough,
  TooltipContent: passthrough,
  FloatingLabelField: floatingField,
  SearchInput: searchInput,
  Select: select,
  SelectContent: passthrough,
  SelectItem: passthrough,
  SelectTrigger: trigger,
  SelectValue: passthrough,
  QuestionReviewDialog: passthrough,
  Dialog: passthrough,
  DialogContent: passthrough,
  DialogHeader: passthrough,
  DialogTitle: passthrough,
  DialogDescription: passthrough,
  DialogBody: passthrough,
  DialogFooter: passthrough,
}

const row = (id: string, revision = 1): QuestionSummary => ({
  id,
  subjectId: 'math',
  gradeId: 'g7',
  authorEmployeeId: 'emp-1',
  type: 'TRUE_FALSE',
  status: 'SUBMITTED',
  currentVersion: 1,
  approvedVersion: null,
  revision,
  bodyHtml: `<p>Soal ${id}</p>`,
  points: 1,
  authorName: 'Ustadz Ahmad',
  createdAt: '2026-10-24T08:00:00.000Z',
  updatedAt: '2026-10-24T08:00:00.000Z',
})

const checkboxes = (wrapper: unknown) =>
  (wrapper as VueWrapper).findAll('[role="checkbox"]')

describe('QuestionReviewView', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    listState.questions.value = [row('a', 4), row('b', 2)]
    listState.totalItems.value = 2
    loadReferences.mockResolvedValue(undefined)
    loadAuthors.mockResolvedValue(undefined)
  })

  it('lists only submitted questions', async () => {
    const wrapper = mount(QuestionReviewView, { global: { stubs } })
    await flushPromises()

    expect(fixed.status).toBe('SUBMITTED')
    expect(cardRows(wrapper)).toHaveLength(2)
    expect(wrapper.get(CARDS).text()).toContain('Soal a')
    expect(loadAuthors).toHaveBeenCalledWith('SUBMITTED')
  })

  it('approves the selected questions with the revision each row showed and reports the skipped ones', async () => {
    approveMany.mockResolvedValue([
      { id: 'a', ok: true },
      {
        id: 'b',
        ok: false,
        reason: 'Hanya soal yang diajukan yang bisa disetujui',
      },
    ])
    const wrapper = mount(QuestionReviewView, { global: { stubs } })
    await flushPromises()

    for (const box of checkboxes(wrapper).slice(-2)) await box.trigger('click')
    await flushPromises()
    await wrapper
      .findAll('button')
      .find((node) => node.text().includes('Setujui terpilih'))!
      .trigger('click')
    await flushPromises()

    expect(approveMany).toHaveBeenCalledWith([
      { id: 'a', revision: 4 },
      { id: 'b', revision: 2 },
    ])
    const result = wrapper.get('[data-testid="bulk-result"]').text()
    expect(result).toContain('1 soal disetujui, 1 dilewati')
    expect(result).toContain(
      'Soal b: Hanya soal yang diajukan yang bisa disetujui',
    )
    expect(refresh).toHaveBeenCalled()
  })

  it('refuses more than fifty at once', async () => {
    listState.questions.value = Array.from({ length: 51 }, (_, i) =>
      row(`q${i}`),
    )
    listState.totalItems.value = 51
    const wrapper = mount(QuestionReviewView, { global: { stubs } })
    await flushPromises()

    await wrapper.get('[aria-label="Pilih semua"]').trigger('click')
    await flushPromises()

    const bulk = wrapper
      .findAll('button')
      .find((node) => node.text().includes('Setujui terpilih'))!
    expect(bulk.attributes('disabled')).toBeDefined()
    expect(wrapper.text()).toContain('Paling banyak 50 soal sekaligus.')
    expect(approveMany).not.toHaveBeenCalled()
  }, 30_000)
})
