import { useState, type PropsWithChildren } from 'react'
import { AuthContext } from './auth-context'
import { demoUsers } from './lib/demo-config'
import { getStoredSession, setStoredSession } from './lib/storage'
import type { SessionUser } from './types'

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<SessionUser | null>(() => getStoredSession())

  async function login(username: string, password: string) {
    const match = demoUsers.find(
      (candidate) => candidate.username === username && candidate.password === password,
    )

    if (!match) {
      throw new Error('Invalid username or password.')
    }

    const nextUser: SessionUser = {
      username: match.username,
      role: match.role,
      displayName: match.displayName,
    }

    setStoredSession(nextUser)
    setUser(nextUser)
  }

  function logout() {
    setStoredSession(null)
    setUser(null)
  }

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>
}
