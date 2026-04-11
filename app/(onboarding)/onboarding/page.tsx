import { OnboardingWizard } from '@/components/onboarding/OnboardingWizard';

export default function OnboardingPage() {
  return (
    <main className="min-h-screen bg-[var(--color-bg)] px-6 py-8 md:px-8">
      <div className="mx-auto max-w-7xl">
        <OnboardingWizard />
      </div>
    </main>
  );
}
