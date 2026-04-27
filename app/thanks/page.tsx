export default function ThanksPage() {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow p-10 text-center">
        <div className="text-5xl mb-4">✅</div>
        <h1 className="text-2xl font-semibold text-gray-800 mb-3">Order received!</h1>
        <p className="text-gray-500 text-sm leading-relaxed">
          Thank you for your order. We'll contact you soon on WhatsApp to confirm the details.
        </p>
        
        <a
          href="/order"
          className="inline-block mt-8 text-sm text-blue-600 hover:underline"
        >
          Place another order
        </a>
      </div>
    </main>
  )
}