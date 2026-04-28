import Button from '../components/ui/Button'

export default function ThanksPage() {
  return (
    <main className="min-h-screen bg-pink-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow p-10 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-semibold text-gray-800 mb-3">Order received!</h1>
        <p className="text-gray-500 text-sm leading-relaxed">
          Thank you for your order. We'll contact you soon on WhatsApp to confirm the details.
        </p>
        <div className="mt-8">
          <a href="/order">
            <Button variant="ghost" fullWidth>Place another order</Button>
          </a>
        </div>
      </div>
    </main>
  )
}