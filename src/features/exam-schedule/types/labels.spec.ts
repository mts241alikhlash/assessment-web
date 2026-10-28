import { describe, expect, it } from 'vitest'
import { phaseLabel, phaseTone, scheduleStatusLabel } from './labels'

describe('schedule labels', () => {
  it('names the schedule statuses in Indonesian', () => {
    expect(scheduleStatusLabel('SCHEDULED')).toBe('Terjadwal')
    expect(scheduleStatusLabel('CANCELLED')).toBe('Dibatalkan')
  })

  it('names every phase', () => {
    expect(phaseLabel('CANCELLED')).toBe('Dibatalkan')
    expect(phaseLabel('UPCOMING')).toBe('Belum mulai')
    expect(phaseLabel('RUNNING')).toBe('Berlangsung')
    expect(phaseLabel('ENDED')).toBe('Selesai')
  })

  it('warns for a cancelled schedule and marks a running one as success', () => {
    expect(phaseTone('CANCELLED')).toBe('warning')
    expect(phaseTone('RUNNING')).toBe('success')
    expect(phaseTone('UPCOMING')).toBe('info')
    expect(phaseTone('ENDED')).toBe('neutral')
  })
})
