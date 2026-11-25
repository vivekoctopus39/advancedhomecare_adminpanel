import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, MessageCircle, Phone, Search, Trash2 } from 'lucide-react'
import { Badge, Button, Card, ConfirmDialog, EmptyState, ErrorBox, Field, Modal, PageHeader, Spinner } from '../components/ui'
import { useApiGet } from '../hooks/useApi'
import { api } from '../lib/api'
import { formatDate, sourceLabel, statusColor } from '../lib/format'
import { useToast } from '../context/contexts'

function Detail({ label, children }) {
  return (
    <div>
      <dt className="text-xs font-semibold tracking-wide text-slate-500 uppercase">{label}</dt>
      <dd className="mt-0.5 text-sm break-words whitespace-pre-line">{children || '—'}</dd>
    </div>
  )
}

function EnquiryModal({ enquiry, statuses, onClose, onSaved }) {
  const toast = useToast()
  const [statusId, setStatusId] = useState(String(enquiry.statusId))
  const [notes, setNotes] = useState(enquiry.adminNotes || '')
  const [saving, setSaving] = useState(false)
  const [confirm, setConfirm] = useState(false)

  const save = async () => {
    setSaving(true)
    try {
      await api.put(`/api/admin/enquiries/${enquiry.id}`, { statusId, adminNotes: notes })
      toast.success('Enquiry updated.')
      onSaved()
    } catch (e) {
      toast.error(e.message)
    } finally {
      setSaving(false)
    }
  }

  const remove = async () => {
    try {
      await api.del(`/api/admin/enquiries/${enquiry.id}`)
      toast.success('Enquiry deleted.')
      onSaved()
    } catch (e) {
      toast.error(e.message)
    }
  }

  const wa = `https://wa.me/91${enquiry.customerMobile}`
  return (
    <Modal
      open
      size="lg"
      title={`Enquiry #${enquiry.id}`}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" icon={Trash2} className="mr-auto text-red-600 hover:!bg-red-50" onClick={() => setConfirm(true)}>
            Delete
          </Button>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
          <Button loading={saving} onClick={save}>
            Save changes
          </Button>
        </>
      }
    >
      <div className="mb-5 flex flex-wrap items-center gap-2">
        <Badge color={statusColor(enquiry.statusCode)}>{enquiry.statusLabel}</Badge>
        <Badge>{sourceLabel(enquiry.source)}</Badge>
        <span className="text-xs text-slate-500">Received {formatDate(enquiry.createdAt, true)}</span>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <dl className="flex flex-col gap-3 rounded-xl bg-slate-50 p-4">
          <p className="text-sm font-bold">Contact person</p>
          <Detail label="Name">{enquiry.customerName}</Detail>
          <Detail label="Mobile">{enquiry.customerMobile}</Detail>
          <Detail label="Email">{enquiry.customerEmail}</Detail>
          <div className="flex flex-wrap gap-2 pt-1">
            <a href={`tel:+91${enquiry.customerMobile}`} className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-3 py-1.5 text-xs font-semibold text-white">
              <Phone className="size-3.5" /> Call
            </a>
            <a href={wa} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white">
              <MessageCircle className="size-3.5" /> WhatsApp
            </a>
          </div>
        </dl>
        <dl className="flex flex-col gap-3 rounded-xl bg-slate-50 p-4">
          <p className="text-sm font-bold">Patient & care</p>
          <Detail label="Patient">
            {enquiry.patientName}
            {enquiry.patientAge !== null ? `, ${enquiry.patientAge} yrs` : ''}
          </Detail>
          <Detail label="Service">{enquiry.serviceTitle}</Detail>
          <Detail label="Duration">{enquiry.careDurationLabel}</Detail>
          <Detail label="Preferred start">{formatDate(enquiry.preferredStartDate)}</Detail>
        </dl>
        <dl className="flex flex-col gap-3 sm:col-span-2">
          <Detail label="Address">{[enquiry.address, enquiry.city].filter(Boolean).join(', ')}</Detail>
          <Detail label="Patient condition">{enquiry.patientCondition}</Detail>
          <Detail label="Additional requirements">{enquiry.requirements}</Detail>
        </dl>
        <Field label="Status">
          {(id) => (
            <select id={id} className="input" value={statusId} onChange={(e) => setStatusId(e.target.value)}>
              {statuses.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          )}
        </Field>
        <Field label="Internal notes" hint="Only visible to admins." className="sm:col-span-2">
          {(id) => <textarea id={id} className="input" rows={4} value={notes} onChange={(e) => setNotes(e.target.value)} />}
        </Field>
      </div>

      <ConfirmDialog
        open={confirm}
        title="Delete this enquiry?"
        message="The enquiry will be permanently removed."
        onConfirm={remove}
        onClose={() => setConfirm(false)}
      />
    </Modal>
  )
}

