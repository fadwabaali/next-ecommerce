export const STATUSES = ['NEW', 'CONTACTED', 'PACKED', 'SENT', 'DELIVERED', 'CANCELED', 'CHANGED']

export const STATUS_COLORS: Record<string, string> = {
  NEW:       'bg-blue-100 text-blue-700',
  CONTACTED: 'bg-yellow-100 text-yellow-700',
  PACKED:    'bg-purple-100 text-purple-700',
  SENT:      'bg-indigo-100 text-indigo-700',
  DELIVERED: 'bg-green-100 text-green-700',
  CANCELED:  'bg-red-100 text-red-700',
  CHANGED:   'bg-orange-100 text-orange-700',
}

export function formatWhatsApp(phone: string) {
  return phone.startsWith('0') ? '+212' + phone.slice(1) : phone
}

export function openWhatsApp(phone: string) {
  window.open(`https://wa.me/${formatWhatsApp(phone)}`, '_blank')
}