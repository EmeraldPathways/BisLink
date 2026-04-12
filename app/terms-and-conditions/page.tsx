import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Terms and Conditions | BisLink',
  description: 'Terms and conditions for BisLink.'
};

const sections = [
  {
    title: 'Use of the Service',
    body: [
      'BisLink provides booking, payment, customer management, and related business tools for service-based businesses. By using the service, you agree to use it only for lawful business purposes and in compliance with applicable regulations.',
      'You are responsible for all content, customer data, integrations, and business information submitted through your account.'
    ]
  },
  {
    title: 'Accounts and Access',
    body: [
      'You are responsible for maintaining the confidentiality of your login credentials and for all activity that occurs under your account.',
      'We may suspend or restrict access if we detect abuse, fraud, security issues, or violations of these terms.'
    ]
  },
  {
    title: 'Payments and Third-Party Services',
    body: [
      'Payment processing, calendar connectivity, email delivery, hosting, and data infrastructure may rely on third-party providers. Your use of those connected services may also be subject to their separate terms and policies.',
      'BisLink is not responsible for outages, delays, or policy decisions made by third-party providers.'
    ]
  },
  {
    title: 'Customer Data and Compliance',
    body: [
      'You are responsible for obtaining any permissions, notices, and consents required to collect, use, and communicate with your customers.',
      'You agree not to use the service in a way that violates privacy, consumer protection, payment, or anti-spam laws.'
    ]
  },
  {
    title: 'Disclaimers and Liability',
    body: [
      'The service is provided on an as-is and as-available basis without warranties of any kind, except where such disclaimers are not permitted by law.',
      'To the maximum extent permitted by law, BisLink will not be liable for indirect, incidental, special, consequential, or punitive damages, or for loss of revenue, profits, data, or goodwill.'
    ]
  },
  {
    title: 'Changes to These Terms',
    body: [
      'We may update these terms from time to time. Continued use of the service after an update becomes effective constitutes acceptance of the revised terms.'
    ]
  },
  {
    title: 'Contact',
    body: [
      'For questions about these terms, contact goemeraldpathways@gmail.com.'
    ]
  }
];

export default function TermsAndConditionsPage() {
  return (
    <main className="min-h-screen bg-[var(--color-bg)] px-6 py-10 md:px-10 md:py-14">
      <div className="mx-auto max-w-4xl">
        <div className="rounded-[30px] border border-[var(--color-border-dark)] bg-[var(--color-void)] px-6 py-10 text-[var(--color-text-hero)] shadow-[0_30px_80px_rgba(0,0,0,0.18)] md:px-10">
          <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-[var(--color-gold)]">BisLink Legal</p>
          <h1 className="mt-3 font-display text-5xl tracking-[-1px] md:text-6xl">Terms and Conditions</h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--color-text-hero-2)] md:text-base">
            These terms govern access to and use of the BisLink platform by business owners, operators, and connected users.
          </p>
        </div>

        <div className="mt-8 rounded-[30px] border border-[var(--color-border)] bg-white p-6 shadow-[0_10px_30px_rgba(0,0,0,0.04)] md:p-10">
          <div className="space-y-8">
            {sections.map((section) => (
              <section key={section.title}>
                <h2 className="font-display text-3xl text-[var(--color-text-primary)]">{section.title}</h2>
                <div className="mt-3 space-y-4 text-sm leading-7 text-[var(--color-text-secondary)] md:text-[15px]">
                  {section.body.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </section>
            ))}
          </div>

          <div className="mt-10 border-t border-[var(--color-border)] pt-6 text-sm text-[var(--color-text-secondary)]">
            <p>Last updated: April 12, 2026</p>
            <p className="mt-3">
              <Link href="/privacy-policy" className="font-medium text-[var(--color-gold-dark)]">
                View Privacy Policy
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
