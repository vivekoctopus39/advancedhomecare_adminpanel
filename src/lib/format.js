export const formatDate = (value, withTime = false) => {
  if (!value) return '—'
  const date = new Date(value.length === 10 ? `${value}T00:00:00` : value)
  return date.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    ...(withTime ? { hour: 'numeric', minute: '2-digit' } : {}),
  })
}

const STATUS_COLORS = { new: 'blue', contacted: 'violet', in_progress: 'amber', converted: 'green', closed: 'slate' }
export const statusColor = (code) => STATUS_COLORS[code] || 'slate'

export const sourceLabel = (source) => (source === 'booking-form' ? 'Booking form' : 'Contact form')
