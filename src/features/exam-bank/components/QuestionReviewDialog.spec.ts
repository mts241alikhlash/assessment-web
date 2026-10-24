// @vitest-environment happy-dom
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { defineComponent } from 'vue'
import { createPinia, setActivePinia } from 'pinia'
import QuestionReviewDialog from './QuestionReviewDialog.vue'
import type { QuestionDetail } from '../types'

const { loadQuestion, approveQuestion, returnQuestion } = vi.hoisted(() => ({
  loadQuestion: vi.fn(),
  approveQuestion: vi.fn(),
  returnQuestion: vi.fn(),
}))
vi.mock('../services/examBankService', () => ({
  examBankService: { loadQuestion, approveQuestion, returnQuestion },
}))

const passthrough = defineComponent({ template: '<div><slot /></div>' })
const button = defineComponent({
  props: { disabled: Boolean },
  template: '<button :disabled="disabled"><slot /></button>',
})
const returnDialog = defineComponent({
  name: 'ReturnQuestionDialog',
  props: { open: Boolean, busy: Boolean },
  emits: ['confirm', 'update:open'],
  template:
    '<button data-testid="send-back" @click="$emit(\'confirm\', \'Perbaiki kunci\')">kirim</button>',
})
const stubs = {
  Dialog: passthrough,
  DialogContent: passthrough,
  DialogHeader: passthrough,
  DialogTitle: passthrough,
  DialogDescription: passthrough,
  DialogBody: passthrough,
  DialogFooter: passthrough,
  Badge: passthrough,
  Button: button,
  QuestionPreview: passthrough,
  ReturnQuestionDialog: returnDialog,
}

const detail: QuestionDetail = {
  id: '3d2a9b2e-6a4f-4b1c-9d0e-1f2a3b4c5d6e',
  subjectId: 'math',
  gradeId: 'g7',
  authorEmployeeId: 'emp-1',
  type: 'TRUE_FALSE',
  status: 'SUBMITTED',
  currentVersion: 3,
  approvedVersion: null,
  revision: 7,
  createdById: 'user-1',
  createdAt: '2026-10-24T08:00:00.000Z',
  updatedAt: '2026-10-24T08:00:00.000Z',
  current: {
    id: 'v3',
    questionId: '3d2a9b2e-6a4f-4b1c-9d0e-1f2a3b4c5d6e',
    number: 3,
    bodyHtml: '<p>Bumi bulat</p>',
    content: { answer: { value: false } },
    points: 1,
    createdById: 'user-1',
    createdAt: '2026-10-24T08:00:00.000Z',
  },
  approved: null,
  reviews: [],
}

function mountDialog() {
  return mount(QuestionReviewDialog, {
    props: { open: true, questionId: detail.id },
    global: { stubs },
  })
}

const findButton = (wrapper: ReturnType<typeof mountDialog>, text: string) =>
  wrapper.findAll('button').find((node) => node.text() === text)!

describe('QuestionReviewDialog', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    loadQuestion.mockResolvedValue(detail)
    approveQuestion.mockResolvedValue(true)
    returnQuestion.mockResolvedValue(true)
  })

  it('shows the answer key to the reviewer', async () => {
    const wrapper = mountDialog()
    await flushPromises()

    expect(wrapper.get('[data-testid="answer-key"]').text()).toContain('Salah')
  })

  it('approves the revision it showed, then reports it is done', async () => {
    const wrapper = mountDialog()
    await flushPromises()

    await findButton(wrapper, 'Setujui').trigger('click')
    await flushPromises()

    expect(approveQuestion).toHaveBeenCalledWith(detail.id, 7)
    expect(wrapper.emitted('done')).toHaveLength(1)
    expect(wrapper.emitted('update:open')).toEqual([[false]])
  })

  it('sends it back with the note and the revision it showed', async () => {
    const wrapper = mountDialog()
    await flushPromises()

    await wrapper.get('[data-testid="send-back"]').trigger('click')
    await flushPromises()

    expect(returnQuestion).toHaveBeenCalledWith(detail.id, 'Perbaiki kunci', 7)
    expect(wrapper.emitted('done')).toHaveLength(1)
  })

  it('stays open and tells the list to reload when the server refuses', async () => {
    approveQuestion.mockResolvedValue(false)
    const wrapper = mountDialog()
    await flushPromises()

    await findButton(wrapper, 'Setujui').trigger('click')
    await flushPromises()

    expect(wrapper.emitted('update:open')).toBeUndefined()
    expect(wrapper.emitted('done')).toHaveLength(1)
  })
})
