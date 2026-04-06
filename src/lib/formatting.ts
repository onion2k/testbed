export function currency(value: number) {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
  }).format(value)
}

export function calculateDisplayedSubtotal(subtotal: number, hasBrokenCheckoutTotal: boolean) {
  return hasBrokenCheckoutTotal ? Math.max(subtotal - 7, 0) : subtotal
}

export function calculateCheckoutTotals(subtotal: number, hasBrokenCheckoutTotal: boolean) {
  const shipping = 12
  const displayedSubtotal = calculateDisplayedSubtotal(subtotal, hasBrokenCheckoutTotal)
  const total = displayedSubtotal + shipping

  return {
    subtotal: displayedSubtotal,
    shipping,
    total,
  }
}

export function shuffleItems<T>(items: T[]) {
  const next = [...items]

  for (let index = next.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1))
    const current = next[index]
    next[index] = next[swapIndex]
    next[swapIndex] = current
  }

  return next
}
