'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ShoppingBag, Users, PackageCheck, Truck, XCircle } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { STATUS_COLORS, STATUSES } from '@/lib/constants'
import StatusBadge from './../components/ui/StatusBadge'
import PageHeader from './../components/layout/PageHeader'
import Button from './../components/ui/Button'
import Skeleton from '../components/ui/Skeleton'

const STAT_CARDS = [
  { key: 'NEW',       label: 'New orders', icon: ShoppingBag,  color: 'bg-blue-50 text-blue-600' },
  { key: 'CONTACTED', label: 'Contacted',  icon: Users,        color: 'bg-yellow-50 text-yellow-600' },
  { key: 'PACKED',    label: 'Packed',     icon: PackageCheck, color: 'bg-purple-50 text-purple-600' },
  { key: 'DELIVERED', label: 'Delivered',  icon: Truck,        color: 'bg-green-50 text-green-600' },
  { key: 'CANCELED',  label: 'Canceled',   icon: XCircle,      color: 'bg-red-50 text-red-600' },
]

type Order = {
  id: string
  status: string
  total: number | null
  created_at: string
  clients: { name: string; phone: string; city: string } | null
}

export default function DashboardPage() {
  const supabase = createClient()
  const [orders, setOrders] = useState<Order[]>([])
  const [filter, setFilter] = useState<'today' | 'week'>('week')
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchOrders() }, [filter])

  async function fetchOrders() {
    setLoading(true)
    const from = new Date()
    if (filter === 'today') from.setHours(0, 0, 0, 0)
    else from.setDate(from.getDate() - 7)

    const { data } = await supabase
      .from('orders')
      .select('id, status, total, created_at, clients(name, phone, city)')
      .gte('created_at', from.toISOString())
      .order('created_at', { ascending: false })

    setOrders((data as unknown as Order[]) || [])
    setLoading(false)
  }

  const counts = STAT_CARDS.reduce((acc, { key }) => {
    acc[key] = orders.filter(o => o.status === key).length
    return acc
  }, {} as Record<string, number>)

  const chartData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    return {
      day: d.toLocaleDateString('en', { weekday: 'short' }),
      orders: orders.filter(o => new Date(o.created_at).toDateString() === d.toDateString()).length
    }
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Overview"
        subtitle="Welcome back, Admin"
        action={
          <div className="flex gap-2">
            {(['today', 'week'] as const).map(f => (
              <Button key={f} variant={filter === f ? 'primary' : 'ghost'} onClick={() => setFilter(f)}>
                {f === 'today' ? 'Today' : 'This week'}
              </Button>
            ))}
          </div>
        }
      />

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {STAT_CARDS.map(({ key, label, icon: Icon, color }) => (
          <div key={key} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${color}`}>
              <Icon size={18} />
            </div>
            <p className="text-2xl font-semibold text-gray-800">{loading ? '—' : counts[key] ?? 0}</p>
            <p className="text-xs text-gray-400 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Chart + Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Orders this week</h2>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ec4899" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', fontSize: 12 }} />
              <Area type="monotone" dataKey="orders" stroke="#ec4899" strokeWidth={2} fill="url(#colorOrders)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Status breakdown</h2>
          <div className="space-y-3">
            {STAT_CARDS.map(({ key, label }) => {
              const count = counts[key] ?? 0
              const pct = Math.round((count / (orders.length || 1)) * 100)
              return (
                <div key={key}>
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>{label}</span><span>{count}</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-pink-400 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Recent orders */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-700">Recent orders</h2>
          <a href="/dashboard/orders" className="text-xs text-pink-500 hover:underline">View all →</a>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              {['Client', 'City', 'Status', 'Total', 'Date'].map(h => (
                <th key={h} className="text-left px-5 py-3 text-xs font-medium text-gray-400">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <Skeleton rows={4} />
            ) : orders.length === 0 ? (
              <tr><td colSpan={5} className="px-5 py-8 text-center text-gray-400 text-xs">No orders yet</td></tr>
            ) : orders.slice(0, 8).map(order => (
              <tr key={order.id} className="hover:bg-gray-50 transition">
                <td className="px-5 py-3 font-medium text-gray-700">{order.clients?.name ?? '—'}</td>
                <td className="px-5 py-3 text-gray-400">{order.clients?.city ?? '—'}</td>
                <td className="px-5 py-3"><StatusBadge status={order.status} /></td>
                <td className="px-5 py-3 text-gray-600">{order.total ? `${order.total} MAD` : '—'}</td>
                <td className="px-5 py-3 text-gray-400">
                  {new Date(order.created_at).toLocaleDateString('en', { day: 'numeric', month: 'short' })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}