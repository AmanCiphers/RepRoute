import Link from "next/link"
import { ArrowRight, Dumbbell, Route, TrendingUp, ClipboardList, BarChart3, Target, Zap, Repeat } from "lucide-react"

const steps = [
  {
    icon: ClipboardList,
    title: "Build Your Plan",
    desc: "Choose a template or build your own. Pick exercises, set targets, and define the path.",
  },
  {
    icon: Dumbbell,
    title: "Log Your Sets",
    desc: "Pick a date, run your plan, and log every set. Reps, weight — everything in one place.",
  },
  {
    icon: TrendingUp,
    title: "Get Your Next Weight",
    desc: "RepRoute calculates exactly what to lift next using double progression. No guesswork.",
  },
  {
    icon: BarChart3,
    title: "Watch Progress",
    desc: "Volume and estimated 1RM graphs show the climb. Every session moves the line up.",
  },
]

const features = [
  {
    icon: Zap,
    title: "Progressive Overload Engine",
    desc: "Hit your rep target, and next session automatically recommends the next weight up. Double progression, no math.",
  },
  {
    icon: Target,
    title: "Any Split, Any Plan",
    desc: "PPL, Upper/Lower, Full Body, Bro Split — or create your own. Add exercises with target sets and reps.",
  },
  {
    icon: BarChart3,
    title: "Volume & 1RM Charts",
    desc: "Estimated one-rep max and total volume over time. Watch the trend lines climb session by session.",
  },
  {
    icon: Repeat,
    title: "Past Session Log",
    desc: "Every logged session is saved. Review, edit sets inline, and see exactly how far you've come.",
  },
]

