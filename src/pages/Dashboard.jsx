import { Link } from 'react-router-dom'
import { ArrowRight, BookOpen, CalendarDays, Inbox, LayoutTemplate, MessageSquareQuote, Settings, Stethoscope, Users } from 'lucide-react'
import { Badge, Card, ErrorBox, PageHeader, Spinner } from '../components/ui'
import { useApiGet } from '../hooks/useApi'
import { useAuth } from '../context/contexts'
import { formatDate, sourceLabel, statusColor } from '../lib/format'

function Stat({ icon: Icon, label, value, to }) {
  return (
    <Link to={to} className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition hover:border-brand/40 hover:shadow-md">
      <span className="grid size-12 place-items-center rounded-xl bg-brand-50 text-brand">
        <Icon className="size-5" />
      </span>
      <span>
        <span className="block text-2xl font-extrabold">{value ?? '—'}</span>
        <span className="text-sm text-slate-500">{label}</span>
      </span>
    </Link>
  )
}

const quickLinks = [
  { to: '/sections', label: 'Edit page text & images', icon: LayoutTemplate },
  { to: '/services', label: 'Manage services', icon: Stethoscope },
  { to: '/faqs', label: 'Manage FAQs', icon: BookOpen },
  { to: '/settings', label: 'Contact details & logo', icon: Settings },
]

export default function Dashboard() {
  const { admin } = useAuth()
  const { data, loading, error, reload } = useApiGet('/api/admin/dashboard')
  const d = data?.data

  return (
    <div>
      <PageHeader title={`Welcome, ${admin?.fullName?.split(' ')[0] || 'Admin'}`} description="Overview of enquiries and website content." />
      {error && <ErrorBox message={error.message} onRetry={reload} />}
      {loading && !d ? (
        <Spinner />
      ) : d ? (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Stat icon={Inbox} label="Total enquiries" value={d.totals.totalEnquiries} to="/enquiries" />
            <Stat icon={CalendarDays} label="Enquiries today" value={d.totals.enquiriesToday} to="/enquiries" />
            <Stat icon={Users} label="Customers" value={d.totals.totalCustomers} to="/customers" />
            <Stat icon={Stethoscope} label="Active services" value={d.totals.activeServices} to="/services" />
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            <Card
              title="Recent enquiries"
              className="xl:col-span-2"
              actions={
                <Link to="/enquiries" className="inline-flex items-center gap-1 text-sm font-semibold text-brand">
                  View all <ArrowRight className="size-4" />
                </Link>
              }
            >
              {d.recentEnquiries.length === 0 ? (
                <p className="py-6 text-center text-sm text-slate-500">No enquiries yet. They will appear here when visitors submit the website forms.</p>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {d.recentEnquiries.map((e) => (
                    <li key={e.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                      <div>
                        <p className="font-semibold">
                          {e.customerName} <span className="font-normal text-slate-500">· {e.customerMobile}</span>
                        </p>
                        <p className="text-sm text-slate-500">
                          {e.serviceTitle || 'Service removed'} · Patient: {e.patientName} · {sourceLabel(e.source)}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge color={statusColor(e.statusCode)}>{e.statusLabel}</Badge>
                        <p className="mt-1 text-xs text-slate-500">{formatDate(e.createdAt, true)}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            <div className="flex flex-col gap-6">
              <Card title="Enquiries by status">
                <ul className="flex flex-col gap-2">
                  {d.enquiriesByStatus.map((s) => (
                    <li key={s.code} className="flex items-center justify-between">
                      <Badge color={statusColor(s.code)}>{s.label}</Badge>
                      <span className="font-bold">{s.count}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-4 text-xs text-slate-500">Last 7 days: {d.totals.enquiriesLast7Days} enquiries</p>
              </Card>
              <Card title="Quick links">
                <ul className="flex flex-col gap-1">
                  {quickLinks.map(({ to, label, icon: Icon }) => (
                    <li key={to}>
                      <Link to={to} className="flex items-center gap-3 rounded-lg px-2 py-2 text-sm font-medium hover:bg-slate-50">
                        <Icon className="size-4 text-brand" /> {label}
                      </Link>
                    </li>
                  ))}
                  <li>
                    <Link to="/testimonials" className="flex items-center gap-3 rounded-lg px-2 py-2 text-sm font-medium hover:bg-slate-50">
                      <MessageSquareQuote className="size-4 text-brand" /> Testimonials ({d.totals.activeTestimonials})
                    </Link>
                  </li>
                </ul>
              </Card>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
