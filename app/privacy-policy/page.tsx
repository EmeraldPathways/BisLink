import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy | BisLink',
  description: 'Privacy policy for BisLink.'
};

const sections = [
  {
    title: 'Information We Collect',
    body: [
      'We collect the information needed to operate booking, payment, customer communication, and calendar features. This may include contact details, appointment details, payment metadata, and business profile information.',
      'When a business connects third-party services such as Stripe, Supabase, Google Calendar, or email delivery providers, we process the minimum information required to complete those workflows.'
    ]
  },
  {
    title: 'How We Use Information',
    body: [
      'We use collected information to provide scheduling, payment processing, reminders, follow-ups, customer management, and account administration.',
      'We may also use operational data to secure the service, troubleshoot issues, prevent abuse, and improve product performance.'
    ]
  },
  {
    title: 'Sharing of Information',
    body: [
      'We do not sell personal information. We share data only with service providers and infrastructure partners required to run the platform, such as payment processors, database providers, cloud hosting providers, and communication tools.',
      'We may disclose information when required by law, to enforce our terms, or to protect the security of the service and its users.'
    ]
  },
  {
    title: 'Data Retention',
    body: [
      'We retain information for as long as needed to operate the service, comply with legal obligations, resolve disputes, and enforce agreements.',
      'Retention periods may vary depending on the type of record, the relevant business workflow, and regulatory requirements.'
    ]
  },
  {
    title: 'Your Choices',
    body: [
      'Businesses are responsible for the accuracy of the information they provide and for managing the customer data they collect through the platform.',
      'If you need access, correction, or deletion support regarding data processed through BisLink, contact the business you interacted with first or email us directly.'
    ]
  },
  {
    title: 'Contact',
    body: [
      'For privacy questions, requests, or complaints, contact us at goemeraldpathways@gmail.com.'
    ]
  }
];

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-[var(--color-bg)] px-6 py-10 md:px-10 md:py-14">
      <div className="mx-auto max-w-4xl">
        <div className="rounded-[30px] border border-[var(--color-border-dark)] bg-[var(--color-void)] px-6 py-10 text-[var(--color-text-hero)] shadow-[0_30px_80px_rgba(0,0,0,0.18)] md:px-10">
          <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-[var(--color-gold)]">BisLink Legal</p>
          <h1 className="mt-3 font-display text-5xl tracking-[-1px] md:text-6xl">Privacy Policy</h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--color-text-hero-2)] md:text-base">
            This policy explains how BisLink collects, uses, stores, and shares information when businesses and customers use the platform.
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
              <Link href="/terms-and-conditions" className="font-medium text-[var(--color-gold-dark)]">
                View Terms and Conditions
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
