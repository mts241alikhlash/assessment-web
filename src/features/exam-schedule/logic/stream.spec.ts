import { describe, expect, it } from 'vitest'
import { isSeatDead } from './stream'

const now = new Date('2026-10-30T08:00:00Z')

describe('isSeatDead', () => {
  it('is dead after a minute without a heartbeat', () => {
    expect(isSeatDead('2026-10-30T07:58:59Z', now)).toBe(true)
  })

  it('is alive while the heartbeat is recent', () => {
    expect(isSeatDead('2026-10-30T07:59:01Z', now)).toBe(false)
  })

  it('is dead when the seat never sent a heartbeat', () => {
    expect(isSeatDead(null, now)).toBe(true)
  })

  it('is alive exactly at the threshold', () => {
    expect(isSeatDead('2026-10-30T07:59:00Z', now)).toBe(false)
  })
})
