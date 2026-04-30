import Link from 'next/link'
import Button from './components/ui/Button'

export default function NotFound() {
  return (
    <main className="min-h-screen bg-pink-50 flex items-center justify-center px-4">
      <div className="text-center">
        <p className="text-7xl font-bold text-pink-200 mb-4">404</p>
        <h1 className="text-xl font-semibold text-gray-800 mb-2">Page not found</h1>
        <p className="text-gray-400 text-sm mb-8">The page you're looking for doesn't exist.</p>
        <Link href="/">
          <Button variant="ghost">Go home</Button>
        </Link>
      </div>
    </main>
  )
}