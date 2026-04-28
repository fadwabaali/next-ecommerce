'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Download, Save, Phone, Store, Info } from 'lucide-react'

export default function SettingsPage() {
  const supabase = createClient()

  const [whatsapp, setWhatsapp] = useState('')
  const [storeName, setStoreName] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [exporting, setExporting] = useState(false)

  async function saveSettings() {
    setSaving(true)
    // We store settings in localStorage for now
    // In Phase 6 we'll move this to a settings table
    localStorage.setItem('settings_whatsapp', whatsapp)
    localStorage.setItem('settings_store', storeName)
    await new Promise(r => setTimeout(r, 400)) // feel the save
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    setSaving(false)
  }

  async function exportCSV() {
    setExporting(true)

    const { data, error } = await supabase
      .from('orders')
      .select('id, status, total, store, items, size, color, notes, created_at, updated_at, clients(name, phone, city, address)')
      .order('created_at', { ascending: false })

    if (error || !data) {
      alert('Export failed')
      setExporting(false)
      return
    }

    // Build CSV rows
    const headers = [
      'Order ID', 'Client Name', 'Phone', 'City', 'Address',
      'Items', 'Size', 'Color', 'Total (MAD)', 'Status',
      'Store', 'Notes', 'Created At', 'Updated At'
    ]

    const rows = data.map((o: any) => [
      o.id,
      o.clients?.name ?? '',
      o.clients?.phone ?? '',
      o.clients?.city ?? '',
      o.clients?.address ?? '',
      o.items ?? '',
      o.size ?? '',
      o.color ?? '',
      o.total ?? '',
      o.status,
      o.store ?? '',
      o.notes ?? '',
      new Date(o.created_at).toLocaleString(),
      new Date(o.updated_at).toLocaleString(),
    ])

    // Escape fields that might contain commas or quotes
    function escapeField(val: any) {
      const str = String(val)
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`
      }
      return str
    }

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(escapeField).join(','))
    ].join('\n')

    // Trigger download
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `orders-${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
    URL.revokeObjectURL(url)

    setExporting(false)
  }

  // Load from localStorage on mount
  useState(() => {
    setWhatsapp(localStorage.getItem('settings_whatsapp') ?? '')
    setStoreName(localStorage.getItem('settings_store') ?? '')
  })

  return (
    <div className="max-w-2xl mx-auto space-y-5">

      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-gray-800">Settings</h1>
        <p className="text-sm text-gray-400 mt-0.5">Manage your system preferences</p>
      </div>

      {/* Store info */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <Store size={16} className="text-gray-400" />
          <h2 className="text-sm font-semibold text-gray-700">Store info</h2>
        </div>

        <div>
          <label className="block text-xs text-gray-400 mb-1.5">Store name</label>
          <input
            value={storeName}
            onChange={e => setStoreName(e.target.value)}
            placeholder="Veloura"
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
          />
        </div>

        <div>
          <label className="block text-xs text-gray-400 mb-1.5">WhatsApp number</label>
          <div className="relative">
            <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
            <input
              value={whatsapp}
              onChange={e => setWhatsapp(e.target.value)}
              placeholder="+212600000000"
              className="w-full pl-9 pr-4 border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
            />
          </div>
          <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1">
            <Info size={11} />
            Used for the WhatsApp button on the public order form
          </p>
        </div>

        <button
          onClick={saveSettings}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-pink-500 hover:bg-pink-600 disabled:bg-pink-300 text-white rounded-lg text-sm font-medium transition"
        >
          <Save size={14} />
          {saving ? 'Saving...' : saved ? '✓ Saved' : 'Save settings'}
        </button>
      </div>

      {/* Export */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-1">
          <Download size={16} className="text-gray-400" />
          <h2 className="text-sm font-semibold text-gray-700">Export data</h2>
        </div>
        <p className="text-xs text-gray-400 mb-4">
          Download all orders as a CSV file. Open with Excel or Google Sheets.
          Save a copy to your PC and Google Drive weekly.
        </p>

        <div className="bg-amber-50 border border-amber-100 rounded-lg px-4 py-3 mb-4">
          <p className="text-xs text-amber-700 flex items-start gap-2">
            <Info size={13} className="shrink-0 mt-0.5" />
            <span>
              <strong>Important:</strong> Export your orders weekly as a backup.
              Store copies in Google Drive in case of data loss.
            </span>
          </p>
        </div>

        <button
          onClick={exportCSV}
          disabled={exporting}
          className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-900 disabled:bg-gray-400 text-white rounded-lg text-sm font-medium transition"
        >
          <Download size={14} />
          {exporting ? 'Preparing...' : 'Export all orders (CSV)'}
        </button>
      </div>

      {/* Danger zone */}
      <div className="bg-white rounded-xl border border-red-100 shadow-sm p-6">
        <h2 className="text-sm font-semibold text-red-500 mb-1">Danger zone</h2>
        <p className="text-xs text-gray-400 mb-4">
          These actions are irreversible. Export your data before proceeding.
        </p>
        <button
          onClick={async () => {
            const confirmed = window.confirm(
              'Are you sure? This will delete ALL orders. This cannot be undone.'
            )
            if (!confirmed) return
            const doubleConfirm = window.confirm('Last chance — delete everything?')
            if (!doubleConfirm) return
            await supabase.from('orders').delete().neq('id', '00000000-0000-0000-0000-000000000000')
            alert('All orders deleted.')
          }}
          className="px-4 py-2 border border-red-200 text-red-500 hover:bg-red-50 rounded-lg text-sm transition"
        >
          Delete all orders
        </button>
      </div>

    </div>
  )
}