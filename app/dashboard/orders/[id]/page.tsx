'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  ArrowLeft, MessageCircle, Save, Package,
  MapPin, Hash, Store, FileText, DollarSign
} from 'lucide-react'

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
  clients: {
    name: string
    phone: string
    city: string
    address: string | null
  } | null
}

const STATUSES = ['NEW', 'CONTACTED', 'PACKED', 'SENT', 'DELIVERED', 'CANCELED', 'CHANGED']

const STATUS_COLORS: Record<string, string> = {
  NEW:       'bg-blue-100 text-blue-700',
  CONTACTED: 'bg-yellow-100 text-yellow-700',
  PACKED:    'bg-purple-100 text-purple-700',
  SENT:      'bg-indigo-100 text-indigo-700',
  DELIVERED: 'bg-green-100 text-green-700',
  CANCELED:  'bg-red-100 text-red-700',
  CHANGED:   'bg-orange-100 text-orange-700',
}

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const supabase = createClient()

  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  // Editable fields
  const [status, setStatus] = useState('')
  const [total, setTotal] = useState('')
  const [store, setStore] = useState('')
  const [notes, setNotes] = useState('')
  const [items, setItems] = useState('')

  useEffect(() => {
    fetchOrder()
  }, [id])

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

    if (!error) {
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
      fetchOrder()
    }

    setSaving(false)
  }

  function openWhatsApp() {
    if (!order?.clients?.phone) return
    const phone = order.clients.phone
    const formatted = phone.startsWith('0') ? '+212' + phone.slice(1) : phone
    window.open(`https://wa.me/${formatted}`, '_blank')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
        Loading order...
      </div>
    )
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <p className="text-gray-400 text-sm">Order not found</p>
        <button onClick={() => router.back()} className="text-pink-500 text-sm hover:underline">
          Go back
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-5">

      {/* Top bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-400 hover:text-gray-600 transition text-sm"
        >
          <ArrowLeft size={16} />
          Back to orders
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={openWhatsApp}
            className="flex items-center gap-2 px-3 py-2 bg-green-50 hover:bg-green-100 text-green-600 rounded-lg text-sm font-medium transition"
          >
            <MessageCircle size={15} />
            WhatsApp
          </button>

          <button
            onClick={saveChanges}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-pink-500 hover:bg-pink-600 disabled:bg-pink-300 text-white rounded-lg text-sm font-medium transition"
          >
            <Save size={15} />
            {saving ? 'Saving...' : saved ? '✓ Saved' : 'Save changes'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* LEFT — Client info + Order image */}
        <div className="space-y-4">

          {/* Client card */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
            <h2 className="text-sm font-semibold text-gray-700">Client info</h2>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 bg-pink-50 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                  <Package size={13} className="text-pink-500" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Name</p>
                  <p className="text-sm font-medium text-gray-700">{order.clients?.name ?? '—'}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-7 h-7 bg-green-50 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                  <MessageCircle size={13} className="text-green-500" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Phone</p>
                  <button
                    onClick={openWhatsApp}
                    className="text-sm font-medium text-green-600 hover:underline"
                  >
                    {order.clients?.phone ?? '—'}
                  </button>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin size={13} className="text-blue-500" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">City / Address</p>
                  <p className="text-sm text-gray-700">{order.clients?.city ?? '—'}</p>
                  {order.clients?.address && (
                    <p className="text-xs text-gray-400 mt-0.5">{order.clients.address}</p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-7 h-7 bg-gray-50 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                  <Hash size={13} className="text-gray-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Order ID</p>
                  <p className="text-xs font-mono text-gray-500 break-all">{order.id}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Order image */}
          {order.image_url && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <h2 className="text-sm font-semibold text-gray-700 mb-3">Order image</h2>
              <img
                src={order.image_url}
                alt="Order"
                className="w-full rounded-lg object-cover border border-gray-100"
              />
              <a
                href={order.image_url}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-pink-500 hover:underline mt-2 inline-block"
              >
                Open full image →
              </a>
            </div>
          )}

          {/* Meta */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-2">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">Timeline</h2>
            <div className="text-xs text-gray-400 space-y-1.5">
              <p>Created: <span className="text-gray-600">
                {new Date(order.created_at).toLocaleDateString('en', {
                  day: 'numeric', month: 'short', year: 'numeric',
                  hour: '2-digit', minute: '2-digit'
                })}
              </span></p>
              <p>Last updated: <span className="text-gray-600">
                {new Date(order.updated_at).toLocaleDateString('en', {
                  day: 'numeric', month: 'short', year: 'numeric',
                  hour: '2-digit', minute: '2-digit'
                })}
              </span></p>
              {order.updated_by && (
                <p>Updated by: <span className="text-gray-600">{order.updated_by}</span></p>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT — Editable fields */}
        <div className="lg:col-span-2 space-y-4">

          {/* Status + Total + Store */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Order details</h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

              {/* Status */}
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Status</label>
                <select
                  value={status}
                  onChange={e => setStatus(e.target.value)}
                  className={`w-full text-xs font-medium px-3 py-2 rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-pink-400 cursor-pointer ${STATUS_COLORS[status]}`}
                >
                  {STATUSES.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              {/* Total */}
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Total (MAD)</label>
                <div className="relative">
                  <DollarSign size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
                  <input
                    type="number"
                    value={total}
                    onChange={e => setTotal(e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
                  />
                </div>
              </div>

              {/* Store */}
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Store</label>
                <div className="relative">
                  <Store size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
                  <input
                    value={store}
                    onChange={e => setStore(e.target.value)}
                    placeholder="Store name"
                    className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
                  />
                </div>
              </div>
            </div>

            {/* Size + Color (read only — set by client) */}
            {(order.size || order.color) && (
              <div className="flex gap-3 mt-4 pt-4 border-t border-gray-50">
                {order.size && (
                  <div className="bg-gray-50 px-3 py-1.5 rounded-lg text-xs text-gray-500">
                    Size: <span className="font-medium text-gray-700">{order.size}</span>
                  </div>
                )}
                {order.color && (
                  <div className="bg-gray-50 px-3 py-1.5 rounded-lg text-xs text-gray-500">
                    Color: <span className="font-medium text-gray-700">{order.color}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Items */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              <div className="flex items-center gap-2">
                <Package size={14} className="text-gray-400" />
                Items
              </div>
            </label>
            <textarea
              value={items}
              onChange={e => setItems(e.target.value)}
              rows={4}
              placeholder="Describe the items..."
              className="w-full text-sm border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-400 resize-none"
            />
          </div>

          {/* Notes */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              <div className="flex items-center gap-2">
                <FileText size={14} className="text-gray-400" />
                Notes
              </div>
            </label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={3}
              placeholder="Add internal notes..."
              className="w-full text-sm border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-400 resize-none"
            />
          </div>

          {/* Save button bottom */}
          <button
            onClick={saveChanges}
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 py-3 bg-pink-500 hover:bg-pink-600 disabled:bg-pink-300 text-white rounded-xl text-sm font-medium transition"
          >
            <Save size={15} />
            {saving ? 'Saving...' : saved ? '✓ Saved!' : 'Save all changes'}
          </button>
        </div>
      </div>
    </div>
  )
}