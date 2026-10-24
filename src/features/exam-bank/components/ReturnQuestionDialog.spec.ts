// @vitest-environment happy-dom
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent } from 'vue'
import ReturnQuestionDialog from './ReturnQuestionDialog.vue'

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
const stubs = {
  Dialog: passthrough,
  DialogContent: passthrough,
  DialogHeader: passthrough,
  DialogTitle: passthrough,
  DialogDescription: passthrough,
  DialogBody: passthrough,
  DialogFooter: passthrough,
  FloatingLabelField: field,
  Button: button,
}

const mountDialog = () =>
  mount(ReturnQuestionDialog, {
    props: { open: true, busy: false },
    global: { stubs },
  })

const confirmButton = (wrapper: ReturnType<typeof mountDialog>) =>
  wrapper.findAll('button').find((node) => node.text() === 'Kembalikan')!

describe('ReturnQuestionDialog', () => {
  it('will not send a blank note and says why', async () => {
    const wrapper = mountDialog()

    await wrapper.get('textarea').setValue('   ')
    await confirmButton(wrapper).trigger('click')

    expect(wrapper.text()).toContain('Catatan wajib diisi')
    expect(wrapper.emitted('confirm')).toBeUndefined()
  })

  it('sends the note without surrounding spaces', async () => {
    const wrapper = mountDialog()

    await wrapper.get('textarea').setValue('  Kunci jawaban keliru ')
    await confirmButton(wrapper).trigger('click')

    expect(wrapper.emitted('confirm')).toEqual([['Kunci jawaban keliru']])
  })

  it('cannot be confirmed twice while it is busy', () => {
    const wrapper = mount(ReturnQuestionDialog, {
      props: { open: true, busy: true },
      global: { stubs },
    })

    expect(confirmButton(wrapper as never).attributes('disabled')).toBeDefined()
  })
})
