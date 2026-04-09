import { Service } from './BookingPage';

export function StepPayment({ service, date, time, details, onBack, onNext }: { service: Service; date: string; time: string; details: { name: string; email: string; phone?: string }; onBack: () => void; onNext: () => void }) {
  return <div><button onClick={onBack} className="text-sm">Back</button><h3 className="font-display text-4xl">Payment</h3><p className="text-sm">Secured by Stripe</p><div className="mt-3 rounded-xl bg-[var(--color-surface-2)] p-4 text-sm">{service.name}<br />{date} {time}</div><button onClick={onNext} className="mt-4 w-full rounded-2xl bg-black px-4 py-3 text-white">Pay ${service.price / 100} · Confirm Booking</button><p className="mt-2 text-xs text-zinc-500">🔒 Your card details are encrypted and never stored.</p></div>;
}
