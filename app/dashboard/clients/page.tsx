'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Search, MessageCircle, Eye, CheckCircle, ShoppingBag, Users, RotateCcw } from 'lucide-react'

type Client = {
  id: string
  name: string
  phone: string
  city: string
  created_at: string
  orders: { status: string }[]
}

const STATUS_COLORS: Record<string, string> = {
  NEW:       'bg-blue-100 text-blue-700',
  CONTACTED: 'bg-yellow-100 text-yellow-700',
}

export default function ClientsPage() {
  const supabase = createClient()
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'NEW' | 'CONTACTED'>('NEW')
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  useEffect(() => {
    fetchClients()
  }, [])

  async function fetchClients() {
    setLoading(true)
    const { data } = await supabase
      .from('clients')
      .select('id, name, phone, city, created_at, orders(status)')
      .order('created_at', { ascending: false })

    setClients((data as Client[]) || [])
    setLoading(false)
  }

  function getClientStatus(client: Client): string {
    if (!client.orders || client.orders.length === 0) return 'NEW'
    const statuses = client.orders.map(o => o.status)
    if (statuses.includes('CONTACTED')) return 'CONTACTED'
    return 'NEW'
  }

  async function markAsContacted(clientId: string) {
    setUpdatingId(clientId)
    const { error } = await supabase
      .from('orders')
      .update({ status: 'CONTACTED', updated_at: new Date().toISOString() })
      .eq('client_id', clientId)
      .eq('status', 'NEW')

    if (!error) {
      setClients(prev => prev.map(c => {
        if (c.id !== clientId) return c
        return {
          ...c,
          orders: c.orders.map(o =>
            o.status === 'NEW' ? { ...o, status: 'CONTACTED' } : o
          )
        }
      }))
    }
    setUpdatingId(null)
  }

  async function markAsNew(clientId: string) {
    setUpdatingId(clientId)
    const { error } = await supabase
      .from('orders')
      .update({ status: 'NEW', updated_at: new Date().toISOString() })
      .eq('client_id', clientId)
      .eq('status', 'CONTACTED')

    if (!error) {
      setClients(prev => prev.map(c => {
        if (c.id !== clientId) return c
        return {
          ...c,
          orders: c.orders.map(o =>
            o.status === 'CONTACTED' ? { ...o, status: 'NEW' } : o
          )
        }
      }))
    }
    setUpdatingId(null)
  }

  function openWhatsApp(phone: string) {
    const formatted = phone.startsWith('0') ? '+212' + phone.slice(1) : phone
    window.open(`https://wa.me/${formatted}`, '_blank')
  }

  const filtered = clients.filter(client => {
    const status = getClientStatus(client)
    const matchesStatus = statusFilter === 'ALL' || status === statusFilter
    const searchLower = search.toLowerCase().trim()
    const matchesSearch = searchLower === '' ||
      client.name.toLowerCase().includes(searchLower) ||
      client.phone.includes(searchLower) ||
      client.city.toLowerCase().includes(searchLower)
    return matchesStatus && matchesSearch
  })

  const newCount = clients.filter(c => getClientStatus(c) === 'NEW').length
  const contactedCount = clients.filter(c => getClientStatus(c) === 'CONTACTED').length

  return (
    <div className="space-y-5">

      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-gray-800">Clients</h1>
        <p className="text-sm text-gray-400 mt-0.5">Contact new clients first before managing orders</p>
      </div>

      {/* Summary pills */}
      <div className="flex gap-3">
        <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-sm font-medium">
          <ShoppingBag size={14} />
          {newCount} New
        </div>
        <div className="flex items-center gap-2 bg-yellow-50 text-yellow-700 px-4 py-2 rounded-lg text-sm font-medium">
          <Users size={14} />
          {contactedCount} Contacted
        </div>
      </div>

      {/* Filters + Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, phone or city..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 bg-white"
          />
        </div>
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          {(['ALL', 'NEW', 'CONTACTED'] as const).map(f => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition
                ${statusFilter === f
                  ? 'bg-white text-gray-800 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-400">Name</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-400">Phone</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-400">City</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-400">Status</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-400">Date</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-gray-400 text-xs">Loading...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-gray-400 text-xs">No clients found</td>
                </tr>
              ) : filtered.map(client => {
                const status = getClientStatus(client)
                const isUpdating = updatingId === client.id

                return (
                  <tr key={client.id} className="hover:bg-gray-50 transition">

                    <td className="px-5 py-3.5 font-medium text-gray-700">{client.name}</td>

                    <td className="px-5 py-3.5">
                      <button
                        onClick={() => openWhatsApp(client.phone)}
                        className="flex items-center gap-1.5 text-green-600 hover:text-green-700 font-medium transition"
                      >
                        <MessageCircle size={14} />
                        {client.phone}
                      </button>
                    </td>

                    <td className="px-5 py-3.5 text-gray-400">{client.city}</td>

                    <td className="px-5 py-3.5">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[status]}`}>
                        {status}
                      </span>
                    </td>

                    <td className="px-5 py-3.5 text-gray-400 text-xs">
                      {new Date(client.created_at).toLocaleDateString('en', {
                        day: 'numeric', month: 'short', year: 'numeric'
                      })}
                    </td>

                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">

                        {status === 'NEW' ? (
                          <button
                            onClick={() => markAsContacted(client.id)}
                            disabled={isUpdating}
                            className="flex items-center gap-1 px-2.5 py-1 bg-yellow-50 hover:bg-yellow-100 text-yellow-700 rounded-lg text-xs font-medium transition disabled:opacity-50"
                          >
                            <CheckCircle size={13} />
                            {isUpdating ? 'Updating...' : 'Mark contacted'}
                          </button>
                        ) : (
                          <button
                            onClick={() => markAsNew(client.id)}
                            disabled={isUpdating}
                            className="flex items-center gap-1 px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-medium transition disabled:opacity-50"
                          >
                            <RotateCcw size={13} />
                            {isUpdating ? 'Updating...' : 'Mark as new'}
                          </button>
                        )}

                        <a
                          href={`/dashboard/orders?client=${client.id}`}
                          className="flex items-center gap-1 px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg text-xs font-medium transition"
                        >
                          <Eye size={13} />
                          Orders
                        </a>

                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}