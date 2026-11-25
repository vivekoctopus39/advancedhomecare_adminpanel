import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, Search } from 'lucide-react'
import { Badge, Button, Card, EmptyState, ErrorBox, Modal, PageHeader, Spinner } from '../components/ui'
import { useApiGet } from '../hooks/useApi'
import { formatDate, sourceLabel } from '../lib/format'

function CustomerModal({ id, onClose }) {
  const { data, loading } = useApiGet(`/api/admin/customers/${id}`)
  const c = data?.data
  return (
    <Modal open title={c?.fullName || 'Customer'} onClose={onClose}>
      {loading || !c ? (
        <Spinner />
      ) : (
        <div className="flex flex-col gap-4">
          <div className="grid gap-2 rounded-xl bg-slate-50 p-4 text-sm sm:grid-cols-3">
            <p>
              <span className="block text-xs text-slate-500">Mobile</span>
              {c.mobile}
            </p>
            <p>
              <span className="block text-xs text-slate-500">Email</span>
              {c.email || '—'}
            </p>
            <p>
              <span className="block text-xs text-slate-500">First enquiry</span>
              {formatDate(c.createdAt)}
            </p>
          </div>
          <h3 className="font-bold">Enquiries ({c.enquiries.length})</h3>
          <ul className="divide-y divide-slate-100">
            {c.enquiries.map((e) => (
              <li key={e.id} className="flex flex-wrap items-center justify-between gap-2 py-2 text-sm">
                <span>
                  #{e.id} · {e.serviceTitle || '—'} · Patient: {e.patientName}
                  <span className="block text-xs text-slate-500">
                    {sourceLabel(e.source)} · {formatDate(e.createdAt, true)}
                  </span>
                </span>
                <Badge>{e.statusLabel}</Badge>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Modal>
  )
}

export default function Customers() {
  const [search, setSearch] = useState('')
  const [query, setQuery] = useState({ search: '', page: 1 })
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    const t = setTimeout(() => setQuery((q) => (q.search === search ? q : { search, page: 1 })), 350)
    return () => clearTimeout(t)
  }, [search])

  const params = new URLSearchParams({ page: query.page, limit: 20, ...(query.search ? { search: query.search } : {}) })
  const { data, loading, error, reload } = useApiGet(`/api/admin/customers?${params}`)
  const rows = data?.data || []
  const pg = data?.pagination

  return (
    <div>
      <PageHeader title="Customers" description="People who have sent enquiries, grouped by mobile number." />
      <label className="relative mb-4 block max-w-md">
        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
        <input className="input pl-9" placeholder="Search name, mobile or email…" value={search} onChange={(e) => setSearch(e.target.value)} />
      </label>
      {error && <ErrorBox message={error.message} onRetry={reload} />}
      {loading && !data ? (
        <Spinner />
      ) : rows.length === 0 ? (
        <EmptyState title="No customers yet" />
      ) : (
        <Card className="overflow-hidden [&>div]:p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs tracking-wide text-slate-500 uppercase">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Mobile</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Enquiries</th>
                  <th className="px-4 py-3">Last enquiry</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((c) => (
                  <tr key={c.id} className="cursor-pointer hover:bg-brand-50/50" onClick={() => setSelected(c.id)}>
                    <td className="px-4 py-3 font-semibold">{c.fullName}</td>
                    <td className="px-4 py-3">{c.mobile}</td>
                    <td className="px-4 py-3">{c.email || '—'}</td>
                    <td className="px-4 py-3">{c.enquiryCount}</td>
                    <td className="px-4 py-3 text-slate-500">{formatDate(c.lastEnquiryAt, true)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {pg && pg.totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 text-sm">
              <span className="text-slate-500">
                Page {pg.page} of {pg.totalPages}
              </span>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" icon={ChevronLeft} disabled={pg.page <= 1} onClick={() => setQuery((q) => ({ ...q, page: q.page - 1 }))}>
                  Prev
                </Button>
                <Button variant="secondary" size="sm" disabled={pg.page >= pg.totalPages} onClick={() => setQuery((q) => ({ ...q, page: q.page + 1 }))}>
                  Next <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}
      {selected && <CustomerModal id={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}
