import { Suspense } from 'react'
import OrdersPage from './OrdersPage'

export default function Page() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-gray-400">Loading orders...</div>}>
      <OrdersPage />
    </Suspense>
  )
}