const effectiveDate = 'May 26, 2026'

const sections = [
  {
    title: 'Acceptance of Terms',
    body: 'By creating an account, accessing, or using RepRoute, you agree to these Terms of Service. If you do not agree, do not use the service.',
  },
  {
    title: 'Eligibility and Accounts',
    body: 'You are responsible for maintaining the confidentiality of your account credentials and for activities that occur under your account. You agree to provide accurate information and to use the service only for lawful purposes.',
  },
  {
    title: 'RepRoute Service',
    body: 'RepRoute helps users build workout plans, log training sessions, view progress history, and receive training-related recommendations based on logged data. The service may change over time, and features may be added, modified, or removed.',
  },
  {
    title: 'Health and Training Disclaimer',
    body: 'RepRoute is an informational fitness tracking tool, not medical advice, diagnosis, or treatment. Training recommendations, progression suggestions, and workout data are provided for general informational purposes only. You are responsible for deciding whether any exercise, weight, or program is appropriate for you.',
  },
  {
    title: 'Acceptable Use',
    body: 'You may not misuse the service, interfere with its operation, attempt unauthorized access, reverse engineer protected parts of the service except where prohibited by law, upload harmful code, or use RepRoute to violate any law or another person’s rights.',
  },
  {
    title: 'Your Content',
    body: 'You retain ownership of the workout plans, exercise entries, and training data you submit. You grant us the rights needed to host, store, process, and display that content solely to operate and improve RepRoute.',
  },
  {
    title: 'Termination',
    body: 'We may suspend or terminate access to RepRoute if you violate these Terms, create risk for the service or other users, or if we discontinue the service. You may stop using RepRoute at any time.',
  },
  {
    title: 'Disclaimers',
    body: 'RepRoute is provided on an "as is" and "as available" basis without warranties of any kind, whether express or implied, to the fullest extent permitted by law. We do not guarantee uninterrupted access, error-free operation, or that recommendations will meet your expectations or goals.',
  },
  {
    title: 'Limitation of Liability',
    body: 'To the fullest extent permitted by law, CloverForge and RepRoute will not be liable for indirect, incidental, special, consequential, exemplary, or punitive damages, or for loss of data, profits, goodwill, or business opportunities arising from or related to your use of the service.',
  },
  {
    title: 'Changes to These Terms',
    body: 'We may update these Terms from time to time. Continued use of RepRoute after updated Terms become effective means you accept the revised Terms.',
  },
]

export const metadata = {
  title: 'Terms of Service | RepRoute',
  description: 'Read the Terms of Service for using RepRoute.',
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#f7f7f3] text-[#171717]">
      <section className="border-b border-[#d9d8d2] bg-[#fbfbfa] px-6 py-10 sm:px-10 sm:py-12 lg:px-20 xl:px-28">
        <div className="mx-auto max-w-3xl">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-[#62615d]">
            Legal
          </p>
          <h1 className="mt-3 text-3xl font-black leading-[0.95] sm:text-6xl">
            Terms of Service
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
                Questions about these Terms can be directed to CloverForge at{' '}
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
