/**
 * Describes how each website section uses its fields, so the editor shows
 * only relevant inputs with clear labels.
 *
 * fields: section-level inputs → label (missing = hidden)
 * items:  { label, fields: { iconKey, title, text, value, badge, isFeatured } } or null
 */
export const PAGES = [
  { id: 'home', label: 'Home' },
  { id: 'about', label: 'About Us' },
  { id: 'services', label: 'Services' },
  { id: 'how-it-works', label: 'How It Works' },
  { id: 'contact', label: 'Contact' },
  { id: 'book-care', label: 'Book Home Care' },
  { id: 'faq', label: 'FAQ' },
]

const heading = { eyebrow: 'Small heading (above title)', title: 'Title', body: 'Description' }
const pageBanner = { eyebrow: 'Small heading / breadcrumb', title: 'Page title', body: 'Intro text' }
const cta1 = { primaryCta: 'Button' }
const cta2 = { primaryCta: 'Main button', secondaryCta: 'Second button' }

export const SECTION_CONFIG = {
  'home.hero': {
    fields: {
      eyebrow: 'Badge text (top)',
      title: 'Headline — first part (dark)',
      highlight: 'Headline — second part (coloured)',
      body: 'Supporting text',
      image: 'Hero photo',
      ...cta2,
    },
    items: { label: 'Trust points under the buttons', fields: { iconKey: 'Icon', title: 'Text' } },
  },
  'home.hero_cards': {
    fields: {},
    items: { label: 'Floating cards on the hero photo (first two are shown)', fields: { iconKey: 'Icon', title: 'Title', text: 'Small text' } },
  },
  'home.trust_stats': {
    fields: {},
    items: {
      label: 'Statistic cards',
      fields: { iconKey: 'Icon', value: 'Number (optional, e.g. 500+)', title: 'Title', text: 'Description' },
    },
  },
  'home.about': {
    fields: { eyebrow: 'Small heading', title: 'Title', body: 'Paragraph(s)', highlight: 'Quote on the photo', image: 'Photo', ...cta1 },
    items: { label: 'Mission / Vision / Commitment cards', fields: { iconKey: 'Icon', title: 'Title', text: 'Text' } },
  },
  'home.services': { fields: heading, items: null, note: 'The service cards themselves are edited in Services.' },
  'home.why': {
    fields: heading,
    items: {
      label: 'Why Choose Us cards',
      fields: { iconKey: 'Icon', title: 'Title', text: 'Text', badge: 'Badge (featured card)', isFeatured: 'Featured — full-width highlighted card' },
    },
  },
  'home.process': {
    fields: { ...heading, ...cta1 },
    items: { label: 'Steps (numbered in this order)', fields: { iconKey: 'Icon', title: 'Title', text: 'Text' } },
  },
  'home.care_options': {
    fields: { eyebrow: 'Small heading', title: 'Title', body: 'Paragraph', image: 'Photo', highlight: 'Text next to the button', ...cta1 },
    items: { label: 'Checklist', fields: { title: 'Point' } },
    note: 'The duration cards are edited in Care Durations.',
  },
  'home.team': {
    fields: { ...heading, highlight: 'Note under the cards (shown when a card is marked representative)' },
    items: null,
    note: 'Team cards are edited in Team.',
  },
  'home.testimonials': {
    fields: { ...heading, highlight: 'Notice (shown while sample reviews exist)' },
    items: null,
    note: 'Reviews are edited in Testimonials.',
  },
  'home.faq': { fields: { ...heading, primaryCta: '“View all” link' }, items: null, note: 'Questions are edited in FAQs.' },
  'home.faq_help': { fields: { title: 'Card title', body: 'Card text', ...cta1 }, items: null },
  'home.cta': { fields: { title: 'Headline', body: 'Text', ...cta2 }, items: null, note: 'Shown near the bottom of most pages.' },
  'home.contact': { fields: heading, items: null, note: 'Phone, email, address and map are edited in Site Settings.' },
  'contact.form': { fields: { title: 'Form title', body: 'Form intro' }, items: null },
  'about.hero': { fields: pageBanner, items: null },
  'about.story': {
    fields: { eyebrow: 'Small heading', title: 'Title', body: 'Story (blank line = new paragraph)', image: 'Photo' },
    items: { label: 'Checklist', fields: { title: 'Point' } },
  },
  'about.values': {
    fields: { eyebrow: 'Small heading', title: 'Title' },
    items: { label: 'Value cards', fields: { title: 'Title', text: 'Text' } },
  },
  'services.hero': { fields: pageBanner, items: null },
  'how.hero': { fields: pageBanner, items: null },
  'how.prepare': {
    fields: { ...heading, ...cta1 },
    items: { label: 'Cards', fields: { iconKey: 'Icon', title: 'Title', text: 'Text' } },
  },
  'contact.hero': { fields: pageBanner, items: null },
  'book.hero': { fields: pageBanner, items: { label: 'Assurance points', fields: { iconKey: 'Icon', title: 'Text' } } },
  'book.summary': { fields: { title: 'Summary box title', body: 'Note under the summary' }, items: null },
  'faq.hero': { fields: pageBanner, items: null },
  'faq.cta': { fields: { title: 'Headline', body: 'Text', ...cta2 }, items: null },
}

/** Fallback for any section without a config: show everything. */
export const DEFAULT_CONFIG = {
  fields: { eyebrow: 'Small heading', title: 'Title', highlight: 'Highlight text', body: 'Text', image: 'Image', ...cta2 },
  items: { label: 'Items', fields: { iconKey: 'Icon', title: 'Title', text: 'Text', value: 'Value', badge: 'Badge', isFeatured: 'Featured' } },
}
