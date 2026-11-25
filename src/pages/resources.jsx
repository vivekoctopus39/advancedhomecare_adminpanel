import ResourcePage from '../components/ResourcePage'
import { LucideIcon } from '../components/inputs'
import { Badge } from '../components/ui'
import { useIcons } from '../hooks/useApi'
import { assetUrl } from '../lib/api'

/* Field configs live at module level so they keep a stable identity. */

function IconCell({ iconKey }) {
  const icons = useIcons()
  const icon = icons.find((i) => i.key === iconKey)
  return (
    <span className="grid size-8 place-items-center rounded-lg bg-brand-50 text-brand">
      {icon ? <LucideIcon name={icon.lucide} /> : '—'}
    </span>
  )
}

const Thumb = ({ url }) =>
  url ? <img src={assetUrl(url)} alt="" className="h-12 w-16 rounded-lg object-cover" /> : <span className="text-slate-400">No image</span>

/* ---------------- Services ---------------- */
const serviceFields = [
  { key: 'title', label: 'Title', required: true },
  { key: 'shortTitle', label: 'Short title', hint: 'Optional shorter name used on buttons, e.g. “Meal Assistance”.' },
  { key: 'slug', label: 'URL slug', hint: 'Page address: /services/<slug>. Leave empty to create from the title.' },
  { key: 'categoryId', label: 'Category', type: 'select', optionsFrom: { path: '/api/admin/service-categories', label: 'label' } },
  { key: 'iconKey', label: 'Icon', type: 'icon' },
  { key: 'imageMediaId', label: 'Photo', type: 'image', previewKey: 'imageUrl' },
  { key: 'summary', label: 'Short summary (on cards)', type: 'textarea', rows: 2, required: true },
  { key: 'description', label: 'Full description (service page)', type: 'textarea', rows: 5 },
  { key: 'features', label: 'What’s included', type: 'list', addLabel: 'Add point' },
  { key: 'suitableFor', label: 'Who it’s for', type: 'list', addLabel: 'Add point' },
  { key: 'isActive', label: 'Show on website', type: 'toggle', default: true },
]
const serviceColumns = [
  { key: 'image', label: 'Photo', render: (r) => <Thumb url={r.imageUrl} /> },
  {
    key: 'title',
    label: 'Service',
    render: (r) => (
      <div>
        <p className="font-semibold">{r.title}</p>
        <p className="text-xs text-slate-500">/services/{r.slug}</p>
      </div>
    ),
  },
  { key: 'icon', label: 'Icon', render: (r) => <IconCell iconKey={r.iconKey} /> },
  { key: 'category', label: 'Category', render: (r) => r.categoryLabel || '—' },
  { key: 'features', label: 'Points', render: (r) => `${r.features.length} / ${r.suitableFor.length}` },
]
export const ServicesPage = () => (
  <ResourcePage
    title="Services"
    description="Service cards, service detail pages and the service list in the enquiry forms. Order here = order on the website."
    endpoint="/api/admin/services"
    itemName="service"
    fields={serviceFields}
    columns={serviceColumns}
  />
)

/* ---------------- Service categories ---------------- */
const categoryFields = [
  { key: 'label', label: 'Label', required: true },
  { key: 'slug', label: 'Slug', required: true, hint: 'Lowercase id used in links, e.g. “caregivers”.' },
  { key: 'isActive', label: 'Show as filter', type: 'toggle', default: true },
]
export const ServiceCategoriesPage = () => (
  <ResourcePage
    title="Service categories"
    description="Filter buttons on the Services page."
    endpoint="/api/admin/service-categories"
    itemName="category"
    fields={categoryFields}
    columns={[
      { key: 'label', label: 'Label', className: 'font-semibold' },
      { key: 'slug', label: 'Slug' },
    ]}
  />
)

/* ---------------- Care durations ---------------- */
const durationFields = [
  { key: 'label', label: 'Label', required: true },
  { key: 'code', label: 'Code', required: true, hint: 'Short id saved with enquiries, e.g. “24-hour”.' },
  { key: 'iconKey', label: 'Icon', type: 'icon' },
  { key: 'description', label: 'Description', type: 'textarea', rows: 2 },
  { key: 'isActive', label: 'Show on website', type: 'toggle', default: true },
]
export const CareDurationsPage = () => (
  <ResourcePage
    title="Care durations"
    description="Shown in “Personalized Home Care”, on service pages and in the booking form."
    endpoint="/api/admin/care-durations"
    itemName="duration"
    fields={durationFields}
    columns={[
      { key: 'icon', label: 'Icon', render: (r) => <IconCell iconKey={r.iconKey} /> },
      { key: 'label', label: 'Label', className: 'font-semibold' },
      { key: 'description', label: 'Description', className: 'max-w-md text-slate-600' },
    ]}
  />
)

/* ---------------- FAQs ---------------- */
const faqFields = [
  { key: 'question', label: 'Question', required: true, wide: true },
  { key: 'answer', label: 'Answer', type: 'textarea', rows: 5, required: true },
  { key: 'categoryId', label: 'Category', type: 'select', optionsFrom: { path: '/api/admin/faq-categories', label: 'label' } },
  { key: 'isActive', label: 'Show on website', type: 'toggle', default: true },
]
export const FaqsPage = () => (
  <ResourcePage
    title="FAQs"
    description="Questions on the homepage (first 6), How It Works page (first 5) and the FAQ page."
    endpoint="/api/admin/faqs"
    itemName="FAQ"
    fields={faqFields}
    columns={[
      { key: 'question', label: 'Question', className: 'max-w-lg font-semibold' },
      { key: 'category', label: 'Category', render: (r, { optionLabel }) => optionLabel('categoryId', r.categoryId) || '—' },
    ]}
  />
)

