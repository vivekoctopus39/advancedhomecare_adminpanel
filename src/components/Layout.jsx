import { useState } from 'react'
import { Navigate, NavLink, Outlet, useLocation } from 'react-router-dom'
import {
  BookOpen,
  CalendarClock,
  ExternalLink,
  FileText,
  FolderTree,
  HeartHandshake,
  Images,
  Inbox,
  LayoutDashboard,
  LayoutTemplate,
  ListChecks,
  LogOut,
  Menu,
  MessageSquareQuote,
  Navigation,
  Settings,
  ShieldCheck,
  Stethoscope,
  Tags,
  UserCog,
  Users,
  X,
} from 'lucide-react'
import { useAuth } from '../context/contexts'
import { WEBSITE_URL } from '../lib/api'
import { Spinner } from './ui'

const NAV = [
  { items: [{ to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true }] },
  {
    title: 'Enquiries',
    items: [
      { to: '/enquiries', label: 'Enquiries', icon: Inbox },
      { to: '/customers', label: 'Customers', icon: Users },
      { to: '/enquiry-statuses', label: 'Enquiry Statuses', icon: ListChecks },
    ],
  },
  {
    title: 'Website Content',
    items: [
      { to: '/sections', label: 'Page Sections', icon: LayoutTemplate },
      { to: '/services', label: 'Services', icon: Stethoscope },
      { to: '/service-categories', label: 'Service Categories', icon: FolderTree },
      { to: '/care-durations', label: 'Care Durations', icon: CalendarClock },
      { to: '/faqs', label: 'FAQs', icon: BookOpen },
      { to: '/faq-categories', label: 'FAQ Categories', icon: Tags },
      { to: '/testimonials', label: 'Testimonials', icon: MessageSquareQuote },
      { to: '/team', label: 'Team', icon: HeartHandshake },
      { to: '/navigation', label: 'Navbar & Footer', icon: Navigation },
      { to: '/legal', label: 'Legal Pages', icon: FileText },
      { to: '/media', label: 'Media Library', icon: Images },
    ],
  },
  {
    title: 'Settings',
    items: [
      { to: '/settings', label: 'Site Settings', icon: Settings },
      { to: '/admins', label: 'Admin Users', icon: ShieldCheck, superAdmin: true },
      { to: '/account', label: 'My Account', icon: UserCog },
    ],
  },
]

function Sidebar({ onNavigate }) {
  const { admin } = useAuth()
  return (
    <nav className="flex h-full flex-col gap-5 overflow-y-auto px-3 py-5" aria-label="Admin navigation">
      {NAV.map((group, gi) => (
        <div key={gi}>
          {group.title && <p className="mb-1.5 px-3 text-[11px] font-bold tracking-wider text-slate-400 uppercase">{group.title}</p>}
          <ul className="flex flex-col gap-0.5">
            {group.items
              .filter((item) => !item.superAdmin || admin?.role === 'super_admin')
              .map(({ to, label, icon: Icon, end }) => (
                <li key={to}>
                  <NavLink
                    to={to}
                    end={end}
                    onClick={onNavigate}
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                        isActive ? 'bg-brand text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100 hover:text-ink'
                      }`
                    }
                  >
                    <Icon className="size-4 shrink-0" />
                    {label}
                  </NavLink>
                </li>
              ))}
          </ul>
        </div>
      ))}
    </nav>
  )
}

function Brand() {
  return (
    <div className="flex items-center gap-2.5">
      <span className="grid size-9 place-items-center rounded-xl bg-brand font-extrabold text-white">A</span>
      <span className="leading-tight">
        <span className="block text-sm font-extrabold text-brand">ADVANCED HOME CARE</span>
        <span className="block text-[11px] text-slate-500">Admin Panel</span>
      </span>
    </div>
  )
}

export default function Layout() {
  const { admin, status, logout } = useAuth()
  const location = useLocation()
  const [open, setOpen] = useState(false)

  if (status === 'checking') return <Spinner label="Checking session…" />
  if (status !== 'authenticated') return <Navigate to="/login" replace state={{ from: location.pathname }} />

  return (
    <div className="min-h-screen lg:pl-64">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-slate-200 bg-white lg:flex">
        <div className="border-b border-slate-100 px-5 py-4">
          <Brand />
        </div>
        <Sidebar />
      </aside>

      {/* Mobile sidebar */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/40" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 flex w-72 flex-col bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <Brand />
              <button type="button" onClick={() => setOpen(false)} aria-label="Close menu" className="rounded-lg p-1.5 hover:bg-slate-100">
                <X className="size-5" />
              </button>
            </div>
            <Sidebar onNavigate={() => setOpen(false)} />
          </aside>
        </div>
      )}

      <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-slate-200 bg-white/90 px-4 backdrop-blur sm:px-6">
        <button type="button" onClick={() => setOpen(true)} className="rounded-lg p-2 hover:bg-slate-100 lg:hidden" aria-label="Open menu">
          <Menu className="size-5" />
        </button>
        <div className="lg:hidden">
          <Brand />
        </div>
        <div className="ml-auto flex items-center gap-2">
          <a
            href={WEBSITE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 sm:inline-flex"
          >
            <ExternalLink className="size-4" /> View website
          </a>
          <div className="hidden text-right sm:block">
            <p className="text-sm font-semibold">{admin?.fullName}</p>
            <p className="text-xs text-slate-500">{admin?.role === 'super_admin' ? 'Super admin' : 'Editor'}</p>
          </div>
          <button
            type="button"
            onClick={logout}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600"
          >
            <LogOut className="size-4" /> <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:py-8">
        <Outlet />
      </main>
    </div>
  )
}
