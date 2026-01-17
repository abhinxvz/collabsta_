'use client'

import { cn } from '@/lib/utils'
import Link from 'next/link'

interface ShimmerButtonProps {
  children: React.ReactNode
  className?: string
  href?: string
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
  showArrow?: boolean
}

export function ShimmerButton({
  children,
  className,
  href,
  onClick,
  type = 'button',
  disabled = false,
  showArrow = true,
}: ShimmerButtonProps) {
  const content = (
    <>
      <span className="absolute inset-0 overflow-hidden rounded-full">
        <span className="absolute inset-0 rounded-full bg-[image:radial-gradient(75%_100%_at_50%_0%,rgba(168,85,247,0.6)_0%,rgba(168,85,247,0)_75%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      </span>
                  <div className="relative flex space-x-2 items-center z-10 rounded-full bg-zinc-950 py-2 px-5 ring-1 ring-white/10 justify-center">
        <span className="flex items-center gap-2">{children}</span>
        {showArrow && (
          <svg
            fill="none"
            height="16"
            viewBox="0 0 24 24"
            width="16"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M10.75 8.75L14.25 12L10.75 15.25"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
            />
          </svg>
        )}
      </div>
      <span className="absolute -bottom-0 left-[1.125rem] h-px w-[calc(100%-2.25rem)] bg-gradient-to-r from-purple-500/0 via-purple-500/90 to-purple-500/0 transition-opacity duration-500 group-hover:opacity-40" />
    </>
  )

  const baseClasses = cn(
    'bg-slate-800 no-underline group cursor-pointer relative shadow-2xl shadow-zinc-900 rounded-full p-px text-sm font-semibold leading-6 text-white inline-block',
    disabled && 'opacity-50 cursor-not-allowed',
    className
  )

  if (href) {
    return (
      <Link href={href} className={baseClasses}>
        {content}
      </Link>
    )
  }

  return (
    <button type={type} onClick={onClick} disabled={disabled} className={baseClasses}>
      {content}
    </button>
  )
}
