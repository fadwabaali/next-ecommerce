'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Search, MessageCircle, Eye, CheckCircle, ShoppingBag, Users, RotateCcw } from 'lucide-react'
import { openWhatsApp } from '@/lib/constants'
import StatusBadge from '../../components/ui/StatusBadge'
import Button from '../../components/ui/Button'
import PageHeader from '../../components/layout/PageHeader'

type Client = {
  id: string
  name: string
  phone: string
  city: string
  created_at: string
  orders: { status: string }[]
}

export default function ClientsPage() {
  const supabase = createClient()
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'NEW' | 'CONTACTED'>('NEW')
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  useEffect(() => { fetchClients() }, [])

  async function fetchClients() {
    setLoading(true)
    const { data } = await supabase
      .from('clients')
      .select('id, name, phone, city, created_at, orders(status)')
      .order('created_at', { ascending: false })
    setClients((data as Client[]) || [])
    setLoading(false)
  }

  function getClientStatus(client: Client) {
    if (!client.orders?.length) return 'NEW'
    return client.orders.some(o => o.status === 'CONTACTED') ? 'CONTACTED' : 'NEW'
  }

  async function updateClientStatus(clientId: string, from: string, to: string) {
    setUpdatingId(clientId)
    const { error } = await supabase
      .from('orders')
      .update({ status: to, updated_at: new Date().toISOString() })
      .eq('client_id', clientId)
      .eq('status', from)

    if (!error) {
      setClients(prev => prev.map(c => c.id !== clientId ? c : {
        ...c, orders: c.orders.map(o => o.status === from ? { ...o, status: to } : o)
      }))
    }
    setUpdatingId(null)
  }

  const filtered = clients.filter(client => {
    const status = getClientStatus(client)
    const matchesStatus = statusFilter === 'ALL' || status === statusFilter
    const s = search.toLowerCase().trim()
    const matchesSearch = !s ||
      client.name.toLowerCase().includes(s) ||
      client.phone.includes(s) ||
      client.city.toLowerCase().includes(s)
    return matchesStatus && matchesSearch
  })

  const newCount = clients.filter(c => getClientStatus(c) === 'NEW').length
  const contactedCount = clients.filter(c => getClientStatus(c) === 'CONTACTED').length

  return (
    <div className="space-y-5">
      <PageHeader title="Clients" subtitle="Contact new clients first before managing orders" />

      {/* Summary */}
      <div className="flex gap-3">
        <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-sm font-medium">
          <ShoppingBag size={14} />{newCount} New
        </div>
        <div className="flex items-center gap-2 bg-yellow-50 text-yellow-700 px-4 py-2 rounded-lg text-sm font-medium">
          <Users size={14} />{contactedCount} Contacted
        </div>
      </div>

      {/* Search + Filter */}
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
            <button key={f} onClick={() => setStatusFilter(f)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${statusFilter === f ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >{f}</button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                {['Name', 'Phone', 'City', 'Status', 'Date', 'Actions'].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-medium text-gray-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={6} className="px-5 py-10 text-center text-gray-400 text-xs">Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-5 py-10 text-center text-gray-400 text-xs">No clients found</td></tr>
              ) : filtered.map(client => {
                const status = getClientStatus(client)
                const isUpdating = updatingId === client.id
                return (
                  <tr key={client.id} className="hover:bg-gray-50 transition">
                    <td className="px-5 py-3.5 font-medium text-gray-700">{client.name}</td>
                    <td className="px-5 py-3.5">
                      <button onClick={() => openWhatsApp(client.phone)}
                        className="flex items-center gap-1.5 text-green-600 hover:text-green-700 transition">
                        <MessageCircle size={14} />{client.phone}
                      </button>
                    </td>
                    <td className="px-5 py-3.5 text-gray-400">{client.city}</td>
                    <td className="px-5 py-3.5"><StatusBadge status={status} /></td>
                    <td className="px-5 py-3.5 text-gray-400 text-xs">
                      {new Date(client.created_at).toLocaleDateString('en', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        {status === 'NEW' ? (
                          <Button variant="ghost" disabled={isUpdating} className="text-yellow-700 bg-yellow-50 hover:bg-yellow-100 border-0 text-xs px-2.5 py-1"
                            onClick={() => updateClientStatus(client.id, 'NEW', 'CONTACTED')}>
                            <CheckCircle size={13} />{isUpdating ? 'Updating...' : 'Mark contacted'}
                          </Button>
                        ) : (
                          <Button variant="ghost" disabled={isUpdating} className="text-blue-700 bg-blue-50 hover:bg-blue-100 border-0 text-xs px-2.5 py-1"
                            onClick={() => updateClientStatus(client.id, 'CONTACTED', 'NEW')}>
                            <RotateCcw size={13} />{isUpdating ? 'Updating...' : 'Mark as new'}
                          </Button>
                        )}
                        <a href={`/dashboard/orders?client=${client.id}`}>
                          <Button variant="secondary" className="text-xs px-2.5 py-1">
                            <Eye size={13} />Orders
                          </Button>
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