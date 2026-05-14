"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Dumbbell, Menu, X } from "lucide-react"
import { useAuth } from "@/lib/auth"

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
        <nav className="xl:grid xl:grid-cols-[1fr_29vw] xl:items-start">
          <div className="flex min-h-24 items-center justify-between bg-transparent px-6 sm:px-10 lg:px-20 xl:px-10 xl:pl-28">
            <Link
              href="/"
              className="flex items-center gap-2 text-white"
              aria-label="RepRoute home"
            >
              <Dumbbell className="size-7" />
              <span className="text-xl font-black">RepRoute</span>
            </Link>

            <div className="hidden items-center gap-8 xl:flex">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-lg font-medium text-white/78 transition-colors hover:text-white"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <MobileMenu hiddenClass="xl:hidden" />
          </div>

          <div className="hidden min-h-24 items-center gap-8 bg-[#fbfbfa] px-10 text-[#171717] xl:flex">
            {user ? (
              <>
                <Link
                  href="/summary"
                  className="text-lg font-medium transition-colors hover:text-[#62615d]"
                >
                  Summary
                </Link>
                <Link
                  href="/dashboard"
                  className="text-lg font-medium transition-colors hover:text-[#62615d]"
                >
                  Dashboard
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-lg font-medium transition-colors hover:text-[#62615d]"
                >
                  Log in
                </Link>
                <Link
                  href="/signup"
                  className="text-lg font-medium transition-colors hover:text-[#62615d]"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
        </nav>
      </header>
    )
  }

  return (
    <header className="sticky top-0 z-[70] border-b border-white/15 bg-[#2f2f2d] text-white">
      <nav className="flex min-h-[72px] items-center justify-between px-6 sm:px-10 lg:px-20 xl:px-28">
        <Link href="/" className="flex items-center gap-2 text-white" aria-label="RepRoute home">
          <Dumbbell className="size-6" />
          <span className="text-lg font-black">RepRoute</span>
        </Link>

        <div className="hidden lg:flex lg:items-center lg:gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-bold transition-colors hover:text-white ${
                pathname.startsWith(link.href) ? "text-white" : "text-white/62"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/summary"
            className={`text-sm font-bold transition-colors hover:text-white ${
              pathname === "/summary" ? "text-white" : "text-white/62"
            }`}
          >
            Summary
          </Link>
        </div>

        <div className="hidden lg:flex lg:items-center lg:gap-4">
          <Link href="/exercises" className="text-sm font-bold text-white/70 hover:text-white">
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

  return (
    <details className={`group ${hiddenClass}`}>
      <summary
        className="relative z-[90] flex size-11 cursor-pointer list-none items-center justify-center text-white [&::-webkit-details-marker]:hidden"
        aria-label="Toggle menu"
      >
        <Menu className="size-7 group-open:hidden" />
        <X className="hidden size-7 group-open:block" />
      </summary>

      <div className="fixed inset-0 z-[80] hidden bg-[#171717]/45 group-open:block" />

      <div className="fixed bottom-0 right-0 top-0 z-[85] w-[min(82vw,360px)] translate-x-full border-l border-white/15 bg-[#2f2f2d] p-6 pt-24 shadow-2xl transition-transform duration-300 ease-out group-open:translate-x-0">
        <div className="grid h-full content-start gap-8">
          <div>
            <p className="max-w-56 text-sm font-semibold leading-relaxed text-white/60">
              Your lifts, your route to progressive overload.
            </p>
          </div>

          <nav className="grid gap-3">
            {[
              ...navLinks,
              ...(user
                ? [
                    { href: "/summary", label: "Summary" },
                    { href: "/exercises", label: "Exercises" },
                  ]
                : [
                    { href: "/login", label: "Log in" },
                    { href: "/signup", label: "Sign up" },
                  ]),
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block py-2 text-sm font-bold text-white/75 transition-colors hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </details>
  )
}
