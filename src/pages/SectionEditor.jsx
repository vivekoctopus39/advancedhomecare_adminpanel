import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, ExternalLink, Info, Save } from 'lucide-react'
import { Button, Card, ErrorBox, Field, PageHeader, Spinner } from '../components/ui'
import { ImagePicker, LucideIcon } from '../components/inputs'
import ResourcePage from '../components/ResourcePage'
import { useApiGet, useIcons } from '../hooks/useApi'
import { api, WEBSITE_URL } from '../lib/api'
import { DEFAULT_CONFIG, SECTION_CONFIG } from '../lib/sectionConfig'
import { useToast } from '../context/contexts'

const PAGE_PATHS = {
  home: '/',
  about: '/about',
  services: '/services',
  'how-it-works': '/how-it-works',
  contact: '/contact',
  'book-care': '/book-care',
  faq: '/faq',
}

const TEXT_FIELDS = ['eyebrow', 'title', 'highlight']

function IconCell({ iconKey }) {
  const icons = useIcons()
  const icon = icons.find((i) => i.key === iconKey)
  return icon ? (
    <span className="grid size-8 place-items-center rounded-lg bg-brand-50 text-brand">
      <LucideIcon name={icon.lucide} />
    </span>
  ) : (
    '—'
  )
}

/** Items (list entries) of one section, using the generic resource screen. */
function SectionItems({ section, config }) {
  const fieldLabels = config.fields
  const { fields, columns } = useMemo(() => {
    const f = []
    if (fieldLabels.iconKey) f.push({ key: 'iconKey', label: fieldLabels.iconKey, type: 'icon' })
    if (fieldLabels.value) f.push({ key: 'value', label: fieldLabels.value })
    if (fieldLabels.title) f.push({ key: 'title', label: fieldLabels.title, required: true, wide: !fieldLabels.text })
    if (fieldLabels.badge) f.push({ key: 'badge', label: fieldLabels.badge })
    if (fieldLabels.text) f.push({ key: 'text', label: fieldLabels.text, type: 'textarea', rows: 3 })
    if (fieldLabels.isFeatured) f.push({ key: 'isFeatured', label: fieldLabels.isFeatured, type: 'toggle' })
    f.push({ key: 'isActive', label: 'Show on website', type: 'toggle', default: true })

    const c = []
    if (fieldLabels.iconKey) c.push({ key: 'icon', label: 'Icon', render: (r) => <IconCell iconKey={r.iconKey} /> })
    c.push({
      key: 'title',
      label: fieldLabels.title || 'Title',
      render: (r) => (
        <div className="max-w-md">
          <p className="font-semibold">
            {r.value && <span className="mr-1 text-brand">{r.value}</span>}
            {r.title}
            {r.isFeatured && <span className="ml-2 rounded-full bg-accent-50 px-2 py-0.5 text-xs text-accent-dark">Featured</span>}
          </p>
          {r.text && <p className="line-clamp-2 text-xs text-slate-500">{r.text}</p>}
        </div>
      ),
    })
    return { fields: f, columns: c }
  }, [fieldLabels])

  return (
    <Card title={config.label} description="Add, edit, hide or reorder entries. Changes are live immediately.">
      <ResourcePage
        hideHeader
        endpoint="/api/admin/section-items"
        query={`?sectionId=${section.id}`}
        itemName="item"
        fields={fields}
        columns={columns}
        toPayload={(payload, isEdit) => (isEdit ? payload : { ...payload, sectionId: section.id })}
      />
    </Card>
  )
}

export default function SectionEditor() {
  const { id } = useParams()
  const { data, loading, error, reload } = useApiGet(`/api/admin/sections/${id}`)
  if (error) return <ErrorBox message={error.message} onRetry={reload} />
  if (loading || !data) return <Spinner />
  return <SectionForm key={data.data.updatedAt} section={data.data} onSaved={reload} />
}

