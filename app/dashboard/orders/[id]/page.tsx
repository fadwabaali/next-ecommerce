'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, MessageCircle, Save, Package, MapPin, Hash, Store, FileText, DollarSign } from 'lucide-react'
import { STATUSES, STATUS_COLORS, openWhatsApp } from '@/lib/constants'
import StatusBadge from '../../../components/ui/StatusBadge'
import Button from '../../../components/ui/Button'
import Input from '../../../components/ui/Input'

type Order = {
  id: string
  status: string
  total: number | null
  store: string | null
  notes: string | null
  items: string | null
  size: string | null
  color: string | null
  image_url: string | null
  created_at: string
  updated_at: string
  updated_by: string | null
  clients: { name: string; phone: string; city: string; address: string | null } | null
}

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const supabase = createClient()

  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [status, setStatus] = useState('')
  const [total, setTotal] = useState('')
  const [store, setStore] = useState('')
  const [notes, setNotes] = useState('')
  const [items, setItems] = useState('')

  useEffect(() => { fetchOrder() }, [id])

  async function fetchOrder() {
    setLoading(true)
    const { data } = await supabase
      .from('orders')
      .select('*, clients(name, phone, city, address)')
      .eq('id', id)
      .single()
    if (data) {
      setOrder(data as Order)
      setStatus(data.status)
      setTotal(data.total?.toString() ?? '')
      setStore(data.store ?? '')
      setNotes(data.notes ?? '')
      setItems(data.items ?? '')
    }
    setLoading(false)
  }

  async function saveChanges() {
    setSaving(true)
    const { error } = await supabase
      .from('orders')
      .update({
        status,
        total: total ? parseFloat(total) : null,
        store: store || null,
        notes: notes || null,
        items: items || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
    if (!error) { setSaved(true); setTimeout(() => setSaved(false), 2000); fetchOrder() }
    setSaving(false)
  }

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400 text-sm">Loading order...</div>
  if (!order) return (
    <div className="flex flex-col items-center justify-center h-64 gap-3">
      <p className="text-gray-400 text-sm">Order not found</p>
      <Button variant="ghost" onClick={() => router.back()}>Go back</Button>
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-400 hover:text-gray-600 transition text-sm">
          <ArrowLeft size={16} />Back to orders
        </button>
        <div className="flex items-center gap-2">
          <Button variant="whatsapp" onClick={() => order.clients?.phone && openWhatsApp(order.clients.phone)}>
            <MessageCircle size={15} />WhatsApp
          </Button>
          <Button onClick={saveChanges} disabled={saving}>
            <Save size={15} />{saving ? 'Saving...' : saved ? '✓ Saved' : 'Save changes'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* LEFT */}
        <div className="space-y-4">
          {/* Client card */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
            <h2 className="text-sm font-semibold text-gray-700">Client info</h2>
            {[
              { icon: <Package size={13} className="text-pink-500" />, bg: 'bg-pink-50', label: 'Name', value: order.clients?.name },
              { icon: <MessageCircle size={13} className="text-green-500" />, bg: 'bg-green-50', label: 'Phone', value: order.clients?.phone, isPhone: true },
              { icon: <MapPin size={13} className="text-blue-500" />, bg: 'bg-blue-50', label: 'City', value: order.clients?.city, sub: order.clients?.address },
              { icon: <Hash size={13} className="text-gray-400" />, bg: 'bg-gray-50', label: 'Order ID', value: order.id, mono: true },
            ].map(({ icon, bg, label, value, isPhone, sub, mono }) => (
              <div key={label} className="flex items-start gap-3">
                <div className={`w-7 h-7 ${bg} rounded-lg flex items-center justify-center shrink-0 mt-0.5`}>{icon}</div>
                <div>
                  <p className="text-xs text-gray-400">{label}</p>
                  {isPhone ? (
                    <button onClick={() => value && openWhatsApp(value)} className="text-sm font-medium text-green-600 hover:underline">{value ?? '—'}</button>
                  ) : (
                    <p className={`text-sm ${mono ? 'font-mono text-gray-500 text-xs break-all' : 'font-medium text-gray-700'}`}>{value ?? '—'}</p>
                  )}
                  {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
                </div>
              </div>
            ))}
          </div>

          {/* Image */}
          {order.image_url && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <h2 className="text-sm font-semibold text-gray-700 mb-3">Order image</h2>
              <img src={order.image_url} alt="Order" className="w-full rounded-lg object-cover border border-gray-100" />
              <a href={order.image_url} target="_blank" rel="noreferrer" className="text-xs text-pink-500 hover:underline mt-2 inline-block">
                Open full image →
              </a>
            </div>
          )}

          {/* Timeline */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">Timeline</h2>
            <div className="text-xs text-gray-400 space-y-1.5">
              <p>Created: <span className="text-gray-600">{new Date(order.created_at).toLocaleString()}</span></p>
              <p>Updated: <span className="text-gray-600">{new Date(order.updated_at).toLocaleString()}</span></p>
              {order.updated_by && <p>By: <span className="text-gray-600">{order.updated_by}</span></p>}
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Order details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Status</label>
                <select value={status} onChange={e => setStatus(e.target.value)}
                  className={`w-full text-xs font-medium px-3 py-2 rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-pink-400 cursor-pointer ${STATUS_COLORS[status]}`}>
                  {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <Input label="Total (MAD)" type="number" value={total}
                onChange={e => setTotal((e.target as HTMLInputElement).value)}
                placeholder="0.00" icon={<DollarSign size={13} />} />
              <Input label="Store" value={store}
                onChange={e => setStore((e.target as HTMLInputElement).value)}
                placeholder="Store name" icon={<Store size={13} />} />
            </div>
            {(order.size || order.color) && (
              <div className="flex gap-3 mt-4 pt-4 border-t border-gray-50">
                {order.size && <div className="bg-gray-50 px-3 py-1.5 rounded-lg text-xs text-gray-500">Size: <span className="font-medium text-gray-700">{order.size}</span></div>}
                {order.color && <div className="bg-gray-50 px-3 py-1.5 rounded-lg text-xs text-gray-500">Color: <span className="font-medium text-gray-700">{order.color}</span></div>}
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
              <Package size={14} className="text-gray-400" />Items
            </label>
            <textarea value={items} onChange={e => setItems(e.target.value)} rows={4}
              placeholder="Describe the items..."
              className="w-full text-sm border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-400 resize-none" />
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
              <FileText size={14} className="text-gray-400" />Notes
            </label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3}
              placeholder="Add internal notes..."
              className="w-full text-sm border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-400 resize-none" />
          </div>

          <Button onClick={saveChanges} disabled={saving} fullWidth>
            <Save size={15} />{saving ? 'Saving...' : saved ? '✓ Saved!' : 'Save all changes'}
          </Button>
        </div>
      </div>
    </div>
  )
}