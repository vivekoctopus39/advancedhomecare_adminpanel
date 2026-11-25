import { useState } from 'react'
import { KeyRound } from 'lucide-react'
import { Button, Card, Field, PageHeader } from '../components/ui'
import { api } from '../lib/api'
import { useAuth, useToast } from '../context/contexts'

export default function Account() {
  const { admin } = useAuth()
  const toast = useToast()
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirm: '' })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    if (form.newPassword !== form.confirm) {
      setErrors({ confirm: 'Passwords do not match.' })
      return
    }
    setSaving(true)
    setErrors({})
    try {
      await api.post('/api/auth/change-password', { currentPassword: form.currentPassword, newPassword: form.newPassword })
      toast.success('Password changed.')
      setForm({ currentPassword: '', newPassword: '', confirm: '' })
    } catch (err) {
      setErrors(err.errors || {})
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  const input = (key, label, autoComplete) => (
    <Field label={label} error={errors[key]}>
      {(id) => (
        <input
          id={id}
          type="password"
          className="input"
          autoComplete={autoComplete}
          value={form[key]}
          onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
        />
      )}
    </Field>
  )

  return (
    <div className="max-w-xl">
      <PageHeader title="My account" description={`${admin?.fullName} · ${admin?.email}`} />
      <Card title="Change password" description="At least 8 characters, with a letter and a number.">
        <form onSubmit={submit} className="flex flex-col gap-4">
          {input('currentPassword', 'Current password', 'current-password')}
          {input('newPassword', 'New password', 'new-password')}
          {input('confirm', 'Confirm new password', 'new-password')}
          <div>
            <Button type="submit" icon={KeyRound} loading={saving}>
              Change password
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
