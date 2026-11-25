import { useState } from 'react'
import { Copy, Pencil, Search, Trash2 } from 'lucide-react'
import { Badge, Button, ConfirmDialog, EmptyState, Field, Modal, PageHeader, Spinner } from '../components/ui'
import { UploadButton } from '../components/inputs'
import { useMedia } from '../hooks/useApi'
import { api, assetUrl } from '../lib/api'
import { useToast } from '../context/contexts'

const kb = (bytes) => (bytes > 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.round(bytes / 1024)} KB`)

export default function Media() {
  const toast = useToast()
  const { media, loading, refresh } = useMedia()
  const [query, setQuery] = useState('')
  const [editing, setEditing] = useState(null)
  const [alt, setAlt] = useState('')
  const [deleting, setDeleting] = useState(null)
  const [busy, setBusy] = useState(false)

  const list = media.filter((m) => !query || `${m.altText} ${m.originalName}`.toLowerCase().includes(query.toLowerCase()))

  const saveAlt = async () => {
    setBusy(true)
    try {
      await api.put(`/api/admin/media/${editing.id}`, { altText: alt })
      toast.success('Image details saved.')
      setEditing(null)
      refresh()
    } catch (e) {
      toast.error(e.message)
    } finally {
      setBusy(false)
    }
  }

  const remove = async () => {
    setBusy(true)
    try {
      await api.del(`/api/admin/media/${deleting.id}`)
      toast.success('Image deleted.')
      setDeleting(null)
      refresh()
    } catch (e) {
      toast.error(e.message)
    } finally {
      setBusy(false)
    }
  }

  const copy = async (url) => {
    try {
      await navigator.clipboard.writeText(assetUrl(url))
      toast.success('Image URL copied.')
    } catch {
      toast.error('Could not copy.')
    }
  }

  return (
    <div>
      <PageHeader
        title="Media library"
        description="All website photos. Upload new ones here or directly from any image field. Old photos stay saved here until you delete them."
        actions={<UploadButton variant="primary" label="Upload images" />}
      />
      <label className="relative mb-5 block max-w-md">
        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
        <input className="input pl-9" placeholder="Search by description or file name…" value={query} onChange={(e) => setQuery(e.target.value)} />
      </label>

      {loading ? (
        <Spinner />
      ) : list.length === 0 ? (
        <EmptyState title="No images" text="Upload JPG, PNG, WEBP or GIF images (max 5 MB each)." />
      ) : (
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {list.map((m) => (
            <li key={m.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
              <img src={assetUrl(m.url)} alt={m.altText} loading="lazy" className="aspect-[4/3] w-full bg-slate-100 object-cover" />
              <div className="flex flex-col gap-2 p-3">
                <p className="line-clamp-2 min-h-10 text-sm font-medium">{m.altText || <span className="text-slate-400">No description</span>}</p>
                <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
                  {m.usageCount > 0 ? <Badge color="green">In use</Badge> : <Badge>Not used</Badge>}
                  <span>{kb(m.sizeBytes)}</span>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    icon={Pencil}
                    aria-label="Edit description"
                    onClick={() => {
                      setEditing(m)
                      setAlt(m.altText)
                    }}
                  />
                  <Button variant="ghost" size="icon" icon={Copy} aria-label="Copy URL" onClick={() => copy(m.url)} />
                  <Button
                    variant="ghost"
                    size="icon"
                    icon={Trash2}
                    aria-label="Delete"
                    className="ml-auto hover:!bg-red-50 hover:!text-red-600"
                    onClick={() => setDeleting(m)}
                  />
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Modal
        open={Boolean(editing)}
        title="Image details"
        onClose={() => setEditing(null)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button loading={busy} onClick={saveAlt}>
              Save
            </Button>
          </>
        }
      >
        {editing && (
          <div className="flex flex-col gap-4">
            <img src={assetUrl(editing.url)} alt="" className="max-h-72 w-full rounded-xl object-contain bg-slate-50" />
            <Field label="Description (alt text)" hint="Describes the photo for screen readers and Google, e.g. “Nurse checking a patient’s blood pressure at home”.">
              {(id) => <input id={id} className="input" value={alt} onChange={(e) => setAlt(e.target.value)} />}
            </Field>
            <p className="text-xs text-slate-500">File: {editing.originalName || editing.fileName}</p>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={Boolean(deleting)}
        loading={busy}
        title="Delete image?"
        message={
          deleting?.usageCount > 0
            ? 'This image is used on the website. Replace it where it is used first, then delete it.'
            : 'The image file will be permanently deleted.'
        }
        onConfirm={remove}
        onClose={() => setDeleting(null)}
      />
    </div>
  )
}
