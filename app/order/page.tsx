'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const SIZE_OPTIONS = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'One size']

export default function OrderPage() {
  const router = useRouter()
  const supabase = createClient()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const [form, setForm] = useState({
    name: '',
    phone: '',
    city: '',
    address: '',
    items: '',
    size: '',
    color: '',
    notes: '',
  })

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate: images only, max 5MB
    if (!file.type.startsWith('image/')) {
      setError('Only image files are allowed')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be under 5MB')
      return
    }

    setError('')
    setImageFile(file)
    // Show preview immediately
    setImagePreview(URL.createObjectURL(file))
  }

  function removeImage() {
    setImageFile(null)
    setImagePreview(null)
  }

  function validatePhone(phone: string) {
    return /^(06|07)\d{8}$/.test(phone)
  }

  async function uploadImage(orderId: string): Promise<string | null> {
    if (!imageFile) return null

    // Unique file path: orderId + original extension
    const ext = imageFile.name.split('.').pop()
    const path = `${orderId}.${ext}`

    const { error } = await supabase.storage
      .from('order-images')
      .upload(path, imageFile)

    if (error) {
      console.error('Image upload error:', error)
      return null
    }

    // Get the public URL
    const { data } = supabase.storage
      .from('order-images')
      .getPublicUrl(path)

    return data.publicUrl
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!validatePhone(form.phone)) {
      setError('Phone number must start with 06 or 07 and be 10 digits')
      return
    }

    setLoading(true)

    try {
      // 1. Insert client
      const { data: client, error: clientError } = await supabase
        .from('clients')
        .insert({
          name: form.name,
          phone: form.phone,
          city: form.city,
          address: form.address,
        })
        .select()
        .single()

      if (clientError) throw clientError

      // 2. Insert order first (we need the order ID for the image path)
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          client_id: client.id,
          items: form.items,
          size: form.size,
          color: form.color,
          notes: form.notes,
          status: 'NEW',
        })
        .select()
        .single()

      if (orderError) throw orderError

      // 3. Upload image if provided, then update the order with the URL
      if (imageFile) {
        const imageUrl = await uploadImage(order.id)
        if (imageUrl) {
          await supabase
            .from('orders')
            .update({ image_url: imageUrl })
            .eq('id', order.id)
        }
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
    <main className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-lg mx-auto bg-white rounded-2xl shadow p-8">
        <h1 className="text-2xl font-semibold text-gray-800 mb-2">Place your order</h1>
        <p className="text-gray-500 text-sm mb-8">Fill in your details and we'll contact you on WhatsApp</p>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full name *</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              placeholder="Your name"
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone number * <span className="text-gray-400">(Moroccan)</span>
            </label>
            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              required
              placeholder="06XXXXXXXX or 07XXXXXXXX"
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* City */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
            <input
              name="city"
              value={form.city}
              onChange={handleChange}
              required
              placeholder="Casablanca, Rabat..."
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <input
              name="address"
              value={form.address}
              onChange={handleChange}
              placeholder="Street, neighborhood..."
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Items */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Items *</label>
            <textarea
              name="items"
              value={form.items}
              onChange={handleChange}
              required
              rows={3}
              placeholder="Describe what you want to order..."
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Image upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Screenshot / image <span className="text-gray-400">(optional, max 5MB)</span>
            </label>

            {!imagePreview ? (
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-200 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors">
                <span className="text-2xl mb-1">📎</span>
                <span className="text-sm text-gray-500">Click to upload image</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            ) : (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-48 object-cover rounded-lg border border-gray-200"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-md hover:bg-red-600"
                >
                  Remove
                </button>
              </div>
            )}
          </div>

          {/* Size + Color */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Size</label>
              <select
                name="size"
                value={form.size}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">Select size</option>
                {SIZE_OPTIONS.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
              <input
                name="color"
                value={form.color}
                onChange={handleChange}
                placeholder="Black, white..."
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              rows={2}
              placeholder="Any extra info..."
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Error */}
          {error && <p className="text-red-500 text-sm">{error}</p>}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium py-3 rounded-lg text-sm transition-colors"
          >
            {loading ? 'Sending...' : 'Submit order'}
          </button>

        </form>
      </div>
    </main>
  )
}