import { describe, expect, it } from 'vitest'
import {
  QUESTION_STATUSES,
  QUESTION_TYPES,
  statusLabel,
  statusTone,
  typeLabel,
} from '.'

describe('question labels', () => {
  it('names every type and status in Indonesian', () => {
    expect(QUESTION_TYPES.map(typeLabel)).toEqual([
      'Pilihan Ganda',
      'Pilihan Ganda Kompleks',
      'Benar/Salah',
      'Isian Singkat',
      'Uraian',
    ])
    expect(QUESTION_STATUSES.map(statusLabel)).toEqual([
      'Draf',
      'Diajukan',
      'Disetujui',
      'Dikembalikan',
    ])
  })

  it('gives each status a tone for its badge', () => {
    expect(QUESTION_STATUSES.map(statusTone)).toEqual([
      'neutral',
      'info',
      'success',
      'warning',
    ])
  })
})
