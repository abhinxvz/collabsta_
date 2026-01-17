'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Navbar,
  NavBody,
  NavItems,
  MobileNav,
  MobileNavHeader,
  MobileNavMenu,
  MobileNavToggle,
} from '@/components/ui/resizable-navbar'
import { ShimmerButton } from '@/components/ui/shimmer-button'
import { useAuthStore } from '@/store/auth'
import { createClient } from '@/lib/supabase/client'
import { SignOut, User, SquaresFour } from '@phosphor-icons/react'

const navItems: { name: string; link: string }[] = []

export function NavbarComponent() {
  const { user } = useAuthStore()
  const router = useRouter()
  const supabase = createClient()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <Navbar className="top-0">
      {/* Desktop Navigation */}
      <NavBody className="bg-[#09090b]/80 border border-zinc-800/50">
        <Link href="/" className="relative z-20 flex items-center gap-2 px-2 py-1">
          <img src="/collabsta24.png" alt="Collabsta" className="w-8 h-8 rounded-lg" />
          <span className="font-bold text-xl text-white">Collabsta</span>
        </Link>

        <NavItems items={navItems} className="text-zinc-400" />

        <div className="relative z-20 flex items-center gap-4">
                    {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10 border-2 border-purple-500/50">
                    <AvatarImage src={user.avatar_url || ''} alt={user.name} />
                    <AvatarFallback className="bg-purple-500/20 text-purple-300">
                      {user.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-zinc-900 border-zinc-800" align="end">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium text-white">{user.name}</p>
                  <p className="text-xs text-zinc-500">@{user.username}</p>
                </div>
                <DropdownMenuSeparator className="bg-zinc-800" />
                                <DropdownMenuItem asChild className="text-zinc-300 focus:bg-zinc-800 focus:text-white">
                  <Link href={`/dashboard/${user.role}`} className="cursor-pointer">
                    <SquaresFour className="mr-2 h-4 w-4" weight="duotone" />
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                {user.role === 'influencer' && (
                  <DropdownMenuItem asChild className="text-zinc-300 focus:bg-zinc-800 focus:text-white">
                    <Link href={`/${user.username}`} className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" weight="duotone" />
                      My Store
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator className="bg-zinc-800" />
                <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-red-400 focus:bg-zinc-800 focus:text-red-400">
                  <SignOut className="mr-2 h-4 w-4" weight="duotone" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link href="/auth/login" className="text-zinc-300 hover:text-white text-sm font-medium transition-colors">
                Login
              </Link>
              <ShimmerButton href="/auth/signup">
                Get Started
              </ShimmerButton>
            </>
          )}
        </div>
      </NavBody>

      {/* Mobile Navigation */}
      <MobileNav className="bg-[#09090b]/80 border border-zinc-800/50">
        <MobileNavHeader>
          <Link href="/" className="flex items-center gap-2">
            <img src="/collabsta24.png" alt="Collabsta" className="w-8 h-8 rounded-lg" />
            <span className="font-bold text-xl text-white">Collabsta</span>
          </Link>
          <MobileNavToggle isOpen={isMobileMenuOpen} onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />
        </MobileNavHeader>

        <MobileNavMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} className="bg-zinc-900 border border-zinc-800">
          {navItems.map((item, idx) => (
            <a
              key={idx}
              href={item.link}
              onClick={() => setIsMobileMenuOpen(false)}
              className="w-full text-zinc-300 hover:text-white py-2"
            >
              {item.name}
            </a>
          ))}
          <div className="flex flex-col gap-2 w-full pt-4 border-t border-zinc-800">
            {user ? (
              <>
                <Link href={`/dashboard/${user.role}`} className="text-zinc-300 hover:text-white py-2">
                  Dashboard
                </Link>
                {user.role === 'influencer' && (
                  <Link href={`/${user.username}`} className="text-zinc-300 hover:text-white py-2">
                    My Store
                  </Link>
                )}
                <button onClick={handleSignOut} className="text-red-400 hover:text-red-300 py-2 text-left">
                  Sign out
                </button>
              </>
                        ) : (
              <>
                <Link href="/auth/login" className="w-full text-zinc-300 hover:text-white py-2">
                  Login
                </Link>
                <ShimmerButton href="/auth/signup" className="w-full">
                  Get Started
                </ShimmerButton>
              </>
            )}
          </div>
        </MobileNavMenu>
      </MobileNav>
    </Navbar>
  )
}

// Keep the old export name for backwards compatibility
export { NavbarComponent as Navbar }