export default function HomePage() {
  return (
    <div className="bg-[#f7f7f3] text-[#171717]">

      {/* ───── HERO ───── */}
      <section className="relative bg-[#2f2f2d] px-6 pb-32 pt-32 sm:px-10 sm:pb-36 sm:pt-36 lg:px-20 lg:pb-44 lg:pt-44 xl:px-28">
        <div className="relative z-10 mx-auto max-w-4xl text-center">
          <div className="mx-auto mb-8 flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-2 text-sm font-semibold text-white/60">
            <Route className="size-3.5" />
            Intelligent progressive overload
          </div>
          <h1 className="text-5xl font-black leading-[1.05] text-white sm:text-7xl lg:text-8xl">
            Know exactly
            <br />
            <span className="bg-gradient-to-r from-white via-white/85 to-white/50 bg-clip-text text-transparent">
              what to lift next
            </span>
          </h1>
          <p className="mx-auto mt-8 max-w-lg text-base font-semibold leading-relaxed text-white/55 sm:text-lg sm:leading-relaxed">
            Log your sets. RepRoute calculates the perfect next weight.
            A clear route from where you are to where you&apos;re going.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/signup"
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-md bg-white px-8 text-sm font-bold text-[#2f2f2d] transition hover:bg-white/90 sm:w-auto"
            >
              Start tracking free
              <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/login"
              className="inline-flex h-12 w-full items-center justify-center rounded-md border border-white/15 px-8 text-sm font-semibold text-white/60 transition hover:border-white/30 hover:text-white sm:w-auto"
            >
              I have an account
            </Link>
          </div>
        </div>

        {/* decorative ascent line */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-center overflow-hidden">
          <svg
            viewBox="0 0 1200 160"
            fill="none"
            className="w-full max-w-5xl opacity-[0.04]"
            preserveAspectRatio="none"
          >
            <path
              d="M0 140 Q 150 120, 300 100 T 600 60 T 900 80 T 1200 40"
              stroke="white"
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
            />
            <circle cx="300" cy="100" r="3" fill="white" />
            <circle cx="600" cy="60" r="3" fill="white" />
            <circle cx="900" cy="80" r="3" fill="white" />
            <circle cx="1200" cy="40" r="3" fill="white" />
            <path
              d="M0 140 Q 150 120, 300 100 T 600 60 T 900 80 T 1200 40"
              stroke="url(#glow)"
              strokeWidth="4"
              vectorEffect="non-scaling-stroke"
            />
            <defs>
              <linearGradient id="glow" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="white" stopOpacity="0" />
                <stop offset="50%" stopColor="white" stopOpacity="0.3" />
                <stop offset="100%" stopColor="white" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </section>

      {/* ───── HOW IT WORKS ───── */}
      <section className="border-b border-[#d9d8d2] bg-[#fbfbfa] px-6 py-16 sm:px-10 sm:py-20 lg:px-20 xl:px-28">
        <div className="mx-auto max-w-5xl">
          <div className="text-center">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#62615d]">The Route</p>
            <h2 className="mt-3 text-2xl font-black leading-[1.05] text-[#171717] sm:text-4xl">
              Plan. Log. Progress. Repeat.
            </h2>
          </div>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, i) => (
              <div key={step.title} className="relative flex flex-col items-center text-center">
                <div className="flex size-14 items-center justify-center rounded-full bg-[#2f2f2d] text-white shadow-sm">
                  <step.icon className="size-6" />
                </div>
                <span className="mt-2 text-xs font-bold tracking-wider text-[#62615d]">
                  0{i + 1}
                </span>
                <h3 className="mt-1 text-lg font-black text-[#171717]">{step.title}</h3>
                <p className="mt-1 max-w-xs text-sm font-medium leading-relaxed text-[#55544f]">
                  {step.desc}
                </p>
                {i < steps.length - 1 && (
                  <div className="mt-4 hidden h-px w-8 bg-[#d9d8d2] lg:block" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───── FEATURES ───── */}
      <section className="bg-[#f7f7f3] px-6 py-16 sm:px-10 sm:py-20 lg:px-20 xl:px-28">
        <div className="mx-auto max-w-5xl">
          <div className="text-center">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#62615d]">Features</p>
            <h2 className="mt-3 text-2xl font-black leading-[1.05] text-[#171717] sm:text-4xl">
              Built for the climb
            </h2>
          </div>
          <div className="mt-12 grid gap-4 sm:grid-cols-2">
            {features.map((f) => (
              <div
                key={f.title}
                className="group rounded-lg border border-[#d9d8d2] bg-white p-5 transition hover:border-[#2f2f2d]/20 sm:p-6"
              >
                <div className="flex size-11 items-center justify-center rounded-full bg-[#2f2f2d] text-white">
                  <f.icon className="size-5" />
                </div>
                <h3 className="mt-4 text-lg font-black text-[#171717]">{f.title}</h3>
                <p className="mt-1 text-sm font-medium leading-relaxed text-[#55544f]">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───── STATS BAR ───── */}
      <section className="border-y border-[#d9d8d2] bg-[#2f2f2d] px-6 py-14 sm:px-10 lg:px-20 xl:px-28">
        <div className="mx-auto grid max-w-4xl grid-cols-2 gap-8 text-center sm:grid-cols-4">
          {[
            { value: "10K+", label: "Sets logged" },
            { value: "50+", label: "Exercises" },
            { value: "4", label: "Built-in templates" },
            { value: "100%", label: "Free" },
          ].map((s) => (
            <div key={s.label}>
              <p className="text-3xl font-black text-white sm:text-4xl">{s.value}</p>
              <p className="mt-1 text-sm font-semibold text-white/45">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ───── CTA ───── */}
      <section className="bg-[#f7f7f3] px-6 py-20 sm:px-10 sm:py-28 lg:px-20 xl:px-28">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-[#2f2f2d] text-white shadow-sm">
            <Route className="size-6" />
          </div>
          <h2 className="mt-6 text-3xl font-black leading-[1.05] text-[#171717] sm:text-5xl">
            Your route is waiting
          </h2>
          <p className="mt-4 text-base font-semibold leading-relaxed text-[#55544f] sm:text-lg">
            No spreadsheets. No apps that forget your last set. Just your plan, your log, and the
            next weight waiting to fall.
          </p>
          <Link
            href="/signup"
            className="mt-8 inline-flex h-12 w-full items-center justify-center gap-2 rounded-md bg-[#2f2f2d] px-8 text-sm font-bold text-white transition hover:bg-[#171717] sm:w-auto"
          >
            Start your free account
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>
    </div>
  )
}
