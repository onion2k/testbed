import type { DemoUser, PaymentDetails, ShippingDetails } from '../types'

export function validateLoginForm(username: string, password: string) {
  const errors: Record<string, string> = {}

  if (!username.trim()) {
    errors.username = 'Username is required.'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(username.trim())) {
    errors.username = 'Enter a valid email address.'
  }

  if (!password.trim()) {
    errors.password = 'Password is required.'
  } else if (password.trim().length < 6) {
    errors.password = 'Password must be at least 6 characters.'
  }

  return errors
}

export function validateShippingForm(shipping: ShippingDetails) {
  const errors: Partial<Record<keyof ShippingDetails, string>> = {}

  if (!shipping.fullName.trim()) errors.fullName = 'Full name is required.'
  if (!shipping.email.trim()) {
    errors.email = 'Email is required.'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(shipping.email.trim())) {
    errors.email = 'Enter a valid email address.'
  }
  if (!shipping.address1.trim()) errors.address1 = 'Address line 1 is required.'
  if (!shipping.city.trim()) errors.city = 'City is required.'
  if (!shipping.postcode.trim()) {
    errors.postcode = 'Postcode is required.'
  } else if (shipping.postcode.trim().length < 4) {
    errors.postcode = 'Postcode must be at least 4 characters.'
  }
  if (!shipping.country.trim()) errors.country = 'Country is required.'

  return errors
}

export function validatePaymentForm(payment: PaymentDetails) {
  const errors: Partial<Record<keyof PaymentDetails, string>> = {}
  const normalizedCardNumber = payment.cardNumber.replace(/\s+/g, '')

  if (!payment.cardName.trim()) errors.cardName = 'Name on card is required.'
  if (!normalizedCardNumber) {
    errors.cardNumber = 'Card number is required.'
  } else if (!/^\d{16}$/.test(normalizedCardNumber)) {
    errors.cardNumber = 'Card number must contain 16 digits.'
  }
  if (!payment.expiry.trim()) {
    errors.expiry = 'Expiry is required.'
  } else if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(payment.expiry.trim())) {
    errors.expiry = 'Use MM/YY format.'
  }
  if (!payment.cvv.trim()) {
    errors.cvv = 'CVV is required.'
  } else if (!/^\d{3,4}$/.test(payment.cvv.trim())) {
    errors.cvv = 'CVV must be 3 or 4 digits.'
  }

  return errors
}

export function validateManagedUser(user: DemoUser) {
  const errors: Partial<Record<keyof DemoUser, string>> = {}

  if (!user.displayName.trim()) errors.displayName = 'Display name is required.'
  if (!user.username.trim()) {
    errors.username = 'Username is required.'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.username.trim())) {
    errors.username = 'Enter a valid email address.'
  }
  if (!user.password.trim()) {
    errors.password = 'Password is required.'
  } else if (user.password.trim().length < 6) {
    errors.password = 'Password must be at least 6 characters.'
  }

  return errors
}
