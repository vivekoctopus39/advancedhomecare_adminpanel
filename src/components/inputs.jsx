import { createElement, useRef, useState } from 'react'
import { ArrowDown, ArrowUp, Check, CircleDashed, HeartPulse, ImageIcon, ImagePlus, Plus, Trash2, Upload, X } from 'lucide-react'
import { lucideByName } from '../lib/iconMap'
import { Button, Modal } from './ui'
import { useIcons, useMedia, invalidateMedia } from '../hooks/useApi'
import { api, assetUrl } from '../lib/api'
import { useToast } from '../context/contexts'

/** Render a lucide icon by its component name. */
export function LucideIcon({ name, className = 'size-4' }) {
  return createElement(lucideByName[name] || HeartPulse, { className })
}

/* ------------------------------------------------------------------ */
/* Icon picker                                                         */
/* ------------------------------------------------------------------ */
export function IconPicker({ value, onChange }) {
  const icons = useIcons()
  const [open, setOpen] = useState(false)
  const current = icons.find((i) => i.key === value)

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="input flex items-center gap-2 text-left">
        <span className="grid size-7 place-items-center rounded-md bg-brand-50 text-brand">
          {current ? <LucideIcon name={current.lucide} /> : <CircleDashed className="size-4 text-slate-400" />}
        </span>
        <span className={current ? '' : 'text-slate-400'}>{current ? value : value || 'Choose icon'}</span>
      </button>
      <Modal open={open} title="Choose an icon" onClose={() => setOpen(false)}>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
          <button
            type="button"
            onClick={() => {
              onChange('')
              setOpen(false)
            }}
            className="flex flex-col items-center gap-1 rounded-lg border border-dashed border-slate-300 p-3 text-xs text-slate-500 hover:border-brand"
          >
            <X className="size-5" /> None
          </button>
          {icons.map((icon) => (
            <button
              key={icon.key}
              type="button"
              onClick={() => {
                onChange(icon.key)
                setOpen(false)
              }}
              className={`flex flex-col items-center gap-1 rounded-lg border p-3 text-xs hover:border-brand hover:bg-brand-50 ${
                icon.key === value ? 'border-brand bg-brand-50 text-brand' : 'border-slate-200'
              }`}
            >
              <LucideIcon name={icon.lucide} className="size-5" />
              <span className="truncate">{icon.key}</span>
            </button>
          ))}
        </div>
      </Modal>
    </>
  )
}

/* ------------------------------------------------------------------ */
/* Media upload button + library picker                                */
/* ------------------------------------------------------------------ */
export function UploadButton({ onUploaded, label = 'Upload image', variant = 'secondary' }) {
  const inputRef = useRef(null)
  const [busy, setBusy] = useState(false)
  const toast = useToast()

  const onFiles = async (files) => {
    if (!files?.length) return
    setBusy(true)
    const uploaded = []
    for (const file of files) {
      const form = new FormData()
      form.append('file', file)
      form.append('altText', file.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' '))
      try {
        const { data } = await api.upload('/api/admin/media', form)
        uploaded.push(data)
      } catch (error) {
        toast.error(`${file.name}: ${error.message}`)
      }
    }
    setBusy(false)
    if (inputRef.current) inputRef.current.value = ''
    if (uploaded.length) {
      invalidateMedia()
      toast.success(uploaded.length === 1 ? 'Image uploaded.' : `${uploaded.length} images uploaded.`)
      onUploaded?.(uploaded)
    }
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        multiple
        hidden
        onChange={(e) => onFiles([...e.target.files])}
      />
      <Button variant={variant} icon={Upload} loading={busy} onClick={() => inputRef.current?.click()}>
        {busy ? 'Uploading…' : label}
      </Button>
    </>
  )
}

