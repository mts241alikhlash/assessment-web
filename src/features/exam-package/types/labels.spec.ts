import { describe, expect, it } from 'vitest'
import { packageStatusLabel, packageStatusTone } from './labels'

describe('package labels', () => {
  it('names the package statuses in Indonesian', () => {
    expect(packageStatusLabel('DRAFT')).toBe('Draf')
    expect(packageStatusLabel('LOCKED')).toBe('Terkunci')
  })

  it('uses a neutral tone for a draft and a success tone once locked', () => {
    expect(packageStatusTone('DRAFT')).toBe('neutral')
    expect(packageStatusTone('LOCKED')).toBe('success')
  })
})
