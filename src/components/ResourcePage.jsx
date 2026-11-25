import { useEffect, useMemo, useState } from 'react'
import { ArrowDown, ArrowUp, Pencil, Plus, Trash2 } from 'lucide-react'
import { Button, Card, ConfirmDialog, EmptyState, ErrorBox, Modal, PageHeader, Spinner, Toggle } from './ui'
import FormFields from './FormFields'
import { useApiGet } from '../hooks/useApi'
import { api } from '../lib/api'
import { useToast } from '../context/contexts'

/** Loads select options declared with `optionsFrom: { path, value, label }`. */
function useFieldOptions(fields) {
  const [options, setOptions] = useState({})
  const sources = useMemo(() => fields.filter((f) => f.optionsFrom), [fields])

  useEffect(() => {
    let active = true
    Promise.all(
      sources.map((f) =>
        api
          .get(f.optionsFrom.path)
          .then(({ data }) => [f.key, data.map((row) => ({ value: String(row[f.optionsFrom.value || 'id']), label: row[f.optionsFrom.label] }))])
          .catch(() => [f.key, []]),
      ),
    ).then((entries) => active && setOptions(Object.fromEntries(entries)))
    return () => {
      active = false
    }
  }, [sources])

  return options
}

const blank = (fields, defaults = {}) =>
  Object.fromEntries(
    fields.map((f) => [f.key, defaults[f.key] ?? (f.type === 'toggle' ? (f.default ?? false) : f.type === 'list' ? [] : '')]),
  )

/**
 * Generic list + create/edit/delete/reorder screen for one API resource.
 *
 * config: { title, description, endpoint, query, itemName, fields, columns,
 *           defaults, canCreate, canDelete, sortable, toPayload, hideHeader }
 */
