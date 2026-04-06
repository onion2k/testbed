import { calculateCheckoutTotals, calculateDisplayedSubtotal, shuffleItems } from '../../src/lib/formatting'

describe('formatting utilities', () => {
  it('reduces subtotal when broken checkout mode is enabled', () => {
    expect(calculateDisplayedSubtotal(25, true)).toBe(18)
    expect(calculateDisplayedSubtotal(5, true)).toBe(0)
  })

  it('calculates checkout totals with shipping', () => {
    expect(calculateCheckoutTotals(100, false)).toEqual({
      subtotal: 100,
      shipping: 12,
      total: 112,
    })
  })

  it('shuffles without losing items', () => {
    const items = ['a', 'b', 'c', 'd']
    const result = shuffleItems(items)
    expect(result).toHaveLength(items.length)
    expect([...result].sort()).toEqual([...items].sort())
    expect(result).not.toBe(items)
  })
})
