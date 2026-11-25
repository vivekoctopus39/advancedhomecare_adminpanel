import { useState } from 'react'
import { Save } from 'lucide-react'
import { Button, Card, ErrorBox, Field, PageHeader, Spinner, Toggle } from '../components/ui'
import { ImagePicker } from '../components/inputs'
import { useApiGet } from '../hooks/useApi'
import { api } from '../lib/api'
import { useToast } from '../context/contexts'

const GROUPS = [
  {
    title: 'Brand',
    description: 'Name and logo shown in the header, footer and browser tab.',
    fields: [
      { key: 'siteName', label: 'Website name', required: true },
      { key: 'shortName', label: 'Short name', required: true },
      { key: 'legalName', label: 'Legal / company name (footer copyright)', required: true },
      { key: 'tagline', label: 'Tagline (browser tab on homepage)' },
      { key: 'metaDescription', label: 'Google description', type: 'textarea', hint: 'Shown in search results. About 150 characters.' },
      { key: 'logoMediaId', label: 'Logo', type: 'image' },
    ],
  },
  {
    title: 'Contact details',
    description: 'Used in the header, footer, Contact page, Call and WhatsApp buttons. Leave empty to show “to be updated”.',
    fields: [
      { key: 'phoneDisplay', label: 'Phone (as shown)', placeholder: '+91 98765 43210' },
      { key: 'phoneDial', label: 'Phone (for calling)', placeholder: '+919876543210', hint: 'Digits only, with +91.' },
      { key: 'whatsappNumber', label: 'WhatsApp number', placeholder: '919876543210', hint: 'Country code + number, no + or spaces.' },
      { key: 'email', label: 'Email', type: 'email' },
      { key: 'address', label: 'Address' },
      { key: 'city', label: 'City' },
      { key: 'workingHours', label: 'Working hours', placeholder: 'Mon–Sat, 9 AM – 7 PM' },
      {
        key: 'mapEmbedUrl',
        label: 'Google Maps embed link',
        type: 'textarea',
        hint: 'Google Maps → Share → Embed a map → copy only the src="…" link (starts with https://www.google.com/maps/embed).',
      },
    ],
  },
  {
    title: 'Footer',
    fields: [{ key: 'footerAbout', label: 'Footer description', type: 'textarea' }],
  },
]

const PLATFORMS = { facebook: 'Facebook', instagram: 'Instagram', linkedin: 'LinkedIn', youtube: 'YouTube', x: 'X (Twitter)' }

function SocialLinks() {
  const { data, loading, reload } = useApiGet('/api/admin/social-links')
  if (loading || !data) return <Spinner />
  return <SocialLinksForm key={JSON.stringify(data.data)} initial={data.data} onSaved={reload} />
}

function SocialLinksForm({ initial, onSaved }) {
  const toast = useToast()
  const [links, setLinks] = useState(initial)
  const [saving, setSaving] = useState(false)

  const save = async () => {
    setSaving(true)
    try {
      for (const l of links) await api.put(`/api/admin/social-links/${l.id}`, { url: l.url, isActive: l.isActive })
      toast.success('Social links saved.')
      onSaved()
    } catch (e) {
      toast.error(e.message)
    } finally {
      setSaving(false)
    }
  }

  const update = (id, patch) => setLinks((list) => list.map((l) => (l.id === id ? { ...l, ...patch } : l)))

  return (
    <Card
      title="Social media"
      description="Icons in the footer. Empty links are shown as “coming soon”."
      actions={
        <Button icon={Save} loading={saving} onClick={save}>
          Save links
        </Button>
      }
    >
      {(
        <div className="flex flex-col gap-3">
          {links.map((l) => (
            <div key={l.id} className="grid items-end gap-3 sm:grid-cols-[1fr_auto]">
              <Field label={PLATFORMS[l.platform] || l.platform}>
                {(id) => (
                  <input
                    id={id}
                    className="input"
                    placeholder={`https://${l.platform === 'x' ? 'x' : l.platform}.com/yourpage`}
                    value={l.url}
                    onChange={(e) => update(l.id, { url: e.target.value })}
                  />
                )}
              </Field>
              <div className="pb-2">
                <Toggle checked={l.isActive} onChange={(v) => update(l.id, { isActive: v })} label="Show" />
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}

export default function Settings() {
  const { data, loading, error, reload } = useApiGet('/api/admin/settings')
  if (error) return <ErrorBox message={error.message} onRetry={reload} />
  if (loading || !data) return <Spinner />
  return <SettingsForm key={data.data.updatedAt} initial={data.data} onSaved={reload} />
}

function SettingsForm({ initial, onSaved }) {
  const toast = useToast()
  const [form, setForm] = useState(initial)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  const save = async () => {
    setSaving(true)
    setErrors({})
    try {
      const payload = Object.fromEntries(GROUPS.flatMap((g) => g.fields).map((f) => [f.key, form[f.key] ?? '']))
      await api.put('/api/admin/settings', payload)
      toast.success('Settings saved.')
      onSaved()
    } catch (e) {
      setErrors(e.errors || {})
      toast.error(e.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Site settings"
        description="Logo, contact details, map, footer and social links."
        actions={
          <Button icon={Save} loading={saving} onClick={save}>
            Save settings
          </Button>
        }
      />
      {GROUPS.map((group) => (
        <Card key={group.title} title={group.title} description={group.description}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {group.fields.map((f) => (
              <Field
                key={f.key}
                label={f.label}
                hint={f.hint}
                error={errors[f.key]}
                required={f.required}
                className={f.type === 'textarea' || f.type === 'image' ? 'sm:col-span-2' : ''}
              >
                {(id) =>
                  f.type === 'image' ? (
                    <ImagePicker value={form[f.key]} previewUrl={form.logoUrl} onChange={(v) => setForm((s) => ({ ...s, [f.key]: v }))} />
                  ) : f.type === 'textarea' ? (
                    <textarea
                      id={id}
                      className={`input ${errors[f.key] ? 'input-error' : ''}`}
                      rows={3}
                      value={form[f.key] ?? ''}
                      onChange={(e) => setForm((s) => ({ ...s, [f.key]: e.target.value }))}
                    />
                  ) : (
                    <input
                      id={id}
                      type={f.type || 'text'}
                      className={`input ${errors[f.key] ? 'input-error' : ''}`}
                      placeholder={f.placeholder}
                      value={form[f.key] ?? ''}
                      onChange={(e) => setForm((s) => ({ ...s, [f.key]: e.target.value }))}
                    />
                  )
                }
              </Field>
            ))}
          </div>
        </Card>
      ))}
      <div className="flex justify-end">
        <Button icon={Save} loading={saving} onClick={save}>
          Save settings
        </Button>
      </div>
      <SocialLinks />
    </div>
  )
}
