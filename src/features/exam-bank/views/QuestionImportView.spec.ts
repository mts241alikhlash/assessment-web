// @vitest-environment happy-dom
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import { defineComponent } from 'vue'
import { createPinia, setActivePinia } from 'pinia'
import QuestionImportView from './QuestionImportView.vue'
import { useExamBankStore } from '../stores/examBankStore'

const {
  push,
  loadReferences,
  importQuestions,
  downloadTemplate,
  loadTeachers,
} = vi.hoisted(() => ({
  push: vi.fn(),
  loadReferences: vi.fn(),
  importQuestions: vi.fn(),
  downloadTemplate: vi.fn(),
  loadTeachers: vi.fn(),
}))

vi.mock('vue-router', () => ({ useRouter: () => ({ push }) }))
vi.mock('../services/examBankService', () => ({
  examBankService: {
    loadReferences,
    importQuestions,
    downloadTemplate,
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
const select = defineComponent({
  name: 'SelectStub',
  props: { modelValue: String },
  emits: ['update:modelValue'],
  template: '<div><slot /></div>',
})
const dropzone = defineComponent({
  props: { fileName: String },
  emits: ['change', 'clear'],
  template:
    '<input type="file" data-testid="dropzone" @change="$emit(\'change\', $event)" />',
})
const stubs = {
  BackButton: button,
  Button: button,
  Card: passthrough,
  CardHeader: passthrough,
  CardTitle: passthrough,
  CardContent: passthrough,
  CardFooter: passthrough,
  FloatingLabelField: field,
  FileDropzone: dropzone,
  Select: select,
  SelectContent: passthrough,
  SelectItem: passthrough,
  SelectTrigger: passthrough,
  SelectValue: passthrough,
}

const SUBJECT = '3d2a9b2e-6a4f-4b1c-9d0e-1f2a3b4c5d6e'
const GRADE = '4e3b0c3f-7b5a-4c2d-8e1f-2a3b4c5d6e7f'

function seed() {
  const store = useExamBankStore()
  store.scope = {
    all: false,
    employeeId: 'emp-1',
    pairs: [
      {
        subjectId: SUBJECT,
        subjectName: 'Matematika',
        gradeId: GRADE,
        gradeLevel: 7,
        gradeName: null,
      },
    ],
  }
}

async function choose(host: unknown, file: File) {
  const input = (host as VueWrapper).get('[data-testid="dropzone"]')
  Object.defineProperty(input.element, 'files', {
    value: [file],
    configurable: true,
  })
  await input.trigger('change')
}

function pickPair(host: unknown) {
  const selects = (host as VueWrapper).findAllComponents({ name: 'SelectStub' })
  const emit = (index: number, value: string) =>
    (
      selects[index].vm as unknown as { $emit: (e: string, v: string) => void }
    ).$emit('update:modelValue', value)
  emit(0, SUBJECT)
  emit(1, GRADE)
}

const findButton = (wrapper: unknown, text: string) =>
  (wrapper as VueWrapper)
    .findAll('button')
    .find((node) => node.text().includes(text))

describe('QuestionImportView', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    seed()
    loadReferences.mockResolvedValue(undefined)
  })

  it('posts the chosen file with the chosen subject and grade', async () => {
    importQuestions.mockResolvedValue({
      success: true,
      data: { created: 2, questionIds: ['a', 'b'], errors: [] },
    })
    const wrapper = mount(QuestionImportView, { global: { stubs } })
    await flushPromises()
    pickPair(wrapper)
    await flushPromises()
    const file = new File(['x'], 'soal.xlsx')

    await choose(wrapper, file)
    await findButton(wrapper, 'Impor')!.trigger('click')
    await flushPromises()

    expect(importQuestions).toHaveBeenCalledWith({
      file,
      subjectId: SUBJECT,
      gradeId: GRADE,
      authorEmployeeId: undefined,
    })
    expect(wrapper.get('[data-testid="import-result"]').text()).toContain(
      '2 soal dibuat sebagai draf',
    )
  })

  it('lists each failed row with its number', async () => {
    importQuestions.mockResolvedValue({
      success: true,
      data: {
        created: 4,
        questionIds: [],
        errors: [
          { row: 3, reason: 'Kunci jawaban harus salah satu pilihan' },
          { row: 8, reason: 'Jenis soal tidak dikenal' },
        ],
      },
    })
    const wrapper = mount(QuestionImportView, { global: { stubs } })
    await flushPromises()
    pickPair(wrapper)
    await choose(wrapper, new File(['x'], 'soal.docx'))
    await findButton(wrapper, 'Impor')!.trigger('click')
    await flushPromises()

    const errors = wrapper
      .findAll('[data-testid="import-error"]')
      .map((node) => node.text())
    expect(errors).toEqual([
      'Baris 3: Kunci jawaban harus salah satu pilihan',
      'Baris 8: Jenis soal tidak dikenal',
    ])
  })

  it('links the created count to the list filtered on the new drafts', async () => {
    importQuestions.mockResolvedValue({
      success: true,
      data: { created: 1, questionIds: ['a'], errors: [] },
    })
    const wrapper = mount(QuestionImportView, { global: { stubs } })
    await flushPromises()
    pickPair(wrapper)
    await choose(wrapper, new File(['x'], 'soal.xlsx'))
    await findButton(wrapper, 'Impor')!.trigger('click')
    await flushPromises()

    await findButton(wrapper, 'Lihat soal yang dibuat')!.trigger('click')

    expect(push).toHaveBeenCalledWith({
      path: '/bank-soal',
      query: { status: 'DRAFT', subjectId: SUBJECT, gradeId: GRADE },
    })
  })

  it('asks for subject and grade, and refuses a file of the wrong kind', async () => {
    const wrapper = mount(QuestionImportView, { global: { stubs } })
    await flushPromises()

    await choose(wrapper, new File(['x'], 'soal.csv'))
    expect(wrapper.text()).toContain('Berkas harus .xlsx atau .docx.')

    await choose(wrapper, new File(['x'], 'soal.xlsx'))
    await findButton(wrapper, 'Impor')!.trigger('click')
    expect(wrapper.text()).toContain('Mapel wajib dipilih')
    expect(wrapper.text()).toContain('Tingkat wajib dipilih')
    expect(importQuestions).not.toHaveBeenCalled()
  })

  it('downloads either template', async () => {
    const wrapper = mount(QuestionImportView, { global: { stubs } })
    await flushPromises()

    await findButton(wrapper, 'Template Excel')!.trigger('click')
    await findButton(wrapper, 'Template Word')!.trigger('click')

    expect(downloadTemplate).toHaveBeenNthCalledWith(1, 'xlsx')
    expect(downloadTemplate).toHaveBeenNthCalledWith(2, 'docx')
  })
})
