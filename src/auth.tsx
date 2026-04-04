import { useState, type PropsWithChildren } from 'react'
import { AuthContext } from './auth-context'
import { loginWithRuntime } from './lib/demo-api'
import { getStoredSession, setStoredSession } from './lib/storage'
import type { SessionUser } from './types'

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<SessionUser | null>(() => getStoredSession())

  async function login(username: string, password: string) {
    const nextUser = (await loginWithRuntime(username, password)) as SessionUser
    setStoredSession(nextUser)
    setUser(nextUser)
  }

  function logout() {
    setStoredSession(null)
    setUser(null)
  }

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>
}
