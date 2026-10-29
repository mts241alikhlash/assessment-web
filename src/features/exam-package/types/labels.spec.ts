import { describe, expect, it } from 'vitest'
import { markerLabel, packageStatusLabel, packageStatusTone } from './labels'

describe('package labels', () => {
  it('names the five statuses in Indonesian', () => {
    expect(packageStatusLabel('DRAFT')).toBe('Draf')
    expect(packageStatusLabel('SUBMITTED')).toBe('Menunggu tinjauan')
    expect(packageStatusLabel('RETURNED')).toBe('Dikembalikan')
    expect(packageStatusLabel('APPROVED')).toBe('Disetujui')
    expect(packageStatusLabel('LOCKED')).toBe('Terjadwal')
  })

  it('gives each status a tone', () => {
    expect(packageStatusTone('DRAFT')).toBe('neutral')
    expect(packageStatusTone('SUBMITTED')).toBe('info')
    expect(packageStatusTone('RETURNED')).toBe('warning')
    expect(packageStatusTone('APPROVED')).toBe('success')
    expect(packageStatusTone('LOCKED')).toBe('neutral')
  })

  it('names the question markers', () => {
    expect(markerLabel('NEW')).toBe('Baru')
    expect(markerLabel('CHANGED')).toBe('Diubah')
    expect(markerLabel('COPIED')).toBe('Salinan')
  })
})
