'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Phone, MapPin, MessageCircle, Sparkles, Upload } from 'lucide-react'
import Button from '../components/ui/Button'

const SIZE_OPTIONS = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'One size']

export default function OrderPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [form, setForm] = useState({
    name: '', phone: '', city: '', address: '',
    items: '', size: '', color: '', notes: '',
  })

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { setError('Only image files are allowed'); return }
    if (file.size > 5 * 1024 * 1024) { setError('Image must be under 5MB'); return }
    setError('')
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  function removeImage() { setImageFile(null); setImagePreview(null) }

  function validatePhone(phone: string) { return /^(06|07)\d{8}$/.test(phone) }

  async function uploadImage(orderId: string): Promise<string | null> {
    if (!imageFile) return null
    const ext = imageFile.name.split('.').pop()
    const path = `${orderId}.${ext}`
    const { error } = await supabase.storage.from('order-images').upload(path, imageFile)
    if (error) { console.error('Image upload error:', error); return null }
    const { data } = supabase.storage.from('order-images').getPublicUrl(path)
    return data.publicUrl
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!validatePhone(form.phone)) {
      setError('Phone must start with 06 or 07 and be 10 digits')
      return
    }
    setLoading(true)
    try {
      const { data: client, error: clientError } = await supabase
        .from('clients')
        .upsert({ name: form.name, phone: form.phone, city: form.city, address: form.address },
          { onConflict: 'phone' })
        .select().single()
      if (clientError) throw clientError

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({ client_id: client.id, items: form.items, size: form.size, color: form.color, notes: form.notes, status: 'NEW' })
        .select().single()
      if (orderError) throw orderError

      if (imageFile) {
        const imageUrl = await uploadImage(order.id)
        if (imageUrl) await supabase.from('orders').update({ image_url: imageUrl }).eq('id', order.id)
      }
      router.push('/thanks')
    } catch (err: any) {
      setError('Something went wrong. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-pink-50 flex items-center justify-center px-6">
      <div className="grid md:grid-cols-2 gap-8 max-w-6xl w-full h-[90vh]">

        {/* LEFT */}
        <div className="flex flex-col justify-center space-y-6">
          <div className="flex items-center gap-3">
            <div className="bg-pink-500 text-white p-2 rounded-xl shadow-md">
              <Sparkles size={20} />
            </div>
            <span className="text-xl font-semibold text-gray-800">Veloura</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-800 leading-tight">Order Your Look Effortlessly</h1>
          <p className="text-gray-600">Fill the form and we'll confirm your order via WhatsApp.</p>
          <div className="space-y-3 pt-4">
            {[
              { icon: <Phone size={16} />, text: '+212 6 XX XX XX XX' },
              { icon: <MapPin size={16} />, text: 'Casablanca' },
              { icon: <MessageCircle size={16} />, text: 'Available 24/7' },
            ].map(({ icon, text }) => (
              <div key={text} className="flex items-center gap-3 bg-white px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition">
                <div className="bg-pink-100 text-pink-600 p-2 rounded-md">{icon}</div>
                <span className="text-gray-700 text-sm">{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT FORM */}
        <div className="bg-white rounded-2xl shadow-xl p-6 h-[85vh] overflow-y-auto">
          <form onSubmit={handleSubmit}>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Place your order</h2>
            <div className="grid grid-cols-2 gap-3">
              <input name="name" value={form.name} onChange={handleChange} required placeholder="Full name" className="input text-gray-800 col-span-2" />
              <input name="phone" value={form.phone} onChange={handleChange} required placeholder="Phone (06XXXXXXXX)" className="input text-gray-800" />
              <input name="city" value={form.city} onChange={handleChange} required placeholder="City" className="input text-gray-800" />
              <input name="address" value={form.address} onChange={handleChange} placeholder="Address" className="input text-gray-800 col-span-2" />
              <textarea name="items" value={form.items} onChange={handleChange} required placeholder="Items" className="input text-gray-800 col-span-2 h-16 resize-none" />

              <div className="col-span-2">
                {!imagePreview ? (
                  <label className="flex items-center justify-center gap-2 w-full h-16 border-2 border-dashed border-pink-200 rounded-lg cursor-pointer hover:border-pink-400 hover:bg-pink-50 transition">
                    <Upload size={16} className="text-pink-500" />
                    <span className="text-sm text-gray-500">Upload image</span>
                    <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                  </label>
                ) : (
                  <div className="relative">
                    <img src={imagePreview} className="w-full h-24 object-cover rounded-lg border" />
                    <button type="button" onClick={removeImage} className="absolute cursor-pointer top-1 right-1 bg-red-500 text-white text-xs px-2 py-1 rounded">
                      Remove
                    </button>
                  </div>
                )}
              </div>

              <select name="size" value={form.size} onChange={handleChange} className="input text-gray-800">
                <option value="">Size</option>
                {SIZE_OPTIONS.map(s => <option key={s}>{s}</option>)}
              </select>
              <input name="color" value={form.color} onChange={handleChange} placeholder="Color" className="input text-gray-800" />
              <textarea name="notes" value={form.notes} onChange={handleChange} placeholder="Notes" className="input text-gray-800 col-span-2 h-12 resize-none" />
            </div>

            <div className="space-y-3 mt-4">
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <Button type="submit" disabled={loading} fullWidth>
                {loading ? 'Sending...' : 'Submit Order'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </main>
  )
}