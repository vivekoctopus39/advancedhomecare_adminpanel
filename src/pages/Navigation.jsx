import { useState } from 'react'
import { Save } from 'lucide-react'
import { Button, Card, ErrorBox, Field, PageHeader, Spinner } from '../components/ui'
import ResourcePage from '../components/ResourcePage'
import { useApiGet } from '../hooks/useApi'
import { api } from '../lib/api'
import { useToast } from '../context/contexts'

const MENU_HELP = {
  header: 'Links in the top navigation bar (desktop and mobile menu).',
  header_cta: 'The highlighted button at the top right. Only the first link is used.',
  footer_company: 'First link column in the footer.',
  footer_services: 'Second link column in the footer.',
  footer_support: 'Third link column in the footer.',
}

const itemFields = [
  { key: 'label', label: 'Link text', required: true },
  { key: 'url', label: 'Link', required: true, hint: 'e.g. /about, /services/elderly-care, /#why-choose-us or https://…' },
  { key: 'isActive', label: 'Show on website', type: 'toggle', default: true },
]
const itemColumns = [
  { key: 'label', label: 'Text', className: 'font-semibold' },
  { key: 'url', label: 'Link', className: 'text-slate-500' },
]

function MenuTitle({ menu, onSaved }) {
  const toast = useToast()
  const [title, setTitle] = useState(menu.title)
  const [saving, setSaving] = useState(false)

  const save = async () => {
    setSaving(true)
    try {
      await api.put(`/api/admin/nav-menus/${menu.id}`, { title })
      toast.success('Heading saved.')
      onSaved()
    } catch (e) {
      toast.error(e.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mb-4 flex flex-wrap items-end gap-2">
      <Field label="Column heading (shown in footer)" className="min-w-60 flex-1">
        {(id) => <input id={id} className="input" value={title} onChange={(e) => setTitle(e.target.value)} />}
      </Field>
      <Button variant="secondary" icon={Save} loading={saving} onClick={save} disabled={title === menu.title}>
        Save heading
      </Button>
    </div>
  )
}

export default function Navigation() {
  const { data, loading, error, reload } = useApiGet('/api/admin/nav-menus')
  const menus = data?.data || []
  const [activeId, setActiveId] = useState(null)
  const active = menus.find((m) => m.id === activeId) || menus[0]

  return (
    <div>
      <PageHeader title="Navbar & footer" description="Edit the top navigation bar, header button and footer link columns." />
      {error && <ErrorBox message={error.message} onRetry={reload} />}
      {loading && !data ? (
        <Spinner />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
          <nav className="flex gap-2 overflow-x-auto lg:flex-col" aria-label="Menus">
            {menus.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setActiveId(m.id)}
                className={`shrink-0 rounded-xl border px-4 py-3 text-left text-sm transition ${
                  active?.id === m.id ? 'border-brand bg-brand-50 font-semibold text-brand' : 'border-slate-200 bg-white hover:border-brand/40'
                }`}
              >
                {m.title}
                <span className="block text-xs font-normal text-slate-500">{m.code.replace('_', ' ')}</span>
              </button>
            ))}
          </nav>
          {active && (
            <Card title={active.title} description={MENU_HELP[active.code]}>
              {active.code.startsWith('footer') && <MenuTitle key={`${active.id}-${active.title}`} menu={active} onSaved={reload} />}
              <ResourcePage
                key={active.id}
                hideHeader
                endpoint="/api/admin/nav-items"
                query={`?menuId=${active.id}`}
                itemName="link"
                fields={itemFields}
                columns={itemColumns}
                toPayload={(payload, isEdit) => (isEdit ? payload : { ...payload, menuId: active.id })}
              />
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
