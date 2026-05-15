import Link from "next/link"
import { Dumbbell } from "lucide-react"

const footerLinks = {
  Product: [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/plans", label: "Plans" },
    { href: "/log", label: "Log" },
  ],
  Resources: [
    { href: "/exercises", label: "Exercises" },
    { href: "#", label: "Progressive Overload Guide" },
  ],
  Legal: [
    { href: "#", label: "Privacy Policy" },
    { href: "#", label: "Terms of Service" },
  ],
}

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-[#d9d8d2] bg-[#2f2f2d] text-white">
      <div className="pointer-events-none absolute -bottom-10 -right-10 select-none opacity-[0.04]">
        <img src="/white_clover.svg" alt="" className="h-auto scale-200 w-auto sm:h-96" />
      </div>
      <div className="px-6 py-12 sm:px-10 lg:px-20 xl:px-28">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Link href="/" className="inline-flex items-center gap-2" aria-label="RepRoute home">
              <Dumbbell className="size-6" />
              <span className="text-xl font-black">RepRoute</span>
              <span>x</span>
              <img src="/white_clover.svg" alt="" className="h-8 w-auto" />
            </Link>
            <p className="mt-5 max-w-sm text-sm font-semibold leading-relaxed text-white/65">
              Track your lifts, build custom plans, and let progressive overload guide every session.
            </p>
          </div>

          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="text-sm font-black uppercase tracking-[0.14em] text-white">
                {title}
              </h3>
              <ul className="mt-4 space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm font-semibold text-white/60 transition-colors hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 border-t border-white/15 pt-8">
          <p className="text-sm font-semibold text-white/50">
            {new Date().getFullYear()} RepRoute — A <span className="font-bold underline"><a target="_blank" href="https://cloverforge.vercel.app/">CloverForge</a></span> product. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
