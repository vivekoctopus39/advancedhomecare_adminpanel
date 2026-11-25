import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { LogIn } from 'lucide-react'
import { Button, ErrorBox, Field } from '../components/ui'
import { useAuth } from '../context/contexts'

export default function Login() {
  const { login, status } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (status === 'authenticated') return <Navigate to="/" replace />

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email.trim(), password)
      navigate(location.state?.from || '/', { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid min-h-screen place-items-center bg-gradient-to-br from-brand-dark via-brand to-accent-dark p-4">
      <form onSubmit={onSubmit} className="w-full max-w-sm rounded-2xl bg-white p-7 shadow-2xl">
        <div className="mb-6 text-center">
          <span className="mx-auto mb-3 grid size-12 place-items-center rounded-2xl bg-brand text-xl font-extrabold text-white">A</span>
          <h1 className="text-xl font-extrabold">Advanced Home Care</h1>
          <p className="text-sm text-slate-500">Sign in to the admin panel</p>
        </div>
        <div className="flex flex-col gap-4">
          {error && <ErrorBox message={error} />}
          <Field label="Email">
            {(id) => (
              <input id={id} type="email" className="input" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} />
            )}
          </Field>
          <Field label="Password">
            {(id) => (
              <input
                id={id}
                type="password"
                className="input"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            )}
          </Field>
          <Button type="submit" icon={LogIn} loading={loading} className="mt-2 w-full justify-center">
            Sign in
          </Button>
        </div>
      </form>
    </div>
  )
}
