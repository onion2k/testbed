import type { CartItem, SessionUser } from '../types'

const SESSION_KEY = 'demo-session'
const CART_KEY = 'demo-cart'
const WORKSHOP_PROGRESS_KEY = 'workshop-progress'
const WORKSHOP_READ_PARTS_KEY = 'workshop-read-parts'
const WORKSHOP_QUIZ_PROGRESS_KEY = 'workshop-quiz-progress'
const WORKSHOP_LAST_VIEW_KEY = 'workshop-last-view'
const THEME_MODE_KEY = 'theme-mode'

function safeRead<T>(key: string, fallback: T): T {
  const value = window.localStorage.getItem(key)

  if (!value) {
    return fallback
  }

  try {
    return JSON.parse(value) as T
  } catch {
    return fallback
  }
}

function safeWrite<T>(key: string, value: T) {
  window.localStorage.setItem(key, JSON.stringify(value))
}

export function getStoredSession() {
  return safeRead<SessionUser | null>(SESSION_KEY, null)
}

export function setStoredSession(user: SessionUser | null) {
  if (!user) {
    window.localStorage.removeItem(SESSION_KEY)
    return
  }

  safeWrite(SESSION_KEY, user)
}

export function getStoredCart() {
  return safeRead<CartItem[]>(CART_KEY, [])
}

export function setStoredCart(cart: CartItem[]) {
  safeWrite(CART_KEY, cart)
}

export function resetDemoState() {
  window.localStorage.removeItem(SESSION_KEY)
  window.localStorage.removeItem(CART_KEY)
}

export function getStoredWorkshopProgress() {
  return safeRead<Record<string, number>>(WORKSHOP_PROGRESS_KEY, {})
}

export function setStoredWorkshopProgress(progress: Record<string, number>) {
  safeWrite(WORKSHOP_PROGRESS_KEY, progress)
}

export function getStoredWorkshopReadParts() {
  return safeRead<Record<string, boolean>>(WORKSHOP_READ_PARTS_KEY, {})
}

export function setStoredWorkshopReadParts(progress: Record<string, boolean>) {
  safeWrite(WORKSHOP_READ_PARTS_KEY, progress)
}

export function getStoredWorkshopQuizProgress() {
  return safeRead<Record<string, boolean>>(WORKSHOP_QUIZ_PROGRESS_KEY, {})
}

export function setStoredWorkshopQuizProgress(progress: Record<string, boolean>) {
  safeWrite(WORKSHOP_QUIZ_PROGRESS_KEY, progress)
}

export function resetWorkshopProgress() {
  window.localStorage.removeItem(WORKSHOP_PROGRESS_KEY)
  window.localStorage.removeItem(WORKSHOP_READ_PARTS_KEY)
  window.localStorage.removeItem(WORKSHOP_QUIZ_PROGRESS_KEY)
  window.localStorage.removeItem(WORKSHOP_LAST_VIEW_KEY)
}

export function getStoredWorkshopLastView() {
  return safeRead<{ workshopSlug: string; partSlug: string } | null>(WORKSHOP_LAST_VIEW_KEY, null)
}

export function setStoredWorkshopLastView(value: { workshopSlug: string; partSlug: string }) {
  safeWrite(WORKSHOP_LAST_VIEW_KEY, value)
}

export function getStoredThemeMode() {
  return safeRead<'light' | 'dark'>(THEME_MODE_KEY, 'light')
}

export function setStoredThemeMode(value: 'light' | 'dark') {
  safeWrite(THEME_MODE_KEY, value)
}
