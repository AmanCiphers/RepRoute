const effectiveDate = 'May 26, 2026'

const sections = [
  {
    title: 'What This Policy Covers',
    body: 'This Privacy Policy explains how RepRoute collects, uses, stores, and shares information when you use the RepRoute website and app experience.',
  },
  {
    title: 'Information We Collect',
    body: 'We collect the information you provide directly to us, including your email address, login credentials handled through our authentication provider, exercise library entries, workout plans, workout days, logged sets, weights, reps, progress history, and any information you submit when contacting us.',
  },
  {
    title: 'Information Collected Automatically',
    body: 'We and our service providers may automatically collect limited technical information needed to operate the service, such as browser type, device information, IP address, approximate location derived from IP, pages visited, request metadata, and authentication/session data stored in browser storage or cookies.',
  },
  {
    title: 'How We Use Information',
    body: 'We use information to create and maintain your account, save your workouts, generate overload suggestions, display charts and summaries, secure the service, troubleshoot issues, comply with legal obligations, and improve the product.',
  },
  {
    title: 'How We Share Information',
    body: 'We do not sell your personal information. We may share information with service providers that help us run RepRoute, including hosting, infrastructure, authentication, and database vendors. We may also share information if required by law, to protect rights or safety, or as part of a merger, acquisition, financing, or sale of assets.',
  },
  {
    title: 'Data Storage and Security',
    body: 'We use reasonable administrative, technical, and organizational measures to protect information. No method of transmission or storage is completely secure, so we cannot guarantee absolute security.',
  },
  {
    title: 'Your Choices',
    body: 'You can update some information inside the app by editing workouts, exercises, and sessions. You may also stop using the service at any time. If you want to request account or data deletion, contact us through CloverForge and we will review your request in accordance with applicable law.',
  },
  {
    title: 'Children’s Privacy',
    body: 'RepRoute is not directed to children under 13, and we do not knowingly collect personal information from children under 13.',
  },
  {
    title: 'Changes to This Policy',
    body: 'We may update this Privacy Policy from time to time. If we make material changes, we may update the effective date and provide additional notice when appropriate.',
  },
]

export const metadata = {
  title: 'Privacy Policy | RepRoute',
  description: 'Read how RepRoute collects, uses, and protects your information.',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#f7f7f3] text-[#171717]">
      <section className="border-b border-[#d9d8d2] bg-[#fbfbfa] px-6 py-10 sm:px-10 sm:py-12 lg:px-20 xl:px-28">
        <div className="mx-auto max-w-3xl">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-[#62615d]">
            Legal
          </p>
          <h1 className="mt-3 text-3xl font-black leading-[0.95] sm:text-6xl">
            Privacy Policy
          </h1>
          <p className="mt-4 max-w-2xl text-base font-semibold leading-snug text-[#55544f] sm:text-lg">
            Effective date: {effectiveDate}
          </p>
        </div>
      </section>

      <section className="px-6 py-8 sm:px-10 sm:py-10 lg:px-20 xl:px-28">
        <div className="mx-auto max-w-3xl rounded-md border border-[#d9d8d2] bg-[#fbfbfa] p-6 sm:p-8">
          <div className="space-y-8">
            {sections.map((section) => (
              <div key={section.title}>
                <h2 className="text-xl font-black text-[#171717] sm:text-2xl">
                  {section.title}
                </h2>
                <p className="mt-3 text-sm font-semibold leading-7 text-[#55544f] sm:text-base">
                  {section.body}
                </p>
              </div>
            ))}

            <div>
              <h2 className="text-xl font-black text-[#171717] sm:text-2xl">
                Contact
              </h2>
              <p className="mt-3 text-sm font-semibold leading-7 text-[#55544f] sm:text-base">
                For privacy questions or requests, contact CloverForge at{' '}
                <a
                  href="https://cloverforge.vercel.app/"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#171717] underline underline-offset-4"
                >
                  cloverforge.vercel.app
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