const faqCategoryFields = [
  { key: 'label', label: 'Label', required: true },
  { key: 'slug', label: 'Slug', required: true },
]
export const FaqCategoriesPage = () => (
  <ResourcePage
    title="FAQ categories"
    description="Filter buttons on the FAQ page."
    endpoint="/api/admin/faq-categories"
    itemName="category"
    fields={faqCategoryFields}
    columns={[
      { key: 'label', label: 'Label', className: 'font-semibold' },
      { key: 'slug', label: 'Slug' },
    ]}
  />
)

/* ---------------- Testimonials ---------------- */
const ratingOptions = [5, 4, 3, 2, 1].map((n) => ({ value: String(n), label: '★'.repeat(n) }))
const testimonialFields = [
  { key: 'customerName', label: 'Customer name', required: true },
  { key: 'relation', label: 'Relation', placeholder: 'e.g. Daughter of patient' },
  { key: 'rating', label: 'Rating', type: 'select', options: ratingOptions, placeholder: 'Choose rating' },
  { key: 'serviceId', label: 'Service', type: 'select', optionsFrom: { path: '/api/admin/services', label: 'title' } },
  { key: 'feedback', label: 'Feedback', type: 'textarea', rows: 4, required: true },
  { key: 'isSample', label: 'Sample (shows a “Sample testimonial” label)', type: 'toggle' },
  { key: 'isActive', label: 'Show on website', type: 'toggle', default: true },
]
export const TestimonialsPage = () => (
  <ResourcePage
    title="Testimonials"
    description="Customer reviews in the testimonial slider. Turn off “Sample” once you add genuine, consented reviews."
    endpoint="/api/admin/testimonials"
    itemName="testimonial"
    fields={testimonialFields}
    defaults={{ rating: '5' }}
    columns={[
      { key: 'customerName', label: 'Customer', className: 'font-semibold' },
      { key: 'rating', label: 'Rating', render: (r) => <span className="text-amber-500">{'★'.repeat(r.rating)}</span> },
      { key: 'service', label: 'Service', render: (r, { optionLabel }) => optionLabel('serviceId', r.serviceId) || '—' },
      { key: 'isSample', label: 'Type', render: (r) => (r.isSample ? <Badge color="amber">Sample</Badge> : <Badge color="green">Real</Badge>) },
    ]}
  />
)

/* ---------------- Team ---------------- */
const teamFields = [
  { key: 'roleTitle', label: 'Role / title', required: true },
  { key: 'imageMediaId', label: 'Photo', type: 'image', previewKey: 'imageUrl' },
  { key: 'description', label: 'Description', type: 'textarea', rows: 3 },
  { key: 'skills', label: 'Skill tags', type: 'list', addLabel: 'Add skill' },
  { key: 'isSample', label: 'Representative photo (shows the note under the team section)', type: 'toggle' },
  { key: 'isActive', label: 'Show on website', type: 'toggle', default: true },
]
export const TeamPage = () => (
  <ResourcePage
    title="Team"
    description="Cards in “The People Behind the Care” (homepage and About page)."
    endpoint="/api/admin/team-members"
    itemName="team member"
    fields={teamFields}
    columns={[
      { key: 'image', label: 'Photo', render: (r) => <Thumb url={r.imageUrl} /> },
      { key: 'roleTitle', label: 'Role', className: 'font-semibold' },
      { key: 'skills', label: 'Skills', render: (r) => r.skills.join(', ') || '—' },
    ]}
  />
)

/* ---------------- Enquiry statuses ---------------- */
const statusFields = [
  { key: 'label', label: 'Label', required: true },
  { key: 'code', label: 'Code', required: true, hint: 'Keep “new” — website enquiries start with it.' },
]
export const EnquiryStatusesPage = () => (
  <ResourcePage
    title="Enquiry statuses"
    description="Stages you move enquiries through. New website enquiries always start as “new”."
    endpoint="/api/admin/enquiry-statuses"
    itemName="status"
    fields={statusFields}
    columns={[
      { key: 'label', label: 'Label', className: 'font-semibold' },
      { key: 'code', label: 'Code' },
    ]}
  />
)

/* ---------------- Admin users ---------------- */
const adminFields = [
  { key: 'fullName', label: 'Full name', required: true },
  { key: 'email', label: 'Email', type: 'email', required: true, readOnlyOnEdit: true },
  {
    key: 'password',
    label: 'Password',
    type: 'password',
    required: 'create',
    omitIfEmpty: true,
    hint: 'At least 8 characters with a letter and a number. Leave empty to keep the current password.',
  },
  {
    key: 'role',
    label: 'Role',
    type: 'select',
    options: [
      { value: 'editor', label: 'Editor — manages content & enquiries' },
      { value: 'super_admin', label: 'Super admin — also manages admin users' },
    ],
    placeholder: 'Choose role',
  },
  { key: 'isActive', label: 'Account active', type: 'toggle', default: true },
]
export const AdminsPage = () => (
  <ResourcePage
    title="Admin users"
    description="People who can log in to this panel."
    endpoint="/api/admin/admins"
    itemName="admin"
    sortable={false}
    fields={adminFields}
    defaults={{ role: 'editor' }}
    columns={[
      { key: 'fullName', label: 'Name', className: 'font-semibold' },
      { key: 'email', label: 'Email' },
      { key: 'role', label: 'Role', render: (r) => <Badge color={r.role === 'super_admin' ? 'violet' : 'blue'}>{r.role === 'super_admin' ? 'Super admin' : 'Editor'}</Badge> },
      { key: 'lastLoginAt', label: 'Last login', render: (r) => (r.lastLoginAt ? new Date(r.lastLoginAt).toLocaleString('en-IN') : 'Never') },
    ]}
  />
)