function SectionForm({ section, onSaved }) {
  const toast = useToast()
  const config = SECTION_CONFIG[section.sectionKey] || DEFAULT_CONFIG
  const labels = config.fields

  const [form, setForm] = useState(() => ({
    eyebrow: section.eyebrow,
    title: section.title,
    highlight: section.highlight,
    body: section.body,
    imageMediaId: section.imageMediaId,
    primaryCtaLabel: section.primaryCtaLabel,
    primaryCtaUrl: section.primaryCtaUrl,
    secondaryCtaLabel: section.secondaryCtaLabel,
    secondaryCtaUrl: section.secondaryCtaUrl,
  }))
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }))

  const save = async () => {
    setSaving(true)
    setErrors({})
    try {
      await api.put(`/api/admin/sections/${section.id}`, form)
      toast.success('Section saved. Refresh the website to see it.')
      onSaved()
    } catch (e) {
      setErrors(e.errors || {})
      toast.error(e.message)
    } finally {
      setSaving(false)
    }
  }

  const hasSectionFields = Object.keys(labels).length > 0
  const ctaBlock = (key, label) => (
    <div className="grid gap-3 rounded-xl border border-slate-200 p-4 sm:grid-cols-2 sm:col-span-2">
      <p className="text-sm font-semibold sm:col-span-2">{label}</p>
      <Field label="Button text" error={errors[`${key}Label`]}>
        {(fid) => <input id={fid} className="input" value={form[`${key}Label`]} onChange={(e) => set(`${key}Label`, e.target.value)} />}
      </Field>
      <Field label="Link" hint="e.g. /contact, /book-care, /services/elderly-care or https://…" error={errors[`${key}Url`]}>
        {(fid) => <input id={fid} className="input" value={form[`${key}Url`]} onChange={(e) => set(`${key}Url`, e.target.value)} />}
      </Field>
      <p className="text-xs text-slate-500 sm:col-span-2">Leave both empty to hide this button.</p>
    </div>
  )

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link to="/sections" className="mb-3 inline-flex items-center gap-1 text-sm font-semibold text-brand">
          <ArrowLeft className="size-4" /> All sections
        </Link>
        <PageHeader
          title={section.adminLabel}
          description={`Section key: ${section.sectionKey}`}
          actions={
            <a
              href={`${WEBSITE_URL}${PAGE_PATHS[section.page] || '/'}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold hover:bg-slate-50"
            >
              <ExternalLink className="size-4" /> View page
            </a>
          }
        />
        {config.note && (
          <p className="flex items-center gap-2 rounded-xl bg-brand-50 px-4 py-3 text-sm text-brand-dark">
            <Info className="size-4 shrink-0" /> {config.note}
          </p>
        )}
      </div>

      {hasSectionFields && (
        <Card
          title="Content"
          actions={
            <Button icon={Save} loading={saving} onClick={save}>
              Save section
            </Button>
          }
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {TEXT_FIELDS.filter((k) => labels[k]).map((k) => (
              <Field key={k} label={labels[k]} error={errors[k]} className={k === 'highlight' ? 'sm:col-span-2' : ''}>
                {(fid) => <input id={fid} className="input" value={form[k]} onChange={(e) => set(k, e.target.value)} />}
              </Field>
            ))}
            {labels.body && (
              <Field label={labels.body} hint="Leave a blank line between paragraphs." error={errors.body} className="sm:col-span-2">
                {(fid) => <textarea id={fid} className="input" rows={5} value={form.body} onChange={(e) => set('body', e.target.value)} />}
              </Field>
            )}
            {labels.image && (
              <Field label={labels.image} hint="Choose from the media library or upload a new photo." className="sm:col-span-2">
                <ImagePicker value={form.imageMediaId} previewUrl={section.imageUrl} onChange={(v) => set('imageMediaId', v)} />
              </Field>
            )}
            {labels.primaryCta && ctaBlock('primaryCta', labels.primaryCta)}
            {labels.secondaryCta && ctaBlock('secondaryCta', labels.secondaryCta)}
          </div>
          <div className="mt-5 flex justify-end">
            <Button icon={Save} loading={saving} onClick={save}>
              Save section
            </Button>
          </div>
        </Card>
      )}

      {config.items && <SectionItems section={section} config={config.items} />}
    </div>
  )
}
