import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, ImageIcon, ListOrdered } from 'lucide-react'
import { Badge, EmptyState, ErrorBox, PageHeader, Spinner } from '../components/ui'
import { useApiGet } from '../hooks/useApi'
import { assetUrl } from '../lib/api'
import { PAGES } from '../lib/sectionConfig'

export default function Sections() {
  const [page, setPage] = useState('home')
  const { data, loading, error, reload } = useApiGet('/api/admin/sections')
  const all = data?.data || []
  const list = all.filter((s) => s.page === page)

  return (
    <div>
      <PageHeader
        title="Page sections"
        description="Every heading, paragraph, photo and button on the website. Choose a page, then a section to edit it."
      />

      <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
        {PAGES.map((p) => {
          const count = all.filter((s) => s.page === p.id).length
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => setPage(p.id)}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${
                page === p.id ? 'bg-brand text-white' : 'border border-slate-200 bg-white text-slate-600 hover:border-brand/40'
              }`}
            >
              {p.label} {count > 0 && <span className="opacity-70">({count})</span>}
            </button>
          )
        })}
      </div>

      {error && <ErrorBox message={error.message} onRetry={reload} />}
      {loading && !data ? (
        <Spinner />
      ) : list.length === 0 ? (
        <EmptyState title="No sections on this page" />
      ) : (
        <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {list.map((s) => (
            <li key={s.id}>
              <Link
                to={`/sections/${s.id}`}
                className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs transition hover:border-brand/40 hover:shadow-md"
              >
                <span className="grid h-16 w-20 shrink-0 place-items-center overflow-hidden rounded-xl bg-slate-100">
                  {s.imageUrl ? (
                    <img src={assetUrl(s.imageUrl)} alt="" className="size-full object-cover" />
                  ) : (
                    <ImageIcon className="size-6 text-slate-300" />
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold">{s.adminLabel}</span>
                  <span className="block truncate text-sm text-slate-500">{s.title || s.eyebrow || s.body || 'List only'}</span>
                  <span className="mt-1.5 flex flex-wrap gap-1.5">
                    {s.itemCount > 0 && (
                      <Badge color="blue">
                        <ListOrdered className="mr-1 size-3" /> {s.itemCount} items
                      </Badge>
                    )}
                    {!s.isActive && <Badge color="red">Hidden</Badge>}
                  </span>
                </span>
                <ChevronRight className="size-5 shrink-0 text-slate-400" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
