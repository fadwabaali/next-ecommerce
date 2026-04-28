'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Download, Save, Phone, Store, Info } from 'lucide-react'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import PageHeader from '../../components/layout/PageHeader'

export default function SettingsPage() {
  const supabase = createClient()
  const [whatsapp, setWhatsapp] = useState('')
  const [storeName, setStoreName] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    setWhatsapp(localStorage.getItem('settings_whatsapp') ?? '')
    setStoreName(localStorage.getItem('settings_store') ?? '')
  }, [])

  async function saveSettings() {
    setSaving(true)
    localStorage.setItem('settings_whatsapp', whatsapp)
    localStorage.setItem('settings_store', storeName)
    await new Promise(r => setTimeout(r, 400))
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

    if (error || !data) { alert('Export failed'); setExporting(false); return }

    const headers = ['Order ID', 'Client Name', 'Phone', 'City', 'Address', 'Items', 'Size', 'Color', 'Total (MAD)', 'Status', 'Store', 'Notes', 'Created At', 'Updated At']
    const rows = data.map((o: any) => [
      o.id, o.clients?.name ?? '', o.clients?.phone ?? '', o.clients?.city ?? '',
      o.clients?.address ?? '', o.items ?? '', o.size ?? '', o.color ?? '',
      o.total ?? '', o.status, o.store ?? '', o.notes ?? '',
      new Date(o.created_at).toLocaleString(), new Date(o.updated_at).toLocaleString(),
    ])

    function escapeField(val: any) {
      const str = String(val)
      return str.includes(',') || str.includes('"') || str.includes('\n')
        ? `"${str.replace(/"/g, '""')}"` : str
    }

    const csv = [headers.join(','), ...rows.map(r => r.map(escapeField).join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `orders-${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
    URL.revokeObjectURL(url)
    setExporting(false)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <PageHeader title="Settings" subtitle="Manage your system preferences" />

      {/* Store info */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Store size={16} className="text-gray-400" />
          <h2 className="text-sm font-semibold text-gray-700">Store info</h2>
        </div>
        <Input label="Store name" value={storeName}
          onChange={e => setStoreName((e.target as HTMLInputElement).value)}
          placeholder="Veloura" />
        <Input label="WhatsApp number" value={whatsapp}
          onChange={e => setWhatsapp((e.target as HTMLInputElement).value)}
          placeholder="+212600000000" icon={<Phone size={14} />}
          hint="Used for the WhatsApp button on the public order form" />
        <Button onClick={saveSettings} disabled={saving}>
          <Save size={14} />{saving ? 'Saving...' : saved ? '✓ Saved' : 'Save settings'}
        </Button>
      </div>

      {/* Export */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-1">
          <Download size={16} className="text-gray-400" />
          <h2 className="text-sm font-semibold text-gray-700">Export data</h2>
        </div>
        <p className="text-xs text-gray-400 mb-4">Download all orders as CSV. Open with Excel or Google Sheets.</p>
        <div className="flex items-start gap-2 bg-amber-50 border border-amber-100 rounded-lg px-4 py-3 mb-4">
          <Info size={13} className="text-amber-600 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-700">
            <strong>Important:</strong> Export weekly and save to Google Drive as backup.
          </p>
        </div>
        <Button variant="secondary" onClick={exportCSV} disabled={exporting} className="bg-gray-800 hover:bg-gray-900 text-white">
          <Download size={14} />{exporting ? 'Preparing...' : 'Export all orders (CSV)'}
        </Button>
      </div>

      {/* Danger zone */}
      <div className="bg-white rounded-xl border border-red-100 shadow-sm p-6">
        <h2 className="text-sm font-semibold text-red-500 mb-1">Danger zone</h2>
        <p className="text-xs text-gray-400 mb-4">These actions are irreversible. Export your data first.</p>
        <Button variant="danger" className="border border-red-200"
          onClick={async () => {
            if (!window.confirm('Delete ALL orders? This cannot be undone.')) return
            if (!window.confirm('Last chance — are you sure?')) return
            await supabase.from('orders').delete().neq('id', '00000000-0000-0000-0000-000000000000')
            alert('All orders deleted.')
          }}>
          Delete all orders
        </Button>
      </div>
    </div>
  )
}