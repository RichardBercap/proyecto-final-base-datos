import { describe, expect, it } from 'vitest'
import { formatCurrency } from '@/utils/format'

describe('formatCurrency', () => {
  it('formats bolivian currency', () => {
    expect(formatCurrency(12)).toContain('12')
  })
})
