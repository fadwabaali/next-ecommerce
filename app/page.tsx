import Link from 'next/link'
import { Sparkles, ShoppingBag, MessageCircle, Phone, MapPin, ArrowRight, Star } from 'lucide-react'
import Button from './components/ui/Button'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-pink-50">

      {/* NAVBAR */}
      <nav className="flex items-center justify-between px-8 py-5 bg-white/80 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="flex items-center gap-2.5">
          <div className="bg-pink-500 text-white p-1.5 rounded-lg">
            <Sparkles size={16} />
          </div>
          <span className="font-semibold text-gray-800">Veloura</span>
        </div>
        <div className="flex items-center gap-3">
          <a href="https://wa.me/212600000000" target="_blank" rel="noreferrer">
            <Button variant="ghost">
              <MessageCircle size={15} />
              WhatsApp us
            </Button>
          </a>
          <Link href="/order">
            <Button>
              <ShoppingBag size={15} />
              Order now
            </Button>
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="max-w-6xl mx-auto px-6 pt-24 pb-20 grid md:grid-cols-2 gap-16 items-center">

        {/* Left */}
        <div className="space-y-7">
          <div className="inline-flex items-center gap-2 bg-pink-100 text-pink-600 px-4 py-1.5 rounded-full text-sm font-medium">
            <Star size={13} fill="currentColor" />
            Fashion delivered to your door
          </div>

          <h1 className="text-5xl font-bold text-gray-800 leading-tight">
            Order Your
            <span className="text-pink-500"> Perfect Look </span>
            Effortlessly
          </h1>

          <p className="text-gray-500 text-lg leading-relaxed">
            Fill in a simple form, send us your style inspiration, and we'll confirm everything via WhatsApp. Fast, easy, personal.
          </p>

          <div className="flex items-center gap-3 pt-2">
            <Link href="/order">
              <Button className="px-6 py-3 text-base">
                Place an order
                <ArrowRight size={16} />
              </Button>
            </Link>
            <a href="https://wa.me/212600000000" target="_blank" rel="noreferrer">
              <Button variant="whatsapp" className="px-6 py-3 text-base">
                <MessageCircle size={16} />
                Chat with us
              </Button>
            </a>
          </div>

          {/* Trust badges */}
          <div className="flex items-center gap-6 pt-4">
            {[
              { label: '500+', sub: 'Happy clients' },
              { label: '24/7', sub: 'WhatsApp support' },
              { label: '100%', sub: 'Secure orders' },
            ].map(({ label, sub }) => (
              <div key={sub}>
                <p className="text-xl font-bold text-gray-800">{label}</p>
                <p className="text-xs text-gray-400">{sub}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right — How it works */}
        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
          <h2 className="text-lg font-semibold text-gray-800">How it works</h2>

          {[
            {
              step: '01',
              title: 'Fill the order form',
              desc: 'Share your name, phone, and what you want — upload a screenshot if needed.',
              color: 'bg-pink-50 text-pink-500',
            },
            {
              step: '02',
              title: 'We contact you on WhatsApp',
              desc: 'Our team confirms the details, size, color, and total price with you directly.',
              color: 'bg-purple-50 text-purple-500',
            },
            {
              step: '03',
              title: 'Your order gets delivered',
              desc: 'We handle everything. You just wait for your look to arrive.',
              color: 'bg-green-50 text-green-500',
            },
          ].map(({ step, title, desc, color }) => (
            <div key={step} className="flex items-start gap-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 ${color}`}>
                {step}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-0.5">{title}</p>
                <p className="text-xs text-gray-400 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}

          <Link href="/order" className="block">
            <Button fullWidth className="mt-2">
              Start your order
              <ArrowRight size={15} />
            </Button>
          </Link>
        </div>
      </section>

      {/* CONTACT STRIP */}
      <section className="bg-white border-t border-gray-100 py-10">
        <div className="max-w-4xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-gray-600 font-medium">Reach us anytime</p>
          <div className="flex flex-wrap gap-4">
            {[
              { icon: <Phone size={15} />, text: '+212 6 XX XX XX XX' },
              { icon: <MapPin size={15} />, text: 'Casablanca, Morocco' },
              { icon: <MessageCircle size={15} />, text: 'Available 24/7 on WhatsApp' },
            ].map(({ icon, text }) => (
              <div key={text} className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-lg text-sm text-gray-600">
                <span className="text-pink-500">{icon}</span>
                {text}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-6 text-center text-xs text-gray-400 border-t border-gray-100">
        © {new Date().getFullYear()} Veloura. All rights reserved.
      </footer>

    </main>
  )
}