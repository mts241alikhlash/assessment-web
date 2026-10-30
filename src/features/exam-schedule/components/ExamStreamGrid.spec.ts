// @vitest-environment happy-dom
import { describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import ExamStreamGrid from './ExamStreamGrid.vue'

const { loadStreams } = vi.hoisted(() => ({ loadStreams: vi.fn() }))


vi.mock('../services/examScheduleService', () => ({
  examScheduleService: { loadStreams },
}))
vi.mock('hls.js', () => ({ default: class { static isSupported() { return false } } }))

vi.mock('@mts241alikhlash/ui/dialog', async () => {
  const { defineComponent } = await import('vue')
  const passthrough = defineComponent({ setup: (_p, { slots }) => () => slots.default?.() })
  const dialog = defineComponent({
    props: { open: Boolean },
    setup: (props, { slots }) => () => (props.open ? slots.default?.() : null),
  })
  return {
    Dialog: dialog,
    DialogBody: passthrough,
    DialogContent: passthrough,
    DialogDescription: passthrough,
    DialogFooter: passthrough,
    DialogHeader: passthrough,
    DialogTitle: passthrough,
  }
})
vi.mock('@mts241alikhlash/ui/button', async () => {
  const { defineComponent, h } = await import('vue')
  return {
    Button: defineComponent({
      emits: ['click'],
      setup: (_p, { slots, emit }) => () =>
        h('button', { onClick: () => emit('click') }, slots.default?.()),
    }),
  }
})

function row(overrides: Record<string, unknown> = {}) {
  return {
    sessionId: 's1',
    studentId: 'st1',
    studentName: 'Ahmad Fauzi',
    studentNis: '2024001',
    status: 'IN_PROGRESS',
    violationCount: 0,
    cameraBlocked: null,
    lastSeenAt: new Date().toISOString(),
    playbackUrl: 'http://media.test/s1/index.m3u8?token=x',
    ...overrides,
  }
}

async function mountGrid(rows: unknown[]) {
  loadStreams.mockResolvedValue({ success: true, data: rows })
  const wrapper = mount(ExamStreamGrid, {
    props: { open: true, scheduleId: 'sched-1', title: 'UH Matematika' },
    global: { stubs: { teleport: true } },
  })
  await flushPromises()
  return wrapper
}

describe('ExamStreamGrid', () => {
  it('shows the seat video and a way to enlarge it', async () => {
    const wrapper = await mountGrid([row()])

    expect(wrapper.find('[data-testid="seat-video"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="seat-expand"]').exists()).toBe(true)
  })

  it('opens the seat full screen when the video is clicked', async () => {
    const wrapper = await mountGrid([row()])

    await wrapper.find('[data-testid="seat-video"]').trigger('click')

    expect(wrapper.find('[data-testid="seat-fullscreen"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('Ahmad Fauzi')
  })

  it('opens full screen from the enlarge button', async () => {
    const wrapper = await mountGrid([row()])

    await wrapper.find('[data-testid="seat-expand"]').trigger('click')

    expect(wrapper.find('[data-testid="seat-fullscreen"]').exists()).toBe(true)
  })

  it('closes full screen again', async () => {
    const wrapper = await mountGrid([row()])
    await wrapper.find('[data-testid="seat-video"]').trigger('click')

    await wrapper.find('[data-testid="seat-fullscreen-close"]').trigger('click')

    expect(wrapper.find('[data-testid="seat-fullscreen"]').exists()).toBe(false)
  })

  it('does not offer full screen for a dead seat', async () => {
    const wrapper = await mountGrid([
      row({ lastSeenAt: new Date(Date.now() - 120_000).toISOString(), playbackUrl: null }),
    ])

    expect(wrapper.find('[data-testid="seat-dead"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="seat-expand"]').exists()).toBe(false)
  })
})
