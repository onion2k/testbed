import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth-context'
import { resetDemoState } from '../lib/storage'

export function ResetPage() {
  const navigate = useNavigate()
  const { logout } = useAuth()

  useEffect(() => {
    logout()
    resetDemoState()
    navigate('/', { replace: true })
  }, [logout, navigate])

  return <section className="rounded-[2rem] border border-stone-300 bg-white p-8">Resetting browser state...</section>
}
