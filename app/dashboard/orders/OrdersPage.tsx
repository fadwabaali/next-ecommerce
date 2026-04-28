'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Search, Eye, Trash2, MessageCircle, ChevronUp, ChevronDown } from 'lucide-react'
import Link from 'next/link'
import { STATUSES, openWhatsApp } from '@/lib/constants'
import StatusBadge from '../../components/ui/StatusBadge'
import Button from '../../components/ui/Button'
import PageHeader from '../../components/layout/PageHeader'

type Order = {
  id: string
  status: string
  total: number | null
  store: string | null
  items: string | null
  created_at: string
  clients: { id: string; name: string; phone: string; city: string } | null
}

const STATUS_COLORS: Record<string, string> = {
  NEW:       'bg-blue-100 text-blue-700',
  CONTACTED: 'bg-yellow-100 text-yellow-700',
  PACKED:    'bg-purple-100 text-purple-700',
  SENT:      'bg-indigo-100 text-indigo-700',
  DELIVERED: 'bg-green-100 text-green-700',
  CANCELED:  'bg-red-100 text-red-700',
  CHANGED:   'bg-orange-100 text-orange-700',
}

export default function OrdersPage() {
  const supabase = createClient()
  const searchParams = useSearchParams()
  const clientFilter = searchParams.get('client')

  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [sortDir, setSortDir] = useState<'desc' | 'asc'>('desc')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [editingTotal, setEditingTotal] = useState<string | null>(null)
  const [totalValue, setTotalValue] = useState('')
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  useEffect(() => { fetchOrders() }, [sortDir])

  async function fetchOrders() {
    setLoading(true)
    const { data } = await supabase
      .from('orders')
      .select('id, status, total, store, items, created_at, clients(id, name, phone, city)')
      .order('created_at', { ascending: sortDir === 'asc' })
    let result = (data as Order[]) || []
    if (clientFilter) result = result.filter(o => o.clients?.id === clientFilter)
    setOrders(result)
    setLoading(false)
  }

  async function updateStatus(orderId: string, newStatus: string) {
    setUpdatingId(orderId)
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', orderId)
    if (!error) setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o))
    setUpdatingId(null)
  }

  async function saveTotal(orderId: string) {
    const parsed = parseFloat(totalValue)
    if (isNaN(parsed)) { setEditingTotal(null); return }
    const { error } = await supabase
      .from('orders')
      .update({ total: parsed, updated_at: new Date().toISOString() })
      .eq('id', orderId)
    if (!error) setOrders(prev => prev.map(o => o.id === orderId ? { ...o, total: parsed } : o))
    setEditingTotal(null)
    setTotalValue('')
  }

  async function deleteOrder(orderId: string) {
    setDeletingId(orderId)
    const { error } = await supabase.from('orders').delete().eq('id', orderId)
    if (!error) setOrders(prev => prev.filter(o => o.id !== orderId))
    setDeletingId(null)
    setConfirmDelete(null)
  }

  const filtered = orders.filter(order => {
    const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter
    const s = search.toLowerCase().trim()
    const matchesSearch = !s ||
      order.clients?.name.toLowerCase().includes(s) ||
      order.clients?.phone.includes(s) ||
      order.id.toLowerCase().includes(s) ||
      order.store?.toLowerCase().includes(s)
    return matchesStatus && matchesSearch
  })

  return (
    <div className="space-y-5">
      <PageHeader
        title="Orders"
        subtitle={`${orders.length} total orders`}
        action={
          <Button variant="ghost" onClick={() => setSortDir(d => d === 'desc' ? 'asc' : 'desc')}>
            {sortDir === 'desc' ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
            {sortDir === 'desc' ? 'Newest first' : 'Oldest first'}
          </Button>
        }
      />

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, phone, ID or store..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 bg-white"
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 bg-white text-gray-600"
        >
          <option value="ALL">All statuses</option>
          {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                {['Client', 'Phone', 'Items', 'Total', 'Status', 'Store', 'Date', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={8} className="px-4 py-10 text-center text-gray-400 text-xs">Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-10 text-center text-gray-400 text-xs">No orders found</td></tr>
              ) : filtered.map(order => (
                <tr key={order.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3.5 font-medium text-gray-700">{order.clients?.name ?? '—'}</td>
                  <td className="px-4 py-3.5">
                    {order.clients?.phone ? (
                      <button onClick={() => openWhatsApp(order.clients!.phone)}
                        className="flex items-center gap-1.5 text-green-600 hover:text-green-700 transition">
                        <MessageCircle size={13} />
                        <span className="text-xs">{order.clients.phone}</span>
                      </button>
                    ) : '—'}
                  </td>
                  <td className="px-4 py-3.5 text-gray-500 max-w-[140px]">
                    <span className="truncate block text-xs">{order.items ?? '—'}</span>
                  </td>
                  <td className="px-4 py-3.5">
                    {editingTotal === order.id ? (
                      <div className="flex items-center gap-1">
                        <input autoFocus type="number" value={totalValue}
                          onChange={e => setTotalValue(e.target.value)}
                          onBlur={() => saveTotal(order.id)}
                          onKeyDown={e => e.key === 'Enter' && saveTotal(order.id)}
                          className="w-20 border border-pink-300 rounded px-2 py-0.5 text-xs focus:outline-none"
                          placeholder="0"
                        />
                        <span className="text-xs text-gray-400">MAD</span>
                      </div>
                    ) : (
                      <button onClick={() => { setEditingTotal(order.id); setTotalValue(order.total?.toString() ?? '') }}
                        className="text-xs text-gray-600 hover:text-pink-500 transition font-medium">
                        {order.total ? `${order.total} MAD` : <span className="text-gray-300 italic">Add total</span>}
                      </button>
                    )}
                  </td>
                  <td className="px-4 py-3.5">
                    <select
                      value={order.status}
                      disabled={updatingId === order.id}
                      onChange={e => updateStatus(order.id, e.target.value)}
                      className={`text-xs font-medium px-2 py-1 rounded-lg border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-pink-400 ${STATUS_COLORS[order.status]}`}
                    >
                      {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3.5 text-gray-400 text-xs">{order.store ?? '—'}</td>
                  <td className="px-4 py-3.5 text-gray-400 text-xs">
                    {new Date(order.created_at).toLocaleDateString('en', { day: 'numeric', month: 'short' })}
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <Link href={`/dashboard/orders/${order.id}`}>
                        <Button variant="secondary" className="p-1.5">
                          <Eye size={14} />
                        </Button>
                      </Link>
                      {confirmDelete === order.id ? (
                        <div className="flex items-center gap-1">
                          <Button variant="primary" disabled={deletingId === order.id} className="text-xs px-2 py-1"
                            onClick={() => deleteOrder(order.id)}>
                            {deletingId === order.id ? '...' : 'Yes'}
                          </Button>
                          <Button variant="secondary" className="text-xs px-2 py-1"
                            onClick={() => setConfirmDelete(null)}>
                            No
                          </Button>
                        </div>
                      ) : (
                        <Button variant="danger" className="p-1.5" onClick={() => setConfirmDelete(order.id)}>
                          <Trash2 size={14} />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}