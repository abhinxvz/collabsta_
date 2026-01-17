'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Package,
  Image,
  ShoppingCart,
  Settings,
  Search,
  Heart,
  Receipt,
} from 'lucide-react'

const influencerLinks = [
  { href: '/dashboard/influencer', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/influencer/services', label: 'Services', icon: Package },
  { href: '/dashboard/influencer/portfolio', label: 'Portfolio', icon: Image },
  { href: '/dashboard/influencer/orders', label: 'Orders', icon: ShoppingCart },
  { href: '/dashboard/influencer/settings', label: 'Settings', icon: Settings },
]

const brandLinks = [
  { href: '/dashboard/brand', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/brand/explore', label: 'Explore', icon: Search },
  { href: '/dashboard/brand/orders', label: 'Orders', icon: ShoppingCart },
  { href: '/dashboard/brand/saved', label: 'Saved', icon: Heart },
  { href: '/dashboard/brand/billing', label: 'Billing', icon: Receipt },
]

interface SidebarProps {
  role: 'influencer' | 'brand'
}

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname()
  const links = role === 'influencer' ? influencerLinks : brandLinks

  return (
    <aside className="w-64 border-r border-zinc-800 bg-[#0a0a0b]/80 backdrop-blur-sm min-h-[calc(100vh-4rem)] p-4">
      <nav className="space-y-1">
        {links.map((link) => {
          const Icon = link.icon
          const isActive = pathname === link.href
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                isActive
                  ? 'bg-purple-500/20 text-purple-300'
                  : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
              )}
            >
              <Icon className="h-5 w-5" />
              {link.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
