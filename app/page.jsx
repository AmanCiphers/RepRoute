import Link from "next/link"
import { ArrowRight, BarChart3, Calendar, Dumbbell, Route, Zap } from "lucide-react"

const features = [
  {
    icon: Dumbbell,
    title: "Custom Workout Plans",
    desc: "Build any split — Push/Pull/Legs, PPL, or your own. Add exercises with target sets and reps.",
  },
  {
    icon: Calendar,
    title: "Calendar Logging",
    desc: "Pick a date, select your plan, and log every set. Reps, weight, RPE — you control the detail.",
  },
  {
    icon: Zap,
    title: "Progressive Overload Engine",
    desc: "Next session shows you exactly how much weight or reps to add for safe, consistent progress.",
  },
  {
    icon: BarChart3,
    title: "Volume & Strength Trends",
    desc: "Watch your estimated 1RM and total volume climb over weeks and months.",
  },
]

export default function HomePage() {
  return (
    <div className="bg-[#f7f7f3] text-[#171717]">
      <section className="grid min-h-[100svh] grid-cols-1 lg:grid-cols-[1fr_29vw]">
        <div className="flex bg-[#2f2f2d] px-6 pb-12 pt-28 text-white sm:px-10 sm:pb-16 lg:min-h-[90svh] lg:px-20 lg:pb-20 lg:pt-36 xl:px-28">
          <div className="flex w-full max-w-3xl flex-col justify-center">
            <div className="flex items-center gap-2 text-sm font-bold text-white/80">
              <Route className="size-4" />
              Intelligent progressive overload
            </div>
            <h1 className="mt-4 max-w-4xl text-4xl font-black leading-[0.95] tracking-normal text-white sm:text-6xl lg:text-7xl">
              Every rep has a<br />next step
            </h1>

            <p className="mt-5 max-w-xl text-base font-semibold leading-snug text-white/85 sm:mt-10 sm:text-xl">
              RepRoute turns your workout plans into a guided path. Log your sets, and it tells you
              exactly how much to lift next time for steady progressive overload.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:mt-12 sm:flex-row">
              <Link
                href="/signup"
                className="inline-flex h-12 w-full items-center justify-center rounded-md border border-white/70 px-8 text-sm font-semibold text-white transition hover:bg-white hover:text-[#2f2f2d] sm:h-11 sm:w-fit"
              >
                Start tracking free
              </Link>
              <Link
                href="/login"
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-md bg-white/10 px-5 text-sm font-semibold text-white transition hover:bg-white/15 sm:h-11 sm:w-fit sm:bg-transparent sm:px-2 sm:text-white/85 sm:hover:text-white"
              >
                I have an account
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        </div>

        <div className="relative flex items-center justify-center border-b border-[#d9d8d2] bg-[#fbfbfa] px-6 py-10 sm:px-8 sm:py-14 lg:min-h-[90svh] lg:border-b-0 lg:px-10 lg:py-16">
          <div className="flex flex-col items-center gap-6 text-center">
            <Dumbbell className="size-16 text-[#171717]/20 sm:size-20" />
            <p className="text-base font-black text-[#62615d] sm:text-lg">Track. Progress. Repeat.</p>
          </div>
        </div>
      </section>

      <section className="border-y border-[#d9d8d2] bg-[#fbfbfa] px-6 py-12 sm:px-10 sm:py-16 lg:px-20 xl:px-28">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start lg:gap-12">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#62615d]">
              Features
            </p>
            <h2 className="mt-4 max-w-xl text-2xl font-black leading-[1.05] tracking-normal text-[#171717] sm:text-5xl">
              Built for lifters who want to progress
            </h2>
          </div>

          <div className="grid gap-3">
            {features.map((feature) => (
              <div key={feature.title} className="group grid gap-4 rounded-md border border-[#d9d8d2] bg-white p-4 sm:p-5">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#2f2f2d] text-white">
                    <feature.icon className="size-5" />
                  </div>
                  <h3 className="text-lg font-black text-[#171717] sm:text-xl">{feature.title}</h3>
                </div>
                <p className="text-sm font-semibold leading-relaxed text-[#55544f]">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#f7f7f3] px-6 py-14 sm:px-10 sm:py-20 lg:px-20 xl:px-28">
        <div className="mx-auto max-w-2xl text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-[#2f2f2d] text-white mx-auto">
            <Dumbbell className="size-5" />
          </div>
          <h2 className="mt-5 text-2xl font-black leading-[1.05] text-[#171717] sm:mt-6 sm:text-5xl">
            Stop guessing. Start progressing.
          </h2>
          <p className="mt-4 text-base font-semibold leading-snug text-[#55544f] sm:text-lg">
            No spreadsheets, no guesswork. Just your plan, your log, and the next weight waiting to fall.
          </p>
          <Link
            href="/signup"
            className="mt-8 inline-flex h-12 w-full items-center justify-center gap-2 rounded-md bg-[#2f2f2d] px-8 text-sm font-black text-white transition hover:bg-[#171717] sm:h-11 sm:w-fit"
          >
            Get started
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>
    </div>
  )
}
