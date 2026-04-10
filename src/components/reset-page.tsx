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

  return <section className="panel-accent panel-accent-sky rounded-[1.25rem] p-8">Resetting browser state...</section>
}