export function MediaPickerModal({ open, onClose, onSelect, selectedId }) {
  const { media, loading } = useMedia()
  const [query, setQuery] = useState('')
  const list = media.filter(
    (m) => !query || `${m.altText} ${m.originalName} ${m.fileName}`.toLowerCase().includes(query.toLowerCase()),
  )

  return (
    <Modal
      open={open}
      title="Media library"
      size="xl"
      onClose={onClose}
      footer={
        <UploadButton
          variant="primary"
          label="Upload new image"
          onUploaded={(items) => {
            onSelect(items[0])
            onClose()
          }}
        />
      }
    >
      <input className="input mb-4" placeholder="Search images…" value={query} onChange={(e) => setQuery(e.target.value)} />
      {loading ? (
        <p className="py-10 text-center text-sm text-slate-500">Loading images…</p>
      ) : list.length === 0 ? (
        <p className="py-10 text-center text-sm text-slate-500">No images found. Upload one below.</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5">
          {list.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => {
                onSelect(m)
                onClose()
              }}
              className={`group relative overflow-hidden rounded-xl border-2 text-left ${
                m.id === selectedId ? 'border-brand' : 'border-transparent hover:border-brand/50'
              }`}
            >
              <img src={assetUrl(m.url)} alt={m.altText} className="aspect-[4/3] w-full bg-slate-100 object-cover" loading="lazy" />
              <span className="block truncate px-2 py-1.5 text-xs text-slate-600">{m.altText || m.fileName}</span>
              {m.id === selectedId && (
                <span className="absolute top-2 right-2 grid size-6 place-items-center rounded-full bg-brand text-white">
                  <Check className="size-4" />
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </Modal>
  )
}

/** Image field storing a media id. */
export function ImagePicker({ value, onChange, previewUrl }) {
  const { media } = useMedia()
  const [open, setOpen] = useState(false)
  const selected = media.find((m) => m.id === Number(value))
  const url = selected ? assetUrl(selected.url) : previewUrl ? assetUrl(previewUrl) : ''

  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="grid h-28 w-40 shrink-0 place-items-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
        {value && url ? (
          <img src={url} alt={selected?.altText || ''} className="size-full object-cover" />
        ) : (
          <ImageIcon className="size-8 text-slate-300" />
        )}
      </div>
      <div className="flex flex-col gap-2">
        <Button variant="secondary" icon={ImagePlus} onClick={() => setOpen(true)}>
          {value ? 'Change image' : 'Choose image'}
        </Button>
        {value ? (
          <Button variant="ghost" size="sm" icon={X} onClick={() => onChange(null)}>
            Remove
          </Button>
        ) : null}
        {selected?.altText && <p className="max-w-56 truncate text-xs text-slate-500">Alt: {selected.altText}</p>}
      </div>
      <MediaPickerModal open={open} onClose={() => setOpen(false)} selectedId={Number(value)} onSelect={(m) => onChange(m.id)} />
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Editable list of strings (features, skills, …)                      */
/* ------------------------------------------------------------------ */
export function StringListEditor({ value = [], onChange, placeholder = 'Add an item', addLabel = 'Add item' }) {
  const list = Array.isArray(value) ? value : []
  const update = (i, text) => onChange(list.map((item, idx) => (idx === i ? text : item)))
  const move = (i, dir) => {
    const next = [...list]
    const j = i + dir
    if (j < 0 || j >= next.length) return
    ;[next[i], next[j]] = [next[j], next[i]]
    onChange(next)
  }
  return (
    <div className="flex flex-col gap-2">
      {list.map((item, i) => (
        <div key={i} className="flex items-center gap-1.5">
          <input className="input" value={item} placeholder={placeholder} onChange={(e) => update(i, e.target.value)} />
          <Button variant="ghost" size="icon" icon={ArrowUp} aria-label="Move up" disabled={i === 0} onClick={() => move(i, -1)} />
          <Button variant="ghost" size="icon" icon={ArrowDown} aria-label="Move down" disabled={i === list.length - 1} onClick={() => move(i, 1)} />
          <Button variant="ghost" size="icon" icon={Trash2} aria-label="Remove" onClick={() => onChange(list.filter((_, idx) => idx !== i))} />
        </div>
      ))}
      <div>
        <Button variant="secondary" size="sm" icon={Plus} onClick={() => onChange([...list, ''])}>
          {addLabel}
        </Button>
      </div>
    </div>
  )
}
