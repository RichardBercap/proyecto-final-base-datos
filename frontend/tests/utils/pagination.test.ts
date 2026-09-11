import { describe, expect, it } from 'vitest'
import { paginate, totalPages } from '@/utils/pagination'

describe('pagination utilities', () => {
  it('paginates items', () => {
    expect(paginate([1, 2, 3, 4], 2, 2)).toEqual([3, 4])
  })

  it('calculates total pages', () => {
    expect(totalPages(21, 10)).toBe(3)
  })
})