export default function ResourcePage({
  title,
  description,
  endpoint,
  query = '',
  itemName = 'item',
  fields,
  columns,
  defaults,
  canCreate = true,
  canDelete = true,
  sortable = true,
  toPayload,
  hideHeader = false,
  activeKey = 'isActive',
  actions,
}) {
  const toast = useToast()
  const { data, loading, error, reload } = useApiGet(`${endpoint}${query}`)
  const options = useFieldOptions(fields)
  const rows = data?.data || []

  const [editing, setEditing] = useState(null) // { id?, values }
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(null)
  const [busy, setBusy] = useState(false)

  const optionLabel = (key, value) => options[key]?.find((o) => o.value === String(value))?.label

  const openCreate = () => {
    setErrors({})
    setEditing({ values: blank(fields, defaults) })
  }
  const openEdit = (row) => {
    setErrors({})
    const values = blank(fields)
    for (const f of fields) {
      const v = row[f.key]
      values[f.key] = v === null || v === undefined ? values[f.key] : f.type === 'select' ? String(v) : v
    }
    if (fields.some((f) => f.previewKey)) fields.forEach((f) => f.previewKey && (values[f.previewKey] = row[f.previewKey]))
    setEditing({ id: row.id, values })
  }

  const save = async () => {
    setSaving(true)
    setErrors({})
    try {
      let payload = {}
      for (const f of fields) {
        const v = editing.values[f.key]
        if (f.omitIfEmpty && (v === '' || v === null || v === undefined)) continue
        if (f.readOnlyOnEdit && editing.id) continue
        payload[f.key] = f.type === 'list' ? (v || []).map((s) => s.trim()).filter(Boolean) : v
      }
      if (toPayload) payload = toPayload(payload, Boolean(editing.id))
      if (editing.id) await api.put(`${endpoint}/${editing.id}`, payload)
      else await api.post(endpoint, payload)
      toast.success(`${itemName[0].toUpperCase()}${itemName.slice(1)} saved.`)
      setEditing(null)
      reload()
    } catch (e) {
      setErrors(e.errors || {})
      toast.error(e.message)
    } finally {
      setSaving(false)
    }
  }

  const remove = async () => {
    setBusy(true)
    try {
      await api.del(`${endpoint}/${deleting.id}`)
      toast.success(`${itemName[0].toUpperCase()}${itemName.slice(1)} deleted.`)
      setDeleting(null)
      reload()
    } catch (e) {
      toast.error(e.message)
    } finally {
      setBusy(false)
    }
  }

  const move = async (index, dir) => {
    const ids = rows.map((r) => r.id)
    const j = index + dir
    ;[ids[index], ids[j]] = [ids[j], ids[index]]
    try {
      await api.put(`${endpoint}/reorder`, { ids })
      reload()
    } catch (e) {
      toast.error(e.message)
    }
  }

  const toggleActive = async (row) => {
    try {
      await api.put(`${endpoint}/${row.id}`, { [activeKey]: !row[activeKey] })
      reload()
    } catch (e) {
      toast.error(e.message)
    }
  }

  const hasActive = fields.some((f) => f.key === activeKey)
  const createButton = canCreate && (
    <Button icon={Plus} onClick={openCreate}>
      Add {itemName}
    </Button>
  )

  return (
    <div>
      {!hideHeader && (
        <PageHeader
          title={title}
          description={description}
          actions={
            <>
              {actions}
              {createButton}
            </>
          }
        />
      )}
      {hideHeader && canCreate && <div className="mb-4 flex justify-end gap-2">{createButton}</div>}

      {error && <ErrorBox message={error.message} onRetry={reload} />}
      {loading && !data ? (
        <Spinner />
      ) : rows.length === 0 && !error ? (
        <EmptyState title={`No ${itemName}s yet`} text={canCreate ? `Click “Add ${itemName}” to create one.` : undefined} />
      ) : (
        <Card className="overflow-hidden [&>div]:p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs tracking-wide text-slate-500 uppercase">
                <tr>
                  {columns.map((c) => (
                    <th key={c.key} className={`px-4 py-3 font-semibold ${c.className || ''}`}>
                      {c.label}
                    </th>
                  ))}
                  {hasActive && <th className="px-4 py-3 font-semibold">Visible</th>}
                  <th className="px-4 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((row, i) => (
                  <tr key={row.id} className="hover:bg-slate-50/60">
                    {columns.map((c) => (
                      <td key={c.key} className={`px-4 py-3 align-middle ${c.className || ''}`}>
                        {c.render ? c.render(row, { optionLabel }) : row[c.key] ?? '—'}
                      </td>
                    ))}
                    {hasActive && (
                      <td className="px-4 py-3">
                        <Toggle checked={row[activeKey]} onChange={() => toggleActive(row)} />
                      </td>
                    )}
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        {sortable && (
                          <>
                            <Button variant="ghost" size="icon" icon={ArrowUp} aria-label="Move up" disabled={i === 0} onClick={() => move(i, -1)} />
                            <Button
                              variant="ghost"
                              size="icon"
                              icon={ArrowDown}
                              aria-label="Move down"
                              disabled={i === rows.length - 1}
                              onClick={() => move(i, 1)}
                            />
                          </>
                        )}
                        <Button variant="ghost" size="icon" icon={Pencil} aria-label="Edit" onClick={() => openEdit(row)} />
                        {canDelete && (
                          <Button variant="ghost" size="icon" icon={Trash2} aria-label="Delete" className="hover:!bg-red-50 hover:!text-red-600" onClick={() => setDeleting(row)} />
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <Modal
        open={Boolean(editing)}
        title={editing?.id ? `Edit ${itemName}` : `Add ${itemName}`}
        size="lg"
        onClose={() => setEditing(null)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button loading={saving} onClick={save}>
              Save
            </Button>
          </>
        }
      >
        {editing && (
          <FormFields
            fields={fields}
            values={editing.values}
            errors={errors}
            options={options}
            isEdit={Boolean(editing.id)}
            onChange={(key, value) => setEditing((e) => ({ ...e, values: { ...e.values, [key]: value } }))}
          />
        )}
      </Modal>

      <ConfirmDialog
        open={Boolean(deleting)}
        loading={busy}
        title={`Delete ${itemName}?`}
        message="This cannot be undone. It will be removed from the website immediately."
        onConfirm={remove}
        onClose={() => setDeleting(null)}
      />
    </div>
  )
}