export default function Enquiries() {
  const [filters, setFilters] = useState({ status: '', source: '', search: '', page: 1 })
  const [searchInput, setSearchInput] = useState('')
  const [selected, setSelected] = useState(null)
  const statuses = useApiGet('/api/admin/enquiry-statuses').data?.data || []

  // Debounce search typing.
  useEffect(() => {
    const t = setTimeout(() => setFilters((f) => (f.search === searchInput ? f : { ...f, search: searchInput, page: 1 })), 350)
    return () => clearTimeout(t)
  }, [searchInput])

  const params = new URLSearchParams({ page: filters.page, limit: 20 })
  if (filters.status) params.set('status', filters.status)
  if (filters.source) params.set('source', filters.source)
  if (filters.search) params.set('search', filters.search)
  const { data, loading, error, reload } = useApiGet(`/api/admin/enquiries?${params}`)
  const rows = data?.data || []
  const pg = data?.pagination

  return (
    <div>
      <PageHeader title="Enquiries" description="Contact and booking enquiries submitted from the website." />

      <Card className="mb-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_200px_200px]">
          <label className="relative">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
            <input className="input pl-9" placeholder="Search name, mobile, email, patient, city…" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} />
          </label>
          <select className="input" value={filters.status} onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value, page: 1 }))}>
            <option value="">All statuses</option>
            {statuses.map((s) => (
              <option key={s.id} value={s.code}>
                {s.label}
              </option>
            ))}
          </select>
          <select className="input" value={filters.source} onChange={(e) => setFilters((f) => ({ ...f, source: e.target.value, page: 1 }))}>
            <option value="">All forms</option>
            <option value="contact-form">Contact form</option>
            <option value="booking-form">Booking form</option>
          </select>
        </div>
      </Card>

      {error && <ErrorBox message={error.message} onRetry={reload} />}
      {loading && !data ? (
        <Spinner />
      ) : rows.length === 0 ? (
        <EmptyState title="No enquiries found" text="Enquiries from the website forms will appear here." />
      ) : (
        <Card className="overflow-hidden [&>div]:p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs tracking-wide text-slate-500 uppercase">
                <tr>
                  <th className="px-4 py-3">Received</th>
                  <th className="px-4 py-3">Contact</th>
                  <th className="px-4 py-3">Patient</th>
                  <th className="px-4 py-3">Service</th>
                  <th className="px-4 py-3">City</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((e) => (
                  <tr key={e.id} className="cursor-pointer hover:bg-brand-50/50" onClick={() => setSelected(e)}>
                    <td className="px-4 py-3 whitespace-nowrap text-slate-500">{formatDate(e.createdAt, true)}</td>
                    <td className="px-4 py-3">
                      <p className="font-semibold">{e.customerName}</p>
                      <p className="text-xs text-slate-500">{e.customerMobile}</p>
                    </td>
                    <td className="px-4 py-3">
                      {e.patientName}
                      {e.patientAge !== null && <span className="text-slate-500">, {e.patientAge}</span>}
                    </td>
                    <td className="px-4 py-3">
                      {e.serviceTitle || '—'}
                      <p className="text-xs text-slate-500">{e.careDurationLabel}</p>
                    </td>
                    <td className="px-4 py-3">{e.city}</td>
                    <td className="px-4 py-3">
                      <Badge color={statusColor(e.statusCode)}>{e.statusLabel}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {pg && pg.totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 text-sm">
              <span className="text-slate-500">
                Page {pg.page} of {pg.totalPages} · {pg.total} enquiries
              </span>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" icon={ChevronLeft} disabled={pg.page <= 1} onClick={() => setFilters((f) => ({ ...f, page: f.page - 1 }))}>
                  Prev
                </Button>
                <Button variant="secondary" size="sm" disabled={pg.page >= pg.totalPages} onClick={() => setFilters((f) => ({ ...f, page: f.page + 1 }))}>
                  Next <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}

      {selected && (
        <EnquiryModal
          enquiry={selected}
          statuses={statuses}
          onClose={() => setSelected(null)}
          onSaved={() => {
            setSelected(null)
            reload()
          }}
        />
      )}
    </div>
  )
}
