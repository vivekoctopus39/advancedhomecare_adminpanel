import { useState } from 'react'
import { ArrowDown, ArrowUp, Plus, Save, Trash2 } from 'lucide-react'
import { Button, Card, ErrorBox, Field, PageHeader, Spinner } from '../components/ui'
import { useApiGet } from '../hooks/useApi'
import { api } from '../lib/api'
import { useToast } from '../context/contexts'

function LegalEditor({ page, onSaved }) {
  const toast = useToast()
  const [form, setForm] = useState({ title: page.title, intro: page.intro, sections: page.sections })
  const [saving, setSaving] = useState(false)

  const setSection = (i, patch) => setForm((f) => ({ ...f, sections: f.sections.map((s, idx) => (idx === i ? { ...s, ...patch } : s)) }))
  const move = (i, dir) =>
    setForm((f) => {
      const next = [...f.sections]
      ;[next[i], next[i + dir]] = [next[i + dir], next[i]]
      return { ...f, sections: next }
    })

  const save = async () => {
    setSaving(true)
    try {
      await api.put(`/api/admin/legal-pages/${page.id}`, {
        title: form.title,
        intro: form.intro,
        sections: form.sections.map(({ heading, body }) => ({ heading, body })),
      })
      toast.success('Page saved.')
      onSaved()
    } catch (e) {
      toast.error(e.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <Card
        title="Page"
        actions={
          <Button icon={Save} loading={saving} onClick={save}>
            Save page
          </Button>
        }
      >
        <div className="flex flex-col gap-4">
          <Field label="Title" required>
            {(id) => <input id={id} className="input" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />}
          </Field>
          <Field label="Introduction">
            {(id) => <textarea id={id} className="input" rows={3} value={form.intro} onChange={(e) => setForm((f) => ({ ...f, intro: e.target.value }))} />}
          </Field>
        </div>
      </Card>

      {form.sections.map((s, i) => (
        <Card
          key={s.id || `new-${i}`}
          title={`Section ${i + 1}`}
          actions={
            <>
              <Button variant="ghost" size="icon" icon={ArrowUp} aria-label="Move up" disabled={i === 0} onClick={() => move(i, -1)} />
              <Button variant="ghost" size="icon" icon={ArrowDown} aria-label="Move down" disabled={i === form.sections.length - 1} onClick={() => move(i, 1)} />
              <Button
                variant="ghost"
                size="icon"
                icon={Trash2}
                aria-label="Remove section"
                onClick={() => setForm((f) => ({ ...f, sections: f.sections.filter((_, idx) => idx !== i) }))}
              />
            </>
          }
        >
          <div className="flex flex-col gap-4">
            <Field label="Heading">{(id) => <input id={id} className="input" value={s.heading} onChange={(e) => setSection(i, { heading: e.target.value })} />}</Field>
            <Field label="Text" hint="Leave a blank line between paragraphs.">
              {(id) => <textarea id={id} className="input" rows={5} value={s.body} onChange={(e) => setSection(i, { body: e.target.value })} />}
            </Field>
          </div>
        </Card>
      ))}

      <div className="flex flex-wrap justify-between gap-2">
        <Button variant="secondary" icon={Plus} onClick={() => setForm((f) => ({ ...f, sections: [...f.sections, { heading: '', body: '' }] }))}>
          Add section
        </Button>
        <Button icon={Save} loading={saving} onClick={save}>
          Save page
        </Button>
      </div>
    </div>
  )
}

export default function Legal() {
  const { data, loading, error, reload } = useApiGet('/api/admin/legal-pages')
  const pages = data?.data || []
  const [activeId, setActiveId] = useState(null)
  const active = pages.find((p) => p.id === activeId) || pages[0]

  return (
    <div>
      <PageHeader title="Legal pages" description="Privacy Policy and Terms & Conditions. Have them reviewed by a legal advisor before launch." />
      {error && <ErrorBox message={error.message} onRetry={reload} />}
      {loading && !data ? (
        <Spinner />
      ) : (
        <>
          <div className="mb-5 flex gap-2">
            {pages.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setActiveId(p.id)}
                className={`rounded-full px-4 py-2 text-sm font-semibold ${
                  active?.id === p.id ? 'bg-brand text-white' : 'border border-slate-200 bg-white text-slate-600'
                }`}
              >
                {p.title}
              </button>
            ))}
          </div>
          {active && <LegalEditor key={`${active.id}-${active.updatedAt}`} page={active} onSaved={reload} />}
        </>
      )}
    </div>
  )
}
