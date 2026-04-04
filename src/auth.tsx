import { useState, type PropsWithChildren } from 'react'
import { AuthContext } from './auth-context'
import { getStoredSession, setStoredSession } from './lib/storage'
import type { SessionUser } from './types'

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<SessionUser | null>(() => getStoredSession())

  async function login(username: string, password: string) {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    })

    const payload = (await response.json()) as { error?: string; user?: SessionUser }

    if (!response.ok || !payload.user) {
      throw new Error(payload.error ?? 'Invalid username or password.')
    }

    setStoredSession(payload.user)
    setUser(payload.user)
  }

  function logout() {
    setStoredSession(null)
    setUser(null)
  }

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>
}
