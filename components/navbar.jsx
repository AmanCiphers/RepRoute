"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Dumbbell, Menu, X, Route } from "lucide-react"
import { useAuth } from "@/lib/auth"
import { useEffect, useCallback, useRef, useState } from "react"

const navLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/plans", label: "Plans" },
  { href: "/log", label: "Log" },
  { href: "/progress", label: "Progress" },
]

export function Navbar() {
  const pathname = usePathname()
  const { user } = useAuth()
  const isHome = pathname === "/"

  if (isHome) {
    return (
      <header className="absolute inset-x-0 top-0 z-[70]">
        <nav className="mx-auto flex min-h-24 max-w-7xl items-center justify-between px-6 sm:px-10 lg:px-20 xl:px-28">
          <Link
            href="/"
            className="flex items-center gap-2 text-white"
            aria-label="RepRoute home"
          >
            <Dumbbell className="size-7" />
            <span className="text-xl font-black">RepRoute</span>
          </Link>

          <div className="hidden items-center gap-8 lg:flex">
            {user ? (
              <>
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-sm font-bold text-white/65 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                ))}
                <Link
                  href="/summary"
                  className="text-sm font-bold text-white/65 transition-colors hover:text-white"
                >
                  Summary
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-bold text-white/65 transition-colors hover:text-white"
                >
                  Log in
                </Link>
                <Link
                  href="/signup"
                  className="rounded-md border border-white/20 px-4 py-1.5 text-sm font-bold text-white transition hover:bg-white/10"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>

          <MobileMenu hiddenClass="lg:hidden" />
        </nav>
      </header>
    )
  }

  return (
    <header className="sticky top-0 z-[70] border-b border-white/10 bg-[#2f2f2d] text-white">
      <nav className="mx-auto flex min-h-[68px] max-w-7xl items-center justify-between px-6 sm:px-10 lg:px-20 xl:px-28">
        <Link href="/" className="flex items-center gap-2 text-white" aria-label="RepRoute home">
          <Dumbbell className="size-6" />
          <span className="text-lg font-black">RepRoute</span>
        </Link>

        <div className="hidden items-center gap-6 lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-bold transition-colors hover:text-white ${
                pathname.startsWith(link.href) ? "text-white" : "text-white/55"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/summary"
            className={`text-sm font-bold transition-colors hover:text-white ${
              pathname === "/summary" ? "text-white" : "text-white/55"
            }`}
          >
            Summary
          </Link>
          <Link
            href="/exercises"
            className={`text-sm font-bold transition-colors hover:text-white ${
              pathname === "/exercises" ? "text-white" : "text-white/55"
            }`}
          >
            Exercises
          </Link>
        </div>

        <MobileMenu hiddenClass="lg:hidden" />
      </nav>
    </header>
  )
}

function MobileMenu({ hiddenClass }) {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const panelRef = useRef(null)
  const triggerRef = useRef(null)
  const pathname = usePathname()

  const close = useCallback(() => setOpen(false), [])

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [open])

  useEffect(() => {
    close()
  }, [pathname, close])

  useEffect(() => {
    if (!open) return
    const handler = (e) => {
      if (e.key === "Escape") close()
    }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [open, close])

  const links = user
    ? [
        ...navLinks,
        { href: "/summary", label: "Summary" },
        { href: "/exercises", label: "Exercises" },
      ]
    : [
        { href: "/login", label: "Log in" },
        { href: "/signup", label: "Sign up" },
      ]

  return (
    <div className={hiddenClass}>
      <button
        ref={triggerRef}
        onClick={() => setOpen((v) => !v)}
        className="relative z-[90] flex size-11 cursor-pointer items-center justify-center text-white"
        aria-label={open ? "Close menu" : "Open menu"}
      >
        {open ? <X className="size-7" /> : <Menu className="size-7" />}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[80] bg-[#171717]/60 backdrop-blur-sm"
          onClick={close}
        />
      )}

      <div
        ref={panelRef}
        className={`fixed bottom-0 right-0 top-0 z-[85] w-[min(80vw,320px)] border-l border-white/10 bg-[#2f2f2d] p-6 pt-20 shadow-2xl transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="mb-6 flex items-center gap-2 border-b border-white/10 pb-6">
            <Route className="size-5 text-white/40" />
            <span className="text-sm font-semibold text-white/40">Navigation</span>
          </div>

          <nav className="flex flex-col gap-1">
            {links.map((link) => {
              const active = link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href)
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={close}
                  className={`rounded-md px-4 py-3 text-base font-bold transition-colors ${
                    active
                      ? "bg-white/10 text-white"
                      : "text-white/65 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  {link.label}
                </Link>
              )
            })}
          </nav>

          <div className="mt-auto border-t border-white/10 pt-6">
            <p className="text-sm font-semibold text-white/30">
              RepRoute — every rep has a next step
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
