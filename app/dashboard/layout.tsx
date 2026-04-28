'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  LayoutDashboard, Users, ShoppingBag, Settings,
  LogOut, Menu, X, ChevronRight,
  Sparkles
} from 'lucide-react'

const NAV = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/clients', label: 'Clients', icon: Users },
  { href: '/dashboard/orders', label: 'Orders', icon: ShoppingBag },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/admin-login')
  }

  return (
    <div className="flex h-screen bg-[#f8f7ff] font-sans overflow-hidden">

      {/* SIDEBAR */}
      <aside className={`${sidebarOpen ? 'w-56' : 'w-16'} transition-all duration-300 bg-white border-r border-gray-100 flex flex-col shadow-sm shrink-0`}>

        {/* Logo */}
        <div className="h-16 flex items-center px-4 border-b border-gray-100 gap-3">
          <div className="w-8 h-8 bg-pink-500 rounded-lg flex items-center justify-center shrink-0">
            <Sparkles size={16} className="text-white" />
          </div>
          {sidebarOpen && (
            <span className="font-semibold text-gray-800 text-sm">Veloura</span>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-2 space-y-1">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname === href
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all group
                  ${active
                    ? 'bg-pink-50 text-pink-600 font-medium'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
                  }`}
              >
                <Icon size={18} className="shrink-0" />
                {sidebarOpen && <span>{label}</span>}
                {sidebarOpen && active && (
                  <ChevronRight size={14} className="ml-auto text-pink-400" />
                )}
              </Link>
            )
          })}
        </nav>

        {/* Logout */}
        <div className="p-2 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all w-full"
          >
            <LogOut size={18} className="shrink-0" />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* TOP BAR */}
        <header className="h-16 bg-white border-b border-gray-100 flex items-center px-6 gap-4 shrink-0">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <div className="flex-1" />

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center">
              <span className="text-pink-600 text-xs font-semibold">A</span>
            </div>
            <span className="text-sm text-gray-600 font-medium">Admin</span>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}